"""
第 2 章 示例 02：__eq__、__hash__ 与 total_ordering

演示相等性判定、可哈希契约、以及比较方法的最佳实践。
"""

from dataclasses import dataclass
from functools import total_ordering


# === 1. __eq__ 基础 ===

print("=" * 60)
print("1. __eq__ 基础")
print("=" * 60)


class Point:
    """坐标点——__eq__ 的标准实现。"""

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"Point(x={self.x}, y={self.y})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Point):
            return NotImplemented  # ✅ 正确：让 Python 尝试反向比较
        return self.x == other.x and self.y == other.y


p1 = Point(1, 2)
p2 = Point(1, 2)
p3 = Point(3, 4)

print(f"[__eq__] p1 == p2: {p1 == p2}")      # True
print(f"[__eq__] p1 == p3: {p1 == p3}")      # False
print(f"[__eq__] p1 is p2: {p1 is p2}")      # False（不同对象）
print(f"[__eq__] p1 == '?': {p1 == '?'}")    # False


# === 2. __hash__ 契约 ===

print(f"\n{'=' * 60}")
print("2. __hash__ 契约")
print(f"{'=' * 60}")


class Color:
    """颜色——正确实现 __eq__ + __hash__。"""

    def __init__(self, red: int, green: int, blue: int) -> None:
        self.red = red
        self.green = green
        self.blue = blue

    def __repr__(self) -> str:
        return f"Color({self.red}, {self.green}, {self.blue})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Color):
            return NotImplemented
        return (self.red, self.green, self.blue) == (other.red, other.green, other.blue)

    def __hash__(self) -> int:
        return hash((self.red, self.green, self.blue))


red1 = Color(255, 0, 0)
red2 = Color(255, 0, 0)
blue = Color(0, 0, 255)

# 可以用作 dict key
color_names: dict[Color, str] = {red1: "红色", blue: "蓝色"}
print(f"[hash] color_names[red2] = {color_names[red2]}")  # "红色"

# 可以放入 set
unique: set[Color] = {red1, red2, blue}
print(f"[hash] unique colors = {len(unique)}")  # 2

# 哈希契约验证
print(f"[hash] red1 == red2: {red1 == red2}")  # True
print(f"[hash] hash(red1) == hash(red2): {hash(red1) == hash(red2)}")  # True


# === 3. 重写 __eq__ 但忘了 __hash__ 的后果 ===

print(f"\n{'=' * 60}")
print("3. 陷阱：忘记 __hash__")
print(f"{'=' * 60}")


class BadPoint:
    """❌ 只重写了 __eq__，没重写 __hash__。"""

    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, BadPoint):
            return NotImplemented
        return self.x == other.x and self.y == other.y


bp = BadPoint(1, 2)
print(f"[陷阱] BadPoint.__hash__ is None: {BadPoint.__hash__ is None}")

try:
    s: set[BadPoint] = {bp}  # ❌ TypeError
except TypeError as e:
    print(f"[陷阱] 放入 set 失败: {e}")


# === 4. frozen dataclass 自动处理 ===

print(f"\n{'=' * 60}")
print("4. frozen dataclass 的福音")
print(f"{'=' * 60}")


@dataclass(frozen=True)
class Coordinate:
    """不可变坐标——frozen=True 自动生成 __eq__ + __hash__。"""
    lat: float
    lon: float


c1 = Coordinate(39.9042, 116.4074)
c2 = Coordinate(39.9042, 116.4074)
c3 = Coordinate(35.6762, 139.6503)

print(f"[frozen] c1 == c2: {c1 == c2}")          # True
print(f"[frozen] hash(c1) == hash(c2): {hash(c1) == hash(c2)}")  # True
print(f"[frozen] {{c1, c2, c3}}: {len({c1, c2, c3})} 个唯一坐标")  # 2


# === 5. total_ordering ===

print(f"\n{'=' * 60}")
print("5. total_ordering 减少样板代码")
print(f"{'=' * 60}")


@total_ordering
class Version:
    """版本号——用 total_ordering 实现全部比较方法。"""

    def __init__(self, major: int, minor: int, patch: int) -> None:
        self.major = major
        self.minor = minor
        self.patch = patch

    def __repr__(self) -> str:
        return f"Version({self.major}.{self.minor}.{self.patch})"

    def __str__(self) -> str:
        return f"v{self.major}.{self.minor}.{self.patch}"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) == (other.major, other.minor, other.patch)

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) < (other.major, other.minor, other.patch)

    def __hash__(self) -> int:
        return hash((self.major, self.minor, self.patch))


v1 = Version(1, 0, 0)
v2 = Version(2, 1, 0)
v3 = Version(2, 1, 3)

print(f"[ordering] {v1} < {v2}: {v1 < v2}")     # True
print(f"[ordering] {v2} <= {v3}: {v2 <= v3}")    # True
print(f"[ordering] {v3} > {v1}: {v3 > v1}")     # True
print(f"[ordering] {v2} >= {v2}: {v2 >= v2}")    # True

# 排序
versions: list[Version] = [v3, v1, v2]
print(f"[ordering] sorted: {sorted(versions)}")  # [v1.0.0, v2.1.0, v2.1.3]

print("\n✅ 02-eq-hash.py 运行完成")
