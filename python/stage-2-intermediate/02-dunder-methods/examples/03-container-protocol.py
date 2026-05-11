"""
第 2 章 示例 03：容器协议

演示 __getitem__、__len__、__contains__、__iter__ 的实现。
"""

from typing import Iterator, overload


# === 1. 基础容器：__getitem__ + __len__ ===

print("=" * 60)
print("1. 基础容器：__getitem__ + __len__")
print("=" * 60)


class Fibonacci:
    """斐波那契数列容器——支持索引访问和迭代。"""

    def __init__(self, max_count: int) -> None:
        self.max_count = max_count
        self._cache: list[int] = []
        self._generate()

    def _generate(self) -> None:
        """预计算斐波那契数列。"""
        a: int = 0
        b: int = 1
        for _ in range(self.max_count):
            self._cache.append(a)
            a, b = b, a + b

    def __repr__(self) -> str:
        return f"Fibonacci(max_count={self.max_count})"

    def __len__(self) -> int:
        print(f"  [Fibonacci.__len__] -> {self.max_count}")
        return self.max_count

    @overload
    def __getitem__(self, index: int) -> int: ...
    @overload
    def __getitem__(self, index: slice) -> list[int]: ...

    def __getitem__(self, index: int | slice) -> int | list[int]:
        """支持索引和切片。"""
        result = self._cache[index]
        print(f"  [Fibonacci.__getitem__] index={index} -> {result}")
        return result

    def __contains__(self, value: object) -> bool:
        """高效查找——利用已排序的特性。"""
        found: bool = value in self._cache
        print(f"  [Fibonacci.__contains__] {value} -> {found}")
        return found


fib = Fibonacci(10)

print(f"[Fib] fib[0] = {fib[0]}")       # 0
print(f"[Fib] fib[5] = {fib[5]}")       # 5
print(f"[Fib] fib[-1] = {fib[-1]}")     # 34
print(f"[Fib] fib[2:6] = {fib[2:6]}")   # [1, 2, 3, 5]
print(f"[Fib] len(fib) = {len(fib)}")    # 10
print(f"[Fib] 8 in fib = {8 in fib}")    # True
print(f"[Fib] 9 in fib = {9 in fib}")    # False


# === 2. 完整可写容器 ===

print(f"\n{'=' * 60}")
print("2. 完整可写容器：__setitem__ + __delitem__")
print(f"{'=' * 60}")


class TypedList:
    """类型安全的列表——只接受指定类型的元素。"""

    def __init__(self, element_type: type, items: list[object] | None = None) -> None:
        self._type = element_type
        self._items: list[object] = []
        if items:
            for item in items:
                self._validate(item)
                self._items.append(item)

    def _validate(self, value: object) -> None:
        if not isinstance(value, self._type):
            raise TypeError(
                f"期望 {self._type.__name__}，得到 {type(value).__name__}"
            )

    def __repr__(self) -> str:
        return f"TypedList({self._type.__name__}, {self._items})"

    def __len__(self) -> int:
        return len(self._items)

    def __getitem__(self, index: int) -> object:
        return self._items[index]

    def __setitem__(self, index: int, value: object) -> None:
        self._validate(value)
        print(f"  [TypedList.__setitem__] [{index}] = {value}")
        self._items[index] = value

    def __delitem__(self, index: int) -> None:
        print(f"  [TypedList.__delitem__] 删除 [{index}] = {self._items[index]}")
        del self._items[index]

    def __contains__(self, value: object) -> bool:
        return value in self._items

    def __iter__(self) -> Iterator[object]:
        return iter(self._items)

    def append(self, value: object) -> None:
        self._validate(value)
        self._items.append(value)
        print(f"  [TypedList.append] {value}")


# ✅ 正确用法
int_list = TypedList(int, [1, 2, 3])
print(f"[TypedList] {int_list}")

int_list[0] = 10
int_list.append(4)
del int_list[1]
print(f"[TypedList] 修改后: {int_list}")

# ❌ 类型错误
try:
    int_list.append("hello")  # type: ignore[arg-type]
except TypeError as e:
    print(f"[TypedList] 类型错误: {e}")

# 迭代
print("[TypedList] 迭代:")
for item in int_list:
    print(f"  {item}")


# === 3. 字典式容器 ===

print(f"\n{'=' * 60}")
print("3. 字典式容器：键值访问")
print(f"{'=' * 60}")


class Config:
    """配置对象——支持 config['key'] 和 config.key 两种访问方式。"""

    def __init__(self, **kwargs: object) -> None:
        self._data: dict[str, object] = dict(kwargs)

    def __repr__(self) -> str:
        items: str = ", ".join(f"{k}={v!r}" for k, v in self._data.items())
        return f"Config({items})"

    def __getitem__(self, key: str) -> object:
        print(f"  [Config.__getitem__] key={key!r}")
        return self._data[key]

    def __setitem__(self, key: str, value: object) -> None:
        print(f"  [Config.__setitem__] {key!r} = {value!r}")
        self._data[key] = value

    def __delitem__(self, key: str) -> None:
        print(f"  [Config.__delitem__] 删除 {key!r}")
        del self._data[key]

    def __contains__(self, key: object) -> bool:
        return key in self._data

    def __len__(self) -> int:
        return len(self._data)

    def __iter__(self) -> Iterator[str]:
        return iter(self._data)

    def __getattr__(self, name: str) -> object:
        """支持 config.key 访问。"""
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"Config 没有属性 {name!r}")


config = Config(debug=True, port=8080, host="localhost")
print(f"[Config] {config}")
print(f"[Config] config['port'] = {config['port']}")
print(f"[Config] config.host = {config.host}")  # type: ignore[attr-defined]
print(f"[Config] 'debug' in config: {'debug' in config}")
print(f"[Config] len(config) = {len(config)}")

config["timeout"] = 30
print(f"[Config] keys:")
for key in config:
    print(f"  {key}")


# === 4. __iter__ vs __getitem__ 的迭代行为 ===

print(f"\n{'=' * 60}")
print("4. __iter__ vs __getitem__ 的迭代行为")
print(f"{'=' * 60}")


class OldStyleIterable:
    """旧风格：只有 __getitem__，Python 会从 0 开始自动索引迭代。"""

    def __init__(self, data: list[str]) -> None:
        self._data = data

    def __getitem__(self, index: int) -> str:
        print(f"  [OldStyle.__getitem__] index={index}")
        return self._data[index]  # IndexError 自动终止迭代


class NewStyleIterable:
    """新风格：显式 __iter__ + __next__，更明确。"""

    def __init__(self, data: list[str]) -> None:
        self._data = data

    def __iter__(self) -> Iterator[str]:
        print("  [NewStyle.__iter__] 创建迭代器")
        return iter(self._data)


old = OldStyleIterable(["A", "B", "C"])
print("[旧风格] 迭代:")
for item in old:
    print(f"  -> {item}")

new = NewStyleIterable(["X", "Y", "Z"])
print("\n[新风格] 迭代:")
for item in new:
    print(f"  -> {item}")

print("\n✅ 03-container-protocol.py 运行完成")
