"""
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
