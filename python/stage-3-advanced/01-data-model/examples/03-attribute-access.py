"""
属性访问三剑客 — __getattr__, __getattribute__, __setattr__
展示属性查找流程、代理模式、验证属性
"""

import logging
from typing import Any

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("AttributeAccess")


# ============================================================
# 1. __getattr__ — 后备拦截器（最常用）
# ============================================================

class DynamicConfig:
    """
    动态配置对象 — __getattr__ 演示
    真实属性从 __dict__ 获取，不存在的属性返回 None
    """

    def __init__(self, **kwargs: Any) -> None:
        for key, value in kwargs.items():
            self.__dict__[key] = value
        logger.debug("创建 DynamicConfig: %s", list(kwargs.keys()))

    def __getattr__(self, name: str) -> Any:
        """✅ 仅当常规查找失败时调用"""
        logger.debug("__getattr__ 拦截: %s（不存在）", name)
        return None  # 不存在的配置项返回 None

    def __repr__(self) -> str:
        items = ', '.join(f'{k}={v!r}' for k, v in self.__dict__.items())
        return f"DynamicConfig({items})"


# ============================================================
# 2. __getattribute__ — 全能拦截器（谨慎使用）
# ============================================================

class AuditedObject:
    """
    审计对象 — __getattribute__ 拦截所有属性访问
    ⚠️ 必须小心避免无限递归
    """

    def __init__(self, name: str, value: int) -> None:
        self.name = name
        self.value = value
        # 使用 object.__setattr__ 设置内部属性，避免触发 __setattr__ 审计
        object.__setattr__(self, '_access_log', [])

    def __getattribute__(self, name: str) -> Any:
        """✅ 每次属性访问都会经过这里"""
        # ⚠️ 不能用 self._access_log，会无限递归！
        # 必须用 object.__getattribute__ 直接访问
        if not name.startswith('_'):
            access_log = object.__getattribute__(self, '_access_log')
            access_log.append(f"读取: {name}")
            logger.debug("__getattribute__ 审计: 读取 '%s'", name)
        return object.__getattribute__(self, name)

    def get_log(self) -> list[str]:
        """获取访问日志"""
        return object.__getattribute__(self, '_access_log').copy()


# ============================================================
# 3. __setattr__ — 写入拦截器
# ============================================================

