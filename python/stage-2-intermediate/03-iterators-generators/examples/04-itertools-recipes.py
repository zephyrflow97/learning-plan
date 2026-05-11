"""
第 3 章 示例 04：itertools 实战

演示 itertools 模块中最常用的工具函数。
"""

import itertools
from typing import Generator, Iterable, Iterator, TypeVar

T = TypeVar("T")


# === 1. 无限迭代器 ===

print("=" * 60)
print("1. 无限迭代器：count, cycle, repeat")
print("=" * 60)

# count：无限计数器
print("[count] 从 10 开始，步长 3:")
for n in itertools.islice(itertools.count(10, 3), 5):
    print(f"  {n}", end="")
print()

# cycle：无限循环
print("[cycle] 交通灯循环:")
lights: Iterator[str] = itertools.cycle(["🔴红灯", "🟢绿灯", "🟡黄灯"])
for _, light in zip(range(7), lights):
    print(f"  {light}", end="")
print()

# repeat：重复
print(f"[repeat] {list(itertools.repeat('✅', 4))}")

# repeat + map：高效创建
zeros: list[int] = list(itertools.repeat(0, 5))
print(f"[repeat] 零向量: {zeros}")


# === 2. 截断迭代器 ===

print(f"\n{'=' * 60}")
print("2. 截断迭代器：islice, takewhile, dropwhile")
print(f"{'=' * 60}")

# islice：对任何迭代器切片（包括无限迭代器）
print("[islice] 前10个平方数:")
squares: list[int] = list(itertools.islice(
    (x ** 2 for x in itertools.count(1)), 10
))
print(f"  {squares}")

# takewhile：条件为真时持续取
data: list[int] = [2, 4, 6, 8, 1, 3, 5, 7]
taken: list[int] = list(itertools.takewhile(lambda x: x % 2 == 0, data))
print(f"[takewhile] 连续偶数: {taken}")  # [2, 4, 6, 8]

# dropwhile：条件为真时持续丢弃
dropped: list[int] = list(itertools.dropwhile(lambda x: x % 2 == 0, data))
print(f"[dropwhile] 丢弃偶数后: {dropped}")  # [1, 3, 5, 7]

# filterfalse：保留条件为假的
odd_numbers: list[int] = list(itertools.filterfalse(lambda x: x % 2 == 0, range(10)))
print(f"[filterfalse] 奇数: {odd_numbers}")


# === 3. 组合迭代器 ===

print(f"\n{'=' * 60}")
print("3. 组合迭代器：chain, zip_longest, product")
print(f"{'=' * 60}")

# chain：链接多个迭代器
combined: list[int] = list(itertools.chain([1, 2], [3, 4], [5, 6]))
print(f"[chain] {combined}")

# chain.from_iterable：从可迭代的可迭代对象中链接
nested: list[list[int]] = [[1, 2], [3, 4], [5, 6]]
flat: list[int] = list(itertools.chain.from_iterable(nested))
print(f"[chain.from_iterable] {flat}")

# zip_longest：最长填充
names: list[str] = ["Alice", "Bob", "Charlie"]
scores: list[int] = [95, 87]
paired: list[tuple[str | None, int | None]] = list(
    itertools.zip_longest(names, scores, fillvalue=0)
)
print(f"[zip_longest] {paired}")

# product：笛卡尔积
print("[product] 骰子组合:")
for combo in itertools.product(range(1, 4), range(1, 4)):
    print(f"  {combo}", end="")
print()


# === 4. 排列组合 ===

print(f"\n{'=' * 60}")
print("4. 排列组合：permutations, combinations")
print(f"{'=' * 60}")

# permutations：排列（有顺序）
colors: list[str] = ["R", "G", "B"]
print(f"[permutations] 2色排列 (P(3,2)={3*2}):")
for perm in itertools.permutations(colors, 2):
    print(f"  {perm}", end="")
print()

