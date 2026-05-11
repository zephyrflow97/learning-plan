"""Generator script for Chapter 2: Dunder Methods."""
import pathlib

base = pathlib.Path(__file__).resolve().parent.parent


def write_file(rel_path: str, content: str) -> None:
    p = base / rel_path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    lines = content.count("\n") + 1
    print(f"  {rel_path}: {lines} lines, {p.stat().st_size} bytes")


def main() -> None:
    print("Generating Chapter 2 files...")
    write_readme()
    write_example_01()
    write_example_02()
    write_example_03()
    write_example_04()
    print("Chapter 2 complete!")


def write_readme() -> None:
    content = """\
# 第 2 章：魔术方法入门 — 让你的对象说 Python 的"母语"

> *"In Python, everything is an object, and almost everything has attributes and methods."*
> — Fluent Python, Luciano Ramalho
>
> 当你写下 `len(my_list)` 时，Python 实际上调用了 `my_list.__len__()`。
> 当你写下 `a + b` 时，Python 实际上调用了 `a.__add__(b)`。
> 魔术方法就是 Python 对象的"母语"——学会它，你的对象就能和内置语法无缝对话。

## 📖 本章内容

- [1. \\_\\_repr\\_\\_ vs \\_\\_str\\_\\_](#1-repr-vs-str)
  - [1.1 两种字符串表示的哲学](#11-两种字符串表示的哲学)
  - [1.2 实现准则](#12-实现准则)
- [2. \\_\\_eq\\_\\_ 与 \\_\\_hash\\_\\_](#2-eq-与-hash)
  - [2.1 相等性判定](#21-相等性判定)
  - [2.2 可哈希契约](#22-可哈希契约)
  - [2.3 比较方法与 total\\_ordering](#23-比较方法与-total_ordering)
- [3. \\_\\_bool\\_\\_ 与 \\_\\_len\\_\\_](#3-bool-与-len)
- [4. \\_\\_getitem\\_\\_：容器协议](#4-getitem容器协议)
- [5. \\_\\_call\\_\\_：可调用对象](#5-call可调用对象)
- [6. \\_\\_format\\_\\_：自定义格式化](#6-format自定义格式化)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. `__repr__` vs `__str__`

> 🎭 **The Drama: 两张名片**
>
> 想象你同时有两张名片：
> - **`__repr__`**：递给程序员的名片——精确、可重建、不含糊。上面写着 `"Color(red=255, green=0, blue=0)"`。
> - **`__str__`**：递给普通人的名片——友好、易读、人性化。上面写着 `"纯红色"`。
>
> **如果你只能实现一个，永远先实现 `__repr__`。**
> 因为当 `__str__` 不存在时，Python 会回退到 `__repr__`；反过来不行。

### 1.1 两种字符串表示的哲学

```python
from datetime import datetime

now = datetime.now()

# __repr__：给开发者看——精确、可重建
print(repr(now))    # datetime.datetime(2026, 2, 9, 10, 30, 45, 123456)

# __str__：给用户看——友好、可读
print(str(now))     # 2026-02-09 10:30:45.123456

# 在交互式环境中：
# >>> now          <- 使用 __repr__
# >>> print(now)   <- 使用 __str__
```

> ⚛️ **The Science: 调用时机对比**
>
> | 场景 | 调用的方法 | 示例 |
> |------|-----------|------|
> | `repr(obj)` | `__repr__` | 调试输出 |
> | `str(obj)` | `__str__` 回退 `__repr__` | 用户展示 |
> | `print(obj)` | `__str__` 回退 `__repr__` | 控制台输出 |
> | `f"{obj}"` | `__str__` 回退 `__repr__` | 格式化字符串 |
> | `f"{obj!r}"` | `__repr__` | 强制使用 repr |
> | 容器中的元素 | `__repr__` | `[obj1, obj2]` |
> | 交互式 REPL | `__repr__` | `>>> obj` |
> | `logging` | `__str__` | 日志记录 |

### 1.2 实现准则

```python
from dataclasses import dataclass


@dataclass
class Money:
    \\"\\"\\"货币——演示 __repr__ 和 __str__ 的实现。\\"\\"\\"

    amount: float
    currency: str = "CNY"

    def __repr__(self) -> str:
        \\"\\"\\"给开发者看：精确、可用于重建对象。\\"\\"\\"
        return f"Money(amount={self.amount}, currency={self.currency!r})"

    def __str__(self) -> str:
        \\"\\"\\"给用户看：友好、可读。\\"\\"\\"
        symbols: dict[str, str] = {"CNY": "¥", "USD": "$", "EUR": "€"}
        symbol: str = symbols.get(self.currency, self.currency)
        return f"{symbol}{self.amount:,.2f}"


# ✅ 使用示例
price = Money(1234.5, "CNY")
print(repr(price))  # Money(amount=1234.5, currency='CNY')
print(str(price))   # ¥1,234.50
print(f"价格是 {price}")       # 使用 __str__
print(f"调试: {price!r}")      # 强制 __repr__

# 容器中总是使用 __repr__
prices: list[Money] = [Money(100, "CNY"), Money(50, "USD")]
print(prices)  # [Money(amount=100, ...), Money(amount=50, ...)]
```

| 方法 | 受众 | 目标 | 优先级 | 回退 |
|------|------|------|--------|------|
| `__repr__` | 开发者 | 精确、可重建 | **必须实现** | 无回退 |
| `__str__` | 用户 | 友好、可读 | 可选 | 回退到 `__repr__` |

---

## 2. `__eq__` 与 `__hash__`

### 2.1 相等性判定

> 🧠 **CS Master's Bridge: 相等性 vs 同一性**
>
> Python 有两种"相等"概念：
> - **同一性 (Identity)**：`a is b`——两个变量指向**同一个对象**（内存地址相同）
> - **相等性 (Equality)**：`a == b`——两个对象的**值相等**（由 `__eq__` 决定）
>
> ```python
> a = [1, 2, 3]
> b = [1, 2, 3]
> c = a
> a == b  # True  — 值相等
> a is b  # False — 不同对象
> a is c  # True  — 同一对象
> ```
>
> 默认的 `__eq__` 比较的是 `id()`（同一性），你几乎总是需要重写它。

```python
class Coordinate:
    \\"\\"\\"坐标——手动实现 __eq__。\\"\\"\\"

    def __init__(self, lat: float, lon: float) -> None:
        self.lat: float = lat
        self.lon: float = lon
        print(f"[Coordinate] 创建: ({lat}, {lon})")

    def __eq__(self, other: object) -> bool:
        \\"\\"\\"判断两个坐标是否相等。

        注意：
        1. other 的类型标注是 object（不是 Coordinate）
        2. 必须检查类型
        3. 类型不匹配时返回 NotImplemented
        \\"\\"\\"
        if not isinstance(other, Coordinate):
            return NotImplemented
        return self.lat == other.lat and self.lon == other.lon

    def __repr__(self) -> str:
        return f"Coordinate(lat={self.lat}, lon={self.lon})"


# ✅ 使用示例
beijing = Coordinate(39.9, 116.4)
beijing2 = Coordinate(39.9, 116.4)
shanghai = Coordinate(31.2, 121.5)

print(f"beijing == beijing2: {beijing == beijing2}")  # True
print(f"beijing is beijing2: {beijing is beijing2}")  # False
print(f"beijing == shanghai: {beijing == shanghai}")   # False
```

### 2.2 可哈希契约

> ⚛️ **The Science: 可哈希契约 (Hashable Contract)**
>
> Python 的 `dict` 和 `set` 底层使用**哈希表**。要作为字典的键或集合的元素，对象必须是**可哈希的**。
>
> **契约规则：**
> 1. 如果 `a == b`，则 `hash(a) == hash(b)`（**必须**）
> 2. 如果 `hash(a) == hash(b)`，`a == b` 不一定成立（哈希冲突允许）
> 3. 对象的哈希值在其生命周期内不能改变
>
> **Python 的默认行为：**
> - 没有自定义 `__eq__`：`__hash__` 基于 `id()`（可哈希）
> - 自定义了 `__eq__` 但没定义 `__hash__`：`__hash__` 被设为 `None`（**不可哈希**）

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Point:
    \\"\\"\\"不可变点——frozen=True 自动生成 __eq__ 和 __hash__。\\"\\"\\"
    x: float
    y: float


# ✅ frozen dataclass 可以作为字典键和集合元素
point_set: set[Point] = {Point(1, 2), Point(3, 4), Point(1, 2)}
print(f"集合大小: {len(point_set)}")  # 2
```

```python
class City:
    \\"\\"\\"城市——手动实现 __eq__ 和 __hash__。\\"\\"\\"

    def __init__(self, name: str, country: str) -> None:
        self.name: str = name
        self.country: str = country

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, City):
            return NotImplemented
        return self.name == other.name and self.country == other.country

    def __hash__(self) -> int:
        \\"\\"\\"哈希值必须基于参与 __eq__ 比较的字段。\\"\\"\\"
        return hash((self.name, self.country))

    def __repr__(self) -> str:
        return f"City({self.name!r}, {self.country!r})"


cities: set[City] = {
    City("Beijing", "China"),
    City("Tokyo", "Japan"),
    City("Beijing", "China"),  # 重复，会被去除
}
print(f"城市数量: {len(cities)}")  # 2
```

| 场景 | `__eq__` | `__hash__` | 可哈希 | 可作为 dict 键 |
|------|----------|------------|--------|---------------|
| 默认（未自定义） | 基于 `id()` | 基于 `id()` | ✅ | ✅ |
| 只定义 `__eq__` | 自定义 | 被设为 `None` | ❌ | ❌ |
| 定义 `__eq__` + `__hash__` | 自定义 | 自定义 | ✅ | ✅ |
| `@dataclass` | 自动生成 | `None` | ❌ | ❌ |
| `@dataclass(frozen=True)` | 自动生成 | 自动生成 | ✅ | ✅ |

### 2.3 比较方法与 `total_ordering`

```python
import functools


@functools.total_ordering
class Version:
    \\"\\"\\"语义化版本号——只需 __eq__ 和 __lt__，自动生成其余比较方法。\\"\\"\\"

    def __init__(self, major: int, minor: int, patch: int) -> None:
        self.major: int = major
        self.minor: int = minor
        self.patch: int = patch

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) == (
            other.major, other.minor, other.patch
        )

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) < (
            other.major, other.minor, other.patch
        )

    def __hash__(self) -> int:
        return hash((self.major, self.minor, self.patch))

    def __repr__(self) -> str:
        return f"v{self.major}.{self.minor}.{self.patch}"


# ✅ 只实现 __eq__ 和 __lt__，但所有比较都可用
v1 = Version(1, 0, 0)
v2 = Version(2, 1, 0)
print(f"{v1} < {v2}: {v1 < v2}")    # True
print(f"{v2} > {v1}: {v2 > v1}")    # True（自动生成）
print(f"{v1} >= {v1}: {v1 >= v1}")   # True（自动生成）

versions = [Version(2, 0, 0), Version(1, 5, 3), Version(1, 0, 1)]
print(f"排序: {sorted(versions)}")
```

> 🧰 **Toolbox: 比较方法一览**
>
> | 方法 | 运算符 | 含义 |
> |------|--------|------|
> | `__eq__(self, other)` | `==` | 等于 |
> | `__ne__(self, other)` | `!=` | 不等于 |
> | `__lt__(self, other)` | `<` | 小于 |
> | `__le__(self, other)` | `<=` | 小于等于 |
> | `__gt__(self, other)` | `>` | 大于 |
> | `__ge__(self, other)` | `>=` | 大于等于 |
>
> **`@functools.total_ordering`**：只需 `__eq__` + 任一比较方法，自动补全其余。

---

## 3. `__bool__` 与 `__len__`

> 🌌 **The Big Picture: Python 的真值判定链**
>
> 当 Python 需要判断一个对象的"真假"时（`if obj:`、`while obj:`、`bool(obj)`），
> 它按以下顺序查找：
>
> 1. **`__bool__`**：如果定义了，直接返回 `True` 或 `False`
> 2. **`__len__`**：如果定义了，长度为 0 则为 `False`，否则为 `True`
> 3. **默认**：所有对象都是 `True`
>
> 这就是为什么空列表 `[]` 是假值——因为 `list.__len__()` 返回 0。

```python
class TaskQueue:
    \\"\\"\\"任务队列——演示 __bool__ 和 __len__。\\"\\"\\"

    def __init__(self) -> None:
        self._tasks: list[str] = []
        print("[TaskQueue] 创建空队列")

    def add(self, task: str) -> None:
        self._tasks.append(task)
        print(f"[TaskQueue] 添加任务: {task}")

    def pop(self) -> str:
        task: str = self._tasks.pop(0)
        print(f"[TaskQueue] 取出任务: {task}")
        return task

    def __len__(self) -> int:
        return len(self._tasks)

    def __bool__(self) -> bool:
        return len(self._tasks) > 0

    def __repr__(self) -> str:
        return f"TaskQueue(tasks={self._tasks})"


queue = TaskQueue()
print(f"len={len(queue)}, bool={bool(queue)}")

if not queue:
    print("队列为空，等待任务...")

queue.add("发送邮件")
queue.add("生成报告")

while queue:
    queue.pop()
print(f"所有任务完成！剩余: {len(queue)}")
```

---

## 4. `__getitem__`：容器协议

> 🎭 **The Drama: 让自定义对象像列表一样操作**
>
> 当你写 `my_list[0]` 时，Python 调用 `my_list.__getitem__(0)`。
> 当你写 `my_list[1:3]` 时，Python 调用 `my_list.__getitem__(slice(1, 3))`。
> 实现 `__getitem__`，你的对象就获得了索引和切片的"超能力"。

```python
from typing import Union


class Playlist:
    \\"\\"\\"播放列表——演示 __getitem__ 支持索引和切片。\\"\\"\\"

    def __init__(self, name: str, songs: list[str]) -> None:
        self.name: str = name
        self._songs: list[str] = list(songs)
        print(f"[Playlist] 创建 '{name}'，共 {len(songs)} 首歌")

    def __getitem__(self, index: Union[int, slice]) -> Union[str, list[str]]:
        result = self._songs[index]
        print(f"[Playlist] 访问 [{index}]: {result}")
        return result

    def __setitem__(self, index: int, value: str) -> None:
        print(f"[Playlist] 修改 [{index}]: {self._songs[index]} -> {value}")
        self._songs[index] = value

    def __delitem__(self, index: int) -> None:
        print(f"[Playlist] 删除 [{index}]: {self._songs[index]}")
        del self._songs[index]

    def __len__(self) -> int:
        return len(self._songs)

    def __contains__(self, item: str) -> bool:
        return item in self._songs

    def __repr__(self) -> str:
        return f"Playlist({self.name!r}, songs={self._songs})"


playlist = Playlist("我的最爱", [
    "Yesterday", "Imagine", "Bohemian Rhapsody", "Hotel California"
])
print(playlist[0])      # Yesterday
print(playlist[-1])     # Hotel California
print(playlist[1:3])    # 切片
playlist[0] = "Let It Be"
```

```python
class NumberRange:
    \\"\\"\\"数字范围——只实现 __getitem__ 就能迭代。\\"\\"\\"

    def __init__(self, start: int, end: int) -> None:
        self.start: int = start
        self.end: int = end

    def __getitem__(self, index: int) -> int:
        if index >= (self.end - self.start):
            raise IndexError(f"索引越界: {index}")
        return self.start + index

    def __len__(self) -> int:
        return self.end - self.start


r = NumberRange(10, 15)
for num in r:
    print(num, end=" ")  # 10 11 12 13 14
print()
```

---

## 5. `__call__`：可调用对象

> 🧘 **Zen of Code: 对象与函数的边界**
>
> 在 Python 中，函数是对象，对象也可以是函数。
> `__call__` 模糊了二者的界限——实现了 `__call__` 的对象可以像函数一样被调用。
> 这是策略模式、类装饰器和有状态回调的基础。

```python
class Validator:
    \\"\\"\\"字段验证器——演示 __call__ 的实用场景。\\"\\"\\"

    def __init__(self, min_length: int = 0, max_length: int = 100,
                 pattern: str = "") -> None:
        self.min_length: int = min_length
        self.max_length: int = max_length
        self.pattern: str = pattern

    def __call__(self, value: str) -> bool:
        if len(value) < self.min_length:
            print(f"[Validator] 太短: {len(value)} < {self.min_length}")
            return False
        if len(value) > self.max_length:
            print(f"[Validator] 太长: {len(value)} > {self.max_length}")
            return False
        if self.pattern:
            import re
            if not re.match(self.pattern, value):
                print(f"[Validator] 不匹配模式")
                return False
        print(f"[Validator] 验证通过: {value!r}")
        return True

    def __repr__(self) -> str:
        return f"Validator(min={self.min_length}, max={self.max_length})"


username_validator = Validator(min_length=3, max_length=20)
username_validator("alice_123")  # 验证通过
username_validator("ab")         # 太短
print(f"callable: {callable(username_validator)}")  # True
```

```python
class CallCounter:
    \\"\\"\\"调用计数器——每次调用自增。\\"\\"\\"

    def __init__(self, start: int = 0) -> None:
        self.count: int = start

    def __call__(self) -> int:
        self.count += 1
        print(f"[CallCounter] 计数: {self.count}")
        return self.count

counter = CallCounter()
counter()  # 1
counter()  # 2
counter()  # 3
```

---

## 6. `__format__`：自定义格式化

> 🧰 **Toolbox: 让 f-string 理解你的对象**
>
> 当你写 `f"{obj:format_spec}"` 时，Python 调用 `obj.__format__(format_spec)`。
> 通过实现 `__format__`，你可以让对象支持自定义的格式化语法。

```python
class Temperature:
    \\"\\"\\"温度——支持自定义格式化。

    格式化语法：'c'=摄氏度, 'f'=华氏度, 'k'=开尔文
    \\"\\"\\"

    def __init__(self, celsius: float) -> None:
        self._celsius: float = celsius

    def __format__(self, format_spec: str) -> str:
        if format_spec.lower() == "f":
            value: float = self._celsius * 9 / 5 + 32
            return f"{value:.1f}F"
        elif format_spec.lower() == "k":
            value = self._celsius + 273.15
            return f"{value:.1f}K"
        else:
            return f"{self._celsius:.1f}C"

    def __repr__(self) -> str:
        return f"Temperature({self._celsius})"


temp = Temperature(100)
print(f"摄氏: {temp:c}")     # 100.0C
print(f"华氏: {temp:f}")     # 212.0F
print(f"开尔文: {temp:k}")   # 373.1K
```

| 魔术方法 | 触发语法 | 用途 |
|----------|---------|------|
| `__repr__` | `repr(obj)`, `f"{obj!r}"` | 开发者调试 |
| `__str__` | `str(obj)`, `print(obj)`, `f"{obj}"` | 用户展示 |
| `__format__` | `f"{obj:spec}"`, `format(obj, spec)` | 自定义格式化 |

---

## 最佳实践

1. **永远先实现 `__repr__`**：它是最基础的字符串表示，调试时必不可少
2. **`__eq__` 必须检查类型**：参数是 `object`，先 `isinstance`，不匹配返回 `NotImplemented`
3. **定义了 `__eq__` 就要考虑 `__hash__`**：如果对象需要放入 `set` 或作为 `dict` 键
4. **用 `@dataclass` 减少样板**：它自动生成 `__init__`、`__repr__`、`__eq__`
5. **用 `@functools.total_ordering`**：只需 `__eq__` + `__lt__`，自动补全所有比较
6. **`__getitem__` 要处理 `slice`**：如果支持索引，也应该支持切片

---

## 常见陷阱

### 陷阱 1：`__eq__` 忘记返回 `NotImplemented`

```python
# ❌ 错误：直接返回 False
class Bad:
    def __init__(self, value: int) -> None:
        self.value = value
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Bad):
            return False  # ❌ 应该返回 NotImplemented
        return self.value == other.value


# ✅ 正确：返回 NotImplemented
class Good:
    def __init__(self, value: int) -> None:
        self.value = value
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Good):
            return NotImplemented  # ✅
        return self.value == other.value
```

### 陷阱 2：可变对象实现 `__hash__`

```python
# ❌ 危险：可变对象 + __hash__
class MutableBad:
    def __init__(self, value: int) -> None:
        self.value = value
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, MutableBad):
            return NotImplemented
        return self.value == other.value
    def __hash__(self) -> int:
        return hash(self.value)

obj = MutableBad(1)
s = {obj}
obj.value = 2  # 修改后哈希值改变
print(obj in s)  # False — 对象"消失"了！

# ✅ 解决方案：使用 frozen dataclass 或确保哈希字段不可变
```

### 陷阱 3：`__repr__` 中的无限递归

```python
# ❌ 对象相互引用时 __repr__ 会无限递归
class Node:
    def __init__(self, value: int) -> None:
        self.value = value
        self.children: list[Node] = []
    def __repr__(self) -> str:
        return f"Node({self.value}, children={self.children})"

# ✅ 安全做法：只显示关键信息
class SafeNode:
    def __init__(self, value: int) -> None:
        self.value = value
        self.children: list[SafeNode] = []
    def __repr__(self) -> str:
        return f"SafeNode({self.value}, children_count={len(self.children)})"
```

---

## 练习题

### 练习 1：实现一个 Matrix 类

创建 `Matrix` 类，支持 `__repr__`、`__str__`、`__eq__`、`__getitem__`（`matrix[row, col]`）。

<details>
<summary>💡 参考答案</summary>

```python
class Matrix:
    def __init__(self, rows: list[list[float]]) -> None:
        self._rows = [list(row) for row in rows]
        self.n_rows = len(rows)
        self.n_cols = len(rows[0]) if rows else 0

    def __getitem__(self, index: tuple[int, int]) -> float:
        row, col = index
        return self._rows[row][col]

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Matrix):
            return NotImplemented
        return self._rows == other._rows

    def __repr__(self) -> str:
        return f"Matrix({self._rows})"

    def __str__(self) -> str:
        lines = [" ".join(f"{v:6.1f}" for v in row) for row in self._rows]
        return "\\n".join(lines)

m = Matrix([[1, 2], [3, 4]])
print(m[0, 1])  # 2
```
</details>

### 练习 2：可排序的学生

创建 `Student` 类，用 `@functools.total_ordering` 按 GPA 排序。

<details>
<summary>💡 参考答案</summary>

```python
import functools
from dataclasses import dataclass

@functools.total_ordering
@dataclass
class Student:
    name: str
    gpa: float

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return self.gpa == other.gpa

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return self.gpa < other.gpa

    def __hash__(self) -> int:
        return hash((self.name, self.gpa))

students = [Student("Alice", 3.8), Student("Bob", 3.5), Student("Carol", 3.9)]
print(sorted(students))
```
</details>

### 练习 3：可调用的缓存对象

创建 `Cache` 类，实现 `__call__` 获取/设置、`__contains__`、`__len__`。

<details>
<summary>💡 参考答案</summary>

```python
from typing import Any, Optional

class Cache:
    def __init__(self) -> None:
        self._store: dict[str, Any] = {}

    def __call__(self, key: str, value: Any = None) -> Optional[Any]:
        if value is not None:
            self._store[key] = value
            return value
        return self._store.get(key)

    def __contains__(self, key: str) -> bool:
        return key in self._store

    def __len__(self) -> int:
        return len(self._store)

cache = Cache()
cache("name", "Alice")
print(cache("name"))     # Alice
print("name" in cache)   # True
```
</details>

---

## 参考资源

- [Python 数据模型](https://docs.python.org/3/reference/datamodel.html)
- [Fluent Python, 2nd Ed. - Ch.1: The Python Data Model](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [Real Python - repr vs str](https://realpython.com/python-repr-vs-str/)
- [functools.total_ordering](https://docs.python.org/3/library/functools.html#functools.total_ordering)

---

## 下一步

你已经学会了让自定义对象与 Python 内置语法对话。魔术方法是 Python 数据模型的核心——在 Stage 3 中你会学到更高级的魔术方法（描述符、`__getattr__`、元类等）。

接下来，让我们探索 Python 最优雅的特性之一：**迭代器与生成器**。

**[👉 第 3 章：迭代器与生成器](../03-iterators-generators/)**

---

[⬅️ 第 1 章：面向对象编程](../01-oop-fundamentals/) | [📖 返回 Stage 2 目录](../README.md) | [👉 第 3 章：迭代器与生成器](../03-iterators-generators/)
"""
    write_file("02-dunder-methods/README.md", content)


