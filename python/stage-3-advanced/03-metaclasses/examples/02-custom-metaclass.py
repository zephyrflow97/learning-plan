"""
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
