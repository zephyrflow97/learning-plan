# 第 5 章：字符串处理与文件操作 — 数据的入口和出口

> *"There are only two hard things in Computer Science: cache invalidation and naming things."*
> Phil Karlton
>
> 现实项目离不开字符串和文件：读取配置、解析用户输入、生成报告、处理 JSON API。它们是代码世界和现实世界之间的接口。

## 📖 本章内容

- [1. 字符串方法](#1-字符串方法)
- [2. f-string 格式化](#2-f-string-格式化)
- [3. 编码与解码：str vs bytes](#3-编码与解码str-vs-bytes)
- [4. pathlib 现代路径操作](#4-pathlib-现代路径操作)
- [5. 文件读写：with 语句](#5-文件读写with-语句)
- [6. JSON、CSV、TOML 处理](#6-jsoncsvtoml-处理)
- [代码示例](#代码示例)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. 字符串方法

Python 的字符串是不可变对象，所有字符串方法都会返回新字符串。

```python
s = "  Hello, Python World!  "

print(s.upper())
print(s.lower())
print(s.title())
print(s.strip())

print(s.find("Python"))       # 找不到返回 -1
print(s.index("Python"))      # 找不到抛出 ValueError
print(s.count("o"))
print(s.startswith("  He"))
print(s.endswith("!  "))

print(s.replace("Python", "Java"))
print("a,b,c".split(","))
print(", ".join(["a", "b", "c"]))
```

| 方法 | 功能 | 返回值 |
|------|------|--------|
| `strip()` | 去掉两端空白 | 新字符串 |
| `split(sep)` | 按分隔符拆分 | 列表 |
| `join(iterable)` | 连接字符串序列 | 新字符串 |
| `replace(old, new)` | 替换子串 | 新字符串 |
| `find(sub)` | 查找子串 | 索引或 -1 |
| `startswith(prefix)` | 前缀检查 | `bool` |

---

## 2. f-string 格式化

```python
name = "Alice"
age = 30
score = 95.678

print(f"姓名: {name}, 年龄: {age}")
print(f"明年 {age + 1} 岁")
print(f"{'成年' if age >= 18 else '未成年'}")

print(f"保留 2 位小数: {score:.2f}")       # 95.68
print(f"百分比: {0.856:.1%}")              # 85.6%
print(f"千位分隔: {1_000_000:,}")          # 1,000,000
print(f"右对齐 10 字符: {name:>10}")
print(f"居中填充: {name:*^10}")

x = 42
print(f"{x=}")
print(f"{x * 2=}")
```

---

## 3. 编码与解码：str vs bytes

`str` 表示 Unicode 文本，`bytes` 表示字节序列。UTF-8 是互联网上最常用的 Unicode 编码方式。

```python
text = "你好, Python!"

encoded = text.encode("utf-8")
print(type(encoded))  # <class 'bytes'>
print(len(text))      # 字符数
print(len(encoded))   # 字节数，中文通常每个字符 3 字节

decoded = encoded.decode("utf-8")
print(decoded)

# 编码和解码方式不匹配会抛出 UnicodeDecodeError
# "你好".encode("utf-8").decode("ascii")
```

---

## 4. pathlib 现代路径操作

`pathlib` 用面向对象的方式处理路径，比手写字符串拼接更安全。

```python
from pathlib import Path

p = Path.home() / "documents" / "file.txt"

print(p.name)
print(p.stem)
print(p.suffix)
print(p.parent)

print(p.exists())
print(p.is_file())
print(p.is_dir())

p.parent.mkdir(parents=True, exist_ok=True)
p.write_text("内容", encoding="utf-8")
content = p.read_text(encoding="utf-8")

for file in Path(".").glob("**/*.py"):
    print(file)
```

---

## 5. 文件读写：with 语句

`with` 会自动关闭文件，即使代码块里发生异常也能正确释放资源。

```python
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()

with open("data.txt", "w", encoding="utf-8") as f:
    f.write("Hello\n")

with open("data.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.rstrip())
```

常用文件模式：

| 模式 | 含义 |
|------|------|
| `r` | 读取，文件必须存在 |
| `w` | 写入，覆盖原文件 |
| `a` | 追加 |
| `x` | 独占创建，文件存在则报错 |
| `rb` / `wb` | 二进制读写 |

---

## 6. JSON、CSV、TOML 处理

```python
import csv
import json
from pathlib import Path

data = {"name": "Alice", "scores": [95, 87, 72]}

json_text = json.dumps(data, ensure_ascii=False, indent=2)
Path("data.json").write_text(json_text, encoding="utf-8")
loaded = json.loads(Path("data.json").read_text(encoding="utf-8"))

with open("data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerow({"name": "Alice", "score": 95})

with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)

# Python 3.11+
import tomllib

with open("config.toml", "rb") as f:
    config = tomllib.load(f)
```

---

## 代码示例

- [`examples/01-string-methods.py`](./examples/01-string-methods.py)
- [`examples/02-fstring.py`](./examples/02-fstring.py)
- [`examples/03-pathlib.py`](./examples/03-pathlib.py)
- [`examples/04-file-formats.py`](./examples/04-file-formats.py)

## 最佳实践

- 文本文件读写始终显式指定 `encoding="utf-8"`。
- 路径处理优先使用 `pathlib.Path`。
- 字符串格式化优先使用 f-string。
- 大文件逐行读取，避免一次性读入内存。
- 数据交换优先使用标准格式：JSON、CSV、TOML。

## 常见陷阱

```python
# Windows 默认编码不一定是 UTF-8
open("data.txt")

# 推荐
open("data.txt", encoding="utf-8")

# 循环中大量字符串拼接效率低
result = ""
for word in words:
    result += word

# 推荐
result = "".join(words)
```

## 练习题

1. 写一个函数，统计文本文件中的行数、单词数和字符数。
2. 读取一个 CSV 文件，按某一列排序后写回新文件。
3. 用 JSON 文件保存一个简单通讯录。

---

## 参考资源

- [Python 官方文档 - 字符串方法](https://docs.python.org/3/library/stdtypes.html#string-methods)
- [Python 官方文档 - pathlib](https://docs.python.org/3/library/pathlib.html)
- [Python 官方文档 - json](https://docs.python.org/3/library/json.html)
- [Python 官方文档 - csv](https://docs.python.org/3/library/csv.html)

---

## 下一步

你已经掌握了字符串和文件处理。接下来学习异常处理和调试。

**[👉 第 6 章：异常处理与调试](../06-exceptions-debugging/)**
