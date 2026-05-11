"""
第 1 章 示例 04：@property、@classmethod、@staticmethod、__slots__
================================================================

演示：
- @property 实现智能属性（getter/setter/deleter）
- @classmethod 作为替代构造器
- @staticmethod 作为工具函数
- __slots__ 内存优化
"""

from __future__ import annotations

import logging
import sys
from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


# ============================================================
# 1. @property — 智能属性
# ============================================================

class Temperature:
    """温度转换器 — 演示完整的 property 用法。

    内部存储摄氏温度，自动提供华氏和开尔文转换。
    """

    def __init__(self, celsius: float) -> None:
        # 注意：通过 setter 设置，会触发验证
        self.celsius = celsius
        logger.info(f"[Temperature] 初始化: {celsius}°C")

    @property
    def celsius(self) -> float:
        """获取摄氏温度（getter）。"""
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        """设置摄氏温度（setter），带验证。"""
        if value < -273.15:
            raise ValueError(f"温度不能低于绝对零度 (-273.15°C)，得到: {value}°C")
        self._celsius = value
        logger.info(f"[Temperature] 设置温度: {value}°C")

    @celsius.deleter
    def celsius(self) -> None:
        """删除温度数据（deleter）。"""
        logger.info("[Temperature] 删除温度数据")
        self._celsius = 0.0

    @property
    def fahrenheit(self) -> float:
        """摄氏 → 华氏（只读计算属性）。"""
        return self._celsius * 9 / 5 + 32

    @property
    def kelvin(self) -> float:
        """摄氏 → 开尔文（只读计算属性）。"""
        return self._celsius + 273.15

    def __repr__(self) -> str:
        return f"Temperature({self._celsius}°C)"


# ============================================================
# 2. @classmethod — 替代构造器（工厂方法）
# ============================================================

class Employee:
    """员工模型 — 演示多种创建方式。"""

    def __init__(self, name: str, age: int, department: str = "未分配") -> None:
        self.name: str = name
        self.age: int = age
        self.department: str = department
        logger.info(f"[Employee] 创建: {name}, {age}岁, {department}")

    @classmethod
    def from_birth_year(cls, name: str, birth_year: int, department: str = "未分配") -> Employee:
        """从出生年份创建员工。

        使用 cls 而非 Employee，以便子类也能正确使用。
        """
        age: int = date.today().year - birth_year
        logger.info(f"[Employee] 从出生年份创建: {name}, 出生于 {birth_year}")
        return cls(name, age, department)

    @classmethod
    def from_string(cls, data: str) -> Employee:
        """从 'name-age-department' 格式字符串创建。"""
        parts: list[str] = [p.strip() for p in data.split("-")]
        if len(parts) < 2:
            raise ValueError(f"格式错误，期望 'name-age[-department]': {data}")
        name: str = parts[0]
        age: int = int(parts[1])
        department: str = parts[2] if len(parts) > 2 else "未分配"
        logger.info(f"[Employee] 从字符串创建: '{data}'")
        return cls(name, age, department)

    @classmethod
    def from_dict(cls, data: dict[str, str | int]) -> Employee:
        """从字典创建员工。"""
        logger.info(f"[Employee] 从字典创建: {data}")
        return cls(
            name=str(data["name"]),
            age=int(data["age"]),
            department=str(data.get("department", "未分配")),
        )

    def __repr__(self) -> str:
        return f"Employee({self.name!r}, age={self.age}, dept={self.department!r})"


# ============================================================
# 3. @staticmethod — 工具函数
# ============================================================

class DateUtils:
    """日期工具类 — 演示 @staticmethod。

    staticmethod 不接收 self 或 cls，本质上就是碰巧放在类里的普通函数。
    """

    @staticmethod
    def is_weekend(d: date) -> bool:
        """判断是否为周末。"""
        return d.weekday() >= 5

    @staticmethod
    def days_between(d1: date, d2: date) -> int:
        """计算两个日期之间的天数。"""
        return abs((d2 - d1).days)

    @staticmethod
    def format_date(d: date, fmt: str = "%Y年%m月%d日") -> str:
        """格式化日期为中文格式。"""
        return d.strftime(fmt)


# ============================================================
# 4. __slots__ — 内存优化
# ============================================================

class RegularPoint:
    """普通二维点 — 使用 __dict__ 存储属性。"""

    def __init__(self, x: float, y: float) -> None:
        self.x: float = x
        self.y: float = y


class SlottedPoint:
    """优化的二维点 — 使用 __slots__ 存储属性。"""

    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float) -> None:
        self.x: float = x
        self.y: float = y


# Python 3.10+ 支持 slots=True
@dataclass(slots=True)
class DataclassPoint:
    """dataclass + slots 的点。"""
    x: float
    y: float


# ============================================================
# 主程序
# ============================================================

def main() -> None:
    """运行所有示例。"""

    logger.info("=" * 60)
    logger.info("示例 1：@property — 智能属性")
    logger.info("=" * 60)

    temp = Temperature(100)
    logger.info(f"[Demo] {temp.celsius}°C = {temp.fahrenheit}°F = {temp.kelvin}K")

    temp.celsius = 0  # 触发 setter
    logger.info(f"[Demo] {temp.celsius}°C = {temp.fahrenheit}°F")

    # 验证：不能低于绝对零度
    try:
        temp.celsius = -300
    except ValueError as e:
        logger.info(f"[Demo] ❌ 验证拦截: {e}")

    # 只读属性
    try:
        temp.fahrenheit = 100  # type: ignore[misc]
    except AttributeError as e:
        logger.info(f"[Demo] ❌ 只读属性: {e}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 2：@classmethod — 替代构造器")
    logger.info("=" * 60)

    e1 = Employee("Alice", 30, "工程部")
    e2 = Employee.from_birth_year("Bob", 1995, "市场部")
    e3 = Employee.from_string("Charlie - 28 - 设计部")
    e4 = Employee.from_dict({"name": "Diana", "age": 25})

    for emp in [e1, e2, e3, e4]:
        logger.info(f"[Demo] {emp}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 3：@staticmethod — 工具函数")
    logger.info("=" * 60)

    today: date = date.today()
    logger.info(f"[Demo] 今天: {DateUtils.format_date(today)}")
    logger.info(f"[Demo] 是否周末: {DateUtils.is_weekend(today)}")
    logger.info(f"[Demo] 距 2025-01-01: {DateUtils.days_between(today, date(2025, 1, 1))} 天")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 4：__slots__ — 内存优化")
    logger.info("=" * 60)

    regular = RegularPoint(1.0, 2.0)
    slotted = SlottedPoint(1.0, 2.0)
    dc_point = DataclassPoint(1.0, 2.0)

    regular_size: int = sys.getsizeof(regular) + sys.getsizeof(regular.__dict__)
    slotted_size: int = sys.getsizeof(slotted)
    dc_size: int = sys.getsizeof(dc_point)

    logger.info(f"[Memory] RegularPoint: {regular_size} bytes")
    logger.info(f"[Memory] SlottedPoint: {slotted_size} bytes")
    logger.info(f"[Memory] DataclassPoint (slots=True): {dc_size} bytes")

    # slots 禁止动态添加属性
    try:
        slotted.z = 3.0  # type: ignore[attr-defined]
    except AttributeError as e:
        logger.info(f"[Demo] ❌ slots 禁止动态属性: {e}")

    # 普通类可以动态添加
    regular.z = 3.0  # type: ignore[attr-defined]
    logger.info(f"[Demo] ✅ 普通类可以动态添加: regular.z = {regular.z}")  # type: ignore[attr-defined]


if __name__ == "__main__":
    main()
