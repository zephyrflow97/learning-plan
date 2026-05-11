"""
第 9 章 示例 02：常见性能优化技巧
- 字符串拼接优化
- 全局变量 vs 局部变量
- 生成器 vs 列表
- __slots__ 优化
- 内置函数优先
"""

import logging
import math
import sys
import time
from typing import Generator

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


def benchmark(label: str, func, *args, repeats: int = 5) -> float:
    """简单基准测试函数"""
    times: list[float] = []
    for _ in range(repeats):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    avg = sum(times) / len(times)
    print(f"  {label:.<40} {avg:.6f}s (avg of {repeats})")
    return avg


# ======================================================================
# 1. 字符串拼接
# ======================================================================

def string_concat_plus(n: int) -> str:
    """❌ + 拼接 — O(n^2)"""
    result = ""
    for i in range(n):
        result += str(i)
    return result


def string_concat_join(n: int) -> str:
    """✅ join — O(n)"""
    return "".join(str(i) for i in range(n))


def string_concat_fstring(n: int) -> str:
    """✅ 列表 + join（f-string 在循环中没有优势）"""
    parts: list[str] = []
    for i in range(n):
        parts.append(f"{i}")
    return "".join(parts)


# ======================================================================
# 2. 全局变量 vs 局部变量
# ======================================================================

GLOBAL_MULTIPLIER = 2.5


def slow_with_global(data: list[float]) -> list[float]:
    """❌ 循环中访问全局变量"""
    return [x * GLOBAL_MULTIPLIER for x in data]


def fast_with_local(data: list[float]) -> list[float]:
    """✅ 用局部变量缓存"""
    multiplier = GLOBAL_MULTIPLIER
    return [x * multiplier for x in data]


def slow_with_method(data: list[float]) -> list[float]:
    """❌ 循环中频繁属性查找"""
    return [math.sqrt(x) for x in data]


def fast_with_cached_method(data: list[float]) -> list[float]:
    """✅ 方法引用缓存到局部变量"""
    sqrt = math.sqrt
    return [sqrt(x) for x in data]


# ======================================================================
# 3. 生成器 vs 列表
# ======================================================================

def list_sum(n: int) -> int:
    """❌ 创建完整列表再求和"""
    return sum([i ** 2 for i in range(n)])


def generator_sum(n: int) -> int:
    """✅ 生成器表达式 — 不创建中间列表"""
    return sum(i ** 2 for i in range(n))


def list_filter(data: list[int]) -> bool:
    """❌ 创建完整列表再检查"""
    return len([x for x in data if x > 0]) > 0


def generator_any(data: list[int]) -> bool:
    """✅ any() 短路求值"""
    return any(x > 0 for x in data)


# ======================================================================
# 4. __slots__ 优化
# ======================================================================

class PointWithDict:
    """使用 __dict__ 的普通类"""
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


class PointWithSlots:
    """使用 __slots__ 的优化类"""
    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


def compare_slots(n: int) -> None:
    """对比 __slots__ 和 __dict__ 的内存与速度"""
    # 创建速度
    start = time.perf_counter()
    dict_points = [PointWithDict(i, i) for i in range(n)]
    dict_time = time.perf_counter() - start

    start = time.perf_counter()
    slots_points = [PointWithSlots(i, i) for i in range(n)]
    slots_time = time.perf_counter() - start

    # 内存
    dict_size = sys.getsizeof(dict_points[0])
    slots_size = sys.getsizeof(slots_points[0])

    print(f"  __dict__ 创建 {n} 个: {dict_time:.4f}s, 单个 {dict_size} bytes")
    print(f"  __slots__ 创建 {n} 个: {slots_time:.4f}s, 单个 {slots_size} bytes")
    print(f"  __slots__ 节省内存: {(1 - slots_size / dict_size) * 100:.0f}%")


# ======================================================================
# 5. 内置函数优先
# ======================================================================

def manual_max(data: list[int]) -> int:
    """❌ 手动实现 max"""
    result = data[0]
    for x in data[1:]:
        if x > result:
            result = x
    return result


def builtin_max(data: list[int]) -> int:
    """✅ 内置 max() — C 实现"""
    return max(data)


def manual_map(data: list[int]) -> list[int]:
    """❌ 手动循环"""
    result: list[int] = []
    for x in data:
        result.append(x * 2)
    return result


def builtin_map(data: list[int]) -> list[int]:
    """✅ map() — C 实现"""
    return list(map(lambda x: x * 2, data))


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    N = 50_000

    print("=" * 60)
    print("1. 字符串拼接对比")
    print("=" * 60)
    benchmark("+ 拼接 (O(n^2))", string_concat_plus, N)
    benchmark("join (O(n))", string_concat_join, N)
    benchmark("list + join", string_concat_fstring, N)

    print("\n" + "=" * 60)
    print("2. 全局变量 vs 局部变量")
    print("=" * 60)
    float_data = list(range(1, 200_001))
    float_list = [float(x) for x in float_data]
    benchmark("全局变量", slow_with_global, float_list)
    benchmark("局部变量缓存", fast_with_local, float_list)
    benchmark("math.sqrt 直接调用", slow_with_method, float_list)
    benchmark("sqrt 缓存到局部", fast_with_cached_method, float_list)

    print("\n" + "=" * 60)
    print("3. 生成器 vs 列表")
    print("=" * 60)
    benchmark("列表推导 + sum", list_sum, 500_000)
    benchmark("生成器 + sum", generator_sum, 500_000)

    test_data = list(range(-1000, 0)) + [1]  # 最后一个是正数
    benchmark("列表 + len > 0", list_filter, test_data, repeats=10000)
    benchmark("any() 短路", generator_any, test_data, repeats=10000)

    print("\n" + "=" * 60)
    print("4. __slots__ 对比")
    print("=" * 60)
    compare_slots(100_000)

    print("\n" + "=" * 60)
    print("5. 内置函数 vs 手动实现")
    print("=" * 60)
    int_data = list(range(100_000))
    benchmark("手动 max", manual_max, int_data)
    benchmark("内置 max()", builtin_max, int_data)
    benchmark("手动 map (loop)", manual_map, int_data)
    benchmark("内置 map()", builtin_map, int_data)


if __name__ == "__main__":
    main()
