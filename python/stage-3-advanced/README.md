# 阶段 3：高级 — 深入 Python

> *"In the face of ambiguity, refuse the temptation to guess."*
> — The Zen of Python, Line 12

欢迎来到 Python 学习的第三阶段！这是一个分ˮ岭——在这个阶段之后，你将从 Python 的**使用者**变成**理解者**。你不再只是调用 API，你开始理解 API 背后的机制，并创造自己的 API。

> ⚛️ **The Science：Python 数据模型 — 语言的宪法**
>
> 如果˵ Stage 1 教你识字，Stage 2 教你写作文，那 Stage 3 就是教你**修辞学和语法学**。
>
> Python 的一切"魔法"——`len(x)` 调用 `x.__len__()`、`for` 循环调用 `__iter__`、`+` 运算符调用 `__add__`——都不是硬编码在解释器里的。它们遵循一套统一的规则：**Python 数据模型 (Data Model)**。
>
> 理解数据模型，就是理解 Python 的宪法。此后你遇到的一切"黑魔法"——描述器、元类、`asyncio`——都不再是魔法，而是宪法的推论。

## 🎯 学习目标

完成本阶段后，你将能够：

- ✅ 精通 Python 数据模型（完整的魔术方法体系）
- ✅ 理解描述器协议（`property` 的底层实现）
- ✅ 掌握元类（理解"类是 `type` 的实例"）
- ✅ 精通并发编程三驾马车：`threading`、`multiprocessing`、`asyncio`
- ✅ 运用函数式编程技巧（`functools`、`itertools`、组合与柯里化）
- ✅ 用 Python 风格实现经典设计模式
- ✅ 能进行性能分析和优化
- ✅ 理解网络编程基础
- ✅ 独立完成异步爬虫框架和 PyPI 工具库项目

## 📚 学习内容

### [第 1 章：Python 数据模型](./01-data-model/)

**学习时长：** 4-5 天

**核心内容：**
- 数据模型全景图：Python 如何将魔术方法映射到内置语法
- 数值类型模拟：`__add__`、`__radd__`、`__iadd__`（反射和增量运算）
- 容器类型模拟：`__getitem__`、`__setitem__`、`__delitem__`、`__contains__`
- 可哈希协议：`__hash__` 与 `__eq__` 的契约
- 上下文管理器协议：`__enter__`、`__exit__`
- 属性访问三剑客：`__getattr__`、`__getattribute__`、`__setattr__`
- `__new__` vs `__init__`：对象的创建 vs 初始化
- `__del__` 的陷阱：析构器不是你想的那样

**学习成果：**
- 能实现一个功能完整的自定义集合类型
- 理解 Python 语法 → 魔术方法的映射关系
- 为描述器和元类打好基础

> 🎭 **The Drama：`__new__` vs `__init__` — 生与养**
>
> `__new__` 是构造器：它**创造**对象（分配内存、返回实例）。
> `__init__` 是初始化器：它**设置**对象（填充属性）。
>
> 类比：`__new__` 是产房，负责接生婴儿。`__init__` 是育婴室，负责给婴儿穿衣服、ȡ名字。
> 99% 的情况你只需要 `__init__`。但当你需要控制单例、实现不可变类型、或做元编程时，`__new__` 就登场了。

---

### [第 2 章：描述器协议](./02-descriptors/)

**学习时长：** 3-4 天

**核心内容：**
- 什么是描述器：实现了 `__get__`、`__set__`、`__delete__` 的对象
- 数据描述器 vs 非数据描述器
- `property` 的实现原理（它就是一个描述器！）
- 属性查找优先级：数据描述器 → 实例 `__dict__` → 非数据描述器
- 方法绑定的秘密：为什么 `obj.method()` 能自动传递 `self`
- 实ս：实现类型检查描述器、懒加载描述器、缓存描述器
- `__set_name__`（3.6+）：让描述器知道自己的名字

**学习成果：**
- 理解 `property` 不是魔法，而是描述器协议的一个应用
- 能实现自定义描述器来消除重复的属性逻辑
- 理解方法绑定机制

> 🧠 **CS Master's Bridge：描述器 = Python 的"属性拦截器"**
>
> 如果你熟悉 JavaScript 的 `Proxy`/`Object.defineProperty`，描述器是类似的概念。
> 如果你熟悉 Java 的 getter/setter，描述器是它的**泛化**——不是在每个类里重复写，而是定义一次，到处复用。
>
> 描述器是 Python 最底层的属性管理机制。`property`、`classmethod`、`staticmethod`、`__slots__` 背后都是描述器。

---

### [第 3 章：元类](./03-metaclasses/)

