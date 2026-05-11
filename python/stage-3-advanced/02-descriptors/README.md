# 第 2 章：描述器协议 — 属性访问的终极控制

> *"Programs must be written for people to read, and only incidentally for machines to execute."*
> — Harold Abelson
>
> 当你写下 `obj.attr` 时，Python 并不只是查字典——它启动了一套精密的查找协议。
> 描述器，就是这套协议的核心引擎。

---

## 📖 本章内容

- [1. 描述器定义：\_\_get\_\_、\_\_set\_\_、\_\_delete\_\_](#1-描述器定义getsetdelete)
- [2. 数据描述器 vs 非数据描述器](#2-数据描述器-vs-非数据描述器)
- [3. property 实现原理](#3-property-实现原理)
- [4. 属性查找优先级](#4-属性查找优先级)
- [5. 方法绑定的秘密](#5-方法绑定的秘密)
- [6. 实战：类型检查 / 懒加载 / 缓存描述器](#6-实战类型检查--懒加载--缓存描述器)
- [7. \_\_set\_name\_\_](#7-set_name)
- [最佳实践 / 常见陷阱](#最佳实践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. 描述器定义：\_\_get\_\_、\_\_set\_\_、\_\_delete\_\_

> 🎭 **The Drama: 描述器 — 属性的暗中操纵者**
>
> 想象一个高档酒店。你以为推开房门（访问属性）就能直接进入房间。
> 但实际上，门后有一个隐形管家（描述器）。它可以：
> - **读取时**（`__get__`）：在你进入前检查权限、记录访问日志
> - **写入时**（`__set__`）：在你放东西前验证物品是否合规
> - **删除时**（`__delete__`）：在你退房时执行清理工作
>
> `property`、`classmethod`、`staticmethod` 背后都是这个隐形管家。

### 1.1 什么是描述器

**描述器（Descriptor）** 是实现了以下任意一个方法的对象：

```python
class Descriptor:
    def __get__(self, obj, objtype=None):
        """当属性被读取时调用
        Args:
            obj: 拥有该属性的实例（通过类访问时为 None）
            objtype: 拥有该属性的类
        """
        ...

    def __set__(self, obj, value):
        """当属性被设置时调用"""
        ...

    def __delete__(self, obj):
        """当属性被删除时调用"""
        ...
```

**关键规则：描述器必须定义在类上（而非实例上）才能生效。**

```python
import logging

logging.basicConfig(level=logging.DEBUG, format='%(message)s')
logger = logging.getLogger(__name__)


class Verbose:
    """最简单的描述器 — 观察属性访问"""

    def __init__(self, name: str) -> None:
        self.name = name

    def __get__(self, obj, objtype=None):
        logger.debug("[Verbose] __get__: obj=%s, objtype=%s", obj, objtype)
        if obj is None:
            return self  # 通过类访问时返回描述器本身
        return obj.__dict__.get(self.name)

    def __set__(self, obj, value) -> None:
        logger.debug("[Verbose] __set__: %s = %r", self.name, value)
        obj.__dict__[self.name] = value

    def __delete__(self, obj) -> None:
        logger.debug("[Verbose] __delete__: %s", self.name)
        del obj.__dict__[self.name]


class MyClass:
    # ✅ 描述器必须是类属性
    x = Verbose('x')
    y = Verbose('y')


obj = MyClass()
obj.x = 10     # [Verbose] __set__: x = 10
print(obj.x)   # [Verbose] __get__ -> 10
del obj.x      # [Verbose] __delete__: x
```

### 1.2 描述器协议的触发条件

> ⚛️ **The Science: 为什么描述器必须在类上**
>
> Python 的属性访问机制在 `type.__getattribute__` 中实现。当你访问 `obj.attr` 时，
> Python 调用 `type(obj).__getattribute__(obj, 'attr')`——它首先在 **类及其 MRO** 上
> 查找属性，如果找到的是描述器就调用其 `__get__`。
>
> 如果描述器在实例的 `__dict__` 中，`__getattribute__` 不会将其识别为描述器，
> 而是直接返回该对象本身。

---

## 2. 数据描述器 vs 非数据描述器

> 🧠 **CS Master's Bridge: 两种描述器的权力差异**
>
> 想象一个公司的权力结构：
> - **数据描述器**（实现了 `__get__` + `__set__` 或 `__delete__`）= CEO，拥有最高优先级
> - **非数据描述器**（只实现了 `__get__`）= 普通经理，优先级低于实例属性
>
> 这个区分至关重要——它决定了属性查找时的优先级。

### 2.1 区分规则

| 类型 | 实现的方法 | 优先级 | 例子 |
|:---|:---|:---|:---|
| **数据描述器** | `__get__` + (`__set__` 或 `__delete__`) | 高于实例 `__dict__` | `property` |
| **非数据描述器** | 仅 `__get__` | 低于实例 `__dict__` | 函数、`classmethod` |

```python
# ✅ 数据描述器 — 优先级高于实例 __dict__
class DataDescriptor:
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return obj.__dict__.get('_data_val', '默认值')

    def __set__(self, obj, value):
        obj.__dict__['_data_val'] = value


# ✅ 非数据描述器 — 优先级低于实例 __dict__
class NonDataDescriptor:
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return "来自非数据描述器"


class Demo:
    data = DataDescriptor()
    non_data = NonDataDescriptor()


obj = Demo()

# 数据描述器：总是优先
obj.data = "通过描述器设置"
obj.__dict__['data'] = "直接写入 dict"
print(obj.data)  # ✅ 仍然走 __get__！数据描述器优先

# 非数据描述器：实例 __dict__ 优先
obj.__dict__['non_data'] = "直接写入 dict"
print(obj.non_data)  # ✅ "直接写入 dict" — __dict__ 覆盖了非数据描述器
```

---

## 3. property 实现原理

> 🌌 **The Big Picture: property 不是魔法，它是描述器**
>
> `property` 是 Python 最常用的内置描述器。当你写 `@property` 时，
> 你实际上在创建一个数据描述器实例。让我们揭开它的面纱。

### 3.1 property 的等价实现

```python
class MyProperty:
    """✅ property 的纯 Python 实现"""

    def __init__(self, fget=None, fset=None, fdel=None, doc=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel
        if doc is None and fget is not None:
            doc = fget.__doc__
        self.__doc__ = doc

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError("属性不可读")
        return self.fget(obj)

    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("属性不可写")
        self.fset(obj, value)

    def __delete__(self, obj):
        if self.fdel is None:
            raise AttributeError("属性不可删")
        self.fdel(obj)

    def getter(self, fget):
        return type(self)(fget, self.fset, self.fdel, self.__doc__)

    def setter(self, fset):
        return type(self)(self.fget, fset, self.fdel, self.__doc__)

    def deleter(self, fdel):
        return type(self)(self.fget, self.fset, fdel, self.__doc__)


class Temperature:
    def __init__(self, celsius: float) -> None:
        self._celsius = celsius

    @MyProperty
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._celsius = value

    @MyProperty
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32
```

---

## 4. 属性查找优先级

> 🎭 **The Drama: 属性查找的优先级阶梯**
>
> 当你写 `obj.attr` 时，Python 遵循严格的优先级：
>
> ```
> 优先级从高到低：
> 1. 数据描述器（类/MRO 上）           <- 最高优先级
> 2. 实例 __dict__
> 3. 非数据描述器 / 类变量（类/MRO）
> 4. __getattr__（兜底）               <- 最低优先级
> ```

### 4.1 完整查找流程

```python
class DataDesc:
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return "数据描述器的值"
    def __set__(self, obj, value):
        pass

class NonDataDesc:
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return "非数据描述器的值"


class PriorityDemo:
    data_attr = DataDesc()
    non_data_attr = NonDataDesc()

    def __init__(self):
        self.__dict__['data_attr'] = "实例字典的值"
        self.__dict__['non_data_attr'] = "实例字典的值"

    def __getattr__(self, name):
        return f"__getattr__ 兜底: {name}"


obj = PriorityDemo()

# ✅ 数据描述器 > 实例 __dict__
print(obj.data_attr)       # "数据描述器的值"

# ✅ 实例 __dict__ > 非数据描述器
print(obj.non_data_attr)   # "实例字典的值"

# ✅ __getattr__ 作为兜底
print(obj.missing_attr)    # "__getattr__ 兜底: missing_attr"
```

### 4.2 查找优先级对比表

| 操作 | 数据描述器存在时 | 只有实例 `__dict__` | 非数据描述器存在时 |
|:---|:---|:---|:---|
| `obj.attr` | 数据描述器优先 | 从 `__dict__` 获取 | 取决于 `__dict__` 是否有同名 |
| `obj.attr = v` | 数据描述器 `__set__` | 写入 `__dict__` | 写入 `__dict__`（遮蔽描述器）|
| `del obj.attr` | 数据描述器 `__delete__` | 从 `__dict__` 删除 | 从 `__dict__` 删除 |

---

## 5. 方法绑定的秘密

> ⚛️ **The Science: 函数也是描述器！**
>
> 你有没有想过，为什么 `obj.method()` 能自动把 `obj` 传给 `self`？
> 答案就是：**Python 的函数实现了 `__get__`——函数是非数据描述器。**
>
> 当你通过实例访问函数时，`__get__` 返回一个"绑定方法"（bound method），
> 它把实例"绑定"为函数的第一个参数。

### 5.1 函数的 \_\_get\_\_ 方法

```python
class MyClass:
    def hello(self):
        return f"Hello from {self}"


obj = MyClass()

# 通过类访问 — 返回函数本身
print(type(MyClass.hello))   # <class 'function'>

# 通过实例访问 — 返回绑定方法
print(type(obj.hello))       # <class 'method'>

# __get__ 的幕后工作：
print(MyClass.__dict__['hello'].__get__(obj, MyClass))
```

### 5.2 手动实现方法绑定

```python
import types


class MethodSimulator:
    """模拟 Python 的方法绑定机制"""

    def __init__(self, func):
        self.func = func

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self.func
        return types.MethodType(self.func, obj)
```

### 5.3 classmethod 和 staticmethod 的原理

```python
class MyClassMethod:
    """classmethod 的纯 Python 实现"""
    def __init__(self, func):
        self.func = func

    def __get__(self, obj, objtype=None):
        if objtype is None:
            objtype = type(obj)
        return types.MethodType(self.func, objtype)


class MyStaticMethod:
    """staticmethod 的纯 Python 实现"""
    def __init__(self, func):
        self.func = func

    def __get__(self, obj, objtype=None):
        return self.func  # 不绑定任何东西
```

> 🧰 **Toolbox: 三种方法的描述器对比**
>
> | 方法类型 | 描述器类型 | `__get__` 返回 | 第一个参数 |
> |:---|:---|:---|:---|
> | 普通方法 | 非数据描述器 | `MethodType(func, obj)` | `self`（实例）|
> | `classmethod` | 非数据描述器 | `MethodType(func, cls)` | `cls`（类）|
> | `staticmethod` | 非数据描述器 | `func`（原函数）| 无 |

---

## 6. 实战：类型检查 / 懒加载 / 缓存描述器

> 🧰 **Toolbox: 描述器的实战三板斧**
>
> 描述器最强大的地方在于：**定义一次，到处复用**。
> 以下三个描述器解决了日常开发中 80% 的属性管理需求。

### 6.1 类型检查描述器

```python
class Typed:
    """✅ 类型检查描述器 — 自动验证属性类型"""

    def __init__(self, expected_type: type) -> None:
        self.expected_type = expected_type
        self.name: str = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj, value) -> None:
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"属性 '{self.name}' 期望 {self.expected_type.__name__}，"
                f"得到 {type(value).__name__}: {value!r}"
            )
        obj.__dict__[self.name] = value


class User:
    name = Typed(str)
    age = Typed(int)
    email = Typed(str)

    def __init__(self, name: str, age: int, email: str) -> None:
        self.name = name
        self.age = age
        self.email = email

user = User("Alice", 30, "alice@example.com")  # ✅
# User("Bob", "thirty", "bob@example.com")     # ❌ TypeError
```

### 6.2 懒加载描述器

```python
class Lazy:
    """✅ 懒加载描述器 — 首次访问时计算，之后缓存"""

    def __init__(self, func):
        self.func = func
        self.name = func.__name__
        self.__doc__ = func.__doc__

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        value = self.func(obj)
        # ✅ 存入实例 __dict__（非数据描述器，下次 __dict__ 优先）
        obj.__dict__[self.name] = value
        return value


class DataAnalyzer:
    def __init__(self, data: list[float]) -> None:
        self.data = data

    @Lazy
    def mean(self) -> float:
        """计算平均值"""
        return sum(self.data) / len(self.data)

    @Lazy
    def sorted_data(self) -> list[float]:
        """排序数据"""
        return sorted(self.data)


analyzer = DataAnalyzer([3.0, 1.0, 4.0, 1.0, 5.0])
print(analyzer.mean)          # 首次计算并缓存
print(analyzer.mean)          # 直接从 __dict__ 获取
```

### 6.3 缓存描述器（带 TTL）

```python
import time as _time


class CachedProperty:
    """✅ 带 TTL 的缓存描述器"""

    def __init__(self, func, ttl: float = 60.0):
        self.func = func
        self.ttl = ttl
        self.name = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.name = f"_cached_{name}"
        self.time_name = f"_cached_{name}_time"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        now = _time.time()
        cached_time = obj.__dict__.get(self.time_name, 0)
        if now - cached_time < self.ttl:
            return obj.__dict__[self.name]
        value = self.func(obj)
        obj.__dict__[self.name] = value
        obj.__dict__[self.time_name] = now
        return value

    def __set__(self, obj, value) -> None:
        obj.__dict__.pop(self.name, None)
        obj.__dict__.pop(self.time_name, None)
```

### 6.4 实战对比表

| 描述器类型 | 类型 | 使用场景 | 缓存策略 |
|:---|:---|:---|:---|
| `Typed` | 数据描述器 | 属性类型验证 | 无缓存 |
| `Lazy` | 非数据描述器 | 昂贵计算延迟求值 | 永久缓存 |
| `CachedProperty` | 数据描述器 | 外部 API、易变数据 | TTL 过期 |

---

## 7. \_\_set\_name\_\_

> 🧘 **Zen of Code: 消除重复是工程的核心**
>
> Python 3.6 之前，描述器不知道自己绑定到了哪个属性名上。
> 你必须手动传入名字：`name = Typed(str, 'name')` — 重复且易错。
> `__set_name__` 解决了这个问题：当类被创建时，Python 自动对每个描述器调用
> `descriptor.__set_name__(owner_class, attr_name)`。

```python
class ValidatedField:
    """✅ 通用验证描述器"""

    def __init__(self, validator=None, default=None):
        self.validator = validator
        self.default = default

    def __set_name__(self, owner: type, name: str) -> None:
        self.name = name
        self.storage_name = f"_field_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.storage_name, self.default)

    def __set__(self, obj, value) -> None:
        if self.validator is not None:
            self.validator(self.name, value)
        setattr(obj, self.storage_name, value)


def positive(name: str, value) -> None:
    if value <= 0:
        raise ValueError(f"{name} 必须为正数，得到 {value}")

def non_empty_string(name: str, value) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} 不能为空字符串")

def in_range(min_val, max_val):
    def validator(name: str, value) -> None:
        if not (min_val <= value <= max_val):
            raise ValueError(f"{name} 必须在 {min_val}-{max_val} 之间")
    return validator


class Product:
    name = ValidatedField(validator=non_empty_string)
    price = ValidatedField(validator=positive)
    rating = ValidatedField(validator=in_range(0, 5), default=0)

    def __init__(self, name: str, price: float) -> None:
        self.name = name
        self.price = price

product = Product("Python Book", 49.99)
product.rating = 4.5
# product.price = -10  # ❌ ValueError
```

---

## 最佳实践 / 常见陷阱

### ✅ 最佳实践

1. **优先用 `property`** — 大多数场景不需要自定义描述器
2. **用 `__set_name__` 自动获取名字** — 避免手动传名的重复
3. **非数据描述器实现懒加载** — 利用实例 `__dict__` 覆盖特性
4. **描述器存储数据用实例 `__dict__`** — 不要存在描述器对象上
5. **保持描述器简单** — 复杂逻辑封装在验证器函数中

### ❌ 常见陷阱

```python
# 陷阱 1：在描述器上存储数据（所有实例共享！）
class BadDescriptor:
    def __init__(self):
        self.value = None  # ❌ 所有实例共享！
    def __get__(self, obj, objtype=None):
        return self.value
    def __set__(self, obj, value):
        self.value = value  # ❌ 修改影响所有实例

# ✅ 正确：在实例的 __dict__ 上存储
class GoodDescriptor:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value  # ✅ 每个实例独立


# 陷阱 2：忘记处理 obj is None
class BadDescriptor2:
    def __get__(self, obj, objtype=None):
        return obj.__dict__['x']  # ❌ 类访问时 obj 是 None！
```

---

## 练习题

<details>
<summary>练习 1：实现 RangeChecked 描述器</summary>

实现一个 `RangeChecked` 描述器，确保属性值在指定范围内。使用 `__set_name__`，超出范围时抛出 `ValueError`。

```python
class RangeChecked:
    def __init__(self, min_val: float, max_val: float):
        ...

class Student:
    age = RangeChecked(0, 150)
    score = RangeChecked(0, 100)
```

</details>

<details>
<summary>练习 2：实现纯 Python 的 classmethod</summary>

不使用内置 `classmethod`，用描述器协议实现等价的功能。

</details>

<details>
<summary>练习 3：实现 ObservedProperty</summary>

实现一个描述器，当属性值改变时通知观察者。

</details>

---

## 参考资源 / 下一步

**参考资源：**
- [Python 官方文档 - Descriptor HowTo Guide](https://docs.python.org/3/howto/descriptor.html)
- [Fluent Python, 2nd Edition - Chapter 23: Attribute Descriptors](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)

**下一步：**

👉 [第 3 章：元类 — 类的类](../03-metaclasses/README.md) — 理解 `type` 作为所有类的元类，学习 `__init_subclass__` 和自定义元类。
