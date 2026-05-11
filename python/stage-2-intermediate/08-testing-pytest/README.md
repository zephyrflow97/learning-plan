# 第 8 章：pytest 测试 — 代码质量的照妖镜

> *"Code without tests is broken by design."*
> — Jacob Kaplan-Moss (Django co-creator)
>
> 每个程序员都有过这样的经历：改了一行代码，结果炸了三个功能。
> 测试不是为了证明你的代码是对的——测试是为了在你犯错时**立即告诉你**。
> pytest 是 Python 世界里最锋利的这面镜子。

## 📖 本章内容

- [1. 为什么用 pytest 而不是 unittest](#1-为什么用-pytest-而不是-unittest)
- [2. 基础断言与测试发现](#2-基础断言与测试发现)
  - [2.1 第一个测试](#21-第一个测试)
  - [2.2 断言的艺术](#22-断言的艺术)
  - [2.3 测试发现规则](#23-测试发现规则)
- [3. fixtures：测试的依赖注入](#3-fixtures测试的依赖注入)
  - [3.1 什么是 fixture](#31-什么是-fixture)
  - [3.2 fixture 的作用域](#32-fixture-的作用域)
  - [3.3 fixture 的组合](#33-fixture-的组合)
  - [3.4 内置 fixture](#34-内置-fixture)
- [4. 参数化测试](#4-参数化测试)
  - [4.1 基础参数化](#41-基础参数化)
  - [4.2 多参数组合](#42-多参数组合)
  - [4.3 参数化 + fixture](#43-参数化--fixture)
- [5. mock 与 monkeypatch](#5-mock-与-monkeypatch)
  - [5.1 为什么需要 mock](#51-为什么需要-mock)
  - [5.2 unittest.mock](#52-unittestmock)
  - [5.3 monkeypatch](#53-monkeypatch)
- [6. 测试覆盖率](#6-测试覆盖率)
- [7. 测试策略与最佳实践](#7-测试策略与最佳实践)
  - [7.1 测试金字塔](#71-测试金字塔)
  - [7.2 TDD 流程](#72-tdd-流程)
  - [7.3 测试命名与组织](#73-测试命名与组织)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [导航](#导航)

---

## 1. 为什么用 pytest 而不是 unittest

> 🎭 **The Drama：unittest 的冗长 vs pytest 的简洁**
>
> ```python
> # ❌ unittest 风格 — 继承、方法名约束、assert 方法
> import unittest
>
> class TestCalculator(unittest.TestCase):
>     def setUp(self):
>         self.calc = Calculator()
>
>     def test_add(self):
>         self.assertEqual(self.calc.add(2, 3), 5)
>
>     def test_add_negative(self):
>         self.assertEqual(self.calc.add(-1, 1), 0)
>
> # ✅ pytest 风格 — 纯函数、直接 assert、fixture
> import pytest
>
> @pytest.fixture
> def calc():
>     return Calculator()
>
> def test_add(calc):
>     assert calc.add(2, 3) == 5
>
> def test_add_negative(calc):
>     assert calc.add(-1, 1) == 0
> ```
>
> 少了继承，少了 `self.assertEqual`，少了 `setUp`。
> 代码量减少 40%，可读性提升 200%。

| 特性 | unittest | pytest |
|------|----------|--------|
| 断言方式 | `self.assertEqual(a, b)` | `assert a == b` |
| 测试组织 | 必须继承 `TestCase` | 纯函数即可 |
| 前置/后置 | `setUp` / `tearDown` | fixture（更灵活） |
| 参数化 | 需要第三方或 `subTest` | 内置 `@pytest.mark.parametrize` |
| 错误信息 | 基础 | 自动展示表达式求值过程 |
| 插件生态 | 有限 | 丰富（800+ 插件） |
| 兼容性 | — | 完全兼容 unittest 测试 |

---

## 2. 基础断言与测试发现

### 2.1 第一个测试

```python
# test_calculator.py

def add(a: int, b: int) -> int:
    """被测函数。"""
    return a + b

# ✅ pytest 测试 — 就这么简单
def test_add_positive() -> None:
    """测试正数加法。"""
    assert add(2, 3) == 5
    print("[test_add_positive] PASSED")

def test_add_zero() -> None:
    """测试加零。"""
    assert add(0, 0) == 0
    assert add(5, 0) == 5
    print("[test_add_zero] PASSED")

def test_add_negative() -> None:
    """测试负数。"""
    assert add(-1, -1) == -2
    assert add(-1, 1) == 0
    print("[test_add_negative] PASSED")
```

```bash
# 运行测试
pytest test_calculator.py -v

# 输出:
# test_calculator.py::test_add_positive PASSED
# test_calculator.py::test_add_zero PASSED
# test_calculator.py::test_add_negative PASSED
```

### 2.2 断言的艺术

```python
import pytest
from typing import Any

# === 基础断言 ===
def test_equality() -> None:
    assert 1 + 1 == 2
    assert "hello".upper() == "HELLO"
    assert [1, 2, 3] == [1, 2, 3]
    print("[test_equality] PASSED")

def test_truthiness() -> None:
    assert [1, 2, 3]       # 非空列表是 truthy
    assert not []            # 空列表是 falsy
    assert "hello"           # 非空字符串是 truthy
    assert not ""            # 空字符串是 falsy
    print("[test_truthiness] PASSED")

def test_membership() -> None:
    assert 3 in [1, 2, 3]
    assert "h" in "hello"
    assert "x" not in "hello"
    print("[test_membership] PASSED")

def test_identity() -> None:
    a: list[int] = [1, 2, 3]
    b: list[int] = a
    c: list[int] = [1, 2, 3]
    assert a is b              # 同一个对象
    assert a is not c          # 不同对象（虽然值相等）
    print("[test_identity] PASSED")

# === 异常断言 ===
def test_exception() -> None:
    """测试异常是否正确抛出。"""
    with pytest.raises(ValueError, match="invalid literal"):
        int("not_a_number")
    print("[test_exception] PASSED")

def test_exception_details() -> None:
    """检查异常的详细信息。"""
    with pytest.raises(ZeroDivisionError) as exc_info:
        1 / 0
    assert "division by zero" in str(exc_info.value)
    print("[test_exception_details] PASSED")

# === 近似比较（浮点数） ===
def test_float_comparison() -> None:
    """浮点数不能用 == 比较！"""
    # ❌ assert 0.1 + 0.2 == 0.3  # 会失败！
    assert 0.1 + 0.2 == pytest.approx(0.3)          # ✅
    assert 3.14 == pytest.approx(3.14159, abs=0.01)  # ✅ 绝对误差
    print("[test_float_comparison] PASSED")
```

### 2.3 测试发现规则

```
pytest 的测试发现规则:
┌─────────────────────────────────────────────┐
│ 文件名: test_*.py 或 *_test.py              │
│ 类名:   Test* (不需要继承！)                 │
│ 函数名: test_*                               │
│ 方法名: test_* (在 Test* 类中)               │
└─────────────────────────────────────────────┘

目录结构示例:
tests/
├── conftest.py         # 共享 fixture（自动加载）
├── test_core.py        # ✅ 被发现
├── test_utils.py       # ✅ 被发现
├── helper.py           # ❌ 不是测试文件
└── models/
    ├── conftest.py     # 子目录的 fixture
    └── test_user.py    # ✅ 被发现
```

---

## 3. fixtures：测试的依赖注入

### 3.1 什么是 fixture

> 🧠 **CS Master's Bridge：Fixture = 依赖注入**
>
> 如果你了解 Spring 的 `@Autowired` 或 Angular 的依赖注入——pytest 的 fixture 就是同一个概念。
>
> **测试函数声明它需要什么，pytest 自动提供。**
>
> ```python
> # 测试函数的参数名 = fixture 函数名
> def test_something(db, client, user):
>     # pytest 看到参数名，自动调用对应的 fixture 函数
>     # 类似: db = db_fixture(); client = client_fixture(); user = user_fixture()
>     pass
> ```

```python
import pytest
from dataclasses import dataclass

@dataclass
class Database:
    """模拟数据库。"""
    data: dict[str, str]

    def get(self, key: str) -> str | None:
        result = self.data.get(key)
        print(f"[Database.get] key='{key}' -> {result}")
        return result

    def put(self, key: str, value: str) -> None:
        self.data[key] = value
        print(f"[Database.put] key='{key}', value='{value}'")


# ✅ fixture：创建测试所需的数据库
@pytest.fixture
def db() -> Database:
    """提供一个预填充数据的测试数据库。"""
    print("[fixture:db] 创建测试数据库")
    database = Database(data={"alice": "Alice Smith", "bob": "Bob Jones"})
    return database


# ✅ 测试函数通过参数名请求 fixture
def test_get_existing_user(db: Database) -> None:
    assert db.get("alice") == "Alice Smith"
    print("[test_get_existing_user] PASSED")


def test_get_missing_user(db: Database) -> None:
    assert db.get("charlie") is None
    print("[test_get_missing_user] PASSED")


def test_put_and_get(db: Database) -> None:
    db.put("charlie", "Charlie Brown")
    assert db.get("charlie") == "Charlie Brown"
    print("[test_put_and_get] PASSED")
```

### 3.2 fixture 的作用域

```python
import pytest

# scope="function" (默认): 每个测试函数都创建新实例
@pytest.fixture(scope="function")
def fresh_list() -> list[int]:
    print("[fixture:fresh_list] 创建新列表")
    return []

# scope="module": 每个测试模块共享一个实例
@pytest.fixture(scope="module")
def shared_config() -> dict[str, str]:
    print("[fixture:shared_config] 创建配置（模块级）")
    return {"env": "test", "debug": "true"}

# scope="session": 整个测试会话共享一个实例
@pytest.fixture(scope="session")
def expensive_resource() -> str:
    print("[fixture:expensive_resource] 初始化昂贵资源（会话级）")
    return "database_connection_string"
```

| 作用域 | 创建时机 | 适用场景 |
|--------|----------|----------|
| `function` (默认) | 每个测试函数 | 需要隔离的数据 |
| `class` | 每个测试类 | 类内共享的状态 |
| `module` | 每个测试文件 | 模块内共享的配置 |
| `session` | 整个测试会话 | 昂贵的初始化（DB连接） |

### 3.3 fixture 的组合

```python
import pytest
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    email: str

@dataclass
class UserService:
    users: list[User] = field(default_factory=list)

    def add_user(self, user: User) -> None:
        self.users.append(user)
        print(f"[UserService] 添加用户: {user.name}")

    def find_by_name(self, name: str) -> User | None:
        for user in self.users:
            if user.name == name:
                return user
        return None


# fixture 可以依赖其他 fixture！
@pytest.fixture
def alice() -> User:
    print("[fixture:alice] 创建 Alice")
    return User("Alice", "alice@example.com")

@pytest.fixture
def bob() -> User:
    print("[fixture:bob] 创建 Bob")
    return User("Bob", "bob@example.com")

@pytest.fixture
def user_service(alice: User, bob: User) -> UserService:
    """组合 fixture: 依赖 alice 和 bob。"""
    print("[fixture:user_service] 创建服务并添加用户")
    service = UserService()
    service.add_user(alice)
    service.add_user(bob)
    return service


def test_find_alice(user_service: UserService) -> None:
    user = user_service.find_by_name("Alice")
    assert user is not None
    assert user.email == "alice@example.com"
    print("[test_find_alice] PASSED")


def test_user_count(user_service: UserService) -> None:
    assert len(user_service.users) == 2
    print("[test_user_count] PASSED")
```

### 3.4 内置 fixture

```python
import pytest
from pathlib import Path

# tmp_path: pytest 内置，提供临时目录
def test_write_file(tmp_path: Path) -> None:
    """使用临时目录测试文件操作。"""
    file_path: Path = tmp_path / "test.txt"
    file_path.write_text("hello, pytest!")
    assert file_path.read_text() == "hello, pytest!"
    print(f"[test_write_file] 临时文件: {file_path}")

# capsys: 捕获 stdout/stderr
def test_print_output(capsys: pytest.CaptureFixture[str]) -> None:
    """测试函数的打印输出。"""
    print("Hello, World!")
    captured = capsys.readouterr()
    assert "Hello, World!" in captured.out
    print("[test_print_output] PASSED")
```

---

## 4. 参数化测试

### 4.1 基础参数化

```python
import pytest

def is_palindrome(text: str) -> bool:
    """检查是否为回文。"""
    cleaned: str = text.lower().replace(" ", "")
    result: bool = cleaned == cleaned[::-1]
    print(f"[is_palindrome] '{text}' -> {result}")
    return result

# ✅ 参数化：一个测试函数，多组数据
@pytest.mark.parametrize("text, expected", [
    ("racecar", True),
    ("hello", False),
    ("A man a plan a canal Panama", True),
    ("", True),
    ("a", True),
    ("ab", False),
])
def test_is_palindrome(text: str, expected: bool) -> None:
    assert is_palindrome(text) == expected

# ❌ 没有参数化时的冗余代码
# def test_racecar(): assert is_palindrome("racecar") == True
# def test_hello(): assert is_palindrome("hello") == False
# def test_panama(): assert is_palindrome("A man a plan a canal Panama") == True
# ... 每组数据一个函数，太冗余了
```

### 4.2 多参数组合

```python
import pytest

@pytest.mark.parametrize("base", [2, 10])
@pytest.mark.parametrize("exponent", [0, 1, 2, 3])
def test_power(base: int, exponent: int) -> None:
    """多个 parametrize 会产生笛卡尔积: 2 * 4 = 8 组测试。"""
    result: int = base ** exponent
    assert result == pow(base, exponent)
    print(f"[test_power] {base}^{exponent} = {result}")
```

### 4.3 参数化 + fixture

```python
import pytest

@pytest.fixture(params=["sqlite", "postgres", "mysql"])
def db_engine(request: pytest.FixtureRequest) -> str:
    """参数化 fixture: 对每种数据库引擎运行测试。"""
    engine: str = request.param
    print(f"[fixture:db_engine] 使用引擎: {engine}")
    return engine


def test_connection(db_engine: str) -> None:
    """这个测试会运行 3 次，每次用不同的数据库引擎。"""
    assert db_engine in ("sqlite", "postgres", "mysql")
    print(f"[test_connection] {db_engine} 连接成功")
```

---

## 5. mock 与 monkeypatch

### 5.1 为什么需要 mock

```
测试的困境: 函数依赖外部系统

    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ 你的函数  │────▶│ HTTP API │────▶│ 外部服务  │
    └──────────┘     └──────────┘     └──────────┘
                          ↑
                     这东西可能：
                     - 很慢 (网络延迟)
                     - 不稳定 (服务挂了)
                     - 收费 (每次调用 $0.01)
                     - 不可控 (返回不同结果)

    解决方案: Mock — 用假的替代真的

    ┌──────────┐     ┌──────────┐
    │ 你的函数  │────▶│  Mock    │  ← 快速、稳定、免费、可控
    └──────────┘     └──────────┘
```

### 5.2 unittest.mock

```python
from unittest.mock import Mock, patch, MagicMock
from typing import Any
import json

# 被测代码
def fetch_user_data(api_client: Any, user_id: int) -> dict[str, Any]:
    """从 API 获取用户数据。"""
    response = api_client.get(f"/users/{user_id}")
    if response.status_code != 200:
        raise ValueError(f"API error: {response.status_code}")
    data: dict[str, Any] = response.json()
    print(f"[fetch_user_data] user_id={user_id}, data={data}")
    return data

# ✅ 使用 Mock 替代真实的 API client
def test_fetch_user_data() -> None:
    # 创建 Mock 对象
    mock_client = Mock()
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"id": 1, "name": "Alice"}

    # 配置 mock: client.get() 返回 mock_response
    mock_client.get.return_value = mock_response

    # 测试
    result = fetch_user_data(mock_client, 1)
    assert result == {"id": 1, "name": "Alice"}

    # 验证调用
    mock_client.get.assert_called_once_with("/users/1")
    print("[test_fetch_user_data] PASSED")


# ✅ 使用 @patch 替换模块级函数
import os

def get_config_path() -> str:
    """获取配置文件路径。"""
    home: str = os.path.expanduser("~")
    config_path: str = os.path.join(home, ".config", "app.toml")
    print(f"[get_config_path] {config_path}")
    return config_path

@patch("os.path.expanduser")
def test_get_config_path(mock_expanduser: Mock) -> None:
    mock_expanduser.return_value = "/home/testuser"
    result = get_config_path()
    assert result == "/home/testuser/.config/app.toml"
    print("[test_get_config_path] PASSED")
```

### 5.3 monkeypatch

```python
import pytest
import os

# monkeypatch 是 pytest 内置的 mock 工具，更 Pythonic

def get_database_url() -> str:
    """从环境变量获取数据库 URL。"""
    url: str = os.environ.get("DATABASE_URL", "sqlite:///default.db")
    print(f"[get_database_url] {url}")
    return url


def test_database_url_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """使用 monkeypatch 设置环境变量。"""
    monkeypatch.setenv("DATABASE_URL", "postgres://localhost/testdb")
    assert get_database_url() == "postgres://localhost/testdb"
    print("[test_database_url_from_env] PASSED")


def test_database_url_default(monkeypatch: pytest.MonkeyPatch) -> None:
    """使用 monkeypatch 删除环境变量。"""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert get_database_url() == "sqlite:///default.db"
    print("[test_database_url_default] PASSED")


class Config:
    DEBUG: bool = False
    MAX_RETRIES: int = 3


def test_modify_class_attribute(monkeypatch: pytest.MonkeyPatch) -> None:
    """使用 monkeypatch 修改类属性。"""
    monkeypatch.setattr(Config, "DEBUG", True)
    monkeypatch.setattr(Config, "MAX_RETRIES", 1)
    assert Config.DEBUG is True
    assert Config.MAX_RETRIES == 1
    print("[test_modify_class_attribute] PASSED")
    # monkeypatch 会自动在测试结束后恢复原值！
```

---

## 6. 测试覆盖率

```bash
# 安装
pip install pytest-cov

# 运行测试并生成覆盖率报告
pytest --cov=mypackage tests/

# 生成 HTML 报告
pytest --cov=mypackage --cov-report=html tests/

# 设置最低覆盖率要求（CI 中使用）
pytest --cov=mypackage --cov-fail-under=80 tests/
```

```
# 覆盖率报告示例:
# ---------- coverage: ... ----------
# Name                      Stmts   Miss  Cover
# -----------------------------------------------
# mypackage/__init__.py         5      0   100%
# mypackage/core.py            42      3    93%
# mypackage/utils.py           28      7    75%
# -----------------------------------------------
# TOTAL                        75     10    87%
```

> **覆盖率的正确心态：**
>
> | 覆盖率 | 含义 | 态度 |
> |--------|------|------|
> | 0-30% | 几乎没有测试 | 需要紧急补充 |
> | 30-60% | 核心路径有测试 | 继续提升 |
> | 60-80% | 良好的测试覆盖 | 大多数项目的目标 |
> | 80-95% | 优秀的测试覆盖 | 核心库的标准 |
> | 95-100% | 近乎完美 | 不要为了数字而写无意义的测试 |

---

## 7. 测试策略与最佳实践

### 7.1 测试金字塔

```
            /\
           /  \         E2E 测试
          / E2E\        - 少量、慢、昂贵
         /------\       - 测试整个系统流程
        /        \
       / 集成测试  \     集成测试
      /   (中层)   \    - 适量、中速
     /--------------\   - 测试模块间交互
    /                \
   /   单元测试       \   单元测试
  /    (大量、快速)    \  - 大量、快速、便宜
 /______________________\ - 测试单个函数/类
```

### 7.2 TDD 流程

```
    ┌──────────┐
    │ 1. RED   │  写一个失败的测试
    │ (写测试)  │  （明确你想要什么）
    └────┬─────┘
         │
    ┌────▼─────┐
    │ 2. GREEN │  写最少的代码让测试通过
    │ (写代码)  │  （不要过度设计）
    └────┬─────┘
         │
    ┌────▼──────┐
    │3. REFACTOR│  在测试保护下重构
    │ (重构)     │  （安全地改进设计）
    └────┬──────┘
         │
         └──→ 回到 1. RED
```

### 7.3 测试命名与组织

```python
# ✅ 好的测试命名 — 描述行为
def test_user_creation_with_valid_email() -> None: ...
def test_user_creation_rejects_invalid_email() -> None: ...
def test_empty_cart_has_zero_total() -> None: ...

# ❌ 差的测试命名 — 描述实现
def test_user1() -> None: ...
def test_function() -> None: ...
def test_it_works() -> None: ...

# ✅ 好的测试结构: Arrange-Act-Assert (AAA)
def test_user_fullname() -> None:
    # Arrange: 准备数据
    user = User(first_name="Alice", last_name="Smith")

    # Act: 执行操作
    fullname = user.get_fullname()

    # Assert: 验证结果
    assert fullname == "Alice Smith"
    print("[test_user_fullname] PASSED")
```

---

## 最佳实践

> 🧘 **Zen of Code：测试不是负担，是设计反馈**
>
> 如果你发现一个函数很难写测试，问题不在测试——问题在函数。
> 难以测试的代码通常意味着：耦合太重、副作用太多、职责不清。
> **测试是代码质量最诚实的镜子。**

```python
# ✅ 1. 每个测试只测一件事
def test_add_returns_sum() -> None:
    assert add(2, 3) == 5

def test_add_handles_negative() -> None:
    assert add(-1, 1) == 0

# ❌ 不要在一个测试里测所有东西
# def test_add():
#     assert add(2, 3) == 5
#     assert add(-1, 1) == 0
#     assert add(0, 0) == 0
#     assert add(1.5, 2.5) == 4.0

# ✅ 2. 测试要独立（不依赖执行顺序）
# ✅ 3. 测试要快（慢的用 @pytest.mark.slow 标记）
# ✅ 4. 测试要确定性（不依赖时间、随机数、网络）
# ✅ 5. 失败时错误信息要清晰
```

---

## 常见陷阱

```python
import pytest

# ❌ 陷阱 1: 测试之间共享可变状态
shared_list: list[int] = []  # 危险！

def test_a() -> None:
    shared_list.append(1)
    assert len(shared_list) == 1  # 如果 test_b 先运行呢？

# ✅ 解决：用 fixture

# ❌ 陷阱 2: 忘记测试边界条件
def test_divide() -> None:
    assert divide(10, 2) == 5
    # 但是 divide(10, 0) 呢？

# ✅ 解决：测试 Happy Path + Edge Cases + Error Cases

# ❌ 陷阱 3: Mock 太多，测试失去意义
# 如果你 mock 了被测函数的所有依赖，你测试的只是 mock 本身

# ❌ 陷阱 4: 测试实现细节而非行为
# def test_sort_uses_quicksort()  — 测试实现
# def test_sort_returns_ascending() — ✅ 测试行为
```

---

## 导航

| 方向 | 链接 |
|------|------|
| ⬅️ 上一章 | [第 7 章：模块与包](../07-modules-packages/) |
| ➡️ 下一章 | [第 9 章：正则表达式](../09-regexp/) |
| 🏠 阶段目录 | [Stage 2 目录](../) |

---

## 参考资料

- [pytest 官方文档](https://docs.pytest.org/)
- [pytest fixtures 详解](https://docs.pytest.org/en/stable/fixture.html)
- [unittest.mock 文档](https://docs.python.org/3/library/unittest.mock.html)
- [Testing & TDD - Real Python](https://realpython.com/python-testing/)
- [Effective Python Testing With Pytest](https://realpython.com/pytest-python-testing/)
