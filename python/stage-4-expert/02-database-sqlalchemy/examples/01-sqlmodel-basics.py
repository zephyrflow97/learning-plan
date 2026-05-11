"""
SQLModel 鍩虹绀轰緥
==================
婕旂ず SQLModel 妯″瀷瀹氫箟銆佹暟鎹簱鍒涘缓銆佸熀鏈?CRUD
杩愯: python 01-sqlmodel-basics.py
"""

import logging
from datetime import datetime

from sqlmodel import SQLModel, Field, Session, create_engine, select

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


# --- 妯″瀷瀹氫箟 ---

class UserBase(SQLModel):
    """鐢ㄦ埛鍩虹瀛楁"""
    name: str = Field(min_length=2, max_length=50, index=True)
    email: str = Field(max_length=100, unique=True)
    age: int | None = Field(default=None, ge=0, le=150)

class User(UserBase, table=True):
    """鐢ㄦ埛鏁版嵁搴撴ā鍨?""
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)

class UserCreate(UserBase):
    """鍒涘缓璇锋眰"""
    password: str = Field(min_length=8)

class UserResponse(UserBase):
    """鍝嶅簲妯″瀷"""
    id: int
    created_at: datetime

class UserUpdate(SQLModel):
    """鏇存柊璇锋眰"""
    name: str | None = None
    email: str | None = None
    age: int | None = None


# --- 鏁版嵁搴撴搷浣?---

DATABASE_URL = "sqlite:///./demo.db"
engine = create_engine(DATABASE_URL, echo=True)


def create_tables():
    SQLModel.metadata.create_all(engine)
    logger.info("[DB] 琛ㄥ垱寤哄畬鎴?)


def create_user(user_data: UserCreate) -> User:
    user = User(**user_data.model_dump(exclude={"password"}))
    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info(f"[DB] 鍒涘缓鐢ㄦ埛: id={user.id}, name={user.name}")
    return user


def get_user(user_id: int) -> User | None:
    with Session(engine) as session:
        user = session.get(User, user_id)
        logger.info(f"[DB] 鏌ヨ鐢ㄦ埛: id={user_id}, found={user is not None}")
        return user


def list_users(skip: int = 0, limit: int = 100) -> list[User]:
    with Session(engine) as session:
        stmt = select(User).offset(skip).limit(limit)
        users = session.exec(stmt).all()
        logger.info(f"[DB] 鐢ㄦ埛鍒楄〃: count={len(users)}")
        return users


def update_user(user_id: int, data: UserUpdate) -> User | None:
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info(f"[DB] 鏇存柊鐢ㄦ埛: id={user_id}")
        return user


def delete_user(user_id: int) -> bool:
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return False
        session.delete(user)
        session.commit()
        logger.info(f"[DB] 鍒犻櫎鐢ㄦ埛: id={user_id}")
        return True


if __name__ == "__main__":
    create_tables()

    # Create
    alice = create_user(UserCreate(name="Alice", email="alice@example.com", age=30, password="Secret123!"))
    bob = create_user(UserCreate(name="Bob", email="bob@example.com", age=25, password="Secret456!"))

    # Read
    user = get_user(alice.id)
    print(f"鏌ヨ缁撴灉: {user}")

    # List
    all_users = list_users()
    print(f"鎵€鏈夌敤鎴? {all_users}")

    # Update
    updated = update_user(alice.id, UserUpdate(age=31))
    print(f"鏇存柊鍚? {updated}")

    # Delete
    deleted = delete_user(bob.id)
    print(f"鍒犻櫎 Bob: {deleted}")

    print("\n鏈€缁堢敤鎴峰垪琛?")
    for u in list_users():
        print(f"  {u}")