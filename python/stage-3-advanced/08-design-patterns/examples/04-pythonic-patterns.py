"""
第 8 章 示例 04：Python 特色模式
- Mixin 模式
- 猴子补丁（Monkey Patching）
- 鸭子类型替代接口
- 上下文管理器模式
"""

from __future__ import annotations

import json
import logging
import time
from contextlib import contextmanager
from typing import Any, Generator

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


# ======================================================================
# 1. Mixin 模式
# ======================================================================

class TimestampMixin:
    """时间戳 Mixin — 自动记录创建和更新时间"""

    def __init_subclass__(cls, **kwargs: Any) -> None:
        super().__init_subclass__(**kwargs)
        original_init = cls.__init__

        def new_init(self: Any, *args: Any, **kw: Any) -> None:
            original_init(self, *args, **kw)
            self.created_at = time.time()
            self.updated_at = time.time()
            logger.info("%s 时间戳已初始化", type(self).__name__)

        cls.__init__ = new_init  # type: ignore[attr-defined]


class SerializeMixin:
    """序列化 Mixin — JSON 序列化/反序列化"""

    def to_dict(self) -> dict[str, Any]:
        data = {}
        for k, v in self.__dict__.items():
            if not k.startswith("_"):
                data[k] = v
        return data

    def to_json(self) -> str:
        logger.info("序列化 %s", type(self).__name__)
        return json.dumps(self.to_dict(), ensure_ascii=False, default=str)


class RepresentMixin:
    """表示 Mixin — 自动生成 __repr__"""

    def __repr__(self) -> str:
        attrs = ", ".join(
            f"{k}={v!r}"
            for k, v in self.__dict__.items()
            if not k.startswith("_")
        )
        return f"{type(self).__name__}({attrs})"


# ✅ 组合 Mixin — 每个 Mixin 提供独立的功能切面
class Product(TimestampMixin, SerializeMixin, RepresentMixin):
    """产品类 — 通过 Mixin 组合获得多种能力"""

    def __init__(self, name: str, price: float) -> None:
        self.name = name
        self.price = price


# ======================================================================
# 2. 猴子补丁（Monkey Patching）
# ======================================================================

class ExternalService:
    """模拟外部服务（不可修改源码）"""

    def fetch_data(self) -> dict[str, Any]:
        logger.info("从真实 API 获取数据")
        return {"source": "production", "count": 42}

    def submit(self, data: Any) -> bool:
        logger.info("提交到真实 API: %s", data)
        return True


def demo_monkey_patching() -> None:
    """演示猴子补丁 — 在测试中替换行为"""

    service = ExternalService()
    print(f"  原始: {service.fetch_data()}")

    # ✅ 保存原始方法
    original_fetch = ExternalService.fetch_data

    # 替换为模拟方法
    def mock_fetch(self: ExternalService) -> dict[str, Any]:
        logger.info("猴子补丁: 返回模拟数据")
        return {"source": "mock", "count": 0}

    ExternalService.fetch_data = mock_fetch  # type: ignore[assignment]
    print(f"  补丁后: {service.fetch_data()}")

    # ✅ 恢复原始方法
    ExternalService.fetch_data = original_fetch  # type: ignore[assignment]
    print(f"  恢复后: {service.fetch_data()}")


# ======================================================================
# 3. 鸭子类型替代接口
# ======================================================================

# ✅ 不需要共同基类，只要有相同的方法签名即可

class ConsoleLogger:
    """控制台日志器"""
    def write(self, msg: str) -> None:
        print(f"[Console] {msg}")


class FileLogger:
    """文件日志器（模拟）"""
    def __init__(self) -> None:
        self._buffer: list[str] = []

    def write(self, msg: str) -> None:
        self._buffer.append(msg)
        print(f"[File] {msg} (buffered: {len(self._buffer)})")


class NetworkLogger:
    """网络日志器（模拟）"""
    def write(self, msg: str) -> None:
        print(f"[Network → remote] {msg}")


def log_message(writer: Any, level: str, msg: str) -> None:
    """任何有 write 方法的对象都行 — 鸭子类型"""
    formatted = f"[{level.upper()}] {msg}"
    writer.write(formatted)


# ======================================================================
# 4. 上下文管理器模式
# ======================================================================

class Transaction:
    """事务上下文管理器 — 模拟数据库事务"""

    def __init__(self, name: str) -> None:
        self.name = name
        self.operations: list[str] = []

    def __enter__(self) -> Transaction:
        logger.info("事务 '%s' 开始", self.name)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: Any,
    ) -> bool:
        if exc_type is None:
            logger.info("事务 '%s' 提交 (%d 个操作)", self.name, len(self.operations))
            print(f"  ✅ 事务提交: {self.operations}")
        else:
            logger.warning("事务 '%s' 回滚 (原因: %s)", self.name, exc_val)
            print(f"  ❌ 事务回滚: {exc_val}")
        return True  # 吞掉异常

    def add(self, operation: str) -> None:
        self.operations.append(operation)
        logger.info("添加操作: %s", operation)


@contextmanager
def temp_config(overrides: dict[str, Any]) -> Generator[dict[str, Any], None, None]:
    """临时配置上下文管理器"""
    original: dict[str, Any] = {"debug": False, "timeout": 30}
    merged = {**original, **overrides}
    logger.info("临时配置: %s", merged)
    try:
        yield merged
    finally:
        logger.info("配置已恢复")


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    print("=" * 60)
    print("1. Mixin 模式")
    print("=" * 60)

    product = Product("Python 书籍", 89.99)
    print(f"  repr: {product!r}")
    print(f"  json: {product.to_json()}")
    print(f"  有时间戳: created_at={product.created_at:.0f}")

    print("\n" + "=" * 60)
    print("2. 猴子补丁")
    print("=" * 60)
    demo_monkey_patching()

    print("\n" + "=" * 60)
    print("3. 鸭子类型")
    print("=" * 60)

    loggers = [ConsoleLogger(), FileLogger(), NetworkLogger()]
    for lgr in loggers:
        log_message(lgr, "info", "系统启动")

    print("\n" + "=" * 60)
    print("4. 上下文管理器")
    print("=" * 60)

    # 成功的事务
    with Transaction("用户注册") as tx:
        tx.add("INSERT INTO users ...")
        tx.add("INSERT INTO profiles ...")

    # 失败的事务
    with Transaction("转账") as tx:
        tx.add("UPDATE accounts SET balance = ...")
        raise ValueError("余额不足")

    # 生成器式上下文管理器
    with temp_config({"debug": True, "timeout": 5}) as cfg:
        print(f"  临时配置: {cfg}")


if __name__ == "__main__":
    main()
