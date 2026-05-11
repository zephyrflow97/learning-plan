"""
Pydantic 模型验证示例
=====================
演示 Pydantic V2 的模型定义、嵌套、验证器
运行: uvicorn examples.02_pydantic_models:app --reload
"""

import logging
from datetime import datetime
from enum import Enum

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pydantic Models Demo")


# --- 基础模型 ---

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"


class UserCreate(BaseModel):
    """用户创建请求模型"""
    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="用户名（仅字母、数字、下划线）",
        examples=["alice_123"],
    )
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=8, max_length=128, description="密码")
    age: int = Field(..., ge=0, le=150, description="年龄")
    role: UserRole = Field(default=UserRole.USER, description="角色")
    tags: list[str] = Field(default_factory=list, max_length=10, description="标签")

    # ✅ 字段级验证器
    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """密码强度验证"""
        if not any(c.isupper() for c in v):
            raise ValueError("密码必须包含至少一个大写字母")
        if not any(c.isdigit() for c in v):
            raise ValueError("密码必须包含至少一个数字")
        if not any(c in "!@#$%^&*()_+-=" for c in v):
            raise ValueError("密码必须包含至少一个特殊字符")
        return v

    @field_validator("tags")
    @classmethod
    def tags_unique(cls, v: list[str]) -> list[str]:
        """标签去重"""
        return list(set(v))


class UserResponse(BaseModel):
    """用户响应模型 — 注意：不包含密码"""
    id: int
    username: str
    email: EmailStr
    age: int
    role: UserRole
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """用户更新模型 — 所有字段可选"""
    username: str | None = Field(default=None, min_length=3, max_length=30)
    email: EmailStr | None = None
    age: int | None = Field(default=None, ge=0, le=150)
    tags: list[str] | None = None


# --- 嵌套模型 ---

class Address(BaseModel):
    """地址模型"""
    street: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    zip_code: str = Field(..., pattern=r"^\d{6}$", description="邮政编码（6位数字）")
    country: str = "中国"


class OrderItem(BaseModel):
    """订单项模型"""
    product_id: int = Field(..., gt=0)
    product_name: str
    quantity: int = Field(..., gt=0, le=999)
    unit_price: float = Field(..., gt=0)

    @property
    def subtotal(self) -> float:
        """小计"""
        return round(self.quantity * self.unit_price, 2)


class OrderCreate(BaseModel):
    """订单创建模型 — 展示嵌套 + 跨字段验证"""
    customer_name: str = Field(..., min_length=1)
    shipping_address: Address
    items: list[OrderItem] = Field(..., min_length=1, max_length=100)
    discount_percent: float = Field(default=0, ge=0, le=100)
    notes: str | None = None

    # ✅ 模型级验证器（跨字段验证）
    @model_validator(mode="after")
    def validate_order(self) -> "OrderCreate":
        """订单整体验证"""
        total = sum(item.quantity * item.unit_price for item in self.items)
        if total <= 0:
            raise ValueError("订单总金额必须大于 0")
        if total > 1_000_000:
            raise ValueError("单笔订单金额不能超过 100 万")
        return self


class OrderResponse(BaseModel):
    """订单响应模型"""
    id: int
    customer_name: str
    shipping_address: Address
    items: list[OrderItem]
    discount_percent: float
    total_amount: float
    created_at: datetime


# --- API 端点 ---

users_db: dict[int, dict] = {}
orders_db: dict[int, dict] = {}
next_user_id = 1
next_order_id = 1


@app.post("/users", response_model=UserResponse, status_code=201, tags=["用户"])
async def create_user(user: UserCreate) -> UserResponse:
    """创建用户 — Pydantic 自动验证所有字段"""
    global next_user_id
    logger.info(f"[Users] 创建用户: {user.username}, email={user.email}")

    # 检查用户名是否已存在
    for u in users_db.values():
        if u["username"] == user.username:
            raise HTTPException(status_code=409, detail="用户名已存在")

    user_dict = {
        "id": next_user_id,
        **user.model_dump(exclude={"password"}),  # 不存储明文密码
        "created_at": datetime.now(),
    }
    users_db[next_user_id] = user_dict
    next_user_id += 1

    logger.info(f"[Users] 用户创建成功: id={user_dict['id']}")
    return UserResponse(**user_dict)


@app.patch("/users/{user_id}", response_model=UserResponse, tags=["用户"])
async def update_user(user_id: int, user_update: UserUpdate) -> UserResponse:
    """更新用户 — 仅更新传入的字段"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")

    # ✅ exclude_unset=True — 只更新客户端传了的字段
    update_data = user_update.model_dump(exclude_unset=True)
    logger.info(f"[Users] 更新用户 id={user_id}: {update_data}")

    users_db[user_id].update(update_data)
    return UserResponse(**users_db[user_id])


@app.post("/orders", response_model=OrderResponse, status_code=201, tags=["订单"])
async def create_order(order: OrderCreate) -> OrderResponse:
    """创建订单 — 展示嵌套模型验证"""
    global next_order_id
    logger.info(
        f"[Orders] 创建订单: customer={order.customer_name}, "
        f"items={len(order.items)}"
    )

    # 计算总金额
    subtotal = sum(item.quantity * item.unit_price for item in order.items)
    total = subtotal * (1 - order.discount_percent / 100)

    order_dict = {
        "id": next_order_id,
        **order.model_dump(),
        "total_amount": round(total, 2),
        "created_at": datetime.now(),
    }
    orders_db[next_order_id] = order_dict
    next_order_id += 1

    logger.info(f"[Orders] 订单创建成功: id={order_dict['id']}, total={total:.2f}")
    return OrderResponse(**order_dict)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
