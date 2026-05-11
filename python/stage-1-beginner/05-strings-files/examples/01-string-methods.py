"""
瀛楃涓叉柟娉?鈥?Python 瀛楃涓茬殑鐟炲＋鍐涘垁

杩愯鏂瑰紡:
    python examples/01-string-methods.py
"""


def demo_string_methods() -> None:
    """婕旂ず甯哥敤瀛楃涓叉柟娉?""
    print("[瀛楃涓瞉 === 甯哥敤鏂规硶 ===")

    s = "  Hello, Python World!  "

    # 澶у皬鍐?    print(f"[瀛楃涓瞉 upper(): {s.upper()}")
    print(f"[瀛楃涓瞉 lower(): {s.lower()}")
    print(f"[瀛楃涓瞉 title(): {s.title()}")
    print(f"[瀛楃涓瞉 capitalize(): {s.capitalize()}")
    print(f"[瀛楃涓瞉 swapcase(): {s.swapcase()}")

    # 鍘荤┖鐧?    print(f"[瀛楃涓瞉 strip(): '{s.strip()}'")
    print(f"[瀛楃涓瞉 lstrip(): '{s.lstrip()}'")
    print(f"[瀛楃涓瞉 rstrip(): '{s.rstrip()}'")

    # 鏌ユ壘
    text = "Hello, Python World!"
    print(f"\n[瀛楃涓瞉 find('Python'): {text.find('Python')}")
    print(f"[瀛楃涓瞉 index('Python'): {text.index('Python')}")
    print(f"[瀛楃涓瞉 count('o'): {text.count('o')}")
    print(f"[瀛楃涓瞉 startswith('Hello'): {text.startswith('Hello')}")
    print(f"[瀛楃涓瞉 endswith('!'): {text.endswith('!')}")

    # 鏇挎崲鍜屽垎鍓?    print(f"\n[瀛楃涓瞉 replace('Python', 'Java'): {text.replace('Python', 'Java')}")

    csv_line = "Alice,30,Beijing"
    print(f"[瀛楃涓瞉 split(','): {csv_line.split(',')}")

    words = ["Hello", "Python", "World"]
    print(f"[瀛楃涓瞉 ' '.join(): {' '.join(words)}")
    print(f"[瀛楃涓瞉 ', '.join(): {', '.join(words)}")

    # 鍒ゆ柇
    print(f"\n[瀛楃涓瞉 '123'.isdigit(): {'123'.isdigit()}")
    print(f"[瀛楃涓瞉 'abc'.isalpha(): {'abc'.isalpha()}")
    print(f"[瀛楃涓瞉 'abc123'.isalnum(): {'abc123'.isalnum()}")
    print(f"[瀛楃涓瞉 '   '.isspace(): {'   '.isspace()}")


def demo_string_formatting() -> None:
    """婕旂ず瀛楃涓叉牸寮忓寲"""
    print("\n[瀛楃涓瞉 === 鏍煎紡鍖栧姣?===")

    name = "Alice"
    age = 30
    score = 95.678

    # % 鏍煎紡鍖栵紙鑰佹柟寮忥級
    print("[瀛楃涓瞉 %% 鏍煎紡鍖? %s is %d years old" % (name, age))

    # str.format()锛圥ython 3+锛?    print("[瀛楃涓瞉 format(): {} is {} years old".format(name, age))

    # f-string锛圥ython 3.6+锛屾帹鑽愶級
    print(f"[瀛楃涓瞉 f-string: {name} is {age} years old")

    # 鏍煎紡鍖栬鑼?    print(f"\n[瀛楃涓瞉 === 鏍煎紡鍖栬鑼?===")
    print(f"[瀛楃涓瞉 淇濈暀2浣嶅皬鏁? {score:.2f}")
    print(f"[瀛楃涓瞉 鐧惧垎姣? {0.85:.1%}")
    print(f"[瀛楃涓瞉 鍗冧綅鍒嗛殧: {1000000:,}")
    print(f"[瀛楃涓瞉 鍙冲榻? '{name:>10}'")
    print(f"[瀛楃涓瞉 宸﹀榻? '{name:<10}'")
    print(f"[瀛楃涓瞉 灞呬腑: '{name:^10}'")
    print(f"[瀛楃涓瞉 濉厖: '{name:*^10}'")
    print(f"[瀛楃涓瞉 浜岃繘鍒? {42:b}")
    print(f"[瀛楃涓瞉 鍗佸叚杩涘埗: {255:x}")


def main() -> None:
    print("=" * 60)
    print("Python 瀛楃涓叉柟娉曟紨绀?)
    print("=" * 60)
    demo_string_methods()
    demo_string_formatting()
    print("\n" + "=" * 60)
    print("瀛楃涓叉柟娉曟紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()