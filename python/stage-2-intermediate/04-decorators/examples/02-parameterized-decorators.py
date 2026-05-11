"""
第 4 章 示例 02：带参数的装饰器

演示三层嵌套结构和灵活的参数化装饰器。
"""

import time
from functools import wraps
from typing import Any, Callable


# === 1. 带参数的装饰器：三层嵌套 ===

print("=" * 60)
print("1. 三层嵌套：参数层 → 装饰器层 → wrapper层")
print("=" * 60)


def repeat(n: int = 2):
    """第 1 层：接收装饰器参数。"""
    print(f"  [repeat] 参数层：n={n}")

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        """第 2 层：接收被装饰的函数。"""
        print(f"  [repeat] 装饰器层：装饰 {func.__name__}")

        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            """第 3 层：实际执行逻辑。"""
            result: Any = None
            for i in range(n):
                result = func(*args, **kwargs)
                print(f"  [repeat] 第 {i+1}/{n} 次: {result!r}")
            return result

        return wrapper

    return decorator


@repeat(n=3)
def say(message: str) -> str:
    return message


print("\n[调用]")
say("Hello!")


# === 2. 带参数的装饰器：限制范围 ===

print(f"\n{'=' * 60}")
print("2. 实用示例：参数验证装饰器")
print(f"{'=' * 60}")


def clamp_result(min_val: float, max_val: float):
    """限制返回值在指定范围内。"""

    def decorator(func: Callable[..., float]) -> Callable[..., float]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> float:
            result: float = func(*args, **kwargs)
            clamped: float = max(min_val, min(max_val, result))
            if clamped != result:
                print(f"  [clamp] {func.__name__} 返回 {result}，裁剪为 {clamped}")
            else:
                print(f"  [clamp] {func.__name__} 返回 {result}，在范围内")
            return clamped

        return wrapper

    return decorator


@clamp_result(0.0, 100.0)
def calculate_score(base: float, bonus: float) -> float:
    return base + bonus


print(f"[结果] {calculate_score(85, 10)}")    # 95.0，在范围内
print(f"[结果] {calculate_score(90, 20)}")    # 100.0，裁剪
print(f"[结果] {calculate_score(-10, 5)}")    # 0.0，裁剪


# === 3. 灵活装饰器：带括号/不带括号都能用 ===

print(f"\n{'=' * 60}")
print("3. 灵活装饰器：@deco 和 @deco() 都能用")
print(f"{'=' * 60}")


def debug(func: Callable[..., Any] | None = None, *, prefix: str = "DEBUG"):
    """
    灵活装饰器：
    - @debug          → func 不是 None，直接装饰
    - @debug()        → func 是 None，返回装饰器
    - @debug(prefix=) → func 是 None，返回装饰器
    """

    def decorator(f: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(f)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            print(f"  [{prefix}] → {f.__name__}()")
            result = f(*args, **kwargs)
            print(f"  [{prefix}] ← {f.__name__}() = {result!r}")
            return result

        return wrapper

    if func is not None:
        # @debug 不带括号
        return decorator(func)
    # @debug() 或 @debug(prefix="INFO") 带括号
    return decorator


@debug
def func_a() -> int:
    return 42


@debug()
def func_b() -> int:
    return 99


@debug(prefix="INFO")
def func_c() -> int:
    return 0


print("[灵活装饰器]")
func_a()
func_b()
func_c()


# === 4. 带参数的装饰器：日志级别 ===

print(f"\n{'=' * 60}")
print("4. 实用示例：可配置的日志装饰器")
print(f"{'=' * 60}")


import logging

logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")


def log(level: str = "INFO", message: str = ""):
    """可配置的日志装饰器。"""
    log_level: int = getattr(logging, level.upper(), logging.INFO)

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            log_msg: str = message or f"调用 {func.__name__}"
            logger = logging.getLogger(func.__module__)
            logger.log(log_level, f"→ {log_msg}")

            start: float = time.perf_counter()
            try:
                result = func(*args, **kwargs)
                elapsed: float = time.perf_counter() - start
                logger.log(log_level, f"← {func.__name__} 完成 ({elapsed:.4f}s)")
                return result
            except Exception as e:
                logger.error(f"✗ {func.__name__} 异常: {e}")
                raise

        return wrapper

    return decorator


@log(level="INFO", message="正在处理订单")
def process_order(order_id: int) -> dict[str, Any]:
    time.sleep(0.01)
    return {"order_id": order_id, "status": "completed"}


@log(level="WARNING")
def dangerous_operation() -> None:
    raise ValueError("Something went wrong")


print("[日志装饰器]")
process_order(12345)

try:
    dangerous_operation()
except ValueError:
    pass


# === 5. 装饰器工厂：用 functools.partial 简化 ===

print(f"\n{'=' * 60}")
print("5. 用 functools.partial 创建预配置装饰器")
print(f"{'=' * 60}")

from functools import partial


def tag(tag_name: str):
    """HTML 标签装饰器。"""
    def decorator(func: Callable[..., str]) -> Callable[..., str]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> str:
            result: str = func(*args, **kwargs)
            tagged: str = f"<{tag_name}>{result}</{tag_name}>"
            print(f"  [tag] {tagged}")
            return tagged
        return wrapper
    return decorator


# 创建预配置的装饰器
bold = tag("b")
italic = tag("i")
h1 = tag("h1")


@h1
@bold
def title() -> str:
    return "My Page"


@italic
def subtitle() -> str:
    return "A cool subtitle"


print("[预配置装饰器]")
print(f"  title: {title()}")
print(f"  subtitle: {subtitle()}")

print("\n✅ 02-parameterized-decorators.py 运行完成")
