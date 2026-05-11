"""
数据提取器 — 从各种数据源读取数据
=================================

提供：
- CSVExtractor: 从 CSV 文件读取
- JSONExtractor: 从 JSON 数据/文件读取

设计要点：
- ✅ 生成器实现惰性读取，大文件不爆内存
- ✅ 上下文管理器确保文件正确关闭
- ✅ 类型标注全覆盖
"""

from __future__ import annotations

import csv
import json
import logging
from pathlib import Path
from typing import Any, Iterator

logger = logging.getLogger(__name__)

# 统一行类型
Row = dict[str, Any]


class CSVExtractor:
    """从 CSV 文件提取数据。

    ✅ 使用生成器逐行读取 — 即使 GB 级文件也不爆内存。

    用法：
        extractor = CSVExtractor("data/sales.csv")
        for row in extractor.extract():
            print(row)  # {"product": "Laptop", "amount": "1200.00", ...}
    """

    def __init__(
        self,
        filepath: str | Path,
        encoding: str = "utf-8",
        delimiter: str = ",",
    ) -> None:
        self.filepath: Path = Path(filepath)
        self.encoding: str = encoding
        self.delimiter: str = delimiter

    def extract(self) -> Iterator[Row]:
        """✅ 生成器 — 逐行产出字典。"""
        logger.info(f"[CSVExtractor] 读取: {self.filepath}")
        row_count = 0

        with open(self.filepath, "r", encoding=self.encoding, newline="") as f:
            reader = csv.DictReader(f, delimiter=self.delimiter)
            for row in reader:
                row_count += 1
                yield dict(row)

        logger.info(f"[CSVExtractor] 完成: {row_count} 行")

    def __repr__(self) -> str:
        return f"CSVExtractor({self.filepath})"


class JSONExtractor:
    """从 JSON 数据源提取数据。

    支持两种模式：
    1. 传入内存数据（list[dict]）— 用于测试
    2. 传入文件路径 — 用于生产

    用法：
        # 模式 1：内存数据
        extractor = JSONExtractor([{"name": "Alice"}, {"name": "Bob"}])

        # 模式 2：文件
        extractor = JSONExtractor(filepath="data/users.json")
    """

    def __init__(
        self,
        data: list[Row] | None = None,
        filepath: str | Path | None = None,
        encoding: str = "utf-8",
    ) -> None:
        self._data: list[Row] | None = data
        self._filepath: Path | None = Path(filepath) if filepath else None
        self._encoding: str = encoding

        if data is None and filepath is None:
            raise ValueError("必须提供 data 或 filepath 之一")

    def extract(self) -> Iterator[Row]:
        """✅ 生成器 — 逐条产出字典。"""
        if self._data is not None:
            logger.info(f"[JSONExtractor] 从内存读取: {len(self._data)} 条")
            yield from self._data
        elif self._filepath is not None:
            logger.info(f"[JSONExtractor] 读取文件: {self._filepath}")
            with open(self._filepath, "r", encoding=self._encoding) as f:
                data = json.load(f)
            if not isinstance(data, list):
                raise TypeError(f"JSON 根元素必须是数组, 得到 {type(data).__name__}")
            logger.info(f"[JSONExtractor] 完成: {len(data)} 条")
            yield from data

    def __repr__(self) -> str:
        if self._data is not None:
            return f"JSONExtractor(data=[...{len(self._data)} items])"
        return f"JSONExtractor(filepath={self._filepath})"
