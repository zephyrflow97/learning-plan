"""
第 4 章 示例 04：生产者-消费者模式
- 基于 Queue 的经典实现
- 多生产者多消费者
- 优雅关闭（毒丸 + Event）
- 监控统计
"""

import queue
import threading
import time
import random
import logging
from dataclasses import dataclass, field

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(threadName)-14s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 数据模型
# ──────────────────────────────────────────────

@dataclass
class Task:
    task_id: int
    payload: str
    priority: int = 0  # 数字越小优先级越高
    created_at: float = field(default_factory=time.time)

    def __lt__(self, other: "Task") -> bool:
        return self.priority < other.priority


@dataclass
class Stats:
    produced: int = 0
    consumed: int = 0
    errors: int = 0
    lock: threading.Lock = field(default_factory=threading.Lock)

    def record_produced(self) -> None:
        with self.lock:
            self.produced += 1

    def record_consumed(self) -> None:
        with self.lock:
            self.consumed += 1

    def record_error(self) -> None:
        with self.lock:
            self.errors += 1


# ──────────────────────────────────────────────
# 1. 基础生产者-消费者
# ──────────────────────────────────────────────

SENTINEL = None  # 毒丸信号


def basic_producer(
    task_queue: queue.Queue[Task | None],
    producer_id: int,
    num_tasks: int,
    stats: Stats,
) -> None:
    """生产者：向队列中放入任务"""
    for i in range(num_tasks):
        task = Task(
            task_id=producer_id * 1000 + i,
            payload=f"data-{producer_id}-{i}",
            priority=random.randint(0, 5),
        )
        task_queue.put(task)
        stats.record_produced()
        logger.info("生产: %s (priority=%d, qsize≈%d)",
                     task.payload, task.priority, task_queue.qsize())
        time.sleep(random.uniform(0.05, 0.15))


def basic_consumer(
    task_queue: queue.Queue[Task | None],
    consumer_id: int,
    stats: Stats,
) -> None:
    """消费者：从队列中取出任务并处理"""
    while True:
        task = task_queue.get()

        if task is SENTINEL:
            logger.info("消费者 %d 收到停止信号", consumer_id)
            task_queue.task_done()
            break

        try:
            # 模拟处理
            process_time = random.uniform(0.1, 0.3)
            time.sleep(process_time)

            latency = time.time() - task.created_at
            logger.info(
                "消费者 %d 处理: %s (耗时 %.2fs, 延迟 %.2fs)",
                consumer_id, task.payload, process_time, latency,
            )
            stats.record_consumed()

        except Exception as e:
            logger.error("消费者 %d 处理失败: %s — %s", consumer_id, task.payload, e)
            stats.record_error()

        finally:
            task_queue.task_done()


def demo_basic_producer_consumer() -> None:
    logger.info("=== 基础生产者-消费者 ===")

    task_queue: queue.Queue[Task | None] = queue.Queue(maxsize=10)
    stats = Stats()

    num_producers = 2
    num_consumers = 3
    tasks_per_producer = 5

    # 启动消费者
    consumers = [
        threading.Thread(
            target=basic_consumer,
            args=(task_queue, i, stats),
            name=f"Consumer-{i}",
        )
        for i in range(num_consumers)
    ]
    for c in consumers:
        c.start()

    # 启动生产者
    producers = [
        threading.Thread(
            target=basic_producer,
            args=(task_queue, i, tasks_per_producer, stats),
            name=f"Producer-{i}",
        )
        for i in range(num_producers)
    ]
    for p in producers:
        p.start()

    # 等待所有生产者完成
    for p in producers:
        p.join()

    # 发送毒丸信号给每个消费者
    for _ in range(num_consumers):
        task_queue.put(SENTINEL)

    # 等待队列中所有任务被处理
    task_queue.join()

    # 等待所有消费者退出
    for c in consumers:
        c.join()

    logger.info(
        "统计: 生产=%d, 消费=%d, 错误=%d",
        stats.produced, stats.consumed, stats.errors,
    )


# ──────────────────────────────────────────────
# 2. 优先级队列版本
# ──────────────────────────────────────────────

