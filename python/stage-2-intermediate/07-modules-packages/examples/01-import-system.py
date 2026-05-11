"""
import 机制详解示例。

演示 Python import 系统的工作原理：
- sys.path 搜索路径
- sys.modules 缓存
- 导入的执行过程
- 各种导入形式

运行: python 01-import-system.py
"""

import sys
from pathlib import Path
from typing import Final


# === 1. 查看 sys.path ===

def show_sys_path() -> None:
    """展示 Python 的模块搜索路径。"""
    print("=" * 60)
    print("sys.path (模块搜索路径，按优先级排列):")
    print("=" * 60)
    for i, path in enumerate(sys.path):
        marker: str = "★" if i == 0 else " "
        print(f"  {marker} [{i:2d}] {path}")
    print(f"\n  ★ = 当前脚本目录 (最高优先级)")


# === 2. 查看 sys.modules 缓存 ===

def show_loaded_modules(prefix: str = "") -> None:
    """展示已加载的模块。"""
    modules: list[str] = sorted(sys.modules.keys())
    if prefix:
        modules = [m for m in modules if m.startswith(prefix)]
    print(f"\n[sys.modules] 已加载 {len(sys.modules)} 个模块")
    if prefix:
        print(f"[sys.modules] 过滤前缀 '{prefix}':")
        for mod_name in modules[:10]:
            print(f"  - {mod_name}")


# === 3. 导入是一次性的 ===

def demonstrate_import_caching() -> None:
    """演示模块导入缓存。"""
    print("\n[导入缓存] 第一次 import os...")
    import os  # noqa: F811
    id_first: int = id(os)

    print("[导入缓存] 第二次 import os...")
    import os  # noqa: F811
    id_second: int = id(os)

    print(f"[导入缓存] 两次 import 的对象 id 相同? {id_first == id_second}")
    print(f"[导入缓存] 结论: import 只执行一次，后续使用缓存")


# === 4. 各种导入形式对比 ===

def demonstrate_import_forms() -> None:
    """演示不同的导入形式。"""
    print("\n" + "=" * 60)
    print("导入形式对比")
    print("=" * 60)

    # 形式 1: import module
    import json
    data_1: str = json.dumps({"a": 1})
    print(f"  import json          -> json.dumps(...)  = {data_1}")

    # 形式 2: from module import name
    from json import dumps
    data_2: str = dumps({"b": 2})
    print(f"  from json import ... -> dumps(...)       = {data_2}")

    # 形式 3: import as alias
    import json as j
    data_3: str = j.dumps({"c": 3})
    print(f"  import json as j     -> j.dumps(...)     = {data_3}")

    # 形式 4: from import as alias
    from json import dumps as json_encode
    data_4: str = json_encode({"d": 4})
    print(f"  from ... as alias    -> json_encode(...) = {data_4}")


# === 5. 动态导入 ===

def dynamic_import(module_name: str, attr_name: str) -> object:
    """使用 importlib 动态导入模块。"""
    import importlib
    module = importlib.import_module(module_name)
    attr = getattr(module, attr_name)
    print(f"[动态导入] {module_name}.{attr_name} = {attr}")
    return attr


# === 主程序 ===

SEPARATOR: Final[str] = "\n" + "-" * 60

if __name__ == "__main__":
    show_sys_path()

    print(SEPARATOR)
    show_loaded_modules("json")

    print(SEPARATOR)
    demonstrate_import_caching()

    print(SEPARATOR)
    demonstrate_import_forms()

    print(SEPARATOR)
    # 动态导入示例
    pi = dynamic_import("math", "pi")
    print(f"  math.pi = {pi}")
