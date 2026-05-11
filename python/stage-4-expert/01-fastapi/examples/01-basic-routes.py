"""
FastAPI 基础路由示例
===================
演示 FastAPI 的路由定义、路径参数、查询参数
运行: uvicorn examples.01_basic_routes:app --reload
"""

import logging
from enum import Enum

from fastapi import FastAPI, Query, Path, HTTPException

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)
logger = logging.getLogger(__name__)

# ✅ 创建 FastAPI 应用
app = FastAPI(
    title="Basic Routes Demo",
    description="FastAPI 基础路由演示",
    version="1.0.0",
)


# --- 基本路由 ---

@app.get("/", tags=["健康检查"])
async def root() -> dict[str, str]:
    """根路由 — 健康检查"""
    logger.info("[Root] 收到健康检查请求")
    return {"status": "healthy", "message": "Welcome to FastAPI!"}


@app.get("/hello/{name}", tags=["问候"])
async def say_hello(name: str) -> dict[str, str]:
    """简单路径参数"""
    logger.info(f"[Hello] 问候: name={name}")
    return {"message": f"Hello, {name}!"}


# --- 路径参数 + 类型验证 ---

@app.get("/users/{user_id}", tags=["用户"])
async def get_user(
    user_id: int = Path(..., title="用户 ID", ge=1, description="用户的唯一标识符")
) -> dict:
    """路径参数自动类型转换 — 非整数会返回 422"""
    logger.info(f"[Users] 查询用户: id={user_id}")
    # 模拟数据库查询
    fake_users = {
        1: {"id": 1, "name": "Alice", "role": "admin"},
        2: {"id": 2, "name": "Bob", "role": "user"},
    }
    if user_id not in fake_users:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    return fake_users[user_id]


# --- 枚举路径参数 ---

class SortOrder(str, Enum):
    """排序方式枚举"""
    ASC = "asc"
    DESC = "desc"

class ItemCategory(str, Enum):
    """商品分类枚举"""
    ELECTRONICS = "electronics"
    BOOKS = "books"
    CLOTHING = "clothing"
    FOOD = "food"

@app.get("/categories/{category}/items", tags=["商品"])
async def get_items_by_category(
    category: ItemCategory,
    sort: SortOrder = SortOrder.ASC,
) -> dict:
    """枚举限制路径参数 — 只接受预定义的分类"""
    logger.info(f"[Items] 按分类查询: category={category.value}, sort={sort.value}")
    return {
        "category": category.value,
        "sort_order": sort.value,
        "items": [f"示例商品 in {category.value}"],
    }


# --- 查询参数 ---

@app.get("/items", tags=["商品"])
async def list_items(
    skip: int = Query(default=0, ge=0, description="跳过的记录数"),
    limit: int = Query(default=10, ge=1, le=100, description="返回的最大记录数"),
    q: str | None = Query(default=None, min_length=1, max_length=100, description="搜索关键词"),
    in_stock: bool = Query(default=True, description="是否只显示有库存的商品"),
) -> dict:
    """查询参数 — 分页、搜索、过滤"""
    logger.info(f"[Items] 查询: skip={skip}, limit={limit}, q={q}, in_stock={in_stock}")

    # 模拟数据
    all_items = [
        {"id": i, "name": f"商品 {i}", "price": i * 10.0, "in_stock": i % 2 == 0}
        for i in range(1, 51)
    ]

    # 过滤
    results = all_items
    if in_stock:
        results = [item for item in results if item["in_stock"]]
    if q:
        results = [item for item in results if q in item["name"]]

    # 分页
    paginated = results[skip : skip + limit]

    return {
        "total": len(results),
        "skip": skip,
        "limit": limit,
        "query": q,
        "items": paginated,
    }


# --- 多路径 + 查询组合 ---

@app.get("/users/{user_id}/posts", tags=["用户"])
async def get_user_posts(
    user_id: int = Path(..., ge=1),
    published: bool = Query(default=True, description="是否只返回已发布的"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> dict:
    """路径参数 + 查询参数组合"""
    logger.info(
        f"[Posts] 查询用户帖子: user_id={user_id}, "
        f"published={published}, page={page}, page_size={page_size}"
    )
    return {
        "user_id": user_id,
        "published_only": published,
        "page": page,
        "page_size": page_size,
        "posts": [{"id": 1, "title": "My First Post", "published": True}],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
