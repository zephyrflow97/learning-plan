#!/bin/bash
# =============================================================
# Python 虚拟环境创建和配置脚本
#
# 运行方式:
#   bash examples/02-venv-setup.sh
#
# 功能:
#   1. 检查 Python 版本
#   2. 创建虚拟环境
#   3. 安装基础开发工具
#   4. 创建项目配置文件
# =============================================================

set -e  # 遇到错误立即退出

echo "============================================================"
echo "[环境搭建] 🐍 Python 项目环境搭建脚本"
echo "============================================================"

# --- 1. 检查 Python 版本 ---
echo ""
echo "[环境搭建] 步骤 1: 检查 Python 版本..."
PYTHON_VERSION=$(python3 --version 2>&1 || python --version 2>&1)
echo "[环境搭建] 当前版本: $PYTHON_VERSION"

# 选择可用的 python 命令
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ 未找到 Python，请先安装 Python 3.12+"
    exit 1
fi
echo "[环境搭建] 使用命令: $PYTHON_CMD"

# --- 2. 创建虚拟环境 ---
echo ""
echo "[环境搭建] 步骤 2: 创建虚拟环境..."
if [ -d ".venv" ]; then
    echo "[环境搭建] ⚠️  .venv 目录已存在，跳过创建"
else
    $PYTHON_CMD -m venv .venv
    echo "[环境搭建] ✅ 虚拟环境已创建: .venv/"
fi

# --- 3. 激活虚拟环境 ---
echo ""
echo "[环境搭建] 步骤 3: 激活虚拟环境..."
source .venv/bin/activate
echo "[环境搭建] ✅ 虚拟环境已激活"
echo "[环境搭建]    Python 路径: $(which python)"

# --- 4. 升级 pip ---
echo ""
echo "[环境搭建] 步骤 4: 升级 pip..."
pip install --upgrade pip --quiet
echo "[环境搭建] ✅ pip 已升级到 $(pip --version | cut -d' ' -f2)"

# --- 5. 安装开发工具 ---
echo ""
echo "[环境搭建] 步骤 5: 安装开发工具..."
pip install ruff ipython --quiet
echo "[环境搭建] ✅ 已安装: ruff, ipython"

# --- 6. 创建 .gitignore ---
echo ""
echo "[环境搭建] 步骤 6: 创建 .gitignore..."
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Python 虚拟环境
.venv/
venv/

# Python 缓存
__pycache__/
*.pyc
*.pyo
*.egg-info/

# 构建产物
dist/
build/

# 工具缓存
.mypy_cache/
.ruff_cache/
.pytest_cache/

# IDE
.idea/
.vscode/settings.json

# 系统文件
.DS_Store
Thumbs.db
EOF
    echo "[环境搭建] ✅ .gitignore 已创建"
else
    echo "[环境搭建] ⚠️  .gitignore 已存在，跳过"
fi

# --- 7. 创建 pyproject.toml ---
echo ""
echo "[环境搭建] 步骤 7: 创建 pyproject.toml..."
if [ ! -f "pyproject.toml" ]; then
    cat > pyproject.toml << 'EOF'
[project]
name = "my-python-project"
version = "0.1.0"
description = "My first Python project"
requires-python = ">=3.12"

[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = ["E", "W", "F", "I", "N", "UP"]

[tool.ruff.format]
quote-style = "double"
EOF
    echo "[环境搭建] ✅ pyproject.toml 已创建"
else
    echo "[环境搭建] ⚠️  pyproject.toml 已存在，跳过"
fi

# --- 完成 ---
echo ""
echo "============================================================"
echo "[环境搭建] 🎉 环境搭建完成！"
echo "============================================================"
echo ""
echo "后续操作:"
echo "  激活环境:  source .venv/bin/activate"
echo "  检查代码:  ruff check ."
echo "  格式化:    ruff format ."
echo "  启动 REPL: ipython"
echo "  退出环境:  deactivate"
