# 第 5 章：multiprocessing — 进程并行

> *"Do not communicate by sharing memory; instead, share memory by communicating."*
> — Rob Pike (Go Proverbs)
>
> 当 GIL 成为瓶颈，线程无法释放 CPU 的全部潜力时，
> 进程是你打破枷锁的重锤。每个进程拥有独立的 GIL、独立的内存空间——
> 代价是通信变得昂贵，但你获得了真正的并行。

---

## 📖 本章内容

- [1. 为什么需要多进程](#1-为什么需要多进程)
- [2. Process 基础](#2-process-基础)
- [3. 进程间通信](#3-进程间通信)
- [4. ProcessPoolExecutor](#4-processpoolexecutor)
- [5. multiprocessing vs threading 对比](#5-multiprocessing-vs-threading-对比)
- [6. 进程池的陷阱与最佳实践](#6-进程池的陷阱与最佳实践)
- [最佳实践 / 常见陷阱](#最佳实践践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. 为什么需要多进程

> 🎭 **The Drama: 突破 GIL 的唯一方式（在 CPython 中）**
>
> 想象一座工厂，GIL 是一条只能容纳一个工人的通道。
> 多线程就像让多个工人排队走这条通道——同一时刻只有一个在工作。
> 多进程则是复制整座工厂——每座工厂有自己的通道，工人们真正并行工作。
> 代价？每座工厂都需要完整的设备（内存）和物流系统（IPC）。

### 1.1 线程 vs 进程：内存模型

```
┌──────────────────────────────────────────────────────────────────┐
│                    多线程（threading）                             │
│                                                                  │
│  ┌─────────────────── 进程 ───────────────────┐                  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐        │                  │
│  │  │Thread 1│  │Thread 2│  │Thread 3│        │                  │
│  │  └───┬────┘  └───┬────┘  └───┬────┘        │                  │
│  │      │           │           │              │                  │
│  │      └───────────┼───────────┘              │                  │
│  │                  │                          │                  │
│  │      ┌───────────▼───────────┐              │                  │
│  │      │   共享内存空间         │  ← 同一 GIL  │                  │
│  │      │   (全局变量、堆)       │              │                  │
│  │      └───────────────────────┘              │                  │
│  └─────────────────────────────────────────────┘                  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                    多进程（multiprocessing）                       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   进程 1      │  │   进程 2      │  │   进程 3      │           │
│  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │           │
│  │  │ GIL 1  │  │  │  │ GIL 2  │  │  │  │ GIL 3  │  │           │
│  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │           │
│  │  独立内存    │  │  独立内存    │  │  独立内存    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         ↕                ↕                ↕                      │
│     ┌────────────────────────────────────────┐                   │
│     │        IPC (Queue, Pipe, 共享内存)       │                   │
│     └────────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 何时使用多进程

| 场景 | 推荐方案 | 原因 |
|:---|:---|:---|
| 图像处理 / 视频编码 | `multiprocessing` | CPU 密集，需要多核 |
| 数学计算 / 科学模拟 | `multiprocessing` | CPU 密集，需要多核 |
| 数据转换 / ETL | `multiprocessing` | CPU 密集，数据可分割 |
| 网络爬虫 | `asyncio` 或 `threading` | I/O 密集 |
| Web 服务器 | `asyncio` | I/O 密集 |
| 文件压缩 | `multiprocessing` | CPU 密集 |

```python
import time
import multiprocessing
import threading
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def cpu_heavy(n: int) -> int:
    """CPU 密集型任务"""
    total = 0
    for i in range(n):
        total += i * i
    return total


# ❌ 多线程处理 CPU 密集型：受 GIL 限制，无加速
start = time.perf_counter()
threads = [threading.Thread(target=cpu_heavy, args=(5_000_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
thread_time = time.perf_counter() - start
logger.info("4 线程 CPU 密集: %.2f 秒", thread_time)

# ✅ 多进程处理 CPU 密集型：真正并行
start = time.perf_counter()
processes = [multiprocessing.Process(target=cpu_heavy, args=(5_000_000,)) for _ in range(4)]
for p in processes:
    p.start()
for p in processes:
    p.join()
process_time = time.perf_counter() - start
logger.info("4 进程 CPU 密集: %.2f 秒", process_time)
logger.info("加速比: %.2fx", thread_time / process_time)
```

---

## 2. Process 基础

> ⚛️ **The Science: fork vs spawn**
>
> 在 Unix 系统上，`multiprocessing` 默认使用 `fork()` 创建子进程——
> 子进程是父进程的完整副本（写时复制）。
> 在 Windows 上（以及 macOS 3.8+），默认使用 `spawn`——
> 启动一个新的 Python 解释器，重新导入模块。
>
> 这就是为什么 Windows 上必须用 `if __name__ == "__main__":`——
> 否则导入模块时会递归创建进程。

### 2.1 创建和管理进程

```python
import multiprocessing
import os
import time
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)


def worker(name: str, duration: float) -> None:
    logger.info("进程 '%s' 启动, PID=%d, 父PID=%d", name, os.getpid(), os.getppid())
    time.sleep(duration)
    logger.info("进程 '%s' 完成", name)


if __name__ == "__main__":
    logger.info("主进程 PID=%d", os.getpid())

    # ✅ 创建进程
    p1 = multiprocessing.Process(target=worker, args=("Worker-1", 2.0))
    p2 = multiprocessing.Process(target=worker, args=("Worker-2", 1.0))

    p1.start()
    p2.start()

    logger.info("p1 alive=%s, p2 alive=%s", p1.is_alive(), p2.is_alive())

    p1.join()
    p2.join()

    logger.info("p1 exitcode=%d, p2 exitcode=%d", p1.exitcode, p2.exitcode)
```

### 2.2 进程启动方式

```python
import multiprocessing

# ✅ 查看和设置启动方式
print(multiprocessing.get_start_method())  # 'spawn' (Windows) / 'fork' (Linux)

# 可选方式:
# - 'fork':    复制父进程（快，但可能复制锁状态 → 死锁）
# - 'spawn':   启动新解释器（慢，但安全）
# - 'forkserver': fork 服务进程（Linux，折中方案）
```

| 启动方式 | 平台 | 速度 | 安全性 | 默认平台 |
|:---|:---|:---|:---|:---|
| `fork` | Unix | 快 | 可能死锁 | Linux |
| `spawn` | 全平台 | 慢 | 安全 | Windows, macOS |
| `forkserver` | Unix | 中等 | 安全 | — |

### 2.3 进程的返回值

进程不能直接返回值（不像线程可以通过对象属性）。需要用 IPC 或 `Pool`/`ProcessPoolExecutor`。

```python
import multiprocessing
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)


def compute_square(x: int, result_queue: multiprocessing.Queue) -> None:
    """通过 Queue 返回结果"""
    result = x * x
    logger.info("%d^2 = %d", x, result)
    result_queue.put((x, result))


if __name__ == "__main__":
    result_queue: multiprocessing.Queue = multiprocessing.Queue()

    processes = [
        multiprocessing.Process(target=compute_square, args=(i, result_queue))
        for i in range(5)
    ]

    for p in processes:
        p.start()
    for p in processes:
        p.join()

    # ✅ 从队列中收集结果
    results = {}
    while not result_queue.empty():
        x, result = result_queue.get()
        results[x] = result

    logger.info("结果: %s", results)
```

---

## 3. 进程间通信

> 🧰 **Toolbox: IPC 方式选择指南**
>
> 进程不共享内存，所以通信必须通过特定机制。
> Python 的 `multiprocessing` 提供了多种 IPC 方式，
> 每种有不同的适用场景。

### 3.1 Queue

```python
import multiprocessing
import time
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)


def producer(q: multiprocessing.Queue, items: list[str]) -> None:
    for item in items:
        q.put(item)
        logger.info("生产: %s", item)
        time.sleep(0.1)
    q.put(None)  # 哨兵值


def consumer(q: multiprocessing.Queue) -> None:
    while True:
        item = q.get()
        if item is None:
            break
        logger.info("消费: %s", item)
        time.sleep(0.2)


if __name__ == "__main__":
    q: multiprocessing.Queue = multiprocessing.Queue(maxsize=5)

    p = multiprocessing.Process(target=producer, args=(q, ["a", "b", "c", "d", "e"]))
    c = multiprocessing.Process(target=consumer, args=(q,))

    p.start()
    c.start()
    p.join()
    c.join()
```

### 3.2 Pipe

```python
import multiprocessing
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)


def sender(conn: multiprocessing.Connection) -> None:
    """通过 Pipe 发送数据"""
    messages = ["hello", "world", "done"]
    for msg in messages:
        conn.send(msg)
        logger.info("发送: %s", msg)
    conn.close()


def receiver(conn: multiprocessing.Connection) -> None:
    """通过 Pipe 接收数据"""
    while True:
        try:
            msg = conn.recv()
            logger.info("接收: %s", msg)
            if msg == "done":
                break
        except EOFError:
            break
    conn.close()


if __name__ == "__main__":
    # ✅ Pipe 创建两个连接端点
    parent_conn, child_conn = multiprocessing.Pipe()

    s = multiprocessing.Process(target=sender, args=(parent_conn,))
    r = multiprocessing.Process(target=receiver, args=(child_conn,))

    s.start()
    r.start()
    s.join()
    r.join()
```

### 3.3 共享内存（Value, Array）

```python
import multiprocessing
import ctypes
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)


def increment_shared(counter: multiprocessing.Value, lock: multiprocessing.Lock, n: int) -> None:
    """使用共享值（带锁）"""
    for _ in range(n):
        with lock:
            counter.value += 1


if __name__ == "__main__":
    # ✅ Value: 共享单个值
    counter = multiprocessing.Value(ctypes.c_int, 0)
    lock = multiprocessing.Lock()

    processes = [
        multiprocessing.Process(target=increment_shared, args=(counter, lock, 100_000))
        for _ in range(4)
    ]

    for p in processes:
        p.start()
    for p in processes:
        p.join()

    logger.info("共享计数器: %d (期望 400,000)", counter.value)

    # ✅ Array: 共享数组
    shared_array = multiprocessing.Array(ctypes.c_double, [0.0, 0.0, 0.0])
    logger.info("共享数组: %s", list(shared_array))
```

### 3.4 Manager

```python
import multiprocessing
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)


def worker_with_manager(
    shared_dict: dict,
    shared_list: list,
    worker_id: int,
) -> None:
    """使用 Manager 提供的共享数据结构"""
    shared_dict[f"worker-{worker_id}"] = f"result-{worker_id}"
    shared_list.append(worker_id)
    logger.info("Worker %d: dict=%s, list=%s", worker_id, dict(shared_dict), list(shared_list))


if __name__ == "__main__":
    # ✅ Manager 提供更高级的共享数据结构
    with multiprocessing.Manager() as manager:
        shared_dict = manager.dict()
        shared_list = manager.list()

        processes = [
            multiprocessing.Process(
                target=worker_with_manager,
                args=(shared_dict, shared_list, i),
            )
            for i in range(4)
        ]

        for p in processes:
            p.start()
        for p in processes:
            p.join()

        logger.info("最终 dict: %s", dict(shared_dict))
        logger.info("最终 list: %s", list(shared_list))
```

### IPC 方式对比

| 方式 | 适用场景 | 性能 | 灵活性 | 复杂度 |
|:---|:---|:---|:---|:---|
| `Queue` | 生产者-消费者 | 中 | 中 | 低 |
| `Pipe` | 两个进程通信 | 高 | 低 | 低 |
| `Value/Array` | 共享简单数据 | 最高 | 低 | 中 |
| `Manager` | 共享复杂数据结构 | 低 | 高 | 中 |
| `shared_memory` (3.8+) | 大块数据共享 | 最高 | 中 | 高 |

---

## 4. ProcessPoolExecutor

> 🌌 **The Big Picture: 统一的并发接口**
>
> `concurrent.futures` 的天才之处在于：`ThreadPoolExecutor` 和 `ProcessPoolExecutor`
> 共享相同的 API。切换并发策略只需要改一个类名。

### 4.1 基本用法

```python
from concurrent.futures import ProcessPoolExecutor, as_completed
import time
import os
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)


def heavy_computation(n: int) -> tuple[int, int]:
    """CPU 密集型计算"""
    logger.info("计算 fib(%d), PID=%d", n, os.getpid())
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return n, a


if __name__ == "__main__":
    numbers = [100_000, 200_000, 300_000, 400_000]

    start = time.perf_counter()

    # ✅ ProcessPoolExecutor — 与 ThreadPoolExecutor 相同的 API
    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(heavy_computation, n): n for n in numbers
        }

        for future in as_completed(futures):
            n = futures[future]
            try:
                _, result = future.result()
                logger.info("fib(%d) 的位数: %d", n, len(str(result)))
            except Exception as e:
                logger.error("fib(%d) 失败: %s", n, e)

    elapsed = time.perf_counter() - start
    logger.info("总耗时: %.2f 秒", elapsed)
```

### 4.2 map() 的 chunksize

```python
from concurrent.futures import ProcessPoolExecutor
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def square(x: int) -> int:
    return x * x


if __name__ == "__main__":
    data = list(range(100_000))

    # ❌ chunksize=1（默认）：每个任务单独序列化 → 开销大
    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        results1 = list(executor.map(square, data, chunksize=1))
    t1 = time.perf_counter() - start
    logger.info("chunksize=1: %.2f 秒", t1)

    # ✅ chunksize=1000：批量发送 → 减少 IPC 开销
    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        results2 = list(executor.map(square, data, chunksize=1000))
    t2 = time.perf_counter() - start
    logger.info("chunksize=1000: %.2f 秒", t2)
    logger.info("加速比: %.2fx", t1 / t2)
```

### 4.3 initializer — 进程初始化

```python
from concurrent.futures import ProcessPoolExecutor
import os
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)

# 进程级别的全局状态
_db_connection = None


def init_worker(db_url: str) -> None:
    """每个工作进程启动时调用一次"""
    global _db_connection
    _db_connection = f"Connection({db_url}, pid={os.getpid()})"
    logger.info("初始化数据库连接: %s", _db_connection)


def query(query_str: str) -> str:
    """使用已初始化的连接"""
    return f"[{_db_connection}] → {query_str}"


if __name__ == "__main__":
    # ✅ initializer 在每个工作进程启动时执行一次
    with ProcessPoolExecutor(
        max_workers=2,
        initializer=init_worker,
        initargs=("postgresql://localhost/mydb",),
    ) as executor:
        queries = [f"SELECT * FROM table_{i}" for i in range(6)]
        results = list(executor.map(query, queries))

    for r in results:
        logger.info("%s", r)
```

---

## 5. multiprocessing vs threading 对比

> 🧠 **CS Master's Bridge: 进程 vs 线程 — 操作系统视角**
>
> 从操作系统角度：
> - **进程**是资源分配的基本单位（独立地址空间、文件描述符表）
> - **线程**是 CPU 调度的基本单位（共享进程的资源）
>
> Linux 中两者都由 `clone()` 系统调用创建，区别在于共享标志。
> Python 的 `multiprocessing` 在 Unix 上通常用 `fork()`，
> 在 Windows 上用 `CreateProcess()`。

### 全面对比表

| 维度 | `threading` | `multiprocessing` |
|:---|:---|:---|
| **GIL** | 受限 | 不受限（独立 GIL） |
| **内存空间** | 共享 | 独立 |
| **数据共享** | 直接访问（需锁） | 需 IPC（序列化） |
| **创建开销** | ~1ms | ~50-100ms |
| **内存开销** | ~8MB (栈) | 整个进程复制 |
| **CPU 密集** | 无加速 | 线性加速 |
| **I/O 密集** | 有效 | 过度（开销大） |
| **调试** | 困难（竞态条件） | 较容易（进程隔离） |
| **异常处理** | 线程异常可能被忽略 | 进程崩溃不影响主进程 |
| **适用规模** | 数十到数百线程 | 通常 ≤ CPU 核心数 |

### 决策矩阵

```
你的任务需要多核并行吗？
│
├── 是 → CPU 密集型
│   │
│   ├── 任务间需要频繁通信？
│   │   ├── 是 → multiprocessing + shared_memory
│   │   └── 否 → ProcessPoolExecutor（最简单）
│   │
│   └── 数据量非常大？
│       ├── 是 → multiprocessing + numpy (释放 GIL)
│       └── 否 → ProcessPoolExecutor
│
└── 否 → I/O 密集型
    │
    ├── 需要极高并发 (>1000)？
    │   └── asyncio
    │
    └── 中等并发 (<100)？
        └── ThreadPoolExecutor
```

---

## 6. 进程池的陷阱与最佳实践

### 6.1 序列化陷阱

```python
from concurrent.futures import ProcessPoolExecutor
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# ❌ lambda 不能被 pickle 序列化
# with ProcessPoolExecutor() as executor:
#     executor.submit(lambda x: x * x, 5)  # PicklingError!

# ❌ 嵌套函数不能被 pickle 序列化（某些情况）
# def outer():
#     def inner(x):
#         return x * x
#     with ProcessPoolExecutor() as executor:
#         executor.submit(inner, 5)  # 可能 PicklingError!

# ✅ 使用模块级函数
def square(x: int) -> int:
    return x * x

if __name__ == "__main__":
    with ProcessPoolExecutor() as executor:
        result = executor.submit(square, 5).result()
        logger.info("✅ 模块级函数: %d", result)
```

### 6.2 Windows 上的 `if __name__ == "__main__"` 问题

```python
import multiprocessing
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def worker() -> None:
    logger.info("Worker 运行")


# ❌ 没有 __name__ 保护（Windows 上会无限递归创建进程）
# p = multiprocessing.Process(target=worker)
# p.start()

# ✅ 必须用 __name__ 保护
if __name__ == "__main__":
    p = multiprocessing.Process(target=worker)
    p.start()
    p.join()
```

### 6.3 大对象传递的开销

```python
from concurrent.futures import ProcessPoolExecutor
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def sum_list(data: list[int]) -> int:
    return sum(data)


if __name__ == "__main__":
    # ❌ 传递大对象：序列化开销可能超过计算本身
    big_data = list(range(1_000_000))

    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        # 每次 submit 都会 pickle big_data（~30MB）
        futures = [executor.submit(sum_list, big_data) for _ in range(4)]
        results = [f.result() for f in futures]
    elapsed = time.perf_counter() - start
    logger.info("❌ 传递大对象: %.2f 秒", elapsed)

    # ✅ 解决方案1: 用 initializer 在工作进程中加载数据
    # ✅ 解决方案2: 用 shared_memory (Python 3.8+)
    # ✅ 解决方案3: 用 numpy + 内存映射文件
```

---

## 最佳实践 / 常见陷阱

### 最佳实践

```python
import multiprocessing
from concurrent.futures import ProcessPoolExecutor
import os

# ✅ 1. 优先使用 ProcessPoolExecutor
with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
    results = list(executor.map(process, items, chunksize=100))

# ✅ 2. 合理设置 worker 数量
# CPU 密集型：worker 数 = CPU 核心数
# 混合型：worker 数 = CPU 核心数 + 1（多一个处理偶尔的 I/O 等待）
workers = os.cpu_count()

# ✅ 3. 使用 chunksize 减少 IPC 开销
# 当任务数量远大于 worker 数时，增大 chunksize
executor.map(func, large_iterable, chunksize=1000)

# ✅ 4. 用 initializer 初始化昂贵资源
ProcessPoolExecutor(
    initializer=init_worker,
    initargs=("config_value",),
)

# ✅ 5. 始终使用 if __name__ == "__main__"
if __name__ == "__main__":
    main()
```

### 常见陷阱

```python
# ❌ 陷阱 1：忘记 if __name__ == "__main__" (Windows 崩溃)
# ❌ 陷阱 2：传递不可序列化的对象 (lambda, socket, 数据库连接)
# ❌ 陷阱 3：传递大对象导致 IPC 开销过大
# ❌ 陷阱 4：fork 后使用锁可能导致死锁
# ❌ 陷阱 5：子进程中修改全局变量不会影响主进程
```

```python
import multiprocessing
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)

