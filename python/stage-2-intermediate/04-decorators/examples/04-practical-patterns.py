"""
第 4 章 示例 04：实用装饰器模式

包含计时、重试、缓存、权限检查、输入验证等常见模式。
"""

import random
import time
from collections import deque
from functools import lru_cache, wraps
from typing import Any, Callable


# === 1. 计时装饰器 ===

print("=" * 60)
print("1. 计时装饰器")
print("=" * 60)


def timer(func: Callable[..., Any]) -> Callable[..., Any]:
    """精确计时装饰器。"""

    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start: float = time.perf_counter()
        result: Any = func(*args, **kwargs)
        elapsed: float = time.perf_counter() - start

        if elapsed < 0.001:
            unit, value = "us", elapsed * 1_000_000
        elif elapsed < 1:
            unit, value = "ms", elapsed * 1_000
        else:
            unit, value = "s", elapsed

        print(f"  [TIMER] {func.__name__}() -> {value:.2f}{unit}")
        return result

    return wrapper


@timer
def fast_operation() -> int:
    return sum(range(10_000))


@timer
def slow_operation() -> None:
    time.sleep(0.05)


fast_operation()
slow_operation()


# === 2. 重试装饰器（带指数退避） ===

print(f"\n{'=' * 60}")
print("2. 重试装饰器（指数退避）")
print(f"{'=' * 60}")


def retry(
    max_attempts: int = 3,
    base_delay: float = 0.01,
    backoff: float = 2.0,
    exceptions: tuple[type[Exception], ...] = (Exception,),
):
    """带指数退避的重试装饰器。"""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            delay: float = base_delay
            last_exception: Exception | None = None

            for attempt in range(1, max_attempts + 1):
                try:
                    result: Any = func(*args, **kwargs)
                    if attempt > 1:
                        print(f"  [RETRY] {func.__name__} 第{attempt}次成功!")
                    return result
                except exceptions as e:
                    last_exception = e
                    print(f"  [RETRY] {func.__name__} 第{attempt}次失败: {e}")
                    if attempt < max_attempts:
                        print(f"  [RETRY] 等待 {delay:.3f}s 后重试...")
                        time.sleep(delay)
                        delay *= backoff

            raise last_exception  # type: ignore[misc]

        return wrapper

    return decorator


@retry(max_attempts=4, base_delay=0.005, exceptions=(ConnectionError, TimeoutError))
def fetch_data(url: str) -> str:
    """模拟不稳定的网络请求。"""
    if random.random() < 0.6:
        raise ConnectionError(f"无法连接 {url}")
    return f"来自 {url} 的数据"


try:
    data: str = fetch_data("https://api.example.com")
    print(f"  [结果] {data}")
except ConnectionError as e:
    print(f"  [最终失败] {e}")


# === 3. 手动缓存 vs lru_cache ===

print(f"\n{'=' * 60}")
print("3. 缓存对比")
print(f"{'=' * 60}")


def memoize(func: Callable[..., Any]) -> Callable[..., Any]:
    """手动实现的缓存装饰器。"""
    cache: dict[Any, Any] = {}

    @wraps(func)
    def wrapper(*args: Any) -> Any:
        if args not in cache:
            cache[args] = func(*args)
            print(f"  [MEMO] {func.__name__}{args} -> 计算")
        else:
            print(f"  [MEMO] {func.__name__}{args} -> 缓存命中")
        return cache[args]

    wrapper.cache = cache  # type: ignore[attr-defined]
    return wrapper


@memoize
def fib_memo(n: int) -> int:
    if n < 2:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)


@lru_cache(maxsize=128)
def fib_lru(n: int) -> int:
    if n < 2:
        return n
    return fib_lru(n - 1) + fib_lru(n - 2)


print("[手动缓存]")
print(f"  fib(8) = {fib_memo(8)}")

print("\n[lru_cache]")
print(f"  fib(30) = {fib_lru(30)}")
print(f"  缓存信息: {fib_lru.cache_info()}")


# === 4. 权限检查装饰器 ===

print(f"\n{'=' * 60}")
print("4. 权限检查装饰器")
print(f"{'=' * 60}")

