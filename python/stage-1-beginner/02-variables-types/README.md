# 第 2 章：变量与数据类型 — 名字只是一张标签

> *"Namespaces are one honking great idea -- let's do more of those!"*
> — The Zen of Python, Line 19
>
> 在大多数语言中，变量是一个"盒子"，你把值放进去。
> 在 Python 中，变量是一张"标签"，你把它贴在对象上。
> 这个看似微小的区别，决定了 Python 程序的行为方式。

## 📖 本章内容

- [1. 动态类型的哲学与代价](#1-动态类型的哲学与代价)
- [2. 数字类型](#2-数字类型)
- [3. 布尔与真值判定](#3-布尔与真值判定)
- [4. None 的语义](#4-none-的语义)
- [5. 名称绑定模型](#5-名称绑定模型)
- [6. is vs ==：身份比较与值比较](#6-is-vs-身份比较与值比较)
- [7. 不可变性](#7-不可变性)
- [代码示例](#代码示例)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. 动态类型的哲学与代价

> 🌌 **The Big Picture: 静态类型 vs 动态类型 — 编程语言的两条路**
>
> 编程语言的类型系统是一个根本性的设计选择：
>
> - **静态类型（C、Java、Go、Rust）**：变量在声明时确定类型，编译器检查类型错误
> - **动态类型（Python、JavaScript、Ruby）**：变量没有类型，值有类型，运行时检查
>
> Python 选择了动态类型，代价是运行时才能发现类型错误；收益是极高的灵活性和开发速度。
> 这就是为什么 Python 后来引入了**类型标注**（PEP 484, Python 3.5+）——在保持动态性的同时，用工具（`mypy`）提前发现类型问题。

### 1.1 Python 的动态类型

```python
# 在 Python 中，变量没有类型——值有类型
x = 42          # x 指向一个 int 对象
print(type(x))  # <class 'int'>

x = "hello"     # x 现在指向一个 str 对象（完全合法）
print(type(x))  # <class 'str'>

x = [1, 2, 3]   # x 又指向了一个 list 对象
print(type(x))  # <class 'list'>
```

```python
# 对比 Java（静态类型）：
# int x = 42;
# x = "hello";   // 编译错误！int 类型变量不能赋值字符串

# Python 不会报错——因为 x 不是 "int 类型的变量"
# x 只是一个名字，它可以贴在任何对象上
```

### 1.2 type() 和 isinstance()

```python
# type() 返回对象的精确类型
print(type(42))        # <class 'int'>
print(type(3.14))      # <class 'float'>
print(type("hello"))   # <class 'str'>
print(type(True))      # <class 'bool'>
print(type(None))      # <class 'NoneType'>

# isinstance() 检查对象是否是某个类型（包括子类）
print(isinstance(42, int))        # True
print(isinstance(True, int))      # True！bool 是 int 的子类
print(isinstance(True, bool))     # True
print(isinstance(42, (int, str))) # True（检查多个类型）
```

| 对比 | `type(x) == int` | `isinstance(x, int)` |
|------|------------------|---------------------|
| 检查子类 | ❌ 不检查 | ✅ 检查 |
| `bool` 对 `int` | `type(True) == int` → `False` | `isinstance(True, int)` → `True` |
| 推荐度 | 不推荐 | ✅ 推荐 |
| 原因 | 过于严格，不支持多态 | 符合鸭子类型哲学 |

---

## 2. 数字类型

### 2.1 int — 无限精度整数

> ⚛️ **The Science: Python 的 int 没有上限**
>
> 在 C 中，`int` 是 32 位（最大约 21 亿）。在 Java 中，`long` 是 64 位。
> 在 Python 中，`int` 是**任意精度**的——只要内存够，它可以表示任意大的整数。
>
> CPython 内部实现是一个"大数数组"：将大整数分成若干个 30 位的"数位"存储。
> 这意味着 Python 的 `int` 在大数时比 C 慢很多，但对于日常使用绰绰有余。

```python
# Python 的 int 没有溢出问题
big_number = 10 ** 100  # googol：1 后面 100 个零
print(big_number)
# 10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

# 阶乘也不会溢出
import math
print(math.factorial(100))  # 100! = 一个 158 位的数字

# 数字字面量可以用下划线分隔（提高可读性，Python 3.6+）
population = 8_000_000_000
hex_color = 0xFF_AA_CC
binary = 0b_1010_0101

# 不同进制
print(0b1010)   # 二进制 → 10
print(0o17)     # 八进制 → 15
print(0xFF)     # 十六进制 → 255

# 进制转换
print(bin(42))  # '0b101010'
print(oct(42))  # '0o52'
print(hex(42))  # '0x2a'
```

### 2.2 float — IEEE 754 双精度浮点数

> 🧠 **CS Master's Bridge: 浮点数的陷阱**
>
> 如果你学过计算机组成原理，你知道 IEEE 754 双精度浮点数用 64 位表示：
> 1 位符号 + 11 位指数 + 52 位尾数，精度约为 15-17 位十进制有效数字。
>
> 这意味着 `0.1 + 0.2 != 0.3` 不是 Python 的 bug——这是**所有**使用 IEEE 754 的语言的"特性"。
> C、Java、JavaScript、Go 都有同样的问题。

```python
# ⚠️ 浮点数精度问题
print(0.1 + 0.2)           # 0.30000000000000004
print(0.1 + 0.2 == 0.3)    # False！

# ✅ 使用 math.isclose() 进行近似比较
import math
print(math.isclose(0.1 + 0.2, 0.3))  # True

# ✅ 需要精确小数计算时，使用 decimal 模块
from decimal import Decimal
result = Decimal("0.1") + Decimal("0.2")
print(result)               # 0.3（精确！）
print(result == Decimal("0.3"))  # True

# float 的特殊值
print(float("inf"))         # 正无穷
print(float("-inf"))        # 负无穷
print(float("nan"))         # Not a Number

# ⚠️ NaN 的诡异行为
nan = float("nan")
print(nan == nan)           # False！NaN 不等于任何值，包括自己
print(math.isnan(nan))      # True（正确的检查方式）
```

### 2.3 complex — 复数

```python
# 复数字面量使用 j 表示虚部（不是 i）
z = 3 + 4j
print(z.real)      # 3.0（实部）
print(z.imag)      # 4.0（虚部）
print(abs(z))      # 5.0（模/绝对值）
print(z.conjugate())  # (3-4j)（共轭复数）

# 复数运算
z1 = 1 + 2j
z2 = 3 + 4j
print(z1 + z2)     # (4+6j)
print(z1 * z2)     # (-5+10j)
```

### 2.4 数字类型运算对比

| 运算符 | 含义 | int 示例 | float 示例 | 注意 |
|--------|------|---------|-----------|------|
| `+` | 加 | `3 + 2` → `5` | `3.0 + 2.0` → `5.0` | |
| `-` | 减 | `3 - 2` → `1` | `3.0 - 2.0` → `1.0` | |
| `*` | 乘 | `3 * 2` → `6` | `3.0 * 2.0` → `6.0` | |
| `/` | 除 | `7 / 2` → `3.5` | `7.0 / 2.0` → `3.5` | **总是返回 float** |
| `//` | 整除 | `7 // 2` → `3` | `7.0 // 2.0` → `3.0` | 向下取整（负数注意） |
| `%` | 取模 | `7 % 2` → `1` | `7.0 % 2.0` → `1.0` | |
| `**` | 幂 | `2 ** 10` → `1024` | `2.0 ** 0.5` → `1.414...` | |
| `divmod()` | 商和余数 | `divmod(7, 2)` → `(3, 1)` | | 等价于 `(a//b, a%b)` |

```python
# ⚠️ 整除的方向（向负无穷取整，不是向零取整）
print(7 // 2)    # 3（正常）
print(-7 // 2)   # -4（不是 -3！Python 向负无穷取整）

# 对比 C/Java 的截断除法（向零取整）：
# -7 / 2 == -3  （C/Java）
# -7 // 2 == -4 （Python）
import math
print(math.trunc(-7 / 2))  # -3（如果你需要 C 风格的截断）
```

---

## 3. 布尔与真值判定

> 🎭 **The Drama: Python 的 bool 是 int 的子类**
>
> 这是一个让人大跌眼镜的事实：在 Python 中，`True` 就是 `1`，`False` 就是 `0`。
> `bool` 是 `int` 的子类。你可以用布尔值做算术运算：`True + True == 2`。
>
> 这不是 bug，这是 Python 的历史遗留——在 Python 2.3 之前，Python 甚至没有 `bool` 类型，人们直接用 `0` 和 `1`。
> `bool` 在 2.3 版本引入时，为了向后兼容，被设计为 `int` 的子类。

```python
# bool 是 int 的子类
print(isinstance(True, int))   # True
print(True + True)             # 2
print(True * 10)               # 10
print(False + 1)               # 1

# 利用这个特性进行计数
numbers = [1, -2, 3, -4, 5, -6]
positive_count = sum(1 for n in numbers if n > 0)  # 3
# 或者更巧妙地：
positive_count = sum(n > 0 for n in numbers)        # 3（True 被当作 1 求和）
```

### 3.1 真值判定（Truthy / Falsy）

```python
# Python 中，以下值被判定为 False（Falsy）：
falsy_values = [
    False,      # 布尔假
    0,          # 整数零
    0.0,        # 浮点零
    0j,         # 复数零
    "",          # 空字符串
    [],          # 空列表
    (),          # 空元组
    {},          # 空字典
    set(),       # 空集合
    None,        # None
    # range(0),  # 空 range
]

# 所有其他值都是 True（Truthy）
truthy_values = [
    True, 1, -1, 3.14,                    # 非零数字
    "hello", " ", "0", "False",            # 非空字符串（包括 "0" 和 "False"！）
    [0], [False], [None],                  # 非空列表（即使内容是 Falsy）
    {"key": None},                         # 非空字典
]

# 验证
for val in falsy_values:
    assert not val, f"{val!r} 应该是 Falsy"

for val in truthy_values:
    assert val, f"{val!r} 应该是 Truthy"
```

```python
# ✅ 利用 Truthy/Falsy 简化条件判断

# ❌ 不够 Pythonic
if len(my_list) > 0:
    print("列表不为空")

# ✅ Pythonic
if my_list:
    print("列表不为空")

# ❌ 不够 Pythonic
if name != "":
    print(f"你好, {name}")

# ✅ Pythonic
if name:
    print(f"你好, {name}")

# ❌ 不够 Pythonic
if x is not None and x != 0:
    process(x)

# ✅ 但要注意语义：如果 0 是合法值，不能用 Truthy 检查
if x is not None:  # 只排除 None，不排除 0
    process(x)
```

### 3.2 短路求值

```python
# and 和 or 不一定返回 True/False —— 它们返回决定结果的那个值

# or: 返回第一个 Truthy 值，或最后一个值
print("" or "default")       # "default"（"" 是 Falsy，继续看下一个）
print("hello" or "default")  # "hello"（"hello" 是 Truthy，直接返回）
print(0 or "" or None or 42) # 42（前三个都是 Falsy）
print(0 or "" or None or []) # []（都是 Falsy，返回最后一个）

# and: 返回第一个 Falsy 值，或最后一个值
print("hello" and "world")   # "world"（"hello" 是 Truthy，继续看下一个）
print("" and "world")        # ""（"" 是 Falsy，直接返回）
print(1 and 2 and 3)         # 3（全是 Truthy，返回最后一个）

# ✅ 利用 or 设置默认值（简单场景）
name = user_input or "Anonymous"

# ⚠️ 但 0 和 "" 也会被替换！如果这些是合法值，请不要用这个技巧
# 更安全的方式：
name = user_input if user_input is not None else "Anonymous"
```

---

## 4. None 的语义

> 🧘 **Zen of Code: None — Python 的"空"**
>
> `None` 是 Python 的空值，它代表"没有值"或"缺失"。
> 它不是 `0`（那是数字零），不是 `""`（那是空字符串），不是 `[]`（那是空列表）。
> 它是一个独立的类型 `NoneType` 的唯一实例。
>
> `None` 是一个**单例**——整个 Python 程序中只有一个 `None` 对象。
> 所以你应该用 `is None` 检查，而不是 `== None`。

```python
# None 的常见用法

# 1. 函数没有显式 return 时，返回 None
def greet(name: str) -> None:
    print(f"Hello, {name}!")

result = greet("Python")
print(result)        # None
print(type(result))  # <class 'NoneType'>

# 2. 作为默认参数（表示"未提供"）
def connect(host: str, port: int | None = None) -> str:
    if port is None:
        port = 3306  # 使用默认端口
    return f"连接到 {host}:{port}"

# 3. 作为哨兵值（表示"尚未初始化"）
_cache: dict | None = None

def get_cache() -> dict:
    global _cache
    if _cache is None:
        _cache = {}  # 惰性初始化
    return _cache

# ✅ 检查 None 用 is / is not
if result is None:
    print("没有返回值")

if result is not None:
    print(f"返回值: {result}")

# ❌ 不要用 == 检查 None
if result == None:    # 技术上可行，但不是 Pythonic
    pass
```

---

## 5. 名称绑定模型

> 🧠 **CS Master's Bridge: Python 变量 ≠ C 变量**
>
> 在 C 中，`int x = 42;` 意味着：
> 1. 在栈上分配 4 字节
> 2. 把 42 写进去
> 3. `x` 是这块内存的名字
>
> 在 Python 中，`x = 42` 意味着：
> 1. 在堆上创建一个 `int` 对象（值为 42）
> 2. 让名字 `x` 指向（引用）这个对象
>
> `x` 不是盒子，`x` 是贴在对象上的**标签**。

```python
# 名称绑定的本质

# a 和 b 指向同一个对象
a = [1, 2, 3]
b = a               # b 不是 a 的复制品，b 是同一个列表的另一个标签
print(id(a))         # 例如 140234567890
print(id(b))         # 同一个地址！140234567890
print(a is b)        # True — 同一个对象

# 修改 a（通过 a 修改列表），b 也会"看到"变化
a.append(4)
print(b)             # [1, 2, 3, 4] — b 也看到了变化，因为它们是同一个对象

# 但重新赋值 a 不会影响 b（重新绑定是换标签，不是改对象）
a = [10, 20, 30]     # a 现在指向一个全新的列表
print(b)             # [1, 2, 3, 4] — b 还是指向原来的列表
print(a is b)        # False — 现在是两个不同的对象
```

```
名称绑定的可视化：

步骤 1: a = [1, 2, 3]
  a ----→ [1, 2, 3]

步骤 2: b = a
  a ----→ [1, 2, 3] ←---- b    （同一个对象）

步骤 3: a.append(4)
  a ----→ [1, 2, 3, 4] ←---- b （原地修改，两个标签都看到）

步骤 4: a = [10, 20, 30]
  a ----→ [10, 20, 30]          （a 换了标签）
  b ----→ [1, 2, 3, 4]          （b 还在原来的对象上）
```

### 5.1 赋值不是复制

```python
# ⚠️ 赋值永远不复制数据，它只是创建一个新的引用

# 不可变对象（int, str, tuple）——看起来像复制
x = 42
y = x
x = 100       # x 重新绑定到 100，y 不受影响
print(y)       # 42（因为 int 不可变，无法原地修改）

# 可变对象（list, dict, set）——赋值就是别名
original = [1, 2, 3]
alias = original
alias.append(4)
print(original)  # [1, 2, 3, 4] — 原始列表被修改了！
```

### 5.2 如何真正复制

```python
import copy

original = [1, [2, 3], 4]

# 浅复制（shallow copy）：只复制顶层
shallow = original.copy()       # 或 list(original) 或 original[:]
shallow[0] = 999                # 不影响 original
shallow[1].append(999)          # ⚠️ 影响 original！因为内层列表是共享的
print(original)                 # [1, [2, 3, 999], 4]

# 深复制（deep copy）：递归复制所有层级
original2 = [1, [2, 3], 4]
deep = copy.deepcopy(original2)
deep[1].append(999)             # 不影响 original2
print(original2)                # [1, [2, 3], 4] — 安全！
```

| 操作 | 语法 | 复制深度 | 何时使用 |
|------|------|---------|---------|
| 赋值 | `b = a` | 不复制（别名） | 只需要另一个引用 |
| 浅复制 | `a.copy()` / `list(a)` / `a[:]` | 只复制顶层 | 顶层元素是不可变的 |
| 深复制 | `copy.deepcopy(a)` | 递归复制所有层 | 嵌套了可变对象 |

---

## 6. is vs ==：身份比较与值比较

> 🎭 **The Drama: 面试必考题**
>
> "请解释 `is` 和 `==` 的区别"——这是 Python 面试中出现频率最高的问题之一。
> 99% 的时间你应该用 `==`。唯一使用 `is` 的场景是检查 `None`。

```python
# == 比较值（内容相同吗？）
# is 比较身份（是同一个对象吗？）

a = [1, 2, 3]
b = [1, 2, 3]
c = a

# 值比较
print(a == b)    # True — 内容相同
print(a == c)    # True — 当然也相同

# 身份比较
print(a is b)    # False — 两个不同的列表对象
print(a is c)    # True — 同一个对象（c 是 a 的别名）

# 用 id() 查看对象身份
print(id(a))     # 例如 140234567890
print(id(b))     # 不同的地址
print(id(c))     # 和 a 一样
```

```python
# ⚠️ 小整数缓存的陷阱

# CPython 缓存了 -5 到 256 之间的整数
a = 256
b = 256
print(a is b)    # True — 缓存的同一个对象

a = 257
b = 257
print(a is b)    # 可能是 False！（取决于实现和上下文）

# ⚠️ 字符串驻留（interning）
s1 = "hello"
s2 = "hello"
print(s1 is s2)  # True — CPython 驻留了这个字符串

s1 = "hello world!"
s2 = "hello world!"
print(s1 is s2)  # 可能是 False（包含特殊字符时不一定驻留）

# 🔑 关键规则：
# 1. 只用 is 检查 None: if x is None
# 2. 其他情况都用 ==
# 3. 永远不要依赖 is 来比较整数或字符串
```

---

## 7. 不可变性

> ⚛️ **The Science: 为什么需要不可变性？**
>
> 不可变性（Immutability）有三个重要好处：
>
> 1. **可哈希**：只有不可变对象才能作为 `dict` 的键和 `set` 的元素
> 2. **线程安全**：不可变对象天然线程安全，不需要锁
> 3. **可预测性**：不可变对象不会被意外修改，减少 bug
>
> Python 的设计哲学是：**基础类型（str, int, float, tuple, frozenset）都是不可变的**。
> 可变的只有容器类型（list, dict, set）和用户自定义对象。

```python
# 不可变类型：int, float, str, tuple, frozenset, bytes
# 可变类型：list, dict, set, bytearray

# 字符串是不可变的
s = "hello"
# s[0] = "H"  # ❌ TypeError: 'str' object does not support item assignment

# "修改" 字符串实际上是创建新对象
s = s.upper()   # 创建了一个新字符串 "HELLO"，s 重新绑定到新对象

# 元组是不可变的
t = (1, 2, 3)
# t[0] = 10    # ❌ TypeError: 'tuple' object does not support item assignment

# ⚠️ 但如果元组包含可变对象，那个可变对象本身可以修改！
t = (1, [2, 3], 4)
# t[1] = [20, 30]  # ❌ 不能替换元组中的元素
t[1].append(5)       # ✅ 可以修改元组中的可变对象！
print(t)              # (1, [2, 3, 5], 4)
```

| 类型 | 可变？ | 可哈希？ | 可做 dict 键？ | 可做 set 元素？ |
|------|--------|---------|---------------|----------------|
| `int` | 不可变 | ✅ | ✅ | ✅ |
| `float` | 不可变 | ✅ | ✅ | ✅ |
| `str` | 不可变 | ✅ | ✅ | ✅ |
| `tuple` | 不可变* | ✅* | ✅* | ✅* |
| `frozenset` | 不可变 | ✅ | ✅ | ✅ |
| `list` | 可变 | ❌ | ❌ | ❌ |
| `dict` | 可变 | ❌ | ❌ | ❌ |
| `set` | 可变 | ❌ | ❌ | ❌ |

*注：tuple 只有在所有元素都可哈希时才可哈希。包含 list 的 tuple 不可哈希。

---

## 代码示例

### 示例 1: 类型基础

参见 [`examples/01-types-basics.py`](./examples/01-types-basics.py)

### 示例 2: 名称绑定

参见 [`examples/02-name-binding.py`](./examples/02-name-binding.py)

### 示例 3: 身份与相等

参见 [`examples/03-identity-equality.py`](./examples/03-identity-equality.py)

---

## 最佳实践

```python
# ✅ 1. 用 isinstance() 检查类型，不用 type()
if isinstance(value, int):
    print("是整数")

# ✅ 2. 用 is None / is not None 检查 None
if result is None:
    handle_missing()

# ✅ 3. 利用 Truthy/Falsy 简化判断
if my_list:       # 而不是 if len(my_list) > 0
    process(my_list)

# ✅ 4. 浮点数比较用 math.isclose()
import math
if math.isclose(a, b, rel_tol=1e-9):
    print("近似相等")

# ✅ 5. 需要精确小数用 Decimal
from decimal import Decimal
price = Decimal("19.99")

# ✅ 6. 使用类型标注（即使 Python 不强制）
def calculate_area(radius: float) -> float:
    return 3.14159 * radius ** 2
```

---

## 常见陷阱

### 陷阱 1：浮点数比较

```python
# ❌ 直接比较浮点数
if 0.1 + 0.2 == 0.3:     # False！永远不要这么做
    print("相等")

# ✅ 使用 math.isclose()
import math
if math.isclose(0.1 + 0.2, 0.3):  # True
    print("近似相等")
```

### 陷阱 2：用 is 比较数值

```python
# ❌ 用 is 比较整数
a = 1000
b = 1000
if a is b:                # 不可靠！结果取决于实现
    print("相同")

# ✅ 用 == 比较值
if a == b:                # 总是可靠的
    print("相等")
```

### 陷阱 3：可变默认参数

```python
# ❌ 可变对象作为默认参数（Python 最经典的陷阱之一）
def add_item(item, items=[]):    # 默认列表在函数定义时创建一次！
    items.append(item)
    return items

print(add_item("a"))     # ['a']
print(add_item("b"))     # ['a', 'b'] — 不是 ['b']！默认列表被共享了

# ✅ 使用 None 作为哨兵值
def add_item_safe(item, items=None):
    if items is None:
        items = []         # 每次调用都创建新列表
    items.append(item)
    return items

print(add_item_safe("a"))  # ['a']
print(add_item_safe("b"))  # ['b'] — 正确！
```

### 陷阱 4：字符串的 "in" 检查

```python
# "in" 对字符串检查的是子串，不是字符
print("hell" in "hello")   # True — 子串匹配
print("lo" in "hello")     # True
print("hx" in "hello")     # False
```

---

## 练习题

### 练习 1：类型判断

预测以下表达式的结果（先想再运行）：

```python
print(type(42))
print(type(42.0))
print(type(True))
print(type(None))
print(isinstance(True, int))
print(isinstance(42, bool))
```

<details>
<summary>💡 参考答案</summary>

```python
print(type(42))                 # <class 'int'>
print(type(42.0))               # <class 'float'>
print(type(True))               # <class 'bool'>
print(type(None))               # <class 'NoneType'>
print(isinstance(True, int))    # True（bool 是 int 的子类）
print(isinstance(42, bool))     # False（int 不是 bool 的子类）
```

</details>

### 练习 2：名称绑定理解

预测以下代码的输出：

```python
x = [1, 2, 3]
y = x
z = x[:]
x.append(4)
print(f"x = {x}")
print(f"y = {y}")
print(f"z = {z}")
```

<details>
<summary>💡 参考答案</summary>

```python
x = [1, 2, 3, 4]   # x 被原地修改了
y = [1, 2, 3, 4]   # y 是 x 的别名，看到了相同的修改
z = [1, 2, 3]       # z 是浅复制，不受影响
```

</details>

### 练习 3：Truthy/Falsy

写一个函数 `safe_greeting(name)`，满足以下要求：
- 如果 `name` 是 `None`，返回 `"Hello, Stranger!"`
- 如果 `name` 是空字符串 `""`，返回 `"Hello, Stranger!"`
- 否则返回 `"Hello, {name}!"`

<details>
<summary>💡 参考答案</summary>

```python
def safe_greeting(name: str | None) -> str:
    """安全的问候函数，处理 None 和空字符串"""
    if not name:  # None 和 "" 都是 Falsy
        return "Hello, Stranger!"
    return f"Hello, {name}!"

# 测试
print(safe_greeting(None))       # Hello, Stranger!
print(safe_greeting(""))         # Hello, Stranger!
print(safe_greeting("Alice"))    # Hello, Alice!
```

</details>

---

## 参考资源

- [Python 官方文档 - 内置类型](https://docs.python.org/3/library/stdtypes.html)
- [Python 官方文档 - 数据模型](https://docs.python.org/3/reference/datamodel.html)
- [Fluent Python, Ch.6: Object References, Mutability, and Recycling](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [Real Python - Variables in Python](https://realpython.com/python-variables/)
- [IEEE 754 浮点数可视化](https://www.h-schmidt.net/FloatConverter/IEEE754.html)

---

## 下一步

你现在理解了 Python 变量的本质——名称绑定。接下来，让我们学习如何用条件和循环控制程序的流程，以及如何用函数组织代码。

**[👉 第 3 章：控制流与函数](../03-control-flow-functions/)**
