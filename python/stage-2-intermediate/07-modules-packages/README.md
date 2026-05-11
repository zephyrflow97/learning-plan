# 第 7 章：模块与包 — 代码组织的建筑学

> *"Namespaces are one honking great idea -- let's do more of those!"*
> — The Zen of Python, Line 19
>
> 一个文件能写 10 行，也能写 10000 行。
> 但超过 300 行的文件就像一栋没有隔墙的房子——你永远找不到厨房在哪。
> 模块和包就是 Python 的隔墙、楼层和门牌号。

## 📖 本章内容

- [1. import 机制详解](#1-import-机制详解)
  - [1.1 import 的搜索路径](#11-import-的搜索路径)
  - [1.2 import 的执行过程](#12-import-的执行过程)
  - [1.3 各种 import 形式](#13-各种-import-形式)
- [2. 包结构与 __init__.py](#2-包结构与-__init__py)
  - [2.1 包是什么](#21-包是什么)
  - [2.2 __init__.py 的作用](#22-__init__py-的作用)
  - [2.3 推荐的项目结构](#23-推荐的项目结构)
- [3. 相对导入 vs 绝对导入](#3-相对导入-vs-绝对导入)
  - [3.1 绝对导入](#31-绝对导入)
  - [3.2 相对导入](#32-相对导入)
  - [3.3 何时用哪种](#33-何时用哪种)
- [4. __all__ 与公共 API](#4-__all__-与公共-api)
- [5. 命名空间包](#5-命名空间包)
- [6. 打包与分发](#6-打包与分发)
  - [6.1 pyproject.toml](#61-pyprojecttoml)
  - [6.2 构建与发布](#62-构建与发布)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [导航](#导航)

---

## 1. import 机制详解

> 🎭 **The Drama：循环导入地狱**
>
> ```python
> # a.py
> from b import helper_b
> def helper_a(): ...
>
> # b.py
> from a import helper_a    # 💥 ImportError: cannot import name 'helper_a'
> def helper_b(): ...
> ```
>
> 你改了又改，报错从 `ImportError` 变成了 `AttributeError`，又变成了 `None`。
> 你开始怀疑人生。
>
> 循环导入是 Python 新手的第一个 Boss。打败它的前提是**理解 import 的执行机制**。

### 1.1 import 的搜索路径

```
import 搜索顺序:
┌────────────────────────────────────────────┐
│ 1. sys.modules 缓存 (已导入的模块)          │
│    ↓ 如果没有                               │
│ 2. 内置模块 (sys, os, math 等)              │
│    ↓ 如果没有                               │
│ 3. sys.path 中的路径 (按顺序搜索)            │
│    ├── 当前脚本所在目录                      │
│    ├── PYTHONPATH 环境变量                   │
│    ├── 标准库目录                            │
│    └── site-packages (第三方包)              │
│    ↓ 如果都没有                              │
│ 4. ImportError!                             │
└────────────────────────────────────────────┘
```

```python
import sys

# 查看搜索路径
for i, path in enumerate(sys.path):
    print(f"[sys.path][{i}] {path}")

# 查看已导入的模块
print(f"\n[sys.modules] 已加载 {len(sys.modules)} 个模块")
print(f"[sys.modules] 包含 'os'? {'os' in sys.modules}")
```

### 1.2 import 的执行过程

```python
# 当 Python 执行 `import mymodule` 时：
#
# 1. 检查 sys.modules["mymodule"] 是否存在
#    → 存在：直接返回缓存（不会重复执行模块代码！）
#    → 不存在：继续
#
# 2. 在 sys.path 中搜索 mymodule.py
#
# 3. 创建新的 module 对象，加入 sys.modules
#    （此时模块对象已存在，但还是空的！）
#
# 4. 执行模块文件中的代码
#    （定义变量、函数、类等，填充模块对象）
#
# 5. 返回模块对象

# ✅ 重要：步骤 3 和 4 的顺序是循环导入的关键
# 模块 A 导入 B 时，B 尝试导入 A：
# - A 已经在 sys.modules 中了（步骤 3）
# - 但 A 的代码还没执行完（步骤 4 还在进行中）
# - 所以 B 看到的是一个"半成品"的 A
```

### 1.3 各种 import 形式

```python
# 形式 1: import module
import os
print(f"[import os] cwd = {os.getcwd()}")

# 形式 2: from module import name
from os.path import join, exists
print(f"[from import] join('a', 'b') = {join('a', 'b')}")

# 形式 3: from module import *（⚠️ 不推荐）
# from os import *  # 污染命名空间！

# 形式 4: import module as alias
import numpy as np  # 约定俗成的别名

# 形式 5: from module import name as alias
from collections import OrderedDict as OD
```

| import 形式 | 优点 | 缺点 | 推荐度 |
|-------------|------|------|--------|
| `import module` | 清晰来源，避免名称冲突 | 使用时需写全名 | ⭐⭐⭐⭐⭐ |
| `from module import name` | 简洁 | 来源不明显 | ⭐⭐⭐⭐ |
| `from module import *` | 最简洁 | 污染命名空间，来源不明 | ⭐ |
| `import module as alias` | 缩短长名 | 需记住别名 | ⭐⭐⭐⭐ |

---

## 2. 包结构与 __init__.py

### 2.1 包是什么

> 🌌 **The Big Picture：模块 vs 包 vs 库**
>
> | 概念 | 是什么 | 类比 |
> |------|--------|------|
> | **模块 (Module)** | 一个 `.py` 文件 | 一间房间 |
> | **包 (Package)** | 包含 `__init__.py` 的目录 | 一层楼 |
> | **库 (Library)** | 可安装的包集合 | 一栋楼 |
> | **框架 (Framework)** | 控制反转的库 | 一个社区 |

```
# 一个典型的 Python 包结构
myproject/
├── pyproject.toml          # 项目配置（现代方式）
├── README.md
├── src/
│   └── mypackage/          # 源代码包
│       ├── __init__.py     # 包的入口
│       ├── core.py         # 核心逻辑
│       ├── utils.py        # 工具函数
│       ├── models/         # 子包
│       │   ├── __init__.py
│       │   ├── user.py
│       │   └── product.py
│       └── api/            # 另一个子包
│           ├── __init__.py
│           ├── routes.py
│           └── middleware.py
├── tests/
│   ├── __init__.py
│   ├── test_core.py
│   └── test_models/
│       ├── __init__.py
│       └── test_user.py
└── docs/
```

### 2.2 __init__.py 的作用

```python
# mypackage/__init__.py

"""
MyPackage — 一个示例包。

__init__.py 的职责：
1. 标记目录为 Python 包（Python 3.3+ 可省略，但不推荐）
2. 定义包的公共 API
3. 包级别的初始化代码
4. 控制 `from package import *` 的行为
"""

# 1. 导入子模块的关键对象，简化使用者的导入路径
from mypackage.core import Engine
from mypackage.utils import format_output
from mypackage.models.user import User

# 2. 定义公共 API
__all__ = ["Engine", "format_output", "User"]

# 3. 包的版本信息
__version__ = "1.0.0"

# 4. 包级别的初始化
print(f"[mypackage] v{__version__} loaded")
```

```python
# ✅ 使用者的导入变得简洁：
# from mypackage import Engine, User  （而不是 from mypackage.core import Engine）

# ❌ 反面教材：在 __init__.py 中做太多事
# - 大量的计算或 I/O
# - 导入所有子模块（导致导入速度慢）
# - 定义复杂的业务逻辑
```

### 2.3 推荐的项目结构

```
# src-layout（现代推荐）
project/
├── pyproject.toml
├── src/
│   └── mypackage/
│       └── ...
└── tests/
    └── ...

# flat-layout（简单项目可用）
project/
├── pyproject.toml
├── mypackage/
│   └── ...
└── tests/
    └── ...
```

| 结构 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| src-layout | 避免意外导入，安装后才能导入 | 开发时需要安装 | 要发布的库 |
| flat-layout | 简单直接 | 可能意外导入本地代码 | 应用项目 |

---

## 3. 相对导入 vs 绝对导入

### 3.1 绝对导入

```python
# ✅ 绝对导入：从包的根开始写完整路径
from mypackage.core import Engine
from mypackage.models.user import User
from mypackage.utils import format_output

print("[绝对导入] 路径明确，不怕文件移动")
```

### 3.2 相对导入

```python
# 相对导入：用 . 表示当前包，.. 表示父包
# 只能在包内部使用！

# mypackage/models/user.py 中：
from . import product           # 同级模块
from .product import Product    # 同级模块中的类
from .. import utils            # 父包的模块
from ..core import Engine       # 父包的 core 模块

print("[相对导入] 包内引用更简洁")

# ❌ 错误：在顶层脚本中使用相对导入
# from .utils import helper  # ImportError: attempted relative import with no known parent package
```

### 3.3 何时用哪种

```
                ┌─────────────┐
                │ 是包内导入？  │
                └──────┬──────┘
                 ┌─────┴─────┐
                Yes          No
                 │            │
           ┌─────▼─────┐    ┌▼──────────────┐
           │ 绝对或相对  │    │ 只能用绝对导入  │
           │ 都可以      │    └───────────────┘
           └─────┬─────┘
            ┌────┴────┐
           推荐       也可以
            │          │
      ┌─────▼─────┐  ┌▼───────────┐
      │ 绝对导入    │  │ 相对导入     │
      │ (PEP 8推荐)│  │ (包内简洁)   │
      └───────────┘  └────────────┘
```

---

## 4. __all__ 与公共 API

```python
# utils.py

"""
__all__ 控制 `from utils import *` 导出哪些名称。
同时也是文档——告诉使用者："这些是公共 API"。
"""

__all__ = ["format_output", "validate_input"]


def format_output(data: str) -> str:
    """公共 API：格式化输出。"""
    result = data.strip().title()
    print(f"[format_output] '{data}' -> '{result}'")
    return result


def validate_input(data: str) -> bool:
    """公共 API：验证输入。"""
    is_valid = len(data) > 0
    print(f"[validate_input] '{data}' -> {is_valid}")
    return is_valid


def _internal_helper(x: int) -> int:
    """内部函数：前缀下划线表示私有。"""
    return x * 2


def secret_function() -> None:
    """不在 __all__ 中，import * 不会导入。"""
    print("[secret_function] 你不应该看到我")


# from utils import *
# → format_output ✅
# → validate_input ✅
# → _internal_helper ❌（下划线前缀）
# → secret_function ❌（不在 __all__ 中）
#
# from utils import secret_function
# → ✅（直接导入仍然可以，__all__ 只影响 import *）
```

---

## 5. 命名空间包

```python
# Python 3.3+ 引入的命名空间包（PEP 420）
# 特点：没有 __init__.py，可以跨多个目录

# 目录结构：
# path_a/mypkg/module_a.py
# path_b/mypkg/module_b.py
#
# 只要 path_a 和 path_b 都在 sys.path 中：
# import mypkg.module_a  ✅
# import mypkg.module_b  ✅

# ⚠️ 注意：命名空间包是高级特性
# 大多数项目应该使用常规包（带 __init__.py）
# 命名空间包主要用于：
# - 大型组织的跨仓库包（如 google.cloud.storage）
# - 插件系统

print("[命名空间包] 没有 __init__.py 的包")
print("[命名空间包] 允许一个包分散在多个目录中")
```

---

## 6. 打包与分发

### 6.1 pyproject.toml

> 🧰 **Toolbox：现代 Python 打包**
>
> 2024 年的 Python 项目**必须**用 `pyproject.toml`。
> `setup.py` 和 `setup.cfg` 已经是历史遗留了。
>
> ```
> 打包工具演化:
>
> setup.py (2000s)
>     ↓  "可执行的配置文件太危险"
> setup.cfg (2010s)
>     ↓  "还是需要 setup.py 配合"
> pyproject.toml (PEP 518/621, 2020s)
>     ↓  "终于有了统一的标准"
> ✅ 当前推荐
> ```

```toml
# pyproject.toml 示例
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "mypackage"
version = "1.0.0"
description = "A sample Python package"
readme = "README.md"
license = {text = "MIT"}
requires-python = ">=3.11"
authors = [
    {name = "Your Name", email = "you@example.com"},
]
dependencies = [
    "requests>=2.28",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "mypy>=1.0",
    "ruff>=0.1.0",
]

[project.scripts]
mypackage-cli = "mypackage.cli:main"

[tool.mypy]
python_version = "3.11"
strict = true

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"

[tool.ruff]
line-length = 100
target-version = "py311"
```

### 6.2 构建与发布

```bash
# 安装构建工具
pip install build twine

# 构建
python -m build
# 生成:
#   dist/mypackage-1.0.0.tar.gz     (源代码包)
#   dist/mypackage-1.0.0-py3-none-any.whl  (wheel 包)

# 上传到 TestPyPI（测试）
twine upload --repository testpypi dist/*

# 上传到 PyPI（正式）
twine upload dist/*

# 安装自己的包（开发模式）
pip install -e .
# -e 表示 editable：修改源码后不需要重新安装
```

---

## 最佳实践

```python
# ✅ 1. 使用绝对导入（PEP 8 推荐）
from mypackage.core import Engine

# ✅ 2. 按标准分组 import（isort 风格）
# 标准库
import os
import sys
from pathlib import Path

# 第三方库
import requests
from pydantic import BaseModel

# 本地模块
from mypackage.core import Engine
from mypackage.utils import helper

# ✅ 3. 避免循环导入
# 方法 A: 延迟导入（在函数内部导入）
def get_engine() -> "Engine":
    from mypackage.core import Engine  # 延迟到调用时才导入
    return Engine()

# 方法 B: 重构——提取公共依赖到第三个模块
# 方法 C: TYPE_CHECKING 守卫
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from mypackage.core import Engine  # 只在类型检查时导入

# ✅ 4. __init__.py 保持精简
# ✅ 5. 用 __all__ 明确公共 API
# ✅ 6. 使用 pyproject.toml 管理项目
```

---

## 常见陷阱

```python
# ❌ 陷阱 1: 模块同名覆盖
# 如果你创建了 random.py，它会覆盖标准库的 random！
# 解决：不要用标准库模块的名字命名你的文件

# ❌ 陷阱 2: 循环导入
# a.py: from b import func_b
# b.py: from a import func_a
# 解决：重构代码结构，或使用延迟导入

# ❌ 陷阱 3: 在顶层脚本中使用相对导入
# python my_script.py
# from .utils import helper  # ImportError!
# 解决：使用绝对导入，或用 python -m mypackage.my_script 运行

# ❌ 陷阱 4: 修改 sys.path
# sys.path.insert(0, "/some/path")  # 脆弱！换环境就炸
# 解决：用 pip install -e . 进行开发安装

# ❌ 陷阱 5: from module import * 在包的 __init__.py 中
# 会导入所有子模块，严重影响导入速度
```

---

## 导航

| 方向 | 链接 |
|------|------|
| ⬅️ 上一章 | [第 6 章：类型标注与 mypy](../06-type-hints-mypy/) |
| ➡️ 下一章 | [第 8 章：pytest 测试](../08-testing-pytest/) |
| 🏠 阶段目录 | [Stage 2 目录](../) |

---

## 参考资料

- [Python import system 官方文档](https://docs.python.org/3/reference/import.html)
- [PEP 328 — Imports: Multi-Line and Absolute/Relative](https://peps.python.org/pep-0328/)
- [PEP 518 — pyproject.toml](https://peps.python.org/pep-0518/)
- [PEP 621 — Project metadata in pyproject.toml](https://peps.python.org/pep-0621/)
- [Python Packaging User Guide](https://packaging.python.org/)
