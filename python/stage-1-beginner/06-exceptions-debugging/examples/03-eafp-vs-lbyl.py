"""
EAFP vs LBYL 鈥?Python 鐨勯敊璇鐞嗗摬瀛?
杩愯鏂瑰紡:
    python examples/03-eafp-vs-lbyl.py
"""


def demo_eafp_vs_lbyl() -> None:
    """瀵规瘮 EAFP 鍜?LBYL"""
    print("[EAFP/LBYL] === EAFP vs LBYL 瀵规瘮 ===")

    data = {"name": "Alice", "age": 30}

    # LBYL (Look Before You Leap) 鈥?鍏堟鏌ュ啀鎿嶄綔
    print("[EAFP/LBYL] LBYL 椋庢牸:")
    if "email" in data:
        email = data["email"]
    else:
        email = "default@example.com"
    print(f"[EAFP/LBYL]   email = {email}")

    # EAFP (Easier to Ask Forgiveness than Permission) 鈥?鍏堟搷浣滃啀澶勭悊寮傚父
    print("\n[EAFP/LBYL] EAFP 椋庢牸:")
    try:
        email = data["email"]
    except KeyError:
        email = "default@example.com"
    print(f"[EAFP/LBYL]   email = {email}")

    # 鏈€ Pythonic 鐨勬柟寮?    print("\n[EAFP/LBYL] 鏈€ Pythonic:")
    email = data.get("email", "default@example.com")
    print(f"[EAFP/LBYL]   email = {email}")


def demo_eafp_file() -> None:
    """EAFP 鍦ㄦ枃浠舵搷浣滀腑鐨勫簲鐢?""
    print("\n[EAFP/LBYL] === 鏂囦欢鎿嶄綔 ===")
    import os

    filename = "nonexistent_file.txt"

    # 鉂?LBYL 鈥?鏈?TOCTOU 绔炴€佹潯浠?    print("[EAFP/LBYL] LBYL (鏈夌珵鎬佹潯浠?:")
    if os.path.exists(filename):
        with open(filename) as f:
            print(f.read())
    else:
        print(f"[EAFP/LBYL]   鏂囦欢涓嶅瓨鍦? {filename}")

    # 鉁?EAFP 鈥?鍘熷瓙鎬ф洿濂?    print("\n[EAFP/LBYL] EAFP (鎺ㄨ崘):")
    try:
        with open(filename) as f:
            print(f.read())
    except FileNotFoundError:
        print(f"[EAFP/LBYL]   鏂囦欢涓嶅瓨鍦? {filename}")


def demo_eafp_type() -> None:
    """EAFP 涓庨腑瀛愮被鍨?""
    print("\n[EAFP/LBYL] === 楦瓙绫诲瀷 ===")

    def get_length(obj) -> int:
        """鑾峰彇瀵硅薄鐨勯暱搴?鈥?EAFP 椋庢牸"""
        try:
            return len(obj)
        except TypeError:
            return -1

    print(f"[EAFP/LBYL] len('hello') = {get_length('hello')}")
    print(f"[EAFP/LBYL] len([1,2,3]) = {get_length([1, 2, 3])}")
    print(f"[EAFP/LBYL] len(42) = {get_length(42)}")


def demo_comparison() -> None:
    """EAFP vs LBYL 瀵规瘮鎬荤粨"""
    print("\n[EAFP/LBYL] === 瀵规瘮鎬荤粨 ===")
    print("[EAFP/LBYL] 鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?)
    print("[EAFP/LBYL] 鈹?       鈹?LBYL        鈹?EAFP          鈹?)
    print("[EAFP/LBYL] 鈹溾攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹尖攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹尖攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?)
    print("[EAFP/LBYL] 鈹?鍝插   鈹?鍏堟鏌ュ啀鍋? 鈹?鍏堝仛鍐嶅鐞?   鈹?)
    print("[EAFP/LBYL] 鈹?鎬ц兘   鈹?妫€鏌ユ湁寮€閿€  鈹?鏃犲紓甯告椂鏇村揩  鈹?)
    print("[EAFP/LBYL] 鈹?绔炴€?  鈹?鏈?TOCTOU   鈹?鍘熷瓙鎬ф洿濂?   鈹?)
    print("[EAFP/LBYL] 鈹?椋庢牸   鈹?Java/C++    鈹?Python        鈹?)
    print("[EAFP/LBYL] 鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?)


def main() -> None:
    print("=" * 60)
    print("EAFP vs LBYL 婕旂ず")
    print("=" * 60)
    demo_eafp_vs_lbyl()
    demo_eafp_file()
    demo_eafp_type()
    demo_comparison()
    print("\n" + "=" * 60)
    print("EAFP vs LBYL 婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()