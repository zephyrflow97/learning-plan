"""
第 6 章 示例 01：协程基础
- async/await 语法
- 协程对象
- 可等待对象类型
- asyncio.run() 入口
"""

import asyncio
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 1. 定义协程函数
# ──────────────────────────────────────────────

async def greet(name: str, delay: float = 0.5) -> str:
    """最简单的协程"""
    logger.info("准备问候 %s...", name)
    await asyncio.sleep(delay)
    message = f"Hello, {name}!"
    logger.info(message)
    return message


async def demo_basic_coroutine() -> None:
    logger.info("=== 基本协程 ===")

    # ✅ await 执行协程
    result = await greet("World")
    logger.info("返回值: %s", result)

    # 查看协程类型
    coro = greet("Python")
    logger.info("协程类型: %s", type(coro))  # <class 'coroutine'>
    result = await coro  # 必须 await 才会执行
    logger.info("返回值: %s", result)


# ──────────────────────────────────────────────
# 2. 串行 vs 并发
# ──────────────────────────────────────────────

async def fetch_data(source: str, delay: float) -> dict[str, str]:
    """模拟数据获取"""
    logger.info("获取 %s...", source)
    await asyncio.sleep(delay)
    logger.info("获取 %s 完成", source)
    return {"source": source, "data": f"data from {source}"}


async def demo_serial_vs_concurrent() -> None:
    logger.info("=== 串行 vs 并发 ===")

    # ❌ 串行执行
    start = time.perf_counter()
    r1 = await fetch_data("db", 1.0)
    r2 = await fetch_data("api", 1.0)
    r3 = await fetch_data("cache", 1.0)
    serial_time = time.perf_counter() - start
    logger.info("❌ 串行: %.2f 秒", serial_time)

    # ✅ 并发执行
    start = time.perf_counter()
    r1, r2, r3 = await asyncio.gather(
        fetch_data("db", 1.0),
        fetch_data("api", 1.0),
        fetch_data("cache", 1.0),
    )
    concurrent_time = time.perf_counter() - start
    logger.info("✅ 并发: %.2f 秒 (加速 %.1fx)", concurrent_time, serial_time / concurrent_time)


# ──────────────────────────────────────────────
# 3. 嵌套协程
# ──────────────────────────────────────────────

async def step_1() -> str:
    logger.info("Step 1: 查询数据库")
    await asyncio.sleep(0.5)
    return "user_data"


async def step_2(data: str) -> str:
    logger.info("Step 2: 处理数据 (%s)", data)
    await asyncio.sleep(0.3)
    return f"processed_{data}"


async def step_3(data: str) -> str:
    logger.info("Step 3: 保存结果 (%s)", data)
    await asyncio.sleep(0.2)
    return f"saved_{data}"


async def demo_pipeline() -> None:
    """协程管道：每一步依赖上一步的结果"""
    logger.info("=== 协程管道 ===")

    start = time.perf_counter()

    # ✅ 顺序 await 表达依赖关系
    data = await step_1()
    processed = await step_2(data)
    result = await step_3(processed)

    logger.info("最终结果: %s, 耗时: %.2f 秒", result, time.perf_counter() - start)


# ──────────────────────────────────────────────
# 4. 超时控制
# ──────────────────────────────────────────────

async def slow_operation(name: str) -> str:
    logger.info("%s: 开始 (需要 5 秒)", name)
    await asyncio.sleep(5)
    return f"{name} done"


async def demo_timeout() -> None:
    logger.info("=== 超时控制 ===")

    # ✅ wait_for 设置超时
    try:
        result = await asyncio.wait_for(slow_operation("Task-A"), timeout=2.0)
        logger.info("结果: %s", result)
    except asyncio.TimeoutError:
        logger.warning("Task-A 超时 (2秒限制)")

    # ✅ Python 3.11+ timeout 上下文管理器
    try:
        async with asyncio.timeout(1.5):
            result = await slow_operation("Task-B")
    except asyncio.TimeoutError:
        logger.warning("Task-B 超时 (1.5秒限制)")


# ──────────────────────────────────────────────
# 5. 自定义 Awaitable
# ──────────────────────────────────────────────

class AsyncDelay:
    """自定义可等待对象"""

    def __init__(self, seconds: float, value: str) -> None:
        self.seconds = seconds
        self.value = value

    def __await__(self):
        # 委托给 asyncio.sleep
        yield from asyncio.sleep(self.seconds).__await__()
        return self.value


async def demo_custom_awaitable() -> None:
    logger.info("=== 自定义 Awaitable ===")

    result = await AsyncDelay(0.5, "custom result")
    logger.info("结果: %s", result)


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

async def main() -> None:
    await demo_basic_coroutine()
    print()

    await demo_serial_vs_concurrent()
    print()

    await demo_pipeline()
    print()

    await demo_timeout()
    print()

    await demo_custom_awaitable()
    print()

    logger.info("所有协程基础演示完成")


if __name__ == "__main__":
    asyncio.run(main())
