"""
pathlib 鐜颁唬璺緞鎿嶄綔

杩愯鏂瑰紡:
    python examples/03-pathlib.py
"""
from pathlib import Path


def demo_pathlib_basics() -> None:
    """pathlib 鍩虹鎿嶄綔"""
    print("[pathlib] === 鍩虹鎿嶄綔 ===")

    # 鍒涘缓璺緞
    p = Path(".")
    home = Path.home()
    print(f"[pathlib] 褰撳墠鐩綍: {p.resolve()}")
    print(f"[pathlib] 鐢ㄦ埛鐩綍: {home}")

    # 璺緞鎷兼帴浣跨敤 / 杩愮畻绗?    config = home / ".config" / "app" / "settings.toml"
    print(f"[pathlib] 閰嶇疆璺緞: {config}")

    # 璺緞灞炴€?    example = Path("/Users/alice/documents/report.pdf")
    print(f"\n[pathlib] 璺緞鍒嗚В:")
    print(f"[pathlib]   name: {example.name}")
    print(f"[pathlib]   stem: {example.stem}")
    print(f"[pathlib]   suffix: {example.suffix}")
    print(f"[pathlib]   parent: {example.parent}")
    print(f"[pathlib]   parts: {example.parts}")


def demo_pathlib_operations() -> None:
    """pathlib 鏂囦欢绯荤粺鎿嶄綔"""
    print("\n[pathlib] === 鏂囦欢绯荤粺鎿嶄綔 ===")

    # 褰撳墠鐩綍鐨勬枃浠?    current = Path(".")
    print("[pathlib] 褰撳墠鐩綍鐨?.py 鏂囦欢:")
    for py_file in sorted(current.glob("**/*.py")):
        print(f"[pathlib]   {py_file}")

    # 妫€鏌ヨ矾寰?    p = Path(".")
    print(f"\n[pathlib] exists(): {p.exists()}")
    print(f"[pathlib] is_dir(): {p.is_dir()}")
    print(f"[pathlib] is_file(): {p.is_file()}")

    # 鍒涘缓鐩綍
    temp_dir = Path("_temp_demo")
    temp_dir.mkdir(exist_ok=True)
    print(f"[pathlib] 鍒涘缓鐩綍: {temp_dir}")

    # 鍐欏叆鍜岃读鍙栨枃浠?    temp_file = temp_dir / "test.txt"
    temp_file.write_text("Hello, pathlib!", encoding="utf-8")
    content = temp_file.read_text(encoding="utf-8")
    print(f"[pathlib] 鍐欏叆骞惰读鍙? {content}")

    # 娓呯悊
    temp_file.unlink()
    temp_dir.rmdir()
    print("[pathlib] 娓呯悊瀹屾垚")


def demo_pathlib_vs_ospath() -> None:
    """pathlib vs os.path 瀵规瘮"""
    import os

    print("\n[pathlib] === pathlib vs os.path ===")

    # os.path 鏂瑰紡
    old_path = os.path.join(os.path.expanduser("~"), "documents", "file.txt")
    old_exists = os.path.exists(old_path)

    # pathlib 鏂瑰紡
    new_path = Path.home() / "documents" / "file.txt"
    new_exists = new_path.exists()

    print(f"[pathlib] os.path: {old_path}")
    print(f"[pathlib] pathlib: {new_path}")
    print("[pathlib] pathlib 鏇寸畝娲併€佹洿闈㈠悜瀵硅薄銆佹洿 Pythonic")


def main() -> None:
    print("=" * 60)
    print("Python pathlib 婕旂ず")
    print("=" * 60)
    demo_pathlib_basics()
    demo_pathlib_operations()
    demo_pathlib_vs_ospath()
    print("\n" + "=" * 60)
    print("pathlib 婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()