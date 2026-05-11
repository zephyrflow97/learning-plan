"""
闂寘 鈥?鍑芥暟璁颁綇浜嗗嚭鐢熸椂鐨勭幆澧?
杩愯鏂瑰紡:
    python examples/04-closures.py

鏈剼鏈紨绀猴細
1. 闂寘鐨勬蹇靛拰鍘熺悊
2. 闂寘鐨勫疄闄呭簲鐢?3. nonlocal 鍏抽敭瀛?4. 闂寘 vs 绫?"""


def demo_closure_basics() -> None:
    """婕旂ず闂寘鍩虹"""
    print("[闂寘] === 闂寘鍩虹 ===")

    def make_greeting(prefix: str):
        """澶栧眰鍑芥暟锛氬畾涔夐棴鍖呯幆澧?""
        # prefix 鏄嚜鐢卞彉閲忥紝琚唴灞傚嚱鏁版崟鑾?        def greeting(name: str) -> str:
            """鍐呭眰鍑芥暟锛氶棴鍖咃紝璁颁綇浜?prefix"""
            return f"{prefix}, {name}!"
        return greeting

    hello = make_greeting("Hello")
    nihao = make_greeting("浣犲ソ")

    print(f"[闂寘] hello('Alice') = {hello('Alice')}")
    print(f"[闂寘] nihao('寮犱笁') = {nihao('寮犱笁')}")

    # 鏌ョ湅闂寘鎹曡幏鐨勫彉閲?    print(f"[闂寘] hello 鐨勮嚜鐢卞彉閲? {hello.__code__.co_freevars}")
    print(f"[闂寘] hello 鐨勯棴鍖呭崟鍏? {hello.__closure__}")
    print(f"[闂寘] 鎹曡幏鐨勫€? {hello.__closure__[0].cell_contents}")


def demo_closure_counter() -> None:
    """婕旂ず闂寘瀹炵幇璁℃暟鍣?""
    print("\n[闂寘] === 闂寘璁℃暟鍣?===")

    def make_counter(initial: int = 0):
        """鍒涘缓涓€涓鏁板櫒闂寘"""
        count = initial

        def increment() -> int:
            nonlocal count  # 澹版槑淇敼澶栧眰鍙橀噺
            count += 1
            return count

        def get_count() -> int:
            return count

        def reset() -> None:
            nonlocal count
            count = initial

        # 杩斿洖澶氫釜闂寘锛屽叡浜悓涓€涓?count
        return increment, get_count, reset

    inc, get, reset = make_counter(0)

    print(f"[闂寘] 鍒濆鍊? {get()}")
    print(f"[闂寘] 鍔犱竴: {inc()}")
    print(f"[闂寘] 鍔犱竴: {inc()}")
    print(f"[闂寘] 鍔犱竴: {inc()}")
    print(f"[闂寘] 褰撳墠: {get()}")
    reset()
    print(f"[闂寘] 閲嶇疆鍚? {get()}")


def demo_closure_practical() -> None:
    """婕旂ず闂寘鐨勫疄闄呭簲鐢?""
    print("\n[闂寘] === 闂寘瀹為檯搴旂敤 ===")

    # 1. 缂撳瓨/璁板繂鍖?    def memoize(func):
        """绠€鍗曠殑璁板繂鍖栬楗板櫒锛堥棴鍖呭疄鐜帮級"""
        cache = {}

        def wrapper(*args):
            if args not in cache:
                cache[args] = func(*args)
                print(f"[闂寘]   璁＄畻 {func.__name__}{args} = {cache[args]}")
            else:
                print(f"[闂寘]   缂撳瓨鍛戒腑 {func.__name__}{args} = {cache[args]}")
            return cache[args]

        return wrapper

    @memoize
    def fibonacci(n: int) -> int:
        if n < 2:
            return n
        return fibonacci(n - 1) + fibonacci(n - 2)

    print("[闂寘] 璁＄畻 fibonacci(6):")
    result = fibonacci(6)
    print(f"[闂寘] 缁撴灉: {result}")

    # 2. 閰嶇疆宸ュ巶
    def make_formatter(prefix: str, suffix: str = ""):
        """鍒涘缓鏍煎紡鍖栧嚱鏁?""
        def formatter(text: str) -> str:
            return f"{prefix}{text}{suffix}"
        return formatter

    bold = make_formatter("**", "**")
    bracket = make_formatter("[", "]")
    arrow = make_formatter(">>> ")

    print(f"\n[闂寘] bold('hello') = {bold('hello')}")
    print(f"[闂寘] bracket('hello') = {bracket('hello')}")
    print(f"[闂寘] arrow('hello') = {arrow('hello')}")


def demo_closure_pitfall() -> None:
    """婕旂ず闂寘鐨勫父瑙侀櫡闃?""
    print("\n[闂寘] === 闂寘闄烽槺 ===")

    # 鉂?缁忓吀闄烽槺锛氬惊鐜腑鐨勯棴鍖?    print("[闂寘] 鉂?寰幆涓殑闂寘闄烽槺:")
    functions = []
    for i in range(5):
        functions.append(lambda: i)  # 鎵€鏈?lambda 鍏变韩鍚屼竴涓?i

    # 鎵€鏈夊嚱鏁伴兘杩斿洖 4锛堝惊鐜粨鏉熷悗 i 鐨勬渶缁堝€硷級
    results = [f() for f in functions]
    print(f"[闂寘]   鏈熸湜: [0, 1, 2, 3, 4]")
    print(f"[闂寘]   瀹為檯: {results}")

    # 鉁?淇鏂瑰紡 1锛氫娇鐢ㄩ粯璁ゅ弬鏁版崟鑾峰綋鍓嶅€?    print("\n[闂寘] 鉁?淇鏂瑰紡 1 鈥?榛樿鍙傛暟:")
    functions = []
    for i in range(5):
        functions.append(lambda x=i: x)  # 鐢ㄩ粯璁ゅ弬鏁板浐瀹氬€?
    results = [f() for f in functions]
    print(f"[闂寘]   缁撴灉: {results}")

    # 鉁?淇鏂瑰紡 2锛氫娇鐢ㄥ伐鍘傚嚱鏁?    print("\n[闂寘] 鉁?淇鏂瑰紡 2 鈥?宸ュ巶鍑芥暟:")

    def make_func(n: int):
        return lambda: n

    functions = [make_func(i) for i in range(5)]
    results = [f() for f in functions]
    print(f"[闂寘]   缁撴灉: {results}")


def main() -> None:
    """涓诲嚱鏁?""
    print("=" * 60)
    print("Python 闂寘婕旂ず")
    print("=" * 60)

    demo_closure_basics()
    demo_closure_counter()
    demo_closure_practical()
    demo_closure_pitfall()

    print("\n" + "=" * 60)
    print("闂寘婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()