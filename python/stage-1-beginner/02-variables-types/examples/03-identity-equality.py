"""
身份与相等 — is vs == 的深入理解

运行方式:
    python examples/03-identity-equality.py

本脚本演示：
1. is（身份比较）和 ==（值比较）的区别
2. 小整数缓存
3. 字符串驻留
4. None 的检查方式
"""


def demo_is_vs_equal() -> None:
    """演示 is 和 == 的区别"""
    print("[身份比较] === is vs == 基础 ===")

    # 两个不同的列表对象，内容相同
    a = [1, 2, 3]
    b = [1, 2, 3]
    c = a  # c 是 a 的别名

    print(f"[身份比较] a = {a}")
    print(f"[身份比较] b = {b}")
    print(f"[身份比较] c = a")

    # 值比较
    print(f"\n[身份比较] a == b = {a == b}")  # True — 内容相同
    print(f"[身份比较] a == c = {a == c}")    # True

    # 身份比较
    print(f"[身份比较] a is b = {a is b}")    # False — 不同对象
    print(f"[身份比较] a is c = {a is c}")    # True — 同一个对象

    # id() 查看身份
    print(f"\n[身份比较] id(a) = {id(a)}")
    print(f"[身份比较] id(b) = {id(b)}")
    print(f"[身份比较] id(c) = {id(c)}")


def demo_integer_caching() -> None:
    """演示 CPython 的小整数缓存"""
    print("\n[身份比较] === 小整数缓存 ===")

    # CPython 缓存了 -5 到 256 之间的整数
    a = 256
    b = 256
    print(f"[身份比较] a = 256, b = 256")
    print(f"[身份比较] a is b = {a is b}")  # True（缓存范围内）
    print(f"[身份比较] a == b = {a == b}")  # True

    a = 257
    b = 257
    print(f"\n[身份比较] a = 257, b = 257")
    print(f"[身份比较] a is b = {a is b}")  # 可能是 False
    print(f"[身份比较] a == b = {a == b}")  # True

    a = -5
    b = -5
    print(f"\n[身份比较] a = -5, b = -5")
    print(f"[身份比较] a is b = {a is b}")  # True（缓存范围内）

    a = -6
    b = -6
    print(f"\n[身份比较] a = -6, b = -6")
    print(f"[身份比较] a is b = {a is b}")  # 可能是 False

    print("\n[身份比较] ⚠️ 永远不要依赖 is 来比较整数！使用 ==")


def demo_string_interning() -> None:
    """演示字符串驻留"""
    print("\n[身份比较] === 字符串驻留 ===")

    # 简单字符串通常会被驻留
    s1 = "hello"
    s2 = "hello"
    print(f"[身份比较] s1 = 'hello', s2 = 'hello'")
    print(f"[身份比较] s1 is s2 = {s1 is s2}")  # 通常 True
    print(f"[身份比较] s1 == s2 = {s1 == s2}")   # True

    # 包含特殊字符的字符串可能不会被驻留
    s3 = "hello world!"
    s4 = "hello world!"
    print(f"\n[身份比较] s3 = 'hello world!', s4 = 'hello world!'")
    print(f"[身份比较] s3 is s4 = {s3 is s4}")  # 可能 False
    print(f"[身份比较] s3 == s4 = {s3 == s4}")   # True

    print("\n[身份比较] ⚠️ 永远不要依赖 is 来比较字符串！使用 ==")


def demo_none_checking() -> None:
    """演示 None 的正确检查方式"""
    print("\n[身份比较] === None 的检查方式 ===")

    value = None

    # ✅ 正确方式：使用 is
    if value is None:
        print("[身份比较] ✅ value is None — 推荐方式")

    if value is not None:
        print("[身份比较] ✅ value is not None")
    else:
        print("[身份比较] ✅ value is None（使用 is not None 检查）")

    # ❌ 不推荐：使用 ==
    if value == None:  # noqa: E711
        print("[身份比较] ❌ value == None — 不推荐（但技术上可行）")

    # 为什么用 is？因为 None 是单例
    print(f"\n[身份比较] None 是单例:")
    print(f"[身份比较] id(None) = {id(None)}")
    a = None
    b = None
    print(f"[身份比较] a = None, b = None")
    print(f"[身份比较] a is b = {a is b}")  # True，因为只有一个 None 对象

    # 自定义对象可能会重写 __eq__，导致 == None 不可靠
    class TrickyObject:
        """一个重写了 __eq__ 的对象"""
        def __eq__(self, other: object) -> bool:
            return True  # 与任何东西都 "相等"

    tricky = TrickyObject()
    print(f"\n[身份比较] 自定义 __eq__ 的对象:")
    print(f"[身份比较] tricky == None  → {tricky == None}")   # True（误导！）  # noqa: E711
    print(f"[身份比较] tricky is None → {tricky is None}")   # False（正确！）
    print("[身份比较] 这就是为什么必须用 is None 而不是 == None")


def demo_comparison_summary() -> None:
    """总结对比"""
    print("\n[身份比较] === 使用指南 ===")
    print("[身份比较] ┌──────────────────┬─────────────────────────┐")
    print("[身份比较] │ 场景              │ 使用                     │")
    print("[身份比较] ├──────────────────┼─────────────────────────┤")
    print("[身份比较] │ 检查 None         │ x is None               │")
    print("[身份比较] │ 比较值            │ x == y                  │")
    print("[身份比较] │ 比较类型          │ isinstance(x, type)     │")
    print("[身份比较] │ 检查空集合        │ if not collection       │")
    print("[身份比较] └──────────────────┴─────────────────────────┘")


def main() -> None:
    """主函数"""
    print("=" * 60)
    print("🐍 身份与相等演示")
    print("=" * 60)

    demo_is_vs_equal()
    demo_integer_caching()
    demo_string_interning()
    demo_none_checking()
    demo_comparison_summary()

    print("\n" + "=" * 60)
    print("✅ 身份与相等演示完成")
    print("=" * 60)


if __name__ == "__main__":
    main()
