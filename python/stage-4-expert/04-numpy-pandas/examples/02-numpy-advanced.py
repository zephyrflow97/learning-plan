"""
NumPy 楂樼骇绀轰緥锛欱roadcasting銆佺嚎鎬т唬鏁般€侀殢鏈烘暟
"""
import numpy as np


def demo_broadcasting():
    """Broadcasting 婕旂ず"""
    print("=== Broadcasting ===")
    matrix = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    row = np.array([10, 20, 30])

    print(f"matrix shape: {matrix.shape}")
    print(f"row shape: {row.shape}")
    result = matrix + row
    print(f"matrix + row:\n{result}")

    # 鏍囧噯鍖栵紙姣忓垪鍑忓潎鍊奸櫎鏍囧噯宸級
    data = np.random.randn(5, 3)
    means = data.mean(axis=0)   # shape: (3,)
    stds = data.std(axis=0)     # shape: (3,)
    normalized = (data - means) / stds
    print(f"\n鏍囧噯鍖栧悗 mean: {normalized.mean(axis=0)}")
    print(f"鏍囧噯鍖栧悗 std:  {normalized.std(axis=0)}")


def demo_linear_algebra():
    """绾挎€т唬鏁?""
    print("\n=== 绾挎€т唬鏁?===")
    A = np.array([[1, 2], [3, 4]])

    print(f"A:\n{A}")
    print(f"det(A) = {np.linalg.det(A):.4f}")
    print(f"inv(A):\n{np.linalg.inv(A)}")

    eigenvalues, eigenvectors = np.linalg.eig(A)
    print(f"鐗瑰緛鍊? {eigenvalues}")

    # 鐭╅樀涔樻硶
    B = np.array([[5, 6], [7, 8]])
    print(f"A @ B:\n{A @ B}")

    # 瑙ｇ嚎鎬ф柟绋嬬粍 Ax = b
    b = np.array([5, 11])
    x = np.linalg.solve(A, b)
    print(f"\nAx = b 鐨勮В: x = {x}")
    print(f"楠岃瘉: A @ x = {A @ x}")


def demo_random():
    """闅忔満鏁?""
    print("\n=== 闅忔満鏁?===")
    rng = np.random.default_rng(42)  # 鍙噸鐜扮殑闅忔満鏁扮敓鎴愬櫒

    print(f"鍧囧寑鍒嗗竷: {rng.uniform(0, 1, 5)}")
    print(f"姝ｆ€佸垎甯? {rng.normal(0, 1, 5)}")
    print(f"鏁存暟: {rng.integers(0, 10, 5)}")

    # 闅忔満閲囨牱
    data = np.arange(10)
    sample = rng.choice(data, size=3, replace=False)
    print(f"鏃犳斁鍥為噰鏍? {sample}")

    # 鎵撲贡
    arr = np.arange(10)
    rng.shuffle(arr)
    print(f"鎵撲贡: {arr}")


if __name__ == "__main__":
    demo_broadcasting()
    demo_linear_algebra()
    demo_random()
