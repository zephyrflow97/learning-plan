# 第 3 章：迭代器与生成器 — 驯服无限数据流

> *"Lazy evaluation is the key to writing programs that process data streams of unbounded size with bounded memory."*
> — David Beazley
>
> 当你写下 `for x in something` 时，你启动了 Python 最深层的协议之一。
> 迭代器是 Python 的"心跳"——列表、字典、文件、range、甚至数据库查询，都在用同一套协议向你交付数据。
> 学会生成器，你就掌握了"以有限内存处理无限数据"的超能力。

## 📖 本章内容

- [1. 迭代协议：\_\_iter\_\_ 与 \_\_next\_\_](#1-迭代协议iter-与-next)
  - [1.1 可迭代对象 vs 迭代器](#11-可迭代对象-vs-迭代器)
  - [1.2 for 循环的底层机制](#12-for-循环的底层机制)
- [2. 自定义迭代器](#2-自定义迭代器)
  - [2.1 分离式设计](#21-分离式设计)
  - [2.2 迭代器耗尽问题](#22-迭代器耗尽问题)
- [3. 生成器函数与 yield](#3-生成器函数与-yield)
  - [3.1 从迭代器到生成器](#31-从迭代器到生成器)
  - [3.2 yield 的暂停与恢复](#32-yield-的暂停与恢复)
- [4. 生成器表达式 vs 列表推导](#4-生成器表达式-vs-列表推导)
- [5. yield from：委托生成器](#5-yield-from委托生成器)
- [6. 生成器的高级用法](#6-生成器的高级用法)
  - [6.1 send()：向生成器发送数据](#61-send向生成器发送数据)
  - [6.2 throw() 与 close()](#62-throw-与-close)
- [7. itertools 实战](#7-itertools-实战)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. 迭代协议：`__iter__` 与 `__next__`

> 🎭 **The Drama: 自动售货机协议**
>
> 想象一个自动售货机：
> - **可迭代对象 (Iterable)**：售货机本身——里面装满了商品，你可以请它"给我一个取货口"
> - **迭代器 (Iterator)**：取货口——每次按按钮，弹出一个商品，直到卖完抛出 `StopIteration`
>
> 关键区别：**售货机可以有多个取货口**（多次调用 `iter()` 得到独立的迭代器），
> 但**每个取货口只能往前走**（迭代器是单向消耗的）。

### 1.1 可迭代对象 vs 迭代器

```
┌─────────────────────────────────────────────────────────────┐
│                    Python 迭代体系                            │
│                                                              │
│  Iterable (可迭代对象)              Iterator (迭代器)         │
│  ┌──────────────────┐              ┌──────────────────┐      │
│  │ __iter__() ──────────────────→  │ __iter__() → self │      │
│  │                  │              │ __next__() → item │      │
│  └──────────────────┘              │   (或 StopIteration)│    │
│                                    └──────────────────┘      │
│  例: list, dict, str,              例: iter(list),           │
│      range, file                       生成器对象             │
│                                                              │
│  ✅ 可多次迭代                     ❌ 一次性消耗              │
└─────────────────────────────────────────────────────────────┘
```

```python
# 可迭代对象：实现了 __iter__，每次返回新的迭代器
numbers: list[int] = [10, 20, 30]

# 获取迭代器
it = iter(numbers)            # 调用 numbers.__iter__()
print(f"[iter] type: {type(it)}")  # <class 'list_iterator'>

# 逐个获取元素
print(f"[next] {next(it)}")   # 10  — 调用 it.__next__()
print(f"[next] {next(it)}")   # 20
print(f"[next] {next(it)}")   # 30

# 耗尽后抛出 StopIteration
try:
    next(it)
except StopIteration:
    print("[next] StopIteration: 迭代器已耗尽")

# 可迭代对象可以重新迭代
it2 = iter(numbers)  # 新的迭代器
print(f"[重新迭代] {next(it2)}")  # 10
```

| 概念 | 需要实现的方法 | 特征 | 示例 |
|------|---------------|------|------|
| **Iterable** | `__iter__()` → Iterator | 可多次迭代 | `list`, `dict`, `str`, `range` |
| **Iterator** | `__iter__()` → self + `__next__()` | 单向、一次性 | `iter(list)`, 生成器对象 |

### 1.2 for 循环的底层机制

```python
# for 循环：
for item in [1, 2, 3]:
    print(item)

# 等价于：
_iter = iter([1, 2, 3])     # 1. 调用 __iter__() 获取迭代器
while True:
    try:
        item = next(_iter)    # 2. 调用 __next__() 获取下一个元素
        print(item)           # 3. 执行循环体
    except StopIteration:     # 4. 捕获 StopIteration 终止循环
        break
```

```
┌─────────────────────────────────────────────┐
│          for item in iterable:              │
│                                             │
│  1. _iter = iter(iterable)                  │
│  2. while True:                             │
│       try:                                  │
│         item = next(_iter)   ──→ 执行循环体  │
│       except StopIteration:                 │
│         break                ──→ 结束循环    │
└─────────────────────────────────────────────┘
```

---

## 2. 自定义迭代器

> 🧠 **CS Master's Bridge: 迭代器模式 (GoF Design Pattern)**
>
> 迭代器是"四人帮"设计模式之一。其核心价值：**解耦遍历算法与数据结构**。
> 你不需要知道数据存在数组、链表还是树中——只需 `for item in container` 即可。
> Python 的迭代协议是这个模式最简洁的实现。

### 2.1 分离式设计

**最佳实践：Iterable 和 Iterator 分开实现。**

```python
class Range:
    """自定义 range——可迭代对象（Iterable）。"""

    def __init__(self, start: int, stop: int, step: int = 1) -> None:
        self.start = start
        self.stop = stop
        self.step = step

    def __repr__(self) -> str:
        return f"Range({self.start}, {self.stop}, {self.step})"

    def __iter__(self) -> "RangeIterator":
        """每次调用返回一个新的迭代器——支持多次迭代。"""
        print(f"  [Range.__iter__] 创建新迭代器")
        return RangeIterator(self.start, self.stop, self.step)


class RangeIterator:
    """Range 的迭代器——记录当前位置。"""

    def __init__(self, start: int, stop: int, step: int) -> None:
        self._current: int = start
        self._stop: int = stop
        self._step: int = step

    def __iter__(self) -> "RangeIterator":
        """迭代器的 __iter__ 返回自身。"""
        return self

    def __next__(self) -> int:
        if self._current >= self._stop:
            raise StopIteration
        value: int = self._current
        self._current += self._step
        print(f"  [RangeIterator.__next__] -> {value}")
        return value


# ✅ 分离式设计：可以多次迭代
my_range = Range(0, 5)

print("[第一次迭代]")
for n in my_range:
    pass  # 0, 1, 2, 3, 4

print("[第二次迭代]")
for n in my_range:
    pass  # 0, 1, 2, 3, 4 — 重新开始！
```

```python
# ❌ 错误设计：Iterable 和 Iterator 合一
class BadRange:
    def __init__(self, stop: int) -> None:
        self.stop = stop
        self._current: int = 0

    def __iter__(self) -> "BadRange":
        return self  # ❌ 返回自身

    def __next__(self) -> int:
        if self._current >= self.stop:
            raise StopIteration
        value: int = self._current
        self._current += 1
        return value


# 问题：第二次迭代得到空结果
bad = BadRange(3)
print(f"[BadRange] 第一次: {list(bad)}")  # [0, 1, 2]
print(f"[BadRange] 第二次: {list(bad)}")  # [] — 已耗尽！
```

### 2.2 迭代器耗尽问题

```python
# 迭代器是一次性的——用完就没了
numbers: list[int] = [1, 2, 3, 4, 5]
it = iter(numbers)

# 第一次：正常
total: int = sum(it)
print(f"[耗尽] sum = {total}")     # 15

# 第二次：空的！
total2: int = sum(it)
print(f"[耗尽] sum again = {total2}")  # 0！

# ✅ 如果需要多次遍历，用可迭代对象（如 list），不要用迭代器
```

---

## 3. 生成器函数与 `yield`

> 🌌 **The Big Picture: 生成器 = 惰性迭代器的快捷方式**
>
> 手动实现迭代器需要：一个类 + `__iter__` + `__next__` + 状态管理 + `StopIteration`。
> 生成器函数用一个 `yield` 关键字就搞定了一切。
>
> 更重要的是：**生成器是惰性的 (lazy)**——它不会一次生成所有数据，而是"按需生产"。
> 这意味着你可以用 10MB 内存处理 10GB 的文件。

### 3.1 从迭代器到生成器

```python
# ❌ 手动迭代器：20+ 行代码
class CountUpIterator:
    def __init__(self, start: int, stop: int) -> None:
        self._current = start
        self._stop = stop

    def __iter__(self) -> "CountUpIterator":
        return self

    def __next__(self) -> int:
        if self._current >= self._stop:
            raise StopIteration
        value: int = self._current
        self._current += 1
        return value


# ✅ 生成器函数：5 行代码，功能完全相同
def count_up(start: int, stop: int):
    """生成器函数——yield 让 Python 自动创建迭代器。"""
    current: int = start
    while current < stop:
        print(f"  [count_up] yielding {current}")
        yield current       # 暂停，返回值给调用者
        current += 1        # 下次 next() 时从这里恢复
    print(f"  [count_up] 生成器结束")


# 两种方式使用结果完全一样
print("[手动迭代器]")
for n in CountUpIterator(0, 3):
    print(f"  got: {n}")

print("\n[生成器函数]")
for n in count_up(0, 3):
    print(f"  got: {n}")
```

### 3.2 yield 的暂停与恢复

```
┌──────────────────────────────────────────────────────────┐
│              生成器的生命周期                               │
│                                                           │
│  def gen():            调用者                              │
│    yield 1    ─────→   got 1                              │
│    yield 2    ─────→   got 2     next() 驱动执行           │
│    yield 3    ─────→   got 3                              │
│    return     ─────→   StopIteration                      │
│                                                           │
│  状态: GEN_CREATED → GEN_RUNNING → GEN_SUSPENDED → ...    │
│                                      → GEN_CLOSED          │
└──────────────────────────────────────────────────────────┘
```

```python
import inspect


def lifecycle_demo():
    """演示生成器的生命周期。"""
    print("  [gen] 开始执行")
    yield 1
    print("  [gen] 第一次恢复")
    yield 2
    print("  [gen] 第二次恢复")
    yield 3
    print("  [gen] 即将结束")


gen = lifecycle_demo()
print(f"[状态] 创建后: {inspect.getgeneratorstate(gen)}")  # GEN_CREATED

val = next(gen)
print(f"[调用] next() -> {val}")
print(f"[状态] 第一次yield后: {inspect.getgeneratorstate(gen)}")  # GEN_SUSPENDED

val = next(gen)
print(f"[调用] next() -> {val}")

val = next(gen)
print(f"[调用] next() -> {val}")

try:
    next(gen)
except StopIteration:
    print("[调用] StopIteration!")
    print(f"[状态] 结束后: {inspect.getgeneratorstate(gen)}")  # GEN_CLOSED
```

**生成器的实际威力——处理大文件：**

```python
from pathlib import Path
from typing import Generator


def read_large_file(filepath: Path, chunk_size: int = 1024) -> Generator[str, None, None]:
    """逐块读取大文件——内存用量恒定。"""
    with open(filepath, "r", encoding="utf-8") as f:
        while True:
            chunk: str = f.read(chunk_size)
            if not chunk:
                break
            print(f"  [read_large_file] 读取了 {len(chunk)} 字符")
            yield chunk


def count_words_in_file(filepath: Path) -> int:
    """用生成器统计文件单词数——不需要把整个文件加载到内存。"""
    total: int = 0
    for chunk in read_large_file(filepath):
        total += len(chunk.split())
    return total


# 示例用法（需要实际文件）
# word_count = count_words_in_file(Path("huge_file.txt"))
# print(f"[大文件] 单词数: {word_count}")
```

---

## 4. 生成器表达式 vs 列表推导

> ⚛️ **The Science: 内存占用对比**
>
> 列表推导 `[x**2 for x in range(10_000_000)]` 立即创建一个包含 1000 万个元素的列表（约 80MB）。
> 生成器表达式 `(x**2 for x in range(10_000_000))` 只创建一个生成器对象（约 200 字节），按需计算。

```python
import sys

# 列表推导：立即计算，占用大量内存
list_comp: list[int] = [x ** 2 for x in range(10_000)]
print(f"[内存] 列表推导: {sys.getsizeof(list_comp):,} bytes")

# 生成器表达式：惰性计算，几乎不占内存
gen_expr = (x ** 2 for x in range(10_000))
print(f"[内存] 生成器表达式: {sys.getsizeof(gen_expr):,} bytes")
```

| 特性 | 列表推导 `[...]` | 生成器表达式 `(...)` |
|------|-----------------|---------------------|
| 语法 | `[expr for ...]` | `(expr for ...)` |
| 返回类型 | `list` | `generator` |
| 求值方式 | **立即** (eager) | **惰性** (lazy) |
| 内存使用 | O(n) | O(1) |
| 可重复迭代 | ✅ 是 | ❌ 一次性 |
| 支持索引 | ✅ `lst[3]` | ❌ 不支持 |
| 适用场景 | 数据量小，需要随机访问 | 数据量大，只需遍历 |

```python
# ✅ 用生成器表达式传给聚合函数（最 Pythonic）
total: int = sum(x ** 2 for x in range(100))  # 不需要方括号！
print(f"[gen expr] sum = {total}")

any_even: bool = any(x % 2 == 0 for x in [1, 3, 5, 6, 7])
print(f"[gen expr] any even = {any_even}")  # True

max_len: int = max(len(word) for word in ["hello", "world", "python"])
print(f"[gen expr] max length = {max_len}")  # 6

# ❌ 不要这样写——先创建完整列表再传给 sum，浪费内存
# total = sum([x ** 2 for x in range(100)])  # 多余的方括号
```

---

## 5. `yield from`：委托生成器

> 🧰 **Toolbox: yield from 的三个作用**
>
> 1. **简化嵌套迭代**：`yield from iterable` 等价于 `for item in iterable: yield item`
> 2. **扁平化数据结构**：轻松展开嵌套列表、树结构等
> 3. **委托子生成器**：在协程中传递 `send()`/`throw()` 给子生成器（高级用法）

```python
# ❌ 没有 yield from 时的写法
def chain_manual(*iterables):
    """手动链接多个可迭代对象。"""
    for it in iterables:
        for item in it:
            yield item


# ✅ 用 yield from 简化
def chain_elegant(*iterables):
    """用 yield from 链接多个可迭代对象。"""
    for it in iterables:
        yield from it  # 一行代替两行


result1: list[int] = list(chain_manual([1, 2], [3, 4], [5, 6]))
result2: list[int] = list(chain_elegant([1, 2], [3, 4], [5, 6]))
print(f"[chain] manual: {result1}")   # [1, 2, 3, 4, 5, 6]
print(f"[chain] elegant: {result2}")  # [1, 2, 3, 4, 5, 6]
```

**实战：扁平化嵌套结构**

```python
from typing import Any, Generator


def flatten(nested: Any) -> Generator[Any, None, None]:
    """递归扁平化任意嵌套结构。"""
    if isinstance(nested, (list, tuple)):
        for item in nested:
            yield from flatten(item)  # 递归委托
    else:
        yield nested


deep_nested: list[Any] = [1, [2, 3], [4, [5, [6, 7]]], 8]
flat: list[Any] = list(flatten(deep_nested))
print(f"[flatten] {deep_nested}")
print(f"[flatten] -> {flat}")  # [1, 2, 3, 4, 5, 6, 7, 8]
```

**实战：遍历树结构**

```python
from dataclasses import dataclass, field


@dataclass
class TreeNode:
    """树节点。"""
    value: str
    children: list["TreeNode"] = field(default_factory=list)


def walk_tree(node: TreeNode) -> Generator[str, None, None]:
    """深度优先遍历树——yield from 递归委托。"""
    print(f"  [walk] 访问: {node.value}")
    yield node.value
    for child in node.children:
        yield from walk_tree(child)  # 递归委托给子树


# 构建树
root = TreeNode("root", [
    TreeNode("A", [
        TreeNode("A1"),
        TreeNode("A2"),
    ]),
    TreeNode("B", [
        TreeNode("B1"),
    ]),
])

print("[树遍历]")
for value in walk_tree(root):
    print(f"  -> {value}")
```

---

## 6. 生成器的高级用法

### 6.1 `send()`：向生成器发送数据

```python
from typing import Generator


def running_average() -> Generator[float, float, str]:
    """
    运行平均值计算器。
    - yield 产出当前平均值
    - send() 接收新的数值
    - return 返回最终报告
    """
    total: float = 0.0
    count: int = 0
    average: float = 0.0

    while True:
        value: float = yield average  # type: ignore[assignment]
        if value is None:
            break
        total += value
        count += 1
        average = total / count
        print(f"  [avg] 收到 {value}, 当前平均: {average:.2f}")

    return f"共 {count} 个值，最终平均: {average:.2f}"


# 使用 send() 驱动
avg = running_average()
next(avg)              # 启动生成器（必须先调用 next() 或 send(None)）

avg.send(10.0)         # 发送数据
avg.send(20.0)
avg.send(30.0)

try:
    avg.send(None)     # type: ignore[arg-type]  # 发送 None 终止
except StopIteration as e:
    print(f"[avg] 最终报告: {e.value}")
```

### 6.2 `throw()` 与 `close()`

```python
def resilient_counter(start: int = 0) -> Generator[int, None, None]:
    """可被外部中断或重置的计数器。"""
    current: int = start
    while True:
        try:
            yield current
            current += 1
        except ValueError as e:
            print(f"  [counter] 收到 ValueError: {e}，重置为 0")
            current = 0
        except GeneratorExit:
            print("  [counter] 生成器被关闭，执行清理")
            return  # 必须 return 或 raise StopIteration/GeneratorExit


counter = resilient_counter(10)

print(f"[throw] {next(counter)}")  # 10
print(f"[throw] {next(counter)}")  # 11

# 抛入异常——生成器可以捕获并处理
counter.throw(ValueError, "重置计数器")
print(f"[throw] {next(counter)}")  # 1（重置后从 0 开始，yield 了 0，再 next 得到 1）

# 关闭生成器
counter.close()
print("[throw] 生成器已关闭")
```

---

## 7. `itertools` 实战

> 🧰 **Toolbox: itertools 是"迭代器的瑞士军刀"**
>
> `itertools` 提供了高性能的迭代器构建块，用 C 语言实现，零额外内存开销。
> 掌握它们可以用优雅的声明式代码替代复杂的循环逻辑。

```python
import itertools
from typing import Iterator

# === 无限迭代器 ===

# count：无限计数
for i in itertools.count(10, 2):
    if i > 18:
        break
    print(f"  [count] {i}", end=" ")
print()

# cycle：无限循环
colors: Iterator[str] = itertools.cycle(["红", "绿", "蓝"])
for _, color in zip(range(7), colors):
    print(f"  [cycle] {color}", end=" ")
print()

# repeat：重复
print(f"  [repeat] {list(itertools.repeat('hello', 3))}")

# === 有限迭代器 ===

# chain：链接多个迭代器
chained: list[int] = list(itertools.chain([1, 2], [3, 4], [5, 6]))
print(f"[chain] {chained}")  # [1, 2, 3, 4, 5, 6]

# islice：切片（支持无限迭代器）
first_five_evens: list[int] = list(itertools.islice(itertools.count(0, 2), 5))
print(f"[islice] 前5个偶数: {first_five_evens}")  # [0, 2, 4, 6, 8]

# takewhile / dropwhile：条件过滤
data: list[int] = [1, 3, 5, 8, 2, 4]
taken: list[int] = list(itertools.takewhile(lambda x: x < 6, data))
dropped: list[int] = list(itertools.dropwhile(lambda x: x < 6, data))
print(f"[takewhile] < 6: {taken}")    # [1, 3, 5]
print(f"[dropwhile] >= 6: {dropped}")  # [8, 2, 4]

# groupby：分组（数据必须先排序！）
words: list[str] = sorted(["apple", "avocado", "banana", "blueberry", "cherry"], key=lambda w: w[0])
for key, group in itertools.groupby(words, key=lambda w: w[0]):
    print(f"  [groupby] {key}: {list(group)}")

# === 组合迭代器 ===

# product：笛卡尔积
for combo in itertools.product("AB", [1, 2]):
    print(f"  [product] {combo}", end=" ")
print()

# combinations：组合
for combo in itertools.combinations("ABCD", 2):
    print(f"  [combinations] {combo}", end=" ")
print()

# permutations：排列
for perm in itertools.permutations("ABC", 2):
    print(f"  [permutations] {perm}", end=" ")
print()
```

| 函数 | 类别 | 功能 | 示例 |
|------|------|------|------|
| `count(start, step)` | 无限 | 无限计数 | `count(10, 2)` → 10, 12, 14... |
| `cycle(iterable)` | 无限 | 无限循环 | `cycle('AB')` → A, B, A, B... |
| `repeat(obj, n)` | 有限 | 重复 n 次 | `repeat('x', 3)` → x, x, x |
| `chain(*iterables)` | 拼接 | 链接多个 | `chain([1,2], [3,4])` → 1,2,3,4 |
| `islice(it, stop)` | 切片 | 迭代器切片 | `islice(count(), 5)` → 0,1,2,3,4 |
| `takewhile(pred, it)` | 过滤 | 条件为真时取 | 遇到 False 停止 |
| `dropwhile(pred, it)` | 过滤 | 条件为真时丢 | 遇到 False 开始取 |
| `groupby(it, key)` | 分组 | 连续相同元素分组 | 需先排序 |
| `product(A, B)` | 组合 | 笛卡尔积 | `product('AB', '12')` |
| `combinations(it, r)` | 组合 | r 个元素的组合 | 无重复，无顺序 |
| `permutations(it, r)` | 排列 | r 个元素的排列 | 无重复，有顺序 |

---

## 最佳实践

1. **优先用生成器替代列表**：如果只需要遍历，不需要随机访问，用生成器
2. **用 `yield from` 替代嵌套循环**：更清晰，性能也更好
3. **Iterable 和 Iterator 分离**：让你的可迭代对象支持多次遍历
4. **生成器表达式传给聚合函数**：`sum(x**2 for x in data)` 而非 `sum([x**2 for x in data])`
5. **用 `itertools` 替代手写循环**：更高效，更声明式，更不容易出错
6. **生成器不是万能的**：需要 `len()`、索引、多次遍历时，用列表

```python
# ✅ 最佳实践示例：数据处理管道
from typing import Generator, Iterable


def read_lines(filepath: str) -> Generator[str, None, None]:
    """第一步：逐行读取。"""
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            yield line.strip()


def filter_non_empty(lines: Iterable[str]) -> Generator[str, None, None]:
    """第二步：过滤空行。"""
    for line in lines:
        if line:
            yield line


def parse_numbers(lines: Iterable[str]) -> Generator[float, None, None]:
    """第三步：解析数字。"""
    for line in lines:
        try:
            yield float(line)
        except ValueError:
            print(f"  [parse] 跳过非数字行: {line!r}")


# 管道式组合——内存使用恒定，无论文件多大
# total = sum(parse_numbers(filter_non_empty(read_lines("data.txt"))))
```

---

## 常见陷阱

### 陷阱 1：迭代器耗尽后静默返回空

```python
def first_n(n: int) -> Generator[int, None, None]:
    for i in range(n):
        yield i

gen = first_n(3)

# ❌ 第二次用同一个生成器，静默返回空列表
list_1: list[int] = list(gen)  # [0, 1, 2]
list_2: list[int] = list(gen)  # [] — 空的！没有报错！

print(f"[陷阱1] 第一次: {list_1}")
print(f"[陷阱1] 第二次: {list_2}")  # ❌ 空！

# ✅ 修复：如果需要多次遍历，转换为列表或重新调用生成器函数
list_3: list[int] = list(first_n(3))
list_4: list[int] = list(first_n(3))
print(f"[修复] 第一次: {list_3}")
print(f"[修复] 第二次: {list_4}")
```

### 陷阱 2：在生成器中使用 return 返回值

```python
def gen_with_return() -> Generator[int, None, str]:
    yield 1
    yield 2
    return "done"  # 这个值不会出现在 for 循环中！

# ❌ for 循环拿不到 return 值
for val in gen_with_return():
    print(f"  [陷阱2] {val}")  # 只打印 1, 2

# ✅ 要获取 return 值，必须捕获 StopIteration
g = gen_with_return()
next(g)  # 1
next(g)  # 2
try:
    next(g)
except StopIteration as e:
    print(f"  [陷阱2] return 值: {e.value}")  # "done"
```

### 陷阱 3：生成器表达式中的变量捕获

```python
# ❌ 经典陷阱：lambda 在生成器中的延迟绑定
funcs_bad = (lambda: i for i in range(3))
print(f"[陷阱3] 延迟绑定: {[f() for f in funcs_bad]}")  # [2, 2, 2]！

# ✅ 修复：用默认参数捕获当前值
funcs_good = (lambda i=i: i for i in range(3))
print(f"[陷阱3] 捕获值: {[f() for f in funcs_good]}")  # [0, 1, 2]
```

---

## 练习题

### 练习 1：实现一个 `Repeat` 迭代器

实现一个 `Repeat` 类，无限重复给定的值。要求：
- 实现完整的迭代器协议（`__iter__` + `__next__`）
- 可选的 `times` 参数限制重复次数
- 用 `itertools.islice` 配合使用

<details>
<summary>💡 参考答案</summary>

```python
from typing import TypeVar

T = TypeVar("T")


class Repeat:
    def __init__(self, value: object, times: int | None = None) -> None:
        self.value = value
        self.times = times
        self._count: int = 0

    def __repr__(self) -> str:
        return f"Repeat({self.value!r}, times={self.times})"

    def __iter__(self) -> "Repeat":
        self._count = 0
        return self

    def __next__(self) -> object:
        if self.times is not None and self._count >= self.times:
            raise StopIteration
        self._count += 1
        print(f"  [Repeat] #{self._count}: {self.value}")
        return self.value


# 有限重复
for item in Repeat("hello", times=3):
    pass

# 无限重复 + islice
import itertools
first_five = list(itertools.islice(Repeat(42), 5))
print(f"[Repeat] 前5个: {first_five}")
```
</details>

### 练习 2：用生成器实现斐波那契数列

写一个生成器函数 `fibonacci()`，无限产出斐波那契数列。
然后用它实现：
- 获取前 20 个斐波那契数
- 找到第一个大于 1000 的斐波那契数

<details>
<summary>💡 参考答案</summary>

```python
import itertools
from typing import Generator


def fibonacci() -> Generator[int, None, None]:
    a: int = 0
    b: int = 1
    while True:
        print(f"  [fib] yield {a}")
        yield a
        a, b = b, a + b


# 前 20 个
first_20: list[int] = list(itertools.islice(fibonacci(), 20))
print(f"[fib] 前20个: {first_20}")

# 第一个大于 1000 的
for n in fibonacci():
    if n > 1000:
        print(f"[fib] 第一个 > 1000: {n}")
        break
```
</details>

### 练习 3：实现一个数据处理管道

用生成器实现一个日志分析管道：
1. `read_logs()` 生成器：产出日志行
2. `filter_errors()` 生成器：只保留 ERROR 级别
3. `extract_message()` 生成器：提取错误消息
4. 将它们组合成管道，统计错误数量

<details>
<summary>💡 参考答案</summary>

```python
from typing import Generator, Iterable


# 模拟日志数据
SAMPLE_LOGS: list[str] = [
    "2026-02-09 10:00:01 INFO  Server started",
    "2026-02-09 10:00:02 DEBUG Connection pool initialized",
    "2026-02-09 10:00:05 ERROR Database connection failed: timeout",
    "2026-02-09 10:00:06 INFO  Retrying connection",
    "2026-02-09 10:00:07 ERROR Authentication failed: invalid token",
    "2026-02-09 10:00:08 WARN  High memory usage: 85%",
    "2026-02-09 10:00:09 ERROR Disk space low: 2% remaining",
    "2026-02-09 10:00:10 INFO  Cleanup completed",
]


def read_logs(logs: list[str]) -> Generator[str, None, None]:
    for line in logs:
        print(f"  [read] {line[:40]}...")
        yield line


def filter_errors(lines: Iterable[str]) -> Generator[str, None, None]:
    for line in lines:
        if "ERROR" in line:
            print(f"  [filter] 命中: {line[:40]}...")
            yield line


def extract_message(lines: Iterable[str]) -> Generator[str, None, None]:
    for line in lines:
        # 格式: "日期 时间 级别 消息"
        parts: list[str] = line.split(maxsplit=3)
        if len(parts) >= 4:
            msg: str = parts[3]
            if msg.startswith("ERROR"):
                msg = msg[6:].strip()
            yield msg
            print(f"  [extract] {msg}")


# 组合管道
pipeline = extract_message(filter_errors(read_logs(SAMPLE_LOGS)))
errors: list[str] = list(pipeline)

print(f"\n[管道结果] 共 {len(errors)} 个错误:")
for err in errors:
    print(f"  - {err}")
```
</details>

### 练习 4：用 `itertools` 实现扑克牌生成器

用 `itertools.product` 生成所有扑克牌，然后：
- 用 `itertools.combinations` 找出所有 5 张牌的组合数
- 用生成器过滤出所有"同花"（5 张同花色）的组合

<details>
<summary>💡 参考答案</summary>

```python
import itertools
from typing import Generator


RANKS: list[str] = list("23456789") + ["10", "J", "Q", "K", "A"]
SUITS: list[str] = ["♠", "♥", "♦", "♣"]


def all_cards() -> list[tuple[str, str]]:
    return list(itertools.product(RANKS, SUITS))


def is_flush(hand: tuple[tuple[str, str], ...]) -> bool:
    """判断是否为同花（5张同花色）。"""
    suits: set[str] = {card[1] for card in hand}
    return len(suits) == 1


def flush_hands(
    cards: list[tuple[str, str]],
) -> Generator[tuple[tuple[str, str], ...], None, None]:
    """生成器：找出所有同花组合。"""
    for hand in itertools.combinations(cards, 5):
        if is_flush(hand):
            yield hand


deck = all_cards()
print(f"[扑克] 总牌数: {len(deck)}")

# 计算5张牌组合数（不实际生成）
total_combinations: int = len(deck)  # C(52, 5) = 2,598,960
# 用公式计算更快
from math import comb
print(f"[扑克] 5张组合数: {comb(52, 5):,}")

# 用生成器统计同花数（惰性计算）
flush_count: int = sum(1 for _ in flush_hands(deck))
print(f"[扑克] 同花数: {flush_count:,}")
print(f"[扑克] 同花概率: {flush_count / comb(52, 5):.4%}")
```
</details>

---

## 参考资源

- [Python 迭代器协议 — 官方文档](https://docs.python.org/3/library/stdtypes.html#iterator-types)
- [itertools 模块 — 官方文档](https://docs.python.org/3/library/itertools.html)
- [PEP 255 — Simple Generators](https://peps.python.org/pep-0255/)
- [PEP 380 — Syntax for Delegating to a Subgenerator (yield from)](https://peps.python.org/pep-0380/)
- [David Beazley — Generator Tricks for Systems Programmers](http://www.dabeaz.com/generators/)
- [Fluent Python, 2nd Ed. — Ch.17: Iterators, Generators, and Classic Coroutines](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)

---

## 下一步

恭喜！你已经掌握了 Python 迭代的核心——从底层协议到生成器再到 `itertools`。

接下来，我们将学习 Python 中最"可怕"也最优雅的特性——**装饰器**。它的本质就是闭包 + 高阶函数，一旦理解了等价形式，三层嵌套就不再神秘。

**[👉 第 4 章：装饰器](../04-decorators/)**

---

[⬅️ 第 2 章：魔术方法入门](../02-dunder-methods/) | [👉 第 4 章：装饰器](../04-decorators/) | [🏠 返回 Stage 2 目录](../README.md)
