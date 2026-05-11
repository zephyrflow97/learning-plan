#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Master generator for all Stage 3 content files.
Generates README.md files and example .py files for all chapters.
"""
import pathlib
import textwrap

BASE = pathlib.Path(__file__).parent


def w(rel_path: str, content: str) -> None:
    """Write content to file with proper UTF-8 encoding."""
    path = BASE / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.lstrip('\n'), encoding='utf-8')
    print(f'  OK: {rel_path} ({len(content):,} chars)')


def generate_ch02_examples():
    """Chapter 2: Descriptor examples"""

    w('02-descriptors/examples/01-basic-descriptor.py', r'''"""
描述器基础 — __get__, __set__, __delete__ 协议演示
展示数据描述器与非数据描述器的区别
"""

import logging
from typing import Any

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("BasicDescriptor")


# ============================================================
# 1. 最简描述器 — 观察属性访问
# ============================================================

class Verbose:
    """✅ 观察所有属性访问的描述器"""

    def __init__(self, name: str) -> None:
        self.name = name

    def __get__(self, obj: Any, objtype: type = None) -> Any:
        if obj is None:
            logger.debug("[Verbose] 类级别访问 %s，返回描述器本身", self.name)
            return self
        value = obj.__dict__.get(self.name)
        logger.debug("[Verbose] __get__: %s.%s = %r", type(obj).__name__, self.name, value)
        return value

    def __set__(self, obj: Any, value: Any) -> None:
        logger.debug("[Verbose] __set__: %s.%s = %r", type(obj).__name__, self.name, value)
        obj.__dict__[self.name] = value

    def __delete__(self, obj: Any) -> None:
        logger.debug("[Verbose] __delete__: %s.%s", type(obj).__name__, self.name)
        del obj.__dict__[self.name]


# ============================================================
# 2. 数据描述器 vs 非数据描述器
# ============================================================

class DataDescriptor:
    """✅ 数据描述器 — 实现了 __get__ 和 __set__"""

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get('_data_val', '(默认值)')

    def __set__(self, obj, value):
        logger.debug("[DataDescriptor] __set__: %r", value)
        obj.__dict__['_data_val'] = value


class NonDataDescriptor:
    """✅ 非数据描述器 — 只实现了 __get__"""

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        logger.debug("[NonDataDescriptor] __get__")
        return "来自非数据描述器的值"


class PriorityDemo:
    """演示描述器优先级"""
    data = DataDescriptor()
    non_data = NonDataDescriptor()


# ============================================================
# 演示
# ============================================================

def main() -> None:
    print("=" * 60)
    print("描述器基础演示")
    print("=" * 60)

    # --- 基础描述器 ---
    print("\n--- 1. Verbose 描述器 ---")

    class Config:
        host = Verbose('host')
        port = Verbose('port')

    config = Config()
    config.host = "localhost"
    config.port = 8080
    print(f"host = {config.host}")
    print(f"port = {config.port}")

    # 类级别访问
    print(f"Config.host = {Config.host}")

    # 删除属性
    del config.host
    print(f"删除后 host = {config.host}")

    # --- 优先级演示 ---
    print("\n--- 2. 数据 vs 非数据描述器优先级 ---")
    obj = PriorityDemo()

    obj.data = "通过描述器设置"
    print(f"obj.data = {obj.data}")

    # 直接写入 __dict__
    obj.__dict__['data'] = "直接写入 __dict__"
    print(f"__dict__['data'] 后: obj.data = {obj.data}")
    print("  → 数据描述器仍然优先！")

    # 非数据描述器
    print(f"\nobj.non_data = {obj.non_data}")
    obj.__dict__['non_data'] = "直接写入 __dict__"
    print(f"__dict__['non_data'] 后: obj.non_data = {obj.non_data}")
    print("  → 实例 __dict__ 覆盖了非数据描述器！")


if __name__ == '__main__':
    main()
''')

    w('02-descriptors/examples/02-property-internals.py', r'''"""