global_var = 0

def modify_global() -> None:
    global global_var
    global_var = 42
    logger.info("子进程中 global_var = %d", global_var)


if __name__ == "__main__":
    p = multiprocessing.Process(target=modify_global)
    p.start()
    p.join()

    # ❌ 主进程的 global_var 没有改变！
    logger.info("主进程中 global_var = %d", global_var)  # 0, 不是 42
```

---

## 练习题

### 练习 1：并行素数检测（基础）

使用 `ProcessPoolExecutor` 并行检测一批大数是否为素数，对比单进程和多进程的耗时。

<details>
<summary>💡 提示</summary>

写一个 `is_prime(n)` 函数，用 `executor.map()` 批量调用。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
from concurrent.futures import ProcessPoolExecutor
import time
import math
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def is_prime(n: int) -> tuple[int, bool]:
    if n < 2:
        return n, False
    if n < 4:
        return n, True
    if n % 2 == 0 or n % 3 == 0:
        return n, False
    for i in range(5, int(math.sqrt(n)) + 1, 6):
        if n % i == 0 or n % (i + 2) == 0:
            return n, False
    return n, True


if __name__ == "__main__":
    # 一批大数
    numbers = [
        15485863, 15485867, 32452843, 32452847,
        49979687, 49979693, 67867967, 67867979,
        86028121, 86028157, 104395301, 104395303,
    ]

    # 单进程
    start = time.perf_counter()
    results_seq = [is_prime(n) for n in numbers]
    seq_time = time.perf_counter() - start
    logger.info("单进程: %.4f 秒", seq_time)

    # 多进程
    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
        results_par = list(executor.map(is_prime, numbers))
    par_time = time.perf_counter() - start
    logger.info("多进程: %.4f 秒", par_time)
    logger.info("加速比: %.2fx", seq_time / par_time)

    for n, is_p in results_par:
        logger.info("%d → %s", n, "素数" if is_p else "合数")
```

