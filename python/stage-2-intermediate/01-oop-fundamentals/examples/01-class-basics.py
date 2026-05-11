"""
第 1 章 示例 01：类的基础 — 定义、实例化、属性
==============================================

演示：
- 类的基本定义和文档字符串
- __init__ 初始化器
- 类属性 vs 实例属性
- 方法定义和 self 参数
"""

from __future__ import annotations

import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


# ============================================================
# 1. 基本类定义
# ============================================================

class Dog:
    """一只狗的模型。

    类属性:
        species: 物种名称（所有实例共享）

    实例属性:
        name: 狗的名字
        age: 狗的年龄
    """

    # 类属性：所有 Dog 实例共享
    species: str = "Canis familiaris"

    def __init__(self, name: str, age: int) -> None:
        """初始化一只狗。

        Args:
            name: 狗的名字
            age: 狗的年龄（岁）
        """
        self.name: str = name
        self.age: int = age
        logger.info(f"[Dog] 创建: name={name}, age={age}")

    def bark(self) -> str:
        """发出叫声。"""
        sound: str = f"{self.name} says: Woof!"
        logger.info(f"[Dog] {sound}")
        return sound

    def human_age(self) -> int:
        """计算人类等效年龄。"""
        result: int = self.age * 7
        logger.info(f"[Dog] {self.name} 的人类等效年龄: {result}")
        return result

    def __repr__(self) -> str:
        return f"Dog(name={self.name!r}, age={self.age})"

    def __str__(self) -> str:
        return f"{self.name} ({self.age}岁, {self.species})"


# ============================================================
# 2. 类属性 vs 实例属性
# ============================================================

class Counter:
    """计数器 — 演示类属性与实例属性的区别。"""

    # 类属性：被所有实例共享
    total_created: int = 0

    def __init__(self, name: str) -> None:
        # 实例属性：每个实例独立
        self.name: str = name
        self.count: int = 0
        Counter.total_created += 1
        logger.info(f"[Counter] 创建 '{name}', 全局总数: {Counter.total_created}")

    def increment(self, amount: int = 1) -> int:
        """递增计数器。"""
        self.count += amount
        logger.info(f"[Counter] '{self.name}' 计数: {self.count}")
        return self.count

    def reset(self) -> None:
        """重置计数器。"""
        old: int = self.count
        self.count = 0
        logger.info(f"[Counter] '{self.name}' 重置: {old} → 0")

    def __repr__(self) -> str:
        return f"Counter(name={self.name!r}, count={self.count})"


# ============================================================
# 3. __new__ vs __init__ — 构造器 vs 初始化器
# ============================================================

class Singleton:
    """单例模式 — 演示 __new__ 的使用。

    无论创建多少次，始终返回同一个实例。
    """

    _instance: Singleton | None = None

    def __new__(cls) -> Singleton:
        if cls._instance is None:
            logger.info(f"[Singleton] __new__: 创建新实例")
            cls._instance = super().__new__(cls)
        else:
            logger.info(f"[Singleton] __new__: 返回已有实例")
        return cls._instance

    def __init__(self) -> None:
        logger.info(f"[Singleton] __init__: 初始化")


# ============================================================
# 主程序
# ============================================================

def main() -> None:
    """运行所有示例。"""
    logger.info("=" * 60)
    logger.info("示例 1：基本类和实例化")
    logger.info("=" * 60)

    buddy = Dog("Buddy", 3)
    rex = Dog("Rex", 5)

    buddy.bark()
    rex.human_age()

    # 类属性是共享的
    logger.info(f"[Demo] buddy.species = {buddy.species}")
    logger.info(f"[Demo] Dog.species = {Dog.species}")
    logger.info(f"[Demo] buddy is rex: {buddy is rex}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 2：类属性 vs 实例属性")
    logger.info("=" * 60)

    c1 = Counter("请求计数")
    c2 = Counter("错误计数")

    c1.increment()
    c1.increment()
    c2.increment(5)

    logger.info(f"[Demo] c1.count = {c1.count}")
    logger.info(f"[Demo] c2.count = {c2.count}")
    logger.info(f"[Demo] Counter.total_created = {Counter.total_created}")

    logger.info("")
    logger.info("=" * 60)
    logger.info("示例 3：单例模式 (__new__)")
    logger.info("=" * 60)

    s1 = Singleton()
    s2 = Singleton()
    logger.info(f"[Demo] s1 is s2: {s1 is s2}")  # True


if __name__ == "__main__":
    main()