property 内部原理 — 纯 Python 实现 property
展示 property 就是一个数据描述器
"""

import logging

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("PropertyInternals")


class MyProperty:
    """✅ property 的纯 Python 等价实现"""

    def __init__(self, fget=None, fset=None, fdel=None, doc=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel
        if doc is None and fget is not None:
            doc = fget.__doc__
        self.__doc__ = doc
        logger.debug("[MyProperty] 创建: fget=%s, fset=%s",
                     fget and fget.__name__, fset and fset.__name__)

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError("属性不可读")
        logger.debug("[MyProperty] __get__: 调用 fget")
        return self.fget(obj)

    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("属性不可写（只读属性）")
        logger.debug("[MyProperty] __set__: 调用 fset(%r)", value)
        self.fset(obj, value)

    def __delete__(self, obj):
        if self.fdel is None:
            raise AttributeError("属性不可删")
        logger.debug("[MyProperty] __delete__: 调用 fdel")
        self.fdel(obj)

    def getter(self, fget):
        return type(self)(fget, self.fset, self.fdel, self.__doc__)

    def setter(self, fset):
        return type(self)(self.fget, fset, self.fdel, self.__doc__)

    def deleter(self, fdel):
        return type(self)(self.fget, self.fset, fdel, self.__doc__)


class Circle:
    """使用 MyProperty 实现的圆"""

    def __init__(self, radius: float) -> None:
        self._radius = radius

    @MyProperty
    def radius(self) -> float:
        """圆的半径"""
        return self._radius

    @radius.setter
    def radius(self, value: float) -> None:
        if value < 0:
            raise ValueError(f"半径不能为负数: {value}")
        self._radius = value

    @MyProperty
    def area(self) -> float:
        """圆的面积（只读）"""
        import math
        return math.pi * self._radius ** 2

    @MyProperty
    def diameter(self) -> float:
        """直径（只读）"""
        return self._radius * 2


def main() -> None:
    print("=" * 60)
    print("property 内部原理演示")
    print("=" * 60)

    c = Circle(5.0)
    print(f"radius = {c.radius}")
    print(f"area = {c.area:.2f}")
    print(f"diameter = {c.diameter}")

    c.radius = 10.0
    print(f"\n修改后 radius = {c.radius}")
    print(f"修改后 area = {c.area:.2f}")

    # 尝试设置只读属性
    try:
        c.area = 100
    except AttributeError as e:
        print(f"\n设置只读属性: {e}")

    # 尝试设置负半径
    try:
        c.radius = -5
    except ValueError as e:
        print(f"设置负半径: {e}")


if __name__ == '__main__':
    main()
''')

    w('02-descriptors/examples/03-practical-descriptors.py', r'''"""
