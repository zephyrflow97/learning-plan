"""
容器类型模拟 — 展示 __getitem__, __setitem__, __contains__, __len__, __iter__
包含只读容器、可变容器、以及自定义 __missing__ 的字典
"""

import logging
from typing import TypeVar, Generic, Iterator, Union, overload

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("ContainerEmulation")

T = TypeVar('T')


# ============================================================
# 1. 只读容器 — ImmutableList
# ============================================================

class ImmutableList(Generic[T]):
    """
    不可变列表 — 只读容器协议演示
    实现: __len__, __getitem__, __contains__, __iter__, __reversed__
    """

    def __init__(self, *items: T) -> None:
        self._data: tuple[T, ...] = tuple(items)
        logger.debug("创建不可变列表，%d 个元素", len(self._data))

    def __len__(self) -> int:
        """✅ len(obj) → 元素数量"""
        return len(self._data)

    @overload
    def __getitem__(self, index: int) -> T: ...
    @overload
    def __getitem__(self, index: slice) -> 'ImmutableList[T]': ...

    def __getitem__(self, index: Union[int, slice]) -> Union[T, 'ImmutableList[T]']:
        """✅ obj[index] → 支持整数索引和切片"""
        if isinstance(index, slice):
            logger.debug("切片访问: %s", index)
            return ImmutableList(*self._data[index])
        logger.debug("索引访问: [%d]", index)
        return self._data[index]

    def __contains__(self, item: T) -> bool:
        """✅ item in obj → 成员检查"""
        logger.debug("检查 %r 是否在列表中", item)
        return item in self._data

    def __iter__(self) -> Iterator[T]:
        """✅ for item in obj → 迭代"""
        logger.debug("开始迭代")
        return iter(self._data)

    def __reversed__(self) -> Iterator[T]:
        """✅ reversed(obj) → 反向迭代"""
        logger.debug("反向迭代")
        return reversed(self._data)

    def __repr__(self) -> str:
        items_str = ', '.join(repr(x) for x in self._data)
        return f"ImmutableList({items_str})"


# ============================================================
# 2. 类型安全的可变容器 — TypedList
# ============================================================

class TypedList(Generic[T]):
    """
    类型化可变列表 — 完整容器协议
    只允许添加指定类型的元素
    """

    def __init__(self, item_type: type, *items: T) -> None:
        self._item_type = item_type
        self._data: list[T] = []
        for item in items:
            self._validate(item)
            self._data.append(item)
        logger.debug("创建 %s 类型列表，%d 个元素", item_type.__name__, len(self._data))

    def _validate(self, item: T) -> None:
        """验证元素类型"""
        if not isinstance(item, self._item_type):
            raise TypeError(
                f"期望 {self._item_type.__name__}，"
                f"得到 {type(item).__name__}: {item!r}"
            )

    def __len__(self) -> int:
        return len(self._data)

    def __getitem__(self, index: int) -> T:
        return self._data[index]

    def __setitem__(self, index: int, value: T) -> None:
        """✅ obj[index] = value → 类型检查后设置"""
        self._validate(value)
        logger.debug("设置 [%d] = %r", index, value)
        self._data[index] = value

    def __delitem__(self, index: int) -> None:
        """✅ del obj[index] → 删除元素"""
        logger.debug("删除 [%d]", index)
        del self._data[index]

    def __contains__(self, item: T) -> bool:
        return item in self._data

    def __iter__(self) -> Iterator[T]:
        return iter(self._data)

    def append(self, item: T) -> None:
        """添加元素（类型检查）"""
        self._validate(item)
        self._data.append(item)

    def __repr__(self) -> str:
        return f"TypedList[{self._item_type.__name__}]({self._data})"


# ============================================================
# 3. 自定义字典 — 带有 __missing__ 的计数器
# ============================================================

