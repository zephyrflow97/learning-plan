# 第 2 章：数据库 — SQLAlchemy / SQLModel

> *"There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors."*
> Leon Bambrick
>
> 数据库是后端系统的长期记忆。ORM 不能消除关系模型和对象模型之间的差异，但能让常见 CRUD、关系映射和事务管理变得更可控。

## 📖 本章内容

- [1. ORM vs Raw SQL](#1-orm-vs-raw-sql)
- [2. SQLAlchemy 2.0 声明式 API](#2-sqlalchemy-20-声明式-api)
- [3. SQLModel：SQLAlchemy + Pydantic](#3-sqlmodelsqlalchemy--pydantic)
- [4. CRUD 与关系映射](#4-crud-与关系映射)
- [5. Alembic 数据库迁移](#5-alembic-数据库迁移)
- [6. N+1 问题与解决](#6-n1-问题与解决)
- [7. 事务与连接池](#7-事务与连接池)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)

---

## 1. ORM vs Raw SQL

ORM 把数据库表映射成 Python 类，把行映射成对象。它适合日常 CRUD 和关系导航；复杂报表、批量更新和性能敏感查询仍然适合写 SQL 或 SQLAlchemy Core。

| 场景 | 推荐 | 原因 |
|------|------|------|
| 简单 CRUD | ORM | 开发速度快，代码可读 |
| 复杂查询 | Raw SQL / Core | 表达力更强 |
| 批量操作 | Raw SQL / Core | 避免逐行加载 |
| FastAPI 原型 | SQLModel | Pydantic 与 SQLAlchemy 一体化 |
| 大型项目 | SQLAlchemy ORM + Core | 灵活切换 |

```python
user = User(name="Alice", email="alice@example.com")
session.add(user)
await session.commit()

stmt = text("SELECT * FROM users WHERE age > :min_age")
result = await session.execute(stmt, {"min_age": 18})
```

---

## 2. SQLAlchemy 2.0 声明式 API

SQLAlchemy 2.0 推荐使用 `select()` 语句和显式 `Session.execute()`，风格更接近 SQL 本身。

```python
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    """用户模型。"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    posts: Mapped[list["Post"]] = relationship(back_populates="author")


class Post(Base):
    """帖子模型。"""

    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(String(10_000), nullable=False)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    author: Mapped["User"] = relationship(back_populates="posts")


async def get_users(session: AsyncSession, min_age: int = 0) -> list[User]:
    stmt = select(User).where(User.age >= min_age).order_by(User.name)
    result = await session.execute(stmt)
    return list(result.scalars().all())
```

---

## 3. SQLModel：SQLAlchemy + Pydantic

SQLModel 让一个模型同时服务数据库映射和 API 数据验证，适合 FastAPI 项目原型和中小型应用。

```python
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel


class UserBase(SQLModel):
    name: str = Field(min_length=2, max_length=50)
    email: str = Field(max_length=100)
    age: int | None = Field(default=None, ge=0, le=150)


class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    posts: list["Post"] = Relationship(back_populates="author")


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserResponse(UserBase):
    id: int
    created_at: datetime


class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    content: str
    author_id: int = Field(foreign_key="user.id")
    author: User | None = Relationship(back_populates="posts")
```

---

## 4. CRUD 与关系映射

```python
from sqlmodel import Session, select


def create_user(session: Session, data: UserCreate) -> User:
    user = User.model_validate(data, update={"password_hash": "hashed"})
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_user(session: Session, user_id: int) -> User | None:
    return session.get(User, user_id)


def list_users(session: Session, offset: int = 0, limit: int = 20) -> list[User]:
    stmt = select(User).offset(offset).limit(limit)
    return list(session.exec(stmt).all())


def delete_user(session: Session, user_id: int) -> bool:
    user = session.get(User, user_id)
    if user is None:
        return False
    session.delete(user)
    session.commit()
    return True
```

---

## 5. Alembic 数据库迁移

数据库结构变更不要靠手工改库，应该用迁移脚本记录并自动执行。

```bash
alembic init migrations
alembic revision --autogenerate -m "create users table"
alembic upgrade head
alembic downgrade -1
```

迁移脚本需要进入版本控制。生产环境部署时，先备份数据库，再执行 `alembic upgrade head`。

---

## 6. N+1 问题与解决

N+1 问题指先查出 N 条主记录，再为每条记录额外查一次关联数据。

```python
from sqlalchemy.orm import selectinload


# 推荐：预加载 posts，避免每个 user 单独查询一次
stmt = select(User).options(selectinload(User.posts))
result = await session.execute(stmt)
users = result.scalars().all()
```

常用策略：

- `selectinload()`：多数一对多场景的默认选择。
- `joinedload()`：适合关联数据较少、可以接受 JOIN 的场景。
- 明确分页：不要一次加载所有数据。
- 用 SQL 日志检查实际发出了多少查询。

---

## 7. 事务与连接池

```python
async def transfer(session: AsyncSession, from_id: int, to_id: int, amount: int) -> None:
    async with session.begin():
        from_user = await session.get(User, from_id)
        to_user = await session.get(User, to_id)
        if from_user is None or to_user is None:
            raise ValueError("用户不存在")
        if from_user.balance < amount:
            raise ValueError("余额不足")
        from_user.balance -= amount
        to_user.balance += amount
```

事务用于保证一组操作要么全部成功，要么全部回滚。连接池用于复用数据库连接，避免频繁创建连接的开销。

---

## 最佳实践

- SQLAlchemy 2.0 项目优先使用 `select()` 风格 API。
- 模型层、CRUD 层、API 层分开组织。
- 生产环境必须使用迁移工具管理表结构。
- 查询列表时总是分页。
- 对关联查询主动选择 `selectinload()` 或 `joinedload()`。
- 事务边界要清晰，不要把用户交互放在事务中。

## 常见陷阱

```python
# 不推荐：循环里触发大量关联查询
for user in users:
    print(user.posts)

# 不推荐：直接拼接用户输入
stmt = text(f"SELECT * FROM users WHERE name = '{name}'")

# 推荐：参数化查询
stmt = text("SELECT * FROM users WHERE name = :name")
session.execute(stmt, {"name": name})
```

## 练习题

1. 用 SQLModel 建模 `Author` 和 `Book`，实现 CRUD。
2. 给 `Book` 增加 `published_at` 字段，并写 Alembic 迁移。
3. 构造一个 N+1 查询，再用 `selectinload()` 修复。

---

## 参考资源

- [SQLAlchemy 官方文档](https://docs.sqlalchemy.org/)
- [SQLModel 官方文档](https://sqlmodel.tiangolo.com/)
- [Alembic 官方文档](https://alembic.sqlalchemy.org/)
