"""
__new__ vs __init__ — 对象创建与初始化的区别
展示不可变类型子类化、单例模式、实例缓存
"""

import logging
from typing import Any

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("NewVsInit")


# ============================================================
# 1. 基础对比 — __new__ 和 __init__ 的调用顺序
# ============================================================

class Lifecycle:
    """展示对象创建的完整生命周期"""

    def __new__(cls, value: int) -> 'Lifecycle':
        logger.debug("__new__ 被调用，cls=%s, value=%d", cls.__name__, value)
        instance = super().__new__(cls)
        logger.debug("__new__ 创建实例，id=%d", id(instance))
        return instance

    def __init__(self, value: int) -> None:
        logger.debug("__init__ 被调用，self id=%d, value=%d", id(self), value)
        self.value = value

    def __repr__(self) -> str:
        return f"Lifecycle(value={self.value})"


# ============================================================
# 2. 不可变类型子类化 — 必须用 __new__
# ============================================================

class UpperStr(str):
    """始终大写的字符串 — str 是不可变的，值必须在 __new__ 中设定"""

    def __new__(cls, value: str) -> 'UpperStr':
        logger.debug("UpperStr.__new__: 将 '%s' 转为大写", value)
        instance = super().__new__(cls, value.upper())
        return instance

    def __init__(self, value: str) -> None:
        logger.debug("UpperStr.__init__: 实例值已经是 '%s'", self)


class EvenInt(int):
    """只接受偶数的整数子类"""

    def __new__(cls, value: int) -> 'EvenInt':
        if value % 2 != 0:
            raise ValueError(f"EvenInt 只接受偶数，得到 {value}")
        logger.debug("EvenInt.__new__: 创建偶数 %d", value)
        return super().__new__(cls, value)


class PositiveTuple(tuple):
    """只包含正数的 tuple 子类"""

    def __new__(cls, iterable) -> 'PositiveTuple':
        items = list(iterable)
        for item in items:
            if not isinstance(item, (int, float)) or item <= 0:
                raise ValueError(f"所有元素必须为正数，得到 {item}")
        logger.debug("PositiveTuple.__new__: 创建 %s", items)
        return super().__new__(cls, items)


# ============================================================
# 3. 单例模式 — 控制实例创建
# ============================================================

class Singleton:
    """单例模式 — __new__ 确保只有一个实例"""

    _instance: 'Singleton | None' = None

    def __new__(cls) -> 'Singleton':
        if cls._instance is None:
            logger.debug("Singleton: 创建唯一实例")
            cls._instance = super().__new__(cls)
        else:
            logger.debug("Singleton: 返回已有实例")
        return cls._instance

    def __init__(self) -> None:
        logger.debug("Singleton.__init__ 被调用（每次都会执行！）")


class BetterSingleton:
    """改进的单例 — 避免重复初始化"""

    _instance: 'BetterSingleton | None' = None
    _initialized: bool = False

    def __new__(cls, *args: Any, **kwargs: Any) -> 'BetterSingleton':
        if cls._instance is None:
            logger.debug("BetterSingleton: 创建实例")
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, name: str = "default") -> None:
        if not self._initialized:
            logger.debug("BetterSingleton: 首次初始化 name=%s", name)
            self.name = name
            type(self)._initialized = True
        else:
            logger.debug("BetterSingleton: 跳过重复初始化")


# ============================================================
# 4. 实例缓存 / 享元模式
# ============================================================

class CachedColor:
    """颜色缓存 — 相同参数共享同一实例"""

    _cache: dict[tuple[int, int, int], 'CachedColor'] = {}

    def __new__(cls, r: int, g: int, b: int) -> 'CachedColor':
        key = (r, g, b)
        if key in cls._cache:
            logger.debug("CachedColor: 缓存命中 (%d, %d, %d)", r, g, b)
            return cls._cache[key]
        logger.debug("CachedColor: 创建新颜色 (%d, %d, %d)", r, g, b)
        instance = super().__new__(cls)
        cls._cache[key] = instance
        return instance

    def __init__(self, r: int, g: int, b: int) -> None:
        self.r = r
        self.g = g
        self.b = b

    @property
    def hex(self) -> str:
        return f"#{self.r:02x}{self.g:02x}{self.b:02x}"

    def __repr__(self) -> str:
        return f"CachedColor({self.r}, {self.g}, {self.b})"


# ============================================================
# 5. __new__ 返回非当前类实例
# ============================================================

class Redirector:
    """如果 __new__ 返回非当前类实例，__init__ 不会被调用"""

    def __new__(cls, value: int) -> Any:
        if value < 0:
            logger.debug("Redirector: 负数，返回字符串")
            return f"Negative({value})"
        logger.debug("Redirector: 正数，正常创建")
        return super().__new__(cls)

    def __init__(self, value: int) -> None:
        logger.debug("Redirector.__init__: value=%d", value)
        self.value = value


# ============================================================
# 演示
# ============================================================

def main() -> None:
    print("=" * 60)
    print("__new__ vs __init__ 演示")
    print("=" * 60)

    print("\n--- 1. 对象创建生命周期 ---")
    obj = Lifecycle(42)
    print(f"结果: {obj}")

    print("\n--- 2. 不可变类型子类化 ---")
    s = UpperStr("hello world")
    print(f"UpperStr('hello world') = '{s}'")
    print(f"类型: {type(s).__name__}")

    e = EvenInt(42)
    print(f"EvenInt(42) = {e}, 类型: {type(e).__name__}")
    try:
        EvenInt(3)
    except ValueError as err:
        print(f"EvenInt(3) -> 错误: {err}")

    pt = PositiveTuple([1, 2, 3])
    print(f"PositiveTuple([1, 2, 3]) = {pt}")

    print("\n--- 3. 单例模式 ---")
    s1 = Singleton()
    s2 = Singleton()
    print(f"s1 is s2: {s1 is s2}")

    print()
    bs1 = BetterSingleton("first")
    bs2 = BetterSingleton("second")
    print(f"bs1.name = {bs1.name}")
    print(f"bs1 is bs2: {bs1 is bs2}")

    print("\n--- 4. 实例缓存 ---")
    red1 = CachedColor(255, 0, 0)
    red2 = CachedColor(255, 0, 0)
    blue = CachedColor(0, 0, 255)
    print(f"red1 is red2: {red1 is red2}")
    print(f"red1 is blue: {red1 is blue}")
    print(f"缓存大小: {len(CachedColor._cache)}")

    print("\n--- 5. __new__ 返回非当前类实例 ---")
    r1 = Redirector(10)
    print(f"Redirector(10) = {r1}, 类型: {type(r1).__name__}")
    r2 = Redirector(-5)
    print(f"Redirector(-5) = {r2}, 类型: {type(r2).__name__}")


if __name__ == '__main__':
    main()
