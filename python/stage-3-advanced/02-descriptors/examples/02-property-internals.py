"""
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
