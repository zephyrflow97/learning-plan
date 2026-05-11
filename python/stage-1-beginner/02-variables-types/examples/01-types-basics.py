"""
类型基础 — Python 的数据类型̽索

运行方式:
    python examples/01-types-basics.py

本脚本演示：
1. Python 的动态类型系统
2. 数字类型（int, float, complex）
3. 布尔与真值判定
4. type() 和 isinstance() 的区别
"""


def demo_dynamic_typing() -> None:
    """演示 Python 的动态类型"""
    print("[类型基础] === 动态类型演示 ===")

    # 同一个变量可以绑定到不同类型的对象
    x = 42
    print(f"[类型基础] x = {x}, type = {type(x)}")  # <class 'int'>

    x = "hello"
    print(f"[类型基础] x = {x}, type = {type(x)}")  # <class 'str'>

    x = [1, 2, 3]
    print(f"[类型基础] x = {x}, type = {type(x)}")  # <class 'list'>

    x = 3.14
    print(f"[类型基础] x = {x}, type = {type(x)}")  # <class 'float'>

    print("[类型基础] 变量 x û有类型，它只是一个名字，可以指向任何类型的对象")


def demo_integer() -> None:
    """演示 int 类型 - 无限精度整数"""
    print("\n[类型基础] === int 类型演示 ===")

    # Python 的 int û有溢出问题
    big_number = 10**100  # googol
    print(f"[类型基础] 10^100 = {big_number}")
    print(f"[类型基础] 10^100 的位数: {len(str(big_number))}")

    # 数字字面量可以用下划线分隔（Python 3.6+）
    population = 8_000_000_000
    print(f"[类型基础] 世界人口: {population:,}")

    # 不同进制
    binary = 0b1010_0101
    octal = 0o17
    hexadecimal = 0xFF
    print(f"[类型基础] 二进制 0b10100101 = {binary}")
    print(f"[类型基础] 八进制 0o17 = {octal}")
    print(f"[类型基础] ʮ六进制 0xFF = {hexadecimal}")

    # 进制转换
    value = 42
    print(f"[类型基础] 42 的二进制: {bin(value)}")
    print(f"[类型基础] 42 的八进制: {oct(value)}")
    print(f"[类型基础] 42 的ʮ六进制: {hex(value)}")


def demo_float() -> None:
    """演示 float 类型 - IEEE 754 ˫精度浮点数"""
    import math

    print("\n[类型基础] === float 类型演示 ===")

    # 浮点数精度问题
    result = 0.1 + 0.2
    print(f"[类型基础] 0.1 + 0.2 = {result}")
    print(f"[类型基础] 0.1 + 0.2 == 0.3? {result == 0.3}")  # False

    # 正确的浮点数比较方式
    print(f"[类型基础] math.isclose(0.1 + 0.2, 0.3)? {math.isclose(0.1 + 0.2, 0.3)}")

    # 使用 Decimal 进行精确计算
    from decimal import Decimal

    precise = Decimal("0.1") + Decimal("0.2")
    print(f"[类型基础] Decimal('0.1') + Decimal('0.2') = {precise}")

    # 特殊浮点值
    print(f"[类型基础] 正无穷: {float('inf')}")
    print(f"[类型基础] 负无穷: {float('-inf')}")
    print(f"[类型基础] NaN: {float('nan')}")

    # NaN 的诡异行为
    nan = float("nan")
    print(f"[类型基础] nan == nan? {nan == nan}")  # False
    print(f"[类型基础] math.isnan(nan)? {math.isnan(nan)}")  # True

    # 整除的方向
    print("\n[类型基础] === 整除方向对比 ===")
    print(f"[类型基础]  7 // 2 = {7 // 2}")   # 3
    print(f"[类型基础] -7 // 2 = {-7 // 2}")  # -4
    print(f"[类型基础] math.trunc(-7 / 2) = {math.trunc(-7 / 2)}")  # -3


def demo_complex() -> None:
    """演示 complex 类型"""
    print("\n[类型基础] === complex 类型演示 ===")

    z = 3 + 4j
    print(f"[类型基础] z = {z}")
    print(f"[类型基础] 实部: {z.real}")
    print(f"[类型基础] 虚部: {z.imag}")
    print(f"[类型基础] 模: {abs(z)}")
    print(f"[类型基础] 共轭: {z.conjugate()}")


def demo_bool_and_truthy() -> None:
    """演示布尔类型与真值判定"""
    print("\n[类型基础] === bool 与 Truthy/Falsy 演示 ===")

    # bool 是 int 的子类
    print(f"[类型基础] isinstance(True, int) = {isinstance(True, int)}")
    print(f"[类型基础] True + True = {True + True}")
    print(f"[类型基础] True * 10 = {True * 10}")

    # Falsy 值
    falsy_values = [False, 0, 0.0, 0j, "", [], (), {}, set(), None]
    print("\n[类型基础] Falsy 值列表:")
    for val in falsy_values:
        print(f"[类型基础]   bool({val!r:15s}) = {bool(val)}")

    # 利用布尔值计数
    numbers = [1, -2, 3, -4, 5, -6, 7, -8]
    positive_count = sum(n > 0 for n in numbers)
    print(f"\n[类型基础] 列表 {numbers} 中正数的个数: {positive_count}")


def main() -> None:
    """主函数"""
    print("=" * 60)
    print("Python 类型基础演示")
    print("=" * 60)

    demo_dynamic_typing()
    demo_integer()
    demo_float()
    demo_complex()
    demo_bool_and_truthy()

    print("\n" + "=" * 60)
    print("类型基础演示完成")
    print("=" * 60)


if __name__ == "__main__":
    main()
