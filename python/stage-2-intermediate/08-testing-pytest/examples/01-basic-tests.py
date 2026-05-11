"""
pytest 基础测试示例。

演示基本的测试结构、断言和异常测试。

运行: pytest 01-basic-tests.py -v
"""

import pytest
from typing import Optional


# === 被测代码 ===

def add(a: int, b: int) -> int:
    """两数相加。"""
    result: int = a + b
    print(f"[add] {a} + {b} = {result}")
    return result


def divide(a: float, b: float) -> float:
    """除法。除数为零时抛异常。"""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    result: float = a / b
    print(f"[divide] {a} / {b} = {result}")
    return result


def find_max(numbers: list[int]) -> Optional[int]:
    """找最大值。空列表返回 None。"""
    if not numbers:
        print("[find_max] 空列表")
        return None
    result: int = max(numbers)
    print(f"[find_max] {numbers} -> max={result}")
    return result


def is_valid_email(email: str) -> bool:
    """简单的邮箱验证。"""
    has_at: bool = "@" in email
    has_dot_after_at: bool = "." in email.split("@")[-1] if has_at else False
    is_valid: bool = has_at and has_dot_after_at and len(email) > 5
    print(f"[is_valid_email] '{email}' -> {is_valid}")
    return is_valid


# === 基础断言测试 ===

def test_add_positive_numbers() -> None:
    """测试正数加法。"""
    assert add(2, 3) == 5
    assert add(100, 200) == 300


def test_add_negative_numbers() -> None:
    """测试负数加法。"""
    assert add(-1, -1) == -2
    assert add(-5, 3) == -2


def test_add_zero() -> None:
    """测试加零。"""
    assert add(0, 0) == 0
    assert add(42, 0) == 42


# === 异常测试 ===

def test_divide_normal() -> None:
    """测试正常除法。"""
    assert divide(10, 2) == 5.0
    assert divide(7, 2) == 3.5


def test_divide_by_zero_raises() -> None:
    """测试除零异常。"""
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)


# === Optional 返回值测试 ===

def test_find_max_normal() -> None:
    """测试正常列表。"""
    assert find_max([1, 3, 2]) == 3
    assert find_max([5]) == 5
    assert find_max([-1, -3, -2]) == -1


def test_find_max_empty() -> None:
    """测试空列表返回 None。"""
    assert find_max([]) is None


# === 布尔返回值测试 ===

def test_valid_emails() -> None:
    """测试有效邮箱。"""
    assert is_valid_email("user@example.com") is True
    assert is_valid_email("test@test.org") is True


def test_invalid_emails() -> None:
    """测试无效邮箱。"""
    assert is_valid_email("invalid") is False
    assert is_valid_email("no-at-sign.com") is False
    assert is_valid_email("@.") is False


# === 浮点数近似比较 ===

def test_float_precision() -> None:
    """浮点数需要用 pytest.approx。"""
    assert 0.1 + 0.2 == pytest.approx(0.3)
    assert divide(1, 3) == pytest.approx(0.333, abs=0.001)


# === 主程序（直接运行时的演示） ===

if __name__ == "__main__":
    print("=" * 50)
    print("直接运行演示（请用 pytest 运行测试）")
    print("=" * 50)
    add(2, 3)
    divide(10, 3)
    find_max([4, 1, 7, 2])
    is_valid_email("test@example.com")
    print("\n运行测试请使用: pytest 01-basic-tests.py -v")