实战描述器 — 类型检查、懒加载、缓存
展示描述器在实际开发中的三个核心用途
"""

import logging
import time
from typing import Any

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("PracticalDescriptors")


# ============================================================
# 1. Typed — 类型检查描述器
# ============================================================

class Typed:
    """✅ 类型检查描述器 — 使用 __set_name__ 自动获取属性名"""

    def __init__(self, expected_type: type) -> None:
        self.expected_type = expected_type
        self.name: str = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.name = name
        logger.debug("[Typed] 绑定到 %s.%s (类型: %s)",
                     owner.__name__, name, self.expected_type.__name__)

    def __get__(self, obj: Any, objtype: type = None) -> Any:
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj: Any, value: Any) -> None:
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"属性 '{self.name}' 期望 {self.expected_type.__name__}，"
                f"得到 {type(value).__name__}: {value!r}"
            )
        logger.debug("[Typed] %s = %r ✓", self.name, value)
        obj.__dict__[self.name] = value

    def __delete__(self, obj: Any) -> None:
        del obj.__dict__[self.name]


# ============================================================
# 2. Lazy — 懒加载描述器（非数据描述器）
# ============================================================

class Lazy:
    """✅ 懒加载描述器 — 首次访问时计算，之后缓存到实例 __dict__"""

    def __init__(self, func):
        self.func = func
        self.name = func.__name__
        self.__doc__ = func.__doc__

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        logger.debug("[Lazy] 首次计算: %s.%s", type(obj).__name__, self.name)
        value = self.func(obj)
        # 关键：存入 __dict__，下次直接读取（非数据描述器特性）
        obj.__dict__[self.name] = value
        return value


# ============================================================
# 3. CachedProperty — 带 TTL 的缓存描述器
# ============================================================

class CachedProperty:
    """✅ 带过期时间的缓存属性"""

    def __init__(self, func, ttl: float = 60.0):
        self.func = func
        self.ttl = ttl
        self.cache_key = ""
        self.time_key = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.cache_key = f"_cache_{name}"
        self.time_key = f"_cache_{name}_ts"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        now = time.time()
        ts = obj.__dict__.get(self.time_key, 0)
        if now - ts < self.ttl:
            logger.debug("[CachedProperty] 缓存命中")
            return obj.__dict__[self.cache_key]
        logger.debug("[CachedProperty] 重新计算")
        value = self.func(obj)
        obj.__dict__[self.cache_key] = value
        obj.__dict__[self.time_key] = now
        return value

    def __set__(self, obj, value):
        """写入时清除缓存"""
        obj.__dict__.pop(self.cache_key, None)
        obj.__dict__.pop(self.time_key, None)


def cached_property(ttl: float = 60.0):
    def decorator(func):
        return CachedProperty(func, ttl)
    return decorator


# ============================================================
# 使用示例
# ============================================================

class User:
    """使用 Typed 描述器的用户类"""
    name = Typed(str)
    age = Typed(int)
    email = Typed(str)

    def __init__(self, name: str, age: int, email: str) -> None:
        self.name = name
        self.age = age
        self.email = email

    def __repr__(self) -> str:
        return f"User({self.name!r}, age={self.age}, email={self.email!r})"


class Report:
    """使用 Lazy 描述器的报告类"""

    def __init__(self, data: list[float]) -> None:
        self.data = data

    @Lazy
    def summary(self) -> dict:
        """生成统计摘要（模拟耗时操作）"""
        logger.debug("[Report] 正在计算统计摘要...")
        return {
            'count': len(self.data),
            'mean': sum(self.data) / len(self.data),
            'min': min(self.data),
            'max': max(self.data),
        }


class WeatherAPI:
    """使用 CachedProperty 的天气服务"""

    def __init__(self, city: str) -> None:
        self.city = city

    @cached_property(ttl=3.0)
    def temperature(self) -> float:
        """获取温度（模拟 API 调用）"""
        import random
        temp = round(random.uniform(15.0, 35.0), 1)
        logger.debug("[WeatherAPI] API 返回温度: %.1f", temp)
        return temp


def main() -> None:
    print("=" * 60)
    print("实战描述器演示")
    print("=" * 60)

    # --- Typed ---
    print("\n--- 1. Typed 类型检查描述器 ---")
    user = User("Alice", 30, "alice@example.com")
    print(user)

    try:
        User("Bob", "thirty", "bob@example.com")
    except TypeError as e:
        print(f"类型错误: {e}")

    # --- Lazy ---
    print("\n--- 2. Lazy 懒加载描述器 ---")
    report = Report([1.0, 2.0, 3.0, 4.0, 5.0])
    print("首次访问:")
    print(f"  summary = {report.summary}")
    print("二次访问（直接从 __dict__）:")
    print(f"  summary = {report.summary}")
    print(f"  'summary' in __dict__: {'summary' in report.__dict__}")

    # --- CachedProperty ---
    print("\n--- 3. CachedProperty 缓存描述器 ---")
    weather = WeatherAPI("Beijing")
    t1 = weather.temperature
    print(f"第一次: {t1}")
    t2 = weather.temperature
    print(f"第二次（缓存）: {t2}")
    print(f"相同: {t1 == t2}")

    print("等待缓存过期 (3s)...")
    time.sleep(3.1)
    t3 = weather.temperature
    print(f"过期后: {t3}")


if __name__ == '__main__':
    main()
''')


def generate_ch03():
    """Chapter 3: Metaclasses"""

    w('03-metaclasses/README.md', r'''# 第 3 章：元类 — 类的类

> *"Metaclasses are deeper magic than 99% of users should ever worry about. If you wonder whether you need them, you don't."*
> — Tim Peters
>
> 在 Python 中，类也是对象。既然类是对象，那谁创建了类？答案是：**元类**。

---

## 📖 本章内容

- [1. 类是对象，type 是类的类](#1-类是对象type-是类的类)
- [2. type() 三参数形式](#2-type-三参数形式)
- [3. 自定义元类](#3-自定义元类)
- [4. \_\_init\_subclass\_\_（轻量替代）](#4-init_subclass轻量替代)
- [5. 元类实战：ORM、注册表](#5-元类实战orm注册表)
- [6. 何时使用（几乎永远不需要）](#6-何时使用几乎永远不需要)
- [最佳实践 / 常见陷阱](#最佳实践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. 类是对象，type 是类的类

> 🎭 **The Drama: 一切皆对象的终极推论**
>
> Python 说"一切皆对象"，那 `int` 是对象吗？`str` 是对象吗？
> 是的！它们都是 `type` 的实例。
>
> ```python
> type(42)       # <class 'int'>     — 42 是 int 的实例
> type(int)      # <class 'type'>    — int 是 type 的实例！
> type(type)     # <class 'type'>    — type 是自己的实例！！
> ```
>
> 这就像一个哲学悖论：造物主也是被造之物。

### 1.1 type 的双重身份

```python
# type 既是函数（返回对象的类型），又是类（所有类的元类）

# 作为函数：
print(type(42))          # <class 'int'>
print(type("hello"))     # <class 'str'>

# 作为元类：
print(type(int))         # <class 'type'>
print(type(str))         # <class 'type'>
print(type(list))        # <class 'type'>

# 自定义类也是 type 的实例
class Foo:
    pass

print(type(Foo))         # <class 'type'>
print(isinstance(Foo, type))  # True — Foo 是 type 的实例
print(isinstance(Foo, object))  # True — Foo 也是 object 的实例
```

### 1.2 类型层次关系

```
object  ←  所有类的基类（继承链顶端）
  ↑
type    ←  所有类的元类（type 链顶端）
  ↑
int, str, list, ...  ←  具体类型
  ↑
42, "hello", [1,2]   ←  具体实例
```

> 🧠 **CS Master's Bridge: type 和 object 的鸡生蛋问题**
>
> - `type` 是 `object` 的子类（`type.__bases__ == (object,)`）
> - `object` 是 `type` 的实例（`type(object) == type`）
>
> 这看起来像循环依赖，但 CPython 在 C 层面手动建立了这个关系。
> 这是 Python 类型系统的根基——不需要理解实现，但要接受这个事实。

---

## 2. type() 三参数形式

> ⚛️ **The Science: type() 是动态创建类的工厂**
>
> `type(name, bases, namespace)` 可以在运行时动态创建类。
> 实际上，`class` 语句就是这个调用的语法糖。

```python
# class 语句...
class Dog:
    species = "Canis familiaris"

    def bark(self):
        return f"{self.name} says Woof!"

# ...等价于 type() 调用：
Dog = type('Dog', (object,), {
    'species': 'Canis familiaris',
    'bark': lambda self: f"{self.name} says Woof!",
})
```

```python
import logging

logging.basicConfig(level=logging.DEBUG, format='%(message)s')
logger = logging.getLogger(__name__)


# 动态创建类的实际用途
def make_dataclass(class_name: str, fields: list[str]) -> type:
    """动态创建数据类"""

    def __init__(self, **kwargs):
        for field in fields:
            if field not in kwargs:
                raise TypeError(f"缺少必需字段: {field}")
            setattr(self, field, kwargs[field])
        logger.debug("[%s] 创建实例: %s", class_name, kwargs)

    def __repr__(self):
        attrs = ', '.join(f'{f}={getattr(self, f)!r}' for f in fields)
        return f"{class_name}({attrs})"

    namespace = {
        '__init__': __init__,
        '__repr__': __repr__,
        '_fields': tuple(fields),
    }

    return type(class_name, (object,), namespace)


# 使用
Point = make_dataclass('Point', ['x', 'y'])
Color = make_dataclass('Color', ['r', 'g', 'b'])

p = Point(x=1, y=2)
c = Color(r=255, g=0, b=0)
print(p)  # Point(x=1, y=2)
print(c)  # Color(r=255, g=0, b=0)
```

---

## 3. 自定义元类

> 🌌 **The Big Picture: 元类 = 类的模板**
>
> 如果类是实例的模板，那元类就是类的模板。
> 通过自定义元类，你可以控制类的创建过程——修改类的属性、添加方法、
> 验证类定义、注册类到全局注册表。

### 3.1 定义元类

```python
class MyMeta(type):
    """✅ 自定义元类"""

    def __new__(mcs, name: str, bases: tuple, namespace: dict, **kwargs):
        """控制类对象的创建"""
        logger.debug("[MyMeta] __new__: 创建类 %s", name)
        logger.debug("[MyMeta]   bases: %s", bases)
        logger.debug("[MyMeta]   namespace keys: %s", list(namespace.keys()))

        # 可以修改 namespace（类属性）
        namespace['_created_by'] = 'MyMeta'

        cls = super().__new__(mcs, name, bases, namespace)
        return cls

    def __init__(cls, name: str, bases: tuple, namespace: dict, **kwargs):
        """初始化类对象"""
        logger.debug("[MyMeta] __init__: 初始化类 %s", name)
        super().__init__(name, bases, namespace)


class Animal(metaclass=MyMeta):
    """使用 MyMeta 作为元类"""

    def speak(self) -> str:
        return "..."


class Dog(Animal):
    def speak(self) -> str:
        return "Woof!"


print(Animal._created_by)  # 'MyMeta'
print(Dog._created_by)     # 'MyMeta'（子类也被 MyMeta 创建）
print(type(Animal))        # <class 'MyMeta'>
```

### 3.2 验证元类

```python
class ValidatedMeta(type):
    """✅ 验证类定义的元类"""

    def __new__(mcs, name, bases, namespace):
        # 跳过基类本身的验证
        if bases:
            # 要求子类必须实现 validate 方法
            if 'validate' not in namespace:
                raise TypeError(
                    f"类 {name} 必须实现 validate() 方法"
                )

            # 要求所有公共方法有文档字符串
            for key, value in namespace.items():
                if callable(value) and not key.startswith('_'):
                    if not getattr(value, '__doc__', None):
                        raise TypeError(
                            f"类 {name} 的方法 {key}() 缺少文档字符串"
                        )

        return super().__new__(mcs, name, bases, namespace)


class Validatable(metaclass=ValidatedMeta):
    """所有可验证类的基类"""
    pass


# ✅ 正确：实现了 validate 且有文档字符串
class UserForm(Validatable):
    def validate(self) -> bool:
        """验证用户表单"""
        return True

    def submit(self) -> str:
        """提交表单"""
        return "submitted"


# ❌ 缺少 validate 方法 — 类定义时就会报错
# class BadForm(Validatable):
#     pass  # TypeError: 类 BadForm 必须实现 validate() 方法
```

---

## 4. \_\_init\_subclass\_\_（轻量替代）

> 🧘 **Zen of Code: 用 \_\_init\_subclass\_\_ 替代 90% 的元类场景**
>
> Python 3.6 引入了 `__init_subclass__`，它是一个钩子方法，
> 在子类被创建时自动调用。对于大多数"想在子类创建时做点事情"的需求，
> 它是比元类更简单、更 Pythonic 的选择。

```python
class Plugin:
    """插件基类 — 使用 __init_subclass__ 自动注册"""

    _registry: dict[str, type] = {}

    def __init_subclass__(cls, plugin_name: str = "", **kwargs) -> None:
        super().__init_subclass__(**kwargs)
        name = plugin_name or cls.__name__.lower()
        cls._registry[name] = cls
        logger.debug("[Plugin] 注册插件: %s -> %s", name, cls.__name__)

    @classmethod
    def get_plugin(cls, name: str) -> type:
        return cls._registry[name]

    @classmethod
    def list_plugins(cls) -> list[str]:
        return list(cls._registry.keys())


class JSONPlugin(Plugin, plugin_name="json"):
    def serialize(self, data):
        import json
        return json.dumps(data)


class XMLPlugin(Plugin, plugin_name="xml"):
    def serialize(self, data):
        return f"<data>{data}</data>"


class CSVPlugin(Plugin):  # 使用默认名称 "csvplugin"
    def serialize(self, data):
        return str(data)


print(Plugin.list_plugins())  # ['json', 'xml', 'csvplugin']
json_cls = Plugin.get_plugin("json")
print(json_cls().serialize({"key": "value"}))
```

### 4.1 \_\_init\_subclass\_\_ vs 元类

| 特性 | `__init_subclass__` | 自定义元类 |
|:---|:---|:---|
| 复杂度 | 低 | 高 |
| 控制力 | 子类创建后 | 类创建全过程 |
| 可继承 | 是 | 是 |
| 接收参数 | `class Sub(Base, key=val)` | `class Sub(metaclass=Meta)` |
| 修改类属性 | ✅ | ✅ |
| 修改类创建过程 | ❌ | ✅ |
| 推荐度 | ⭐⭐⭐ 优先使用 | 仅在必要时 |

---

## 5. 元类实战：ORM、注册表

### 5.1 迷你 ORM

```python
class Field:
    """数据库字段描述器"""

    def __init__(self, column_type: str) -> None:
        self.column_type = column_type
        self.name = ""

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj, value):
        obj.__dict__[self.name] = value


class ModelMeta(type):
    """ORM 元类 — 自动收集 Field 定义"""

    def __new__(mcs, name, bases, namespace):
        fields = {}
        for key, value in namespace.items():
            if isinstance(value, Field):
                fields[key] = value
        namespace['_fields'] = fields
        namespace['_table_name'] = namespace.get('_table_name', name.lower())

        cls = super().__new__(mcs, name, bases, namespace)
        if fields:
            logger.debug("[ORM] 注册模型 %s (表: %s, 字段: %s)",
                         name, cls._table_name, list(fields.keys()))
        return cls


class Model(metaclass=ModelMeta):
    """ORM 基类"""

    def __init__(self, **kwargs):
        for name, field in self._fields.items():
            if name in kwargs:
                setattr(self, name, kwargs[name])

    def to_sql_insert(self) -> str:
        """生成 INSERT SQL"""
        columns = []
        values = []
        for name in self._fields:
            value = getattr(self, name, None)
            if value is not None:
                columns.append(name)
                values.append(repr(value))
        cols = ', '.join(columns)
        vals = ', '.join(values)
        return f"INSERT INTO {self._table_name} ({cols}) VALUES ({vals})"

    def __repr__(self) -> str:
        attrs = ', '.join(
            f'{n}={getattr(self, n, None)!r}' for n in self._fields
        )
        return f"{type(self).__name__}({attrs})"


class User(Model):
    _table_name = 'users'
    name = Field('VARCHAR(100)')
    age = Field('INTEGER')
    email = Field('VARCHAR(200)')


class Post(Model):
    title = Field('VARCHAR(200)')
    content = Field('TEXT')
    author_id = Field('INTEGER')


user = User(name='Alice', age=30, email='alice@example.com')
print(user)
print(user.to_sql_insert())
# INSERT INTO users (name, age, email) VALUES ('Alice', 30, 'alice@example.com')
```

---

## 6. 何时使用（几乎永远不需要）

> 🧘 **Zen of Code: 元类的决策树**
>
> ```
> 需要在子类创建时做些事情？
> ├── 注册子类？           → __init_subclass__
> ├── 验证类属性？         → __init_subclass__ 或 __set_name__
> ├── 修改类行为？         → 类装饰器
> ├── 需要控制类创建过程？  → 元类（确定吗？）
> └── 以上都不是？         → 你不需要元类
> ```
>
> **记住 Tim Peters 的话：如果你在犹豫要不要用元类，那就不要用。**

---

## 最佳实践 / 常见陷阱

### ✅ 最佳实践

1. **优先用 `__init_subclass__`** — 覆盖 90% 的需求
2. **理解但不滥用元类** — 学习是为了读懂框架代码
3. **元类保持简单** — 不要在元类中放过多逻辑
4. **用类装饰器替代** — 大多数"修改类"的需求用装饰器更清晰

### ❌ 常见陷阱

```python
# 陷阱 1：元类冲突
# 如果两个基类使用不同的元类，会报错
class MetaA(type): pass
class MetaB(type): pass
class A(metaclass=MetaA): pass
class B(metaclass=MetaB): pass
# class C(A, B): pass  # ❌ TypeError: metaclass conflict

# 解决方案：让一个元类继承另一个
class MetaC(MetaA, MetaB): pass
class C(A, B, metaclass=MetaC): pass  # ✅


# 陷阱 2：忘记调用 super().__new__
class BadMeta(type):
    def __new__(mcs, name, bases, namespace):
        # ❌ 忘记创建类！
        pass  # 返回 None

# ✅ 始终调用 super()
class GoodMeta(type):
    def __new__(mcs, name, bases, namespace):
        return super().__new__(mcs, name, bases, namespace)
```

---

## 练习题

<details>
<summary>练习 1：用 __init_subclass__ 实现接口检查</summary>

创建一个 `Interface` 基类，要求所有子类必须实现指定的方法。

```python
class Drawable(Interface, required_methods=['draw', 'resize']):
    pass

class Circle(Drawable):
    def draw(self): ...
    def resize(self, factor): ...  # ✅

# class BadShape(Drawable):
#     def draw(self): ...  # ❌ 缺少 resize
```

</details>

<details>
<summary>练习 2：实现 Singleton 元类</summary>

用元类实现单例模式。

</details>

<details>
<summary>练习 3：迷你 ORM 扩展</summary>

扩展上面的 ORM 示例，添加 `to_sql_create_table()` 方法。

</details>

---

## 参考资源 / 下一步

**参考资源：**
- [Python 官方文档 - Metaclasses](https://docs.python.org/3/reference/datamodel.html#metaclasses)
- [Fluent Python, 2nd Edition - Chapter 24: Class Metaprogramming](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [PEP 487 - __init_subclass__](https://peps.python.org/pep-0487/)

**下一步：**

👉 [第 4 章：并发 — threading](../04-concurrency-threading/README.md) — 理解 GIL、线程安全、锁机制，掌握线程池的使用。
''')


def generate_ch03_examples():
    """Chapter 3: Metaclass examples"""

    w('03-metaclasses/examples/01-type-as-metaclass.py', r'''"""
