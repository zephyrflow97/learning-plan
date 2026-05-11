"""
第 8 章 示例 01：创建型模式
- 工厂方法（Factory Method）
- 建造者（Builder）
- 单例即模块（Singleton as Module）
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any, Protocol

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


# ======================================================================
# 1. 工厂方法（Factory Method）
# ======================================================================

class Notification(Protocol):
    """通知协议 — 所有通知类型必须实现 send"""
    def send(self, message: str) -> None: ...


class EmailNotification:
    """邮件通知"""
    def __init__(self, recipient: str) -> None:
        self.recipient = recipient

    def send(self, message: str) -> None:
        logger.info("[Email → %s] %s", self.recipient, message)


class SMSNotification:
    """短信通知"""
    def __init__(self, phone: str) -> None:
        self.phone = phone

    def send(self, message: str) -> None:
        logger.info("[SMS → %s] %s", self.phone, message)


class PushNotification:
    """推送通知"""
    def __init__(self, device_token: str) -> None:
        self.device_token = device_token

    def send(self, message: str) -> None:
        logger.info("[Push → %s] %s", self.device_token[:8], message)


# ✅ 工厂函数 — 简单直接
def create_notification(
    channel: str, **kwargs: Any
) -> Notification:
    """工厂函数：根据渠道创建通知对象"""
    factories: dict[str, type] = {
        "email": EmailNotification,
        "sms": SMSNotification,
        "push": PushNotification,
    }
    cls = factories.get(channel.lower())
    if cls is None:
        raise ValueError(f"不支持的通知渠道: {channel}")
    logger.info("工厂创建 %s 通知", channel)
    return cls(**kwargs)


# ❌ 反面：不要为每种类型写一个工厂类
# class EmailNotificationFactory:
#     def create(self, **kwargs): return EmailNotification(**kwargs)
# class SMSNotificationFactory:
#     def create(self, **kwargs): return SMSNotification(**kwargs)


# ======================================================================
# 2. 建造者（Builder）
# ======================================================================

@dataclass
class QueryResult:
    """数据库查询结果"""
    table: str = ""
    columns: list[str] = field(default_factory=list)
    conditions: list[str] = field(default_factory=list)
    order_by: str | None = None
    limit: int | None = None


class QueryBuilder:
    """SQL 查询建造者 — 链式 API"""

    def __init__(self) -> None:
        self._table: str = ""
        self._columns: list[str] = []
        self._conditions: list[str] = []
        self._order_by: str | None = None
        self._limit: int | None = None

    def from_table(self, table: str) -> QueryBuilder:
        self._table = table
        logger.info("构建查询: FROM %s", table)
        return self

    def select(self, *columns: str) -> QueryBuilder:
        self._columns.extend(columns)
        logger.info("构建查询: SELECT %s", ", ".join(columns))
        return self

    def where(self, condition: str) -> QueryBuilder:
        self._conditions.append(condition)
        logger.info("构建查询: WHERE %s", condition)
        return self

    def order(self, column: str) -> QueryBuilder:
        self._order_by = column
        return self

    def take(self, count: int) -> QueryBuilder:
        self._limit = count
        return self

    def build(self) -> str:
        """构建 SQL 字符串"""
        if not self._table:
            raise ValueError("必须指定表名")
        cols = ", ".join(self._columns) if self._columns else "*"
        sql = f"SELECT {cols} FROM {self._table}"
        if self._conditions:
            sql += " WHERE " + " AND ".join(self._conditions)
        if self._order_by:
            sql += f" ORDER BY {self._order_by}"
        if self._limit:
            sql += f" LIMIT {self._limit}"
        logger.info("构建完成: %s", sql)
        return sql


# ======================================================================
# 3. 单例即模块（Singleton as Module）
# ======================================================================

# 模块级状态 — 天然单例
_app_config: dict[str, Any] = {}


def config_load(data: dict[str, Any]) -> None:
    """加载配置"""
    global _app_config
    _app_config = data.copy()
    logger.info("配置已加载，共 %d 项", len(_app_config))


def config_get(key: str, default: Any = None) -> Any:
    """获取配置项"""
    value = _app_config.get(key, default)
    logger.info("读取配置 %s = %s", key, value)
    return value


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    print("=" * 60)
    print("1. 工厂方法")
    print("=" * 60)

    email = create_notification("email", recipient="alice@example.com")
    email.send("你有新消息！")

    sms = create_notification("sms", phone="13800138000")
    sms.send("验证码: 123456")

    push = create_notification("push", device_token="abc123xyz789")
    push.send("APP 有新版本")

    print("\n" + "=" * 60)
    print("2. 建造者")
    print("=" * 60)

    query = (
        QueryBuilder()
        .from_table("users")
        .select("name", "email", "age")
        .where("age > 18")
        .where("status = 'active'")
        .order("name")
        .take(10)
        .build()
    )
    print(f"SQL: {query}")

    print("\n" + "=" * 60)
    print("3. 模块级单例")
    print("=" * 60)

    config_load({"db_url": "postgres://localhost/mydb", "debug": True})
    print(f"db_url = {config_get('db_url')}")
    print(f"debug = {config_get('debug')}")
    print(f"missing = {config_get('missing', 'default_value')}")


if __name__ == "__main__":
    main()
