# 第 9 章：正则表达式 — 文本处理的瑞士军刀

> *"Some people, when confronted with a problem, think 'I know, I'll use regular expressions.' Now they have two problems."*
> — Jamie Zawinski
>
> 这句名言吓退了无数人。但事实是：正则表达式是**文本处理最强大的工具**。
> 问题不在工具本身，而在于你是否理解它。
> 就像电锯——用对了能建房子，用错了后果自负。

## 📖 本章内容

- [1. 正则表达式基础语法](#1-正则表达式基础语法)
  - [1.1 字符匹配](#11-字符匹配)
  - [1.2 量词](#12-量词)
  - [1.3 锚点](#13-锚点)
  - [1.4 字符类](#14-字符类)
- [2. re 模块核心函数](#2-re-模块核心函数)
  - [2.1 match vs search vs findall](#21-match-vs-search-vs-findall)
  - [2.2 sub 与 split](#22-sub-与-split)
  - [2.3 函数对比表](#23-函数对比表)
- [3. 分组与捕获](#3-分组与捕获)
  - [3.1 基础分组](#31-基础分组)
  - [3.2 命名分组](#32-命名分组)
  - [3.3 非捕获分组](#33-非捕获分组)
- [4. 贪婪 vs 非贪婪](#4-贪婪-vs-非贪婪)
- [5. 前瞻与后顾断言](#5-前瞻与后顾断言)
  - [5.1 正向前瞻 (?=...)](#51-正向前瞻-)
  - [5.2 负向前瞻 (?!...)](#52-负向前瞻-)
  - [5.3 正向后顾 (?<=...)](#53-正向后顾-)
  - [5.4 负向后顾 (?<!...)](#54-负向后顾-)
- [6. 编译正则与性能](#6-编译正则与性能)
  - [6.1 re.compile](#61-recompile)
  - [6.2 re.VERBOSE（可读正则）](#62-reverbose可读正则)
  - [6.3 性能陷阱：回溯灾难](#63-性能陷阱回溯灾难)
- [7. 实用案例](#7-实用案例)
  - [7.1 邮箱验证](#71-邮箱验证)
  - [7.2 URL 解析](#72-url-解析)
  - [7.3 日志解析](#73-日志解析)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [导航](#导航)

---

## 1. 正则表达式基础语法

> 🎭 **The Drama：正则 = 一门微型语言**
>
> 正则表达式不是 Python 的发明——它源于 1956 年数学家 Stephen Kleene 的形式语言理论。
> 从 `grep`（1973）到 Perl（1987）再到 Python、JavaScript、Java……
> 60 多年过去了，正则的核心语法几乎没变。
>
> **一次学会，到处能用。**

### 1.1 字符匹配

```python
import re

# 普通字符：精确匹配
print(re.search(r"hello", "say hello world"))
# <re.Match object; span=(4, 9), match='hello'>

# . 匹配任意字符（除换行）
print(re.findall(r"h.t", "hat hit hot hut"))
# ['hat', 'hit', 'hot', 'hut']

# \ 转义特殊字符
print(re.search(r"3\.14", "pi is 3.14"))
# <re.Match object; span=(6, 10), match='3.14'>
```

### 1.2 量词

```python
import re

text: str = "aab aaab ab aaaab"

# * 零次或多次
print(f"a*b: {re.findall(r'a*b', text)}")
# ['aab', 'aaab', 'ab', 'aaaab']

# + 一次或多次
print(f"a+b: {re.findall(r'a+b', text)}")
# ['aab', 'aaab', 'ab', 'aaaab']

# ? 零次或一次
print(f"a?b: {re.findall(r'a?b', text)}")
# ['ab', 'ab', 'ab', 'ab']

# {n} 精确 n 次
print(f"a{{2}}b: {re.findall(r'a{2}b', text)}")
# ['aab']

# {n,m} n 到 m 次
print(f"a{{2,3}}b: {re.findall(r'a{2,3}b', text)}")
# ['aab', 'aaab']
```

**量词速查表：**

| 量词 | 含义 | 等价 |
|------|------|------|
| `*` | 0 次或多次 | `{0,}` |
| `+` | 1 次或多次 | `{1,}` |
| `?` | 0 次或 1 次 | `{0,1}` |
| `{n}` | 恰好 n 次 | — |
| `{n,}` | 至少 n 次 | — |
| `{n,m}` | n 到 m 次 | — |

### 1.3 锚点

```python
import re

# ^ 行首
print(re.search(r"^hello", "hello world"))  # 匹配
print(re.search(r"^hello", "say hello"))    # None

# $ 行尾
print(re.search(r"world$", "hello world"))  # 匹配
print(re.search(r"world$", "world!"))       # None

# \b 单词边界
print(re.findall(r"\bcat\b", "cat catalog scattered"))
# ['cat'] — 只匹配独立的 "cat"，不匹配 "catalog" 中的
```

### 1.4 字符类

```python
import re

# [abc] 匹配 a 或 b 或 c
print(re.findall(r"[aeiou]", "hello world"))
# ['e', 'o', 'o']

# [^abc] 匹配除了 a、b、c 之外的字符
print(re.findall(r"[^aeiou ]", "hello world"))
# ['h', 'l', 'l', 'w', 'r', 'l', 'd']

# 预定义字符类
# \d = [0-9]         数字
# \D = [^0-9]        非数字
# \w = [a-zA-Z0-9_]  单词字符
# \W = [^a-zA-Z0-9_] 非单词字符
# \s = [ \t\n\r\f\v] 空白字符
# \S = [^ \t\n\r\f\v] 非空白字符

phone: str = "Call 123-456-7890 or 098-765-4321"
print(re.findall(r"\d{3}-\d{3}-\d{4}", phone))
# ['123-456-7890', '098-765-4321']
```

---

## 2. re 模块核心函数

### 2.1 match vs search vs findall

```
    re.match      re.search      re.findall
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ 从头匹配  │  │ 搜索第一个│  │ 搜索所有  │
    │ 第一个    │  │ 匹配位置  │  │ 返回列表  │
    └──────────┘  └──────────┘  └──────────┘

    text = "abc 123 def 456"

    match(r"\d+", text)  → None (开头不是数字)
    search(r"\d+", text) → Match(123) (找到第一个)
    findall(r"\d+", text)→ ['123', '456'] (找到所有)
```

```python
import re

text: str = "The price is $42.99 and $18.50"

# match: 从字符串开头匹配
result_match = re.match(r"\d+", text)
print(f"[match] {result_match}")    # None（开头是 "The"）

# search: 搜索第一个匹配
result_search = re.search(r"\$(\d+\.\d+)", text)
if result_search:
    print(f"[search] 找到: {result_search.group()}")     # $42.99
    print(f"[search] 捕获组: {result_search.group(1)}")   # 42.99

# findall: 搜索所有匹配
result_findall: list[str] = re.findall(r"\$(\d+\.\d+)", text)
print(f"[findall] 所有价格: {result_findall}")  # ['42.99', '18.50']

# finditer: 返回迭代器（大文本用）
for m in re.finditer(r"\$(\d+\.\d+)", text):
    print(f"[finditer] 位置 {m.start()}-{m.end()}: {m.group()}")
```

### 2.2 sub 与 split

```python
import re

# sub: 替换
text: str = "Hello   World   Python"
cleaned: str = re.sub(r"\s+", " ", text)
print(f"[sub] '{text}' -> '{cleaned}'")
# 'Hello World Python'

# sub 带函数：动态替换
def double_number(match: re.Match[str]) -> str:
    """将匹配到的数字翻倍。"""
    num: int = int(match.group())
    result: str = str(num * 2)
    print(f"[double] {num} -> {result}")
    return result

text2: str = "item1: 5, item2: 10, item3: 15"
result: str = re.sub(r"\d+", double_number, text2)
print(f"[sub with func] {result}")
# 'item1: 10, item2: 20, item3: 30'

# split: 按模式分割
text3: str = "one,two;three four|five"
parts: list[str] = re.split(r"[,;\s|]+", text3)
print(f"[split] {parts}")
# ['one', 'two', 'three', 'four', 'five']
```

### 2.3 函数对比表

| 函数 | 返回类型 | 匹配位置 | 匹配次数 | 适用场景 |
|------|----------|----------|----------|----------|
| `match` | `Match \| None` | 字符串开头 | 一次 | 验证格式 |
| `search` | `Match \| None` | 任意位置 | 第一个 | 查找第一个 |
| `findall` | `list[str]` | 任意位置 | 所有 | 提取所有 |
| `finditer` | `Iterator[Match]` | 任意位置 | 所有 | 大文本 |
| `sub` | `str` | 任意位置 | 所有 | 替换 |
| `split` | `list[str]` | 任意位置 | 所有 | 分割 |
| `fullmatch` | `Match \| None` | 整个字符串 | 一次 | 完整验证 |

---

## 3. 分组与捕获

### 3.1 基础分组

```python
import re

# () 创建捕获组
date_text: str = "Today is 2024-01-15"
match = re.search(r"(\d{4})-(\d{2})-(\d{2})", date_text)

if match:
    print(f"[分组] 完整匹配: {match.group(0)}")  # 2024-01-15
    print(f"[分组] 年: {match.group(1)}")          # 2024
    print(f"[分组] 月: {match.group(2)}")          # 01
    print(f"[分组] 日: {match.group(3)}")          # 15
    print(f"[分组] 所有组: {match.groups()}")       # ('2024', '01', '15')
```

### 3.2 命名分组

```python
import re

# (?P<name>...) 命名捕获组
log_line: str = '[2024-01-15 10:30:45] ERROR: Connection failed'
pattern: str = r'\[(?P<timestamp>[\d\- :]+)\] (?P<level>\w+): (?P<message>.+)'

match = re.search(pattern, log_line)
if match:
    print(f"[命名分组] timestamp = {match.group('timestamp')}")
    print(f"[命名分组] level     = {match.group('level')}")
    print(f"[命名分组] message   = {match.group('message')}")
    print(f"[命名分组] groupdict = {match.groupdict()}")
```

### 3.3 非捕获分组

```python
import re

# (?:...) 非捕获分组：分组但不捕获
# 用于需要分组（如量词）但不需要提取的情况

# ✅ 非捕获分组
urls: str = "http://example.com https://secure.org ftp://files.net"
pattern: str = r"(?:https?|ftp)://[\w.]+"
print(f"[非捕获] {re.findall(pattern, urls)}")
# ['http://example.com', 'https://secure.org', 'ftp://files.net']

# ❌ 如果用捕获分组，findall 只返回组内容
pattern_bad: str = r"(https?|ftp)://[\w.]+"
print(f"[捕获组] {re.findall(pattern_bad, urls)}")
# ['http', 'https', 'ftp']  — 只返回了组的内容！
```

---

## 4. 贪婪 vs 非贪婪

> 🧠 **CS Master's Bridge：贪婪匹配的本质**
>
> 正则引擎默认使用**贪婪匹配**：尽可能多地匹配字符。
> 加上 `?` 后变成**非贪婪**（惰性）：尽可能少地匹配。
>
> 这两种策略的区别在于回溯方向：
> - 贪婪：先吃掉所有，然后往回吐，直到模式匹配
> - 非贪婪：先吃最少，然后慢慢多吃，直到模式匹配

```python
import re

html: str = "<b>bold</b> and <i>italic</i>"

# ❌ 贪婪：.* 尽可能多地匹配
greedy: list[str] = re.findall(r"<.*>", html)
print(f"[贪婪]   {greedy}")
# ['<b>bold</b> and <i>italic</i>']  — 吃掉了整个字符串！

# ✅ 非贪婪：.*? 尽可能少地匹配
lazy: list[str] = re.findall(r"<.*?>", html)
print(f"[非贪婪] {lazy}")
# ['<b>', '</b>', '<i>', '</i>']  — 只匹配最短的标签

# 贪婪 vs 非贪婪对照:
# .*   贪婪（默认）
# .*?  非贪婪
# .+   贪婪
# .+?  非贪婪
# .{2,5}   贪婪（匹配 5 个）
# .{2,5}?  非贪婪（匹配 2 个）
```

```
贪婪匹配过程:  <.*>
                <b>bold</b> and <i>italic</i>
                ^                            ^
                |←————  .* 吃掉所有  ————————→|
                然后往回吐，直到遇到 >

非贪婪匹配过程:  <.*?>
                <b>bold</b> and <i>italic</i>
                ^  ^
                |→| .*? 尽量少吃，遇到 > 就停
```

---

## 5. 前瞻与后顾断言

> ⚛️ **The Science：零宽断言**
>
> 前瞻和后顾是**零宽断言 (Zero-Width Assertions)**——它们匹配的是**位置**，不是字符。
> 就像 `^` 和 `$` 匹配行首/行尾的位置一样，前瞻/后顾匹配满足特定条件的位置。

### 5.1 正向前瞻 (?=...)

```python
import re

# 匹配后面跟着特定模式的位置
text: str = "100px 200em 300px 50%"

# 找到后面跟着 "px" 的数字
result: list[str] = re.findall(r"\d+(?=px)", text)
print(f"[正向前瞻] 像素值: {result}")  # ['100', '300']
# 注意：px 本身不在匹配结果中！
```

### 5.2 负向前瞻 (?!...)

```python
import re

text: str = "100px 200em 300px 50%"

# 找到后面 **不** 跟着 "px" 的数字
result: list[str] = re.findall(r"\d+(?!px)(?!\d)", text)
print(f"[负向前瞻] 非像素值: {result}")  # ['200', '50']
```

### 5.3 正向后顾 (?<=...)

```python
import re

text: str = "Price: $42.99, Tax: $3.50"

# 找到前面是 $ 的数字
result: list[str] = re.findall(r"(?<=\$)\d+\.\d+", text)
print(f"[正向后顾] 金额: {result}")  # ['42.99', '3.50']
```

### 5.4 负向后顾 (?<!...)

```python
import re

text: str = "test123 _private no-dash"

# 找到前面不是下划线的单词
result: list[str] = re.findall(r"(?<!_)\b\w+\b", text)
print(f"[负向后顾] {result}")
```

**断言总结：**

| 语法 | 名称 | 含义 |
|------|------|------|
| `(?=X)` | 正向前瞻 | 后面是 X |
| `(?!X)` | 负向前瞻 | 后面不是 X |
| `(?<=X)` | 正向后顾 | 前面是 X |
| `(?<!X)` | 负向后顾 | 前面不是 X |

---

## 6. 编译正则与性能

### 6.1 re.compile

```python
import re
import time

# ❌ 每次调用都重新编译（在循环中低效）
def search_slow(lines: list[str]) -> list[str]:
    results: list[str] = []
    for line in lines:
        if re.search(r"ERROR|CRITICAL|FATAL", line):
            results.append(line)
    return results

# ✅ 预编译模式（推荐用于重复使用的模式）
ERROR_PATTERN = re.compile(r"ERROR|CRITICAL|FATAL")

def search_fast(lines: list[str]) -> list[str]:
    results: list[str] = []
    for line in lines:
        if ERROR_PATTERN.search(line):
            results.append(line)
    return results

# 注意：Python 内部有缓存机制（默认缓存最近 512 个模式）
# 对于少量模式，性能差异可以忽略
# 对于循环中的大量调用，预编译确实更快
```

### 6.2 re.VERBOSE（可读正则）

```python
import re

# ❌ 不可读的正则
pattern_ugly: str = r"^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})\s(\w+):\s(.+)$"

# ✅ 使用 re.VERBOSE 添加注释和空白
pattern_readable = re.compile(r"""
    ^                           # 行首
    (?P<date>
        (?P<year>\d{4})         # 年
        -(?P<month>\d{2})       # 月
        -(?P<day>\d{2})         # 日
    )
    \s                          # 空格
    (?P<time>
        (?P<hour>\d{2})         # 时
        :(?P<minute>\d{2})      # 分
        :(?P<second>\d{2})      # 秒
    )
    \s                          # 空格
    (?P<level>\w+)              # 日志级别
    :\s                         # 冒号+空格
    (?P<message>.+)             # 日志消息
    $                           # 行尾
""", re.VERBOSE)

log: str = "2024-01-15 10:30:45 ERROR: Connection timeout"
match = pattern_readable.search(log)
if match:
    print(f"[VERBOSE] date={match.group('date')}")
    print(f"[VERBOSE] time={match.group('time')}")
    print(f"[VERBOSE] level={match.group('level')}")
    print(f"[VERBOSE] message={match.group('message')}")
```

### 6.3 性能陷阱：回溯灾难

```python
import re
import time

# ⚠️ 回溯灾难 (ReDoS) — 恶意输入可以让正则运行极慢

# 危险模式：嵌套量词
# pattern = r"(a+)+"  # 对 "aaaaaaaaaaaaaaab" 会指数级回溯

# ✅ 安全做法
# 1. 避免嵌套量词: (a+)+ → a+
# 2. 使用原子分组（Python 3.11+）: (?>a+)
# 3. 设置超时
# 4. 测试边界情况

# 演示性能对比
safe_pattern = re.compile(r"a+b")
text_safe: str = "a" * 30 + "b"

start: float = time.perf_counter()
result = safe_pattern.search(text_safe)
elapsed: float = time.perf_counter() - start

print(f"[性能] 安全模式耗时: {elapsed:.6f}s, 匹配={result is not None}")
```

---

## 7. 实用案例

### 7.1 邮箱验证

```python
import re

# 简化版邮箱正则（不是 RFC 5322 完整版，但覆盖 99% 场景）
EMAIL_PATTERN = re.compile(r"""
    ^
    [a-zA-Z0-9._%+-]+      # 用户名
    @                        # @
    [a-zA-Z0-9.-]+          # 域名
    \.                       # .
    [a-zA-Z]{2,}            # 顶级域名 (至少 2 字符)
    $
""", re.VERBOSE)

def validate_email(email: str) -> bool:
    is_valid: bool = EMAIL_PATTERN.match(email) is not None
    print(f"[validate_email] '{email}' -> {is_valid}")
    return is_valid

# 测试
validate_email("user@example.com")     # True
validate_email("a.b+c@test.org")       # True
validate_email("invalid")               # False
validate_email("@missing-user.com")    # False
```

### 7.2 URL 解析

```python
import re

URL_PATTERN = re.compile(r"""
    (?P<scheme>https?|ftp)://        # 协议
    (?P<host>[^/:]+)                  # 主机名
    (?::(?P<port>\d+))?              # 端口（可选）
    (?P<path>/[^\s?#]*)?             # 路径（可选）
    (?:\?(?P<query>[^\s#]*))?        # 查询参数（可选）
    (?:\#(?P<fragment>\S*))?         # 片段（可选）
""", re.VERBOSE)

def parse_url(url: str) -> dict[str, str | None]:
    match = URL_PATTERN.search(url)
    if not match:
        print(f"[parse_url] 无法解析: {url}")
        return {}
    result: dict[str, str | None] = match.groupdict()
    print(f"[parse_url] {url}")
    for key, value in result.items():
        if value:
            print(f"  {key}: {value}")
    return result

parse_url("https://example.com:8080/path/to/page?q=hello&lang=zh#section1")
parse_url("http://localhost:3000/api/users")
```

### 7.3 日志解析

```python
import re
from typing import TypedDict

class LogEntry(TypedDict):
    timestamp: str
    level: str
    module: str
    message: str

LOG_PATTERN = re.compile(r"""
    \[(?P<timestamp>[\d\-\s:]+)\]    # [2024-01-15 10:30:45]
    \s+
    (?P<level>DEBUG|INFO|WARNING|ERROR|CRITICAL)  # 日志级别
    \s+
    (?P<module>[\w.]+)               # 模块名
    :\s
    (?P<message>.+)                  # 消息内容
""", re.VERBOSE)


def parse_log_line(line: str) -> LogEntry | None:
    """解析一行日志。"""
    match = LOG_PATTERN.search(line)
    if not match:
        print(f"[parse_log] 无法解析: {line[:50]}...")
        return None
    entry: LogEntry = {
        "timestamp": match.group("timestamp").strip(),
        "level": match.group("level"),
        "module": match.group("module"),
        "message": match.group("message"),
    }
    print(f"[parse_log] {entry['level']} | {entry['module']} | {entry['message'][:40]}")
    return entry


# 测试
logs: list[str] = [
    "[2024-01-15 10:30:45] ERROR myapp.database: Connection refused to localhost:5432",
    "[2024-01-15 10:30:46] INFO  myapp.api: Server started on port 8000",
    "[2024-01-15 10:31:00] WARNING myapp.cache: Cache miss rate above 50%",
]

for log in logs:
    parse_log_line(log)
```

---

## 最佳实践

> 🧰 **Toolbox：正则表达式使用指南**
>
> 1. **先考虑是否需要正则**：简单的字符串操作用 `str.split()`、`str.replace()` 更好
> 2. **使用原始字符串**：`r"pattern"` 避免反斜杠地狱
> 3. **使用 `re.VERBOSE`**：复杂正则必须加注释
> 4. **使用命名分组**：`(?P<name>...)` 比 `group(1)` 可读得多
> 5. **预编译**：重复使用的模式用 `re.compile()`
> 6. **测试边界**：空字符串、超长输入、特殊字符

```python
# ✅ 好的正则实践
import re

PHONE_PATTERN = re.compile(r"""
    (?P<country>\+\d{1,3})?     # 国际区号（可选）
    [-.\s]?                      # 分隔符（可选）
    (?P<area>\d{3})             # 区号
    [-.\s]?                      # 分隔符
    (?P<number>\d{3}[-.\s]?\d{4})  # 电话号码
""", re.VERBOSE)

# ❌ 差的正则实践
# pattern = r"(\+\d{1,3})?[-.\s]?(\d{3})[-.\s]?(\d{3}[-.\s]?\d{4})"
# 没人看得懂这是什么
```

---

## 常见陷阱

```python
import re

# ❌ 陷阱 1: 忘记用原始字符串
# re.search("\d+", "123")    # \d 被 Python 先解释为转义！
re.search(r"\d+", "123")     # ✅ 用 r"" 原始字符串

# ❌ 陷阱 2: match 只匹配开头
re.match(r"\d+", "abc123")   # None！因为开头不是数字
re.search(r"\d+", "abc123")  # ✅ Match('123')

# ❌ 陷阱 3: findall 带捕获组时只返回组
re.findall(r"(ab)+", "ababab")   # ['ab'] — 不是 ['ababab']！
re.findall(r"(?:ab)+", "ababab") # ✅ ['ababab']

# ❌ 陷阱 4: 贪婪匹配吞掉太多
re.findall(r"<.+>", "<a><b>")    # ['<a><b>'] — 吃掉了整个！
re.findall(r"<.+?>", "<a><b>")   # ✅ ['<a>', '<b>']

# ❌ 陷阱 5: 不测试空输入
pattern = re.compile(r"(\w+)")
result = pattern.findall("")     # [] — 空结果，确保你的代码能处理
```

---

## 导航

| 方向 | 链接 |
|------|------|
| ⬅️ 上一章 | [第 8 章：pytest 测试](../08-testing-pytest/) |
| ➡️ 练习题 | [Stage 2 练习题](../exercises/) |
| 🏠 阶段目录 | [Stage 2 目录](../) |

---

## 参考资料

- [Python re 模块文档](https://docs.python.org/3/library/re.html)
- [Regular Expressions 101 (在线测试)](https://regex101.com/)
- [Mastering Regular Expressions, 3rd Ed.](https://www.oreilly.com/library/view/mastering-regular-expressions/0596528124/)
- [ReDoS 攻击解释](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)
