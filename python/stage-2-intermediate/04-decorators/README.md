# 第 4 章：装饰器 — 用一行代码改变函数的灵魂

> *"Don't repeat yourself. Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."*
> — Andy Hunt & Dave Thomas, The Pragmatic Programmer
>
> 你是否写过这样的代码——在 20 个函数的开头加日志，在 15 个接口前检查权限，在 10 个数据库操作中加重试？
> 装饰器让你把这些"横切关注点"抽成一行 `@decorator`，一次编写，处处复用。
> 它不是黑魔法——它只是"高阶函数 + 闭包"的优雅语法糖。

## 📖 本章内容

- [1. 从闭包到装饰器](#1-从闭包到装饰器)
  - [1.1 闭包回顾](#11-闭包回顾)
  - [1.2 装饰器的本质](#12-装饰器的本质)
- [2. 带参数的装饰器](#2-带参数的装饰器)
  - [2.1 三层嵌套的秘密](#21-三层嵌套的秘密)
  - [2.2 用类实现带参数的装饰器](#22-用类实现带参数的装饰器)
- [3. functools.wraps 的重要性](#3-functoolswraps-的重要性)
- [4. 类装饰器](#4-类装饰器)
  - [4.1 用类实现装饰器](#41-用类实现装饰器)
  - [4.2 装饰类的装饰器](#42-装饰类的装饰器)
- [5. 装饰器堆叠顺序](#5-装饰器堆叠顺序)
- [6. 常见装饰器模式](#6-常见装饰器模式)
  - [6.1 计时器](#61-计时器)
  - [6.2 重试](#62-重试)
  - [6.3 缓存](#63-缓存)
  - [6.4 权限检查](#64-权限检查)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. 从闭包到装饰器

> 🎭 **The Drama: 装饰器不是魔法——它只是函数替换**
>
> 很多人看到装饰器的三层嵌套就头疼。但请记住一个简单的等价关系：
>
> ```python
> @decorator
> def func():
>     ...
>
> # 完 全 等 价 于：
> func = decorator(func)
> ```
>
> 就这么简单。`@decorator` 只是语法糖——把函数传给另一个函数，然后用返回值替换原函数。
> 一旦你理解了这个等价关系，所有的"三层嵌套"都不再神秘。

### 1.1 闭包回顾

```python
def make_greeter(greeting: str):
    """闭包：内部函数记住了外部变量 greeting。"""

    def greeter(name: str) -> str:
        # greeting 来自外层函数——这就是闭包
        result: str = f"{greeting}, {name}!"
        print(f"  [闭包] {result}")
        return result

    return greeter


hello = make_greeter("Hello")
nihao = make_greeter("你好")

hello("Alice")   # Hello, Alice!
nihao("Bob")     # 你好, Bob!

# 闭包保持了对外部变量的引用
print(f"[闭包] hello.__closure__[0].cell_contents = {hello.__closure__[0].cell_contents!r}")
```

### 1.2 装饰器的本质

```
┌───────────────────────────────────────────────────────────┐
│                  装饰器的本质                               │
│                                                            │
│   @decorator           ===    func = decorator(func)       │
│   def func(): ...                                          │
│                                                            │
│   装饰器是一个函数，它：                                     │
│   1. 接收一个函数作为参数                                    │
│   2. 返回一个新函数（通常是 wrapper）                        │
│   3. 新函数在调用原函数前后可以添加额外逻辑                   │
│                                                            │
│   decorator(func)                                          │
│       │                                                    │
│       ▼                                                    │
│   wrapper(*args, **kwargs)                                 │
│       │                                                    │
│       ├── 前置逻辑（如日志、计时开始）                       │
│       ├── result = func(*args, **kwargs)  ← 调用原函数      │
│       ├── 后置逻辑（如日志、计时结束）                       │
│       └── return result                                    │
└───────────────────────────────────────────────────────────┘
```

```python
from typing import Any, Callable
from functools import wraps


def simple_log(func: Callable[..., Any]) -> Callable[..., Any]:
    """最简单的装饰器：在调用前后打印日志。"""

    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print(f"  [LOG] 调用 {func.__name__}(args={args}, kwargs={kwargs})")
        result: Any = func(*args, **kwargs)
        print(f"  [LOG] {func.__name__} 返回 {result!r}")
        return result

    return wrapper


# ✅ 使用装饰器
@simple_log
def add(a: int, b: int) -> int:
    """两数相加。"""
    return a + b


print("[装饰器] 调用 add:")
result: int = add(3, 5)
print(f"[装饰器] result = {result}")

# 验证：等价于 add = simple_log(add)
print(f"[装饰器] add.__name__ = {add.__name__}")  # 'add'（因为用了 @wraps）
print(f"[装饰器] add.__doc__ = {add.__doc__}")     # '两数相加。'
```

---

## 2. 带参数的装饰器

> 🧠 **CS Master's Bridge: 柯里化 (Currying)**
>
> 带参数的装饰器本质上是**柯里化**——把一个接受多个参数的函数变成多个接受单一参数的函数链。
>
> ```python
> @retry(max_attempts=3)     # 第一步：retry(max_attempts=3) 返回一个装饰器
> def api_call(): ...         # 第二步：那个装饰器接收 api_call，返回 wrapper
> ```
>
> 所以"三层嵌套"其实是：**参数层 → 装饰器层 → wrapper 层**。

### 2.1 三层嵌套的秘密

```python
from typing import Any, Callable
from functools import wraps


def repeat(n: int = 2):
    """带参数的装饰器：重复执行函数 n 次。

    三层结构：
    - 第 1 层 repeat(n)：接收装饰器参数，返回真正的装饰器
    - 第 2 层 decorator(func)：接收被装饰的函数，返回 wrapper
    - 第 3 层 wrapper(*args)：实际的替换函数
    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            result: Any = None
            for i in range(n):
                print(f"  [repeat] 第 {i + 1}/{n} 次执行 {func.__name__}")
                result = func(*args, **kwargs)
            return result
        return wrapper

    return decorator


@repeat(n=3)
def say_hello(name: str) -> str:
    msg: str = f"Hello, {name}!"
    print(f"  [say_hello] {msg}")
    return msg


# 等价展开：
# say_hello = repeat(n=3)(say_hello)
#           = decorator(say_hello)    ← repeat(n=3) 返回的装饰器
#           = wrapper                 ← decorator 返回的 wrapper

print("[三层嵌套]")
say_hello("Alice")
```

```
✅ 正确理解三层嵌套

@repeat(n=3)          ← 调用 repeat(3)，返回 decorator
def say_hello(): ...  ← 调用 decorator(say_hello)，返回 wrapper

执行 say_hello()      ← 实际执行的是 wrapper()

❌ 常见误解

以为 @repeat 就够了    ← 缺少参数调用！
                        repeat 本身不是装饰器
                        repeat(n=3) 才返回装饰器
```

### 2.2 用类实现带参数的装饰器

```python
class Throttle:
    """节流装饰器——用类实现，避免三层嵌套。"""

    def __init__(self, calls_per_second: float = 1.0) -> None:
        self.min_interval: float = 1.0 / calls_per_second
        self._last_call: float = 0.0

    def __call__(self, func: Callable[..., Any]) -> Callable[..., Any]:
        import time

        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            now: float = time.time()
            elapsed: float = now - self._last_call
            if elapsed < self.min_interval:
                wait: float = self.min_interval - elapsed
                print(f"  [Throttle] 等待 {wait:.3f}s")
                time.sleep(wait)
            self._last_call = time.time()
            return func(*args, **kwargs)

        return wrapper


@Throttle(calls_per_second=10)
def fast_api() -> str:
    return "response"


# 类实现的好处：
# 1. 只有两层嵌套（__init__ + __call__）
# 2. 状态管理更自然
# 3. 可以给装饰器添加方法（如 reset_throttle）
```

---

## 3. `functools.wraps` 的重要性

> ⚛️ **The Science: 没有 wraps 的后果**
>
> 装饰器会用 `wrapper` 函数替换原函数。如果不用 `@wraps`，原函数的元信息（名称、文档字符串、类型注解）全部丢失。
> 这会导致：调试时看到的都是 `wrapper`，`help()` 显示错误的文档，类型检查器报错。

```python
from functools import wraps
from typing import Any, Callable


# ❌ 没有 @wraps
def bad_decorator(func: Callable[..., Any]) -> Callable[..., Any]:
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        return func(*args, **kwargs)
    return wrapper


# ✅ 有 @wraps
def good_decorator(func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        return func(*args, **kwargs)
    return wrapper


@bad_decorator
def bad_greet(name: str) -> str:
    """打招呼。"""
    return f"Hello, {name}!"


@good_decorator
def good_greet(name: str) -> str:
    """打招呼。"""
    return f"Hello, {name}!"


print(f"[wraps对比]")
print(f"  ❌ bad_greet.__name__ = {bad_greet.__name__}")     # 'wrapper'
print(f"  ❌ bad_greet.__doc__  = {bad_greet.__doc__}")       # None
print(f"  ✅ good_greet.__name__ = {good_greet.__name__}")   # 'good_greet'
print(f"  ✅ good_greet.__doc__  = {good_greet.__doc__}")     # '打招呼。'

# @wraps 还保留了 __wrapped__ 属性，可以访问原函数
print(f"  ✅ good_greet.__wrapped__ = {good_greet.__wrapped__}")  # 原始函数
```

| 属性 | 无 `@wraps` | 有 `@wraps` |
|------|-------------|-------------|
| `__name__` | `"wrapper"` | 原函数名 |
| `__doc__` | `None` | 原文档字符串 |
| `__module__` | 装饰器模块 | 原模块 |
| `__annotations__` | `{}` | 原注解 |
| `__wrapped__` | 不存在 | 指向原函数 |

---

## 4. 类装饰器

### 4.1 用类实现装饰器

```python
from functools import wraps
from typing import Any, Callable


class CallCounter:
    """用类实现装饰器——记录每个函数被调用的次数。"""

    def __init__(self, func: Callable[..., Any]) -> None:
        wraps(func)(self)  # 将 func 的元信息复制到 self
        self._func = func
        self.call_count: int = 0

    def __call__(self, *args: Any, **kwargs: Any) -> Any:
        self.call_count += 1
        print(f"  [CallCounter] {self._func.__name__} 第 {self.call_count} 次调用")
        return self._func(*args, **kwargs)

    def reset(self) -> None:
        """重置计数器。"""
        self.call_count = 0


@CallCounter
def process_data(data: list[int]) -> int:
    """处理数据。"""
    return sum(data)


process_data([1, 2, 3])
process_data([4, 5, 6])
process_data([7, 8, 9])
print(f"[CallCounter] 调用次数: {process_data.call_count}")  # 3
process_data.reset()
print(f"[CallCounter] 重置后: {process_data.call_count}")    # 0
```

### 4.2 装饰类的装饰器

```python
from dataclasses import dataclass
from datetime import datetime
from typing import TypeVar

T = TypeVar("T")


def add_timestamp(cls: type[T]) -> type[T]:
    """类装饰器：给类添加时间戳功能。"""
    original_init = cls.__init__  # type: ignore[misc]

    def new_init(self: Any, *args: Any, **kwargs: Any) -> None:
        original_init(self, *args, **kwargs)
        self.created_at = datetime.now()  # type: ignore[attr-defined]
        self.updated_at = datetime.now()  # type: ignore[attr-defined]
        print(f"  [add_timestamp] 创建时间: {self.created_at}")

    cls.__init__ = new_init  # type: ignore[misc]
    return cls


@add_timestamp
class User:
    def __init__(self, name: str, email: str) -> None:
        self.name = name
        self.email = email

    def __repr__(self) -> str:
        return f"User(name={self.name!r}, email={self.email!r})"


user = User("Alice", "alice@example.com")
print(f"[User] {user}")
print(f"[User] created_at: {user.created_at}")  # type: ignore[attr-defined]
```

---

## 5. 装饰器堆叠顺序

> 🌌 **The Big Picture: 装饰器堆叠 = 函数组合**
>
> 多个装饰器堆叠时，执行顺序是**从下到上**（先靠近函数的装饰器先应用）。
> 但在实际调用时，是**从上到下**执行的（洋葱模型）。

```
┌──────────────────────────────────────────┐
│        装饰器堆叠：洋葱模型               │
│                                           │
│  @A          调用时：                     │
│  @B            A.wrapper 开始 ──→         │
│  @C              B.wrapper 开始 ──→       │
│  def f():          C.wrapper 开始 ──→     │
│    ...               f() 执行             │
│                    C.wrapper 结束 ←──     │
│                  B.wrapper 结束 ←──       │
│                A.wrapper 结束 ←──         │
│                                           │
│  等价于：f = A(B(C(f)))                   │
│  应用顺序：C → B → A（从下到上）          │
│  调用顺序：A → B → C → f（从上到下）      │
└──────────────────────────────────────────┘
```

```python
from functools import wraps
from typing import Any, Callable


def decorator_a(func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print("  [A] 进入")
        result = func(*args, **kwargs)
        print("  [A] 退出")
        return result
    return wrapper


def decorator_b(func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print("  [B] 进入")
        result = func(*args, **kwargs)
        print("  [B] 退出")
        return result
    return wrapper


def decorator_c(func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print("  [C] 进入")
        result = func(*args, **kwargs)
        print("  [C] 退出")
        return result
    return wrapper


@decorator_a
@decorator_b
@decorator_c
def greet(name: str) -> str:
    print(f"  [greet] Hello, {name}!")
    return f"Hello, {name}!"


print("[堆叠顺序]")
greet("World")
# 输出：A进入 → B进入 → C进入 → greet → C退出 → B退出 → A退出
```

---

## 6. 常见装饰器模式

### 6.1 计时器

```python
import time
from functools import wraps
from typing import Any, Callable


def timer(func: Callable[..., Any]) -> Callable[..., Any]:
    """计时装饰器：测量函数执行时间。"""

    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start: float = time.perf_counter()
        result: Any = func(*args, **kwargs)
        elapsed: float = time.perf_counter() - start
        print(f"  [TIMER] {func.__name__}() 耗时 {elapsed:.4f}s")
        return result

    return wrapper


@timer
def slow_function() -> str:
    """模拟耗时操作。"""
    time.sleep(0.05)
    return "done"


slow_function()
```

### 6.2 重试

```python
import time
import random
from functools import wraps
from typing import Any, Callable


def retry(
    max_attempts: int = 3,
    delay: float = 0.1,
    exceptions: tuple[type[Exception], ...] = (Exception,),
):
    """重试装饰器：失败时自动重试。"""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exception: Exception | None = None
            for attempt in range(1, max_attempts + 1):
                try:
                    result: Any = func(*args, **kwargs)
                    print(f"  [RETRY] {func.__name__} 第{attempt}次成功")
                    return result
                except exceptions as e:
                    last_exception = e
                    print(f"  [RETRY] {func.__name__} 第{attempt}次失败: {e}")
                    if attempt < max_attempts:
                        time.sleep(delay)
            raise last_exception  # type: ignore[misc]

        return wrapper

    return decorator


@retry(max_attempts=5, delay=0.01, exceptions=(ConnectionError,))
def flaky_api_call() -> str:
    """模拟不稳定的 API。"""
    if random.random() < 0.5:
        raise ConnectionError("连接超时")
    return "成功获取数据"


try:
    result = flaky_api_call()
    print(f"[重试] 结果: {result}")
except ConnectionError:
    print("[重试] 全部失败")
```

### 6.3 缓存

```python
from functools import wraps, lru_cache
from typing import Any, Callable


# 手动实现缓存装饰器
def memoize(func: Callable[..., Any]) -> Callable[..., Any]:
    """缓存装饰器：记忆化已计算过的结果。"""
    cache: dict[tuple[Any, ...], Any] = {}

    @wraps(func)
    def wrapper(*args: Any) -> Any:
        if args in cache:
            print(f"  [CACHE] {func.__name__}{args} → 命中缓存")
            return cache[args]
        result: Any = func(*args)
        cache[args] = result
        print(f"  [CACHE] {func.__name__}{args} → 计算并缓存")
        return result

    wrapper.cache = cache  # type: ignore[attr-defined]
    wrapper.cache_clear = cache.clear  # type: ignore[attr-defined]
    return wrapper


@memoize
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


print("[手动缓存]")
print(f"fib(10) = {fibonacci(10)}")
print(f"缓存大小: {len(fibonacci.cache)}")  # type: ignore[attr-defined]


# ✅ 推荐：使用内置的 @lru_cache
@lru_cache(maxsize=128)
def fibonacci_builtin(n: int) -> int:
    """内置缓存版斐波那契。"""
    if n < 2:
        return n
    return fibonacci_builtin(n - 1) + fibonacci_builtin(n - 2)


print(f"\n[lru_cache]")
print(f"fib(30) = {fibonacci_builtin(30)}")
print(f"缓存信息: {fibonacci_builtin.cache_info()}")
```

| 缓存方案 | 适用场景 | 内存限制 | 线程安全 |
|----------|---------|---------|---------|
| 手动 `dict` | 简单场景 | 无限制 | ❌ |
| `@lru_cache` | 大多数场景 | `maxsize` 限制 | ✅ |
| `@cache` (3.9+) | 不需要限制大小 | 无限制 | ✅ |

### 6.4 权限检查

```python
from functools import wraps
from typing import Any, Callable


# 模拟用户系统
current_user: dict[str, Any] = {"name": "Alice", "role": "admin"}


def require_role(role: str):
    """权限检查装饰器：要求特定角色。"""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            user_role: str = current_user.get("role", "guest")
            if user_role != role:
                print(f"  [AUTH] ❌ {current_user['name']} ({user_role}) 无权执行 {func.__name__}，需要 {role}")
                raise PermissionError(f"需要 {role} 角色")
            print(f"  [AUTH] ✅ {current_user['name']} ({user_role}) 权限通过")
            return func(*args, **kwargs)
        return wrapper

    return decorator


@require_role("admin")
def delete_user(user_id: int) -> str:
    """删除用户（仅管理员）。"""
    return f"用户 {user_id} 已删除"


@require_role("admin")
def create_report() -> str:
    """创建报告（仅管理员）。"""
    return "报告已生成"


# 管理员操作
print("[权限检查] 管理员:")
print(f"  {delete_user(42)}")

# 切换为普通用户
current_user["role"] = "user"
print("\n[权限检查] 普通用户:")
try:
    delete_user(42)
except PermissionError as e:
    print(f"  捕获异常: {e}")
```

---

## 最佳实践

1. **永远使用 `@functools.wraps`**：保留原函数的元信息
2. **装饰器参数层用 `()` 调用**：`@decorator()` 而非 `@decorator`（除非不需要参数）
3. **保持装饰器职责单一**：一个装饰器做一件事——日志、计时、缓存分开写
4. **考虑用 `@dataclass` 或类实现复杂装饰器**：避免三层嵌套导致的可读性问题
5. **优先使用内置装饰器**：`@lru_cache`, `@property`, `@staticmethod`, `@classmethod`, `@dataclass`
6. **装饰器应该对被装饰函数透明**：不改变函数签名，不吞掉异常（除非这就是目的）

```python
# ✅ 最佳实践汇总
from functools import wraps, lru_cache
from typing import Any, Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")


def best_practice_decorator(func: Callable[P, R]) -> Callable[P, R]:
    """最佳实践模板：完整类型注解 + @wraps。"""

    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        # 前置逻辑
        print(f"  [best] 调用 {func.__name__}")
        result: R = func(*args, **kwargs)
        # 后置逻辑
        print(f"  [best] 完成 {func.__name__}")
        return result

    return wrapper
```

---

## 常见陷阱

### 陷阱 1：忘了 `@wraps` 导致元信息丢失

```python
from functools import wraps
from typing import Any, Callable


# ❌ 没有 @wraps
def bad_deco(func: Callable[..., Any]) -> Callable[..., Any]:
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        return func(*args, **kwargs)
    return wrapper

@bad_deco
def my_func() -> None:
    """重要的文档字符串。"""
    pass

print(f"[陷阱1] __name__: {my_func.__name__}")  # 'wrapper' ❌
print(f"[陷阱1] __doc__:  {my_func.__doc__}")    # None ❌
```

### 陷阱 2：装饰器参数和无参数混淆

```python
# ❌ 常见错误：带参数的装饰器忘了调用
# @repeat       # TypeError! repeat 期望一个 int，得到了函数
# def func(): ...

# ✅ 正确：带参数的装饰器必须调用
# @repeat(3)    # 先调用 repeat(3) 得到装饰器，再用装饰器装饰函数
# def func(): ...

# 💡 技巧：写一个既能带参数也能不带参数的装饰器
def flexible_decorator(func: Callable[..., Any] | None = None, *, verbose: bool = False):
    """灵活装饰器：@flexible_decorator 和 @flexible_decorator(verbose=True) 都能用。"""

    def decorator(f: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(f)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            if verbose:
                print(f"  [flexible] 调用 {f.__name__}")
            return f(*args, **kwargs)
        return wrapper

    if func is not None:
        # @flexible_decorator 无括号调用
        return decorator(func)
    # @flexible_decorator(verbose=True) 带括号调用
    return decorator


@flexible_decorator
def func_a() -> str:
    return "a"


@flexible_decorator(verbose=True)
def func_b() -> str:
    return "b"


print(f"[陷阱2] func_a(): {func_a()}")
print(f"[陷阱2] func_b(): {func_b()}")
```

### 陷阱 3：装饰器在导入时执行

```python
def register(func: Callable[..., Any]) -> Callable[..., Any]:
    """注册装饰器——在模块导入时就执行！"""
    print(f"  [register] 注册 {func.__name__}（导入时执行！）")
    return func


@register
def handler_a() -> None:
    pass


@register
def handler_b() -> None:
    pass


# 上面两个 print 在模块导入时就已经执行了！
# 这是装饰器的特性，不是 bug——Flask 和 pytest 都利用了这个特性
print("[陷阱3] 装饰器在导入时执行，而非调用时执行")
```

---

## 练习题

### 练习 1：实现 `@once` 装饰器

实现一个 `@once` 装饰器，让函数只执行一次，后续调用直接返回第一次的结果。

<details>
<summary>💡 参考答案</summary>

```python
from functools import wraps
from typing import Any, Callable


def once(func: Callable[..., Any]) -> Callable[..., Any]:
    result: Any = None
    has_run: bool = False

    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        nonlocal result, has_run
        if not has_run:
            result = func(*args, **kwargs)
            has_run = True
            print(f"  [once] {func.__name__} 首次执行")
        else:
            print(f"  [once] {func.__name__} 跳过（已执行过）")
        return result

    return wrapper


@once
def load_config() -> dict[str, str]:
    print("  [load_config] 加载配置...")
    return {"debug": "true", "port": "8080"}


# 测试
config1 = load_config()  # 执行
config2 = load_config()  # 跳过
print(f"config1 is config2: {config1 is config2}")  # True
```
</details>

### 练习 2：实现 `@validate_types` 装饰器

实现一个装饰器，自动检查函数参数的类型是否匹配类型注解。

<details>
<summary>💡 参考答案</summary>

```python
import inspect
from functools import wraps
from typing import Any, Callable, get_type_hints


def validate_types(func: Callable[..., Any]) -> Callable[..., Any]:
    hints = get_type_hints(func)
    sig = inspect.signature(func)

    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        bound = sig.bind(*args, **kwargs)
        bound.apply_defaults()

        for param_name, value in bound.arguments.items():
            if param_name in hints and param_name != "return":
                expected_type = hints[param_name]
                if not isinstance(value, expected_type):
                    raise TypeError(
                        f"参数 {param_name} 期望 {expected_type.__name__}，"
                        f"得到 {type(value).__name__}"
                    )
                print(f"  [validate] {param_name}: {type(value).__name__} ✅")

        result = func(*args, **kwargs)

        if "return" in hints:
            if not isinstance(result, hints["return"]):
                raise TypeError(
                    f"返回值期望 {hints['return'].__name__}，"
                    f"得到 {type(result).__name__}"
                )

        return result

    return wrapper


@validate_types
def greet(name: str, times: int) -> str:
    return (f"Hello, {name}! " * times).strip()


# 测试
print(greet("Alice", 2))  # ✅ 通过

try:
    greet("Alice", "two")  # type: ignore[arg-type]  # ❌ TypeError
except TypeError as e:
    print(f"类型错误: {e}")
```
</details>

### 练习 3：实现 `@rate_limit` 装饰器

实现一个速率限制装饰器，限制函数在指定时间窗口内的最大调用次数。

<details>
<summary>💡 参考答案</summary>

```python
import time
from collections import deque
from functools import wraps
from typing import Any, Callable


def rate_limit(max_calls: int, time_window: float):
    """速率限制：time_window 秒内最多调用 max_calls 次。"""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        call_times: deque[float] = deque()

        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            now: float = time.time()

            # 清除时间窗口外的记录
            while call_times and now - call_times[0] > time_window:
                call_times.popleft()

            if len(call_times) >= max_calls:
                wait_time: float = time_window - (now - call_times[0])
                print(f"  [rate_limit] 超出限制，需等待 {wait_time:.2f}s")
                raise RuntimeError(f"速率限制：{time_window}s 内最多 {max_calls} 次")

            call_times.append(now)
            print(f"  [rate_limit] 第 {len(call_times)}/{max_calls} 次调用")
            return func(*args, **kwargs)

        return wrapper

    return decorator


@rate_limit(max_calls=3, time_window=1.0)
def api_request(endpoint: str) -> str:
    return f"Response from {endpoint}"


# 测试
for i in range(5):
    try:
        result = api_request(f"/api/v{i}")
        print(f"  结果: {result}")
    except RuntimeError as e:
        print(f"  被限制: {e}")
```
</details>

---

## 参考资源

- [Python 装饰器 — 官方文档](https://docs.python.org/3/glossary.html#term-decorator)
- [functools 模块](https://docs.python.org/3/library/functools.html)
- [PEP 318 — Decorators for Functions and Methods](https://peps.python.org/pep-0318/)
- [PEP 3129 — Class Decorators](https://peps.python.org/pep-3129/)
- [Fluent Python, 2nd Ed. — Ch.9: Decorators and Closures](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [Real Python — Primer on Python Decorators](https://realpython.com/primer-on-python-decorators/)

---

## 下一步

恭喜你征服了装饰器！从闭包到三层嵌套，从 `@wraps` 到实战模式，你已经可以像框架开发者一样编写和阅读装饰器了。

接下来，我们将学习 **上下文管理器**——用 `with` 语句优雅地管理资源，确保"打开的东西一定会关闭"。

**[👉 第 5 章：上下文管理器](../05-context-managers/)**

---

[⬅️ 第 3 章：迭代器与生成器](../03-iterators-generators/) | [👉 第 5 章：上下文管理器](../05-context-managers/) | [🏠 返回 Stage 2 目录](../README.md)
