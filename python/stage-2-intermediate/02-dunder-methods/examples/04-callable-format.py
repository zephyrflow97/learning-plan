"""
第 2 章 示例 04：__call__ 与 __format__

演示可调用对象和自定义格式化。
"""

import math
import time
from typing import Any, Callable


# === 1. __call__ 基础：有状态的函数 ===

print("=" * 60)
print("1. __call__ 基础：有状态的函数")
print("=" * 60)


class Counter:
    """计数器——每次调用自增并返回当前值。"""

    def __init__(self, start: int = 0) -> None:
        self.value: int = start

    def __repr__(self) -> str:
        return f"Counter(value={self.value})"

    def __call__(self) -> int:
        self.value += 1
        print(f"  [Counter.__call__] value -> {self.value}")
        return self.value


counter = Counter()
print(f"[Counter] {counter()}")   # 1
print(f"[Counter] {counter()}")   # 2
print(f"[Counter] {counter()}")   # 3
print(f"[Counter] callable(counter): {callable(counter)}")  # True
print(f"[Counter] callable(42): {callable(42)}")            # False


# === 2. __call__ 实战：计时装饰器 ===

print(f"\n{'=' * 60}")
print("2. __call__ 实战：用类实现装饰器")
print(f"{'=' * 60}")


class Timer:
    """计时装饰器——用 __call__ 实现，记录所有调用的耗时。"""

    def __init__(self, func: Callable[..., Any]) -> None:
        self._func = func
        self._call_times: list[float] = []
        self.__name__ = func.__name__
        self.__doc__ = func.__doc__

    def __repr__(self) -> str:
        return f"Timer({self._func.__name__}, calls={len(self._call_times)})"

    def __call__(self, *args: Any, **kwargs: Any) -> Any:
        start: float = time.perf_counter()
        result: Any = self._func(*args, **kwargs)
        elapsed: float = time.perf_counter() - start
        self._call_times.append(elapsed)
        print(f"  [Timer] {self._func.__name__}() 耗时 {elapsed:.6f}s")
        return result

    @property
    def avg_time(self) -> float:
        """平均耗时。"""
        if not self._call_times:
            return 0.0
        return sum(self._call_times) / len(self._call_times)


@Timer
def slow_add(a: int, b: int) -> int:
    """模拟耗时计算。"""
    time.sleep(0.01)
    return a + b


result: int = slow_add(1, 2)
print(f"[Timer] result = {result}")
slow_add(3, 4)
slow_add(5, 6)
print(f"[Timer] 平均耗时: {slow_add.avg_time:.6f}s")  # type: ignore[attr-defined]


# === 3. __call__ 实战：策略模式 ===

print(f"\n{'=' * 60}")
print("3. __call__ 实战：策略模式")
print(f"{'=' * 60}")


class Validator:
    """可配置的验证器——策略模式的经典实现。"""

    def __init__(self, min_val: float | None = None, max_val: float | None = None) -> None:
        self.min_val = min_val
        self.max_val = max_val

    def __repr__(self) -> str:
        return f"Validator(min={self.min_val}, max={self.max_val})"

    def __call__(self, value: float) -> bool:
        if self.min_val is not None and value < self.min_val:
            print(f"  [Validator] {value} < {self.min_val} -> False")
            return False
        if self.max_val is not None and value > self.max_val:
            print(f"  [Validator] {value} > {self.max_val} -> False")
            return False
        print(f"  [Validator] {value} 在范围内 -> True")
        return True


age_validator = Validator(min_val=0, max_val=150)
score_validator = Validator(min_val=0, max_val=100)

print(f"[策略] age 25: {age_validator(25)}")     # True
print(f"[策略] age -5: {age_validator(-5)}")     # False
print(f"[策略] score 95: {score_validator(95)}") # True
print(f"[策略] score 120: {score_validator(120)}")  # False


# === 4. __format__ 基础 ===

print(f"\n{'=' * 60}")
print("4. __format__ 自定义格式化")
print(f"{'=' * 60}")


class Temperature:
    """温度——支持多种格式化方式。"""

    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    def __repr__(self) -> str:
        return f"Temperature(celsius={self.celsius})"

    def __str__(self) -> str:
        return f"{self.celsius}°C"

    def __format__(self, spec: str) -> str:
        """
        格式规范:
          'c' -> 摄氏度 (默认)
          'f' -> 华氏度
          'k' -> 开尔文
        """
        if spec == "" or spec == "c":
            return f"{self.celsius:.1f}°C"
        elif spec == "f":
            fahrenheit: float = self.celsius * 9 / 5 + 32
            return f"{fahrenheit:.1f}°F"
        elif spec == "k":
            kelvin: float = self.celsius + 273.15
            return f"{kelvin:.1f}K"
        else:
            raise ValueError(f"未知格式规范: {spec!r}")


boiling = Temperature(100)
freezing = Temperature(0)
body = Temperature(37)

print(f"[format] 沸点: {boiling}")      # 默认 __str__
print(f"[format] 沸点: {boiling:c}")    # 100.0°C
print(f"[format] 沸点: {boiling:f}")    # 212.0°F
print(f"[format] 沸点: {boiling:k}")    # 373.2K
print(f"[format] 体温: {body:f}")       # 98.6°F


# === 5. __format__ 高级：向量类 ===

print(f"\n{'=' * 60}")
print("5. __format__ 高级：向量类")
print(f"{'=' * 60}")


class Vector2D:
    """二维向量——丰富的格式化选项。"""

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"Vector2D(x={self.x}, y={self.y})"

    def __str__(self) -> str:
        return f"({self.x}, {self.y})"

    @property
    def magnitude(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2)

    @property
    def angle(self) -> float:
        return math.degrees(math.atan2(self.y, self.x))

    def __format__(self, spec: str) -> str:
        """
        格式规范:
          ''   -> 默认 (x, y)
          'p'  -> 极坐标 (r, θ°)
          'n'  -> 归一化向量
          其他 -> 应用数字格式到分量
        """
        if spec == "":
            return str(self)
        elif spec == "p":
            return f"({self.magnitude:.3f}, {self.angle:.1f}°)"
        elif spec == "n":
            if self.magnitude == 0:
                return "(0, 0)"
            nx: float = self.x / self.magnitude
            ny: float = self.y / self.magnitude
            return f"({nx:.3f}, {ny:.3f})"
        else:
            return f"({self.x:{spec}}, {self.y:{spec}})"


v = Vector2D(3, 4)

print(f"[Vector] 默认:     {v}")         # (3, 4)
print(f"[Vector] 极坐标:   {v:p}")       # (5.000, 53.1°)
print(f"[Vector] 归一化:   {v:n}")       # (0.600, 0.800)
print(f"[Vector] 精度:     {v:.2f}")     # (3.00, 4.00)
print(f"[Vector] 宽度:     {v:>8.1f}")  # (     3.0,      4.0)

print("\n✅ 04-callable-format.py 运行完成")
