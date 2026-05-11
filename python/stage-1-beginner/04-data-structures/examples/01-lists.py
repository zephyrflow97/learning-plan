"""
鍒楄〃 (list) 鈥?鍔ㄦ€佹暟缁勩€佸垏鐗囥€佹帓搴?
杩愯鏂瑰紡:
    python examples/01-lists.py

鏈剼鏈紨绀猴細
1. 鍒楄〃鐨勫垱寤哄拰鍩烘湰鎿嶄綔
2. 鍒囩墖锛坰licing锛?3. 鎺掑簭
4. 鍒楄〃鏂规硶閫熸煡
"""


def demo_list_basics() -> None:
    """婕旂ず鍒楄〃鍩烘湰鎿嶄綔"""
    print("[鍒楄〃] === 鍩烘湰鎿嶄綔 ===")

    # 鍒涘缓鍒楄〃
    fruits = ["apple", "banana", "cherry"]
    numbers = [1, 2, 3, 4, 5]
    mixed = [1, "hello", 3.14, True, None]  # 鍙互娣峰悎绫诲瀷
    empty = []

    print(f"[鍒楄〃] fruits = {fruits}")
    print(f"[鍒楄〃] 闀垮害: {len(fruits)}")
    print(f"[鍒楄〃] 绗竴涓? {fruits[0]}")
    print(f"[鍒楄〃] 鏈€鍚庝竴涓? {fruits[-1]}")

    # 淇敼鍏冪礌
    fruits[1] = "blueberry"
    print(f"[鍒楄〃] 淇敼鍚? {fruits}")

    # 娣诲姞鍏冪礌
    fruits.append("date")        # 鏈熬娣诲姞
    fruits.insert(1, "avocado")  # 鎸囧畾浣嶇疆鎻掑叆
    print(f"[鍒楄〃] 娣诲姞鍚? {fruits}")

    # 鍒犻櫎鍏冪礌
    fruits.remove("cherry")      # 鎸夊€煎垹闄?    popped = fruits.pop()        # 寮瑰嚭鏈€鍚庝竴涓?    del fruits[0]                # 鎸夌储寮曞垹闄?    print(f"[鍒楄〃] 鍒犻櫎鍚? {fruits}, 寮瑰嚭: {popped}")

    # 鏌ユ壘
    print(f"[鍒楄〃] 'avocado' in fruits: {'avocado' in fruits}")
    print(f"[鍒楄〃] fruits.index('avocado'): {fruits.index('avocado')}")
    print(f"[鍒楄〃] fruits.count('avocado'): {fruits.count('avocado')}")


def demo_slicing() -> None:
    """婕旂ず鍒囩墖鎿嶄綔"""
    print("\n[鍒楄〃] === 鍒囩墖 (Slicing) ===")

    nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    print(f"[鍒楄〃] 鍘熷: {nums}")

    # 鍩烘湰鍒囩墖: list[start:stop:step]
    print(f"[鍒楄〃] nums[2:5]   = {nums[2:5]}")     # [2, 3, 4]
    print(f"[鍒楄〃] nums[:3]    = {nums[:3]}")       # [0, 1, 2]
    print(f"[鍒楄〃] nums[7:]    = {nums[7:]}")       # [7, 8, 9]
    print(f"[鍒楄〃] nums[::2]   = {nums[::2]}")      # [0, 2, 4, 6, 8]
    print(f"[鍒楄〃] nums[::-1]  = {nums[::-1]}")     # 鍙嶈浆
    print(f"[鍒楄〃] nums[1:8:2] = {nums[1:8:2]}")    # [1, 3, 5, 7]

    # 鍒囩墖璧嬪€?    nums_copy = nums.copy()
    nums_copy[2:5] = [20, 30, 40]
    print(f"[鍒楄〃] 鍒囩墖璧嬪€? {nums_copy}")

    # 鍒囩墖鍒犻櫎
    nums_copy[2:5] = []
    print(f"[鍒楄〃] 鍒囩墖鍒犻櫎: {nums_copy}")


def demo_sorting() -> None:
    """婕旂ず鎺掑簭"""
    print("\n[鍒楄〃] === 鎺掑簭 ===")

    # sort() 鈥?鍘熷湴鎺掑簭锛堜慨鏀瑰師鍒楄〃锛?    numbers = [3, 1, 4, 1, 5, 9, 2, 6]
    numbers.sort()
    print(f"[鍒楄〃] sort(): {numbers}")

    numbers.sort(reverse=True)
    print(f"[鍒楄〃] sort(reverse=True): {numbers}")

    # sorted() 鈥?杩斿洖鏂板垪琛紙涓嶄慨鏀瑰師鍒楄〃锛?    original = [3, 1, 4, 1, 5, 9]
    sorted_list = sorted(original)
    print(f"[鍒楄〃] 鍘熷: {original}")
    print(f"[鍒楄〃] sorted(): {sorted_list}")

    # 鑷畾涔夋帓搴?    words = ["banana", "Apple", "cherry", "date"]
    print(f"[鍒楄〃] 鎸夐暱搴︽帓搴? {sorted(words, key=len)}")
    print(f"[鍒楄〃] 蹇界暐澶у皬鍐? {sorted(words, key=str.lower)}")

    # 澶嶆潅鎺掑簭
    students = [
        {"name": "Charlie", "score": 72},
        {"name": "Alice", "score": 95},
        {"name": "Bob", "score": 87},
    ]
    sorted_students = sorted(students, key=lambda s: s["score"], reverse=True)
    print("[鍒楄〃] 鎸夊垎鏁版帓搴?")
    for s in sorted_students:
        print(f"[鍒楄〃]   {s['name']}: {s['score']}")


def demo_list_methods() -> None:
    """鍒楄〃鏂规硶閫熸煡"""
    print("\n[鍒楄〃] === 甯哥敤鏂规硶閫熸煡 ===")
    lst = [1, 2, 3]

    methods = [
        ("append(4)", lambda l: (l.append(4), l.copy())[-1]),
        ("extend([5,6])", lambda l: (l.extend([5, 6]), l.copy())[-1]),
        ("insert(0, 0)", lambda l: (l.insert(0, 0), l.copy())[-1]),
        ("pop()", lambda l: f"寮瑰嚭 {l.pop()}, 鍓╀綑 {l}"),
        ("remove(3)", lambda l: (l.remove(3), l.copy())[-1]),
        ("reverse()", lambda l: (l.reverse(), l.copy())[-1]),
    ]

    for desc, func in methods:
        lst = [1, 2, 3]  # 姣忔閲嶇疆
        result = func(lst)
        print(f"[鍒楄〃] {desc:20s} -> {result}")


def main() -> None:
    print("=" * 60)
    print("Python 鍒楄〃 (list) 婕旂ず")
    print("=" * 60)

    demo_list_basics()
    demo_slicing()
    demo_sorting()
    demo_list_methods()

    print("\n" + "=" * 60)
    print("鍒楄〃婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()