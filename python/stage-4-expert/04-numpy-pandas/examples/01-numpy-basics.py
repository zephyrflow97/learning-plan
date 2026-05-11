"""
NumPy 鍩虹绀轰緥
"""
import numpy as np
import logging

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


def demo_creation():
    """鏁扮粍鍒涘缓"""
    print("=== 鏁扮粍鍒涘缓 ===")
    # 浠庡垪琛?    arr = np.array([1, 2, 3, 4, 5])
    print(f"涓€缁存暟缁? {arr}, dtype={arr.dtype}, shape={arr.shape}")

    # 浜岀淮鏁扮粍
    matrix = np.array([[1, 2, 3], [4, 5, 6]])
    print(f"浜岀淮鏁扮粍 shape: {matrix.shape}")

    # 甯哥敤鍒涘缓鍑芥暟
    print(f"zeros: {np.zeros(5)}")
    print(f"ones: {np.ones((2,3))}")
    print(f"arange: {np.arange(0, 10, 2)}")
    print(f"linspace: {np.linspace(0, 1, 5)}")
    print(f"eye:\n{np.eye(3)}")
    print(f"random: {np.random.randn(5)}")


def demo_operations():
    """鍚戦噺鍖栨搷浣?""
    print("\n=== 鍚戦噺鍖栨搷浣?===")
    a = np.array([1, 2, 3, 4])
    b = np.array([10, 20, 30, 40])

    print(f"a + b = {a + b}")
    print(f"a * b = {a * b}")
    print(f"a ** 2 = {a ** 2}")
    print(f"np.sqrt(a) = {np.sqrt(a)}")

    # 鑱氬悎
    data = np.random.randn(1000)
    print(f"\nmean={data.mean():.4f}, std={data.std():.4f}")
    print(f"min={data.min():.4f}, max={data.max():.4f}")


def demo_indexing():
    """绱㈠紩涓庡垏鐗?""
    print("\n=== 绱㈠紩涓庡垏鐗?===")
    arr = np.arange(12).reshape(3, 4)
    print(f"鍘熷鏁扮粍:\n{arr}")
    print(f"arr[1, 2] = {arr[1, 2]}")
    print(f"arr[:, 1] = {arr[:, 1]}")
    print(f"arr[0:2, 1:3] =\n{arr[0:2, 1:3]}")

    # 甯冨皵绱㈠紩
    data = np.array([1, 5, 3, 8, 2, 9])
    mask = data > 4
    print(f"\ndata > 4: {mask}")
    print(f"filtered: {data[mask]}")

    # Fancy 绱㈠紩
    print(f"fancy: {data[[0, 2, 4]]}")


def demo_performance():
    """鎬ц兘瀵规瘮"""
    import time
    print("\n=== 鎬ц兘瀵规瘮 ===")
    n = 1_000_000

    # Python 鍒楄〃
    start = time.perf_counter()
    result = [x ** 2 for x in range(n)]
    py_time = time.perf_counter() - start

    # NumPy
    start = time.perf_counter()
    x = np.arange(n)
    result = x ** 2
    np_time = time.perf_counter() - start

    print(f"Python 鍒楄〃: {py_time*1000:.1f}ms")
    print(f"NumPy 鏁扮粍:  {np_time*1000:.1f}ms")
    print(f"鍔犻€熸瘮: {py_time/np_time:.1f}x")


if __name__ == "__main__":
    demo_creation()
    demo_operations()
    demo_indexing()
    demo_performance()