def demo_priority_queue() -> None:
    logger.info("=== 优先级生产者-消费者 ===")

    pq: queue.PriorityQueue[tuple[int, Task] | tuple[int, None]] = queue.PriorityQueue(maxsize=20)

    def priority_producer(producer_id: int, count: int) -> None:
        for i in range(count):
            priority = random.randint(0, 9)
            task = Task(
                task_id=producer_id * 100 + i,
                payload=f"job-{producer_id}-{i}",
                priority=priority,
            )
            pq.put((priority, task))
            logger.info("生产: %s (优先级=%d)", task.payload, priority)
            time.sleep(0.05)

    def priority_consumer(consumer_id: int) -> None:
        while True:
            priority, task = pq.get()
            if task is None:
                pq.task_done()
                break
            logger.info(
                "消费者 %d 处理: %s (优先级=%d)",
                consumer_id, task.payload, priority,
            )
            time.sleep(0.1)
            pq.task_done()

    # 先生产
    producers = [
        threading.Thread(target=priority_producer, args=(i, 5), name=f"PriProducer-{i}")
        for i in range(2)
    ]
    for p in producers:
        p.start()
    for p in producers:
        p.join()

    # 再消费（能看到按优先级排序的效果）
    num_consumers = 2
    consumers = [
        threading.Thread(target=priority_consumer, args=(i,), name=f"PriConsumer-{i}")
        for i in range(num_consumers)
    ]
    for c in consumers:
        c.start()

    # 发送停止信号（优先级设为最大，确保最后被取出）
    for _ in range(num_consumers):
        pq.put((999, None))

    for c in consumers:
        c.join()
    logger.info("优先级队列演示完成")


# ──────────────────────────────────────────────
# 3. 带监控的管道
# ──────────────────────────────────────────────

def demo_pipeline_with_monitor() -> None:
    logger.info("=== 带监控的管道 ===")

    raw_queue: queue.Queue[str | None] = queue.Queue(maxsize=10)
    processed_queue: queue.Queue[str | None] = queue.Queue(maxsize=10)
    shutdown_event = threading.Event()

    def stage1_producer(count: int) -> None:
        """第一阶段：生成原始数据"""
        for i in range(count):
            data = f"raw-{i}"
            raw_queue.put(data)
            logger.info("Stage1 生产: %s", data)
            time.sleep(0.08)
        raw_queue.put(None)

    def stage2_processor() -> None:
        """第二阶段：处理数据"""
        while True:
            data = raw_queue.get()
            if data is None:
                raw_queue.task_done()
                processed_queue.put(None)
                break
            result = data.upper().replace("RAW", "PROCESSED")
            processed_queue.put(result)
            logger.info("Stage2 处理: %s → %s", data, result)
            raw_queue.task_done()
            time.sleep(0.1)

    def stage3_consumer() -> None:
        """第三阶段：消费最终数据"""
        while True:
            data = processed_queue.get()
            if data is None:
                processed_queue.task_done()
                break
            logger.info("Stage3 消费: %s ✓", data)
            processed_queue.task_done()
            time.sleep(0.05)
        shutdown_event.set()

    def monitor() -> None:
        """监控线程：周期性输出队列状态"""
        while not shutdown_event.is_set():
            logger.info(
                "[MONITOR] raw_queue=%d, processed_queue=%d",
                raw_queue.qsize(), processed_queue.qsize(),
            )
            shutdown_event.wait(timeout=0.5)
        logger.info("[MONITOR] 管道关闭")

    # 启动所有阶段
    threads = [
        threading.Thread(target=stage1_producer, args=(10,), name="Stage1"),
        threading.Thread(target=stage2_processor, name="Stage2"),
        threading.Thread(target=stage3_consumer, name="Stage3"),
        threading.Thread(target=monitor, daemon=True, name="Monitor"),
    ]
    for t in threads:
        t.start()
    for t in threads:
        if not t.daemon:
            t.join()

    logger.info("管道演示完成")


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

if __name__ == "__main__":
    demo_basic_producer_consumer()
    print()

    demo_priority_queue()
    print()

    demo_pipeline_with_monitor()
    print()

    logger.info("所有生产者-消费者演示完成")
