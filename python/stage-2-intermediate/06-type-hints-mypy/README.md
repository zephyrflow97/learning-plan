# 第 6 章：类型标注与 mypy — 给动态语言穿上铠甲

> *"Dynamic typing is great for quick scripts. Static typing is great for large codebases. Gradual typing gives you both."*
> — Guido van Rossum
>
> Python 是动态语言，但这不意味着你必须在黑暗中摸索。
> 类型标注就像在黑暗隧道里打开头灯——你仍然可以自由行走，但不会撞墙。

## 📖 本章内容

- [1. 为什么需要类型标注](#1-为什么需要类型标注)
- [2. 基础类型标注](#2-基础类型标注)
  - [2.1 简单类型](#21-简单类型)
  - [2.2 容器类型](#22-容器类型)
  - [2.3 Optional 与 Union](#23-optional-与-union)
- [3. 泛型（Generic, TypeVar）](#3-泛型generictypevar)
  - [3.1 TypeVar 基础](#31-typevar-基础)
  - [3.2 受约束的 TypeVar](#32-受约束的-typevar)
  - [3.3 Generic 类](#33-generic-类)
- [4. Protocol：结构化子类型](#4-protocol结构化子类型)
  - [4.1 鸭子类型的困境](#41-鸭子类型的困境)
  - [4.2 Protocol 的解决方案](#42-protocol-的解决方案)
  - [4.3 Protocol vs ABC](#43-protocol-vs-abc)
- [5. TypedDict, Literal, Final](#5-typeddict-literal-final)
  - [5.1 TypedDict：精确的字典类型](#51-typeddict精确的字典类型)
  - [5.2 Literal：字面量类型](#52-literal字面量类型)
  - [5.3 Final：不可变绑定](#53-final不可变绑定)
- [6. mypy 配置与使用](#6-mypy-配置与使用)
  - [6.1 安装与基本用法](#61-安装与基本用法)
  - [6.2 mypy.ini 配置详解](#62-mypyini-配置详解)
  - [6.3 常见错误与修复](#63-常见错误与修复)
- [7. 渐进式类型化策略](#7-渐进式类型化策略)
  - [7.1 从零开始的路线图](#71-从零开始的路线图)
  - [7.2 处理第三方库](#72-处理第三方库)
  - [7.3 Annotated 与运行时验证](#73-annotated-与运行时验证)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [导航](#导航)

---

## 1. 为什么需要类型标注

> 🎭 **The Drama：一个 None 引发的血案**
>
> 周五下午 5 点，你部署了一个新功能。代码在本地运行完美。
> 周六凌晨 3 点，报警响了——生产环境崩溃。
>
> ```python
> # 💀 这段代码有一个隐藏炸弹
> def get_user_name(user_id):
>     user = db.find(user_id)    # 可能返回 None！
>     return user.name           # 💥 AttributeError: 'NoneType' has no attribute 'name'
> ```
>
> 如果有类型标注 + mypy：
>
> ```python
> def get_user_name(user_id: int) -> str:
>     user: Optional[User] = db.find(user_id)
>     return user.name  # ❌ mypy error: Item "None" of "Optional[User]" has no attribute "name"
> ```
>
> mypy 在你**写代码时**就会告诉你这个 bug。不需要等到凌晨 3 点。

### 动态类型 vs 静态类型 vs 渐进式类型

| 特性 | 动态类型 (Python) | 静态类型 (Java) | 渐进式类型 (Python + mypy) |
|------|-------------------|-----------------|---------------------------|
| 类型检查时机 | 运行时 | 编译时 | 开发时（可选） |
| 灵活性 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 安全性 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 代码冗余 | 低 | 高 | 中 |
| 重构信心 | 低 | 高 | 高 |
| 适合场景 | 小脚本、探索 | 大型系统 | 从脚本到系统的全过程 |

> 🌌 **The Big Picture：Python 的类型系统 — 从放任到自律的演化**
>
> - **2014 (PEP 484)**：Python 3.5 引入类型标注。但只是"注释"，运行时完全忽略。
> - **2017 (PEP 544)**：引入 `Protocol`，让鸭子类型也能被静态检查。
> - **2020 (PEP 612)**：`ParamSpec`，让装饰器的类型标注终于可用。
> - **2022 (PEP 695)**：Python 3.12 引入 `type` 语句和新的泛型语法 `def f[T](x: T) -> T`。
> - **2024+**：类型标注已成为所有严肃 Python 项目的标配。
>
> Python 的类型系统是**渐进式 (Gradual)** 的——你可以一点一点地加类型，不需要一步到位。

---

## 2. 基础类型标注

### 2.1 简单类型

```python
# ✅ 正确：清晰的类型标注
def greet(name: str, times: int = 1) -> str:
    """向某人问候指定次数。"""
    result: str = f"Hello, {name}! " * times
    print(f"[greet] 生成问候语: {result.strip()}")
    return result.strip()

age: int = 25
height: float = 1.75
is_student: bool = True
name: str = "Alice"

# ❌ 错误：类型标注与实际值不匹配（mypy 会报错）
# age: int = "twenty-five"   # error: Incompatible types in assignment
# height: float = "tall"     # error: Incompatible types in assignment
```

### 2.2 容器类型

```python
from typing import Any

# Python 3.9+ 可以直接使用内置类型
names: list[str] = ["Alice", "Bob", "Charlie"]
scores: dict[str, int] = {"Alice": 95, "Bob": 87}
coordinates: tuple[float, float] = (3.14, 2.71)
unique_ids: set[int] = {1, 2, 3}

# 嵌套容器
matrix: list[list[int]] = [[1, 2], [3, 4]]
config: dict[str, dict[str, Any]] = {
    "database": {"host": "localhost", "port": 5432},
    "cache": {"ttl": 300, "backend": "redis"},
}

print(f"[容器类型] names={names}, scores={scores}")
print(f"[容器类型] matrix={matrix}")
print(f"[容器类型] config keys={list(config.keys())}")
```

> **Python 3.9 之前 vs 之后的对比**
>
> | Python < 3.9 | Python >= 3.9 |
> |--------------|---------------|
> | `List[str]` | `list[str]` |
> | `Dict[str, int]` | `dict[str, int]` |
> | `Tuple[int, ...]` | `tuple[int, ...]` |
> | `Set[float]` | `set[float]` |
> | `FrozenSet[str]` | `frozenset[str]` |
> | 需要 `from typing import ...` | 直接使用内置类型 |

### 2.3 Optional 与 Union

```python
from typing import Optional, Union

# ✅ Optional[X] 等价于 Union[X, None] 等价于 X | None (3.10+)
def find_user(user_id: int) -> Optional[str]:
    """查找用户名。找不到返回 None。"""
    users: dict[int, str] = {1: "Alice", 2: "Bob"}
    result: Optional[str] = users.get(user_id)
    print(f"[find_user] user_id={user_id}, result={result}")
    return result

# ✅ Union：多种可能的类型
def parse_value(raw: str) -> Union[int, float, str]:
    """尝试将字符串解析为数字。"""
    try:
        result: Union[int, float, str] = int(raw)
        print(f"[parse_value] '{raw}' -> int({result})")
        return result
    except ValueError:
        try:
            result = float(raw)
            print(f"[parse_value] '{raw}' -> float({result})")
            return result
        except ValueError:
            print(f"[parse_value] '{raw}' -> str (无法解析)")
            return raw

# Python 3.10+ 语法糖
# def find_user(user_id: int) -> str | None: ...
# def parse_value(raw: str) -> int | float | str: ...

# ❌ 错误：忘记处理 None 的情况
def bad_example(user_id: int) -> str:
    name: Optional[str] = find_user(user_id)
    # return name.upper()   # ❌ mypy: Item "None" of "Optional[str]" has no attribute "upper"
    if name is None:
        return "Unknown"
    return name.upper()      # ✅ mypy 通过：此时 name 已被收窄为 str
```

**类型收窄 (Type Narrowing)** 是 mypy 的杀手级特性——它能理解 `if`/`isinstance`/`is None` 等检查的语义：

```
    ┌──────────────────────────────────┐
    │  name: Optional[str]             │
    │  类型 = str | None               │
    └──────────────┬───────────────────┘
                   │
          ┌────────▼────────┐
          │  if name is None │
          └────────┬────────┘
           ┌───────┴───────┐
           ▼               ▼
    ┌──────────┐   ┌──────────────┐
    │ name: None│   │ name: str    │
    │ (处理 None)│  │ (安全使用)    │
    └──────────┘   └──────────────┘
```

---

## 3. 泛型（Generic, TypeVar）

> 🧠 **CS Master's Bridge：参数化多态**
>
> 泛型在计算机科学中叫做**参数化多态 (Parametric Polymorphism)**。
> 思想很简单：写一个函数/类，让它能处理**任意类型**，同时保持类型安全。
>
> - C++ 叫 `template<typename T>`
> - Java 叫 `<T>`
> - Haskell 叫类型变量 `a`
> - Python 叫 `TypeVar`（3.12+ 可以直接用 `[T]` 语法）
>
> 本质是同一件事：**不丢失类型信息的抽象**。

### 3.1 TypeVar 基础

```python
from typing import TypeVar, Sequence

T = TypeVar("T")

# ✅ 泛型函数：输入什么类型，输出就是什么类型
def first(items: Sequence[T]) -> T:
    """返回序列的第一个元素。"""
    print(f"[first] 序列长度={len(items)}, 第一个元素={items[0]}")
    return items[0]

# mypy 能推断出返回类型
name: str = first(["Alice", "Bob"])          # T = str -> 返回 str
number: int = first([1, 2, 3])               # T = int -> 返回 int
# wrong: int = first(["Alice", "Bob"])       # ❌ mypy error: 返回类型是 str 不是 int

# ❌ 没有泛型的情况 — 丢失了类型信息
def first_bad(items: Sequence[object]) -> object:
    return items[0]

result = first_bad(["Alice", "Bob"])
# result 的类型是 object，不是 str！
# result.upper()  # ❌ mypy error: "object" has no attribute "upper"
```

### 3.2 受约束的 TypeVar

```python
from typing import TypeVar

# 约束 T 只能是 int 或 float
Number = TypeVar("Number", int, float)

def add(a: Number, b: Number) -> Number:
    """两数相加。T 被约束为 int 或 float。"""
    result = a + b
    print(f"[add] {a} + {b} = {result}")
    return result

add(1, 2)       # ✅ T = int
add(1.5, 2.5)   # ✅ T = float
# add("a", "b") # ❌ mypy error: Value of type variable "Number" cannot be "str"

# TypeVar 带上界 (bound)
from typing import Sized

ST = TypeVar("ST", bound=Sized)

def check_length(item: ST) -> ST:
    """检查有长度的对象。"""
    print(f"[check_length] 长度={len(item)}")
    return item

check_length([1, 2, 3])    # ✅ list 实现了 __len__
check_length("hello")       # ✅ str 实现了 __len__
# check_length(42)          # ❌ int 没有 __len__
```

### 3.3 Generic 类

```python
from typing import TypeVar, Generic, Iterator
import logging

T = TypeVar("T")

class Stack(Generic[T]):
    """类型安全的栈。

    用法:
        stack: Stack[int] = Stack()
        stack.push(42)
        value: int = stack.pop()
    """

    def __init__(self) -> None:
        self._items: list[T] = []
        print(f"[Stack] 创建空栈")

    def push(self, item: T) -> None:
        """入栈。"""
        self._items.append(item)
        print(f"[Stack] push({item}), 栈大小={len(self._items)}")

    def pop(self) -> T:
        """出栈。"""
        if not self._items:
            raise IndexError("Stack is empty")
        item: T = self._items.pop()
        print(f"[Stack] pop() -> {item}, 栈大小={len(self._items)}")
        return item

    def peek(self) -> T:
        """查看栈顶。"""
        if not self._items:
            raise IndexError("Stack is empty")
        return self._items[-1]

    def __len__(self) -> int:
        return len(self._items)

    def __iter__(self) -> Iterator[T]:
        return iter(reversed(self._items))

    def __repr__(self) -> str:
        return f"Stack({self._items})"


# ✅ 类型安全的使用
int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
value: int = int_stack.pop()        # mypy 知道 value 是 int

str_stack: Stack[str] = Stack()
str_stack.push("hello")
word: str = str_stack.pop()         # mypy 知道 word 是 str

# ❌ 类型不匹配
# int_stack.push("oops")  # mypy error: Argument 1 to "push" of "Stack" has incompatible type "str"; expected "int"
```

**Python 3.12+ 新语法（PEP 695）：**

```python
# Python 3.12+ — 更简洁的泛型语法
# class Stack[T]:
#     def push(self, item: T) -> None: ...
#     def pop(self) -> T: ...
#
# def first[T](items: Sequence[T]) -> T: ...
```

---

## 4. Protocol：结构化子类型

### 4.1 鸭子类型的困境

```
    Python 的鸭子类型哲学:
    ┌──────────────────────────────────────────┐
    │ "If it walks like a duck and quacks      │
    │  like a duck, then it must be a duck."   │
    └──────────────────────────────────────────┘

    问题: mypy 怎么知道一个对象"会叫"？

    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  Duck    │  │ Person  │  │ Robot   │
    │ .quack()│  │ .quack()│  │ .quack()│
    └─────────┘  └─────────┘  └─────────┘
         │            │            │
         └────────────┼────────────┘
                      ▼
              都能 quack()，
              但没有共同基类！

    解决方案: Protocol — 不需要继承，只需要"形状匹配"
```

### 4.2 Protocol 的解决方案

```python
from typing import Protocol, runtime_checkable

# ✅ 定义一个 Protocol — 不是基类，是"形状描述"
@runtime_checkable
class Quackable(Protocol):
    """任何有 quack() 方法的对象。"""
    def quack(self) -> str: ...

class Duck:
    def quack(self) -> str:
        sound = "Quack!"
        print(f"[Duck] {sound}")
        return sound

class Person:
    def quack(self) -> str:
        sound = "I'm quacking like a duck!"
        print(f"[Person] {sound}")
        return sound

class Robot:
    def quack(self) -> str:
        sound = "QUACK.exe executed."
        print(f"[Robot] {sound}")
        return sound

class Cat:
    def meow(self) -> str:
        return "Meow!"

# ✅ 函数接受任何 Quackable
def make_it_quack(thing: Quackable) -> str:
    """让任何能叫的东西叫。"""
    result = thing.quack()
    print(f"[make_it_quack] 结果: {result}")
    return result

make_it_quack(Duck())     # ✅ Duck 有 quack()
make_it_quack(Person())   # ✅ Person 有 quack()
make_it_quack(Robot())    # ✅ Robot 有 quack()
# make_it_quack(Cat())    # ❌ mypy error: Cat 没有 quack()

# runtime_checkable 允许运行时 isinstance 检查
print(f"[Protocol] Duck is Quackable? {isinstance(Duck(), Quackable)}")      # True
print(f"[Protocol] Cat is Quackable? {isinstance(Cat(), Quackable)}")        # False
```

### 4.3 Protocol vs ABC

| 特性 | ABC (Abstract Base Class) | Protocol (结构化子类型) |
|------|--------------------------|------------------------|
| 继承要求 | 必须显式继承 | 不需要继承 |
| 检查方式 | 名义子类型 (Nominal) | 结构子类型 (Structural) |
| 第三方类兼容 | 需要 `register()` | 自动兼容 |
| 运行时检查 | `isinstance` 直接可用 | 需要 `@runtime_checkable` |
| 适用场景 | 自己控制的类层次 | 跨库/跨项目的接口 |
| Python 版本 | 2.6+ | 3.8+ |
| 哲学 | "你必须声明自己是鸭子" | "你看起来像鸭子就够了" |

```python
from abc import ABC, abstractmethod
from typing import Protocol

# ❌ ABC 方式：第三方类无法参与
class Drawable(ABC):
    @abstractmethod
    def draw(self) -> None: ...

# 第三方库的 Widget 类有 draw() 方法，但没有继承 Drawable
# 你无法把它传给接受 Drawable 的函数（除非 register）

# ✅ Protocol 方式：只要有 draw() 就行
class DrawableProto(Protocol):
    def draw(self) -> None: ...

# 第三方的 Widget 有 draw()？直接传入！
# 不需要修改第三方代码，不需要 register
```

---

## 5. TypedDict, Literal, Final

### 5.1 TypedDict：精确的字典类型

```python
from typing import TypedDict, Required, NotRequired

# ✅ TypedDict：为字典的每个键指定类型
class UserProfile(TypedDict):
    name: str
    age: int
    email: str
    bio: NotRequired[str]  # 可选字段 (Python 3.11+)

# ✅ 正确使用
user: UserProfile = {
    "name": "Alice",
    "age": 30,
    "email": "alice@example.com",
}
print(f"[TypedDict] user={user}")

# ❌ mypy 会捕获以下错误
# bad_user: UserProfile = {"name": "Bob"}  # 缺少 age 和 email
# bad_user2: UserProfile = {"name": "Bob", "age": "thirty", "email": "..."}  # age 类型错误

# TypedDict vs dict[str, Any]
# dict[str, Any]  -> 任何字符串键，任何值。完全没有约束。
# UserProfile     -> 精确的键和值类型。mypy 全程监控。
```

### 5.2 Literal：字面量类型

```python
from typing import Literal

# ✅ Literal：限制值为特定的字面量
def set_direction(direction: Literal["north", "south", "east", "west"]) -> None:
    """设置方向。只接受四个方向字符串。"""
    print(f"[set_direction] 方向设置为: {direction}")

set_direction("north")   # ✅
set_direction("south")   # ✅
# set_direction("up")    # ❌ mypy error: Argument 1 has incompatible type "str"; expected "Literal['north', 'south', 'east', 'west']"

# ✅ Literal 与重载结合
from typing import overload

@overload
def open_file(mode: Literal["r"]) -> str: ...
@overload
def open_file(mode: Literal["rb"]) -> bytes: ...

def open_file(mode: str) -> str | bytes:
    """根据模式返回不同类型。"""
    if mode == "r":
        print(f"[open_file] 文本模式")
        return "text content"
    else:
        print(f"[open_file] 二进制模式")
        return b"binary content"
```

### 5.3 Final：不可变绑定

```python
from typing import Final

# ✅ Final：声明常量
MAX_RETRIES: Final[int] = 3
API_BASE_URL: Final[str] = "https://api.example.com"
DEBUG: Final[bool] = False

print(f"[Final] MAX_RETRIES={MAX_RETRIES}, DEBUG={DEBUG}")

# ❌ mypy 会报错
# MAX_RETRIES = 5  # error: Cannot assign to final name "MAX_RETRIES"

# ✅ Final 类属性
class Config:
    VERSION: Final[str] = "1.0.0"
    MAX_CONNECTIONS: Final[int] = 100

    def __init__(self) -> None:
        print(f"[Config] version={self.VERSION}")

# ❌ Config.VERSION = "2.0.0"  # error: Cannot assign to final attribute "VERSION"
```

---

## 6. mypy 配置与使用

### 6.1 安装与基本用法

```bash
# 安装
pip install mypy

# 基本用法
mypy your_script.py
mypy your_package/

# 严格模式
mypy --strict your_script.py

# 生成报告
mypy --html-report report/ your_package/
```

### 6.2 mypy.ini 配置详解

```ini
[mypy]
# === 核心配置 ===
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True

# === 严格模式逐项 ===
check_untyped_defs = True
disallow_any_generics = True
disallow_incomplete_defs = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
strict_equality = True

# === 第三方库豁免 ===
[mypy-requests.*]
ignore_missing_imports = True

[mypy-pandas.*]
ignore_missing_imports = True

# === 特定模块更严格 ===
[mypy-myproject.core.*]
disallow_untyped_defs = True
disallow_any_explicit = True
```

**mypy 严格级别对比表：**

| 配置项 | 默认 | 推荐 | 严格 |
|--------|------|------|------|
| `check_untyped_defs` | False | True | True |
| `disallow_untyped_defs` | False | True | True |
| `disallow_any_generics` | False | False | True |
| `warn_return_any` | False | True | True |
| `no_implicit_optional` | False | True | True |
| `strict_equality` | False | True | True |

### 6.3 常见错误与修复

```python
from typing import Any, cast

# 错误 1: "has no attribute"
# 解决：类型收窄
def process(data: dict[str, Any]) -> None:
    value = data.get("count")
    # value.bit_length()  # ❌ "Optional[Any]" has no attribute "bit_length"
    if isinstance(value, int):
        print(f"[process] bit_length={value.bit_length()}")  # ✅ 收窄为 int

# 错误 2: "Incompatible return value type"
# 解决：确保所有返回路径类型一致
def safe_divide(a: float, b: float) -> float | None:
    if b == 0:
        print("[safe_divide] 除数为零")
        return None    # 返回 None，所以返回类型要包含 None
    result = a / b
    print(f"[safe_divide] {a}/{b}={result}")
    return result

# 错误 3: "Missing return statement"
# 解决：函数末尾不是所有路径都有 return

# 实在搞不定时的逃生舱：
# type: ignore  — 忽略单行
# cast(Type, value)  — 告诉 mypy "相信我"
# Any  — 终极逃生
# 但请谨慎使用！每一个 ignore 都是一颗定时炸弹
```

---

## 7. 渐进式类型化策略

> 🧰 **Toolbox：渐进式类型化的路线图**
>
> 不要试图一次性给整个项目加类型。这就像试图一天之内把所有房间都装修完——你会累死，而且质量堪忧。
>
> 正确的做法是**渐进式**的：
>
> ```
> Phase 1: 只给公共 API 加类型
>     ↓
> Phase 2: 给核心业务逻辑加类型
>     ↓
> Phase 3: 给内部工具函数加类型
>     ↓
> Phase 4: 开启 --strict 模式
>     ↓
> Phase 5: CI/CD 中强制 mypy 检查
> ```

### 7.1 从零开始的路线图

```python
# Phase 1: 只标注函数签名（最大收益，最小成本）
def calculate_total(items: list[dict[str, float]], tax_rate: float) -> float:
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    total = subtotal * (1 + tax_rate)
    print(f"[calculate_total] subtotal={subtotal}, tax={tax_rate}, total={total}")
    return total

# Phase 2: 用 TypedDict 替代 dict[str, float]
class LineItem(TypedDict):
    name: str
    price: float
    quantity: float

def calculate_total_v2(items: list[LineItem], tax_rate: float) -> float:
    subtotal: float = sum(item["price"] * item["quantity"] for item in items)
    total: float = subtotal * (1 + tax_rate)
    print(f"[calculate_total_v2] subtotal={subtotal}, total={total}")
    return total

# Phase 3: 引入更多类型
from dataclasses import dataclass
from decimal import Decimal

@dataclass
class LineItemV3:
    name: str
    price: Decimal
    quantity: int

    @property
    def subtotal(self) -> Decimal:
        return self.price * self.quantity

def calculate_total_v3(items: list[LineItemV3], tax_rate: Decimal) -> Decimal:
    subtotal: Decimal = sum((item.subtotal for item in items), Decimal("0"))
    total: Decimal = subtotal * (1 + tax_rate)
    print(f"[calculate_total_v3] subtotal={subtotal}, total={total}")
    return total
```

### 7.2 处理第三方库

```python
# 方式 1: 安装类型存根
# pip install types-requests types-PyYAML types-redis

# 方式 2: 在 mypy.ini 中忽略
# [mypy-some_untyped_lib.*]
# ignore_missing_imports = True

# 方式 3: 自己写存根文件 (.pyi)
# some_lib.pyi
# def some_function(x: int, y: str) -> bool: ...
```

### 7.3 Annotated 与运行时验证

```python
from typing import Annotated

# Annotated 可以附加元数据
PositiveInt = Annotated[int, "Must be positive"]
Email = Annotated[str, "Must be a valid email"]

def create_user(name: str, age: PositiveInt, email: Email) -> None:
    """创建用户。Annotated 的元数据可以被 Pydantic 等库读取。"""
    print(f"[create_user] name={name}, age={age}, email={email}")

# Pydantic 预览（Stage 3 详细学习）
# from pydantic import BaseModel, Field, EmailStr
#
# class User(BaseModel):
#     name: str
#     age: Annotated[int, Field(gt=0)]
#     email: EmailStr
```

---

## 最佳实践

```python
# ✅ 1. 函数签名必须有类型标注
def process_data(data: list[str], limit: int = 10) -> dict[str, int]:
    ...

# ✅ 2. 优先使用具体类型而非 Any
def good(items: list[str]) -> int: ...
# ❌ def bad(items: Any) -> Any: ...

# ✅ 3. 用 Protocol 替代 ABC（跨库场景）
class Serializable(Protocol):
    def to_json(self) -> str: ...

# ✅ 4. 用 Final 声明常量
MAX_SIZE: Final[int] = 1000

# ✅ 5. 用 TypedDict 替代 dict[str, Any]
class APIResponse(TypedDict):
    status: int
    data: list[dict[str, str]]
    message: str

# ✅ 6. 函数参数用 Sequence/Iterable，返回值用 list
from typing import Sequence, Iterable

def process(items: Sequence[int]) -> list[int]:
    """接受 Sequence（只读）比 list 更灵活。"""
    return [x * 2 for x in items]
```

---

## 常见陷阱

```python
# ❌ 陷阱 1: 可变默认参数 + 类型标注
def bad_default(items: list[int] = []) -> list[int]:  # noqa
    """列表默认值是共享的！"""
    items.append(1)
    return items

# ✅ 正确做法
def good_default(items: list[int] | None = None) -> list[int]:
    if items is None:
        items = []
    items.append(1)
    return items

# ❌ 陷阱 2: 混淆 type 和 Type
from typing import Type

def create_instance(cls: Type[Animal]) -> Animal:  # Type[X] 表示 X 的类本身
    return cls()

# 不是 create_instance(cls: Animal)  # 这是 Animal 的实例

# ❌ 陷阱 3: 忘记 TypeVar 名称必须与变量名一致
T = TypeVar("T")       # ✅
# U = TypeVar("T")     # ❌ 变量名 U 与参数 "T" 不匹配
```

---

## 导航

| 方向 | 链接 |
|------|------|
| ⬅️ 上一章 | [第 5 章：上下文管理器](../05-context-managers/) |
| ➡️ 下一章 | [第 7 章：模块与包](../07-modules-packages/) |
| 🏠 阶段目录 | [Stage 2 目录](../) |

---

## 参考资料

- [PEP 484 — Type Hints](https://peps.python.org/pep-0484/)
- [PEP 544 — Protocols](https://peps.python.org/pep-0544/)
- [PEP 695 — Type Parameter Syntax](https://peps.python.org/pep-0695/)
- [mypy 官方文档](https://mypy.readthedocs.io/)
- [typing 模块文档](https://docs.python.org/3/library/typing.html)
- [Fluent Python 2nd Ed. Ch.8, Ch.15](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
