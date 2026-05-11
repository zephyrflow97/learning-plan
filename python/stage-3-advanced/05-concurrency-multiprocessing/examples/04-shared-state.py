"""
第 5 章 示例 04：共享状态
- Value / Array: 底层共享内存
- Manager: 高级共享数据结构
- shared_memory (Python 3.8+): 零拷贝共享
"""

import multiprocessing
import multiprocessing.shared_memory
import ctypes
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
# 1. Value — 共享单个值
# ──────────────────────────────────────────────

def increment_value(
    counter: multiprocessing.Value,
    lock: multiprocessing.Lock,
    n: int,
) -> None:
    """原子递增共享计数器"""
    for _ in range(n):
        with lock:
            counter.value += 1


def demo_shared_value() -> None:
    logger.info("=== Value — 共享计数器 ===")

    # ✅ 带锁的安全操作
    counter = multiprocessing.Value(ctypes.c_int, 0)
    lock = multiprocessing.Lock()

    processes = [
        multiprocessing.Process(target=increment_value, args=(counter, lock, 100_000))
        for _ in range(4)
    ]

    start = time.perf_counter()
    for p in processes:
        p.start()
    for p in processes:
        p.join()
    elapsed = time.perf_counter() - start

    logger.info("✅ 带锁: counter=%d (期望 400,000), 耗时 %.3f 秒",
                counter.value, elapsed)

    # ❌ 不带锁的危险操作
    counter_unsafe = multiprocessing.Value(ctypes.c_int, 0)
    dummy_lock = multiprocessing.Lock()  # 创建但不使用

    def increment_unsafe(c: multiprocessing.Value, n: int) -> None:
        for _ in range(n):
            c.value += 1  # 不用锁！

    processes = [
        multiprocessing.Process(target=increment_unsafe, args=(counter_unsafe, 100_000))
        for _ in range(4)
    ]
    for p in processes:
        p.start()
    for p in processes:
        p.join()

    logger.info("❌ 无锁: counter=%d (期望 400,000, 通常更少)", counter_unsafe.value)


# ──────────────────────────────────────────────
# 2. Array — 共享数组
# ──────────────────────────────────────────────

def update_array(
    shared_arr: multiprocessing.Array,
    index: int,
    value: float,
) -> None:
    """更新共享数组的指定位置"""
    shared_arr[index] = value
    logger.info("设置 array[%d] = %.2f", index, value)


def demo_shared_array() -> None:
    logger.info("=== Array — 共享数组 ===")

    # ✅ 创建共享双精度浮点数组
    shared_arr = multiprocessing.Array(ctypes.c_double, 5)  # 5 个元素
    logger.info("初始数组: %s", list(shared_arr))

    processes = [
        multiprocessing.Process(target=update_array, args=(shared_arr, i, i * 3.14))
        for i in range(5)
    ]

    for p in processes:
        p.start()
    for p in processes:
        p.join()

    logger.info("最终数组: %s", [round(x, 2) for x in shared_arr])


# ──────────────────────────────────────────────
# 3. Manager — 高级共享数据结构
# ──────────────────────────────────────────────

def worker_with_dict(
    shared_dict: dict,
    worker_id: int,
) -> None:
    """使用 Manager 共享字典"""
    result = {"pid": os.getpid(), "data": worker_id ** 2}
    shared_dict[f"worker-{worker_id}"] = result
    logger.info("Worker %d: 写入 %s", worker_id, result)


def worker_with_list(
    shared_list: list,
    worker_id: int,
) -> None:
    """使用 Manager 共享列表"""
    shared_list.append({"worker": worker_id, "pid": os.getpid()})
    logger.info("Worker %d: 追加到列表", worker_id)


