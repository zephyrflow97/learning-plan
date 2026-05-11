"""
泛型 (Generics) 示例。

演示 TypeVar、Generic 类、受约束的泛型：
- TypeVar 基础
- 受约束的 TypeVar (bound / constraints)
- Generic 类实现
- 多个 TypeVar 配合使用

运行: python 02-generics.py
检查: mypy 02-generics.py
"""

from typing import TypeVar, Generic, Sequence, Callable, Iterator

T = TypeVar("T")
U = TypeVar("U")
Number = TypeVar("Number", int, float)


# === 1. TypeVar 基础 ===

def first(items: Sequence[T]) -> T:
    """返回序列第一个元素，保留类型信息。"""
    if not items:
        raise ValueError("Empty sequence")
    result = items[0]
    print(f"[first] 序列类型={type(items).__name__}, 第一个={result}")
    return result


def last(items: Sequence[T]) -> T:
    """返回序列最后一个元素。"""
    if not items:
        raise ValueError("Empty sequence")
    result = items[-1]
    print(f"[last] 序列类型={type(items).__name__}, 最后一个={result}")
    return result


# === 2. 受约束的 TypeVar ===

def add(a: Number, b: Number) -> Number:
    """两数相加。Number 只能是 int 或 float。"""
    result = a + b
    print(f"[add] {a} + {b} = {result}")
    return result


def clamp(value: Number, min_val: Number, max_val: Number) -> Number:
    """将值限制在 [min_val, max_val] 范围内。"""
    result = max(min_val, min(max_val, value))
    print(f"[clamp] clamp({value}, {min_val}, {max_val}) = {result}")
    return result


# === 3. 多个 TypeVar ===

def map_items(func: Callable[[T], U], items: Sequence[T]) -> list[U]:
    """对序列每个元素应用函数，返回新列表。"""
    result: list[U] = [func(item) for item in items]
    print(f"[map_items] 输入 {len(items)} 个元素 -> 输出 {len(result)} 个元素")
    return result


def zip_with(
    func: Callable[[T, U], str],
    items_a: Sequence[T],
    items_b: Sequence[U],
) -> list[str]:
    """将两个序列逐元素组合。"""
    result: list[str] = [func(a, b) for a, b in zip(items_a, items_b)]
    print(f"[zip_with] 组合了 {len(result)} 对元素")
    return result


# === 4. Generic 类 ===

class Stack(Generic[T]):
    """类型安全的栈实现。"""

    def __init__(self) -> None:
        self._items: list[T] = []
        print(f"[Stack.__init__] 创建空栈")

    def push(self, item: T) -> None:
        self._items.append(item)
        print(f"[Stack.push] push({item!r}), size={len(self._items)}")

    def pop(self) -> T:
        if not self._items:
            raise IndexError("Stack is empty")
        item = self._items.pop()
        print(f"[Stack.pop] pop() -> {item!r}, size={len(self._items)}")
        return item

    def peek(self) -> T:
        if not self._items:
            raise IndexError("Stack is empty")
        return self._items[-1]

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def __len__(self) -> int:
        return len(self._items)

    def __repr__(self) -> str:
        return f"Stack({self._items!r})"


class Pair(Generic[T, U]):
    """一对不同类型的值。"""

    def __init__(self, first: T, second: U) -> None:
        self.first: T = first
        self.second: U = second
        print(f"[Pair] ({first!r}, {second!r})")

    def swap(self) -> "Pair[U, T]":
        """交换两个值，类型也跟着交换。"""
        print(f"[Pair.swap] ({self.first!r}, {self.second!r}) -> ({self.second!r}, {self.first!r})")
        return Pair(self.second, self.first)

    def map_first(self, func: Callable[[T], T]) -> "Pair[T, U]":
        """对第一个值应用函数。"""
        new_first = func(self.first)
        print(f"[Pair.map_first] {self.first!r} -> {new_first!r}")
        return Pair(new_first, self.second)

    def __repr__(self) -> str:
        return f"Pair({self.first!r}, {self.second!r})"


# === 主程序 ===

if __name__ == "__main__":
    print("=" * 60)
    print("泛型 (Generics) 示例")
    print("=" * 60)

    # TypeVar 基础
    name: str = first(["Alice", "Bob", "Charlie"])
    number: int = first([10, 20, 30])
    print(f"  name={name}, number={number}")

    print()
    # 受约束的 TypeVar
    add(10, 20)
    add(1.5, 2.5)
    clamp(15, 0, 10)
    clamp(3.14, 0.0, 100.0)

    print()
    # 多个 TypeVar
    lengths: list[int] = map_items(len, ["hello", "world", "!"])
    print(f"  lengths={lengths}")

    uppers: list[str] = map_items(str.upper, ["hello", "world"])
    print(f"  uppers={uppers}")

    combined = zip_with(
        lambda name, age: f"{name} is {age}",
        ["Alice", "Bob"],
        [30, 25],
    )
    print(f"  combined={combined}")

    print()
    # Generic 类
    int_stack: Stack[int] = Stack()
    int_stack.push(1)
    int_stack.push(2)
    int_stack.push(3)
    top: int = int_stack.pop()
    print(f"  top={top}, stack={int_stack}")

    print()
    pair: Pair[str, int] = Pair("Alice", 30)
    swapped: Pair[int, str] = pair.swap()
    print(f"  swapped={swapped}")
