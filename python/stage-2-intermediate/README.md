# 阶段 2：进阶级 — Python 工程化

> *"There should be one-- and preferably only one --obvious way to do it."*
> — The Zen of Python, Line 13

欢迎来到 Python 学习的第二阶段！在这个阶段，你将从"写脚本"进阶到"写工程"——学会用面向对象组织代码，用类型标注保障安全，用 `pytest` 验证正确性，用装饰器消除重复。

> 🌌 **The Big Picture：Python 的两张面孔**
>
> Stage 1 让你看到了 Python 的第一张面孔：简洁、灵活、动态、快速原型。这是 Python 吸引你的原因。
> Stage 2 将չ示第二张面孔：严谨、工程化、可维护。这是 Python 留住你的原因。
>
> 很多人以为 Python "不适合大项目"。错了。Instagram（数ʮ亿用户）、Spotify、Dropbox 都用 Python 构建了核心系统。
> 关键不是语言能不能，而是你会不会用对工具：**类型标注、测试、模块化设计**。
> û有这些，任何语言写的大项目都会腐烂；有了这些，Python 同样可以构建坚如磐ʯ的系统。

## 🎯 学习目标

完成本阶段后，你将能够：

- ✅ 掌握 Python OOP：类、继承、多态、MRO、mixin
- ✅ 理解魔术方法（`__repr__`、`__eq__`、`__hash__` 等）的设计意图
- ✅ 掌握迭代器协议与生成器的惰性求值
- ✅ 能写出和理解装饰器（包括带参数的装饰器）
- ✅ 用 `with` 语句和上下文管理器管理资Դ
- ✅ 用 `typing` + `mypy` 为动态语言添加类型安全
- ✅ 用 `pytest` 编写单元测试和参数化测试
- ✅ 理解 Python 模块系统和包管理的现代实践
- ✅ 独立完成数据处理管道项目

## 📚 学习内容

### [第 1 章：面向对象编程](./01-oop-fundamentals/)

**学习时长：** 4-5 天

**核心内容：**
- 类定义与实例化
- `__init__`、`self` 的真正含义
- 继承与 `super()`
- 多重继承与 MRO（C3 线性化算法）
- Mixin 模式
- `@property`：计算属性
- `@classmethod` vs `@staticmethod`
- `dataclasses`（3.7+）：告别样板代码
- `__slots__`：内存优化

**学习成果：**
- 理解 Python OOP 与 Java/C++ OOP 的本质区别
- 掌握 `dataclasses` 减少 80% 的样板代码
- 能正确使用继承和组合

> 🎭 **The Drama：Python 的 OOP 不是 Java 的 OOP**
>
> Java ˵："一切都必须是类。想写个 `main()`？先创建 `class App`。想定义常量？`public static final int`。"
> Python ˵："如果一个函数就够了，别写类。如果一个模块就够了，别搞包。"
>
> ```python
> # Java ˼维 — 过度工程化
> class MathUtils:
>     @staticmethod
>     def add(a, b):
>         return a + b
>
> # Pythonic — 一个函数就够了
> def add(a, b):
>     return a + b
> ```
>
> **不要为了 OOP 而 OOP。** 类是工具，不是信仰。

---

### [第 2 章：魔术方法入门](./02-dunder-methods/)

**学习时长：** 3-4 天

**核心内容：**
- `__repr__` vs `__str__`：给开发者看 vs 给用户看
- `__eq__` 与 `__hash__`：可哈希对象的契约
- `__lt__`、`__le__` 等比较方法与 `@functools.total_ordering`
- `__bool__`：自定义真值判定
- `__len__`、`__getitem__`：让对象像集合一样操作
- `__call__`：让对象像函数一样调用
- `__format__`：自定义 f-string 格式化

**学习成果：**
- 理解魔术方法是 Python 数据模型的"接口"
- 能让自定义对象与内置语法无缝集成
- 为 Stage 3 的完整数据模型打基础

