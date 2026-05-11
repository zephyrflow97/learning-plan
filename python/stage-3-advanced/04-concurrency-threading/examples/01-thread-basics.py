"""
第 4 章 示例 01：线程基础
- 创建和启动线程
- daemon 线程
- join 超时
- 线程信息查询
"""

import threading
import time
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(threadName)-12s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 1. 基本线程创建
# ──────────────────────────────────────────────

def simple_worker(task_id: int, duration: float) -> None:
    """模拟一个耗时任务"""
    logger.info("任务 %d 开始 (预计 %.1fs)", task_id, duration)
    time.sleep(duration)
    logger.info("任务 %d 完成", task_id)


def demo_basic_thread() -> None:
    logger.info("=== 基本线程创建 ===")

    # ✅ 创建线程并启动
    t1 = threading.Thread(
        target=simple_worker, args=(1, 1.0), name="Worker-1"
    )
    t2 = threading.Thread(
        target=simple_worker, args=(2, 0.5), name="Worker-2"
    )

    t1.start()
    t2.start()

    logger.info("主线程继续运行，活跃线程数: %d", threading.active_count())

    t1.join()  # 等待 t1 完成
    t2.join()  # 等待 t2 完成
    logger.info("所有任务完成")


# ──────────────────────────────────────────────
# 2. 继承 Thread 类
# ──────────────────────────────────────────────

class CountdownThread(threading.Thread):
    """倒计时线程 — 展示继承 Thread 的方式"""

    def __init__(self, name: str, count: int) -> None:
        super().__init__(name=name)
        self.count = count
        self.result: str = ""

    def run(self) -> None:
        for i in range(self.count, 0, -1):
            logger.info("倒计时: %d", i)
            time.sleep(0.3)
        self.result = f"{self.name} 倒计时完成"
        logger.info(self.result)


def demo_thread_subclass() -> None:
    logger.info("=== 继承 Thread 类 ===")

    countdown = CountdownThread(name="Countdown", count=5)
    countdown.start()
    countdown.join()

    # ✅ 可以访问线程对象的属性
    logger.info("线程结果: %s", countdown.result)


# ──────────────────────────────────────────────
# 3. Daemon 线程
# ──────────────────────────────────────────────

def heartbeat(interval: float = 0.5) -> None:
    """后台心跳线程"""
    count = 0
    while True:
        count += 1
        logger.debug("💓 心跳 #%d", count)
        time.sleep(interval)


def demo_daemon_thread() -> None:
    logger.info("=== Daemon 线程 ===")

    # ✅ daemon=True 的线程在主线程退出时自动终止
    monitor = threading.Thread(target=heartbeat, daemon=True, name="Heartbeat")
    monitor.start()

    logger.info("Daemon? %s, Alive? %s", monitor.daemon, monitor.is_alive())

    # 主线程做一些工作
    time.sleep(2)
    logger.info("主线程工作完成，daemon 线程将随之终止")
    # 程序不会因为 daemon 线程而等待


# ──────────────────────────────────────────────
# 4. join 超时
# ──────────────────────────────────────────────

def slow_operation() -> None:
    logger.info("开始慢操作 (需要 5 秒)...")
    time.sleep(5)
    logger.info("慢操作完成")


def demo_join_timeout() -> None:
    logger.info("=== join 超时 ===")

    t = threading.Thread(target=slow_operation, name="SlowOp")
    t.start()

    # ✅ 设置超时，不会永远阻塞
    t.join(timeout=2.0)
    if t.is_alive():
        logger.warning("线程未在 2 秒内完成 (仍在运行)")
    else:
        logger.info("线程已完成")

    # 注意：join(timeout) 不会终止线程，线程仍在后台运行
    # 如果需要等待它完成：
    t.join()
    logger.info("现在线程真正完成了")


# ──────────────────────────────────────────────
# 5. 线程信息查询
# ──────────────────────────────────────────────

def demo_thread_info() -> None:
    logger.info("=== 线程信息 ===")

    current = threading.current_thread()
    logger.info("当前线程: name=%s, ident=%s", current.name, current.ident)
    logger.info("活跃线程数: %d", threading.active_count())
    logger.info("所有线程: %s", [t.name for t in threading.enumerate()])

    # 创建几个线程查看信息
    workers = [
        threading.Thread(target=time.sleep, args=(1,), name=f"Info-Worker-{i}")
        for i in range(3)
    ]
    for w in workers:
        w.start()

    logger.info("启动后活跃线程数: %d", threading.active_count())
    logger.info("所有线程: %s", [t.name for t in threading.enumerate()])

    for w in workers:
        w.join()


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

if __name__ == "__main__":
    demo_basic_thread()
    print()

    demo_thread_subclass()
    print()

    demo_daemon_thread()
    print()

    demo_join_timeout()
    print()

    demo_thread_info()
    print()

    logger.info("所有演示完成")
