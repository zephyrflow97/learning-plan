"""
第 6 章 示例 03：异步迭代器与异步生成器
- __aiter__ / __anext__
- async for
- async yield (异步生成器)
- 异步推导式
"""

import asyncio
import random
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 1. 异步迭代器（类实现）
# ──────────────────────────────────────────────

class AsyncCounter:
    """异步计数器 — 展示 __aiter__ / __anext__"""

    def __init__(self, start: int, stop: int, delay: float = 0.2) -> None:
        self.current = start
        self.stop = stop
        self.delay = delay

    def __aiter__(self) -> "AsyncCounter":
        return self

    async def __anext__(self) -> int:
        if self.current >= self.stop:
            raise StopAsyncIteration

        await asyncio.sleep(self.delay)
        value = self.current
        self.current += 1
        return value


async def demo_async_iterator() -> None:
    logger.info("=== 异步迭代器（类） ===")

    # ✅ async for 遍历异步迭代器
    async for num in AsyncCounter(1, 6):
        logger.info("计数: %d", num)


# ──────────────────────────────────────────────
# 2. 异步生成器
# ──────────────────────────────────────────────

async def async_range(start: int, stop: int, delay: float = 0.2):
    """异步 range — 最简单的异步生成器"""
    for i in range(start, stop):
        await asyncio.sleep(delay)
        yield i


async def fetch_pages(
    base_url: str,
    total_pages: int,
) -> dict[str, str | int]:
    """模拟异步分页获取"""
    for page in range(1, total_pages + 1):
        await asyncio.sleep(random.uniform(0.2, 0.5))
        yield {
            "url": f"{base_url}?page={page}",
            "page": page,
            "items": random.randint(10, 50),
        }


async def demo_async_generator() -> None:
    logger.info("=== 异步生成器 ===")

    # ✅ 异步 range
    logger.info("-- async_range --")
    total = 0
    async for num in async_range(1, 8):
        total += num
        logger.info("  num=%d, running_total=%d", num, total)
    logger.info("总和: %d", total)

    # ✅ 异步分页获取
    logger.info("-- fetch_pages --")
    all_items = 0
    async for page_data in fetch_pages("https://api.example.com/data", 5):
        all_items += page_data["items"]
        logger.info("  页 %d: %d 条数据, URL=%s",
                     page_data["page"], page_data["items"], page_data["url"])
    logger.info("总条数: %d", all_items)


# ──────────────────────────────────────────────
# 3. 异步推导式
# ──────────────────────────────────────────────

async def demo_async_comprehensions() -> None:
    logger.info("=== 异步推导式 ===")

    # ✅ 异步列表推导
    squares = [x * x async for x in async_range(1, 6, 0.1)]
    logger.info("平方数: %s", squares)

    # ✅ 异步集合推导
    even_set = {x async for x in async_range(0, 10, 0.05) if x % 2 == 0}
    logger.info("偶数集合: %s", sorted(even_set))

    # ✅ 异步字典推导
    mapping = {x: x ** 2 async for x in async_range(1, 6, 0.05)}
    logger.info("映射: %s", mapping)


# ──────────────────────────────────────────────
# 4. 实用异步生成器：事件流
# ──────────────────────────────────────────────

async def event_stream(
    source: str,
    count: int,
) -> dict[str, str | int]:
    """模拟事件流（如 SSE、WebSocket 消息）"""
    for i in range(count):
        await asyncio.sleep(random.uniform(0.1, 0.4))
        event = {
            "source": source,
            "event_id": i,
            "type": random.choice(["click", "scroll", "keypress", "submit"]),
            "data": f"event-{source}-{i}",
        }
        yield event


async def demo_event_stream() -> None:
    logger.info("=== 异步事件流 ===")

    # ✅ 处理单个事件流
    event_count = 0
    async for event in event_stream("frontend", 8):
        event_count += 1
        logger.info("事件 #%d: type=%s, id=%d, source=%s",
                     event_count, event["type"], event["event_id"], event["source"])

    logger.info("总共处理 %d 个事件", event_count)


# ──────────────────────────────────────────────
# 5. 合并多个异步生成器
# ──────────────────────────────────────────────

async def merge_streams(*streams):
    """合并多个异步生成器（先到先得）"""
    queue: asyncio.Queue = asyncio.Queue()
    sentinel = object()
    active = len(streams)

    async def feed(stream) -> None:
        nonlocal active
        async for item in stream:
            await queue.put(item)
        await queue.put(sentinel)

    # 启动所有 feeder
    tasks = [asyncio.create_task(feed(s)) for s in streams]

    active_count = len(streams)
    while active_count > 0:
        item = await queue.get()
        if item is sentinel:
            active_count -= 1
        else:
            yield item

    # 确保所有 feeder 完成
    await asyncio.gather(*tasks)


async def demo_merge_streams() -> None:
    logger.info("=== 合并异步流 ===")

    stream_a = event_stream("mobile", 3)
    stream_b = event_stream("desktop", 3)

    count = 0
    async for event in merge_streams(stream_a, stream_b):
        count += 1
        logger.info("合并 #%d: source=%s, type=%s",
                     count, event["source"], event["type"])


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

async def main() -> None:
    await demo_async_iterator()
    print()

    await demo_async_generator()
    print()

    await demo_async_comprehensions()
    print()

    await demo_event_stream()
    print()

    await demo_merge_streams()
    print()

    logger.info("所有异步迭代器演示完成")


if __name__ == "__main__":
    asyncio.run(main())
