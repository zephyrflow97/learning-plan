"""
名称绑定模型 — 变量是标签，不是盒子

运行方式:
    python examples/02-name-binding.py

本脚本演示：
1. 名称绑定的本质
2. 赋值不是复制
3. 浅复制 vs 深复制
4. 可变默认参数陷阱
"""
import copy


def demo_name_binding() -> None:
    """演示名称绑定的基本概念"""
    print("[名称绑定] === 名称绑定基础 ===")

    # a 和 b 指向同一个对象
    a = [1, 2, 3]
    b = a
    print(f"[名称绑定] a = {a}, id(a) = {id(a)}")
    print(f"[名称绑定] b = {b}, id(b) = {id(b)}")
    print(f"[名称绑定] a is b = {a is b}")  # True

    # 通过 a 修改列表，b 也能看到
    a.append(4)
    print(f"\n[名称绑定] 执行 a.append(4) 后:")
    print(f"[名称绑定] a = {a}")
    print(f"[名称绑定] b = {b}")  # 也变了！

    # 重新赋值 a 不会影响 b
    a = [10, 20, 30]
    print(f"\n[名称绑定] 执行 a = [10, 20, 30] 后:")
    print(f"[名称绑定] a = {a}")
    print(f"[名称绑定] b = {b}")  # 不变
    print(f"[名称绑定] a is b = {a is b}")  # False


def demo_immutable_binding() -> None:
    """演示不可变对象的名称绑定"""
    print("\n[名称绑定] === 不可变对象的名称绑定 ===")

    # 不可变对象（int）看起来像"复制"
    x = 42
    y = x
    print(f"[名称绑定] x = {x}, y = {y}, x is y = {x is y}")

    x = 100  # 重新绑定 x，y 不受影响
    print(f"[名称绑定] 执行 x = 100 后:")
    print(f"[名称绑定] x = {x}, y = {y}")
    print("[名称绑定] 因为 int 不可变，所以 x = 100 是创建新对象并重新绑定")

    # 字符串也是不可变的
    s1 = "hello"
    s2 = s1
    s1 = s1.upper()  # 创建新字符串
    print(f"\n[名称绑定] 字符串: s1 = {s1!r}, s2 = {s2!r}")
    print("[名称绑定] s1.upper() 创建了新字符串 'HELLO'，s2 仍然指向 'hello'")


def demo_shallow_vs_deep_copy() -> None:
    """演示浅复制和深复制的区别"""
    print("\n[名称绑定] === 浅复制 vs 深复制 ===")

    # 原始列表（嵌套结构）
    original = [1, [2, 3], {"key": "value"}]
    print(f"[名称绑定] 原始: {original}")

    # 浅复制
    shallow = original.copy()
    print(f"[名称绑定] 浅复制: {shallow}")
    print(f"[名称绑定] original is shallow = {original is shallow}")  # False
    print(f"[名称绑定] original[1] is shallow[1] = {original[1] is shallow[1]}")  # True！

    # 修改浅复制的嵌套元素会影响原始
    shallow[1].append(999)
    print(f"\n[名称绑定] 执行 shallow[1].append(999) 后:")
    print(f"[名称绑定] original = {original}")  # 被影响了！
    print(f"[名称绑定] shallow  = {shallow}")

    # 深复制
    original2 = [1, [2, 3], {"key": "value"}]
    deep = copy.deepcopy(original2)
    deep[1].append(999)
    print(f"\n[名称绑定] 深复制后修改 deep[1].append(999):")
    print(f"[名称绑定] original2 = {original2}")  # 不受影响！
    print(f"[名称绑定] deep      = {deep}")

    # 浅复制的多种方式
    print(f"\n[名称绑定] === 浅复制的多种方式 ===")
    data = [1, 2, 3]
    copy1 = data.copy()        # list.copy()
    copy2 = list(data)         # list() 构造函数
    copy3 = data[:]            # 切片
    copy4 = [*data]            # 解包（Python 3.5+）

    print(f"[名称绑定] data.copy()  -> {copy1}")
    print(f"[名称绑定] list(data)   -> {copy2}")
    print(f"[名称绑定] data[:]      -> {copy3}")
    print(f"[名称绑定] [*data]      -> {copy4}")
    print(f"[名称绑定] 它们都是浅复制，结果相同但对象不同")


def demo_mutable_default_pitfall() -> None:
    """演示可变默认参数陷阱"""
    print("\n[名称绑定] === 可变默认参数陷阱 ===")

    # ❌ 错误示范：使用可变对象作为默认参数
    def add_item_bad(item: str, items: list[str] = []) -> list[str]:
        """危险！默认列表在函数定义时只创建一次"""
        items.append(item)
        return items

    print("[名称绑定] ❌ 使用可变默认参数:")
    result1 = add_item_bad("apple")
    print(f"[名称绑定]   第一次调用: {result1}")  # ['apple']
    result2 = add_item_bad("banana")
    print(f"[名称绑定]   第二次调用: {result2}")  # ['apple', 'banana'] — 不是 ['banana']！

    # ✅ 正确做法：使用 None 作为哨兵值
    def add_item_good(item: str, items: list[str] | None = None) -> list[str]:
        """安全！每次调用都创建新列表"""
        if items is None:
            items = []
        items.append(item)
        return items

    print(f"\n[名称绑定] ✅ 使用 None 作为默认参数:")
    result3 = add_item_good("apple")
    print(f"[名称绑定]   第一次调用: {result3}")  # ['apple']
    result4 = add_item_good("banana")
    print(f"[名称绑定]   第二次调用: {result4}")  # ['banana'] — 正确！


def demo_augmented_assignment() -> None:
    """演示增量赋值的行为差异"""
    print("\n[名称绑定] === 增量赋值 (+=) 的行为差异 ===")

    # 对于不可变类型，+= 创建新对象
    a = 10
    print(f"[名称绑定] a = {a}, id(a) = {id(a)}")
    a += 5
    print(f"[名称绑定] a += 5 后: a = {a}, id(a) = {id(a)}")
    print("[名称绑定] int 是不可变的，+= 创建了新对象")

    # 对于可变类型，+= 原地修改
    lst = [1, 2, 3]
    original_id = id(lst)
    print(f"\n[名称绑定] lst = {lst}, id(lst) = {id(lst)}")
    lst += [4, 5]
    print(f"[名称绑定] lst += [4, 5] 后: lst = {lst}, id(lst) = {id(lst)}")
    print(f"[名称绑定] id 相同? {id(lst) == original_id}")
    print("[名称绑定] list 是可变的，+= 原地修改（调用 __iadd__）")


def main() -> None:
    """主函数"""
    print("=" * 60)
    print("🐍 名称绑定模型演示")
    print("=" * 60)

    demo_name_binding()
    demo_immutable_binding()
    demo_shallow_vs_deep_copy()
    demo_mutable_default_pitfall()
    demo_augmented_assignment()

    print("\n" + "=" * 60)
    print("✅ 名称绑定演示完成")
    print("=" * 60)


if __name__ == "__main__":
    main()
