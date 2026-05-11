"""
数据处理管道核心引擎
====================

核心类：
- Pipeline: 管道编排器，串联 Extractor → Transformer → Validator → Loader
- PipelineStats: 执行统计
- PipelineError: 管道异常基类

设计要点：
- ✅ 链式调用 API
- ✅ 生成器实现流式处理
- ✅ 类型标注全覆盖
- ✅ 完善的错误处理和日志
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Iterator, Protocol

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

# 统一数据行类型
Row = dict[str, Any]


# ============================================================
# 协议定义 — 组件必须满足的接口
# ============================================================

class Extractor(Protocol):
    """数据提取器协议。"""
    def extract(self) -> Iterator[Row]: ...


class Transformer(Protocol):
    """数据转换器协议。"""
    def transform(self, rows: Iterator[Row]) -> Iterator[Row]: ...


class Validator(Protocol):
    """数据验证器协议。"""
    def validate(self, row: Row) -> bool: ...


class Loader(Protocol):
    """数据加载器协议。"""
    def load(self, rows: Iterator[Row]) -> int: ...


# ============================================================
# 管道统计
# ============================================================

@dataclass
class PipelineStats:
    """管道执行统计信息。"""

    name: str = ""
    input_rows: int = 0
    output_rows: int = 0
    errors: int = 0
    elapsed_seconds: float = 0.0
    error_details: list[str] = field(default_factory=list)

    def __repr__(self) -> str:
        return (
            f"PipelineStats(name={self.name!r}, "
            f"input={self.input_rows}, output={self.output_rows}, "
            f"errors={self.errors}, elapsed={self.elapsed_seconds:.2f}s)"
        )


# ============================================================
# 管道异常
# ============================================================

class PipelineError(Exception):
    """管道异常基类。"""
    pass


class ExtractionError(PipelineError):
    """提取阶段异常。"""
    pass


class TransformError(PipelineError):
    """转换阶段异常。"""
    pass


class ValidationError(PipelineError):
    """验证阶段异常。"""
    pass


# ============================================================
# 计时装饰器
# ============================================================

def timer(func: Callable[..., Any]) -> Callable[..., Any]:
    """✅ 计时装饰器 — 记录管道步骤耗时。"""
    import functools

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info(f"  [{func.__name__}] 耗时 {elapsed:.3f}s")
        return result

    return wrapper


# ============================================================
# 核心管道类
# ============================================================

class Pipeline:
    """数据处理管道 — 链式 API 串联 ETL 组件。

    用法：
        pipeline = (
            Pipeline("my-pipeline")
            .extract(CSVExtractor("data.csv"))
            .transform(FilterTransform(lambda r: r["age"] > 18))
            .transform(MapTransform(lambda r: {**r, "adult": True}))
            .validate(SchemaValidator({"name": str, "age": int}))
            .load(JSONLoader("output.json"))
        )
        stats = pipeline.run()
    """

    def __init__(self, name: str = "default") -> None:
        self.name: str = name
        self._extractor: Extractor | None = None
        self._transformers: list[Transformer] = []
        self._validators: list[Validator] = []
        self._loader: Loader | None = None
        logger.info(f"[Pipeline] 创建管道: {name}")

    def extract(self, extractor: Extractor) -> Pipeline:
        """设置数据提取器。"""
        self._extractor = extractor
        logger.info(f"  + Extractor: {type(extractor).__name__}")
        return self

    def transform(self, transformer: Transformer) -> Pipeline:
        """添加数据转换器（可多次调用）。"""
        self._transformers.append(transformer)
        logger.info(f"  + Transformer: {type(transformer).__name__}")
        return self

    def validate(self, validator: Validator) -> Pipeline:
        """添加数据验证器。"""
        self._validators.append(validator)
        logger.info(f"  + Validator: {type(validator).__name__}")
        return self

    def load(self, loader: Loader) -> Pipeline:
        """设置数据加载器。"""
        self._loader = loader
        logger.info(f"  + Loader: {type(loader).__name__}")
        return self

    @timer
    def run(self) -> PipelineStats:
        """✅ 执行管道 — 流式处理全部数据。"""
        stats = PipelineStats(name=self.name)
        start = time.perf_counter()

        if self._extractor is None:
            raise PipelineError("未设置 Extractor")
        if self._loader is None:
            raise PipelineError("未设置 Loader")

        logger.info(f"\n{'=' * 50}")
        logger.info(f"[Pipeline] 开始执行: {self.name}")
        logger.info(f"{'=' * 50}")

        # 1. 提取
        rows: Iterator[Row] = self._extractor.extract()

        # 计数提取行
        counted_rows: list[Row] = list(rows)
        stats.input_rows = len(counted_rows)
        logger.info(f"  提取: {stats.input_rows} 行")

        # 2. 转换（链式）
        data: Iterator[Row] = iter(counted_rows)
        for transformer in self._transformers:
            data = transformer.transform(data)

        # 3. 验证
        validated: list[Row] = []
        for row in data:
            valid = True
            for validator in self._validators:
                if not validator.validate(row):
                    stats.errors += 1
                    stats.error_details.append(f"验证失败: {row}")
                    valid = False
                    break
            if valid:
                validated.append(row)

        # 4. 加载
        stats.output_rows = self._loader.load(iter(validated))
        stats.elapsed_seconds = time.perf_counter() - start

        logger.info(f"\n[Pipeline] 完成: {stats}")
        return stats

    def __repr__(self) -> str:
        parts = [f"Pipeline({self.name!r})"]
        if self._extractor:
            parts.append(f"  extract={type(self._extractor).__name__}")
        for t in self._transformers:
            parts.append(f"  transform={type(t).__name__}")
        if self._loader:
            parts.append(f"  load={type(self._loader).__name__}")
        return "\n".join(parts)


# ============================================================
# 演示入口
# ============================================================

def main() -> None:
    """演示管道的基本用法。"""
    from extractors import CSVExtractor, JSONExtractor
    from transformers import FilterTransform, MapTransform, SortTransform
    from loaders import JSONLoader, PrintLoader
    from validators import SchemaValidator

    # 创建管道
    pipeline = (
        Pipeline("demo-pipeline")
        .extract(JSONExtractor([
            {"name": "Alice", "age": 30, "city": "Beijing"},
            {"name": "Bob", "age": 17, "city": "Shanghai"},
            {"name": "Charlie", "age": 25, "city": "Guangzhou"},
            {"name": "Diana", "age": 15, "city": "Shenzhen"},
            {"name": "Eve", "age": 28, "city": "Beijing"},
        ]))
        .transform(FilterTransform(lambda r: r["age"] >= 18))
        .transform(MapTransform(lambda r: {**r, "adult": True}))
        .transform(SortTransform(key="age", reverse=True))
        .validate(SchemaValidator({"name": str, "age": int}))
        .load(PrintLoader())
    )

    stats = pipeline.run()
    print(f"\n最终统计: {stats}")


if __name__ == "__main__":
    main()
