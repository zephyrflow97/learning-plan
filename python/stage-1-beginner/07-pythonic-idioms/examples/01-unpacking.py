"""
瑙ｅ寘璧嬪€?鈥?Python 鏈€浼橀泤鐨勭壒鎬т箣涓€

杩愯鏂瑰紡:
    python examples/01-unpacking.py
"""


def demo_basic_unpacking() -> None:
    """鍩烘湰瑙ｅ寘"""
    print("[瑙ｅ寘] === 鍩烘湰瑙ｅ寘 ===")

    # 鍏冪粍瑙ｅ寘
    x, y = (3, 4)
    print(f"[瑙ｅ寘] x={x}, y={y}")

    # 浜ゆ崲鍙橀噺 鈥?涓嶉渶瑕佷复鏃跺彉閲忥紒
    a, b = 1, 2
    print(f"[瑙ｅ寘] 浜ゆ崲鍓? a={a}, b={b}")
    a, b = b, a
    print(f"[瑙ｅ寘] 浜ゆ崲鍚? a={a}, b={b}")

    # 澶氬彉閲忚祴鍊?    name, age, city = "Alice", 30, "Beijing"
    print(f"[瑙ｅ寘] {name}, {age}, {city}")

    # 宓屽瑙ｅ寘
    (a, b), c = (1, 2), 3
    print(f"[瑙ｅ寘] 宓屽: a={a}, b={b}, c={c}")


def demo_star_unpacking() -> None:
    """鏄熷彿瑙ｅ寘"""
    print("\n[瑙ｅ寘] === 鏄熷彿瑙ｅ寘 * ===")

    # *rest 鏀堕泦鍓╀綑鍏冪礌
    first, *rest = [1, 2, 3, 4, 5]
    print(f"[瑙ｅ寘] first={first}, rest={rest}")

    *init, last = [1, 2, 3, 4, 5]
    print(f"[瑙ｅ寘] init={init}, last={last}")

    first, *middle, last = [1, 2, 3, 4, 5]
    print(f"[瑙ｅ寘] first={first}, middle={middle}, last={last}")

    # 蹇界暐鍏冪礌
    _, *_, last = [1, 2, 3, 4, 5]
    print(f"[瑙ｅ寘] 鍙鏈€鍚庝竴涓? last={last}")


def demo_dict_unpacking() -> None:
    """瀛楀吀瑙ｅ寘"""
    print("\n[瑙ｅ寘] === 瀛楀吀瑙ｅ寘 ** ===")

    # 鍚堝苟瀛楀吀
    defaults = {"color": "blue", "size": "M", "theme": "light"}
    user = {"color": "red", "font": "Arial"}

    # Python 3.5+
    merged = {**defaults, **user}
    print(f"[瑙ｅ寘] 鍚堝苟: {merged}")

    # Python 3.9+
    merged2 = defaults | user
    print(f"[瑙ｅ寘] 鍚堝苟 (|): {merged2}")

    # 鍒楄〃瑙ｅ寘
    list1 = [1, 2, 3]
    list2 = [4, 5, 6]
    combined = [*list1, *list2, 7, 8]
    print(f"[瑙ｅ寘] 鍒楄〃鍚堝苟: {combined}")


def demo_function_unpacking() -> None:
    """鍑芥暟璋冪敤涓殑瑙ｅ寘"""
    print("\n[瑙ｅ寘] === 鍑芥暟璋冪敤瑙ｅ寘 ===")

    def greet(name: str, age: int, city: str) -> None:
        print(f"[瑙ｅ寘] {name}, {age}宀? 鏉ヨ嚜{city}")

    # 鍒楄〃瑙ｅ寘涓轰綅缃弬鏁?    args = ["Alice", 30, "Beijing"]
    greet(*args)

    # 瀛楀吀瑙ｅ寘涓哄叧閿瓧鍙傛暟
    kwargs = {"name": "Bob", "age": 25, "city": "Shanghai"}
    greet(**kwargs)


def main() -> None:
    print("=" * 60)
    print("Python 瑙ｅ寘璧嬪€兼紨绀?)
    print("=" * 60)
    demo_basic_unpacking()
    demo_star_unpacking()
    demo_dict_unpacking()
    demo_function_unpacking()
    print("\n" + "=" * 60)
    print("瑙ｅ寘璧嬪€兼紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()