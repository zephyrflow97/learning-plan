"""
Mock 与 MonkeyPatch 示例。

演示如何在测试中替换外部依赖：
- unittest.mock.Mock 基础
- @patch 装饰器
- monkeypatch 修改环境
- 实际场景：mock HTTP 请求

运行: pytest 04-mocking.py -v -s
"""

import pytest
import os
import json
from unittest.mock import Mock, patch, MagicMock, call
from typing import Any
from dataclasses import dataclass


# === 被测代码 ===

@dataclass
class WeatherData:
    city: str
    temperature: float
    description: str


class WeatherService:
    """天气服务（依赖外部 API）。"""

    def __init__(self, api_key: str) -> None:
        self.api_key: str = api_key
        self.base_url: str = "https://api.weather.example.com"
        print(f"[WeatherService] 初始化, api_key=***{api_key[-4:]}")

    def get_weather(self, city: str) -> WeatherData:
        """获取天气数据（实际会调用 HTTP API）。"""
        # 这里模拟 HTTP 调用
        import urllib.request
        url = f"{self.base_url}/weather?city={city}&key={self.api_key}"
        response = urllib.request.urlopen(url)
        data = json.loads(response.read())
        print(f"[WeatherService.get_weather] {city}: {data}")
        return WeatherData(
            city=data["city"],
            temperature=data["temp"],
            description=data["desc"],
        )

    def is_raining(self, city: str) -> bool:
        """判断是否在下雨。"""
        weather = self.get_weather(city)
        result: bool = "rain" in weather.description.lower()
        print(f"[WeatherService.is_raining] {city}: {result}")
        return result


def get_greeting(name: str) -> str:
    """根据环境变量生成问候语。"""
    env: str = os.environ.get("APP_ENV", "production")
    if env == "development":
        greeting = f"[DEV] Hello, {name}!"
    else:
        greeting = f"Hello, {name}!"
    print(f"[get_greeting] env={env}, greeting={greeting}")
    return greeting


def read_config(filepath: str) -> dict[str, Any]:
    """读取配置文件。"""
    with open(filepath, "r") as f:
        config: dict[str, Any] = json.load(f)
    print(f"[read_config] 从 {filepath} 读取 {len(config)} 项")
    return config


# === 1. Mock 基础 ===

class TestMockBasics:
    """Mock 对象基础用法。"""

    def test_mock_return_value(self) -> None:
        """Mock 可以设置返回值。"""
        mock_func = Mock(return_value=42)
        result: int = mock_func()
        assert result == 42
        mock_func.assert_called_once()
        print("[test] Mock return_value 正确")

    def test_mock_side_effect(self) -> None:
        """Mock 可以设置副作用（依次返回不同值）。"""
        mock_func = Mock(side_effect=[1, 2, 3])
        assert mock_func() == 1
        assert mock_func() == 2
        assert mock_func() == 3
        print("[test] Mock side_effect 正确")

    def test_mock_exception(self) -> None:
        """Mock 可以模拟异常。"""
        mock_func = Mock(side_effect=ConnectionError("Network down"))
        with pytest.raises(ConnectionError, match="Network down"):
            mock_func()
        print("[test] Mock 异常模拟正确")

    def test_mock_call_tracking(self) -> None:
        """Mock 可以追踪调用记录。"""
        mock_func = Mock()
        mock_func("hello")
        mock_func("world", count=2)

        assert mock_func.call_count == 2
        mock_func.assert_any_call("hello")
        mock_func.assert_any_call("world", count=2)
        print("[test] Mock 调用追踪正确")


# === 2. @patch 装饰器 ===

class TestPatch:
    """使用 @patch 替换模块级依赖。"""

    @patch.dict(os.environ, {"APP_ENV": "development"})
    def test_greeting_dev(self) -> None:
        """patch 环境变量。"""
        result = get_greeting("Alice")
        assert result == "[DEV] Hello, Alice!"
        print("[test] 开发环境问候语正确")

    @patch.dict(os.environ, {"APP_ENV": "production"})
    def test_greeting_prod(self) -> None:
        """生产环境问候语。"""
        result = get_greeting("Alice")
        assert result == "Hello, Alice!"
        print("[test] 生产环境问候语正确")

    @patch("builtins.open", create=True)
    def test_read_config(self, mock_open: MagicMock) -> None:
        """Mock 文件读取。"""
        mock_file = MagicMock()
        mock_file.__enter__ = Mock(return_value=mock_file)
        mock_file.__exit__ = Mock(return_value=False)
        mock_file.read.return_value = '{"debug": true, "port": 8080}'
        mock_open.return_value = mock_file

        # 注意：这里我们直接 mock json.load
        with patch("json.load", return_value={"debug": True, "port": 8080}):
            config = read_config("config.json")
        assert config["debug"] is True
        assert config["port"] == 8080
        print("[test] 配置读取正确")


# === 3. Mock WeatherService ===

class TestWeatherService:
    """Mock 外部 API 调用。"""

    def test_get_weather_mocked(self) -> None:
        """直接 Mock get_weather 方法。"""
        service = WeatherService(api_key="test-key-1234")

        # 替换方法
        service.get_weather = Mock(return_value=WeatherData(  # type: ignore[method-assign]
            city="Beijing",
            temperature=25.0,
            description="Sunny and clear",
        ))

        weather = service.get_weather("Beijing")
        assert weather.city == "Beijing"
        assert weather.temperature == 25.0
        print(f"[test] weather={weather}")

    def test_is_raining_true(self) -> None:
        """测试下雨检测。"""
        service = WeatherService(api_key="test-key-1234")
        service.get_weather = Mock(return_value=WeatherData(  # type: ignore[method-assign]
            city="London",
            temperature=12.0,
            description="Heavy rain",
        ))

        assert service.is_raining("London") is True
        print("[test] 下雨检测正确")

    def test_is_raining_false(self) -> None:
        """测试晴天检测。"""
        service = WeatherService(api_key="test-key-1234")
        service.get_weather = Mock(return_value=WeatherData(  # type: ignore[method-assign]
            city="Dubai",
            temperature=40.0,
            description="Clear sky",
        ))

        assert service.is_raining("Dubai") is False
        print("[test] 晴天检测正确")


# === 4. monkeypatch ===

class TestMonkeyPatch:
    """pytest 内置的 monkeypatch 工具。"""

    def test_env_variable(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """修改环境变量。"""
        monkeypatch.setenv("APP_ENV", "development")
        result = get_greeting("Bob")
        assert "[DEV]" in result
        print("[test] monkeypatch 环境变量正确")

    def test_remove_env_variable(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """删除环境变量。"""
        monkeypatch.delenv("APP_ENV", raising=False)
        result = get_greeting("Charlie")
        assert result == "Hello, Charlie!"
        print("[test] monkeypatch 删除环境变量正确")

    def test_patch_class_attribute(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """修改类属性。"""
        service = WeatherService(api_key="original-key")
        monkeypatch.setattr(service, "base_url", "http://localhost:8080")
        assert service.base_url == "http://localhost:8080"
        print("[test] monkeypatch 类属性修改正确")

    def test_patch_function(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """替换函数实现。"""

        def mock_get_weather(self: Any, city: str) -> WeatherData:
            return WeatherData(city=city, temperature=20.0, description="Mocked weather")

        monkeypatch.setattr(WeatherService, "get_weather", mock_get_weather)
        service = WeatherService(api_key="test")
        weather = service.get_weather("TestCity")
        assert weather.description == "Mocked weather"
        print("[test] monkeypatch 函数替换正确")
