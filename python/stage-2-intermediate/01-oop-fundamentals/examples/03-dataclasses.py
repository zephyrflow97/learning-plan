"""
第 1 章 示例 03：dataclasses — 告别样板代码
==========================================

演示：
- @dataclass 基本用法
- field() 与默认工厂
- __post_init__ 验证
- frozen=True 不可变数据类
- dataclass 的排序和比较
"""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field, asdict, astuple
from datetime import datetime
from typing import Optional

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


# ============================================================
# 1. 基本 dataclass vs 传统类
# ============================================================

# ❌ 传统方式：手写所有样板代码
class OldStylePoint:
    """传统写法 — 需要手写 __init__, __repr__, __eq__。"""

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"OldStylePoint(x={self.x}, y={self.y})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, OldStylePoint):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self) -> int:
        return hash((self.x, self.y))


# ✅ dataclass 方式：自动生成 __init__, __repr__, __eq__
@dataclass
class Point:
    """二维点 — dataclass 自动生成样板代码。"""

    x: float
    y: float

    def distance_to(self, other: Point) -> float:
        """计算到另一个点的欧几里得距离。"""
        result: float = math.sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2)
        logger.info(f"[Point] 距离 {self} → {other} = {result:.2f}")
        return result


# ============================================================
# 2. field() 与默认工厂
# ============================================================

@dataclass
class Student:
    """学生模型 — 演示 field() 的各种用法。"""

    # 必填字段（无默认值的必须在前面）
    name: str
    age: int

    # 有默认值的字段
    school: str = "Unknown"
    grades: list[float] = field(default_factory=list)  # ✅ 可变对象用 default_factory
    student_id: Optional[str] = field(default=None, repr=False)  # repr=False: 不在 repr 中显示
    _internal: str = field(default="", init=False, repr=False)  # init=False: 不在构造器中

    def __post_init__(self) -> None:
        """在 __init__ 之后自动调用 — 用于验证和额外初始化。"""
        if self.age < 0 or self.age > 150:
            raise ValueError(f"年龄不合法: {self.age}")
        self._internal = f"student_{self.name.lower()}"
        logger.info(f"[Student] 创建: {self.name}, {self.age}岁, 学历: {self.school}")

    @property
    def average_grade(self) -> float:
        """计算平均成绩。"""
        if not self.grades:
            return 0.0
        avg: float = sum(self.grades) / len(self.grades)
        logger.info(f"[Student] {self.name} 平均成绩: {avg:.1f}")
        return avg

    def add_grade(self, grade: float) -> None:
        """添加一个成绩。"""
        if not (0 <= grade <= 100):
            raise ValueError(f"成绩必须在 0-100 之间: {grade}")
        self.grades.append(grade)
        logger.info(f"[Student] {self.name} 添加成绩: {grade}")


# ============================================================
# 3. frozen=True — 不可变数据类
# ============================================================

@dataclass(frozen=True)
class Color:
    """不可变颜色 — 实例创建后不可修改。"""

    red: int
    green: int
    blue: int

    def __post_init__(self) -> None:
        """验证颜色值范围。"""
        for channel in ("red", "green", "blue"):
            value: int = getattr(self, channel)
            if not (0 <= value <= 255):
                raise ValueError(f"{channel} 必须在 0-255 之间，得到 {value}")

    @property
    def hex(self) -> str:
        """转换为十六进制颜色码。"""
        return f"#{self.red:02x}{self.green:02x}{self.blue:02x}"

    @property
    def rgb_str(self) -> str:
        """转换为 rgb() 字符串。"""
        return f"rgb({self.red}, {self.green}, {self.blue})"


# ============================================================
# 4. 带排序的 dataclass
# ============================================================

@dataclass(order=True)
class Priority:
    """优先级任务 — 支持排序比较。"""

    # sort_index 用于排序（不在 repr 中显示）
    sort_index: int = field(init=False, repr=False)
    priority: int
    name: str

    def __post_init__(self) -> None:
        # 优先级越高，sort_index 越小（用于排序）
        self.sort_index = -self.priority
        logger.info(f"[Priority] 创建任务: {self.name} (优先级: {self.priority})")


# ============================================================
# 5. dataclass 继承
# ============================================================

@dataclass
class Person:
    """人 — 基础数据类。"""

    name: str
    age: int


@dataclass
class Employee(Person):
    """员工 — 继承 Person 并添加字段。"""

    department: str = "未分配"
    salary: float = 0.0

    def __post_init__(self) -> None:
        logger.info(f"[Employee] {self.name}, {self.department}, 薪资: {self.salary}")


# ============================================================
# 主程序
# ============================================================

def main() -> None:
    """运行所有示例。"""

    logger.info("=" * 60)
    logger.info("示例 1：基本 dataclass")
    logger.info("=" * 60)

    p1 = Point(3, 4)
    p2 = Point(0, 0)
    logger.info(f"[Demo] p1 = {p1}")
    logger.info(f"[Demo] p1 == Point(3, 4): {p1 == Point(3, 4)}")
    p1.distance_to(p2)

    # asdict 和 astuple：转换为字典和元组
    logger.info(f"[Demo] asdict(p1) = {asdict(p1)}")
    logger.info(f"[Demo] astuple(p1) = {astuple(p1)}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 2：field() 与默认工厂")
    logger.info("=" * 60)

    s1 = Student("Alice", 20, grades=[95.0, 88.5, 92.0])
    s2 = Student("Bob", 22)

    s1.average_grade
    s2.add_grade(85.0)
    s2.add_grade(90.0)
    s2.average_grade

    logger.info(f"[Demo] s1 = {s1}")
    logger.info(f"[Demo] s2 = {s2}")

    # 证明 grades 是独立的
    logger.info(f"[Demo] s1.grades is s2.grades: {s1.grades is s2.grades}")  # False

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 3：不可变 dataclass (frozen=True)")
    logger.info("=" * 60)

    red = Color(255, 0, 0)
    blue = Color(0, 0, 255)
    logger.info(f"[Demo] red = {red}, hex = {red.hex}")
    logger.info(f"[Demo] blue = {blue}, hex = {blue.hex}")

    # frozen 可以做字典键和集合元素
    palette: set[Color] = {red, blue, Color(255, 0, 0)}
    logger.info(f"[Demo] palette 大小: {len(palette)} (重复的被去除)")

    # 尝试修改会报错
    try:
        red.red = 128  # type: ignore
    except AttributeError as e:
        logger.info(f"[Demo] ❌ 修改 frozen 对象失败: {e}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 4：排序 (order=True)")
    logger.info("=" * 60)

    tasks: list[Priority] = [
        Priority(priority=1, name="低优先级任务"),
        Priority(priority=5, name="紧急任务"),
        Priority(priority=3, name="中优先级任务"),
    ]

    sorted_tasks: list[Priority] = sorted(tasks)
    for task in sorted_tasks:
        logger.info(f"[Demo] {task}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 5：dataclass 继承")
    logger.info("=" * 60)

    emp = Employee("Alice", 30, "工程部", 15000.0)
    logger.info(f"[Demo] {emp}")
    logger.info(f"[Demo] asdict: {asdict(emp)}")


if __name__ == "__main__":
    main()