**学习时长：** 3-4 天

**核心内容：**
- 类是对象：`type` 是所有类的类
- `type()` 的三参数形式：动态创建类
- 自定义元类：`class Meta(type)`
- `__init_subclass__`（3.6+）：元类的轻量替代
- `__class_getitem__`：`list[int]` 是怎么工作的
- 元类的实ս场景：ORM、注册表、接口ǿ制
- 何时使用元类（几乎永Զ不需要）

**学习成果：**
- 理解"一切皆对象，类也是对象"的深层含义
- 能读懂 Django ORM、SQLAlchemy 的元类用法
- 知道什么时候**不该**使用元类

> 🧘 **Zen of Code：元类是 Python 的核武器**
>
> Tim Peters（`The Zen of Python` 的作者）˵过：
> *"Metaclasses are deeper magic than 99% of users should ever worry about. If you wonder whether you need them, you don't."*
>
> 元类很ǿ大，但 99% 的场景有更简单的替代方案：
> - 需要修改子类行为？用 `__init_subclass__`
> - 需要注册子类？用装饰器
> - 需要验证类属性？用 `__set_name__` 描述器
>
> 学元类是为了**理解** Python 的类型系统，不是为了在生产代码里用它。

---

### [第 4 章：并发编程 — threading](./04-concurrency-threading/)

**学习时长：** 3-4 天

**核心内容：**
- 并发 vs 并行：概念澄清
- GIL（全局解释器锁）：它是什么、保护了什么、为什么存在
- `threading` 模块：`Thread`、`Lock`、`RLock`、`Event`、`Semaphore`
- 线程安全与竞态条件
- `queue.Queue`：线程安全的通信方式
- `concurrent.futures.ThreadPoolExecutor`：高级接口
- GIL 下 threading 的适用场景：I/O 密集型任务

**学习成果：**
- 理解 GIL 的本质和影响
- 能使用线程池处理 I/O 密集型任务
- 理解竞态条件和锁的使用

> 🎭 **The Drama：GIL — Python 并发的"房间里的大象"**
>
> GIL 让 Python 的多线程无法实现 CPU 级并行——同一时刻只有一个线程在执行 Python 字节码。
> 这听起来很糟糕，但事实是：
> - **I/O 操作会释放 GIL**：网络请求、文件读写时，其他线程可以运行
> - **大部分 Web 应用是 I/O 密集型的**：等数据库、等 API、等用户
> - **NumPy/C 扩չ会释放 GIL**：计算密集型操作可以真正并行
>
> GIL 不是 Python 的 Bug，它是一个**工程权衡**：用单线程性能换ȡ实现简单性和 C 扩չ兼容性。
> 如果你需要 CPU 并行：用 `multiprocessing`。如果你需要 I/O 并发：用 `asyncio`。

---

### [第 5 章：并发编程 — multiprocessing](./05-concurrency-multiprocessing/)

**学习时长：** 2-3 天

**核心内容：**
- 进程 vs 线程：独立地址空间的代价和收益
- `multiprocessing` 模块：`Process`、`Pool`、`Queue`、`Pipe`
- `concurrent.futures.ProcessPoolExecutor`
- 共享状态：`Value`、`Array`、`Manager`
- 进程间通信（IPC）的序列化开销
- 适用场景：CPU 密集型任务（数学计算、图像处理、数据转换）
- `multiprocessing` vs `threading` 决策树

**学习成果：**
- 能用进程池加速 CPU 密集型任务
- 理解进程间通信的开销
- 掌握 threading vs multiprocessing 的选择标准

---

### [第 6 章：并发编程 — asyncio](./06-concurrency-asyncio/)

**学习时长：** 4-5 天

**核心内容：**
- 事件循环 (Event Loop) 的工作原理
- 协程 (Coroutine)：`async def`、`await`
- `asyncio.gather`：并发执行多个协程
- `asyncio.create_task`：任务调度
- `aiohttp`：异步 HTTP 客户端/服务器
- `asyncio.Semaphore`：并发控制
- 异步迭代器：`async for`、`__aiter__`
- 异步上下文管理器：`async with`
- 异步生成器：`async yield`
- 常见陷阱：阻塞操作、未等待的协程、回调地狱的异步版

**学习成果：**
- 能编写完整的异步应用
- 理解事件循环的调度机制
- 掌握异步并发控制

