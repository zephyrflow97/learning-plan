"""
瀛楀吀 (dict) 鈥?鍝堝笇琛ㄣ€佹湁搴忔€с€乨efaultdict銆丆ounter

杩愯鏂瑰紡:
    python examples/02-dicts.py

鏈剼鏈紨绀猴細
1. 瀛楀吀鐨勫垱寤哄拰鍩烘湰鎿嶄綔
2. 瀛楀吀鏂规硶
3. defaultdict 鍜?Counter
4. 瀛楀吀鍚堝苟
"""
from collections import Counter, defaultdict


def demo_dict_basics() -> None:
    """婕旂ず瀛楀吀鍩烘湰鎿嶄綔"""
    print("[瀛楀吀] === 鍩烘湰鎿嶄綔 ===")

    # 鍒涘缓瀛楀吀
    person = {"name": "Alice", "age": 30, "city": "鍖椾含"}
    print(f"[瀛楀吀] person = {person}")

    # 璁块棶
    print(f"[瀛楀吀] person['name'] = {person['name']}")
    print(f"[瀛楀吀] person.get('email', '鏈缃?) = {person.get('email', '鏈缃?)}")

    # 淇敼鍜屾坊鍔?    person["age"] = 31
    person["email"] = "alice@example.com"
    print(f"[瀛楀吀] 淇敼鍚? {person}")

    # 鍒犻櫎
    del person["email"]
    age = person.pop("age")
    print(f"[瀛楀吀] 鍒犻櫎鍚? {person}, 寮瑰嚭 age={age}")

    # 閬嶅巻
    person = {"name": "Alice", "age": 30, "city": "鍖椾含"}
    print("\n[瀛楀吀] 閬嶅巻:")
    for key, value in person.items():
        print(f"[瀛楀吀]   {key}: {value}")

    print(f"[瀛楀吀] keys: {list(person.keys())}")
    print(f"[瀛楀吀] values: {list(person.values())}")


def demo_dict_methods() -> None:
    """婕旂ず瀛楀吀鏂规硶"""
    print("\n[瀛楀吀] === 甯哥敤鏂规硶 ===")

    d = {"a": 1, "b": 2}

    # setdefault 鈥?涓嶅瓨鍦ㄦ椂璁剧疆榛樿鍊?    d.setdefault("c", 3)
    d.setdefault("a", 999)  # a 宸插瓨鍦紝涓嶄細瑕嗙洊
    print(f"[瀛楀吀] setdefault: {d}")

    # update 鈥?鍚堝苟瀛楀吀
    d.update({"d": 4, "e": 5})
    print(f"[瀛楀吀] update: {d}")

    # 瀛楀吀鍚堝苟杩愮畻绗?(Python 3.9+)
    dict1 = {"a": 1, "b": 2}
    dict2 = {"b": 3, "c": 4}
    merged = dict1 | dict2  # dict2 鐨勫€间紭鍏?    print(f"[瀛楀吀] {dict1} | {dict2} = {merged}")

    # 瀛楀吀鎺ㄥ寮?    squares = {x: x**2 for x in range(6)}
    print(f"[瀛楀吀] 鎺ㄥ寮? {squares}")


def demo_defaultdict() -> None:
    """婕旂ず defaultdict"""
    print("\n[瀛楀吀] === defaultdict ===")

    # 鏅€氬瓧鍏?鈥?璁块棶涓嶅瓨鍦ㄧ殑閿細鎶ラ敊
    # d = {}
    # d["key"]  # KeyError!

    # defaultdict 鈥?鑷姩鍒涘缓榛樿鍊?    word_count = defaultdict(int)  # 榛樿鍊间负 0
    text = "the cat sat on the mat the cat"
    for word in text.split():
        word_count[word] += 1
    print(f"[瀛楀吀] 璇嶉: {dict(word_count)}")

    # defaultdict(list) 鈥?鍒嗙粍
    students = [
        ("Alice", "Math"), ("Bob", "Science"),
        ("Alice", "Science"), ("Bob", "Math"),
        ("Charlie", "Math"),
    ]
    groups = defaultdict(list)
    for name, subject in students:
        groups[name].append(subject)
    print(f"[瀛楀吀] 鍒嗙粍: {dict(groups)}")


def demo_counter() -> None:
    """婕旂ず Counter"""
    print("\n[瀛楀吀] === Counter ===")

    # 璁℃暟
    colors = ["red", "blue", "red", "green", "blue", "red"]
    counter = Counter(colors)
    print(f"[瀛楀吀] Counter: {counter}")
    print(f"[瀛楀吀] 鏈€甯歌鐨?2 涓? {counter.most_common(2)}")

    # 瀛楃涓插瓧绗﹁鏁?    char_count = Counter("mississippi")
    print(f"[瀛楀吀] 'mississippi' 瀛楃璁℃暟: {char_count}")

    # Counter 杩愮畻
    c1 = Counter(a=3, b=1)
    c2 = Counter(a=1, b=2)
    print(f"[瀛楀吀] {c1} + {c2} = {c1 + c2}")
    print(f"[瀛楀吀] {c1} - {c2} = {c1 - c2}")


def main() -> None:
    print("=" * 60)
    print("Python 瀛楀吀 (dict) 婕旂ず")
    print("=" * 60)

    demo_dict_basics()
    demo_dict_methods()
    demo_defaultdict()
    demo_counter()

    print("\n" + "=" * 60)
    print("瀛楀吀婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()