type 作为元类 — 理解类是 type 的实例
"""

import logging

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("TypeAsMetaclass")


def main() -> None:
    print("=" * 60)
    print("type 作为元类演示")
    print("=" * 60)

    # --- 类型链 ---
    print("\n--- 1. 类型链 ---")
    print(f"type(42)       = {type(42)}")        # <class 'int'>
    print(f"type(int)      = {type(int)}")       # <class 'type'>
    print(f"type(type)     = {type(type)}")      # <class 'type'>

    class MyClass:
        pass

    obj = MyClass()
    print(f"\ntype(obj)      = {type(obj)}")      # <class 'MyClass'>
    print(f"type(MyClass)  = {type(MyClass)}")   # <class 'type'>

    # --- isinstance 检查 ---
    print("\n--- 2. isinstance 检查 ---")
    print(f"isinstance(42, int):      {isinstance(42, int)}")
    print(f"isinstance(int, type):    {isinstance(int, type)}")
    print(f"isinstance(type, type):   {isinstance(type, type)}")
    print(f"isinstance(type, object): {isinstance(type, object)}")

    # --- type() 三参数创建类 ---
    print("\n--- 3. 动态创建类 ---")

    def greet(self):
        return f"Hello, I'm {self.name}!"

    # 等价于 class Greeter: ...
    Greeter = type('Greeter', (object,), {
        'species': 'Human',
        'greet': greet,
        '__init__': lambda self, name: setattr(self, 'name', name),
        '__repr__': lambda self: f"Greeter({self.name!r})",
    })

    g = Greeter("Alice")
    print(f"g = {g}")
    print(f"g.greet() = {g.greet()}")
    print(f"type(Greeter) = {type(Greeter)}")
    print(f"Greeter.__bases__ = {Greeter.__bases__}")


if __name__ == '__main__':
    main()
''')

    w('03-metaclasses/examples/02-custom-metaclass.py', r'''"""
自定义元类 — 控制类的创建过程
"""

import logging

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("CustomMetaclass")


class AutoReprMeta(type):
    """✅ 自动为类添加 __repr__ 的元类"""

    def __new__(mcs, name, bases, namespace):
        # 收集类型标注作为字段
        annotations = namespace.get('__annotations__', {})
        fields = list(annotations.keys())

        if fields and '__repr__' not in namespace:
            def auto_repr(self):
                attrs = ', '.join(f'{f}={getattr(self, f, None)!r}' for f in fields)
                return f"{type(self).__name__}({attrs})"
            namespace['__repr__'] = auto_repr
            logger.debug("[AutoReprMeta] 为 %s 自动生成 __repr__，字段: %s", name, fields)

        return super().__new__(mcs, name, bases, namespace)


class AutoModel(metaclass=AutoReprMeta):
    """使用 AutoReprMeta 的基类"""
    pass


class User(AutoModel):
    name: str
    age: int

    def __init__(self, name: str, age: int) -> None:
        self.name = name
        self.age = age


class Product(AutoModel):
    title: str
    price: float

    def __init__(self, title: str, price: float) -> None:
        self.title = title
        self.price = price


def main() -> None:
    print("=" * 60)
    print("自定义元类演示")
    print("=" * 60)

    user = User("Alice", 30)
    print(f"user = {user}")  # 自动生成的 __repr__

    product = Product("Python Book", 49.99)
    print(f"product = {product}")

    print(f"\ntype(User) = {type(User)}")
    print(f"type(User) is AutoReprMeta: {type(User) is AutoReprMeta}")


if __name__ == '__main__':
    main()
''')

    w('03-metaclasses/examples/03-init-subclass.py', r'''"""
