"""
鏂囦欢鏍煎紡澶勭悊 鈥?JSON, CSV, TOML

杩愯鏂瑰紡:
    python examples/04-file-formats.py
"""
import csv
import json
from io import StringIO
from pathlib import Path


def demo_json() -> None:
    """婕旂ず JSON 澶勭悊"""
    print("[鏂囦欢鏍煎紡] === JSON ===")

    data = {
        "name": "Alice",
        "age": 30,
        "hobbies": ["reading", "coding"],
        "address": {"city": "Beijing", "country": "China"}
    }

    # 搴忓垪鍖栵紙Python 瀵硅薄 -> JSON 瀛楃涓诧級
    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    print(f"[鏂囦欢鏍煎紡] JSON 瀛楃涓?\n{json_str}")

    # 鍙嶅簭鍒楀寲锛圝SON 瀛楃涓?-> Python 瀵硅薄锛?    parsed = json.loads(json_str)
    print(f"[鏂囦欢鏍煎紡] 瑙ｆ瀽鍚? {parsed['name']}, {parsed['address']['city']}")

    # 鏂囦欢璇诲啓
    temp = Path("_temp_data.json")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    loaded = json.loads(temp.read_text(encoding="utf-8"))
    print(f"[鏂囦欢鏍煎紡] 浠庢枃浠跺姞杞? {loaded['name']}")
    temp.unlink()


def demo_csv() -> None:
    """婕旂ず CSV 澶勭悊"""
    print("\n[鏂囦欢鏍煎紡] === CSV ===")

    # 鍐欏叆 CSV
    csv_data = StringIO()
    writer = csv.writer(csv_data)
    writer.writerow(["name", "age", "city"])
    writer.writerow(["Alice", 30, "Beijing"])
    writer.writerow(["Bob", 25, "Shanghai"])

    csv_content = csv_data.getvalue()
    print(f"[鏂囦欢鏍煎紡] CSV 鍐呭:\n{csv_content}")

    # 璇诲彇 CSV
    reader = csv.DictReader(StringIO(csv_content))
    print("[鏂囦欢鏍煎紡] 瑙ｆ瀽 CSV:")
    for row in reader:
        print(f"[鏂囦欢鏍煎紡]   {row['name']}, {row['age']}, {row['city']}")


def demo_with_statement() -> None:
    """婕旂ず with 璇彞杩涜鏂囦欢鎿嶄綔"""
    print("\n[鏂囦欢鏍煎紡] === with 璇彞 ===")

    temp = Path("_temp_example.txt")

    # 鉁?浣跨敤 with 璇彞锛堟帹鑽愶級
    with open(temp, "w", encoding="utf-8") as f:
        f.write("绗竴琛孿n")
        f.write("绗簩琛孿n")
        f.write("绗笁琛孿n")

    with open(temp, "r", encoding="utf-8") as f:
        content = f.read()
    print(f"[鏂囦欢鏍煎紡] 鏂囦欢鍐呭:\n{content}")

    # 閫愯璇诲彇
    with open(temp, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            print(f"[鏂囦欢鏍煎紡] 绗?{line_no} 琛? {line.rstrip()}")

    temp.unlink()
    print("[鏂囦欢鏍煎紡] with 璇彞纭繚鏂囦欢姝ｇ‘鍏抽棴锛屽嵆浣垮彂鐢熷紓甯?)


def demo_encoding() -> None:
    """婕旂ず缂栫爜"""
    print("\n[鏂囦欢鏍煎紡] === 缂栫爜 str vs bytes ===")

    text = "浣犲ソ, Python!"

    # str -> bytes (缂栫爜)
    encoded = text.encode("utf-8")
    print(f"[鏂囦欢鏍煎紡] str: {text}")
    print(f"[鏂囦欢鏍煎紡] bytes (utf-8): {encoded}")
    print(f"[鏂囦欢鏍煎紡] bytes 闀垮害: {len(encoded)} (str 闀垮害: {len(text)})")

    # bytes -> str (瑙ｇ爜)
    decoded = encoded.decode("utf-8")
    print(f"[鏂囦欢鏍煎紡] 瑙ｇ爜鍥?str: {decoded}")


def main() -> None:
    print("=" * 60)
    print("Python 鏂囦欢鏍煎紡澶勭悊婕旂ず")
    print("=" * 60)
    demo_json()
    demo_csv()
    demo_with_statement()
    demo_encoding()
    print("\n" + "=" * 60)
    print("鏂囦欢鏍煎紡澶勭悊婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()