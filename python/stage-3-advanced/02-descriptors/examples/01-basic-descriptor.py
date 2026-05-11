"""
描述器基础 — __get__, __set__, __delete__ 协议演示
展示数据描述器与非数据描述器的区别
"""

import logging
from typing import Any

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("BasicDescriptor")


# ============================================================
# 1. 最简描述器 — 观察属性访问
# ============================================================

class Verbose:
    """✅ 观察所有属性访问的描述器"""

    def __init__(self, name: str) -> None:
        self.name = name

    def __get__(self, obj: Any, objtype: type = None) -> Any:
        if obj is None:
            logger.debug("[Verbose] 类级别访问 %s，返回描述器本身", self.name)
            return self
        value = obj.__dict__.get(self.name)
        logger.debug("[Verbose] __get__: %s.%s = %r", type(obj).__name__, self.name, value)
        return value

    def __set__(self, obj: Any, value: Any) -> None:
        logger.debug("[Verbose] __set__: %s.%s = %r", type(obj).__name__, self.name, value)
        obj.__dict__[self.name] = value

    def __delete__(self, obj: Any) -> None:
        logger.debug("[Verbose] __delete__: %s.%s", type(obj).__name__, self.name)
        del obj.__dict__[self.name]


# ============================================================
# 2. 数据描述器 vs 非数据描述器
# ============================================================

class DataDescriptor:
    """✅ 数据描述器 — 实现了 __get__ 和 __set__"""

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get('_data_val', '(默认值)')

    def __set__(self, obj, value):
        logger.debug("[DataDescriptor] __set__: %r", value)
        obj.__dict__['_data_val'] = value


class NonDataDescriptor:
    """✅ 非数据描述器 — 只实现了 __get__"""

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        logger.debug("[NonDataDescriptor] __get__")
        return "来自非数据描述器的值"


class PriorityDemo:
    """演示描述器优先级"""
    data = DataDescriptor()
    non_data = NonDataDescriptor()


# ============================================================
# 演示
# ============================================================

def main() -> None:
    print("=" * 60)
    print("描述器基础演示")
    print("=" * 60)

    # --- 基础描述器 ---
    print("\n--- 1. Verbose 描述器 ---")

    class Config:
        host = Verbose('host')
        port = Verbose('port')

    config = Config()
    config.host = "localhost"
    config.port = 8080
    print(f"host = {config.host}")
    print(f"port = {config.port}")

    # 类级别访问
    print(f"Config.host = {Config.host}")

    # 删除属性
    del config.host
    print(f"删除后 host = {config.host}")

    # --- 优先级演示 ---
    print("\n--- 2. 数据 vs 非数据描述器优先级 ---")
    obj = PriorityDemo()

    obj.data = "通过描述器设置"
    print(f"obj.data = {obj.data}")

    # 直接写入 __dict__
    obj.__dict__['data'] = "直接写入 __dict__"
    print(f"__dict__['data'] 后: obj.data = {obj.data}")
    print("  → 数据描述器仍然优先！")

    # 非数据描述器
    print(f"\nobj.non_data = {obj.non_data}")
    obj.__dict__['non_data'] = "直接写入 __dict__"
    print(f"__dict__['non_data'] 后: obj.non_data = {obj.non_data}")
    print("  → 实例 __dict__ 覆盖了非数据描述器！")


if __name__ == '__main__':
    main()
