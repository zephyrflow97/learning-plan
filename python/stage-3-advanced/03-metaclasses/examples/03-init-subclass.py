"""
__init_subclass__ — 元类的轻量替代
"""

import logging

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("InitSubclass")


# ============================================================
# 1. 自动注册插件
# ============================================================

class PluginBase:
    """插件基类 — 子类自动注册"""

    _plugins: dict[str, type] = {}

    def __init_subclass__(cls, plugin_name: str = "", **kwargs) -> None:
        super().__init_subclass__(**kwargs)
        name = plugin_name or cls.__name__
        PluginBase._plugins[name] = cls
        logger.debug("[PluginBase] 注册: %s -> %s", name, cls.__name__)

    @classmethod
    def create(cls, name: str, **kwargs):
        """工厂方法：根据名称创建插件实例"""
        plugin_cls = cls._plugins.get(name)
        if plugin_cls is None:
            raise ValueError(f"未知插件: {name}")
        return plugin_cls(**kwargs)


class JSONSerializer(PluginBase, plugin_name="json"):
    def serialize(self, data) -> str:
        import json
        return json.dumps(data)


class YAMLSerializer(PluginBase, plugin_name="yaml"):
    def serialize(self, data) -> str:
        return f"yaml: {data}"  # 简化示例


# ============================================================
# 2. 必须方法检查
# ============================================================

class RequiredMethods:
    """要求子类实现指定方法"""

    _required: list[str] = []

    def __init_subclass__(cls, required: list[str] = None, **kwargs) -> None:
        super().__init_subclass__(**kwargs)
        if required is not None:
            cls._required = required

        # 检查是否实现了所有必需方法（跳过抽象基类）
        missing = [m for m in cls._required if m not in cls.__dict__]
        if missing and not getattr(cls, '_abstract', False):
            raise TypeError(
                f"类 {cls.__name__} 缺少必需方法: {missing}"
            )


class Serializer(RequiredMethods, required=['serialize', 'deserialize'], _abstract=True):
    """序列化器接口"""
    _abstract = True


class JSONCodec(Serializer):
    def serialize(self, data):
        """序列化"""
        import json
        return json.dumps(data)

    def deserialize(self, text):
        """反序列化"""
        import json
        return json.loads(text)


def main() -> None:
    print("=" * 60)
    print("__init_subclass__ 演示")
    print("=" * 60)

    # --- 插件注册 ---
    print("\n--- 1. 自动注册插件 ---")
    print(f"已注册插件: {list(PluginBase._plugins.keys())}")

    serializer = PluginBase.create("json")
    result = serializer.serialize({"name": "Alice"})
    print(f"JSON 序列化: {result}")

    # --- 方法检查 ---
    print("\n--- 2. 必须方法检查 ---")
    codec = JSONCodec()
    data = {"key": "value"}
    encoded = codec.serialize(data)
    decoded = codec.deserialize(encoded)
    print(f"编码: {encoded}")
    print(f"解码: {decoded}")

    # 取消注释以下代码会在类定义时报错
    # class BadCodec(Serializer):
    #     def serialize(self, data): pass
    #     # 缺少 deserialize → TypeError


if __name__ == '__main__':
    main()
