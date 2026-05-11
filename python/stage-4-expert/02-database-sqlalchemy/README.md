# 绗?2 绔狅細鏁版嵁搴?鈥?SQLAlchemy / SQLModel

> *"There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors."*
> 鈥?Leon Bambrick
>
> 鑰屾暟鎹簱鏄鍥涗釜锛?*瀵硅薄-鍏崇郴鏄犲皠锛圤RM锛夋案杩滀笉瀹岀編锛屼絾浣犲繀椤诲浼氬拰瀹冨叡澶勩€?*

---

## 馃摉 鏈珷鍐呭

- [1. ORM vs Raw SQL](#1-orm-vs-raw-sql)
- [2. SQLAlchemy 2.0 澹版槑寮?API](#2-sqlalchemy-20-澹版槑寮?api)
- [3. SQLModel 鈥?SQLAlchemy + Pydantic](#3-sqlmodel--sqlalchemy--pydantic)
- [4. CRUD 涓庡叧绯绘槧灏刔(#4-crud-涓庡叧绯绘槧灏?
- [5. Alembic 鏁版嵁搴撹縼绉籡(#5-alembic-鏁版嵁搴撹縼绉?
- [6. N+1 闂涓庤В鍐砞(#6-n1-闂涓庤В鍐?
- [7. 浜嬪姟涓庤繛鎺ユ睜](#7-浜嬪姟涓庤繛鎺ユ睜)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [甯歌闄烽槺](#甯歌闄烽槺)
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?

---

## 1. ORM vs Raw SQL

> 馃 **CS Master's Bridge: ORM 鐨勬湰璐?鈥?闃绘姉涓嶅尮閰?*
>
> 鍏崇郴鏁版嵁搴撶殑涓栫晫鏄?*琛ㄥ拰琛?*锛孫OP 鐨勪笘鐣屾槸**瀵硅薄鍜屽紩鐢?*銆?> 杩欎袱涓笘鐣屼箣闂寸殑杞崲绉颁负 **Object-Relational Mapping**銆?> Ted Neward 鏇惧皢 ORM 绉颁负 "璁＄畻鏈虹瀛︾殑瓒婂崡鎴樹簤" 鈥斺€?> 鐪嬩技绠€鍗曪紝瀹炲垯鏄竴涓棤娉曞畬缇庤В鍐崇殑闂銆?>
> **涓轰粈涔堜笉瀹岀編锛?*
> - 鍏崇郴妯″瀷锛氭暟鎹€氳繃澶栭敭鍏宠仈锛孞OIN 鏌ヨ
> - 瀵硅薄妯″瀷锛氭暟鎹€氳繃寮曠敤鍏宠仈锛宍.灞炴€ 瀵艰埅
> - 缁ф壙鍦ㄥ叧绯绘暟鎹簱涓病鏈夊師鐢熷搴旂墿
> - 鍏崇郴鏌ヨ鐨勮〃杈惧姏杩滆秴瀵硅薄瀵艰埅

### 閫夊瀷鍐崇瓥

| 鍦烘櫙 | 鎺ㄨ崘 | 鍘熷洜 |
|------|------|------|
| 绠€鍗?CRUD | ORM | 寮€鍙戦€熷害蹇紝浠ｇ爜鍙读 |
| 澶嶆潅鏌ヨ | Raw SQL / Core | ORM 琛ㄨ揪鍔涗笉瓒?|
| 鎵归噺鎿嶄綔 | Raw SQL | 閬垮厤閫愯鍔犺浇鐨勫紑閿€ |
| 蹇€熷師鍨?| SQLModel | Pydantic + SQLAlchemy 涓€浣撳寲 |
| 澶у瀷椤圭洰 | SQLAlchemy ORM + Core | 鐏垫椿鍒囨崲锛屾寜闇€浣跨敤 |

```python
# 鉁?ORM 鈥?鍐欒捣鏉ュ儚鎿嶄綔瀵硅薄
user = User(name="Alice", email="alice@example.com")
session.add(user)
await session.commit()

# 鉁?Raw SQL锛堥€氳繃 SQLAlchemy Core锛夆€?瀹屽叏鎺у埗
stmt = text("SELECT * FROM users WHERE age > :min_age")
result = await session.execute(stmt, {"min_age": 18})
```

> 馃О **Toolbox: SQLAlchemy 鐨勫弻灞?API**
>
> SQLAlchemy 鎻愪緵浜嗕袱灞?API锛屾寜闇€閫夋嫨锛?>
> | 灞傜骇 | API | 閫傜敤鍦烘櫙 |
> |------|-----|---------|
> | **Core**锛堝簳灞傦級 | `select()`, `insert()`, `text()` | 澶嶆潅鏌ヨ銆佹壒閲忔搷浣溿€佺簿缁嗘帶鍒?|
> | **ORM**锛堥珮灞傦級 | `Session`, `Query`, 鏄犲皠绫?| 鏃ュ父 CRUD銆佸叧绯诲鑸?|
>
> SQLAlchemy 鐨勮璁℃櫤鎱э細浣犱笉闇€瑕佷簩閫変竴銆傚悓涓€涓」鐩腑鍙互鍚屾椂浣跨敤涓ゅ眰銆?
---

## 2. SQLAlchemy 2.0 澹版槑寮?API

> 馃寣 **The Big Picture: SQLAlchemy 鐨勬紨鍖?*
>
> SQLAlchemy 2.0 鏄竴娆￠噸澶ч噸鏋勶細
> - 1.x锛歚Query` 瀵硅薄 + 闅愬紡 session 缁戝畾
> - 2.0锛歚select()` 璇彞 + 鏄惧紡鎵ц
>
> 2.0 鐨勮璁℃洿鎺ヨ繎 SQL 鏈韩锛屽噺灏戜簡 ORM 鐨?榄旀硶"銆?
### 2.1 妯″瀷瀹氫箟

```python
import logging
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# 鉁?SQLAlchemy 2.0 澹版槑寮忓熀绫?class Base(DeclarativeBase):
    pass


class User(Base):
    """鐢ㄦ埛妯″瀷 鈥?SQLAlchemy 2.0 澹版槑寮忔槧灏?""
    __tablename__ = "users"

    # 鉁?浣跨敤 Mapped[T] + mapped_column 瀹氫箟瀛楁
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    # 鉁?鍏崇郴瀹氫箟
    posts: Mapped[list["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"User(id={self.id}, name={self.name!r}, email={self.email!r})"


class Post(Base):
    """甯栧瓙妯″瀷"""
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(String(10000), nullable=False)
    published: Mapped[bool] = mapped_column(default=False)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # 鉁?鍙嶅悜鍏崇郴
    author: Mapped["User"] = relationship(back_populates="posts")
    tags: Mapped[list["Tag"]] = relationship(
        secondary="post_tags", back_populates="posts"
    )

    def __repr__(self) -> str:
        return f"Post(id={self.id}, title={self.title!r})"
```

### 2.2 鏌ヨ API锛?.0 椋庢牸锛?
```python
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

# 鉁?2.0 椋庢牸锛氫娇鐢?select() 鏋勫缓鏌ヨ
async def get_users(session: AsyncSession, min_age: int = 0) -> list[User]:
    """鏌ヨ鐢ㄦ埛 鈥?2.0 select 椋庢牸"""
    stmt = (
        select(User)
        .where(User.age >= min_age)
        .order_by(User.name)
    )
    result = await session.execute(stmt)
    users = result.scalars().all()
    logger.info(f"[DB] 鏌ヨ鍒?{len(users)} 涓敤鎴?)
    return users

# 鉁?澶嶆潅鏌ヨ
async def search_users(
    session: AsyncSession,
    name: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
) -> list[User]:
    """鏉′欢鎼滅储"""
    stmt = select(User)
    conditions = []

    if name:
        conditions.append(User.name.ilike(f"%{name}%"))
    if min_age is not None:
        conditions.append(User.age >= min_age)
    if max_age is not None:
        conditions.append(User.age <= max_age)

    if conditions:
        stmt = stmt.where(and_(*conditions))

    result = await session.execute(stmt)
    return result.scalars().all()

# 鉁?鑱氬悎鏌ヨ
async def get_user_stats(session: AsyncSession) -> dict:
    """鐢ㄦ埛缁熻"""
    stmt = select(
        func.count(User.id).label("total"),
        func.avg(User.age).label("avg_age"),
        func.max(User.age).label("max_age"),
    )
    result = await session.execute(stmt)
    row = result.one()
    return {"total": row.total, "avg_age": float(row.avg_age or 0), "max_age": row.max_age}
```

---

## 3. SQLModel 鈥?SQLAlchemy + Pydantic

> 馃幁 **The Drama: 涓や釜涓栫晫鐨勮瀺鍚?*
>
> 鍦?FastAPI 椤圭洰涓紝浣犵粡甯搁渶瑕佸畾涔変袱浠藉嚑涔庣浉鍚岀殑妯″瀷锛?> - **Pydantic 妯″瀷**锛氱敤浜?API 楠岃瘉鍜屽簭鍒楀寲
> - **SQLAlchemy 妯″瀷**锛氱敤浜庢暟鎹簱鏄犲皠
>
> SQLModel锛堢敱 FastAPI 浣滆€呭垱寤猴級瑙ｅ喅浜嗚繖涓棶棰橈細
> 涓€涓ā鍨嬪悓鏃舵槸 Pydantic BaseModel 鍜?SQLAlchemy Model銆?
```python
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


# 鉁?SQLModel 鍚屾椂鏄?Pydantic 妯″瀷鍜?SQLAlchemy 妯″瀷
class UserBase(SQLModel):
    """鐢ㄦ埛鍩虹瀛楁 鈥?鍏变韩瀹氫箟"""
    name: str = Field(min_length=2, max_length=50)
    email: str = Field(max_length=100)
    age: int | None = Field(default=None, ge=0, le=150)

class User(UserBase, table=True):
    """鏁版嵁搴撴ā鍨?鈥?table=True 鏍囪涓烘暟鎹簱琛?""
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    posts: list["Post"] = Relationship(back_populates="author")

class UserCreate(UserBase):
    """鍒涘缓璇锋眰妯″瀷 鈥?涓嶅惈 id"""
    password: str = Field(min_length=8)

class UserResponse(UserBase):
    """鍝嶅簲妯″瀷 鈥?涓嶅惈 password"""
    id: int
    created_at: datetime

class UserUpdate(SQLModel):
    """鏇存柊璇锋眰妯″瀷 鈥?鎵€鏈夊瓧娈靛彲閫?""
    name: str | None = None
    email: str | None = None
    age: int | None = None


class Post(SQLModel, table=True):
    """甯栧瓙鏁版嵁搴撴ā鍨?""
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    content: str
    published: bool = False
    author_id: int = Field(foreign_key="user.id")
    author: User | None = Relationship(back_populates="posts")
```

> 鈿涳笍 **The Science: SQLModel 鐨勯瓟娉曞師鐞?*
>
> SQLModel 閫氳繃 Python 鍏冪被鍚屾椂缁ф壙 `pydantic.BaseModel` 鍜?`sqlalchemy.orm.DeclarativeBase`銆?> 褰?`table=True` 鏃讹紝瀹冨垱寤轰竴涓?SQLAlchemy 鏄犲皠绫伙紱
> 褰?`table=False`锛堥粯璁わ級锛屽畠鍙槸涓€涓?Pydantic 妯″瀷銆?>
> 杩欐剰鍛崇潃锛?> - `User` 瀹炰緥鍙互鐩存帴浼犵粰 `session.add()`锛圫QLAlchemy 鎺ュ彛锛?> - `User` 瀹炰緥涔熷彲浠ヨ皟鐢?`.model_dump()`锛圥ydantic 鎺ュ彛锛?> - `UserCreate` 鐢ㄤ簬 FastAPI 璇锋眰楠岃瘉锛宍UserResponse` 鐢ㄤ簬鍝嶅簲搴忓垪鍖?
---

## 4. CRUD 涓庡叧绯绘槧灏?
### 4.1 瀹屾暣 CRUD

```python
import logging
from sqlmodel import Session, select

logger = logging.getLogger(__name__)

# 鉁?Create
def create_user(session: Session, user_data: UserCreate) -> User:
    user = User(**user_data.model_dump(exclude={"password"}))
    session.add(user)
    session.commit()
    session.refresh(user)
    logger.info(f"[DB] 鍒涘缓鐢ㄦ埛: id={user.id}")
    return user

# 鉁?Read
def get_user(session: Session, user_id: int) -> User | None:
    user = session.get(User, user_id)
    logger.info(f"[DB] 鏌ヨ鐢ㄦ埛: id={user_id}, found={user is not None}")
    return user

def list_users(session: Session, skip: int = 0, limit: int = 100) -> list[User]:
    stmt = select(User).offset(skip).limit(limit)
    users = session.exec(stmt).all()
    logger.info(f"[DB] 鏌ヨ鐢ㄦ埛鍒楄〃: count={len(users)}")
    return users

# 鉁?Update
def update_user(session: Session, user_id: int, data: UserUpdate) -> User | None:
    user = session.get(User, user_id)
    if not user:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    logger.info(f"[DB] 鏇存柊鐢ㄦ埛: id={user_id}, fields={list(update_data.keys())}")
    return user

# 鉁?Delete
def delete_user(session: Session, user_id: int) -> bool:
    user = session.get(User, user_id)
    if not user:
        return False
    session.delete(user)
    session.commit()
    logger.info(f"[DB] 鍒犻櫎鐢ㄦ埛: id={user_id}")
    return True
```

### 4.2 鍏崇郴绫诲瀷

```python
# 鉁?涓€瀵瑰锛圲ser -> Posts锛?class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    posts: list["Post"] = Relationship(back_populates="author")

class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id")
    author: User | None = Relationship(back_populates="posts")

# 鉁?澶氬澶氾紙Post <-> Tag锛?class PostTagLink(SQLModel, table=True):
    """鍏宠仈琛?""
    post_id: int = Field(foreign_key="post.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)

class Tag(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)
    posts: list["Post"] = Relationship(back_populates="tags", link_model=PostTagLink)
```

---

## 5. Alembic 鏁版嵁搴撹縼绉?
> 馃О **Toolbox: 鏁版嵁搴撹縼绉荤殑閲嶈鎬?*
>
> 鐢熶骇鏁版嵁搴撲笉鑳介殢渚?`drop table`銆?> Alembic 鏄?SQLAlchemy 鐨勮縼绉诲伐鍏凤紝
> 瀹冭褰曟瘡娆?Schema 鍙樻洿锛屾敮鎸佸崌绾у拰鍥炴粴銆?
### 5.1 鍒濆鍖?
```bash
# 瀹夎
pip install alembic

# 鍒濆鍖?Alembic
alembic init alembic

# 鐢熸垚杩佺些鑴氭湰锛堣嚜鍔ㄦ娴嬫ā鍨嬪彉鍖栵級
alembic revision --autogenerate -m "create users and posts tables"

# 鎵ц杩佺些
alembic upgrade head

# 鍥炴粴涓€姝?alembic downgrade -1

# 鏌ョ湅鍘嗗彶
alembic history
```

### 5.2 閰嶇疆

```python
# alembic/env.py 鍏抽敭閰嶇疆
from src.models import SQLModel  # 瀵煎叆浣犵殑妯″瀷
target_metadata = SQLModel.metadata

# alembic.ini 鍏抽敭閰嶇疆
# sqlalchemy.url = sqlite:///./app.db
# sqlalchemy.url = postgresql+asyncpg://user:pass@localhost/dbname
```

### 5.3 杩佺些鑴氭湰绀轰緥

```python
"""create users table

Revision ID: abc123
"""
from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("email", sa.String(100), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

def downgrade() -> None:
    op.drop_index("ix_users_email", "users")
    op.drop_table("users")
```

---

## 6. N+1 闂涓庤В鍐?
> 馃幁 **The Drama: 鎬ц兘鏉€鎵?N+1**
>
> 鍋囪浣犳湁 100 涓敤鎴凤紝姣忎釜鐢ㄦ埛鏈夊笘瀛愩€?> **N+1 闂**锛氭煡璇?100 涓敤鎴烽渶瑕?1 娆℃煡璇紝
> 鐒跺悗璁块棶姣忎釜鐢ㄦ埛鐨勫笘瀛愬張闇€瑕?100 娆℃煡璇?= 101 娆?SQL锛?>
> 鍦ㄥ紑鍙戠幆澧冩劅瑙変笉鍒帮紝鐢熶骇鐜鐩存帴鎶婃暟鎹簱鎵撶垎銆?
```python
# 鉂?N+1 闂锛?01 娆℃煡璇?users = session.exec(select(User)).all()  # 1 娆℃煡璇?for user in users:
    print(user.posts)  # 姣忎釜鐢ㄦ埛瑙﹀彂 1 娆℃煡璇紒鍏?100 娆?
# 鉁?瑙ｅ喅鏂规 1锛歴electinload锛堟帹鑽愶級
from sqlalchemy.orm import selectinload

stmt = select(User).options(selectinload(User.posts))
users = session.exec(stmt).all()  # 鍙湁 2 娆℃煡璇?for user in users:
    print(user.posts)  # 宸查鍔犺浇锛屼笉瑙﹀彂棰濆鏌ヨ

# 鉁?瑙ｅ喅鏂规 2锛歫oinedload锛堝皬鏁版嵁閲忔椂锛?from sqlalchemy.orm import joinedload

stmt = select(User).options(joinedload(User.posts))
users = session.exec(stmt).all()  # 1 娆?JOIN 鏌ヨ

# 鉁?瑙ｅ喅鏂规 3锛歴ubqueryload
from sqlalchemy.orm import subqueryload

stmt = select(User).options(subqueryload(User.posts))
```

| 鍔犺浇绛栫暐 | SQL 鏁伴噺 | 閫傜敤鍦烘櫙 |
|---------|---------|---------|
| **lazy**锛堥粯璁わ級 | N+1 | 寰堝皯璁块棶鍏崇郴鏃?|
| **selectinload** | 2 | 涓€瀵瑰锛屾帹鑽愰粯璁?|
| **joinedload** | 1 (JOIN) | 涓€瀵逛竴锛屽皬鏁版嵁閲?|
| **subqueryload** | 2 | 澶ф暟鎹噺锛屽鏉傝繃婊?|

---

## 7. 浜嬪姟涓庤繛鎺ユ睜

### 7.1 浜嬪姟绠＄悊

```python
from sqlalchemy.ext.asyncio import AsyncSession

# 鉁?鏄惧紡浜嬪姟
async def transfer_funds(
    session: AsyncSession,
    from_id: int,
    to_id: int,
    amount: float,
) -> None:
    """杞处 鈥?鍘熷瓙鎿嶄綔锛岃涔堝叏鎴愬姛瑕佷箞鍏ㄥけ璐?""
    async with session.begin():  # 鑷姩鎻愪氦鎴栧洖婊?        from_account = await session.get(Account, from_id)
        to_account = await session.get(Account, to_id)

        if from_account.balance < amount:
            raise ValueError("浣欓涓嶈冻")

        from_account.balance -= amount
        to_account.balance += amount
        logger.info(f"[TX] 杞处: {from_id} -> {to_id}, 閲戦={amount}")
    # 绂诲紑 begin() 涓婁笅鏂囨椂鑷姩 commit
    # 濡傛灉鏈夊紓甯革紝鑷姩 rollback
```

### 7.2 杩炴帴姹犻厤缃?
```python
from sqlalchemy.ext.asyncio import create_async_engine

# 鉁?鐢熶骇鐜杩炴帴姹犻厤缃?engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/db",
    pool_size=20,           # 杩炴帴姹犲ぇ灏?    max_overflow=10,        # 瓒呭嚭 pool_size 鍚庣殑鏈€澶ц繛鎺ユ暟
    pool_timeout=30,        # 鑾峰彇杩炴帴鐨勮秴鏃舵椂闂达紙绉掞級
    pool_recycle=3600,      # 杩炴帴鍥炴敹鏃堕棿锛堢锛夛紝闃叉杩炴帴杩囨湡
    pool_pre_ping=True,     # 姣忔鑾峰彇杩炴帴鍓?ping 涓€涓嬶紝纭繚杩炴帴鏈夋晥
    echo=False,             # 鐢熶骇鐜鍏抽棴 SQL 鏃ュ織
)
```

> 鈿涳笍 **The Science: 杩炴帴姹犱负浠€涔堥噸瑕?*
>
> 鏁版嵁搴撹繛鎺ョ殑鍒涘缓鎴愭湰寰堥珮锛圱CP 鎻℃墜銆佽璇併€佽祫婧愬垎閰嶏級銆?> 杩炴帴姹犻鍏堝垱寤轰竴鎵硅繛鎺ワ紝璇锋眰鍒版潵鏃剁洿鎺ュ鐢ㄣ€?>
> ```
> 鏃犺繛鎺ユ睜                    鏈夎繛鎺ユ睜
> 璇锋眰1 鈫?鏂板缓杩炴帴 鈫?鍏抽棴     璇锋眰1 鈫?浠庢睜涓€?鈫?褰掕繕
> 璇锋眰2 鈫?鏂板缓杩炴帴 鈫?鍏抽棴     璇锋眰2 鈫?浠庢睜涓€?鈫?褰掕繕
> 璇锋眰3 鈫?鏂板缓杩炴帴 鈫?鍏抽棴     璇锋眰3 鈫?浠庢睜涓€?鈫?褰掕繕
> 姣忔 ~50ms 寮€閿€              姣忔 ~1ms 寮€閿€
> ```

---

## 鏈€浣冲疄璺?
### 1. 鍒嗗眰鏋舵瀯

```python
# 鉁?鎺ㄨ崘锛歊epository 妯″紡
# models/ 鈥?鏁版嵁搴撴ā鍨?# schemas/ 鈥?Pydantic 璇锋眰/鍝嶅簲妯″瀷
# repositories/ 鈥?鏁版嵁璁块棶灞傦紙SQL 鏌ヨ灏佽锛?# services/ 鈥?涓氬姟閫昏緫灞?# api/ 鈥?璺敱灞?
# 鉂?閬垮厤锛氬湪璺敱涓洿鎺ュ啓 SQL
@app.get("/users")
async def bad_list_users(session: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.age > 18).order_by(User.name)
    result = await session.execute(stmt)
    return result.scalars().all()

# 鉁?鎺ㄨ崘锛氶€氳繃 service/repository 璁块棶
@app.get("/users")
async def good_list_users(
    user_service: UserService = Depends(),
) -> list[UserResponse]:
    return await user_service.list_active_users()
```

### 2. 绱㈠紩绛栫暐

```python
class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        # 鉁?澶嶅悎绱㈠紩
        sa.Index("ix_users_name_email", "name", "email"),
        # 鉁?鍞竴绾︽潫
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
```

### 3. 鍙煡闇€瑕佺殑鍒?
```python
# 鉂?鏌ヨ鎵€鏈夊垪锛圫ELECT *锛?users = session.exec(select(User)).all()

# 鉁?鍙煡闇€瑕佺殑鍒?stmt = select(User.id, User.name).where(User.age > 18)
result = session.exec(stmt).all()
```

---

## 甯歌闄烽槺

### 闄烽槺 1锛氬繕璁?commit

```python
# 鉂?鏁版嵁娌℃湁鎸佷箙鍖?session.add(user)
# 蹇樿 session.commit()锛?
# 鉁?姝ｇ‘
session.add(user)
session.commit()
```

### 闄烽槺 2锛氬湪璇锋眰涔嬮棿鍏变韩 session

```python
# 鉂?鍏ㄥ眬 session 鈥?绾跨▼涓嶅畨鍏?global_session = Session(engine)

# 鉁?姣忎釜璇锋眰涓€涓?session
async def get_db():
    async with AsyncSession(engine) as session:
        yield session
```

### 闄烽槺 3锛氭噿鍔犺浇鍦?async 涓笉宸ヤ綔

```python
# 鉂?鍦ㄥ紓姝ヤ唬鐮佷腑锛屾噿鍔犺浇浼氭姤閿?user = await session.get(User, 1)
print(user.posts)  # MissingGreenlet error!

# 鉁?浣跨敤 selectinload 棰勫姞杞?stmt = select(User).options(selectinload(User.posts)).where(User.id == 1)
result = await session.execute(stmt)
user = result.scalar_one()
print(user.posts)  # 宸查鍔犺浇
```

---

## 缁冧範棰?
<details>
<summary><b>缁冧範 1锛氳璁″崥瀹㈡暟鎹簱</b></summary>

璁捐涓€涓崥瀹㈢郴缁熺殑鏁版嵁搴撴ā鍨嬶細
- User锛堢敤鎴凤級锛歯ame, email, bio
- Post锛堟枃绔狅級锛歵itle, content, published, author
- Comment锛堣瘎璁猴級锛歝ontent, author, post
- Tag锛堟爣绛撅級锛歯ame, posts锛堝瀵瑰锛?
瀹炵幇瀹屾暣鐨?CRUD 鎿嶄綔銆?
</details>

<details>
<summary><b>缁冧範 2锛氬疄鐜板垎椤垫煡璇?/b></summary>

瀹炵幇涓€涓€氱敤鐨勫垎椤垫煡璇㈠嚱鏁帮細
```python
async def paginate(
    session: AsyncSession,
    model: type,
    page: int = 1,
    page_size: int = 20,
    order_by: str = "id",
) -> dict:
    """杩斿洖 {items, total, page, page_size, pages}"""
    ...
```

</details>

<details>
<summary><b>缁冧範 3锛氳В鍐?N+1 闂</b></summary>

缁欏畾涓€涓湁 N+1 闂鐨勬煡璇紝鐢ㄤ笁绉嶅姞杞界瓥鐣ュ垎鍒紭鍖栵紝骞舵瘮杈?SQL 鏁伴噺銆?
</details>

---

## 鍙傝€冭祫婧?
- [SQLAlchemy 2.0 鏂囨。](https://docs.sqlalchemy.org/en/20/) 鈥?瀹樻柟鏂囨。
- [SQLModel 鏂囨。](https://sqlmodel.tiangolo.com/) 鈥?鐢?FastAPI 浣滆€呯淮鎶?- [Alembic 鏂囨。](https://alembic.sqlalchemy.org/) 鈥?杩佺些宸ュ叿
- [SQLAlchemy ORM Tutorial (2.0)](https://docs.sqlalchemy.org/en/20/tutorial/) 鈥?鍏ラ棬鏁欑▼

---

**[馃憠 绗?3 绔狅細瀹夊叏涓庤璇乚(../03-security-auth/)**

[猬咃笍 杩斿洖 Stage 4 鐩綍](../README.md)