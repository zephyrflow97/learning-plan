# 第 3 章：元类 — 类的类

> *"Metaclasses are deeper magic than 99% of users should ever worry about. If you wonder whether you need them, you don't."*
> — Tim Peters
>
> 在 Python 中，类也是对象。既Ȼ类是对象，那˭创建了类？答案是：**元类**。

---

## 📖 本章内容

- [1. 类是对象，type 是类的类](#1-类是对象type-是类的类)
- [2. type() 三参数形式](#2-type-三参数形式)
- [3. 自定义元类](#3-自定义元类)
- [4. \_\_init\_subclass\_\_（轻量替代）](#4-init_subclass轻量替代)
- [5. 元类实ս：ORM、注册表](#5-元类实սorm注册表)
- [6. 何时使用（几乎永Զ不需要）](#6-何时使用几乎永Զ不需要)
- [最佳实践 / 常见陷阱](#最佳实践--常见陷阱)
- [练习题](#练习题)
- [参考资Դ / 下一步](#参考资Դ--下一步)

---

## 1. 类是对象，type 是类的类

> 🎭 **The Drama: 一切皆对象的终极推论**
>
> Python ˵"一切皆对象"，那 `int` 是对象吗？`str` 是对象吗？
> 是的！它们都是 `type` 的实例。
>
> ```python
> type(42)       # <class 'int'>     — 42 是 int 的实例
> type(int)      # <class 'type'>    — int 是 type 的实例！
> type(type)     # <class 'type'>    — type 是自己的实例！！
> ```
>
> 这就像一个哲学悖论：造物主也是被造之物。

### 1.1 type 的˫重身份

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
                raise TypeError(f"ȱ少必需字段: {field}")
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
                            f"类 {name} 的方法 {key}() ȱ少文档字符串"
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


# ❌ ȱ少 validate 方法 — 类定义时就会报错
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

## 5. 元类实ս：ORM、注册表

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

## 6. 何时使用（几乎永Զ不需要）

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
#     def draw(self): ...  # ❌ ȱ少 resize
```

</details>

<details>
<summary>练习 2：实现 Singleton 元类</summary>

用元类实现单例模式。

</details>

<details>
<summary>练习 3：迷你 ORM 扩չ</summary>

扩չ上面的 ORM 示例，添加 `to_sql_create_table()` 方法。

</details>

---

## 参考资Դ / 下一步

**参考资Դ：**
- [Python 官方文档 - Metaclasses](https://docs.python.org/3/reference/datamodel.html#metaclasses)
- [Fluent Python, 2nd Edition - Chapter 24: Class Metaprogramming](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [PEP 487 - __init_subclass__](https://peps.python.org/pep-0487/)

**下一步：**

👉 [第 4 章：并发 — threading](../04-concurrency-threading/README.md) — 理解 GIL、线程安全、锁机制，掌握线程池的使用。
