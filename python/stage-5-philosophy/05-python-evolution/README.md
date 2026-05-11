# 第 5 章：Python 语言演进

> *"Those who cannot remember the past are condemned to repeat it."*
> — George Santayana
>
> 每一门编程语言都是一部活的历史。
> Python 从 1991 年的一个个人项目，成长为全球最流行的编程语言之一。
> 这段旅程中有辉煌的创新，也有痛苦的教训。
> 理解 Python 的过去，你才能读懂它的现在，预见它的未来。

---

## 📖 本章内容

- [Python 2 到 Python 3 的大迁移](#python-2-到-python-3-的大迁移)
- [Python 3.6-3.13 关键特性回顾](#python-36-313-关键特性回顾)
- [PEP 流程：Python 如何进化](#pep-流程python-如何进化)
- [类型系统的演进](#类型系统的演进)
- [异步编程的演进](#异步编程的演进)
- [模式匹配](#模式匹配)
- [Python 的未来方向](#python-的未来方向)

---

## Python 2 到 Python 3 的大迁移

> 🎭 **The Drama：编程语言历史上最痛苦的迁移**
>
> 2006 年，Guido 宣布 Python 3.0 将打破向后兼容性。
> 他低估了这个决定的代价——这场迁移最终花了 **14 年**。
> Python 2.7 的 EOL（End of Life）到 2020 年 1 月 1 日才正式执行。
> 在编程语言的历史上，这可能是最成功的失败——或者最失败的成功。

### 为什么要打破兼容性

```
Python 2 的设计缺陷：

1. 字符串编码混乱
   Python 2: str 是字节串，unicode 是文本
   >>> "hello" + u"world"    # 有时成功，有时 UnicodeError
   >>> "café"                # 这是字节还是文本？取决于文件编码
   Python 3: str 是文本（Unicode），bytes 是字节
   → 干净、明确、不再困惑

2. print 是语句
   Python 2: print "hello"       # 语句
   Python 3: print("hello")      # 函数调用
   → 可以传参、赋值、作为参数传递

3. 整数除法
   Python 2: 3 / 2 == 1          # 整数除法！
   Python 3: 3 / 2 == 1.5        # 真正的除法
              3 // 2 == 1         # 整数除法用 //
   → 消除了无数新手的困惑

4. range() 返回列表
   Python 2: range(1000000)       # 创建百万元素列表！
   Python 3: range(1000000)       # 惰性生成器
   → 内存友好

5. 默认编码
   Python 2: ASCII（默认）
   Python 3: UTF-8（默认）
   → 全球化友好
```

### 迁移的痛苦

```
迁移时间线：

2008  Python 3.0 发布
      → 生态几乎为零，没有第三方库支持
      → 社区反应冷淡

2009  Python 3.1 修复了一些兼容性问题
      → 但 NumPy, Django, Flask 等仍只支持 Python 2
      → "我们等库迁移了再说"

2010  six 库发布（兼容 2 和 3 的中间层）
2012  Django 开始支持 Python 3
2014  Python 2/3 使用率约 50/50
      → 终于出现拐点

2015  pip 默认从 Python 3 安装
2017  大部分主流库都支持 Python 3
2018  NumPy, Pandas 宣布停止支持 Python 2
2020  Python 2 正式 EOL
      → 14 年的迁移终于结束

教训：
├── 打破向后兼容性的代价远超预期
├── 生态迁移速度由最慢的关键库决定
├── 需要提供平滑的迁移路径和工具
└── "大爆炸"式变革不适合成熟的语言
```

### 迁移工具

```python
# 1. 2to3 —— 自动转换工具
# $ 2to3 -w my_script.py

# 2. six —— 兼容库
import six
if six.PY2:
    string_types = (str, unicode)
else:
    string_types = (str,)

# 3. __future__ —— 在 Python 2 中使用 Python 3 特性
from __future__ import print_function    # print() 函数
from __future__ import division          # 真正的除法
from __future__ import unicode_literals  # 字符串默认 Unicode
from __future__ import annotations       # 延迟注解求值 (3.7+)
```

> 🧠 **CS Master's Bridge：破坏性变革的经济学**
>
> Python 2→3 的迁移成本：
> - **直接成本**：修改代码、运行测试、修复 bug
> - **机会成本**：团队时间花在迁移而非新功能
> - **风险成本**：迁移过程中引入新 bug
> - **分裂成本**：社区分裂为 2 和 3 两个阵营
>
> 估算：全球 Python 社区在迁移上花费的总人时可能超过 **百万工程师年**。
>
> 其他语言从中吸取的教训：
> - **Rust**: 版本系统（Edition 2015/2018/2021），编译器自动适配
> - **Go**: "compatibility promise" + go fix 工具
> - **Java**: 极度保守的向后兼容性
> - **JavaScript**: 永远不破坏兼容，用 "use strict" 等开关

---

## Python 3.6-3.13 关键特性回顾

> 🌌 **The Big Picture：Python 3 的文艺复兴**
>
> Python 2→3 迁移的痛苦结束后，Python 3 进入了快速创新期。
> 从 3.6 开始，几乎每个版本都带来了改变游戏规则的特性。

### 特性时间线

| 版本 | 年份 | PEP | 关键特性 | 影响程度 |
|------|------|-----|---------|---------|
| 3.6 | 2016 | 498 | f-string | 革命性 |
| 3.6 | 2016 | 526 | 变量注解 | 重要 |
| 3.7 | 2018 | 557 | dataclasses | 重要 |
| 3.7 | 2018 | - | dict 保序成为规范 | 影响深远 |
| 3.8 | 2019 | 572 | 海象运算符 `:=` | 有用 |
| 3.8 | 2019 | 570 | 位置参数 `/` | 小众 |
| 3.9 | 2020 | 585 | 内置泛型 `list[int]` | 重要 |
| 3.9 | 2020 | 616 | 新解析器 (PEG) | 底层变革 |
| 3.10 | 2021 | 634 | `match/case` | 革命性 |
| 3.10 | 2021 | 604 | 联合类型 `X \| Y` | 便利 |
| 3.11 | 2022 | - | 性能提升 10-60% | 重大 |
| 3.11 | 2022 | 657 | 异常组 `ExceptionGroup` | 重要 |
| 3.12 | 2023 | 695 | 新泛型语法 `def f[T]()` | 重要 |
| 3.12 | 2023 | 701 | 改进的 f-string | 便利 |
| 3.13 | 2024 | 703 | Free-threaded（实验） | 历史性 |
| 3.13 | 2024 | 744 | JIT 编译器（实验） | 基础性 |

### 逐版本亮点

#### Python 3.6：f-string 改变一切

```python
# Before 3.6
name = "World"
print("Hello, %s!" % name)              # 古老的 % 格式化
print("Hello, {}!".format(name))         # 繁琐的 .format()

# After 3.6
print(f"Hello, {name}!")                 # 简洁、直观、高效

# f-string 的强大之处
import datetime
now = datetime.datetime.now()
print(f"现在是 {now:%Y-%m-%d %H:%M}")    # 格式化
print(f"{'居中':=^20}")                  # 填充对齐
print(f"{1000000:_}")                    # 千位分隔: 1_000_000
print(f"{0.1234:.2%}")                   # 百分比: 12.34%
```

#### Python 3.7：dataclasses 终结样板代码

```python
from dataclasses import dataclass, field
from typing import Optional

# Before 3.7 —— 手动写 __init__, __repr__, __eq__
class PointOld:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

# After 3.7 —— 一个装饰器搞定
@dataclass
class Point:
    x: float
    y: float

# 自动生成 __init__, __repr__, __eq__, __hash__
p = Point(1.0, 2.0)
print(p)              # Point(x=1.0, y=2.0)
print(p == Point(1.0, 2.0))  # True

# 高级用法
@dataclass(frozen=True)  # 不可变
class Config:
    host: str = "localhost"
    port: int = 8080
    debug: bool = False
    tags: list[str] = field(default_factory=list)
```

#### Python 3.8：海象运算符

```python
# PEP 572: Assignment Expressions
# 这个 PEP 导致了 Guido 辞去 BDFL

# Before
line = input()
while line != "quit":
    process(line)
    line = input()

# After —— 用海象运算符
while (line := input()) != "quit":
    process(line)

# 在列表推导中特别有用
# 避免重复计算
results = [
    cleaned
    for raw in data
    if (cleaned := clean(raw)) is not None
]

# 在条件判断中
if (match := pattern.search(text)) is not None:
    print(f"Found: {match.group()}")
```

#### Python 3.10：模式匹配

```python
# PEP 634: Structural Pattern Matching

def handle_command(command):
    match command.split():
        case ["quit"]:
            return "Goodbye!"
        case ["go", direction]:
            return f"Going {direction}"
        case ["get", item] if item in inventory:
            return f"Got {item}"
        case ["get", item]:
            return f"No {item} found"
        case _:
            return "Unknown command"

# 解构数据结构
def process_point(point):
    match point:
        case (0, 0):
            print("Origin")
        case (x, 0):
            print(f"On X axis at {x}")
        case (0, y):
            print(f"On Y axis at {y}")
        case (x, y) if x == y:
            print(f"On diagonal at {x}")
        case (x, y):
            print(f"At ({x}, {y})")

# 类匹配
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

@dataclass
class Circle:
    center: Point
    radius: float

def describe(shape):
    match shape:
        case Circle(center=Point(x=0, y=0), radius=r):
            print(f"Circle at origin with radius {r}")
        case Circle(center=Point(x=x, y=y), radius=r):
            print(f"Circle at ({x}, {y}) with radius {r}")
```

#### Python 3.11：性能大飞跃

```
Python 3.11 的 "Faster CPython" 项目（Shannon Plan）：

性能提升：平均 25%，某些场景高达 60%

关键优化：
1. Specializing Adaptive Interpreter
   → 字节码根据运行时类型自动优化
   → 如果 a + b 总是整数相加，直接用整数快速路径

2. 改进的异常处理
   → try/except 在没有异常时几乎零开销

3. 更高效的函数调用
   → 内联函数调用的准备和清理过程

4. 改进的错误信息
   → 精确指出表达式中哪个部分出错
```

```python
# Python 3.11 的精确错误信息
# 假设 data = {"users": [{"name": "Alice", "age": None}]}
print(data["users"][0]["age"] + 1)

# Python 3.10 的错误信息：
# TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'

# Python 3.11 的错误信息：
# TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
#   print(data["users"][0]["age"] + 1)
#         ~~~~~~~~~~~~~~~~~~~~~~~~~^~~
# 精确标出了出错的位置！
```

#### Python 3.12：新泛型语法

```python
# Before 3.12
from typing import TypeVar, Generic

T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self.items: list[T] = []

    def push(self, item: T) -> None:
        self.items.append(item)

    def pop(self) -> T:
        return self.items.pop()

# After 3.12 —— PEP 695
class Stack[T]:
    def __init__(self) -> None:
        self.items: list[T] = []

    def push(self, item: T) -> None:
        self.items.append(item)

    def pop(self) -> T:
        return self.items.pop()

# 泛型函数也更简洁
def first[T](items: list[T]) -> T:
    return items[0]

# 类型别名
type Vector = list[float]
type Matrix[T] = list[list[T]]
```

---

## PEP 流程：Python 如何进化

### 什么是 PEP

```
PEP = Python Enhancement Proposal

PEP 是 Python 进化的正式提案机制。
任何人都可以写 PEP，但要经过严格的审查流程。

PEP 的类型：
├── Standards Track: 语言/标准库变更（需要实现）
├── Informational: 信息性文档（如 PEP 20: Zen of Python）
└── Process: 流程变更（如 PEP 13: 治理模型）
```

### PEP 的生命周期

```
PEP 生命周期：

    作者写草案
        │
        ▼
    ┌─────────┐
    │  Draft   │  草案
    └────┬────┘
         │ PEP 编辑审查格式
         ▼
    ┌─────────┐
    │  Active  │  活跃讨论中
    └────┬────┘
         │ 在 Python Discourse / 邮件列表讨论
         │ 可能经历多次修改
         ▼
    ┌─────────────┐        ┌────────────┐
    │  Accepted   │   或   │  Rejected  │
    │  (被接受)    │        │  (被拒绝)   │
    └──────┬──────┘        └────────────┘
           │ 实现并合并到 CPython
           ▼
    ┌─────────┐
    │  Final  │  最终版（不再修改）
    └─────────┘

审批者：
├── 2018 之前: BDFL (Guido)
└── 2018 之后: Steering Council (5 人委员会)
```

### 重要的 PEP 索引

```
改变了 Python 的关键 PEP：

语言设计：
├── PEP 20  (2004): The Zen of Python
├── PEP 8   (2001): Style Guide
├── PEP 257 (2001): Docstring Conventions
├── PEP 3000 (2006): Python 3000
└── PEP 3107 (2006): Function Annotations

类型系统：
├── PEP 484 (2014): Type Hints
├── PEP 526 (2016): Variable Annotations
├── PEP 544 (2017): Protocols (Structural Subtyping)
├── PEP 585 (2019): Type Hinting Generics in Standard Collections
├── PEP 604 (2019): Union Types with X | Y
├── PEP 612 (2020): Parameter Specification Variables
├── PEP 695 (2023): Type Parameter Syntax
└── PEP 747 (2024): TypeForm

异步编程：
├── PEP 3156 (2012): asyncio
├── PEP 492  (2015): async/await syntax
├── PEP 525  (2016): Async Generators
└── PEP 530  (2016): Async Comprehensions

性能与内部：
├── PEP 703 (2023): Optional GIL
├── PEP 744 (2024): JIT Compiler
└── PEP 659 (2021): Specializing Adaptive Interpreter
```

---

## 类型系统的演进

> ⚛️ **The Science：从"无类型"到渐进式类型**
>
> Python 的类型系统经历了一个有趣的演化：
> 从完全动态，到可选的类型注解，到越来越严格的类型检查。
> 这不是放弃动态类型——而是在保留灵活性的同时，为需要的人提供安全网。

### 演化时间线

```
Python 类型系统的演化：

2000: Python 2.0 —— 完全动态类型
      def add(a, b):
          return a + b
      # 没有任何类型信息

2006: PEP 3107 —— 函数注解（仅语法，无语义）
      def add(a: int, b: int) -> int:
          return a + b
      # 注解不被执行，只是装饰

2014: PEP 484 —— 类型提示（Type Hints）
      from typing import List, Optional
      def greet(names: List[str]) -> Optional[str]:
          ...
      # mypy 可以做静态检查了

2016: PEP 526 —— 变量注解
      x: int = 10
      names: list[str] = []

2017: PEP 544 —— Protocol（结构化子类型）
      from typing import Protocol
      class Drawable(Protocol):
          def draw(self) -> None: ...
      # 鸭子类型 + 静态检查

2019: PEP 585 —— 内置泛型
      # Before
      from typing import List, Dict
      x: List[int]
      # After
      x: list[int]  # 直接用内置类型

2021: PEP 604 —— 联合类型语法
      # Before
      from typing import Union
      x: Union[int, str]
      # After
      x: int | str

2023: PEP 695 —— 类型参数语法
      # Before
      T = TypeVar('T')
      def first(items: list[T]) -> T: ...
      # After
      def first[T](items: list[T]) -> T: ...
```

### 渐进式类型的哲学

```python
# Python 的类型系统是 "渐进式" 的（Gradual Typing）
# 你可以只给一部分代码加类型，其余保持动态

# 完全不加类型——也能跑
def add(a, b):
    return a + b

# 加了类型——mypy 可以检查
def add(a: int, b: int) -> int:
    return a + b

# 部分加类型——也行
def process(data):          # 参数不加
    result: list[str] = []  # 局部变量加
    return result

# 复杂类型
from typing import Protocol, TypeVar, Callable

class Comparable(Protocol):
    def __lt__(self, other: "Comparable") -> bool: ...

def sort_items[T: Comparable](items: list[T]) -> list[T]:
    return sorted(items)
```

> 🧰 **Toolbox：类型检查工具对比**
>
> | 工具 | 开发者 | 特点 | 速度 |
> |------|--------|------|------|
> | mypy | Dropbox/Jukka | 最成熟，插件丰富 | 中 |
> | pyright | Microsoft | VS Code 集成好 | 快 |
> | pytype | Google | 能推断类型 | 慢 |
> | pyre | Meta | 大规模代码库优化 | 快 |

---

## 异步编程的演进

### 从回调到 async/await

```
Python 异步编程的演化：

2001: asyncore/asynchat（标准库）
      → 基于回调的事件循环
      → API 丑陋，难以使用

2002: Twisted 框架
      → 第三方异步框架
      → 回调地狱的开始

2009: gevent（基于 greenlet）
      → monkey-patching 同步代码变异步
      → "魔法"太多，调试困难

2012: PEP 3156 → asyncio 进入标准库
      → 标准化的事件循环
      → 但 API 仍然基于回调/Future

2015: PEP 492 → async/await 语法
      → 终于有了优雅的异步语法
      → 异步代码可以像同步代码一样读

2016: PEP 525/530 → 异步生成器和推导
      → async for, async with
      → 异步世界的"一等公民"
```

### 代码演化对比

```python
# === 阶段 1: 回调地狱 (Twisted 风格) ===
def handle_request(request):
    d = fetch_user(request.user_id)
    d.addCallback(lambda user: fetch_orders(user.id))
    d.addCallback(lambda orders: format_response(orders))
    d.addCallback(lambda response: send_response(response))
    d.addErrback(lambda err: handle_error(err))

# === 阶段 2: yield 协程 (Python 3.4) ===
@asyncio.coroutine
def handle_request(request):
    user = yield from fetch_user(request.user_id)
    orders = yield from fetch_orders(user.id)
    response = format_response(orders)
    return response

# === 阶段 3: async/await (Python 3.5+) ===
async def handle_request(request):
    user = await fetch_user(request.user_id)
    orders = await fetch_orders(user.id)
    response = format_response(orders)
    return response
```

```python
# 现代异步编程的强大能力

import asyncio

# 并发执行多个异步操作
async def fetch_dashboard(user_id):
    async with aiohttp.ClientSession() as session:
        # 并发获取用户信息、订单、通知
        user, orders, notifications = await asyncio.gather(
            fetch_user(session, user_id),
            fetch_orders(session, user_id),
            fetch_notifications(session, user_id),
        )
        return Dashboard(user, orders, notifications)

# 异步生成器
async def stream_events(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            async for line in response.content:
                yield parse_event(line)

# 异步上下文管理器
async def managed_connection(url):
    conn = await connect(url)
    try:
        yield conn
    finally:
        await conn.close()
```

---

## 模式匹配

> 🎭 **The Drama：Python 终于有 switch/case 了？**
>
> 不！`match/case` 不是 switch/case。
> 它是 **结构化模式匹配**——一种强大的解构和分派机制。
> 如果 switch 是"值匹配"，那 match 是"结构匹配"。

### 不只是 switch

```python
# match/case 远比 switch/case 强大

import json

# 1. 值匹配（最基础，类似 switch）
def http_status(code):
    match code:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Internal Server Error"
        case _:
            return f"Unknown: {code}"

# 2. 序列解构
def analyze_point(point):
    match point:
        case (0, 0):
            return "origin"
        case (x, 0) | (0, x):  # OR 模式
            return f"on axis, value={x}"
        case (x, y) if x > 0 and y > 0:  # 守卫条件
            return f"first quadrant ({x}, {y})"
        case (x, y):
            return f"at ({x}, {y})"

# 3. 映射解构
def process_event(event: dict):
    match event:
        case {"type": "click", "x": x, "y": y}:
            handle_click(x, y)
        case {"type": "keypress", "key": key}:
            handle_key(key)
        case {"type": "scroll", "direction": "up" | "down" as dir}:
            handle_scroll(dir)

# 4. 类解构
def process_shape(shape):
    match shape:
        case Circle(radius=r) if r > 100:
            return "Large circle"
        case Circle(radius=r):
            return f"Circle(r={r})"
        case Rectangle(width=w, height=h) if w == h:
            return f"Square(side={w})"
        case Rectangle(width=w, height=h):
            return f"Rectangle({w}x{h})"

# 5. 嵌套模式
def process_response(response):
    match response:
        case {"status": 200, "data": {"users": [first, *rest]}}:
            print(f"First user: {first}, {len(rest)} more")
        case {"status": 200, "data": {"users": []}}:
            print("No users")
        case {"status": status} if status >= 400:
            print(f"Error: {status}")
```

---

## Python 的未来方向

```
Python 的发展方向（2024-2030 预测）：

1. 性能持续改善
   ├── Faster CPython（每个版本 5-15% 提升）
   ├── JIT 编译器成熟化
   ├── Free-threading 逐步推广
   └── 目标：缩小与 Java/Go 的性能差距

2. 类型系统持续完善
   ├── 更强大的类型推断
   ├── 运行时类型检查优化
   ├── TypedDict / Protocol 改进
   └── 目标：TypeScript 级别的类型体验

3. 并发模型现代化
   ├── Free-threaded Python 成为主流
   ├── 子解释器 (PEP 554) 成熟
   ├── asyncio 持续改进
   └── 目标：与 Go 的并发模型竞争

4. AI/ML 生态强化
   ├── 更好的 GPU 支持
   ├── 更高效的数据交换
   ├── 与 Rust/C++ ML 框架的集成
   └── 目标：巩固 AI 第一语言的地位

5. 开发体验
   ├── 更好的错误信息（已在进行）
   ├── 更快的启动速度
   ├── 更小的安装包
   └── 标准化的项目管理（PEP 723）
```

> 🧘 **Zen of Code：语言的进化是一场马拉松**
>
> Python 从 1991 年走到今天，已经 35 岁了。
> 对于编程语言来说，这是"中年"——老到有历史包袱，年轻到还在快速进化。
>
> 从 Python 的演化中我们学到：
> 1. **向后兼容性是最贵的奢侈品**——Python 2→3 付出了惨痛代价
> 2. **渐进式变革优于革命**——类型系统、GIL 移除都是渐进的
> 3. **社区比代码更重要**——一门语言的生命力在于使用它的人
> 4. **实用主义始终是核心**——Python 从不追求理论上的完美
>
> 编程语言就像自然语言一样：
> 它不是被设计出来的，而是被使用出来的。
> Python 的未来不取决于任何一个人的设计，
> 而取决于数百万开发者的每一次选择。

---

## 参考资源

- [PEP Index](https://peps.python.org/)
- [What's New in Python (by version)](https://docs.python.org/3/whatsnew/)
- [The History of Python (Guido's Blog)](https://python-history.blogspot.com/)
- [Faster CPython Project](https://github.com/faster-cpython)
- [Python Release Schedule](https://peps.python.org/pep-0602/)
- [Nick Coghlan's Python Notes](https://python-notes.curiousefficiency.org/)

---

[👈 第 4 章：GIL 的真相](../04-gil-concurrency-truth/) | [👉 第 6 章：社区与文化](../06-community-culture/)

[⬆️ 返回 Stage 5 目录](../README.md)
