# 第 8 章：设计模式 — Python 不是 Java，别照搬

> "Design patterns are not a silver bullet to all your problems. They are a set of tools to help you solve common problems."
> — Erich Gamma (GoF 四人帮之一)
>
> 当有人告诉你"Python 中也要严格遵守 23 种设计模式"时，请翻个白眼。
> Python 是一门动态语言，它有自己的惯用法。设计模式在 Python 中不是教条，而是灵感。

---

## 📖 本章内容

- [1. Python 中的设计模式哲学](#1-python-中的设计模式哲学)
- [2. 创建型模式：工厂、单例、建造者](#2-创建型模式工厂单例建造者)
- [3. 结构型模式：适配器、装饰器、代理](#3-结构型模式适配器装饰器代理)
- [4. 行为型模式：策略、观察者、命令、状态机](#4-行为型模式策略观察者命令状态机)
- [5. Python 特色模式](#5-python-特色模式)
- [最佳实践 / 常见陷阱](#最佳实践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. Python 中的设计模式哲学

> 🎭 **The Drama: 当 Java 程序员写 Python**
>
> 一个 Java 老手来写 Python，第一件事就是创建 `AbstractSingletonProxyFactoryBean`。
> Python 社区看了一眼，说："你这个，一个函数就够了。"
>
> 这就是 Python 设计模式的核心哲学：**用最简单的工具解决问题**。
> 如果一个函数能搞定，就别用类。如果一个模块能搞定，就别搞单例。

### 1.1 GoF 模式在 Python 中的简化

GoF（Gang of Four）的 23 种设计模式诞生于 C++/Smalltalk 时代。许多模式存在的原因是语言本身的局限性。Python 作为动态语言，天然消解了很多模式的必要性：

| GoF 模式 | Java 中的实现 | Python 中的替代 | 是否还需要 |
|:---|:---|:---|:---|
| 策略模式 | 定义接口 + 多个实现类 | 传一个函数就行 | 简化 |
| 命令模式 | Command 接口 + 具体命令类 | 函数 + `functools.partial` | 简化 |
| 模板方法 | 抽象类 + 子类覆写 | 传入回调函数 | 简化 |
| 迭代器模式 | `Iterator` 接口 | `__iter__` + `__next__` / 生成器 | 语言内置 |
| 单例模式 | 双重检查锁 | 模块级变量 | 语言内置 |
| 装饰器模式 | 包装类 | `@decorator` 语法 | 语言内置 |
| 观察者模式 | `Observer` 接口 | 信号/回调/事件系统 | 仍需要 |
| 工厂方法 | 抽象工厂类 | 函数或类方法 | 简化 |
| 代理模式 | 代理类 | `__getattr__` 委托 | 简化 |

> 🧠 **CS Master's Bridge: 模式 vs 惯用法**
>
> 在学术界，设计模式被视为"面向对象设计的可复用解决方案"。
> 但 Peter Norvig（Google 研究总监）早在 1996 年就指出：
> GoF 23 种模式中有 16 种在动态语言中要么"不可见"，要么被大幅简化。
>
> 这不是说设计模式无用——而是说，在 Python 中，你应该把它们当作 **思维工具**，
> 而不是 **代码模板**。理解"为什么需要这个模式"比"怎么实现它"更重要。

### 1.2 Python 设计模式的指导原则

```
+--------------------------------------------------+
|          Python 设计模式决策树                      |
+--------------------------------------------------+
|                                                    |
|  问题 → 能用函数解决吗？                            |
|           │                                        |
|           ├── 是 → 用函数/闭包                      |
|           │                                        |
|           └── 否 → 需要状态管理吗？                  |
|                    │                                |
|                    ├── 是 → 用类                     |
|                    │    │                            |
|                    │    └── 需要多种变体？             |
|                    │         │                       |
|                    │         ├── 是 → 工厂/策略       |
|                    │         └── 否 → 简单类即可       |
|                    │                                 |
|                    └── 否 → 用模块级函数/常量          |
|                                                     |
+-----------------------------------------------------+
```

核心原则：

1. **YAGNI (You Ain't Gonna Need It)** — 不要提前引入复杂模式
2. **简单优于复杂** — `import this` 的第三条
3. **鸭子类型优于接口继承** — 如果它走起来像鸭子、叫起来像鸭子，它就是鸭子
4. **函数是一等公民** — 很多模式用函数就能搞定

---

## 2. 创建型模式：工厂、单例、建造者

### 2.1 工厂方法（Factory Method）

> 🎭 **The Drama: 谁来决定创建什么？**
>
> 想象你开了一家序列化工厂，客户说"我要 JSON 的"，你就给 JSON 序列化器；
> 客户说"我要 XML 的"，你就给 XML 序列化器。
> 客户不需要知道这些序列化器是怎么造出来的——这就是工厂的价值。

在 Python 中，工厂方法通常不需要抽象基类那一套——一个函数或类方法足矣。

```python
# ✅ Pythonic 工厂方法：用函数
import json
import logging
from typing import Any, Protocol

logger = logging.getLogger(__name__)


class Serializer(Protocol):
    """序列化器协议 — 鸭子类型替代接口"""
    def serialize(self, data: Any) -> str: ...


class JSONSerializer:
    def serialize(self, data: Any) -> str:
        logger.info("使用 JSON 序列化")
        return json.dumps(data, ensure_ascii=False)


class XMLSerializer:
    def serialize(self, data: Any) -> str:
        logger.info("使用 XML 序列化")
        items = "".join(f"<item>{v}</item>" for v in data)
        return f"<root>{items}</root>"


class CSVSerializer:
    def serialize(self, data: Any) -> str:
        logger.info("使用 CSV 序列化")
        return ",".join(str(v) for v in data)


# ✅ 工厂函数 — 简单、直接
def create_serializer(format_type: str) -> Serializer:
    """工厂函数：根据格式创建序列化器"""
    serializers: dict[str, type] = {
        "json": JSONSerializer,
        "xml": XMLSerializer,
        "csv": CSVSerializer,
    }
    cls = serializers.get(format_type.lower())
    if cls is None:
        raise ValueError(f"不支持的格式: {format_type}")
    logger.info("工厂创建了 %s 序列化器", format_type)
    return cls()


# 使用
data = ["hello", "world"]
serializer = create_serializer("json")
print(serializer.serialize(data))  # '["hello", "world"]'
```

```python
# ❌ Java 风格的抽象工厂 — 过度设计
from abc import ABC, abstractmethod

class AbstractSerializerFactory(ABC):
    @abstractmethod
    def create_serializer(self): ...

class JSONSerializerFactory(AbstractSerializerFactory):
    def create_serializer(self):
        return JSONSerializer()

class XMLSerializerFactory(AbstractSerializerFactory):
    def create_serializer(self):
        return XMLSerializer()

# 多了一层完全不必要的抽象
```

**替代类方法工厂**：用 `@classmethod` 做工厂也很常见，特别是需要多种构造方式时：

```python
from datetime import datetime
from typing import Self

class Event:
    """事件类 — 展示类方法工厂"""

    def __init__(self, name: str, timestamp: datetime, source: str) -> None:
        self.name = name
        self.timestamp = timestamp
        self.source = source
        logger.info("创建事件: %s from %s", name, source)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        """从字典创建 — 类方法工厂"""
        return cls(
            name=data["name"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            source=data.get("source", "unknown"),
        )

    @classmethod
    def from_log_line(cls, line: str) -> Self:
        """从日志行创建 — 另一个类方法工厂"""
        parts = line.split("|")
        return cls(
            name=parts[0].strip(),
            timestamp=datetime.fromisoformat(parts[1].strip()),
            source=parts[2].strip() if len(parts) > 2 else "log",
        )
```

### 2.2 单例模式（Singleton）

> 🧰 **Toolbox: Python 的"单例"就是模块**
>
> 在 Python 中，模块在首次导入时执行一次，之后的 `import` 都返回同一个对象。
> 这意味着 **模块级变量天然就是单例**。不要费劲去写双重检查锁了。

```python
# ✅ Pythonic 单例：模块即单例
# config.py — 这个模块本身就是单例
import logging
import json
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_config: dict[str, Any] = {}


def load(path: str = "config.json") -> None:
    """加载配置文件"""
    global _config
    config_path = Path(path)
    if config_path.exists():
        _config = json.loads(config_path.read_text(encoding="utf-8"))
        logger.info("配置已加载，共 %d 项", len(_config))
    else:
        logger.warning("配置文件不存在: %s", path)


def get(key: str, default: Any = None) -> Any:
    """获取配置项"""
    value = _config.get(key, default)
    logger.debug("读取配置 %s = %s", key, value)
    return value


# 使用：
# import config
# config.load("settings.json")
# db_url = config.get("database_url", "sqlite:///default.db")
```

```python
# ❌ Java 风格单例 — 在 Python 中完全多余
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

# 问题：线程不安全、继承混乱、测试困难
```

如果确实需要类级别的"只创建一次"语义（比如连接池），可以用 `__init_subclass__` 或元类，但大多数时候模块就够了。

### 2.3 建造者模式（Builder）

当对象构造参数很多、且有多种配置组合时，建造者模式让构造过程更清晰。Python 中通常用链式调用实现：

```python
from __future__ import annotations
import logging
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class HTTPRequest:
    """HTTP 请求对象 — 建造者模式的产物"""
    method: str = "GET"
    url: str = ""
    headers: dict[str, str] = field(default_factory=dict)
    body: str | None = None
    timeout: int = 30
    retries: int = 0


class HTTPRequestBuilder:
    """HTTP 请求建造者 — 链式 API"""

    def __init__(self) -> None:
        self._method: str = "GET"
        self._url: str = ""
        self._headers: dict[str, str] = {}
        self._body: str | None = None
        self._timeout: int = 30
        self._retries: int = 0

    def method(self, method: str) -> HTTPRequestBuilder:
        self._method = method.upper()
        logger.debug("设置方法: %s", self._method)
        return self

    def url(self, url: str) -> HTTPRequestBuilder:
        self._url = url
        logger.debug("设置 URL: %s", url)
        return self

    def header(self, key: str, value: str) -> HTTPRequestBuilder:
        self._headers[key] = value
        logger.debug("添加头部: %s=%s", key, value)
        return self

    def body(self, body: str) -> HTTPRequestBuilder:
        self._body = body
        return self

    def timeout(self, seconds: int) -> HTTPRequestBuilder:
        self._timeout = seconds
        return self

    def retries(self, count: int) -> HTTPRequestBuilder:
        self._retries = count
        return self

    def build(self) -> HTTPRequest:
        if not self._url:
            raise ValueError("URL 是必须的")
        logger.info("构建 %s 请求: %s", self._method, self._url)
        return HTTPRequest(
            method=self._method,
            url=self._url,
            headers=self._headers,
            body=self._body,
            timeout=self._timeout,
            retries=self._retries,
        )


# ✅ 链式调用，读起来像自然语言
request = (
    HTTPRequestBuilder()
    .method("POST")
    .url("https://api.example.com/data")
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer token123")
    .body('{"key": "value"}')
    .timeout(10)
    .retries(3)
    .build()
)
print(request)
```

> **Python 替代方案**：`dataclass` + `**kwargs` 通常就够了：
> ```python
> request = HTTPRequest(method="POST", url="...", headers={...})
> ```
> 只有当构建逻辑复杂（需要验证、默认值推导、条件设置）时，建造者模式才有必要。

---

## 3. 结构型模式：适配器、装饰器、代理

### 3.1 适配器模式（Adapter）

> 🌌 **The Big Picture: 接口不匹配的世界**
>
> 现实世界充满了接口不匹配——你的手机用 USB-C，酒店只有 USB-A 口。
> 你需要一个转接头。在代码中，适配器就是那个转接头。
>
> 场景：你的系统期望 `read_data()` 接口，但第三方库提供的是 `fetch()`。
> 适配器把 `fetch()` 包装成 `read_data()`，让两个不兼容的接口能协同工作。

```python
import logging
from typing import Protocol, Any

logger = logging.getLogger(__name__)


# 我们系统期望的接口
class DataSource(Protocol):
    def read_data(self) -> list[dict[str, Any]]: ...


# 第三方库的接口（我们无法修改）
class LegacyDatabase:
    """遗留数据库 — 接口与我们不兼容"""
    def fetch_records(self, table: str) -> list[tuple]:
        logger.info("从遗留数据库获取数据: %s", table)
        return [
            ("Alice", 30, "alice@example.com"),
            ("Bob", 25, "bob@example.com"),
        ]


# ✅ 适配器：让遗留接口兼容新接口
class LegacyDatabaseAdapter:
    """适配器 — 把 LegacyDatabase 适配成 DataSource"""

    def __init__(self, legacy_db: LegacyDatabase, table: str) -> None:
        self._db = legacy_db
        self._table = table
        self._columns = ["name", "age", "email"]

    def read_data(self) -> list[dict[str, Any]]:
        """适配方法：tuple → dict"""
        raw = self._db.fetch_records(self._table)
        result = [dict(zip(self._columns, row)) for row in raw]
        logger.info("适配器转换了 %d 条记录", len(result))
        return result


# 使用
legacy_db = LegacyDatabase()
adapter = LegacyDatabaseAdapter(legacy_db, "users")
data = adapter.read_data()
print(data)  # [{'name': 'Alice', 'age': 30, ...}, ...]
```

### 3.2 装饰器模式 vs Python 装饰器

> 🧠 **CS Master's Bridge: 两个"装饰器"的关系**
>
> GoF 的装饰器模式（Decorator Pattern）和 Python 的 `@decorator` 语法虽然名字相同，
> 但它们不完全是一回事：
>
> - **GoF 装饰器模式**：通过包装对象来增强功能，要求包装类与被包装类有相同的接口
> - **Python 装饰器**：一个接受函数/类并返回修改后版本的高阶函数
>
> Python 装饰器可以用来实现 GoF 装饰器模式，但它的用途远比 GoF 定义的更广。

| 对比维度 | GoF 装饰器模式 | Python `@decorator` |
|:---|:---|:---|
| 应用对象 | 类的实例 | 函数、方法、类 |
| 实现方式 | 同接口的包装类 | 高阶函数 |
| 目的 | 动态添加职责 | 修改/增强行为 |
| 典型场景 | Java IO 流 | 日志、缓存、权限检查 |
| 组合方式 | 层层嵌套包装 | 叠加 `@` 语法 |

```python
import functools
import logging
import time
from typing import Callable, TypeVar, ParamSpec

logger = logging.getLogger(__name__)

P = ParamSpec("P")
R = TypeVar("R")


# ✅ Python 装饰器实现"装饰器模式"
def timing(func: Callable[P, R]) -> Callable[P, R]:
    """计时装饰器 — 测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info("%s 执行耗时: %.4f 秒", func.__name__, elapsed)
        return result
    return wrapper


def retry(max_attempts: int = 3) -> Callable[[Callable[P, R]], Callable[P, R]]:
    """重试装饰器 — 失败时自动重试"""
    def decorator(func: Callable[P, R]) -> Callable[P, R]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    logger.warning(
                        "%s 第 %d 次尝试失败: %s",
                        func.__name__, attempt, e,
                    )
                    if attempt == max_attempts:
                        raise
            raise RuntimeError("不应到达此处")
        return wrapper
    return decorator


# 叠加使用 — 功能组合
@timing
@retry(max_attempts=3)
def fetch_data(url: str) -> str:
    logger.info("获取数据: %s", url)
    return f"data from {url}"
```

### 3.3 代理模式（Proxy）

代理模式为另一个对象提供一个替身或占位符以控制对它的访问。Python 中可以用 `__getattr__` 优雅实现：

```python
import logging
from typing import Any

logger = logging.getLogger(__name__)


class HeavyResource:
    """重量级资源 — 初始化很慢"""

    def __init__(self) -> None:
        logger.info("正在初始化重量级资源...（假装很慢）")
        self.data = list(range(1_000_000))
        logger.info("初始化完成")

    def query(self, index: int) -> int:
        logger.info("查询索引 %d", index)
        return self.data[index]


class LazyProxy:
    """懒加载代理 — 延迟初始化重量级资源"""

    def __init__(self) -> None:
        self._resource: HeavyResource | None = None
        logger.info("代理已创建（资源尚未加载）")

    def _ensure_loaded(self) -> HeavyResource:
        if self._resource is None:
            logger.info("首次访问，正在加载资源...")
            self._resource = HeavyResource()
        return self._resource

    def __getattr__(self, name: str) -> Any:
        """代理所有属性访问到真实对象"""
        logger.debug("代理转发属性访问: %s", name)
        return getattr(self._ensure_loaded(), name)


# ✅ 使用代理 — 创建时不会触发重量级初始化
proxy = LazyProxy()          # 输出: 代理已创建（资源尚未加载）
print(proxy.query(42))       # 首次访问才初始化
print(proxy.query(100))      # 后续访问直接使用已加载的资源
```

```python
# ❌ 不用代理 — 导入时就要等待
resource = HeavyResource()   # 立刻开始慢速初始化，即使可能不会用到
```

---

## 4. 行为型模式：策略、观察者、命令、状态机

### 4.1 策略模式（Strategy）

> 🧰 **Toolbox: 在 Python 中，策略就是函数**
>
> Java 需要定义 `Strategy` 接口 + 多个实现类。
> Python 中？传一个函数就行了。函数是一等公民，天然就是策略。

```python
import logging
from typing import Callable

logger = logging.getLogger(__name__)


# ✅ Python 策略模式：函数即策略
def bubble_sort(data: list[int]) -> list[int]:
    """冒泡排序策略"""
    logger.info("使用冒泡排序，数据量: %d", len(data))
    result = data.copy()
    for i in range(len(result)):
        for j in range(len(result) - 1 - i):
            if result[j] > result[j + 1]:
                result[j], result[j + 1] = result[j + 1], result[j]
    return result


def quick_sort(data: list[int]) -> list[int]:
    """快速排序策略"""
    logger.info("使用快速排序，数据量: %d", len(data))
    if len(data) <= 1:
        return data
    pivot = data[len(data) // 2]
    left = [x for x in data if x < pivot]
    middle = [x for x in data if x == pivot]
    right = [x for x in data if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)


# 策略容器
class Sorter:
    """排序器 — 策略可以动态切换"""

    def __init__(self, strategy: Callable[[list[int]], list[int]]) -> None:
        self._strategy = strategy
        logger.info("排序器初始化，策略: %s", strategy.__name__)

    @property
    def strategy(self) -> Callable[[list[int]], list[int]]:
        return self._strategy

    @strategy.setter
    def strategy(self, new_strategy: Callable[[list[int]], list[int]]) -> None:
        logger.info("切换策略: %s → %s", self._strategy.__name__, new_strategy.__name__)
        self._strategy = new_strategy

    def sort(self, data: list[int]) -> list[int]:
        return self._strategy(data)


# 使用
numbers = [5, 2, 8, 1, 9, 3]
sorter = Sorter(bubble_sort)
print(sorter.sort(numbers))

sorter.strategy = quick_sort  # 动态切换策略
print(sorter.sort(numbers))

# 甚至可以用 lambda 作为策略
sorter.strategy = lambda data: sorted(data, reverse=True)
```

```python
# ❌ Java 风格 — 在 Python 中过度设计
from abc import ABC, abstractmethod

class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data: list) -> list: ...

class BubbleSortStrategy(SortStrategy):
    def sort(self, data: list) -> list:
        ...  # 实现

class QuickSortStrategy(SortStrategy):
    def sort(self, data: list) -> list:
        ...  # 实现

# 多了接口 + 多个类，只为传递一个行为 — 函数就够了
```

### 4.2 观察者模式（Observer）

```python
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)


class EventEmitter:
    """事件发射器 — 观察者模式的 Pythonic 实现"""

    def __init__(self) -> None:
        self._listeners: dict[str, list[Callable[..., Any]]] = {}
        logger.info("事件发射器已创建")

    def on(self, event: str, callback: Callable[..., Any]) -> None:
        """注册事件监听器"""
        self._listeners.setdefault(event, []).append(callback)
        logger.info("注册监听器: %s → %s", event, callback.__name__)

    def off(self, event: str, callback: Callable[..., Any]) -> None:
        """移除事件监听器"""
        if event in self._listeners:
            self._listeners[event].remove(callback)
            logger.info("移除监听器: %s → %s", event, callback.__name__)

    def emit(self, event: str, *args: Any, **kwargs: Any) -> None:
        """触发事件"""
        listeners = self._listeners.get(event, [])
        logger.info("触发事件 '%s'，通知 %d 个监听器", event, len(listeners))
        for callback in listeners:
            try:
                callback(*args, **kwargs)
            except Exception as e:
                logger.error("监听器 %s 执行出错: %s", callback.__name__, e)


# 使用
emitter = EventEmitter()

def on_user_login(username: str) -> None:
    print(f"[日志] 用户登录: {username}")

def on_user_login_notify(username: str) -> None:
    print(f"[通知] 欢迎回来, {username}!")

emitter.on("login", on_user_login)
emitter.on("login", on_user_login_notify)
emitter.emit("login", "Alice")
# 输出:
# [日志] 用户登录: Alice
# [通知] 欢迎回来, Alice!
```

### 4.3 命令模式（Command）

在 Python 中，命令模式的最大价值在于 **撤销/重做** 和 **命令队列**：

```python
from __future__ import annotations
import logging
from typing import Protocol

logger = logging.getLogger(__name__)


class Command(Protocol):
    """命令协议"""
    def execute(self) -> None: ...
    def undo(self) -> None: ...


class TextEditor:
    """文本编辑器 — 命令模式的使用者"""

    def __init__(self) -> None:
        self.content: str = ""
        self._history: list[Command] = []
        logger.info("编辑器已创建")

    def execute(self, command: Command) -> None:
        command.execute()
        self._history.append(command)
        logger.info("执行命令，历史记录: %d 条", len(self._history))

    def undo(self) -> None:
        if self._history:
            command = self._history.pop()
            command.undo()
            logger.info("撤销命令，剩余历史: %d 条", len(self._history))
        else:
            logger.warning("没有可撤销的操作")


class InsertTextCommand:
    """插入文本命令"""

    def __init__(self, editor: TextEditor, text: str, position: int) -> None:
        self._editor = editor
        self._text = text
        self._position = position

    def execute(self) -> None:
        self._editor.content = (
            self._editor.content[:self._position]
            + self._text
            + self._editor.content[self._position:]
        )
        logger.info("插入 '%s' 在位置 %d", self._text, self._position)

    def undo(self) -> None:
        self._editor.content = (
            self._editor.content[:self._position]
            + self._editor.content[self._position + len(self._text):]
        )
        logger.info("撤销插入 '%s'", self._text)


# 使用
editor = TextEditor()
editor.execute(InsertTextCommand(editor, "Hello", 0))
print(editor.content)  # "Hello"

editor.execute(InsertTextCommand(editor, " World", 5))
print(editor.content)  # "Hello World"

editor.undo()
print(editor.content)  # "Hello"
```

### 4.4 状态机（State Machine）

状态机在处理复杂状态转换时非常有用（如订单流程、游戏状态、协议解析）：

```python
from __future__ import annotations
import logging
from enum import Enum, auto

logger = logging.getLogger(__name__)


class OrderState(Enum):
    """订单状态枚举"""
    PENDING = auto()
    PAID = auto()
    SHIPPING = auto()
    DELIVERED = auto()
    CANCELLED = auto()


class Order:
    """订单 — 状态机实现

    状态转换图：

    PENDING ──pay──→ PAID ──ship──→ SHIPPING ──deliver──→ DELIVERED
       │
       └──cancel──→ CANCELLED
    """

    # 状态转换表：(当前状态, 动作) → 目标状态
    TRANSITIONS: dict[tuple[OrderState, str], OrderState] = {
        (OrderState.PENDING, "pay"):     OrderState.PAID,
        (OrderState.PENDING, "cancel"):  OrderState.CANCELLED,
        (OrderState.PAID, "ship"):       OrderState.SHIPPING,
        (OrderState.SHIPPING, "deliver"): OrderState.DELIVERED,
    }

    def __init__(self, order_id: str) -> None:
        self.order_id = order_id
        self._state = OrderState.PENDING
        logger.info("订单 %s 已创建，状态: %s", order_id, self._state.name)

    @property
    def state(self) -> OrderState:
        return self._state

    def transition(self, action: str) -> None:
        """执行状态转换"""
        key = (self._state, action)
        new_state = self.TRANSITIONS.get(key)
        if new_state is None:
            msg = f"非法转换: {self._state.name} --{action}-->"
            logger.error(msg)
            raise ValueError(msg)
        old_state = self._state
        self._state = new_state
        logger.info(
            "订单 %s: %s --%s--> %s",
            self.order_id, old_state.name, action, new_state.name,
        )


# 使用
order = Order("ORD-001")
print(f"当前状态: {order.state.name}")  # PENDING

order.transition("pay")
print(f"当前状态: {order.state.name}")  # PAID

order.transition("ship")
print(f"当前状态: {order.state.name}")  # SHIPPING

order.transition("deliver")
print(f"当前状态: {order.state.name}")  # DELIVERED

# order.transition("cancel")  # ValueError: 非法转换
```

---

## 5. Python 特色模式

> 🎭 **The Drama: Python 独有的招式**
>
> 有些模式在 Python 中是"独家特色"——它们不在 GoF 的 23 种模式中，
> 却是 Python 程序员每天都在用的惯用法。

### 5.1 Mixin 模式

Mixin 是一种通过多重继承实现代码复用的模式。与普通继承不同，Mixin 类：
- 不能独立实例化
- 只提供特定功能
- 名字通常以 `Mixin` 结尾

```python
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


class SerializableMixin:
    """序列化 Mixin — 添加 JSON 序列化能力"""

    def to_json(self) -> str:
        data = {k: v for k, v in self.__dict__.items() if not k.startswith("_")}
        logger.info("序列化 %s: %s", type(self).__name__, data)
        return json.dumps(data, ensure_ascii=False, default=str)

    @classmethod
    def from_json(cls, json_str: str) -> Any:
        data = json.loads(json_str)
        logger.info("反序列化 %s", cls.__name__)
        return cls(**data)


class ValidatableMixin:
    """验证 Mixin — 添加数据验证能力"""

    _validators: dict[str, Any] = {}

    def validate(self) -> list[str]:
        errors: list[str] = []
        for field, validator in self._validators.items():
            value = getattr(self, field, None)
            if not validator(value):
                errors.append(f"{field} 验证失败: {value}")
        if errors:
            logger.warning("验证失败: %s", errors)
        else:
            logger.info("验证通过")
        return errors


class LoggableMixin:
    """日志 Mixin — 添加日志能力"""

    def log_info(self, msg: str) -> None:
        logger.info("[%s] %s", type(self).__name__, msg)

    def log_error(self, msg: str) -> None:
        logger.error("[%s] %s", type(self).__name__, msg)


# ✅ 组合使用多个 Mixin
class User(SerializableMixin, ValidatableMixin, LoggableMixin):
    """用户类 — 通过 Mixin 获得多种能力"""

    _validators = {
        "name": lambda v: isinstance(v, str) and len(v) > 0,
        "age": lambda v: isinstance(v, int) and 0 < v < 150,
    }

    def __init__(self, name: str, age: int, email: str) -> None:
        self.name = name
        self.age = age
        self.email = email


user = User("Alice", 30, "alice@example.com")
print(user.to_json())           # 序列化
print(user.validate())          # 验证
user.log_info("用户已创建")      # 日志
```

### 5.2 猴子补丁（Monkey Patching）

> **警告**：猴子补丁是强大但危险的工具。在生产代码中谨慎使用，在测试中很有用。

```python
import logging

logger = logging.getLogger(__name__)


class ThirdPartyClient:
    """假设这是第三方库的类，我们无法修改源码"""

    def connect(self) -> str:
        return "connected to production"

    def fetch(self, query: str) -> str:
        return f"production data for: {query}"


# ✅ 测试中用猴子补丁替换行为
def mock_connect(self) -> str:
    logger.info("猴子补丁: 使用模拟连接")
    return "connected to mock"

# 保存原始方法
original_connect = ThirdPartyClient.connect

# 替换
ThirdPartyClient.connect = mock_connect

client = ThirdPartyClient()
print(client.connect())  # "connected to mock"

# ✅ 测试完成后恢复
ThirdPartyClient.connect = original_connect
print(client.connect())  # "connected to production"
```

```python
# ❌ 生产代码中随意使用猴子补丁
# 导致：调试噩梦、隐式依赖、维护地狱
import some_library
some_library.important_function = my_hacky_replacement  # 别这样！
```

### 5.3 鸭子类型替代接口

```python
import logging
from typing import Any

logger = logging.getLogger(__name__)


# ✅ 鸭子类型：不需要继承接口，只要实现方法即可
class FileStorage:
    def save(self, key: str, data: Any) -> None:
        logger.info("保存到文件: %s", key)
        print(f"[文件存储] {key} = {data}")

    def load(self, key: str) -> Any:
        logger.info("从文件加载: %s", key)
        return f"file_data_{key}"


class RedisStorage:
    def save(self, key: str, data: Any) -> None:
        logger.info("保存到 Redis: %s", key)
        print(f"[Redis 存储] {key} = {data}")

    def load(self, key: str) -> Any:
        logger.info("从 Redis 加载: %s", key)
        return f"redis_data_{key}"


class MemoryStorage:
    def __init__(self) -> None:
        self._store: dict[str, Any] = {}

    def save(self, key: str, data: Any) -> None:
        self._store[key] = data
        logger.info("保存到内存: %s", key)

    def load(self, key: str) -> Any:
        logger.info("从内存加载: %s", key)
        return self._store.get(key)


def process_and_store(storage: Any, key: str, data: Any) -> None:
    """这个函数不关心 storage 的具体类型
    只要它有 save 方法就行 — 鸭子类型"""
    logger.info("处理数据并存储")
    storage.save(key, data)


# 所有存储类型都能用，不需要共同的基类
for storage in [FileStorage(), RedisStorage(), MemoryStorage()]:
    process_and_store(storage, "user:1", {"name": "Alice"})
```

> 如果你想在保持鸭子类型灵活性的同时获得类型检查的好处，使用 `Protocol`：
> ```python
> from typing import Protocol, Any
>
> class Storage(Protocol):
>     def save(self, key: str, data: Any) -> None: ...
>     def load(self, key: str) -> Any: ...
> ```
> 这是 Python 3.8+ 的 **结构化子类型（Structural Subtyping）**，无需继承。

### 5.4 上下文管理器模式

```python
import logging
import time
from contextlib import contextmanager
from typing import Generator

logger = logging.getLogger(__name__)


# ✅ 类式上下文管理器
class DatabaseConnection:
    """数据库连接 — 上下文管理器确保资源释放"""

    def __init__(self, url: str) -> None:
        self.url = url
        self._connection = None

    def __enter__(self) -> "DatabaseConnection":
        logger.info("连接到数据库: %s", self.url)
        self._connection = f"conn_{self.url}"
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        logger.info("关闭数据库连接: %s", self.url)
        self._connection = None
        if exc_type is not None:
            logger.error("操作出错: %s", exc_val)
        return False  # 不吞掉异常


# ✅ 生成器式上下文管理器 — 更简洁
@contextmanager
def timer(label: str) -> Generator[None, None, None]:
    """计时上下文管理器"""
    start = time.perf_counter()
    logger.info("[%s] 开始计时", label)
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info("[%s] 耗时: %.4f 秒", label, elapsed)
        print(f"[{label}] 耗时: {elapsed:.4f} 秒")


# 使用
with timer("数据处理"):
    total = sum(range(1_000_000))
    print(f"结果: {total}")
```

---

## 最佳实践 / 常见陷阱

### 最佳实践

| 原则 | 说明 |
|:---|:---|
| 先用函数 | 如果一个函数能解决，不要创建类 |
| Protocol > ABC | 用 `Protocol` 实现结构化子类型，避免强制继承 |
| 组合优于继承 | 用 Mixin 和组合代替深层继承链 |
| 模块即单例 | 不要写 Java 式的 Singleton 类 |
| 利用一等函数 | 策略、命令等模式可以用函数/`partial` 代替 |

### 常见陷阱

```python
# ❌ 陷阱 1：过度设计 — 为两行代码的功能写了五个类
class AbstractNotificationFactory(ABC): ...
class EmailNotificationFactory(AbstractNotificationFactory): ...
class SMSNotificationFactory(AbstractNotificationFactory): ...
# ✅ 解决：一个字典 + 函数即可

# ❌ 陷阱 2：Mixin 顺序错误
class A(Mixin1, Mixin2, Base):  # Mixin 在前，Base 在后
    pass
# MRO（方法解析顺序）遵循 C3 线性化，Mixin 应该放在 Base 之前

# ❌ 陷阱 3：观察者模式中忘记弱引用
# 监听器持有被监听对象的强引用 → 内存泄漏
# ✅ 解决：使用 weakref.WeakSet 或 weakref.ref
```

---

## 练习题

### 练习 1：实现一个插件系统

**要求**：设计一个插件系统，支持：
- 通过装饰器注册插件
- 按名称获取插件
- 列出所有已注册插件

<details>
<summary>💡 提示</summary>

用一个字典作为注册表，装饰器将类/函数添加到字典中。

```python
registry = {}

def register(name):
    def decorator(cls):
        registry[name] = cls
        return cls
    return decorator
```
</details>

<details>
<summary>✅ 参考答案</summary>

```python
import logging
from typing import Any, Callable

logger = logging.getLogger(__name__)

_plugins: dict[str, type] = {}

def plugin(name: str) -> Callable[[type], type]:
    """插件注册装饰器"""
    def decorator(cls: type) -> type:
        _plugins[name] = cls
        logger.info("注册插件: %s → %s", name, cls.__name__)
        return cls
    return decorator

def get_plugin(name: str) -> Any:
    cls = _plugins.get(name)
    if cls is None:
        raise KeyError(f"插件未找到: {name}")
    return cls()

def list_plugins() -> list[str]:
    return list(_plugins.keys())

@plugin("json")
class JSONPlugin:
    def process(self, data):
        return f"JSON: {data}"

@plugin("xml")
class XMLPlugin:
    def process(self, data):
        return f"XML: {data}"

# 测试
print(list_plugins())               # ['json', 'xml']
print(get_plugin("json").process("hello"))  # JSON: hello
```
</details>

### 练习 2：实现带撤销的计算器

**要求**：用命令模式实现一个计算器，支持加减乘除和撤销操作。

<details>
<summary>✅ 参考答案</summary>

```python
from typing import Protocol

class CalcCommand(Protocol):
    def execute(self, value: float) -> float: ...
    def undo(self, value: float) -> float: ...

class AddCommand:
    def __init__(self, amount: float) -> None:
        self.amount = amount
    def execute(self, value: float) -> float:
        return value + self.amount
    def undo(self, value: float) -> float:
        return value - self.amount

class Calculator:
    def __init__(self) -> None:
        self.value: float = 0
        self._history: list[CalcCommand] = []

    def execute(self, cmd: CalcCommand) -> None:
        self.value = cmd.execute(self.value)
        self._history.append(cmd)
        print(f"执行后: {self.value}")

    def undo(self) -> None:
        if self._history:
            cmd = self._history.pop()
            self.value = cmd.undo(self.value)
            print(f"撤销后: {self.value}")

calc = Calculator()
calc.execute(AddCommand(10))   # 10
calc.execute(AddCommand(5))    # 15
calc.undo()                    # 10
```
</details>

---

## 参考资源 / 下一步

- [Python Design Patterns - refactoring.guru](https://refactoring.guru/design-patterns/python)
- [Python Patterns - python-patterns.guide](https://python-patterns.guide/)
- [Peter Norvig: Design Patterns in Dynamic Languages](http://norvig.com/design-patterns/)
- Brandon Rhodes 的 Python 设计模式系列
- 《流畅的 Python》第 2 版，Luciano Ramalho

---

[⬅️ 第 7 章：函数式编程](../07-functional-programming/README.md) | [🏠 返回目录](../README.md) | [➡️ 第 9 章：性能优化](../09-performance-profiling/README.md)
