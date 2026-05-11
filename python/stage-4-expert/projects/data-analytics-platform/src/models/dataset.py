"""
Dataset SQLModel definitions
"""
from datetime import datetime
from sqlmodel import SQLModel, Field


class Dataset(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=200)
    filename: str = Field(max_length=500)
    file_type: str = Field(max_length=10)  # csv, json
    rows: int = 0
    columns: int = 0
    size_bytes: int = 0
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.now)


class DatasetCreate(SQLModel):
    name: str = Field(min_length=1, max_length=200)


class DatasetResponse(SQLModel):
    id: int
    name: str
    filename: str
    file_type: str
    rows: int
    columns: int
    size_bytes: int
    created_at: datetime
