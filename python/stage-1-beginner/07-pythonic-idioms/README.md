# 第 7 章：Pythonic 惯用法 — 从“会写 Python”到“写好 Python”

> *"There should be one-- and preferably only one --obvious way to do it."*
> The Zen of Python, Line 13
>
> Pythonic 不是炫技，而是让代码直接表达意图：简洁、可读、符合 Python 社区共识。

## 📖 本章内容

- [1. 解包赋值](#1-解包赋值)
- [2. 推导式进阶](#2-推导式进阶)
- [3. 内置函数妙用](#3-内置函数妙用)
- [4. 下划线惯用法](#4-下划线惯用法)
- [5. 切片赋值与切片对象](#5-切片赋值与切片对象)
- [6. for...else 与 while...else](#6-forelse-与-whileelse)
- [7. 可迭代对象解包](#7-可迭代对象解包)
- [8. 常见反模式与替代方案](#8-常见反模式与替代方案)
- [代码示例](#代码示例)
- [最佳实践](#最佳实践)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. 解包赋值

```python
x, y = (3, 4)
name, age, city = "Alice", 30, "Beijing"

a, b = 1, 2
a, b = b, a

(x, y), z = (1, 2), 3

first, *rest = [1, 2, 3, 4, 5]
*init, last = [1, 2, 3, 4, 5]
first, *middle, last = [1, 2, 3, 4, 5]

_, _, third = (1, 2, 3)
```

---

## 2. 推导式进阶

```python
matrix = [[1, 2, 3], [4, 5, 6]]
flat = [x for row in matrix for x in row]

data = [1, -2, 3, -4, 5]
positives = [x for x in data if x > 0]
labels = ["正数" if x > 0 else "非正数" for x in data]

original = {"a": 1, "b": 2, "c": 3}
flipped = {value: key for key, value in original.items()}

words = ["hello", "HELLO", "Hello"]
unique = {word.lower() for word in words}

total = sum(x**2 for x in range(1_000_000))
```

---

## 3. 内置函数妙用

```python
for index, item in enumerate(items, start=1):
    print(f"{index}. {item}")

for name, score in zip(names, scores):
    print(f"{name}: {score}")

has_big_number = any(x > 10 for x in numbers)
all_positive = all(x > 0 for x in numbers)

sorted_words = sorted(words, key=str.lower)
top_students = sorted(students, key=lambda s: s["score"], reverse=True)

shortest = min(words, key=len)
oldest = max(people, key=lambda person: person["age"])

doubled = [x * 2 for x in numbers]
evens = [x for x in numbers if x % 2 == 0]
```

---

## 4. 下划线惯用法

```python
x, _, z = (1, 2, 3)

for _ in range(5):
    do_something()

class MyClass:
    _internal_var = "内部使用的约定"
    __private_var = "名称会被改写"

population = 8_000_000_000
hex_color = 0xFF_AA_CC
```

---

## 5. 切片赋值与切片对象

```python
items = [0, 1, 2, 3, 4, 5]
items[2:4] = [20, 30]
items[2:2] = [99]
items[2:5] = []

HEADER = slice(0, 10)
BODY = slice(10, 50)

data = "0123456789" * 5 + "extra"
print(data[HEADER])
print(data[BODY])
```

---

## 6. for...else 与 while...else

`for...else` 的 `else` 表示循环没有被 `break` 中断，可以把它理解成 `no break` 分支。

```python
n = 17
for i in range(2, int(n**0.5) + 1):
    if n % i == 0:
        print(f"{n} 不是质数")
        break
else:
    print(f"{n} 是质数")

def find_target(items, target):
    for item in items:
        if item == target:
            return item
    else:
        return None
```

---

## 7. 可迭代对象解包

```python
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = [*list1, *list2]

defaults = {"color": "blue", "size": "M"}
user_config = {"color": "red"}
config = {**defaults, **user_config}

# Python 3.9+
config = defaults | user_config

args = [1, 2, 3]
kwargs = {"sep": " + "}
print(*args, **kwargs)
```

---

## 8. 常见反模式与替代方案

| 反模式 | Pythonic 写法 | 说明 |
|--------|---------------|------|
| `for i in range(len(x))` | `for item in x` | 直接遍历 |
| 需要索引时手写下标 | `enumerate(x)` | 同时拿到索引和值 |
| 循环拼接字符串 | `" ".join(words)` | 更快更清晰 |
| 临时变量交换 | `a, b = b, a` | 解包赋值 |
| `if key in d: d[key]` | `d.get(key, default)` | 安全取值 |
| `f = open(); ...; f.close()` | `with open() as f:` | 自动关闭资源 |
| `if x == None` | `if x is None` | 身份比较 |
| `type(x) == int` | `isinstance(x, int)` | 支持子类 |
| `if len(items) > 0` | `if items` | 利用 truthy/falsy |

---

## 代码示例

- [`examples/01-unpacking.py`](./examples/01-unpacking.py)
- [`examples/02-idioms.py`](./examples/02-idioms.py)
- [`examples/03-antipatterns.py`](./examples/03-antipatterns.py)

## 最佳实践

```python
for item in items:
    process(item)

squares = [x**2 for x in range(10)]

if items:
    process(items)

with open("file.txt", encoding="utf-8") as f:
    content = f.read()

if result is None:
    handle_missing()

x, y, z = point
```

## 练习题

1. 把 `range(len(numbers))` 风格的循环改写成推导式。
2. 用最 Pythonic 的方式合并两个字典，并统计所有值的总和。
3. 从至少 3 个元素的列表中提取第一个、最后一个和中间所有元素。

```python
numbers = [-2, 0, 3, 5]
result = [number * 2 for number in numbers if number > 0]

data = [1, 2, 3, 4, 5]
first, *middle, last = data
```

---

## 参考资源

- [The Zen of Python](https://peps.python.org/pep-0020/)
- [PEP 8 Python 代码风格指南](https://peps.python.org/pep-0008/)
- [Real Python - Pythonic Code](https://realpython.com/learning-paths/writing-pythonic-code/)

---

## 下一步

恭喜，你已经完成 Python 基础章节。接下来通过练习和项目把这些语法变成肌肉记忆。

**[👉 练习题集](../exercises/)**

**[👉 实战项目：CLI 任务管理器](../projects/cli-task-manager/)**
