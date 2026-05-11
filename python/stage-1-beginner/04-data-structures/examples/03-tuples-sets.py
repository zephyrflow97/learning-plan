"""
鍏冪粍涓庨泦鍚?鈥?tuple, namedtuple, set, frozenset

杩愯鏂瑰紡:
    python examples/03-tuples-sets.py
"""
from collections import namedtuple
from typing import NamedTuple


def demo_tuple() -> None:
    """婕旂ず鍏冪粍"""
    print("[鍏冪粍] === tuple 鍩虹 ===")

    # 鍒涘缓鍏冪粍
    point = (3, 4)
    single = (42,)  # 娉ㄦ剰閫楀彿锛?42) 鍙槸鏁板瓧 42
    empty = ()
    from_iter = tuple([1, 2, 3])

    print(f"[鍏冪粍] point = {point}")
    print(f"[鍏冪粍] single = {single}, type = {type(single)}")
    print(f"[鍏冪粍] (42) 鐨勭被鍨?= {type((42))}")  # int, 涓嶆槸 tuple!

    # 鍏冪粍瑙ｅ寘
    x, y = point
    print(f"[鍏冪粍] 瑙ｅ寘: x={x}, y={y}")

    # 鍏冪粍鏄笉鍙彉鐨?    # point[0] = 10  # TypeError!
    print("[鍏冪粍] 鍏冪粍涓嶅彲鍙橈紝涓嶈兘淇敼鍏冪礌")

    # 浣嗗厓缁勪腑鐨勫彲鍙樺璞″彲浠ヤ慨鏀?    t = (1, [2, 3], 4)
    t[1].append(5)
    print(f"[鍏冪粍] 鍖呭惈鍙彉瀵硅薄: {t}")


def demo_namedtuple() -> None:
    """婕旂ず鍛藉悕鍏冪粍"""
    print("\n[鍏冪粍] === namedtuple ===")

    # collections.namedtuple
    Point = namedtuple("Point", ["x", "y"])
    p = Point(3, 4)
    print(f"[鍏冪粍] Point: {p}")
    print(f"[鍏冪粍] p.x={p.x}, p.y={p.y}")
    print(f"[鍏冪粍] 涔熷彲浠ョ敤绱㈠紩: p[0]={p[0]}")

    # typing.NamedTuple锛堟帹鑽愶紝鏀寔绫诲瀷鏍囨敞锛?    class Student(NamedTuple):
        name: str
        score: int
        grade: str = "N/A"  # 鍙互鏈夐粯璁ゅ€?
    s = Student("Alice", 95)
    print(f"[鍏冪粍] Student: {s}")
    print(f"[鍏冪粍] s.name={s.name}, s.score={s.score}")

    # namedtuple vs dict
    print("\n[鍏冪粍] namedtuple vs dict:")
    print("[鍏冪粍]   namedtuple: 涓嶅彲鍙? 鍐呭瓨灏? 鍙搱甯? 鍙В鍖?)
    print("[鍏冪粍]   dict: 鍙彉, 鍐呭瓨澶? 涓嶅彲鍝堝笇, 鐏垫椿")


def demo_set() -> None:
    """婕旂ず闆嗗悎"""
    print("\n[闆嗗悎] === set 鍩虹 ===")

    # 鍒涘缓闆嗗悎
    fruits = {"apple", "banana", "cherry"}
    numbers = set([1, 2, 2, 3, 3, 3])  # 鑷姩鍘婚噸
    empty_set = set()  # 娉ㄦ剰: {} 鍒涘缓鐨勬槸绌哄瓧鍏革紒

    print(f"[闆嗗悎] fruits = {fruits}")
    print(f"[闆嗗悎] 鍘婚噸: {numbers}")

    # 鍩烘湰鎿嶄綔
    fruits.add("date")
    fruits.discard("banana")  # discard 涓嶄細鎶ラ敊锛坮emove 浼氾級
    print(f"[闆嗗悎] 淇敼鍚? {fruits}")
    print(f"[闆嗗悎] 'apple' in fruits: {'apple' in fruits}")

    # 闆嗗悎杩愮畻
    a = {1, 2, 3, 4}
    b = {3, 4, 5, 6}

    print(f"\n[闆嗗悎] a = {a}, b = {b}")
    print(f"[闆嗗悎] 骞堕泦 a | b = {a | b}")
    print(f"[闆嗗悎] 浜ら泦 a & b = {a & b}")
    print(f"[闆嗗悎] 宸泦 a - b = {a - b}")
    print(f"[闆嗗悎] 瀵圭О宸?a ^ b = {a ^ b}")
    print(f"[闆嗗悎] a 鏄?b 鐨勫瓙闆? {a <= b}")
    print(f"[闆嗗悎] {{1,2}} 鏄?a 鐨勫瓙闆? {{1,2}} <= a: { {1,2} <= a}")


def demo_frozenset() -> None:
    """婕旂ず涓嶅彲鍙橀泦鍚?""
    print("\n[闆嗗悎] === frozenset ===")

    fs = frozenset([1, 2, 3])
    print(f"[闆嗗悎] frozenset: {fs}")
    # fs.add(4)  # AttributeError! frozenset 涓嶅彲鍙?
    # frozenset 鍙互浣滀负瀛楀吀閿垨闆嗗悎鍏冪礌
    mapping = {frozenset([1, 2]): "pair", frozenset([3]): "single"}
    print(f"[闆嗗悎] frozenset 浣滀负閿? {mapping}")


def demo_practical_set() -> None:
    """闆嗗悎鐨勫疄闄呭簲鐢?""
    print("\n[闆嗗悎] === 瀹為檯搴旂敤 ===")

    # 鍘婚噸
    items = [1, 2, 2, 3, 3, 3, 4]
    unique = list(set(items))
    print(f"[闆嗗悎] 鍘婚噸: {items} -> {unique}")

    # 蹇€熸垚鍛樺垽鏂紙O(1) vs 鍒楄〃鐨?O(n)锛?    valid_codes = {"USD", "EUR", "GBP", "JPY", "CNY"}
    code = "CNY"
    print(f"[闆嗗悎] '{code}' 鏄湁鏁堣揣甯? {code in valid_codes}")

    # 鎵惧嚭涓や釜鍒楄〃鐨勫樊寮?    old_users = {"Alice", "Bob", "Charlie"}
    new_users = {"Bob", "Charlie", "David", "Eve"}
    added = new_users - old_users
    removed = old_users - new_users
    print(f"[闆嗗悎] 鏂板鐢ㄦ埛: {added}")
    print(f"[闆嗗悎] 绉婚櫎鐢ㄦ埛: {removed}")


def main() -> None:
    print("=" * 60)
    print("Python 鍏冪粍涓庨泦鍚堟紨绀?)
    print("=" * 60)

    demo_tuple()
    demo_namedtuple()
    demo_set()
    demo_frozenset()
    demo_practical_set()

    print("\n" + "=" * 60)
    print("鍏冪粍涓庨泦鍚堟紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()