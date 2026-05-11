"""
第 6 章 示例 04：异步 HTTP 客户端实战
- 并发限制 (Semaphore)
- 重试机制 (指数退避)
- 超时控制
- 进度追踪
注意：此示例使用模拟的 HTTP 操作，不依赖外部库
"""

import asyncio
import random
import time
import logging
from dataclasses import dataclass, field
from enum import Enum

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 数据模型
# ──────────────────────────────────────────────

class RequestStatus(Enum):
    SUCCESS = "success"
    TIMEOUT = "timeout"
    ERROR = "error"
    RETRY_EXHAUSTED = "retry_exhausted"


@dataclass
class HttpResponse:
    url: str
    status: RequestStatus
    status_code: int = 0
    body: str = ""
    latency_ms: int = 0
    attempts: int = 1
    error: str = ""


@dataclass
class DownloadStats:
    total: int = 0
    success: int = 0
    failed: int = 0
    total_bytes: int = 0
    total_latency_ms: int = 0
    start_time: float = field(default_factory=time.perf_counter)

    def record_success(self, response: HttpResponse) -> None:
        self.success += 1
        self.total_bytes += len(response.body)
        self.total_latency_ms += response.latency_ms

    def record_failure(self) -> None:
        self.failed += 1

    def summary(self) -> str:
        elapsed = time.perf_counter() - self.start_time
        avg_latency = self.total_latency_ms / self.success if self.success else 0
        return (
            f"总计: {self.total} | 成功: {self.success} | "
            f"失败: {self.failed} | 总耗时: {elapsed:.2f}s | "
            f"平均延迟: {avg_latency:.0f}ms | "
            f"总字节: {self.total_bytes}"
        )


# ──────────────────────────────────────────────
# 模拟 HTTP 请求
# ──────────────────────────────────────────────

async def mock_http_get(url: str) -> tuple[int, str]:
    """模拟 HTTP GET 请求"""
    delay = random.uniform(0.1, 1.0)
    await asyncio.sleep(delay)

    # 模拟不同的响应
    roll = random.random()
    if roll < 0.1:
        raise ConnectionError(f"Connection refused: {url}")
    elif roll < 0.15:
        raise TimeoutError(f"Request timeout: {url}")
    elif roll < 0.2:
        return 500, f'{{"error": "Internal Server Error"}}'
    elif roll < 0.25:
        return 429, f'{{"error": "Too Many Requests"}}'
    else:
        body = f'{{"url": "{url}", "data": "response content", "size": {random.randint(100, 5000)}}}'
        return 200, body


# ──────────────────────────────────────────────
# 1. 基础并发请求
# ──────────────────────────────────────────────

async def demo_basic_concurrent() -> None:
    logger.info("=== 基础并发请求 ===")

    urls = [f"https://api.example.com/data/{i}" for i in range(10)]
    start = time.perf_counter()

    async def fetch(url: str) -> HttpResponse:
        t0 = time.perf_counter()
        try:
            status_code, body = await mock_http_get(url)
            latency = int((time.perf_counter() - t0) * 1000)
            return HttpResponse(
                url=url,
                status=RequestStatus.SUCCESS if status_code == 200 else RequestStatus.ERROR,
                status_code=status_code,
                body=body,
                latency_ms=latency,
            )
        except Exception as e:
            return HttpResponse(url=url, status=RequestStatus.ERROR, error=str(e))

    # ✅ 全部并发
    results = await asyncio.gather(*[fetch(url) for url in urls])

    for r in results:
        icon = "✅" if r.status == RequestStatus.SUCCESS else "❌"
        logger.info("%s %s [%d] %dms", icon, r.url, r.status_code, r.latency_ms)

    logger.info("总耗时: %.2f 秒", time.perf_counter() - start)


# ──────────────────────────────────────────────
# 2. 带并发限制的请求
# ──────────────────────────────────────────────

