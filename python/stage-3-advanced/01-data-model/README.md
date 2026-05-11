# 第 1 章：Python 数据模型 — 万物皆协议

> "There are only two hard things in Computer Science: cache invalidation and naming things."
> — Phil Karlton
>
> 当你写下 `obj[key]` 时，Python 看到的是 `type(obj).__getitem__(obj, key)`。
> 理解数据模型，就是理解 Python 的灵魂。

---

## 📖 本章内容

- [1. 数据模型全景图：语法 → 魔术方法映射](#1-数据模型全景图语法--魔术方法映射)
- [2. 数值类型模拟：\_\_add\_\_、\_\_radd\_\_、\_\_iadd\_\_](#2-数值类型模拟addraddiAdd)
- [3. 容器类型模拟：\_\_getitem\_\_、\_\_setitem\_\_、\_\_contains\_\_](#3-容器类型模拟getitemsetitemcontains)
- [4. 可哈希协议：\_\_hash\_\_ 与 \_\_eq\_\_ 契约](#4-可哈希协议hash-与-eq-契约)
- [5. 属性访问三剑客：\_\_getattr\_\_、\_\_getattribute\_\_、\_\_setattr\_\_](#5-属性访问三剑客getattrgetattributesetattr)
- [6. \_\_new\_\_ vs \_\_init\_\_](#6-new-vs-init)
- [最佳实践 / 常见陷阱](#最佳实践--常见陷阱)
- [练习题](#练习题)
- [参考资Դ / 下一步](#参考资Դ--下一步)

---

## 1. 数据模型全景图：语法 → 魔术方法映射

> 🎭 **The Drama: Python 的Ļ后剧院**
>
> 想象 Python 是一座大剧院。你写的每一行代码都是前台的表演——`+`、`[]`、`len()`。
> 但在Ļ后，真正工作的是一Ⱥ叫"魔术方法"（dunder methods）的演员。
> 当你写 `a + b`，Ļ后的导演（解释器）喊道："`__add__`，你上场！"
> 这就是 **数据模型** —— Python 前台语法与后台机制的映射关系。

### 1.1 什么是数据模型

Python 数据模型是一套 **协议（Protocol）**：解释器遇到特定语法时，会查找并调用对象上对应的特殊方法。这些特殊方法以˫下划线开头和结尾，因此被称为 **dunder methods**（double underscore methods）。

```python
# ✅ 前台语法 → 后台调用
len(obj)          # → obj.__len__()
obj[key]          # → type(obj).__getitem__(obj, key)
obj + other       # → obj.__add__(other)
str(obj)          # → obj.__str__()
repr(obj)         # → obj.__repr__()
obj()             # → obj.__call__()
for x in obj:     # → iter(obj) → obj.__iter__()
with obj as ctx:  # → obj.__enter__(), obj.__exit__()
```

### 1.2 核心映射表

| 语法/内置函数 | 魔术方法 | 类别 |
|:---|:---|:---|
| `repr(obj)` | `__repr__` | 字符串表示 |
| `str(obj)` | `__str__` | 字符串表示 |
| `format(obj, spec)` | `__format__` | 字符串表示 |
| `len(obj)` | `__len__` | 容器 |
| `obj[key]` | `__getitem__` | 容器 |
| `obj[key] = val` | `__setitem__` | 容器 |
| `del obj[key]` | `__delitem__` | 容器 |
| `key in obj` | `__contains__` | 容器 |
| `iter(obj)` | `__iter__` | 迭代 |
| `next(obj)` | `__next__` | 迭代 |
| `obj + other` | `__add__` | 运算符 |
| `obj == other` | `__eq__` | 比较 |
| `hash(obj)` | `__hash__` | 哈希 |
| `bool(obj)` | `__bool__` | 布尔 |
| `obj()` | `__call__` | 可调用 |
| `obj.attr` | `__getattr__` / `__getattribute__` | 属性访问 |
| `with obj` | `__enter__` / `__exit__` | 上下文管理 |

### 1.3 为什么使用魔术方法而不是普通方法

> 🧠 **CS Master's Bridge: 运算符重载的设计哲学**
>
> C++ 允许重载几乎所有运算符，Java 完全不允许（除了字符串的 `+`）。
> Python 选择了中间·线：通过 **协议** 提供运算符重载，但保持一致的 `__dunder__` 命名约定。
> 这样既获得了灵活性，又不会出现 C++ 那种运算符被滥用的混乱。

```python
# ❌ 如果 Python 用普通方法实现
my_list.length()      # Java 风格
my_list.size()        # 还是这个？
my_list.count()       # 哪个才对？

# ✅ Python 的统一协议
len(my_list)          # 永Զ是 len()，背后调用 __len__
len(my_dict)          # 同样的接口
len(my_string)        # 一致性！
```

**关键优势：**
1. **一致性** — 所有对象用 `len()` 而非各自的 `.length()` / `.size()`
2. **性能** — CPython 中 `len()` 对内置类型直接读ȡ C 结构体字段，O(1)
3. **鸭子类型** — 实现 `__len__` 的对象都是"有长度的"，不需要继承

### 1.4 实现你的第一个数据模型

```python
import logging

logging.basicConfig(level=logging.DEBUG, format='%(message)s')
logger = logging.getLogger(__name__)


class Card:
    """一张扑克牌 — չ示基础数据模型方法"""
    
    SUITS = '♠ ♥ ♦ ♣'.split()
    RANKS = [str(n) for n in range(2, 11)] + list('JQKA')
    
    def __init__(self, rank: str, suit: str) -> None:
        self.rank = rank
        self.suit = suit
        logger.debug("[Card] 创建卡牌: %s%s", rank, suit)
    
    def __repr__(self) -> str:
        """开发者友好的字符串表示"""
        return f"Card({self.rank!r}, {self.suit!r})"
    
    def __str__(self) -> str:
        """用户友好的字符串表示"""
        return f"{self.rank}{self.suit}"
    
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Card):
            return NotImplemented
        return (self.rank, self.suit) == (other.rank, other.suit)
    
    def __hash__(self) -> int:
        return hash((self.rank, self.suit))
    
    def __lt__(self, other: 'Card') -> bool:
        """按 rank 排序，rank 相同按 suit 排序"""
        if not isinstance(other, Card):
            return NotImplemented
        self_index = (self.RANKS.index(self.rank), self.SUITS.index(self.suit))
        other_index = (other.RANKS.index(other.rank), other.SUITS.index(other.suit))
        return self_index < other_index


class Deck:
    """一副扑克牌 — չ示容器协议"""
    
    def __init__(self) -> None:
        self._cards = [
            Card(rank, suit)
            for suit in Card.SUITS
            for rank in Card.RANKS
        ]
        logger.debug("[Deck] 创建牌组，共 %d 张牌", len(self._cards))
    
    def __len__(self) -> int:
        return len(self._cards)
    
    def __getitem__(self, position: int) -> Card:
        return self._cards[position]
    
    def __contains__(self, card: Card) -> bool:
        return card in self._cards
    
    def __repr__(self) -> str:
        return f"Deck({len(self)} cards)"
```

```python
# 使用示例
deck = Deck()
print(len(deck))               # 52 → __len__
print(deck[0])                 # 2♠ → __getitem__
print(deck[-1])                # A♣ → __getitem__
print(Card('A', '♠') in deck)  # True → __contains__

# 因为实现了 __getitem__，自动支持迭代和切片！
for card in deck:               # __getitem__ 使 Deck 可迭代
    pass

top_five = deck[:5]             # 切片也能用！
```

> 🧘 **Zen of Code: 最少惊讶原则**
>
> 实现魔术方法时，行为应该符合用户直觉。`len()` 应该返回长度，
> `__contains__` 应该检查成员关系。不要让这些方法做意外的事情。
> 就像 Python 之禅˵的："In the face of ambiguity, refuse the temptation to guess."

---

## 2. 数值类型模拟：\_\_add\_\_、\_\_radd\_\_、\_\_iadd\_\_

> 🌌 **The Big Picture: 从算盘到运算符重载**
>
> 运算符重载的历史可以跟溯到 1960 年代的 ALGOL 68。
> Python 的设计受到了 ABC 语言和 C++ 的影响。
> Guido van Rossum 在设计 Python 时，决定让运算符重载通过命名规范来实现，
> 避免了 C++ 那种 `operator+` 的语法复杂性。

### 2.1 算术运算符映射

| 运算符 | 正向方法 | 反向方法 | 增量方法 |
|:---|:---|:---|:---|
| `+` | `__add__` | `__radd__` | `__iadd__` |
| `-` | `__sub__` | `__rsub__` | `__isub__` |
| `*` | `__mul__` | `__rmul__` | `__imul__` |
| `/` | `__truediv__` | `__rtruediv__` | `__itruediv__` |
| `//` | `__floordiv__` | `__rfloordiv__` | `__ifloordiv__` |
| `%` | `__mod__` | `__rmod__` | `__imod__` |
| `**` | `__pow__` | `__rpow__` | `__ipow__` |

### 2.2 运算符分发机制

当 Python 执行 `a + b` 时，遵循以下流程：

```
a + b
├── 1. 调用 a.__add__(b)
│   ├── 返回值（非 NotImplemented）→ 完成
│   └── 返回 NotImplemented → 继续
├── 2. 调用 b.__radd__(a)
│   ├── 返回值（非 NotImplemented）→ 完成
│   └── 返回 NotImplemented → 继续
└── 3. 抛出 TypeError
```

**特殊规则：** 如果 `b` 的类型是 `a` 类型的 **子类**，Python 会先尝试 `b.__radd__(a)`。

```python
# ❌ 常见错误：返回 None 而不是 NotImplemented
class BadVector:
    def __add__(self, other):
        if not isinstance(other, BadVector):
            return None  # ❌ 应该返回 NotImplemented！

# ✅ 正确做法
class GoodVector:
    def __add__(self, other):
        if not isinstance(other, GoodVector):
            return NotImplemented  # ✅ 让 Python 继续尝试 other.__radd__
```

### 2.3 完整的二维向量实现

```python
import logging
import math
from typing import Union

logging.basicConfig(level=logging.DEBUG, format='%(message)s')
logger = logging.getLogger(__name__)


class Vector2D:
    """二维向量 — 完整的数值类型模拟"""
    
    __slots__ = ('_x', '_y')  # 内存优化
    
    def __init__(self, x: float, y: float) -> None:
        self._x = float(x)
        self._y = float(y)
        logger.debug("[Vector2D] 创建向量 (%.2f, %.2f)", x, y)
    
    @property
    def x(self) -> float:
        return self._x
    
    @property
    def y(self) -> float:
        return self._y
    
    # ---- 字符串表示 ----
    
    def __repr__(self) -> str:
        return f"Vector2D({self._x!r}, {self._y!r})"
    
    def __str__(self) -> str:
        return f"({self._x:.2f}, {self._y:.2f})"
    
    def __format__(self, fmt_spec: str) -> str:
        if fmt_spec.endswith('p'):
            # 极坐标格式
            fmt_spec = fmt_spec[:-1]
            coords = (abs(self), math.atan2(self._y, self._x))
            outer_fmt = '<{}, {}>'
        else:
            coords = (self._x, self._y)
            outer_fmt = '({}, {})'
        components = (format(c, fmt_spec) for c in coords)
        return outer_fmt.format(*components)
    
    # ---- 算术运算 ----
    
    def __add__(self, other: Union['Vector2D', tuple]) -> 'Vector2D':
        """向量加法: v1 + v2"""
        if isinstance(other, Vector2D):
            logger.debug("[Vector2D] %s + %s", self, other)
            return Vector2D(self._x + other._x, self._y + other._y)
        if isinstance(other, tuple) and len(other) == 2:
            return Vector2D(self._x + other[0], self._y + other[1])
        return NotImplemented
    
    def __radd__(self, other: Union['Vector2D', tuple]) -> 'Vector2D':
        """反向加法: other + v（当 other 不知道如何与 Vector2D 相加时调用）"""
        logger.debug("[Vector2D] __radd__ 被调用，other=%s", other)
        return self.__add__(other)  # 加法满足交换律
    
    def __iadd__(self, other: 'Vector2D') -> 'Vector2D':
        """增量赋值: v1 += v2（返回新对象，因为向量应该是不可变的）"""
        logger.debug("[Vector2D] %s += %s", self, other)
        if isinstance(other, Vector2D):
            return Vector2D(self._x + other._x, self._y + other._y)
        return NotImplemented
    
    def __sub__(self, other: 'Vector2D') -> 'Vector2D':
        if isinstance(other, Vector2D):
            return Vector2D(self._x - other._x, self._y - other._y)
        return NotImplemented
    
    def __mul__(self, scalar: float) -> 'Vector2D':
        """标量乘法: v * 3"""
        if isinstance(scalar, (int, float)):
            logger.debug("[Vector2D] %s * %s", self, scalar)
            return Vector2D(self._x * scalar, self._y * scalar)
        return NotImplemented
    
    def __rmul__(self, scalar: float) -> 'Vector2D':
        """反向标量乘法: 3 * v"""
        return self.__mul__(scalar)
    
    def __neg__(self) -> 'Vector2D':
        """-v"""
        return Vector2D(-self._x, -self._y)
    
    def __pos__(self) -> 'Vector2D':
        """+v"""
        return Vector2D(self._x, self._y)
    
    def __abs__(self) -> float:
        """abs(v) → 向量的模"""
        return math.hypot(self._x, self._y)
    
    # ---- 比较运算 ----
    
    def __eq__(self, other: object) -> bool:
        if isinstance(other, Vector2D):
            return (self._x, self._y) == (other._x, other._y)
        return NotImplemented
    
    def __hash__(self) -> int:
        return hash((self._x, self._y))
    
    def __bool__(self) -> bool:
        """零向量为 False"""
        return bool(abs(self))
    
    # ---- 额外协议 ----
    
    def __iter__(self):
        """允许解包: x, y = vector"""
        yield self._x
        yield self._y
    
    def __complex__(self) -> complex:
        return complex(self._x, self._y)
    
    def angle(self) -> float:
        """返回向量角度（弧度）"""
        return math.atan2(self._y, self._x)
```

### 2.4 \_\_iadd\_\_ 的微妙之处

> ⚛️ **The Science: 可变与不可变的增量赋值**
>
> `a += b` 的行为ȡ决于 `a` 是否可变：
> - **可变对象**（如 `list`）：`__iadd__` 就地修改 `self`，返回 `self`
> - **不可变对象**（如 `tuple`）：û有 `__iadd__`，退化为 `a = a.__add__(b)`，创建新对象
>
> 这就是为什么 `t = (1, 2); t += (3,)` 不会报错——它创建了新的 tuple。

```python
# 可变类型的 __iadd__：就地修改
class MutableAccumulator:
    def __init__(self, value: float = 0) -> None:
        self.value = value
    
    def __iadd__(self, other: float) -> 'MutableAccumulator':
        """就地修改并返回 self"""
        self.value += other
        return self  # ✅ 返回 self，不创建新对象
    
    def __repr__(self) -> str:
        return f"Accumulator({self.value})"


acc = MutableAccumulator(10)
original_id = id(acc)
acc += 5
assert id(acc) == original_id  # ✅ 同一个对象

# 不可变类型的 __iadd__：返回新对象
v1 = Vector2D(1, 2)
original_id = id(v1)
v1 += Vector2D(3, 4)
assert id(v1) != original_id  # ✅ 新对象
```

---

## 3. 容器类型模拟：\_\_getitem\_\_、\_\_setitem\_\_、\_\_contains\_\_

> 🎭 **The Drama: 容器的演员阵容**
>
> 容器协议就像一部电影的演员阵容：
> - `__getitem__` 是主角（有了它就能迭代和切片）
> - `__len__` 是最佳配角（告诉你容器有多大）
> - `__contains__` 是特效团队（让 `in` 运算符更快）
> - `__setitem__` 和 `__delitem__` 是选角导演（让容器可修改）

### 3.1 只读容器：只需 \_\_getitem\_\_ 和 \_\_len\_\_

```python
import logging
from typing import TypeVar, Generic, Iterator, overload, Union

logging.basicConfig(level=logging.DEBUG, format='%(message)s')
logger = logging.getLogger(__name__)

T = TypeVar('T')


class ImmutableList(Generic[T]):
    """不可变列表 — 只读容器协议演示"""
    
    def __init__(self, *items: T) -> None:
        self._data: tuple[T, ...] = tuple(items)
        logger.debug("[ImmutableList] 创建不可变列表，%d 个元素", len(self._data))
    
    def __len__(self) -> int:
        return len(self._data)
    
    @overload
    def __getitem__(self, index: int) -> T: ...
    @overload
    def __getitem__(self, index: slice) -> 'ImmutableList[T]': ...
    
    def __getitem__(self, index: Union[int, slice]) -> Union[T, 'ImmutableList[T]']:
        if isinstance(index, slice):
            logger.debug("[ImmutableList] 切片访问: %s", index)
            return ImmutableList(*self._data[index])
        logger.debug("[ImmutableList] 索引访问: [%d]", index)
        return self._data[index]
    
    def __contains__(self, item: T) -> bool:
        """自定义包含检查 — 如果不定义，Python 会用 __getitem__ 遍历"""
        logger.debug("[ImmutableList] 检查 %s 是否在列表中", item)
        return item in self._data
    
    def __iter__(self) -> Iterator[T]:
        """如果不定义，Python 会用 __getitem__(0), __getitem__(1), ... 直到 IndexError"""
        logger.debug("[ImmutableList] 开始迭代")
        return iter(self._data)
    
    def __reversed__(self) -> Iterator[T]:
        """支持 reversed()"""
        return reversed(self._data)
    
    def __repr__(self) -> str:
        return f"ImmutableList({', '.join(repr(x) for x in self._data)})"
```

### 3.2 可变容器：加入 \_\_setitem\_\_ 和 \_\_delitem\_\_

```python
class TypedList(Generic[T]):
    """类型化可变列表 — 完整容器协议"""
    
    def __init__(self, item_type: type, *items: T) -> None:
        self._item_type = item_type
        self._data: list[T] = []
        for item in items:
            self._validate(item)
            self._data.append(item)
        logger.debug("[TypedList] 创建 %s 类型列表", item_type.__name__)
    
    def _validate(self, item: T) -> None:
        if not isinstance(item, self._item_type):
            raise TypeError(
                f"期望 {self._item_type.__name__}，"
                f"得到 {type(item).__name__}"
            )
    
    def __len__(self) -> int:
        return len(self._data)
    
    def __getitem__(self, index: int) -> T:
        return self._data[index]
    
    def __setitem__(self, index: int, value: T) -> None:
        self._validate(value)
        logger.debug("[TypedList] 设置 [%d] = %r", index, value)
        self._data[index] = value
    
    def __delitem__(self, index: int) -> None:
        logger.debug("[TypedList] ɾ除 [%d]", index)
        del self._data[index]
    
    def __contains__(self, item: T) -> bool:
        return item in self._data
    
    def __iter__(self) -> Iterator[T]:
        return iter(self._data)
    
    def append(self, item: T) -> None:
        self._validate(item)
        self._data.append(item)
    
    def __repr__(self) -> str:
        return f"TypedList[{self._item_type.__name__}]({self._data})"
```

### 3.3 \_\_missing\_\_ — dict 的专属协议

```python
class DefaultDict:
    """简化版 defaultdict — չ示 __missing__"""
    
    def __init__(self, factory):
        self._data = {}
        self._factory = factory
    
    def __getitem__(self, key):
        try:
            return self._data[key]
        except KeyError:
            # dict 子类中，__getitem__ 找不到 key 时会调用 __missing__
            return self.__missing__(key)
    
    def __missing__(self, key):
        """当 key 不存在时自动创建默认值"""
        logger.debug("[DefaultDict] 键 %r 不存在，创建默认值", key)
        self._data[key] = self._factory()
        return self._data[key]
    
    def __setitem__(self, key, value):
        self._data[key] = value
    
    def __repr__(self):
        return f"DefaultDict({self._data})"
```

### 3.4 `__getitem__` vs `__iter__` 的关系

> 🧰 **Toolbox: 迭代的降级策略**
>
> Python 在尝试迭代一个对象时，遵循以下优先级：
> 1. 首先查找 `__iter__` 方法
> 2. 如果û有 `__iter__`，回退到 `__getitem__`（从索引 0 开始，直到 `IndexError`）
> 3. 都û有 → 抛出 `TypeError: object is not iterable`
>
> 这就是为什么只实现 `__getitem__` 的对象也能用在 `for` 循环中。
> 但最佳实践是：**如果你的类需要可迭代，请显式实现 `__iter__`。**

| 仅 `__getitem__` | 同时有 `__iter__` |
|:---|:---|
| 可迭代（降级机制） | 可迭代（优先使用） |
| 自动支持 `in`（遍历查找） | `__contains__` 可优化 |
| 无法用于 `reversed()` | 可实现 `__reversed__` |
| 不被 `isinstance(obj, Iterable)` 识别 | 被识别为 `Iterable` |

---

## 4. 可哈希协议：\_\_hash\_\_ 与 \_\_eq\_\_ 契约

> 🧠 **CS Master's Bridge: 哈希表的基ʯ**
>
> 哈希表是计算机科学中最重要的数据结构之一。Python 的 `dict` 和 `set`
> 都基于哈希表实现。一个对象要作为 `dict` 的 key 或 `set` 的成员，
> 它必须是 **可哈希的（hashable）**。这需要满足一个严格的契约。

### 4.1 可哈希契约

一个对象是可哈希的，当且仅当：

1. **实现了 `__hash__`** — 返回一个整数
2. **实现了 `__eq__`** — 用于哈希冲突时的比较
3. **关键契约**：如果 `a == b`，那么 `hash(a) == hash(b)` **必须成立**
4. **稳定性**：对象的 hash 值在其生命周期内不能改变

```python
# ✅ 满足契约
class Point:
    def __init__(self, x: float, y: float) -> None:
        self._x = x
        self._y = y
    
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Point):
            return NotImplemented
        return (self._x, self._y) == (other._x, other._y)
    
    def __hash__(self) -> int:
        # 使用与 __eq__ 相同的字段
        return hash((self._x, self._y))


# ❌ 违反契约 — 危险！
class BadPoint:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y
    
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, BadPoint):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)
    
    def __hash__(self) -> int:
        return hash(id(self))  # ❌ 两个相等的对象有不同的 hash！
```

### 4.2 Python 的默认行为

```python
# Python 的默认规则：
# 1. 如果只定义了 __eq__，Python 会自动将 __hash__ 设为 None（不可哈希）
# 2. 如果什么都不定义，继承 object 的 __eq__（比较 id）和 __hash__（基于 id）

class NoEq:
    pass

class WithEq:
    def __eq__(self, other):
        return True

print(hash(NoEq()))    # ✅ 有默认 hash
# print(hash(WithEq()))  # ❌ TypeError: unhashable type: 'WithEq'
```

### 4.3 可变对象与可哈希

> ⚛️ **The Science: 为什么可变对象默认不可哈希**
>
> 如果一个对象在放入 `set` 后被修改，它的 hash 值可能改变。
> 这意味着在哈希表中找不到它了——它存在 bucket A 中，但按新的 hash
> 计算应该ȥ bucket B 查找。这会导致数据"消ʧ"在哈希表中。
>
> 所以 Python 的规则是：**定义了 `__eq__` 的类，如果不显式定义 `__hash__`，
> 就默认不可哈希**。这是一种安全机制。

```python
class MutablePoint:
    """可变对象 — 显式声明不可哈希"""
    
    def __init__(self, x: float, y: float) -> None:
        self.x = x  # 可变！
        self.y = y
    
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, MutablePoint):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)
    
    __hash__ = None  # ✅ 显式声明不可哈希


class FrozenPoint:
    """不可变对象 — 安全地可哈希"""
    
    __slots__ = ('_x', '_y')
    
    def __init__(self, x: float, y: float) -> None:
        object.__setattr__(self, '_x', x)  # 绕过可能的 __setattr__
        object.__setattr__(self, '_y', y)
    
    @property
    def x(self) -> float:
        return self._x
    
    @property
    def y(self) -> float:
        return self._y
    
    def __setattr__(self, name: str, value) -> None:
        raise AttributeError("FrozenPoint is immutable")
    
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, FrozenPoint):
            return NotImplemented
        return (self._x, self._y) == (other._x, other._y)
    
    def __hash__(self) -> int:
        return hash((self._x, self._y))
    
    def __repr__(self) -> str:
        return f"FrozenPoint({self._x}, {self._y})"
```

### 4.4 hash 实现的最佳实践

| 方法 | 优点 | ȱ点 |
|:---|:---|:---|
| `hash(tuple(fields))` | 简单可靠 | 创建临时 tuple |
| `hash(field1) ^ hash(field2)` | 不创建临时对象 | XOR 容易冲突 |
| 自定义混合算法 | 最优分布 | 实现复杂 |

```python
# ✅ 推荐：使用 tuple
def __hash__(self):
    return hash((self._x, self._y))

# ❌ 避免：简单 XOR（冲突率高）
def __hash__(self):
    return hash(self._x) ^ hash(self._y)  # (1,2) 和 (2,1) hash 相同！
```

---

## 5. 属性访问三剑客：\_\_getattr\_\_、\_\_getattribute\_\_、\_\_setattr\_\_

> 🎭 **The Drama: 属性访问的三重门**
>
> 当你写下 `obj.name` 时，Python 不是简单地查字典——它要穿过三重门：
> 1. **第一重门 `__getattribute__`** — 每次属性访问都必经此门，无一例外
> 2. **第二重门（数据描述器）** — 类层面的拦截器（下一章详述）
> 3. **第三重门 `__getattr__`** — 只有前面所有·径都找不到时，才会来到这里
>
> 搞混这三重门是最常见的 Python 进阶错误之一。

### 5.1 \_\_getattribute\_\_ — 全能拦截器

```python
class LoggedAccess:
    """拦截所有属性访问 — __getattribute__ 演示"""
    
    def __init__(self) -> None:
        self.name = "Python"
        self.version = 3.12
    
    def __getattribute__(self, name: str):
        logger.debug("[LoggedAccess] 访问属性: %s", name)
        # ⚠️ 必须调用 super().__getattribute__，否则会无限递归！
        return super().__getattribute__(name)


obj = LoggedAccess()
print(obj.name)     # 日志: [LoggedAccess] 访问属性: name
print(obj.version)  # 日志: [LoggedAccess] 访问属性: version
```

```python
# ❌ 经典错误：在 __getattribute__ 中使用 self.xxx 导致无限递归
class InfiniteLoop:
    def __getattribute__(self, name: str):
        # self.log 会再次触发 __getattribute__，Ȼ后又调用 self.log...
        self.log(f"Accessing {name}")  # ❌ 无限递归！
        return super().__getattribute__(name)
    
    def log(self, msg):
        print(msg)

# ✅ 正确：用 object.__getattribute__ 或 super()
class SafeLogged:
    def __getattribute__(self, name: str):
        # 用 object.__getattribute__ 直接访问，不触发自定义逻辑
        log_fn = object.__getattribute__(self, 'log')
        log_fn(f"Accessing {name}")
        return super().__getattribute__(name)
    
    def log(self, msg):
        print(msg)
```

### 5.2 \_\_getattr\_\_ — 后备拦截器

```python
class DynamicAttributes:
    """
    __getattr__ 只在常规查找ʧ败时调用。
    这使得它非常适合：代理模式、懒加载、默认值。
    """
    
    def __init__(self) -> None:
        self.real_attr = "我是真实属性"
    
    def __getattr__(self, name: str):
        """仅当 name 不在 __dict__ 和类属性中时调用"""
        logger.debug("[DynamicAttributes] __getattr__ 被调用: %s", name)
        if name.startswith('computed_'):
            return f"动态计算: {name}"
        raise AttributeError(f"'{type(self).__name__}' û有属性 '{name}'")


obj = DynamicAttributes()
print(obj.real_attr)        # 直接从 __dict__ 获ȡ，不触发 __getattr__
print(obj.computed_value)   # __getattr__ 被调用 → "动态计算: computed_value"
# obj.nonexistent            # __getattr__ 被调用 → AttributeError
```

### 5.3 \_\_setattr\_\_ — 写入拦截器

```python
class ValidatedAttributes:
    """拦截所有属性设置 — 类型验证"""
    
    _validators = {
        'name': lambda v: isinstance(v, str),
        'age': lambda v: isinstance(v, int) and v >= 0,
    }
    
    def __setattr__(self, name: str, value) -> None:
        if name.startswith('_'):
            # ˽有属性不验证
            super().__setattr__(name, value)
            return
        
        validator = self._validators.get(name)
        if validator and not validator(value):
            raise ValueError(f"属性 '{name}' 的值 {value!r} 验证ʧ败")
        
        logger.debug("[ValidatedAttributes] 设置 %s = %r", name, value)
        super().__setattr__(name, value)


obj = ValidatedAttributes()
obj.name = "Alice"    # ✅
obj.age = 25          # ✅
# obj.age = -1        # ❌ ValueError
# obj.name = 123      # ❌ ValueError
```

### 5.4 属性查找完整流程

```
obj.attr 的查找˳序：
│
├── 1. type(obj).__getattribute__(obj, 'attr')  [总是首先调用]
│   │
│   ├── 2. 检查 type(obj) 及其 MRO 中的数据描述器
│   │   └── 找到 → 调用描述器的 __get__
│   │
│   ├── 3. 检查 obj.__dict__['attr']
│   │   └── 找到 → 返回
│   │
│   ├── 4. 检查 type(obj) 及其 MRO 中的非数据描述器/类变量
│   │   └── 找到 → 返回（非数据描述器调用 __get__）
│   │
│   └── 5. 所有·径未找到 → 调用 __getattr__(attr)
│       └── 未定义 __getattr__ → AttributeError
```

> 🧰 **Toolbox: 何时用哪个**
>
> | 场景 | 使用 |
> |:---|:---|
> | 拦截不存在的属性（代理、懒加载） | `__getattr__` |
> | 拦截所有属性访问（日志、审计） | `__getattribute__` |
> | 验证/拦截属性写入 | `__setattr__` |
> | 拦截属性ɾ除 | `__delattr__` |
>
> **黄金法则：** 90% 的情况下你只需要 `__getattr__`。
> `__getattribute__` 是核武器——威力巨大，但容易伤到自己。

---

## 6. \_\_new\_\_ vs \_\_init\_\_

> 🌌 **The Big Picture: 对象诞生的两个阶段**
>
> 在 Python 中，对象创建分为两个阶段：
> 1. **`__new__`** — 创造（分配内存，返回实例）
> 2. **`__init__`** — 初始化（设置属性，配置状态）
>
> 这就像建房子：`__new__` 是打地基、建框架；`__init__` 是装修、搬家具。
> 大多数时候你只关心装修（`__init__`），但有时你需要控制地基（`__new__`）。

### 6.1 `__new__` 的特殊性

```python
class Demo:
    def __new__(cls, *args, **kwargs):
        """
        __new__ 是真正的构造器：
        - 它是类方法（第一个参数是 cls，不是 self）
        - 它负责创建并返回实例
        - 如果不返回 cls 的实例，__init__ 不会被调用！
        """
        logger.debug("[Demo] __new__ 被调用，cls=%s", cls.__name__)
        instance = super().__new__(cls)
        return instance
    
    def __init__(self, value: int) -> None:
        """
        __init__ 是初始化器：
        - 它接收 __new__ 返回的实例（self）
        - 它不应该返回任何东西（返回非 None 会报错）
        """
        logger.debug("[Demo] __init__ 被调用，value=%d", value)
        self.value = value
```

### 6.2 调用流程

```python
# 当你写 Demo(42) 时，Python 实际执行：
# 1. Demo.__new__(Demo, 42) → instance
# 2. if isinstance(instance, Demo):
#        Demo.__init__(instance, 42)
# 3. return instance

# 等价的伪代码：
def create_object(cls, *args, **kwargs):
    instance = cls.__new__(cls, *args, **kwargs)
    if isinstance(instance, cls):
        instance.__init__(*args, **kwargs)
    return instance
```

### 6.3 \_\_new\_\_ 的用途一：不可变类型的子类化

```python
class UpperStr(str):
    """始终大写的字符串 — 不可变类型必须在 __new__ 中修改"""
    
    def __new__(cls, value: str) -> 'UpperStr':
        # str 是不可变的，必须在创建时就设置值
        # 在 __init__ 中修改已经来不及了！
        logger.debug("[UpperStr] __new__: 将 '%s' 转为大写", value)
        instance = super().__new__(cls, value.upper())
        return instance
    
    def __init__(self, value: str) -> None:
        # str.__init__ 什么都不做，因为值已经在 __new__ 中设定了
        logger.debug("[UpperStr] __init__: value 已经是 '%s'", self)


s = UpperStr("hello")
print(s)          # HELLO
print(type(s))    # <class 'UpperStr'>
print(s.lower())  # hello（返回普通 str）
```

### 6.4 \_\_new\_\_ 的用途二：单例模式

```python
class Singleton:
    """单例模式 — __new__ 控制实例创建"""
    
    _instance = None
    
    def __new__(cls) -> 'Singleton':
        if cls._instance is None:
            logger.debug("[Singleton] 创建唯一实例")
            cls._instance = super().__new__(cls)
        else:
            logger.debug("[Singleton] 返回已有实例")
        return cls._instance
    
    def __init__(self) -> None:
        # ⚠️ 注意：每次调用 Singleton() 都会执行 __init__！
        logger.debug("[Singleton] __init__ 被调用")


s1 = Singleton()
s2 = Singleton()
print(s1 is s2)  # True — 同一个对象
```

### 6.5 \_\_new\_\_ 的用途三：实例缓存

```python
class CachedInstance:
    """实例缓存 — 相同参数返回相同实例"""
    
    _cache: dict = {}
    
    def __new__(cls, value: int) -> 'CachedInstance':
        if value in cls._cache:
            logger.debug("[CachedInstance] 缓存命中: %d", value)
            return cls._cache[value]
        
        logger.debug("[CachedInstance] 创建新实例: %d", value)
        instance = super().__new__(cls)
        cls._cache[value] = instance
        return instance
    
    def __init__(self, value: int) -> None:
        self.value = value

a = CachedInstance(42)
b = CachedInstance(42)
print(a is b)  # True
```

### 6.6 对比总结

| 特性 | `__new__` | `__init__` |
|:---|:---|:---|
| 类型 | 类方法（接收 `cls`） | 实例方法（接收 `self`） |
| 职责 | 创建实例 | 初始化实例 |
| 返回值 | 必须返回实例 | 必须返回 `None` |
| 调用时机 | 在 `__init__` 之前 | 在 `__new__` 之后 |
| 常见用途 | 不可变类型子类化、单例、缓存 | 设置属性和状态 |
| 使用频率 | 罕见（< 5% 的类） | 几乎所有类 |

> 🧘 **Zen of Code: 简单优于复杂**
>
> "If you're using `__new__`, think twice. If you still need it, think once more."
>
> 99% 的情况下 `__init__` 就够了。只有在控制实例创建流程本身时才需要 `__new__`：
> - 子类化不可变类型（`str`、`int`、`tuple`、`frozenset`）
> - 实现单例或实例缓存
> - 配合元类使用

---

## 最佳实践 / 常见陷阱

### ✅ 最佳实践

1. **始终实现 `__repr__`** — 这是调试的基ʯ，应提供"重建对象"的信息
2. **`__str__` 是可选的** — û有 `__str__` 时，Python 会使用 `__repr__`
3. **返回 `NotImplemented` 而不是 `None`** — 让 Python 有机会尝试反向方法
4. **`__eq__` 和 `__hash__` 要同步** — 定义了一个就考虑另一个
5. **用 `__slots__` 优化内存** — 当你有大量实例时
6. **优先用 `__getattr__` 而非 `__getattribute__`** — 更安全，性能更好
7. **在 `__setattr__` 中用 `super().__setattr__`** — 避免无限递归

### ❌ 常见陷阱

```python
# 陷阱 1：忘记返回 NotImplemented
class Bad:
    def __eq__(self, other):
        if not isinstance(other, Bad):
            return False  # ❌ 应该 return NotImplemented

# 陷阱 2：__hash__ 与 __eq__ 不一致
class Bad2:
    def __eq__(self, other):
        return self.value == other.value
    def __hash__(self):
        return hash(self.name)  # ❌ 用了不同的字段！

# 陷阱 3：在 __getattribute__ 中访问 self 属性
class Bad3:
    def __getattribute__(self, name):
        print(f"Accessing {self.log_prefix}: {name}")  # ❌ 无限递归！
        return super().__getattribute__(name)

# 陷阱 4：__init__ 中忘记 __new__ 返回的不一定是当前类实例
class Bad4:
    def __new__(cls):
        return "not an instance"  # __init__ 不会被调用
    def __init__(self):
        self.value = 42  # 永Զ不会执行！

# 陷阱 5：可变对象实现 __hash__
class Bad5:
    def __init__(self, items):
        self.items = items  # 可变列表
    def __hash__(self):
        return hash(tuple(self.items))  # ❌ items 改变后 hash 也变了
    def __eq__(self, other):
        return self.items == other.items
```

---

## 练习题

<details>
<summary>练习 1：实现 Money 类</summary>

实现一个 `Money` 类，支持：
- 同币种加减（不同币种抛出 `ValueError`）
- 标量乘除
- 比较运算（同币种）
- 格式化显示：`Money(100, 'USD')` → `"$100.00"`

```python
class Money:
    def __init__(self, amount: float, currency: str = 'CNY') -> None:
        ...
    
    def __add__(self, other: 'Money') -> 'Money':
        ...
    
    def __mul__(self, scalar: float) -> 'Money':
        ...
    
    def __eq__(self, other: object) -> bool:
        ...
    
    def __lt__(self, other: 'Money') -> bool:
        ...
    
    def __repr__(self) -> str:
        ...
    
    def __format__(self, fmt_spec: str) -> str:
        ...
```

**提示：** 使用 `Decimal` 处理精确金额。

</details>

<details>
<summary>练习 2：实现 Matrix 类</summary>

实现一个 `Matrix` 类，支持：
- 矩阵加法 (`+`)
- 矩阵乘法 (`@`，使用 `__matmul__`)
- 标量乘法 (`*`)
- 索引访问 (`matrix[row, col]`)
- 转置 (`matrix.T`)

</details>

<details>
<summary>练习 3：实现代理对象</summary>

实现一个 `Proxy` 类，使用 `__getattr__` 和 `__setattr__` 将所有属性访问转发到被代理的对象，并记录所有访问日志。

```python
class Proxy:
    def __init__(self, target: object) -> None:
        # ⚠️ 这里需要小心处理 __setattr__
        ...
    
    def __getattr__(self, name: str):
        ...
    
    def __setattr__(self, name: str, value) -> None:
        ...
```

</details>

<details>
<summary>练习 4：实现不可变记录</summary>

实现一个 `Record` 基类，它的子类实例一旦创建就不能修改属性值，同时自动实现 `__eq__`、`__hash__` 和 `__repr__`。

```python
class Record:
    """不可变记录基类"""
    __slots__ = ()  # 子类需要定义自己的 __slots__
    
    def __init_subclass__(cls, **kwargs):
        ...
    
    def __setattr__(self, name, value):
        ...

class User(Record):
    __slots__ = ('name', 'age')
```

</details>

---

## 参考资Դ / 下一步

**参考资Դ：**
- [Python 官方文档 — Data Model](https://docs.python.org/3/reference/datamodel.html)
- [Fluent Python, 2nd Edition — Chapter 1: The Python Data Model](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [Python Cookbook — Chapter 8: Classes and Objects](https://www.oreilly.com/library/view/python-cookbook-3rd/9781449357337/)

**下一步：**

👉 [第 2 章：描述器协议 — 属性访问的终极控制](../02-descriptors/README.md) — 深入了解 `__get__`、`__set__`、`__delete__`，理解 `property`、`classmethod`、`staticmethod` 的底层实现原理。
