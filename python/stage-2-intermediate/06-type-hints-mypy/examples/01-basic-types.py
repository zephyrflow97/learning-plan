"""
基础类型标注示例。

演示 Python 类型系统的基础用法：
- 简单类型标注
- 容器类型
- Optional 与 Union
- 类型收窄 (Type Narrowing)

运行: python 01-basic-types.py
检查: mypy 01-basic-types.py
"""

from typing import Optional, Union


# === 1. 简单类型标注 ===

def greet(name: str, times: int = 1) -> str:
    """生成问候语。"""
    result: str = (f"Hello, {name}! " * times).strip()
    print(f"[greet] result='{result}'")
    return result


def calculate_bmi(weight_kg: float, height_m: float) -> float:
    """计算 BMI。"""
    bmi: float = weight_kg / (height_m ** 2)
    print(f"[calculate_bmi] weight={weight_kg}kg, height={height_m}m, BMI={bmi:.1f}")
    return bmi


# === 2. 容器类型 (Python 3.9+ 语法) ===

def average(numbers: list[float]) -> float:
    """计算平均值。"""
    if not numbers:
        print("[average] 空列表，返回 0.0")
        return 0.0
    result: float = sum(numbers) / len(numbers)
    print(f"[average] numbers={numbers}, avg={result:.2f}")
    return result


def word_count(text: str) -> dict[str, int]:
    """统计单词频率。"""
    counts: dict[str, int] = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    print(f"[word_count] 统计了 {len(counts)} 个不同的单词")
    return counts


def unique_chars(text: str) -> set[str]:
    """提取唯一字符。"""
    chars: set[str] = set(text.replace(" ", ""))
    print(f"[unique_chars] '{text}' -> {len(chars)} 个唯一字符")
    return chars


# === 3. Optional 与 Union ===

def find_user(user_id: int) -> Optional[str]:
    """模拟查找用户。找不到返回 None。"""
    users: dict[int, str] = {1: "Alice", 2: "Bob", 3: "Charlie"}
    result: Optional[str] = users.get(user_id)
    print(f"[find_user] user_id={user_id} -> {result}")
    return result


def parse_number(text: str) -> Union[int, float, None]:
    """尝试将字符串解析为数字。"""
    try:
        result: int = int(text)
        print(f"[parse_number] '{text}' -> int({result})")
        return result
    except ValueError:
        try:
            result_f: float = float(text)
            print(f"[parse_number] '{text}' -> float({result_f})")
            return result_f
        except ValueError:
            print(f"[parse_number] '{text}' -> None (无法解析)")
            return None


# === 4. 类型收窄 ===

def safe_greet(user_id: int) -> str:
    """安全的问候函数，处理用户不存在的情况。"""
    name: Optional[str] = find_user(user_id)
    if name is None:
        # 此处 mypy 知道 name 是 None
        print(f"[safe_greet] 用户 {user_id} 不存在")
        return "Hello, stranger!"
    # 此处 mypy 知道 name 是 str（类型收窄）
    greeting: str = f"Hello, {name}!"
    print(f"[safe_greet] {greeting}")
    return greeting


def process_value(value: Union[str, int, list[str]]) -> str:
    """根据值类型做不同处理。"""
    if isinstance(value, str):
        # mypy 收窄为 str
        result = value.upper()
    elif isinstance(value, int):
        # mypy 收窄为 int
        result = str(value * 2)
    else:
        # mypy 收窄为 list[str]
        result = ", ".join(value)
    print(f"[process_value] {type(value).__name__}({value}) -> '{result}'")
    return result


# === 主程序 ===

if __name__ == "__main__":
    print("=" * 60)
    print("基础类型标注示例")
    print("=" * 60)

    # 简单类型
    greet("World")
    greet("Python", 3)
    calculate_bmi(70.0, 1.75)

    print()
    # 容器类型
    average([85.5, 90.0, 78.5, 92.0])
    word_count("the quick brown fox jumps over the lazy dog")
    unique_chars("hello world")

    print()
    # Optional / Union
    safe_greet(1)
    safe_greet(99)
    parse_number("42")
    parse_number("3.14")
    parse_number("hello")

    print()
    # 类型收窄
    process_value("hello")
    process_value(21)
    process_value(["a", "b", "c"])
