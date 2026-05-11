"""
User SQLModel definitions
"""
from datetime import datetime
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True)
    email: str = Field(max_length=100, unique=True)
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(max_length=100)
    password: str = Field(min_length=8)


class UserResponse(SQLModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime
