"""
第 8 章 示例 03：行为型模式
- 策略模式（Strategy）
- 观察者模式（Observer）
- 状态机（State Machine）
"""

from __future__ import annotations

import logging
from enum import Enum, auto
from typing import Any, Callable

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


# ======================================================================
# 1. 策略模式（Strategy）— 函数即策略
# ======================================================================

# ✅ 定义不同的折扣策略（只是普通函数）
def no_discount(price: float) -> float:
    """无折扣"""
    logger.info("策略: 无折扣, 原价 %.2f", price)
    return price


def percentage_discount(percent: float) -> Callable[[float], float]:
    """百分比折扣 — 用闭包参数化策略"""
    def strategy(price: float) -> float:
        discounted = price * (1 - percent / 100)
        logger.info("策略: %d%% 折扣, %.2f → %.2f", percent, price, discounted)
        return round(discounted, 2)
    strategy.__name__ = f"percentage_{percent}%"
    return strategy


def fixed_discount(amount: float) -> Callable[[float], float]:
    """固定金额折扣"""
    def strategy(price: float) -> float:
        discounted = max(0, price - amount)
        logger.info("策略: 减 %.2f, %.2f → %.2f", amount, price, discounted)
        return round(discounted, 2)
    strategy.__name__ = f"fixed_{amount}"
    return strategy


class ShoppingCart:
    """购物车 — 使用策略模式计算价格"""

    def __init__(self) -> None:
        self._items: list[tuple[str, float]] = []
        self._discount_strategy: Callable[[float], float] = no_discount
        logger.info("购物车创建")

    def add_item(self, name: str, price: float) -> None:
        self._items.append((name, price))
        logger.info("添加商品: %s (%.2f)", name, price)

    def set_discount(self, strategy: Callable[[float], float]) -> None:
        self._discount_strategy = strategy
        logger.info("设置折扣策略: %s", getattr(strategy, "__name__", "anonymous"))

    def total(self) -> float:
        subtotal = sum(price for _, price in self._items)
        logger.info("小计: %.2f", subtotal)
        return self._discount_strategy(subtotal)


# ======================================================================
# 2. 观察者模式（Observer）
# ======================================================================

class EventBus:
    """事件总线 — 发布/订阅模式"""

    def __init__(self) -> None:
        self._subscribers: dict[str, list[Callable[..., Any]]] = {}
        logger.info("事件总线创建")

    def subscribe(self, event: str, handler: Callable[..., Any]) -> Callable[[], None]:
        """订阅事件，返回取消订阅的函数"""
        self._subscribers.setdefault(event, []).append(handler)
        logger.info("订阅: %s → %s", event, handler.__name__)

        def unsubscribe() -> None:
            self._subscribers[event].remove(handler)
            logger.info("取消订阅: %s → %s", event, handler.__name__)

        return unsubscribe

    def publish(self, event: str, **data: Any) -> None:
        """发布事件"""
        handlers = self._subscribers.get(event, [])
        logger.info("发布 '%s' → %d 个订阅者", event, len(handlers))
        for handler in handlers:
            try:
                handler(**data)
            except Exception as e:
                logger.error("处理器 %s 出错: %s", handler.__name__, e)


# 具体的观察者（处理器）
def log_handler(username: str = "", action: str = "", **kwargs: Any) -> None:
    """日志处理器"""
    print(f"  [日志] {username} 执行了 {action}")


def audit_handler(username: str = "", action: str = "", **kwargs: Any) -> None:
    """审计处理器"""
    print(f"  [审计] 记录操作: {username}/{action}")


def notification_handler(username: str = "", action: str = "", **kwargs: Any) -> None:
    """通知处理器"""
    print(f"  [通知] 向 {username} 发送操作确认")


# ======================================================================
# 3. 状态机（State Machine）
# ======================================================================

class TrafficLight(Enum):
    """交通灯状态"""
    RED = auto()
    YELLOW = auto()
    GREEN = auto()


class TrafficLightController:
    """交通灯控制器 — 状态机

    状态转换：
    RED ──next──→ GREEN ──next──→ YELLOW ──next──→ RED
    """

    TRANSITIONS: dict[TrafficLight, TrafficLight] = {
        TrafficLight.RED: TrafficLight.GREEN,
        TrafficLight.GREEN: TrafficLight.YELLOW,
        TrafficLight.YELLOW: TrafficLight.RED,
    }

    DURATIONS: dict[TrafficLight, int] = {
        TrafficLight.RED: 30,
        TrafficLight.GREEN: 25,
        TrafficLight.YELLOW: 5,
    }

    def __init__(self) -> None:
        self._state = TrafficLight.RED
        self._change_count = 0
        logger.info("交通灯初始化: %s", self._state.name)

    @property
    def state(self) -> TrafficLight:
        return self._state

    @property
    def duration(self) -> int:
        return self.DURATIONS[self._state]

    def next(self) -> None:
        """切换到下一个状态"""
        old = self._state
        self._state = self.TRANSITIONS[self._state]
        self._change_count += 1
        logger.info(
            "交通灯变化 #%d: %s → %s (持续 %d 秒)",
            self._change_count, old.name, self._state.name, self.duration,
        )

    def __repr__(self) -> str:
        return f"TrafficLight({self._state.name}, {self.duration}s)"


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    print("=" * 60)
    print("1. 策略模式")
    print("=" * 60)

    cart = ShoppingCart()
    cart.add_item("Python 编程", 89.00)
    cart.add_item("设计模式", 69.00)
    cart.add_item("算法导论", 128.00)

    print(f"\n无折扣: ¥{cart.total()}")

    cart.set_discount(percentage_discount(20))
    print(f"8 折: ¥{cart.total()}")

    cart.set_discount(fixed_discount(50))
    print(f"减 50: ¥{cart.total()}")

    # ✅ 甚至可以用 lambda
    cart.set_discount(lambda p: round(p * 0.5, 2) if p > 200 else p)
    print(f"满 200 半价: ¥{cart.total()}")

    print("\n" + "=" * 60)
    print("2. 观察者模式")
    print("=" * 60)

    bus = EventBus()

    bus.subscribe("user.action", log_handler)
    bus.subscribe("user.action", audit_handler)
    unsub = bus.subscribe("user.action", notification_handler)

    print("\n所有观察者订阅：")
    bus.publish("user.action", username="Alice", action="login")

    print("\n取消通知订阅后：")
    unsub()
    bus.publish("user.action", username="Bob", action="purchase")

    print("\n" + "=" * 60)
    print("3. 状态机")
    print("=" * 60)

    light = TrafficLightController()
    print(f"初始: {light}")

    for _ in range(6):
        light.next()
        print(f"  当前: {light}")


if __name__ == "__main__":
    main()
