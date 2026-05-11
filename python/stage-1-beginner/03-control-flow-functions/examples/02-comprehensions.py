"""
鎺ㄥ寮?鈥?鍒楄〃鎺ㄥ寮忋€佸瓧鍏告帹瀵煎紡銆侀泦鍚堟帹瀵煎紡銆佺敓鎴愬櫒琛ㄨ揪寮?
杩愯鏂瑰紡:
    python examples/02-comprehensions.py

鏈剼鏈紨绀猴細
1. 鍒楄〃鎺ㄥ寮?2. 瀛楀吀鎺ㄥ寮?3. 闆嗗悎鎺ㄥ寮?4. 鐢熸垚鍣ㄨ〃杈惧紡
5. 宓屽鎺ㄥ寮?6. 鎺ㄥ寮?vs 寰幆鐨勬€ц兘瀵规瘮
"""
import time


def demo_list_comprehension() -> None:
    """婕旂ず鍒楄〃鎺ㄥ寮?""
    print("[鎺ㄥ寮廬 === 鍒楄〃鎺ㄥ寮?===")

    # 鍩烘湰璇硶: [琛ㄨ揪寮?for 鍙橀噺 in 鍙凯浠ｅ璞
    squares = [x**2 for x in range(10)]
    print(f"[鎺ㄥ寮廬 骞虫柟鏁? {squares}")

    # 甯︽潯浠? [琛ㄨ揪寮?for 鍙橀噺 in 鍙凯浠ｅ璞?if 鏉′欢]
    even_squares = [x**2 for x in range(10) if x % 2 == 0]
    print(f"[鎺ㄥ寮廬 鍋舵暟鐨勫钩鏂? {even_squares}")

    # 瀵规瘮浼犵粺寰幆
    print("\n[鎺ㄥ寮廬 浼犵粺寰幆 vs 鎺ㄥ寮?")
    # 鉂?浼犵粺鏂瑰紡
    result_loop = []
    for x in range(10):
        if x % 2 == 0:
            result_loop.append(x**2)
    print(f"[鎺ㄥ寮廬   寰幆鏂瑰紡: {result_loop}")

    # 鉁?鎺ㄥ寮?    result_comp = [x**2 for x in range(10) if x % 2 == 0]
    print(f"[鎺ㄥ寮廬   鎺ㄥ寮?   {result_comp}")

    # 甯?if-else 鐨勬帹瀵煎紡锛堟敞鎰忎綅缃笉鍚岋紒锛?    labels = ["鍋舵暟" if x % 2 == 0 else "濂囨暟" for x in range(6)]
    print(f"\n[鎺ㄥ寮廬 甯?if-else: {labels}")

    # 瀛楃涓插鐞?    words = ["Hello", "WORLD", "Python"]
    lower_words = [w.lower() for w in words]
    print(f"[鎺ㄥ寮廬 杞皬鍐? {lower_words}")


def demo_dict_comprehension() -> None:
    """婕旂ず瀛楀吀鎺ㄥ寮?""
    print("\n[鎺ㄥ寮廬 === 瀛楀吀鎺ㄥ寮?===")

    # 鍩烘湰璇硶: {閿〃杈惧紡: 鍊艰〃杈惧紡 for 鍙橀噺 in 鍙凯浠ｅ璞
    squares_dict = {x: x**2 for x in range(6)}
    print(f"[鎺ㄥ寮廬 骞虫柟瀛楀吀: {squares_dict}")

    # 浠庝袱涓垪琛ㄥ垱寤哄瓧鍏?    names = ["Alice", "Bob", "Charlie"]
    scores = [95, 87, 72]
    name_scores = {name: score for name, score in zip(names, scores)}
    print(f"[鎺ㄥ寮廬 濮撳悕-鍒嗘暟: {name_scores}")

    # 甯︽潯浠惰繃婊?    passing = {name: score for name, score in zip(names, scores) if score >= 80}
    print(f"[鎺ㄥ寮廬 鍙婃牸鐨? {passing}")

    # 鍙嶈浆瀛楀吀
    original = {"a": 1, "b": 2, "c": 3}
    reversed_dict = {v: k for k, v in original.items()}
    print(f"[鎺ㄥ寮廬 鍙嶈浆瀛楀吀: {original} -> {reversed_dict}")


