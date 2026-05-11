# 第 3 章：控制流与函数 — 让代码学会思考和组织

> *"Flat is better than nested."*
> The Zen of Python, Line 5
>
> 控制流决定程序走哪条路，函数负责把逻辑拆成可理解、可复用的单元。学好这两部分，你就能把零散语句组织成真正的程序。

## 📖 本章内容

- [1. 条件语句](#1-条件语句)
- [2. 循环](#2-循环)
- [3. 推导式](#3-推导式)
- [4. 函数定义](#4-函数定义)
- [5. 一等公民函数](#5-一等公民函数)
- [6. LEGB 作用域规则](#6-legb-作用域规则)
- [7. 闭包](#7-闭包)
- [8. 海象运算符](#8-海象运算符)
- [代码示例](#代码示例)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. 条件语句

Python 通过缩进定义代码块，不使用花括号。条件语句的结构清晰，适合表达从上到下的判断优先级。

### 1.1 if / elif / else

```python
score = 85

if score >= 90:
    grade = "A"
    print("[控制流] 优秀")
elif score >= 80:
    grade = "B"
    print("[控制流] 良好")
elif score >= 70:
    grade = "C"
    print("[控制流] 中等")
elif score >= 60:
    grade = "D"
    print("[控制流] 及格")
else:
    grade = "F"
    print("[控制流] 不及格")

print(f"[控制流] 分数: {score}, 等级: {grade}")
```

### 1.2 三元表达式

三元表达式适合非常短的二选一逻辑；如果逻辑开始变复杂，就写成普通 `if`。

```python
age = 20
status = "成年" if age >= 18 else "未成年"

x = 7
result = "偶数" if x % 2 == 0 else "奇数"
```

### 1.3 链式比较

```python
x = 5

print(1 < x < 10)      # True，等价于 1 < x and x < 10
print(1 < x < 3)       # False
print(0 <= x <= 100)   # True
```

### 1.4 match-case

`match-case` 是 Python 3.10 引入的结构化模式匹配。它不只是 `switch`，还可以解构数据结构、绑定变量和使用守卫条件。

```python
def handle_command(command: str) -> str:
    match command:
        case "quit" | "exit":
            return "退出程序"
        case "help":
            return "显示帮助"
        case "list":
            return "列出所有项目"
        case _:
            return f"未知命令: {command}"


def describe_point(point: tuple[int, int]) -> str:
    match point:
        case (0, 0):
            return "原点"
        case (x, 0):
            return f"x 轴上，x={x}"
        case (0, y):
            return f"y 轴上，y={y}"
        case (x, y) if x == y:
            return f"对角线上，({x}, {y})"
        case (x, y):
            return f"普通点，({x}, {y})"
```

---

## 2. 循环

### 2.1 for...in 循环

Python 的 `for` 遍历的是可迭代对象，而不是手动维护下标的计数器。

```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"[循环] {fruit}")

person = {"name": "Alice", "age": 30, "city": "北京"}
for key, value in person.items():
    print(f"[循环] {key}: {value}")

for i in range(5):
    print(i, end=" ")

for i in range(2, 10, 2):
    print(i, end=" ")  # 2 4 6 8
```

### 2.2 enumerate() 和 zip()

```python
fruits = ["apple", "banana", "cherry"]

for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

names = ["Alice", "Bob", "Charlie"]
scores = [95, 87, 72]
for name, score in zip(names, scores):
    print(f"{name}: {score}")
```

### 2.3 while 与 for...else

```python
count = 5
while count > 0:
    print(f"[循环] 倒计时 {count}")
    count -= 1

n = 17
for i in range(2, int(n**0.5) + 1):
    if n % i == 0:
        print(f"{n} 不是质数，因子是 {i}")
        break
else:
    print(f"{n} 是质数")
```

---

## 3. 推导式

推导式用来表达“从一个可迭代对象生成另一个集合”的意图，通常比简单循环更清晰。

```python
squares = [x**2 for x in range(10)]
even_squares = [x**2 for x in range(10) if x % 2 == 0]
labels = ["偶数" if x % 2 == 0 else "奇数" for x in range(6)]

matrix = [[1, 2, 3], [4, 5, 6]]
flat = [x for row in matrix for x in row]

squares_dict = {x: x**2 for x in range(6)}
unique_lengths = {len(word) for word in ["hello", "world", "hi"]}
total = sum(x**2 for x in range(1_000_000))
```

| 推导式类型 | 语法 | 结果类型 | 适用场景 |
|-----------|------|---------|---------|
| 列表推导式 | `[expr for x in iter]` | `list` | 需要保存所有结果 |
| 字典推导式 | `{k: v for x in iter}` | `dict` | 构建键值映射 |
| 集合推导式 | `{expr for x in iter}` | `set` | 去重或成员判断 |
| 生成器表达式 | `(expr for x in iter)` | `generator` | 大数据量、只遍历一次 |

---

## 4. 函数定义

```python
def greet(name: str) -> str:
    """问候函数。"""
    return f"你好，{name}!"


def divmod_custom(a: int, b: int) -> tuple[int, int]:
    return a // b, a % b


def power(base: float, exp: int = 2) -> float:
    return base ** exp


def connect(host: str, port: int = 3306, timeout: int = 30) -> str:
    return f"连接 {host}:{port}，超时 {timeout}s"


def strict(pos_only, /, normal, *, kw_only):
    return pos_only, normal, kw_only


strict(1, 2, kw_only=3)
```

### 4.1 *args 与 **kwargs

```python
def sum_all(*args: float) -> float:
    return sum(args)


def build_url(base: str, **kwargs: str) -> str:
    params = "&".join(f"{key}={value}" for key, value in kwargs.items())
    return f"{base}?{params}" if params else base


print(sum_all(1, 2, 3))
print(build_url("https://api.example.com", page="1", limit="10"))
```

---

## 5. 一等公民函数

函数是普通对象：可以赋给变量、放进容器、作为参数传递，也可以从另一个函数返回。

```python
def add(a: int, b: int) -> int:
    return a + b


operation = add
ops = {"+": lambda a, b: a + b, "-": lambda a, b: a - b}


def apply_twice(func, value):
    return func(func(value))


def make_multiplier(n: int):
    def multiplier(x: int) -> int:
        return x * n
    return multiplier


double = make_multiplier(2)
print(double(5))  # 10
```

---

## 6. LEGB 作用域规则

Python 查找变量名时按 LEGB 顺序搜索：Local、Enclosing、Global、Built-in。

```python
global_var = "全局"


def outer():
    enclosing_var = "外层"

    def inner():
        local_var = "局部"
        print(local_var)
        print(enclosing_var)
        print(global_var)
        print(len("hello"))

    inner()


counter = 0


def increment():
    global counter
    counter += 1
```

---

## 7. 闭包

闭包让内部函数记住定义时所在作用域里的变量。

```python
def make_counter(initial: int = 0):
    count = initial

    def increment() -> int:
        nonlocal count
        count += 1
        return count

    return increment


counter = make_counter()
print(counter())  # 1
print(counter())  # 2
```

---

## 8. 海象运算符

`:=` 是赋值表达式，适合在表达式中复用刚计算出来的值。

```python
import re

data = [1, 5, 3, 8, 2, 9]
results = [(x, square) for x in data if (square := x**2) > 20]

text = "2026-02-09"
if match := re.match(r"(\d{4})-(\d{2})-(\d{2})", text):
    year, month, day = match.groups()
    print(f"日期: {year}年{month}月{day}日")
```

---

## 代码示例

- [`examples/01-control-flow.py`](./examples/01-control-flow.py)
- [`examples/02-comprehensions.py`](./examples/02-comprehensions.py)
- [`examples/03-functions.py`](./examples/03-functions.py)
- [`examples/04-closures.py`](./examples/04-closures.py)

---

## 最佳实践

```python
for index, item in enumerate(items):
    print(index, item)

def calculate_area(radius: float) -> float:
    import math
    return math.pi * radius ** 2

def add_item_safe(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

- 优先使用 `for item in collection`，不要手写 `range(len(...))`。
- 简单转换和过滤用推导式，复杂逻辑用普通循环。
- 函数只做一件事，并用类型标注说明输入输出。
- 默认参数不要使用可变对象。

## 常见陷阱

```python
functions = [lambda: i for i in range(5)]
print([f() for f in functions])  # [4, 4, 4, 4, 4]

functions = [lambda x=i: x for i in range(5)]
print([f() for f in functions])  # [0, 1, 2, 3, 4]
```

---

## 练习题

1. 写一个 `fizzbuzz(n)`，返回 1 到 n 的 FizzBuzz 结果。
2. 用推导式实现矩阵转置。
3. 自己实现 `my_map(func, iterable)` 和 `my_filter(func, iterable)`。

```python
def fizzbuzz(n: int) -> list[str]:
    return [
        "FizzBuzz" if i % 15 == 0
        else "Fizz" if i % 3 == 0
        else "Buzz" if i % 5 == 0
        else str(i)
        for i in range(1, n + 1)
    ]
```

---

## 参考资源

- [Python 官方文档 - 控制流](https://docs.python.org/3/tutorial/controlflow.html)
- [Python 官方文档 - 函数定义](https://docs.python.org/3/reference/compound_stmts.html#function-definitions)
- [PEP 572 - Assignment Expressions](https://peps.python.org/pep-0572/)
- [PEP 634 - Structural Pattern Matching](https://peps.python.org/pep-0634/)

---

## 下一步

你已经掌握了 Python 的控制流和函数。接下来学习 Python 最常用的数据容器。

**[👉 第 4 章：核心数据结构](../04-data-structures/)**
