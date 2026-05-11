"""
第 5 章 示例 02：进程间通信 (IPC)
- Queue: 多生产者多消费者
- Pipe: 双向通信
- 性能对比
"""

import multiprocessing
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
# 1. Queue — 多生产者多消费者
# ──────────────────────────────────────────────

SENTINEL = "STOP"


def queue_producer(
    q: multiprocessing.Queue,
    producer_id: int,
    items: list[str],
) -> None:
    for item in items:
        q.put(f"P{producer_id}:{item}")
        logger.info("Producer-%d 发送: %s", producer_id, item)
        time.sleep(0.05)


def queue_consumer(
    q: multiprocessing.Queue,
    consumer_id: int,
) -> None:
    count = 0
    while True:
        item = q.get()
        if item == SENTINEL:
            logger.info("Consumer-%d 退出 (处理了 %d 条)", consumer_id, count)
            break
        logger.info("Consumer-%d 接收: %s", consumer_id, item)
        time.sleep(0.08)
        count += 1


def demo_queue_ipc() -> None:
    logger.info("=== Queue IPC ===")

    q: multiprocessing.Queue = multiprocessing.Queue(maxsize=10)
    num_consumers = 2

    producers = [
        multiprocessing.Process(
            target=queue_producer,
            args=(q, i, [f"item-{j}" for j in range(5)]),
        )
        for i in range(2)
    ]
    consumers = [
        multiprocessing.Process(target=queue_consumer, args=(q, i))
        for i in range(num_consumers)
    ]

    for p in producers + consumers:
        p.start()

    # 等待生产者完成
    for p in producers:
        p.join()

    # 发送停止信号
    for _ in range(num_consumers):
        q.put(SENTINEL)

    for c in consumers:
        c.join()


# ──────────────────────────────────────────────
# 2. Pipe — 双向通信
# ──────────────────────────────────────────────

def pipe_calculator(conn: multiprocessing.connection.Connection) -> None:
    """计算服务进程：接收 (op, a, b)，返回结果"""
    logger.info("计算器启动, PID=%d", os.getpid())
    while True:
        try:
            msg = conn.recv()
            if msg == "QUIT":
                logger.info("计算器退出")
                break

            op, a, b = msg
            operations = {
                "+": lambda x, y: x + y,
                "-": lambda x, y: x - y,
                "*": lambda x, y: x * y,
                "/": lambda x, y: x / y if y != 0 else float("inf"),
            }
            result = operations.get(op, lambda x, y: "ERROR")(a, b)
            logger.info("计算: %s %s %s = %s", a, op, b, result)
            conn.send({"op": op, "a": a, "b": b, "result": result})
        except EOFError:
            break
    conn.close()


def demo_pipe_ipc() -> None:
    logger.info("=== Pipe IPC (双向通信) ===")

    parent_conn, child_conn = multiprocessing.Pipe()

    calc = multiprocessing.Process(target=pipe_calculator, args=(child_conn,))
    calc.start()

    # ✅ 发送任务并接收结果
    tasks = [("+", 10, 20), ("*", 7, 8), ("-", 100, 37), ("/", 42, 6)]
    for task in tasks:
        parent_conn.send(task)
        result = parent_conn.recv()
        logger.info("结果: %s", result)

    parent_conn.send("QUIT")
    calc.join()
    parent_conn.close()


# ──────────────────────────────────────────────
# 3. Pipe vs Queue 性能对比
# ──────────────────────────────────────────────

def pipe_sender(conn: multiprocessing.connection.Connection, count: int) -> None:
    for i in range(count):
        conn.send(i)
    conn.send(None)


def pipe_receiver(conn: multiprocessing.connection.Connection) -> int:
    total = 0
    while True:
        msg = conn.recv()
        if msg is None:
            break
        total += 1
    return total


def queue_sender(q: multiprocessing.Queue, count: int) -> None:
    for i in range(count):
        q.put(i)
    q.put(None)


def queue_receiver(q: multiprocessing.Queue) -> int:
    total = 0
    while True:
        msg = q.get()
        if msg is None:
            break
        total += 1
    return total


def demo_performance_comparison() -> None:
    logger.info("=== Pipe vs Queue 性能对比 ===")
    count = 10_000

    # Pipe
    parent_conn, child_conn = multiprocessing.Pipe()
    start = time.perf_counter()
    s = multiprocessing.Process(target=pipe_sender, args=(parent_conn, count))
    r = multiprocessing.Process(target=pipe_receiver, args=(child_conn,))
    s.start()
    r.start()
    s.join()
    r.join()
    pipe_time = time.perf_counter() - start
    logger.info("Pipe:  %d 消息, %.3f 秒", count, pipe_time)

    # Queue
    q: multiprocessing.Queue = multiprocessing.Queue()
    start = time.perf_counter()
    s = multiprocessing.Process(target=queue_sender, args=(q, count))
    r = multiprocessing.Process(target=queue_receiver, args=(q,))
    s.start()
    r.start()
    s.join()
    r.join()
    queue_time = time.perf_counter() - start
    logger.info("Queue: %d 消息, %.3f 秒", count, queue_time)

    logger.info("Pipe 是 Queue 的 %.2fx 速度", queue_time / pipe_time)


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

if __name__ == "__main__":
    demo_queue_ipc()
    print()

    demo_pipe_ipc()
    print()

    demo_performance_comparison()
    print()

    logger.info("所有 IPC 演示完成")
