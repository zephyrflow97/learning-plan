"""
数据验证器 — 确保数据质量
========================

提供：
- SchemaValidator: 检查字段类型
- RequiredFieldValidator: 检查必填字段
- RegexValidator: 正则表达式验证

设计要点：
- ✅ 每个验证器返回 bool，不抛异常
- ✅ 错误由管道统一收集和记录
"""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

Row = dict[str, Any]


class SchemaValidator:
    """类型校验器 — 检查字段是否为指定类型。

    用法：
        v = SchemaValidator({"name": str, "age": int, "score": float})
    """

    def __init__(self, schema: dict[str, type]) -> None:
        self.schema: dict[str, type] = schema

    def validate(self, row: Row) -> bool:
        for field_name, expected_type in self.schema.items():
            if field_name not in row:
                logger.warning(f"[SchemaValidator] 缺少字段: {field_name}")
                return False
            value = row[field_name]
            if not isinstance(value, expected_type):
                logger.warning(
                    f"[SchemaValidator] 类型错误: {field_name} 期望 "
                    f"{expected_type.__name__}, 实际 {type(value).__name__}"
                )
                return False
        return True

    def __repr__(self) -> str:
        fields = ", ".join(f"{k}: {v.__name__}" for k, v in self.schema.items())
        return f"SchemaValidator({{{fields}}})"


class RequiredFieldValidator:
    """必填字段验证器 — 检查字段存在且非空。

    用法：
        v = RequiredFieldValidator(["name", "email"])
    """

    def __init__(self, required_fields: list[str]) -> None:
        self.required_fields: list[str] = required_fields

    def validate(self, row: Row) -> bool:
        for field_name in self.required_fields:
            if field_name not in row or not row[field_name]:
                logger.warning(f"[RequiredFieldValidator] 缺少或为空: {field_name}")
                return False
        return True

    def __repr__(self) -> str:
        return f"RequiredFieldValidator({self.required_fields})"


class RegexValidator:
    """正则表达式验证器 — 检查字段值是否匹配模式。

    用法：
        v = RegexValidator("email", r"^[\w.-]+@[\w.-]+\.\w{2,}$")
    """

    def __init__(self, field_name: str, pattern: str) -> None:
        self.field_name: str = field_name
        self.pattern: re.Pattern[str] = re.compile(pattern)

    def validate(self, row: Row) -> bool:
        value = row.get(self.field_name, "")
        if not isinstance(value, str):
            value = str(value)
        if not self.pattern.match(value):
            logger.warning(
                f"[RegexValidator] {self.field_name}={value!r} 不匹配 {self.pattern.pattern}"
            )
            return False
        return True

    def __repr__(self) -> str:
        return f"RegexValidator({self.field_name!r}, {self.pattern.pattern!r})"
