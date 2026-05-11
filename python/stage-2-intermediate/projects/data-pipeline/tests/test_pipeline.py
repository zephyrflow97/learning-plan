"""
数据管道测试套件
================

覆盖：
- Extractor 提取
- Transformer 转换
- Validator 验证
- Pipeline 端到端集成

运行：pytest tests/test_pipeline.py -v
"""

from __future__ import annotations

import pytest
from typing import Any

# 将 src 目录加入路径
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from pipeline import Pipeline, PipelineStats
from extractors import JSONExtractor
from transformers import FilterTransform, MapTransform, SortTransform, DeduplicateTransform
from loaders import PrintLoader
from validators import SchemaValidator, RequiredFieldValidator

Row = dict[str, Any]

# ============================================================
# 测试数据
# ============================================================

SAMPLE_DATA: list[Row] = [
    {"name": "Alice", "age": 30, "city": "Beijing"},
    {"name": "Bob", "age": 17, "city": "Shanghai"},
    {"name": "Charlie", "age": 25, "city": "Guangzhou"},
    {"name": "Diana", "age": 15, "city": "Shenzhen"},
    {"name": "Eve", "age": 28, "city": "Beijing"},
]


# ============================================================
# Extractor 测试
# ============================================================

class TestJSONExtractor:
    def test_extract_from_memory(self) -> None:
        extractor = JSONExtractor(data=SAMPLE_DATA)
        rows = list(extractor.extract())
        assert len(rows) == 5
        assert rows[0]["name"] == "Alice"

    def test_extract_empty(self) -> None:
        extractor = JSONExtractor(data=[])
        assert list(extractor.extract()) == []

    def test_missing_source_raises(self) -> None:
        with pytest.raises(ValueError, match="必须提供"):
            JSONExtractor()


# ============================================================
# Transformer 测试
# ============================================================

class TestFilterTransform:
    def test_filter_by_age(self) -> None:
        """✅ 过滤 age >= 18 的行。"""
        f = FilterTransform(lambda r: r["age"] >= 18)
        result = list(f.transform(iter(SAMPLE_DATA)))
        assert len(result) == 3
        assert all(r["age"] >= 18 for r in result)

    def test_filter_none_match(self) -> None:
        f = FilterTransform(lambda r: r["age"] > 100)
        result = list(f.transform(iter(SAMPLE_DATA)))
        assert len(result) == 0


class TestMapTransform:
    def test_add_field(self) -> None:
        """✅ 给每行添加 adult 字段。"""
        m = MapTransform(lambda r: {**r, "adult": r["age"] >= 18})
        result = list(m.transform(iter(SAMPLE_DATA)))
        assert result[0]["adult"] is True
        assert result[1]["adult"] is False


class TestSortTransform:
    def test_sort_ascending(self) -> None:
        s = SortTransform(key="age")
        result = list(s.transform(iter(SAMPLE_DATA)))
        ages = [r["age"] for r in result]
        assert ages == sorted(ages)

    def test_sort_descending(self) -> None:
        s = SortTransform(key="age", reverse=True)
        result = list(s.transform(iter(SAMPLE_DATA)))
        ages = [r["age"] for r in result]
        assert ages == sorted(ages, reverse=True)


# ============================================================
# Validator 测试
# ============================================================

class TestSchemaValidator:
    def test_valid_row(self) -> None:
        v = SchemaValidator({"name": str, "age": int})
        assert v.validate({"name": "Alice", "age": 30}) is True

    def test_missing_field(self) -> None:
        v = SchemaValidator({"name": str, "email": str})
        assert v.validate({"name": "Alice"}) is False

    def test_wrong_type(self) -> None:
        v = SchemaValidator({"age": int})
        assert v.validate({"age": "not_a_number"}) is False


# ============================================================
# Pipeline 集成测试
# ============================================================

class TestPipelineIntegration:
    def test_full_pipeline(self) -> None:
        """✅ 端到端测试：提取 → 过滤 → 映射 → 排序 → 加载。"""
        pipeline = (
            Pipeline("test-pipeline")
            .extract(JSONExtractor(data=SAMPLE_DATA))
            .transform(FilterTransform(lambda r: r["age"] >= 18))
            .transform(MapTransform(lambda r: {**r, "adult": True}))
            .transform(SortTransform(key="age", reverse=True))
            .validate(SchemaValidator({"name": str, "age": int}))
            .load(PrintLoader())
        )

        stats = pipeline.run()
        assert stats.input_rows == 5
        assert stats.output_rows == 3
        assert stats.errors == 0

    def test_empty_pipeline(self) -> None:
        """空数据集的管道。"""
        pipeline = (
            Pipeline("empty")
            .extract(JSONExtractor(data=[]))
            .load(PrintLoader())
        )
        stats = pipeline.run()
        assert stats.input_rows == 0
        assert stats.output_rows == 0
