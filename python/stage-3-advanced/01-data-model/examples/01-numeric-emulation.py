"""
数值类型模拟 — Vector2D 完整实现
展示 __add__, __radd__, __iadd__, __mul__, __rmul__, __abs__, __neg__ 等
"""

import logging
import math
from typing import Union

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("NumericEmulation")


class Vector2D:
    """二维向量 — 完整的数值类型模拟"""

    __slots__ = ('_x', '_y')

    def __init__(self, x: float, y: float) -> None:
        self._x = float(x)
        self._y = float(y)
        logger.debug("创建向量 (%.2f, %.2f)", x, y)

    # ---- 属性访问（只读） ----

    @property
    def x(self) -> float:
        return self._x

    @property
    def y(self) -> float:
        return self._y

    # ---- 字符串表示 ----

    def __repr__(self) -> str:
        """开发者友好表示: Vector2D(1.0, 2.0)"""
        return f"Vector2D({self._x!r}, {self._y!r})"

    def __str__(self) -> str:
        """用户友好表示: (1.00, 2.00)"""
        return f"({self._x:.2f}, {self._y:.2f})"

    def __format__(self, fmt_spec: str) -> str:
        """支持格式化，'p' 后缀表示极坐标"""
        if fmt_spec.endswith('p'):
            # 极坐标格式: <模, 角度>
            fmt_spec = fmt_spec[:-1]
            coords = (abs(self), math.atan2(self._y, self._x))
            outer_fmt = '<{}, {}>'
        else:
            coords = (self._x, self._y)
            outer_fmt = '({}, {})'
        components = (format(c, fmt_spec) for c in coords)
        return outer_fmt.format(*components)

    # ---- 算术运算 ----

    def __add__(self, other: Union['Vector2D', tuple]) -> 'Vector2D':
        """✅ 向量加法: v1 + v2"""
        if isinstance(other, Vector2D):
            logger.debug("__add__: %s + %s", self, other)
            return Vector2D(self._x + other._x, self._y + other._y)
        if isinstance(other, tuple) and len(other) == 2:
            return Vector2D(self._x + other[0], self._y + other[1])
        return NotImplemented

    def __radd__(self, other: Union['Vector2D', tuple]) -> 'Vector2D':
        """✅ 反向加法: (1, 2) + v（当左操作数不知道如何加 Vector2D 时）"""
        logger.debug("__radd__: %s + %s (反向)", other, self)
        return self.__add__(other)

    def __iadd__(self, other: 'Vector2D') -> 'Vector2D':
        """✅ 增量加法: v1 += v2（不可变类型返回新对象）"""
        logger.debug("__iadd__: %s += %s", self, other)
        if isinstance(other, Vector2D):
            return Vector2D(self._x + other._x, self._y + other._y)
        return NotImplemented

    def __sub__(self, other: 'Vector2D') -> 'Vector2D':
        """✅ 向量减法: v1 - v2"""
        if isinstance(other, Vector2D):
            return Vector2D(self._x - other._x, self._y - other._y)
        return NotImplemented

    def __mul__(self, scalar: float) -> 'Vector2D':
        """✅ 标量乘法: v * 3"""
        if isinstance(scalar, (int, float)):
            logger.debug("__mul__: %s * %s", self, scalar)
            return Vector2D(self._x * scalar, self._y * scalar)
        return NotImplemented

    def __rmul__(self, scalar: float) -> 'Vector2D':
        """✅ 反向标量乘法: 3 * v"""
        logger.debug("__rmul__: %s * %s (反向)", scalar, self)
        return self.__mul__(scalar)

    def __truediv__(self, scalar: float) -> 'Vector2D':
        """✅ 标量除法: v / 2"""
        if isinstance(scalar, (int, float)):
            if scalar == 0:
                raise ZeroDivisionError("不能除以零")
            return Vector2D(self._x / scalar, self._y / scalar)
        return NotImplemented

    def __neg__(self) -> 'Vector2D':
        """✅ 取反: -v"""
        return Vector2D(-self._x, -self._y)

    def __pos__(self) -> 'Vector2D':
        """✅ 正号: +v"""
        return Vector2D(self._x, self._y)

    def __abs__(self) -> float:
        """✅ 模/长度: abs(v)"""
        return math.hypot(self._x, self._y)

    # ---- 比较运算 ----

    def __eq__(self, other: object) -> bool:
        """✅ 相等比较"""
        if isinstance(other, Vector2D):
            return (self._x, self._y) == (other._x, other._y)
        return NotImplemented

    def __hash__(self) -> int:
        """✅ 哈希（与 __eq__ 一致）"""
        return hash((self._x, self._y))

    def __bool__(self) -> bool:
        """✅ 布尔转换: 零向量为 False"""
        return bool(abs(self))

    # ---- 解包支持 ----

    def __iter__(self):
        """✅ 允许 x, y = vector"""
        yield self._x
        yield self._y

    # ---- 数学方法 ----

    def angle(self) -> float:
        """返回向量角度（弧度）"""
        return math.atan2(self._y, self._x)

    def normalized(self) -> 'Vector2D':
        """返回单位向量"""
        magnitude = abs(self)
        if magnitude == 0:
            raise ValueError("零向量没有方向")
        return self / magnitude

    def dot(self, other: 'Vector2D') -> float:
        """点积"""
        return self._x * other._x + self._y * other._y


def main() -> None:
    """演示 Vector2D 的所有数值操作"""

    print("=" * 60)
    print("Vector2D 数值类型模拟演示")
    print("=" * 60)

    # 创建向量
    v1 = Vector2D(3, 4)
    v2 = Vector2D(1, 2)

    # 加法
    print(f"\n--- 加法 ---")
    print(f"v1 + v2 = {v1 + v2}")         # __add__
    print(f"(1, 1) + v1 = {(1, 1) + v1}") # __radd__

    # 增量加法
    print(f"\n--- 增量加法 ---")
    v3 = Vector2D(0, 0)
    old_id = id(v3)
    v3 += v1
    print(f"v3 += v1 → {v3} (新对象: {id(v3) != old_id})")

    # 标量乘法
    print(f"\n--- 标量乘法 ---")
    print(f"v1 * 3 = {v1 * 3}")   # __mul__
    print(f"3 * v1 = {3 * v1}")   # __rmul__

    # 一元运算
    print(f"\n--- 一元运算 ---")
    print(f"-v1 = {-v1}")          # __neg__
    print(f"abs(v1) = {abs(v1)}")  # __abs__ → 5.0

    # 格式化
    print(f"\n--- 格式化 ---")
    print(f"默认: {v1}")
    print(f"精度: {v1:.4f}")
    print(f"极坐标: {v1:.2fp}")

    # 解包
    print(f"\n--- 解包 ---")
    x, y = v1
    print(f"x={x}, y={y}")

    # 比较和哈希
    print(f"\n--- 比较和哈希 ---")
    print(f"v1 == Vector2D(3, 4): {v1 == Vector2D(3, 4)}")
    print(f"可以做 dict key: { {v1: 'origin'} }")

    # 布尔
    print(f"\n--- 布尔 ---")
    print(f"bool(v1) = {bool(v1)}")
    print(f"bool(Vector2D(0, 0)) = {bool(Vector2D(0, 0))}")

    # 数学方法
    print(f"\n--- 数学方法 ---")
    print(f"v1.angle() = {math.degrees(v1.angle()):.2f}°")
    print(f"v1.normalized() = {v1.normalized()}")
    print(f"v1 · v2 = {v1.dot(v2)}")


if __name__ == '__main__':
    main()
