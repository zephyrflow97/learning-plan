"""
第一个 Python 程序 — 验证环境是否正确配置

运行方式:
    python examples/01-first-program.py

本脚本会检查：
1. Python 版本是否满足要求
2. 是否在虚拟环境中运行
3. 常用包是否已安装
"""
import importlib
import platform
import sys


def check_python_version() -> None:
    """检查 Python 版本"""
    print("[环境检查] === Python 版本信息 ===")
    print(f"[环境检查] Python 版本: {sys.version}")
    print(f"[环境检查] 版本号: {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

    if sys.version_info >= (3, 12):
        print("✅ Python 版本 >= 3.12，完美！")
    elif sys.version_info >= (3, 10):
        print("⚠️  Python 版本 >= 3.10 但 < 3.12，建议升级到 3.12+")
    else:
        print("❌ Python 版本 < 3.10，请升级到 3.12+")
        print("   访问 https://www.python.org/downloads/ 下载最新版本")


def check_os_info() -> None:
    """检查操作系统信息"""
    print("\n[环境检查] === 操作系统信息 ===")
    print(f"[环境检查] 操作系统: {platform.system()} {platform.release()}")
    print(f"[环境检查] 平台架构: {platform.machine()}")
    print(f"[环境检查] 处理器: {platform.processor() or '未知'}")


def check_virtual_environment() -> None:
    """检查是否在虚拟环境中运行"""
    print("\n[环境检查] === 虚拟环境检查 ===")
    in_venv = sys.prefix != sys.base_prefix
    if in_venv:
        print(f"✅ 在虚拟环境中运行")
        print(f"   虚拟环境·径: {sys.prefix}")
    else:
        print("⚠️  未在虚拟环境中运行")
        print("   建议: python -m venv .venv")
        print("   激活: source .venv/bin/activate (macOS/Linux)")
        print("         .venv\\Scripts\\Activate.ps1 (Windows)")


def check_packages() -> None:
    """检查常用开发工具是否已安装"""
    print("\n[环境检查] === 开发工具检查 ===")

    packages_to_check = [
        ("ruff", "代码检查和格式化"),
        ("ipython", "增ǿ交互式环境"),
        ("pytest", "测试框架"),
    ]

    for package_name, description in packages_to_check:
        try:
            module = importlib.import_module(package_name)
            version = getattr(module, "__version__", "版本未知")
            print(f"✅ {package_name} ({description}): {version}")
        except ImportError:
            print(f"❌ {package_name} ({description}): 未安装")
            print(f"   安装: pip install {package_name}")


def main() -> None:
    """主函数 — 运行所有环境检查"""
    print("=" * 60)
    print("🐍 Python 环境检查工具")
    print("=" * 60)

    check_python_version()
    check_os_info()
    check_virtual_environment()
    check_packages()

    print("\n" + "=" * 60)
    print("🎉 Hello, Python World! 环境检查完成。")
    print("=" * 60)


# if __name__ == "__main__" 是 Python 的惯用法
# 它确保这段代码只在直接运行脚本时执行
# 而不是在被其他模块 import 时执行
if __name__ == "__main__":
    main()
