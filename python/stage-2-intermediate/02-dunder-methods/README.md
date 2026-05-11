# 第 2 章：魔术方法入门 — 让你的对象说 Python 的“母语”

> *"In Python, everything is an object, and almost everything has attributes and methods."*
> — Fluent Python, Luciano Ramalho
>
> 当你写下 `len(my_list)` 时，Python 实际上调用了 `my_list.__len__()`。
> 当你写下 `a + b` 时，Python 实际上调用了 `a.__add__(b)`。
> 魔术方法就是 Python 对象的“母语”——学会它，你的对象就能和内置语法无缝对话。

## 📖 本章内容

- [1. \_\_repr\_\_ vs \_\_str\_\_](#1-repr-vs-str)
  - [1.1 两种字符串表示的哲学](#11-两种字符串表示的哲学)
  - [1.2 实现准则](#12-实现准则)
- [2. \_\_eq\_\_ 与 \_\_hash\_\_](#2-eq-与-hash)
  - [2.1 相等性判定](#21-相等性判定)
  - [2.2 可哈希契约](#22-可哈希契约)
  - [2.3 比较方法与 total_ordering](#23-比较方法与-total_ordering)
- [3. \_\_bool\_\_ 与 \_\_len\_\_](#3-bool-与-len)
- [4. \_\_getitem\_\_：容器协议](#4-getitem容器协议)
- [5. \_\_call\_\_：可调用对象](#5-call可调用对象)
- [6. \_\_format\_\_：自定义格式化](#6-format自定义格式化)
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
> | `f"{obj!r}"` | `__repr__` | 强制 repr |
> | 容器中的元素 | `__repr__` | `[obj1, obj2]` |
> | 交互式 REPL | `__repr__` | `>>> obj` |
> | `logging` | `__str__` | 日志记录 |

### 1.2 实现准则

```python
from dataclasses import dataclass


@dataclass
class Money:
    \"\"\"货币——演示 __repr__ 和 __str__ 的实现。\"\"\"

    amount: float
    currency: str = "CNY"

    def __repr__(self) -> str:
        \"\"\"给开发者看：精确、可用于重建对象。\"\"\"
        return f"Money(amount={self.amount}, currency={self.currency!r})"

    def __str__(self) -> str:
        \"\"\"给用户看：友好、可读。\"\"\"
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
print(prices)
```

| 方法 | 受众 | 目标 | 优先级 | 回退 |
|------|------|------|--------|------|
| `__repr__` | 开发者 | 精确、可重建 | **必须实现** | 无回退 |
| `__str__` | 用户 | 友好、可读 | 可选 | 回退到 `__repr__` |

---

## 2. `__eq__` 与 `__hash__`

> 🧠 **CS Master's Bridge: 哈希表的数学契约**
>
> 在计算机科学中，哈希表（dict, set）的正确性依赖一个**不变量 (invariant)**：
> **如果 `a == b`，那么 `hash(a) == hash(b)`。** 反过来不一定成立（哈希碰撞是允许的）。
>
> 这就是为什么 Python 规定：**如果你重写了 `__eq__`，就必须重写 `__hash__`（或显式设为 `None` 表示不可哈希）。**
> 否则你的对象放进 `set` 或用作 `dict` 的 key 时，会出现诡异的 bug。

### 2.1 相等性判定

```python
from dataclasses import dataclass


class Point:
    """坐标点——演示 __eq__ 的实现。"""

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"Point(x={self.x}, y={self.y})"

    def __eq__(self, other: object) -> bool:
        """相等性判定——注意参数类型是 object，不是 Point。"""
        if not isinstance(other, Point):
            return NotImplemented  # ✅ 返回 NotImplemented，让 Python 尝试反向比较
        return self.x == other.x and self.y == other.y


# ✅ 正确用法
p1 = Point(1, 2)
p2 = Point(1, 2)
p3 = Point(3, 4)

print(f"[__eq__] p1 == p2: {p1 == p2}")  # True
print(f"[__eq__] p1 == p3: {p1 == p3}")  # False
print(f"[__eq__] p1 == 'not a point': {p1 == 'not a point'}")  # False（NotImplemented → False）
```

```
❌ 错误：__eq__ 中直接返回 False 而非 NotImplemented
──────────────────────────────────────────────
def __eq__(self, other: object) -> bool:
    if not isinstance(other, Point):
        return False  # ❌ 阻止了反向比较的机会

✅ 正确：返回 NotImplemented
──────────────────────────────────────────────
def __eq__(self, other: object) -> bool:
    if not isinstance(other, Point):
        return NotImplemented  # ✅ Python 会尝试 other.__eq__(self)
```

### 2.2 可哈希契约

```
┌─────────────────────────────────────────────────────────┐
│                   哈希契约 (Hash Contract)                │
│                                                          │
│   a == b  ──→  hash(a) == hash(b)    ✅ 必须成立         │
│   hash(a) == hash(b)  ──/→  a == b   ⚠️ 碰撞是允许的    │
│                                                          │
│   重写 __eq__ → 必须重写 __hash__                         │
│   可变对象 → __hash__ = None（不可哈希）                   │
└─────────────────────────────────────────────────────────┘
```

```python
class Color:
    """颜色——演示 __eq__ + __hash__ 的正确搭配。"""

    def __init__(self, red: int, green: int, blue: int) -> None:
        self.red = red
        self.green = green
        self.blue = blue

    def __repr__(self) -> str:
        return f"Color(red={self.red}, green={self.green}, blue={self.blue})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Color):
            return NotImplemented
        return (self.red, self.green, self.blue) == (other.red, other.green, other.blue)

    def __hash__(self) -> int:
        """用元组的哈希——简单且正确。"""
        return hash((self.red, self.green, self.blue))


# ✅ 可以用作 dict 的 key 和 set 的元素
red1 = Color(255, 0, 0)
red2 = Color(255, 0, 0)
blue = Color(0, 0, 255)

color_names: dict[Color, str] = {red1: "红色", blue: "蓝色"}
print(f"[__hash__] red1 in dict: {color_names[red2]}")  # "红色"——因为 red1 == red2

unique_colors: set[Color] = {red1, red2, blue}
print(f"[__hash__] unique colors: {len(unique_colors)}")  # 2——red1 和 red2 被去重
```

> **重要**：Python 的默认行为
>
> | 情况 | `__eq__` | `__hash__` | 能放入 set/dict? |
> |------|----------|------------|------------------|
> | 都不定义 | 按 `id()` 比较 | 按 `id()` 哈希 | ✅ 可以 |
> | 只定义 `__eq__` | 自定义 | **自动变 `None`** | ❌ 不可哈希 |
> | 两者都定义 | 自定义 | 自定义 | ✅ 可以 |
> | `@dataclass(frozen=True)` | 自动生成 | 自动生成 | ✅ 可以 |

### 2.3 比较方法与 `total_ordering`

手动实现全部 6 个比较方法（`__eq__`, `__ne__`, `__lt__`, `__le__`, `__gt__`, `__ge__`）很繁琐。`functools.total_ordering` 让你只需实现 `__eq__` + 一个排序方法，自动推导其余的。

```python
from functools import total_ordering


@total_ordering
class Temperature:
    """温度——演示 total_ordering 的用法。"""

    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    def __repr__(self) -> str:
        return f"Temperature(celsius={self.celsius})"

    def __str__(self) -> str:
        return f"{self.celsius}°C"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius == other.celsius

    def __lt__(self, other: object) -> bool:
        """只需实现 __lt__，total_ordering 自动推导 __le__、__gt__、__ge__。"""
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius < other.celsius

    def __hash__(self) -> int:
        return hash(self.celsius)


# ✅ 所有比较运算符都能用
boiling = Temperature(100)
freezing = Temperature(0)
body = Temperature(37)

print(f"[total_ordering] {boiling} > {freezing}: {boiling > freezing}")   # True
print(f"[total_ordering] {body} <= {boiling}: {body <= boiling}")         # True
print(f"[total_ordering] {freezing} >= {body}: {freezing >= body}")       # False

# 可以排序
temps: list[Temperature] = [boiling, freezing, body]
print(f"[total_ordering] sorted: {sorted(temps)}")  # [0°C, 37°C, 100°C]
```

| 你实现的方法 | `total_ordering` 自动推导 |
|-------------|--------------------------|
| `__eq__` + `__lt__` | `__le__`, `__gt__`, `__ge__` |
| `__eq__` + `__gt__` | `__le__`, `__lt__`, `__ge__` |
| `__eq__` + `__le__` | `__lt__`, `__gt__`, `__ge__` |
| `__eq__` + `__ge__` | `__lt__`, `__le__`, `__gt__` |

---

## 3. `__bool__` 与 `__len__`

> 🎭 **The Drama: 真值的两条路**
>
> Python 判断一个对象的"真假"时，走这条路：
> 1. 先找 `__bool__`——如果有，直接用它的返回值
> 2. 没有 `__bool__`？找 `__len__`——如果 `len(obj) == 0`，就是 `False`
> 3. 两个都没有？**永远是 `True`**
>
> 所以一个空的自定义对象默认是"真"的！这经常让新手困惑。

```
┌──────────────────────────────────────────────┐
│           Python 真值判定流程                  │
│                                               │
│   bool(obj)                                   │
│     │                                         │
│     ├─ 有 __bool__? ──→ 返回 __bool__() 结果  │
│     │                                         │
│     ├─ 有 __len__?  ──→ len(obj) != 0         │
│     │                                         │
│     └─ 都没有?     ──→ True                   │
└──────────────────────────────────────────────┘
```

```python
class Playlist:
    """播放列表——演示 __bool__ 和 __len__ 的交互。"""

    def __init__(self, name: str, songs: list[str] | None = None) -> None:
        self.name = name
        self.songs: list[str] = songs or []

    def __repr__(self) -> str:
        return f"Playlist(name={self.name!r}, songs={len(self.songs)}首)"

    def __len__(self) -> int:
        """返回歌曲数量——同时影响 bool() 和 len()。"""
        print(f"  [__len__] 被调用，返回 {len(self.songs)}")
        return len(self.songs)

    def __bool__(self) -> bool:
        """自定义真值——即使列表为空，有名字就是 True。"""
        print(f"  [__bool__] 被调用")
        return bool(self.name)  # 只要有名字就是"真"


# 观察调用顺序
empty_named = Playlist("我的收藏", [])
empty_unnamed = Playlist("", [])
full = Playlist("热歌榜", ["歌曲A", "歌曲B"])

print(f"[bool] 有名字空列表: {bool(empty_named)}")    # True（__bool__ 优先）
print(f"[bool] 无名字空列表: {bool(empty_unnamed)}")   # False
print(f"[bool] 有歌曲列表: {bool(full)}")              # True
print(f"[len]  歌曲数量: {len(full)}")                  # 2
```

```python
# ❌ 错误：__len__ 返回负数
class BadContainer:
    def __len__(self) -> int:
        return -1  # ❌ ValueError: __len__() should return >= 0

# ✅ 正确：__len__ 必须返回非负整数
class GoodContainer:
    def __init__(self, items: list[str]) -> None:
        self.items = items

    def __len__(self) -> int:
        return len(self.items)  # ✅ 永远 >= 0
```

| 内置类型 | `bool()` 为 `False` 的情况 |
|----------|---------------------------|
| `int` | `0` |
| `float` | `0.0` |
| `str` | `""` |
| `list` | `[]` |
| `dict` | `{}` |
| `set` | `set()` |
| `None` | 永远 `False` |
| 自定义对象 | `__bool__` 返回 `False`，或 `__len__` 返回 `0` |

---

## 4. `__getitem__`：容器协议

> 🌌 **The Big Picture: 一个方法解锁四种能力**
>
> 实现 `__getitem__` 后，你的对象自动获得：
> 1. **索引访问**：`obj[0]`
> 2. **切片**：`obj[1:3]`
> 3. **迭代**：`for item in obj`（如果没有 `__iter__`，Python 会用 `__getitem__` 从 0 开始尝试）
> 4. **`in` 运算符**：`item in obj`（如果没有 `__contains__`，Python 会遍历查找）
>
> 一个方法，四种超能力。这就是 Python 协议的威力。

```python
from typing import overload


class Deck:
    """一副扑克牌——演示完整的容器协议。"""

    RANKS: list[str] = list("23456789") + ["10", "J", "Q", "K", "A"]
    SUITS: list[str] = ["♠", "♥", "♦", "♣"]

    def __init__(self) -> None:
        self._cards: list[str] = [
            f"{rank}{suit}" for suit in self.SUITS for rank in self.RANKS
        ]

    def __repr__(self) -> str:
        return f"Deck(cards={len(self._cards)})"

    def __len__(self) -> int:
        return len(self._cards)

    @overload
    def __getitem__(self, index: int) -> str: ...
    @overload
    def __getitem__(self, index: slice) -> list[str]: ...

    def __getitem__(self, index: int | slice) -> str | list[str]:
        """支持索引和切片。"""
        result = self._cards[index]
        print(f"  [__getitem__] index={index}, result={result}")
        return result

    def __contains__(self, card: object) -> bool:
        """显式实现 __contains__，比 __getitem__ 遍历更高效。"""
        return card in self._cards


# ✅ 四种能力全部可用
deck = Deck()

# 1. 索引
print(f"[Deck] 第一张牌: {deck[0]}")       # 2♠
print(f"[Deck] 最后一张: {deck[-1]}")       # A♣

# 2. 切片
print(f"[Deck] 前三张: {deck[0:3]}")        # ['2♠', '3♠', '4♠']

# 3. 迭代（自动使用 __getitem__）
print("[Deck] 前5张:")
for i, card in enumerate(deck):
    if i >= 5:
        break
    print(f"  {card}")

# 4. in 运算符
print(f"[Deck] 'A♠' in deck: {'A♠' in deck}")  # True
```

**实现 `__setitem__` 和 `__delitem__` 让对象可写：**

```python
class MutableDeck(Deck):
    """可修改的牌组。"""

    def __setitem__(self, index: int, value: str) -> None:
        print(f"  [__setitem__] index={index}, value={value}")
        self._cards[index] = value

    def __delitem__(self, index: int) -> None:
        print(f"  [__delitem__] index={index}")
        del self._cards[index]


mdeck = MutableDeck()
mdeck[0] = "Joker"             # __setitem__
print(f"[MutableDeck] 第一张: {mdeck[0]}")  # Joker
del mdeck[0]                   # __delitem__
print(f"[MutableDeck] 现在第一张: {mdeck[0]}")  # 3♠
```

---

## 5. `__call__`：可调用对象

> 🧰 **Toolbox: 什么时候让对象可调用？**
>
> `__call__` 让对象实例可以像函数一样被调用：`obj(args)`。典型场景：
> - **有状态的函数**：需要记住历史的"函数"（比如计数器、累加器）
> - **策略模式**：可配置的行为对象
> - **装饰器类**：用类实现装饰器
> - **工厂对象**：可配置的对象工厂

```python
class Multiplier:
    """乘法器——演示 __call__ 的基本用法。"""

    def __init__(self, factor: int) -> None:
        self.factor = factor
        self.call_count: int = 0

    def __repr__(self) -> str:
        return f"Multiplier(factor={self.factor})"

    def __call__(self, value: int) -> int:
        """让对象可以像函数一样调用。"""
        self.call_count += 1
        result: int = value * self.factor
        print(f"  [__call__] {value} × {self.factor} = {result} (第{self.call_count}次调用)")
        return result


# ✅ 像函数一样使用
double = Multiplier(2)
triple = Multiplier(3)

print(f"[Multiplier] double(5) = {double(5)}")   # 10
print(f"[Multiplier] triple(5) = {triple(5)}")   # 15
print(f"[Multiplier] double(10) = {double(10)}") # 20
print(f"[Multiplier] double 被调用了 {double.call_count} 次")

# ✅ 可以传给高阶函数
numbers: list[int] = [1, 2, 3, 4, 5]
doubled: list[int] = list(map(double, numbers))
print(f"[map] doubled: {doubled}")  # [2, 4, 6, 8, 10]

# ✅ 用 callable() 检测
print(f"[callable] double: {callable(double)}")  # True
print(f"[callable] 42: {callable(42)}")          # False
```

**实战：用 `__call__` 实现带状态的重试逻辑**

```python
import random
import time


class Retry:
    """重试器——有状态的可调用对象。"""

    def __init__(self, max_attempts: int = 3, delay: float = 0.1) -> None:
        self.max_attempts = max_attempts
        self.delay = delay
        self.total_retries: int = 0

    def __call__(self, func: object) -> object:
        """作为装饰器使用（简化版）。"""
        from functools import wraps
        from typing import Any, Callable

        # 类型标注简化处理
        _func: Callable[..., Any] = func  # type: ignore[assignment]

        @wraps(_func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exception: Exception | None = None
            for attempt in range(1, self.max_attempts + 1):
                try:
                    result = _func(*args, **kwargs)
                    print(f"  [Retry] 第{attempt}次尝试成功")
                    return result
                except Exception as e:
                    last_exception = e
                    self.total_retries += 1
                    print(f"  [Retry] 第{attempt}次失败: {e}")
                    if attempt < self.max_attempts:
                        time.sleep(self.delay)
            raise last_exception  # type: ignore[misc]

        return wrapper


@Retry(max_attempts=3, delay=0.01)
def unstable_api() -> str:
    """模拟不稳定的 API 调用。"""
    if random.random() < 0.6:
        raise ConnectionError("网络超时")
    return "数据获取成功"


# 多次调用观察重试行为
for i in range(3):
    try:
        result = unstable_api()  # type: ignore[operator]
        print(f"[API] 调用{i+1}: {result}")
    except ConnectionError as e:
        print(f"[API] 调用{i+1}: 最终失败 - {e}")
```

---

## 6. `__format__`：自定义格式化

> ⚛️ **The Science: format() 的调用链**
>
> 当你写 `f"{obj:spec}"`，Python 调用 `obj.__format__(spec)`。
> 这让你可以为自定义对象定义专属的格式化语法——就像 `datetime` 支持 `f"{now:%Y-%m-%d}"` 一样。

```python
class Vector:
    """二维向量——演示 __format__ 的用法。"""

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"Vector(x={self.x}, y={self.y})"

    def __str__(self) -> str:
        return f"({self.x}, {self.y})"

    def __format__(self, format_spec: str) -> str:
        """
        自定义格式规范：
        - 'p'  → 极坐标格式 (r, θ°)
        - 'c'  → 分量格式 x=..., y=...
        - ''   → 默认格式 (x, y)
        - 其他 → 对分量应用数字格式
        """
        import math

        if format_spec == "p":
            # 极坐标
            r: float = math.sqrt(self.x ** 2 + self.y ** 2)
            theta: float = math.degrees(math.atan2(self.y, self.x))
            return f"({r:.2f}, {theta:.1f}°)"
        elif format_spec == "c":
            # 分量格式
            return f"x={self.x}, y={self.y}"
        elif format_spec == "":
            return str(self)
        else:
            # 将格式规范应用到各分量
            return f"({self.x:{format_spec}}, {self.y:{format_spec}})"


v = Vector(3, 4)

print(f"[__format__] 默认:   {v}")           # (3, 4)
print(f"[__format__] 极坐标: {v:p}")          # (5.00, 53.1°)
print(f"[__format__] 分量:   {v:c}")          # x=3, y=4
print(f"[__format__] 精度:   {v:.3f}")        # (3.000, 4.000)
```

| 格式规范 | 含义 | 示例输出 |
|----------|------|----------|
| `""` | 默认格式 | `(3, 4)` |
| `"p"` | 极坐标 | `(5.00, 53.1°)` |
| `"c"` | 分量格式 | `x=3, y=4` |
| `".2f"` | 浮点精度 | `(3.00, 4.00)` |

---

## 最佳实践

1. **永远先实现 `__repr__`**：它是调试的基础，`__str__` 不存在时 Python 会回退到它
2. **`__eq__` 的参数类型是 `object`**：不是你的类本身，并返回 `NotImplemented` 处理未知类型
3. **重写 `__eq__` 必须考虑 `__hash__`**：要么同时实现 `__hash__`，要么用 `@dataclass(frozen=True)`
4. **`__len__` 必须返回非负整数**：否则 Python 会抛出 `ValueError`
5. **用 `@total_ordering` 减少样板代码**：只需 `__eq__` + 一个比较方法
6. **`__format__` 要支持空字符串**：`f"{obj}"` 会传空 `format_spec`
7. **用 `@dataclass` 自动生成魔术方法**：大多数情况下不需要手写

```python
# ✅ 最佳实践：用 dataclass 让 Python 自动生成
from dataclasses import dataclass


@dataclass(frozen=True)  # frozen=True 自动生成 __eq__ + __hash__
class Coordinate:
    lat: float
    lon: float

    def __str__(self) -> str:
        ns: str = "N" if self.lat >= 0 else "S"
        ew: str = "E" if self.lon >= 0 else "W"
        return f"{abs(self.lat):.4f}°{ns}, {abs(self.lon):.4f}°{ew}"

    # __repr__ 由 dataclass 自动生成
    # __eq__ 由 dataclass 自动生成
    # __hash__ 由 frozen=True 自动生成


beijing = Coordinate(39.9042, 116.4074)
tokyo = Coordinate(35.6762, 139.6503)
print(f"[最佳实践] repr: {beijing!r}")
print(f"[最佳实践] str:  {beijing}")
print(f"[最佳实践] 可哈希: {hash(beijing)}")
print(f"[最佳实践] 集合去重: {len({beijing, Coordinate(39.9042, 116.4074)})}")  # 1
```

---

## 常见陷阱

### 陷阱 1：重写 `__eq__` 但忘了 `__hash__`

```python
# ❌ 重写了 __eq__ 但没重写 __hash__
class BadPoint:
    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, BadPoint):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    # 没有 __hash__！Python 自动将 __hash__ 设为 None


p = BadPoint(1, 2)
# {p}  # ❌ TypeError: unhashable type: 'BadPoint'
print(f"[陷阱1] BadPoint.__hash__ is None: {BadPoint.__hash__ is None}")  # True

# ✅ 修复：同时实现 __hash__
class GoodPoint:
    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, BadPoint):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self) -> int:
        return hash((self.x, self.y))
```

### 陷阱 2：`__bool__` 和 `__len__` 的优先级

```python
class ConfusingContainer:
    """__bool__ 和 __len__ 同时存在时，__bool__ 优先。"""

    def __len__(self) -> int:
        print("  [__len__] 被调用")
        return 0  # 空的

    def __bool__(self) -> bool:
        print("  [__bool__] 被调用")
        return True  # 但 __bool__ 说是 True


c = ConfusingContainer()
print(f"[陷阱2] bool(c): {bool(c)}")  # True！__bool__ 优先
print(f"[陷阱2] len(c): {len(c)}")    # 0
# 这可能导致：if c 和 if len(c) 的结果不同！
```

### 陷阱 3：可变对象实现 `__hash__`

```python
# ❌ 可变对象不应该可哈希
class MutableBad:
    def __init__(self, value: int) -> None:
        self.value = value

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, MutableBad):
            return NotImplemented
        return self.value == other.value

    def __hash__(self) -> int:
        return hash(self.value)  # ❌ 如果 value 变了，hash 也变了！


obj = MutableBad(42)
s: set[MutableBad] = {obj}
print(f"[陷阱3] obj in s: {obj in s}")  # True

obj.value = 99  # 修改了！
print(f"[陷阱3] obj in s: {obj in s}")  # False！对象"消失"了

# ✅ 解决方案：用 frozen dataclass 或只对不可变字段哈希
```

---

## 练习题

### 练习 1：实现一个 `Money` 类

实现一个 `Money` 类，支持：
- `__repr__` 和 `__str__`
- `__eq__` 和 `__hash__`（相同金额和货币才相等）
- `__lt__`（同币种可比较，不同币种抛 `TypeError`）
- `__bool__`（金额不为 0 即为 True）
- `__format__`（支持 `"short"` 格式如 `"¥100"` 和默认详细格式）

<details>
<summary>💡 参考答案</summary>

```python
from functools import total_ordering


@total_ordering
class Money:
    SYMBOLS: dict[str, str] = {"CNY": "¥", "USD": "$", "EUR": "€", "GBP": "£"}

    def __init__(self, amount: float, currency: str = "CNY") -> None:
        self.amount = amount
        self.currency = currency

    def __repr__(self) -> str:
        return f"Money(amount={self.amount}, currency={self.currency!r})"

    def __str__(self) -> str:
        symbol: str = self.SYMBOLS.get(self.currency, self.currency)
        return f"{symbol}{self.amount:,.2f} {self.currency}"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        return self.amount == other.amount and self.currency == other.currency

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        if self.currency != other.currency:
            raise TypeError(f"无法比较不同货币: {self.currency} vs {other.currency}")
        return self.amount < other.amount

    def __hash__(self) -> int:
        return hash((self.amount, self.currency))

    def __bool__(self) -> bool:
        return self.amount != 0

    def __format__(self, format_spec: str) -> str:
        symbol: str = self.SYMBOLS.get(self.currency, self.currency)
        if format_spec == "short":
            return f"{symbol}{self.amount:.0f}"
        return str(self)


# 测试
m1 = Money(100, "CNY")
m2 = Money(200, "CNY")
m3 = Money(100, "CNY")
m0 = Money(0, "CNY")

print(f"repr: {m1!r}")
print(f"str:  {m1}")
print(f"m1 == m3: {m1 == m3}")         # True
print(f"m1 < m2: {m1 < m2}")           # True
print(f"bool(m1): {bool(m1)}")         # True
print(f"bool(m0): {bool(m0)}")         # False
print(f"short: {m1:short}")            # ¥100
print(f"set: {len({m1, m2, m3})}")     # 2
```
</details>

### 练习 2：实现一个 `Matrix` 容器

实现一个简单的 `Matrix` 类，支持：
- `__getitem__`：`matrix[row, col]` 和 `matrix[row]`（返回一整行）
- `__setitem__`：`matrix[row, col] = value`
- `__len__`：返回行数
- `__contains__`：检查某个值是否在矩阵中
- `__repr__`

<details>
<summary>💡 参考答案</summary>

```python
class Matrix:
    def __init__(self, rows: int, cols: int, fill: float = 0.0) -> None:
        self.rows = rows
        self.cols = cols
        self._data: list[list[float]] = [[fill] * cols for _ in range(rows)]

    def __repr__(self) -> str:
        return f"Matrix(rows={self.rows}, cols={self.cols})"

    def __len__(self) -> int:
        return self.rows

    def __getitem__(self, key: int | tuple[int, int]) -> float | list[float]:
        if isinstance(key, tuple):
            row, col = key
            print(f"  [Matrix.__getitem__] ({row}, {col}) -> {self._data[row][col]}")
            return self._data[row][col]
        print(f"  [Matrix.__getitem__] row {key} -> {self._data[key]}")
        return self._data[key]

    def __setitem__(self, key: tuple[int, int], value: float) -> None:
        row, col = key
        print(f"  [Matrix.__setitem__] ({row}, {col}) = {value}")
        self._data[row][col] = value

    def __contains__(self, value: object) -> bool:
        return any(value in row for row in self._data)


# 测试
m = Matrix(3, 3)
m[0, 0] = 1.0
m[1, 1] = 2.0
m[2, 2] = 3.0

print(f"m[1, 1] = {m[1, 1]}")       # 2.0
print(f"m[0] = {m[0]}")             # [1.0, 0.0, 0.0]
print(f"2.0 in m: {2.0 in m}")      # True
print(f"9.0 in m: {9.0 in m}")      # False
print(f"len(m) = {len(m)}")          # 3
```
</details>

### 练习 3：实现一个 `Pipeline` 可调用对象

实现一个 `Pipeline` 类，可以链式组合多个函数：

```python
# 目标用法：
pipe = Pipeline() | str.strip | str.upper | (lambda s: s.replace(" ", "_"))
result = pipe("  hello world  ")  # "HELLO_WORLD"
```

<details>
<summary>💡 参考答案</summary>

```python
from typing import Any, Callable


class Pipeline:
    def __init__(self, functions: list[Callable[..., Any]] | None = None) -> None:
        self._functions: list[Callable[..., Any]] = functions or []

    def __repr__(self) -> str:
        names: list[str] = [f.__name__ if hasattr(f, '__name__') else str(f) for f in self._functions]
        return f"Pipeline({' | '.join(names)})"

    def __or__(self, func: Callable[..., Any]) -> "Pipeline":
        """用 | 运算符添加函数。"""
        print(f"  [Pipeline.__or__] 添加 {getattr(func, '__name__', func)}")
        return Pipeline(self._functions + [func])

    def __call__(self, value: Any) -> Any:
        """依次执行所有函数。"""
        result: Any = value
        for func in self._functions:
            result = func(result)
            print(f"  [Pipeline.__call__] {getattr(func, '__name__', '?')}() -> {result!r}")
        return result


# 测试
pipe = Pipeline() | str.strip | str.upper | (lambda s: s.replace(" ", "_"))
print(f"Pipeline: {pipe!r}")
result = pipe("  hello world  ")
print(f"Result: {result}")  # HELLO_WORLD
```
</details>

---

## 参考资源

- [Python 数据模型 — 官方文档](https://docs.python.org/3/reference/datamodel.html)
- [Fluent Python, 2nd Ed. — Ch.1: The Python Data Model](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [functools.total_ordering](https://docs.python.org/3/library/functools.html#functools.total_ordering)
- [PEP 3107 — Function Annotations](https://peps.python.org/pep-3107/)
- [Real Python — Operator and Function Overloading](https://realpython.com/operator-function-overloading/)

---

## 下一步

恭喜你掌握了 Python 魔术方法的核心！现在你的自定义对象可以和 Python 的内置语法无缝对话了。

接下来，我们将深入 Python 的**迭代协议**——学会用 `__iter__`、`__next__` 和 `yield` 实现惰性求值，处理海量数据而不爆内存。

**[👉 第 3 章：迭代器与生成器](../03-iterators-generators/)**

---

[⬅️ 第 1 章：面向对象编程](../01-oop-fundamentals/) | [👉 第 3 章：迭代器与生成器](../03-iterators-generators/) | [🏠 返回 Stage 2 目录](../README.md)