__init_subclass__ — 元类的轻量替代
"""

import logging

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("InitSubclass")


# ============================================================
# 1. 自动注册插件
# ============================================================

class PluginBase:
    """插件基类 — 子类自动注册"""

    _plugins: dict[str, type] = {}

    def __init_subclass__(cls, plugin_name: str = "", **kwargs) -> None:
        super().__init_subclass__(**kwargs)
        name = plugin_name or cls.__name__
        PluginBase._plugins[name] = cls
        logger.debug("[PluginBase] 注册: %s -> %s", name, cls.__name__)

    @classmethod
    def create(cls, name: str, **kwargs):
        """工厂方法：根据名称创建插件实例"""
        plugin_cls = cls._plugins.get(name)
        if plugin_cls is None:
            raise ValueError(f"未知插件: {name}")
        return plugin_cls(**kwargs)


class JSONSerializer(PluginBase, plugin_name="json"):
    def serialize(self, data) -> str:
        import json
        return json.dumps(data)


class YAMLSerializer(PluginBase, plugin_name="yaml"):
    def serialize(self, data) -> str:
        return f"yaml: {data}"  # 简化示例


# ============================================================
# 2. 必须方法检查
# ============================================================

class RequiredMethods:
    """要求子类实现指定方法"""

    _required: list[str] = []

    def __init_subclass__(cls, required: list[str] = None, **kwargs) -> None:
        super().__init_subclass__(**kwargs)
        if required is not None:
            cls._required = required

        # 检查是否实现了所有必需方法（跳过抽象基类）
        missing = [m for m in cls._required if m not in cls.__dict__]
        if missing and not getattr(cls, '_abstract', False):
            raise TypeError(
                f"类 {cls.__name__} 缺少必需方法: {missing}"
            )


class Serializer(RequiredMethods, required=['serialize', 'deserialize'], _abstract=True):
    """序列化器接口"""
    _abstract = True


class JSONCodec(Serializer):
    def serialize(self, data):
        """序列化"""
        import json
        return json.dumps(data)

    def deserialize(self, text):
        """反序列化"""
        import json
        return json.loads(text)


def main() -> None:
    print("=" * 60)
    print("__init_subclass__ 演示")
    print("=" * 60)

    # --- 插件注册 ---
    print("\n--- 1. 自动注册插件 ---")
    print(f"已注册插件: {list(PluginBase._plugins.keys())}")

    serializer = PluginBase.create("json")
    result = serializer.serialize({"name": "Alice"})
    print(f"JSON 序列化: {result}")

    # --- 方法检查 ---
    print("\n--- 2. 必须方法检查 ---")
    codec = JSONCodec()
    data = {"key": "value"}
    encoded = codec.serialize(data)
    decoded = codec.deserialize(encoded)
    print(f"编码: {encoded}")
    print(f"解码: {decoded}")

    # 取消注释以下代码会在类定义时报错
    # class BadCodec(Serializer):
    #     def serialize(self, data): pass
    #     # 缺少 deserialize → TypeError


if __name__ == '__main__':
    main()
''')

    w('03-metaclasses/examples/04-orm-example.py', r'''"""