class CounterDict(dict):
    """
    自动计数字典 — 展示 __missing__
    访问不存在的 key 时自动创建默认值 0
    """

    def __missing__(self, key: str) -> int:
        """✅ 当 key 不存在时自动创建"""
        logger.debug("键 %r 不存在，初始化为 0", key)
        self[key] = 0
        return 0

    def increment(self, key: str, amount: int = 1) -> None:
        """增加计数"""
        self[key] += amount
        logger.debug("计数 %r → %d", key, self[key])


# ============================================================
# 4. 二维网格容器 — 支持 grid[row, col] 语法
# ============================================================

class Grid:
    """
    二维网格 — 展示多维索引 (__getitem__ 接收 tuple)
    """

    def __init__(self, rows: int, cols: int, default: float = 0.0) -> None:
        self._rows = rows
        self._cols = cols
        self._data = [[default] * cols for _ in range(rows)]
        logger.debug("创建 %dx%d 网格", rows, cols)

    def _validate_index(self, row: int, col: int) -> None:
        if not (0 <= row < self._rows and 0 <= col < self._cols):
            raise IndexError(f"索引 ({row}, {col}) 超出范围 ({self._rows}x{self._cols})")

    def __getitem__(self, index: tuple[int, int]) -> float:
        """✅ grid[row, col] → Python 将 row, col 打包为 tuple"""
        row, col = index
        self._validate_index(row, col)
        return self._data[row][col]

    def __setitem__(self, index: tuple[int, int], value: float) -> None:
        """✅ grid[row, col] = value"""
        row, col = index
        self._validate_index(row, col)
        self._data[row][col] = value

    def __len__(self) -> int:
        """总元素数"""
        return self._rows * self._cols

    def __iter__(self) -> Iterator[list[float]]:
        """逐行迭代"""
        return iter(self._data)

    def __repr__(self) -> str:
        rows_str = '\n  '.join(str(row) for row in self._data)
        return f"Grid({self._rows}x{self._cols}):\n  {rows_str}"


# ============================================================
# 演示
# ============================================================

def main() -> None:
    print("=" * 60)
    print("容器类型模拟演示")
    print("=" * 60)

    # --- 不可变列表 ---
    print("\n--- ImmutableList ---")
    il = ImmutableList(1, 2, 3, 4, 5)
    print(f"长度: {len(il)}")
    print(f"il[0] = {il[0]}")
    print(f"il[-1] = {il[-1]}")
    print(f"il[1:3] = {il[1:3]}")
    print(f"3 in il: {3 in il}")
    print(f"迭代: {list(il)}")
    print(f"反向: {list(reversed(il))}")

    # --- 类型列表 ---
    print("\n--- TypedList ---")
    tl = TypedList(int, 1, 2, 3)
    tl.append(4)
    print(f"tl = {tl}")
    tl[0] = 10
    print(f"tl[0] = 10 → {tl}")
    del tl[0]
    print(f"del tl[0] → {tl}")

    try:
        tl.append("not an int")  # ❌ TypeError
    except TypeError as e:
        print(f"类型错误（预期）: {e}")

    # --- 计数字典 ---
    print("\n--- CounterDict ---")
    counter = CounterDict()
    counter.increment("apple")
    counter.increment("banana")
    counter.increment("apple")
    counter.increment("apple")
    print(f"计数结果: {dict(counter)}")
    print(f"访问不存在的 key: orange = {counter['orange']}")

    # --- 二维网格 ---
    print("\n--- Grid ---")
    grid = Grid(3, 3)
    grid[0, 0] = 1.0
    grid[1, 1] = 5.0
    grid[2, 2] = 9.0
    print(grid)
    print(f"grid[1, 1] = {grid[1, 1]}")
    print(f"总元素数: {len(grid)}")

    try:
        _ = grid[5, 5]  # ❌ IndexError
    except IndexError as e:
        print(f"索引错误（预期）: {e}")


if __name__ == '__main__':
    main()
