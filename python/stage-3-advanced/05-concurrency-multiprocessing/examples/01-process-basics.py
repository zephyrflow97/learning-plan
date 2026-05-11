"""
第 5 章 示例 01：进程基础
- 创建和管理进程
- 进程信息查询
- 启动方式差异
- 返回值获取
"""

import multiprocessing
import os
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [PID %(process)d] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 1. 基本进程创建
# ──────────────────────────────────────────────

def worker(name: str, duration: float) -> None:
    """模拟工作进程"""
    logger.info("进程 '%s' 启动, PID=%d, PPID=%d", name, os.getpid(), os.getppid())
    time.sleep(duration)
    logger.info("进程 '%s' 完成", name)


def demo_basic_process() -> None:
    logger.info("=== 基本进程创建 ===")
    logger.info("主进程 PID=%d", os.getpid())

    # ✅ 创建进程
    p1 = multiprocessing.Process(target=worker, args=("Worker-A", 1.5), name="Worker-A")
    p2 = multiprocessing.Process(target=worker, args=("Worker-B", 1.0), name="Worker-B")

    p1.start()
    p2.start()

    logger.info("p1: name=%s, pid=%s, alive=%s", p1.name, p1.pid, p1.is_alive())
    logger.info("p2: name=%s, pid=%s, alive=%s", p2.name, p2.pid, p2.is_alive())

    p1.join()
    p2.join()

    logger.info("p1 exitcode=%s, p2 exitcode=%s", p1.exitcode, p2.exitcode)


# ──────────────────────────────────────────────
# 2. 进程 vs 线程 CPU 密集对比
# ──────────────────────────────────────────────

def cpu_heavy(n: int) -> int:
    """CPU 密集型任务"""
    total = 0
    for i in range(n):
        total += i * i
    return total


def demo_cpu_benchmark() -> None:
    logger.info("=== CPU 密集：进程 vs 线程 ===")
    import threading

    N = 5_000_000
    num_workers = 4

    # 串行
    start = time.perf_counter()
    for _ in range(num_workers):
        cpu_heavy(N)
    serial_time = time.perf_counter() - start
    logger.info("串行: %.2f 秒", serial_time)

    # ❌ 多线程（受 GIL 限制）
    start = time.perf_counter()
    threads = [threading.Thread(target=cpu_heavy, args=(N,)) for _ in range(num_workers)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    thread_time = time.perf_counter() - start
    logger.info("❌ 多线程: %.2f 秒 (加速 %.2fx)", thread_time, serial_time / thread_time)

    # ✅ 多进程（绕过 GIL）
    start = time.perf_counter()
    processes = [multiprocessing.Process(target=cpu_heavy, args=(N,)) for _ in range(num_workers)]
    for p in processes:
        p.start()
    for p in processes:
        p.join()
    process_time = time.perf_counter() - start
    logger.info("✅ 多进程: %.2f 秒 (加速 %.2fx)", process_time, serial_time / process_time)


# ──────────────────────────────────────────────
# 3. 进程退出码
# ──────────────────────────────────────────────

def success_worker() -> None:
    logger.info("正常完成")


def error_worker() -> None:
    raise RuntimeError("出错了！")


def exit_worker() -> None:
    import sys
    sys.exit(42)  # 自定义退出码


def demo_exit_codes() -> None:
    logger.info("=== 进程退出码 ===")

    procs = [
        ("Success", multiprocessing.Process(target=success_worker)),
        ("Error", multiprocessing.Process(target=error_worker)),
        ("Exit-42", multiprocessing.Process(target=exit_worker)),
    ]

    for name, p in procs:
        p.start()
        p.join()
        logger.info("%s: exitcode=%s", name, p.exitcode)
        # exitcode=0 → 正常退出
        # exitcode=1 → 异常退出
        # exitcode=42 → sys.exit(42)
        # exitcode<0 → 被信号终止 (Unix)


# ──────────────────────────────────────────────
# 4. 通过 Queue 获取返回值
# ──────────────────────────────────────────────

def compute_with_result(
    task_id: int,
    data: int,
    result_queue: multiprocessing.Queue,
) -> None:
    """通过队列返回计算结果"""
    result = data ** 2
    logger.info("Task %d: %d^2 = %d", task_id, data, result)
    result_queue.put((task_id, result))


def demo_return_values() -> None:
    logger.info("=== 通过 Queue 获取返回值 ===")

    result_queue: multiprocessing.Queue = multiprocessing.Queue()
    data = [10, 20, 30, 40, 50]

    processes = [
        multiprocessing.Process(target=compute_with_result, args=(i, d, result_queue))
        for i, d in enumerate(data)
    ]

    for p in processes:
        p.start()
    for p in processes:
        p.join()

    # ✅ 收集结果
    results: dict[int, int] = {}
    while not result_queue.empty():
        task_id, result = result_queue.get()
        results[task_id] = result

    logger.info("结果（按任务ID排序）: %s", dict(sorted(results.items())))


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

if __name__ == "__main__":
    logger.info("启动方式: %s", multiprocessing.get_start_method())
    logger.info("CPU 核心数: %d", os.cpu_count())
    print()

    demo_basic_process()
    print()

    demo_cpu_benchmark()
    print()

    demo_exit_codes()
    print()

    demo_return_values()
    print()

    logger.info("所有进程基础演示完成")