迷你 ORM — 元类实战：声明式模型定义
"""

import logging

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("MiniORM")


class Field:
    """数据库字段描述器"""

    def __init__(self, column_type: str, nullable: bool = True) -> None:
        self.column_type = column_type
        self.nullable = nullable
        self.name = ""

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj, value):
        if value is None and not self.nullable:
            raise ValueError(f"字段 '{self.name}' 不允许为 NULL")
        obj.__dict__[self.name] = value

    def __repr__(self):
        return f"Field({self.column_type!r})"


class IntegerField(Field):
    def __init__(self, **kwargs):
        super().__init__('INTEGER', **kwargs)

class StringField(Field):
    def __init__(self, max_length: int = 255, **kwargs):
        super().__init__(f'VARCHAR({max_length})', **kwargs)

class TextField(Field):
    def __init__(self, **kwargs):
        super().__init__('TEXT', **kwargs)


class ModelMeta(type):
    """ORM 元类 — 自动收集字段定义"""

    def __new__(mcs, name, bases, namespace):
        fields = {}
        for key, value in list(namespace.items()):
            if isinstance(value, Field):
                fields[key] = value

        namespace['_fields'] = fields
        namespace['_table'] = namespace.get('_table', name.lower())

        cls = super().__new__(mcs, name, bases, namespace)
        if fields:
            logger.debug("[ORM] 模型 %s: 表=%s, 字段=%s",
                         name, cls._table, list(fields.keys()))
        return cls


class Model(metaclass=ModelMeta):
    """ORM 基类"""

    def __init__(self, **kwargs):
        for name in self._fields:
            value = kwargs.get(name)
            setattr(self, name, value)

    def __repr__(self):
        attrs = ', '.join(f'{n}={getattr(self, n)!r}' for n in self._fields)
        return f"{type(self).__name__}({attrs})"

    @classmethod
    def create_table_sql(cls) -> str:
        """生成 CREATE TABLE SQL"""
        columns = []
        for name, field in cls._fields.items():
            nullable = "" if field.nullable else " NOT NULL"
            columns.append(f"  {name} {field.column_type}{nullable}")
        cols = ',\n'.join(columns)
        return f"CREATE TABLE {cls._table} (\n{cols}\n);"

    def insert_sql(self) -> str:
        """生成 INSERT SQL"""
        cols, vals = [], []
        for name in self._fields:
            value = getattr(self, name)
            if value is not None:
                cols.append(name)
                vals.append(repr(value))
        return f"INSERT INTO {self._table} ({', '.join(cols)}) VALUES ({', '.join(vals)});"


class User(Model):
    _table = 'users'
    name = StringField(max_length=100, nullable=False)
    email = StringField(max_length=200)
    age = IntegerField()


class Post(Model):
    _table = 'posts'
    title = StringField(max_length=200, nullable=False)
    content = TextField()
    author_id = IntegerField(nullable=False)


def main() -> None:
    print("=" * 60)
    print("迷你 ORM 演示")
    print("=" * 60)

    # CREATE TABLE
    print("\n--- CREATE TABLE ---")
    print(User.create_table_sql())
    print()
    print(Post.create_table_sql())

    # INSERT
    print("\n--- INSERT ---")
    user = User(name="Alice", email="alice@example.com", age=30)
    print(user)
    print(user.insert_sql())

    post = Post(title="Hello World", content="First post!", author_id=1)
    print(post)
    print(post.insert_sql())


if __name__ == '__main__':
    main()
''')


if __name__ == '__main__':
    print("=" * 60)
    print("Generating Stage 3 content...")
    print("=" * 60)

    print("\n[Chapter 2 Examples]")
    generate_ch02_examples()

    print("\n[Chapter 3]")
    generate_ch03()

    print("\n[Chapter 3 Examples]")
    generate_ch03_examples()

    print("\nDone!")
