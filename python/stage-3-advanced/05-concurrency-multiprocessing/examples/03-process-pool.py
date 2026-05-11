"""
第 5 章 示例 03：ProcessPoolExecutor
- submit + as_completed
- map + chunksize
- initializer
- 异常处理
"""

from concurrent.futures import ProcessPoolExecutor, as_completed, Future
import math
import time
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [PID %(process)d] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 任务函数（必须在模块顶层定义才能 pickle）
# ──────────────────────────────────────────────

def is_prime(n: int) -> tuple[int, bool]:
    """判断是否为素数"""
    if n < 2:
        return n, False
    if n < 4:
        return n, True
    if n % 2 == 0 or n % 3 == 0:
        return n, False
    for i in range(5, int(math.sqrt(n)) + 1, 6):
        if n % i == 0 or n % (i + 2) == 0:
            return n, False
    return n, True


def factorial_sum(n: int) -> tuple[int, int]:
    """计算 1! + 2! + ... + n! 的位数"""
    total = sum(math.factorial(i) for i in range(1, n + 1))
    digits = len(str(total))
    logger.info("factorial_sum(%d) = %d 位数", n, digits)
    return n, digits


# ──────────────────────────────────────────────
# initializer 函数
# ──────────────────────────────────────────────

_worker_config: dict = {}


def init_worker(config_value: str) -> None:
    """每个工作进程启动时执行一次"""
    global _worker_config
    _worker_config = {"value": config_value, "pid": os.getpid()}
    logger.info("Worker 初始化: config=%s", _worker_config)


def process_with_config(item: int) -> str:
    """使用 initializer 中设置的配置"""
    return f"PID={_worker_config['pid']}, config={_worker_config['value']}, item={item}"


# ──────────────────────────────────────────────
# 1. submit + as_completed
# ──────────────────────────────────────────────

def demo_submit() -> None:
    logger.info("=== submit + as_completed ===")

    primes_to_check = [
        15485863, 32452843, 49979687, 67867967,
        86028121, 104395301, 122949823, 141650939,
    ]

    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
        future_to_n: dict[Future, int] = {
            executor.submit(is_prime, n): n for n in primes_to_check
        }

        for future in as_completed(future_to_n):
            n = future_to_n[future]
            _, result = future.result()
            logger.info("%d → %s", n, "素数 ✅" if result else "合数 ❌")

    logger.info("耗时: %.3f 秒", time.perf_counter() - start)


# ──────────────────────────────────────────────
# 2. map + chunksize
# ──────────────────────────────────────────────

def demo_map_chunksize() -> None:
    logger.info("=== map + chunksize 对比 ===")

    numbers = list(range(2, 50_001))

    for chunksize in [1, 100, 1000, 5000]:
        start = time.perf_counter()
        with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
            results = list(executor.map(is_prime, numbers, chunksize=chunksize))
        elapsed = time.perf_counter() - start
        prime_count = sum(1 for _, is_p in results if is_p)
        logger.info("chunksize=%5d → %.3f 秒 (找到 %d 个素数)", chunksize, elapsed, prime_count)


# ──────────────────────────────────────────────
# 3. initializer
# ──────────────────────────────────────────────

def demo_initializer() -> None:
    logger.info("=== initializer ===")

    with ProcessPoolExecutor(
        max_workers=2,
        initializer=init_worker,
        initargs=("production",),
    ) as executor:
        results = list(executor.map(process_with_config, range(6)))

    for r in results:
        logger.info("结果: %s", r)


# ──────────────────────────────────────────────
# 4. 异常处理
# ──────────────────────────────────────────────

def risky_task(x: int) -> float:
    """可能失败的任务"""
    if x == 3:
        raise ValueError(f"不能处理 {x}!")
    if x == 7:
        raise ZeroDivisionError("除零错误!")
    return x ** 0.5


def demo_error_handling() -> None:
    logger.info("=== 异常处理 ===")

    with ProcessPoolExecutor(max_workers=2) as executor:
        futures = {executor.submit(risky_task, i): i for i in range(10)}

        for future in as_completed(futures):
            x = futures[future]
            try:
                result = future.result()
                logger.info("✅ risky_task(%d) = %.3f", x, result)
            except ValueError as e:
                logger.error("❌ risky_task(%d): ValueError — %s", x, e)
            except ZeroDivisionError as e:
                logger.error("❌ risky_task(%d): ZeroDivisionError — %s", x, e)


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

if __name__ == "__main__":
    demo_submit()
    print()

    demo_map_chunksize()
    print()

    demo_initializer()
    print()

    demo_error_handling()
    print()

    logger.info("所有进程池演示完成")
