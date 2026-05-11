# Stage 2 练习题集 — Python 工程化综合训练

> "Tell me and I forget, teach me and I may remember, involve me and I learn."
> — Benjamin Franklin
>
> 这里的 25 道题覆盖 Stage 2 全部 9 章内容。
> 每道题都标注了难度、涉及章节、提示和参考答案。
> 闭卷做完再看答案，效果翻倍。

---

## 📖 目录

| # | 题目 | 难度 | 章节 |
|:---|:---|:---|:---|
| 1 | [银行账户类](#练习-1银行账户类) | ⭐ | Ch01 OOP |
| 2 | [形状继承体系](#练习-2形状继承体系) | ⭐⭐ | Ch01 OOP |
| 3 | [Mixin 日志注入](#练习-3mixin-日志注入) | ⭐⭐ | Ch01 OOP |
| 4 | [自定义 Money 类](#练习-4自定义-money-类) | ⭐⭐ | Ch02 魔术方法 |
| 5 | [有序集合](#练习-5有序集合) | ⭐⭐⭐ | Ch02 魔术方法 |
| 6 | [斐波那契迭代器](#练习-6斐波那契迭代器) | ⭐ | Ch03 迭代器/生成器 |
| 7 | [文件分块读取器](#练习-7文件分块读取器) | ⭐⭐ | Ch03 迭代器/生成器 |
| 8 | [无限素数生成器](#练习-8无限素数生成器) | ⭐⭐ | Ch03 迭代器/生成器 |
| 9 | [计时装饰器](#练习-9计时装饰器) | ⭐ | Ch04 装饰器 |
| 10 | [重试装饰器](#练习-10重试装饰器) | ⭐⭐ | Ch04 装饰器 |
| 11 | [权限检查装饰器](#练习-11权限检查装饰器) | ⭐⭐⭐ | Ch04 装饰器 |
| 12 | [数据库连接管理器](#练习-12数据库连接管理器) | ⭐⭐ | Ch05 上下文管理器 |
| 13 | [临时目录上下文](#练习-13临时目录上下文) | ⭐⭐ | Ch05 上下文管理器 |
| 14 | [泛型栈](#练习-14泛型栈) | ⭐⭐ | Ch06 类型标注 |
| 15 | [Protocol 鸭子类型](#练习-15protocol-鸭子类型) | ⭐⭐⭐ | Ch06 类型标注 |
| 16 | [包结构设计](#练习-16包结构设计) | ⭐⭐ | Ch07 模块/包 |
| 17 | [惰性导入模块](#练习-17惰性导入模块) | ⭐⭐⭐ | Ch07 模块/包 |
| 18 | [计算器 TDD](#练习-18计算器-tdd) | ⭐ | Ch08 pytest |
| 19 | [参数化测试](#练习-19参数化测试) | ⭐⭐ | Ch08 pytest |
| 20 | [Mock 外部 API](#练习-20mock-外部-api) | ⭐⭐⭐ | Ch08 pytest |
| 21 | [邮箱验证器](#练习-21邮箱验证器) | ⭐ | Ch09 正则 |
| 22 | [日志解析器](#练习-22日志解析器) | ⭐⭐ | Ch09 正则 |
| 23 | [Markdown 链接提取](#练习-23markdown-链接提取) | ⭐⭐ | Ch09 正则 |
| 24 | [dataclass 配置系统](#练习-24dataclass-配置系统) | ⭐⭐⭐ | Ch01 + Ch06 |
| 25 | [迷你 ORM](#练习-25迷你-orm) | ⭐⭐⭐ | 综合 |

---

## 练习 1：银行账户类

**难度**: ⭐ | **章节**: Ch01 OOP

实现一个 `BankAccount` 类：
- 属性：`owner`（户主）、`balance`（余额，默认 0）
- 方法：`deposit(amount)` 存款、`withdraw(amount)` 取款
- 取款时余额不足应抛出 `ValueError`
- 实现 `__repr__` 和 `__str__`

```python
acc = BankAccount("Alice", 1000)
acc.deposit(500)
acc.withdraw(200)
print(acc)           # Alice 的账户: 余额 ¥1300.00
print(acc.balance)   # 1300
```

<details>
<summary>💡 提示</summary>

- `deposit` 和 `withdraw` 应校验 `amount > 0`
- `__str__` 返回用户友好的格式
- `__repr__` 返回可重建对象的表示
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import logging

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


class BankAccount:
    """银行账户模型。"""

    def __init__(self, owner: str, balance: float = 0) -> None:
        self.owner: str = owner
        self.balance: float = balance
        logger.info(f"[BankAccount] 创建账户: {owner}, 余额={balance}")

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError(f"存款金额必须为正: {amount}")
        self.balance += amount
        logger.info(f"[BankAccount] 存款 {amount}, 余额={self.balance}")

    def withdraw(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError(f"取款金额必须为正: {amount}")
        if amount > self.balance:
            raise ValueError(f"余额不足: 余额={self.balance}, 取款={amount}")
        self.balance -= amount
        logger.info(f"[BankAccount] 取款 {amount}, 余额={self.balance}")

    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self.balance})"

    def __str__(self) -> str:
        return f"{self.owner} 的账户: 余额 ¥{self.balance:.2f}"
```

</details>

---

## 练习 2：形状继承体系

**难度**: ⭐⭐ | **章节**: Ch01 OOP

设计一个形状继承体系：
- 抽象基类 `Shape`，带抽象方法 `area()` 和 `perimeter()`
- 子类 `Circle`、`Rectangle`、`Triangle`
- 实现 `__str__` 返回形状描述
- 写一个函数 `total_area(shapes: list[Shape]) -> float` 计算总面积

```python
shapes = [Circle(5), Rectangle(3, 4), Triangle(3, 4, 5)]
print(total_area(shapes))  # 78.54 + 12 + 6 = 96.54
```

<details>
<summary>💡 提示</summary>

- 使用 `abc.ABC` 和 `@abstractmethod`
- `Triangle` 面积用海伦公式：`s = (a+b+c)/2`, `area = sqrt(s*(s-a)*(s-b)*(s-c))`
- `total_area` 利用多态，不需要类型检查
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from __future__ import annotations

import math
from abc import ABC, abstractmethod


class Shape(ABC):
    """形状抽象基类。"""

    @abstractmethod
    def area(self) -> float: ...

    @abstractmethod
    def perimeter(self) -> float: ...


class Circle(Shape):
    def __init__(self, radius: float) -> None:
        self.radius = radius

    def area(self) -> float:
        return math.pi * self.radius ** 2

    def perimeter(self) -> float:
        return 2 * math.pi * self.radius

    def __str__(self) -> str:
        return f"Circle(r={self.radius})"


class Rectangle(Shape):
    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height

    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

    def __str__(self) -> str:
        return f"Rectangle({self.width}x{self.height})"


class Triangle(Shape):
    def __init__(self, a: float, b: float, c: float) -> None:
        self.a, self.b, self.c = a, b, c

    def area(self) -> float:
        s = (self.a + self.b + self.c) / 2
        return math.sqrt(s * (s - self.a) * (s - self.b) * (s - self.c))

    def perimeter(self) -> float:
        return self.a + self.b + self.c

    def __str__(self) -> str:
        return f"Triangle({self.a}, {self.b}, {self.c})"


def total_area(shapes: list[Shape]) -> float:
    """✅ 多态：不需要 isinstance 检查。"""
    return sum(s.area() for s in shapes)
```

</details>

---

## 练习 3：Mixin 日志注入

**难度**: ⭐⭐ | **章节**: Ch01 OOP

创建一个 `LogMixin`，让任何类自动获得日志能力：
- 提供 `self.log` 属性，返回以类名为 name 的 logger
- 创建 `User` 和 `Product` 类混入 `LogMixin`
- 在方法中使用 `self.log.info(...)` 记录日志

<details>
<summary>💡 提示</summary>

- `LogMixin` 中用 `@property` 定义 `log`
- `type(self).__name__` 获取实际类名
- Mixin 类通常不定义 `__init__`
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import logging

logging.basicConfig(level=logging.INFO, format="[%(name)s] %(message)s")


class LogMixin:
    """日志混入类 — 为子类提供 self.log 属性。"""

    @property
    def log(self) -> logging.Logger:
        return logging.getLogger(type(self).__name__)


class User(LogMixin):
    def __init__(self, name: str) -> None:
        self.name = name
        self.log.info(f"创建用户: {name}")

    def greet(self) -> str:
        msg = f"Hello, {self.name}!"
        self.log.info(f"打招呼: {msg}")
        return msg


class Product(LogMixin):
    def __init__(self, name: str, price: float) -> None:
        self.name = name
        self.price = price
        self.log.info(f"创建产品: {name}, ¥{price}")

# 使用
user = User("Alice")    # [User] 创建用户: Alice
user.greet()             # [User] 打招呼: Hello, Alice!
prod = Product("Book", 49.9)  # [Product] 创建产品: Book, ¥49.9
```

</details>

---

## 练习 4：自定义 Money 类

**难度**: ⭐⭐ | **章节**: Ch02 魔术方法

实现一个 `Money` 类：
- 支持 `+`, `-` 运算（同币种）
- 支持 `*`（标量乘法）
- 支持 `==` 比较和 `hash`
- 不同币种相加应抛出 `TypeError`
- 实现 `__repr__`、`__str__`、`__format__`

```python
m1 = Money(100, "CNY")
m2 = Money(50, "CNY")
print(m1 + m2)      # ¥150.00
print(m1 * 3)       # ¥300.00
print(f"{m1:.0f}")  # ¥100
```

<details>
<summary>💡 提示</summary>

- 用 `__add__` 检查 `isinstance` 和 `currency` 是否相同
- `__mul__` 只接受 `int | float`，返回 `NotImplemented` 让 `__rmul__` 处理
- `__hash__` 用 `hash((self.amount, self.currency))`
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from __future__ import annotations


class Money:
    """货币类 — 演示完整的运算符重载。"""

    __slots__ = ("amount", "currency")

    SYMBOLS: dict[str, str] = {"CNY": "¥", "USD": "$", "EUR": "€"}

    def __init__(self, amount: float, currency: str = "CNY") -> None:
        self.amount = float(amount)
        self.currency = currency.upper()

    def _check_currency(self, other: Money) -> None:
        if self.currency != other.currency:
            raise TypeError(f"不能混合 {self.currency} 和 {other.currency}")

    def __add__(self, other: Money) -> Money:
        if not isinstance(other, Money):
            return NotImplemented
        self._check_currency(other)
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other: Money) -> Money:
        if not isinstance(other, Money):
            return NotImplemented
        self._check_currency(other)
        return Money(self.amount - other.amount, self.currency)

    def __mul__(self, scalar: int | float) -> Money:
        if isinstance(scalar, (int, float)):
            return Money(self.amount * scalar, self.currency)
        return NotImplemented

    def __rmul__(self, scalar: int | float) -> Money:
        return self.__mul__(scalar)

    def __eq__(self, other: object) -> bool:
        if isinstance(other, Money):
            return self.amount == other.amount and self.currency == other.currency
        return NotImplemented

    def __hash__(self) -> int:
        return hash((self.amount, self.currency))

    def __repr__(self) -> str:
        return f"Money({self.amount}, {self.currency!r})"

    def __str__(self) -> str:
        symbol = self.SYMBOLS.get(self.currency, self.currency)
        return f"{symbol}{self.amount:.2f}"

    def __format__(self, fmt_spec: str) -> str:
        symbol = self.SYMBOLS.get(self.currency, self.currency)
        return f"{symbol}{format(self.amount, fmt_spec)}"
```

</details>

---

## 练习 5：有序集合

**难度**: ⭐⭐⭐ | **章节**: Ch02 魔术方法

实现一个 `OrderedSet` 类，保持插入顺序的集合：
- 支持 `len(s)`、`item in s`、`for item in s`
- 支持 `s[i]` 索引访问
- 支持 `s.add(item)`、`s.discard(item)`
- 支持 `|`（并集）和 `&`（交集）
- 元素唯一，保持插入顺序

```python
s = OrderedSet([3, 1, 4, 1, 5])
print(list(s))   # [3, 1, 4, 5]
print(len(s))    # 4
print(3 in s)    # True
print(s[2])      # 4
```

<details>
<summary>💡 提示</summary>

- 内部用 `dict` 保持顺序（Python 3.7+ dict 有序）
- `__contains__` 检查 `in`
- `__or__` 实现并集，`__and__` 实现交集
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from __future__ import annotations

from typing import Iterator, Iterable, Any


class OrderedSet:
    """保持插入顺序的集合。"""

    def __init__(self, iterable: Iterable[Any] | None = None) -> None:
        self._data: dict[Any, None] = {}
        if iterable:
            for item in iterable:
                self._data[item] = None

    def add(self, item: Any) -> None:
        self._data[item] = None

    def discard(self, item: Any) -> None:
        self._data.pop(item, None)

    def __contains__(self, item: Any) -> bool:
        return item in self._data

    def __len__(self) -> int:
        return len(self._data)

    def __iter__(self) -> Iterator[Any]:
        return iter(self._data)

    def __getitem__(self, index: int) -> Any:
        return list(self._data.keys())[index]

    def __or__(self, other: OrderedSet) -> OrderedSet:
        """✅ 并集: s1 | s2"""
        result = OrderedSet(self)
        for item in other:
            result.add(item)
        return result

    def __and__(self, other: OrderedSet) -> OrderedSet:
        """✅ 交集: s1 & s2"""
        return OrderedSet(item for item in self if item in other)

    def __repr__(self) -> str:
        return f"OrderedSet({list(self._data.keys())})"

    def __eq__(self, other: object) -> bool:
        if isinstance(other, OrderedSet):
            return list(self._data) == list(other._data)
        return NotImplemented
```

</details>

---

## 练习 6：斐波那契迭代器

**难度**: ⭐ | **章节**: Ch03 迭代器/生成器

用两种方式实现斐波那契数列：
1. **迭代器类**：实现 `__iter__` 和 `__next__`
2. **生成器函数**：使用 `yield`

两者都应支持指定最大值 `max_val`。

```python
for n in fib_gen(100):
    print(n, end=" ")  # 0 1 1 2 3 5 8 13 21 34 55 89
```

<details>
<summary>💡 提示</summary>

- 迭代器类需要在 `__next__` 中维护 `a, b = b, a + b` 状态
- 生成器函数用 `while a <= max_val: yield a` 更简洁
- 对比两种实现的代码量
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Iterator


# ❌ 方式 1：迭代器类（代码较多）
class FibIterator:
    """斐波那契迭代器类。"""

    def __init__(self, max_val: int) -> None:
        self.max_val = max_val
        self.a: int = 0
        self.b: int = 1

    def __iter__(self) -> "FibIterator":
        return self

    def __next__(self) -> int:
        if self.a > self.max_val:
            raise StopIteration
        result = self.a
        self.a, self.b = self.b, self.a + self.b
        return result


# ✅ 方式 2：生成器函数（简洁优雅）
def fib_gen(max_val: int) -> Iterator[int]:
    """斐波那契生成器 — 惰性、简洁。"""
    a, b = 0, 1
    while a <= max_val:
        yield a
        a, b = b, a + b


# 两种方式结果相同
print(list(FibIterator(100)))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
print(list(fib_gen(100)))      # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
```

</details>

---

## 练习 7：文件分块读取器

**难度**: ⭐⭐ | **章节**: Ch03 迭代器/生成器

写一个生成器函数 `read_chunks(filepath, chunk_size=1024)`：
- 每次 yield 一块 `chunk_size` 字节的数据
- 使用生成器实现惰性读取，不会一次性加载整个文件
- 最后不足 `chunk_size` 的部分也要 yield

```python
for chunk in read_chunks("big_file.txt", chunk_size=4096):
    process(chunk)
```

<details>
<summary>💡 提示</summary>

- 用 `with open(filepath, "rb")` 以二进制模式打开
- `while chunk := f.read(chunk_size):` 使用海象运算符
- 生成器天然适合处理大文件：内存占用恒定
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import logging
from pathlib import Path
from typing import Iterator

logger = logging.getLogger(__name__)


def read_chunks(filepath: str | Path, chunk_size: int = 1024) -> Iterator[bytes]:
    """分块读取文件的生成器。

    ✅ 内存占用恒定，无论文件多大。
    """
    filepath = Path(filepath)
    total_read = 0

    with open(filepath, "rb") as f:
        while chunk := f.read(chunk_size):
            total_read += len(chunk)
            logger.debug(f"读取 {len(chunk)} 字节, 累计 {total_read}")
            yield chunk

    logger.info(f"读取完成: {filepath.name}, 共 {total_read} 字节")


# ❌ 反面教材：一次性全部读入内存
def read_all_at_once(filepath: str) -> bytes:
    """这样做会在大文件时爆内存！"""
    with open(filepath, "rb") as f:
        return f.read()  # 100GB 文件 → 100GB 内存
```

</details>

---

## 练习 8：无限素数生成器

**难度**: ⭐⭐ | **章节**: Ch03 迭代器/生成器

实现一个无限素数生成器 `primes()`：
- 使用 `yield` 逐个产出素数
- 结合 `itertools.islice` 获取前 N 个素数
- 实现筛法优化（只检查到 sqrt(n)）

```python
from itertools import islice
print(list(islice(primes(), 10)))  # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

<details>
<summary>💡 提示</summary>

- 判断素数时只需检查到 `int(n**0.5) + 1`
- 无限生成器用 `while True` 或递增的计数器
- 可以维护一个已知素数列表做优化
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import math
from itertools import islice
from typing import Iterator


def primes() -> Iterator[int]:
    """无限素数生成器。

    ✅ 惰性求值：只在需要时计算下一个素数。
    """
    yield 2
    known: list[int] = [2]
    candidate = 3

    while True:
        limit = math.isqrt(candidate)
        is_prime = True
        for p in known:
            if p > limit:
                break
            if candidate % p == 0:
                is_prime = False
                break

        if is_prime:
            known.append(candidate)
            yield candidate

        candidate += 2  # 跳过偶数


# 获取前 20 个素数
print(list(islice(primes(), 20)))
```

</details>

---

## 练习 9：计时装饰器

**难度**: ⭐ | **章节**: Ch04 装饰器

实现一个 `@timer` 装饰器：
- 记录函数执行时间
- 打印函数名和耗时
- 使用 `functools.wraps` 保留元信息

```python
@timer
def slow_function():
    import time; time.sleep(0.5)

slow_function()  # [timer] slow_function 耗时 0.50s
```

<details>
<summary>💡 提示</summary>

- 用 `time.perf_counter()` 精确计时
- `functools.wraps(func)` 装饰内部 wrapper
- 这是最基础的装饰器模式，务必掌握
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import functools
import logging
import time
from typing import Any, Callable

logger = logging.getLogger(__name__)


def timer(func: Callable[..., Any]) -> Callable[..., Any]:
    """✅ 计时装饰器 — 记录函数执行时间。"""

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info(f"[timer] {func.__name__} 耗时 {elapsed:.2f}s")
        return result

    return wrapper


@timer
def compute(n: int) -> int:
    """计算 1+2+...+n"""
    return sum(range(n + 1))

print(compute(1_000_000))
```

</details>

---

## 练习 10：重试装饰器

**难度**: ⭐⭐ | **章节**: Ch04 装饰器

实现一个带参数的 `@retry(max_attempts=3, delay=1.0)` 装饰器：
- 捕获异常后自动重试
- 支持指数退避（每次等待时间翻倍）
- 所有重试失败后抛出最后一个异常

```python
@retry(max_attempts=3, delay=0.5)
def unstable_api():
    if random.random() < 0.7:
        raise ConnectionError("连接失败")
    return "success"
```

<details>
<summary>💡 提示</summary>

- 带参数的装饰器需要三层嵌套
- 外层接收参数 → 中层接收函数 → 内层接收调用参数
- 指数退避: `delay * 2 ** attempt`
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import functools
import logging
import time
from typing import Any, Callable

logger = logging.getLogger(__name__)


def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    exceptions: tuple[type[Exception], ...] = (Exception,),
) -> Callable:
    """✅ 带参数的重试装饰器 — 三层嵌套。"""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exception: Exception | None = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts:
                        wait = delay * (2 ** (attempt - 1))
                        logger.warning(
                            f"[retry] {func.__name__} 第 {attempt} 次失败: {e}, "
                            f"{wait:.1f}s 后重试"
                        )
                        time.sleep(wait)
                    else:
                        logger.error(
                            f"[retry] {func.__name__} 全部 {max_attempts} 次失败"
                        )
            raise last_exception  # type: ignore[misc]

        return wrapper
    return decorator
```

</details>

---

## 练习 11：权限检查装饰器

**难度**: ⭐⭐⭐ | **章节**: Ch04 装饰器

实现一个 `@require_role("admin")` 装饰器：
- 检查第一个参数（`user` 对象）是否有指定角色
- 没有权限时抛出 `PermissionError`
- 支持多角色：`@require_role("admin", "moderator")`

```python
@require_role("admin")
def delete_user(user: User, target_id: int) -> str:
    return f"用户 {target_id} 已删除"
```

<details>
<summary>💡 提示</summary>

- 使用 `*roles` 接收多个角色
- 假设 `user` 对象有 `role` 属性
- 装饰器检查 `user.role in roles`
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import functools
from dataclasses import dataclass
from typing import Any, Callable


@dataclass
class User:
    name: str
    role: str


def require_role(*roles: str) -> Callable:
    """✅ 权限检查装饰器 — 检查用户角色。"""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(user: User, *args: Any, **kwargs: Any) -> Any:
            if user.role not in roles:
                raise PermissionError(
                    f"用户 {user.name} 角色为 {user.role!r}，"
                    f"需要 {roles} 之一"
                )
            return func(user, *args, **kwargs)
        return wrapper
    return decorator


@require_role("admin", "moderator")
def delete_post(user: User, post_id: int) -> str:
    return f"帖子 {post_id} 已被 {user.name} 删除"


# ✅ 有权限
admin = User("Alice", "admin")
print(delete_post(admin, 42))

# ❌ 无权限 → PermissionError
try:
    viewer = User("Bob", "viewer")
    delete_post(viewer, 42)
except PermissionError as e:
    print(f"权限错误: {e}")
```

</details>

---

## 练习 12：数据库连接管理器

**难度**: ⭐⭐ | **章节**: Ch05 上下文管理器

用两种方式实现数据库连接上下文管理器：
1. **类实现**：`__enter__` / `__exit__`
2. **生成器实现**：`@contextmanager`

需要在 `__exit__` 中正确处理异常（出异常时 rollback，正常时 commit）。

<details>
<summary>💡 提示</summary>

- `__exit__` 接收 `exc_type, exc_val, exc_tb` 三个参数
- 有异常时 rollback，无异常时 commit
- 生成器版本用 `try/except` 包裹 `yield`
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import logging
from contextlib import contextmanager
from typing import Iterator

logger = logging.getLogger(__name__)


# 模拟数据库连接
class FakeConnection:
    def execute(self, sql: str) -> None:
        logger.info(f"[DB] 执行: {sql}")

    def commit(self) -> None:
        logger.info("[DB] COMMIT")

    def rollback(self) -> None:
        logger.info("[DB] ROLLBACK")

    def close(self) -> None:
        logger.info("[DB] 关闭连接")


# 方式 1：类实现
class DBConnection:
    """✅ 类实现的数据库连接上下文管理器。"""

    def __enter__(self) -> FakeConnection:
        self.conn = FakeConnection()
        logger.info("[DB] 打开连接")
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        if exc_type is not None:
            self.conn.rollback()
            logger.error(f"[DB] 异常: {exc_val}")
        else:
            self.conn.commit()
        self.conn.close()
        return False  # 不吞掉异常


# 方式 2：生成器实现
@contextmanager
def db_connection() -> Iterator[FakeConnection]:
    """✅ 生成器实现 — 更简洁。"""
    conn = FakeConnection()
    logger.info("[DB] 打开连接")
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"[DB] 异常: {e}")
        raise
    finally:
        conn.close()
```

</details>

---

## 练习 13：临时目录上下文

**难度**: ⭐⭐ | **章节**: Ch05 上下文管理器

实现一个 `@contextmanager` 的 `temp_directory()` 上下文管理器：
- 创建临时目录
- yield 目录路径
- 退出时自动删除目录及其中的所有文件

```python
with temp_directory() as tmpdir:
    (tmpdir / "test.txt").write_text("hello")
    print(tmpdir.exists())  # True
print(tmpdir.exists())      # False — 已被清理
```

<details>
<summary>💡 提示</summary>

- 使用 `tempfile.mkdtemp()` 创建临时目录
- `shutil.rmtree()` 递归删除
- `finally` 确保清理
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import shutil
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


@contextmanager
def temp_directory(prefix: str = "tmp_") -> Iterator[Path]:
    """✅ 临时目录上下文管理器 — 退出时自动清理。"""
    tmpdir = Path(tempfile.mkdtemp(prefix=prefix))
    print(f"创建临时目录: {tmpdir}")
    try:
        yield tmpdir
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)
        print(f"清理临时目录: {tmpdir}")


# 使用
with temp_directory() as d:
    f = d / "data.txt"
    f.write_text("hello world")
    print(f"文件存在: {f.exists()}")   # True

print(f"目录存在: {d.exists()}")       # False
```

</details>

---

## 练习 14：泛型栈

**难度**: ⭐⭐ | **章节**: Ch06 类型标注

用 `TypeVar` 和 `Generic` 实现一个类型安全的泛型栈：
- `push(item: T)`, `pop() -> T`, `peek() -> T`
- 空栈 `pop()` 抛出 `IndexError`
- 支持 `len()` 和 `bool()` 判空

```python
stack: Stack[int] = Stack()
stack.push(1)
stack.push(2)
print(stack.pop())  # 2
```

<details>
<summary>💡 提示</summary>

- `T = TypeVar("T")`, 类继承 `Generic[T]`
- 内部用 `list[T]` 存储
- `mypy` 可以检查 `Stack[int].push("str")` 报错
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from typing import TypeVar, Generic

T = TypeVar("T")


class Stack(Generic[T]):
    """✅ 泛型栈 — 类型安全的 LIFO 容器。"""

    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self) -> T:
        if not self._items:
            raise IndexError("peek at empty stack")
        return self._items[-1]

    def __len__(self) -> int:
        return len(self._items)

    def __bool__(self) -> bool:
        return bool(self._items)

    def __repr__(self) -> str:
        return f"Stack({self._items})"


# ✅ mypy 会检查类型
int_stack: Stack[int] = Stack()
int_stack.push(42)
int_stack.push(17)
print(int_stack.pop())   # 17
print(len(int_stack))    # 1

# ❌ mypy 会报错（运行时不会）
# int_stack.push("hello")
```

</details>

---

## 练习 15：Protocol 鸭子类型

**难度**: ⭐⭐⭐ | **章节**: Ch06 类型标注

定义一个 `Drawable` Protocol 和一个 `render` 函数：
- `Drawable` 要求有 `draw(canvas: str) -> str` 方法
- 创建 `Circle` 和 `Text` 类（不继承 `Drawable`）
- `render(items: list[Drawable])` 渲染所有可绘制对象

```python
items: list[Drawable] = [Circle(5), Text("hello")]
render(items)  # 结构化子类型 — 不需要继承
```

<details>
<summary>💡 提示</summary>

- `Protocol` 来自 `typing`
- 只要类实现了 `draw` 方法，就满足 `Drawable` 协议
- 这就是"鸭子类型"的类型标注版本
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Protocol


class Drawable(Protocol):
    """✅ 结构化子类型协议 — 不需要继承。"""
    def draw(self, canvas: str) -> str: ...


class Circle:
    """不继承 Drawable，但实现了 draw 方法。"""
    def __init__(self, radius: float) -> None:
        self.radius = radius

    def draw(self, canvas: str) -> str:
        return f"[{canvas}] 绘制圆形 r={self.radius}"


class Text:
    """不继承 Drawable，但实现了 draw 方法。"""
    def __init__(self, content: str) -> None:
        self.content = content

    def draw(self, canvas: str) -> str:
        return f"[{canvas}] 绘制文本: {self.content}"


def render(items: list[Drawable], canvas: str = "main") -> None:
    """✅ 接受任何满足 Drawable 协议的对象。"""
    for item in items:
        print(item.draw(canvas))


# 类型检查通过 — Circle 和 Text 都满足 Drawable 协议
render([Circle(10), Text("Hello"), Circle(3)])
```

</details>

---

## 练习 16：包结构设计

**难度**: ⭐⭐ | **章节**: Ch07 模块/包

设计一个 `mathtools` 包的 `__init__.py`：
- 包含 `geometry` 和 `statistics` 子模块
- `__init__.py` 暴露常用 API：`from mathtools import circle_area, mean`
- 定义 `__all__` 控制 `from mathtools import *` 的行为

<details>
<summary>💡 提示</summary>

- `__init__.py` 中用 `from .geometry import circle_area`
- `__all__` 是字符串列表
- 不在 `__all__` 中的名字不会被 `import *` 导出
</details>

<details>
<summary>✅ 参考答案</summary>

```python
# mathtools/__init__.py
"""mathtools — 数学工具包"""

from .geometry import circle_area, rectangle_area
from .statistics import mean, median, std_dev

__all__ = [
    "circle_area",
    "rectangle_area",
    "mean",
    "median",
    "std_dev",
]

__version__ = "0.1.0"


# mathtools/geometry.py
import math

def circle_area(radius: float) -> float:
    """计算圆的面积。"""
    return math.pi * radius ** 2

def rectangle_area(width: float, height: float) -> float:
    """计算矩形面积。"""
    return width * height


# mathtools/statistics.py
import math

def mean(data: list[float]) -> float:
    """计算平均值。"""
    return sum(data) / len(data)

def median(data: list[float]) -> float:
    """计算中位数。"""
    sorted_data = sorted(data)
    n = len(sorted_data)
    mid = n // 2
    if n % 2 == 0:
        return (sorted_data[mid - 1] + sorted_data[mid]) / 2
    return sorted_data[mid]

def std_dev(data: list[float]) -> float:
    """计算标准差。"""
    avg = mean(data)
    variance = sum((x - avg) ** 2 for x in data) / len(data)
    return math.sqrt(variance)
```

</details>

---

## 练习 17：惰性导入模块

**难度**: ⭐⭐⭐ | **章节**: Ch07 模块/包

实现一个 `lazy_import(module_name)` 函数：
- 返回一个代理对象
- 只在真正访问属性时才执行 `import`
- 用 `__getattr__` 实现惰性加载

```python
np = lazy_import("numpy")  # 此时不导入
arr = np.array([1, 2, 3])  # 此时才真正导入 numpy
```

<details>
<summary>💡 提示</summary>

- 创建一个 `LazyModule` 类
- `__getattr__` 中执行 `importlib.import_module`
- 导入后替换自身的 `__dict__` 或缓存模块
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import importlib
import logging
from types import ModuleType
from typing import Any

logger = logging.getLogger(__name__)


class LazyModule:
    """✅ 惰性导入 — 只在首次访问时才真正导入模块。"""

    def __init__(self, module_name: str) -> None:
        self._module_name = module_name
        self._module: ModuleType | None = None

    def _load(self) -> ModuleType:
        if self._module is None:
            logger.info(f"[LazyModule] 正在导入 {self._module_name}...")
            self._module = importlib.import_module(self._module_name)
        return self._module

    def __getattr__(self, name: str) -> Any:
        return getattr(self._load(), name)

    def __repr__(self) -> str:
        status = "已加载" if self._module else "未加载"
        return f"LazyModule({self._module_name!r}, {status})"


def lazy_import(module_name: str) -> LazyModule:
    """惰性导入模块。"""
    return LazyModule(module_name)


# 示例
json_mod = lazy_import("json")
print(repr(json_mod))                      # LazyModule('json', 未加载)
result = json_mod.dumps({"key": "value"})   # 此时才导入
print(result)                               # {"key": "value"}
print(repr(json_mod))                      # LazyModule('json', 已加载)
```

</details>

---

## 练习 18：计算器 TDD

**难度**: ⭐ | **章节**: Ch08 pytest

用 TDD (Test-Driven Development) 方式实现一个 `Calculator` 类：
1. 先写测试
2. 让测试失败（红）
3. 实现代码让测试通过（绿）
4. 重构

支持：`add`, `subtract`, `multiply`, `divide`（除零抛异常）。

<details>
<summary>💡 提示</summary>

- 先写 `test_calculator.py`，再写 `calculator.py`
- 用 `pytest.raises(ZeroDivisionError)` 测试除零
- TDD 流程：Red → Green → Refactor
</details>

<details>
<summary>✅ 参考答案</summary>

```python
# test_calculator.py
import pytest
from calculator import Calculator


class TestCalculator:
    def setup_method(self) -> None:
        self.calc = Calculator()

    def test_add(self) -> None:
        assert self.calc.add(2, 3) == 5

    def test_add_negative(self) -> None:
        assert self.calc.add(-1, -2) == -3

    def test_subtract(self) -> None:
        assert self.calc.subtract(10, 4) == 6

    def test_multiply(self) -> None:
        assert self.calc.multiply(3, 4) == 12

    def test_divide(self) -> None:
        assert self.calc.divide(10, 2) == 5.0

    def test_divide_by_zero(self) -> None:
        with pytest.raises(ZeroDivisionError):
            self.calc.divide(1, 0)


# calculator.py
class Calculator:
    """✅ 简单计算器 — TDD 驱动开发。"""

    def add(self, a: float, b: float) -> float:
        return a + b

    def subtract(self, a: float, b: float) -> float:
        return a - b

    def multiply(self, a: float, b: float) -> float:
        return a * b

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ZeroDivisionError("除数不能为零")
        return a / b
```

</details>

---

## 练习 19：参数化测试

**难度**: ⭐⭐ | **章节**: Ch08 pytest

为一个 `is_palindrome(s: str) -> bool` 函数编写参数化测试：
- 使用 `@pytest.mark.parametrize` 覆盖多种输入
- 包含：普通回文、空字符串、单字符、含空格、大小写混合
- 至少 10 个测试用例

<details>
<summary>💡 提示</summary>

- `@pytest.mark.parametrize("input_str, expected", [...])` 格式
- 函数应忽略大小写和空格
- 测试边界情况：空字符串、单个字符
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import pytest


def is_palindrome(s: str) -> bool:
    """检查是否为回文（忽略大小写和空格）。"""
    cleaned = s.replace(" ", "").lower()
    return cleaned == cleaned[::-1]


@pytest.mark.parametrize("input_str, expected", [
    ("racecar", True),
    ("hello", False),
    ("", True),
    ("a", True),
    ("A man a plan a canal Panama", True),
    ("Was It A Rat I Saw", True),
    ("python", False),
    ("aba", True),
    ("ab", False),
    ("noon", True),
    ("Noon", True),
    ("12321", True),
    ("12345", False),
])
def test_is_palindrome(input_str: str, expected: bool) -> None:
    assert is_palindrome(input_str) == expected
```

</details>

---

## 练习 20：Mock 外部 API

**难度**: ⭐⭐⭐ | **章节**: Ch08 pytest

测试一个调用外部 API 的函数，使用 `unittest.mock.patch` 模拟响应：
- `fetch_user(user_id)` 调用 `requests.get`
- 测试成功、404、网络异常三种情况
- 不真正发送 HTTP 请求

<details>
<summary>💡 提示</summary>

- `@patch("module.requests.get")` 替换 `requests.get`
- `mock_response.json.return_value = {...}`
- `mock_get.side_effect = ConnectionError` 模拟异常
</details>

<details>
<summary>✅ 参考答案</summary>

```python
# user_service.py
from typing import Any
import requests


def fetch_user(user_id: int) -> dict[str, Any] | None:
    """从外部 API 获取用户信息。"""
    try:
        resp = requests.get(f"https://api.example.com/users/{user_id}")
        if resp.status_code == 200:
            return resp.json()
        return None
    except requests.ConnectionError:
        return None


# test_user_service.py
from unittest.mock import patch, MagicMock
from user_service import fetch_user


@patch("user_service.requests.get")
def test_fetch_user_success(mock_get: MagicMock) -> None:
    """✅ 模拟成功响应。"""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"id": 1, "name": "Alice"}
    mock_get.return_value = mock_resp

    result = fetch_user(1)
    assert result == {"id": 1, "name": "Alice"}
    mock_get.assert_called_once_with("https://api.example.com/users/1")


@patch("user_service.requests.get")
def test_fetch_user_not_found(mock_get: MagicMock) -> None:
    """✅ 模拟 404 响应。"""
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    mock_get.return_value = mock_resp

    assert fetch_user(999) is None


@patch("user_service.requests.get")
def test_fetch_user_connection_error(mock_get: MagicMock) -> None:
    """✅ 模拟网络异常。"""
    import requests as req
    mock_get.side_effect = req.ConnectionError("网络不可用")

    assert fetch_user(1) is None
```

</details>

---

## 练习 21：邮箱验证器

**难度**: ⭐ | **章节**: Ch09 正则

用正则表达式实现一个 `validate_email(email: str) -> bool` 函数：
- 支持常见邮箱格式：`user@domain.com`
- 用户名部分支持字母、数字、`.`、`_`、`-`
- 域名部分支持多级域名：`sub.domain.com`

```python
assert validate_email("user@example.com") == True
assert validate_email("u.name@sub.domain.co") == True
assert validate_email("@invalid.com") == False
assert validate_email("no-at-sign") == False
```

<details>
<summary>💡 提示</summary>

- 模式：`^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- 使用 `re.match` 或 `re.fullmatch`
- 注意锚点 `^` 和 `$`
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import re


# ✅ 编译正则以提高性能（多次调用时）
EMAIL_PATTERN = re.compile(
    r"^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)


def validate_email(email: str) -> bool:
    """验证邮箱格式。"""
    return bool(EMAIL_PATTERN.match(email))


# 测试
test_cases = [
    ("user@example.com", True),
    ("u.name@sub.domain.co", True),
    ("user_name@company.org", True),
    ("@invalid.com", False),
    ("no-at-sign", False),
    ("user@", False),
    ("user@.com", False),
    ("", False),
]

for email, expected in test_cases:
    result = validate_email(email)
    icon = "✅" if result == expected else "❌"
    print(f"{icon} validate_email({email!r}) = {result}")
```

</details>

---

## 练习 22：日志解析器

**难度**: ⭐⭐ | **章节**: Ch09 正则

用正则表达式解析 Nginx 风格的访问日志：

```
192.168.1.1 - - [10/Oct/2023:13:55:36 +0000] "GET /api/users HTTP/1.1" 200 1234
```

提取：IP、时间戳、方法、路径、状态码、字节数。

<details>
<summary>💡 提示</summary>

- 使用命名捕获组 `(?P<name>...)`
- IP: `\d{1,3}(\.\d{1,3}){3}`
- 方法: `GET|POST|PUT|DELETE|PATCH`
- `re.VERBOSE` 让长正则更可读
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import re
from dataclasses import dataclass


@dataclass
class LogEntry:
    ip: str
    timestamp: str
    method: str
    path: str
    status: int
    bytes_sent: int


# ✅ 使用 re.VERBOSE 提高可读性
LOG_PATTERN = re.compile(r"""
    (?P<ip>\d{1,3}(?:\.\d{1,3}){3})   # IP 地址
    \s-\s-\s
    \[(?P<timestamp>[^\]]+)\]           # 时间戳
    \s"
    (?P<method>\w+)                     # HTTP 方法
    \s
    (?P<path>\S+)                       # 请求路径
    \s
    HTTP/[\d.]+"
    \s
    (?P<status>\d{3})                   # 状态码
    \s
    (?P<bytes>\d+)                      # 字节数
""", re.VERBOSE)


def parse_log_line(line: str) -> LogEntry | None:
    """解析单行日志。"""
    match = LOG_PATTERN.match(line)
    if not match:
        return None
    return LogEntry(
        ip=match["ip"],
        timestamp=match["timestamp"],
        method=match["method"],
        path=match["path"],
        status=int(match["status"]),
        bytes_sent=int(match["bytes"]),
    )


# 测试
log = '192.168.1.1 - - [10/Oct/2023:13:55:36 +0000] "GET /api/users HTTP/1.1" 200 1234'
entry = parse_log_line(log)
print(entry)
# LogEntry(ip='192.168.1.1', timestamp='10/Oct/2023:13:55:36 +0000',
#          method='GET', path='/api/users', status=200, bytes_sent=1234)
```

</details>

---

## 练习 23：Markdown 链接提取

**难度**: ⭐⭐ | **章节**: Ch09 正则

用正则从 Markdown 文本中提取所有链接：
- 格式：`[文本](URL)`
- 返回 `list[tuple[str, str]]`（文本和 URL 对）
- 处理嵌套方括号和特殊字符

```python
text = "Visit [Google](https://google.com) or [Python](https://python.org)."
links = extract_links(text)
# [("Google", "https://google.com"), ("Python", "https://python.org")]
```

<details>
<summary>💡 提示</summary>

- 模式：`\[([^\]]+)\]\(([^)]+)\)`
- `[^\]]` 匹配非 `]` 的字符
- `re.findall` 返回所有捕获组的元组列表
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import re


LINK_PATTERN = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def extract_links(text: str) -> list[tuple[str, str]]:
    """从 Markdown 文本中提取所有链接。"""
    return LINK_PATTERN.findall(text)


# 测试
md_text = """
# 学习资源

- [Python 官方文档](https://docs.python.org/3/)
- [Real Python](https://realpython.com)
- [Fluent Python](https://www.oreilly.com/library/view/fluent-python)

参考 [PEP 8](https://peps.python.org/pep-0008/) 风格指南。
"""

for text, url in extract_links(md_text):
    print(f"✅ 文本: {text:20s} → URL: {url}")
```

</details>

---

## 练习 24：dataclass 配置系统

**难度**: ⭐⭐⭐ | **章节**: Ch01 + Ch06 综合

用 `dataclass` 和类型标注实现一个配置系统：
- `AppConfig` 包含嵌套配置（`DatabaseConfig`, `ServerConfig`）
- 支持从字典加载：`AppConfig.from_dict(data)`
- 支持默认值和验证
- 使用 `__post_init__` 做校验

```python
config = AppConfig.from_dict({
    "debug": True,
    "server": {"host": "0.0.0.0", "port": 8080},
    "database": {"url": "sqlite:///app.db"},
})
```

<details>
<summary>💡 提示</summary>

- `@dataclass` 自动生成 `__init__`
- `__post_init__` 在 `__init__` 之后运行，适合校验
- `@classmethod` 实现 `from_dict` 工厂方法
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class DatabaseConfig:
    url: str = "sqlite:///default.db"
    pool_size: int = 5
    echo: bool = False

    def __post_init__(self) -> None:
        if self.pool_size < 1:
            raise ValueError(f"pool_size 必须 >= 1, 得到 {self.pool_size}")


@dataclass
class ServerConfig:
    host: str = "127.0.0.1"
    port: int = 8000
    workers: int = 4

    def __post_init__(self) -> None:
        if not (1024 <= self.port <= 65535):
            raise ValueError(f"端口范围 1024-65535, 得到 {self.port}")


@dataclass
class AppConfig:
    debug: bool = False
    server: ServerConfig = field(default_factory=ServerConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> AppConfig:
        """✅ 从字典创建配置 — 支持嵌套。"""
        server_data = data.get("server", {})
        db_data = data.get("database", {})
        return cls(
            debug=data.get("debug", False),
            server=ServerConfig(**server_data),
            database=DatabaseConfig(**db_data),
        )


# 使用
config = AppConfig.from_dict({
    "debug": True,
    "server": {"host": "0.0.0.0", "port": 8080},
    "database": {"url": "postgresql://localhost/mydb", "pool_size": 10},
})
print(config)
print(f"Server: {config.server.host}:{config.server.port}")
print(f"DB: {config.database.url}")
```

</details>

---

## 练习 25：迷你 ORM

**难度**: ⭐⭐⭐ | **章节**: 综合

实现一个迷你 ORM 系统，综合运用 Stage 2 全部知识点：
- 用 `dataclass` 定义模型
- 用装饰器 `@model` 注册模型
- 用魔术方法支持 `__repr__`、`__eq__`
- 用上下文管理器管理事务
- 用类型标注保障安全
- 用 `pytest` 测试

```python
@model(table_name="users")
class User:
    id: int
    name: str
    email: str

db = Database(":memory:")
with db.transaction():
    db.insert(User(id=1, name="Alice", email="alice@test.com"))
    users = db.select(User)
```

<details>
<summary>💡 提示</summary>

- `@model` 装饰器给类添加 `__table_name__` 属性
- `Database` 用 `sqlite3` 操作
- 事务用上下文管理器实现
- 这是综合题，建议每个部分独立实现后再组合
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from __future__ import annotations

import sqlite3
import logging
from contextlib import contextmanager
from dataclasses import dataclass, fields
from typing import Any, Iterator, TypeVar, Type

logger = logging.getLogger(__name__)
T = TypeVar("T")


def model(table_name: str):
    """✅ 模型注册装饰器 — 给 dataclass 添加表名。"""
    def decorator(cls):
        cls = dataclass(cls)
        cls.__table_name__ = table_name
        return cls
    return decorator


@model(table_name="users")
class User:
    id: int
    name: str
    email: str


class Database:
    """✅ 迷你 ORM — 综合运用 Stage 2 知识点。"""

    def __init__(self, db_path: str = ":memory:") -> None:
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        logger.info(f"[DB] 连接到 {db_path}")

    @contextmanager
    def transaction(self) -> Iterator[None]:
        """✅ 事务上下文管理器。"""
        try:
            yield
            self.conn.commit()
            logger.info("[DB] COMMIT")
        except Exception as e:
            self.conn.rollback()
            logger.error(f"[DB] ROLLBACK: {e}")
            raise

    def create_table(self, model_cls: type) -> None:
        """根据 dataclass 字段自动建表。"""
        table = model_cls.__table_name__  # type: ignore[attr-defined]
        cols = ", ".join(f"{f.name} TEXT" for f in fields(model_cls))
        sql = f"CREATE TABLE IF NOT EXISTS {table} ({cols})"
        self.conn.execute(sql)
        logger.info(f"[DB] 建表: {table}")

    def insert(self, obj: Any) -> None:
        """插入一条记录。"""
        table = type(obj).__table_name__  # type: ignore[attr-defined]
        fs = fields(obj)
        cols = ", ".join(f.name for f in fs)
        placeholders = ", ".join("?" for _ in fs)
        values = tuple(getattr(obj, f.name) for f in fs)
        self.conn.execute(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})", values)

    def select(self, model_cls: Type[T]) -> list[T]:
        """查询所有记录。"""
        table = model_cls.__table_name__  # type: ignore[attr-defined]
        rows = self.conn.execute(f"SELECT * FROM {table}").fetchall()
        return [model_cls(**dict(row)) for row in rows]  # type: ignore[call-arg]

    def close(self) -> None:
        self.conn.close()


# 使用
db = Database()
db.create_table(User)

with db.transaction():
    db.insert(User(id=1, name="Alice", email="alice@test.com"))
    db.insert(User(id=2, name="Bob", email="bob@test.com"))

users = db.select(User)
for u in users:
    print(u)

db.close()
```

</details>

---

## 自我评估

完成所有练习后，检查以下清单：

- [ ] **OOP** — 能正确使用继承、组合、Mixin、`dataclass`
- [ ] **魔术方法** — 能实现 `__repr__`/`__eq__`/`__hash__`/容器协议
- [ ] **迭代器/生成器** — 能用生成器处理大数据流
- [ ] **装饰器** — 能写带参数的装饰器，理解三层嵌套
- [ ] **上下文管理器** — 能用类和 `@contextmanager` 两种方式实现
- [ ] **类型标注** — 能使用 `TypeVar`/`Generic`/`Protocol`
- [ ] **模块/包** — 理解 `__init__.py`/`__all__`/导入机制
- [ ] **pytest** — 能写参数化测试、fixture、mock
- [ ] **正则表达式** — 能写中等复杂度的正则，理解命名捕获组

> 正确率 >= 80% 即可进入 Stage 3！
