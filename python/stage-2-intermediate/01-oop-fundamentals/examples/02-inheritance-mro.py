"""
第 1 章 示例 02：继承、super() 与 MRO
======================================

演示：
- 单继承与多态
- super() 的正确使用
- 多重继承与菱形问题
- C3 线性化（MRO）
- Mixin 模式
"""

from __future__ import annotations

import json
import logging
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


# ============================================================
# 1. 单继承与多态
# ============================================================

class Animal:
    """动物基类。"""

    def __init__(self, name: str, sound: str) -> None:
        self.name: str = name
        self.sound: str = sound
        logger.info(f"[Animal] 初始化: {name} (叫声: {sound})")

    def speak(self) -> str:
        """发出叫声。"""
        result: str = f"{self.name} says {self.sound}!"
        logger.info(f"[Animal] {result}")
        return result

    def __repr__(self) -> str:
        return f"{type(self).__name__}(name={self.name!r})"


class Dog(Animal):
    """狗 — 继承自 Animal。"""

    def __init__(self, name: str, breed: str) -> None:
        super().__init__(name, sound="Woof")
        self.breed: str = breed
        logger.info(f"[Dog] 品种: {breed}")

    def fetch(self, item: str) -> str:
        result: str = f"{self.name} fetches the {item}!"
        logger.info(f"[Dog] {result}")
        return result


class Cat(Animal):
    """猫 — 继承自 Animal。"""

    def __init__(self, name: str, indoor: bool = True) -> None:
        super().__init__(name, sound="Meow")
        self.indoor: bool = indoor
        logger.info(f"[Cat] 室内猫: {indoor}")

    def purr(self) -> str:
        result: str = f"{self.name} purrs softly..."
        logger.info(f"[Cat] {result}")
        return result


# ============================================================
# 2. 菱形继承与 MRO
# ============================================================

class Base:
    """菱形继承顶端。"""

    def greet(self) -> str:
        logger.info("[Base] greet() 被调用")
        return "Base"


class Left(Base):
    """左分支。"""

    def greet(self) -> str:
        parent: str = super().greet()
        logger.info("[Left] greet() 被调用")
        return f"Left -> {parent}"


class Right(Base):
    """右分支。"""

    def greet(self) -> str:
        parent: str = super().greet()
        logger.info("[Right] greet() 被调用")
        return f"Right -> {parent}"


class Diamond(Left, Right):
    """菱形底端 — 同时继承 Left 和 Right。"""

    def greet(self) -> str:
        parent: str = super().greet()
        logger.info("[Diamond] greet() 被调用")
        return f"Diamond -> {parent}"


# ============================================================
# 3. Mixin 模式
# ============================================================

class JsonMixin:
    """提供 JSON 序列化能力的 Mixin。"""

    def to_json(self, indent: int = 2) -> str:
        """将对象的公开属性序列化为 JSON。"""
        data: dict[str, Any] = {
            k: v for k, v in self.__dict__.items()
            if not k.startswith("_")
        }
        result: str = json.dumps(data, ensure_ascii=False, indent=indent)
        logger.info(f"[JsonMixin] 序列化 {type(self).__name__}")
        return result

    @classmethod
    def from_json(cls, json_str: str) -> Any:
        """从 JSON 字符串创建实例。"""
        data: dict[str, Any] = json.loads(json_str)
        logger.info(f"[JsonMixin] 反序列化为 {cls.__name__}")
        return cls(**data)


class ValidateMixin:
    """提供数据验证能力的 Mixin。"""

    def validate(self) -> bool:
        """检查所有公开属性是否非空。"""
        for key, value in self.__dict__.items():
            if not key.startswith("_"):
                if value is None or value == "":
                    logger.info(f"[ValidateMixin] ❌ 验证失败: {key} 为空")
                    return False
        logger.info(f"[ValidateMixin] ✅ 验证通过")
        return True


class LogMixin:
    """提供结构化日志能力的 Mixin。"""

    def log(self, message: str, level: str = "INFO") -> None:
        class_name: str = type(self).__name__
        logger.info(f"[{class_name}] [{level}] {message}")


# ✅ 组合多个 Mixin
class Product(JsonMixin, ValidateMixin, LogMixin):
    """产品模型 — 拥有 JSON、验证、日志能力。"""

    def __init__(self, name: str, price: float, category: str = "") -> None:
        self.name: str = name
        self.price: float = price
        self.category: str = category
        self.log(f"创建产品: {name}, ¥{price}")


# ============================================================
# 主程序
# ============================================================

def main() -> None:
    """运行所有示例。"""

    logger.info("=" * 60)
    logger.info("示例 1：单继承与多态")
    logger.info("=" * 60)

    animals: list[Animal] = [
        Dog("Rex", "Labrador"),
        Cat("Whiskers"),
        Dog("Buddy", "Golden Retriever"),
    ]

    for animal in animals:
        animal.speak()  # 多态：每个子类有不同的行为

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 2：菱形继承与 MRO")
    logger.info("=" * 60)

    d = Diamond()
    result: str = d.greet()
    logger.info(f"[Demo] 调用链: {result}")

    # 显示 MRO
    mro_names: list[str] = [cls.__name__ for cls in Diamond.__mro__]
    logger.info(f"[Demo] MRO: {' → '.join(mro_names)}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 3：Mixin 模式")
    logger.info("=" * 60)

    p = Product("Python Book", 49.99, "编程")
    logger.info(f"[Demo] JSON:\n{p.to_json()}")
    logger.info(f"[Demo] 验证: {p.validate()}")

    # 验证失败的例子
    p2 = Product("Empty Category", 29.99, "")
    logger.info(f"[Demo] 验证空分类: {p2.validate()}")

    # 从 JSON 反序列化
    json_str: str = '{"name": "New Book", "price": 39.99, "category": "Science"}'
    p3 = Product.from_json(json_str)
    logger.info(f"[Demo] 反序列化: {p3.to_json()}")


if __name__ == "__main__":
    main()
