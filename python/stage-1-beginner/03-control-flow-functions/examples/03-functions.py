"""
鍑芥暟 鈥?def銆乴ambda銆佸弬鏁般€佷竴绛夊叕姘?
杩愯鏂瑰紡:
    python examples/03-functions.py

鏈剼鏈紨绀猴細
1. 鍑芥暟瀹氫箟涓庤皟鐢?2. 鍙傛暟绫诲瀷锛氫綅缃弬鏁般€佸叧閿瓧鍙傛暟銆侀粯璁ゅ弬鏁?3. *args 鍜?**kwargs
4. lambda 琛ㄨ揪寮?5. 鍑芥暟鏄竴绛夊叕姘?6. LEGB 浣滅敤鍩熻鍒?"""


def demo_basic_functions() -> None:
    """婕旂ず鍩烘湰鍑芥暟瀹氫箟"""
    print("[鍑芥暟] === 鍩烘湰鍑芥暟瀹氫箟 ===")

    def greet(name: str) -> str:
        """闂€欏嚱鏁?鈥?鎺ュ彈鍚嶅瓧锛岃繑鍥為棶鍊欒"""
        return f"浣犲ソ, {name}!"

    print(f"[鍑芥暟] {greet('Python')}")
    print(f"[鍑芥暟] {greet('World')}")

    # 鏃犺繑鍥炲€肩殑鍑芥暟锛堣繑鍥?None锛?    def log_message(msg: str) -> None:
        """鎵撳嵃鏃ュ織娑堟伅"""
        print(f"[鍑芥暟] LOG: {msg}")

    result = log_message("杩欐槸涓€鏉℃棩蹇?)
    print(f"[鍑芥暟] 杩斿洖鍊? {result}")  # None

    # 澶氳繑鍥炲€硷紙瀹為檯杩斿洖鍏冪粍锛?    def divide(a: float, b: float) -> tuple[float, float]:
        """杩斿洖鍟嗗拰浣欐暟"""
        return a // b, a % b

    quotient, remainder = divide(17, 5)
    print(f"[鍑芥暟] 17 / 5 = 鍟?{quotient}, 浣?{remainder}")


def demo_parameters() -> None:
    """婕旂ず鍙傛暟绫诲瀷"""
    print("\n[鍑芥暟] === 鍙傛暟绫诲瀷 ===")

    # 榛樿鍙傛暟
    def power(base: float, exp: int = 2) -> float:
        """璁＄畻骞傦紝榛樿涓哄钩鏂?""
        return base ** exp

    print(f"[鍑芥暟] power(3) = {power(3)}")       # 9锛堜娇鐢ㄩ粯璁ゅ€硷級
    print(f"[鍑芥暟] power(2, 10) = {power(2, 10)}")  # 1024

    # 鍏抽敭瀛楀弬鏁?    def create_user(name: str, age: int, role: str = "user") -> dict:
        """鍒涘缓鐢ㄦ埛瀛楀吀"""
        return {"name": name, "age": age, "role": role}

    user1 = create_user("Alice", 30)
    user2 = create_user(name="Bob", role="admin", age=25)
    print(f"[鍑芥暟] user1 = {user1}")
    print(f"[鍑芥暟] user2 = {user2}")

    # 浠呴檺浣嶇疆鍙傛暟 (/) 鍜屼粎闄愬叧閿瓧鍙傛暟 (*)
    def strict_func(pos_only, /, normal, *, kw_only):
        """pos_only 鍙兘鐢ㄤ綅缃紶鍙傦紝kw_only 鍙兘鐢ㄥ叧閿瓧浼犲弬"""
        return f"{pos_only}, {normal}, {kw_only}"

    result = strict_func(1, 2, kw_only=3)
    # result = strict_func(pos_only=1, normal=2, kw_only=3)  # TypeError!
    print(f"[鍑芥暟] strict_func(1, 2, kw_only=3) = {result}")


def demo_args_kwargs() -> None:
    """婕旂ず *args 鍜?**kwargs"""
    print("\n[鍑芥暟] === *args 鍜?**kwargs ===")

    # *args 鈥?鏀堕泦浣嶇疆鍙傛暟涓哄厓缁?    def sum_all(*args: float) -> float:
        """瀵规墍鏈夊弬鏁版眰鍜?""
        print(f"[鍑芥暟]   args = {args}, type = {type(args)}")
        return sum(args)

    print(f"[鍑芥暟] sum_all(1, 2, 3) = {sum_all(1, 2, 3)}")
    print(f"[鍑芥暟] sum_all(10, 20, 30, 40) = {sum_all(10, 20, 30, 40)}")

    # **kwargs 鈥?鏀堕泦鍏抽敭瀛楀弬鏁颁负瀛楀吀
    def print_info(**kwargs: str) -> None:
        """鎵撳嵃鎵€鏈夊叧閿瓧鍙傛暟"""
        print(f"[鍑芥暟]   kwargs = {kwargs}, type = {type(kwargs)}")
        for key, value in kwargs.items():
            print(f"[鍑芥暟]   {key}: {value}")

    print("\n[鍑芥暟] print_info(name='Alice', age='30'):")
    print_info(name="Alice", age="30", city="鍖椾含")

    # 缁勫悎浣跨敤
    def flexible(required: str, *args: int, **kwargs: str) -> None:
        """婕旂ず鍙傛暟缁勫悎"""
        print(f"[鍑芥暟]   required = {required}")
        print(f"[鍑芥暟]   args = {args}")
        print(f"[鍑芥暟]   kwargs = {kwargs}")

    print("\n[鍑芥暟] flexible('hello', 1, 2, 3, key='value'):")
    flexible("hello", 1, 2, 3, key="value")

    # 瑙ｅ寘璋冪敤
    args_list = [1, 2, 3]
    kwargs_dict = {"sep": " + ", "end": " = ?\n"}
    print("\n[鍑芥暟] 瑙ｅ寘璋冪敤 print(*args, **kwargs):")
    print(*args_list, **kwargs_dict)


def demo_lambda() -> None:
    """婕旂ず lambda 琛ㄨ揪寮?""
    print("\n[鍑芥暟] === lambda 琛ㄨ揪寮?===")

    # lambda 鏄尶鍚嶅嚱鏁?    square = lambda x: x**2
    print(f"[鍑芥暟] square(5) = {square(5)}")

    # 甯歌鐢ㄩ€旓細浣滀负鎺掑簭鐨?key
    students = [
        {"name": "Charlie", "score": 72},
        {"name": "Alice", "score": 95},
        {"name": "Bob", "score": 87},
    ]

    # 鎸夊垎鏁版帓搴?    sorted_students = sorted(students, key=lambda s: s["score"], reverse=True)
    print("[鍑芥暟] 鎸夊垎鏁版帓搴?")
    for s in sorted_students:
        print(f"[鍑芥暟]   {s['name']}: {s['score']}")

    # lambda vs def 鈥?浣曟椂浣跨敤
    # 鉁?lambda: 绠€鍗曠殑鍗曡〃杈惧紡鍑芥暟锛岄€氬父浣滀负鍙傛暟浼犻€?    # 鉂?lambda: 澶嶆潅閫昏緫銆佸琛屼唬鐮併€侀渶瑕佹枃妗ｅ瓧绗︿覆


def demo_first_class_functions() -> None:
    """婕旂ず鍑芥暟鏄竴绛夊叕姘?""
    print("\n[鍑芥暟] === 鍑芥暟鏄竴绛夊叕姘?===")

    # 1. 鍑芥暟鍙互璧嬪€肩粰鍙橀噺
    def add(a: int, b: int) -> int:
        return a + b

    operation = add
    print(f"[鍑芥暟] operation(3, 4) = {operation(3, 4)}")

    # 2. 鍑芥暟鍙互浣滀负鍙傛暟浼犻€?    def apply(func, a: int, b: int) -> int:
        """瀵?a 鍜?b 搴旂敤鍑芥暟 func"""
        return func(a, b)

    def multiply(a: int, b: int) -> int:
        return a * b

    print(f"[鍑芥暟] apply(add, 3, 4) = {apply(add, 3, 4)}")
    print(f"[鍑芥暟] apply(multiply, 3, 4) = {apply(multiply, 3, 4)}")

    # 3. 鍑芥暟鍙互浣滀负杩斿洖鍊?    def make_adder(n: int):
        """杩斿洖涓€涓姞 n 鐨勫嚱鏁?""
        def adder(x: int) -> int:
            return x + n
        return adder

    add_5 = make_adder(5)
    add_10 = make_adder(10)
    print(f"[鍑芥暟] add_5(3) = {add_5(3)}")
    print(f"[鍑芥暟] add_10(3) = {add_10(3)}")

    # 4. 鍑芥暟鍙互瀛樺湪鏁版嵁缁撴瀯涓?    operations = {
        "+": lambda a, b: a + b,
        "-": lambda a, b: a - b,
        "*": lambda a, b: a * b,
        "/": lambda a, b: a / b if b != 0 else float("inf"),
    }

    for op, func in operations.items():
        print(f"[鍑芥暟] 10 {op} 3 = {func(10, 3)}")


def demo_legb_scope() -> None:
    """婕旂ず LEGB 浣滅敤鍩熻鍒?""
    print("\n[鍑芥暟] === LEGB 浣滅敤鍩熻鍒?===")
    print("[鍑芥暟] L = Local, E = Enclosing, G = Global, B = Built-in")

    # Global 浣滅敤鍩?    global_var = "鎴戞槸鍏ㄥ眬鍙橀噺"

    def outer():
        # Enclosing 浣滅敤鍩?        enclosing_var = "鎴戞槸澶栧眰鍑芥暟鍙橀噺"

        def inner():
            # Local 浣滅敤鍩?            local_var = "鎴戞槸灞€閮ㄥ彉閲?
            # Built-in: print, len, type 绛?            print(f"[鍑芥暟]   Local: {local_var}")
            print(f"[鍑芥暟]   Enclosing: {enclosing_var}")
            print(f"[鍑芥暟]   Global: {global_var}")
            print(f"[鍑芥暟]   Built-in: {len('hello')}")

        inner()

    outer()

    # global 鍏抽敭瀛?    counter = 0

    def increment():
        nonlocal_demo = "test"  # noqa: F841
        global counter  # 澹版槑浣跨敤鍏ㄥ眬鍙橀噺
        counter += 1

    increment()
    increment()
    print(f"\n[鍑芥暟] global counter = {counter}")


def main() -> None:
    """涓诲嚱鏁?""
    print("=" * 60)
    print("Python 鍑芥暟婕旂ず")
    print("=" * 60)

    demo_basic_functions()
    demo_parameters()
    demo_args_kwargs()
    demo_lambda()
    demo_first_class_functions()
    demo_legb_scope()

    print("\n" + "=" * 60)
    print("鍑芥暟婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()