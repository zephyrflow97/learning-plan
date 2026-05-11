"""
实战描述器 — 类型检查、懒加载、缓存
展示描述器在实际开发中的三个核心用途
"""

import logging
import time
from typing import Any

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("PracticalDescriptors")


# ============================================================
# 1. Typed — 类型检查描述器
# ============================================================

class Typed:
    """✅ 类型检查描述器 — 使用 __set_name__ 自动获取属性名"""

    def __init__(self, expected_type: type) -> None:
        self.expected_type = expected_type
        self.name: str = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.name = name
        logger.debug("[Typed] 绑定到 %s.%s (类型: %s)",
                     owner.__name__, name, self.expected_type.__name__)

    def __get__(self, obj: Any, objtype: type = None) -> Any:
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj: Any, value: Any) -> None:
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"属性 '{self.name}' 期望 {self.expected_type.__name__}，"
                f"得到 {type(value).__name__}: {value!r}"
            )
        logger.debug("[Typed] %s = %r ✓", self.name, value)
        obj.__dict__[self.name] = value

    def __delete__(self, obj: Any) -> None:
        del obj.__dict__[self.name]


# ============================================================
# 2. Lazy — 懒加载描述器（非数据描述器）
# ============================================================

class Lazy:
    """✅ 懒加载描述器 — 首次访问时计算，之后缓存到实例 __dict__"""

    def __init__(self, func):
        self.func = func
        self.name = func.__name__
        self.__doc__ = func.__doc__

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        logger.debug("[Lazy] 首次计算: %s.%s", type(obj).__name__, self.name)
        value = self.func(obj)
        # 关键：存入 __dict__，下次直接读取（非数据描述器特性）
        obj.__dict__[self.name] = value
        return value


# ============================================================
# 3. CachedProperty — 带 TTL 的缓存描述器
# ============================================================

class CachedProperty:
    """✅ 带过期时间的缓存属性"""

    def __init__(self, func, ttl: float = 60.0):
        self.func = func
        self.ttl = ttl
        self.cache_key = ""
        self.time_key = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.cache_key = f"_cache_{name}"
        self.time_key = f"_cache_{name}_ts"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        now = time.time()
        ts = obj.__dict__.get(self.time_key, 0)
        if now - ts < self.ttl:
            logger.debug("[CachedProperty] 缓存命中")
            return obj.__dict__[self.cache_key]
        logger.debug("[CachedProperty] 重新计算")
        value = self.func(obj)
        obj.__dict__[self.cache_key] = value
        obj.__dict__[self.time_key] = now
        return value

    def __set__(self, obj, value):
        """写入时清除缓存"""
        obj.__dict__.pop(self.cache_key, None)
        obj.__dict__.pop(self.time_key, None)


def cached_property(ttl: float = 60.0):
    def decorator(func):
        return CachedProperty(func, ttl)
    return decorator


# ============================================================
# 使用示例
# ============================================================

class User:
    """使用 Typed 描述器的用户类"""
    name = Typed(str)
    age = Typed(int)
    email = Typed(str)

    def __init__(self, name: str, age: int, email: str) -> None:
        self.name = name
        self.age = age
        self.email = email

    def __repr__(self) -> str:
        return f"User({self.name!r}, age={self.age}, email={self.email!r})"


class Report:
    """使用 Lazy 描述器的报告类"""

    def __init__(self, data: list[float]) -> None:
        self.data = data

    @Lazy
    def summary(self) -> dict:
        """生成统计摘要（模拟耗时操作）"""
        logger.debug("[Report] 正在计算统计摘要...")
        return {
            'count': len(self.data),
            'mean': sum(self.data) / len(self.data),
            'min': min(self.data),
            'max': max(self.data),
        }


class WeatherAPI:
    """使用 CachedProperty 的天气服务"""

    def __init__(self, city: str) -> None:
        self.city = city

    @cached_property(ttl=3.0)
    def temperature(self) -> float:
        """获取温度（模拟 API 调用）"""
        import random
        temp = round(random.uniform(15.0, 35.0), 1)
        logger.debug("[WeatherAPI] API 返回温度: %.1f", temp)
        return temp


def main() -> None:
    print("=" * 60)
    print("实战描述器演示")
    print("=" * 60)

    # --- Typed ---
    print("\n--- 1. Typed 类型检查描述器 ---")
    user = User("Alice", 30, "alice@example.com")
    print(user)

    try:
        User("Bob", "thirty", "bob@example.com")
    except TypeError as e:
        print(f"类型错误: {e}")

    # --- Lazy ---
    print("\n--- 2. Lazy 懒加载描述器 ---")
    report = Report([1.0, 2.0, 3.0, 4.0, 5.0])
    print("首次访问:")
    print(f"  summary = {report.summary}")
    print("二次访问（直接从 __dict__）:")
    print(f"  summary = {report.summary}")
    print(f"  'summary' in __dict__: {'summary' in report.__dict__}")

    # --- CachedProperty ---
    print("\n--- 3. CachedProperty 缓存描述器 ---")
    weather = WeatherAPI("Beijing")
    t1 = weather.temperature
    print(f"第一次: {t1}")
    t2 = weather.temperature
    print(f"第二次（缓存）: {t2}")
    print(f"相同: {t1 == t2}")

    print("等待缓存过期 (3s)...")
    time.sleep(3.1)
    t3 = weather.temperature
    print(f"过期后: {t3}")


if __name__ == '__main__':
    main()