def write_example_01() -> None:
    content = '''\
"""
第 2 章 示例 01：__repr__ vs __str__
====================================

演示：
- __repr__ 和 __str__ 的区别
- 不同场景下的调用时机
- 实现准则和最佳实践
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


# ============================================================
# 1. __repr__ vs __str__ 基础
# ============================================================

@dataclass
class Money:
    """货币 — 演示 __repr__ 和 __str__ 的实现。"""

    amount: float
    currency: str = "CNY"

    def __repr__(self) -> str:
        """给开发者看：精确、可用于重建对象。"""
        return f"Money(amount={self.amount}, currency={self.currency!r})"

    def __str__(self) -> str:
        """给用户看：友好、可读。"""
        symbols: dict[str, str] = {"CNY": "\\u00a5", "USD": "$", "EUR": "\\u20ac"}
        symbol: str = symbols.get(self.currency, self.currency)
        return f"{symbol}{self.amount:,.2f}"


# ============================================================
# 2. 只实现 __repr__ 的类
# ============================================================

class Coordinate:
    """坐标 — 只实现 __repr__，__str__ 自动回退。"""

    def __init__(self, lat: float, lon: float) -> None:
        self.lat: float = lat
        self.lon: float = lon

    def __repr__(self) -> str:
        return f"Coordinate(lat={self.lat}, lon={self.lon})"


# ============================================================
# 3. 容器中的表现
# ============================================================

@dataclass
class Product:
    """产品 — 演示容器中 __repr__ 的使用。"""

    name: str
    price: float

    def __repr__(self) -> str:
        return f"Product({self.name!r}, {self.price})"

    def __str__(self) -> str:
        return f"{self.name} (\\u00a5{self.price:.2f})"


# ============================================================
# 主程序
# ============================================================

def main() -> None:
    """运行所有示例。"""
    logger.info("=" * 60)
    logger.info("示例 1：__repr__ vs __str__")
    logger.info("=" * 60)

    price = Money(1234.5, "CNY")
    logger.info(f"[Demo] repr(price) = {repr(price)}")
    logger.info(f"[Demo] str(price)  = {str(price)}")
    logger.info(f"[Demo] f-string    = {price}")
    logger.info(f"[Demo] f-string !r = {price!r}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 2：__str__ 回退到 __repr__")
    logger.info("=" * 60)

    coord = Coordinate(39.9, 116.4)
    logger.info(f"[Demo] repr = {repr(coord)}")
    logger.info(f"[Demo] str  = {str(coord)}")
    print(coord)

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 3：容器中使用 __repr__")
    logger.info("=" * 60)

    products: list[Product] = [
        Product("Python Book", 49.99),
        Product("Keyboard", 299.00),
    ]
    logger.info(f"[Demo] 列表: {products}")
    for p in products:
        logger.info(f"[Demo] 单个: {p}")


if __name__ == "__main__":
    main()
'''
    write_file("02-dunder-methods/examples/01-repr-str.py", content)


