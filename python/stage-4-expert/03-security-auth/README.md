# 第 3 章：安全与认证 — 守卫你的 API

> *"Security is not a product, but a process."*
> Bruce Schneier
>
> 安全不是功能清单上的一个勾选框，而是贯穿整个系统生命周期的工程纪律。认证、授权、输入验证、日志审计和最小权限都必须一起考虑。

## 📖 本章内容

- [1. 密码安全](#1-密码安全)
- [2. JWT 认证](#2-jwt-认证)
- [3. OAuth2 流程](#3-oauth2-流程)
- [4. FastAPI 安全依赖](#4-fastapi-安全依赖)
- [5. 安全防护](#5-安全防护)
- [6. Rate Limiting](#6-rate-limiting)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)

---

## 1. 密码安全

密码不能明文存储，也不应该只做普通哈希。现代系统应使用 bcrypt 或 argon2 这类“故意慢”的密码哈希算法。

| 算法 | 特点 | 推荐场景 |
|------|------|---------|
| bcrypt | 经典、广泛支持、CPU 密集 | 大多数项目 |
| argon2 | 更新、内存密集、抗 GPU | 新项目优先考虑 |

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


hashed = hash_password("MySecretPassword123!")
assert verify_password("MySecretPassword123!", hashed)
assert not verify_password("WrongPassword", hashed)
```

---

## 2. JWT 认证

JWT 适合无状态 API 和微服务。它不是加密格式，Payload 只是 Base64URL 编码，任何拿到 Token 的人都能读到里面的内容，所以不要放密码、身份证号等敏感信息。

```python
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from pydantic import BaseModel

SECRET_KEY = "change-me-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


class TokenPayload(BaseModel):
    sub: str
    exp: datetime
    type: str


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> TokenPayload:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != expected_type:
            raise JWTError("token 类型不匹配")
        return TokenPayload(**payload)
    except JWTError as exc:
        raise ValueError("无效的 Token") from exc
```

---

## 3. OAuth2 流程

OAuth2 是授权框架，不是单纯的登录协议。常见模式：

| 模式 | 适用场景 | 说明 |
|------|---------|------|
| Authorization Code | 有后端的 Web 应用 | 最常用 |
| Authorization Code + PKCE | SPA / 移动端 | 无法安全保存 client secret |
| Client Credentials | 服务间调用 | 没有用户参与 |
| Password | 自有可信客户端 | 新项目尽量避免 |

```text
用户 -> 你的应用 -> 授权服务
用户 <- 登录授权 <- 授权服务
你的后端 -> 用 code 换 token -> 授权服务
你的后端 <- access_token / refresh_token
```

---

## 4. FastAPI 安全依赖

```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = verify_token(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"id": payload.sub, "username": "alice"}


@app.post("/auth/login")
async def login(form: OAuth2PasswordRequestForm = Depends()) -> dict:
    access_token = create_access_token(user_id=form.username)
    refresh_token = create_refresh_token(user_id=form.username)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user
```

---

## 5. 安全防护

| 威胁 | 防护措施 |
|------|---------|
| SQL 注入 | ORM / 参数化查询 |
| XSS | 模板自动转义、CSP |
| CSRF | SameSite Cookie、CSRF Token |
| 密码泄露 | bcrypt / argon2 |
| 暴力破解 | Rate Limiting |
| 敏感数据泄露 | HTTPS、响应过滤、日志脱敏 |

```python
# 危险：拼接用户输入
stmt = f"SELECT * FROM users WHERE name = '{user_input}'"

# 安全：参数化查询
from sqlalchemy import text

stmt = text("SELECT * FROM users WHERE name = :name")
result = session.execute(stmt, {"name": user_input})
```

---

## 6. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)


@app.get("/api/data")
@limiter.limit("10/minute")
async def get_data(request):
    return {"data": "limited"}


@app.post("/auth/login")
@limiter.limit("5/minute")
async def login_limited(request):
    return {"status": "ok"}
```

---

## 最佳实践

- 永远不要明文存储密码。
- JWT Secret Key 使用环境变量管理，不能提交到仓库。
- Access Token 设置短有效期，Refresh Token 单独保护。
- 只在 Token 中放必要的非敏感信息。
- 所有外部输入都要验证。
- 日志不要记录密码、Token、身份证号等敏感信息。
- 生产环境必须使用 HTTPS。

## 常见陷阱

```python
# 不要把敏感信息放进 JWT Payload
payload = {"sub": "user_id", "password": "secret123"}

# 只放标识和必要声明
payload = {"sub": "user_id", "role": "admin", "exp": expire}
```

## 练习题

1. 实现用户注册、登录、刷新 Token 和获取当前用户信息。
2. 给登录接口加 Rate Limiting。
3. 给日志增加敏感字段脱敏。

---

## 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Passlib 文档](https://passlib.readthedocs.io/)
- [python-jose](https://python-jose.readthedocs.io/)
