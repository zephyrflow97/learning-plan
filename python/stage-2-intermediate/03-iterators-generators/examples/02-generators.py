"""
第 3 章 示例 02：生成器函数与生成器表达式

演示 yield 的暂停/恢复机制、生成器表达式的内存优势。
"""

import inspect
import sys
from typing import Generator


# === 1. 基础生成器函数 ===

print("=" * 60)
print("1. 基础生成器函数")
print("=" * 60)


def count_up(start: int, stop: int) -> Generator[int, None, None]:
    """简单的计数生成器。"""
    current: int = start
    while current < stop:
        print(f"  [count_up] 即将 yield {current}")
        yield current
        print(f"  [count_up] 从 yield 恢复，current was {current}")
        current += 1
    print(f"  [count_up] 循环结束，生成器退出")


print("[使用 for 循环]")
for n in count_up(1, 4):
    print(f"  -> 收到 {n}")


# === 2. 生成器生命周期 ===

print(f"\n{'=' * 60}")
print("2. 生成器生命周期与状态")
print(f"{'=' * 60}")


def simple_gen() -> Generator[str, None, None]:
    print("  [gen] 第一段代码执行")
    yield "first"
    print("  [gen] 第二段代码执行")
    yield "second"
    print("  [gen] 最后一段代码执行")


gen = simple_gen()
print(f"[状态] 创建后: {inspect.getgeneratorstate(gen)}")       # GEN_CREATED

value: str = next(gen)
print(f"[状态] 第一次next后: {inspect.getgeneratorstate(gen)}")  # GEN_SUSPENDED
print(f"[值] {value}")

value = next(gen)
print(f"[状态] 第二次next后: {inspect.getgeneratorstate(gen)}")  # GEN_SUSPENDED
print(f"[值] {value}")

try:
    next(gen)
except StopIteration:
    print(f"[状态] StopIteration后: {inspect.getgeneratorstate(gen)}")  # GEN_CLOSED


# === 3. 实用生成器：数据过滤管道 ===

print(f"\n{'=' * 60}")
print("3. 实用生成器：数据过滤管道")
print(f"{'=' * 60}")


def integers(start: int = 0) -> Generator[int, None, None]:
    """无限整数序列。"""
    n: int = start
    while True:
        yield n
        n += 1


def evens(numbers: Generator[int, None, None]) -> Generator[int, None, None]:
    """过滤偶数。"""
    for n in numbers:
        if n % 2 == 0:
            yield n


def squares(numbers: Generator[int, None, None]) -> Generator[int, None, None]:
    """计算平方。"""
    for n in numbers:
        yield n ** 2


def take(n: int, iterable: Generator[int, None, None]) -> Generator[int, None, None]:
    """取前 n 个。"""
    for i, item in enumerate(iterable):
        if i >= n:
            return
        yield item


# 组合管道：前 5 个偶数的平方
pipeline = take(5, squares(evens(integers(1))))
result: list[int] = list(pipeline)
print(f"[管道] 前5个偶数的平方: {result}")  # [4, 16, 36, 64, 100]


# === 4. 生成器表达式 vs 列表推导 ===

print(f"\n{'=' * 60}")
print("4. 内存对比：生成器表达式 vs 列表推导")
print(f"{'=' * 60}")

N: int = 100_000

# 列表推导：立即生成所有元素
list_comp: list[int] = [x ** 2 for x in range(N)]
print(f"[内存] 列表推导 ({N} 元素): {sys.getsizeof(list_comp):>10,} bytes")

# 生成器表达式：惰性生成
gen_expr = (x ** 2 for x in range(N))
print(f"[内存] 生成器表达式:          {sys.getsizeof(gen_expr):>10,} bytes")

# ✅ 传给聚合函数时不需要方括号
total: int = sum(x ** 2 for x in range(N))
print(f"[结果] sum = {total:,}")


# === 5. 生成器实战：文本处理 ===

print(f"\n{'=' * 60}")
print("5. 生成器实战：日志处理管道")
print(f"{'=' * 60}")

LOG_DATA: list[str] = [
    "2026-02-09 10:00:01 INFO  Application started",
    "2026-02-09 10:00:02 DEBUG Loading config from config.yaml",
    "2026-02-09 10:00:03 INFO  Connected to database",
    "2026-02-09 10:00:05 ERROR Failed to process request: timeout",
    "2026-02-09 10:00:06 WARN  Memory usage at 80%",
    "2026-02-09 10:00:07 ERROR Disk write failed: permission denied",
    "2026-02-09 10:00:08 INFO  Request completed in 1.2s",
    "",
    "2026-02-09 10:00:09 ERROR Network connection lost",
]


def parse_log_lines(lines: list[str]) -> Generator[dict[str, str], None, None]:
    """解析日志行为结构化数据。"""
    for line in lines:
        line = line.strip()
        if not line:
            continue
        parts: list[str] = line.split(maxsplit=3)
        if len(parts) >= 4:
            yield {
                "date": parts[0],
                "time": parts[1],
                "level": parts[2],
                "message": parts[3],
            }


def filter_by_level(
    entries: Generator[dict[str, str], None, None],
    level: str,
) -> Generator[dict[str, str], None, None]:
    """按日志级别过滤。"""
    for entry in entries:
        if entry["level"] == level:
            print(f"  [filter] 匹配 {level}: {entry['message'][:30]}...")
            yield entry


def format_entries(
    entries: Generator[dict[str, str], None, None],
) -> Generator[str, None, None]:
    """格式化输出。"""
    for entry in entries:
        yield f"[{entry['time']}] {entry['message']}"


# 组合管道
error_pipeline = format_entries(
    filter_by_level(
        parse_log_lines(LOG_DATA),
        "ERROR",
    )
)

print("[错误日志]")
for formatted in error_pipeline:
    print(f"  {formatted}")


# === 6. 带 return 值的生成器 ===

print(f"\n{'=' * 60}")
print("6. 生成器的 return 值")
print(f"{'=' * 60}")


def accumulate(values: list[float]) -> Generator[float, None, str]:
    """累加器——yield 中间结果，return 最终报告。"""
    total: float = 0.0
    for v in values:
        total += v
        yield total
    return f"累加完成：{len(values)} 个值，总和 {total}"


# for 循环拿不到 return 值
print("[for 循环]")
for running_total in accumulate([1, 2, 3, 4, 5]):
    print(f"  累计: {running_total}")

# 手动迭代可以捕获 return 值
print("\n[手动迭代]")
gen = accumulate([10, 20, 30])
try:
    while True:
        val = next(gen)
        print(f"  累计: {val}")
except StopIteration as e:
    print(f"  return 值: {e.value}")

print("\n✅ 02-generators.py 运行完成")
