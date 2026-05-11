# 第 5 章：上下文管理器 — 让资源管理万无一失

> *"Explicit is better than implicit. Simple is better than complex."*
> — The Zen of Python
>
> 每次打开文件忘了关闭，每次获取锁忘了释放，每次连接数据库忘了断开——
> 这些"忘了"的后果是内存泄漏、死锁、连接耗尽。
> 上下文管理器用一个 `with` 语句，让"打开的东西一定会关闭"成为语法级保证。

## 📖 本章内容

- [1. with 语句的工作原理](#1-with-语句的工作原理)
  - [1.1 为什么需要上下文管理器](#11-为什么需要上下文管理器)
  - [1.2 with 语句的执行流程](#12-with-语句的执行流程)
- [2. \_\_enter\_\_ 与 \_\_exit\_\_](#2-enter-与-exit)
  - [2.1 基础实现](#21-基础实现)
  - [2.2 \_\_exit\_\_ 的异常处理](#22-exit-的异常处理)
- [3. contextlib.contextmanager](#3-contextlibcontextmanager)
  - [3.1 用生成器实现上下文管理器](#31-用生成器实现上下文管理器)
  - [3.2 contextlib 工具箱](#32-contextlib-工具箱)
- [4. ExitStack：动态上下文管理](#4-exitstack动态上下文管理)
- [5. 异步上下文管理器](#5-异步上下文管理器)
- [6. 实用模式](#6-实用模式)
  - [6.1 计时器](#61-计时器)
  - [6.2 数据库事务](#62-数据库事务)
  - [6.3 临时修改](#63-临时修改)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. `with` 语句的工作原理

> 🎭 **The Drama: try/finally 的烦恼**
>
> 没有 `with` 的世界是这样的：
> ```python
> f = open("data.txt")
> try:
>     data = f.read()
>     process(data)
> finally:
>     f.close()   # 你能保证每次都记得写这行吗？
> ```
>
> 有了 `with`：
> ```python
> with open("data.txt") as f:
>     data = f.read()
>     process(data)
> # 无论发生什么，f.close() 一定会被调用
> ```
>
> **`with` 语句把"善后工作"从程序员的记忆力中解放出来，变成了语法级的保证。**

### 1.1 为什么需要上下文管理器

```python
# ❌ 没有上下文管理器的痛苦
def process_file_bad(filepath: str) -> str:
    f = open(filepath, "r")
    try:
        data: str = f.read()
        # 如果这里抛异常，文件会关闭吗？
        result: str = data.upper()
        return result
    finally:
        f.close()  # 必须手动确保关闭
        print("  [bad] 手动关闭文件")


# ✅ 有上下文管理器
def process_file_good(filepath: str) -> str:
    with open(filepath, "r") as f:
        data: str = f.read()
        result: str = data.upper()
        print("  [good] with 自动管理文件关闭")
        return result
    # 即使 return 或异常，文件也会自动关闭
```

| 资源类型 | 获取 | 释放 | 忘记释放的后果 |
|---------|------|------|--------------|
| 文件 | `open()` | `.close()` | 文件描述符泄漏 |
| 数据库连接 | `connect()` | `.close()` | 连接池耗尽 |
| 线程锁 | `.acquire()` | `.release()` | 死锁 |
| 网络连接 | `socket()` | `.close()` | 端口占用 |
| 临时目录 | `mkdtemp()` | `rmtree()` | 磁盘空间浪费 |

### 1.2 `with` 语句的执行流程

```
┌──────────────────────────────────────────────────────────┐
│              with expression as var:                      │
│                  body                                     │
│                                                           │
│  执行流程：                                                │
│                                                           │
│  1. mgr = expression          # 获取上下文管理器           │
│  2. var = mgr.__enter__()     # 调用 __enter__，结果赋值   │
│  3. try:                                                  │
│       body                    # 执行 with 块              │
│     except:                                               │
│       if not mgr.__exit__(type, value, tb):               │
│         raise                 # __exit__ 返回 False → 重抛 │
│     else:                                                 │
│       mgr.__exit__(None, None, None)  # 正常退出           │
│                                                           │
│  关键点：__exit__ 一定会被调用——无论正常还是异常            │
└──────────────────────────────────────────────────────────┘
```

```python
class DemoContext:
    """演示 with 语句的完整执行流程。"""

    def __init__(self, name: str) -> None:
        self.name = name
        print(f"  [1] __init__({name})")

    def __enter__(self) -> "DemoContext":
        print(f"  [2] __enter__() — 获取资源")
        return self  # as 后面的变量就是这个返回值

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object | None,
    ) -> bool:
        print(f"  [4] __exit__() — 释放资源")
        if exc_type:
            print(f"  [4] 有异常: {exc_type.__name__}: {exc_val}")
        return False  # False = 不吞掉异常


# 正常执行
print("[正常执行]")
with DemoContext("demo") as ctx:
    print(f"  [3] 在 with 块中: {ctx.name}")

# 有异常
print("\n[有异常]")
try:
    with DemoContext("error") as ctx:
        print(f"  [3] 在 with 块中")
        raise ValueError("出错了！")
except ValueError:
    print(f"  [5] 异常被重新抛出")
```

---

## 2. `__enter__` 与 `__exit__`

> 🧠 **CS Master's Bridge: RAII 模式**
>
> C++ 有 RAII（Resource Acquisition Is Initialization）——资源在构造函数中获取，在析构函数中释放。
> Python 的上下文管理器是同一个思想：`__enter__` 获取资源，`__exit__` 释放资源。
> 区别是 Python 不依赖析构函数（`__del__` 的调用时机不确定），而是用 `with` 语句显式界定作用域。

### 2.1 基础实现

```python
import time


class Timer:
    """计时上下文管理器——测量代码块的执行时间。"""

    def __init__(self, label: str = "Timer") -> None:
        self.label = label
        self.elapsed: float = 0.0
        self._start: float = 0.0

    def __repr__(self) -> str:
        return f"Timer(label={self.label!r}, elapsed={self.elapsed:.4f}s)"

    def __enter__(self) -> "Timer":
        self._start = time.perf_counter()
        print(f"  [Timer] ⏱ {self.label} 开始计时")
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object | None,
    ) -> bool:
        self.elapsed = time.perf_counter() - self._start
        print(f"  [Timer] ⏱ {self.label} 耗时 {self.elapsed:.4f}s")
        return False  # 不吞掉异常


# 使用
with Timer("排序操作") as t:
    data: list[int] = sorted(range(100_000, 0, -1))

print(f"[结果] {t}")  # Timer 对象还可以在 with 块外使用
```

### 2.2 `__exit__` 的异常处理

```python
class SuppressError:
    """演示 __exit__ 吞掉异常的行为。"""

    def __init__(self, *exceptions: type[Exception]) -> None:
        self.exceptions = exceptions

    def __enter__(self) -> "SuppressError":
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object | None,
    ) -> bool:
        if exc_type and issubclass(exc_type, self.exceptions):
            print(f"  [suppress] 吞掉异常: {exc_type.__name__}: {exc_val}")
            return True  # ✅ True = 吞掉异常，不再抛出
        return False     # ❌ False = 重新抛出异常


# 吞掉 FileNotFoundError
with SuppressError(FileNotFoundError, PermissionError):
    print("  [尝试] 打开不存在的文件")
    open("definitely_not_exists.txt")

print("  [继续] 代码继续执行——异常被吞掉了")

# 不吞掉 ValueError
try:
    with SuppressError(FileNotFoundError):
        raise ValueError("这个不会被吞掉")
except ValueError as e:
    print(f"  [捕获] ValueError 被重新抛出: {e}")
```

| `__exit__` 返回值 | 异常行为 | 使用场景 |
|-------------------|---------|---------|
| `False` / `None` | 重新抛出异常 | **默认行为**——大多数情况 |
| `True` | 吞掉异常 | 特定异常可以忽略（如文件不存在） |

---

## 3. `contextlib.contextmanager`

> 🧰 **Toolbox: 不想写类？用生成器！**
>
> 实现上下文管理器有两种方式：
> 1. **类方式**：实现 `__enter__` + `__exit__`（完整控制，适合复杂场景）
> 2. **生成器方式**：用 `@contextmanager` 装饰器（简洁，适合简单场景）
>
> 就像迭代器 vs 生成器——生成器是简洁的快捷方式。

### 3.1 用生成器实现上下文管理器

```python
from contextlib import contextmanager
from typing import Generator


@contextmanager
def timer(label: str = "Timer") -> Generator[dict[str, float], None, None]:
    """用 @contextmanager 实现的计时器——比类版本简洁得多。"""
    result: dict[str, float] = {"elapsed": 0.0}
    start: float = time.perf_counter()
    print(f"  [timer] ⏱ {label} 开始")

    try:
        yield result    # yield 之前 = __enter__，yield 之后 = __exit__
    finally:
        result["elapsed"] = time.perf_counter() - start
        print(f"  [timer] ⏱ {label} 耗时 {result['elapsed']:.4f}s")


with timer("生成器计时") as t:
    sorted(range(50_000, 0, -1))

print(f"[结果] 耗时: {t['elapsed']:.4f}s")
```

```
类方式 vs 生成器方式对比

┌──────────── 类方式 ─────────────┐   ┌──── @contextmanager 方式 ────┐
│ class Timer:                    │   │ @contextmanager              │
│   def __enter__(self):          │   │ def timer():                 │
│     self.start = time()         │   │   start = time()             │
│     return self                 │   │   try:                       │
│                                 │   │     yield result    ← 暂停   │
│   def __exit__(self, ...):      │   │   finally:                   │
│     self.elapsed = ...          │   │     elapsed = ...            │
│     return False                │   │                              │
│                                 │   │                              │
│ ~15 行代码                      │   │ ~8 行代码                    │
└─────────────────────────────────┘   └──────────────────────────────┘
```

**生成器方式的注意事项：**

```python
@contextmanager
def managed_resource(name: str) -> Generator[str, None, None]:
    """演示生成器上下文管理器的异常处理。"""
    print(f"  [resource] 获取资源: {name}")
    resource: str = f"resource_{name}"

    try:
        yield resource       # ← with 块在这里执行
    except Exception as e:
        print(f"  [resource] 捕获异常: {e}")
        raise                # 重新抛出（如果要吞掉就不 raise）
    finally:
        print(f"  [resource] 释放资源: {name}")


# 正常使用
with managed_resource("db") as r:
    print(f"  [使用] {r}")

# 异常情况
print()
try:
    with managed_resource("file") as r:
        raise ValueError("出错了")
except ValueError:
    print("  [外部] 异常被重新抛出")
```

### 3.2 `contextlib` 工具箱

```python
from contextlib import suppress, redirect_stdout, closing
import io


# suppress：优雅地忽略特定异常
print("\n[suppress]")
with suppress(FileNotFoundError, PermissionError):
    open("not_exists.txt")
print("  代码继续执行")

# redirect_stdout：重定向标准输出
print("\n[redirect_stdout]")
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("这行输出被重定向到 buffer")
    print("这行也是")
print(f"  buffer 内容: {buffer.getvalue()!r}")

# closing：为没有 __exit__ 的对象添加上下文管理
print("\n[closing]")


class LegacyConnection:
    """旧式连接类——只有 close()，没有 __enter__/__exit__。"""

    def __init__(self, url: str) -> None:
        self.url = url
        self.connected: bool = True
        print(f"  [LegacyConnection] 连接到 {url}")

    def close(self) -> None:
        self.connected = False
        print(f"  [LegacyConnection] 已关闭")


with closing(LegacyConnection("localhost:5432")) as conn:
    print(f"  [使用] connected={conn.connected}")
print(f"  [结束] connected={conn.connected}")  # False
```

| 工具 | 用途 | 等价于 |
|------|------|--------|
| `suppress(*exceptions)` | 忽略指定异常 | `try/except: pass` |
| `redirect_stdout(new)` | 重定向 stdout | 临时替换 `sys.stdout` |
| `redirect_stderr(new)` | 重定向 stderr | 临时替换 `sys.stderr` |
| `closing(obj)` | 确保调用 `obj.close()` | `try/finally: obj.close()` |
| `nullcontext(val)` | 空操作上下文管理器 | 直接返回值，不做任何事 |

---

## 4. `ExitStack`：动态上下文管理

> 🌌 **The Big Picture: 当 with 的数量不确定时**
>
> 如果你需要打开 N 个文件（N 在运行时才知道），你不能写 N 个嵌套的 `with`。
> `ExitStack` 解决了这个问题——它是一个"上下文管理器的栈"，可以动态地 push 和 pop。

```python
from contextlib import ExitStack, contextmanager
from typing import Generator


@contextmanager
def mock_file(name: str) -> Generator[str, None, None]:
    """模拟文件上下文管理器。"""
    print(f"  [open] {name}")
    try:
        yield f"<content of {name}>"
    finally:
        print(f"  [close] {name}")


# ❌ 文件数量不确定时，不能这样写
# with open(f1) as f1, open(f2) as f2, open(f3) as f3:  # 如果有 100 个文件呢？

# ✅ 用 ExitStack 动态管理
filenames: list[str] = ["config.yaml", "data.json", "log.txt"]

print("[ExitStack]")
with ExitStack() as stack:
    files: list[str] = []
    for name in filenames:
        f: str = stack.enter_context(mock_file(name))
        files.append(f)

    print(f"  [使用] 已打开 {len(files)} 个文件")
    for content in files:
        print(f"    {content}")

print("  [结束] 所有文件已按 LIFO 顺序关闭")
```

**ExitStack 的回调功能：**

```python
from contextlib import ExitStack


def cleanup_temp_dir(path: str) -> None:
    print(f"  [cleanup] 清理临时目录: {path}")


def cleanup_connection(conn_id: int) -> None:
    print(f"  [cleanup] 关闭连接 #{conn_id}")


print("\n[ExitStack 回调]")
with ExitStack() as stack:
    # 注册清理回调——按 LIFO 顺序执行
    stack.callback(cleanup_temp_dir, "/tmp/work_dir")
    stack.callback(cleanup_connection, 42)
    stack.callback(print, "  [cleanup] 最后注册，最先执行")

    print("  [工作] 执行主要逻辑...")

print("  [完成] 所有清理已执行")
```

---

## 5. 异步上下文管理器

> ⚛️ **The Science: async with 的工作方式**
>
> 异步上下文管理器使用 `__aenter__` 和 `__aexit__` 替代同步版本。
> 在 `asyncio` 中，数据库连接、HTTP 会话、文件操作等都需要异步上下文管理器。
> 这是 Stage 3 异步编程的预览。

```python
import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator


class AsyncTimer:
    """异步计时器。"""

    def __init__(self, label: str) -> None:
        self.label = label
        self.elapsed: float = 0.0

    async def __aenter__(self) -> "AsyncTimer":
        self._start: float = asyncio.get_event_loop().time()
        print(f"  [async] ⏱ {self.label} 开始")
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object | None,
    ) -> bool:
        self.elapsed = asyncio.get_event_loop().time() - self._start
        print(f"  [async] ⏱ {self.label} 耗时 {self.elapsed:.4f}s")
        return False


# 用 @asynccontextmanager 简化
@asynccontextmanager
async def async_db_connection(url: str) -> AsyncGenerator[str, None]:
    """模拟异步数据库连接。"""
    print(f"  [async_db] 连接到 {url}")
    connection: str = f"Connection({url})"
    try:
        yield connection
    finally:
        print(f"  [async_db] 断开连接")


async def main() -> None:
    """演示异步上下文管理器。"""
    async with AsyncTimer("异步操作"):
        await asyncio.sleep(0.01)

    async with async_db_connection("postgres://localhost/db") as conn:
        print(f"  [使用] {conn}")


# 运行异步代码
print("[异步上下文管理器]")
asyncio.run(main())
```

| 同步 | 异步 | 方法 |
|------|------|------|
| `with` | `async with` | — |
| `__enter__` | `__aenter__` | 返回 awaitable |
| `__exit__` | `__aexit__` | 返回 awaitable |
| `@contextmanager` | `@asynccontextmanager` | 用 `async def` + `yield` |
| `ExitStack` | `AsyncExitStack` | 异步版 |

---

## 6. 实用模式

### 6.1 计时器

```python
import time
from contextlib import contextmanager
from typing import Generator


@contextmanager
def timed_block(label: str) -> Generator[None, None, None]:
    """通用计时上下文管理器。"""
    start: float = time.perf_counter()
    print(f"  [{label}] 开始...")
    yield
    elapsed: float = time.perf_counter() - start
    print(f"  [{label}] 完成 ({elapsed:.4f}s)")


with timed_block("数据处理"):
    data: list[int] = sorted(range(100_000, 0, -1))
```

### 6.2 数据库事务

```python
from contextlib import contextmanager
from typing import Generator


class MockDB:
    """模拟数据库连接。"""

    def __init__(self) -> None:
        self.data: list[str] = []
        self.in_transaction: bool = False

    def begin(self) -> None:
        self.in_transaction = True
        self._snapshot: list[str] = self.data.copy()
        print("  [DB] BEGIN TRANSACTION")

    def commit(self) -> None:
        self.in_transaction = False
        print("  [DB] COMMIT")

    def rollback(self) -> None:
        self.data = self._snapshot
        self.in_transaction = False
        print("  [DB] ROLLBACK")

    def insert(self, value: str) -> None:
        print(f"  [DB] INSERT {value!r}")
        self.data.append(value)


@contextmanager
def transaction(db: MockDB) -> Generator[MockDB, None, None]:
    """数据库事务上下文管理器——自动 commit 或 rollback。"""
    db.begin()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise


# 成功的事务
db = MockDB()
print("[事务：成功]")
with transaction(db) as conn:
    conn.insert("Alice")
    conn.insert("Bob")
print(f"  数据: {db.data}")  # ['Alice', 'Bob']

# 失败的事务
print("\n[事务：失败]")
try:
    with transaction(db) as conn:
        conn.insert("Charlie")
        raise RuntimeError("网络错误！")
except RuntimeError:
    pass
print(f"  数据: {db.data}")  # ['Alice', 'Bob'] — Charlie 被回滚
```

### 6.3 临时修改

```python
from contextlib import contextmanager
from typing import Any, Generator


@contextmanager
def temporary_attr(
    obj: Any, attr: str, value: Any
) -> Generator[None, None, None]:
    """临时修改对象属性，退出时自动恢复。"""
    old_value: Any = getattr(obj, attr)
    setattr(obj, attr, value)
    print(f"  [temp] {attr}: {old_value!r} → {value!r}")
    try:
        yield
    finally:
        setattr(obj, attr, old_value)
        print(f"  [temp] {attr}: {value!r} → {old_value!r}（恢复）")


class AppConfig:
    debug: bool = False
    log_level: str = "INFO"


config = AppConfig()

print("[临时修改]")
print(f"  修改前: debug={config.debug}")

with temporary_attr(config, "debug", True):
    print(f"  with 内: debug={config.debug}")  # True

print(f"  修改后: debug={config.debug}")  # False — 自动恢复


# 环境变量临时修改
import os


@contextmanager
def temp_env(**kwargs: str) -> Generator[None, None, None]:
    """临时设置环境变量。"""
    old_values: dict[str, str | None] = {}
    for key, value in kwargs.items():
        old_values[key] = os.environ.get(key)
        os.environ[key] = value
        print(f"  [env] 设置 {key}={value}")
    try:
        yield
    finally:
        for key, old_value in old_values.items():
            if old_value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = old_value
            print(f"  [env] 恢复 {key}")


print("\n[临时环境变量]")
with temp_env(DATABASE_URL="sqlite:///test.db", DEBUG="1"):
    print(f"  DATABASE_URL = {os.environ['DATABASE_URL']}")
print(f"  DATABASE_URL = {os.environ.get('DATABASE_URL', '(未设置)')}")
```

---

## 最佳实践

1. **任何需要"获取/释放"的场景都用 `with`**：文件、锁、连接、事务
2. **简单场景用 `@contextmanager`**：代码量减半，可读性更好
3. **复杂场景用类实现**：需要保存状态、多个方法、或复杂的异常处理
4. **`__exit__` 通常返回 `False`**：除非你明确要吞掉异常（用 `suppress` 更清晰）
5. **动态数量的资源用 `ExitStack`**：不要写 N 层嵌套的 `with`
6. **优先使用 `contextlib` 中的工具**：`suppress`, `closing`, `redirect_stdout` 等

```python
# ✅ 最佳实践示例
from contextlib import contextmanager, suppress, ExitStack
from typing import Generator


# 简单场景：用 @contextmanager
@contextmanager
def log_block(name: str) -> Generator[None, None, None]:
    print(f"  [BEGIN] {name}")
    yield
    print(f"  [END] {name}")


# 忽略特定异常：用 suppress
with suppress(FileNotFoundError):
    os.remove("temp_file.txt")

# 动态资源：用 ExitStack
# with ExitStack() as stack:
#     files = [stack.enter_context(open(f)) for f in filenames]
```

---

## 常见陷阱

### 陷阱 1：`__exit__` 返回 `True` 吞掉所有异常

```python
class DangerousContext:
    """❌ 吞掉所有异常——非常危险！"""

    def __enter__(self) -> "DangerousContext":
        return self

    def __exit__(self, *args: object) -> bool:
        return True  # ❌ 吞掉所有异常！bug 会静默消失！


# 所有异常都被吞掉了
with DangerousContext():
    raise RuntimeError("严重错误！")  # ❌ 不会抛出！

print("[陷阱1] 严重错误被静默吞掉了——程序继续执行但状态已损坏")

# ✅ 修复：只吞掉特定的异常
from contextlib import suppress

with suppress(FileNotFoundError):  # ✅ 只忽略文件不存在
    open("not_exists.txt")
```

### 陷阱 2：`@contextmanager` 中忘了 `try/finally`

```python
from contextlib import contextmanager
from typing import Generator


# ❌ 没有 try/finally——如果 with 块抛异常，清理代码不会执行
@contextmanager
def bad_resource() -> Generator[str, None, None]:
    print("  获取资源")
    yield "resource"
    print("  释放资源")  # ❌ 如果 with 块抛异常，这行不会执行！


# ✅ 正确：用 try/finally 保证清理
@contextmanager
def good_resource() -> Generator[str, None, None]:
    print("  获取资源")
    try:
        yield "resource"
    finally:
        print("  释放资源")  # ✅ 无论如何都会执行


print("[陷阱2] 测试 bad_resource:")
try:
    with bad_resource() as r:
        raise ValueError("出错")
except ValueError:
    print("  注意: '释放资源' 没有打印！")

print("\n[陷阱2] 测试 good_resource:")
try:
    with good_resource() as r:
        raise ValueError("出错")
except ValueError:
    print("  注意: '释放资源' 正确打印了！")
```

### 陷阱 3：`as` 变量不一定是上下文管理器本身

```python
# __enter__ 的返回值不一定是 self
print("\n[陷阱3]")

with open("README.md", "r") as f:
    # f 是 __enter__() 的返回值（碰巧是文件对象本身）
    print(f"  type(f): {type(f).__name__}")

# 但有些上下文管理器返回不同的东西
from contextlib import contextmanager
from typing import Generator


@contextmanager
def returns_different() -> Generator[int, None, None]:
    print("  进入")
    yield 42  # as 变量是 42，不是上下文管理器
    print("  退出")


with returns_different() as value:
    print(f"  value = {value}, type = {type(value).__name__}")
    # value 是 42（int），不是上下文管理器对象
```

---

## 练习题

### 练习 1：实现一个 `FileTransaction` 上下文管理器

实现一个文件事务上下文管理器：
- 写入临时文件
- 成功时重命名为目标文件（原子操作）
- 失败时删除临时文件

<details>
<summary>💡 参考答案</summary>

```python
import os
from contextlib import contextmanager
from typing import IO, Generator


@contextmanager
def file_transaction(filepath: str) -> Generator[IO[str], None, None]:
    """文件事务：写入临时文件，成功后原子替换。"""
    tmp_path: str = filepath + ".tmp"
    f: IO[str] = open(tmp_path, "w", encoding="utf-8")

    try:
        yield f
        f.close()
        # 成功：替换原文件
        if os.path.exists(filepath):
            os.remove(filepath)
        os.rename(tmp_path, filepath)
        print(f"  [FileTransaction] ✅ 提交: {filepath}")
    except Exception:
        f.close()
        # 失败：清理临时文件
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        print(f"  [FileTransaction] ❌ 回滚: 删除 {tmp_path}")
        raise


# 测试成功场景
# with file_transaction("output.txt") as f:
#     f.write("Hello, World!\n")
#     f.write("这是事务写入\n")

# 测试失败场景
# try:
#     with file_transaction("output.txt") as f:
#         f.write("部分数据\n")
#         raise ValueError("写入失败！")
# except ValueError:
#     pass
# # output.txt 不会被损坏
```
</details>

### 练习 2：实现 `ChangeDirectory` 上下文管理器

实现一个临时切换工作目录的上下文管理器，退出时自动恢复。

<details>
<summary>💡 参考答案</summary>

```python
import os


class ChangeDirectory:
    """临时切换工作目录。"""

    def __init__(self, new_path: str) -> None:
        self.new_path = new_path
        self.old_path: str = ""

    def __enter__(self) -> "ChangeDirectory":
        self.old_path = os.getcwd()
        os.chdir(self.new_path)
        print(f"  [cd] {self.old_path} → {self.new_path}")
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object | None,
    ) -> bool:
        os.chdir(self.old_path)
        print(f"  [cd] 恢复到 {self.old_path}")
        return False


# 测试
print(f"当前目录: {os.getcwd()}")
with ChangeDirectory("/tmp"):
    print(f"  with 内: {os.getcwd()}")
print(f"恢复后: {os.getcwd()}")
```
</details>

### 练习 3：实现一个连接池上下文管理器

实现一个简单的连接池，使用上下文管理器借用和归还连接。

<details>
<summary>💡 参考答案</summary>

```python
from contextlib import contextmanager
from typing import Generator
from collections import deque


class Connection:
    _counter: int = 0

    def __init__(self) -> None:
        Connection._counter += 1
        self.id: int = Connection._counter
        self.in_use: bool = False

    def __repr__(self) -> str:
        status: str = "使用中" if self.in_use else "空闲"
        return f"Connection(id={self.id}, {status})"


class ConnectionPool:
    def __init__(self, max_size: int = 5) -> None:
        self.max_size = max_size
        self._pool: deque[Connection] = deque()
        self._in_use: set[int] = set()

        # 预创建连接
        for _ in range(max_size):
            self._pool.append(Connection())
        print(f"  [Pool] 创建了 {max_size} 个连接")

    @contextmanager
    def get_connection(self) -> Generator[Connection, None, None]:
        """借用连接——with 块结束自动归还。"""
        if not self._pool:
            raise RuntimeError("连接池已满！")

        conn: Connection = self._pool.popleft()
        conn.in_use = True
        self._in_use.add(conn.id)
        print(f"  [Pool] 借出 {conn}")

        try:
            yield conn
        finally:
            conn.in_use = False
            self._in_use.discard(conn.id)
            self._pool.append(conn)
            print(f"  [Pool] 归还 {conn}")

    @property
    def stats(self) -> str:
        return f"空闲: {len(self._pool)}, 使用中: {len(self._in_use)}"


# 测试
pool = ConnectionPool(max_size=3)

with pool.get_connection() as conn1:
    print(f"  [使用] {conn1}, 池状态: {pool.stats}")

    with pool.get_connection() as conn2:
        print(f"  [使用] {conn2}, 池状态: {pool.stats}")

print(f"[最终] 池状态: {pool.stats}")
```
</details>

---

## 参考资源

- [contextlib 模块 — 官方文档](https://docs.python.org/3/library/contextlib.html)
- [PEP 343 — The "with" Statement](https://peps.python.org/pep-0343/)
- [PEP 3134 — Exception Chaining and Embedded Tracebacks](https://peps.python.org/pep-3134/)
- [Fluent Python, 2nd Ed. — Ch.18: Context Managers and else Blocks](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [Real Python — Context Managers and Python's with Statement](https://realpython.com/python-with-statement/)

---

## 下一步

恭喜你掌握了上下文管理器！现在你可以用 `with` 语句优雅地管理任何资源——文件、连接、锁、事务、临时修改，全部万无一失。

接下来，我们将学习**类型标注与 mypy**——给动态语言加上静态类型检查的翅膀，让大型项目也能保持代码质量。

**[👉 第 6 章：类型标注与 mypy](../06-type-hints-mypy/)**

---

[⬅️ 第 4 章：装饰器](../04-decorators/) | [👉 第 6 章：类型标注与 mypy](../06-type-hints-mypy/) | [🏠 返回 Stage 2 目录](../README.md)
