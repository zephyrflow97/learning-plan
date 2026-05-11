# Stage 3 练习题集 — 高级 Python 综合训练

> "Practice does not make perfect. Only perfect practice makes perfect."
> — Vince Lombardi
>
> 这里的 25 道题覆盖 Stage 3 全部 10 章内容。
> 每道题都标注了难度、涉及章节、提示和参考答案。
> 闭卷做完再看答案，效果翻倍。

---

## 📖 目录

| # | 题目 | 难度 | 章节 |
|:---|:---|:---|:---|
| 1 | [自定义向量类](#练习-1自定义向量类) | ⭐⭐ | Ch01 数据模型 |
| 2 | [惰性属性描述器](#练习-2惰性属性描述器) | ⭐⭐⭐ | Ch02 描述器 |
| 3 | [字段验证元类](#练习-3字段验证元类) | ⭐⭐⭐⭐ | Ch03 元类 |
| 4 | [线程安全计数器](#练习-4线程安全计数器) | ⭐⭐ | Ch04 线程 |
| 5 | [多进程图片处理](#练习-5多进程图片处理模拟) | ⭐⭐⭐ | Ch05 多进程 |
| 6 | [异步批量下载](#练习-6异步批量下载) | ⭐⭐⭐ | Ch06 asyncio |
| 7 | [函数管道](#练习-7函数管道) | ⭐⭐ | Ch07 函数式 |
| 8 | [插件注册系统](#练习-8插件注册系统) | ⭐⭐ | Ch08 设计模式 |
| 9 | [性能对比测试](#练习-9性能对比测试) | ⭐⭐ | Ch09 性能 |
| 10 | [TCP 聊天服务器](#练习-10tcp-聊天服务器) | ⭐⭐⭐ | Ch10 网络 |
| 11 | [可迭代区间类](#练习-11可迭代区间类) | ⭐⭐ | Ch01 数据模型 |
| 12 | [类型检查描述器](#练习-12类型检查描述器) | ⭐⭐⭐ | Ch02 描述器 |
| 13 | [ORM 基础框架](#练习-13orm-基础框架) | ⭐⭐⭐⭐ | Ch03 元类 |
| 14 | [生产者-消费者](#练习-14生产者-消费者) | ⭐⭐⭐ | Ch04 线程 |
| 15 | [MapReduce 模拟](#练习-15mapreduce-模拟) | ⭐⭐⭐ | Ch05 多进程 |
| 16 | [异步信号量限流](#练习-16异步信号量限流) | ⭐⭐ | Ch06 asyncio |
| 17 | [函数缓存装饰器](#练习-17函数缓存装饰器) | ⭐⭐⭐ | Ch07 函数式 |
| 18 | [观察者事件系统](#练习-18观察者事件系统) | ⭐⭐⭐ | Ch08 设计模式 |
| 19 | [内存泄漏检测](#练习-19内存泄漏检测) | ⭐⭐⭐ | Ch09 性能 |
| 20 | [HTTP API 客户端](#练习-20http-api-客户端) | ⭐⭐⭐ | Ch10 网络 |
| 21 | [上下文管理器栈](#练习-21上下文管理器栈) | ⭐⭐ | Ch01 数据模型 |
| 22 | [状态机引擎](#练习-22状态机引擎) | ⭐⭐⭐ | Ch08 设计模式 |
| 23 | [异步生产者消费者](#练习-23异步生产者消费者) | ⭐⭐⭐ | Ch06 asyncio |
| 24 | [数据结构基准套件](#练习-24数据结构基准套件) | ⭐⭐ | Ch09 性能 |
| 25 | [迷你 RPC 框架](#练习-25迷你-rpc-框架) | ⭐⭐⭐⭐ | Ch10 网络 + Ch06 |

---

## 练习 1：自定义向量类

**难度**: ⭐⭐ | **章节**: Ch01 数据模型

实现一个 `Vector` 类，支持：
- `+`, `-`, `*`（标量乘法）运算符
- `len(v)` 返回维度
- `v[i]` 索引访问
- `repr(v)` 和 `str(v)`
- 支持 `==` 比较和哈希（可放入 set）

```python
v1 = Vector(1, 2, 3)
v2 = Vector(4, 5, 6)
print(v1 + v2)       # Vector(5, 7, 9)
print(v1 * 3)        # Vector(3, 6, 9)
print(len(v1))       # 3
print(v1[1])         # 2
```

<details>
<summary>💡 提示</summary>

- 用 `tuple` 存储分量（不可变 → 可哈希）
- `__add__` 用 `zip` 对应分量相加
- `__hash__` 用 `hash(self._components)`
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Iterator

class Vector:
    def __init__(self, *components: float) -> None:
        self._components = tuple(components)

    def __repr__(self) -> str:
        return f"Vector({', '.join(map(str, self._components))})"

    def __len__(self) -> int:
        return len(self._components)

    def __getitem__(self, index: int) -> float:
        return self._components[index]

    def __iter__(self) -> Iterator[float]:
        return iter(self._components)

    def __add__(self, other: "Vector") -> "Vector":
        if len(self) != len(other):
            raise ValueError("维度不匹配")
        return Vector(*(a + b for a, b in zip(self, other)))

    def __sub__(self, other: "Vector") -> "Vector":
        return Vector(*(a - b for a, b in zip(self, other)))

    def __mul__(self, scalar: float) -> "Vector":
        return Vector(*(x * scalar for x in self))

    def __rmul__(self, scalar: float) -> "Vector":
        return self * scalar

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self._components == other._components

    def __hash__(self) -> int:
        return hash(self._components)

# 测试
v1, v2 = Vector(1, 2, 3), Vector(4, 5, 6)
print(v1 + v2)    # Vector(5, 7, 9)
print(v1 * 3)     # Vector(3, 6, 9)
print(3 * v1)     # Vector(3, 6, 9)
print({v1, v1})   # {Vector(1, 2, 3)}
```
</details>

---

## 练习 2：惰性属性描述器

**难度**: ⭐⭐⭐ | **章节**: Ch02 描述器

实现一个 `lazy_property` 描述器，类似 `functools.cached_property`：
- 首次访问时计算值
- 后续访问直接返回缓存值
- 支持删除缓存（`del obj.prop` 后重新计算）

```python
class Circle:
    def __init__(self, radius: float) -> None:
        self.radius = radius

    @lazy_property
    def area(self) -> float:
        print("计算面积...")
        return 3.14159 * self.radius ** 2
```

<details>
<summary>💡 提示</summary>

- 实现 `__set_name__`, `__get__`, `__delete__`
- 用实例的 `__dict__` 缓存计算结果
</details>

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Any, Callable, TypeVar

T = TypeVar("T")

class lazy_property:
    def __init__(self, func: Callable[..., T]) -> None:
        self.func = func
        self.attr_name = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.attr_name = name

    def __get__(self, obj: Any, objtype: type | None = None) -> T:
        if obj is None:
            return self  # type: ignore
        if self.attr_name not in obj.__dict__:
            obj.__dict__[self.attr_name] = self.func(obj)
        return obj.__dict__[self.attr_name]

    def __delete__(self, obj: Any) -> None:
        obj.__dict__.pop(self.attr_name, None)

class Circle:
    def __init__(self, radius: float) -> None:
        self.radius = radius

    @lazy_property
    def area(self) -> float:
        print("计算面积...")
        return 3.14159 * self.radius ** 2

c = Circle(5)
print(c.area)    # 计算面积... → 78.53975
print(c.area)    # 直接返回缓存，不打印"计算面积..."
del c.area
print(c.area)    # 重新计算
```
</details>

---

## 练习 3：字段验证元类

**难度**: ⭐⭐⭐⭐ | **章节**: Ch03 元类

实现一个元类 `ValidatedMeta`，使得类中带类型注解的字段自动获得验证能力：

```python
class User(metaclass=ValidatedMeta):
    name: str
    age: int
    email: str

user = User(name="Alice", age=30, email="a@b.com")  # ✅
user.age = "thirty"  # ❌ TypeError: age 必须是 int
```

<details>
<summary>💡 提示</summary>

- 在元类的 `__new__` 中读取 `__annotations__`
- 为每个注解字段生成一个验证描述器
- 描述器的 `__set__` 中做类型检查
</details>

<details>
<summary>✅ 参考答案</summary>

```python
class TypedField:
    def __init__(self, name: str, expected_type: type) -> None:
        self.name = name
        self.expected_type = expected_type
        self.storage_name = f"_typed_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.storage_name, None)

    def __set__(self, obj, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name} 必须是 {self.expected_type.__name__}，"
                f"收到 {type(value).__name__}"
            )
        setattr(obj, self.storage_name, value)

class ValidatedMeta(type):
    def __new__(mcs, name, bases, namespace):
        annotations = namespace.get("__annotations__", {})
        for field_name, field_type in annotations.items():
            namespace[field_name] = TypedField(field_name, field_type)

        cls = super().__new__(mcs, name, bases, namespace)

        # 如果没有自定义 __init__，生成一个
        if "__init__" not in namespace:
            def auto_init(self, **kwargs):
                for k, v in kwargs.items():
                    setattr(self, k, v)
            cls.__init__ = auto_init

        return cls

class User(metaclass=ValidatedMeta):
    name: str
    age: int
    email: str

user = User(name="Alice", age=30, email="a@b.com")
print(f"{user.name}, {user.age}")  # Alice, 30

try:
    user.age = "thirty"
except TypeError as e:
    print(f"验证错误: {e}")
```
</details>

---

## 练习 4：线程安全计数器

**难度**: ⭐⭐ | **章节**: Ch04 线程

实现一个线程安全的计数器，支持 `increment()`, `decrement()`, `value` 属性。
用 10 个线程各自 increment 1000 次，验证最终值为 10000。

<details>
<summary>✅ 参考答案</summary>

```python
import threading

class ThreadSafeCounter:
    def __init__(self, initial: int = 0) -> None:
        self._value = initial
        self._lock = threading.Lock()

    def increment(self) -> None:
        with self._lock:
            self._value += 1

    def decrement(self) -> None:
        with self._lock:
            self._value -= 1

    @property
    def value(self) -> int:
        with self._lock:
            return self._value

counter = ThreadSafeCounter()
threads = [
    threading.Thread(target=lambda: [counter.increment() for _ in range(1000)])
    for _ in range(10)
]
for t in threads: t.start()
for t in threads: t.join()
print(f"最终值: {counter.value}")  # 10000
```
</details>

---

## 练习 5：多进程图片处理（模拟）

**难度**: ⭐⭐⭐ | **章节**: Ch05 多进程

用 `multiprocessing.Pool` 模拟图片批量处理：
- 将一个列表的数字视为"图片像素值"
- 对每个数字进行"处理"（平方 + 加权 + 开方）
- 对比单进程与多进程的执行时间

<details>
<summary>✅ 参考答案</summary>

```python
import math
import multiprocessing
import time

def process_pixel(x: float) -> float:
    """模拟 CPU 密集型图片处理"""
    result = x
    for _ in range(100):
        result = math.sqrt(abs(result ** 2 + result * 0.5 + 1))
    return result

def single_process(data: list[float]) -> list[float]:
    return [process_pixel(x) for x in data]

def multi_process(data: list[float], workers: int = 4) -> list[float]:
    with multiprocessing.Pool(workers) as pool:
        return pool.map(process_pixel, data)

if __name__ == "__main__":
    data = list(range(10000))

    start = time.perf_counter()
    single_process(data)
    single_time = time.perf_counter() - start
    print(f"单进程: {single_time:.3f}s")

    start = time.perf_counter()
    multi_process(data)
    multi_time = time.perf_counter() - start
    print(f"多进程: {multi_time:.3f}s")
    print(f"加速比: {single_time / multi_time:.2f}x")
```
</details>

---

## 练习 6：异步批量下载

**难度**: ⭐⭐⭐ | **章节**: Ch06 asyncio

用 `asyncio` 实现一个异步批量下载器：
- 输入 URL 列表
- 并发下载所有 URL（模拟 `asyncio.sleep`）
- 返回下载结果和耗时

<details>
<summary>✅ 参考答案</summary>

```python
import asyncio
import time
import random

async def download(url: str) -> dict[str, str | float]:
    """模拟异步下载"""
    delay = random.uniform(0.1, 0.5)
    await asyncio.sleep(delay)
    return {"url": url, "size": f"{random.randint(100, 9999)} bytes", "time": delay}

async def batch_download(urls: list[str]) -> list[dict]:
    start = time.perf_counter()
    tasks = [download(url) for url in urls]
    results = await asyncio.gather(*tasks)
    elapsed = time.perf_counter() - start
    print(f"总耗时: {elapsed:.3f}s (顺序下载预计: {sum(r['time'] for r in results):.3f}s)")
    return list(results)

urls = [f"https://example.com/file{i}" for i in range(10)]
results = asyncio.run(batch_download(urls))
for r in results:
    print(f"  {r['url']} → {r['size']}")
```
</details>

---

## 练习 7：函数管道

**难度**: ⭐⭐ | **章节**: Ch07 函数式编程

实现一个 `pipe` 函数，支持将多个函数串联成管道：

```python
pipeline = pipe(
    lambda x: x * 2,
    lambda x: x + 10,
    lambda x: f"结果: {x}",
)
print(pipeline(5))  # "结果: 20"
```

<details>
<summary>✅ 参考答案</summary>

```python
from functools import reduce
from typing import Any, Callable

def pipe(*functions: Callable) -> Callable:
    """函数管道：从左到右依次执行"""
    def pipeline(value: Any) -> Any:
        return reduce(lambda acc, f: f(acc), functions, value)
    return pipeline

# 也可以用 compose（从右到左）
def compose(*functions: Callable) -> Callable:
    """函数组合：从右到左依次执行"""
    return pipe(*reversed(functions))

pipeline = pipe(
    lambda x: x * 2,
    lambda x: x + 10,
    str.upper if False else lambda x: f"结果: {x}",
)
print(pipeline(5))   # "结果: 20"
print(pipeline(100)) # "结果: 210"
```
</details>

---

## 练习 8：插件注册系统

**难度**: ⭐⭐ | **章节**: Ch08 设计模式

实现一个装饰器式的插件注册系统：

```python
@register_plugin("csv")
class CSVExporter:
    def export(self, data): ...

@register_plugin("json")
class JSONExporter:
    def export(self, data): ...

exporter = get_plugin("csv")
```

<details>
<summary>✅ 参考答案</summary>

```python
_registry: dict[str, type] = {}

def register_plugin(name: str):
    def decorator(cls: type) -> type:
        _registry[name] = cls
        print(f"注册插件: {name} → {cls.__name__}")
        return cls
    return decorator

def get_plugin(name: str):
    cls = _registry.get(name)
    if cls is None:
        raise KeyError(f"插件不存在: {name}")
    return cls()

def list_plugins() -> list[str]:
    return list(_registry.keys())

@register_plugin("csv")
class CSVExporter:
    def export(self, data: list) -> str:
        return ",".join(str(x) for x in data)

@register_plugin("json")
class JSONExporter:
    def export(self, data: list) -> str:
        import json
        return json.dumps(data)

print(list_plugins())
print(get_plugin("csv").export([1, 2, 3]))
print(get_plugin("json").export([1, 2, 3]))
```
</details>

---

## 练习 9：性能对比测试

**难度**: ⭐⭐ | **章节**: Ch09 性能

编写一个性能对比脚本，对比以下操作：
- `list` vs `set` 的成员查找
- `+` vs `join` 的字符串拼接
- `for` 循环 vs 列表推导 vs `map`

要求用 `timeit` 模块，至少运行 1000 次取平均。

<details>
<summary>✅ 参考答案</summary>

```python
import timeit

def benchmark(name: str, stmt: str, setup: str = "", number: int = 1000):
    t = timeit.timeit(stmt, setup=setup, number=number)
    print(f"  {name:<35} {t:.4f}s ({number} 次)")
    return t

print("1. 查找性能")
setup = "data_list = list(range(10000)); data_set = set(data_list)"
benchmark("list 查找", "9999 in data_list", setup)
benchmark("set 查找", "9999 in data_set", setup)

print("\n2. 字符串拼接")
benchmark("+ 拼接", "s=''\nfor i in range(1000): s+=str(i)", number=100)
benchmark("join", "''.join(str(i) for i in range(1000))", number=100)

print("\n3. 循环方式")
setup = "data = list(range(10000))"
benchmark("for 循环", "r=[]\nfor x in data: r.append(x**2)", setup)
benchmark("列表推导", "[x**2 for x in data]", setup)
benchmark("map", "list(map(lambda x: x**2, data))", setup)
```
</details>

---

## 练习 10：TCP 聊天服务器

**难度**: ⭐⭐⭐ | **章节**: Ch10 网络

实现一个多用户 TCP 聊天服务器：
- 支持多个客户端同时连接
- 一个客户端发送的消息广播给所有其他客户端
- 客户端连接/断开时通知其他人

<details>
<summary>💡 提示</summary>

用 `threading` 为每个客户端创建一个线程，维护一个全局客户端列表。
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import socket
import threading
import logging

logger = logging.getLogger(__name__)
clients: dict[socket.socket, str] = {}
lock = threading.Lock()

def broadcast(message: str, sender: socket.socket | None = None) -> None:
    with lock:
        for client in list(clients):
            if client != sender:
                try:
                    client.sendall(message.encode())
                except OSError:
                    del clients[client]

def handle_client(conn: socket.socket, addr: tuple) -> None:
    username = conn.recv(1024).decode().strip()
    with lock:
        clients[conn] = username
    broadcast(f"[系统] {username} 加入了聊天室")
    logger.info("%s 加入", username)

    try:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            message = f"[{username}] {data.decode()}"
            broadcast(message, sender=conn)
    except OSError:
        pass
    finally:
        with lock:
            if conn in clients:
                del clients[conn]
        broadcast(f"[系统] {username} 离开了聊天室")
        conn.close()

def start_chat_server(host: str = "127.0.0.1", port: int = 8888) -> None:
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(10)
    print(f"聊天服务器启动: {host}:{port}")

    while True:
        conn, addr = server.accept()
        threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
```
</details>

---

## 练习 11：可迭代区间类

**难度**: ⭐⭐ | **章节**: Ch01 数据模型

实现 `Range` 类，支持 `for` 循环、`len()`、`in` 操作符、`reversed()`。

```python
r = Range(1, 10, 2)
print(list(r))        # [1, 3, 5, 7, 9]
print(5 in r)         # True
print(len(r))         # 5
```

<details>
<summary>✅ 参考答案</summary>

```python
import math
from typing import Iterator

class Range:
    def __init__(self, start: int, stop: int, step: int = 1) -> None:
        self.start = start
        self.stop = stop
        self.step = step

    def __len__(self) -> int:
        return max(0, math.ceil((self.stop - self.start) / self.step))

    def __iter__(self) -> Iterator[int]:
        current = self.start
        while (self.step > 0 and current < self.stop) or \
              (self.step < 0 and current > self.stop):
            yield current
            current += self.step

    def __reversed__(self) -> Iterator[int]:
        n = len(self)
        last = self.start + (n - 1) * self.step
        current = last
        while (self.step > 0 and current >= self.start) or \
              (self.step < 0 and current <= self.start):
            yield current
            current -= self.step

    def __contains__(self, value: object) -> bool:
        if not isinstance(value, (int, float)):
            return False
        if self.step > 0 and not (self.start <= value < self.stop):
            return False
        if self.step < 0 and not (self.stop < value <= self.start):
            return False
        return (value - self.start) % self.step == 0

    def __repr__(self) -> str:
        return f"Range({self.start}, {self.stop}, {self.step})"

r = Range(1, 10, 2)
print(list(r))           # [1, 3, 5, 7, 9]
print(5 in r)            # True
print(len(r))            # 5
print(list(reversed(r))) # [9, 7, 5, 3, 1]
```
</details>

---

## 练习 12：类型检查描述器

**难度**: ⭐⭐⭐ | **章节**: Ch02 描述器

实现一个 `Typed` 描述器，支持：
- 类型检查
- 可选的值范围验证
- 可选的自定义验证器

```python
class Config:
    port = Typed(int, min_val=1, max_val=65535)
    host = Typed(str)
    debug = Typed(bool)
```

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Any, Callable

class Typed:
    def __init__(
        self,
        expected_type: type,
        min_val: Any = None,
        max_val: Any = None,
        validator: Callable[[Any], bool] | None = None,
    ) -> None:
        self.expected_type = expected_type
        self.min_val = min_val
        self.max_val = max_val
        self.validator = validator
        self.name = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.name = name

    def __get__(self, obj: Any, objtype: type | None = None) -> Any:
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj: Any, value: Any) -> None:
        if not isinstance(value, self.expected_type):
            raise TypeError(f"{self.name}: 期望 {self.expected_type.__name__}，收到 {type(value).__name__}")
        if self.min_val is not None and value < self.min_val:
            raise ValueError(f"{self.name}: 最小值 {self.min_val}，收到 {value}")
        if self.max_val is not None and value > self.max_val:
            raise ValueError(f"{self.name}: 最大值 {self.max_val}，收到 {value}")
        if self.validator and not self.validator(value):
            raise ValueError(f"{self.name}: 自定义验证失败")
        obj.__dict__[self.name] = value

class Config:
    port = Typed(int, min_val=1, max_val=65535)
    host = Typed(str)
    debug = Typed(bool)

cfg = Config()
cfg.port = 8080
cfg.host = "localhost"
cfg.debug = True
print(f"{cfg.host}:{cfg.port} (debug={cfg.debug})")
```
</details>

---

## 练习 13：ORM 基础框架

**难度**: ⭐⭐⭐⭐ | **章节**: Ch03 元类

用元类实现一个迷你 ORM 框架：

```python
class User(Model):
    __table__ = "users"
    id = IntegerField(primary_key=True)
    name = StringField(max_length=50)
    email = StringField(max_length=100)

# user.save() → INSERT INTO users (id, name, email) VALUES (?, ?, ?)
```

<details>
<summary>✅ 参考答案</summary>

```python
class Field:
    def __init__(self, column_type: str, primary_key: bool = False, **kwargs):
        self.column_type = column_type
        self.primary_key = primary_key
        self.name = ""
        self.kwargs = kwargs
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class IntegerField(Field):
    def __init__(self, **kwargs):
        super().__init__("INTEGER", **kwargs)

class StringField(Field):
    def __init__(self, max_length: int = 255, **kwargs):
        super().__init__(f"VARCHAR({max_length})", **kwargs)

class ModelMeta(type):
    def __new__(mcs, name, bases, namespace):
        if name == "Model":
            return super().__new__(mcs, name, bases, namespace)
        fields = {}
        for k, v in namespace.items():
            if isinstance(v, Field):
                fields[k] = v
        namespace["_fields"] = fields
        namespace["_table"] = namespace.get("__table__", name.lower())
        return super().__new__(mcs, name, bases, namespace)

class Model(metaclass=ModelMeta):
    def save(self) -> str:
        fields = list(self._fields.keys())
        values = [repr(getattr(self, f)) for f in fields]
        sql = f"INSERT INTO {self._table} ({', '.join(fields)}) VALUES ({', '.join(values)})"
        print(f"SQL: {sql}")
        return sql

class User(Model):
    __table__ = "users"
    id = IntegerField(primary_key=True)
    name = StringField(max_length=50)
    email = StringField(max_length=100)

u = User()
u.id = 1
u.name = "Alice"
u.email = "alice@example.com"
u.save()
```
</details>

---

## 练习 14：生产者-消费者

**难度**: ⭐⭐⭐ | **章节**: Ch04 线程

用 `threading` + `queue.Queue` 实现生产者-消费者模式：
- 3 个生产者，每个生产 10 个任务
- 2 个消费者处理任务
- 使用毒丸信号（sentinel）优雅退出

<details>
<summary>✅ 参考答案</summary>

```python
import queue
import threading
import time
import random

SENTINEL = None

def producer(q: queue.Queue, producer_id: int) -> None:
    for i in range(10):
        item = f"P{producer_id}-Task{i}"
        q.put(item)
        time.sleep(random.uniform(0.01, 0.05))
    print(f"  生产者 {producer_id} 完成")

def consumer(q: queue.Queue, consumer_id: int) -> None:
    count = 0
    while True:
        item = q.get()
        if item is SENTINEL:
            q.task_done()
            break
        time.sleep(random.uniform(0.01, 0.03))
        count += 1
        q.task_done()
    print(f"  消费者 {consumer_id} 处理了 {count} 个任务")

q: queue.Queue = queue.Queue()
producers = [threading.Thread(target=producer, args=(q, i)) for i in range(3)]
consumers = [threading.Thread(target=consumer, args=(q, i)) for i in range(2)]

for t in producers + consumers: t.start()
for t in producers: t.join()

# 发送毒丸
for _ in consumers:
    q.put(SENTINEL)

for t in consumers: t.join()
print("所有任务完成")
```
</details>

---

## 练习 15：MapReduce 模拟

**难度**: ⭐⭐⭐ | **章节**: Ch05 多进程

用 `multiprocessing` 实现一个简单的词频统计 MapReduce：
- Map 阶段：多个进程各自统计文本块的词频
- Reduce 阶段：合并所有结果

<details>
<summary>✅ 参考答案</summary>

```python
from collections import Counter
from multiprocessing import Pool

def map_func(text: str) -> Counter:
    """Map: 统计单个文本块的词频"""
    words = text.lower().split()
    return Counter(words)

def reduce_func(counters: list[Counter]) -> Counter:
    """Reduce: 合并所有词频"""
    total = Counter()
    for c in counters:
        total += c
    return total

if __name__ == "__main__":
    texts = [
        "hello world hello python",
        "python is great python is fun",
        "hello from the other side",
        "python world hello world",
    ]

    with Pool(2) as pool:
        mapped = pool.map(map_func, texts)

    result = reduce_func(mapped)
    for word, count in result.most_common(5):
        print(f"  {word}: {count}")
```
</details>

---

## 练习 16：异步信号量限流

**难度**: ⭐⭐ | **章节**: Ch06 asyncio

用 `asyncio.Semaphore` 实现并发限流：同时最多 3 个任务在执行。

<details>
<summary>✅ 参考答案</summary>

```python
import asyncio
import time

async def limited_task(sem: asyncio.Semaphore, task_id: int) -> str:
    async with sem:
        print(f"  任务 {task_id} 开始 (t={time.perf_counter():.2f})")
        await asyncio.sleep(1)
        print(f"  任务 {task_id} 完成")
        return f"result-{task_id}"

async def main():
    sem = asyncio.Semaphore(3)  # 最多 3 个并发
    tasks = [limited_task(sem, i) for i in range(10)]
    results = await asyncio.gather(*tasks)
    print(f"  共完成: {len(results)} 个任务")

asyncio.run(main())
```
</details>

---

## 练习 17：函数缓存装饰器

**难度**: ⭐⭐⭐ | **章节**: Ch07 函数式编程

实现一个带 TTL（过期时间）的缓存装饰器：

```python
@ttl_cache(seconds=5)
def expensive_api_call(endpoint: str) -> dict:
    ...
```

<details>
<summary>✅ 参考答案</summary>

```python
import functools
import time
from typing import Any, Callable

def ttl_cache(seconds: float = 60):
    def decorator(func: Callable) -> Callable:
        cache: dict[str, tuple[float, Any]] = {}

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = f"{args}_{kwargs}"
            now = time.time()
            if key in cache:
                timestamp, value = cache[key]
                if now - timestamp < seconds:
                    print(f"  缓存命中: {func.__name__}")
                    return value
            result = func(*args, **kwargs)
            cache[key] = (now, result)
            return result

        wrapper.cache_clear = lambda: cache.clear()
        return wrapper
    return decorator

@ttl_cache(seconds=2)
def slow_function(x: int) -> int:
    print(f"  计算中... x={x}")
    return x ** 2

print(slow_function(5))  # 计算
print(slow_function(5))  # 缓存
time.sleep(3)
print(slow_function(5))  # 过期，重新计算
```
</details>

---

## 练习 18：观察者事件系统

**难度**: ⭐⭐⭐ | **章节**: Ch08 设计模式

实现一个类型安全的事件系统，支持：
- 事件注册（装饰器风格）
- 事件触发
- 异步事件处理器

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Any, Callable
import asyncio

class EventSystem:
    def __init__(self) -> None:
        self._handlers: dict[str, list[Callable]] = {}

    def on(self, event: str) -> Callable:
        """装饰器风格注册"""
        def decorator(func: Callable) -> Callable:
            self._handlers.setdefault(event, []).append(func)
            return func
        return decorator

    def emit(self, event: str, **kwargs: Any) -> None:
        for handler in self._handlers.get(event, []):
            handler(**kwargs)

    async def emit_async(self, event: str, **kwargs: Any) -> None:
        for handler in self._handlers.get(event, []):
            if asyncio.iscoroutinefunction(handler):
                await handler(**kwargs)
            else:
                handler(**kwargs)

events = EventSystem()

@events.on("user.created")
def log_user(name: str, **kw: Any) -> None:
    print(f"  [日志] 用户创建: {name}")

@events.on("user.created")
def welcome_user(name: str, email: str = "", **kw: Any) -> None:
    print(f"  [通知] 欢迎 {name} ({email})")

events.emit("user.created", name="Alice", email="alice@example.com")
```
</details>

---

## 练习 19：内存泄漏检测

**难度**: ⭐⭐⭐ | **章节**: Ch09 性能

用 `tracemalloc` 编写一个内存泄漏检测工具：
- 记录初始内存快照
- 执行一系列操作
- 对比快照找到内存增长点

<details>
<summary>✅ 参考答案</summary>

```python
import tracemalloc

def detect_leak():
    tracemalloc.start()
    snapshot1 = tracemalloc.take_snapshot()

    # 模拟内存泄漏
    leaked = []
    for i in range(10000):
        leaked.append(" " * 1000)

    snapshot2 = tracemalloc.take_snapshot()
    stats = snapshot2.compare_to(snapshot1, "lineno")

    print("内存增长 Top 5:")
    for stat in stats[:5]:
        print(f"  {stat}")

    tracemalloc.stop()

detect_leak()
```
</details>

---

## 练习 20：HTTP API 客户端

**难度**: ⭐⭐⭐ | **章节**: Ch10 网络

实现一个通用的 REST API 客户端类：
- 支持 GET/POST/PUT/DELETE
- 自动 JSON 序列化/反序列化
- 重试机制
- 超时设置

<details>
<summary>✅ 参考答案</summary>

```python
import json
import time
import logging
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from typing import Any

logger = logging.getLogger(__name__)

class APIClient:
    def __init__(self, base_url: str, timeout: float = 10, retries: int = 3) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.retries = retries
        self.headers: dict[str, str] = {"Content-Type": "application/json"}

    def _request(self, method: str, path: str, data: Any = None) -> dict:
        url = f"{self.base_url}{path}"
        body = json.dumps(data).encode() if data else None
        req = Request(url, data=body, method=method)
        for k, v in self.headers.items():
            req.add_header(k, v)

        for attempt in range(1, self.retries + 1):
            try:
                with urlopen(req, timeout=self.timeout) as resp:
                    return json.loads(resp.read().decode())
            except (HTTPError, URLError, TimeoutError) as e:
                logger.warning("Attempt %d failed: %s", attempt, e)
                if attempt < self.retries:
                    time.sleep(0.5 * attempt)
                else:
                    raise

    def get(self, path: str) -> dict:
        return self._request("GET", path)

    def post(self, path: str, data: Any) -> dict:
        return self._request("POST", path, data)

client = APIClient("https://httpbin.org")
print(client.get("/get"))
```
</details>

---

## 练习 21：上下文管理器栈

**难度**: ⭐⭐ | **章节**: Ch01 数据模型

实现一个 `ResourceStack` 上下文管理器，能管理多个资源的获取和释放：

```python
with ResourceStack() as stack:
    db = stack.enter("database", connect_db)
    cache = stack.enter("cache", connect_cache)
    # 退出时按逆序释放：先 cache，后 db
```

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Any, Callable

class ResourceStack:
    def __init__(self) -> None:
        self._resources: list[tuple[str, Any]] = []
        self._cleanup: list[Callable] = []

    def __enter__(self) -> "ResourceStack":
        return self

    def enter(self, name: str, acquire: Callable, cleanup: Callable | None = None) -> Any:
        resource = acquire()
        self._resources.append((name, resource))
        if cleanup:
            self._cleanup.append(lambda: cleanup(resource))
        print(f"  获取资源: {name}")
        return resource

    def __exit__(self, *exc_info) -> bool:
        # 逆序释放
        for name, _ in reversed(self._resources):
            print(f"  释放资源: {name}")
        for cleanup in reversed(self._cleanup):
            cleanup()
        return False

with ResourceStack() as stack:
    db = stack.enter("database", lambda: "db_conn")
    cache = stack.enter("cache", lambda: "cache_conn")
    queue = stack.enter("queue", lambda: "queue_conn")
    print(f"  使用资源: {db}, {cache}, {queue}")
```
</details>

---

## 练习 22：状态机引擎

**难度**: ⭐⭐⭐ | **章节**: Ch08 设计模式

实现一个通用的状态机引擎，支持：
- 定义状态和转换
- 进入/离开状态的钩子
- 无效转换检测

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Any, Callable

class StateMachine:
    def __init__(self, initial: str) -> None:
        self._state = initial
        self._transitions: dict[tuple[str, str], str] = {}
        self._hooks: dict[str, list[Callable]] = {}

    def add_transition(self, from_state: str, action: str, to_state: str) -> None:
        self._transitions[(from_state, action)] = to_state

    def on_enter(self, state: str, hook: Callable) -> None:
        self._hooks.setdefault(f"enter_{state}", []).append(hook)

    def on_exit(self, state: str, hook: Callable) -> None:
        self._hooks.setdefault(f"exit_{state}", []).append(hook)

    @property
    def state(self) -> str:
        return self._state

    def trigger(self, action: str) -> None:
        key = (self._state, action)
        if key not in self._transitions:
            raise ValueError(f"无效转换: {self._state} --{action}-->")
        new_state = self._transitions[key]
        for hook in self._hooks.get(f"exit_{self._state}", []):
            hook(self._state, action)
        old = self._state
        self._state = new_state
        for hook in self._hooks.get(f"enter_{new_state}", []):
            hook(new_state, action)
        print(f"  {old} --{action}--> {new_state}")

sm = StateMachine("idle")
sm.add_transition("idle", "start", "running")
sm.add_transition("running", "pause", "paused")
sm.add_transition("paused", "resume", "running")
sm.add_transition("running", "stop", "idle")
sm.on_enter("running", lambda s, a: print(f"    进入运行状态"))
sm.trigger("start")
sm.trigger("pause")
sm.trigger("resume")
sm.trigger("stop")
```
</details>

---

## 练习 23：异步生产者消费者

**难度**: ⭐⭐⭐ | **章节**: Ch06 asyncio

用 `asyncio.Queue` 实现异步版的生产者-消费者：

<details>
<summary>✅ 参考答案</summary>

```python
import asyncio
import random

async def producer(queue: asyncio.Queue, pid: int, count: int) -> None:
    for i in range(count):
        item = f"P{pid}-item{i}"
        await queue.put(item)
        await asyncio.sleep(random.uniform(0.01, 0.05))
    print(f"  生产者 {pid} 完成")

async def consumer(queue: asyncio.Queue, cid: int) -> None:
    processed = 0
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        await asyncio.sleep(random.uniform(0.01, 0.03))
        processed += 1
        queue.task_done()
    print(f"  消费者 {cid} 处理了 {processed} 个")

async def main():
    queue: asyncio.Queue = asyncio.Queue(maxsize=10)
    producers = [asyncio.create_task(producer(queue, i, 10)) for i in range(3)]
    consumers = [asyncio.create_task(consumer(queue, i)) for i in range(2)]

    await asyncio.gather(*producers)
    for _ in consumers:
        await queue.put(None)
    await asyncio.gather(*consumers)

asyncio.run(main())
```
</details>

---

## 练习 24：数据结构基准套件

**难度**: ⭐⭐ | **章节**: Ch09 性能

编写一个完整的数据结构基准测试套件，对比 `list`, `tuple`, `set`, `dict`, `deque` 在不同操作下的性能。

<details>
<summary>✅ 参考答案</summary>

```python
import timeit
from collections import deque

def bench(name: str, stmt: str, setup: str, number: int = 5000) -> float:
    t = timeit.timeit(stmt, setup, number=number)
    print(f"  {name:<40} {t:.4f}s")
    return t

N = 10000
setup = f"""
from collections import deque
data_list = list(range({N}))
data_tuple = tuple(range({N}))
data_set = set(range({N}))
data_dict = dict.fromkeys(range({N}))
data_deque = deque(range({N}))
"""

print("1. 成员查找 (查找最后一个元素)")
bench("list", f"{N-1} in data_list", setup)
bench("tuple", f"{N-1} in data_tuple", setup)
bench("set", f"{N-1} in data_set", setup)
bench("dict", f"{N-1} in data_dict", setup)

print("\n2. 迭代")
bench("list", "for x in data_list: pass", setup)
bench("tuple", "for x in data_tuple: pass", setup)
bench("set", "for x in data_set: pass", setup)
bench("deque", "for x in data_deque: pass", setup)

print("\n3. 索引访问 (随机)")
bench("list[i]", f"data_list[{N//2}]", setup, number=100000)
bench("tuple[i]", f"data_tuple[{N//2}]", setup, number=100000)
```
</details>

---

## 练习 25：迷你 RPC 框架

**难度**: ⭐⭐⭐⭐ | **章节**: Ch10 网络 + Ch06 asyncio

实现一个基于 TCP + JSON 的迷你 RPC 框架：
- 服务端注册函数
- 客户端远程调用
- 支持参数传递和返回值

<details>
<summary>💡 提示</summary>

协议：`{"method": "add", "params": [1, 2], "id": 1}` → `{"result": 3, "id": 1}`
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import json
import socket
import threading
import logging
from typing import Any, Callable

logger = logging.getLogger(__name__)

class RPCServer:
    def __init__(self, host: str = "127.0.0.1", port: int = 0) -> None:
        self._methods: dict[str, Callable] = {}
        self._server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._server.bind((host, port))
        self.port = self._server.getsockname()[1]

    def register(self, func: Callable) -> Callable:
        self._methods[func.__name__] = func
        return func

    def _handle(self, conn: socket.socket) -> None:
        with conn:
            data = conn.recv(4096).decode()
            request = json.loads(data)
            method = request["method"]
            params = request.get("params", [])
            req_id = request.get("id", 0)

            if method in self._methods:
                try:
                    result = self._methods[method](*params)
                    response = {"result": result, "error": None, "id": req_id}
                except Exception as e:
                    response = {"result": None, "error": str(e), "id": req_id}
            else:
                response = {"result": None, "error": f"方法不存在: {method}", "id": req_id}

            conn.sendall(json.dumps(response).encode())

    def serve(self) -> None:
        self._server.listen(5)
        self._server.settimeout(5.0)
        try:
            while True:
                conn, _ = self._server.accept()
                threading.Thread(target=self._handle, args=(conn,), daemon=True).start()
        except socket.timeout:
            pass

class RPCClient:
    def __init__(self, host: str, port: int) -> None:
        self.host = host
        self.port = port
        self._id = 0

    def call(self, method: str, *params: Any) -> Any:
        self._id += 1
        request = {"method": method, "params": list(params), "id": self._id}
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.connect((self.host, self.port))
            sock.sendall(json.dumps(request).encode())
            data = sock.recv(4096).decode()
        response = json.loads(data)
        if response.get("error"):
            raise RuntimeError(response["error"])
        return response["result"]

# 使用
server = RPCServer()

@server.register
def add(a: int, b: int) -> int:
    return a + b

@server.register
def greet(name: str) -> str:
    return f"Hello, {name}!"

t = threading.Thread(target=server.serve, daemon=True)
t.start()

import time; time.sleep(0.1)
client = RPCClient("127.0.0.1", server.port)
print(f"add(3, 5) = {client.call('add', 3, 5)}")
print(f"greet('Python') = {client.call('greet', 'Python')}")
```
</details>

---

## 完成度检查

完成所有练习后，你应该能够：

| 能力 | 验证方式 |
|:---|:---|
| 数据模型 | 能自定义实现容器、数值、可迭代协议 |
| 描述器 | 能写出惰性加载、类型验证描述器 |
| 元类 | 能用元类实现 ORM 框架 |
| 多线程 | 能正确使用锁和队列 |
| 多进程 | 能用 Pool 实现 CPU 密集型并行 |
| asyncio | 能写出并发限流的异步程序 |
| 函数式 | 能实现管道、缓存等函数式工具 |
| 设计模式 | 能用 Pythonic 方式实现常见模式 |
| 性能优化 | 能用 profiler 定位瓶颈并优化 |
| 网络编程 | 能实现 TCP 服务器和 HTTP 客户端 |

---

[🏠 返回目录](../README.md) | [➡️ 项目实战](../projects/async-crawler/README.md)
