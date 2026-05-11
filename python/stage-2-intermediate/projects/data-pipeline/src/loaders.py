"""
数据加载器 — 将处理后的数据输出到目标
====================================

提供：
- JSONLoader: 输出到 JSON 文件
- CSVLoader: 输出到 CSV 文件
- PrintLoader: 打印到控制台（调试用）

设计要点：
- ✅ 上下文管理器确保文件正确关闭
- ✅ 类型标注全覆盖
- ✅ 返回写入行数用于统计
"""

from __future__ import annotations

import csv
import json
import logging
from pathlib import Path
from typing import Any, Iterator

logger = logging.getLogger(__name__)

Row = dict[str, Any]


class JSONLoader:
    """将数据输出到 JSON 文件。

    用法：
        loader = JSONLoader("output/result.json")
        count = loader.load(data_iterator)
    """

    def __init__(
        self,
        filepath: str | Path,
        encoding: str = "utf-8",
        indent: int = 2,
    ) -> None:
        self.filepath: Path = Path(filepath)
        self.encoding: str = encoding
        self.indent: int = indent

    def load(self, rows: Iterator[Row]) -> int:
        """✅ 收集所有行并写入 JSON 文件。"""
        data = list(rows)
        self.filepath.parent.mkdir(parents=True, exist_ok=True)

        with open(self.filepath, "w", encoding=self.encoding) as f:
            json.dump(data, f, ensure_ascii=False, indent=self.indent)

        logger.info(f"[JSONLoader] 写入 {len(data)} 行到 {self.filepath}")
        return len(data)

    def __repr__(self) -> str:
        return f"JSONLoader({self.filepath})"


class CSVLoader:
    """将数据输出到 CSV 文件。"""

    def __init__(
        self,
        filepath: str | Path,
        encoding: str = "utf-8",
    ) -> None:
        self.filepath: Path = Path(filepath)
        self.encoding: str = encoding

    def load(self, rows: Iterator[Row]) -> int:
        """✅ 流式写入 CSV — 逐行写入，不缓存全部数据。"""
        self.filepath.parent.mkdir(parents=True, exist_ok=True)
        count = 0
        writer: csv.DictWriter | None = None

        with open(self.filepath, "w", encoding=self.encoding, newline="") as f:
            for row in rows:
                if writer is None:
                    writer = csv.DictWriter(f, fieldnames=list(row.keys()))
                    writer.writeheader()
                writer.writerow(row)
                count += 1

        logger.info(f"[CSVLoader] 写入 {count} 行到 {self.filepath}")
        return count

    def __repr__(self) -> str:
        return f"CSVLoader({self.filepath})"


class PrintLoader:
    """打印到控制台 — 调试用。"""

    def __init__(self, prefix: str = "  ") -> None:
        self.prefix: str = prefix

    def load(self, rows: Iterator[Row]) -> int:
        """打印每一行。"""
        count = 0
        for row in rows:
            count += 1
            print(f"{self.prefix}[{count}] {row}")

        logger.info(f"[PrintLoader] 输出 {count} 行")
        return count

    def __repr__(self) -> str:
        return "PrintLoader()"
