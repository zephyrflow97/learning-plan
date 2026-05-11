"""
MyPackage — 演示包结构的示例包。

这个 __init__.py 展示了包入口文件的最佳实践：
1. 从子模块导入核心对象
2. 定义 __all__ 控制公共 API
3. 提供包级别的元数据
"""

from mypackage.core import Calculator
from mypackage.utils import format_result

__all__: list[str] = ["Calculator", "format_result"]
__version__: str = "0.1.0"

print(f"[mypackage] v{__version__} initialized")