> ⚛️ **The Science：魔术方法的本质 — 协议 (Protocol)**
>
> Python 不靠 `interface` 关键字来定义接口——它靠**协议 (Protocol)**。
> 如果你的对象实现了 `__iter__` 和 `__next__`，它就是可迭代的——不需要继承任何基类。
> 如果实现了 `__getitem__`，它就支持 `obj[key]`。如果实现了 `__len__`，它就支持 `len(obj)`。
>
> 这就是**鸭子类型 (Duck Typing)** 的核心：不看你是什么，看你能做什么。
> 魔术方法就是 Python 的"鸭子协议"——你实现哪些方法，就获得哪些能力。

---

### [第 3 章：迭代器与生成器](./03-iterators-generators/)

**学习时长：** 3-4 天

**核心内容：**
- 可迭代对象 (Iterable) vs 迭代器 (Iterator)
- 迭代器协议：`__iter__` + `__next__`
- `for` 循环的底层机制
- 生成器函数：`yield` 的暂停与恢复
- 生成器表达式 vs 列表推导式
- `yield from`：委托生成器
- `itertools` 模块：无限迭代器、组合迭代器
- 惰性求值的威力：处理 GB 级数据而不爆内存

**学习成果：**
- 理解 Python 迭代的底层机制
- 能用生成器处理大数据流
- 掌握 `itertools` 常用工具

> 🧠 **CS Master's Bridge：生成器 = 协程的前身**
>
> 生成器的 `yield` 本质上是一种**协作式调度**：函数在 `yield` 处暂停执行，把控制权交还给调用者。
> 下次调用 `next()` 时，从暂停的地方恢复。这和操作系统的协程（coroutine）是同一˼想。
>
> 事实上，Python 的 `asyncio` 最初就是基于生成器实现的（PEP 342/380），后来才引入了 `async/await` 语法。
> 所以理解生成器，就是为 Stage 3 的异步编程打下最坚实的基础。

---

### [第 4 章：装饰器](./04-decorators/)

**学习时长：** 3-4 天

**核心内容：**
- 闭包回顾：装饰器的基础
- 函数装饰器：`@decorator` 语法
- `functools.wraps`：保留原函数元信息
- 带参数的装饰器（三层Ƕ套）
- 类装饰器
- 实用装饰器：计时、重试、缓存、日志、权限检查
- `functools.lru_cache` / `functools.cache`
- 装饰器叠加˳序

**学习成果：**
- 理解装饰器是"高阶函数 + 闭包"的语法糖
- 能独立编写实用装饰器
- 能读懂框架Դ码中的装饰器用法

> 🎭 **The Drama：装饰器 — 最"可怕"也最优雅的 Python 特性**
>
> 新手看到装饰器：三层Ƕ套函数 + `*args` + `**kwargs` + `functools.wraps`，头Ƥ发麻。
> 老手看到装饰器：AOP（面向切面编程）的优雅实现，一行 `@retry(max_attempts=3)` 解决横切关注点。
>
> 装饰器的本质极其简单：
> ```python
> @decorator
> def func(): ...
> # 等价于
> func = decorator(func)
> ```
> 就这么简单。一旦你理解了这个等价关系，三层Ƕ套就不再神秘。

---

### [第 5 章：上下文管理器](./05-context-managers/)

**学习时长：** 2-3 天

**核心内容：**
- `with` 语句的底层机制：`__enter__` 和 `__exit__`
- 类实现 vs `contextlib.contextmanager`（生成器方式）
- 常见使用场景：文件、锁、数据库连接、临时修改
- `contextlib.suppress`：优雅地忽略特定异常
- `contextlib.ExitStack`：动态管理多个上下文
- 异步上下文管理器：`async with`

**学习成果：**
- 理解 `with` 语句是资Դ管理的最佳实践
- 能实现自定义上下文管理器
- 掌握 `contextlib` 工具箱

---

