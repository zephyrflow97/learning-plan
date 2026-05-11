"""
第 5 章 示例 03：上下文管理器实用模式

包含计时器、数据库事务、临时修改、连接池等实际应用场景。
"""

import os
import time
from collections import deque
from contextlib import contextmanager
from typing import Any, Generator


# === 1. 高精度计时器 ===

print("=" * 60)
print("1. 高精度计时器")
print("=" * 60)


class PrecisionTimer:
    """高精度计时器——支持嵌套和累计。"""

    def __init__(self, label: str = "Timer") -> None:
        self.label = label
        self.elapsed: float = 0.0
        self.laps: list[float] = []
        self._start: float = 0.0

    def __enter__(self) -> "PrecisionTimer":
        self._start = time.perf_counter()
        return self

    def __exit__(self, *args: Any) -> bool:
        self.elapsed = time.perf_counter() - self._start
        self.laps.append(self.elapsed)

        # 自动选择合适的单位
        if self.elapsed < 0.001:
            print(f"  [{self.label}] {self.elapsed * 1_000_000:.1f}us")
        elif self.elapsed < 1:
            print(f"  [{self.label}] {self.elapsed * 1_000:.2f}ms")
        else:
            print(f"  [{self.label}] {self.elapsed:.4f}s")

        return False

    @property
    def average(self) -> float:
        return sum(self.laps) / len(self.laps) if self.laps else 0.0

    @property
    def total(self) -> float:
        return sum(self.laps)


# 多次计时取平均
timer = PrecisionTimer("排序")
for _ in range(3):
    with timer:
        sorted(range(50_000, 0, -1))

print(f"  平均: {timer.average * 1000:.2f}ms, 总计: {timer.total * 1000:.2f}ms")


# === 2. 数据库事务模拟 ===

print(f"\n{'=' * 60}")
print("2. 数据库事务")
print(f"{'=' * 60}")


class SimpleDB:
    """简单的内存数据库。"""

    def __init__(self) -> None:
        self.tables: dict[str, list[dict[str, Any]]] = {}
        self._snapshots: list[dict[str, list[dict[str, Any]]]] = []

    def create_table(self, name: str) -> None:
        self.tables[name] = []
        print(f"  [DB] CREATE TABLE {name}")

    def insert(self, table: str, row: dict[str, Any]) -> None:
        if table not in self.tables:
            raise KeyError(f"表 {table} 不存在")
        self.tables[table].append(row)
        print(f"  [DB] INSERT INTO {table}: {row}")

    def select_all(self, table: str) -> list[dict[str, Any]]:
        return self.tables.get(table, [])

    def _snapshot(self) -> dict[str, list[dict[str, Any]]]:
        """深拷贝当前状态。"""
        import copy
        return copy.deepcopy(self.tables)

    def _restore(self, snapshot: dict[str, list[dict[str, Any]]]) -> None:
        """恢复到快照。"""
        self.tables = snapshot


@contextmanager
def transaction(db: SimpleDB) -> Generator[SimpleDB, None, None]:
    """数据库事务：成功 commit，失败 rollback。"""
    snapshot = db._snapshot()
    print("  [TX] BEGIN")
    try:
        yield db
        print("  [TX] COMMIT")
    except Exception as e:
        db._restore(snapshot)
        print(f"  [TX] ROLLBACK (原因: {e})")
        raise


# 初始化数据库
db = SimpleDB()
db.create_table("users")
db.insert("users", {"name": "Alice", "age": 30})

# 成功的事务
print("\n[事务：成功]")
with transaction(db):
    db.insert("users", {"name": "Bob", "age": 25})
print(f"  users: {db.select_all('users')}")

# 失败的事务
print("\n[事务：失败]")
try:
    with transaction(db):
        db.insert("users", {"name": "Charlie", "age": 35})
        raise RuntimeError("网络断开！")
except RuntimeError:
    pass
print(f"  users: {db.select_all('users')}")  # Charlie 被回滚


# === 3. 临时修改模式 ===

print(f"\n{'=' * 60}")
print("3. 临时修改模式")
print(f"{'=' * 60}")


# 3.1 临时修改对象属性
@contextmanager
def patch_attr(obj: Any, attr: str, value: Any) -> Generator[None, None, None]:
    """临时修改对象属性，退出时恢复。"""
    original: Any = getattr(obj, attr)
    setattr(obj, attr, value)
    print(f"  [patch] {attr}: {original!r} → {value!r}")
    try:
        yield
    finally:
        setattr(obj, attr, original)
        print(f"  [patch] {attr}: {value!r} → {original!r}（恢复）")


class Config:
    debug: bool = False
    log_level: str = "INFO"
    max_retries: int = 3


