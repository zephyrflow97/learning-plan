"""
第 8 章 示例 02：结构型模式
- 适配器（Adapter）
- 代理（Proxy）
- 装饰器模式（Decorator Pattern）
"""

from __future__ import annotations

import functools
import logging
import time
from typing import Any, Callable, TypeVar, ParamSpec

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

P = ParamSpec("P")
R = TypeVar("R")


# ======================================================================
# 1. 适配器模式（Adapter）
# ======================================================================

class OldPaymentGateway:
    """旧版支付网关 — 我们无法修改的第三方接口"""

    def make_payment(self, amount_cents: int, currency_code: str) -> dict:
        logger.info("旧网关: 支付 %d %s（分）", amount_cents, currency_code)
        return {"status": "OK", "amount": amount_cents, "currency": currency_code}


class NewPaymentGateway:
    """新版支付网关 — 接口不同"""

    def charge(self, amount: float, currency: str) -> bool:
        logger.info("新网关: 扣款 %.2f %s", amount, currency)
        return True


class PaymentAdapter:
    """适配器：统一旧/新支付网关的接口"""

    def __init__(self, gateway: Any) -> None:
        self._gateway = gateway
        self._is_old = isinstance(gateway, OldPaymentGateway)
        logger.info("支付适配器创建，包装: %s", type(gateway).__name__)

    def pay(self, amount: float, currency: str = "CNY") -> bool:
        """统一支付接口 — 元为单位"""
        if self._is_old:
            result = self._gateway.make_payment(int(amount * 100), currency)
            success = result["status"] == "OK"
        else:
            success = self._gateway.charge(amount, currency)
        logger.info("支付结果: %s (%.2f %s)", "成功" if success else "失败", amount, currency)
        return success


# ======================================================================
# 2. 代理模式（Proxy）
# ======================================================================

class DatabaseConnection:
    """真实数据库连接 — 模拟重量级对象"""

    def __init__(self, url: str) -> None:
        logger.info("建立数据库连接: %s（耗时操作）", url)
        time.sleep(0.01)  # 模拟连接耗时
        self.url = url
        self._connected = True

    def query(self, sql: str) -> list[dict[str, Any]]:
        logger.info("执行查询: %s", sql)
        return [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]

    def close(self) -> None:
        logger.info("关闭连接: %s", self.url)
        self._connected = False


class DatabaseProxy:
    """数据库代理 — 延迟连接 + 访问控制 + 缓存"""

    def __init__(self, url: str, allowed_tables: list[str] | None = None) -> None:
        self._url = url
        self._connection: DatabaseConnection | None = None
        self._allowed_tables = set(allowed_tables) if allowed_tables else None
        self._cache: dict[str, list[dict[str, Any]]] = {}
        logger.info("数据库代理创建（连接未建立）")

    def _get_connection(self) -> DatabaseConnection:
        """懒加载连接"""
        if self._connection is None:
            logger.info("首次访问，建立连接...")
            self._connection = DatabaseConnection(self._url)
        return self._connection

    def query(self, sql: str) -> list[dict[str, Any]]:
        """代理查询：访问控制 + 缓存"""
        # 访问控制
        if self._allowed_tables:
            for table in self._allowed_tables:
                if table in sql.lower():
                    break
            else:
                logger.warning("访问被拒绝: %s", sql)
                raise PermissionError(f"无权访问: {sql}")

        # 缓存
        if sql in self._cache:
            logger.info("缓存命中: %s", sql)
            return self._cache[sql]

        result = self._get_connection().query(sql)
        self._cache[sql] = result
        return result

    def close(self) -> None:
        if self._connection:
            self._connection.close()
            self._connection = None
        self._cache.clear()


# ======================================================================
# 3. 装饰器模式（Decorator Pattern）
# ======================================================================

# ✅ 用 Python 装饰器实现 GoF 装饰器模式
def log_calls(func: Callable[P, R]) -> Callable[P, R]:
    """日志装饰器 — 记录函数调用"""
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        logger.info("调用 %s(%s, %s)", func.__name__, args, kwargs)
        result = func(*args, **kwargs)
        logger.info("%s 返回: %s", func.__name__, result)
        return result
    return wrapper


def validate_positive(func: Callable[P, R]) -> Callable[P, R]:
    """参数验证装饰器 — 确保数值参数为正"""
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        for arg in args:
            if isinstance(arg, (int, float)) and arg < 0:
                raise ValueError(f"参数必须为正数，收到: {arg}")
        return func(*args, **kwargs)
    return wrapper


def cache_result(func: Callable[P, R]) -> Callable[P, R]:
    """缓存装饰器 — 缓存函数结果"""
    _cache: dict[str, Any] = {}

    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        key = f"{args}_{kwargs}"
        if key in _cache:
            logger.info("缓存命中: %s", func.__name__)
            return _cache[key]
        result = func(*args, **kwargs)
        _cache[key] = result
        return result
    return wrapper


# ✅ 叠加装饰器 — 功能层层增强
@log_calls
@validate_positive
@cache_result
def calculate_price(base_price: float, tax_rate: float) -> float:
    """计算含税价格"""
    return round(base_price * (1 + tax_rate), 2)


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    print("=" * 60)
    print("1. 适配器模式")
    print("=" * 60)

    old_gw = OldPaymentGateway()
    new_gw = NewPaymentGateway()

    adapter_old = PaymentAdapter(old_gw)
    adapter_new = PaymentAdapter(new_gw)

    adapter_old.pay(99.99)   # 旧网关
    adapter_new.pay(199.50)  # 新网关
    # 两者对外的接口完全相同

    print("\n" + "=" * 60)
    print("2. 代理模式")
    print("=" * 60)

    proxy = DatabaseProxy(
        "postgres://localhost/mydb",
        allowed_tables=["users", "orders"],
    )
    print(proxy.query("SELECT * FROM users"))  # 首次 → 建立连接
    print(proxy.query("SELECT * FROM users"))  # 缓存命中

    try:
        proxy.query("SELECT * FROM secrets")   # 被拒绝
    except PermissionError as e:
        print(f"权限错误: {e}")

    proxy.close()

    print("\n" + "=" * 60)
    print("3. 装饰器模式")
    print("=" * 60)

    price = calculate_price(100.0, 0.13)
    print(f"含税价格: {price}")

    price_cached = calculate_price(100.0, 0.13)
    print(f"缓存价格: {price_cached}")

    try:
        calculate_price(-50.0, 0.13)
    except ValueError as e:
        print(f"验证错误: {e}")


if __name__ == "__main__":
    main()
