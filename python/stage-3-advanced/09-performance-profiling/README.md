# 第 9 章：性能优化 — 先测量，再优化

> "Premature optimization is the root of all evil."
> — Donald Knuth
>
> 但 Knuth 的下一句话是："Yet we should not pass up our opportunities in that critical 3%."
> 性能优化不是不做——而是要做对。先用数据说话，然后精准出击。

---

## 📖 本章内容

- [1. 性能优化的正确心态](#1-性能优化的正确心态)
- [2. cProfile 与 profile](#2-cprofile-与-profile)
- [3. line_profiler 与内存分析](#3-line_profiler-与内存分析)
- [4. timeit 正确用法](#4-timeit-正确用法)
- [5. 常见性能陷阱](#5-常见性能陷阱)
- [6. 数据结构选择对性能的影响](#6-数据结构选择对性能的影响)
- [7. C 扩展与 Cython 简介](#7-c-扩展与-cython-简介)
- [最佳实践 / 常见陷阱](#最佳实践践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. 性能优化的正确心态

> 🎭 **The Drama: 优化瘾的危险**
>
> 新手写完代码，第一反应是"怎么让它更快"。
> 于是他花了 3 天把一个 0.1 秒的函数优化到 0.05 秒——而这个函数一天只被调用一次。
> 节省的时间：0.05 秒/天 = 18 秒/年。
> 浪费的时间：3 天 = 259200 秒。
>
> 回本时间：**14400 年**。

### 1.1 优化三原则

```
+------------------------------------------------------+
|            性能优化决策流程                              |
+------------------------------------------------------+
|                                                        |
|  1. 先让它正确 (Make it work)                           |
|     │                                                  |
|  2. 再让它清晰 (Make it right)                          |
|     │                                                  |
|  3. 最后让它快 (Make it fast)                            |
|     │                                                  |
|     └─→ 用 profiler 找到瓶颈                             |
|          │                                              |
|          └─→ 只优化瓶颈部分（通常是 3% 的代码）            |
|               │                                         |
|               └─→ 优化后再次测量，确认改善                  |
+------------------------------------------------------+
```

### 1.2 Amdahl 定律

> 🧠 **CS Master's Bridge: 并行与优化的理论极限**
>
> Amdahl 定律告诉我们：如果程序中 95% 的时间花在某个函数上，
> 即使你把这个函数优化到无限快，总体加速比也只有 20x。
>
> 但如果只有 5% 的时间花在某个函数上，即使优化到无限快，也只快 1.05x。
>
> 这就是为什么 **先测量** 如此重要——你需要知道瓶颈在哪。

| 瓶颈占比 | 优化到无限快的理论加速比 | 优化 2x 的实际加速比 |
|:---|:---|:---|
| 90% | 10x | 1.82x |
| 50% | 2x | 1.33x |
| 10% | 1.11x | 1.05x |
| 1% | 1.01x | 1.005x |

---

## 2. cProfile 与 profile

### 2.1 cProfile 基础

`cProfile` 是 Python 标准库的 C 实现 profiler，开销小，适合生产环境：

```python
import cProfile
import pstats
import io
import logging

logger = logging.getLogger(__name__)


def fibonacci(n: int) -> int:
    """递归斐波那契 — 经典的性能问题"""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


# ✅ 方式一：命令行
# python -m cProfile -s cumulative my_script.py

# ✅ 方式二：代码中使用
def profile_fibonacci() -> None:
    profiler = cProfile.Profile()
    profiler.enable()

    result = fibonacci(30)
    print(f"fibonacci(30) = {result}")

    profiler.disable()

    # 格式化输出
    stream = io.StringIO()
    stats = pstats.Stats(profiler, stream=stream)
    stats.sort_stats("cumulative")
    stats.print_stats(10)  # 只显示前 10 行
    print(stream.getvalue())

# ✅ 方式三：装饰器
def profile(func):
    """性能分析装饰器"""
    def wrapper(*args, **kwargs):
        profiler = cProfile.Profile()
        profiler.enable()
        result = func(*args, **kwargs)
        profiler.disable()
        stats = pstats.Stats(profiler)
        stats.sort_stats("cumulative")
        stats.print_stats(10)
        return result
    return wrapper
```

### 2.2 读懂 cProfile 输出

```
   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
  2692537    0.815    0.000    0.815    0.000 demo.py:8(fibonacci)
        1    0.000    0.000    0.815    0.815 demo.py:20(profile_fibonacci)
```

| 列名 | 含义 | 重点关注 |
|:---|:---|:---|
| `ncalls` | 调用次数 | 调用过多？可能需要缓存 |
| `tottime` | 函数本身耗时（不含子调用） | 函数自身是否慢 |
| `cumtime` | 累计耗时（含子调用） | 整体影响 |
| `percall` | 每次调用平均耗时 | 单次是否可优化 |

### 2.3 上下文管理器式 profiler

```python
import cProfile
import pstats
from contextlib import contextmanager
from typing import Generator
import logging

logger = logging.getLogger(__name__)


@contextmanager
def profiling(sort_by: str = "cumulative", top_n: int = 15) -> Generator[None, None, None]:
    """上下文管理器式性能分析"""
    profiler = cProfile.Profile()
    profiler.enable()
    logger.info("开始性能分析...")
    try:
        yield
    finally:
        profiler.disable()
        stats = pstats.Stats(profiler)
        stats.sort_stats(sort_by)
        stats.print_stats(top_n)
        logger.info("性能分析完成")


# ✅ 使用方式
# with profiling(top_n=10):
#     heavy_computation()
```

---

## 3. line_profiler 与内存分析

### 3.1 line_profiler — 逐行分析

> 🧰 **Toolbox: 精确到行的性能分析**
>
> `cProfile` 只能告诉你哪个函数慢，但不知道函数内部哪一行慢。
> `line_profiler` 逐行分析，是定位瓶颈的精密手术刀。

```bash
# 安装
pip install line_profiler
```

```python
# ✅ 使用 line_profiler
# 在需要分析的函数上添加 @profile 装饰器
# 然后用 kernprof 运行

# demo.py
@profile  # line_profiler 提供的装饰器（运行时注入）
def process_data(data: list[int]) -> list[int]:
    result = []                          # 分配列表
    for item in data:                    # 循环
        if item % 2 == 0:               # 条件判断
            result.append(item ** 2)     # 计算 + 追加
    return sorted(result)                # 排序

process_data(list(range(100_000)))
```

```bash
# 运行
kernprof -l -v demo.py

# 输出示例：
# Line #    Hits   Time  Per Hit  % Time  Line Contents
# ================================================
#      3     1      2.0    2.0      0.0  result = []
#      4 100000  23456.0    0.2     35.0  for item in data:
#      5 100000  15678.0    0.2     23.4  if item % 2 == 0:
#      6  50000  20123.0    0.4     30.0  result.append(item ** 2)
#      7     1   7890.0 7890.0     11.8  return sorted(result)
```

### 3.2 内存分析

```bash
pip install memory_profiler
```

```python
from memory_profiler import profile as mem_profile
import logging

logger = logging.getLogger(__name__)


@mem_profile
def memory_demo() -> None:
    """内存分析演示"""
    # 列表 — 占用较多内存
    big_list = [i ** 2 for i in range(1_000_000)]
    logger.info("列表大小: %d 元素", len(big_list))

    # 生成器 — 几乎不占额外内存
    big_gen = (i ** 2 for i in range(1_000_000))
    total = sum(big_gen)
    logger.info("生成器求和: %d", total)

    del big_list  # 释放内存
```

```bash
# 运行
python -m memory_profiler demo.py

# 输出示例：
# Line #    Mem usage    Increment   Line Contents
# ================================================
#      5    40.1 MiB     0.0 MiB   big_list = [i ** 2 for ...]
#      6    78.5 MiB    38.4 MiB   <--- 38.4 MB 增长！
#      9    78.5 MiB     0.0 MiB   big_gen = (i ** 2 for ...)
#     10    78.5 MiB     0.0 MiB   <--- 生成器几乎零增长
#     12    40.1 MiB   -38.4 MiB   del big_list
```

### 3.3 sys.getsizeof 与 tracemalloc

```python
import sys
import tracemalloc
import logging

logger = logging.getLogger(__name__)


def size_comparison() -> None:
    """对比不同数据结构的内存占用"""

    items = list(range(1000))

    structures = {
        "list": items,
        "tuple": tuple(items),
        "set": set(items),
        "frozenset": frozenset(items),
        "dict": {i: i for i in items},
    }

    for name, obj in structures.items():
        size = sys.getsizeof(obj)
        logger.info("%s: %d bytes (%.2f KB)", name, size, size / 1024)
        print(f"  {name:>12}: {size:>8} bytes ({size / 1024:.2f} KB)")


def tracemalloc_demo() -> None:
    """tracemalloc — 标准库的内存追踪工具"""
    tracemalloc.start()

    # 执行一些操作
    data = {str(i): list(range(100)) for i in range(1000)}
    logger.info("创建了 %d 个键值对", len(data))

    snapshot = tracemalloc.take_snapshot()
    top_stats = snapshot.statistics("lineno")

    print("\n内存分配 Top 5:")
    for stat in top_stats[:5]:
        print(f"  {stat}")

    tracemalloc.stop()
```

---

## 4. timeit 正确用法

> 🎭 **The Drama: 错误的基准测试比没有更糟**
>
> "我测过了，方法 A 比方法 B 快 3 倍！"
> ——用了 `time.time()` 测的，只跑了一次，还是在 DEBUG 模式下。
> 这种基准测试结果，不如掷骰子。

### 4.1 timeit 基础

```python
import timeit
import logging

logger = logging.getLogger(__name__)


# ✅ 正确用法：命令行
# python -m timeit -n 1000 -r 5 "'-'.join(str(i) for i in range(100))"

# ✅ 正确用法：代码中
def benchmark_string_join() -> None:
    """对比字符串拼接方式"""

    # 方式 1：+ 拼接
    t1 = timeit.timeit(
        stmt="s = ''\nfor i in range(100): s += str(i)",
        number=10_000,
    )

    # 方式 2：join
    t2 = timeit.timeit(
        stmt="'-'.join(str(i) for i in range(100))",
        number=10_000,
    )

    # 方式 3：f-string（不适合大量拼接）
    t3 = timeit.timeit(
        stmt="''.join(f'{i}' for i in range(100))",
        number=10_000,
    )

    logger.info("+ 拼接: %.4f s", t1)
    logger.info("join:   %.4f s", t2)
    logger.info("f-str:  %.4f s", t3)

    print(f"  + 拼接: {t1:.4f}s")
    print(f"  join:   {t2:.4f}s")
    print(f"  f-str:  {t3:.4f}s")
```

### 4.2 timeit 的注意事项

```python
# ❌ 错误：用 time.time() 做基准测试
import time

start = time.time()
result = some_function()
elapsed = time.time() - start
print(f"耗时: {elapsed}s")
# 问题：精度低、单次运行、受系统负载影响

# ✅ 正确：用 timeit，它会：
# 1. 关闭垃圾回收
# 2. 多次运行取平均
# 3. 使用高精度计时器
```

| 方法 | 精度 | 多次运行 | 关闭 GC | 推荐场景 |
|:---|:---|:---|:---|:---|
| `time.time()` | 低 | 否 | 否 | 粗略估计 |
| `time.perf_counter()` | 高 | 否 | 否 | 单次精确计时 |
| `timeit.timeit()` | 高 | 是 | 是 | 微基准测试 |
| `cProfile` | 中 | 否 | 否 | 函数级分析 |

### 4.3 实用计时装饰器

```python
import functools
import time
import logging
from typing import Callable, TypeVar, ParamSpec

logger = logging.getLogger(__name__)

P = ParamSpec("P")
R = TypeVar("R")


def timed(func: Callable[P, R]) -> Callable[P, R]:
    """高精度计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        start = time.perf_counter_ns()
        result = func(*args, **kwargs)
        elapsed_ns = time.perf_counter_ns() - start

        if elapsed_ns < 1_000:
            unit, value = "ns", elapsed_ns
        elif elapsed_ns < 1_000_000:
            unit, value = "μs", elapsed_ns / 1_000
        elif elapsed_ns < 1_000_000_000:
            unit, value = "ms", elapsed_ns / 1_000_000
        else:
            unit, value = "s", elapsed_ns / 1_000_000_000

        logger.info("%s: %.2f %s", func.__name__, value, unit)
        return result
    return wrapper


@timed
def demo_timed() -> int:
    return sum(range(1_000_000))
```

---

## 5. 常见性能陷阱

> 🧰 **Toolbox: 这些坑你一定踩过（或即将踩到）**

### 5.1 字符串拼接陷阱

```python
import logging

logger = logging.getLogger(__name__)

# ❌ 循环中 + 拼接 — O(n²) 时间复杂度
def bad_string_concat(n: int) -> str:
    result = ""
    for i in range(n):
        result += str(i)  # 每次都创建新字符串对象！
    return result

# ✅ 用 join — O(n) 时间复杂度
def good_string_concat(n: int) -> str:
    return "".join(str(i) for i in range(n))

# 性能对比（n=10000）:
# bad:  ~15ms
# good: ~3ms
```

### 5.2 全局变量访问陷阱

```python
import math
import logging

logger = logging.getLogger(__name__)

# ❌ 在循环中访问全局变量/属性 — 每次都要查找
def slow_math(data: list[float]) -> list[float]:
    return [math.sqrt(x) for x in data]

# ✅ 局部变量引用 — 查找更快
def fast_math(data: list[float]) -> list[float]:
    sqrt = math.sqrt  # 局部变量缓存
    return [sqrt(x) for x in data]

# Python 变量查找顺序：局部 → 闭包 → 全局 → 内置
# 局部变量查找是 O(1)（编译时确定索引），全局查找需要字典查找
```

### 5.3 不必要的列表创建

```python
import logging

logger = logging.getLogger(__name__)

# ❌ 创建中间列表
def bad_sum(n: int) -> int:
    numbers = [i ** 2 for i in range(n)]  # 先创建整个列表
    return sum(numbers)                     # 再求和

# ✅ 生成器表达式 — 不创建中间列表
def good_sum(n: int) -> int:
    return sum(i ** 2 for i in range(n))   # 逐个生成、逐个求和

# ❌ 不必要的 list()
if len(list(filter(lambda x: x > 0, data))) > 0: ...

# ✅ 用 any() — 短路求值
if any(x > 0 for x in data): ...
```

### 5.4 属性访问开销

```python
import logging

logger = logging.getLogger(__name__)


class Point:
    __slots__ = ("x", "y")  # ✅ 用 __slots__ 替代 __dict__

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


class PointDict:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


# __slots__ vs __dict__ 对比
# __slots__:
#   - 内存更少（没有 __dict__）
#   - 属性访问更快
#   - 不能动态添加属性
# __dict__:
#   - 灵活，可动态添加属性
#   - 内存开销大（每个实例一个字典）
```

| 陷阱 | 原因 | 优化方案 |
|:---|:---|:---|
| 字符串 `+` 循环 | 每次创建新对象，O(n^2) | `"".join()` |
| 全局变量在循环中 | 字典查找 vs 局部索引 | 局部变量缓存 |
| 中间列表 | 不必要的内存分配 | 生成器表达式 |
| `__dict__` 属性 | 字典开销 | `__slots__` |
| `in list` 查找 | O(n) 线性扫描 | `in set` O(1) 哈希查找 |
| 频繁属性访问 | 多次 `.` 查找 | 局部变量缓存 |

---

## 6. 数据结构选择对性能的影响

> 🌌 **The Big Picture: 正确的数据结构 > 微优化**
>
> 选对数据结构带来的性能提升，往往比任何微优化都大。
> 把 O(n) 的查找变成 O(1)，这不是优化——这是正确的设计。

### 6.1 时间复杂度对比

| 操作 | list | dict/set | deque | heapq |
|:---|:---|:---|:---|:---|
| 索引访问 | O(1) | O(1) key | O(n) | - |
| 头部插入 | O(n) | - | O(1) | - |
| 尾部插入 | O(1)* | O(1)* | O(1) | O(log n) |
| 查找 | O(n) | O(1) | O(n) | O(n) |
| 删除 | O(n) | O(1) | O(1) 两端 | O(n) |
| 排序 | O(n log n) | - | - | - |

> `*` 均摊时间复杂度

### 6.2 实际性能对比

```python
import time
import logging
from collections import deque

logger = logging.getLogger(__name__)


def compare_lookup(n: int = 100_000) -> None:
    """查找性能对比：list vs set"""
    data_list = list(range(n))
    data_set = set(range(n))
    target = n - 1  # 最坏情况

    # list 查找
    start = time.perf_counter()
    for _ in range(1000):
        _ = target in data_list
    list_time = time.perf_counter() - start

    # set 查找
    start = time.perf_counter()
    for _ in range(1000):
        _ = target in data_set
    set_time = time.perf_counter() - start

    logger.info("list 查找: %.4f s", list_time)
    logger.info("set 查找:  %.4f s", set_time)
    print(f"  list 查找: {list_time:.4f}s")
    print(f"  set 查找:  {set_time:.4f}s")
    print(f"  set 快了:  {list_time / set_time:.0f}x")


def compare_insert(n: int = 100_000) -> None:
    """头部插入对比：list vs deque"""

    # list 头部插入
    lst: list[int] = []
    start = time.perf_counter()
    for i in range(n):
        lst.insert(0, i)
    list_time = time.perf_counter() - start

    # deque 头部插入
    dq: deque[int] = deque()
    start = time.perf_counter()
    for i in range(n):
        dq.appendleft(i)
    deque_time = time.perf_counter() - start

    logger.info("list.insert(0): %.4f s", list_time)
    logger.info("deque.appendleft: %.4f s", deque_time)
    print(f"  list.insert(0):    {list_time:.4f}s")
    print(f"  deque.appendleft:  {deque_time:.4f}s")
    print(f"  deque 快了:        {list_time / deque_time:.0f}x")
```

### 6.3 选择正确数据结构的决策树

```
需要什么操作？
│
├── 频繁查找 → dict 或 set (O(1))
│   ├── 需要键值对 → dict
│   └── 只要去重/成员检测 → set
│
├── 有序 + 频繁插入/删除
│   ├── 两端操作 → collections.deque
│   ├── 按优先级 → heapq
│   └── 有序映射 → sortedcontainers.SortedDict
│
├── 随机访问 + 固定大小 → tuple（不可变）或 list
│
├── 数值计算 → numpy.ndarray
│
└── 需要命名字段
    ├── 不可变 → typing.NamedTuple
    └── 可变 → dataclass
```

---

## 7. C 扩展与 Cython 简介

> 🧠 **CS Master's Bridge: 当 Python 不够快时**
>
> Python 是解释型语言，底层由 CPython（C 实现）驱动。
> 当纯 Python 成为瓶颈时，有几条加速路径：
>
> 1. **NumPy/Pandas** — 底层是 C/Fortran，向量化操作很快
> 2. **Cython** — Python 超集，编译为 C 扩展
> 3. **ctypes/cffi** — 调用现有 C 库
> 4. **pybind11** — C++ 绑定到 Python
> 5. **PyPy** — JIT 编译的 Python 解释器

### 7.1 NumPy 向量化

```python
import time
import logging

logger = logging.getLogger(__name__)

# 需要 pip install numpy
try:
    import numpy as np

    def numpy_vs_python(n: int = 1_000_000) -> None:
        """NumPy 向量化 vs 纯 Python 循环"""
        data = list(range(n))
        arr = np.arange(n)

        # 纯 Python
        start = time.perf_counter()
        result_py = [x ** 2 + 2 * x + 1 for x in data]
        py_time = time.perf_counter() - start

        # NumPy 向量化
        start = time.perf_counter()
        result_np = arr ** 2 + 2 * arr + 1
        np_time = time.perf_counter() - start

        logger.info("Python: %.4f s", py_time)
        logger.info("NumPy:  %.4f s", np_time)
        print(f"  Python: {py_time:.4f}s")
        print(f"  NumPy:  {np_time:.4f}s")
        print(f"  NumPy 快了: {py_time / np_time:.0f}x")

except ImportError:
    logger.warning("NumPy 未安装，跳过向量化演示")
```

### 7.2 Cython 简介

```python
# ❌ 纯 Python — 慢
def python_sum(n: int) -> int:
    total = 0
    for i in range(n):
        total += i
    return total

# ✅ Cython（.pyx 文件）— 编译为 C，快 10-100x
# cdef int cython_sum(int n):
#     cdef int total = 0
#     cdef int i
#     for i in range(n):
#         total += i
#     return total
```

Cython 的典型加速场景：
- 数值密集型循环
- 与 C 库交互
- 需要类型化的数组操作

### 7.3 何时需要 C 扩展

| 场景 | 推荐方案 | 预期加速 |
|:---|:---|:---|
| 数值计算 | NumPy/SciPy | 10-100x |
| 循环密集型 | Cython | 10-50x |
| 调用 C 库 | ctypes/cffi | N/A |
| C++ 绑定 | pybind11 | N/A |
| 通用加速 | PyPy 解释器 | 2-10x |

```
Python 性能优化层次（从容易到困难）：

1. 选对算法和数据结构    ← 收益最大，难度最低
2. 减少不必要的工作       ← 缓存、懒加载、短路
3. 使用内置函数/标准库    ← 它们是 C 实现的
4. NumPy 向量化          ← 数值计算首选
5. 多进程/异步           ← IO 密集型 / CPU 密集型
6. Cython / C 扩展      ← 最后手段
```

---

## 最佳实践 / 常见陷阱

### 最佳实践

| 原则 | 说明 |
|:---|:---|
| 先测量 | 用 profiler 找到真正的瓶颈 |
| 选对数据结构 | 这比微优化重要 100 倍 |
| 用内置函数 | `sum()`, `map()`, `sorted()` 都是 C 实现 |
| 生成器优先 | 处理大数据时节省内存 |
| 基准可复现 | 用 `timeit`，多次运行，记录环境 |

### 常见陷阱

```python
# ❌ 陷阱 1：没有测量就优化
# "我觉得这段代码慢" → 先 cProfile 看看！

# ❌ 陷阱 2：微基准测试误导
# 测试 n=10 的性能，推断 n=1_000_000 的行为
# O(n) 和 O(n²) 在 n=10 时差异不大

# ❌ 陷阱 3：忽略内存
# CPU 很快但不断 OOM → 检查内存使用

# ❌ 陷阱 4：在错误的地方优化
# 网络请求要 2 秒，你在优化 2ms 的解析逻辑

# ✅ 正确流程：
# 1. 写正确的代码
# 2. 发现性能问题
# 3. cProfile 定位瓶颈
# 4. 只优化瓶颈
# 5. 测量优化效果
# 6. 如果够了，停下来
```

---

## 练习题

### 练习 1：找出性能瓶颈

用 `cProfile` 分析以下代码，找出瓶颈并优化：

```python
def process(data: list[int]) -> list[int]:
    result = []
    for item in data:
        if item not in result:  # ← 这里有问题吗？
            result.append(item)
    return sorted(result)
```

<details>
<summary>✅ 参考答案</summary>

瓶颈：`item not in result` 对 list 是 O(n) 查找。

```python
def process_optimized(data: list[int]) -> list[int]:
    seen: set[int] = set()    # ✅ set 查找 O(1)
    result: list[int] = []
    for item in data:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return sorted(result)

# 或者更简洁（不保序）：
def process_simple(data: list[int]) -> list[int]:
    return sorted(set(data))
```
</details>

### 练习 2：内存优化

优化以下代码的内存使用：

```python
def read_large_file(path: str) -> list[str]:
    with open(path) as f:
        lines = f.readlines()  # 一次性读入所有行
    return [line.strip().upper() for line in lines]
```

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Generator

def read_large_file(path: str) -> Generator[str, None, None]:
    """生成器版本 — 逐行处理，内存恒定"""
    with open(path) as f:
        for line in f:   # 文件对象本身就是迭代器
            yield line.strip().upper()

# 使用
for line in read_large_file("big_file.txt"):
    process(line)
```
</details>

---

## 参考资源 / 下一步

- [Python 官方文档: profile](https://docs.python.org/3/library/profile.html)
- [Python 官方文档: timeit](https://docs.python.org/3/library/timeit.html)
- [line_profiler](https://github.com/pyutils/line_profiler)
- [memory_profiler](https://github.com/pythonprofilers/memory_profiler)
- [High Performance Python, 2nd Edition](https://www.oreilly.com/library/view/high-performance-python/9781492055013/)
- [Python Speed](https://wiki.python.org/moin/PythonSpeed)

---

[⬅️ 第 8 章：设计模式](../08-design-patterns/README.md) | [🏠 返回目录](../README.md) | [➡️ 第 10 章：网络编程](../10-networking/README.md)
