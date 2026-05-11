"""
包使用示例 — 演示如何导入和使用自定义包。

运行: cd 02-package-structure && python main.py
"""

# 从包中导入（因为 __init__.py 做了导入提升）
from mypackage import Calculator, format_result

# 也可以直接从子模块导入
from mypackage.utils import validate_number


def main() -> None:
    """主程序。"""
    print("=" * 50)
    print("包结构示例")
    print("=" * 50)

    # 使用 Calculator
    calc = Calculator("demo")
    result1: float = calc.add(10, 20)
    result2: float = calc.multiply(3, 7)
    calc.show_history()

    # 使用工具函数
    print()
    formatted: str = format_result(result1)
    print(f"  格式化结果: {formatted}")

    validate_number(42)
    validate_number("hello")
    validate_number(3.14)


if __name__ == "__main__":
    main()