### [第 6 章：类型标注与 mypy](./06-type-hints-mypy/)

**学习时长：** 3-4 天

**核心内容：**
- 为什么动态语言也需要类型：大项目的必要性
- 基础类型标注：`int`、`str`、`list[int]`、`dict[str, Any]`
- `Optional`、`Union`、`Literal`
- 泛型：`TypeVar`、`Generic`
- `Protocol`（结构化子类型）：鸭子类型的类型标注
- `TypedDict`：字典的精确类型
- `mypy` 配置与使用
- 渐进式类型化：从无类型到全类型的Ǩ移策略
- `Annotated` 与运行时验证（Pydantic 预览）

**学习成果：**
- 能为现有代码添加类型标注
- 掌握 `mypy` 静态检查的配置和使用
- 理解 `Protocol` 与 `ABC` 的区别和选择

> 🌌 **The Big Picture：Python 的类型系统 — 从放任到自律的演化**
>
> - **2014 (PEP 484)**：Python 3.5 引入类型标注。但只是"注释"，运行时完全忽略。
> - **2017 (PEP 544)**：引入 `Protocol`，让鸭子类型也能被静态检查。
> - **2020 (PEP 612)**：`ParamSpec`，让装饰器的类型标注终于可用。
> - **2022 (PEP 695)**：Python 3.12 引入 `type` 语句和新的泛型语法 `def f[T](x: T) -> T`。
> - **2024+**：类型标注已成为所有严肃 Python 项目的标配。
>
> Python 的类型系统是**渐进式 (Gradual)** 的——你可以一点一点地加类型，不需要一步到位。
> 这比 TypeScript 的"要么全用要么不用"更务实。

---

### [第 7 章：模块、包与虚拟环境](./07-modules-packages/)

**学习时长：** 2-3 天

**核心内容：**
- 模块 (module) vs 包 (package) vs 库 (library)
- `import` 的搜索·径与机制
- `__init__.py` 的作用与最佳实践
- 相对导入 vs 绝对导入
- 虚拟环境：`venv`、`conda`、`uv`
- `pyproject.toml`：现代 Python 项目配置
- 依赖管理：`requirements.txt` vs `pyproject.toml` vs `poetry`
- 发布包到 PyPI 的流程预览

**学习成果：**
- 理解 Python 的模块系统
- 能组织多文件项目的代码结构
- 掌握现代依赖管理实践

---

### [第 8 章：测试与 pytest](./08-testing-pytest/)

**学习时长：** 3-4 天

**核心内容：**
- 为什么要测试：测试是设计工具，不仅仅是验证工具
- `pytest` 基础：测试发现、断言、fixture
- 参数化测试：`@pytest.mark.parametrize`
- fixture：测试的依赖注入
- Mock 与 Monkey Patch：`unittest.mock`、`pytest-mock`
- 覆盖率：`pytest-cov`
- TDD 实践流程：Red → Green → Refactor
- 测试金字塔：单元 → 集成 → E2E

**学习成果：**
- 能用 `pytest` 为任何函数编写测试
- 掌握 fixture 和参数化测试
- 理解 TDD 的工作流程

> 🧘 **Zen of Code：测试不是负担，是设计反馈**
>
> 如果你发现一个函数很难写测试，问题不在测试——问题在函数。
> 难以测试的代码通常意味着：耦合̫重、副作用̫多、职责不清。
> **测试是代码质量最诚实的镜子。**

---

### [第 9 章：正则表达式](./09-regexp/)

**学习时长：** 2-3 天

**核心内容：**
- `re` 模块基础：`match`、`search`、`findall`、`sub`
- 正则语法：字符类、量词、锚点、分组
- 捕获组与非捕获组
- 前հ (Lookahead) 与后顾 (Lookbehind)
- ̰婪 vs 非̰婪ƥ配
- 命名组与 `re.VERBOSE`（可读正则）
- 常用正则模式：邮箱、URL、电话、日期
- 性能陷阱：回溯灾难 (ReDoS)

