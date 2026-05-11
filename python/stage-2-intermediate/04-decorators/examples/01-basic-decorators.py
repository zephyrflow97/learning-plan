"""
第 4 章 示例 01：基础装饰器

演示从闭包到装饰器的演变过程。
"""

from functools import wraps
from typing import Any, Callable


# === 1. 闭包回顾 ===

print("=" * 60)
print("1. 闭包：装饰器的基础")
print("=" * 60)


def make_multiplier(factor: int) -> Callable[[int], int]:
    """闭包示例：返回一个"记住"factor 的函数。"""

    def multiplier(x: int) -> int:
        result: int = x * factor
        print(f"  [闭包] {x} × {factor} = {result}")
        return result

    return multiplier


double = make_multiplier(2)
triple = make_multiplier(3)

print(f"[闭包] double(5) = {double(5)}")
print(f"[闭包] triple(5) = {triple(5)}")
print(f"[闭包] double.__closure__[0].cell_contents = {double.__closure__[0].cell_contents}")


# === 2. 最简单的装饰器 ===

print(f"\n{'=' * 60}")
print("2. 最简单的装饰器")
print(f"{'=' * 60}")


def log_calls(func: Callable[..., Any]) -> Callable[..., Any]:
    """日志装饰器：记录函数调用。"""

    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        args_str: str = ", ".join(
            [repr(a) for a in args] + [f"{k}={v!r}" for k, v in kwargs.items()]
        )
        print(f"  [LOG] → {func.__name__}({args_str})")
        result: Any = func(*args, **kwargs)
        print(f"  [LOG] ← {func.__name__} 返回 {result!r}")
        return result

    return wrapper


@log_calls
def add(a: int, b: int) -> int:
    """两数相加。"""
    return a + b


@log_calls
def greet(name: str, greeting: str = "Hello") -> str:
    """问候。"""
    return f"{greeting}, {name}!"


print("[日志装饰器]")
add(3, 5)
greet("Alice", greeting="你好")


# === 3. @wraps 的作用 ===

print(f"\n{'=' * 60}")
print("3. @wraps 保留元信息")
print(f"{'=' * 60}")


def bad_deco(func: Callable[..., Any]) -> Callable[..., Any]:
    """❌ 没有 @wraps。"""
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        return func(*args, **kwargs)
    return wrapper


def good_deco(func: Callable[..., Any]) -> Callable[..., Any]:
    """✅ 有 @wraps。"""
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        return func(*args, **kwargs)
    return wrapper


@bad_deco
def func_bad() -> None:
    """这是 func_bad 的文档。"""
    pass


@good_deco
def func_good() -> None:
    """这是 func_good 的文档。"""
    pass


print(f"  ❌ bad:  __name__={func_bad.__name__!r}, __doc__={func_bad.__doc__!r}")
print(f"  ✅ good: __name__={func_good.__name__!r}, __doc__={func_good.__doc__!r}")


# === 4. 装饰器的等价形式 ===

print(f"\n{'=' * 60}")
print("4. 装饰器的等价形式")
print(f"{'=' * 60}")


def my_decorator(func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print(f"  [deco] 前置逻辑")
        result = func(*args, **kwargs)
        print(f"  [deco] 后置逻辑")
        return result
    return wrapper


# 方式 1：用 @ 语法
@my_decorator
def method_a() -> str:
    return "A"


# 方式 2：手动等价形式
def method_b() -> str:
    return "B"

method_b = my_decorator(method_b)  # 等价于 @my_decorator

print("[等价形式] method_a:")
method_a()

print("[等价形式] method_b:")
method_b()


# === 5. 多个装饰器堆叠 ===

print(f"\n{'=' * 60}")
print("5. 装饰器堆叠顺序")
print(f"{'=' * 60}")


def bold(func: Callable[..., str]) -> Callable[..., str]:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> str:
        result: str = func(*args, **kwargs)
        print(f"  [bold] 包装: <b>{result}</b>")
        return f"<b>{result}</b>"
    return wrapper


def italic(func: Callable[..., str]) -> Callable[..., str]:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> str:
        result: str = func(*args, **kwargs)
        print(f"  [italic] 包装: <i>{result}</i>")
        return f"<i>{result}</i>"
    return wrapper


@bold
@italic
def hello(name: str) -> str:
    return f"Hello, {name}"


# 等价于: hello = bold(italic(hello))
# italic 先包装 → bold 再包装
# 调用时: bold.wrapper → italic.wrapper → hello
print("[堆叠]")
result: str = hello("World")
print(f"  最终结果: {result}")  # <b><i>Hello, World</i></b>

print("\n✅ 01-basic-decorators.py 运行完成")
