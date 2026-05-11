"""
第 4 章 示例 03：ThreadPoolExecutor
- submit + as_completed
- map
- Future 对象操作
- 回调与异常处理
"""

from concurrent.futures import (
    ThreadPoolExecutor,
    as_completed,
    Future,
    wait,
    FIRST_COMPLETED,
)
import time
import random
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(threadName)-16s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 模拟任务
# ──────────────────────────────────────────────

def fetch_url(url: str) -> dict[str, str | int]:
    """模拟 HTTP 请求"""
    delay = random.uniform(0.5, 2.0)
    logger.info("开始请求: %s (预计 %.1fs)", url, delay)
    time.sleep(delay)

    if random.random() < 0.2:  # 20% 失败率
        raise ConnectionError(f"无法连接: {url}")

    return {"url": url, "status": 200, "size": random.randint(1000, 50000)}


def cpu_task(n: int) -> int:
    """模拟计算任务"""
    logger.info("计算 fib(%d)", n)
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


# ──────────────────────────────────────────────
# 1. submit() + as_completed()
# ──────────────────────────────────────────────

def demo_submit_as_completed() -> None:
    logger.info("=== submit + as_completed ===")

    urls = [f"https://api.example.com/data/{i}" for i in range(8)]

    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4, thread_name_prefix="Fetcher") as executor:
        # ✅ submit 返回 Future，用 dict 映射回原始 URL
        future_to_url: dict[Future[dict], str] = {
            executor.submit(fetch_url, url): url for url in urls
        }

        success, failure = 0, 0
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                result = future.result()
                logger.info("✅ %s → status=%d, size=%d", url, result["status"], result["size"])
                success += 1
            except Exception as e:
                logger.error("❌ %s → %s", url, e)
                failure += 1

    elapsed = time.perf_counter() - start
    logger.info("完成: %d 成功, %d 失败, 耗时 %.2f 秒", success, failure, elapsed)


# ──────────────────────────────────────────────
# 2. map() — 保持顺序
# ──────────────────────────────────────────────

def demo_map() -> None:
    logger.info("=== map() ===")

    numbers = list(range(10, 20))

    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4, thread_name_prefix="Calc") as executor:
        # ✅ map 按提交顺序返回结果
        results = list(executor.map(cpu_task, numbers))

    elapsed = time.perf_counter() - start
    for n, r in zip(numbers, results):
        logger.info("fib(%d) = %d", n, r)
    logger.info("耗时: %.2f 秒", elapsed)


# ──────────────────────────────────────────────
# 3. Future 详解
# ──────────────────────────────────────────────

def demo_future_details() -> None:
    logger.info("=== Future 详解 ===")

    with ThreadPoolExecutor(max_workers=2) as executor:
        future: Future[int] = executor.submit(cpu_task, 30)

        # 状态检查
        logger.info("running=%s, done=%s, cancelled=%s",
                     future.running(), future.done(), future.cancelled())

        # ✅ 获取结果（阻塞直到完成）
        result = future.result(timeout=10)
        logger.info("结果: %d", result)
        logger.info("done=%s", future.done())

        # ✅ 异常处理
        def failing_task() -> int:
            raise ValueError("故意抛出的错误")

        error_future = executor.submit(failing_task)
        exc = error_future.exception(timeout=5)
        logger.info("异常类型: %s, 消息: %s", type(exc).__name__, exc)


# ──────────────────────────────────────────────
# 4. 回调函数
# ──────────────────────────────────────────────

def demo_callbacks() -> None:
    logger.info("=== 回调函数 ===")

    def on_complete(future: Future[dict]) -> None:
        """任务完成时的回调"""
        if future.exception():
            logger.error("回调: 任务失败 — %s", future.exception())
        else:
            result = future.result()
            logger.info("回调: 任务成功 — %s", result["url"])

    with ThreadPoolExecutor(max_workers=3) as executor:
        urls = [f"https://example.com/{i}" for i in range(5)]
        for url in urls:
            future = executor.submit(fetch_url, url)
            future.add_done_callback(on_complete)

    logger.info("所有回调已执行")


# ──────────────────────────────────────────────
# 5. wait() — 等待特定条件
# ──────────────────────────────────────────────

def demo_wait() -> None:
    logger.info("=== wait() ===")

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [
            executor.submit(fetch_url, f"https://api.example.com/{i}")
            for i in range(6)
        ]

        # ✅ 等待第一个完成
        done, not_done = wait(futures, return_when=FIRST_COMPLETED)
        logger.info("第一批完成: %d 个, 未完成: %d 个", len(done), len(not_done))

        for f in done:
            try:
                result = f.result()
                logger.info("已完成: %s", result["url"])
            except Exception as e:
                logger.error("已完成(失败): %s", e)

        # 等待剩余全部完成
        done2, _ = wait(not_done)
        logger.info("全部完成: %d 个", len(done) + len(done2))


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

if __name__ == "__main__":
    demo_submit_as_completed()
    print()

    demo_map()
    print()

    demo_future_details()
    print()

    demo_callbacks()
    print()

    demo_wait()
    print()

    logger.info("所有线程池演示完成")