> ⚛️ **The Science：事件循环 — 单线程的并发魔法**
>
> `asyncio` 的事件循环和 JavaScript 的事件循环本质相同：单线程，通过回调/协程实现非阻塞 I/O。
>
> ```
> ┌──────────────────────────────────────────────────┐
> │                  事件循环 (Event Loop)              │
> │                                                    │
> │  ┌─────────┐    ┌─────────┐    ┌─────────┐       │
> │  │ Task A  │    │ Task B  │    │ Task C  │       │
> │  │ (await) │    │ (ready) │    │ (await) │       │
> │  └────┬────┘    └────┬────┘    └────┬────┘       │
> │       │              │              │              │
> │       ▼              ▼              ▼              │
> │   等待 I/O     ──▶ 执行 ──▶    等待 I/O           │
> │   (挂起)          (运行)       (挂起)              │
> └──────────────────────────────────────────────────┘
> ```
>
> 关键洞察：`await` 不是"等待"——它是"让出控制权"。
> 当一个协程 `await` I/O 时，事件循环ȥ执行其他就绪的协程。
> 这就是单线程实现"并发"的秘密：**不是真的同时执行，而是在等待时切换任务**。

---

### [第 7 章：函数式编程](./07-functional-programming/)

**学习时长：** 3-4 天

**核心内容：**
- 纯函数与副作用（回顾 JS/TS 阶段的概念）
- `map()`、`filter()`、`reduce()` vs 推导式
- `functools` 工具箱：`partial`、`reduce`、`cache`、`singledispatch`
- `itertools` 高级用法：`chain`、`groupby`、`product`、`combinations`
- `operator` 模块：函数化的运算符
- 组合 (Composition) 与管道 (Pipeline) 模式
- 不可变数据与 `frozen dataclass`
- Monad 的 Python 实现（`Optional`/`Result` 模式）

**学习成果：**
- 能在 OOP 代码中自Ȼ融入 FP 技巧
- 精通 `functools` 和 `itertools`
- 理解何时选择 FP 风格、何时选择 OOP 风格

> 🧘 **Zen of Code：Python 不是纯函数式语言，而且这是它的优势**
>
> Haskell 要求一切纯函数，所有副作用必须用 Monad 包装。这很优雅，但也很严苛。
> Python 的态度更务实：**在适合的地方用 FP，在需要的地方用 OOP，在赶时间的地方用命令式。**
>
> Python 程序员的 FP 不是信仰，是工具箱里的一把好扳手。

---

### [第 8 章：设计模式（Python 风格）](./08-design-patterns/)

**学习时长：** 4-5 天

**核心内容：**
- 为什么 Python 不需要"经典"设计模式中的一半
- **创建型**：单例（模块即单例）、工厂（函数即工厂）、Builder
- **结构型**：装饰器模式（Python 原生支持）、适配器、外观
- **行为型**：策略（函数即策略）、观察者、迭代器（Python 原生）、状态机
- Python 特有模式：Mixin、上下文管理器模式、描述器模式
- 反模式：过度设计、模式滥用

**学习成果：**
- 理解设计模式在 Python 中的简化实现
- 能识别和应用适当的模式
- 知道什么时候**不用**模式

> 🌌 **The Big Picture：Python 让很多设计模式变得多余**
>
> Peter Norvig 在 1996 年指出：GoF 23 种设计模式中，有 16 种在动态语言中可以大幅简化或完全消除。
>
> | GoF 模式 | Java 实现 | Python 实现 |
> |---------|----------|------------|
> | 策略模式 | 定义接口 + 多个实现类 | 传一个函数 |
> | 单例模式 | ˫重检查锁 + volatile | 用模块（模块天生单例）|
> | 迭代器模式 | 实现 Iterator 接口 | `yield` 一个关键字搞定 |
> | 装饰器模式 | 定义接口 + 包装类 | `@decorator` 语法糖 |
> | 命令模式 | Command 接口 + ConcreteCommand | 传一个 callable |
>
> **Python 的动态特性本身就消解了很多"模式"存在的必要性。**

---

### [第 9 章：性能优化与 Profiling](./09-performance-profiling/)

**学习时长：** 3-4 天

**核心内容：**
- "过早优化是万恶之Դ"——但知道如何优化是必需的
- `cProfile` 与 `profile`：找到性能ƿ颈
- `line_profiler`：逐行分析
- `memory_profiler`：内存使用分析
- `timeit`：微基准测试
- 常见性能陷阱：字符串ƴ接、全局变量查找、列表 vs 生成器
- 数据结构选择对性能的影响
- `__slots__` 减少内存使用
- C 扩չ预览：`ctypes`、`Cython`、`PyO3`（Rust 绑定）

**学习成果：**
- 能用 Profiling 工具定位性能ƿ颈
- 掌握常见的 Python 性能优化技巧
- 理解何时需要"逃逸"到 C/Rust

---

### [第 10 章：网络编程](./10-networking/)

