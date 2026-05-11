"""
第 4 章 示例 03：类装饰器

演示用类实现装饰器，以及装饰类的装饰器。
"""

from dataclasses import dataclass, field
from datetime import datetime
from functools import wraps
from typing import Any, Callable


# === 1. 用类实现装饰器 ===

print("=" * 60)
print("1. 用类实现装饰器（替代三层嵌套）")
print("=" * 60)


class Timer:
    """计时装饰器——用类实现，天然支持状态管理。"""

    def __init__(self, func: Callable[..., Any]) -> None:
        wraps(func)(self)  # 复制元信息
        self._func = func
        self._total_time: float = 0.0
        self._call_count: int = 0

    def __call__(self, *args: Any, **kwargs: Any) -> Any:
        import time
        start: float = time.perf_counter()
        result: Any = self._func(*args, **kwargs)
        elapsed: float = time.perf_counter() - start

        self._total_time += elapsed
        self._call_count += 1
        print(f"  [Timer] {self._func.__name__}() 耗时 {elapsed:.4f}s "
              f"(累计 {self._call_count} 次, 总计 {self._total_time:.4f}s)")
        return result

    @property
    def stats(self) -> dict[str, float]:
        """返回统计信息。"""
        avg: float = self._total_time / self._call_count if self._call_count else 0
        return {
            "total_time": self._total_time,
            "call_count": self._call_count,
            "avg_time": avg,
        }


@Timer
def compute(n: int) -> int:
    """模拟计算。"""
    import time
    time.sleep(0.01)
    return sum(range(n))


print("[Timer 类装饰器]")
compute(100)
compute(1000)
compute(10000)
print(f"  统计: {compute.stats}")  # type: ignore[attr-defined]


# === 2. 带参数的类装饰器 ===

print(f"\n{'=' * 60}")
print("2. 带参数的类装饰器")
print(f"{'=' * 60}")


class RateLimit:
    """速率限制装饰器——类实现更适合管理复杂状态。"""

    def __init__(self, max_calls: int = 5, window: float = 1.0) -> None:
        self.max_calls = max_calls
        self.window = window
        self._calls: list[float] = []

    def __call__(self, func: Callable[..., Any]) -> Callable[..., Any]:
        import time

        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            now: float = time.time()

            # 清除窗口外的记录
            self._calls = [t for t in self._calls if now - t < self.window]

            if len(self._calls) >= self.max_calls:
                print(f"  [RateLimit] ❌ {func.__name__} 超出限制 "
                      f"({self.max_calls}/{self.window}s)")
                raise RuntimeError("Rate limit exceeded")

            self._calls.append(now)
            print(f"  [RateLimit] ✅ {func.__name__} "
                  f"({len(self._calls)}/{self.max_calls})")
            return func(*args, **kwargs)

        return wrapper


@RateLimit(max_calls=3, window=1.0)
def api_call(endpoint: str) -> str:
    return f"Response from {endpoint}"


print("[RateLimit]")
for i in range(5):
    try:
        result: str = api_call(f"/api/{i}")
        print(f"  结果: {result}")
    except RuntimeError as e:
        print(f"  限制: {e}")


# === 3. 装饰类的装饰器 ===

print(f"\n{'=' * 60}")
print("3. 装饰类的装饰器")
print(f"{'=' * 60}")


def singleton(cls: type) -> type:
    """单例装饰器：确保类只有一个实例。"""
    instance: Any = None

    @wraps(cls, updated=[])  # type: ignore[arg-type]
    def get_instance(*args: Any, **kwargs: Any) -> Any:
        nonlocal instance
        if instance is None:
            instance = cls(*args, **kwargs)
            print(f"  [singleton] 创建 {cls.__name__} 实例")
        else:
            print(f"  [singleton] 返回已有 {cls.__name__} 实例")
        return instance

    return get_instance  # type: ignore[return-value]


@singleton
class Database:
    """数据库连接——单例模式。"""

    def __init__(self, url: str) -> None:
        self.url = url
        self.connected: bool = True
        print(f"  [Database] 连接到 {url}")

    def query(self, sql: str) -> str:
        return f"执行: {sql}"


db1 = Database("postgresql://localhost/mydb")
db2 = Database("postgresql://localhost/other")  # 不会创建新实例

print(f"[singleton] db1 is db2: {db1 is db2}")  # True
print(f"[singleton] db1.url: {db1.url}")          # 第一次的 URL


# === 4. 添加方法的类装饰器 ===

print(f"\n{'=' * 60}")
print("4. 给类添加功能的装饰器")
print(f"{'=' * 60}")


def add_repr(cls: type) -> type:
    """自动生成 __repr__。"""

    def __repr__(self: Any) -> str:
        attrs: list[str] = [
            f"{k}={v!r}" for k, v in self.__dict__.items()
            if not k.startswith("_")
        ]
        return f"{cls.__name__}({', '.join(attrs)})"

    cls.__repr__ = __repr__  # type: ignore[attr-defined]
    print(f"  [add_repr] 为 {cls.__name__} 添加了 __repr__")
    return cls


def add_timestamp(cls: type) -> type:
    """自动添加时间戳。"""
    original_init: Callable[..., None] = cls.__init__  # type: ignore[misc]

    @wraps(original_init)
    def new_init(self: Any, *args: Any, **kwargs: Any) -> None:
        original_init(self, *args, **kwargs)
        self.created_at = datetime.now()

    cls.__init__ = new_init  # type: ignore[misc]
    print(f"  [add_timestamp] 为 {cls.__name__} 添加了时间戳")
    return cls


@add_repr
@add_timestamp
class Order:
    def __init__(self, product: str, quantity: int) -> None:
        self.product = product
        self.quantity = quantity


order = Order("Python Book", 3)
print(f"[Order] {order!r}")
print(f"[Order] created_at: {order.created_at}")  # type: ignore[attr-defined]


# === 5. 注册装饰器模式 ===

print(f"\n{'=' * 60}")
print("5. 注册装饰器模式（Flask/pytest 风格）")
print(f"{'=' * 60}")


class EventBus:
    """事件总线——用装饰器注册事件处理器。"""

    def __init__(self) -> None:
        self._handlers: dict[str, list[Callable[..., Any]]] = {}

    def on(self, event: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        """注册事件处理器的装饰器。"""

        def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
            if event not in self._handlers:
                self._handlers[event] = []
            self._handlers[event].append(func)
            print(f"  [EventBus] 注册 {func.__name__} → {event}")
            return func  # 不修改原函数

        return decorator

    def emit(self, event: str, **data: Any) -> None:
        """触发事件。"""
        handlers: list[Callable[..., Any]] = self._handlers.get(event, [])
        print(f"  [EventBus] 触发 {event}，{len(handlers)} 个处理器")
        for handler in handlers:
            handler(**data)


bus = EventBus()


@bus.on("user_login")
def log_login(username: str = "") -> None:
    print(f"    [日志] {username} 登录了")


@bus.on("user_login")
def send_welcome(username: str = "") -> None:
    print(f"    [通知] 欢迎回来，{username}！")


@bus.on("user_logout")
def log_logout(username: str = "") -> None:
    print(f"    [日志] {username} 登出了")


print("\n[事件系统]")
bus.emit("user_login", username="Alice")
bus.emit("user_logout", username="Alice")

print("\n✅ 03-class-decorators.py 运行完成")
