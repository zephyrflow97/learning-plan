"""
Protocol（结构化子类型）示例。

演示 Protocol 的用法：
- 基础 Protocol 定义
- runtime_checkable
- Protocol vs ABC 对比
- 复合 Protocol
- 实际应用场景

运行: python 03-protocols.py
检查: mypy 03-protocols.py
"""

from typing import Protocol, runtime_checkable, Any
import json


# === 1. 基础 Protocol ===

class Drawable(Protocol):
    """任何可以被绘制的对象。不需要继承，只需实现 draw()。"""

    def draw(self) -> str: ...


class Circle:
    """圆形。没有继承任何东西，但实现了 draw()。"""

    def __init__(self, radius: float) -> None:
        self.radius: float = radius
        print(f"[Circle] 创建圆形, radius={radius}")

    def draw(self) -> str:
        result = f"○ Circle(r={self.radius})"
        print(f"[Circle.draw] {result}")
        return result


class Square:
    """正方形。同样没有继承，但有 draw()。"""

    def __init__(self, side: float) -> None:
        self.side: float = side
        print(f"[Square] 创建正方形, side={side}")

    def draw(self) -> str:
        result = f"□ Square(s={self.side})"
        print(f"[Square.draw] {result}")
        return result


# ✅ 接受任何 Drawable，不依赖继承
def render(shape: Drawable) -> str:
    """渲染任何可绘制的对象。"""
    output = shape.draw()
    print(f"[render] 渲染结果: {output}")
    return output


# === 2. runtime_checkable Protocol ===

@runtime_checkable
class Serializable(Protocol):
    """任何可以序列化为 JSON 字符串的对象。"""

    def to_json(self) -> str: ...


class User:
    def __init__(self, name: str, age: int) -> None:
        self.name: str = name
        self.age: int = age

    def to_json(self) -> str:
        data = json.dumps({"name": self.name, "age": self.age})
        print(f"[User.to_json] {data}")
        return data


class Product:
    def __init__(self, name: str, price: float) -> None:
        self.name: str = name
        self.price: float = price

    def to_json(self) -> str:
        data = json.dumps({"name": self.name, "price": self.price})
        print(f"[Product.to_json] {data}")
        return data


class NonSerializable:
    """这个类没有 to_json()。"""

    def __init__(self) -> None:
        self.data: str = "secret"


def save_all(items: list[Serializable]) -> list[str]:
    """保存所有可序列化对象。"""
    results: list[str] = []
    for item in items:
        results.append(item.to_json())
    print(f"[save_all] 保存了 {len(results)} 个对象")
    return results


# === 3. 复合 Protocol ===

class Readable(Protocol):
    def read(self) -> str: ...


class Writable(Protocol):
    def write(self, data: str) -> None: ...


class ReadWritable(Readable, Writable, Protocol):
    """可读可写的协议。继承自两个 Protocol。"""
    ...


class InMemoryFile:
    """内存中的文件实现。同时满足 Readable 和 Writable。"""

    def __init__(self) -> None:
        self._content: str = ""
        print(f"[InMemoryFile] 创建内存文件")

    def read(self) -> str:
        print(f"[InMemoryFile.read] 读取 {len(self._content)} 字符")
        return self._content

    def write(self, data: str) -> None:
        self._content += data
        print(f"[InMemoryFile.write] 写入 '{data}', 总长度={len(self._content)}")


def copy_data(source: Readable, target: Writable) -> None:
    """从可读对象复制到可写对象。"""
    data = source.read()
    target.write(data)
    print(f"[copy_data] 复制了 {len(data)} 字符")


# === 4. 带属性的 Protocol ===

class Named(Protocol):
    """带有 name 属性的对象。"""

    @property
    def name(self) -> str: ...


class Dog:
    def __init__(self, name: str) -> None:
        self._name: str = name

    @property
    def name(self) -> str:
        return self._name


class City:
    def __init__(self, name: str, population: int) -> None:
        self.name: str = name
        self.population: int = population


def greet_named(thing: Named) -> str:
    """问候任何有名字的东西。"""
    greeting = f"Hello, {thing.name}!"
    print(f"[greet_named] {greeting}")
    return greeting


# === 主程序 ===

if __name__ == "__main__":
    print("=" * 60)
    print("Protocol (结构化子类型) 示例")
    print("=" * 60)

    # 基础 Protocol
    render(Circle(5.0))
    render(Square(3.0))

    print()
    # runtime_checkable
    user = User("Alice", 30)
    product = Product("Widget", 9.99)
    non_ser = NonSerializable()

    print(f"[isinstance 检查]")
    print(f"  User is Serializable?       {isinstance(user, Serializable)}")
    print(f"  Product is Serializable?    {isinstance(product, Serializable)}")
    print(f"  NonSerializable?            {isinstance(non_ser, Serializable)}")

    save_all([user, product])

    print()
    # 复合 Protocol
    file1 = InMemoryFile()
    file1.write("Hello, Protocol!")
    file2 = InMemoryFile()
    copy_data(file1, file2)
    print(f"  file2 内容: '{file2.read()}'")

    print()
    # 带属性的 Protocol
    greet_named(Dog("Buddy"))
    greet_named(City("Beijing", 21_540_000))
