# 第 4 章：threading — 线程并发

> *"Concurrency is not parallelism, although it enables parallelism."*
> — Rob Pike
>
> 当你在等待网络响应时，CPU 在发呆。线程让你在等待时做别的事——
> 这不是魔法，这是操作系统最古老的把戏之一。

---

## 📖 本章内容

- [1. GIL 与线程的关系](#1-gil-与线程的关系)
- [2. threading 模块基础](#2-threading-模块基础)
- [3. 线程同步原语](#3-线程同步原语)
- [4. 线程安全的数据结构](#4-线程安全的数据结构)
- [5. ThreadPoolExecutor](#5-threadpoolexecutor)
- [6. 线程局部存储](#6-线程局部存储)
- [7. 线程 vs 协程 vs 进程对比](#7-线程-vs-协程-vs-进程对比)
- [最佳实践 / 常见陷阱](#最佳实践践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. GIL 与线程的关系

> 🎭 **The Drama: GIL — Python 并发的"房间里的大象"**
>
> 想象一个图书馆只有一支笔。所有读者都可以同时阅读（I/O），
> 但任何时刻只有一个人能写字（CPU）。这支笔就是 GIL。
>
> GIL（Global Interpreter Lock）是 CPython 解释器中的一把互斥锁，
> 保证同一时刻只有一个线程执行 Python 字节码。
> 这不是 Python 语言的特性，而是 CPython 实现的选择。

### 1.1 什么是 GIL

GIL 是一把全局锁，保护 Python 对象的引用计数不被并发修改破坏。没有 GIL，两个线程同时修改一个对象的引用计数可能导致内存泄漏或段错误。

```python
import sys
import threading
import logging

logging.basicConfig(level=logging.DEBUG, format='%(threadName)s: %(message)s')
logger = logging.getLogger(__name__)

# GIL 保护引用计数
a = []
logger.info("引用计数: %d", sys.getrefcount(a))  # 2 (a + getrefcount 参数)

# ✅ GIL 保证这是安全的——即使多线程同时操作
# 因为引用计数的修改是原子的（受 GIL 保护）
```

### 1.2 GIL 的影响

```
┌──────────────────────────────────────────────────────────────────┐
│                     GIL 对不同任务的影响                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CPU 密集型任务（计算、加密、压缩）                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │Thread 1 │ │Thread 2 │ │Thread 3 │  ← 串行执行！无加速         │
│  │█████    │ │    █████│ │         █████│                        │
│  └─────────┘ └─────────┘ └─────────┘                            │
│  时间 ──────────────────────────────────────▶                    │
│                                                                  │
│  I/O 密集型任务（网络请求、文件读写、数据库查询）                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │Thread 1 │ │Thread 2 │ │Thread 3 │  ← 并发！有加速             │
│  │█░░░█░░█ │ │░█░░░█░░│ │░░█░░░█░│                             │
│  └─────────┘ └─────────┘ └─────────┘                            │
│  █ = 执行 Python   ░ = 等待 I/O（释放 GIL）                      │
│  时间 ──────────────────────────────────────▶                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.3 GIL 释放的时机

| 操作 | GIL 是否释放 | 说明 |
|:---|:---|:---|
| 纯 Python 计算 | 否 | 同一时刻只有一个线程执行字节码 |
| `time.sleep()` | 是 | 休眠时释放 GIL |
| 文件 I/O | 是 | `read()` / `write()` 时释放 |
| 网络 I/O | 是 | `socket.recv()` / `send()` 时释放 |
| NumPy 运算 | 是 | C 扩展内部释放 GIL |
| `hashlib` 计算 | 是 | C 实现的哈希运算释放 GIL |
| 正则表达式匹配 | 部分 | `re` 模块的 C 实现部分释放 |

```python
import threading
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(threadName)s: %(message)s')
logger = logging.getLogger(__name__)


def cpu_bound(n: int) -> int:
    """CPU 密集型：GIL 不会释放"""
    total = 0
    for i in range(n):
        total += i * i
    return total


def io_bound(url: str) -> None:
    """I/O 密集型：GIL 会释放"""
    import urllib.request
    logger.info("开始请求 %s", url)
    resp = urllib.request.urlopen(url)
    logger.info("完成请求 %s, 状态码: %d", url, resp.status)


# ❌ CPU 密集型多线程：没有加速
start = time.perf_counter()
threads = [threading.Thread(target=cpu_bound, args=(10_000_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
logger.info("CPU 密集 4 线程耗时: %.2f 秒", time.perf_counter() - start)

# ✅ I/O 密集型多线程：显著加速
start = time.perf_counter()
urls = ["https://httpbin.org/delay/1"] * 4
threads = [threading.Thread(target=io_bound, args=(url,)) for url in urls]
for t in threads:
    t.start()
for t in threads:
    t.join()
logger.info("I/O 密集 4 线程耗时: %.2f 秒", time.perf_counter() - start)
```

> 🧠 **CS Master's Bridge: GIL 的历史与未来**
>
> GIL 诞生于 1992 年，那时多核 CPU 还不存在。Guido 选择 GIL 是为了：
> 1. 简化 CPython 的内存管理（引用计数）
> 2. 让 C 扩展更容易编写
> 3. 单线程性能最优
>
> 2024 年，PEP 703（"no-GIL" / free-threading）被接受为实验性特性。
> Python 3.13+ 可以编译为无 GIL 版本（`--disable-gil`）。
> 未来可能彻底移除 GIL，但这是一个渐进过程。

---

## 2. threading 模块基础

> ⚛️ **The Science: 线程的本质**
>
> 线程是操作系统调度的最小单位。同一进程的多个线程共享内存空间，
> 这意味着它们可以访问相同的变量——这既是优势（数据共享方便），
> 也是噩梦的开始（竞态条件）。

### 2.1 创建和启动线程

```python
import threading
import time
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(threadName)s] %(message)s'
)
logger = logging.getLogger(__name__)


# ✅ 方式一：传入目标函数
def worker(task_id: int, duration: float) -> None:
    logger.info("任务 %d 开始, 预计 %.1f 秒", task_id, duration)
    time.sleep(duration)
    logger.info("任务 %d 完成", task_id)


t = threading.Thread(target=worker, args=(1, 2.0), name="Worker-1")
t.start()   # 启动线程（非阻塞，立即返回）
t.join()    # 等待线程完成（阻塞）
logger.info("主线程继续")
```

```python
# ✅ 方式二：继承 Thread 类（适合复杂逻辑）
class DownloadThread(threading.Thread):
    def __init__(self, url: str, save_path: str) -> None:
        super().__init__(name=f"Download-{url[:20]}")
        self.url = url
        self.save_path = save_path
        self.result: str | None = None

    def run(self) -> None:
        logger.info("下载 %s → %s", self.url, self.save_path)
        time.sleep(1)  # 模拟下载
        self.result = f"Downloaded {self.url}"
        logger.info("下载完成: %s", self.result)


thread = DownloadThread("https://example.com/file.zip", "/tmp/file.zip")
thread.start()
thread.join()
print(thread.result)  # 可以访问线程对象的属性


# ❌ 常见错误：直接调用 run() 而非 start()
thread = DownloadThread("https://example.com", "/tmp/file")
thread.run()   # 这不会创建新线程！在当前线程同步执行！
```

### 2.2 守护线程（Daemon Threads）

守护线程在所有非守护线程结束时自动终止，适合后台任务。

```python
import threading
import time
import logging

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


def background_monitor(interval: float = 1.0) -> None:
    """后台监控线程"""
    while True:
        logger.info("心跳检测... 活跃线程数: %d", threading.active_count())
        time.sleep(interval)


# ✅ 守护线程：主线程退出时自动结束
monitor = threading.Thread(target=background_monitor, daemon=True, name="Monitor")
monitor.start()

# 主线程工作
time.sleep(3)
logger.info("主线程结束，守护线程将自动终止")
# 程序退出，monitor 线程被终止
```

### 2.3 线程生命周期

```
┌──────────────────────────────────────────────────────────────┐
│                    线程生命周期                                │
│                                                              │
│   Thread()          start()          run() 完成              │
│   ┌──────┐    ┌──────────┐    ┌──────────┐    ┌──────┐      │
│   │ NEW  │───▶│ RUNNABLE │───▶│ RUNNING  │───▶│ DEAD │      │
│   └──────┘    └──────────┘    └─────┬────┘    └──────┘      │
│                                     │                        │
│                                     │ 等待锁/sleep/I/O       │
│                                     ▼                        │
│                               ┌──────────┐                   │
│                               │ BLOCKED  │                   │
│                               └──────────┘                   │
│                                                              │
│   t.is_alive()  →  True (RUNNABLE/RUNNING/BLOCKED)           │
│   t.join()      →  阻塞直到线程 DEAD                          │
│   t.daemon      →  True 时主线程退出会杀死该线程               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.4 join() 的超时与多线程协调

```python
import threading
import time
import logging

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


def slow_task() -> None:
    time.sleep(10)


t = threading.Thread(target=slow_task, name="SlowWorker")
t.start()

# ✅ 带超时的 join：不会永远阻塞
t.join(timeout=2.0)
if t.is_alive():
    logger.warning("线程未在 2 秒内完成，继续执行主线程逻辑")
else:
    logger.info("线程已完成")
```

---

## 3. 线程同步原语

> 🎭 **The Drama: 竞态条件 — 并发的噩梦**
>
> 两个线程同时给银行账户加钱。没有锁，你可能"丢钱"。
> 这不是理论问题——这是真实世界中导致金融系统崩溃的 Bug。

### 3.1 竞态条件演示

```python
import threading
import logging

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)

# ❌ 没有同步 → 竞态条件
counter = 0


def increment_unsafe(n: int) -> None:
    global counter
    for _ in range(n):
        # 这三步不是原子操作：
        # 1. 读取 counter
        # 2. 加 1
        # 3. 写回 counter
        counter += 1


threads = [
    threading.Thread(target=increment_unsafe, args=(100_000,))
    for _ in range(10)
]
for t in threads:
    t.start()
for t in threads:
    t.join()

logger.info("期望: 1,000,000, 实际: %d", counter)  # 几乎不可能是 1,000,000
```

### 3.2 Lock（互斥锁）

```python
import threading
import logging

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)

# ✅ 使用 Lock 保护共享资源
counter = 0
lock = threading.Lock()


def increment_safe(n: int) -> None:
    global counter
    for _ in range(n):
        with lock:  # 自动 acquire/release
            counter += 1


threads = [
    threading.Thread(target=increment_safe, args=(100_000,))
    for _ in range(10)
]
for t in threads:
    t.start()
for t in threads:
    t.join()

logger.info("期望: 1,000,000, 实际: %d", counter)  # 精确是 1,000,000
```

```python
# Lock 的两种用法
lock = threading.Lock()

# ✅ 方式一：上下文管理器（推荐）
with lock:
    # 临界区
    pass

# ✅ 方式二：手动管理（需要更细粒度控制时）
lock.acquire()
try:
    # 临界区
    pass
finally:
    lock.release()  # 必须在 finally 中释放！

# ❌ 方式三：忘记释放（死锁风险）
lock.acquire()
# 如果这里抛异常，锁永远不会释放 → 死锁
```

### 3.3 RLock（可重入锁）

```python
import threading
import logging

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


class BankAccount:
    """银行账户 — 展示 RLock 的必要性"""

    def __init__(self, balance: float) -> None:
        self._balance = balance
        self._lock = threading.RLock()  # 可重入锁

    def deposit(self, amount: float) -> None:
        with self._lock:
            logger.info("存款 %.2f", amount)
            self._balance += amount

    def withdraw(self, amount: float) -> bool:
        with self._lock:
            if self._balance >= amount:
                logger.info("取款 %.2f", amount)
                self._balance -= amount
                return True
            return False

    def transfer(self, other: 'BankAccount', amount: float) -> bool:
        # ✅ RLock 允许同一线程多次获取锁
        with self._lock:
            if self.withdraw(amount):  # 这里会再次获取 self._lock
                other.deposit(amount)
                return True
            return False
        # 如果用普通 Lock，withdraw 中的 lock.acquire() 会死锁！

    @property
    def balance(self) -> float:
        with self._lock:
            return self._balance
```

### 3.4 Semaphore（信号量）

```python
import threading
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)

# ✅ 信号量限制并发数量（如数据库连接池）
db_semaphore = threading.Semaphore(3)  # 最多 3 个并发连接


def query_database(query_id: int) -> str:
    with db_semaphore:
        logger.info("查询 %d: 获取连接", query_id)
        time.sleep(1)  # 模拟查询
        result = f"Result-{query_id}"
        logger.info("查询 %d: 释放连接, 结果=%s", query_id, result)
        return result


# 启动 10 个查询线程，但同时只有 3 个能运行
threads = [
    threading.Thread(target=query_database, args=(i,), name=f"Query-{i}")
    for i in range(10)
]
for t in threads:
    t.start()
for t in threads:
    t.join()
```

### 3.5 Event（事件）

```python
import threading
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)

# ✅ Event 用于线程间的信号通知
server_ready = threading.Event()


def start_server() -> None:
    logger.info("服务器启动中...")
    time.sleep(2)  # 模拟启动耗时
    logger.info("服务器就绪！")
    server_ready.set()  # 通知所有等待的线程


def client_request(client_id: int) -> None:
    logger.info("客户端 %d 等待服务器就绪...", client_id)
    server_ready.wait()  # 阻塞直到 event 被 set
    logger.info("客户端 %d 发送请求", client_id)


# 启动服务器和多个客户端
server_thread = threading.Thread(target=start_server, name="Server")
client_threads = [
    threading.Thread(target=client_request, args=(i,), name=f"Client-{i}")
    for i in range(5)
]

server_thread.start()
for t in client_threads:
    t.start()
server_thread.join()
for t in client_threads:
    t.join()
```

### 3.6 Condition（条件变量）

```python
import threading
import time
import logging
from collections import deque

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)

# ✅ Condition 用于复杂的线程协调
buffer: deque[int] = deque(maxlen=5)
condition = threading.Condition()


def producer() -> None:
    for i in range(10):
        with condition:
            while len(buffer) >= 5:  # 缓冲区满，等待
                logger.info("缓冲区满，等待消费者...")
                condition.wait()
            buffer.append(i)
            logger.info("生产: %d, 缓冲区: %s", i, list(buffer))
            condition.notify_all()  # 通知消费者
        time.sleep(0.1)


def consumer(consumer_id: int) -> None:
    while True:
        with condition:
            while len(buffer) == 0:  # 缓冲区空，等待
                logger.info("缓冲区空，等待生产者...")
                condition.wait(timeout=2.0)
                if len(buffer) == 0:
                    logger.info("超时退出")
                    return
            item = buffer.popleft()
            logger.info("消费者 %d 消费: %d", consumer_id, item)
            condition.notify_all()  # 通知生产者
```

### 同步原语对比表

| 原语 | 用途 | 关键方法 | 典型场景 |
|:---|:---|:---|:---|
| `Lock` | 互斥访问 | `acquire()`, `release()` | 保护共享变量 |
| `RLock` | 可重入互斥 | 同上（可重入） | 递归调用中的锁 |
| `Semaphore` | 限制并发数 | `acquire()`, `release()` | 连接池、限流 |
| `Event` | 线程间通知 | `set()`, `wait()`, `clear()` | 启动信号、关闭信号 |
| `Condition` | 复杂协调 | `wait()`, `notify()`, `notify_all()` | 生产者-消费者 |
| `Barrier` | 集合点同步 | `wait()` | 所有线程到齐后继续 |

---

## 4. 线程安全的数据结构

> 🧰 **Toolbox: queue.Queue — 线程间通信的首选**
>
> 不要通过共享内存来通信，要通过通信来共享内存。
> `queue.Queue` 内部已经实现了所有必要的锁，是线程安全的。

### 4.1 Queue 基础

```python
import queue
import threading
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)

# ✅ Queue 是线程安全的
task_queue: queue.Queue[str] = queue.Queue(maxsize=10)
SENTINEL = None  # 毒丸信号


def producer(tasks: list[str]) -> None:
    for task in tasks:
        task_queue.put(task)  # 阻塞直到有空间
        logger.info("生产任务: %s", task)
        time.sleep(0.1)

    # 放入毒丸通知消费者结束
    task_queue.put(SENTINEL)
    logger.info("生产完成，放入停止信号")


def consumer() -> None:
    while True:
        task = task_queue.get()  # 阻塞直到有数据
        if task is SENTINEL:
            logger.info("收到停止信号，退出")
            task_queue.task_done()
            break
        logger.info("处理任务: %s", task)
        time.sleep(0.3)  # 模拟处理
        task_queue.task_done()  # 标记任务完成


tasks = [f"task-{i}" for i in range(5)]
p = threading.Thread(target=producer, args=(tasks,), name="Producer")
c = threading.Thread(target=consumer, name="Consumer")

p.start()
c.start()
p.join()
c.join()
```

### 4.2 Queue 的变体

```python
import queue

# 标准 FIFO 队列
fifo: queue.Queue[int] = queue.Queue()

# LIFO 队列（栈）
lifo: queue.LifoQueue[int] = queue.LifoQueue()
lifo.put(1)
lifo.put(2)
lifo.put(3)
print(lifo.get())  # 3（后进先出）

# 优先级队列
pq: queue.PriorityQueue[tuple[int, str]] = queue.PriorityQueue()
pq.put((3, "低优先级"))
pq.put((1, "高优先级"))
pq.put((2, "中优先级"))
print(pq.get())  # (1, '高优先级')（数字越小优先级越高）
```

### 4.3 Queue 的关键方法

| 方法 | 说明 | 阻塞 |
|:---|:---|:---|
| `put(item)` | 放入元素 | 是（队列满时阻塞） |
| `put(item, block=False)` | 放入元素 | 否（满时抛 `queue.Full`） |
| `get()` | 取出元素 | 是（队列空时阻塞） |
| `get(block=False)` | 取出元素 | 否（空时抛 `queue.Empty`） |
| `task_done()` | 标记任务完成 | 否 |
| `join()` | 等待所有任务完成 | 是 |
| `qsize()` | 队列大小（近似） | 否 |
| `empty()` | 是否为空（近似） | 否 |

---

## 5. ThreadPoolExecutor

> 🌌 **The Big Picture: 从手动管理到池化**
>
> 手动创建线程就像每次出行都买一辆新车。线程池就像出租车公司——
> 预先准备好一组线程，任务来了就分配，完了就回收。
> `concurrent.futures` 是 Python 3.2+ 引入的高级并发接口，
> 它统一了线程池和进程池的 API。

### 5.1 基本用法

```python
from concurrent.futures import ThreadPoolExecutor, as_completed, Future
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


def download(url: str) -> dict[str, str | int]:
    """模拟下载"""
    logger.info("开始下载: %s", url)
    time.sleep(1)  # 模拟网络延迟
    return {"url": url, "status": 200, "size": 1024}


urls = [f"https://api.example.com/data/{i}" for i in range(10)]

# ✅ 方式一：上下文管理器（推荐）
with ThreadPoolExecutor(max_workers=4, thread_name_prefix="Downloader") as executor:
    # submit 返回 Future 对象
    futures: dict[Future, str] = {
        executor.submit(download, url): url for url in urls
    }

    # as_completed 按完成顺序产出 Future
    for future in as_completed(futures):
        url = futures[future]
        try:
            result = future.result()
            logger.info("完成: %s → %s", url, result)
        except Exception as e:
            logger.error("失败: %s → %s", url, e)
```

### 5.2 map() 方法

```python
from concurrent.futures import ThreadPoolExecutor
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


def process_item(item: int) -> int:
    logger.info("处理 %d", item)
    time.sleep(0.5)
    return item * item


# ✅ map() — 按提交顺序返回结果
with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(process_item, range(10)))
    logger.info("结果: %s", results)
    # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

### 5.3 submit() vs map() 对比

| 特性 | `submit()` + `as_completed()` | `map()` |
|:---|:---|:---|
| 返回类型 | `Future` 对象 | 结果迭代器 |
| 结果顺序 | 按完成顺序 | 按提交顺序 |
| 异常处理 | `future.result()` 抛异常 | 迭代时抛异常 |
| 灵活性 | 高（可取消、检查状态） | 低（简单映射） |
| 适用场景 | 需要知道每个任务状态 | 批量处理同类任务 |

### 5.4 Future 对象详解

```python
from concurrent.futures import ThreadPoolExecutor, Future
import time
import logging

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


def slow_computation(x: int) -> int:
    time.sleep(2)
    if x == 3:
        raise ValueError(f"不能处理 {x}")
    return x ** 2


with ThreadPoolExecutor(max_workers=2) as executor:
    future: Future[int] = executor.submit(slow_computation, 5)

    # Future 的状态检查
    logger.info("运行中? %s", future.running())
    logger.info("完成? %s", future.done())
    logger.info("已取消? %s", future.cancelled())

    # 获取结果（阻塞）
    result = future.result(timeout=5)  # 超时会抛 TimeoutError
    logger.info("结果: %d", result)

    # 错误处理
    error_future: Future[int] = executor.submit(slow_computation, 3)
    try:
        error_future.result()
    except ValueError as e:
        logger.error("捕获异常: %s", e)

    # 回调函数
    def on_complete(fut: Future[int]) -> None:
        if fut.exception():
            logger.error("任务失败: %s", fut.exception())
        else:
            logger.info("任务成功: %s", fut.result())

    f = executor.submit(slow_computation, 7)
    f.add_done_callback(on_complete)
```

---

## 6. 线程局部存储

> 🧰 **Toolbox: threading.local — 每个线程独立的变量空间**
>
> 想象一个魔法笔记本——每个人翻开看到的都是自己的内容。
> `threading.local()` 就是这个笔记本：同一个变量名，不同线程看到不同的值。

### 6.1 基本用法

```python
import threading
import logging

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)

# 创建线程局部存储
local_data = threading.local()


def worker(name: str, value: int) -> None:
    # 每个线程设置自己的 local_data.name 和 local_data.value
    local_data.name = name
    local_data.value = value
    logger.info("设置: name=%s, value=%d", local_data.name, local_data.value)

    # 验证隔离性
    import time
    time.sleep(0.1)  # 让其他线程有机会修改

    # 仍然是自己的值！
    logger.info("验证: name=%s, value=%d", local_data.name, local_data.value)


threads = [
    threading.Thread(target=worker, args=(f"thread-{i}", i), name=f"Worker-{i}")
    for i in range(5)
]
for t in threads:
    t.start()
for t in threads:
    t.join()
```

### 6.2 实际应用：请求上下文

```python
import threading
import time
import logging
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)

# ✅ 用 threading.local 实现请求上下文
_request_context = threading.local()


@dataclass
class RequestContext:
    request_id: str
    user_id: str
    start_time: float


def set_request_context(request_id: str, user_id: str) -> None:
    _request_context.current = RequestContext(
        request_id=request_id,
        user_id=user_id,
        start_time=time.time(),
    )


def get_request_context() -> RequestContext:
    ctx = getattr(_request_context, 'current', None)
    if ctx is None:
        raise RuntimeError("No request context set")
    return ctx


def handle_request(request_id: str, user_id: str) -> None:
    set_request_context(request_id, user_id)
    ctx = get_request_context()
    logger.info("处理请求: id=%s, user=%s", ctx.request_id, ctx.user_id)
    # 调用其他函数时，它们都能通过 get_request_context() 访问上下文
    process_business_logic()


def process_business_logic() -> None:
    ctx = get_request_context()
    logger.info("业务逻辑中访问上下文: user=%s", ctx.user_id)


# 模拟并发请求
threads = [
    threading.Thread(
        target=handle_request,
        args=(f"req-{i}", f"user-{i}"),
        name=f"Handler-{i}",
    )
    for i in range(3)
]
for t in threads:
    t.start()
for t in threads:
    t.join()
```

---

## 7. 线程 vs 协程 vs 进程对比

> 🌌 **The Big Picture: 并发三驾马车**
>
> Python 提供了三种并发模型。选错了不会报错，但你会浪费时间和资源。
> 这张对比表是你做决策的指南针。

### 7.1 全面对比表

| 特性 | `threading` | `asyncio` | `multiprocessing` |
|:---|:---|:---|:---|
| **并发模型** | 抢占式多线程 | 协作式单线程 | 多进程并行 |
| **GIL 影响** | 受限（CPU 密集无加速） | 不受影响（单线程） | 不受限（独立进程） |
| **适用场景** | I/O 密集型 | I/O 密集型 | CPU 密集型 |
| **内存开销** | 低（共享内存） | 最低（单线程） | 高（独立内存空间） |
| **创建开销** | 中等（~1ms） | 极低（~0.01ms） | 高（~50ms） |
| **数据共享** | 直接（需锁） | 直接（单线程） | 需 IPC（序列化） |
| **调试难度** | 高（竞态条件） | 中等（堆栈跟踪） | 中等（进程隔离） |
| **CPU 利用** | 单核 | 单核 | 多核 |
| **典型用途** | 文件 I/O、数据库 | Web 爬虫、API 服务 | 数据处理、科学计算 |

### 7.2 决策流程图

```
你的任务是什么类型？
│
├── I/O 密集型（网络、文件、数据库）
│   ├── 需要大量并发连接（>100）？
│   │   └── ✅ asyncio（最高效）
│   ├── 现有代码是同步的，改动成本高？
│   │   └── ✅ threading（最简单）
│   └── 需要与 C 扩展交互？
│       └── ✅ threading
│
├── CPU 密集型（计算、编码、压缩）
│   ├── 任务可以并行化？
│   │   └── ✅ multiprocessing
│   ├── 需要共享大量数据？
│   │   └── ✅ multiprocessing + shared memory
│   └── 性能极端要求？
│       └── 考虑 C 扩展或 Rust
│
└── 混合型
    ├── 主要是 I/O + 少量 CPU
    │   └── ✅ asyncio + ProcessPoolExecutor
    └── 主要是 CPU + 少量 I/O
        └── ✅ multiprocessing + 线程池
```

### 7.3 代码对比

```python
import time
import threading
import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


# 模拟 I/O 任务
def io_task_sync(task_id: int) -> str:
    time.sleep(1)
    return f"task-{task_id} done"


async def io_task_async(task_id: int) -> str:
    await asyncio.sleep(1)
    return f"task-{task_id} done"


# ✅ threading 版本
def run_threading(n: int) -> None:
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=n) as executor:
        results = list(executor.map(io_task_sync, range(n)))
    elapsed = time.perf_counter() - start
    logger.info("Threading (%d tasks): %.2f 秒", n, elapsed)


# ✅ asyncio 版本
async def run_asyncio(n: int) -> None:
    start = time.perf_counter()
    tasks = [io_task_async(i) for i in range(n)]
    results = await asyncio.gather(*tasks)
    elapsed = time.perf_counter() - start
    logger.info("Asyncio  (%d tasks): %.2f 秒", n, elapsed)


# 运行对比
run_threading(10)
asyncio.run(run_asyncio(10))
```

---

## 最佳实践 / 常见陷阱

### 最佳实践

```python
# ✅ 1. 优先使用 ThreadPoolExecutor 而非手动创建线程
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(process, items))

# ✅ 2. 用 Queue 进行线程间通信，而非共享变量
import queue
task_queue: queue.Queue[str] = queue.Queue()

# ✅ 3. 用 with 语句管理锁
with lock:
    critical_section()

# ✅ 4. 设置合理的线程数
# I/O 密集型：线程数 = CPU 核心数 * 5
# CPU 密集型：不要用 threading（用 multiprocessing）
import os
io_workers = os.cpu_count() * 5

# ✅ 5. 给线程命名，方便调试
threading.Thread(target=worker, name="DataProcessor-1")
```

### 常见陷阱

```python
import threading

# ❌ 陷阱 1：死锁 — 两个锁的获取顺序不一致
lock_a = threading.Lock()
lock_b = threading.Lock()

def thread_1() -> None:
    with lock_a:        # 先获取 A
        with lock_b:    # 再获取 B
            pass

def thread_2() -> None:
    with lock_b:        # 先获取 B（与 thread_1 相反！）
        with lock_a:    # 再获取 A → 死锁！
            pass

# ✅ 解决：始终按固定顺序获取锁
def thread_2_fixed() -> None:
    with lock_a:        # 也先获取 A
        with lock_b:    # 再获取 B
            pass
```

```python
# ❌ 陷阱 2：在线程中修改可变默认参数
def worker(results: list[int] = []) -> list[int]:
    results.append(1)  # 所有调用共享同一个 list！
    return results

# ✅ 解决：使用 None 默认值
def worker_fixed(results: list[int] | None = None) -> list[int]:
    if results is None:
        results = []
    results.append(1)
    return results
```

```python
# ❌ 陷阱 3：忽略线程中的异常
def risky_worker() -> None:
    raise ValueError("出错了！")

t = threading.Thread(target=risky_worker)
t.start()
t.join()  # 线程的异常被静默吞掉了！

# ✅ 解决：使用 ThreadPoolExecutor，异常会在 future.result() 时重新抛出
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor() as executor:
    future = executor.submit(risky_worker)
    try:
        future.result()  # 这里会抛出 ValueError
    except ValueError as e:
        print(f"捕获到线程异常: {e}")
```

---

## 练习题

### 练习 1：线程安全计数器（基础）

实现一个线程安全的计数器类，支持 `increment()`、`decrement()`、`get_value()` 方法。

<details>
<summary>💡 提示</summary>

使用 `threading.Lock` 保护内部状态。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
import threading
import logging

logging.basicConfig(level=logging.INFO, format='[%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


class ThreadSafeCounter:
    def __init__(self, initial: int = 0) -> None:
        self._value = initial
        self._lock = threading.Lock()

    def increment(self) -> int:
        with self._lock:
            self._value += 1
            logger.info("increment → %d", self._value)
            return self._value

    def decrement(self) -> int:
        with self._lock:
            self._value -= 1
            logger.info("decrement → %d", self._value)
            return self._value

    def get_value(self) -> int:
        with self._lock:
            return self._value


# 测试
counter = ThreadSafeCounter()
threads = []
for i in range(100):
    t = threading.Thread(target=counter.increment)
    threads.append(t)
    t.start()
for t in threads:
    t.join()

assert counter.get_value() == 100, f"Expected 100, got {counter.get_value()}"
logger.info("最终值: %d ✓", counter.get_value())
```

</details>

### 练习 2：并发下载器（中级）

使用 `ThreadPoolExecutor` 实现一个并发 URL 下载器，支持：
- 限制最大并发数
- 返回每个 URL 的下载结果或错误
- 统计成功/失败数量

<details>
<summary>💡 提示</summary>

使用 `submit()` + `as_completed()` 模式，用 `try/except` 处理每个 Future 的异常。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
from concurrent.futures import ThreadPoolExecutor, as_completed, Future
from dataclasses import dataclass
import time
import random
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class DownloadResult:
    url: str
    success: bool
    data: str | None = None
    error: str | None = None


def download_url(url: str) -> DownloadResult:
    logger.info("下载: %s", url)
    time.sleep(random.uniform(0.5, 2.0))
    if random.random() < 0.3:
        raise ConnectionError(f"无法连接 {url}")
    return DownloadResult(url=url, success=True, data=f"Content of {url}")


def batch_download(urls: list[str], max_workers: int = 4) -> list[DownloadResult]:
    results: list[DownloadResult] = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url: dict[Future, str] = {
            executor.submit(download_url, url): url for url in urls
        }
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                results.append(DownloadResult(url=url, success=False, error=str(e)))

    success_count = sum(1 for r in results if r.success)
    fail_count = len(results) - success_count
    logger.info("完成: %d 成功, %d 失败", success_count, fail_count)
    return results


urls = [f"https://example.com/page/{i}" for i in range(10)]
results = batch_download(urls, max_workers=3)
for r in results:
    status = "✅" if r.success else "❌"
    logger.info("%s %s: %s", status, r.url, r.data or r.error)
```

</details>

### 练习 3：读写锁（高级）

实现一个读写锁（ReadWriteLock），允许多个读者同时读，但写者必须独占。

<details>
<summary>💡 提示</summary>

使用 `threading.Condition` 追踪读者数量和写者状态。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
import threading
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(threadName)s] %(message)s')
logger = logging.getLogger(__name__)


class ReadWriteLock:
    def __init__(self) -> None:
        self._condition = threading.Condition()
        self._readers: int = 0
        self._writer: bool = False

    def acquire_read(self) -> None:
        with self._condition:
            while self._writer:
                self._condition.wait()
            self._readers += 1
            logger.info("获取读锁 (readers=%d)", self._readers)

    def release_read(self) -> None:
        with self._condition:
            self._readers -= 1
            logger.info("释放读锁 (readers=%d)", self._readers)
            if self._readers == 0:
                self._condition.notify_all()

    def acquire_write(self) -> None:
        with self._condition:
            while self._writer or self._readers > 0:
                self._condition.wait()
            self._writer = True
            logger.info("获取写锁")

    def release_write(self) -> None:
        with self._condition:
            self._writer = False
            logger.info("释放写锁")
            self._condition.notify_all()


# 测试
rw_lock = ReadWriteLock()
shared_data: list[int] = [0]


def reader(reader_id: int) -> None:
    for _ in range(3):
        rw_lock.acquire_read()
        logger.info("Reader %d 读取: %s", reader_id, shared_data)
        time.sleep(0.1)
        rw_lock.release_read()
        time.sleep(0.05)


def writer(writer_id: int) -> None:
    for i in range(3):
        rw_lock.acquire_write()
        shared_data[0] += 1
        logger.info("Writer %d 写入: %s", writer_id, shared_data)
        time.sleep(0.2)
        rw_lock.release_write()
        time.sleep(0.1)


threads = (
    [threading.Thread(target=reader, args=(i,), name=f"Reader-{i}") for i in range(3)]
    + [threading.Thread(target=writer, args=(i,), name=f"Writer-{i}") for i in range(2)]
)
for t in threads:
    t.start()
for t in threads:
    t.join()
```

</details>

---

## 参考资源 / 下一步

**官方文档：**
- [threading — Thread-based parallelism](https://docs.python.org/3/library/threading.html)
- [concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)
- [queue — A synchronized queue class](https://docs.python.org/3/library/queue.html)

**推荐阅读：**
- *Fluent Python, 2nd Ed.* — Chapter 19: Concurrency Models in Python
- *Effective Python, 3rd Ed.* — Item 53-57: Concurrency and Parallelism
- [Real Python: Threading in Python](https://realpython.com/intro-to-python-threading/)

---

**导航：**

| 上一章 | 目录 | 下一章 |
|:---|:---:|---:|
| [第 3 章：元类](../03-metaclasses/) | [Stage 3 目录](../README.md) | [第 5 章：multiprocessing](../05-concurrency-multiprocessing/) |