def write_example_02() -> None:
    content = '''\
"""
第 2 章 示例 02：__eq__、__hash__ 与比较方法
============================================

演示：
- __eq__ 的正确实现
- __hash__ 与可哈希契约
- @functools.total_ordering
"""

from __future__ import annotations

import functools
import logging
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


# ============================================================
# 1. __eq__ 和 __hash__
# ============================================================

class City:
    """城市 — 演示 __eq__ 和 __hash__。"""

    def __init__(self, name: str, country: str) -> None:
        self.name: str = name
        self.country: str = country
        logger.info(f"[City] 创建: {name}, {country}")

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, City):
            return NotImplemented
        return self.name == other.name and self.country == other.country

    def __hash__(self) -> int:
        return hash((self.name, self.country))

    def __repr__(self) -> str:
        return f"City({self.name!r}, {self.country!r})"


# ============================================================
# 2. frozen dataclass
# ============================================================

@dataclass(frozen=True)
class Point:
    """不可变点 — 自动 __eq__ 和 __hash__。"""
    x: float
    y: float


# ============================================================
# 3. @functools.total_ordering
# ============================================================

@functools.total_ordering
class Version:
    """语义化版本号。"""

    def __init__(self, major: int, minor: int, patch: int) -> None:
        self.major = major
        self.minor = minor
        self.patch = patch

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) == (
            other.major, other.minor, other.patch
        )

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) < (
            other.major, other.minor, other.patch
        )

    def __hash__(self) -> int:
        return hash((self.major, self.minor, self.patch))

    def __repr__(self) -> str:
        return f"v{self.major}.{self.minor}.{self.patch}"


# ============================================================
# 主程序
# ============================================================

def main() -> None:
    logger.info("=" * 60)
    logger.info("示例 1：__eq__ 和 __hash__")
    logger.info("=" * 60)

    beijing = City("Beijing", "China")
    beijing2 = City("Beijing", "China")
    tokyo = City("Tokyo", "Japan")

    logger.info(f"[Demo] beijing == beijing2: {beijing == beijing2}")
    logger.info(f"[Demo] beijing is beijing2: {beijing is beijing2}")

    cities: set[City] = {beijing, tokyo, beijing2}
    logger.info(f"[Demo] 集合大小: {len(cities)}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 2：frozen dataclass")
    logger.info("=" * 60)

    point_set: set[Point] = {Point(1, 2), Point(3, 4), Point(1, 2)}
    logger.info(f"[Demo] 集合大小: {len(point_set)}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 3：total_ordering")
    logger.info("=" * 60)

    versions = [Version(2, 0, 0), Version(1, 5, 3), Version(1, 0, 1)]
    logger.info(f"[Demo] 排序前: {versions}")
    logger.info(f"[Demo] 排序后: {sorted(versions)}")


if __name__ == "__main__":
    main()
'''
    write_file("02-dunder-methods/examples/02-eq-hash.py", content)


