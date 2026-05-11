# 第 1 章：面向对象编程 — 从脚本到工程的第一步

> *"The purpose of abstraction is not to be vague, but to create a new semantic level in which one can be absolutely precise."*
> — Edsger W. Dijkstra
>
> 面向对象编程不是把函数塞进类里，而是给混乱的世界建模。
> 你即将学会的不仅是 `class` 关键字——而是一种**组织思维**的方式。

## 📖 本章内容

- [1. 类定义与实例化](#1-类定义与实例化)
  - [1.1 类的基本结构](#11-类的基本结构)
  - [1.2 `__init__` 与 `self` 的真正含义](#12-__init__-与-self-的真正含义)
  - [1.3 类属性 vs 实例属性](#13-类属性-vs-实例属性)
- [2. 继承与 super()](#2-继承与-super)
  - [2.1 单继承基础](#21-单继承基础)
  - [2.2 super() 的正确使用](#22-super-的正确使用)
- [3. 多重继承与 MRO](#3-多重继承与-mro)
  - [3.1 菱形继承问题](#31-菱形继承问题)
  - [3.2 C3 线性化算法](#32-c3-线性化算法)
  - [3.3 Mixin 模式](#33-mixin-模式)
- [4. @property、@classmethod、@staticmethod](#4-propertyclassmethodstaticmethod)
  - [4.1 @property：智能属性](#41-property智能属性)
  - [4.2 @classmethod：替代构造器](#42-classmethod替代构造器)
  - [4.3 @staticmethod：工具函数](#43-staticmethod工具函数)
- [5. dataclasses（3.7+）](#5-dataclasses37)
  - [5.1 告别样板代码](#51-告别样板代码)
  - [5.2 field() 与默认工厂](#52-field-与默认工厂)
  - [5.3 不可变数据类](#53-不可变数据类)
- [6. \_\_slots\_\_：内存优化](#6-__slots__内存优化)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)
- [下一步](#下一步)

---

## 1. 类定义与实例化

> 🎭 **The Drama: 类是蓝图，对象是建筑**
>
> 想象你是一名建筑师。你画了一张公寓的蓝图（类），然后施工队根据蓝图建造了 100 套公寓（对象）。
> 每套公寓的**结构相同**（方法），但**住户不同**（属性）。
> 蓝图本身不能住人——你必须先 `build()` 它。在 Python 中，这个 `build()` 就是实例化：`apartment = Apartment()`。

### 1.1 类的基本结构

```python
class Dog:
    """一只狗的模型 — 演示基本类结构。"""

    # 类属性：所有实例共享
    species: str = "Canis familiaris"

    def __init__(self, name: str, age: int) -> None:
        """初始化实例属性。

        Args:
            name: 狗的名字
            age: 狗的年龄（岁）
        """
        # 实例属性：每个对象独立
        self.name: str = name
        self.age: int = age
        print(f"[Dog] 创建了一只狗: {self.name}, {self.age}岁")

    def bark(self) -> str:
        """发出叫声。"""
        sound: str = f"{self.name} says: Woof!"
        print(f"[Dog] {sound}")
        return sound

    def human_age(self) -> int:
        """将狗龄换算为人类年龄。"""
        result: int = self.age * 7
        print(f"[Dog] {self.name} 的人类等效年龄: {result}")
        return result


# ✅ 使用示例
buddy = Dog("Buddy", 3)       # [Dog] 创建了一只狗: Buddy, 3岁
buddy.bark()                   # [Dog] Buddy says: Woof!
buddy.human_age()              # [Dog] Buddy 的人类等效年龄: 21
```

### 1.2 `__init__` 与 `self` 的真正含义

> ⚛️ **The Science: `self` 不是关键字，是约定**
>
> Python 不像 Java/C++ 隐式传递 `this`。Python **显式**传递实例引用作为第一个参数。
> 按约定命名为 `self`，但你完全可以叫它 `this`、`me` 甚至 `potato`（**但请别这么做**）。
>
> ```python
> class Foo:
>     def method(self):
>         pass
>
> # 当你调用 foo.method() 时，Python 实际执行：
> # Foo.method(foo)
> ```
>
> 这就是为什么实例方法的第一个参数总是 `self`——Python 把实例"显式地"传给了你。

`__init__` 不是"构造器"，更准确地说它是**初始化器**：

```python
class User:
    """用户模型 — 演示 __init__ 的角色。"""

    def __new__(cls, *args, **kwargs) -> "User":
        """真正的构造器：创建实例（很少需要重写）。"""
        print(f"[User] __new__: 正在创建 {cls.__name__} 实例")
        instance = super().__new__(cls)
        return instance

    def __init__(self, username: str, email: str) -> None:
        """初始化器：设置实例状态。"""
        print(f"[User] __init__: 初始化 username={username}")
        self.username: str = username
        self.email: str = email


# 执行顺序：
user = User("alice", "alice@example.com")
# [User] __new__: 正在创建 User 实例
# [User] __init__: 初始化 username=alice
```

| 方法 | 角色 | 何时调用 | 返回值 |
|------|------|----------|--------|
| `__new__` | 构造器 | 创建实例之前 | 必须返回实例 |
| `__init__` | 初始化器 | 实例创建之后 | 必须返回 `None` |

### 1.3 类属性 vs 实例属性

```python
class Counter:
    """计数器 — 演示类属性 vs 实例属性。"""

    # ✅ 类属性：被所有实例共享
    total_count: int = 0

    def __init__(self, name: str) -> None:
        # ✅ 实例属性：每个对象独立
        self.name: str = name
        self.count: int = 0
        Counter.total_count += 1  # 修改类属性
        print(f"[Counter] 创建 {name}, 全局计数: {Counter.total_count}")

    def increment(self) -> None:
        self.count += 1
        print(f"[Counter] {self.name} 计数: {self.count}")


c1 = Counter("A")  # [Counter] 创建 A, 全局计数: 1
c2 = Counter("B")  # [Counter] 创建 B, 全局计数: 2
c1.increment()      # [Counter] A 计数: 1
c2.increment()      # [Counter] B 计数: 1
c2.increment()      # [Counter] B 计数: 2

print(f"c1.count = {c1.count}")              # 1（实例独立）
print(f"c2.count = {c2.count}")              # 2（实例独立）
print(f"Counter.total_count = {Counter.total_count}")  # 2（类共享）
```

> ⚠️ **陷阱：可变类属性**
>
> ```python
> # ❌ 危险：可变对象作为类属性
> class BadTeam:
>     members: list[str] = []  # 所有实例共享同一个列表！
>
>     def add(self, name: str) -> None:
>         self.members.append(name)
>
> t1 = BadTeam()
> t2 = BadTeam()
> t1.add("Alice")
> print(t2.members)  # ['Alice']  — 灾难！t2 也受影响了
>
> # ✅ 正确：在 __init__ 中初始化可变属性
> class GoodTeam:
>     def __init__(self) -> None:
>         self.members: list[str] = []  # 每个实例独立的列表
> ```

---

## 2. 继承与 super()

### 2.1 单继承基础

> 🧠 **CS Master's Bridge: 继承 = IS-A 关系**
>
> 面向对象设计中，继承表达的是"**是一种**"关系：`Dog IS-A Animal`。
> 如果你无法自然地说出"X 是一种 Y"，那就不该用继承——应该用**组合**（HAS-A）。
>
> ```
> ✅ Dog IS-A Animal       → 继承
> ✅ Cat IS-A Animal       → 继承
> ❌ Car IS-A Engine       → 组合（Car HAS-A Engine）
> ❌ Database IS-A Logger  → 组合（Database HAS-A Logger）
> ```

```python
class Animal:
    """动物基类。"""

    def __init__(self, name: str, sound: str) -> None:
        self.name: str = name
        self.sound: str = sound
        print(f"[Animal] 初始化: {name}")

    def speak(self) -> str:
        result: str = f"{self.name} says {self.sound}!"
        print(f"[Animal] {result}")
        return result

    def __repr__(self) -> str:
        return f"Animal(name={self.name!r}, sound={self.sound!r})"


class Dog(Animal):
    """狗 — 继承自 Animal。"""

    def __init__(self, name: str, breed: str) -> None:
        super().__init__(name, sound="Woof")  # 调用父类初始化
        self.breed: str = breed
        print(f"[Dog] 初始化品种: {breed}")

    def fetch(self, item: str) -> str:
        result: str = f"{self.name} fetches the {item}"
        print(f"[Dog] {result}")
        return result


class Cat(Animal):
    """猫 — 继承自 Animal。"""

    def __init__(self, name: str, indoor: bool = True) -> None:
        super().__init__(name, sound="Meow")
        self.indoor: bool = indoor
        print(f"[Cat] 室内猫: {indoor}")

    def purr(self) -> str:
        result: str = f"{self.name} purrs..."
        print(f"[Cat] {result}")
        return result


# ✅ 使用多态
animals: list[Animal] = [Dog("Rex", "Labrador"), Cat("Whiskers")]
for animal in animals:
    animal.speak()  # 每个子类的行为不同（多态）
```

### 2.2 super() 的正确使用

```python
class Shape:
    """形状基类。"""

    def __init__(self, color: str = "white") -> None:
        self.color: str = color
        print(f"[Shape] 颜色: {color}")


class Rectangle(Shape):
    """矩形。"""

    def __init__(self, width: float, height: float, color: str = "white") -> None:
        super().__init__(color)  # ✅ 用 super() 调用父类
        self.width: float = width
        self.height: float = height
        print(f"[Rectangle] {width}x{height}")

    def area(self) -> float:
        result: float = self.width * self.height
        print(f"[Rectangle] 面积: {result}")
        return result


class Square(Rectangle):
    """正方形 — 继承自矩形。"""

    def __init__(self, side: float, color: str = "white") -> None:
        super().__init__(side, side, color)  # ✅ 复用矩形的逻辑
        print(f"[Square] 边长: {side}")


sq = Square(5, "red")
print(f"面积 = {sq.area()}")  # 25.0
```

> 🧰 **Toolbox: 何时用 super()**
>
> | 场景 | 做法 |
> |------|------|
> | 子类扩展父类行为 | `super().__init__()` + 额外逻辑 |
> | 子类完全替换父类行为 | 不调用 `super()`（慎用） |
> | 多重继承 | **必须**用 `super()` 以遵循 MRO |

---

## 3. 多重继承与 MRO

### 3.1 菱形继承问题

> 🎭 **The Drama: 菱形继承 — OOP 的"家庭纠纷"**
>
> 假设 `D` 同时继承了 `B` 和 `C`，而 `B` 和 `C` 都继承了 `A`。
> 当你调用 `D` 的方法时，到底该走 `B` 的版本还是 `C` 的版本？
> 这就是经典的**菱形继承问题 (Diamond Problem)**。
>
> ```
>        A
>       / \
>      B   C
>       \ /
>        D
> ```
>
> C++ 的解法：虚继承（复杂且易错）。
> Java 的解法：干脆禁止多重继承。
> Python 的解法：**C3 线性化算法** — 用一个确定性的顺序解决歧义。

```python
class A:
    def method(self) -> str:
        print("[A] A.method()")
        return "A"

class B(A):
    def method(self) -> str:
        print("[B] B.method()")
        return "B"

class C(A):
    def method(self) -> str:
        print("[C] C.method()")
        return "C"

class D(B, C):
    pass  # 没有重写 method


d = D()
print(d.method())  # [B] B.method() → "B"

# 查看 MRO（方法解析顺序）
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
```

### 3.2 C3 线性化算法

> ⚛️ **The Science: C3 线性化 — 有向无环图的拓扑排序**
>
> C3 算法保证三个特性：
> 1. **子类优先于父类**：`D` 在 `B`、`C` 之前
> 2. **声明顺序保留**：`class D(B, C)` 中 `B` 在 `C` 之前
> 3. **单调性**：如果 `B` 在 `C` 之前，在所有子类的 MRO 中 `B` 都在 `C` 之前
>
> 算法伪代码：
> ```
> L(D) = D + merge(L(B), L(C), [B, C])
> L(B) = B + merge(L(A), [A]) = [B, A]
> L(C) = C + merge(L(A), [A]) = [C, A]
> L(D) = D + merge([B, A], [C, A], [B, C])
>      = D + B + merge([A], [C, A], [C])
>      = D + B + C + merge([A], [A])
>      = [D, B, C, A]
> ```

```python
class Base:
    def greet(self) -> str:
        return "Base"

class Left(Base):
    def greet(self) -> str:
        return "Left -> " + super().greet()

class Right(Base):
    def greet(self) -> str:
        return "Right -> " + super().greet()

class Child(Left, Right):
    def greet(self) -> str:
        return "Child -> " + super().greet()


child = Child()
print(child.greet())
# Child -> Left -> Right -> Base

# super() 沿着 MRO 链式调用！
print([cls.__name__ for cls in Child.__mro__])
# ['Child', 'Left', 'Right', 'Base', 'object']
```

| 语言 | 多重继承 | 解决方案 |
|------|----------|----------|
| Python | ✅ 支持 | C3 线性化 MRO |
| C++ | ✅ 支持 | 虚继承（手动控制） |
| Java | ❌ 禁止 | 单继承 + 接口 |
| Go | ❌ 无类 | 组合 + 接口嵌入 |
| Rust | ❌ 无类 | Trait（类似 Mixin）|

### 3.3 Mixin 模式

> 🧘 **Zen of Code: Mixin — "能力胶囊"**
>
> Mixin 不是"父类"，而是一个**能力胶囊**。
> 它不定义"你是什么"（IS-A），而是赋予"你能做什么"（CAN-DO）。
> 好的 Mixin 应该像维生素片：小巧、单一职责、可自由组合。

```python
import json
from typing import Any


class JsonMixin:
    """提供 JSON 序列化能力的 Mixin。"""

    def to_json(self) -> str:
        """将对象转为 JSON 字符串。"""
        data: dict[str, Any] = {
            k: v for k, v in self.__dict__.items()
            if not k.startswith("_")
        }
        result: str = json.dumps(data, ensure_ascii=False, indent=2)
        print(f"[JsonMixin] 序列化: {type(self).__name__}")
        return result


class LogMixin:
    """提供日志能力的 Mixin。"""

    def log(self, message: str) -> None:
        class_name: str = type(self).__name__
        print(f"[{class_name}] LOG: {message}")


class ValidateMixin:
    """提供数据验证能力的 Mixin。"""

    def validate(self) -> bool:
        """检查所有非下划线开头的属性是否非空。"""
        for key, value in self.__dict__.items():
            if not key.startswith("_") and not value:
                print(f"[ValidateMixin] 验证失败: {key} 为空")
                return False
        print(f"[ValidateMixin] 验证通过")
        return True


# ✅ 组合多个 Mixin — 像搭积木一样
class Product(JsonMixin, LogMixin, ValidateMixin):
    """产品模型 — 组合了 JSON、日志、验证能力。"""

    def __init__(self, name: str, price: float) -> None:
        self.name: str = name
        self.price: float = price
        self.log(f"创建产品: {name}, 价格: {price}")


p = Product("Python Book", 49.99)
print(p.to_json())     # JSON 序列化
print(p.validate())    # 数据验证
```

> 🧰 **Toolbox: Mixin 命名约定**
>
> - Mixin 类名以 `Mixin` 结尾：`JsonMixin`、`LogMixin`
> - Mixin 放在继承列表的**左边**：`class Foo(MixinA, MixinB, Base)`
> - Mixin 不应该有 `__init__`（或用 `**kwargs` 传递）
> - 每个 Mixin 只做**一件事**

---

## 4. @property、@classmethod、@staticmethod

### 4.1 @property：智能属性

```python
class Temperature:
    """温度转换器 — 演示 @property。"""

    def __init__(self, celsius: float) -> None:
        self._celsius: float = celsius  # 带下划线表示"内部使用"
        print(f"[Temperature] 初始化: {celsius}°C")

    @property
    def celsius(self) -> float:
        """获取摄氏温度（getter）。"""
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        """设置摄氏温度（setter），带验证。"""
        if value < -273.15:
            raise ValueError(f"温度不能低于绝对零度: {value}°C")
        print(f"[Temperature] 设置温度: {value}°C")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:
        """摄氏 → 华氏（只读计算属性）。"""
        return self._celsius * 9 / 5 + 32

    @property
    def kelvin(self) -> float:
        """摄氏 → 开尔文（只读计算属性）。"""
        return self._celsius + 273.15


# ✅ 像普通属性一样使用
temp = Temperature(100)
print(f"{temp.celsius}°C = {temp.fahrenheit}°F = {temp.kelvin}K")
# 100°C = 212.0°F = 373.15K

temp.celsius = 0      # 触发 setter
print(temp.fahrenheit) # 32.0

# temp.fahrenheit = 100  # ❌ AttributeError: 只读属性
```

### 4.2 @classmethod：替代构造器

```python
from datetime import date


class Employee:
    """员工模型 — 演示 @classmethod 作为替代构造器。"""

    def __init__(self, name: str, age: int) -> None:
        self.name: str = name
        self.age: int = age
        print(f"[Employee] 创建: {name}, {age}岁")

    @classmethod
    def from_birth_year(cls, name: str, birth_year: int) -> "Employee":
        """从出生年份创建员工（替代构造器）。"""
        age: int = date.today().year - birth_year
        print(f"[Employee] 从出生年份创建: {name}, {birth_year}")
        return cls(name, age)  # cls 而非 Employee，支持子类

    @classmethod
    def from_string(cls, data: str) -> "Employee":
        """从字符串解析创建员工。"""
        name, age_str = data.split("-")
        print(f"[Employee] 从字符串创建: {data}")
        return cls(name.strip(), int(age_str.strip()))


# ✅ 多种创建方式
e1 = Employee("Alice", 30)
e2 = Employee.from_birth_year("Bob", 1995)
e3 = Employee.from_string("Charlie - 28")
```

### 4.3 @staticmethod：工具函数

```python
class MathUtils:
    """数学工具 — 演示 @staticmethod。"""

    @staticmethod
    def is_even(n: int) -> bool:
        """判断是否为质数。"""
        return n % 2 == 0

    @staticmethod
    def factorial(n: int) -> int:
        """计算阶乘。"""
        if n < 0:
            raise ValueError("阶乘不接受负数")
        result: int = 1
        for i in range(2, n + 1):
            result *= i
        return result


# 注意：不需要创建实例就能调用
print(MathUtils.is_even(42))    # True
print(MathUtils.factorial(5))   # 120
```

| 装饰器 | 第一个参数 | 访问实例 | 访问类 | 典型用途 |
|--------|-----------|---------|--------|---------|
| (无) | `self` | ✅ | ✅ | 操作实例状态 |
| `@classmethod` | `cls` | ❌ | ✅ | 替代构造器、工厂方法 |
| `@staticmethod` | (无) | ❌ | ❌ | 工具函数、不依赖类状态 |

---

## 5. dataclasses（3.7+）

### 5.1 告别样板代码

> 🎭 **The Drama: dataclasses — 告别"无聊的 `__init__`"**
>
> 你是否厌倦了每次写类都要手敲 `__init__`、`__repr__`、`__eq__`？
> 如果一个类的核心目的是**存储数据**，那 80% 的代码都是无聊的样板。
> `dataclasses` 说："把样板交给我，你只管定义字段。"

```python
from dataclasses import dataclass, field


# ❌ 传统方式：手动写所有样板
class OldPoint:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"OldPoint(x={self.x}, y={self.y})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, OldPoint):
            return NotImplemented
        return self.x == other.x and self.y == other.y


# ✅ dataclass 方式：自动生成 __init__、__repr__、__eq__
@dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        """计算到另一个点的欧几里得距离。"""
        result = ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5
        print(f"[Point] 距离: {self} → {other} = {result:.2f}")
        return result


# 自动生成的方法
p1 = Point(3, 4)
p2 = Point(0, 0)
print(p1)              # Point(x=3, y=4)  — 自动 __repr__
print(p1 == Point(3, 4))  # True          — 自动 __eq__
p1.distance_to(p2)     # [Point] 距离: Point(x=3, y=4) → Point(x=0, y=0) = 5.00
```

### 5.2 field() 与默认工厂

```python
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Student:
    """学生模型 — 演示 field() 和默认值。"""

    name: str
    age: int
    grades: list[float] = field(default_factory=list)  # ✅ 可变默认值
    school: str = "Unknown"
    student_id: Optional[str] = field(default=None, repr=False)  # 不显示在 repr 中

    @property
    def average_grade(self) -> float:
        """计算平均成绩。"""
        if not self.grades:
            return 0.0
        avg: float = sum(self.grades) / len(self.grades)
        print(f"[Student] {self.name} 平均成绩: {avg:.1f}")
        return avg

    def __post_init__(self) -> None:
        """在 __init__ 之后自动调用，用于额外验证。"""
        if self.age < 0:
            raise ValueError(f"年龄不能为负: {self.age}")
        print(f"[Student] 创建学生: {self.name}, {self.age}岁")


s1 = Student("Alice", 20, [95.0, 88.5, 92.0])
s2 = Student("Bob", 22)  # grades 自动初始化为空列表
print(s1)            # Student(name='Alice', age=20, grades=[95.0, 88.5, 92.0], school='Unknown')
s1.average_grade     # [Student] Alice 平均成绩: 91.8
```

> ⚠️ **陷阱：不要用可变对象作为默认值**
>
> ```python
> # ❌ 这会导致所有实例共享同一个列表
> @dataclass
> class Bad:
>     items: list[str] = []  # TypeError!
>
> # ✅ 使用 field(default_factory=list)
> @dataclass
> class Good:
>     items: list[str] = field(default_factory=list)
> ```

### 5.3 不可变数据类

```python
@dataclass(frozen=True)
class Color:
    """不可变颜色 — frozen=True 使实例不可修改。"""

    red: int
    green: int
    blue: int

    def __post_init__(self) -> None:
        # frozen=True 时，验证需要用 object.__setattr__
        for name in ("red", "green", "blue"):
            value = getattr(self, name)
            if not (0 <= value <= 255):
                raise ValueError(f"{name} 必须在 0-255 之间，得到 {value}")

    @property
    def hex(self) -> str:
        """转换为十六进制颜色码。"""
        return f"#{self.red:02x}{self.green:02x}{self.blue:02x}"


red = Color(255, 0, 0)
print(red.hex)        # #ff0000
# red.red = 128       # ❌ FrozenInstanceError: 不可修改

# ✅ frozen dataclass 可以作为字典键和集合元素
color_set: set[Color] = {Color(255, 0, 0), Color(0, 255, 0), Color(255, 0, 0)}
print(len(color_set))  # 2（重复的被去除了）
```

| 特性 | 普通 class | @dataclass | @dataclass(frozen=True) |
|------|-----------|------------|-------------------------|
| 自动 `__init__` | ❌ | ✅ | ✅ |
| 自动 `__repr__` | ❌ | ✅ | ✅ |
| 自动 `__eq__` | ❌ | ✅ | ✅ |
| 自动 `__hash__` | ❌ | ❌ | ✅ |
| 可变 | ✅ | ✅ | ❌ |
| 可排序 | ❌ | `order=True` | `order=True` |

---

## 6. \_\_slots\_\_：内存优化

> ⚛️ **The Science: \_\_dict\_\_ vs \_\_slots\_\_**
>
> 默认情况下，Python 用一个 `__dict__` 字典来存储每个实例的属性。字典很灵活，但也很耗内存。
> `__slots__` 告诉 Python："这个类只有这些属性，用固定结构存储即可。"
> 这能节省 30-50% 的内存，并稍微加快属性访问速度。

```python
import sys


class RegularPoint:
    """普通点 — 使用 __dict__。"""

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


class SlottedPoint:
    """槽化的点 — 使用 __slots__。"""

    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


# 内存对比
regular = RegularPoint(1.0, 2.0)
slotted = SlottedPoint(1.0, 2.0)

print(f"[Memory] RegularPoint: {sys.getsizeof(regular) + sys.getsizeof(regular.__dict__)} bytes")
print(f"[Memory] SlottedPoint: {sys.getsizeof(slotted)} bytes")

# ✅ slots 可以和 dataclass 结合
from dataclasses import dataclass

@dataclass(slots=True)  # Python 3.10+
class FastPoint:
    x: float
    y: float


fp = FastPoint(1.0, 2.0)
print(f"[Memory] FastPoint: {sys.getsizeof(fp)} bytes")
# fp.z = 3.0  # ❌ AttributeError: 不能动态添加属性
```

> 🧰 **Toolbox: 何时使用 \_\_slots\_\_**
>
> | 场景 | 推荐 |
> |------|------|
> | 大量实例（>10万） | ✅ 使用 slots |
> | 数据容器/值对象 | ✅ 使用 slots |
> | 需要动态添加属性 | ❌ 不用 slots |
> | 需要 `__dict__` 或 `__weakref__` | ❌ 或手动加入 slots |
> | 继承层次复杂 | ⚠️ 小心使用 |

---

## 最佳实践

1. **优先组合，谨慎继承**：如果不是明确的 IS-A 关系，用组合而非继承
2. **数据类用 `@dataclass`**：存储数据的类不需要手写样板代码
3. **用 `@property` 替代 getter/setter**：Pythonic 的方式是让属性看起来像属性
4. **Mixin 要小巧单一**：每个 Mixin 只赋予一种能力
5. **类型标注要完整**：Stage 2 的代码必须有完整的类型标注
6. **`__slots__` 用于高性能场景**：大量实例或内存敏感时使用

---

## 常见陷阱

### 陷阱 1：可变默认参数

```python
# ❌ 经典错误：可变默认参数
def add_item(item: str, items: list[str] = []) -> list[str]:
    items.append(item)
    return items

print(add_item("a"))  # ['a']
print(add_item("b"))  # ['a', 'b']  — 惊不惊喜？！

# ✅ 使用 None 作为哨兵
def add_item_fixed(item: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append(item)
    return items
```

### 陷阱 2：忘记调用 super().__init__()

```python
class Base:
    def __init__(self) -> None:
        self.base_attr = "I exist"

# ❌ 忘记调用 super().__init__()
class Bad(Base):
    def __init__(self) -> None:
        self.child_attr = "me too"
        # 没有 super().__init__()

b = Bad()
# print(b.base_attr)  # ❌ AttributeError!

# ✅ 正确
class Good(Base):
    def __init__(self) -> None:
        super().__init__()
        self.child_attr = "me too"
```

### 陷阱 3：混淆类属性和实例属性

```python
class Config:
    debug: bool = False  # 类属性

    def __init__(self) -> None:
        pass

c1 = Config()
c2 = Config()

# 通过实例修改 — 创建了实例属性，不影响类属性
c1.debug = True
print(c1.debug)     # True（实例属性）
print(c2.debug)     # False（仍然是类属性）
print(Config.debug)  # False（类属性未变）

# ✅ 如果要修改类属性，通过类本身修改
Config.debug = True
print(c2.debug)  # True
```

---

## 练习题

### 练习 1：银行账户

创建一个 `BankAccount` 类，包含：
- 账户持有人、余额
- `deposit()` 和 `withdraw()` 方法（带验证）
- `@property` 实现余额查询
- `__repr__` 方法

<details>
<summary>💡 参考答案</summary>

```python
@dataclass
class BankAccount:
    owner: str
    _balance: float = field(default=0.0, repr=False)

    @property
    def balance(self) -> float:
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError(f"存款金额必须为正: {amount}")
        self._balance += amount
        print(f"[BankAccount] {self.owner} 存款 {amount}, 余额 {self._balance}")

    def withdraw(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError(f"取款金额必须为正: {amount}")
        if amount > self._balance:
            raise ValueError(f"余额不足: 需要 {amount}, 只有 {self._balance}")
        self._balance -= amount
        print(f"[BankAccount] {self.owner} 取款 {amount}, 余额 {self._balance}")

    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self._balance})"
```
</details>

### 练习 2：形状层次

创建 `Shape` → `Circle`、`Rectangle` 继承层次：
- 每个形状有 `area()` 和 `perimeter()` 方法
- 使用 `@dataclass`
- 写一个函数接受 `list[Shape]` 并计算总面积

<details>
<summary>💡 参考答案</summary>

```python
import math
from dataclasses import dataclass


@dataclass
class Shape:
    def area(self) -> float:
        raise NotImplementedError

    def perimeter(self) -> float:
        raise NotImplementedError


@dataclass
class Circle(Shape):
    radius: float

    def area(self) -> float:
        return math.pi * self.radius ** 2

    def perimeter(self) -> float:
        return 2 * math.pi * self.radius


@dataclass
class Rectangle(Shape):
    width: float
    height: float

    def area(self) -> float:
        return self.width * self.height

    def perimeter(self) -> float:
        return 2 * (self.width + self.height)


def total_area(shapes: list[Shape]) -> float:
    total = sum(s.area() for s in shapes)
    print(f"[Shapes] 总面积: {total:.2f}")
    return total
```
</details>

### 练习 3：Mixin 实践

创建一个 `TimestampMixin`，为任何类添加 `created_at` 和 `updated_at` 属性。

<details>
<summary>💡 参考答案</summary>

```python
from datetime import datetime
from dataclasses import dataclass, field


class TimestampMixin:
    created_at: datetime
    updated_at: datetime

    def __init_subclass__(cls, **kwargs: object) -> None:
        super().__init_subclass__(**kwargs)

    def touch(self) -> None:
        self.updated_at = datetime.now()
        print(f"[TimestampMixin] 更新时间戳: {self.updated_at}")


@dataclass
class Article(TimestampMixin):
    title: str
    content: str
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


article = Article("Python OOP", "面向对象编程...")
print(f"创建时间: {article.created_at}")
article.touch()
print(f"更新时间: {article.updated_at}")
```
</details>

---

## 参考资源

- [Python 官方文档 - 类](https://docs.python.org/3/tutorial/classes.html)
- [Python 数据模型](https://docs.python.org/3/reference/datamodel.html)
- [dataclasses 模块](https://docs.python.org/3/library/dataclasses.html)
- [Fluent Python, 2nd Ed. - Ch.11: A Pythonic Object](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [Real Python - Python OOP](https://realpython.com/python3-object-oriented-programming/)
- [Raymond Hettinger - Super considered super!](https://rhettinger.wordpress.com/2011/05/26/super-considered-super/)

---

## 下一步

恭喜你完成了 OOP 基础！你已经掌握了类、继承、MRO、dataclass 等核心概念。

接下来，我们将学习 Python 的**魔术方法**——让你的自定义对象与 Python 的内置语法无缝集成。

**[👉 第 2 章：魔术方法入门](../02-dunder-methods/)**

---

[⬅️ 返回 Stage 2 目录](../README.md) | [👉 第 2 章：魔术方法入门](../02-dunder-methods/)