def demo_set_comprehension() -> None:
    """婕旂ず闆嗗悎鎺ㄥ寮?""
    print("\n[鎺ㄥ寮廬 === 闆嗗悎鎺ㄥ寮?===")

    # 鍩烘湰璇硶: {琛ㄨ揪寮?for 鍙橀噺 in 鍙凯浠ｅ璞
    text = "hello world"
    unique_chars = {c for c in text if c != " "}
    print(f"[鎺ㄥ寮廬 '{text}' 鐨勫敮涓€瀛楃: {unique_chars}")

    # 鍘婚噸
    numbers = [1, 2, 2, 3, 3, 3, 4, 4, 5]
    unique_squares = {x**2 for x in numbers}
    print(f"[鎺ㄥ寮廬 {numbers} 鐨勫敮涓€骞虫柟: {unique_squares}")


def demo_generator_expression() -> None:
    """婕旂ず鐢熸垚鍣ㄨ〃杈惧紡"""
    print("\n[鎺ㄥ寮廬 === 鐢熸垚鍣ㄨ〃杈惧紡 ===")

    # 璇硶绫讳技鍒楄〃鎺ㄥ寮忥紝浣嗙敤鍦嗘嫭鍙?    gen = (x**2 for x in range(10))
    print(f"[鎺ㄥ寮廬 鐢熸垚鍣ㄥ璞? {gen}")
    print(f"[鎺ㄥ寮廬 鐢熸垚鍣ㄧ被鍨? {type(gen)}")

    # 鐢熸垚鍣ㄦ槸鎯版€х殑锛屼竴娆′骇鍑轰竴涓€?    print("[鎺ㄥ寮廬 閫愪釜鑾峰彇:", end=" ")
    for val in gen:
        print(val, end=" ")
    print()

    # 鍦ㄥ嚱鏁拌皟鐢ㄤ腑鐩存帴浣跨敤锛堜笉闇€瑕侀澶栫殑鎷彿锛?    total = sum(x**2 for x in range(10))
    print(f"[鎺ㄥ寮廬 sum(x**2 for x in range(10)) = {total}")

    has_negative = any(x < 0 for x in [1, -2, 3])
    print(f"[鎺ㄥ寮廬 any(x < 0 for x in [1, -2, 3]) = {has_negative}")

    all_positive = all(x > 0 for x in [1, 2, 3])
    print(f"[鎺ㄥ寮廬 all(x > 0 for x in [1, 2, 3]) = {all_positive}")


def demo_nested_comprehension() -> None:
    """婕旂ず宓屽鎺ㄥ寮?""
    print("\n[鎺ㄥ寮廬 === 宓屽鎺ㄥ寮?===")

    # 灞曞钩宓屽鍒楄〃
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    flat = [x for row in matrix for x in row]
    print(f"[鎺ㄥ寮廬 鐭╅樀: {matrix}")
    print(f"[鎺ㄥ寮廬 灞曞钩: {flat}")

    # 绛変环鐨勪紶缁熷惊鐜?    # flat = []
    # for row in matrix:
    #     for x in row:
    #         flat.append(x)

    # 鐭╅樀杞疆
    transposed = [[row[i] for row in matrix] for i in range(3)]
    print(f"[鎺ㄥ寮廬 杞疆: {transposed}")

    # 绗涘崱灏旂Н
    colors = ["red", "blue"]
    sizes = ["S", "M", "L"]
    combos = [(color, size) for color in colors for size in sizes]
    print(f"[鎺ㄥ寮廬 缁勫悎: {combos}")


def demo_performance() -> None:
    """瀵规瘮鎺ㄥ寮忓拰寰幆鐨勬€ц兘"""
    print("\n[鎺ㄥ寮廬 === 鎬ц兘瀵规瘮 ===")
    n = 1_000_000

    # 鍒楄〃鎺ㄥ寮?    start = time.perf_counter()
    _ = [x**2 for x in range(n)]
    comp_time = time.perf_counter() - start

    # 浼犵粺寰幆
    start = time.perf_counter()
    result = []
    for x in range(n):
        result.append(x**2)
    loop_time = time.perf_counter() - start

    print(f"[鎺ㄥ寮廬 鎺ㄥ寮? {comp_time:.4f}s")
    print(f"[鎺ㄥ寮廬 寰幆:   {loop_time:.4f}s")
    print(f"[鎺ㄥ寮廬 鎺ㄥ寮忓揩 {loop_time / comp_time:.1f}x")


def main() -> None:
    """涓诲嚱鏁?""
    print("=" * 60)
    print("Python 鎺ㄥ寮忔紨绀?)
    print("=" * 60)

    demo_list_comprehension()
    demo_dict_comprehension()
    demo_set_comprehension()
    demo_generator_expression()
    demo_nested_comprehension()
    demo_performance()

    print("\n" + "=" * 60)
    print("鎺ㄥ寮忔紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()