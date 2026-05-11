# 第 1 章：Web 开发 — FastAPI

> *"The best code is no code at all. The second best is code that writes itself."*
> — Jeff Atwood
>
> FastAPI 实现了第二种理想：你写类型标注，它自动帮你生成数据验证、序列化和 API 文档。
> 这不是魔法——这是**类型驱动开发**的力量。

---

## 📖 本章内容

- [1. 为什么是 FastAPI](#1-为什么是-fastapi)
- [2. FastAPI vs Flask vs Django](#2-fastapi-vs-flask-vs-django)
- [3. 路由与参数](#3-路由与参数)
- [4. Pydantic 模型验证](#4-pydantic-模型验证)
- [5. 依赖注入系统](#5-依赖注入系统)
- [6. 中间件与 CORS](#6-中间件与-cors)
- [7. 异步路由](#7-异步路由)
- [8. 背景任务与 WebSocket](#8-背景任务与-websocket)
- [9. OpenAPI 自动文档](#9-openapi-自动文档)
- [10. 项目结构最佳实践](#10-项目结构最佳实践)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)

---

## 1. 为什么是 FastAPI

> 🎭 **The Drama: 一场框架革命**
>
> 2019 年之前，Python Web 框架的世界是这样的：
> - **Django** = 重型坦克：全副武装（ORM、Admin、Auth），但笨重
> - **Flask** = 瑞士军刀：轻量灵活，但什么都要自己装
>
> 然后 FastAPI 出现了。它说："为什么不能既快又全又简单？"
> 秘密武器？**Python 的类型标注不再只是文档——它们成了代码的驱动力。**

### 1.1 三大核心优势

**性能 (Performance)**

FastAPI 基于 Starlette（ASGI 框架）和 Uvicorn（ASGI 服务器），是 Python 中最快的 Web 框架之一：

| 框架 | 请求/秒 (TechEmpower) | 异步支持 | 类型安全 |
|------|----------------------|---------|---------|
| FastAPI | ~15,000+ | ✅ 原生 | ✅ 原生 |
| Flask | ~3,000 | ❌ 需扩展 | ❌ 手动 |
| Django | ~2,500 | ⚠️ 3.1+ | ❌ 手动 |
| Express (Node.js) | ~12,000 | ✅ 原生 | ❌ 需 TS |

**类型安全 (Type Safety)**

```python
# ✅ FastAPI：类型标注驱动一切
@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate) -> UserResponse:
    # user 已经过 Pydantic 验证
    # 返回值会按 UserResponse 序列化
    # OpenAPI 文档自动生成
    ...

# ❌ Flask：类型信息只在你脑子里
@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()  # 可能是 None
    # 手动验证每个字段...
    # 手动序列化返回值...
    ...
```

**开发体验 (Developer Experience)**

```python
# 一个完整的 API 只需 10 行
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items")
async def create_item(item: Item) -> Item:
    return item
# 自动获得：请求验证、响应序列化、OpenAPI 文档、Swagger UI
```

> ⚛️ **The Science: ASGI vs WSGI**
>
> Flask/Django 传统上使用 **WSGI**（Web Server Gateway Interface）：
> - 同步请求处理：一个请求占一个线程
> - 并发靠多线程/多进程
>
> FastAPI 使用 **ASGI**（Asynchronous Server Gateway Interface）：
> - 异步请求处理：一个事件循环处理数千连接
> - 类似 Node.js 的非阻塞模型
>
> ```
> WSGI (同步)                    ASGI (异步)
> ┌─────────┐                   ┌─────────┐
> │ Request │──→ Thread 1       │ Request │──→ Event Loop
> │ Request │──→ Thread 2       │ Request │──→   (单线程
> │ Request │──→ Thread 3       │ Request │──→    处理所有)
> │ Request │──→ 等待线程...     │ Request │──→
> └─────────┘                   └─────────┘
> ```
>
> ASGI 在 I/O 密集型场景（数据库查询、外部 API 调用）有巨大优势。

---

## 2. FastAPI vs Flask vs Django

> 🧠 **CS Master's Bridge: 框架选型的本质 — 约定 vs 自由**
>
> 这是软件工程中的经典权衡：
> - **Convention over Configuration**（约定优于配置）— Django 的哲学
> - **Minimal and Extensible**（最小且可扩展）— Flask 的哲学
> - **Type-Driven with Sensible Defaults**（类型驱动 + 合理默认）— FastAPI 的哲学
>
> 没有"最好"的框架，只有最适合你项目的框架。

### 选型决策树

```
你的项目需要什么？
├── 全栈 Web 应用（含前端模板、Admin 后台）
│   └── → Django（内置 ORM、Admin、Auth、模板引擎）
│
├── 微服务 / 纯 API 后端
│   ├── 需要高性能 + 类型安全？
│   │   └── → FastAPI
│   └── 团队熟悉 Flask 生态？
│       └── → Flask
│
├── 实时应用（WebSocket、Server-Sent Events）
│   └── → FastAPI（原生 ASGI 支持）
│
└── 快速原型 / 学习项目
    ├── 只需要 API → FastAPI（最少代码量）
    └── 需要前端 → Django（全包）
```

### 详细对比

| 特性 | FastAPI | Flask | Django |
|------|---------|-------|--------|
| **定位** | 现代 API 框架 | 微框架 | 全栈框架 |
| **异步** | ✅ 原生 ASGI | ❌ WSGI（需 async 扩展） | ⚠️ ASGI（3.1+） |
| **数据验证** | ✅ Pydantic 内置 | ❌ 手动/第三方 | ⚠️ Forms/DRF |
| **API 文档** | ✅ 自动 OpenAPI | ❌ 需 Flask-RESTX | ⚠️ 需 DRF |
| **ORM** | ❌ 需 SQLAlchemy | ❌ 需 SQLAlchemy | ✅ 内置 Django ORM |
| **Admin** | ❌ 需第三方 | ❌ 需第三方 | ✅ 内置 Admin |
| **学习曲线** | 中（需懂类型标注） | 低 | 高（概念多） |
| **社区生态** | ⭐ 快速增长 | ⭐⭐⭐ 成熟 | ⭐⭐⭐ 最成熟 |
| **适合场景** | API 服务、微服务 | 小型应用、原型 | 全栈 Web 应用 |

---

## 3. 路由与参数

FastAPI 的路由系统基于 Python 装饰器和类型标注。

### 3.1 基本路由

```python
import logging
from fastapi import FastAPI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="My API", version="1.0.0")

# ✅ GET 路由
@app.get("/")
async def root() -> dict[str, str]:
    """根路由 — 健康检查"""
    logger.info("[Root] 收到健康检查请求")
    return {"status": "healthy", "message": "Welcome to FastAPI!"}

# ✅ POST 路由
@app.post("/items", status_code=201)
async def create_item(name: str) -> dict[str, str]:
    """创建项目"""
    logger.info(f"[Items] 创建项目: {name}")
    return {"name": name, "status": "created"}
```

### 3.2 路径参数

```python
# ✅ 路径参数 — 自动类型转换和验证
@app.get("/users/{user_id}")
async def get_user(user_id: int) -> dict:
    """获取用户 — user_id 自动转为 int，非数字返回 422"""
    logger.info(f"[Users] 查询用户: id={user_id}")
    return {"user_id": user_id}

# ✅ 多个路径参数
@app.get("/users/{user_id}/posts/{post_id}")
async def get_user_post(user_id: int, post_id: int) -> dict:
    logger.info(f"[Posts] 查询帖子: user={user_id}, post={post_id}")
    return {"user_id": user_id, "post_id": post_id}

# ✅ 枚举路径参数
from enum import Enum

class ModelName(str, Enum):
    ALEXNET = "alexnet"
    RESNET = "resnet"
    LENET = "lenet"

@app.get("/models/{model_name}")
async def get_model(model_name: ModelName) -> dict:
    """枚举限制 — 只接受预定义的值"""
    logger.info(f"[Models] 选择模型: {model_name.value}")
    return {"model": model_name, "message": f"选择了 {model_name.value}"}
```

### 3.3 查询参数

```python
from typing import Optional

# ✅ 查询参数 — 函数参数中非路径参数的部分
@app.get("/items")
async def list_items(
    skip: int = 0,          # 默认值 = 可选参数
    limit: int = 10,         # GET /items?skip=0&limit=10
    q: str | None = None     # 可选查询参数
) -> dict:
    """列表查询 — 分页 + 搜索"""
    logger.info(f"[Items] 查询: skip={skip}, limit={limit}, q={q}")
    return {"skip": skip, "limit": limit, "query": q}

# ✅ 查询参数验证
from fastapi import Query

@app.get("/search")
async def search(
    q: str = Query(
        ...,                  # ... 表示必填
        min_length=2,         # 最少 2 个字符
        max_length=100,       # 最多 100 个字符
        regex=r"^[a-zA-Z0-9\s]+$",  # 正则验证
        description="搜索关键词"
    ),
    page: int = Query(default=1, ge=1, le=1000, description="页码")
) -> dict:
    """搜索 — 带参数验证"""
    logger.info(f"[Search] 搜索: q={q}, page={page}")
    return {"query": q, "page": page}
```

> 🧰 **Toolbox: Path vs Query 何时用哪个？**
>
> | 场景 | 用路径参数 | 用查询参数 |
> |------|-----------|-----------|
> | 资源标识 | `/users/42` | - |
> | 过滤 | - | `?status=active` |
> | 分页 | - | `?page=2&size=20` |
> | 排序 | - | `?sort=name&order=asc` |
> | 搜索 | - | `?q=python` |
> | 子资源 | `/users/42/posts` | - |
>
> **经验法则**: 路径参数标识**是什么**，查询参数描述**要怎样**。

---

## 4. Pydantic 模型验证

> 🎭 **The Drama: 数据验证的三重境界**
>
> **第一重 — 手动验证**（地狱模式）：
> ```python
> if not isinstance(data.get("name"), str): raise ValueError(...)
> if not isinstance(data.get("age"), int): raise ValueError(...)
> if data["age"] < 0: raise ValueError(...)
> # 每个字段都要写一堆 if...
> ```
>
> **第二重 — Schema 验证**（JSON Schema / Marshmallow）：
> 定义 Schema → 验证 → 序列化，但验证规则和模型定义是分开的。
>
> **第三重 — Pydantic**（涅槃）：
> 模型定义 = 验证规则 = 序列化规则 = API 文档。**一次定义，四处使用。**

### 4.1 基本模型

```python
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

# ✅ Pydantic 模型 — 声明即验证
class UserCreate(BaseModel):
    """用户创建模型 — 定义了就自动验证"""
    name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="用户名"
    )
    email: EmailStr  # 自动验证邮箱格式
    age: int = Field(..., ge=0, le=150, description="年龄")
    tags: list[str] = Field(default_factory=list, description="标签列表")

class UserResponse(BaseModel):
    """用户响应模型 — 控制哪些字段返回给客户端"""
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}  # 支持从 ORM 对象转换
```

### 4.2 嵌套模型与高级验证

```python
from pydantic import BaseModel, Field, field_validator, model_validator

class Address(BaseModel):
    """地址模型"""
    street: str
    city: str
    country: str = "China"

class OrderItem(BaseModel):
    """订单项"""
    product_id: int
    quantity: int = Field(..., gt=0, description="数量必须大于 0")
    unit_price: float = Field(..., gt=0)

    @property
    def total_price(self) -> float:
        return self.quantity * self.unit_price

class Order(BaseModel):
    """订单模型 — 展示嵌套模型 + 自定义验证"""
    customer_name: str
    shipping_address: Address          # 嵌套模型
    items: list[OrderItem]             # 嵌套列表
    discount_code: str | None = None

    # ✅ 字段级验证器
    @field_validator("customer_name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("客户名不能为空白")
        return v.strip()

    # ✅ 模型级验证器（跨字段验证）
    @model_validator(mode="after")
    def check_order_not_empty(self) -> "Order":
        if not self.items:
            raise ValueError("订单至少需要一个商品")
        return self

    @property
    def total_amount(self) -> float:
        return sum(item.total_price for item in self.items)
```

### 4.3 请求体与响应模型

```python
import logging
from fastapi import FastAPI, HTTPException

logger = logging.getLogger(__name__)
app = FastAPI()

# ✅ 分离输入/输出模型（最佳实践）
class ItemCreate(BaseModel):
    """创建时的输入"""
    name: str
    price: float = Field(..., gt=0)
    description: str | None = None

class ItemUpdate(BaseModel):
    """更新时的输入（所有字段可选）"""
    name: str | None = None
    price: float | None = Field(default=None, gt=0)
    description: str | None = None

class ItemResponse(BaseModel):
    """返回给客户端的输出"""
    id: int
    name: str
    price: float
    description: str | None
    model_config = {"from_attributes": True}

# ✅ CRUD API
items_db: dict[int, dict] = {}
next_id: int = 1

@app.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(item: ItemCreate) -> ItemResponse:
    global next_id
    logger.info(f"[Items] 创建: {item.model_dump()}")
    item_dict = {"id": next_id, **item.model_dump()}
    items_db[next_id] = item_dict
    next_id += 1
    return ItemResponse(**item_dict)

@app.patch("/items/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item: ItemUpdate) -> ItemResponse:
    logger.info(f"[Items] 更新 id={item_id}: {item.model_dump(exclude_unset=True)}")
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    # exclude_unset=True — 只更新客户端传了的字段
    update_data = item.model_dump(exclude_unset=True)
    items_db[item_id].update(update_data)
    return ItemResponse(**items_db[item_id])
```

---

## 5. 依赖注入系统

> 🧠 **CS Master's Bridge: 依赖注入（DI）的本质**
>
> 依赖注入是 SOLID 原则中 **D（Dependency Inversion）** 的实现手段：
> - **不是**你的函数去创建依赖（紧耦合）
> - **而是**外部把依赖"注入"给你（松耦合）
>
> Spring 用 XML/注解做 DI，Angular 用 Module 做 DI。
> FastAPI 用什么？**Python 的类型标注 + `Depends()`**。简单到令人发指。

### 5.1 基本依赖

```python
import logging
from fastapi import FastAPI, Depends, Query

logger = logging.getLogger(__name__)
app = FastAPI()

# ✅ 定义依赖 — 就是一个普通函数
async def common_parameters(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000)
) -> dict[str, int]:
    """通用分页参数 — 多个路由共享"""
    logger.info(f"[Deps] 分页参数: skip={skip}, limit={limit}")
    return {"skip": skip, "limit": limit}

# ✅ 使用依赖 — Depends() 注入
@app.get("/items")
async def list_items(params: dict = Depends(common_parameters)) -> dict:
    logger.info(f"[Items] 查询列表: {params}")
    return {"items": [], **params}

@app.get("/users")
async def list_users(params: dict = Depends(common_parameters)) -> dict:
    logger.info(f"[Users] 查询列表: {params}")
    return {"users": [], **params}
```

### 5.2 依赖链

```python
from fastapi import FastAPI, Depends, HTTPException, Header

# ✅ 依赖可以依赖其他依赖（依赖链）
async def get_token(authorization: str = Header(...)) -> str:
    """从 Header 提取 Token"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    return authorization.split(" ")[1]

async def get_current_user(token: str = Depends(get_token)) -> dict:
    """根据 Token 获取用户（依赖 get_token）"""
    # 实际项目中这里会解码 JWT
    if token == "invalid":
        raise HTTPException(status_code=401, detail="Invalid token")
    logger.info(f"[Auth] 用户认证成功: token={token[:8]}...")
    return {"user_id": 1, "username": "alice", "token": token}

async def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    """检查管理员权限（依赖 get_current_user）"""
    if user.get("username") != "admin":
        raise HTTPException(status_code=403, detail="Admin required")
    return user

# 依赖链：Header → get_token → get_current_user → get_admin_user
@app.get("/admin/dashboard")
async def admin_dashboard(admin: dict = Depends(get_admin_user)) -> dict:
    return {"message": f"Welcome, {admin['username']}!"}
```

### 5.3 类作为依赖

```python
# ✅ 用类实现带状态的依赖
class DatabaseSession:
    """数据库会话依赖 — 自动管理连接生命周期"""
    def __init__(self):
        self.session = None

    async def __aenter__(self):
        logger.info("[DB] 创建数据库连接")
        self.session = "fake_session"  # 实际是 AsyncSession
        return self.session

    async def __aexit__(self, *args):
        logger.info("[DB] 关闭数据库连接")
        self.session = None

# ✅ yield 依赖 — 自动清理资源
async def get_db():
    """数据库会话依赖（推荐方式）"""
    db = "fake_db_session"  # 实际: AsyncSession(engine)
    logger.info("[DB] 获取数据库会话")
    try:
        yield db
    finally:
        logger.info("[DB] 释放数据库会话")

@app.get("/data")
async def get_data(db=Depends(get_db)) -> dict:
    """使用数据库会话"""
    return {"data": "from database", "db": str(db)}
```

> 🧰 **Toolbox: FastAPI 依赖注入 vs Spring DI**
>
> | 特性 | FastAPI | Spring |
> |------|---------|--------|
> | **定义方式** | 普通函数/类 | @Component + @Autowired |
> | **注入方式** | `Depends()` | 构造函数/字段注入 |
> | **作用域** | 每次请求 | Singleton/Prototype/Request |
> | **配置** | 零配置 | XML / 注解 / Java Config |
> | **学习成本** | 5 分钟 | 5 天 |
>
> FastAPI 的 DI 简单但强大：没有容器、没有注解、没有 XML——就是函数组合。

---

## 6. 中间件与 CORS

### 6.1 自定义中间件

```python
import time
import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)
app = FastAPI()

# ✅ 请求计时中间件
@app.middleware("http")
async def timing_middleware(request: Request, call_next) -> Response:
    """记录每个请求的处理时间"""
    start_time = time.perf_counter()
    request_id = request.headers.get("X-Request-ID", "unknown")

    logger.info(
        f"[Middleware] 请求开始: "
        f"method={request.method}, path={request.url.path}, "
        f"request_id={request_id}"
    )

    response: Response = await call_next(request)

    elapsed = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = f"{elapsed:.4f}"
    response.headers["X-Request-ID"] = request_id

    logger.info(
        f"[Middleware] 请求完成: "
        f"status={response.status_code}, "
        f"elapsed={elapsed:.4f}s"
    )
    return response
```

### 6.2 CORS 配置

```python
# ✅ CORS 中间件 — 允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # 前端开发服务器
        "https://myapp.example.com",   # 生产环境
    ],
    allow_credentials=True,            # 允许携带 Cookie
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],               # 允许所有请求头
    max_age=600,                       # 预检请求缓存 10 分钟
)

# ❌ 生产环境切勿使用
# allow_origins=["*"]  # 允许所有来源 = 安全风险！
```

### 6.3 异常处理中间件

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# ✅ 全局异常处理
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    logger.error(f"[Error] ValueError: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "type": "validation_error"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"[Error] 未处理异常: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "server_error"}
    )
```

---

## 7. 异步路由

> ⚛️ **The Science: async def vs def — 何时用哪个？**
>
> FastAPI 同时支持同步和异步路由，但行为不同：
>
> ```python
> # async def — 在主事件循环中运行（不阻塞其他请求）
> @app.get("/async")
> async def async_route():
>     await asyncio.sleep(1)  # 非阻塞等待
>     return {"type": "async"}
>
> # def — 在线程池中运行（避免阻塞事件循环）
> @app.get("/sync")
> def sync_route():
>     time.sleep(1)  # 阻塞，但在单独线程中
>     return {"type": "sync"}
> ```
>
> **选择规则**：
> - 调用 `await` 的异步库（aiohttp、asyncpg）→ 用 `async def`
> - 调用同步阻塞库（requests、psycopg2）→ 用 `def`
> - 纯计算、无 I/O → 都行，`def` 更简单

### 7.1 异步数据库操作

```python
import logging
import asyncio
from fastapi import FastAPI

logger = logging.getLogger(__name__)
app = FastAPI()

# ✅ 异步路由 — 并发处理 I/O
@app.get("/dashboard")
async def get_dashboard() -> dict:
    """并发获取多个数据源 — 比串行快 N 倍"""
    logger.info("[Dashboard] 开始并发获取数据")

    # 模拟异步操作
    async def fetch_users() -> list:
        await asyncio.sleep(0.5)  # 模拟数据库查询
        return [{"id": 1, "name": "Alice"}]

    async def fetch_stats() -> dict:
        await asyncio.sleep(0.3)  # 模拟统计查询
        return {"total_users": 1000, "active": 850}

    async def fetch_notifications() -> list:
        await asyncio.sleep(0.2)  # 模拟通知查询
        return [{"msg": "New feature!"}]

    # ✅ 并发执行 — 总耗时 ≈ max(0.5, 0.3, 0.2) = 0.5s
    users, stats, notifications = await asyncio.gather(
        fetch_users(),
        fetch_stats(),
        fetch_notifications()
    )

    logger.info("[Dashboard] 数据获取完成")
    return {
        "users": users,
        "stats": stats,
        "notifications": notifications
    }

    # ❌ 串行执行 — 总耗时 = 0.5 + 0.3 + 0.2 = 1.0s
    # users = await fetch_users()
    # stats = await fetch_stats()
    # notifications = await fetch_notifications()
```

---

## 8. 背景任务与 WebSocket

### 8.1 背景任务

```python
import logging
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)
app = FastAPI()

# ✅ 背景任务 — 请求立即返回，耗时操作在后台执行
def send_email(to: str, subject: str, body: str) -> None:
    """模拟发送邮件（耗时操作）"""
    logger.info(f"[Email] 开始发送邮件: to={to}, subject={subject}")
    import time
    time.sleep(2)  # 模拟邮件发送延迟
    logger.info(f"[Email] 邮件发送完成: to={to}")

class UserRegistration(BaseModel):
    username: str
    email: EmailStr

@app.post("/register", status_code=201)
async def register_user(
    user: UserRegistration,
    background_tasks: BackgroundTasks
) -> dict:
    """用户注册 — 立即返回，邮件在后台发送"""
    logger.info(f"[Register] 新用户注册: {user.username}")

    # 添加背景任务（不阻塞响应）
    background_tasks.add_task(
        send_email,
        to=user.email,
        subject="Welcome!",
        body=f"Hello {user.username}, welcome aboard!"
    )

    # 客户端立即收到响应
    return {"message": "注册成功，确认邮件将稍后发送", "username": user.username}
```

### 8.2 WebSocket

```python
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
app = FastAPI()

# ✅ WebSocket — 实时双向通信
class ConnectionManager:
    """WebSocket 连接管理器"""
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"[WS] 新连接，当前连接数: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.remove(websocket)
        logger.info(f"[WS] 连接断开，当前连接数: {len(self.active_connections)}")

    async def broadcast(self, message: str) -> None:
        """广播消息给所有连接"""
        for connection in self.active_connections:
            await connection.send_text(message)
        logger.info(f"[WS] 广播消息: {message[:50]}...")

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def chat_endpoint(websocket: WebSocket) -> None:
    """聊天 WebSocket 端点"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"[WS] 收到消息: {data}")
            await manager.broadcast(f"用户说: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("一位用户离开了聊天室")
```

---

## 9. OpenAPI 自动文档

> 🌌 **The Big Picture: API 文档的演化**
>
> API 文档的历史：
> 1. **手写文档**（Word/Wiki）— 永远和代码不同步
> 2. **Swagger/OpenAPI 定义**（YAML/JSON）— 和代码分离，容易过时
> 3. **代码即文档**（FastAPI）— 从代码自动生成，永远同步
>
> FastAPI 的明手锏就是第三种：你的类型标注 + docstring = 自动生成的 OpenAPI 文档。

### 9.1 自定义文档元信息

```python
from fastapi import FastAPI

# ✅ 丰富的 API 元信息
app = FastAPI(
    title="Data Analytics Platform API",
    description="""
    ## 数据分析平台 API

    ### 功能
    * 📤 **数据上传** — 支持 CSV、JSON 格式
    * 📊 **自动分析** — 统计摘要、相关性分析
    * 📈 **可视化** — 图表生成 API
    * 🔐 **认证** — JWT Token 认证

    ### 认证方式
    所有需要认证的端点都需要在 Header 中携带 `Authorization: Bearer <token>`
    """,
    version="1.0.0",
    docs_url="/docs",          # Swagger UI 地址
    redoc_url="/redoc",        # ReDoc 地址
    openapi_url="/openapi.json"
)
```

### 9.2 路由标签与分组

```python
from fastapi import APIRouter

# ✅ 用 Router 组织路由
users_router = APIRouter(
    prefix="/users",
    tags=["用户管理"],        # Swagger UI 中的分组
    responses={404: {"description": "用户不存在"}}
)

@users_router.get("/", summary="获取用户列表")
async def list_users() -> list[dict]:
    """
    获取所有用户列表。

    - **skip**: 跳过的记录数
    - **limit**: 返回的最大记录数
    """
    return []

@users_router.get("/{user_id}", summary="获取单个用户")
async def get_user(user_id: int) -> dict:
    """根据 ID 获取用户详细信息。"""
    return {"id": user_id}

# 注册路由
app.include_router(users_router)
```

---

## 10. 项目结构最佳实践

> 🧘 **Zen of Code: 好的项目结构如同好的城市规划**
>
> 你不会把医院建在工厂区，也不应该把数据库逻辑放在路由文件里。
> **关注点分离**不只是设计模式——它是你保持理智的方式。

### 推荐的项目结构

```
my_project/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py             # 配置管理
│   ├── api/                  # API 路由层
│   │   ├── __init__.py
│   │   ├── router.py         # 路由汇总
│   │   ├── users.py          # 用户路由
│   │   ├── items.py          # 商品路由
│   │   └── deps.py           # 共享依赖
│   ├── models/               # 数据模型层
│   │   ├── __init__.py
│   │   ├── user.py           # User SQLModel
│   │   └── item.py           # Item SQLModel
│   ├── schemas/              # Pydantic 模型（请求/响应）
│   │   ├── __init__.py
│   │   ├── user.py           # UserCreate, UserResponse
│   │   └── item.py           # ItemCreate, ItemResponse
│   ├── services/             # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   └── item_service.py
│   ├── db/                   # 数据库层
│   │   ├── __init__.py
│   │   ├── session.py        # 数据库连接
│   │   └── migrations/       # Alembic 迁移
│   └── core/                 # 核心工具
│       ├── __init__.py
│       ├── security.py       # 认证/鉴权
│       └── logging.py        # 日志配置
├── tests/
│   ├── conftest.py           # 测试 fixtures
│   ├── test_users.py
│   └── test_items.py
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

### 主应用入口

```python
# src/main.py
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.router import api_router
from src.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ 使用 lifespan 管理启动/关闭事件
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("[App] 启动：初始化数据库连接池...")
    # 启动时：初始化资源
    yield
    # 关闭时：清理资源
    logger.info("[App] 关闭：释放数据库连接池...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# 注册中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check() -> dict:
    return {"status": "healthy"}
```

---

## 最佳实践

### 1. 分离输入/输出模型

```python
# ✅ 推荐：不同操作用不同模型
class UserCreate(BaseModel):   # POST /users 的请求体
    name: str
    email: str
    password: str              # 输入包含密码

class UserUpdate(BaseModel):   # PATCH /users/{id} 的请求体
    name: str | None = None
    email: str | None = None   # 所有字段可选

class UserResponse(BaseModel):  # 所有响应
    id: int
    name: str
    email: str                 # 输出不包含密码！
    created_at: datetime

# ❌ 避免：一个模型打天下
class User(BaseModel):
    id: int | None = None      # 创建时没有 id？
    name: str
    password: str | None = None  # 响应要不要返回密码？
```

### 2. 使用 status_code

```python
@app.post("/items", status_code=201)     # ✅ 201 Created
@app.delete("/items/{id}", status_code=204)  # ✅ 204 No Content
@app.get("/items")                        # ✅ 默认 200 OK
```

### 3. 合理使用 HTTPException

```python
from fastapi import HTTPException

# ✅ 明确的错误信息
raise HTTPException(
    status_code=404,
    detail={"message": "User not found", "user_id": user_id}
)

# ❌ 返回 200 + error 字段（反模式）
return {"error": "User not found"}  # 状态码还是 200！
```

---

## 常见陷阱

### 陷阱 1：在 async def 中使用同步阻塞调用

```python
# ❌ 错误：在 async def 中调用 requests（同步库）
@app.get("/bad")
async def bad_route():
    import requests
    response = requests.get("https://api.example.com")  # 阻塞事件循环！
    return response.json()

# ✅ 正确方案 A：用异步库
@app.get("/good-async")
async def good_async_route():
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com")
    return response.json()

# ✅ 正确方案 B：用同步 def（FastAPI 自动放到线程池）
@app.get("/good-sync")
def good_sync_route():
    import requests
    response = requests.get("https://api.example.com")
    return response.json()
```

### 陷阱 2：可变默认参数

```python
# ❌ 错误：可变默认参数被共享
class Item(BaseModel):
    tags: list[str] = []  # 所有实例共享同一个列表！

# ✅ 正确：使用 default_factory
class Item(BaseModel):
    tags: list[str] = Field(default_factory=list)
```

### 陷阱 3：忘记 await

```python
# ❌ 错误：忘记 await，返回协程对象而非结果
@app.get("/oops")
async def oops():
    result = some_async_function()  # 没有 await！
    return result  # 返回的是 coroutine 对象

# ✅ 正确
@app.get("/correct")
async def correct():
    result = await some_async_function()
    return result
```

---

## 练习题

<details>
<summary><b>练习 1：创建一个图书管理 API</b></summary>

**要求**：
1. 定义 `Book` Pydantic 模型（title, author, isbn, price, published_year）
2. 实现 CRUD 端点（GET, POST, PUT, DELETE）
3. 添加查询参数支持（按作者筛选、按价格范围筛选）
4. 添加请求计时中间件

**参考答案框架**：

```python
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Book Store API")

class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str = Field(..., min_length=1)
    isbn: str = Field(..., pattern=r"^\d{13}$")
    price: float = Field(..., gt=0)
    published_year: int = Field(..., ge=1000, le=2030)

class BookResponse(BookCreate):
    id: int

books_db: dict[int, dict] = {}
next_id = 1

@app.get("/books", response_model=list[BookResponse])
async def list_books(
    author: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
) -> list[dict]:
    results = list(books_db.values())
    if author:
        results = [b for b in results if author.lower() in b["author"].lower()]
    if min_price is not None:
        results = [b for b in results if b["price"] >= min_price]
    if max_price is not None:
        results = [b for b in results if b["price"] <= max_price]
    return results
```

</details>

<details>
<summary><b>练习 2：实现一个依赖注入链</b></summary>

**要求**：
1. 创建一个 `verify_api_key` 依赖（从 Header 中读取 API Key）
2. 创建一个 `get_current_user` 依赖（依赖 `verify_api_key`）
3. 创建一个 `require_admin` 依赖（依赖 `get_current_user`）
4. 创建受保护的管理端点

**提示**：使用 `Header()` 读取请求头，`HTTPException` 返回错误。

</details>

<details>
<summary><b>练习 3：WebSocket 实时通知</b></summary>

**要求**：
1. 创建 WebSocket 端点 `/ws/notifications`
2. 实现连接管理器（支持多用户）
3. 创建 POST 端点发送通知，通知通过 WebSocket 推送给所有连接的客户端

</details>

---

## 参考资源

- [FastAPI 官方文档](https://fastapi.tiangolo.com/) — 最好的学习资源
- [FastAPI 官方教程](https://fastapi.tiangolo.com/tutorial/) — 循序渐进
- [Pydantic V2 文档](https://docs.pydantic.dev/) — 数据验证
- [Starlette 文档](https://www.starlette.io/) — FastAPI 的底层框架
- [httpx 文档](https://www.python-httpx.org/) — 异步 HTTP 客户端
- [uvicorn 文档](https://www.uvicorn.org/) — ASGI 服务器

---

**[👉 第 2 章：数据库 — SQLAlchemy / SQLModel](../02-database-sqlalchemy/)**

[⬅️ 返回 Stage 4 目录](../README.md)
