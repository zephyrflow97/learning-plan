"""
工具模块 — 辅助函数。

演示模块的 __all__ 和内部函数。
"""

__all__: list[str] = ["format_result", "validate_number"]


def format_result(value: float, precision: int = 2) -> str:
    """格式化数值结果。"""
    formatted: str = f"{value:.{precision}f}"
    print(f"[format_result] {value} -> '{formatted}'")
    return formatted


def validate_number(value: object) -> bool:
    """验证是否为有效数字。"""
    is_valid: bool = isinstance(value, (int, float)) and not isinstance(value, bool)
    print(f"[validate_number] {value!r} -> {is_valid}")
    return is_valid


def _internal_helper(text: str) -> str:
    """内部辅助函数（前缀下划线 = 私有）。"""
    return text.strip().lower()
