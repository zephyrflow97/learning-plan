"""
分组、前瞻与后顾断言示例。

演示正则表达式的高级特性：
- 捕获组与命名分组
- 非捕获分组
- 正向/负向前瞻
- 正向/负向后顾
- 贪婪 vs 非贪婪

运行: python 02-groups-lookahead.py
"""

import re
from typing import Optional


# === 1. 捕获组 ===

def demo_capture_groups() -> None:
    """基础捕获组。"""
    print("--- 1. 捕获组 ---")

    date_text: str = "生日是 2000-03-15，入职日期是 2023-08-01"
    pattern: str = r"(\d{4})-(\d{2})-(\d{2})"

    for match in re.finditer(pattern, date_text):
        year, month, day = match.groups()
        print(f"[捕获组] {match.group(0)} -> 年={year} 月={month} 日={day}")


# === 2. 命名分组 ===

def demo_named_groups() -> None:
    """命名分组比 group(1) 更可读。"""
    print("\n--- 2. 命名分组 ---")

    log: str = "[2024-01-15 10:30:45] ERROR myapp.db: Connection lost"
    pattern: str = (
        r"\[(?P<timestamp>[^\]]+)\]\s+"
        r"(?P<level>\w+)\s+"
        r"(?P<module>[\w.]+):\s+"
        r"(?P<message>.+)"
    )

    match: Optional[re.Match[str]] = re.search(pattern, log)
    if match:
        d = match.groupdict()
        print(f"[命名分组] timestamp: {d['timestamp']}")
        print(f"[命名分组] level:     {d['level']}")
        print(f"[命名分组] module:    {d['module']}")
        print(f"[命名分组] message:   {d['message']}")


# === 3. 非捕获分组 ===

def demo_non_capture() -> None:
    """(?:...) 分组但不捕获。"""
    print("\n--- 3. 非捕获分组 ---")

    text: str = "http://a.com https://b.org ftp://c.net"

    # ❌ 捕获分组：findall 只返回组内容
    with_capture: list[str] = re.findall(r"(https?|ftp)://[\w.]+", text)
    print(f"[捕获组]   findall: {with_capture}")  # ['http', 'https', 'ftp']

    # ✅ 非捕获分组：findall 返回完整匹配
    without_capture: list[str] = re.findall(r"(?:https?|ftp)://[\w.]+", text)
    print(f"[非捕获组] findall: {without_capture}")  # 完整 URL


# === 4. 贪婪 vs 非贪婪 ===

def demo_greedy_vs_lazy() -> None:
    """贪婪匹配 vs 非贪婪匹配。"""
    print("\n--- 4. 贪婪 vs 非贪婪 ---")

    html: str = '<div class="a">text1</div><div class="b">text2</div>'

    # ❌ 贪婪：吃掉尽可能多
    greedy: list[str] = re.findall(r"<div.*>", html)
    print(f"[贪婪]   {greedy}")

    # ✅ 非贪婪：吃掉尽可能少
    lazy: list[str] = re.findall(r"<div.*?>", html)
    print(f"[非贪婪] {lazy}")

    # 提取标签内容
    greedy_content: list[str] = re.findall(r"<div.*?>(.*?)</div>", html)
    print(f"[内容提取] {greedy_content}")  # ['text1', 'text2']


# === 5. 正向前瞻 (?=...) ===

def demo_positive_lookahead() -> None:
    """匹配后面跟着特定模式的位置。"""
    print("\n--- 5. 正向前瞻 ---")

    text: str = "100px 200em 300px 50% 400rem"

    # 找到后面跟着 px 的数字
    px_values: list[str] = re.findall(r"\d+(?=px)", text)
    print(f"[正向前瞻] px 值: {px_values}")  # ['100', '300']

    # 找到后面跟着 % 的数字
    percent_values: list[str] = re.findall(r"\d+(?=%)", text)
    print(f"[正向前瞻] % 值: {percent_values}")  # ['50']

    # 密码强度：至少包含一个数字和一个大写字母
    passwords: list[str] = ["abc123", "Abc123", "abcdef", "ABC123"]
    strong_pattern = re.compile(r"^(?=.*[A-Z])(?=.*\d).{6,}$")
    for pwd in passwords:
        is_strong: bool = strong_pattern.match(pwd) is not None
        print(f"[密码强度] '{pwd}' -> {'强' if is_strong else '弱'}")


# === 6. 负向前瞻 (?!...) ===

def demo_negative_lookahead() -> None:
    """匹配后面不跟着特定模式的位置。"""
    print("\n--- 6. 负向前瞻 ---")

    # 匹配不以 .test.js 结尾的 .js 文件
    files: list[str] = ["app.js", "app.test.js", "utils.js", "utils.test.js", "main.js"]
    pattern = re.compile(r"^(?!.*\.test\.js$).*\.js$")

    for f in files:
        is_source: bool = pattern.match(f) is not None
        print(f"[负向前瞻] {f:<16} -> {'源文件' if is_source else '测试文件'}")


# === 7. 正向后顾 (?<=...) ===

def demo_positive_lookbehind() -> None:
    """匹配前面是特定模式的位置。"""
    print("\n--- 7. 正向后顾 ---")

    text: str = "Price: $42.99, Discount: $10.00, Tax: $3.50"

    # 找到 $ 后面的金额
    amounts: list[str] = re.findall(r"(?<=\$)\d+\.\d{2}", text)
    print(f"[正向后顾] 金额: {amounts}")  # ['42.99', '10.00', '3.50']

    # 找到冒号后面的值
    values: list[str] = re.findall(r"(?<=:\s)\$[\d.]+", text)
    print(f"[正向后顾] 冒号后的值: {values}")


# === 8. 负向后顾 (?<!...) ===

def demo_negative_lookbehind() -> None:
    """匹配前面不是特定模式的位置。"""
    print("\n--- 8. 负向后顾 ---")

    text: str = "Mr. Smith, Dr. Jones, Alice, Prof. Brown, Bob"

    # 匹配没有头衔的名字（前面不是 Mr./Dr./Prof. ）
    # 注意：后顾要求固定长度，这里简化处理
    names: list[str] = re.findall(r"(?<![A-Z][a-z]\.\s)(?<![A-Z][a-z][a-z][a-z]\.\s)\b[A-Z][a-z]+\b", text)
    print(f"[负向后顾] 名字: {names}")


# === 主程序 ===

if __name__ == "__main__":
    print("=" * 60)
    print("分组、前瞻与后顾断言示例")
    print("=" * 60)

    demo_capture_groups()
    demo_named_groups()
    demo_non_capture()
    demo_greedy_vs_lazy()
    demo_positive_lookahead()
    demo_negative_lookahead()
    demo_positive_lookbehind()
    demo_negative_lookbehind()
