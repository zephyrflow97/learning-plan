# 第 4 章：核心数据结构 — Python 的四大金刚

> *"Data dominates. If you've chosen the right data structures and organized things well, the algorithms will almost always be self-evident."*
> Rob Pike
>
> 列表、元组、字典和集合是 Python 日常编程的核心。选对数据结构，代码会更短、更快，也更容易读。

## 📖 本章内容

- [1. list 动态数组](#1-list-动态数组)
- [2. tuple 不可变序列](#2-tuple-不可变序列)
- [3. dict 哈希表](#3-dict-哈希表)
- [4. set 集合](#4-set-集合)
- [5. collections 模块](#5-collections-模块)
- [6. 数据结构选择指南](#6-数据结构选择指南)
- [代码示例](#代码示例)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. list 动态数组

`list` 底层是动态数组，适合按顺序存储、随机访问和尾部追加。

```python
fruits = ["apple", "banana", "cherry"]

print(fruits[0])     # apple，正索引
print(fruits[-1])    # cherry，负索引

fruits[1] = "blueberry"
fruits.append("date")
fruits.insert(0, "avocado")
fruits.extend(["fig", "grape"])

fruits.remove("cherry")
popped = fruits.pop()
del fruits[0]

print("apple" in fruits)
print(fruits.index("apple"))
print(fruits.count("apple"))
```

### 切片

```python
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

print(nums[2:5])     # [2, 3, 4]
print(nums[:3])      # [0, 1, 2]
print(nums[7:])      # [7, 8, 9]
print(nums[::2])     # [0, 2, 4, 6, 8]
print(nums[::-1])    # 反转

nums[2:5] = [20, 30, 40]
nums[2:5] = []
nums[2:2] = [99]
```

### 排序

```python
numbers = [3, 1, 4, 1, 5, 9]
numbers.sort()
numbers.sort(reverse=True)

words = ["banana", "Apple", "cherry"]
print(sorted(words, key=str.lower))

students = [("Alice", 95), ("Bob", 87), ("Charlie", 72)]
print(sorted(students, key=lambda item: item[1], reverse=True))
```

---

## 2. tuple 不可变序列

`tuple` 适合表示不可变记录，常用于函数多返回值、字典键、坐标等场景。

```python
point = (3, 4)
x, y = point

name, age, city = ("Alice", 30, "Beijing")

def min_max(values: list[int]) -> tuple[int, int]:
    return min(values), max(values)

lo, hi = min_max([3, 1, 9, 2])
```

---

## 3. dict 哈希表

`dict` 是键值映射，查找、插入和删除的平均复杂度都是 O(1)。Python 3.7 起，字典保证插入顺序。

```python
person = {"name": "Alice", "age": 30}

print(person["name"])
print(person.get("email", "未设置"))

person["city"] = "Beijing"
person.update({"age": 31, "job": "Engineer"})

age = person.pop("age")
for key, value in person.items():
    print(key, value)

dict1 = {"a": 1}
dict2 = {"b": 2}
merged = dict1 | dict2
```

### defaultdict 与 Counter

```python
from collections import Counter, defaultdict

word_count = defaultdict(int)
for word in ["apple", "banana", "apple"]:
    word_count[word] += 1

counter = Counter("mississippi")
print(counter.most_common(2))
```

---

## 4. set 集合

`set` 适合去重、成员判断和集合运算。

```python
numbers = {1, 2, 3, 3}
print(numbers)  # {1, 2, 3}

valid_roles = {"admin", "editor", "viewer"}
print("admin" in valid_roles)

a = {1, 2, 3}
b = {3, 4, 5}
print(a | b)  # 并集
print(a & b)  # 交集
print(a - b)  # 差集
print(a ^ b)  # 对称差集
```

---

## 5. collections 模块

```python
from collections import ChainMap, Counter, defaultdict, deque

queue = deque(["a", "b"])
queue.append("c")
queue.appendleft("start")
queue.pop()
queue.popleft()

groups = defaultdict(list)
for name, department in [("Alice", "R&D"), ("Bob", "R&D"), ("Cindy", "HR")]:
    groups[department].append(name)

counter = Counter(["python", "java", "python"])

defaults = {"theme": "light", "page_size": 20}
user_config = {"theme": "dark"}
config = ChainMap(user_config, defaults)
print(config["theme"])
print(config["page_size"])
```

---

## 6. 数据结构选择指南

| 需求 | 推荐结构 |
|------|---------|
| 保持顺序、频繁尾部追加 | `list` |
| 不可变记录 | `tuple` |
| 键值映射 | `dict` |
| 去重、成员判断 | `set` |
| 双端队列 | `collections.deque` |
| 计数 | `collections.Counter` |
| 分组 | `collections.defaultdict(list)` |

---

## 代码示例

- [`examples/01-lists.py`](./examples/01-lists.py)
- [`examples/02-dicts.py`](./examples/02-dicts.py)
- [`examples/03-tuples-sets.py`](./examples/03-tuples-sets.py)
- [`examples/04-collections-module.py`](./examples/04-collections-module.py)

## 最佳实践

- 用 `dict.get(key, default)` 处理可能不存在的键。
- 用 `set` 做大量成员判断，避免在列表里反复 `in`。
- 不要在遍历列表时删除元素，先构造新列表。
- 需要队列时优先用 `deque`，不要用 `list.pop(0)`。
- 空集合必须写 `set()`，`{}` 是空字典。

## 常见陷阱

```python
matrix = [[0] * 3] * 3      # 三行引用同一个列表
matrix[0][0] = 1
print(matrix)               # [[1, 0, 0], [1, 0, 0], [1, 0, 0]]

matrix = [[0] * 3 for _ in range(3)]
matrix[0][0] = 1
print(matrix)               # [[1, 0, 0], [0, 0, 0], [0, 0, 0]]
```

## 练习题

1. 统计一段文本中每个单词出现的次数。
2. 实现一个最近访问记录，只保留最近 5 条。
3. 给定用户列表，按部门分组。

---

## 参考资源

- [Python 官方文档 - 数据结构](https://docs.python.org/3/tutorial/datastructures.html)
- [collections 模块文档](https://docs.python.org/3/library/collections.html)

---

## 下一步

你已经掌握了 Python 的核心数据结构。接下来学习字符串处理和文件操作。

**[👉 第 5 章：字符串处理与文件操作](../05-strings-files/)**
