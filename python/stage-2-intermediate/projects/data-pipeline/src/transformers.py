"""
数据转换器 — 管道中的数据处理节点
==================================

提供：
- FilterTransform: 过滤行
- MapTransform: 映射/修改行
- SortTransform: 排序
- DeduplicateTransform: 去重
- RenameTransform: 重命名列

设计要点：
- ✅ 生成器实现流式处理
- ✅ 每个转换器只做一件事（单一职责）
- ✅ 可自由组合成处理链
"""

from __future__ import annotations

import logging
from typing import Any, Callable, Iterator

logger = logging.getLogger(__name__)

Row = dict[str, Any]


class FilterTransform:
    """过滤转换器 — 只保留满足条件的行。

    ✅ 生成器实现，不缓存全部数据。

    用法：
        # 只保留金额 > 100 的行
        f = FilterTransform(lambda row: float(row["amount"]) > 100)
    """

    def __init__(self, predicate: Callable[[Row], bool]) -> None:
        self.predicate: Callable[[Row], bool] = predicate

    def transform(self, rows: Iterator[Row]) -> Iterator[Row]:
        kept = 0
        dropped = 0
        for row in rows:
            if self.predicate(row):
                kept += 1
                yield row
            else:
                dropped += 1
        logger.info(f"[FilterTransform] 保留 {kept}, 丢弃 {dropped}")

    def __repr__(self) -> str:
        return "FilterTransform(<predicate>)"


class MapTransform:
    """映射转换器 — 对每一行应用变换函数。

    用法：
        # 添加 tax 字段
        m = MapTransform(lambda row: {**row, "tax": float(row["amount"]) * 0.1})
    """

    def __init__(self, func: Callable[[Row], Row]) -> None:
        self.func: Callable[[Row], Row] = func

    def transform(self, rows: Iterator[Row]) -> Iterator[Row]:
        count = 0
        for row in rows:
            count += 1
            yield self.func(row)
        logger.info(f"[MapTransform] 处理 {count} 行")

    def __repr__(self) -> str:
        return "MapTransform(<func>)"


class SortTransform:
    """排序转换器 — 按指定键排序。

    ❌ 注意：排序需要缓存全部数据，会打破流式处理。
    只在确实需要排序时使用。
    """

    def __init__(self, key: str, reverse: bool = False) -> None:
        self.key: str = key
        self.reverse: bool = reverse

    def transform(self, rows: Iterator[Row]) -> Iterator[Row]:
        # 排序必须缓存全部数据
        data = list(rows)
        data.sort(key=lambda r: r.get(self.key, ""), reverse=self.reverse)
        logger.info(
            f"[SortTransform] 按 {self.key!r} "
            f"{'降序' if self.reverse else '升序'} 排序 {len(data)} 行"
        )
        yield from data

    def __repr__(self) -> str:
        return f"SortTransform(key={self.key!r}, reverse={self.reverse})"


class DeduplicateTransform:
    """去重转换器 — 根据指定键去重。"""

    def __init__(self, key: str) -> None:
        self.key: str = key

    def transform(self, rows: Iterator[Row]) -> Iterator[Row]:
        seen: set[Any] = set()
        kept = 0
        dupes = 0
        for row in rows:
            val = row.get(self.key)
            if val not in seen:
                seen.add(val)
                kept += 1
                yield row
            else:
                dupes += 1
        logger.info(f"[DeduplicateTransform] 保留 {kept}, 去重 {dupes}")

    def __repr__(self) -> str:
        return f"DeduplicateTransform(key={self.key!r})"


class RenameTransform:
    """重命名列转换器。

    用法：
        r = RenameTransform({"old_name": "new_name", "amt": "amount"})
    """

    def __init__(self, mapping: dict[str, str]) -> None:
        self.mapping: dict[str, str] = mapping

    def transform(self, rows: Iterator[Row]) -> Iterator[Row]:
        count = 0
        for row in rows:
            count += 1
            new_row: Row = {}
            for k, v in row.items():
                new_key = self.mapping.get(k, k)
                new_row[new_key] = v
            yield new_row
        logger.info(f"[RenameTransform] 重命名 {count} 行, 映射={self.mapping}")

    def __repr__(self) -> str:
        return f"RenameTransform({self.mapping})"
