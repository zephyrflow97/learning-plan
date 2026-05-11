"""
鎺у埗娴?鈥?if/elif/else銆佸惊鐜€乵atch-case

杩愯鏂瑰紡:
    python examples/01-control-flow.py

鏈剼鏈紨绀猴細
1. 鏉′欢璇彞锛歩f/elif/else銆佷笁鍏冭〃杈惧紡
2. match-case锛圥ython 3.10+锛?3. for 寰幆涓?while 寰幆
4. enumerate() 鍜?zip()
5. break/continue/for...else
6. walrus operator :=
"""
import sys


def demo_if_elif_else() -> None:
    """婕旂ず鏉′欢璇彞"""
    print("[鎺у埗娴乚 === if/elif/else ===")

    score = 85

    # 鍩烘湰鐨?if/elif/else
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"

    print(f"[鎺у埗娴乚 鍒嗘暟: {score}, 绛夌骇: {grade}")

    # 涓夊厓琛ㄨ揪寮忥紙鏉′欢琛ㄨ揪寮忥級
    age = 20
    status = "鎴愬勾" if age >= 18 else "鏈垚骞?
    print(f"[鎺у埗娴乚 骞撮緞: {age}, 鐘舵€? {status}")

    # 閾惧紡姣旇緝锛圥ython 鐗规湁锛?    x = 5
    print(f"[鎺у埗娴乚 1 < {x} < 10 = {1 < x < 10}")
    print(f"[鎺у埗娴乚 0 < {x} < 3 = {0 < x < 3}")


def demo_match_case() -> None:
    """婕旂ず match-case锛圥ython 3.10+锛?""
    print("\n[鎺у埗娴乚 === match-case (Python 3.10+) ===")

    if sys.version_info < (3, 10):
        print("[鎺у埗娴乚 闇€瑕?Python 3.10+ 鎵嶈兘浣跨敤 match-case")
        return

    # 鍩烘湰妯″紡鍖归厤
    def handle_command(command: str) -> str:
        match command:
            case "quit" | "exit":
                return "閫€鍑虹▼搴?
            case "help":
                return "鏄剧ず甯姪"
            case "list":
                return "鍒楀嚭鎵€鏈夐」鐩?
            case _:
                return f"鏈煡鍛戒护: {command}"

    commands = ["help", "list", "quit", "unknown"]
    for cmd in commands:
        result = handle_command(cmd)
        print(f"[鎺у埗娴乚 鍛戒护 '{cmd}' -> {result}")

    # 瑙ｆ瀯妯″紡鍖归厤
    def describe_point(point: tuple) -> str:
        match point:
            case (0, 0):
                return "鍘熺偣"
            case (x, 0):
                return f"x 杞翠笂, x={x}"
            case (0, y):
                return f"y 杞翠笂, y={y}"
            case (x, y):
                return f"鐐?({x}, {y})"
            case _:
                return "涓嶆槸鏈夋晥鐨勭偣"

    points = [(0, 0), (3, 0), (0, 5), (3, 4)]
    for point in points:
        print(f"[鎺у埗娴乚 {point} -> {describe_point(point)}")


def demo_for_loop() -> None:
    """婕旂ず for 寰幆"""
    print("\n[鎺у埗娴乚 === for 寰幆 ===")

    # 鍩烘湰 for 寰幆
    fruits = ["apple", "banana", "cherry"]
    print("[鎺у埗娴乚 閬嶅巻鍒楄〃:")
    for fruit in fruits:
        print(f"[鎺у埗娴乚   {fruit}")

    # range() 鐢熸垚鏁板瓧搴忓垪
    print("\n[鎺у埗娴乚 range(5):", end=" ")
    for i in range(5):
        print(i, end=" ")
    print()

    print("[鎺у埗娴乚 range(2, 10, 2):", end=" ")
    for i in range(2, 10, 2):
        print(i, end=" ")
    print()

    # enumerate() 鈥?鍚屾椂鑾峰彇绱㈠紩鍜屽€?    print("\n[鎺у埗娴乚 enumerate():")
    for i, fruit in enumerate(fruits, start=1):
        print(f"[鎺у埗娴乚   {i}: {fruit}")

    # zip() 鈥?骞惰閬嶅巻澶氫釜搴忓垪
    names = ["Alice", "Bob", "Charlie"]
    scores = [95, 87, 72]
    grades = ["A", "B", "C"]

    print("\n[鎺у埗娴乚 zip():")
    for name, score, grade in zip(names, scores, grades):
        print(f"[鎺у埗娴乚   {name}: {score}鍒? 绛夌骇{grade}")


def demo_while_and_break() -> None:
    """婕旂ず while 寰幆涓?break/continue"""
    print("\n[鎺у埗娴乚 === while + break/continue ===")

    # break 鈥?鎵惧埌绗竴涓伓鏁板悗鍋滄
    numbers = [1, 3, 5, 4, 7, 8]
    print("[鎺у埗娴乚 break 鈥?鎵剧涓€涓伓鏁?")
    for num in numbers:
        if num % 2 == 0:
            print(f"[鎺у埗娴乚   鎵惧埌鍋舵暟: {num}")
            break
        print(f"[鎺у埗娴乚   {num} 鏄鏁帮紝缁х画...")

    # continue 鈥?璺宠繃鍋舵暟
    print("\n[鎺у埗娴乚 continue 鈥?鍙墦鍗板鏁?")
    for num in range(1, 8):
        if num % 2 == 0:
            continue
        print(f"[鎺у埗娴乚   濂囨暟: {num}")


def demo_for_else() -> None:
    """婕旂ず for...else锛圥ython 鐙湁锛?""
    print("\n[鎺у埗娴乚 === for...else ===")

    # else 鍧楀湪寰幆姝ｅ父缁撴潫锛堟病鏈?break锛夋椂鎵ц
    n = 17
    print(f"[鎺у埗娴乚 鍒ゆ柇 {n} 鏄惁涓鸿川鏁?")
    for i in range(2, n):
        if n % i == 0:
            print(f"[鎺у埗娴乚   {n} 涓嶆槸璐ㄦ暟锛屽洜瀛? {i}")
            break
    else:
        print(f"[鎺у埗娴乚   {n} 鏄川鏁帮紒锛堝惊鐜畬鏁存墽琛岋紝else 琚Е鍙戯級")

    n = 15
    print(f"\n[鎺у埗娴乚 鍒ゆ柇 {n} 鏄惁涓鸿川鏁?")
    for i in range(2, n):
        if n % i == 0:
            print(f"[鎺у埗娴乚   {n} 涓嶆槸璐ㄦ暟锛屽洜瀛? {i}")
            break
    else:
        print(f"[鎺у埗娴乚   {n} 鏄川鏁帮紒")


