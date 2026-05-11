"""
mypy 配置实战示例。

配合 mypy.ini 使用，演示各种类型检查场景。

运行 mypy:
    cd 04-mypy-config/
    mypy example.py
"""

from typing import Optional, Final, TypedDict
from dataclasses import dataclass


# === Final 常量 ===

MAX_RETRIES: Final[int] = 3
API_URL: Final[str] = "https://api.example.com"


# === TypedDict ===

class Config(TypedDict):
    host: str
    port: int
    debug: bool


# === dataclass ===

@dataclass
class User:
    name: str
    age: int
    email: Optional[str] = None

    def display(self) -> str:
        """格式化显示用户信息。"""
        info = f"{self.name} (age={self.age})"
        if self.email:
            info += f" <{self.email}>"
        print(f"[User.display] {info}")
        return info


# === 类型安全的函数 ===

def create_config(host: str, port: int, debug: bool = False) -> Config:
    """创建配置字典。"""
    config: Config = {"host": host, "port": port, "debug": debug}
    print(f"[create_config] {config}")
    return config


def retry_operation(func_name: str, max_retries: int = MAX_RETRIES) -> bool:
    """模拟重试操作。"""
    for attempt in range(1, max_retries + 1):
        print(f"[retry] {func_name}: 第 {attempt}/{max_retries} 次尝试")
        if attempt == max_retries:
            print(f"[retry] {func_name}: 最终成功")
            return True
    return False


def process_users(users: list[User]) -> dict[str, int]:
    """处理用户列表，返回年龄映射。"""
    result: dict[str, int] = {}
    for user in users:
        user.display()
        result[user.name] = user.age
    print(f"[process_users] 处理了 {len(result)} 个用户")
    return result


# === 主程序 ===

if __name__ == "__main__":
    print("=" * 60)
    print("mypy 配置实战示例")
    print("=" * 60)

    config = create_config("localhost", 5432, debug=True)

    users = [
        User("Alice", 30, "alice@example.com"),
        User("Bob", 25),
        User("Charlie", 35, "charlie@example.com"),
    ]

    age_map = process_users(users)
    print(f"[main] 年龄映射: {age_map}")

    retry_operation("database_connect")