def demo_manager() -> None:
    logger.info("=== Manager — 共享字典和列表 ===")

    with multiprocessing.Manager() as manager:
        shared_dict = manager.dict()
        shared_list = manager.list()

        # 创建使用共享字典的进程
        dict_procs = [
            multiprocessing.Process(target=worker_with_dict, args=(shared_dict, i))
            for i in range(4)
        ]

        # 创建使用共享列表的进程
        list_procs = [
            multiprocessing.Process(target=worker_with_list, args=(shared_list, i))
            for i in range(4)
        ]

        all_procs = dict_procs + list_procs
        for p in all_procs:
            p.start()
        for p in all_procs:
            p.join()

        logger.info("共享字典: %s", dict(shared_dict))
        logger.info("共享列表: %s", list(shared_list))


# ──────────────────────────────────────────────
# 4. shared_memory (Python 3.8+)
# ──────────────────────────────────────────────

def writer_shm(shm_name: str, data: list[int]) -> None:
    """向共享内存写入数据"""
    import struct
    existing_shm = multiprocessing.shared_memory.SharedMemory(name=shm_name)
    for i, val in enumerate(data):
        struct.pack_into("i", existing_shm.buf, i * 4, val)
    logger.info("写入共享内存: %s", data)
    existing_shm.close()


def reader_shm(shm_name: str, count: int) -> None:
    """从共享内存读取数据"""
    import struct
    existing_shm = multiprocessing.shared_memory.SharedMemory(name=shm_name)
    values = [struct.unpack_from("i", existing_shm.buf, i * 4)[0] for i in range(count)]
    logger.info("读取共享内存: %s", values)
    existing_shm.close()


def demo_shared_memory() -> None:
    logger.info("=== shared_memory (Python 3.8+) ===")

    # ✅ 创建共享内存块
    data = [10, 20, 30, 40, 50]
    shm = multiprocessing.shared_memory.SharedMemory(create=True, size=len(data) * 4)
    logger.info("创建共享内存: name=%s, size=%d bytes", shm.name, shm.size)

    try:
        # 写入进程
        w = multiprocessing.Process(target=writer_shm, args=(shm.name, data))
        w.start()
        w.join()

        # 读取进程
        r = multiprocessing.Process(target=reader_shm, args=(shm.name, len(data)))
        r.start()
        r.join()
    finally:
        shm.close()
        shm.unlink()  # 清理共享内存
        logger.info("共享内存已清理")


# ──────────────────────────────────────────────
# 5. 性能对比
# ──────────────────────────────────────────────

def demo_performance() -> None:
    logger.info("=== 共享状态方式性能对比 ===")

    n_ops = 10_000

    # Value + Lock
    counter_val = multiprocessing.Value(ctypes.c_int, 0)
    lock_val = multiprocessing.Lock()
    start = time.perf_counter()
    p = multiprocessing.Process(target=increment_value, args=(counter_val, lock_val, n_ops))
    p.start()
    p.join()
    val_time = time.perf_counter() - start

    # Manager
    def increment_manager(shared: dict, n: int) -> None:
        for i in range(n):
            shared["counter"] = shared.get("counter", 0) + 1

    with multiprocessing.Manager() as manager:
        shared = manager.dict({"counter": 0})
        start = time.perf_counter()
        p = multiprocessing.Process(target=increment_manager, args=(shared, n_ops))
        p.start()
        p.join()
        mgr_time = time.perf_counter() - start

    logger.info("Value+Lock: %.3f 秒 (%d ops)", val_time, n_ops)
    logger.info("Manager:    %.3f 秒 (%d ops)", mgr_time, n_ops)
    logger.info("Value 是 Manager 的 %.1fx 速度", mgr_time / val_time if val_time > 0 else 0)


# ──────────────────────────────────────────────
# 运行所有演示
# ──────────────────────────────────────────────

if __name__ == "__main__":
    demo_shared_value()
    print()

    demo_shared_array()
    print()

    demo_manager()
    print()

    demo_shared_memory()
    print()

    demo_performance()
    print()

    logger.info("所有共享状态演示完成")
