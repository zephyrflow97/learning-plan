"""
pytest 参数化测试示例。

演示 @pytest.mark.parametrize 的各种用法：
- 基础参数化
- 多参数组合
- 参数化 ID
- 参数化 fixture
- 条件跳过

运行: pytest 03-parametrize.py -v
"""

import pytest
import math
from typing import Any


# === 被测函数 ===

def fizzbuzz(n: int) -> str:
    """经典 FizzBuzz。"""
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)


def celsius_to_fahrenheit(celsius: float) -> float:
    """摄氏度转华氏度。"""
    result: float = celsius * 9 / 5 + 32
    print(f"[celsius_to_fahrenheit] {celsius}°C -> {result}°F")
    return result


def classify_age(age: int) -> str:
    """年龄分类。"""
    if age < 0:
        raise ValueError("Age cannot be negative")
    if age < 13:
        return "child"
    if age < 18:
        return "teenager"
    if age < 65:
        return "adult"
    return "senior"


def safe_sqrt(x: float) -> float | None:
    """安全的平方根。负数返回 None。"""
    if x < 0:
        print(f"[safe_sqrt] {x} < 0, 返回 None")
        return None
    result: float = math.sqrt(x)
    print(f"[safe_sqrt] sqrt({x}) = {result}")
    return result


# === 1. 基础参数化 ===

@pytest.mark.parametrize("n, expected", [
    (1, "1"),
    (3, "Fizz"),
    (5, "Buzz"),
    (6, "Fizz"),
    (10, "Buzz"),
    (15, "FizzBuzz"),
    (30, "FizzBuzz"),
    (7, "7"),
])
def test_fizzbuzz(n: int, expected: str) -> None:
    """参数化 FizzBuzz 测试。"""
    assert fizzbuzz(n) == expected


# === 2. 带浮点数的参数化 ===

@pytest.mark.parametrize("celsius, fahrenheit", [
    (0, 32.0),
    (100, 212.0),
    (-40, -40.0),
    (37, 98.6),
])
def test_celsius_to_fahrenheit(celsius: float, fahrenheit: float) -> None:
    """温度转换参数化测试。"""
    assert celsius_to_fahrenheit(celsius) == pytest.approx(fahrenheit, abs=0.1)


# === 3. 带自定义 ID 的参数化 ===

@pytest.mark.parametrize("age, category", [
    pytest.param(5, "child", id="five-year-old"),
    pytest.param(12, "child", id="twelve-year-old"),
    pytest.param(15, "teenager", id="fifteen-year-old"),
    pytest.param(25, "adult", id="twenty-five-year-old"),
    pytest.param(70, "senior", id="seventy-year-old"),
])
def test_classify_age(age: int, category: str) -> None:
    """带 ID 的参数化，让输出更可读。"""
    assert classify_age(age) == category


# === 4. 参数化异常测试 ===

@pytest.mark.parametrize("age", [-1, -100])
def test_classify_age_negative_raises(age: int) -> None:
    """参数化异常测试。"""
    with pytest.raises(ValueError, match="cannot be negative"):
        classify_age(age)


# === 5. 多重参数化（笛卡尔积） ===

@pytest.mark.parametrize("x", [0, 1, 4, 9, 16, 25])
def test_safe_sqrt_positive(x: float) -> None:
    """正数的平方根。"""
    result = safe_sqrt(x)
    assert result is not None
    assert result == pytest.approx(math.sqrt(x))


@pytest.mark.parametrize("x", [-1, -4, -100])
def test_safe_sqrt_negative(x: float) -> None:
    """负数返回 None。"""
    assert safe_sqrt(x) is None


# === 6. 参数化 fixture ===

@pytest.fixture(params=[
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 16},
    {"name": "Charlie", "age": 70},
])
def user_data(request: pytest.FixtureRequest) -> dict[str, Any]:
    """参数化 fixture：每组数据都会运行一次测试。"""
    data: dict[str, Any] = request.param
    print(f"[fixture:user_data] {data}")
    return data


def test_user_has_name(user_data: dict[str, Any]) -> None:
    """测试每个用户都有名字。"""
    assert "name" in user_data
    assert len(user_data["name"]) > 0
    print(f"[test] {user_data['name']} has a name ✓")


def test_user_age_positive(user_data: dict[str, Any]) -> None:
    """测试每个用户年龄为正。"""
    assert user_data["age"] > 0
    print(f"[test] {user_data['name']} age={user_data['age']} > 0 ✓")


# === 7. 条件参数化 ===

@pytest.mark.parametrize("value, expected", [
    (0, 0),
    (1, 1),
    pytest.param(1e308, float("inf"), marks=pytest.mark.skip(reason="极端值暂不测试")),
])
def test_double(value: float, expected: float) -> None:
    """可以对特定参数设置标记。"""
    result: float = value * 2
    print(f"[test_double] {value} * 2 = {result}")
    # 这里只是演示，实际不会溢出
