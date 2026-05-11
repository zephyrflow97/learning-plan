# 第 3 章：内存管理与垃圾回收

> *"The question of whether a computer can think is no more interesting than the question of whether a submarine can swim."*
> — Edsger W. Dijkstra
>
> 你写下 `x = [1, 2, 3]`，Python 在某个看不见的角落为它安排了一块内存。
> 当 `x` 不再被需要时，Python 默默地回收了它——你甚至不知道这件事发生过。
> 这种"看不见"的优雅背后，是一套精密的内存管理系统。
> 理解它，不是为了手动管理内存——而是为了知道何时这种优雅会失效。

---

## 📖 本章内容

- [Python 内存架构](#python-内存架构)
- [引用计数的优缺点](#引用计数的优缺点)
- [分代垃圾回收](#分代垃圾回收)
- [循环引用检测](#循环引用检测)
- [weakref：弱引用](#weakref弱引用)
- [\_\_del\_\_ 的陷阱](#__del__-的陷阱)
- [内存泄漏排查](#内存泄漏排查)

---

## Python 内存架构

> 🧠 **CS Master's Bridge：内存分配的层次**
>
> 当你在 Python 中创建一个对象，内存分配要经过多个层次。
> 不是每次都直接调用操作系统——那太慢了。
> CPython 有自己的内存分配器，像一个精明的仓库管理员，
> 预先从操作系统批发大块内存，再零售给各个对象。

### 内存层次结构

```
Layer 3:  Python 对象层      list, dict, int, str, 自定义类...
          ↓ 调用
Layer 2:  Python 内存分配器   pymalloc（处理 ≤ 512 字节的小对象）
          ↓ 调用
Layer 1:  C 内存分配器        malloc/realloc/free
          ↓ 调用
Layer 0:  操作系统            mmap/brk/VirtualAlloc
```

### pymalloc：小对象分配器

大多数 Python 对象都很小（int: 28 字节, 空 list: 56 字节）。频繁地调用 `malloc` 来分配几十字节的内存效率很低。所以 CPython 有专门的小对象分配器：

```
pymalloc 内存结构：

Arena（256 KB）
├── Pool（4 KB = 1 个内存页）
│   ├── Block（固定大小，如 16 字节）
│   ├── Block（16 字节）
│   ├── Block（16 字节）
│   └── ...
├── Pool（4 KB）
│   ├── Block（32 字节）
│   ├── Block（32 字节）
│   └── ...
└── Pool（4 KB）
    ├── Block（64 字节）
    └── ...
```

#### Arena

```
Arena 是 pymalloc 向操作系统申请的最大内存单元（256 KB）。
多个 Arena 组成一个链表。

┌─ Arena 1 (256KB) ─┐  ┌─ Arena 2 (256KB) ─┐  ┌─ Arena 3 ─┐
│  Pool Pool Pool    │→│  Pool Pool Pool    │→│  ...       │
│  Pool Pool Pool    │  │  Pool Pool Pool    │  │            │
│  ...               │  │  ...               │  │            │
└────────────────────┘  └────────────────────┘  └────────────┘

关键设计：Arena 可以被释放回操作系统。
当一个 Arena 中所有的 Pool 都空了，整个 Arena 被 free()。
优先从"最满的" Arena 分配 → 让"最空的" Arena 有机会被完全释放。
```

#### Pool

```
每个 Pool 管理固定大小的 Block。
Pool 大小 = 4 KB（一个内存页）。

Pool 的大小类别（Size Class）：

请求大小    Block 大小    每个 Pool 的 Block 数
1-8         8            504
9-16        16           252
17-24       24           168
25-32       32           126
33-40       40           100
...         ...          ...
497-512     512          7

超过 512 字节的对象直接用 malloc 分配。
```

#### Block

```
Block 是最小的分配单元。
分配和释放都是 O(1)——通过空闲链表。

已分配的 Pool（假设 Block 大小 = 16 字节）：

    ┌────┬────┬────┬────┬────┬────┬────┬────┐
    │ 占 │ 占 │ 空 │ 占 │ 空 │ 空 │ 占 │ 空 │
    └────┴────┴──↓─┴────┴──↓─┴──↓─┴────┴──↓─┘
                 ↓         ↓    ↓         ↓
                 └────→────┘    └────→────┘
                 空闲链表（Free List）

分配：从空闲链表头取一个 Block → O(1)
释放：把 Block 加回空闲链表头 → O(1)
```

> ⚛️ **The Science：为什么不直接用 malloc？**
>
> `malloc` 是通用的内存分配器，处理各种大小的请求。
> 它的开销包括：
> - 维护空闲块列表
> - 合并相邻空闲块（防止碎片）
> - 可能需要系统调用（brk/mmap）
> - 线程同步（加锁）
>
> 对于 Python 频繁创建销毁的小对象，这些开销太大了。
> pymalloc 通过限制块大小为固定类别，把分配/释放优化到 O(1)。
>
> 效果：pymalloc 比直接 malloc 快 2-5 倍（对小对象）。

---

## 引用计数的优缺点

第 2 章介绍了引用计数的基本原理，这里深入分析它的优缺点。

### 优点详解

#### 1. 即时回收

```python
def process_large_file(path):
    data = open(path).read()  # 打开文件，读取内容
    result = transform(data)   # 处理数据
    return result
    # 函数结束 → data 的引用计数归零 → 立即释放
    # 不用等 GC 周期！

# 在追踪式 GC（如 Java）中，data 可能存活很久
# 直到下一次 GC 周期才被回收
# 这意味着内存峰值更高
```

#### 2. 确定性析构

```python
class DatabaseConnection:
    def __init__(self, url):
        self.conn = connect(url)

    def __del__(self):
        self.conn.close()  # 引用计数归零时立即调用
        print("Connection closed")

# CPython 中，这几乎是确定性的：
def query():
    db = DatabaseConnection("postgresql://...")
    result = db.execute("SELECT ...")
    return result
# 函数返回 → db 的 refcnt 归零 → __del__ 被调用 → 连接关闭

# 但在 PyPy 或其他实现中，__del__ 的调用时机是不确定的！
# 所以推荐用 with 语句而非依赖 __del__
```

#### 3. 延迟低

```
引用计数 vs 追踪式 GC 的延迟特征：

引用计数：
时间 ─────────────────────────────────→
     │ │ │  │ │   │ │ │  │ │ │  │ │
     小 小 小 小 小  小 小 小 小 小 小 小 小
     每次回收一点点，延迟均匀

追踪式 GC：
时间 ─────────────────────────────────→
                 ████              ████
                 大停顿            大停顿
     日常很快，但偶尔有大停顿（Stop-The-World）
```

### 缺点详解

#### 1. 循环引用

```python
# 最简单的循环引用
a = []
b = []
a.append(b)  # a 引用 b
b.append(a)  # b 引用 a
del a, b     # 变量删除了，但对象互相引用，refcnt 都是 1
             # 引用计数永远不会归零 → 泄漏！

# 更隐蔽的循环引用
class Node:
    def __init__(self):
        self.parent = None
        self.children = []

    def add_child(self, child):
        self.children.append(child)
        child.parent = self  # parent ↔ children 形成循环引用
```

#### 2. 性能开销

```c
// 每次赋值都要更新引用计数
// Python: a = b
// C 层面:
Py_INCREF(b_obj);    // b 的引用 +1
Py_XDECREF(a_obj);   // a 原来指向的对象引用 -1
a_obj = b_obj;       // 赋值

// 在紧密循环中，引用计数操作可能占总时间的 30%+
// 这也是 GIL 存在的原因之一：
// 如果没有 GIL，每次 INCREF/DECREF 都需要原子操作
// 原子操作比普通 ++ 慢 10-100 倍
```

#### 3. 线程安全问题

```
为什么引用计数导致需要 GIL？

线程 A                    线程 B
─────────                ─────────
读取 refcnt (10)         读取 refcnt (10)
refcnt + 1 = 11          refcnt - 1 = 9
写回 11                  写回 9     ← 错误！应该是 10

没有 GIL 的解决方案：
1. 原子操作（每次 +1/-1 用 atomic_fetch_add）
   → 单线程性能下降 ~30%
2. 每个对象一把锁
   → 内存开销大，死锁风险
3. 放弃引用计数（PEP 703 的方向）
   → 需要完全重新设计内存管理
```

---

## 分代垃圾回收

引用计数搞不定循环引用，所以 CPython 额外引入了 **分代垃圾回收** (Generational GC)。

### 分代假说

```
分代 GC 基于一个经验观察（弱分代假说）：

"大多数对象在创建后很快就死了，少数对象会存活很久。"

对象年龄分布（典型）：

数量
 ▲
 │████████
 │██████
 │████
 │███
 │██
 │█
 │█
 │█
 │█                              ████
 └──────────────────────────────────→ 年龄

大量的临时对象（循环变量、中间结果）vs 少量的长寿对象（配置、缓存）
```

### 三代机制

```python
import gc

# 查看分代配置
print(gc.get_threshold())  # (700, 10, 10)
# 含义：
# 第 0 代：每 700 次分配-释放差 → 触发 gen0 回收
# 第 1 代：每 10 次 gen0 回收 → 触发 gen1 回收
# 第 2 代：每 10 次 gen1 回收 → 触发 gen2 回收
```

```
分代垃圾回收流程：

                    新创建的对象
                         │
                         ▼
    ┌──────────────────────────────────┐
    │           第 0 代 (Generation 0)  │  ← 最频繁回收
    │   年轻对象，大部分很快死去          │
    │   阈值：700 次分配差               │
    └──────────────┬───────────────────┘
                   │ 幸存者晋升
                   ▼
    ┌──────────────────────────────────┐
    │           第 1 代 (Generation 1)  │  ← 偶尔回收
    │   中年对象，已经存活过一次 GC      │
    │   阈值：10 次 gen0 回收           │
    └──────────────┬───────────────────┘
                   │ 幸存者晋升
                   ▼
    ┌──────────────────────────────────┐
    │           第 2 代 (Generation 2)  │  ← 很少回收
    │   老年对象，长期存活               │
    │   阈值：10 次 gen1 回收           │
    └──────────────────────────────────┘
```

### GC 统计信息

```python
import gc

# 查看各代对象数量
print(gc.get_count())  # (452, 3, 1)
# 452 个对象在第 0 代，3 个在第 1 代，1 个在第 2 代

# 手动触发 GC
gc.collect()  # 返回回收的不可达对象数量

# 查看 GC 收集的对象
gc.set_debug(gc.DEBUG_STATS)
gc.collect()
# 输出：
# gc: collecting generation 2...
# gc: objects in each generation: 452 3 1
# gc: done, 35 unreachable, 0 uncollectable
```

---

## 循环引用检测

> 🎭 **The Drama：追踪式 GC 的工作原理**
>
> 分代 GC 使用 **标记-清除**（Mark and Sweep）算法来检测循环引用。
> 但 Python 的实现有个巧妙的变体——它不需要遍历所有对象。

### 算法流程

```
循环引用检测算法（简化版）：

步骤 1：收集候选对象
    只有"容器对象"（list, dict, set, 自定义类实例）才可能形成循环引用。
    int, str, float 等不会——因为它们不能引用其他对象。

步骤 2：复制引用计数
    为每个候选对象创建一个临时的引用计数副本 gc_refs。

步骤 3：解除内部引用
    遍历每个对象，找到它引用的其他容器对象，
    将被引用对象的 gc_refs 减 1。

步骤 4：找到不可达对象
    gc_refs 变为 0 的对象就是"只被容器内部引用"的——
    它们形成了循环引用，是垃圾。
```

图解示例：

```
初始状态（del a, b 之后）：

    obj_A (list)          obj_B (list)
    refcnt = 1            refcnt = 1
    [ref to B] ──────────→
               ←──────────[ref to A]

步骤 2：复制引用计数
    obj_A: gc_refs = 1    obj_B: gc_refs = 1

步骤 3：解除内部引用
    obj_A 引用了 obj_B → obj_B 的 gc_refs -= 1 → gc_refs = 0
    obj_B 引用了 obj_A → obj_A 的 gc_refs -= 1 → gc_refs = 0

步骤 4：gc_refs == 0 → 不可达 → 垃圾！
    回收 obj_A 和 obj_B。
```

### 不可回收对象

```python
# 有 __del__ 方法的循环引用对象在 Python 3.4 之前不可回收
class Leaky:
    def __del__(self):
        print("Cleaned up")

a = Leaky()
b = Leaky()
a.ref = b
b.ref = a
del a, b

# Python 3.3-：放入 gc.garbage，不回收（因为不知道先调用谁的 __del__）
# Python 3.4+：PEP 442 改进，可以安全回收
```

---

## weakref：弱引用

弱引用不增加引用计数——它允许你引用一个对象，但不阻止它被回收。

### 基本用法

```python
import weakref

class ExpensiveObject:
    def __init__(self, name):
        self.name = name
    def __repr__(self):
        return f"ExpensiveObject({self.name!r})"

# 创建对象和弱引用
obj = ExpensiveObject("data")
weak = weakref.ref(obj)

print(weak())    # ExpensiveObject('data') —— 对象还活着
print(weak)      # <weakref at 0x...; to 'ExpensiveObject' at 0x...>

del obj          # 删除强引用
print(weak())    # None —— 对象已被回收
```

### 回调函数

```python
import weakref

def on_finalize(ref):
    print(f"对象被回收了: {ref}")

obj = ExpensiveObject("cache_data")
weak = weakref.ref(obj, on_finalize)

del obj
# 输出: 对象被回收了: <weakref at 0x...; dead>
```

### 实际应用：弱引用缓存

```python
import weakref

class ImageCache:
    """弱引用缓存——当内存紧张时，缓存自动释放。"""

    def __init__(self):
        self._cache = weakref.WeakValueDictionary()

    def get_image(self, path: str):
        # 尝试从缓存获取
        image = self._cache.get(path)
        if image is not None:
            print(f"Cache hit: {path}")
            return image

        # 缓存未命中，加载图片
        print(f"Loading: {path}")
        image = load_image(path)  # 假设这个函数存在
        self._cache[path] = image
        return image

    # 当外部代码不再引用某个 image 对象时，
    # WeakValueDictionary 会自动移除对应的条目。
    # 不需要手动管理缓存大小！
```

### 观察者模式中的弱引用

```python
import weakref

class EventEmitter:
    """使用弱引用的事件系统，避免监听器泄漏。"""

    def __init__(self):
        self._listeners = weakref.WeakSet()

    def add_listener(self, listener):
        self._listeners.add(listener)

    def emit(self, event):
        # WeakSet 自动移除已被回收的监听器
        for listener in self._listeners:
            listener.handle(event)

class MyListener:
    def handle(self, event):
        print(f"Received: {event}")

emitter = EventEmitter()
listener = MyListener()
emitter.add_listener(listener)
emitter.emit("hello")  # Received: hello

del listener
emitter.emit("hello")  # 无输出——listener 已被回收，WeakSet 自动清理
```

> 🧰 **Toolbox：弱引用的适用场景**
>
> | 场景 | 工具 | 原因 |
> |------|------|------|
> | 缓存（值可能被回收） | `WeakValueDictionary` | 内存紧张时自动清理 |
> | 缓存（键可能被回收） | `WeakKeyDictionary` | 对象删除时自动清理 |
> | 观察者/监听器集合 | `WeakSet` | 避免泄漏 |
> | 跟踪对象实例 | `weakref.ref` | 不影响生命周期 |
> | 打破循环引用 | `weakref.ref` | 弱引用不计入 refcnt |
>
> 注意：`int`、`str`、`tuple` 等不可变内置类型不支持弱引用。

---

## \_\_del\_\_ 的陷阱

`__del__` 是 Python 的"析构函数"——但它和 C++ 的析构函数非常不同。

### 陷阱 1：调用时机不确定

```python
class Resource:
    def __del__(self):
        print("Resource released")

# CPython 中通常是确定性的
r = Resource()
del r  # 立即输出 "Resource released"（引用计数归零）

# 但在这些情况下不确定：
# 1. 循环引用中的对象
# 2. 解释器关闭时
# 3. 其他 Python 实现（PyPy）
```

### 陷阱 2：复活对象

```python
zombies = []

class Zombie:
    def __del__(self):
        zombies.append(self)  # 在析构中把自己加回全局列表
        print("I'm back!")    # 对象被"复活"了

z = Zombie()
del z       # "I'm back!" —— 对象复活了
print(len(zombies))  # 1 —— 对象还在！

# 这是一个可怕的反模式——不要这么做
```

### 陷阱 3：异常被吞掉

```python
class Broken:
    def __del__(self):
        raise RuntimeError("cleanup failed!")  # 异常被忽略

b = Broken()
del b
# 输出: Exception ignored in: <function Broken.__del__ at 0x...>
# 异常不会传播——只打印一个警告
```

### 陷阱 4：解释器关闭时的混乱

```python
import os

class FileManager:
    def __init__(self, path):
        self.path = path

    def __del__(self):
        # 解释器关闭时，os 模块可能已经被清理
        os.remove(self.path)  # 可能抛出 TypeError: 'NoneType' is not callable
```

### 正确的做法：上下文管理器

```python
# ❌ 依赖 __del__
class DatabaseConnection:
    def __del__(self):
        self.close()

# ✅ 使用上下文管理器
class DatabaseConnection:
    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

# 使用
with DatabaseConnection() as db:
    db.execute("SELECT ...")
# 离开 with 块时，__exit__ 一定会被调用
```

> 🧘 **Zen of Code：确定性 > 便利性**
>
> `__del__` 的诱惑是"自动清理"。但"自动"意味着"不确定"。
> `with` 语句的智慧是：**把清理的责任交给调用者，而不是被调用者**。
> 这是"显式优于隐式"的又一个体现。

---

## 内存泄漏排查

> 🧠 **CS Master's Bridge：Python 也会内存泄漏？**
>
> 严格来说，有 GC 的语言不会有 C/C++ 那种"忘记 free"的泄漏。
> 但 Python 有 **逻辑泄漏**——对象还被引用着，但你以为它已经被回收了。
>
> 常见原因：
> 1. 全局变量/类变量中的列表/字典不断增长
> 2. 闭包意外捕获了大对象
> 3. 循环引用 + `__del__`（Python 3.4 之前）
> 4. C 扩展中的引用计数 bug

### tracemalloc：追踪内存分配

```python
import tracemalloc

# 开始追踪
tracemalloc.start()

# 你的代码
data = [list(range(1000)) for _ in range(1000)]

# 获取快照
snapshot = tracemalloc.take_snapshot()

# 按文件统计
top_stats = snapshot.statistics('lineno')
print("[ Top 10 内存分配 ]")
for stat in top_stats[:10]:
    print(stat)

# 输出类似：
# /path/to/script.py:6: size=7874 KiB, count=1001, average=7872 B
```

### 对比快照

```python
import tracemalloc

tracemalloc.start()

# 快照 1：初始状态
snapshot1 = tracemalloc.take_snapshot()

# 执行一些操作
cache = {}
for i in range(10000):
    cache[i] = f"value_{i}" * 100

# 快照 2：操作后
snapshot2 = tracemalloc.take_snapshot()

# 对比差异
top_stats = snapshot2.compare_to(snapshot1, 'lineno')
print("[ 内存增长 Top 10 ]")
for stat in top_stats[:10]:
    print(stat)

# 输出类似：
# /path/to/script.py:9: size=8234 KiB (+8234 KiB), count=10001 (+10001)
```

### gc 模块：检测循环引用

```python
import gc

# 开启 GC 调试
gc.set_debug(gc.DEBUG_SAVEALL)  # 不可达对象存入 gc.garbage

# 创建循环引用
class Node:
    def __init__(self, name):
        self.name = name
        self.ref = None

a = Node("A")
b = Node("B")
a.ref = b
b.ref = a
del a, b

# 手动触发 GC
collected = gc.collect()
print(f"回收了 {collected} 个对象")
print(f"不可达对象: {gc.garbage}")

# 清理
gc.garbage.clear()
gc.set_debug(0)
```

### objgraph：可视化对象引用

```python
# pip install objgraph
import objgraph

# 查看最常见的对象类型
objgraph.show_most_common_types(limit=10)
# dict         12345
# list          6789
# tuple         5432
# function      3210
# ...

# 查看某类型对象的增长
objgraph.show_growth(limit=10)  # 与上次调用相比

# 查看对象的引用链
class LeakyCache:
    _data = []  # 类变量——每个实例的数据都会累积在这里！

for i in range(1000):
    cache = LeakyCache()
    cache._data.append(f"item_{i}")

# 查看谁在引用这些字符串
objgraph.show_backrefs(
    objgraph.by_type('str')[-1],
    max_depth=5,
    filename='refs.png'  # 生成引用图
)
```

### 实战：排查内存泄漏的流程

```
内存泄漏排查流程图：

1. 发现症状
   └── 进程内存持续增长，不回落

2. 初步定位
   ├── tracemalloc.start() → 对比快照
   │   └── 找到分配最多内存的文件和行号
   └── objgraph.show_growth()
       └── 找到数量持续增长的对象类型

3. 深入分析
   ├── objgraph.show_backrefs()
   │   └── 找到谁在引用这些对象
   ├── gc.collect() + gc.garbage
   │   └── 检查是否有不可回收的循环引用
   └── 代码审查
       ├── 全局/类变量中的容器是否只增不减？
       ├── 闭包是否捕获了大对象？
       ├── 事件监听器是否忘记取消注册？
       └── C 扩展是否正确管理引用计数？

4. 修复
   ├── 使用 weakref 打破循环引用
   ├── 给缓存加上大小限制（LRU）
   ├── 使用 with 语句确保资源释放
   └── 避免在类变量中累积数据
```

---

## 总结：Python 内存管理的哲学

> 🌌 **The Big Picture：自动 ≠ 免费**
>
> Python 的内存管理是"自动"的——但不是"免费"的。
> 它需要你理解：
>
> | 你不需要做的 | 你需要知道的 |
> |-------------|-------------|
> | 手动 malloc/free | 循环引用的存在 |
> | 计算对象大小 | 弱引用的用途 |
> | 管理内存池 | \_\_del\_\_ 的陷阱 |
> | 处理碎片化 | 缓存可能造成泄漏 |
> | 选择分配策略 | tracemalloc 的用法 |
>
> Python 的承诺是：**90% 的情况你不需要想内存的事。**
> 但剩下的 10%——大缓存、长时间运行的服务、C 扩展——
> 你需要理解底层机制才能做出正确的决定。
>
> 这又是一个 "Practicality beats purity" 的例子：
> 不追求完美的自动化（如 Rust 的零开销抽象），
> 而是用一个"足够好"的方案覆盖大多数场景，
> 然后提供工具让你处理剩下的边界情况。

---

## 参考资源

- [Memory Management in CPython (PEP 3118)](https://docs.python.org/3/c-api/memory.html)
- [gc — Garbage Collector Interface](https://docs.python.org/3/library/gc.html)
- [weakref — Weak References](https://docs.python.org/3/library/weakref.html)
- [tracemalloc — Trace Memory Allocations](https://docs.python.org/3/library/tracemalloc.html)
- [objgraph — Object Reference Graphs](https://mg.pov.lt/objgraph/)
- [PEP 442 — Safe Object Finalization](https://peps.python.org/pep-0442/)

---

[👈 第 2 章：CPython 内部实现](../02-cpython-internals/) | [👉 第 4 章：GIL 的真相](../04-gil-concurrency-truth/)

[⬆️ 返回 Stage 5 目录](../README.md)
