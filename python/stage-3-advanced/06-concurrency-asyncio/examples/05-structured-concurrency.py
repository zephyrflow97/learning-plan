"""
第 6 章 示例 05：结构化并发 (Python 3.11+)
- TaskGroup
- ExceptionGroup / except*
- 对比 gather 和 TaskGroup
- 实际应用模式
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

async def fetch_data(source: str, delay: float = 0.5) -> dict[str, str]:
    logger.info("获取 %s...", source)
    await asyncio.sleep(delay)
    logger.info("获取 %s 完成", source)
    return {"source": source, "data": f"data from {source}"}


async def unreliable_fetch(source: str) -> dict[str, str]:
    """可能失败的请求"""
    await asyncio.sleep(random.uniform(0.2, 0.8))
    if random.random() < 0.4:
        raise ConnectionError(f"连接 {source} 失败")
    return {"source": source, "data": f"data from {source}"}


# ──────────────────────────────────────────────
# 1. TaskGroup 基础
# ──────────────────────────────────────────────

async def demo_basic_task_group() -> None:
    logger.info("=== TaskGroup 基础 ===")
    start = time.perf_counter()

    # ✅ TaskGroup: 所有任务的生命周期绑定到 async with 块
    async with asyncio.TaskGroup() as tg:
        task_db = tg.create_task(fetch_data("database", 1.0))
        task_cache = tg.create_task(fetch_data("cache", 0.3))
        task_api = tg.create_task(fetch_data("api", 0.7))

    # 退出 async with 时，所有任务都已完成
    results = [task_db.result(), task_cache.result(), task_api.result()]
    for r in results:
        logger.info("结果: %s", r)
    logger.info("总耗时: %.2f 秒", time.perf_counter() - start)


# ──────────────────────────────────────────────
# 2. TaskGroup 错误处理
# ──────────────────────────────────────────────

async def demo_task_group_errors() -> None:
    logger.info("=== TaskGroup 错误处理 ===")

    try:
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(fetch_data("good-source-1", 0.5))
            t2 = tg.create_task(unreliable_fetch("bad-source"))
            t3 = tg.create_task(fetch_data("good-source-2", 0.3))
            # 如果 t2 失败，t1 和 t3 会被自动取消

    except* ConnectionError as eg:
        # ✅ except* 处理 ExceptionGroup
        logger.error("捕获 %d 个 ConnectionError:", len(eg.exceptions))
        for exc in eg.exceptions:
            logger.error("  - %s", exc)
    except* ValueError as eg:
        logger.error("捕获 ValueError: %s", eg.exceptions)

    logger.info("程序继续运行（异常已处理）")


# ──────────────────────────────────────────────
# 3. 嵌套 TaskGroup
# ──────────────────────────────────────────────

async def demo_nested_task_group() -> None:
    logger.info("=== 嵌套 TaskGroup ===")

    async def fetch_user_data(user_id: int) -> dict:
        """获取单个用户的全部数据"""
        async with asyncio.TaskGroup() as tg:
            profile_task = tg.create_task(fetch_data(f"user-{user_id}-profile", 0.3))
            posts_task = tg.create_task(fetch_data(f"user-{user_id}-posts", 0.5))
            friends_task = tg.create_task(fetch_data(f"user-{user_id}-friends", 0.4))

        return {
            "user_id": user_id,
            "profile": profile_task.result(),
            "posts": posts_task.result(),
            "friends": friends_task.result(),
        }

    start = time.perf_counter()

    # ✅ 外层 TaskGroup 并发获取多个用户
    async with asyncio.TaskGroup() as tg:
        user_tasks = [
            tg.create_task(fetch_user_data(uid))
            for uid in [101, 102, 103]
        ]

    for task in user_tasks:
        user_data = task.result()
        logger.info("用户 %d: profile=%s, posts=%s, friends=%s",
                     user_data["user_id"],
                     user_data["profile"]["source"],
                     user_data["posts"]["source"],
                     user_data["friends"]["source"])

    logger.info("总耗时: %.2f 秒", time.perf_counter() - start)


# ──────────────────────────────────────────────
# 4. 实际模式：超时 + TaskGroup
# ──────────────────────────────────────────────

async def demo_timeout_with_task_group() -> None:
    logger.info("=== 超时 + TaskGroup ===")

    try:
        async with asyncio.timeout(1.0):
            async with asyncio.TaskGroup() as tg:
                tg.create_task(fetch_data("fast", 0.3))
                tg.create_task(fetch_data("slow", 5.0))  # 会超时
    except TimeoutError:
        logger.warning("TaskGroup 整体超时！所有未完成的任务已取消")

    logger.info("程序继续")


# ──────────────────────────────────────────────
# 5. gather vs TaskGroup 对比
# ──────────────────────────────────────────────

async def demo_gather_vs_taskgroup() -> None:
    logger.info("=== gather vs TaskGroup 对比 ===")

    sources = ["db", "cache", "api", "search"]

    # gather 方式
    start = time.perf_counter()
    results_gather = await asyncio.gather(
        *[fetch_data(s, 0.3) for s in sources]
    )
    logger.info("gather: %d 结果, %.2fs", len(results_gather), time.perf_counter() - start)

    # TaskGroup 方式
    start = time.perf_counter()
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_data(s, 0.3)) for s in sources]
    results_tg = [t.result() for t in tasks]
    logger.info("TaskGroup: %d 结果, %.2fs", len(results_tg), time.perf_counter() - start)


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

async def main() -> None:
    await demo_basic_task_group()
    print()

    await demo_task_group_errors()
    print()

    await demo_nested_task_group()
    print()

    await demo_timeout_with_task_group()
    print()

    await demo_gather_vs_taskgroup()
    print()

    logger.info("所有结构化并发演示完成")


if __name__ == "__main__":
    asyncio.run(main())
