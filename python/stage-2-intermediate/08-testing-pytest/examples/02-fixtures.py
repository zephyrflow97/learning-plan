"""
pytest fixtures 示例。

演示 fixture 的各种用法：
- 基础 fixture
- fixture 的作用域
- fixture 的组合与依赖
- yield fixture（setup/teardown）
- 内置 fixture (tmp_path, capsys)

运行: pytest 02-fixtures.py -v -s
"""

import pytest
from dataclasses import dataclass, field
from pathlib import Path
from typing import Generator


# === 被测代码 ===

@dataclass
class User:
    name: str
    email: str
    age: int

    def is_adult(self) -> bool:
        result: bool = self.age >= 18
        print(f"[User.is_adult] {self.name} age={self.age} -> {result}")
        return result


@dataclass
class UserRepository:
    """用户仓库（内存实现）。"""
    _users: dict[str, User] = field(default_factory=dict)

    def add(self, user: User) -> None:
        self._users[user.email] = user
        print(f"[UserRepository.add] 添加 {user.name}")

    def find_by_email(self, email: str) -> User | None:
        result = self._users.get(email)
        print(f"[UserRepository.find_by_email] '{email}' -> {result}")
        return result

    def count(self) -> int:
        return len(self._users)

    def all_users(self) -> list[User]:
        return list(self._users.values())


# === 基础 Fixtures ===

@pytest.fixture
def alice() -> User:
    """创建测试用户 Alice。"""
    print("[fixture:alice] 创建")
    return User(name="Alice", email="alice@example.com", age=30)


@pytest.fixture
def bob() -> User:
    """创建测试用户 Bob。"""
    print("[fixture:bob] 创建")
    return User(name="Bob", email="bob@example.com", age=16)


@pytest.fixture
def repo() -> UserRepository:
    """创建空的用户仓库。"""
    print("[fixture:repo] 创建空仓库")
    return UserRepository()


# === 组合 Fixture ===

@pytest.fixture
def populated_repo(repo: UserRepository, alice: User, bob: User) -> UserRepository:
    """创建预填充的用户仓库。"""
    print("[fixture:populated_repo] 填充数据")
    repo.add(alice)
    repo.add(bob)
    return repo


# === Yield Fixture (Setup + Teardown) ===

@pytest.fixture
def temp_config_file(tmp_path: Path) -> Generator[Path, None, None]:
    """创建临时配置文件，测试结束后清理。"""
    config_path: Path = tmp_path / "config.toml"
    config_path.write_text('[app]\nname = "test"\ndebug = true\n')
    print(f"[fixture:temp_config] 创建 {config_path}")

    yield config_path  # 测试运行

    # Teardown: yield 之后的代码在测试结束后运行
    print(f"[fixture:temp_config] 清理 {config_path}")
    # tmp_path 会自动清理，但这里演示手动 teardown


# === 测试用例 ===

class TestUser:
    """用户相关测试。"""

    def test_adult_user(self, alice: User) -> None:
        assert alice.is_adult() is True

    def test_minor_user(self, bob: User) -> None:
        assert bob.is_adult() is False

    def test_user_attributes(self, alice: User) -> None:
        assert alice.name == "Alice"
        assert alice.email == "alice@example.com"
        assert alice.age == 30


class TestUserRepository:
    """用户仓库测试。"""

    def test_empty_repo(self, repo: UserRepository) -> None:
        assert repo.count() == 0

    def test_add_user(self, repo: UserRepository, alice: User) -> None:
        repo.add(alice)
        assert repo.count() == 1

    def test_find_existing_user(self, populated_repo: UserRepository) -> None:
        user = populated_repo.find_by_email("alice@example.com")
        assert user is not None
        assert user.name == "Alice"

    def test_find_missing_user(self, populated_repo: UserRepository) -> None:
        user = populated_repo.find_by_email("charlie@example.com")
        assert user is None

    def test_populated_count(self, populated_repo: UserRepository) -> None:
        assert populated_repo.count() == 2


class TestWithTempFiles:
    """使用临时文件的测试。"""

    def test_config_exists(self, temp_config_file: Path) -> None:
        assert temp_config_file.exists()
        print(f"[test] 配置文件存在: {temp_config_file}")

    def test_config_content(self, temp_config_file: Path) -> None:
        content: str = temp_config_file.read_text()
        assert "debug = true" in content
        print(f"[test] 配置内容正确")


class TestBuiltinFixtures:
    """内置 fixture 演示。"""

    def test_capsys(self, capsys: pytest.CaptureFixture[str]) -> None:
        """捕获标准输出。"""
        print("Hello from test!")
        captured = capsys.readouterr()
        assert "Hello from test!" in captured.out

    def test_tmp_path(self, tmp_path: Path) -> None:
        """使用临时路径。"""
        data_file: Path = tmp_path / "data.json"
        data_file.write_text('{"key": "value"}')
        assert data_file.read_text() == '{"key": "value"}'
        print(f"[test] 临时文件: {data_file}")

    def test_monkeypatch(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """修改环境变量。"""
        monkeypatch.setenv("APP_ENV", "testing")
        import os
        assert os.environ["APP_ENV"] == "testing"
        print(f"[test] APP_ENV = {os.environ['APP_ENV']}")
