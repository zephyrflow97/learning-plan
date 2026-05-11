# Stage 1 综合练习题集

> *"I hear and I forget. I see and I remember. I do and I understand."*
> Confucius

本练习集覆盖 Stage 1 的基础语法、数据结构、函数、异常、文件操作和 Pythonic 惯用法。建议先独立完成，再对照参考答案。

## 基础语法（1-5）

### 练习 1：温度转换器

编写 `celsius_to_fahrenheit(c)` 和 `fahrenheit_to_celsius(f)`。

```python
def celsius_to_fahrenheit(c: float) -> float:
    return c * 9 / 5 + 32


def fahrenheit_to_celsius(f: float) -> float:
    return (f - 32) * 5 / 9
```

### 练习 2：回文判断

编写 `is_palindrome(s)`，忽略大小写、空格和标点。

```python
def is_palindrome(s: str) -> bool:
    cleaned = "".join(ch.lower() for ch in s if ch.isalnum())
    return cleaned == cleaned[::-1]
```

### 练习 3：猜数字游戏

随机生成 1-100 的数字，用户输入猜测，程序提示“太大”或“太小”。

### 练习 4：FizzBuzz

打印 1-100：3 的倍数输出 `Fizz`，5 的倍数输出 `Buzz`，同时是 3 和 5 的倍数输出 `FizzBuzz`。

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

### 练习 5：字符统计

统计字符串中每个字符出现的次数。

```python
from collections import Counter

def char_count(text: str) -> dict[str, int]:
    return dict(Counter(text.lower()))
```

---

## 数据结构（6-10）

### 练习 6：去重并保序

```python
def unique_ordered(items: list) -> list:
    return list(dict.fromkeys(items))
```

### 练习 7：矩阵转置

```python
def transpose(matrix: list[list]) -> list[list]:
    return [[row[i] for row in matrix] for i in range(len(matrix[0]))]
```

### 练习 8：词频 Top N

```python
from collections import Counter

def top_words(text: str, n: int = 5) -> list[tuple[str, int]]:
    return Counter(text.lower().split()).most_common(n)
```

### 练习 9：成绩分组统计

给定 `[(name, score)]`，按 A/B/C/D 分组并计算每组人数和平均分。

### 练习 10：两个列表的对称差

找出只属于其中一个列表的元素。

```python
def symmetric_diff(a: list, b: list) -> list:
    return list(set(a) ^ set(b))
```

---

## 函数与异常（11-15）

### 练习 11：安全除法

```python
def safe_divide(a, b, default=None):
    try:
        return a / b
    except (ZeroDivisionError, TypeError):
        return default
```

### 练习 12：递归与迭代阶乘

分别用递归和循环实现阶乘，并处理负数输入。

### 练习 13：timer 装饰器

编写 `timer` 装饰器，打印函数执行时间。

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} 耗时: {elapsed:.4f}s")
        return result
    return wrapper
```

### 练习 14：自定义异常

为图书管理系统创建 `BookNotFoundError` 和 `BookAlreadyExistsError`。

### 练习 15：闭包计数器

实现 `make_counter(initial=0)`，返回 `inc`、`dec`、`get`、`reset` 四个函数。

---

## Pythonic（16-20）

### 练习 16：Pythonic 改写

把下面代码改写为推导式：

```python
result = []
for number in numbers:
    if number > 0:
        result.append(number ** 2)
```

参考：

```python
result = [number ** 2 for number in numbers if number > 0]
```

### 练习 17：扁平化嵌套列表

递归展开任意深度的嵌套列表。

### 练习 18：安全获取嵌套字典

实现 `get_nested(data, *keys, default=None)`。

### 练习 19：管道函数

实现 `pipe(value, *functions)`，将值依次传入多个函数。

```python
from functools import reduce

def pipe(value, *functions):
    return reduce(lambda current, func: func(current), functions, value)
```

### 练习 20：简易 CSV 解析

不使用 `csv` 模块，手动解析简单 CSV 字符串，返回字典列表。

```python
def parse_csv(csv_text: str) -> list[dict[str, str]]:
    lines = csv_text.strip().splitlines()
    headers = [item.strip() for item in lines[0].split(",")]
    return [
        dict(zip(headers, [item.strip() for item in line.split(",")]))
        for line in lines[1:]
    ]
```

---

## 完成标准

- [ ] 完成全部 20 道题。
- [ ] 不看答案能独立完成至少 16 道。
- [ ] 能解释每道题里更 Pythonic 的写法为什么更好。

---

## 下一步

完成练习后，挑战实战项目：

**[👉 实战项目：CLI 任务管理器](../projects/cli-task-manager/)**