class StrictTypedObject:
    """
    严格类型对象 — __setattr__ 验证类型
    属性类型在 _schema 中声明，设置时自动验证
    """

    _schema: dict[str, type] = {
        'name': str,
        'age': int,
        'email': str,
        'score': float,
    }

    def __init__(self, **kwargs: Any) -> None:
        for key, value in kwargs.items():
            setattr(self, key, value)  # 触发 __setattr__ 验证

    def __setattr__(self, name: str, value: Any) -> None:
        """✅ 拦截属性设置，强制类型检查"""
        if name.startswith('_'):
            # 私有属性跳过验证
            super().__setattr__(name, value)
            return

        expected_type = self._schema.get(name)
        if expected_type is None:
            raise AttributeError(
                f"不允许设置属性 '{name}'，"
                f"允许的属性: {list(self._schema.keys())}"
            )
        if not isinstance(value, expected_type):
            raise TypeError(
                f"属性 '{name}' 期望 {expected_type.__name__}，"
                f"得到 {type(value).__name__}: {value!r}"
            )

        logger.debug("__setattr__ 验证通过: %s = %r (%s)", name, value, expected_type.__name__)
        super().__setattr__(name, value)

    def __repr__(self) -> str:
        attrs = {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
        items = ', '.join(f'{k}={v!r}' for k, v in attrs.items())
        return f"StrictTypedObject({items})"


# ============================================================
# 4. 代理模式 — 综合运用
# ============================================================

class LoggingProxy:
    """
    日志代理 — 将所有属性访问转发到目标对象，并记录日志
    综合使用 __getattr__ 和 __setattr__
    """

    def __init__(self, target: object) -> None:
        # ⚠️ 必须用 object.__setattr__，否则会触发我们自定义的 __setattr__
        object.__setattr__(self, '_target', target)
        object.__setattr__(self, '_log', [])
        logger.debug("创建代理，目标: %s", type(target).__name__)

    def __getattr__(self, name: str) -> Any:
        """✅ 转发属性读取到目标对象"""
        target = object.__getattribute__(self, '_target')
        log = object.__getattribute__(self, '_log')
        log.append(f"GET {name}")
        logger.debug("代理转发读取: %s.%s", type(target).__name__, name)
        return getattr(target, name)

    def __setattr__(self, name: str, value: Any) -> None:
        """✅ 转发属性写入到目标对象"""
        if name.startswith('_'):
            object.__setattr__(self, name, value)
            return
        target = object.__getattribute__(self, '_target')
        log = object.__getattribute__(self, '_log')
        log.append(f"SET {name} = {value!r}")
        logger.debug("代理转发写入: %s.%s = %r", type(target).__name__, name, value)
        setattr(target, name, value)

    def get_access_log(self) -> list[str]:
        """获取代理访问日志"""
        return object.__getattribute__(self, '_log').copy()

    def __repr__(self) -> str:
        target = object.__getattribute__(self, '_target')
        return f"LoggingProxy({target!r})"


# ============================================================
# 5. 冻结对象 — __setattr__ + __delattr__
# ============================================================

class FrozenAfterInit:
    """
    初始化后冻结 — __init__ 结束后不允许修改属性
    """

    def __init__(self, **kwargs: Any) -> None:
        for key, value in kwargs.items():
            object.__setattr__(self, key, value)
        object.__setattr__(self, '_frozen', True)
        logger.debug("对象已冻结: %s", list(kwargs.keys()))

    def __setattr__(self, name: str, value: Any) -> None:
        if getattr(self, '_frozen', False):
            raise AttributeError(
                f"对象已冻结，不能设置属性 '{name}'"
            )
        super().__setattr__(name, value)

    def __delattr__(self, name: str) -> None:
        if getattr(self, '_frozen', False):
            raise AttributeError(
                f"对象已冻结，不能删除属性 '{name}'"
            )
        super().__delattr__(name)

    def __repr__(self) -> str:
        attrs = {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
        items = ', '.join(f'{k}={v!r}' for k, v in attrs.items())
        return f"FrozenAfterInit({items})"


# ============================================================
# 演示
# ============================================================

def main() -> None:
    print("=" * 60)
    print("属性访问三剑客演示")
    print("=" * 60)

    # --- DynamicConfig ---
    print("\n--- DynamicConfig (__getattr__) ---")
    config = DynamicConfig(host="localhost", port=8080)
    print(f"config.host = {config.host}")        # 从 __dict__ 获取
    print(f"config.port = {config.port}")        # 从 __dict__ 获取
    print(f"config.timeout = {config.timeout}")  # __getattr__ → None

    # --- AuditedObject ---
    print("\n--- AuditedObject (__getattribute__) ---")
    audited = AuditedObject("test", 42)
    _ = audited.name
    _ = audited.value
    _ = audited.name
    print(f"访问日志: {audited.get_log()}")

    # --- StrictTypedObject ---
    print("\n--- StrictTypedObject (__setattr__) ---")
    obj = StrictTypedObject(name="Alice", age=30, email="alice@example.com")
    print(f"obj = {obj}")
    obj.score = 95.5  # ✅ float
    print(f"设置 score 后: {obj}")

    try:
        obj.age = "thirty"  # ❌ TypeError: 期望 int
    except TypeError as e:
        print(f"类型错误（预期）: {e}")

    try:
        obj.phone = "123"  # ❌ AttributeError: 不在 schema 中
    except AttributeError as e:
        print(f"属性错误（预期）: {e}")

    # --- LoggingProxy ---
    print("\n--- LoggingProxy (综合) ---")

    class User:
        def __init__(self, name: str, age: int) -> None:
            self.name = name
            self.age = age
        def __repr__(self) -> str:
            return f"User({self.name}, {self.age})"

    user = User("Bob", 25)
    proxy = LoggingProxy(user)
    print(f"proxy.name = {proxy.name}")    # 转发到 user.name
    proxy.age = 26                          # 转发到 user.age = 26
    print(f"user.age = {user.age}")        # 验证目标被修改
    print(f"访问日志: {proxy.get_access_log()}")

    # --- FrozenAfterInit ---
    print("\n--- FrozenAfterInit ---")
    frozen = FrozenAfterInit(x=1, y=2, z=3)
    print(f"frozen.x = {frozen.x}")  # ✅ 读取正常

    try:
        frozen.x = 10  # ❌ AttributeError: 对象已冻结
    except AttributeError as e:
        print(f"冻结错误（预期）: {e}")

    try:
        del frozen.y  # ❌ AttributeError: 对象已冻结
    except AttributeError as e:
        print(f"冻结错误（预期）: {e}")


if __name__ == '__main__':
    main()
