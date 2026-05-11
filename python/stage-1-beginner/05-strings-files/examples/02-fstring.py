"""
f-string 鏍煎紡鍖?鈥?鍖呭惈璋冭瘯妯″紡

杩愯鏂瑰紡:
    python examples/02-fstring.py
"""
import math
from datetime import datetime


def demo_fstring_basics() -> None:
    """f-string 鍩虹"""
    print("[f-string] === 鍩虹鐢ㄦ硶 ===")

    name = "Python"
    version = 3.12
    print(f"[f-string] {name} {version}")

    # 琛ㄨ揪寮?    x = 10
    print(f"[f-string] {x} 鐨勫钩鏂? {x**2}")
    print(f"[f-string] pi = {math.pi:.4f}")

    # 璋冪敤鏂规硶
    msg = "hello world"
    print(f"[f-string] upper: {msg.upper()}")
    print(f"[f-string] title: {msg.title()}")


def demo_fstring_debug() -> None:
    """f-string 璋冭瘯妯″紡 (Python 3.8+)"""
    print("\n[f-string] === 璋冭瘯妯″紡 f'{x=}' ===")

    x = 42
    name = "Alice"
    items = [1, 2, 3]

    # f"{x=}" 浼氬悓鏃舵墦鍗板彉閲忓悕鍜屽€?    print(f"[f-string] {x=}")           # x=42
    print(f"[f-string] {name=}")        # name='Alice'
    print(f"[f-string] {len(items)=}")  # len(items)=3
    print(f"[f-string] {x * 2=}")       # x * 2=84

    # 甯︽牸寮忓寲
    pi = math.pi
    print(f"[f-string] {pi=:.2f}")      # pi=3.14


def demo_fstring_advanced() -> None:
    """f-string 楂樼骇鐢ㄦ硶"""
    print("\n[f-string] === 楂樼骇鐢ㄦ硶 ===")

    # 鏃ユ湡鏍煎紡鍖?    now = datetime.now()
    print(f"[f-string] 鏃ユ湡: {now:%Y-%m-%d %H:%M:%S}")

    # 宓屽寮曞彿
    data = {"key": "value"}
    print(f"[f-string] 瀛楀吀鍙栧€? {data['key']}")

    # 澶氳 f-string
    name = "Alice"
    age = 30
    info = (
        f"濮撳悕: {name}\n"
        f"骞撮緞: {age}\n"
        f"鍑虹敓骞? {2026 - age}"
    )
    print(f"[f-string] 澶氳:\n{info}")

    # 瀵归綈鍜屽～鍏?    items = [("鑻规灉", 5.5), ("棣欒晧", 3.2), ("妯辨", 15.0)]
    print("\n[f-string] 瀵归綈琛ㄦ牸:")
    for item, price in items:
        print(f"[f-string]   {item:<6s} ¥{price:>6.1f}")


def main() -> None:
    print("=" * 60)
    print("Python f-string 婕旂ず")
    print("=" * 60)
    demo_fstring_basics()
    demo_fstring_debug()
    demo_fstring_advanced()
    print("\n" + "=" * 60)
    print("f-string 婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()