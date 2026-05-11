# 第 7 章：函数式编程 (Functional Programming)

> *"Object-oriented programming makes code understandable by encapsulating moving parts. Functional programming makes code understandable by minimizing moving parts."*
> — Michael Feathers
>
> Python 不是 Haskell，也不想成为 Haskell。
> 但 Python 拥抱函数式编程的精华：一等函数、高阶函数、不可变数据。
> 最好的 Python 代码，是 OOP 和 FP 的和谐共存。

---

## 📖 本章内容

- [1. Python 中的函数式编程理念](#1-python-中的函数式编程理念)
- [2. 一等函数与高阶函数](#2-一等函数与高阶函数)
- [3. map, filter, reduce 深入](#3-map-filter-reduce-深入)
- [4. functools 工具箱](#4-functools-工具箱)
- [5. operator 模块](#5-operator-模块)
- [6. 不可变数据与纯函数](#6-不可变数据与纯函数)
- [7. 函数组合与管道](#7-函数组合与管道)
- [8. 函数式 vs OOP：何时选择](#8-函数式-vs-oop何时选择)
- [最佳实践 / 常见陷阱](#最佳实践践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. Python 中的函数式编程理念

> 🎭 **The Drama: 三大编程范式的较量**
>
> 编程语言的世界有三大范式：
> - **命令式 (Imperative)**：告诉计算机"怎么做"——`for` 循环、变量赋值
> - **面向对象 (OOP)**：用对象封装状态和行为——类、继承、多态
> - **函数式 (FP)**：用函数变换数据——纯函数、不可变、组合
>
> Python 是多范式语言——它不强迫你选边站，而是让你在合适的场景用合适的风格。
> Guido van Rossum 自己说过："Python 借鉴了函数式编程的一些好想法，
> 但它本质上不是函数式语言。"

### 1.1 函数式编程的核心原则

```
┌──────────────────────────────────────────────────────────────────┐
│                  函数式编程核心原则                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 纯函数 (Pure Function)                                       │
│     ├── 相同输入 → 相同输出                                       │
│     ├── 无副作用（不修改外部状态）                                  │
│     └── 可预测、可测试、可缓存                                     │
│                                                                  │
│  2. 不可变数据 (Immutability)                                     │
│     ├── 数据一旦创建不再修改                                      │
│     ├── 需要改变时创建新的副本                                     │
│     └── 消除并发中的数据竞争                                      │
│                                                                  │
│  3. 函数组合 (Composition)                                       │
│     ├── 小函数组合成大函数                                        │
│     ├── 数据流过函数管道                                          │
│     └── 像乐高积木一样构建程序                                     │
│                                                                  │
│  4. 声明式 (Declarative)                                         │
│     ├── 描述"做什么"而非"怎么做"                                   │
│     ├── map/filter/reduce 代替 for 循环                           │
│     └── 代码更接近问题描述                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Python 的 FP 支持

| FP 特性 | Python 支持 | 说明 |
|:---|:---|:---|
| 一等函数 | 完全支持 | 函数可赋值、传参、返回 |
| 高阶函数 | 完全支持 | `map`, `filter`, `sorted(key=...)` |
| 闭包 | 完全支持 | 嵌套函数 + 自由变量 |
| Lambda | 支持（受限） | 只能单表达式 |
| 不可变数据 | 部分支持 | `tuple`, `frozenset`, `@dataclass(frozen=True)` |
| 模式匹配 | 3.10+ | `match/case` |
| 尾递归优化 | 不支持 | Python 明确拒绝 TCO |
| 代数数据类型 | 不直接支持 | 可用 `Union` + `@dataclass` 模拟 |
| 惰性求值 | 部分支持 | 生成器、`itertools` |
| 柯里化 | 不原生支持 | `functools.partial` 提供类似功能 |

---

## 2. 一等函数与高阶函数

> 🧠 **CS Master's Bridge: 一等公民的含义**
>
> 在 Python 中，函数是"一等公民"（first-class citizen），这意味着：
> 1. 函数可以赋值给变量
> 2. 函数可以作为参数传递
> 3. 函数可以作为返回值
> 4. 函数可以存储在数据结构中
>
> 这与 Java（8 之前）或 C 形成对比——在那些语言中，
> 你不能直接传递函数，必须用接口/函数指针包装。

### 2.1 函数是对象

```python
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def add(a: int, b: int) -> int:
    """加法"""
    return a + b


# ✅ 函数是对象
logger.info("类型: %s", type(add))           # <class 'function'>
logger.info("名称: %s", add.__name__)        # add
logger.info("文档: %s", add.__doc__)         # 加法
logger.info("id: %d", id(add))              # 内存地址

# ✅ 函数可以赋值给变量
plus = add
logger.info("plus(1, 2) = %d", plus(1, 2))  # 3

# ✅ 函数可以存储在数据结构中
operations: dict[str, callable] = {
    "+": add,
    "-": lambda a, b: a - b,
    "*": lambda a, b: a * b,
}
logger.info("operations['+'](3, 4) = %d", operations["+"](3, 4))
```

### 2.2 高阶函数

```python
from typing import Callable
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# ✅ 接受函数作为参数
def apply_operation(
    func: Callable[[int, int], int],
    a: int,
    b: int,
) -> int:
    logger.info("调用 %s(%d, %d)", func.__name__, a, b)
    return func(a, b)


result = apply_operation(lambda x, y: x ** y, 2, 10)
logger.info("2^10 = %d", result)


# ✅ 返回函数
def make_multiplier(factor: int) -> Callable[[int], int]:
    """工厂函数：创建乘法器"""
    def multiplier(x: int) -> int:
        return x * factor
    multiplier.__name__ = f"multiply_by_{factor}"
    return multiplier


double = make_multiplier(2)
triple = make_multiplier(3)
logger.info("double(5) = %d", double(5))   # 10
logger.info("triple(5) = %d", triple(5))   # 15


# ✅ 闭包：内部函数记住外部变量
def make_counter(start: int = 0) -> Callable[[], int]:
    count = start
    def counter() -> int:
        nonlocal count
        count += 1
        return count
    return counter


c = make_counter()
logger.info("counter: %d, %d, %d", c(), c(), c())  # 1, 2, 3
```

### 2.3 内置高阶函数

```python
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

data = [
    {"name": "Alice", "age": 30, "score": 85},
    {"name": "Bob", "age": 25, "score": 92},
    {"name": "Charlie", "age": 35, "score": 78},
    {"name": "Diana", "age": 28, "score": 95},
]

# ✅ sorted + key 函数
by_age = sorted(data, key=lambda x: x["age"])
by_score_desc = sorted(data, key=lambda x: x["score"], reverse=True)
logger.info("按年龄: %s", [d["name"] for d in by_age])
logger.info("按分数降序: %s", [d["name"] for d in by_score_desc])

# ✅ max/min + key 函数
oldest = max(data, key=lambda x: x["age"])
best = max(data, key=lambda x: x["score"])
logger.info("最年长: %s (%d)", oldest["name"], oldest["age"])
logger.info("最高分: %s (%d)", best["name"], best["score"])
```

---

## 3. map, filter, reduce 深入

> 🌌 **The Big Picture: map/filter/reduce — FP 的三板斧**
>
> 这三个函数源自 Lisp（1958 年），是函数式编程的基石：
> - `map`: 变换每个元素（一对一）
> - `filter`: 筛选元素（过滤）
> - `reduce`: 归约为单个值（聚合）
>
> 在 Python 中，列表推导式通常比 `map`/`filter` 更 Pythonic，
> 但理解它们是理解 FP 的关键。

### 3.1 map

```python
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

numbers = [1, 2, 3, 4, 5]

# ✅ map: 对每个元素应用函数
squares_map = list(map(lambda x: x ** 2, numbers))
logger.info("map: %s", squares_map)

# ✅ 等价的列表推导式（更 Pythonic）
squares_comp = [x ** 2 for x in numbers]
logger.info("推导式: %s", squares_comp)

# ✅ map 的优势：可以用已命名的函数
names = ["alice", "bob", "charlie"]
capitalized = list(map(str.capitalize, names))
logger.info("capitalize: %s", capitalized)

# ✅ 多参数 map
a = [1, 2, 3]
b = [10, 20, 30]
sums = list(map(lambda x, y: x + y, a, b))
logger.info("多参数 map: %s", sums)  # [11, 22, 33]
```

### 3.2 filter

```python
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

numbers = range(1, 21)

# ✅ filter: 筛选满足条件的元素
evens_filter = list(filter(lambda x: x % 2 == 0, numbers))
logger.info("filter 偶数: %s", evens_filter)

# ✅ 等价的列表推导式
evens_comp = [x for x in numbers if x % 2 == 0]
logger.info("推导式偶数: %s", evens_comp)

# ✅ filter(None, ...) 去除假值
mixed = [0, 1, "", "hello", None, [], [1], False, True]
truthy = list(filter(None, mixed))
logger.info("去除假值: %s", truthy)  # [1, 'hello', [1], True]
```

### 3.3 reduce

```python
from functools import reduce
import operator
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

numbers = [1, 2, 3, 4, 5]

# ✅ reduce: 归约为单个值
total = reduce(lambda acc, x: acc + x, numbers)
logger.info("求和: %d", total)

# ✅ 带初始值
total_with_init = reduce(lambda acc, x: acc + x, numbers, 100)
logger.info("求和(初始100): %d", total_with_init)

# ✅ 用 operator 模块更清晰
product = reduce(operator.mul, numbers)
logger.info("乘积: %d", product)

# ✅ reduce 实现 flatten
nested = [[1, 2], [3, 4], [5, 6]]
flat = reduce(lambda acc, lst: acc + lst, nested, [])
logger.info("展平: %s", flat)

# ✅ reduce 实现最大值
maximum = reduce(lambda a, b: a if a > b else b, numbers)
logger.info("最大值: %d", maximum)
```

### 3.4 map/filter/reduce vs 推导式/内置函数

| 操作 | FP 风格 | Pythonic 风格 | 推荐 |
|:---|:---|:---|:---|
| 变换 | `map(f, lst)` | `[f(x) for x in lst]` | 推导式 |
| 筛选 | `filter(f, lst)` | `[x for x in lst if f(x)]` | 推导式 |
| 求和 | `reduce(add, lst)` | `sum(lst)` | 内置函数 |
| 求积 | `reduce(mul, lst)` | `math.prod(lst)` | 内置函数 |
| 最大值 | `reduce(max, lst)` | `max(lst)` | 内置函数 |
| 存在性 | `any(map(f, lst))` | `any(f(x) for x in lst)` | 生成器表达式 |
| 全满足 | `all(map(f, lst))` | `all(f(x) for x in lst)` | 生成器表达式 |

---

## 4. functools 工具箱

> 🧰 **Toolbox: functools — Python 的函数式瑞士军刀**
>
> `functools` 模块提供了一系列操作函数的高阶函数。
> 它不会把 Python 变成 Haskell，但会让你的代码更简洁、更高效。

### 4.1 partial — 偏函数

```python
from functools import partial
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def power(base: int, exponent: int) -> int:
    result = base ** exponent
    logger.info("%d^%d = %d", base, exponent, result)
    return result


# ✅ partial: 固定部分参数
square = partial(power, exponent=2)
cube = partial(power, exponent=3)

square(5)    # 5^2 = 25
cube(3)      # 3^3 = 27

# ✅ 实际应用：配置化的函数
import json

compact_json = partial(json.dumps, separators=(',', ':'), ensure_ascii=False)
pretty_json = partial(json.dumps, indent=2, ensure_ascii=False)

data = {"name": "张三", "age": 30}
logger.info("紧凑: %s", compact_json(data))
logger.info("美化:\n%s", pretty_json(data))
```

### 4.2 lru_cache — 记忆化

```python
from functools import lru_cache, cache
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# ❌ 没有缓存：指数级时间复杂度
def fib_slow(n: int) -> int:
    if n < 2:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)


# ✅ lru_cache: O(n) 时间
@lru_cache(maxsize=128)
def fib_cached(n: int) -> int:
    if n < 2:
        return n
    return fib_cached(n - 1) + fib_cached(n - 2)


# 对比
start = time.perf_counter()
result_slow = fib_slow(30)
slow_time = time.perf_counter() - start
logger.info("❌ 无缓存 fib(30) = %d, 耗时 %.3f 秒", result_slow, slow_time)

start = time.perf_counter()
result_cached = fib_cached(30)
cached_time = time.perf_counter() - start
logger.info("✅ 有缓存 fib(30) = %d, 耗时 %.6f 秒", result_cached, cached_time)
logger.info("加速: %.0fx", slow_time / cached_time if cached_time > 0 else float('inf'))

# 查看缓存统计
logger.info("缓存统计: %s", fib_cached.cache_info())


# ✅ Python 3.9+: @cache 是 @lru_cache(maxsize=None) 的简写
@cache
def factorial(n: int) -> int:
    logger.info("计算 %d!", n)
    if n <= 1:
        return 1
    return n * factorial(n - 1)


logger.info("5! = %d", factorial(5))
logger.info("再次调用 5! = %d (不会重新计算)", factorial(5))
```

### 4.3 singledispatch — 单分派泛函数

```python
from functools import singledispatch
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# ✅ singledispatch: 根据第一个参数的类型分派
@singledispatch
def format_value(value) -> str:
    """默认格式化"""
    return str(value)


@format_value.register(int)
def _(value: int) -> str:
    return f"整数: {value:,}"


@format_value.register(float)
def _(value: float) -> str:
    return f"浮点数: {value:.4f}"


@format_value.register(list)
def _(value: list) -> str:
    return f"列表({len(value)}项): [{', '.join(str(v) for v in value[:3])}{'...' if len(value) > 3 else ''}]"


@format_value.register(dict)
def _(value: dict) -> str:
    keys = list(value.keys())[:3]
    return f"字典({len(value)}键): {{{', '.join(str(k) for k in keys)}{'...' if len(value) > 3 else ''}}}"


# 测试
test_values = [42, 3.14159, [1, 2, 3, 4, 5], {"a": 1, "b": 2}, "hello"]
for v in test_values:
    logger.info("format_value(%r) = %s", v, format_value(v))
```

### 4.4 wraps — 保留原函数信息

```python
from functools import wraps
from typing import Callable, TypeVar, ParamSpec
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

P = ParamSpec('P')
T = TypeVar('T')


# ❌ 不用 wraps：装饰后丢失原函数信息
def bad_timer(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        logger.info("耗时: %.3f 秒", time.perf_counter() - start)
        return result
    return wrapper


# ✅ 用 wraps：保留原函数信息
def good_timer(func: Callable[P, T]) -> Callable[P, T]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        logger.info("%s 耗时: %.3f 秒", func.__name__, time.perf_counter() - start)
        return result
    return wrapper


@bad_timer
def process_bad(n: int) -> int:
    """处理数据"""
    return sum(range(n))

@good_timer
def process_good(n: int) -> int:
    """处理数据"""
    return sum(range(n))


logger.info("❌ bad: name=%s, doc=%s", process_bad.__name__, process_bad.__doc__)
# name=wrapper, doc=None

logger.info("✅ good: name=%s, doc=%s", process_good.__name__, process_good.__doc__)
# name=process_good, doc=处理数据
```

### 4.5 reduce（已在 3.3 节介绍）

### 4.6 total_ordering — 自动生成比较方法

```python
from functools import total_ordering
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# ✅ 只需实现 __eq__ 和一个比较方法，自动生成其余
@total_ordering
class Temperature:
    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius == other.celsius

    def __lt__(self, other: 'Temperature') -> bool:
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius < other.celsius

    def __repr__(self) -> str:
        return f"Temperature({self.celsius}°C)"


t1 = Temperature(20)
t2 = Temperature(30)
t3 = Temperature(20)

logger.info("%s < %s: %s", t1, t2, t1 < t2)
logger.info("%s > %s: %s", t1, t2, t1 > t2)    # 自动生成
logger.info("%s <= %s: %s", t1, t3, t1 <= t3)   # 自动生成
logger.info("%s >= %s: %s", t2, t1, t2 >= t1)   # 自动生成
```

---

## 5. operator 模块

> ⚛️ **The Science: 函数化的运算符**
>
> `operator` 模块将 Python 的运算符变成函数。
> 它的主要用途：替代 lambda，让代码更清晰、更快。

```python
import operator
from functools import reduce
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# ❌ lambda 版本
total_lambda = reduce(lambda a, b: a + b, [1, 2, 3, 4, 5])
product_lambda = reduce(lambda a, b: a * b, [1, 2, 3, 4, 5])

# ✅ operator 版本（更清晰）
total_op = reduce(operator.add, [1, 2, 3, 4, 5])
product_op = reduce(operator.mul, [1, 2, 3, 4, 5])

logger.info("总和: %d, 乘积: %d", total_op, product_op)
```

### operator 常用函数

| operator 函数 | 等价 lambda | 用途 |
|:---|:---|:---|
| `operator.add` | `lambda a, b: a + b` | 加法 |
| `operator.mul` | `lambda a, b: a * b` | 乘法 |
| `operator.itemgetter(k)` | `lambda x: x[k]` | 取元素 |
| `operator.attrgetter(a)` | `lambda x: x.a` | 取属性 |
| `operator.methodcaller(m)` | `lambda x: x.m()` | 调用方法 |
| `operator.not_` | `lambda x: not x` | 逻辑非 |
| `operator.eq` | `lambda a, b: a == b` | 相等 |

```python
import operator
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# ✅ itemgetter: 比 lambda 快 ~2x
students = [
    {"name": "Alice", "grade": 85},
    {"name": "Bob", "grade": 92},
    {"name": "Charlie", "grade": 78},
]

# ❌ lambda
by_grade_lambda = sorted(students, key=lambda s: s["grade"])

# ✅ operator.itemgetter
by_grade_op = sorted(students, key=operator.itemgetter("grade"))
logger.info("按成绩: %s", [s["name"] for s in by_grade_op])

# ✅ 多键排序
data = [(1, 'b'), (2, 'a'), (1, 'a'), (2, 'b')]
sorted_data = sorted(data, key=operator.itemgetter(0, 1))
logger.info("多键排序: %s", sorted_data)

# ✅ attrgetter
from dataclasses import dataclass

@dataclass
class Employee:
    name: str
    department: str
    salary: float

employees = [
    Employee("Alice", "Engineering", 120000),
    Employee("Bob", "Marketing", 90000),
    Employee("Charlie", "Engineering", 150000),
]

by_salary = sorted(employees, key=operator.attrgetter("salary"), reverse=True)
for e in by_salary:
    logger.info("%s: $%,.0f", e.name, e.salary)

# ✅ methodcaller
words = ["hello", "WORLD", "Python"]
upper_words = list(map(operator.methodcaller("upper"), words))
logger.info("大写: %s", upper_words)
```

---

## 6. 不可变数据与纯函数

> 🧘 **Zen of Code: 不可变性是并发的免费午餐**
>
> 如果数据不能被修改，就不需要锁。
> 如果函数没有副作用，就不需要考虑调用顺序。
> 纯函数 + 不可变数据 = 可以无脑并行。

### 6.1 Python 中的不可变类型

```python
from dataclasses import dataclass
from typing import NamedTuple
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# ✅ 内置不可变类型
immutable_int: int = 42
immutable_str: str = "hello"
immutable_tuple: tuple = (1, 2, 3)
immutable_frozenset: frozenset = frozenset({1, 2, 3})

# ✅ frozen dataclass
@dataclass(frozen=True)
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
logger.info("Point: %s", p)
# p.x = 3.0  # FrozenInstanceError!

# ✅ NamedTuple（天然不可变）
class Color(NamedTuple):
    r: int
    g: int
    b: int

red = Color(255, 0, 0)
logger.info("Color: %s", red)
# red.r = 100  # AttributeError!
```

### 6.2 纯函数 vs 非纯函数

```python
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# ❌ 非纯函数：修改外部状态
total = 0

def add_to_total(value: int) -> int:
    global total
    total += value  # 副作用！
    return total


# ✅ 纯函数：无副作用，相同输入 → 相同输出
def add(a: int, b: int) -> int:
    return a + b


# ❌ 非纯函数：修改输入参数
def sort_in_place(lst: list[int]) -> list[int]:
    lst.sort()  # 修改了传入的列表！
    return lst


# ✅ 纯函数：返回新列表
def sorted_copy(lst: list[int]) -> list[int]:
    return sorted(lst)  # 创建新列表，不修改原列表


original = [3, 1, 4, 1, 5]
result = sorted_copy(original)
logger.info("原列表: %s (未被修改)", original)
logger.info("新列表: %s", result)


# ❌ 非纯函数：依赖外部状态
import time

def get_greeting() -> str:
    hour = time.localtime().tm_hour  # 依赖当前时间
    if hour < 12:
        return "Good morning"
    return "Good afternoon"


# ✅ 纯函数：所有依赖都通过参数传入
def get_greeting_pure(hour: int) -> str:
    if hour < 12:
        return "Good morning"
    return "Good afternoon"
```

### 6.3 不可变更新模式

```python
from dataclasses import dataclass, replace
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class User:
    name: str
    email: str
    age: int


# ✅ "更新"不可变对象：创建修改后的副本
user = User("Alice", "alice@example.com", 30)

# dataclasses.replace — 创建修改了部分字段的副本
updated_user = replace(user, age=31)
logger.info("原用户: %s", user)
logger.info("更新后: %s", updated_user)
logger.info("是同一对象? %s", user is updated_user)  # False

# ✅ 字典的不可变更新
config = {"debug": False, "port": 8080, "host": "localhost"}
# 不修改原字典
new_config = {**config, "debug": True, "port": 9090}
logger.info("原配置: %s", config)
logger.info("新配置: %s", new_config)

# ✅ 列表的不可变操作
items = [1, 2, 3]
# 不修改原列表
with_item = [*items, 4]           # 追加
without_first = items[1:]          # 移除首元素
mapped = [x * 2 for x in items]   # 变换
logger.info("原列表: %s", items)
logger.info("追加4: %s", with_item)
logger.info("去首: %s", without_first)
logger.info("翻倍: %s", mapped)
```

---

## 7. 函数组合与管道

> 🌌 **The Big Picture: 数据管道 — FP 的杀手级应用**
>
> 函数组合的理念：把多个小函数串联成一个大函数。
> 数据像水一样流过管道中的每个处理环节。
> 这是 Unix 哲学在编程语言中的体现：
> "Write programs that do one thing and do it well. Write programs to work together."

### 7.1 手动实现函数组合

```python
from typing import Callable, TypeVar
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

T = TypeVar('T')


# ✅ compose: f(g(x))
def compose(*funcs: Callable) -> Callable:
    """从右到左组合函数: compose(f, g, h)(x) = f(g(h(x)))"""
    def composed(x):
        result = x
        for f in reversed(funcs):
            result = f(result)
        return result
    return composed


# ✅ pipe: g(f(x)) — 从左到右
def pipe(*funcs: Callable) -> Callable:
    """从左到右组合函数: pipe(f, g, h)(x) = h(g(f(x)))"""
    def piped(x):
        result = x
        for f in funcs:
            result = f(result)
        return result
    return piped


# 示例：文本处理管道
process_text = pipe(
    str.strip,
    str.lower,
    lambda s: s.replace("  ", " "),
    lambda s: s.split(),
)

text = "  Hello   World   from Python  "
result = process_text(text)
logger.info("管道结果: %s", result)  # ['hello', 'world', 'from', 'python']
```

### 7.2 数据处理管道

```python
from typing import Callable, TypeVar, Iterable
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

T = TypeVar('T')
U = TypeVar('U')


class Pipeline:
    """流式数据处理管道"""

    def __init__(self, data: Iterable) -> None:
        self._data = data

    def map(self, func: Callable) -> 'Pipeline':
        """变换每个元素"""
        return Pipeline(map(func, self._data))

    def filter(self, predicate: Callable) -> 'Pipeline':
        """筛选元素"""
        return Pipeline(filter(predicate, self._data))

    def reduce(self, func: Callable, initial=None):
        """归约为单个值"""
        from functools import reduce
        if initial is not None:
            return reduce(func, self._data, initial)
        return reduce(func, self._data)

    def sort(self, key: Callable = None, reverse: bool = False) -> 'Pipeline':
        """排序"""
        return Pipeline(sorted(self._data, key=key, reverse=reverse))

    def take(self, n: int) -> 'Pipeline':
        """取前 n 个"""
        from itertools import islice
        return Pipeline(islice(self._data, n))

    def collect(self) -> list:
        """收集结果"""
        return list(self._data)

    def first(self):
        """取第一个"""
        return next(iter(self._data))

    def count(self) -> int:
        """计数"""
        return sum(1 for _ in self._data)


# ✅ 使用管道处理数据
orders = [
    {"product": "Phone", "price": 999, "quantity": 2},
    {"product": "Case", "price": 29, "quantity": 10},
    {"product": "Laptop", "price": 1499, "quantity": 1},
    {"product": "Mouse", "price": 49, "quantity": 5},
    {"product": "Keyboard", "price": 129, "quantity": 3},
    {"product": "Monitor", "price": 599, "quantity": 2},
]

# 链式操作：找到总价超过 200 的订单，按总价降序排列
result = (
    Pipeline(orders)
    .map(lambda o: {**o, "total": o["price"] * o["quantity"]})
    .filter(lambda o: o["total"] > 200)
    .sort(key=lambda o: o["total"], reverse=True)
    .collect()
)

logger.info("高价值订单:")
for o in result:
    logger.info("  %s: $%d x %d = $%d",
                o["product"], o["price"], o["quantity"], o["total"])
```

### 7.3 函数式管道 vs 命令式循环

```python
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

words = ["hello", "world", "python", "is", "awesome", "programming", "language", "fun"]

# ❌ 命令式风格
result_imperative = []
for word in words:
    if len(word) > 3:
        upper = word.upper()
        result_imperative.append(upper)
result_imperative.sort()

# ✅ 函数式风格
result_functional = sorted(
    map(str.upper, filter(lambda w: len(w) > 3, words))
)

# ✅ Pythonic 风格（推导式）
result_pythonic = sorted(w.upper() for w in words if len(w) > 3)

logger.info("命令式: %s", result_imperative)
logger.info("函数式: %s", result_functional)
logger.info("推导式: %s", result_pythonic)
```

---

## 8. 函数式 vs OOP：何时选择

> 🧘 **Zen of Code: Python 的务实主义**
>
> Haskell 程序员可能会说："一切皆函数"。
> Java 程序员可能会说："一切皆对象"。
> Python 程序员说："用最合适的工具解决问题。"
>
> 不要为了函数式而函数式，也不要为了 OOP 而 OOP。
> 最好的代码是读起来最清晰的代码。

### 选择指南

| 场景 | 推荐风格 | 原因 |
|:---|:---|:---|
| 数据变换管道 | FP | map/filter/reduce 天然适合 |
| 状态管理 | OOP | 对象封装状态 |
| 配置/策略注入 | FP | 传递函数比定义接口简单 |
| 复杂业务逻辑 | OOP | 类的组织更清晰 |
| 工具函数库 | FP | 无状态函数易组合 |
| GUI/Web 框架 | OOP | 继承和多态更自然 |
| 并发数据处理 | FP | 纯函数天然线程安全 |
| 数据库交互 | OOP (ORM) | 对象映射到表行 |

### 代码风格对比

```python
from dataclasses import dataclass
from functools import reduce
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# ──────── 场景：计算购物车总价 ────────

# OOP 风格
@dataclass
class CartItem:
    name: str
    price: float
    quantity: int

class ShoppingCart:
    def __init__(self) -> None:
        self.items: list[CartItem] = []

    def add(self, item: CartItem) -> None:
        self.items.append(item)

    def total(self) -> float:
        return sum(item.price * item.quantity for item in self.items)

    def discount(self, rate: float) -> float:
        return self.total() * (1 - rate)


cart = ShoppingCart()
cart.add(CartItem("Book", 29.99, 2))
cart.add(CartItem("Pen", 4.99, 5))
logger.info("OOP 总价: $%.2f", cart.total())
logger.info("OOP 折后: $%.2f", cart.discount(0.1))


# FP 风格
items = [
    {"name": "Book", "price": 29.99, "quantity": 2},
    {"name": "Pen", "price": 4.99, "quantity": 5},
]

calc_item_total = lambda item: item["price"] * item["quantity"]
calc_total = lambda items: sum(map(calc_item_total, items))
apply_discount = lambda total, rate: total * (1 - rate)

total = calc_total(items)
discounted = apply_discount(total, 0.1)
logger.info("FP 总价: $%.2f", total)
logger.info("FP 折后: $%.2f", discounted)
```

```
┌──────────────────────────────────────────────────────────────────┐
│                   风格选择决策树                                   │
│                                                                  │
│  你的代码主要做什么？                                              │
│  │                                                               │
│  ├── 变换数据（ETL、报表、日志处理）                                │
│  │   └── ✅ FP 风格（管道、map/filter）                           │
│  │                                                               │
│  ├── 管理状态（用户会话、游戏角色、设备控制）                        │
│  │   └── ✅ OOP 风格（类、封装）                                  │
│  │                                                               │
│  ├── 业务规则（订单处理、权限检查）                                 │
│  │   └── ✅ 混合：OOP 结构 + FP 计算                             │
│  │                                                               │
│  └── 胶水代码（脚本、CLI 工具）                                    │
│      └── ✅ 命令式 + 少量 FP                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 最佳实践 / 常见陷阱

### 最佳实践

```python
from functools import lru_cache, partial
import operator

# ✅ 1. 用 operator 代替简单 lambda
sorted(items, key=operator.itemgetter("price"))  # 比 lambda 快

# ✅ 2. 用 partial 代替包装函数
import json
dump = partial(json.dumps, ensure_ascii=False, indent=2)

# ✅ 3. 推导式比 map/filter 更 Pythonic
# map + filter → 列表推导式
result = [x**2 for x in range(10) if x % 2 == 0]

# ✅ 4. 用 lru_cache 优化递归
@lru_cache(maxsize=None)
def expensive(n):
    pass

# ✅ 5. 尽量写纯函数
def process(data: list[int]) -> list[int]:
    return sorted(x * 2 for x in data if x > 0)  # 纯函数：不修改输入
```

### 常见陷阱

```python
from functools import lru_cache

# ❌ 陷阱 1：lru_cache 用于不可哈希参数
# @lru_cache
# def process(data: list) -> int:  # list 不可哈希 → TypeError!
#     return sum(data)

# ✅ 修复：转为 tuple
@lru_cache
def process(data: tuple) -> int:
    return sum(data)


# ❌ 陷阱 2：过度使用 lambda
# 复杂逻辑用 lambda 可读性极差
transform = lambda x: (x.strip().lower().replace(" ", "_") if isinstance(x, str) else str(x))

# ✅ 用命名函数
def normalize_key(x) -> str:
    if isinstance(x, str):
        return x.strip().lower().replace(" ", "_")
    return str(x)


# ❌ 陷阱 3：reduce 过度嵌套
# result = reduce(lambda a, b: {**a, **{b[0]: b[1]}}, pairs, {})  # 可读性？？

# ✅ 用 dict 推导式
pairs = [("a", 1), ("b", 2)]
result = {k: v for k, v in pairs}  # 清晰得多


# ❌ 陷阱 4：副作用隐藏在函数式代码中
cached_results = {}
def "pure"_but_not(x):  # 名字说"纯"但其实不纯
    if x not in cached_results:
        cached_results[x] = x ** 2  # 副作用！
    return cached_results[x]

# ✅ 用 lru_cache 替代手动缓存
@lru_cache
def truly_cached(x: int) -> int:
    return x ** 2
```

---

## 练习题

### 练习 1：实现 compose 和 pipe（基础）

实现 `compose(*fns)` 和 `pipe(*fns)` 函数，支持任意数量的单参数函数组合。

<details>
<summary>💡 提示</summary>

`compose(f, g, h)(x)` = `f(g(h(x)))`，从右到左。
`pipe(f, g, h)(x)` = `h(g(f(x)))`，从左到右。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Callable, Any
from functools import reduce
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def compose(*fns: Callable[[Any], Any]) -> Callable[[Any], Any]:
    """从右到左组合函数"""
    def composed(x: Any) -> Any:
        return reduce(lambda acc, f: f(acc), reversed(fns), x)
    return composed


def pipe(*fns: Callable[[Any], Any]) -> Callable[[Any], Any]:
    """从左到右组合函数"""
    def piped(x: Any) -> Any:
        return reduce(lambda acc, f: f(acc), fns, x)
    return piped


# 测试
double = lambda x: x * 2
add_one = lambda x: x + 1
square = lambda x: x ** 2

# compose: square(add_one(double(3))) = square(7) = 49
c = compose(square, add_one, double)
logger.info("compose(square, add_one, double)(3) = %d", c(3))

# pipe: square(add_one(double(3))) 但从左到右写
p = pipe(double, add_one, square)
logger.info("pipe(double, add_one, square)(3) = %d", p(3))

assert c(3) == p(3) == 49
logger.info("✓ 测试通过")
```

</details>

### 练习 2：实现 memoize 装饰器（中级）

实现一个 `memoize` 装饰器，支持任意参数的缓存，并提供 `cache_info()` 和 `cache_clear()` 方法。

<details>
<summary>💡 提示</summary>

使用字典存储结果，用 `(args, frozenset(kwargs.items()))` 作为键。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
from functools import wraps
from typing import Callable, TypeVar, ParamSpec
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

P = ParamSpec('P')
T = TypeVar('T')


def memoize(func: Callable[P, T]) -> Callable[P, T]:
    cache: dict = {}
    hits = 0
    misses = 0

    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
        nonlocal hits, misses
        key = (args, frozenset(kwargs.items()))
        if key in cache:
            hits += 1
            return cache[key]
        misses += 1
        result = func(*args, **kwargs)
        cache[key] = result
        return result

    def cache_info() -> dict:
        return {"hits": hits, "misses": misses, "size": len(cache)}

    def cache_clear() -> None:
        nonlocal hits, misses
        cache.clear()
        hits = 0
        misses = 0

    wrapper.cache_info = cache_info
    wrapper.cache_clear = cache_clear
    return wrapper


@memoize
def fibonacci(n: int) -> int:
    logger.info("计算 fib(%d)", n)
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


result = fibonacci(10)
logger.info("fib(10) = %d", result)
logger.info("缓存统计: %s", fibonacci.cache_info())

# 再次调用全部命中缓存
result2 = fibonacci(10)
logger.info("再次 fib(10) = %d", result2)
logger.info("缓存统计: %s", fibonacci.cache_info())

fibonacci.cache_clear()
logger.info("清除后: %s", fibonacci.cache_info())
```

</details>

### 练习 3：函数式数据管道（高级）

实现一个 `Pipeline` 类，支持链式的 `map`、`filter`、`sort`、`group_by`、`take` 操作。

<details>
<summary>💡 提示</summary>

每个方法返回新的 `Pipeline` 对象（不可变风格），使用惰性求值（生成器）。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Callable, Iterable, Any
from itertools import islice, groupby
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


class Pipeline:
    def __init__(self, data: Iterable) -> None:
        self._data = data

    def map(self, func: Callable) -> 'Pipeline':
        return Pipeline(map(func, self._data))

    def filter(self, pred: Callable) -> 'Pipeline':
        return Pipeline(filter(pred, self._data))

    def sort(self, key: Callable = None, reverse: bool = False) -> 'Pipeline':
        return Pipeline(sorted(self._data, key=key, reverse=reverse))

    def take(self, n: int) -> 'Pipeline':
        return Pipeline(islice(self._data, n))

    def flat_map(self, func: Callable) -> 'Pipeline':
        def _flat():
            for item in self._data:
                yield from func(item)
        return Pipeline(_flat())

    def group_by(self, key: Callable) -> dict[Any, list]:
        sorted_data = sorted(self._data, key=key)
        return {k: list(g) for k, g in groupby(sorted_data, key=key)}

    def reduce(self, func: Callable, initial=None):
        from functools import reduce
        if initial is not None:
            return reduce(func, self._data, initial)
        return reduce(func, self._data)

    def collect(self) -> list:
        return list(self._data)

    def for_each(self, func: Callable) -> None:
        for item in self._data:
            func(item)

    def count(self) -> int:
        return sum(1 for _ in self._data)


# 测试
products = [
    {"name": "Phone", "category": "Electronics", "price": 999},
    {"name": "Book", "category": "Education", "price": 29},
    {"name": "Laptop", "category": "Electronics", "price": 1499},
    {"name": "Pen", "category": "Office", "price": 5},
    {"name": "Course", "category": "Education", "price": 199},
    {"name": "Tablet", "category": "Electronics", "price": 599},
    {"name": "Notebook", "category": "Office", "price": 12},
]

# 找出价格 > $50 的产品，按价格降序，取前 3
top_expensive = (
    Pipeline(products)
    .filter(lambda p: p["price"] > 50)
    .sort(key=lambda p: p["price"], reverse=True)
    .take(3)
    .map(lambda p: f"{p['name']}: ${p['price']}")
    .collect()
)
logger.info("Top 3 贵: %s", top_expensive)

# 按类别分组
by_category = Pipeline(products).group_by(lambda p: p["category"])
for cat, items in by_category.items():
    names = [i["name"] for i in items]
    logger.info("%s: %s", cat, names)
```

</details>

---

## 参考资源 / 下一步

**官方文档：**
- [functools — Higher-order functions](https://docs.python.org/3/library/functools.html)
- [operator — Standard operators as functions](https://docs.python.org/3/library/operator.html)
- [itertools — Iterator building blocks](https://docs.python.org/3/library/itertools.html)

**推荐阅读：**
- *Fluent Python, 2nd Ed.* — Part III: Functions as Objects
- *Effective Python, 3rd Ed.* — Item 36-44: Comprehensions and Generators
- [Real Python: Functional Programming in Python](https://realpython.com/python-functional-programming/)

---

**导航：**

| 上一章 | 目录 | 下一章 |
|:---|:---:|---:|
| [第 6 章：asyncio](../06-concurrency-asyncio/) | [Stage 3 目录](../README.md) | [第 8 章：设计模式](../08-design-patterns/) |
