"""
鏁版嵁妯″瀷 鈥?浠诲姟鐨勬暟鎹粨鏋勫畾涔?
浣跨敤 dataclass 瀹氫箟浠诲姟妯″瀷锛屽寘鍚被鍨嬫爣娉ㄥ拰榛樿鍊笺€?"""
from dataclasses import dataclass, field, asdict
from datetime import datetime, date
from enum import Enum


class Priority(Enum):
    """浠诲姟浼樺厛绾?""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Status(Enum):
    """浠诲姟鐘舵€?""
    PENDING = "pending"
    DONE = "done"


@dataclass
class Task:
    """浠诲姟鏁版嵁妯″瀷

    Attributes:
        id: 浠诲姟鍞竴鏍囪瘑
        title: 浠诲姟鏍囬
        description: 浠诲姟鎻忚堪
        priority: 浼樺厛绾?(low/medium/high)
        status: 鐘舵€?(pending/done)
        created_at: 鍒涘缓鏃堕棿
        due_date: 鎴鏃ユ湡锛堝彲閫夛級
    """
    id: int
    title: str
    description: str = ""
    priority: str = "medium"
    status: str = "pending"
    created_at: str = ""
    due_date: str = ""

    def __post_init__(self) -> None:
        """鍒濆鍖栧悗澶勭悊"""
        if not self.created_at:
            self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def to_dict(self) -> dict:
        """杞崲涓哄瓧鍏革紙鐢ㄤ簬 JSON 搴忓垪鍖栵級"""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Task":
        """浠庡瓧鍏稿垱寤轰换鍔?""
        return cls(**data)

    @property
    def is_overdue(self) -> bool:
        """妫€鏌ユ槸鍚﹁繃鏈?""
        if not self.due_date or self.status == "done":
            return False
        try:
            due = date.fromisoformat(self.due_date)
            return due < date.today()
        except ValueError:
            return False

    def __str__(self) -> str:
        """鍙嬪ソ鐨勫瓧绗︿覆琛ㄧず"""
        status_icon = "鉁? if self.status == "done" else "猬?
        priority_icon = {"high": "馃敶", "medium": "馃煛", "low": "馃煝"}.get(
            self.priority, "鈿?
        )
        parts = [f"{status_icon} [{self.id}] {priority_icon} {self.title}"]
        if self.description:
            parts.append(f"   馃摑 {self.description}")
        if self.due_date:
            overdue = " 鈿狅笍 杩囨湡!" if self.is_overdue else ""
            parts.append(f"   馃搮 鎴: {self.due_date}{overdue}")
        return "\n".join(parts)