def write_example_03() -> None:
    content = '''\
"""
第 2 章 示例 03：容器协议 — __len__、__getitem__、__contains__
==============================================================

演示：
- __len__ 和 __bool__ 的关系
- __getitem__ 支持索引和切片
- __contains__ 支持 in 运算符
- 只有 __getitem__ 就能迭代
"""

from __future__ import annotations

import logging
from typing import Union

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


# ============================================================
# 1. TaskQueue — __bool__ 和 __len__
# ============================================================

class TaskQueue:
    """任务队列 — 演示 __bool__ 和 __len__。"""

    def __init__(self) -> None:
        self._tasks: list[str] = []
        logger.info("[TaskQueue] 创建空队列")

    def add(self, task: str) -> None:
        self._tasks.append(task)
        logger.info(f"[TaskQueue] 添加任务: {task}")

    def pop(self) -> str:
        task: str = self._tasks.pop(0)
        logger.info(f"[TaskQueue] 取出任务: {task}")
        return task

    def __len__(self) -> int:
        return len(self._tasks)

    def __bool__(self) -> bool:
        return len(self._tasks) > 0

    def __repr__(self) -> str:
        return f"TaskQueue(tasks={self._tasks})"


# ============================================================
# 2. Playlist — __getitem__ 支持索引和切片
# ============================================================

class Playlist:
    """播放列表 — 完整的容器协议。"""

    def __init__(self, name: str, songs: list[str]) -> None:
        self.name: str = name
        self._songs: list[str] = list(songs)
        logger.info(f"[Playlist] 创建 '{name}'，共 {len(songs)} 首歌")

    def __getitem__(self, index: Union[int, slice]) -> Union[str, list[str]]:
        result = self._songs[index]
        logger.info(f"[Playlist] 访问 [{index}]: {result}")
        return result

    def __setitem__(self, index: int, value: str) -> None:
        logger.info(f"[Playlist] 修改 [{index}]: {self._songs[index]} -> {value}")
        self._songs[index] = value

    def __len__(self) -> int:
        return len(self._songs)

    def __contains__(self, item: str) -> bool:
        found = item in self._songs
        logger.info(f"[Playlist] '{item}' in playlist: {found}")
        return found

    def __repr__(self) -> str:
        return f"Playlist({self.name!r}, songs={self._songs})"


# ============================================================
# 3. NumberRange — 只有 __getitem__ 就能迭代
# ============================================================

class NumberRange:
    """数字范围 — 只有 __getitem__。"""

    def __init__(self, start: int, end: int) -> None:
        self.start: int = start
        self.end: int = end

    def __getitem__(self, index: int) -> int:
        if index >= (self.end - self.start):
            raise IndexError(f"索引越界: {index}")
        return self.start + index

    def __len__(self) -> int:
        return self.end - self.start

    def __repr__(self) -> str:
        return f"NumberRange({self.start}, {self.end})"


# ============================================================
# 主程序
# ============================================================

def main() -> None:
    logger.info("=" * 60)
    logger.info("示例 1：TaskQueue — __bool__ / __len__")
    logger.info("=" * 60)

    queue = TaskQueue()
    logger.info(f"[Demo] len={len(queue)}, bool={bool(queue)}")

    queue.add("发送邮件")
    queue.add("生成报告")
    logger.info(f"[Demo] len={len(queue)}, bool={bool(queue)}")

    while queue:
        queue.pop()

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 2：Playlist — __getitem__")
    logger.info("=" * 60)

    pl = Playlist("我的最爱", ["Yesterday", "Imagine", "Bohemian Rhapsody"])
    pl[0]
    pl[1:3]
    "Imagine" in pl

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 3：NumberRange — 自动迭代")
    logger.info("=" * 60)

    r = NumberRange(10, 15)
    for num in r:
        logger.info(f"[Demo] {num}")
    logger.info(f"[Demo] 12 in r: {12 in r}")


if __name__ == "__main__":
    main()
'''
    write_file("02-dunder-methods/examples/03-container-protocol.py", content)


def write_example_04() -> None:
    content = '''\
"""
第 2 章 示例 04：__call__、__format__ — 可调用对象与自定义格式化
===============================================================

演示：
- __call__ 让对象像函数一样调用
- __format__ 自定义 f-string 格式化
- 实用场景：验证器、计数器、温度格式化
"""

from __future__ import annotations

import logging
import re

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


# ============================================================
# 1. __call__ — 验证器
# ============================================================

class Validator:
    """字段验证器 — 像函数一样调用。"""

    def __init__(self, min_length: int = 0, max_length: int = 100,
                 pattern: str = "") -> None:
        self.min_length: int = min_length
        self.max_length: int = max_length
        self.pattern: str = pattern
        logger.info(f"[Validator] 创建: min={min_length}, max={max_length}")

    def __call__(self, value: str) -> bool:
        if len(value) < self.min_length:
            logger.info(f"[Validator] 太短: {len(value)} < {self.min_length}")
            return False
        if len(value) > self.max_length:
            logger.info(f"[Validator] 太长: {len(value)} > {self.max_length}")
            return False
        if self.pattern and not re.match(self.pattern, value):
            logger.info(f"[Validator] 不匹配模式: {self.pattern}")
            return False
        logger.info(f"[Validator] 验证通过: {value!r}")
        return True

    def __repr__(self) -> str:
        return f"Validator(min={self.min_length}, max={self.max_length})"


# ============================================================
# 2. __call__ — 计数器
# ============================================================

class CallCounter:
    """调用计数器 — 每次调用自增。"""

    def __init__(self, start: int = 0) -> None:
        self.count: int = start

    def __call__(self) -> int:
        self.count += 1
        logger.info(f"[CallCounter] 计数: {self.count}")
        return self.count

    def __repr__(self) -> str:
        return f"CallCounter(count={self.count})"


# ============================================================
# 3. __format__ — 温度格式化
# ============================================================

class Temperature:
    """温度 — 支持自定义格式化 (c/f/k)。"""

    def __init__(self, celsius: float) -> None:
        self._celsius: float = celsius

    def __format__(self, format_spec: str) -> str:
        if format_spec.lower() == "f":
            value: float = self._celsius * 9 / 5 + 32
            return f"{value:.1f}F"
        elif format_spec.lower() == "k":
            value = self._celsius + 273.15
            return f"{value:.1f}K"
        else:
            return f"{self._celsius:.1f}C"

    def __repr__(self) -> str:
        return f"Temperature({self._celsius})"


# ============================================================
# 主程序
# ============================================================

def main() -> None:
    logger.info("=" * 60)
    logger.info("示例 1：__call__ — 验证器")
    logger.info("=" * 60)

    validator = Validator(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    validator("alice_123")
    validator("ab")
    validator("hello world!")
    logger.info(f"[Demo] callable: {callable(validator)}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 2：__call__ — 计数器")
    logger.info("=" * 60)

    counter = CallCounter()
    counter()
    counter()
    counter()

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 3：__format__ — 温度")
    logger.info("=" * 60)

    temp = Temperature(100)
    logger.info(f"[Demo] 摄氏: {temp:c}")
    logger.info(f"[Demo] 华氏: {temp:f}")
    logger.info(f"[Demo] 开尔文: {temp:k}")


if __name__ == "__main__":
    main()
'''
    write_file("02-dunder-methods/examples/04-callable-objects.py", content)


if __name__ == "__main__":
    main()
