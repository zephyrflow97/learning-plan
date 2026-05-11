"""
第 5 章 示例 01：基础上下文管理器

演示 __enter__ 和 __exit__ 的实现，以及 with 语句的执行流程。
"""

import time
from typing import Any


# === 1. with 语句的执行流程 ===

print("=" * 60)
print("1. with 语句的执行流程")
print("=" * 60)


class TraceContext:
    """追踪上下文管理器的每一步。"""

    def __init__(self, name: str) -> None:
        self.name = name
        print(f"  [1] __init__({name!r})")

    def __enter__(self) -> "TraceContext":
        print(f"  [2] __enter__() — 获取资源")
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: Any,
    ) -> bool:
        if exc_type:
            print(f"  [4] __exit__() — 有异常: {exc_type.__name__}: {exc_val}")
        else:
            print(f"  [4] __exit__() — 正常退出")
        return False  # 不吞掉异常


# 正常执行
print("[正常执行]")
with TraceContext("demo") as ctx:
    print(f"  [3] 在 with 块中使用 ctx: {ctx.name}")

print()

# 有异常
print("[有异常]")
try:
    with TraceContext("error_demo") as ctx:
        print(f"  [3] 在 with 块中")
        raise ValueError("故意的错误！")
except ValueError as e:
    print(f"  [5] 异常被传播: {e}")


# === 2. 计时上下文管理器 ===

print(f"\n{'=' * 60}")
print("2. 实用示例：计时器")
print(f"{'=' * 60}")


class Timer:
    """精确计时上下文管理器。"""

    def __init__(self, label: str = "Timer") -> None:
        self.label = label
        self.elapsed: float = 0.0
        self._start: float = 0.0

    def __repr__(self) -> str:
        return f"Timer({self.label!r}, elapsed={self.elapsed:.4f}s)"

    def __enter__(self) -> "Timer":
        self._start = time.perf_counter()
        print(f"  [Timer] 开始: {self.label}")
        return self

    def __exit__(self, *args: Any) -> bool:
        self.elapsed = time.perf_counter() - self._start
        print(f"  [Timer] 结束: {self.label} ({self.elapsed:.4f}s)")
        return False


# 使用计时器
with Timer("排序 100K 元素") as t:
    data: list[int] = sorted(range(100_000, 0, -1))

print(f"  [结果] {t}")

# 嵌套使用
print()
with Timer("外层") as outer:
    with Timer("内层 1") as inner1:
        sum(range(500_000))

    with Timer("内层 2") as inner2:
        sorted(range(50_000))

print(f"  [总计] 外层: {outer.elapsed:.4f}s")
print(f"  [分项] 内层1: {inner1.elapsed:.4f}s, 内层2: {inner2.elapsed:.4f}s")


# === 3. 异常处理行为 ===

print(f"\n{'=' * 60}")
print("3. __exit__ 的异常处理")
print(f"{'=' * 60}")


class SuppressErrors:
    """选择性吞掉异常。"""

    def __init__(self, *exceptions: type[Exception]) -> None:
        self.exceptions = exceptions
        self.suppressed: list[Exception] = []

    def __enter__(self) -> "SuppressErrors":
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: Any,
    ) -> bool:
        if exc_type and issubclass(exc_type, self.exceptions):
            self.suppressed.append(exc_val)  # type: ignore[arg-type]
            print(f"  [suppress] 吞掉: {exc_type.__name__}: {exc_val}")
            return True  # ✅ 吞掉异常
        return False  # ❌ 其他异常照常抛出


# 吞掉 FileNotFoundError
with SuppressErrors(FileNotFoundError, PermissionError) as s:
    open("definitely_not_exists.txt")

print(f"  吞掉了 {len(s.suppressed)} 个异常")

# 不吞掉 ValueError
try:
    with SuppressErrors(FileNotFoundError):
        raise ValueError("这个不会被吞掉")
except ValueError:
    print("  ValueError 被正确传播")


# === 4. 资源管理器 ===

print(f"\n{'=' * 60}")
print("4. 实用示例：资源管理")
print(f"{'=' * 60}")


class ManagedConnection:
    """模拟数据库连接——展示完整的资源生命周期管理。"""

    _total_connections: int = 0

    def __init__(self, url: str) -> None:
        self.url = url
        self.connected: bool = False
        self.queries_executed: int = 0

    def __repr__(self) -> str:
        status: str = "connected" if self.connected else "disconnected"
        return f"ManagedConnection({self.url!r}, {status})"

    def __enter__(self) -> "ManagedConnection":
        ManagedConnection._total_connections += 1
        self.connected = True
        print(f"  [conn] 连接到 {self.url} (活跃连接: {self._total_connections})")
        return self

    def __exit__(self, *args: Any) -> bool:
        ManagedConnection._total_connections -= 1
        self.connected = False
        print(f"  [conn] 断开 {self.url} "
              f"(执行了 {self.queries_executed} 条查询, "
              f"剩余连接: {self._total_connections})")
        return False

    def query(self, sql: str) -> str:
        if not self.connected:
            raise RuntimeError("未连接！")
        self.queries_executed += 1
        result: str = f"Result({sql})"
        print(f"  [query] {sql} -> {result}")
        return result


# 正常使用
with ManagedConnection("postgres://localhost:5432/db") as conn:
    conn.query("SELECT * FROM users")
    conn.query("SELECT * FROM orders")

print(f"  连接状态: {conn.connected}")  # False

# 即使异常也能正确清理
print()
try:
    with ManagedConnection("postgres://localhost:5432/db") as conn:
        conn.query("SELECT * FROM users")
        raise RuntimeError("网络错误！")
except RuntimeError:
    print(f"  异常后连接状态: {conn.connected}")  # False — 正确清理了


# === 5. 多上下文管理器 ===

print(f"\n{'=' * 60}")
print("5. 多上下文管理器（单行 with）")
print(f"{'=' * 60}")


class Resource:
    """简单的可追踪资源。"""

    def __init__(self, name: str) -> None:
        self.name = name

    def __enter__(self) -> "Resource":
        print(f"  [acquire] {self.name}")
        return self

    def __exit__(self, *args: Any) -> bool:
        print(f"  [release] {self.name}")
        return False


# 多个上下文管理器（Python 3.1+）
print("[多 with]")
with Resource("A") as a, Resource("B") as b, Resource("C") as c:
    print(f"  使用: {a.name}, {b.name}, {c.name}")
# 释放顺序：C → B → A（LIFO）

print("\n✅ 01-basic-context-manager.py 运行完成")
