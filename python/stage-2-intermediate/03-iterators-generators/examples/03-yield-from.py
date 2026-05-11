"""
第 3 章 示例 03：yield from 委托生成器

演示 yield from 的三种用法：简化嵌套、扁平化、委托子生成器。
"""

from dataclasses import dataclass, field
from typing import Any, Generator


# === 1. yield from 基础：简化嵌套迭代 ===

print("=" * 60)
print("1. yield from 基础：链接多个可迭代对象")
print("=" * 60)


# ❌ 传统写法：两层嵌套
def chain_old(*iterables: list[Any]) -> Generator[Any, None, None]:
    for it in iterables:
        for item in it:
            yield item


# ✅ yield from 写法：更简洁
def chain_new(*iterables: list[Any]) -> Generator[Any, None, None]:
    for it in iterables:
        yield from it


result_old: list[int] = list(chain_old([1, 2], [3, 4], [5, 6]))
result_new: list[int] = list(chain_new([1, 2], [3, 4], [5, 6]))
print(f"[chain_old] {result_old}")
print(f"[chain_new] {result_new}")


# === 2. yield from 实战：扁平化嵌套列表 ===

print(f"\n{'=' * 60}")
print("2. 递归扁平化嵌套结构")
print(f"{'=' * 60}")


def flatten(nested: Any, depth: int = 0) -> Generator[Any, None, None]:
    """递归扁平化——yield from 递归委托。"""
    indent: str = "  " * depth
    if isinstance(nested, (list, tuple)):
        print(f"{indent}[flatten] 展开 {type(nested).__name__}，长度={len(nested)}")
        for item in nested:
            yield from flatten(item, depth + 1)
    else:
        print(f"{indent}[flatten] 产出: {nested}")
        yield nested


data: list[Any] = [1, [2, 3], [4, [5, [6, 7]]], 8, [9]]
print(f"[输入] {data}")
flat: list[Any] = list(flatten(data))
print(f"[输出] {flat}")


# === 3. yield from 实战：遍历树结构 ===

print(f"\n{'=' * 60}")
print("3. 遍历树结构")
print(f"{'=' * 60}")


@dataclass
class FileNode:
    """文件系统节点——模拟目录树。"""
    name: str
    is_dir: bool = False
    children: list["FileNode"] = field(default_factory=list)

    def __repr__(self) -> str:
        icon: str = "📁" if self.is_dir else "📄"
        return f"{icon} {self.name}"


def walk_files(node: FileNode, prefix: str = "") -> Generator[str, None, None]:
    """深度优先遍历文件树。"""
    path: str = f"{prefix}/{node.name}" if prefix else node.name
    print(f"  [walk] 访问: {path}")
    yield path
    if node.is_dir:
        for child in node.children:
            yield from walk_files(child, path)


# 构建模拟文件树
project = FileNode("my_project", is_dir=True, children=[
    FileNode("README.md"),
    FileNode("src", is_dir=True, children=[
        FileNode("main.py"),
        FileNode("utils.py"),
        FileNode("models", is_dir=True, children=[
            FileNode("user.py"),
            FileNode("order.py"),
        ]),
    ]),
    FileNode("tests", is_dir=True, children=[
        FileNode("test_main.py"),
        FileNode("test_utils.py"),
    ]),
])

print("[文件树遍历]")
all_paths: list[str] = list(walk_files(project))
print(f"\n[所有路径]")
for p in all_paths:
    depth: int = p.count("/")
    print(f"  {'  ' * depth}{p.split('/')[-1]}")


# === 4. yield from 捕获子生成器的 return 值 ===

print(f"\n{'=' * 60}")
print("4. yield from 捕获子生成器的 return 值")
print(f"{'=' * 60}")


def sub_generator(name: str, n: int) -> Generator[int, None, int]:
    """子生成器：产出 n 个数字，返回它们的总和。"""
    total: int = 0
    for i in range(1, n + 1):
        total += i
        print(f"  [sub:{name}] yield {i}")
        yield i
    print(f"  [sub:{name}] return 总和={total}")
    return total


def delegating_gen() -> Generator[int, None, None]:
    """委托生成器：用 yield from 获取子生成器的 return 值。"""
    print("[delegate] 委托给 sub_A")
    sum_a: int = yield from sub_generator("A", 3)
    print(f"[delegate] sub_A 返回: {sum_a}")

    print("[delegate] 委托给 sub_B")
    sum_b: int = yield from sub_generator("B", 2)
    print(f"[delegate] sub_B 返回: {sum_b}")

    print(f"[delegate] 总计: {sum_a + sum_b}")


print("[执行委托生成器]")
for value in delegating_gen():
    print(f"  -> 收到: {value}")


# === 5. yield from vs 手动转发对比 ===

print(f"\n{'=' * 60}")
print("5. yield from vs 手动转发")
print(f"{'=' * 60}")


def sub() -> Generator[int, None, str]:
    yield 1
    yield 2
    return "done"


# ❌ 手动转发：丢失 return 值，代码冗长
def manual_delegate() -> Generator[int, None, None]:
    s = sub()
    try:
        while True:
            value: int = next(s)
            yield value
    except StopIteration as e:
        result: str = e.value
        print(f"  [manual] 子生成器返回: {result}")


# ✅ yield from：自动处理一切
def elegant_delegate() -> Generator[int, None, None]:
    result: str = yield from sub()
    print(f"  [elegant] 子生成器返回: {result}")


print("[手动转发]")
for v in manual_delegate():
    print(f"  -> {v}")

print("\n[yield from]")
for v in elegant_delegate():
    print(f"  -> {v}")

print("\n✅ 03-yield-from.py 运行完成")