**学习时长：** 3-4 天

**核心内容：**
- TCP/IP 基础回顾
- `socket` 模块：底层网络编程
- HTTP 协议与 `requests` 库
- `httpx`：同步+异步的现代 HTTP 客户端
- WebSocket 基础
- `urllib` vs `requests` vs `httpx` vs `aiohttp`
- API 客户端设计模式：重试、超时、认证

**学习成果：**
- 理解网络编程的基本概念
- 能构建健壮的 HTTP 客户端
- 为 Stage 4 的 Web 开发打基础

---

### [实ս项目 A：异步 Web 爬虫框架](./projects/async-crawler/)

**项目时长：** 5-7 天

**项目目标：**
基于 `asyncio` + `aiohttp` 构建一个可配置的异步爬虫框架：
- 🌐 异步 HTTP 请求（`aiohttp`）
- 🔄 并发控制（`Semaphore`、连接池上限）
- 🔁 重试策略（指数退避、最大重试次数）
- 🔌 中间件管道（请求/响应拦截器）
- 📝 结构化日志（`structlog`）
- 💾 结果持久化（JSON/CSV/SQLite）
- ⏱️ 超时与熔断器
- 🧪 pytest 异步测试（`pytest-asyncio`）

---

### [实ս项目 B：py-toolkit 工具库](./projects/py-toolkit/)

**项目时长：** 3-5 天

**项目目标：**
开发一个发布到 PyPI 的 Python 工具库：
- 📦 `pyproject.toml` 项目配置
- 🔤 完整类型标注 + `py.typed` marker
- 🧪 pytest 测试 + coverage > 90%
- 📝 自动生成 API 文档
- 🚀 CI/CD：GitHub Actions 自动测试 + 发布
- 包含：Result 类型、Retry 装饰器、Pipeline 构建器、事件发射器

---

### [练习题和评估](./exercises/)

**练习内容：**
- ~30 道编程练习题（难度递增）
  - 数据模型练习 (练习 1-6)
  - 描述器与元类练习 (练习 7-10)
  - 并发编程练习 (练习 11-18)
  - 函数式编程练习 (练习 19-24)
  - 设计模式与性能练习 (练习 25-30)
- 自我评估测验
- 阶段完成检查清单

---

## 📋 前置要求

- ✅ 已完成 Stage 2 全部内容
- ✅ 掌握 OOP、装饰器、生成器、类型标注
- ✅ 有 `pytest` 测试经验
- ✅ 理解闭包和高阶函数

## 🎓 学习建议

### 时间安排

**总学习时长：** 6-8 周

**每周安排建议：**
- 第 1 周：第 1-2 章（数据模型 + 描述器）
- 第 2 周：第 3 章（元类） + 第 4 章（threading）
- 第 3 周：第 5-6 章（multiprocessing + asyncio）
- 第 4 周：第 7-8 章（FP + 设计模式）
- 第 5 周：第 9-10 章（性能 + 网络）
- 第 6-7 周：项目实ս
- 第 8 周：练习题 + 回顾

### 关键提示

> 💡 **本阶段最重要的三个概念**
>
> 1. **Python 数据模型** — 理解了它，你就理解了 Python 语言本身
> 2. **asyncio** — 现代 Python 后端开发的基ʯ
> 3. **设计模式的 Python 简化** — 不要把 Java 的模式生搬硬套到 Python

## ✅ 完成标准

- [ ] 能实现一个功能完整的自定义容器类型（使用数据模型）
- [ ] 能解释描述器协议和属性查找优先级
- [ ] 能解释 GIL 的本质，并选择正确的并发方案
- [ ] 能编写完整的 asyncio 异步应用
- [ ] 完成异步爬虫框架项目
- [ ] 完成并发布 py-toolkit 到 PyPI（或本地包）
- [ ] 通过阶段练习题（正确率 ≥ 80%）

## 🚀 开始学习

**[👉 第 1 章：Python 数据模型](./01-data-model/)**

---

## 📖 参考资Դ

- [Fluent Python, 2nd Ed.](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/) — 本阶段的核心参考书
- [Effective Python, 3rd Ed.](https://effectivepython.com/) — 90 条最佳实践
- [Python Cookbook, 3rd Ed.](https://www.oreilly.com/library/view/python-cookbook-3rd/9781449357337/) — 高级技巧宝典
- [Python 官方文档 - Data Model](https://docs.python.org/3/reference/datamodel.html)
- [Python 官方文档 - asyncio](https://docs.python.org/3/library/asyncio.html)
- [Python 官方文档 - Descriptor HowTo](https://docs.python.org/3/howto/descriptor.html)
