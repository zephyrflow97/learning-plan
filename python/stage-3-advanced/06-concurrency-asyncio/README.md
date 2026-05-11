# 第 6 章：asyncio — 异步编程

> *"The way to do really big things is to do really small things and grow them bigger."*
> — Ward Cunningham
>
> 一个线程，一个事件循环，成千上万的并发连接。
> `asyncio` 不是让你的代码更快，而是让你的代码在等待时不浪费时间。
> 这是现代 Python 后端开发的基石。

---

## 📖 本章内容

- [1. 事件循环核心概念](#1-事件循环核心概念)
- [2. async/await 语法](#2-asyncawait-语法)
- [3. 协程、任务、Future](#3-协程任务future)
- [4. 并发执行](#4-并发执行)
- [5. 异步迭代器与异步生成器](#5-异步迭代器与异步生成器)
- [6. 异步上下文管理器](#6-异步上下文管理器)
- [7. aiohttp/httpx 实战](#7-aiohttphttpx-实战)
- [8. 结构化并发（Python 3.11+ TaskGroup）](#8-结构化并发python-311-taskgroup)
- [9. asyncio vs threading vs multiprocessing 总结](#9-asyncio-vs-threading-vs-multiprocessing-总结)
- [最佳实践 / 常见陷阱](#最佳实践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. 事件循环核心概念

> 🎭 **The Drama: 单线程如何处理一万个连接？**
>
> 想象你是一个餐厅唯一的服务员。传统多线程方式是克隆自己——
> 一个克隆体服务一桌客人。但克隆有成本（线程开销），100桌就要100个克隆体。
>
> 事件循环的方式是：你一个人，但你不在任何一桌干等。
> 你给A桌点完菜，去B桌送饮料，C桌还没看完菜单你就先去D桌。
> 当厨房做好A桌的菜（I/O 完成），你再回去送。
>
> 这就是 `asyncio`：一个服务员（线程），通过不停切换（事件循环），
> 服务成百上千桌客人（并发连接）。

### 1.1 事件循环的工作原理

```
┌──────────────────────────────────────────────────────────────────┐
│                    asyncio 事件循环                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐            │
│  │                事件循环 (Event Loop)                │            │
│  │                                                    │            │
│  │  1. 检查就绪的回调/协程                             │            │
│  │  2. 执行就绪的协程直到下一个 await                   │            │
│  │  3. 注册新的 I/O 等待                               │            │
│  │  4. 回到步骤 1                                      │            │
│  │                                                    │            │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐           │            │
│  │  │ Task A  │  │ Task B  │  │ Task C  │           │            │
│  │  │ WAITING │  │ RUNNING │  │ WAITING │           │            │
│  │  │ (I/O)   │  │ (exec)  │  │ (I/O)   │           │            │
│  │  └────┬────┘  └────┬────┘  └────┬────┘           │            │
│  │       │            │            │                  │            │
│  │       ▼            ▼            ▼                  │            │
│  │   等待网络     执行代码      等待数据库              │            │
│  │                                                    │            │
│  └──────────────────────────────────────────────────┘            │
│                                                                  │
│  关键：await 是"让出控制权"，不是"等待"                            │
│  当协程 await 时，事件循环去执行其他就绪的协程                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 同步 vs 异步执行对比

```
同步执行（阻塞）：
┌──────┐  ┌──────┐  ┌──────┐
│ 请求A │  │ 请求B │  │ 请求C │
│██░░██│  │      │  │      │
│      │  │██░░██│  │      │
│      │  │      │  │██░░██│
└──────┘  └──────┘  └──────┘
总时间: 3x                     ██ = CPU  ░░ = 等待 I/O

异步执行（非阻塞）：
┌──────────────────────────┐
│ 请求A: ██░░░░░░██         │
│ 请求B:   ██░░░░░░██       │
│ 请求C:     ██░░░░░░██     │
└──────────────────────────┘
总时间: ~1x（I/O 等待重叠）
```

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


# ❌ 同步版本：串行执行
def sync_fetch(url: str) -> str:
    logger.info("开始请求 %s", url)
    time.sleep(1)  # 模拟网络 I/O
    logger.info("完成请求 %s", url)
    return f"Response from {url}"


def sync_main() -> None:
    start = time.perf_counter()
    for i in range(5):
        sync_fetch(f"https://api.example.com/{i}")
    logger.info("同步总耗时: %.2f 秒", time.perf_counter() - start)


# ✅ 异步版本：并发执行
async def async_fetch(url: str) -> str:
    logger.info("开始请求 %s", url)
    await asyncio.sleep(1)  # 非阻塞等待
    logger.info("完成请求 %s", url)
    return f"Response from {url}"


async def async_main() -> None:
    start = time.perf_counter()
    tasks = [async_fetch(f"https://api.example.com/{i}") for i in range(5)]
    await asyncio.gather(*tasks)
    logger.info("异步总耗时: %.2f 秒", time.perf_counter() - start)


# 运行
sync_main()      # ~5 秒
asyncio.run(async_main())  # ~1 秒
```

---

## 2. async/await 语法

> 🧠 **CS Master's Bridge: 从回调到协程的演进**
>
> 异步编程经历了三代演进：
> 1. **回调 (Callback)** — Node.js 早期、Python Twisted → 回调地狱
> 2. **Promise/Future** — ES6 Promise、Python `asyncio.Future` → 链式调用
> 3. **async/await** — ES2017、Python 3.5+ → 像同步代码一样写异步
>
> Python 的 `async/await` 建立在生成器协议之上（`yield from` → `await`），
> 但从 3.5 开始有了原生语法支持。

### 2.1 定义协程函数

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# ✅ async def 定义协程函数
async def greet(name: str) -> str:
    logger.info("准备问候 %s...", name)
    await asyncio.sleep(0.5)  # 让出控制权
    message = f"Hello, {name}!"
    logger.info(message)
    return message


# 协程函数的调用返回一个协程对象
coro = greet("World")
logger.info("类型: %s", type(coro))  # <class 'coroutine'>

# ❌ 直接调用不会执行协程体！
# greet("World")  # RuntimeWarning: coroutine was never awaited

# ✅ 必须用 await 或 asyncio.run() 执行
result = asyncio.run(greet("World"))
logger.info("结果: %s", result)
```

### 2.2 await 的语义

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def step1() -> str:
    logger.info("Step 1 开始")
    await asyncio.sleep(1)  # 让出控制权 1 秒
    logger.info("Step 1 完成")
    return "result-1"


async def step2(input_data: str) -> str:
    logger.info("Step 2 开始 (输入: %s)", input_data)
    await asyncio.sleep(0.5)
    logger.info("Step 2 完成")
    return f"processed-{input_data}"


async def pipeline() -> str:
    """顺序 await：步骤间有依赖"""
    # ✅ await 像同步代码一样表达顺序依赖
    r1 = await step1()          # 等待 step1 完成
    r2 = await step2(r1)        # 用 step1 的结果作为输入
    return r2


async def main() -> None:
    start = time.perf_counter()
    result = await pipeline()
    logger.info("Pipeline 结果: %s, 耗时: %.2f 秒",
                result, time.perf_counter() - start)

asyncio.run(main())
```

### 2.3 可 await 的对象

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# 三种可以 await 的对象：

# 1. 协程 (Coroutine)
async def my_coroutine() -> str:
    return "from coroutine"

# 2. Task
async def demo_task() -> None:
    task = asyncio.create_task(my_coroutine())
    result = await task
    logger.info("Task 结果: %s", result)

# 3. Future
async def demo_future() -> None:
    loop = asyncio.get_running_loop()
    future = loop.create_future()

    # 在另一个协程中设置 Future 的结果
    async def set_result() -> None:
        await asyncio.sleep(0.5)
        future.set_result("from future")

    asyncio.create_task(set_result())
    result = await future
    logger.info("Future 结果: %s", result)


# 4. 自定义 Awaitable
class MyAwaitable:
    def __init__(self, value: str) -> None:
        self.value = value

    def __await__(self):
        yield  # 让出一次控制权
        return self.value


async def demo_custom_awaitable() -> None:
    result = await MyAwaitable("from custom awaitable")
    logger.info("自定义 Awaitable 结果: %s", result)


async def main() -> None:
    await demo_task()
    await demo_future()
    await demo_custom_awaitable()

asyncio.run(main())
```

---

## 3. 协程、任务、Future

> ⚛️ **The Science: 协程的三种状态**
>
> 协程不是自动并发的——只有被包装为 Task 后才会被事件循环调度。
> `asyncio.create_task()` 就是告诉事件循环："这个协程准备好了，有空就执行它。"

### 3.1 协程 vs 任务

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def slow_operation(name: str, duration: float) -> str:
    logger.info("%s 开始", name)
    await asyncio.sleep(duration)
    logger.info("%s 完成", name)
    return f"{name}-result"


async def demo_coroutine_vs_task() -> None:
    # ❌ 直接 await 协程：串行执行
    start = time.perf_counter()
    r1 = await slow_operation("A", 1.0)  # 等 1 秒
    r2 = await slow_operation("B", 1.0)  # 再等 1 秒
    logger.info("串行: %.2f 秒, 结果: %s, %s",
                time.perf_counter() - start, r1, r2)  # ~2 秒

    # ✅ 创建 Task：并发执行
    start = time.perf_counter()
    task1 = asyncio.create_task(slow_operation("C", 1.0))
    task2 = asyncio.create_task(slow_operation("D", 1.0))
    r3 = await task1
    r4 = await task2
    logger.info("并发: %.2f 秒, 结果: %s, %s",
                time.perf_counter() - start, r3, r4)  # ~1 秒


asyncio.run(demo_coroutine_vs_task())
```

### 3.2 Task 的生命周期

```
┌─────────────────────────────────────────────────────┐
│                 Task 生命周期                         │
│                                                     │
│  create_task()    await/schedule    完成/异常/取消    │
│  ┌─────────┐    ┌──────────┐    ┌───────────┐      │
│  │ PENDING │───▶│ RUNNING  │───▶│ FINISHED  │      │
│  └─────────┘    └─────┬────┘    └───────────┘      │
│                       │                              │
│                       │ await I/O                    │
│                       ▼                              │
│                 ┌──────────┐                         │
│                 │SUSPENDED │                         │
│                 └──────────┘                         │
│                                                     │
│  task.done()      → True/False                      │
│  task.result()    → 结果或抛异常                      │
│  task.cancel()    → 请求取消                         │
│  task.cancelled() → 是否已取消                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.3 Task 的取消

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def long_running_task(name: str) -> str:
    try:
        logger.info("%s: 开始长时间操作...", name)
        await asyncio.sleep(10)
        return f"{name} completed"
    except asyncio.CancelledError:
        logger.warning("%s: 被取消！执行清理...", name)
        # ✅ 可以在这里做清理工作
        raise  # 必须重新抛出 CancelledError


async def main() -> None:
    task = asyncio.create_task(long_running_task("Worker"))

    # 等待 1 秒后取消
    await asyncio.sleep(1)
    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        logger.info("任务已取消: cancelled=%s", task.cancelled())


asyncio.run(main())
```

---

## 4. 并发执行

> 🧰 **Toolbox: gather vs wait vs TaskGroup**
>
> `asyncio` 提供了多种并发执行方式。选择正确的工具决定了
> 你的代码是优雅还是混乱。

### 4.1 asyncio.gather()

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def fetch(url: str, delay: float) -> dict[str, str | int]:
    logger.info("请求: %s", url)
    await asyncio.sleep(delay)
    return {"url": url, "status": 200}


async def demo_gather() -> None:
    start = time.perf_counter()

    # ✅ gather: 并发执行多个协程，按提交顺序返回结果
    results = await asyncio.gather(
        fetch("https://api.example.com/users", 1.0),
        fetch("https://api.example.com/posts", 1.5),
        fetch("https://api.example.com/comments", 0.5),
    )

    for r in results:
        logger.info("结果: %s", r)
    logger.info("总耗时: %.2f 秒 (最长请求 1.5s)", time.perf_counter() - start)


asyncio.run(demo_gather())
```

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


async def may_fail(n: int) -> int:
    if n == 3:
        raise ValueError(f"不能处理 {n}")
    await asyncio.sleep(0.1)
    return n * n


async def demo_gather_errors() -> None:
    # ❌ 默认行为：一个失败，gather 抛异常
    try:
        results = await asyncio.gather(
            may_fail(1), may_fail(2), may_fail(3), may_fail(4)
        )
    except ValueError as e:
        logger.error("gather 抛出异常: %s", e)

    # ✅ return_exceptions=True：异常作为结果返回
    results = await asyncio.gather(
        may_fail(1), may_fail(2), may_fail(3), may_fail(4),
        return_exceptions=True,
    )
    for i, r in enumerate(results):
        if isinstance(r, Exception):
            logger.error("任务 %d 失败: %s", i, r)
        else:
            logger.info("任务 %d 成功: %s", i, r)


asyncio.run(demo_gather_errors())
```

### 4.2 asyncio.wait()

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def task_with_delay(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name} done"


async def demo_wait() -> None:
    tasks = [
        asyncio.create_task(task_with_delay("Fast", 0.5)),
        asyncio.create_task(task_with_delay("Medium", 1.0)),
        asyncio.create_task(task_with_delay("Slow", 2.0)),
    ]

    # ✅ FIRST_COMPLETED: 等待第一个完成
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    for t in done:
        logger.info("第一个完成: %s", t.result())
    logger.info("还有 %d 个任务在运行", len(pending))

    # 等待剩余任务
    done2, _ = await asyncio.wait(pending)
    for t in done2:
        logger.info("后续完成: %s", t.result())


asyncio.run(demo_wait())
```

### 4.3 asyncio.as_completed()

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def download(url: str, delay: float) -> dict[str, str]:
    await asyncio.sleep(delay)
    return {"url": url, "data": f"content of {url}"}


async def demo_as_completed() -> None:
    start = time.perf_counter()

    coros = [
        download("page-1", 2.0),
        download("page-2", 0.5),
        download("page-3", 1.0),
    ]

    # ✅ as_completed: 按完成顺序处理
    for coro in asyncio.as_completed(coros):
        result = await coro
        elapsed = time.perf_counter() - start
        logger.info("[%.1fs] 完成: %s", elapsed, result["url"])


asyncio.run(demo_as_completed())
```

### 并发 API 对比

| API | 返回顺序 | 错误处理 | 取消策略 | 适用场景 |
|:---|:---|:---|:---|:---|
| `gather()` | 提交顺序 | `return_exceptions` | 全部或无 | 等待所有结果 |
| `wait()` | 按完成 / 按条件 | 手动检查 | 灵活 | 需要部分结果 |
| `as_completed()` | 完成顺序 | 逐个处理 | 手动 | 流式处理 |
| `TaskGroup` (3.11+) | — | 自动取消 | 结构化 | 现代推荐 |

---

## 5. 异步迭代器与异步生成器

> 🧠 **CS Master's Bridge: 从同步迭代到异步迭代**
>
> 同步迭代器用 `__iter__` + `__next__`，异步迭代器用 `__aiter__` + `__anext__`。
> 同步生成器用 `yield`，异步生成器用 `async def` + `yield`。
> 模式完全一致，只是加了 `async` 前缀。

### 5.1 异步迭代器

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


class AsyncCountdown:
    """异步倒计时迭代器"""

    def __init__(self, start: int) -> None:
        self.current = start

    def __aiter__(self) -> 'AsyncCountdown':
        return self

    async def __anext__(self) -> int:
        if self.current <= 0:
            raise StopAsyncIteration
        await asyncio.sleep(0.3)  # 模拟异步操作
        self.current -= 1
        return self.current + 1


async def demo_async_iterator() -> None:
    logger.info("异步倒计时:")
    async for num in AsyncCountdown(5):
        logger.info("  %d", num)


asyncio.run(demo_async_iterator())
```

### 5.2 异步生成器

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def async_range(start: int, stop: int, delay: float = 0.2) -> int:
    """异步生成器 — async yield"""
    for i in range(start, stop):
        await asyncio.sleep(delay)
        logger.info("生成: %d", i)
        yield i


async def fetch_pages(base_url: str, pages: int) -> dict[str, str]:
    """模拟异步分页获取"""
    for page in range(1, pages + 1):
        await asyncio.sleep(0.3)  # 模拟网络请求
        data = {"url": f"{base_url}?page={page}", "data": f"Page {page} content"}
        logger.info("获取页面 %d", page)
        yield data


async def demo_async_generator() -> None:
    # ✅ async for 遍历异步生成器
    logger.info("=== 异步 range ===")
    total = 0
    async for num in async_range(1, 6):
        total += num
    logger.info("总和: %d", total)

    # ✅ 异步分页
    logger.info("=== 异步分页 ===")
    async for page in fetch_pages("https://api.example.com/data", 3):
        logger.info("处理: %s", page)

    # ✅ 异步推导式
    logger.info("=== 异步推导式 ===")
    squares = [num * num async for num in async_range(1, 6, 0.1)]
    logger.info("平方数: %s", squares)


asyncio.run(demo_async_generator())
```

---

## 6. 异步上下文管理器

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


class AsyncDatabaseConnection:
    """异步数据库连接 — 展示 async with"""

    def __init__(self, db_url: str) -> None:
        self.db_url = db_url
        self.connected = False

    async def __aenter__(self) -> 'AsyncDatabaseConnection':
        logger.info("连接数据库: %s", self.db_url)
        await asyncio.sleep(0.5)  # 模拟连接耗时
        self.connected = True
        logger.info("数据库已连接")
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> bool:
        logger.info("断开数据库连接")
        await asyncio.sleep(0.1)  # 模拟断开耗时
        self.connected = False
        if exc_type:
            logger.error("发生异常: %s: %s", exc_type.__name__, exc_val)
        return False  # 不吞掉异常

    async def query(self, sql: str) -> list[dict]:
        if not self.connected:
            raise RuntimeError("未连接数据库")
        logger.info("执行查询: %s", sql)
        await asyncio.sleep(0.2)  # 模拟查询
        return [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]


async def demo_async_context_manager() -> None:
    # ✅ async with 管理异步资源
    async with AsyncDatabaseConnection("postgresql://localhost/mydb") as db:
        results = await db.query("SELECT * FROM users")
        logger.info("查询结果: %s", results)
    # 自动断开连接


asyncio.run(demo_async_context_manager())
```

```python
import asyncio
from contextlib import asynccontextmanager
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


# ✅ 使用 @asynccontextmanager 装饰器（更简洁）
@asynccontextmanager
async def async_timer(name: str):
    start = asyncio.get_event_loop().time()
    logger.info("[%s] 开始计时", name)
    try:
        yield
    finally:
        elapsed = asyncio.get_event_loop().time() - start
        logger.info("[%s] 耗时: %.3f 秒", name, elapsed)


async def main() -> None:
    async with async_timer("下载任务"):
        await asyncio.sleep(1.5)
        logger.info("下载完成")


asyncio.run(main())
```

---

## 7. aiohttp/httpx 实战

> 🧰 **Toolbox: 异步 HTTP 客户端选择**
>
> | 库 | 特点 | 适用场景 |
> |:---|:---|:---|
> | `aiohttp` | 纯异步，成熟生态 | 大规模爬虫、WebSocket |
> | `httpx` | 同步+异步双模式，类 requests API | 通用 HTTP 客户端 |
> | `urllib3` | 仅同步，底层库 | 不推荐异步场景 |

### 7.1 httpx 异步客户端

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def fetch_with_httpx() -> None:
    """使用 httpx 进行异步 HTTP 请求"""
    try:
        import httpx
    except ImportError:
        logger.warning("httpx 未安装: pip install httpx")
        return

    async with httpx.AsyncClient(timeout=10.0) as client:
        urls = [
            "https://httpbin.org/get",
            "https://httpbin.org/ip",
            "https://httpbin.org/user-agent",
        ]

        start = time.perf_counter()

        # ✅ 并发请求
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        for resp in responses:
            if isinstance(resp, Exception):
                logger.error("请求失败: %s", resp)
            else:
                logger.info("✅ %s → %d (%d bytes)",
                            resp.url, resp.status_code, len(resp.content))

        logger.info("总耗时: %.2f 秒", time.perf_counter() - start)


asyncio.run(fetch_with_httpx())
```

### 7.2 带并发限制的批量请求

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def fetch_with_semaphore(
    url: str,
    semaphore: asyncio.Semaphore,
) -> dict[str, str | int]:
    """带并发限制的请求"""
    async with semaphore:
        logger.info("请求: %s (并发槽位已获取)", url)
        await asyncio.sleep(0.5)  # 模拟请求
        return {"url": url, "status": 200}


async def batch_fetch(urls: list[str], max_concurrent: int = 5) -> list[dict]:
    """批量请求，限制并发数"""
    semaphore = asyncio.Semaphore(max_concurrent)

    tasks = [fetch_with_semaphore(url, semaphore) for url in urls]
    results = await asyncio.gather(*tasks)
    return list(results)


async def main() -> None:
    urls = [f"https://api.example.com/item/{i}" for i in range(20)]
    start = time.perf_counter()

    results = await batch_fetch(urls, max_concurrent=5)

    logger.info("完成 %d 个请求, 耗时 %.2f 秒",
                len(results), time.perf_counter() - start)


asyncio.run(main())
```

### 7.3 重试机制

```python
import asyncio
import random
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def fetch_with_retry(
    url: str,
    max_retries: int = 3,
    base_delay: float = 1.0,
) -> dict[str, str | int]:
    """带指数退避重试的请求"""
    for attempt in range(1, max_retries + 1):
        try:
            logger.info("[尝试 %d/%d] 请求: %s", attempt, max_retries, url)
            await asyncio.sleep(0.3)  # 模拟请求

            # 模拟随机失败
            if random.random() < 0.5:
                raise ConnectionError(f"连接失败: {url}")

            return {"url": url, "status": 200, "attempt": attempt}

        except ConnectionError as e:
            if attempt == max_retries:
                logger.error("所有重试用尽: %s", url)
                raise

            # ✅ 指数退避 + 抖动
            delay = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 0.5)
            logger.warning("第 %d 次失败，%0.1f 秒后重试: %s", attempt, delay, e)
            await asyncio.sleep(delay)

    raise RuntimeError("不应到达此处")


async def main() -> None:
    urls = [f"https://api.example.com/{i}" for i in range(5)]
    tasks = [fetch_with_retry(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for r in results:
        if isinstance(r, Exception):
            logger.error("最终失败: %s", r)
        else:
            logger.info("成功: %s (第 %d 次尝试)", r["url"], r["attempt"])


asyncio.run(main())
```

---

## 8. 结构化并发（Python 3.11+ TaskGroup）

> 🌌 **The Big Picture: 从"发射并忘记"到结构化并发**
>
> 传统的 `create_task` + `gather` 有一个问题：任务的生命周期难以管理。
> 一个任务失败了，其他任务怎么办？异常在哪里处理？
>
> Python 3.11 引入的 `TaskGroup` 实现了 **结构化并发**（Structured Concurrency）：
> - 所有任务的生命周期被限制在一个明确的作用域内
> - 一个任务失败，其他任务自动取消
> - 异常不会丢失

### 8.1 TaskGroup 基础

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def fetch_data(source: str, delay: float) -> dict[str, str]:
    logger.info("获取 %s...", source)
    await asyncio.sleep(delay)
    logger.info("%s 完成", source)
    return {"source": source, "data": f"data from {source}"}


async def demo_task_group() -> None:
    # ✅ TaskGroup: 结构化并发
    results: list[dict] = []

    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("database", 1.0))
        task2 = tg.create_task(fetch_data("cache", 0.3))
        task3 = tg.create_task(fetch_data("api", 0.8))

    # 所有任务都已完成（或全部取消）
    results = [task1.result(), task2.result(), task3.result()]
    for r in results:
        logger.info("结果: %s", r)


asyncio.run(demo_task_group())
```

### 8.2 TaskGroup 的错误处理

```python
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def reliable_task(name: str) -> str:
    await asyncio.sleep(0.5)
    return f"{name} ok"


async def failing_task(name: str) -> str:
    await asyncio.sleep(0.2)
    raise ValueError(f"{name} 出错了！")


async def demo_task_group_errors() -> None:
    try:
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(reliable_task("A"))
            t2 = tg.create_task(failing_task("B"))   # 这个会失败
            t3 = tg.create_task(reliable_task("C"))
    except* ValueError as eg:
        # ✅ Python 3.11+ except* 处理 ExceptionGroup
        for exc in eg.exceptions:
            logger.error("捕获错误: %s", exc)

    # t1 和 t3 会被自动取消
    logger.info("t1 cancelled=%s, t2 cancelled=%s, t3 cancelled=%s",
                t1.cancelled(), t2.done(), t3.cancelled())


asyncio.run(demo_task_group_errors())
```

### 8.3 gather vs TaskGroup

| 特性 | `gather()` | `TaskGroup` (3.11+) |
|:---|:---|:---|
| 错误传播 | 首个异常或 `return_exceptions` | `ExceptionGroup` |
| 取消策略 | 手动 | 自动（一个失败全部取消） |
| 生命周期 | 无限制 | 绑定到 `async with` 块 |
| 异常安全 | 可能丢失异常 | 所有异常都保留 |
| 推荐场景 | 简单并发 | 生产级代码 |

---

## 9. asyncio vs threading vs multiprocessing 总结

> 🧘 **Zen of Code: 没有银弹，只有正确的工具**
>
> asyncio 不是万能的。它在 I/O 密集型场景下表现出色，
> 但 CPU 密集型任务仍然需要 multiprocessing。
> 最强大的架构往往是混合使用。

### 终极对比表

| 维度 | `threading` | `asyncio` | `multiprocessing` |
|:---|:---|:---|:---|
| **并发模型** | 抢占式 | 协作式 | 并行 |
| **线程数** | 多线程 | 单线程 | 多进程 |
| **GIL 影响** | 有 | 无（单线程） | 无（独立进程） |
| **创建开销** | ~1ms | ~0.01ms | ~50ms |
| **内存开销** | ~8MB/线程 | ~1KB/协程 | ~30MB/进程 |
| **最大并发** | ~1000 | ~100,000 | ~CPU核心数 |
| **数据共享** | 共享（需锁） | 共享（安全） | 需 IPC |
| **调试难度** | 高 | 中 | 低 |
| **生态支持** | 广泛 | 不断增长 | 广泛 |
| **学习曲线** | 低 | 中-高 | 低 |
| **CPU 加速** | 否 | 否 | 是 |
| **I/O 加速** | 是 | 是（最优） | 是（过度） |

### 混合使用

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


def cpu_bound_task(n: int) -> int:
    """CPU 密集型（同步函数）"""
    return sum(i * i for i in range(n))


def blocking_io_task(path: str) -> str:
    """阻塞 I/O（同步函数）"""
    time.sleep(1)  # 模拟文件读取
    return f"Content of {path}"


async def main() -> None:
    loop = asyncio.get_running_loop()

    # ✅ 在线程池中运行阻塞 I/O
    with ThreadPoolExecutor() as thread_pool:
        result = await loop.run_in_executor(
            thread_pool, blocking_io_task, "/path/to/file"
        )
        logger.info("I/O 结果: %s", result)

    # ✅ 在进程池中运行 CPU 密集型任务
    with ProcessPoolExecutor() as process_pool:
        result = await loop.run_in_executor(
            process_pool, cpu_bound_task, 10_000_000
        )
        logger.info("CPU 结果: %d", result)


asyncio.run(main())
```

---

## 最佳实践 / 常见陷阱

### 最佳实践

```python
import asyncio

# ✅ 1. 用 asyncio.run() 作为入口点
async def main() -> None:
    pass
asyncio.run(main())

# ✅ 2. 优先使用 TaskGroup (Python 3.11+)
async def structured() -> None:
    async with asyncio.TaskGroup() as tg:
        tg.create_task(coro1())
        tg.create_task(coro2())

# ✅ 3. 用 Semaphore 限制并发
semaphore = asyncio.Semaphore(10)
async def limited_task() -> None:
    async with semaphore:
        await do_work()

# ✅ 4. 用 run_in_executor 处理阻塞操作
async def read_file(path: str) -> bytes:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, open(path, 'rb').read)

# ✅ 5. 设置超时
async def with_timeout() -> None:
    try:
        result = await asyncio.wait_for(slow_coro(), timeout=5.0)
    except asyncio.TimeoutError:
        print("超时！")
```

### 常见陷阱

```python
import asyncio
import time

# ❌ 陷阱 1：在异步代码中使用阻塞调用
async def bad_blocking() -> None:
    time.sleep(5)  # 阻塞整个事件循环！所有协程都停了！

# ✅ 修复
async def good_async() -> None:
    await asyncio.sleep(5)  # 非阻塞

# ❌ 陷阱 2：忘记 await
async def bad_forget_await() -> None:
    asyncio.sleep(1)  # 返回协程对象但不执行！
    # RuntimeWarning: coroutine 'sleep' was never awaited

# ❌ 陷阱 3：create_task 后不保存引用
async def bad_fire_and_forget() -> None:
    asyncio.create_task(some_coro())  # task 可能被垃圾回收！

# ✅ 修复：保存引用
async def good_keep_ref() -> None:
    task = asyncio.create_task(some_coro())
    await task

# ❌ 陷阱 4：在同步函数中调用 asyncio.run()（嵌套事件循环）
# asyncio.run(main())  # 如果已经有一个事件循环在运行，会报错

# ❌ 陷阱 5：协程不是线程安全的
# 不要从多个线程 await 同一个协程
```

---

## 练习题

### 练习 1：异步倒计时器（基础）

实现一个异步函数，同时运行 3 个倒计时器（10秒、5秒、3秒），全部完成后打印总耗时。

<details>
<summary>💡 提示</summary>

使用 `asyncio.gather()` 或 `TaskGroup` 并发运行三个协程。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
import asyncio
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def countdown(name: str, seconds: int) -> str:
    for i in range(seconds, 0, -1):
        logger.info("%s: %d", name, i)
        await asyncio.sleep(1)
    logger.info("%s: 完成!", name)
    return f"{name} finished"


async def main() -> None:
    start = time.perf_counter()

    results = await asyncio.gather(
        countdown("Timer-A", 10),
        countdown("Timer-B", 5),
        countdown("Timer-C", 3),
    )

    elapsed = time.perf_counter() - start
    logger.info("所有结果: %s", results)
    logger.info("总耗时: %.1f 秒 (理论最小 10 秒)", elapsed)


asyncio.run(main())
```

</details>

### 练习 2：异步批量下载器（中级）

实现异步批量 URL 下载器，支持并发限制和超时。

<details>
<summary>💡 提示</summary>

使用 `asyncio.Semaphore` 限制并发，`asyncio.wait_for` 设置超时。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
import asyncio
import random
import time
import logging
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class DownloadResult:
    url: str
    success: bool
    data: str | None = None
    error: str | None = None


async def download_url(url: str) -> DownloadResult:
    delay = random.uniform(0.5, 3.0)
    await asyncio.sleep(delay)
    if random.random() < 0.2:
        raise ConnectionError(f"连接失败: {url}")
    return DownloadResult(url=url, success=True, data=f"Content({url})")


async def batch_download(
    urls: list[str],
    max_concurrent: int = 5,
    timeout: float = 2.0,
) -> list[DownloadResult]:
    semaphore = asyncio.Semaphore(max_concurrent)
    results: list[DownloadResult] = []

    async def _download(url: str) -> DownloadResult:
        async with semaphore:
            try:
                return await asyncio.wait_for(download_url(url), timeout=timeout)
            except asyncio.TimeoutError:
                return DownloadResult(url=url, success=False, error="超时")
            except Exception as e:
                return DownloadResult(url=url, success=False, error=str(e))

    tasks = [_download(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return list(results)


async def main() -> None:
    urls = [f"https://example.com/page/{i}" for i in range(15)]
    start = time.perf_counter()

    results = await batch_download(urls, max_concurrent=5, timeout=2.0)

    success = sum(1 for r in results if r.success)
    failed = len(results) - success
    logger.info("完成: %d 成功, %d 失败, 耗时 %.2f 秒",
                success, failed, time.perf_counter() - start)

    for r in results:
        status = "✅" if r.success else "❌"
        logger.info("%s %s: %s", status, r.url, r.data or r.error)


asyncio.run(main())
```

</details>

### 练习 3：异步生产者-消费者（高级）

使用 `asyncio.Queue` 实现异步生产者-消费者模式，支持多生产者多消费者。

<details>
<summary>💡 提示</summary>

使用 `asyncio.Queue` 和 `TaskGroup` 组织生产者和消费者。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
import asyncio
import random
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
logger = logging.getLogger(__name__)


async def producer(
    queue: asyncio.Queue,
    producer_id: int,
    num_items: int,
) -> None:
    for i in range(num_items):
        item = f"P{producer_id}-item-{i}"
        await queue.put(item)
        logger.info("Producer %d: 生产 %s (qsize=%d)", producer_id, item, queue.qsize())
        await asyncio.sleep(random.uniform(0.05, 0.15))


async def consumer(
    queue: asyncio.Queue,
    consumer_id: int,
) -> int:
    count = 0
    while True:
        try:
            item = await asyncio.wait_for(queue.get(), timeout=1.0)
            logger.info("Consumer %d: 消费 %s", consumer_id, item)
            await asyncio.sleep(random.uniform(0.1, 0.3))
            queue.task_done()
            count += 1
        except asyncio.TimeoutError:
            logger.info("Consumer %d: 超时退出 (处理了 %d 条)", consumer_id, count)
            return count


async def main() -> None:
    queue: asyncio.Queue = asyncio.Queue(maxsize=10)

    # 启动生产者
    producer_tasks = [
        asyncio.create_task(producer(queue, i, 5))
        for i in range(3)
    ]

    # 启动消费者
    consumer_tasks = [
        asyncio.create_task(consumer(queue, i))
        for i in range(2)
    ]

    # 等待所有生产者完成
    await asyncio.gather(*producer_tasks)
    logger.info("所有生产者完成")

    # 等待队列清空
    await queue.join()
    logger.info("队列已清空")

    # 等待消费者自然退出（超时）
    results = await asyncio.gather(*consumer_tasks)
    total = sum(results)
    logger.info("总共消费: %d 条", total)


asyncio.run(main())
```

</details>

---

## 参考资源 / 下一步

**官方文档：**
- [asyncio — Asynchronous I/O](https://docs.python.org/3/library/asyncio.html)
- [PEP 492 — Coroutines with async and await syntax](https://peps.python.org/pep-0492/)
- [PEP 654 — Exception Groups and except*](https://peps.python.org/pep-0654/)

**推荐阅读：**
- *Fluent Python, 2nd Ed.* — Chapters 20-21: Asynchronous Programming
- [Real Python: Async IO in Python](https://realpython.com/async-io-python/)
- [Using Asyncio in Python](https://www.oreilly.com/library/view/using-asyncio-in/9781492075325/) by Caleb Hattingh

---

**导航：**

| 上一章 | 目录 | 下一章 |
|:---|:---:|---:|
| [第 5 章：multiprocessing](../05-concurrency-multiprocessing/) | [Stage 3 目录](../README.md) | [第 7 章：函数式编程](../07-functional-programming/) |
