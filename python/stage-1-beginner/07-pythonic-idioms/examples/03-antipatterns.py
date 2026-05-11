"""
甯歌鍙嶆ā寮忎笌 Pythonic 鏇夸唬鏂规

杩愯鏂瑰紡:
    python examples/03-antipatterns.py
"""


def demo_antipatterns() -> None:
    """甯歌鍙嶆ā寮忓姣?""
    print("[鍙嶆ā寮廬 === 甯歌鍙嶆ā寮?vs Pythonic ===")

    items = ["apple", "banana", "cherry", "date"]

    # 鍙嶆ā寮?1: range(len())
    print("\n[鍙嶆ā寮廬 1. 閬嶅巻鍒楄〃")
    print("[鍙嶆ā寮廬 鉂?for i in range(len(items)):")
    for i in range(len(items)):
        _ = items[i]
    print("[鍙嶆ā寮廬 鉁?for item in items:")
    for item in items:
        _ = item
    print("[鍙嶆ā寮廬 鉁?for i, item in enumerate(items):")
    for i, item in enumerate(items):
        print(f"[鍙嶆ā寮廬   {i}: {item}")

    # 鍙嶆ā寮?2: 鎵嬪姩鎷兼帴瀛楃涓?    print("\n[鍙嶆ā寮廬 2. 瀛楃涓叉嫾鎺?)
    words = ["Hello", "Python", "World"]
    print(f"[鍙嶆ā寮廬 鉂?寰幆 +=: ", end="")
    result = ""
    for w in words:
        result += w + " "
    print(result.strip())
    print(f"[鍙嶆ā寮廬 鉁?' '.join(): {' '.join(words)}")

    # 鍙嶆ā寮?3: 鐢?dict 瀛樺偍缁撴瀯鍖栨暟鎹?    print("\n[鍙嶆ā寮廬 3. 缁撴瀯鍖栨暟鎹?)
    print("[鍙嶆ā寮廬 鉂?浣跨敤鏅€?dict:")
    user_dict = {"name": "Alice", "age": 30}
    print(f"[鍙嶆ā寮廬   {user_dict}")

    print("[鍙嶆ā寮廬 鉁?浣跨敤 namedtuple 鎴?dataclass:")
    from dataclasses import dataclass

    @dataclass
    class User:
        name: str
        age: int

    user = User("Alice", 30)
    print(f"[鍙嶆ā寮廬   {user}")

    # 鍙嶆ā寮?4: 鐢?flag 鍙橀噺鍒ゆ柇
    print("\n[鍙嶆ā寮廬 4. 鏌ユ壘鍏冪礌")
    numbers = [1, 3, 5, 7, 9]
    target = 5

    print("[鍙嶆ā寮廬 鉂?鐢?flag 鍙橀噺:")
    found = False
    for n in numbers:
        if n == target:
            found = True
            break
    print(f"[鍙嶆ā寮廬   found = {found}")

    print("[鍙嶆ā寮廬 鉁?鐢?in 杩愮畻绗?")
    print(f"[鍙嶆ā寮廬   {target} in {numbers} = {target in numbers}")

    # 鍙嶆ā寮?5: 涓嶄娇鐢ㄦ帹瀵煎紡
    print("\n[鍙嶆ā寮廬 5. 杞崲鍒楄〃")
    print("[鍙嶆ā寮廬 鉂?鎵嬪姩 append:")
    squares = []
    for x in range(5):
        squares.append(x**2)
    print(f"[鍙嶆ā寮廬   {squares}")

    print("[鍙嶆ā寮廬 鉁?鍒楄〃鎺ㄥ寮?")
    squares = [x**2 for x in range(5)]
    print(f"[鍙嶆ā寮廬   {squares}")

    # 鍙嶆ā寮?6: 涓嶄娇鐢?with
    print("\n[鍙嶆ā寮廬 6. 鏂囦欢鎿嶄綔")
    print("[鍙嶆ā寮廬 鉂?鎵嬪姩 open/close")
    print("[鍙嶆ā寮廬 鉁?with open(...) as f:")

    # 鍙嶆ā寮?7: 鐢?type() 浠ｆ浛 isinstance()
    print("\n[鍙嶆ā寮廬 7. 绫诲瀷妫€鏌?)
    value = True
    print(f"[鍙嶆ā寮廬 鉂?type({value}) == int: {type(value) == int}")
    print(f"[鍙嶆ā寮廬 鉁?isinstance({value}, int): {isinstance(value, int)}")


def demo_pythonic_patterns() -> None:
    """Pythonic 妯″紡鎬荤粨"""
    print("\n[鍙嶆ā寮廬 === Pythonic 妯″紡鎬荤粨 ===")
    patterns = [
        ("閬嶅巻", "for i in range(len(x))", "for item in x"),
        ("绱㈠紩閬嶅巻", "鎵嬪姩璁℃暟鍣?, "enumerate(x)"),
        ("骞惰閬嶅巻", "range + 绱㈠紩", "zip(a, b)"),
        ("瀛楃涓叉嫾鎺?, "+= 寰幆", "' '.join(words)"),
        ("浜ゆ崲鍙橀噺", "temp 鍙橀噺", "a, b = b, a"),
        ("榛樿鍊?, "if key in dict", "dict.get(key, default)"),
        ("鍒楄〃杞崲", "append 寰幆", "鍒楄〃鎺ㄥ寮?),
        ("鏂囦欢鎿嶄綔", "open/close", "with open()"),
        ("None 妫€鏌?, "== None", "is None"),
        ("绫诲瀷妫€鏌?, "type(x) == T", "isinstance(x, T)"),
    ]

    print(f"[鍙嶆ā寮廬 {'鍦烘櫙':12s} | {'鉂?鍙嶆ā寮?:20s} | {'鉁?Pythonic':20s}")
    print(f"[鍙嶆ā寮廬 {'-'*12} | {'-'*20} | {'-'*20}")
    for scenario, bad, good in patterns:
        print(f"[鍙嶆ā寮廬 {scenario:12s} | {bad:20s} | {good:20s}")


def main() -> None:
    print("=" * 60)
    print("鍙嶆ā寮忎笌 Pythonic 鏇夸唬鏂规")
    print("=" * 60)
    demo_antipatterns()
    demo_pythonic_patterns()
    print("\n" + "=" * 60)
    print("鍙嶆ā寮忔紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()