"""
第 9 章 示例 03：数据结构性能对比
- list vs set 查找
- list vs deque 头部插入
- dict vs 排序列表
- 不同数据结构的内存占用
"""

import logging
import sys
import time
from collections import deque, OrderedDict
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


def bench(label: str, func, *args, repeats: int = 3) -> float:
    """基准测试辅助函数"""
    times: list[float] = []
    for _ in range(repeats):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    avg = sum(times) / len(times)
    print(f"  {label:.<45} {avg:.6f}s")
    return avg


# ======================================================================
# 1. 查找性能：list vs set vs dict
# ======================================================================

def lookup_in_list(data: list[int], targets: list[int]) -> int:
    """❌ list 查找 — O(n) 每次"""
    count = 0
    for t in targets:
        if t in data:
            count += 1
    return count


def lookup_in_set(data: set[int], targets: list[int]) -> int:
    """✅ set 查找 — O(1) 每次"""
    count = 0
    for t in targets:
        if t in data:
            count += 1
    return count


def lookup_in_dict(data: dict[int, bool], targets: list[int]) -> int:
    """✅ dict 查找 — O(1) 每次"""
    count = 0
    for t in targets:
        if t in data:
            count += 1
    return count


# ======================================================================
# 2. 插入性能：list vs deque
# ======================================================================

def insert_front_list(n: int) -> list[int]:
    """❌ list 头部插入 — O(n) 每次，总共 O(n^2)"""
    result: list[int] = []
    for i in range(n):
        result.insert(0, i)
    return result


def insert_front_deque(n: int) -> deque[int]:
    """✅ deque 头部插入 — O(1) 每次，总共 O(n)"""
    result: deque[int] = deque()
    for i in range(n):
        result.appendleft(i)
    return result


def insert_back_list(n: int) -> list[int]:
    """list 尾部插入 — O(1) 均摊"""
    result: list[int] = []
    for i in range(n):
        result.append(i)
    return result


def insert_back_deque(n: int) -> deque[int]:
    """deque 尾部插入 — O(1)"""
    result: deque[int] = deque()
    for i in range(n):
        result.append(i)
    return result


# ======================================================================
# 3. 去重性能
# ======================================================================

def dedup_naive(data: list[int]) -> list[int]:
    """❌ 朴素去重 — O(n^2)"""
    result: list[int] = []
    for item in data:
        if item not in result:
            result.append(item)
    return result


def dedup_set(data: list[int]) -> list[int]:
    """✅ set 去重 — O(n)，不保序"""
    return list(set(data))


def dedup_ordered(data: list[int]) -> list[int]:
    """✅ dict 去重 — O(n)，保序（Python 3.7+）"""
    return list(dict.fromkeys(data))


# ======================================================================
# 4. 内存占用对比
# ======================================================================

def memory_comparison() -> None:
    """不同数据结构的内存占用对比"""
    n = 10_000
    items = list(range(n))

    structures: dict[str, Any] = {
        "list": items,
        "tuple": tuple(items),
        "set": set(items),
        "frozenset": frozenset(items),
        "dict{k:None}": dict.fromkeys(items),
        "deque": deque(items),
    }

    print("\n  数据结构内存占用对比 (n={:,}):".format(n))
    print(f"  {'结构':<20} {'大小 (bytes)':<15} {'大小 (KB)':<10}")
    print(f"  {'-' * 45}")

    for name, obj in structures.items():
        size = sys.getsizeof(obj)
        print(f"  {name:<20} {size:<15,} {size / 1024:<10.2f}")


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    print("=" * 60)
    print("1. 查找性能对比")
    print("=" * 60)

    n = 50_000
    data_list = list(range(n))
    data_set = set(data_list)
    data_dict = dict.fromkeys(data_list, True)
    targets = list(range(0, n, 10))  # 每 10 个查一个

    t_list = bench("list 查找 (O(n))", lookup_in_list, data_list, targets)
    t_set = bench("set 查找 (O(1))", lookup_in_set, data_set, targets)
    t_dict = bench("dict 查找 (O(1))", lookup_in_dict, data_dict, targets)

    print(f"\n  set 比 list 快: {t_list / t_set:.0f}x")
    print(f"  dict 比 list 快: {t_list / t_dict:.0f}x")

    print("\n" + "=" * 60)
    print("2. 插入性能对比")
    print("=" * 60)

    n_insert = 50_000
    t_front_list = bench("list.insert(0, x) — 头部", insert_front_list, n_insert)
    t_front_deque = bench("deque.appendleft(x) — 头部", insert_front_deque, n_insert)
    print(f"\n  deque 头部插入比 list 快: {t_front_list / t_front_deque:.0f}x")

    bench("list.append(x) — 尾部", insert_back_list, n_insert)
    bench("deque.append(x) — 尾部", insert_back_deque, n_insert)
    print("  (尾部插入两者差距不大)")

    print("\n" + "=" * 60)
    print("3. 去重性能对比")
    print("=" * 60)

    import random
    random.seed(42)
    dup_data = [random.randint(0, 5000) for _ in range(20_000)]

    bench("朴素去重 (O(n^2))", dedup_naive, dup_data)
    bench("set 去重 (O(n), 不保序)", dedup_set, dup_data)
    bench("dict.fromkeys 去重 (O(n), 保序)", dedup_ordered, dup_data)

    print("\n" + "=" * 60)
    print("4. 内存占用对比")
    print("=" * 60)
    memory_comparison()


if __name__ == "__main__":
    main()