</details>

### 练习 2：进程间管道通信（中级）

实现两个进程通过 `Pipe` 进行双向通信：一个发送计算任务，另一个返回结果。

<details>
<summary>💡 提示</summary>

使用 `Pipe()` 创建双端连接，一端发送请求，另一端计算并发回结果。

</details>

<details>
<summary>✅ 参考答案</summary>

```python
import multiprocessing
import logging

logging.basicConfig(level=logging.INFO, format='[PID %(process)d] %(message)s')
logger = logging.getLogger(__name__)


def calculator(conn: multiprocessing.connection.Connection) -> None:
    """计算进程：接收任务，返回结果"""
    while True:
        try:
            task = conn.recv()
            if task == "QUIT":
                logger.info("计算器退出")
                break
            op, a, b = task
            if op == "+":
                result = a + b
            elif op == "*":
                result = a * b
            else:
                result = f"未知操作: {op}"
            logger.info("计算: %s %s %s = %s", a, op, b, result)
            conn.send(result)
        except EOFError:
            break
    conn.close()


if __name__ == "__main__":
    parent_conn, child_conn = multiprocessing.Pipe()

    calc_process = multiprocessing.Process(target=calculator, args=(child_conn,))
    calc_process.start()

    # 发送任务并接收结果
    tasks = [("+", 10, 20), ("*", 7, 8), ("+", 100, 200)]
    for task in tasks:
        parent_conn.send(task)
        result = parent_conn.recv()
        logger.info("收到结果: %s", result)

    parent_conn.send("QUIT")
    calc_process.join()
    parent_conn.close()
```

</details>

---

## 参考资源 / 下一步

**官方文档：**
- [multiprocessing — Process-based parallelism](https://docs.python.org/3/library/multiprocessing.html)
- [multiprocessing.shared_memory](https://docs.python.org/3/library/multiprocessing.shared_memory.html)
- [concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)

**推荐阅读：**
- *Fluent Python, 2nd Ed.* — Chapter 19: Concurrency Models
- *High Performance Python, 2nd Ed.* — Chapter 9: The multiprocessing Module

---

**导航：**

| 上一章 | 目录 | 下一章 |
|:---|:---:|---:|
| [第 4 章：threading](../04-concurrency-threading/) | [Stage 3 目录](../README.md) | [第 6 章：asyncio](../06-concurrency-asyncio/) |
