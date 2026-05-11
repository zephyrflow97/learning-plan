"""
第 9 章 示例 01：性能分析工具
- cProfile 使用
- 上下文管理器 profiler
- 自定义计时装饰器
"""

import cProfile
import functools
import io
import logging
import pstats
import time
from contextlib import contextmanager
from typing import Callable, Generator, ParamSpec, TypeVar

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

P = ParamSpec("P")
R = TypeVar("R")


# ======================================================================
# 1. cProfile 基础
# ======================================================================

def fibonacci_recursive(n: int) -> int:
    """递归斐波那契 — 经典的性能问题"""
    if n < 2:
        return n
    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)


def fibonacci_memo(n: int, memo: dict[int, int] | None = None) -> int:
    """带备忘录的斐波那契 — 优化版"""
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n < 2:
        return n
    result = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    memo[n] = result
    return result


def profile_function(func: Callable[..., object], *args: object) -> None:
    """用 cProfile 分析函数"""
    profiler = cProfile.Profile()
    profiler.enable()
    result = func(*args)
    profiler.disable()

    print(f"\n--- {func.__name__} 的性能分析 ---")
    print(f"结果: {result}")

    stream = io.StringIO()
    stats = pstats.Stats(profiler, stream=stream)
    stats.sort_stats("cumulative")
    stats.print_stats(8)
    print(stream.getvalue())


# ======================================================================
# 2. 上下文管理器式 Profiler
# ======================================================================

@contextmanager
def profiling(
    sort_by: str = "cumulative",
    top_n: int = 10,
    label: str = "",
) -> Generator[None, None, None]:
    """上下文管理器式性能分析"""
    profiler = cProfile.Profile()
    logger.info("开始性能分析%s", f": {label}" if label else "")
    profiler.enable()
    try:
        yield
    finally:
        profiler.disable()
        stream = io.StringIO()
        stats = pstats.Stats(profiler, stream=stream)
        stats.sort_stats(sort_by)
        stats.print_stats(top_n)
        print(stream.getvalue())
        logger.info("性能分析完成%s", f": {label}" if label else "")


# ======================================================================
# 3. 计时装饰器
# ======================================================================

def timed(func: Callable[P, R]) -> Callable[P, R]:
    """高精度计时装饰器 — 自动选择合适的时间单位"""
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        start = time.perf_counter_ns()
        result = func(*args, **kwargs)
        elapsed_ns = time.perf_counter_ns() - start

        if elapsed_ns < 1_000:
            display = f"{elapsed_ns} ns"
        elif elapsed_ns < 1_000_000:
            display = f"{elapsed_ns / 1_000:.2f} us"
        elif elapsed_ns < 1_000_000_000:
            display = f"{elapsed_ns / 1_000_000:.2f} ms"
        else:
            display = f"{elapsed_ns / 1_000_000_000:.4f} s"

        logger.info("[timed] %s: %s", func.__name__, display)
        return result
    return wrapper


# ======================================================================
# 演示
# ======================================================================

@timed
def demo_sum(n: int) -> int:
    """求和 — 演示计时装饰器"""
    return sum(range(n))


@timed
def demo_list_comp(n: int) -> list[int]:
    """列表推导 — 演示计时装饰器"""
    return [i ** 2 for i in range(n)]


def main() -> None:
    print("=" * 60)
    print("1. cProfile 分析")
    print("=" * 60)

    print("\n--- 递归斐波那契 (n=25) ---")
    profile_function(fibonacci_recursive, 25)

    print("\n--- 备忘录斐波那契 (n=25) ---")
    profile_function(fibonacci_memo, 25)

    print("=" * 60)
    print("2. 上下文管理器 Profiler")
    print("=" * 60)

    with profiling(label="列表操作"):
        data = [i ** 2 for i in range(100_000)]
        filtered = [x for x in data if x % 3 == 0]
        total = sum(filtered)
        logger.info("结果: %d", total)

    print("=" * 60)
    print("3. 计时装饰器")
    print("=" * 60)

    demo_sum(1_000_000)
    demo_list_comp(100_000)


if __name__ == "__main__":
    main()
