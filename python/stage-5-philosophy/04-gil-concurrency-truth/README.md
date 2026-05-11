# 第 4 章：GIL 的真相

> *"The best performance improvement is the transition from the nonworking state to the working state."*
> — John Ousterhout
>
> 在 Python 世界里，没有比 GIL 更能引发争论的话题了。
> "Python 因为 GIL 不能真正多线程！" —— 这是最常被引用的半真半假的说法。
> 它是半真的，因为 GIL 确实限制了 CPU 并行。
> 它是半假的，因为大多数抱怨 GIL 的人，根本不需要 CPU 并行。
> 本章将拨开迷雾，告诉你 GIL 的真相——它保护了什么，它限制了什么，以及它正在如何改变。

---

## 📖 本章内容

- [GIL 是什么，为什么存在](#gil-是什么为什么存在)
- [GIL 对多线程的真实影响](#gil-对多线程的真实影响)
- [CPU 密集 vs I/O 密集](#cpu-密集-vs-io-密集)
- [GIL 的释放时机](#gil-的释放时机)
- [绕过 GIL 的策略](#绕过-gil-的策略)
- [PEP 703：自由线程 Python](#pep-703自由线程-python)
- [GIL 争论的历史与未来](#gil-争论的历史与未来)

---

## GIL 是什么，为什么存在

> 🧠 **CS Master's Bridge：从操作系统的锁说起**
>
> 在多线程编程中，**共享状态** 是万恶之源。
> 两个线程同时修改同一个变量，结果不可预测（竞态条件）。
> 解决方案：**锁**（Mutex）。
>
> GIL 就是一把锁——但不是保护 *你的* 数据的锁，
> 而是保护 *CPython 解释器内部数据* 的锁。

### GIL 的定义

```
GIL = Global Interpreter Lock（全局解释器锁）

一个互斥锁（Mutex），确保在任意时刻，
只有一个线程在执行 Python 字节码。

┌─────────────────────────────────────────────┐
│                CPython 进程                   │
│                                              │
│  线程 A ████████░░░░░░░░████████░░░░░░░░     │
│  线程 B ░░░░░░░░████████░░░░░░░░████████     │
│  线程 C ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│                                              │
│  ████ = 持有 GIL，执行 Python 字节码          │
│  ░░░░ = 等待 GIL 或执行非 Python 代码         │
│                                              │
│  注意：同一时刻只有一个 ████                   │
└─────────────────────────────────────────────┘
```

### 为什么需要 GIL

```
问题的根源：引用计数不是原子操作

假设没有 GIL：

线程 A                       线程 B
────────                    ────────
a = some_object             b = some_object
  → Py_INCREF(some_object)    → Py_INCREF(some_object)

在 C 层面，Py_INCREF 是：
  ob_refcnt = ob_refcnt + 1

这不是原子操作！在 x86 上展开为：
  MOV  eax, [ob_refcnt]     ; 读取当前值
  ADD  eax, 1               ; 加 1
  MOV  [ob_refcnt], eax     ; 写回

两个线程交错执行：
  线程 A: MOV eax, [ob_refcnt]   ; eax_A = 1
  线程 B: MOV eax, [ob_refcnt]   ; eax_B = 1（还是 1！）
  线程 A: ADD eax, 1             ; eax_A = 2
  线程 B: ADD eax, 1             ; eax_B = 2
  线程 A: MOV [ob_refcnt], eax   ; ob_refcnt = 2
  线程 B: MOV [ob_refcnt], eax   ; ob_refcnt = 2（应该是 3！）

引用计数错误 → 对象被提前释放 → 段错误/数据损坏
```

### Guido 的选择

```
1991 年，Guido 面临的选择：

方案 A：细粒度锁（每个对象一把锁）
  ✅ 真正的多线程并行
  ❌ 每个对象多 8-16 字节（锁的开销）
  ❌ 每次访问对象都要加锁/解锁
  ❌ 单线程性能下降 30-40%
  ❌ 死锁风险
  ❌ 实现复杂度暴增

方案 B：原子操作（引用计数用 atomic 指令）
  ✅ 无锁竞争
  ❌ 原子操作比普通操作慢 10-100 倍
  ❌ 1991 年的 CPU 对原子操作支持有限
  ❌ 单线程性能显著下降

方案 C：全局锁（GIL）
  ✅ 实现极简——一把锁搞定一切
  ✅ 单线程性能零开销
  ✅ C 扩展开发简单——不用考虑线程安全
  ✅ 现有代码全部兼容
  ❌ 多线程无法利用多核（CPU 密集型）
  ❌ 一旦选择，很难回头

Guido 选择了方案 C。
在 1991 年，多核 CPU 还是稀有品。
这个选择在当时完全合理。
```

> 🎭 **The Drama：一个 1991 年的决定**
>
> GIL 是在多核 CPU 普及之前设计的。当时的硬件环境：
> - 1991: Intel 486（单核）
> - 2001: Pentium 4（单核，但开始有超线程）
> - 2006: Core 2 Duo（真正的消费级双核）
> - 2024: M3 Max（16 核）
>
> Guido 为单核时代做了最优选择。30+ 年后，硬件变了，但选择的惯性还在。
> 这就像一座城市的地下管网——当初的设计限制了未来的可能，
> 但你不能把城市推倒重来。

---

## GIL 对多线程的真实影响

### 用实验说话

```python
import threading
import time

def cpu_bound(n):
    """CPU 密集型任务：计算"""
    count = 0
    for i in range(n):
        count += i * i
    return count

def io_bound(seconds):
    """I/O 密集型任务：等待"""
    time.sleep(seconds)

N = 50_000_000

# ========== CPU 密集型测试 ==========

# 单线程
start = time.perf_counter()
cpu_bound(N)
cpu_bound(N)
single_thread_time = time.perf_counter() - start
print(f"CPU 密集 - 单线程: {single_thread_time:.2f}s")

# 双线程
start = time.perf_counter()
t1 = threading.Thread(target=cpu_bound, args=(N,))
t2 = threading.Thread(target=cpu_bound, args=(N,))
t1.start(); t2.start()
t1.join(); t2.join()
two_thread_time = time.perf_counter() - start
print(f"CPU 密集 - 双线程: {two_thread_time:.2f}s")
print(f"加速比: {single_thread_time / two_thread_time:.2f}x")

# ========== I/O 密集型测试 ==========

# 单线程
start = time.perf_counter()
io_bound(1)
io_bound(1)
single_io_time = time.perf_counter() - start
print(f"\nI/O 密集 - 单线程: {single_io_time:.2f}s")

# 双线程
start = time.perf_counter()
t1 = threading.Thread(target=io_bound, args=(1,))
t2 = threading.Thread(target=io_bound, args=(1,))
t1.start(); t2.start()
t1.join(); t2.join()
two_io_time = time.perf_counter() - start
print(f"I/O 密集 - 双线程: {two_io_time:.2f}s")
print(f"加速比: {single_io_time / two_io_time:.2f}x")
```

典型输出：

```
CPU 密集 - 单线程: 6.42s
CPU 密集 - 双线程: 6.58s     ← 没有加速！甚至更慢（GIL 竞争开销）
加速比: 0.98x

I/O 密集 - 单线程: 2.00s
I/O 密集 - 双线程: 1.00s     ← 接近 2 倍加速！
加速比: 2.00x
```

### 结果解读

```
GIL 对不同工作负载的影响：

                    单线程      多线程(N个)    加速比
                    ─────────  ──────────    ─────
CPU 密集型          T           ~T           ~1x (无加速)
I/O 密集型          T           ~T/N         ~Nx (线性加速)
混合型              T           变化大        1x ~ Nx

原因：
┌──────────────────────────────────────┐
│ CPU 密集：线程在执行 Python 字节码    │
│ → 需要 GIL → 同一时刻只有一个线程执行 │
│ → 加上线程切换开销 → 可能更慢         │
│                                       │
│ I/O 密集：线程在等待 I/O（网络/磁盘） │
│ → I/O 等待时释放 GIL                  │
│ → 其他线程可以执行 → 真正的并发       │
└──────────────────────────────────────┘
```

---

## CPU 密集 vs I/O 密集

> ⚛️ **The Science：并发 vs 并行**
>
> 这两个概念经常被混淆，但它们本质不同：
>
> **并发 (Concurrency)**：同时处理多件事的 *结构*
> **并行 (Parallelism)**：同时执行多件事的 *执行方式*
>
> ```
> 并发但不并行（GIL 下的多线程）：
> 时间 →
> 线程 A: ████░░░░████░░░░████
> 线程 B: ░░░░████░░░░████░░░░
> （快速交替，看起来同时，实际上轮流）
>
> 并发且并行（multiprocessing）：
> 时间 →
> 进程 A: ████████████████████
> 进程 B: ████████████████████
> （真正同时执行在不同的 CPU 核心上）
> ```

### 识别你的工作负载

```
工作负载分类决策树：

你的程序在做什么？
│
├── 等待外部事件
│   ├── 网络请求（HTTP、数据库查询）
│   ├── 文件读写
│   ├── 用户输入
│   └── 定时器
│   → I/O 密集型
│   → 瓶颈是等待时间，不是 CPU
│   → GIL 影响小，threading/asyncio 有效
│
├── 纯计算
│   ├── 数学运算
│   ├── 图像处理
│   ├── 加密/压缩
│   ├── 机器学习训练
│   └── 数据分析
│   → CPU 密集型
│   → 瓶颈是 CPU 能力
│   → GIL 影响大，需要 multiprocessing 或 C 扩展
│
└── 两者都有
    ├── Web 服务器（接收请求 + 处理逻辑）
    ├── ETL 管道（读取 + 转换 + 写入）
    └── 爬虫（网络请求 + 解析 HTML）
    → 混合型
    → 分离 I/O 和 CPU 部分，分别处理
```

### I/O 密集型：GIL 不是问题

```python
import asyncio
import aiohttp
import time

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    urls = [f"https://httpbin.org/delay/1" for _ in range(10)]

    async with aiohttp.ClientSession() as session:
        start = time.perf_counter()
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        elapsed = time.perf_counter() - start

    print(f"10 个请求（每个 1s 延迟）: {elapsed:.2f}s")
    # 输出约 1.1s（并发请求），而非 10s（串行请求）

asyncio.run(main())
```

### CPU 密集型：绕过 GIL

```python
import multiprocessing
import time

def cpu_task(n):
    """CPU 密集型计算"""
    return sum(i * i for i in range(n))

N = 50_000_000

# 单进程
start = time.perf_counter()
cpu_task(N)
cpu_task(N)
cpu_task(N)
cpu_task(N)
serial_time = time.perf_counter() - start
print(f"串行: {serial_time:.2f}s")

# 多进程
start = time.perf_counter()
with multiprocessing.Pool(4) as pool:
    results = pool.map(cpu_task, [N] * 4)
parallel_time = time.perf_counter() - start
print(f"4 进程并行: {parallel_time:.2f}s")
print(f"加速比: {serial_time / parallel_time:.2f}x")
# 4 核机器上约 3.5-3.8x 加速
```

---

## GIL 的释放时机

GIL 不是永远持有的——在特定情况下，Python 会释放 GIL。

### 自动释放的场景

```
GIL 释放时机：

1. I/O 操作
   ├── 文件读写: open().read()
   ├── 网络操作: socket.recv()
   ├── 数据库查询: cursor.execute()
   └── 系统调用: os.system()

2. C 扩展中的长时间计算
   ├── NumPy 的矩阵运算
   ├── Pillow 的图像处理
   ├── hashlib 的哈希计算
   └── zlib 的压缩/解压缩

3. time.sleep()

4. 线程切换（每 5ms 左右的调度间隔）
```

### 线程切换机制

```python
# Python 3.2+ 的 GIL 调度策略
import sys
print(sys.getswitchinterval())  # 0.005（5 毫秒）

# 可以调整切换间隔
sys.setswitchinterval(0.001)  # 1 毫秒（更频繁的切换）
```

```
GIL 切换时间线（Python 3.2+）：

线程 A 持有 GIL:
├── 执行字节码...
├── 5ms 到了 → 设置 "请求释放 GIL" 标志
├── 执行完当前字节码指令后检查标志
├── 释放 GIL → 通知等待的线程
└── 等待重新获取 GIL

线程 B 获得 GIL:
├── 执行字节码...
├── 5ms 到了 → ...
└── 循环继续

注意：切换发生在字节码指令边界
（不会在一条指令执行到一半时切换）
```

### C 扩展中手动释放 GIL

```c
// C 扩展中释放 GIL 的模式
static PyObject* compute_heavy(PyObject* self, PyObject* args) {
    int n;
    if (!PyArg_ParseTuple(args, "i", &n))
        return NULL;

    double result;

    // 释放 GIL —— 在这个块中可以真正并行
    Py_BEGIN_ALLOW_THREADS
    result = heavy_computation(n);  // 纯 C 计算，不访问 Python 对象
    Py_END_ALLOW_THREADS

    // 重新获得 GIL —— 回到 Python 的世界
    return PyFloat_FromDouble(result);
}
```

```python
# NumPy 就是这么做的
import numpy as np
import threading

# 这可以真正并行——NumPy 在内部释放了 GIL
def matrix_multiply(a, b, result, index):
    result[index] = a @ b

a = np.random.rand(1000, 1000)
b = np.random.rand(1000, 1000)
results = [None, None]

t1 = threading.Thread(target=matrix_multiply, args=(a, b, results, 0))
t2 = threading.Thread(target=matrix_multiply, args=(a, b, results, 1))
t1.start(); t2.start()
t1.join(); t2.join()
# 这真的比串行快！因为 NumPy 的矩阵乘法释放了 GIL
```

> 🧰 **Toolbox：GIL 感知的编程策略**
>
> | 场景 | 推荐方案 | GIL 影响 |
> |------|---------|---------|
> | Web 服务器 | asyncio + uvloop | 无（I/O 释放 GIL）|
> | 爬虫 | asyncio + aiohttp | 无 |
> | 数据处理 | NumPy/Pandas | 小（C 层释放 GIL）|
> | ML 训练 | PyTorch/TensorFlow | 无（GPU 计算）|
> | CPU 计算 | multiprocessing | 完全绕过 |
> | 文件处理 | threading | 无（I/O 释放 GIL）|
> | 纯 Python 计算 | multiprocessing | 必须绕过 |

---

## 绕过 GIL 的策略

### 策略 1：multiprocessing

```python
from multiprocessing import Pool, Process, Queue

# 方式一：进程池
def process_chunk(data_chunk):
    return [x ** 2 for x in data_chunk]

data = list(range(1_000_000))
chunks = [data[i::4] for i in range(4)]

with Pool(4) as pool:
    results = pool.map(process_chunk, chunks)
    flat_results = [x for chunk in results for x in chunk]
```

```
multiprocessing 的工作原理：

┌──────────────────────┐
│    主进程 (Main)      │
│    有自己的 GIL       │
├──────────────────────┤
│  启动子进程           │
│  序列化数据 (pickle)  │
│  发送到子进程         │
│  等待结果             │
│  反序列化结果         │
└───────┬──────────────┘
        │ fork / spawn
        ├──────────────────────┐──────────────────────┐
        ▼                      ▼                      ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  子进程 1     │    │  子进程 2     │    │  子进程 3     │
│  自己的 GIL   │    │  自己的 GIL   │    │  自己的 GIL   │
│  自己的内存   │    │  自己的内存   │    │  自己的内存   │
│  真正并行     │    │  真正并行     │    │  真正并行     │
└──────────────┘    └──────────────┘    └──────────────┘

优点：真正的并行，完全绕过 GIL
缺点：进程间通信开销大（序列化/反序列化）
      内存使用量 = 进程数 × 单进程内存
```

### 策略 2：C 扩展 / Cython

```python
# 使用 Cython 释放 GIL
# file: compute.pyx
from cython.parallel import prange

def parallel_sum(int n):
    cdef long total = 0
    cdef int i
    # nogil 块中可以真正并行
    with nogil:
        for i in prange(n, schedule='static'):
            total += i * i
    return total
```

### 策略 3：concurrent.futures（统一接口）

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import time

def task(n):
    """既可以是 CPU 任务也可以是 I/O 任务"""
    return sum(range(n))

# I/O 密集 → 用线程池
with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(task, 1_000_000) for _ in range(4)]
    results = [f.result() for f in futures]

# CPU 密集 → 只需改一行：换成进程池
with ProcessPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(task, 1_000_000) for _ in range(4)]
    results = [f.result() for f in futures]
```

### 策略 4：asyncio（I/O 密集型的首选）

```python
import asyncio

async def fetch_and_process(url):
    # I/O 操作——不受 GIL 影响
    data = await fetch(url)
    # CPU 操作——如果很重，用 ProcessPoolExecutor
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, heavy_process, data)
    return result

async def main():
    urls = [f"https://api.example.com/data/{i}" for i in range(100)]
    results = await asyncio.gather(*(fetch_and_process(url) for url in urls))
```

### GIL 应对策略决策树

```
你的任务是什么？
│
├── I/O 密集型（网络、文件、数据库）
│   ├── 高并发场景 → asyncio（首选）
│   └── 简单场景 → threading
│   └── GIL 影响：几乎没有
│
├── CPU 密集型（计算、加密、压缩）
│   ├── 数据可序列化 → multiprocessing
│   ├── 需要共享内存 → multiprocessing + shared memory
│   ├── 有 C 扩展 → 在 C 层释放 GIL
│   └── 极致性能 → 用 Rust/C 写关键路径
│   └── GIL 影响：threading 完全无法加速
│
├── 混合型
│   └── asyncio + ProcessPoolExecutor
│       （I/O 用 asyncio，CPU 用进程池）
│
└── 科学计算 / ML
    ├── NumPy / Pandas → 已经在内部释放 GIL
    ├── PyTorch / TensorFlow → GPU 计算不受 GIL 影响
    └── Dask / Ray → 分布式计算框架
```

---

## PEP 703：自由线程 Python

> 🌌 **The Big Picture：Python 的未来**
>
> 2023 年 6 月，Python 指导委员会接受了 PEP 703——
> 这是移除 GIL 的第一步，由 Meta（Facebook）工程师 Sam Gross 提出。
> 30 多年后，Python 终于要面对这个历史遗留问题了。

### PEP 703 的核心内容

```
PEP 703: Making the Global Interpreter Lock Optional

目标：让 GIL 成为可选的，而不是直接移除

实现策略：
1. 引用计数 → 偏向引用计数 (Biased Reference Counting)
   - 创建对象的线程用普通计数（快）
   - 其他线程用原子操作（慢但正确）

2. 对象锁 → 每个对象自带一个轻量级锁
   - 正常情况无竞争：几乎零开销
   - 有竞争时：退化为互斥锁

3. 垃圾回收 → 修改分代 GC 以支持无 GIL
   - Stop-the-world 只在 GC 时发生
   - 日常执行无需全局同步

4. C 扩展兼容 → 渐进式迁移
   - 旧扩展在"模拟 GIL"模式下运行
   - 新扩展可以声明"我支持 free-threading"
```

### Python 3.13 中的实验性支持

```bash
# 编译 free-threaded CPython
./configure --disable-gil
make

# 或使用预编译版本（Python 3.13+）
# 安装时选择 "free-threaded" 变体

# 检查是否是 free-threaded 版本
python -c "import sys; print(sys._is_gil_enabled())"
# False → free-threaded 模式
```

```python
# Python 3.13+ free-threaded 模式
import sys
import threading

# 检查 GIL 状态
print(f"GIL enabled: {sys._is_gil_enabled()}")

# 在 free-threaded 模式下，CPU 密集型也能多线程加速
def cpu_work(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

# 这在 free-threaded Python 中可以真正并行！
threads = [threading.Thread(target=cpu_work, args=(10_000_000,)) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
```

### 时间线

```
PEP 703 的渐进实施计划：

Python 3.13 (2024)
├── 实验性支持 --disable-gil
├── 需要单独编译/安装
└── 生态兼容性：~30% 的 PyPI 包

Python 3.14 (2025)
├── 改进稳定性
├── 更多 C 扩展适配
└── 生态兼容性：~60%

Python 3.15-3.17 (2026-2028)
├── 逐步成为默认选项
├── 大部分生态兼容
└── GIL 可能变成可选的编译标志

Python 3.18+ (2029+?)
├── GIL 可能被完全移除
└── 或者永远保持"可选"

注意：这是乐观估计。实际进展取决于：
1. 单线程性能回归是否可接受（目标 < 5%）
2. C 扩展生态的迁移速度
3. 社区的反馈
```

---

## GIL 争论的历史与未来

> 🎭 **The Drama：30 年的争论**
>
> GIL 的争论贯穿了 Python 的整个历史。让我们回顾这段充满戏剧性的故事。

### 历史时间线

```
1991  Guido 创建 Python，引入 GIL
      → 当时的理由："单线程性能最重要，多核不是消费级关注点"

1999  Greg Stein 的 "free-threading" 补丁
      → 移除 GIL，但单线程性能下降 40%
      → Guido 拒绝：性能回归不可接受

2005  多核 CPU 开始普及
      → 社区开始频繁抱怨 GIL
      → "Python 不能利用多核！"

2007  Guido 发帖 "It isn't Easy to Remove the GIL"
      → 挑战书：证明移除 GIL 不会让单线程变慢，我就接受
      → 无人应战（当时）

2010  Python 3.2 改进 GIL 调度算法
      → 新 GIL（Antoine Pitrou）：基于时间而非指令计数的切换
      → 改善了多线程公平性，但没有移除 GIL

2015  Larry Hastings 的 "Gilectomy" 项目
      → 移除 GIL 的又一次尝试
      → 单线程性能下降 25-30%
      → 项目最终停滞

2021  Sam Gross 的 nogil 项目
      → Meta 工程师，全新的方法
      → 单线程性能下降仅 ~8%
      → 引起核心开发者的强烈兴趣

2023  PEP 703 被接受
      → 第一次获得官方认可的 "移除 GIL" 方案
      → Python 指导委员会："渐进式实施，不能破坏生态"

2024  Python 3.13 发布 free-threaded 实验版
      → 历史性的一步
```

### 两派观点

```
"移除 GIL" 派：
├── "Python 不能利用多核是不可接受的"
├── "现代硬件都是多核的"
├── "其他语言（Go, Rust, Java）都能真正并行"
└── "AI/ML 需要更好的并行支持"

"保留 GIL" 派：
├── "99% 的 Python 程序不需要 CPU 并行"
├── "multiprocessing 已经够用了"
├── "移除 GIL 会破坏整个 C 扩展生态"
├── "单线程性能不能有任何回退"
└── "NumPy/Pandas 已经在 C 层绕过了 GIL"
```

### 思考：GIL 的哲学意义

> 🧘 **Zen of Code：简单性的代价**
>
> GIL 的故事告诉我们一个更深的道理：
>
> **技术选择从来不是纯技术问题——它是人的问题。**
>
> GIL 之所以难以移除，不是因为技术上做不到，而是因为：
> 1. **生态惯性**：数百万行 C 扩展代码依赖 GIL 的存在
> 2. **性能期望**：没人愿意为了并行牺牲单线程性能
> 3. **社区分裂**：有人需要多核并行，有人需要稳定性
> 4. **维护负担**：核心开发者只有几十人，不能什么都做
>
> 这就是为什么 Guido 说："It isn't easy to remove the GIL"——
> 难的不是代码，是后果。
>
> 每一个看似"简单"的技术决定，都可能在 30 年后变成一个需要整个社区
> 花 10 年来解决的历史遗留问题。
>
> 作为工程师，我们从 GIL 的故事中学到的最重要的一课是：
> **今天的简单，可能是明天的复杂。选择时，要想远一点。**

---

## 总结：GIL 实用指南

```
GIL 速查表：

问: GIL 是什么？
答: 一个互斥锁，保护 CPython 的引用计数。

问: 它影响我吗？
答: 如果你做 I/O（99% 的 Web 开发）→ 几乎不影响。
    如果你做纯 Python CPU 计算 → 多线程无法加速。
    如果你用 NumPy/Pandas → 影响很小（C 层释放 GIL）。

问: 我该怎么办？
答: I/O 密集 → asyncio 或 threading
    CPU 密集 → multiprocessing 或 C 扩展
    不确定 → 先写正确的代码，性能问题出现时再优化

问: 未来会怎样？
答: PEP 703 正在推进，Python 3.13+ 有实验性支持。
    完全移除 GIL 还需要数年。
    在此之前，multiprocessing 依然是最可靠的方案。
```

---

## 参考资源

- [PEP 703 — Making the Global Interpreter Lock Optional](https://peps.python.org/pep-0703/)
- [Guido's "It isn't Easy to Remove the GIL"](https://www.artima.com/weblogs/viewpost.jsp?thread=214235)
- [Understanding the Python GIL (David Beazley)](https://www.dabeaz.com/python/UnderstandingGIL.pdf)
- [Sam Gross: nogil CPython](https://github.com/colesbury/nogil)
- [Python 3.13 Free-threaded Mode](https://docs.python.org/3.13/whatsnew/3.13.html)

---

[👈 第 3 章：内存管理与垃圾回收](../03-memory-gc/) | [👉 第 5 章：Python 语言演进](../05-python-evolution/)

[⬆️ 返回 Stage 5 目录](../README.md)
