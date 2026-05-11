"""
第 5 章 示例 02：contextlib 工具箱

演示 @contextmanager、suppress、redirect_stdout、closing、ExitStack 等工具。
"""

import io
import os
import time
from contextlib import (
    ExitStack,
    closing,
    contextmanager,
    redirect_stderr,
    redirect_stdout,
    suppress,
)
from typing import Generator


# === 1. @contextmanager 基础 ===

print("=" * 60)
print("1. @contextmanager 基础")
print("=" * 60)


@contextmanager
def timer(label: str) -> Generator[dict[str, float], None, None]:
    """用生成器实现的计时器。"""
    result: dict[str, float] = {"elapsed": 0.0}
    start: float = time.perf_counter()
    print(f"  [{label}] 开始")
    try:
        yield result  # yield 之前 = __enter__，yield 之后 = __exit__
    finally:
        result["elapsed"] = time.perf_counter() - start
        print(f"  [{label}] 完成 ({result['elapsed']:.4f}s)")


with timer("排序") as t:
    sorted(range(100_000, 0, -1))
print(f"  耗时: {t['elapsed']:.4f}s")


# === 2. @contextmanager 异常处理 ===

print(f"\n{'=' * 60}")
print("2. @contextmanager 异常处理")
print(f"{'=' * 60}")


@contextmanager
def safe_resource(name: str) -> Generator[str, None, None]:
    """带正确异常处理的资源管理器。"""
    print(f"  [acquire] 获取资源: {name}")
    resource: str = f"Resource({name})"
    try:
        yield resource
    except Exception as e:
        print(f"  [error] 捕获异常: {e}")
        raise  # 重新抛出
    finally:
        print(f"  [release] 释放资源: {name}")  # ✅ 一定执行


# 正常
print("[正常使用]")
with safe_resource("db") as r:
    print(f"  使用: {r}")

# 异常
print("\n[异常情况]")
try:
    with safe_resource("file") as r:
        raise ValueError("写入失败")
except ValueError:
    print("  异常被正确传播")


# === 3. suppress：优雅地忽略异常 ===

print(f"\n{'=' * 60}")
print("3. suppress：优雅地忽略异常")
print(f"{'=' * 60}")

# ❌ 传统方式
try:
    os.remove("nonexistent_file.tmp")
except FileNotFoundError:
    pass  # 太啰嗦

# ✅ 用 suppress
with suppress(FileNotFoundError):
    os.remove("nonexistent_file.tmp")
    print("  这行不会执行（前一行已抛异常）")

print("  [suppress] 代码继续执行")

# 多个异常类型
with suppress(FileNotFoundError, PermissionError, OSError):
    os.remove("/root/protected_file.txt")
    print("  这行不会执行")

print("  [suppress] 多异常情况也能处理")


# === 4. redirect_stdout / redirect_stderr ===

print(f"\n{'=' * 60}")
print("4. redirect_stdout / redirect_stderr")
print(f"{'=' * 60}")

# 捕获 stdout 到字符串
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("这行输出到 buffer")
    print("这行也是")

captured: str = buffer.getvalue()
print(f"  [redirect] 捕获的内容: {captured!r}")

# 捕获 stderr
err_buffer = io.StringIO()
with redirect_stderr(err_buffer):
    import sys
    print("错误信息", file=sys.stderr)

print(f"  [redirect] 捕获的 stderr: {err_buffer.getvalue()!r}")

# 重定向到文件（实际项目中的用法）
# with open("output.log", "w") as f:
#     with redirect_stdout(f):
#         print("这会写入 output.log")


# === 5. closing：为旧式对象添加上下文支持 ===

print(f"\n{'=' * 60}")
print("5. closing：为旧式对象添加上下文支持")
print(f"{'=' * 60}")


class LegacyHTTPClient:
    """旧式 HTTP 客户端——只有 close()，没有 __enter__/__exit__。"""

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url
        self.open: bool = True
        print(f"  [HTTP] 创建客户端: {base_url}")

    def get(self, path: str) -> str:
        if not self.open:
            raise RuntimeError("客户端已关闭")
        print(f"  [HTTP] GET {self.base_url}{path}")
        return f"Response from {path}"

    def close(self) -> None:
        self.open = False
        print(f"  [HTTP] 关闭客户端")


# 用 closing 包装
with closing(LegacyHTTPClient("https://api.example.com")) as client:
    result: str = client.get("/users")
    print(f"  结果: {result}")

print(f"  客户端状态: open={client.open}")  # False


# === 6. ExitStack：动态上下文管理 ===

print(f"\n{'=' * 60}")
print("6. ExitStack：动态上下文管理")
print(f"{'=' * 60}")


@contextmanager
def mock_file(name: str) -> Generator[str, None, None]:
    """模拟文件打开/关闭。"""
    print(f"    [open] {name}")
    try:
        yield f"<content:{name}>"
    finally:
        print(f"    [close] {name}")


# 动态打开多个文件
filenames: list[str] = ["config.yaml", "data.json", "schema.sql", "log.txt"]

print("[ExitStack] 动态管理多个资源:")
with ExitStack() as stack:
    files: list[str] = []
    for name in filenames:
        f: str = stack.enter_context(mock_file(name))
        files.append(f)

    print(f"  已打开 {len(files)} 个文件:")
    for content in files:
        print(f"    {content}")

print("  所有文件已关闭（LIFO 顺序）")


# === 7. ExitStack 回调 ===

print(f"\n{'=' * 60}")
print("7. ExitStack 回调")
print(f"{'=' * 60}")


def cleanup(name: str) -> None:
    print(f"  [cleanup] 清理 {name}")


print("[ExitStack 回调]")
with ExitStack() as stack:
    # 注册回调——退出时按 LIFO 顺序执行
    stack.callback(cleanup, "临时文件")
    stack.callback(cleanup, "缓存")
    stack.callback(cleanup, "日志缓冲")

    print("  [工作] 执行主要逻辑")

# 输出顺序：日志缓冲 → 缓存 → 临时文件（LIFO）


# === 8. ExitStack.pop_all() 转移资源 ===

print(f"\n{'=' * 60}")
print("8. ExitStack.pop_all() 转移资源")
print(f"{'=' * 60}")


@contextmanager
def managed_resource(name: str) -> Generator[str, None, None]:
    print(f"  [acquire] {name}")
    try:
        yield name
    finally:
        print(f"  [release] {name}")


print("[pop_all] 成功时转移，失败时清理:")

# 模拟：打开多个资源，全部成功才保留，否则全部回滚
def open_all_or_nothing(names: list[str]) -> ExitStack:
    """全部打开成功才返回，否则清理已打开的资源。"""
    stack = ExitStack()
    try:
        for name in names:
            stack.enter_context(managed_resource(name))
        # 全部成功——转移资源给调用者
        return stack.pop_all()
    except Exception:
        # 有一个失败——清理所有已获取的资源
        stack.close()
        raise


# 全部成功
final_stack = open_all_or_nothing(["db", "cache", "queue"])
print("  [成功] 所有资源已获取，由调用者管理")
final_stack.close()  # 手动关闭

print("\n✅ 02-contextlib.py 运行完成")
