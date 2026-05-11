"""
寮傚父灞傛缁撴瀯 鈥?Python 鐨勫紓甯镐綋绯?
杩愯鏂瑰紡:
    python examples/01-exception-hierarchy.py
"""


def demo_exception_hierarchy() -> None:
    """婕旂ず寮傚父灞傛缁撴瀯"""
    print("[寮傚父] === 寮傚父灞傛缁撴瀯 ===")

    # 甯歌寮傚父
    exceptions_demo = [
        ("ValueError", lambda: int("not_a_number")),
        ("TypeError", lambda: "hello" + 42),
        ("IndexError", lambda: [1, 2, 3][10]),
        ("KeyError", lambda: {"a": 1}["b"]),
        ("ZeroDivisionError", lambda: 1 / 0),
        ("AttributeError", lambda: "hello".nonexistent),
        ("FileNotFoundError", lambda: open("nonexistent_file.txt")),
    ]

    for name, func in exceptions_demo:
        try:
            func()
        except Exception as e:
            print(f"[寮傚父] {name}: {type(e).__name__}: {e}")


def demo_try_except() -> None:
    """婕旂ず try/except/else/finally"""
    print("\n[寮傚父] === try/except/else/finally ===")

    # 瀹屾暣鐨勫紓甯稿鐞嗙粨鏋?    def safe_divide(a: float, b: float) -> float | None:
        try:
            result = a / b
        except ZeroDivisionError:
            print(f"[寮傚父]   闄ら浂閿欒: {a} / {b}")
            return None
        except TypeError as e:
            print(f"[寮傚父]   绫诲瀷閿欒: {e}")
            return None
        else:
            # 鍙湁娌″彂鐢熷紓甯告椂鎵嶆墽琛?            print(f"[寮傚父]   璁＄畻鎴愬姛: {a} / {b} = {result}")
            return result
        finally:
            # 鏃犺鏄惁鍙戠敓寮傚父閮芥墽琛?            print(f"[寮傚父]   娓呯悊瀹屾垚 (finally)")

    print("[寮傚父] 姝ｅ父鎯呭喌:")
    safe_divide(10, 3)
    print("\n[寮傚父] 闄ら浂閿欒:")
    safe_divide(10, 0)
    print("\n[寮傚父] 绫诲瀷閿欒:")
    safe_divide("10", 3)


def demo_exception_chaining() -> None:
    """婕旂ず寮傚父閾?""
    print("\n[寮傚父] === 寮傚父閾?===")

    def process_config(filename: str) -> dict:
        try:
            with open(filename) as f:
                return eval(f.read())
        except FileNotFoundError as e:
            raise RuntimeError(f"閰嶇疆鏂囦欢涓嶅瓨鍦? {filename}") from e

    try:
        process_config("nonexistent.conf")
    except RuntimeError as e:
        print(f"[寮傚父] RuntimeError: {e}")
        print(f"[寮傚父] 鍘熷寮傚父: {e.__cause__}")


def demo_exception_info() -> None:
    """鎵撳嵃寮傚父灞傛"""
    print("\n[寮傚父] === 甯歌寮傚父閫熸煡 ===")
    print("[寮傚父] BaseException")
    print("[寮傚父] 鈹溾攢鈹€ SystemExit")
    print("[寮傚父] 鈹溾攢鈹€ KeyboardInterrupt")
    print("[寮傚父] 鈹溾攢鈹€ GeneratorExit")
    print("[寮傚父] 鈹斺攢鈹€ Exception")
    print("[寮傚父]     鈹溾攢鈹€ ArithmeticError")
    print("[寮傚父]     鈹?  鈹溾攢鈹€ ZeroDivisionError")
    print("[寮傚父]     鈹?  鈹斺攢鈹€ OverflowError")
    print("[寮傚父]     鈹溾攢鈹€ LookupError")
    print("[寮傚父]     鈹?  鈹溾攢鈹€ IndexError")
    print("[寮傚父]     鈹?  鈹斺攢鈹€ KeyError")
    print("[寮傚父]     鈹溾攢鈹€ ValueError")
    print("[寮傚父]     鈹溾攢鈹€ TypeError")
    print("[寮傚父]     鈹溾攢鈹€ AttributeError")
    print("[寮傚父]     鈹溾攢鈹€ OSError")
    print("[寮傚父]     鈹?  鈹斺攢鈹€ FileNotFoundError")
    print("[寮傚父]     鈹溾攢鈹€ RuntimeError")
    print("[寮傚父]     鈹斺攢鈹€ StopIteration")


def main() -> None:
    print("=" * 60)
    print("Python 寮傚父灞傛缁撴瀯婕旂ず")
    print("=" * 60)
    demo_exception_hierarchy()
    demo_try_except()
    demo_exception_chaining()
    demo_exception_info()
    print("\n" + "=" * 60)
    print("寮傚父灞傛缁撴瀯婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()