# 模拟用户上下文
_current_user: dict[str, Any] = {"name": "Alice", "roles": ["admin", "editor"]}


def require_roles(*required_roles: str):
    """权限检查装饰器：要求用户拥有指定角色之一。"""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            user_roles: list[str] = _current_user.get("roles", [])
            user_name: str = _current_user.get("name", "Unknown")

            if any(role in user_roles for role in required_roles):
                print(f"  [AUTH] ✅ {user_name} 有权限 ({', '.join(required_roles)})")
                return func(*args, **kwargs)
            else:
                print(f"  [AUTH] ❌ {user_name} 无权限 (需要: {', '.join(required_roles)})")
                raise PermissionError(f"需要角色: {required_roles}")

        return wrapper

    return decorator


@require_roles("admin")
def delete_user(user_id: int) -> str:
    return f"删除用户 {user_id}"


@require_roles("superadmin")
def delete_database() -> str:
    return "删除整个数据库"


print(f"[权限] {delete_user(42)}")

try:
    delete_database()
except PermissionError as e:
    print(f"[权限] 拒绝: {e}")


# === 5. 输入验证装饰器 ===

print(f"\n{'=' * 60}")
print("5. 输入验证装饰器")
print(f"{'=' * 60}")


def validate(**validators: Callable[[Any], bool]):
    """参数验证装饰器。

    用法: @validate(age=lambda x: 0 <= x <= 150, name=lambda x: len(x) > 0)
    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        import inspect
        sig = inspect.signature(func)

        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            bound = sig.bind(*args, **kwargs)
            bound.apply_defaults()

            for param_name, validator in validators.items():
                if param_name in bound.arguments:
                    value: Any = bound.arguments[param_name]
                    if not validator(value):
                        print(f"  [VALIDATE] ❌ {param_name}={value!r} 验证失败")
                        raise ValueError(f"参数 {param_name}={value!r} 验证失败")
                    print(f"  [VALIDATE] ✅ {param_name}={value!r}")

            return func(*args, **kwargs)

        return wrapper

    return decorator


@validate(
    name=lambda x: isinstance(x, str) and len(x) > 0,
    age=lambda x: isinstance(x, int) and 0 <= x <= 150,
    email=lambda x: "@" in str(x),
)
def register_user(name: str, age: int, email: str) -> dict[str, Any]:
    """注册用户。"""
    return {"name": name, "age": age, "email": email}


# ✅ 有效参数
print("[验证]")
user = register_user("Alice", 25, "alice@example.com")
print(f"  注册成功: {user}")

# ❌ 无效参数
try:
    register_user("", 25, "alice@example.com")
except ValueError as e:
    print(f"  验证失败: {e}")


# === 6. 缓存 + 过期时间 ===

print(f"\n{'=' * 60}")
print("6. 带过期时间的缓存装饰器")
print(f"{'=' * 60}")


def timed_cache(ttl_seconds: float = 60.0):
    """带 TTL（过期时间）的缓存装饰器。"""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        cache: dict[tuple[Any, ...], tuple[float, Any]] = {}

        @wraps(func)
        def wrapper(*args: Any) -> Any:
            now: float = time.time()

            if args in cache:
                cached_time, cached_value = cache[args]
                if now - cached_time < ttl_seconds:
                    print(f"  [TTL_CACHE] 命中 (剩余 {ttl_seconds - (now - cached_time):.1f}s)")
                    return cached_value
                else:
                    print(f"  [TTL_CACHE] 过期，重新计算")

            result: Any = func(*args)
            cache[args] = (now, result)
            print(f"  [TTL_CACHE] 缓存结果 (TTL={ttl_seconds}s)")
            return result

        wrapper.cache = cache  # type: ignore[attr-defined]
        return wrapper

    return decorator


@timed_cache(ttl_seconds=0.1)
def get_config(key: str) -> str:
    """模拟从远端获取配置。"""
    print(f"  [get_config] 从远端获取 {key}...")
    return f"value_of_{key}"


print("[TTL 缓存]")
get_config("database_url")    # 计算
get_config("database_url")    # 命中
time.sleep(0.15)
get_config("database_url")    # 过期，重新计算

print("\n✅ 04-practical-patterns.py 运行完成")
