"""
第 2 章 示例 01：__repr__ 与 __str__

演示两种字符串表示方法的区别和最佳实践。
"""

from dataclasses import dataclass
from datetime import datetime


# === 基础演示 ===

class Color:
    """颜色类——__repr__ vs __str__ 的经典示例。"""

    def __init__(self, red: int, green: int, blue: int) -> None:
        self.red = red
        self.green = green
        self.blue = blue

    def __repr__(self) -> str:
        """给开发者看：精确、可用于 eval() 重建。"""
        return f"Color(red={self.red}, green={self.green}, blue={self.blue})"

    def __str__(self) -> str:
        """给用户看：友好的十六进制格式。"""
        return f"#{self.red:02x}{self.green:02x}{self.blue:02x}"


# === 使用场景对比 ===

print("=" * 60)
print("__repr__ vs __str__ 场景对比")
print("=" * 60)

red = Color(255, 0, 0)

# repr(): 给开发者
print(f"[repr]    repr(red)    = {repr(red)}")
# str(): 给用户
print(f"[str]     str(red)     = {str(red)}")
# print() 使用 __str__
print(f"[print]   print(red)   = {red}")
# f-string 默认使用 __str__
print(f"[f-str]   f'{{red}}'     = {red}")
# f-string 强制 __repr__
print(f"[f-str!r] f'{{red!r}}'   = {red!r}")

# 容器中总是使用 __repr__
colors: list[Color] = [Color(255, 0, 0), Color(0, 128, 0), Color(0, 0, 255)]
print(f"[容器]    {colors}")


# === 只实现 __repr__ 时的回退行为 ===

class OnlyRepr:
    """只实现了 __repr__。"""

    def __init__(self, value: int) -> None:
        self.value = value

    def __repr__(self) -> str:
        return f"OnlyRepr(value={self.value})"


obj = OnlyRepr(42)
print(f"\n[回退] repr: {repr(obj)}")
print(f"[回退] str:  {str(obj)}")   # 回退到 __repr__
print(f"[回退] print:", obj)         # 回退到 __repr__


# === dataclass 自动生成 __repr__ ===

@dataclass
class Product:
    """dataclass 自动生成 __repr__（但不生成 __str__）。"""
    name: str
    price: float
    in_stock: bool = True


product = Product("Python Book", 99.9)
print(f"\n[dataclass] repr: {product!r}")
print(f"[dataclass] str:  {product}")  # 没有 __str__，回退到 __repr__


# === 实际项目中的最佳实践 ===

@dataclass
class APIResponse:
    """API 响应——展示实际项目中的 __repr__ 和 __str__。"""
    status_code: int
    body: str
    timestamp: datetime

    def __str__(self) -> str:
        """用户友好的摘要。"""
        status: str = "✅ OK" if self.status_code == 200 else f"❌ {self.status_code}"
        body_preview: str = self.body[:50] + "..." if len(self.body) > 50 else self.body
        return f"{status} | {body_preview} | {self.timestamp:%H:%M:%S}"

    # __repr__ 由 dataclass 自动生成


response = APIResponse(200, "Hello, World!", datetime.now())
print(f"\n[API] repr: {response!r}")
print(f"[API] str:  {response}")

print("\n✅ 01-repr-str.py 运行完成")
