"""
第 6 章 示例 02：任务与并发执行
- create_task
- gather / wait / as_completed
- Task 取消与生命周期
- 错误处理
"""

import asyncio
import random
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 模拟异步操作
# ──────────────────────────────────────────────

async def fetch_url(url: str) -> dict[str, str | int]:
    delay = random.uniform(0.3, 1.5)
    logger.info("请求: %s (预计 %.1fs)", url, delay)
    await asyncio.sleep(delay)

    if random.random() < 0.15:
        raise ConnectionError(f"连接失败: {url}")

    return {"url": url, "status": 200, "latency_ms": int(delay * 1000)}


# ──────────────────────────────────────────────
# 1. create_task — 调度协程
# ──────────────────────────────────────────────

async def demo_create_task() -> None:
    logger.info("=== create_task ===")

    # ✅ create_task 立即调度协程到事件循环
    task1 = asyncio.create_task(fetch_url("https://api.example.com/users"), name="users")
    task2 = asyncio.create_task(fetch_url("https://api.example.com/posts"), name="posts")

    logger.info("Task 1: name=%s, done=%s", task1.get_name(), task1.done())
    logger.info("Task 2: name=%s, done=%s", task2.get_name(), task2.done())

    # await 获取结果
    r1 = await task1
    r2 = await task2

    logger.info("结果: %s, %s", r1, r2)


# ──────────────────────────────────────────────
# 2. gather — 并发执行
# ──────────────────────────────────────────────

async def demo_gather() -> None:
    logger.info("=== gather ===")

    urls = [f"https://api.example.com/item/{i}" for i in range(6)]
    start = time.perf_counter()

    # ✅ gather 按提交顺序返回结果
    results = await asyncio.gather(
        *[fetch_url(url) for url in urls],
        return_exceptions=True,
    )

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error("❌ %s: %s", urls[i], result)
        else:
            logger.info("✅ %s: status=%d, latency=%dms",
                        result["url"], result["status"], result["latency_ms"])

    logger.info("总耗时: %.2f 秒", time.perf_counter() - start)


# ──────────────────────────────────────────────
# 3. wait — 按完成状态分组
# ──────────────────────────────────────────────

async def demo_wait() -> None:
    logger.info("=== wait ===")

    tasks = [
        asyncio.create_task(fetch_url(f"https://api.example.com/{i}"), name=f"Task-{i}")
        for i in range(5)
    ]

    # ✅ FIRST_COMPLETED: 任一任务完成就返回
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)

    logger.info("第一批完成: %d 个", len(done))
    for t in done:
        try:
            logger.info("  %s: %s", t.get_name(), t.result())
        except Exception as e:
            logger.error("  %s: 失败 — %s", t.get_name(), e)

    logger.info("待完成: %d 个", len(pending))

    # 等待剩余
    if pending:
        done2, _ = await asyncio.wait(pending)
        logger.info("全部完成: %d 个", len(done) + len(done2))


# ──────────────────────────────────────────────
# 4. as_completed — 流式处理
# ──────────────────────────────────────────────

async def demo_as_completed() -> None:
    logger.info("=== as_completed ===")

    urls = [f"https://api.example.com/data/{i}" for i in range(5)]
    start = time.perf_counter()

    # ✅ as_completed 按完成顺序逐个产出
    for coro in asyncio.as_completed([fetch_url(url) for url in urls]):
        try:
            result = await coro
            elapsed = time.perf_counter() - start
            logger.info("[%.1fs] 完成: %s", elapsed, result["url"])
        except Exception as e:
            elapsed = time.perf_counter() - start
            logger.error("[%.1fs] 失败: %s", elapsed, e)


# ──────────────────────────────────────────────
# 5. Task 取消
# ──────────────────────────────────────────────

async def cancellable_task(name: str) -> str:
    try:
        logger.info("%s: 开始长时间操作...", name)
        for i in range(10):
            await asyncio.sleep(0.5)
            logger.info("%s: 进度 %d/10", name, i + 1)
        return f"{name} completed"
    except asyncio.CancelledError:
        logger.warning("%s: 被取消！执行清理...", name)
        await asyncio.sleep(0.1)  # 模拟清理
        logger.warning("%s: 清理完成", name)
        raise


async def demo_cancellation() -> None:
    logger.info("=== Task 取消 ===")

    task = asyncio.create_task(cancellable_task("Worker"))

    # 等 1.5 秒后取消
    await asyncio.sleep(1.5)
    logger.info("请求取消...")
    task.cancel("不再需要此任务")

    try:
        result = await task
    except asyncio.CancelledError:
        logger.info("任务已确认取消: cancelled=%s", task.cancelled())


# ──────────────────────────────────────────────
# 6. 回调
# ──────────────────────────────────────────────

async def demo_callbacks() -> None:
    logger.info("=== Task 回调 ===")

    def on_done(task: asyncio.Task) -> None:
        if task.cancelled():
            logger.info("回调: %s 被取消", task.get_name())
        elif task.exception():
            logger.error("回调: %s 失败 — %s", task.get_name(), task.exception())
        else:
            logger.info("回调: %s 成功 — %s", task.get_name(), task.result())

    tasks = [
        asyncio.create_task(fetch_url(f"https://api.example.com/{i}"), name=f"Req-{i}")
        for i in range(4)
    ]

    for t in tasks:
        t.add_done_callback(on_done)

    await asyncio.gather(*tasks, return_exceptions=True)


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

async def main() -> None:
    await demo_create_task()
    print()

    await demo_gather()
    print()

    await demo_wait()
    print()

    await demo_as_completed()
    print()

    await demo_cancellation()
    print()

    await demo_callbacks()
    print()

    logger.info("所有任务与并发演示完成")


if __name__ == "__main__":
    asyncio.run(main())
