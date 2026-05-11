# 第 1 章：Python 环境与生态系统 — ĥ刀不误砍柴工

> *"A craftsman is only as good as his tools."*
> — Unknown
>
> 在你写下第一行 `print("Hello, World!")` 之前，让我们先把工具打ĥ好。
> 一个专业的 Python 开发者，不会在全局环境里 `pip install` 一切——就像一个专业的厨师，不会把所有顺材都倒进同一口锅。

## 📖 本章内容

- [1. Python 安装与版本管理](#1-python-安装与版本管理)
- [2. pip 与依赖管理](#2-pip-与依赖管理)
- [3. 虚拟环境：项目隔离的必要性](#3-虚拟环境项目隔离的必要性)
- [4. 现代工具链：uv 与 ruff](#4-现代工具链uv-与-ruff)
- [5. 交互式环境：REPL、IPython、Jupyter](#5-交互式环境replipythonjupyter)
- [6. VS Code + Python 扩չ配置](#6-vs-code--python-扩չ配置)
- [代码示例](#代码示例)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资Դ](#参考资Դ)
- [下一步](#下一步)

---

## 1. Python 安装与版本管理

> 🌌 **The Big Picture: Python 的版本ս争**
>
> Python 历史上最痛苦的事件是 **Python 2 → 3 的大Ǩ移**（2008-2020）。
> Python 2.7 在 2020 年 1 月 1 日正式"寿终正寝"。如果你今天还看到 `print "hello"` 这种写法，请立即关闭那个教程。
>
> 今天（2026 年），Python 3.12+ 是标准。3.10 引入了 `match-case`，3.11 带来了巨大的性能提升（平均快 25%），3.12 改进了错误信息和类型系统。
> **请始终使用 Python 3.12 或更高版本。**

### 1.1 安装 Python

**Windows：**

```bash
# 方式一：官网下载（推荐新手）
# 访问 https://www.python.org/downloads/ 下载 3.12+ 安装包
# ⚠️ 安装时勾选 "Add Python to PATH"

# 方式二：winget（推荐）
winget install Python.Python.3.12

# 方式三：Microsoft Store
# 搜索 "Python 3.12" 并安装
```

**macOS：**

```bash
# 方式一：Homebrew（推荐）
brew install python@3.12

# 方式二：官网下载
# 访问 https://www.python.org/downloads/
```

**Linux（Ubuntu/Debian）：**

```bash
# 系统自带的 Python 版本可能较旧，使用 deadsnakes PPA
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.12 python3.12-venv python3.12-dev
```

**验证安装：**

```bash
python --version    # Python 3.12.x
python -c "import sys; print(sys.version_info)"
# sys.version_info(major=3, minor=12, micro=x, releaselevel='final', serial=0)
```

### 1.2 pyenv — Python 版本管理器

> 🧰 **Toolbox: 为什么需要版本管理？**
>
> 现实世界中，你可能同时维护多个项目：
> - 项目 A 需要 Python 3.11（因为某个依赖不支持 3.12）
> - 项目 B 需要 Python 3.12（要用新特性）
> - 项目 C 需要 Python 3.10（老项目，暂时不升级）
>
> `pyenv` 让你在一台机器上安装和切换多个 Python 版本。

```bash
# macOS / Linux 安装 pyenv
curl https://pyenv.run | bash

# 添加到 shell 配置文件（~/.bashrc 或 ~/.zshrc）
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"

# Windows 用户使用 pyenv-win
# pip install pyenv-win --target %USERPROFILE%\.pyenv
# 或者使用 PowerShell:
# Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win/install-pyenv-win.ps1" -OutFile "./install-pyenv-win.ps1"; &"./install-pyenv-win.ps1"
```

```bash
# pyenv 常用命令
pyenv install --list       # 查看可安装的版本
pyenv install 3.12.7       # 安装指定版本
pyenv versions             # 查看已安装的版本
pyenv global 3.12.7        # 设置全局默认版本
pyenv local 3.11.9         # 为当前目录设置版本（会创建 .python-version 文件）
pyenv shell 3.10.14        # 为当前 shell 会话设置版本
```

| 命令 | 作用范围 | 优先级 | 持久化 |
|------|---------|--------|--------|
| `pyenv shell` | 当前终端会话 | 最高 | 否 |
| `pyenv local` | 当前目录及子目录 | 中 | 是（`.python-version` 文件） |
| `pyenv global` | 全局默认 | 最低 | 是（`~/.pyenv/version` 文件） |

---

## 2. pip 与依赖管理

> 🎭 **The Drama: 依赖地狱**
>
> 想象这个场景：你在全局环境 `pip install` 了 50 个包。项目 A 需要 `requests==2.28`，项目 B 需要 `requests==2.31`。
> 你升级了 `requests`——项目 A 崩了。你降级了——项目 B 崩了。
>
> 这就是"依赖地狱 (Dependency Hell)"，也是虚拟环境存在的根本原因。

### 2.1 pip 基础

`pip` 是 Python 的包管理器（**P**ip **I**nstalls **P**ackages）。

```bash
# 安装包
pip install requests                # 安装最新版
pip install requests==2.31.0        # 安装指定版本
pip install "requests>=2.28,<3.0"   # 安装版本范围

# 升级包
pip install --upgrade requests      # 升级到最新版
pip install -U pip                  # 升级 pip 自身

# 下载包
pip uninstall requests

# 查看已安装的包
pip list                            # 列出所有包
pip show requests                   # 查看包详情
pip freeze                          # 以 requirements 格式输出
```

### 2.2 requirements.txt

`requirements.txt` 是 Python 项目声明依赖的传统方式。

```bash
# 生成 requirements.txt（从当前环境导出）
pip freeze > requirements.txt

# 从 requirements.txt 安装所有依赖
pip install -r requirements.txt
```

**requirements.txt 格式：**

```text
# requirements.txt — 项目依赖声明
# 推荐：固定精确版本（可重现的构建）
requests==2.31.0
flask==3.0.2
sqlalchemy==2.0.25

# 也可以指定版本范围
python-dateutil>=2.8,<3.0

# 开发依赖通常放在单独的文件中
# requirements-dev.txt
# pytest==8.0.0
# ruff==0.2.0
# mypy==1.8.0
```

> ⚛️ **The Science: 精确版本 vs 范围版本**
>
> - **精确版本** (`==2.31.0`)：可重现性最好，但需要手动更新
> - **范围版本** (`>=2.28,<3.0`)：灵活性更好，但可能引入不兼容的更新
> - **最小版本** (`>=2.28`)：最宽松，可能踩到未知的 bug
>
> **推荐实践**：
> - `requirements.txt` 用精确版本（生产环境可重现）
> - `pyproject.toml` 的 `dependencies` 用范围版本（库发布时保持兼容性）

---

## 3. 虚拟环境：项目隔离的必要性

> 🧠 **CS Master's Bridge: 虚拟环境 ≈ 容器的轻量版**
>
> 如果你了解 Docker，可以把虚拟环境理解为"只隔离 Python 包的轻量级容器"。
> Docker 隔离的是整个操作系统环境；虚拟环境只隔离 Python 解释器和第三方包。
>
> ```
> Docker 容器:   OS + 系统库 + Python + 包      （重量级隔离）
> 虚拟环境:       Python 解释器链接 + 包            （轻量级隔离）
> 全局安装:       所有项目共享一套包                  （无隔离 = 灾难）
> ```

### 3.1 为什么虚拟环境是必须的

```
不使用虚拟环境时：

全局 Python 环境
├── requests 2.31.0    ← 项目 A 和 B 共享
├── flask 3.0.0        ← 只有项目 A 需要
├── django 5.0.0       ← 只有项目 B 需要
├── numpy 1.26.0       ← 只有项目 C 需要
└── ... 50 个包混在一起

问题：
1. 项目 A 要 requests 2.28，项目 B 要 2.31 → 冲突！
2. 不知道哪个包属于哪个项目
3. 升级一个包可能破坏其他项目
```

```
使用虚拟环境后：

项目 A (.venv/)           项目 B (.venv/)           项目 C (.venv/)
├── requests 2.28.0       ├── requests 2.31.0       ├── numpy 1.26.0
├── flask 3.0.0           ├── django 5.0.0          ├── pandas 2.2.0
└── gunicorn 21.2.0       └── celery 5.3.0          └── matplotlib 3.8.0

✅ 完全隔离，互不干扰
```

### 3.2 创建和使用虚拟环境

```bash
# 创建虚拟环境（Python 3 自带 venv 模块）
python -m venv .venv

# 激活虚拟环境
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Windows (CMD)
.\.venv\Scripts\activate.bat

# macOS / Linux
source .venv/bin/activate

# 激活后，终端提示符会变化：
# (.venv) $ python --version
# (.venv) $ pip install requests    ← 只安装到虚拟环境中

# 退出虚拟环境
deactivate
```

### 3.3 .gitignore 配置

**永Զ不要把虚拟环境提交到 Git！**

```gitignore
# .gitignore — Python 项目必备
.venv/
__pycache__/
*.pyc
*.pyo
*.egg-info/
dist/
build/
.mypy_cache/
.ruff_cache/
.pytest_cache/
```

### 3.4 虚拟环境管理方式对比

| 工具 | 命令 | 速度 | 场景 |
|------|------|------|------|
| `venv`（标准库） | `python -m venv .venv` | 一般 | 标准方式，适合大多数场景 |
| `virtualenv` | `virtualenv .venv` | 比 venv 快 | venv 的增ǿ版，更多功能 |
| `conda` | `conda create -n myenv` | 慢 | 数据科学，需要非 Python 依赖 |
| `uv`（推荐） | `uv venv` | 极快 | 现代工具链，替代 pip + venv |

---

## 4. 现代工具链：uv 与 ruff

> 🧰 **Toolbox: 2026 年的 Python 工具链革命**
>
> 传统方式需要五个工具各管各的：
> - `pip` — 包安装
> - `virtualenv` — 虚拟环境
> - `flake8` — 代码检查
> - `black` — 代码格式化
> - `isort` — import 排序
>
> 现代方式只需要两个工具：
> - `uv` — 包管理 + 虚拟环境（替代 pip + virtualenv，快 10-100 倍）
> - `ruff` — 检查 + 格式化 + import 排序（替代 flake8 + black + isort）
>
> 它们都是用 Rust 写的，**速度是传统工具的 10-100 倍**。

### 4.1 uv — 超快包管理

```bash
# 安装 uv
# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# 验证
uv --version
```

```bash
# uv 常用命令

# 创建虚拟环境（比 python -m venv 快 10 倍）
uv venv

# 安装包（比 pip 快 10-100 倍）
uv pip install requests
uv pip install -r requirements.txt

# 创建新项目（推荐方式）
uv init my-project
cd my-project
uv add requests          # 添加依赖（自动更新 pyproject.toml）
uv add --dev pytest      # 添加开发依赖
uv run python main.py    # 在虚拟环境中运行

# 同步依赖
uv sync                  # 从 pyproject.toml 安装所有依赖
```

### 4.2 ruff — 极速 Lint + Format

```bash
# 安装 ruff
pip install ruff
# 或者
uv pip install ruff

# 检查代码问题
ruff check .                    # 检查当前目录所有 Python 文件
ruff check --fix .              # 自动修复可修复的问题

# 格式化代码（替代 black）
ruff format .                   # 格式化当前目录所有 Python 文件
ruff format --check .           # 只检查，不修改

# 配置（在 pyproject.toml 中）
```

**pyproject.toml 中的 ruff 配置：**

```toml
[tool.ruff]
line-length = 88           # 行宽（与 black 默认值一致）
target-version = "py312"   # 目标 Python 版本

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
    "I",    # isort（import 排序）
    "N",    # pep8-naming
    "UP",   # pyupgrade（自动升级旧语法）
]

[tool.ruff.format]
quote-style = "double"     # 字符串用˫引号
```

### 4.3 uv vs pip 对比

| 操作 | pip | uv | 速度对比 |
|------|-----|-----|---------|
| 创建虚拟环境 | `python -m venv .venv` | `uv venv` | uv 快 ~10x |
| 安装包 | `pip install requests` | `uv pip install requests` | uv 快 ~10-100x |
| 安装 requirements | `pip install -r req.txt` | `uv pip install -r req.txt` | uv 快 ~10-100x |
| 依赖解析 | 较慢 | 极快 | uv 快 ~100x |
| 项目初始化 | 手动创建 | `uv init` | — |
| 添加依赖 | 手动编辑 | `uv add <pkg>` | — |

---

## 5. 交互式环境：REPL、IPython、Jupyter

> 🎭 **The Drama: 三种交互式环境的人格**
>
> - **REPL（标准交互式）**：朴素可靠的老教授，够用但不花哨
> - **IPython**：装备齐全的研究员，语法高亮、Tab 补全、魔术命令
> - **Jupyter Notebook**：可视化实验室，代码和结果混排，适合̽索性分析
>
> 对于学习 Python 语法，IPython 是最佳选择。对于数据分析，Jupyter 无可替代。

### 5.1 Python REPL

```bash
# 启动 Python REPL
python

# REPL 中：
>>> 2 + 3
5
>>> name = "Python"
>>> f"Hello, {name}!"
'Hello, Python!'
>>> exit()  # 或 Ctrl+D (macOS/Linux) / Ctrl+Z (Windows)
```

### 5.2 IPython

```bash
# 安装
pip install ipython
# 或
uv pip install ipython

# 启动
ipython
```

```python
# IPython 的超能力

# 1. Tab 自动补全
# In [1]: "hello".<Tab>  → 显示所有字符串方法

# 2. ? 查看文档
# In [2]: len?           → 显示 len 函数的文档

# 3. ?? 查看Դ码
# In [3]: len??          → 显示Դ码（如果可用）

# 4. ! 执行 shell 命令
# In [4]: !ls            → 列出文件

# 5. %timeit 性能测量
# In [5]: %timeit [i**2 for i in range(1000)]
# 142 µs ± 1.23 µs per loop

# 6. %history 查看历史
# In [6]: %history
```

### 5.3 Jupyter Notebook

```bash
# 安装
pip install jupyter
# 或
uv pip install jupyter

# 启动
jupyter notebook          # 经典界面
jupyter lab               # 现代界面（推荐）
```

| 环境 | 安装 | 适用场景 | 特ɫ功能 |
|------|------|---------|---------|
| Python REPL | 内置 | 快速测试一行代码 | 零依赖 |
| IPython | `pip install ipython` | 学习和调试 | Tab 补全、魔术命令、语法高亮 |
| Jupyter Notebook | `pip install jupyter` | 数据分析、教学 | 代码+结果+Markdown 混排 |
| VS Code Python | VS Code 扩չ | 日常开发 | 断点调试、IntelliSense |

---

## 6. VS Code + Python 扩չ配置

> 🧰 **Toolbox: VS Code 是 Python 开发的最佳 IDE（之一）**
>
> PyCharm 是 Python 专用的ǿ大 IDE，但它体积庞大且部分功能需要付费。
> VS Code 轻量、免费、插件生态丰富，配合 Python 扩չ后可以媲美 PyCharm 90% 的功能。
> 本教程使用 VS Code 作为开发环境。

### 6.1 必装扩չ

| 扩չ | 功能 | 重要性 |
|------|------|--------|
| **Python** (Microsoft) | 核心支持：IntelliSense、调试、虚拟环境 | 必装 |
| **Pylance** (Microsoft) | 类型检查、自动补全、import 管理 | 必装 |
| **Ruff** (Astral) | Lint + Format（替代 Flake8/Black 扩չ） | 必装 |
| **Python Debugger** (Microsoft) | 断点调试 | 必装 |
| **Jupyter** (Microsoft) | Jupyter Notebook 支持 | 推荐 |
| **Even Better TOML** | TOML 文件支持（pyproject.toml） | 推荐 |
| **autoDocstring** | 自动生成 docstring | 推荐 |

### 6.2 VS Code 设置

在 `.vscode/settings.json` 中配置：

```jsonc
{
    // Python 基础配置
    "python.defaultInterpreterPath": ".venv/Scripts/python.exe",  // Windows
    // "python.defaultInterpreterPath": ".venv/bin/python",       // macOS/Linux

    // 使用 ruff 作为格式化器
    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.fixAll.ruff": "explicit",
            "source.organizeImports.ruff": "explicit"
        }
    },

    // Ruff 配置
    "ruff.lint.args": ["--select", "E,W,F,I,N,UP"],

    // 类型检查（Pylance）
    "python.analysis.typeCheckingMode": "basic",

    // 测试配置
    "python.testing.pytestEnabled": true,
    "python.testing.pytestArgs": ["tests"]
}
```

### 6.3 项目标准结构

```
my-python-project/
├── .venv/                  # 虚拟环境（不提交到 Git）
├── .vscode/
│   └── settings.json       # VS Code 项目级设置
├── src/
│   └── my_package/
│       ├── __init__.py
│       └── main.py
├── tests/
│   └── test_main.py
├── .gitignore
├── pyproject.toml          # 项目配置（现代标准）
├── requirements.txt        # 依赖声明（传统方式）
└── README.md
```

---

## 代码示例

### 示例 1: 第一个 Python 程序

参见 [`examples/01-first-program.py`](./examples/01-first-program.py)

```python
"""
第一个 Python 程序 — 验证环境是否正确配置
运行方式: python examples/01-first-program.py
"""
import platform
import sys

def main():
    # 打打欢迎信息
    print("[环境检查] 开始验证 Python 环境...")
    print(f"[环境检查] Python 版本: {sys.version}")
    print(f"[环境检查] 操作系统: {platform.system()} {platform.release()}")
    print(f"[环境检查] 平台架构: {platform.machine()}")

    # 检查 Python 版本
    if sys.version_info >= (3, 12):
        print("✅ Python 版本 >= 3.12，完美！")
    elif sys.version_info >= (3, 10):
        print("⚠️ Python 版本 >= 3.10 但 < 3.12，建议升级")
    else:
        print("❌ Python 版本 < 3.10，请升级到 3.12+")

    # 检查虚拟环境
    in_venv = sys.prefix != sys.base_prefix
    if in_venv:
        print(f"✅ 在虚拟环境中运行: {sys.prefix}")
    else:
        print("⚠️ 未在虚拟环境中运行（建议创建虚拟环境）")

    print("\n[环境检查] 🎉 Hello, Python World!")

if __name__ == "__main__":
    main()
```

### 示例 2: 虚拟环境配置脚本

参见 [`examples/02-venv-setup.sh`](./examples/02-venv-setup.sh)

```bash
#!/bin/bash
# 虚拟环境创建和配置脚本
# 运行方式: bash examples/02-venv-setup.sh

echo "[环境搭建] 开始创建 Python 项目环境..."

# 创建虚拟环境
python -m venv .venv
echo "[环境搭建] ✅ 虚拟环境已创建: .venv/"

# 激活虚拟环境
source .venv/bin/activate
echo "[环境搭建] ✅ 虚拟环境已激活"

# 升级 pip
pip install --upgrade pip
echo "[环境搭建] ✅ pip 已升级"

# 安装开发工具
pip install ruff ipython
echo "[环境搭建] ✅ 开发工具已安装 (ruff, ipython)"

echo "[环境搭建] 🎉 环境搭建完成！"
echo "[环境搭建] 使用 'source .venv/bin/activate' 激活环境"
```

---

## 最佳实践

### ✅ 推荐做法

```python
# ✅ 1. 每个项目都使用虚拟环境
# python -m venv .venv  或  uv venv

# ✅ 2. 使用 pyproject.toml 管理项目配置
# [project]
# name = "my-project"
# version = "0.1.0"
# requires-python = ">=3.12"

# ✅ 3. 使用 ruff 保持代码风格一致
# ruff check . && ruff format .

# ✅ 4. 在 .gitignore 中排除虚拟环境和缓存
# .venv/
# __pycache__/

# ✅ 5. requirements.txt 中固定精确版本
# requests==2.31.0

# ✅ 6. 使用 if __name__ == "__main__" 保护入口
def main():
    print("[最佳实践] 使用 main 函数作为入口")

if __name__ == "__main__":
    main()
```

### ❌ 应避免的做法

```python
# ❌ 1. 在全局环境中 pip install
# pip install requests  ← 直接在系统 Python 中安装

# ❌ 2. 把 .venv/ 目录提交到 Git
# git add .venv/  ← 永Զ不要这么做！

# ❌ 3. 使用过旧的 Python 版本
# python2 script.py  ← Python 2 已于 2020 年停止维护

# ❌ 4. 手动管理 sys.path
# import sys
# sys.path.append("/some/random/path")  ← 脆弱且不可移植

# ❌ 5. 混用 pip 和 conda 在同一个环境中
# conda install numpy && pip install pandas  ← 依赖冲突风险
```

---

## 常见陷阱

### 陷阱 1：`python` vs `python3` 命令

```bash
# 在某些系统（如 Ubuntu）上，python 指向 Python 2
python --version   # 可能是 Python 2.7！
python3 --version  # 这才是 Python 3

# 解决方案：
# 1. 使用 python3 命令
# 2. 或者创建别名：alias python=python3
# 3. 或者使用 pyenv 统一管理
```

### 陷阱 2：Windows 上的执行策略

```powershell
# 如果 PowerShell 提示脚本执行策略错误：
# "无法加载文件 xxx\Activate.ps1，因为在此系统上禁止运行脚本"

# 解决方案（以管理员身份运行 PowerShell）：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 陷阱 3：pip install 权限问题

```bash
# ❌ 不要用 sudo pip install（会污Ⱦ系统 Python）
sudo pip install requests    # 危险！

# ✅ 使用虚拟环境
python -m venv .venv
source .venv/bin/activate
pip install requests         # 安全！只影响虚拟环境
```

### 陷阱 4：忘记激活虚拟环境

```bash
# 常见症状：安装了包但 import 找不到
pip install requests         # 以为装到了虚拟环境里
python -c "import requests"  # ModuleNotFoundError!

# 原因：忘记激活虚拟环境，pip 装到了全局
# 检查当前 Python ·径：
which python                 # macOS/Linux
where python                 # Windows
# 如果·径不包含 .venv，˵明û激活
```

---

## 练习题

### 练习 1：搭建 Python 环境

**目标**：验证你的 Python 开发环境是否正确配置。

1. 检查 Python 版本是否 >= 3.12
2. 创建一个虚拟环境并激活
3. 安装 `ruff` 和 `ipython`
4. 编写一个打打版本信息的脚本

<details>
<summary>💡 参考答案</summary>

```bash
# 步骤 1：检查版本
python --version

# 步骤 2：创建并激活虚拟环境
python -m venv .venv
source .venv/bin/activate    # macOS/Linux
# .\.venv\Scripts\Activate.ps1  # Windows

# 步骤 3：安装工具
pip install ruff ipython

# 步骤 4：编写脚本
python -c "
import sys
import platform
print(f'Python {sys.version}')
print(f'OS: {platform.system()} {platform.release()}')
print(f'虚拟环境: {sys.prefix != sys.base_prefix}')
"
```

</details>

### 练习 2：创建项目结构

**目标**：按照标准结构创建一个新的 Python 项目。

1. 创建项目目录 `my-first-project`
2. 初始化虚拟环境
3. 创建 `.gitignore`、`pyproject.toml`、`src/main.py`
4. 用 `ruff` 检查代码

<details>
<summary>💡 参考答案</summary>

```bash
# 方式一：手动创建
mkdir my-first-project
cd my-first-project
python -m venv .venv
source .venv/bin/activate

# 创建 .gitignore
echo ".venv/
__pycache__/
*.pyc
.ruff_cache/" > .gitignore

# 创建 src/main.py
mkdir src
echo 'def main():
    print("Hello from my first project!")

if __name__ == "__main__":
    main()' > src/main.py

# 检查代码
pip install ruff
ruff check src/
ruff format src/

# 方式二：使用 uv（推荐）
uv init my-first-project
cd my-first-project
uv run python -c "print('Hello!')"
```

</details>

---

## 参考资Դ

- [Python 官方文档 - venv](https://docs.python.org/3/library/venv.html)
- [pyenv GitHub](https://github.com/pyenv/pyenv)
- [uv 官方文档](https://docs.astral.sh/uv/)
- [ruff 官方文档](https://docs.astral.sh/ruff/)
- [VS Code Python 扩չ文档](https://code.visualstudio.com/docs/languages/python)
- [Real Python - Python Virtual Environments](https://realpython.com/python-virtual-environments-a-primer/)

---

## 下一步

恭喜！你已经搭建好了 Python 开发环境。接下来，让我们深入 Python 的类型系统——你会发现，Python 的变量和 C/Java 的变量是完全不同的东西。

**[👉 第 2 章：变量与数据类型](../02-variables-types/)**
