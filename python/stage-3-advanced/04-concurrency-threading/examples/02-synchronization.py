"""
第 4 章 示例 02：线程同步原语
- Lock, RLock, Semaphore, Event, Condition, Barrier
- 竞态条件演示与修复
"""

import threading
import time
import logging
from collections import deque

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(threadName)-14s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 1. 竞态条件：无锁 vs 有锁
# ──────────────────────────────────────────────

def demo_race_condition() -> None:
    logger.info("=== 竞态条件演示 ===")

    # ❌ 无锁：结果不确定
    counter_unsafe: int = 0

    def increment_unsafe(n: int) -> None:
        nonlocal counter_unsafe
        for _ in range(n):
            counter_unsafe += 1

    threads = [
        threading.Thread(target=increment_unsafe, args=(100_000,))
        for _ in range(10)
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    logger.info("❌ 无锁结果: %d (期望 1,000,000)", counter_unsafe)

    # ✅ 有锁：结果确定
    counter_safe: int = 0
    lock = threading.Lock()

    def increment_safe(n: int) -> None:
        nonlocal counter_safe
        for _ in range(n):
            with lock:
                counter_safe += 1

    threads = [
        threading.Thread(target=increment_safe, args=(100_000,))
        for _ in range(10)
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    logger.info("✅ 有锁结果: %d (期望 1,000,000)", counter_safe)


# ──────────────────────────────────────────────
# 2. RLock — 可重入锁
# ──────────────────────────────────────────────

class SafeStack:
    """线程安全的栈 — 使用 RLock 支持方法内部互相调用"""

    def __init__(self) -> None:
        self._items: list[int] = []
        self._lock = threading.RLock()

    def push(self, item: int) -> None:
        with self._lock:
            self._items.append(item)
            logger.info("push(%d) → size=%d", item, self.size())  # 调用 size() 再次获取锁

    def pop(self) -> int | None:
        with self._lock:
            if self.size() > 0:  # 调用 size() 再次获取锁 → RLock 允许
                item = self._items.pop()
                logger.info("pop() → %d, size=%d", item, self.size())
                return item
            return None

    def size(self) -> int:
        with self._lock:  # 如果用普通 Lock，这里会死锁
            return len(self._items)


def demo_rlock() -> None:
    logger.info("=== RLock 演示 ===")
    stack = SafeStack()

    def push_items(start: int, count: int) -> None:
        for i in range(start, start + count):
            stack.push(i)
            time.sleep(0.01)

    def pop_items(count: int) -> None:
        for _ in range(count):
            stack.pop()
            time.sleep(0.02)

    t1 = threading.Thread(target=push_items, args=(0, 10), name="Pusher")
    t2 = threading.Thread(target=pop_items, args=(10,), name="Popper")
    t1.start()
    t2.start()
    t1.join()
    t2.join()


# ──────────────────────────────────────────────
# 3. Semaphore — 限制并发
# ──────────────────────────────────────────────

def demo_semaphore() -> None:
    logger.info("=== Semaphore 演示：模拟连接池 ===")

    max_connections = 3
    pool = threading.Semaphore(max_connections)
    active_connections = 0
    active_lock = threading.Lock()

    def db_query(query_id: int) -> None:
        nonlocal active_connections
        with pool:
            with active_lock:
                active_connections += 1
                current = active_connections
            logger.info(
                "查询 %d: 获取连接 (活跃: %d/%d)",
                query_id, current, max_connections,
            )
            time.sleep(0.5)  # 模拟查询
            with active_lock:
                active_connections -= 1
            logger.info("查询 %d: 完成", query_id)

    threads = [
        threading.Thread(target=db_query, args=(i,), name=f"Query-{i}")
        for i in range(8)
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    logger.info("所有查询完成")


# ──────────────────────────────────────────────
# 4. Event — 线程间通知
# ──────────────────────────────────────────────

def demo_event() -> None:
    logger.info("=== Event 演示：服务器就绪通知 ===")

    server_ready = threading.Event()
    shutdown = threading.Event()

    def server() -> None:
        logger.info("服务器启动中...")
        time.sleep(1.5)
        logger.info("服务器就绪！")
        server_ready.set()

        # 等待关闭信号
        shutdown.wait()
        logger.info("服务器关闭")

    def client(client_id: int) -> None:
        logger.info("客户端 %d 等待服务器...", client_id)
        server_ready.wait()  # 阻塞直到 server_ready.set()
        logger.info("客户端 %d 发送请求", client_id)
        time.sleep(0.3)
        logger.info("客户端 %d 完成", client_id)

    server_thread = threading.Thread(target=server, name="Server")
    client_threads = [
        threading.Thread(target=client, args=(i,), name=f"Client-{i}")
        for i in range(4)
    ]

    server_thread.start()
    for t in client_threads:
        t.start()
    for t in client_threads:
        t.join()

    shutdown.set()  # 通知服务器关闭
    server_thread.join()


# ──────────────────────────────────────────────
# 5. Condition — 生产者-消费者协调
# ──────────────────────────────────────────────

def demo_condition() -> None:
    logger.info("=== Condition 演示：有界缓冲区 ===")

    buffer: deque[int] = deque(maxlen=5)
    condition = threading.Condition()
    done = False

    def producer() -> None:
        nonlocal done
        for i in range(8):
            with condition:
                while len(buffer) >= 5:
                    logger.info("缓冲区满 (%d/5)，等待...", len(buffer))
                    condition.wait()
                buffer.append(i)
                logger.info("生产: %d → buffer=%s", i, list(buffer))
                condition.notify_all()
            time.sleep(0.1)
        with condition:
            done = True
            condition.notify_all()

    def consumer(consumer_id: int) -> None:
        while True:
            with condition:
                while len(buffer) == 0 and not done:
                    condition.wait(timeout=1.0)
                if len(buffer) == 0 and done:
                    logger.info("消费者 %d 退出", consumer_id)
                    return
                if len(buffer) > 0:
                    item = buffer.popleft()
                    logger.info("消费者 %d 消费: %d → buffer=%s", consumer_id, item, list(buffer))
                    condition.notify_all()
            time.sleep(0.15)

    p = threading.Thread(target=producer, name="Producer")
    consumers = [
        threading.Thread(target=consumer, args=(i,), name=f"Consumer-{i}")
        for i in range(2)
    ]

    p.start()
    for c in consumers:
        c.start()
    p.join()
    for c in consumers:
        c.join()


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

if __name__ == "__main__":
    demo_race_condition()
    print()

    demo_rlock()
    print()

    demo_semaphore()
    print()

    demo_event()
    print()

    demo_condition()
    print()

    logger.info("所有同步原语演示完成")