config = Config()
print(f"  修改前: debug={config.debug}, log_level={config.log_level}")

with patch_attr(config, "debug", True):
    with patch_attr(config, "log_level", "DEBUG"):
        print(f"  with 内: debug={config.debug}, log_level={config.log_level}")

print(f"  修改后: debug={config.debug}, log_level={config.log_level}")


# 3.2 临时修改环境变量
@contextmanager
def temp_env(**env_vars: str) -> Generator[None, None, None]:
    """临时设置环境变量。"""
    old_values: dict[str, str | None] = {}
    for key, value in env_vars.items():
        old_values[key] = os.environ.get(key)
        os.environ[key] = value
    print(f"  [env] 设置: {dict(env_vars)}")
    try:
        yield
    finally:
        for key, old_value in old_values.items():
            if old_value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = old_value
        print(f"  [env] 恢复")


print()
with temp_env(DATABASE_URL="sqlite:///test.db", DEBUG="true"):
    print(f"  DATABASE_URL = {os.environ.get('DATABASE_URL')}")
    print(f"  DEBUG = {os.environ.get('DEBUG')}")

print(f"  DATABASE_URL = {os.environ.get('DATABASE_URL', '(未设置)')}")


# === 4. 连接池 ===

print(f"\n{'=' * 60}")
print("4. 连接池上下文管理器")
print(f"{'=' * 60}")


class PooledConnection:
    """池化连接。"""
    _counter: int = 0

    def __init__(self) -> None:
        PooledConnection._counter += 1
        self.id: int = PooledConnection._counter
        self.in_use: bool = False
        self.query_count: int = 0
        print(f"    [conn] 创建连接 #{self.id}")

    def execute(self, sql: str) -> str:
        self.query_count += 1
        result: str = f"Result(#{self.id}, {sql})"
        print(f"    [conn #{self.id}] {sql}")
        return result


class ConnectionPool:
    """简单连接池。"""

    def __init__(self, size: int = 3) -> None:
        self.size = size
        self._available: deque[PooledConnection] = deque()
        self._in_use: set[int] = set()

        for _ in range(size):
            self._available.append(PooledConnection())
        print(f"  [Pool] 初始化 {size} 个连接")

    @contextmanager
    def acquire(self) -> Generator[PooledConnection, None, None]:
        """借用连接。"""
        if not self._available:
            raise RuntimeError(f"连接池已满（{self.size}）！")

        conn: PooledConnection = self._available.popleft()
        conn.in_use = True
        self._in_use.add(conn.id)
        print(f"  [Pool] 借出连接 #{conn.id} (可用: {len(self._available)})")

        try:
            yield conn
        finally:
            conn.in_use = False
            self._in_use.discard(conn.id)
            self._available.append(conn)
            print(f"  [Pool] 归还连接 #{conn.id} (可用: {len(self._available)})")


pool = ConnectionPool(size=2)

# 正常使用
with pool.acquire() as conn:
    conn.execute("SELECT * FROM users")

# 嵌套使用
print()
with pool.acquire() as conn1:
    with pool.acquire() as conn2:
        conn1.execute("SELECT * FROM users")
        conn2.execute("SELECT * FROM orders")

# 超出容量
print()
try:
    with pool.acquire() as c1:
        with pool.acquire() as c2:
            with pool.acquire() as c3:  # 超出！
                pass
except RuntimeError as e:
    print(f"  [Pool] 错误: {e}")


# === 5. 进度追踪器 ===

print(f"\n{'=' * 60}")
print("5. 进度追踪器")
print(f"{'=' * 60}")


@contextmanager
def progress(
    label: str, total: int
) -> Generator["ProgressTracker", None, None]:
    """进度追踪上下文管理器。"""
    tracker = ProgressTracker(label, total)
    print(f"  [{label}] 开始 (共 {total} 项)")
    start: float = time.perf_counter()
    try:
        yield tracker
    finally:
        elapsed: float = time.perf_counter() - start
        print(f"  [{label}] 完成 {tracker.current}/{total} 项 ({elapsed:.2f}s)")


class ProgressTracker:
    def __init__(self, label: str, total: int) -> None:
        self.label = label
        self.total = total
        self.current: int = 0

    def advance(self, n: int = 1) -> None:
        self.current += n
        pct: float = self.current / self.total * 100
        bar_len: int = 20
        filled: int = int(bar_len * self.current / self.total)
        bar: str = "#" * filled + "-" * (bar_len - filled)
        print(f"    [{bar}] {pct:.0f}% ({self.current}/{self.total})")


with progress("数据处理", 5) as p:
    for i in range(5):
        time.sleep(0.01)  # 模拟工作
        p.advance()

print("\n✅ 03-practical-patterns.py 运行完成")