def demo_walrus_operator() -> None:
    """婕旂ず娴疯薄杩愮畻绗?:=锛圥ython 3.8+锛?""
    print("\n[鎺у埗娴乚 === 娴疯薄杩愮畻绗?:= ===")

    # 鍦ㄥ垪琛ㄦ帹瀵间腑浣跨敤 :=
    data = [1, 5, 3, 8, 2, 9, 4, 7]
    results = [(x, square) for x in data if (square := x**2) > 20]
    print(f"[鎺у埗娴乚 鍘熷鏁版嵁: {data}")
    print(f"[鎺у埗娴乚 骞虫柟澶т簬 20 鐨勫厓绱? {results}")

    # 鍦?while 鏉′欢涓娇鐢?:=
    lines = ["hello", "world", "Python", "quit", "more"]
    print("\n[鎺у埗娴乚 浣跨敤 := 澶勭悊杈撳叆:")
    idx = 0
    while idx < len(lines) and (line := lines[idx]) != "quit":
        print(f"[鎺у埗娴乚   澶勭悊: {line}")
        idx += 1
    print(f"[鎺у埗娴乚   閬囧埌 'quit'锛屽仠姝㈠鐞?)


def main() -> None:
    """涓诲嚱鏁?""
    print("=" * 60)
    print("Python 鎺у埗娴佹紨绀?)
    print("=" * 60)

    demo_if_elif_else()
    demo_match_case()
    demo_for_loop()
    demo_while_and_break()
    demo_for_else()
    demo_walrus_operator()

    print("\n" + "=" * 60)
    print("鎺у埗娴佹紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()