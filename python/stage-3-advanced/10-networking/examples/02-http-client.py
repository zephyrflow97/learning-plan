"""
第 10 章 示例 02：HTTP 客户端
- requests 基础用法
- Session 复用
- 错误处理
- 重试逻辑
"""

import json
import logging
import time
from typing import Any
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


# ======================================================================
# 1. 标准库 urllib（不依赖第三方库）
# ======================================================================

def urllib_demo() -> None:
    """用标准库 urllib 发起 HTTP 请求"""
    url = "https://httpbin.org/get?source=urllib"

    req = Request(url)
    req.add_header("User-Agent", "PythonLearner/1.0")

    try:
        with urlopen(req, timeout=10) as response:
            status = response.status
            body = response.read().decode("utf-8")
            data = json.loads(body)
            logger.info("urllib GET %s → %d", url, status)
            print(f"  状态码: {status}")
            print(f"  参数: {data.get('args', {})}")
    except HTTPError as e:
        logger.error("HTTP 错误: %d", e.code)
    except URLError as e:
        logger.error("URL 错误: %s", e.reason)


# ======================================================================
# 2. requests 库（需安装：pip install requests）
# ======================================================================

def requests_demo() -> None:
    """requests 库用法演示"""
    try:
        import requests
    except ImportError:
        logger.warning("requests 未安装，跳过。安装: pip install requests")
        return

    # ✅ GET 请求
    response = requests.get(
        "https://httpbin.org/get",
        params={"language": "python", "chapter": "10"},
        headers={"Accept": "application/json"},
        timeout=10,
    )
    logger.info("GET 状态码: %d", response.status_code)
    print(f"\n  GET 参数: {response.json()['args']}")

    # ✅ POST 请求（JSON 格式）
    response = requests.post(
        "https://httpbin.org/post",
        json={"name": "Alice", "message": "Hello from Python!"},
        timeout=10,
    )
    logger.info("POST 状态码: %d", response.status_code)
    print(f"  POST 数据: {response.json()['json']}")

    # ✅ 带 Session 的请求（复用连接 + 持久 Cookie）
    with requests.Session() as session:
        session.headers.update({"User-Agent": "PythonLearner/1.0"})

        # Session 会自动管理 Cookie
        r1 = session.get("https://httpbin.org/cookies/set/token/abc123", timeout=10)
        logger.info("设置 Cookie: %d", r1.status_code)

        r2 = session.get("https://httpbin.org/cookies", timeout=10)
        cookies = r2.json().get("cookies", {})
        logger.info("读取 Cookie: %s", cookies)
        print(f"  Cookie: {cookies}")


# ======================================================================
# 3. 错误处理
# ======================================================================

def error_handling_demo() -> None:
    """HTTP 错误处理最佳实践"""
    try:
        import requests
    except ImportError:
        logger.warning("requests 未安装，跳过")
        return

    # ✅ 完整的错误处理
    urls = [
        "https://httpbin.org/status/200",  # 成功
        "https://httpbin.org/status/404",  # 不存在
        "https://httpbin.org/status/500",  # 服务器错误
        "https://this-domain-does-not-exist.invalid",  # DNS 失败
    ]

    for url in urls:
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            logger.info("✅ %s → %d", url, response.status_code)
            print(f"  ✅ {url} → {response.status_code}")
        except requests.ConnectionError:
            logger.error("❌ 连接失败: %s", url)
            print(f"  ❌ 连接失败: {url}")
        except requests.Timeout:
            logger.error("❌ 超时: %s", url)
            print(f"  ❌ 超时: {url}")
        except requests.HTTPError as e:
            logger.error("❌ HTTP 错误: %s → %d", url, e.response.status_code)
            print(f"  ❌ HTTP {e.response.status_code}: {url}")


# ======================================================================
# 4. 重试逻辑
# ======================================================================

def fetch_with_retry(
    url: str,
    max_retries: int = 3,
    backoff_factor: float = 0.5,
    timeout: float = 10.0,
) -> dict[str, Any] | None:
    """带指数退避重试的 HTTP 请求"""
    try:
        import requests
    except ImportError:
        logger.warning("requests 未安装")
        return None

    for attempt in range(1, max_retries + 1):
        try:
            logger.info("第 %d 次尝试: %s", attempt, url)
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            logger.info("成功: %d", response.status_code)
            return response.json()

        except (requests.ConnectionError, requests.Timeout) as e:
            wait = backoff_factor * (2 ** (attempt - 1))
            logger.warning(
                "第 %d 次失败: %s，等待 %.1f 秒后重试",
                attempt, type(e).__name__, wait,
            )
            if attempt < max_retries:
                time.sleep(wait)
            else:
                logger.error("所有重试都失败了: %s", url)

        except requests.HTTPError as e:
            status = e.response.status_code
            if status >= 500:
                wait = backoff_factor * (2 ** (attempt - 1))
                logger.warning("服务器错误 %d，重试中...", status)
                if attempt < max_retries:
                    time.sleep(wait)
                    continue
            logger.error("HTTP 错误 %d，不重试", status)
            break

    return None


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    print("=" * 60)
    print("1. 标准库 urllib")
    print("=" * 60)
    urllib_demo()

    print("\n" + "=" * 60)
    print("2. requests 库")
    print("=" * 60)
    requests_demo()

    print("\n" + "=" * 60)
    print("3. 错误处理")
    print("=" * 60)
    error_handling_demo()

    print("\n" + "=" * 60)
    print("4. 重试逻辑")
    print("=" * 60)
    result = fetch_with_retry("https://httpbin.org/get")
    if result:
        print(f"  成功获取数据: {result.get('url', 'N/A')}")


if __name__ == "__main__":
    main()
