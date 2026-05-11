"""
Pythonic 鎯敤娉曢泦閿?
杩愯鏂瑰紡:
    python examples/02-idioms.py
"""
from itertools import chain


def demo_enumerate_zip() -> None:
    """enumerate, zip, any, all"""
    print("[鎯敤娉昡 === enumerate/zip/any/all ===")

    items = ["apple", "banana", "cherry"]

    # enumerate
    for i, item in enumerate(items, start=1):
        print(f"[鎯敤娉昡 {i}. {item}")

    # zip 鍒涘缓瀛楀吀
    keys = ["name", "age", "city"]
    values = ["Alice", 30, "Beijing"]
    person = dict(zip(keys, values))
    print(f"\n[鎯敤娉昡 zip -> dict: {person}")

    # any 鍜?all
    numbers = [2, 4, 6, 8, 10]
    print(f"\n[鎯敤娉昡 all 鍋舵暟? {all(n % 2 == 0 for n in numbers)}")
    print(f"[鎯敤娉昡 any > 5?  {any(n > 5 for n in numbers)}")

    # 妫€鏌ュ垪琛ㄤ腑鏄惁鏈?None
    data = [1, "hello", None, 3.14]
    has_none = any(x is None for x in data)
    print(f"[鎯敤娉昡 鍖呭惈 None? {has_none}")


def demo_underscore() -> None:
    """涓嬪垝绾挎儻鐢ㄦ硶"""
    print("\n[鎯敤娉昡 === 涓嬪垝绾?_ ===")

    # 1. 蹇界暐涓嶉渶瑕佺殑鍊?    x, _, z = (1, 2, 3)
    print(f"[鎯敤娉昡 蹇界暐涓棿鍊? x={x}, z={z}")

    # 2. 寰幆涓拷鐣ュ彉閲?    for _ in range(3):
        print("[鎯敤娉昡   閲嶅鎿嶄綔")

    # 3. 鏁板瓧涓殑鍒嗛殧绗?    big_number = 1_000_000_000
    print(f"[鎯敤娉昡 澶ф暟瀛? {big_number:,}")


def demo_slice_object() -> None:
    """鍒囩墖瀵硅薄"""
    print("\n[鎯敤娉昡 === 鍒囩墖瀵硅薄 ===")

    # 鍛藉悕鍒囩墖锛屾彁楂樺彲璇绘€?    LAST_NAME = slice(0, 10)
    FIRST_NAME = slice(10, 20)
    AGE = slice(20, 23)

    record = "Smith     John      025"
    print(f"[鎯敤娉昡 濮? '{record[LAST_NAME].strip()}'")
    print(f"[鎯敤娉昡 鍚? '{record[FIRST_NAME].strip()}'")
    print(f"[鎯敤娉昡 榫? '{record[AGE].strip()}'")

    # 鍒囩墖璧嬪€?    lst = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    lst[2:5] = [20, 30, 40]
    print(f"[鎯敤娉昡 鍒囩墖璧嬪€? {lst}")


def demo_for_else() -> None:
    """for...else 鍜?while...else"""
    print("\n[鎯敤娉昡 === for...else ===")

    # 鏌ユ壘鍏冪礌鈥斺€攅lse 鍦ㄦ病鏈?break 鏃舵墽琛?    def find_item(items: list, target) -> int:
        for i, item in enumerate(items):
            if item == target:
                print(f"[鎯敤娉昡 鎵惧埌 {target} 鍦ㄧ储寮?{i}")
                return i
        else:
            print(f"[鎯敤娉昡 鏈壘鍒?{target}")
            return -1

    find_item([10, 20, 30, 40], 30)
    find_item([10, 20, 30, 40], 50)


def demo_chained_comparison() -> None:
    """閾惧紡鎿嶄綔"""
    print("\n[鎯敤娉昡 === 瀹炵敤鎶€宸?===")

    # 鏉′欢璧嬪€?    x = None
    result = x or "default"
    print(f"[鎯敤娉昡 x or 'default': {result}")

    # 涓夊厓琛ㄨ揪寮?    age = 20
    status = "adult" if age >= 18 else "minor"
    print(f"[鎯敤娉昡 涓夊厓: {status}")

    # 鐢?* 灞曞紑鍙凯浠ｅ璞?    first, *rest = range(5)
    print(f"[鎯敤娉昡 first={first}, rest={rest}")

    # 閾惧紡鏂规硶璋冪敤
    result = "  Hello, World!  ".strip().lower().replace("world", "python")
    print(f"[鎯敤娉昡 閾惧紡璋冪敤: {result}")


def main() -> None:
    print("=" * 60)
    print("Pythonic 鎯敤娉曟紨绀?)
    print("=" * 60)
    demo_enumerate_zip()
    demo_underscore()
    demo_slice_object()
    demo_for_else()
    demo_chained_comparison()
    print("\n" + "=" * 60)
    print("鎯敤娉曟紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()