# combinations：组合（无顺序）
print(f"[combinations] 2色组合 (C(3,2)={3}):")
for combo in itertools.combinations(colors, 2):
    print(f"  {combo}", end="")
print()

# combinations_with_replacement：可重复组合
print(f"[combinations_with_replacement] 2色可重复组合:")
for combo in itertools.combinations_with_replacement(colors, 2):
    print(f"  {combo}", end="")
print()


# === 5. 分组：groupby ===

print(f"\n{'=' * 60}")
print("5. 分组：groupby（数据必须先排序！）")
print(f"{'=' * 60}")

students: list[dict[str, str | int]] = [
    {"name": "Alice", "grade": "A"},
    {"name": "Charlie", "grade": "B"},
    {"name": "Bob", "grade": "A"},
    {"name": "Diana", "grade": "C"},
    {"name": "Eve", "grade": "B"},
    {"name": "Frank", "grade": "A"},
]

# ✅ 先排序！
sorted_students: list[dict[str, str | int]] = sorted(
    students, key=lambda s: str(s["grade"])
)

print("[groupby] 按成绩分组:")
for grade, group in itertools.groupby(sorted_students, key=lambda s: s["grade"]):
    names_in_group: list[str] = [str(s["name"]) for s in group]
    print(f"  Grade {grade}: {names_in_group}")


# === 6. 累积：accumulate ===

print(f"\n{'=' * 60}")
print("6. 累积：accumulate")
print(f"{'=' * 60}")

import operator

# 默认累加
numbers_list: list[int] = [1, 2, 3, 4, 5]
running_sum: list[int] = list(itertools.accumulate(numbers_list))
print(f"[accumulate] 累加: {running_sum}")  # [1, 3, 6, 10, 15]

# 累乘
running_product: list[int] = list(itertools.accumulate(numbers_list, operator.mul))
print(f"[accumulate] 累乘: {running_product}")  # [1, 2, 6, 24, 120]

# 自定义函数：运行最大值
running_max: list[int] = list(itertools.accumulate([3, 1, 4, 1, 5, 9, 2, 6], max))
print(f"[accumulate] 累积最大: {running_max}")


# === 7. 实战：用 itertools 解决实际问题 ===

print(f"\n{'=' * 60}")
print("7. 实战：数据分析任务")
print(f"{'=' * 60}")

# 任务 1：分批处理
def batched(iterable: Iterable[T], n: int) -> Generator[list[T], None, None]:
    """将可迭代对象分成 n 个一组的批次。"""
    it: Iterator[T] = iter(iterable)
    while True:
        batch: list[T] = list(itertools.islice(it, n))
        if not batch:
            return
        print(f"  [batched] 批次: {batch}")
        yield batch


print("[分批处理] 每3个一组:")
items: list[int] = list(range(1, 11))
for batch in batched(items, 3):
    pass  # [1,2,3], [4,5,6], [7,8,9], [10]


# 任务 2：滑动窗口
def sliding_window(iterable: Iterable[T], size: int) -> Generator[tuple[T, ...], None, None]:
    """滑动窗口——用 islice 实现。"""
    it: Iterator[T] = iter(iterable)
    window: tuple[T, ...] = tuple(itertools.islice(it, size))
    if len(window) == size:
        yield window
    for item in it:
        window = window[1:] + (item,)
        yield window


print("\n[滑动窗口] size=3:")
data_list: list[int] = [1, 2, 3, 4, 5, 6]
for window in sliding_window(data_list, 3):
    print(f"  {window}")


# 任务 3：找出第一个满足条件的元素
def first_match(iterable: Iterable[T], predicate: object) -> T | None:
    """找到第一个满足条件的元素。"""
    return next(filter(predicate, iterable), None)  # type: ignore[arg-type]


nums: list[int] = [1, 4, 9, 16, 25, 36]
first_gt_20: int | None = first_match(nums, lambda x: x > 20)
print(f"\n[first_match] 第一个 > 20: {first_gt_20}")  # 25

print("\n✅ 04-itertools-recipes.py 运行完成")
