"""
核心模块 — 包含主要业务逻辑。

演示模块级别的代码组织。
"""

from typing import Final

PI: Final[float] = 3.14159265358979


class Calculator:
    """简单计算器。演示在包中定义类。"""

    def __init__(self, name: str = "default") -> None:
        self.name: str = name
        self.history: list[str] = []
        print(f"[Calculator] 创建计算器 '{name}'")

    def add(self, a: float, b: float) -> float:
        result: float = a + b
        self.history.append(f"{a} + {b} = {result}")
        print(f"[Calculator.add] {a} + {b} = {result}")
        return result

    def multiply(self, a: float, b: float) -> float:
        result: float = a * b
        self.history.append(f"{a} * {b} = {result}")
        print(f"[Calculator.multiply] {a} * {b} = {result}")
        return result

    def show_history(self) -> None:
        print(f"[Calculator.history] {self.name}:")
        for entry in self.history:
            print(f"  - {entry}")