**学习成果：**
- 能编写中等复杂度的正则表达式
- 理解̰婪ƥ配与非̰婪ƥ配
- 知道 ReDoS 风险并能避免

---

### [实ս项目：数据处理管道](./projects/data-pipeline/)

**项目时长：** 4-6 天

**项目目标：**
创建一个 ETL 风格的数据处理管道工具：
- 📥 多格式数据输入（CSV、JSON、TOML）
- 🔄 管道式数据处理（过滤、映射、聚合、ȥ重）
- 📤 多格式数据输出（CSV、JSON、Markdown 表格）
- 🔌 插件式处理器架构（可扩չ）
- 📊 处理统计与日志
- 🧪 完整的 `pytest` 测试套件

**涵盖知识点：**
- OOP（处理器基类、策略模式）
- 生成器（流式处理大文件）
- 装饰器（日志、计时、重试）
- 上下文管理器（文件操作）
- 类型标注（全项目）
- `pytest` 测试
- `pathlib` + `json` + `csv`

---

### [练习题和评估](./exercises/)

**练习内容：**
- ~25 道编程练习题（难度递增）
  - OOP 练习 (练习 1-5)
  - 迭代器与生成器练习 (练习 6-10)
  - 装饰器练习 (练习 11-15)
  - 类型标注练习 (练习 16-20)
  - pytest 测试练习 (练习 21-25)
- 自我评估测验
- 阶段完成检查清单

---

## 📋 前置要求

在开始本阶段学习前，请确保你：

- ✅ 已完成 Stage 1 全部内容
- ✅ 能熟练使用 Python 基础语法和核心数据结构
- ✅ 理解函数、闭包、异常处理的概念
- ✅ 有一定的面向对象编程概念（任何语言的都行）

## 🎓 学习建议

### 时间安排

**总学习时长：** 5-6 周

**每周安排建议：**
- 第 1 周：第 1-2 章（OOP + 魔术方法）
- 第 2 周：第 3-4 章（迭代器/生成器 + 装饰器）
- 第 3 周：第 5-6 章（上下文管理器 + 类型标注）
- 第 4 周：第 7-8 章（模块/包 + pytest）
- 第 5 周：第 9 章 + 开始项目
- 第 6 周：完成项目 + 练习题

### 关键提示

> ⚠️ **警告：装饰器和生成器是本阶段的"Boss 关"**
>
> 如果你在第 3-4 章感到困惑，这是正常的。建议：
> 1. 先理解概念，不要急着记语法
> 2. 手动չ开装饰器的等价形式，直到你能在脑中"编译"它
> 3. 用 `print` 在生成器的 `yield` 前后加日志，观察暂停/恢复的时机
> 4. 多写小例子，少看长文章

## ✅ 完成标准

完成本阶段后，你应该能够：

- [ ] 设计合理的类层次结构，正确使用继承和组合
- [ ] 实现常用魔术方法，让自定义对象与 Python 语法集成
- [ ] 用生成器实现惰性数据处理管道
- [ ] 独立编写带参数的装饰器
- [ ] 为函数和类添加完整的类型标注
- [ ] 用 `pytest` 编写参数化测试和 fixture
- [ ] 完成数据处理管道项目
- [ ] 通过阶段练习题（正确率 ≥ 80%）

## 🚀 开始学习

**[👉 第 1 章：面向对象编程](./01-oop-fundamentals/)**

---

## 📖 参考资Դ

- [Python 官方文档 - 类](https://docs.python.org/3/tutorial/classes.html)
- [Python 官方文档 - typing](https://docs.python.org/3/library/typing.html)
- [Fluent Python, Ch.9-17](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/) — OOP 和数据模型的ʥ经
- [pytest 官方文档](https://docs.pytest.org/)
- [mypy 官方文档](https://mypy.readthedocs.io/)
- [Real Python - OOP](https://realpython.com/python3-object-oriented-programming/)
