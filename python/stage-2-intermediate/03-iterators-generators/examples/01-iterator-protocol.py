"""
第 3 章 示例 01：迭代器协议

演示 __iter__ 和 __next__ 的实现，以及可迭代对象与迭代器的区别。
"""

from typing import Iterator


# === 1. 理解迭代器协议 ===

print("=" * 60)
print("1. 迭代器协议基础")
print("=" * 60)

# list 是可迭代对象，iter() 返回一个迭代器
numbers: list[int] = [10, 20, 30]
it: Iterator[int] = iter(numbers)

print(f"[类型] numbers: {type(numbers)}")
print(f"[类型] iter(numbers): {type(it)}")

# 手动调用 next()
print(f"[next] {next(it)}")  # 10
print(f"[next] {next(it)}")  # 20
print(f"[next] {next(it)}")  # 30

try:
    next(it)
except StopIteration:
    print("[next] StopIteration: 迭代器已耗尽")


# === 2. 自定义迭代器（分离式设计） ===

print(f"\n{'=' * 60}")
print("2. 自定义迭代器：倒计时")
print(f"{'=' * 60}")


class Countdown:
    """倒计时——可迭代对象（Iterable）。"""

    def __init__(self, start: int) -> None:
        self.start = start

    def __repr__(self) -> str:
        return f"Countdown(start={self.start})"

    def __iter__(self) -> "CountdownIterator":
        """每次返回新的迭代器。"""
        print(f"  [Countdown.__iter__] 创建新迭代器，从 {self.start} 开始")
        return CountdownIterator(self.start)


class CountdownIterator:
    """倒计时的迭代器。"""

    def __init__(self, current: int) -> None:
        self._current: int = current

    def __iter__(self) -> "CountdownIterator":
        return self

    def __next__(self) -> int:
        if self._current <= 0:
            print("  [CountdownIterator.__next__] 发射！StopIteration")
            raise StopIteration
        value: int = self._current
        self._current -= 1
        print(f"  [CountdownIterator.__next__] -> {value}")
        return value


# ✅ 分离式设计：支持多次迭代
cd = Countdown(5)

print("[第一次迭代]")
for n in cd:
    pass

print("\n[第二次迭代]")
for n in cd:
    pass


# === 3. ❌ 错误设计：合一式迭代器 ===

print(f"\n{'=' * 60}")
print("3. 错误设计对比")
print(f"{'=' * 60}")


class BadCountdown:
    """❌ Iterable 和 Iterator 合一——只能迭代一次。"""

    def __init__(self, start: int) -> None:
        self.start = start
        self._current: int = start

    def __iter__(self) -> "BadCountdown":
        return self  # ❌ 返回自身

    def __next__(self) -> int:
        if self._current <= 0:
            raise StopIteration
        value: int = self._current
        self._current -= 1
        return value


bad = BadCountdown(3)
print(f"[BadCountdown] 第一次: {list(bad)}")  # [3, 2, 1]
print(f"[BadCountdown] 第二次: {list(bad)}")  # [] — 空！


# === 4. 实用示例：文件行迭代器 ===

print(f"\n{'=' * 60}")
print("4. 实用示例：带行号的行迭代器")
print(f"{'=' * 60}")


class NumberedLines:
    """为任何可迭代的文本行添加行号。"""

    def __init__(self, lines: list[str]) -> None:
        self._lines = lines

    def __repr__(self) -> str:
        return f"NumberedLines(lines={len(self._lines)})"

    def __iter__(self) -> Iterator[str]:
        for i, line in enumerate(self._lines, 1):
            numbered: str = f"{i:>4} | {line}"
            print(f"  [NumberedLines] yielding: {numbered}")
            yield numbered  # ✅ 用生成器简化实现


sample_lines: list[str] = [
    "def hello():",
    '    print("Hello!")',
    "",
    "hello()",
]

print("[带行号的代码]")
for line in NumberedLines(sample_lines):
    print(f"  {line}")


# === 5. 检测可迭代性 ===

print(f"\n{'=' * 60}")
print("5. 检测可迭代性")
print(f"{'=' * 60}")

from collections.abc import Iterable as ABCIterable

test_objects: list[object] = [
    [1, 2, 3],
    "hello",
    42,
    {"a": 1},
    range(10),
    Countdown(3),
]

for obj in test_objects:
    is_iterable: bool = isinstance(obj, ABCIterable)
    print(f"  [check] {type(obj).__name__:>15}: iterable = {is_iterable}")

print("\n✅ 01-iterator-protocol.py 运行完成")
