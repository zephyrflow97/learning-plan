# 第 6 章：异常处理与调试 — 当事情不按计划进行

> *"Errors should never pass silently. Unless explicitly silenced."*
> The Zen of Python, Line 10
>
> 完美的代码不存在。文件会丢，网络会断，用户会输入离谱的数据。异常处理的目标不是掩盖失败，而是让失败可预期、可定位、可恢复。

## 📖 本章内容

- [1. 异常层次结构](#1-异常层次结构)
- [2. try/except/else/finally](#2-tryexceptelsefinally)
- [3. 自定义异常类](#3-自定义异常类)
- [4. EAFP vs LBYL](#4-eafp-vs-lbyl)
- [5. 调试技巧](#5-调试技巧)
- [6. 常见异常速查表](#6-常见异常速查表)
- [代码示例](#代码示例)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. 异常层次结构

日常开发中通常捕获 `Exception` 及其子类，不要捕获 `BaseException`。`KeyboardInterrupt` 和 `SystemExit` 不属于 `Exception`，这样 Ctrl+C 和 `sys.exit()` 才能正常退出程序。

```text
BaseException
├── SystemExit
├── KeyboardInterrupt
└── Exception
    ├── ArithmeticError
    │   └── ZeroDivisionError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── ValueError
    ├── TypeError
    ├── AttributeError
    ├── OSError
    │   ├── FileNotFoundError
    │   └── PermissionError
    └── RuntimeError
```

---

## 2. try/except/else/finally

```python
def safe_divide(a: float, b: float) -> float | None:
    try:
        result = a / b
    except ZeroDivisionError:
        print("[异常] 除数不能为零")
        return None
    except TypeError as exc:
        print(f"[异常] 类型错误: {exc}")
        return None
    else:
        print(f"[异常] 计算成功: {result}")
        return result
    finally:
        print("[异常] 清理完成")


try:
    value = int("abc")
except (ValueError, TypeError) as exc:
    print(f"捕获: {type(exc).__name__}: {exc}")
```

`else` 只在没有异常时执行，适合放正常路径逻辑；`finally` 无论是否异常都会执行，适合释放资源。

---

## 3. 自定义异常类

业务代码建议定义自己的异常层次，外部调用者可以统一捕获业务错误。

```python
class AppError(Exception):
    """应用程序基础异常。"""


class ValidationError(AppError):
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"验证错误 [{field}]: {message}")


class NotFoundError(AppError):
    def __init__(self, resource: str, identifier):
        self.resource = resource
        self.identifier = identifier
        super().__init__(f"{resource} 不存在: {identifier}")


def create_user(name: str, age: int) -> dict:
    if len(name) < 2:
        raise ValidationError("name", "至少 2 个字符")
    if age < 0:
        raise ValidationError("age", "不能为负数")
    return {"name": name, "age": age}
```

---

## 4. EAFP vs LBYL

LBYL 是“先检查，再操作”；EAFP 是“先操作，出错再处理”。Python 更偏向 EAFP，因为它配合鸭子类型更自然，也能避免检查和使用之间的竞态条件。

```python
# LBYL
if "key" in dictionary:
    value = dictionary["key"]
else:
    value = default

# EAFP
try:
    value = dictionary["key"]
except KeyError:
    value = default

# 这个场景下最直接
value = dictionary.get("key", default)
```

| 对比 | LBYL | EAFP |
|------|------|------|
| 思路 | 先检查 | 先尝试 |
| 风格 | Java/C++ 常见 | Python 常见 |
| 竞态风险 | 可能发生 TOCTOU | 更接近原子操作 |
| 鸭子类型 | 容易写成类型检查 | 更自然 |

---

## 5. 调试技巧

### 5.1 print 调试

```python
def buggy_function(data):
    print(f"[DEBUG] data = {data}")
    result = process(data)
    print(f"[DEBUG] result = {result}")
    return result
```

### 5.2 logging 模块

```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

logger = logging.getLogger(__name__)

logger.debug("详细调试信息")
logger.info("正常运行信息")
logger.warning("警告信息")
logger.error("错误信息")
logger.critical("严重错误")
```

### 5.3 breakpoint()

```python
def my_function(x):
    breakpoint()
    return x * 2
```

常用 pdb 命令：`n` 下一行，`s` 进入函数，`c` 继续执行，`p expr` 打印表达式，`q` 退出。

---

## 6. 常见异常速查表

| 异常 | 触发条件 | 示例 |
|------|---------|------|
| `ValueError` | 值不合法 | `int("abc")` |
| `TypeError` | 类型不匹配 | `"hello" + 42` |
| `IndexError` | 索引越界 | `[1, 2][10]` |
| `KeyError` | 键不存在 | `{}["key"]` |
| `AttributeError` | 属性不存在 | `"hello".foo` |
| `ZeroDivisionError` | 除以 0 | `1 / 0` |
| `FileNotFoundError` | 文件不存在 | `open("no.txt")` |
| `StopIteration` | 迭代器耗尽 | `next(iter([]))` |

---

## 代码示例

- [`examples/01-exception-hierarchy.py`](./examples/01-exception-hierarchy.py)
- [`examples/02-custom-exceptions.py`](./examples/02-custom-exceptions.py)
- [`examples/03-eafp-vs-lbyl.py`](./examples/03-eafp-vs-lbyl.py)
- [`examples/04-debugging.py`](./examples/04-debugging.py)

## 最佳实践

- 捕获具体异常，不要裸 `except`。
- 不要静默吞掉异常，至少记录日志。
- 用 `raise ... from ...` 保留异常链。
- 清理资源优先用 `with`，必要时再用 `finally`。
- 自定义异常继承 `Exception`，不要继承 `BaseException`。

```python
try:
    data = load_data()
except FileNotFoundError as exc:
    raise RuntimeError("加载失败") from exc
```

## 常见陷阱

```python
try:
    risky_operation()
except Exception:
    pass  # 不要这样做，会让问题难以定位
```

## 练习题

1. 写一个 `safe_int(value, default=0)`，无法转换时返回默认值。
2. 为银行账户系统定义 `InsufficientFundsError` 和 `InvalidAmountError`。
3. 给文件读取函数加上明确的异常处理和日志记录。

```python
def safe_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (ValueError, TypeError):
        return default
```

---

## 参考资源

- [Python 官方文档 - 异常](https://docs.python.org/3/library/exceptions.html)
- [Python 官方文档 - logging](https://docs.python.org/3/library/logging.html)
- [Python 官方文档 - pdb](https://docs.python.org/3/library/pdb.html)

---

## 下一步

你已经知道如何处理失败和定位问题。下一章学习 Pythonic 惯用法，让代码更贴近 Python 社区的写法。

**[👉 第 7 章：Pythonic 惯用法](../07-pythonic-idioms/)**