async def fetch_with_limit(
    url: str,
    semaphore: asyncio.Semaphore,
    stats: DownloadStats,
) -> HttpResponse:
    """带 Semaphore 限制的请求"""
    async with semaphore:
        t0 = time.perf_counter()
        try:
            status_code, body = await mock_http_get(url)
            latency = int((time.perf_counter() - t0) * 1000)
            response = HttpResponse(
                url=url,
                status=RequestStatus.SUCCESS if status_code == 200 else RequestStatus.ERROR,
                status_code=status_code,
                body=body,
                latency_ms=latency,
            )
            if response.status == RequestStatus.SUCCESS:
                stats.record_success(response)
            else:
                stats.record_failure()
            return response
        except Exception as e:
            stats.record_failure()
            return HttpResponse(url=url, status=RequestStatus.ERROR, error=str(e))


async def demo_rate_limited() -> None:
    logger.info("=== 带并发限制的请求 ===")

    urls = [f"https://api.example.com/item/{i}" for i in range(20)]
    semaphore = asyncio.Semaphore(5)  # 最多 5 个并发
    stats = DownloadStats(total=len(urls))

    results = await asyncio.gather(
        *[fetch_with_limit(url, semaphore, stats) for url in urls]
    )

    logger.info("统计: %s", stats.summary())


# ──────────────────────────────────────────────
# 3. 带重试的请求
# ──────────────────────────────────────────────

async def fetch_with_retry(
    url: str,
    max_retries: int = 3,
    base_delay: float = 0.5,
    timeout: float = 3.0,
) -> HttpResponse:
    """带指数退避重试 + 超时的请求"""
    for attempt in range(1, max_retries + 1):
        t0 = time.perf_counter()
        try:
            status_code, body = await asyncio.wait_for(
                mock_http_get(url), timeout=timeout
            )
            latency = int((time.perf_counter() - t0) * 1000)

            # 可重试的状态码
            if status_code in (429, 500, 502, 503) and attempt < max_retries:
                delay = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 0.3)
                logger.warning("[%d/%d] %s → %d, %.1fs 后重试",
                               attempt, max_retries, url, status_code, delay)
                await asyncio.sleep(delay)
                continue

            return HttpResponse(
                url=url,
                status=RequestStatus.SUCCESS if status_code == 200 else RequestStatus.ERROR,
                status_code=status_code,
                body=body,
                latency_ms=latency,
                attempts=attempt,
            )

        except asyncio.TimeoutError:
            if attempt < max_retries:
                logger.warning("[%d/%d] %s → 超时, 重试...", attempt, max_retries, url)
                continue
            return HttpResponse(
                url=url, status=RequestStatus.TIMEOUT,
                attempts=attempt, error="all retries timed out",
            )

        except ConnectionError as e:
            if attempt < max_retries:
                delay = base_delay * (2 ** (attempt - 1))
                logger.warning("[%d/%d] %s → %s, %.1fs 后重试",
                               attempt, max_retries, url, e, delay)
                await asyncio.sleep(delay)
                continue
            return HttpResponse(
                url=url, status=RequestStatus.RETRY_EXHAUSTED,
                attempts=attempt, error=str(e),
            )

    return HttpResponse(url=url, status=RequestStatus.RETRY_EXHAUSTED, error="max retries")


async def demo_retry() -> None:
    logger.info("=== 带重试的请求 ===")

    urls = [f"https://api.example.com/resource/{i}" for i in range(8)]

    results = await asyncio.gather(*[fetch_with_retry(url) for url in urls])

    for r in results:
        icon = {
            RequestStatus.SUCCESS: "✅",
            RequestStatus.TIMEOUT: "⏰",
            RequestStatus.ERROR: "❌",
            RequestStatus.RETRY_EXHAUSTED: "💀",
        }.get(r.status, "?")
        logger.info("%s %s [尝试 %d次] %s",
                     icon, r.url, r.attempts, r.error or f"status={r.status_code}")


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

async def main() -> None:
    await demo_basic_concurrent()
    print()

    await demo_rate_limited()
    print()

    await demo_retry()
    print()

    logger.info("所有异步 HTTP 演示完成")


if __name__ == "__main__":
    asyncio.run(main())
