"""
正则表达式基础示例。

演示 re 模块的核心函数和基本语法：
- match, search, findall, finditer
- sub, split
- 字符类、量词、锚点

运行: python 01-basics.py
"""

import re
from typing import Optional


# === 1. match vs search vs findall ===

def demo_match_search_findall() -> None:
    """对比三个核心函数。"""
    text: str = "Order #12345: 3 items, total $99.50"

    # match: 从开头匹配
    m1: Optional[re.Match[str]] = re.match(r"\d+", text)
    print(f"[match] 匹配数字: {m1}")  # None (开头是 'Order')

    m2: Optional[re.Match[str]] = re.match(r"Order", text)
    print(f"[match] 匹配 Order: {m2 and m2.group()}")  # 'Order'

    # search: 搜索第一个匹配
    s1: Optional[re.Match[str]] = re.search(r"\d+", text)
    print(f"[search] 第一个数字: {s1 and s1.group()}")  # '12345'

    # findall: 搜索所有匹配
    all_numbers: list[str] = re.findall(r"\d+\.?\d*", text)
    print(f"[findall] 所有数字: {all_numbers}")  # ['12345', '3', '99.50']

    # finditer: 返回迭代器
    print("[finditer] 逐个匹配:")
    for m in re.finditer(r"\d+\.?\d*", text):
        print(f"  位置 {m.start()}-{m.end()}: '{m.group()}'")


# === 2. sub 替换 ===

def demo_sub() -> None:
    """演示正则替换。"""
    # 简单替换
    text: str = "Hello   World   Python"
    cleaned: str = re.sub(r"\s+", " ", text)
    print(f"[sub] 压缩空白: '{cleaned}'")

    # 脱敏：隐藏手机号中间 4 位
    phone: str = "联系方式: 138-1234-5678"
    masked: str = re.sub(r"(\d{3})-\d{4}-(\d{4})", r"\1-****-\2", phone)
    print(f"[sub] 脱敏手机号: '{masked}'")

    # 函数替换：单词首字母大写
    sentence: str = "hello world from python"
    titled: str = re.sub(r"\b\w", lambda m: m.group().upper(), sentence)
    print(f"[sub] 首字母大写: '{titled}'")


# === 3. split 分割 ===

def demo_split() -> None:
    """演示正则分割。"""
    # 按多种分隔符分割
    text: str = "apple,banana;cherry orange|grape"
    parts: list[str] = re.split(r"[,;\s|]+", text)
    print(f"[split] 多分隔符: {parts}")

    # 按句子分割（句号、问号、感叹号）
    paragraph: str = "Hello! How are you? I'm fine. Thanks!"
    sentences: list[str] = re.split(r"[.!?]\s*", paragraph)
    sentences = [s for s in sentences if s]  # 去除空字符串
    print(f"[split] 句子: {sentences}")


# === 4. 字符类与量词 ===

def demo_character_classes() -> None:
    """演示字符类和量词。"""
    text: str = "My email is user.name+tag@example.com and phone is 010-1234-5678"

    # \d 数字
    digits: list[str] = re.findall(r"\d+", text)
    print(f"[字符类] 数字序列: {digits}")

    # \w 单词字符
    words: list[str] = re.findall(r"\w+", text)
    print(f"[字符类] 单词: {words}")

    # 自定义字符类
    vowels: list[str] = re.findall(r"[aeiouAEIOU]", text)
    print(f"[字符类] 元音: {vowels} (共 {len(vowels)} 个)")

    # 量词示例
    test: str = "aab aaab ab aaaab b"
    print(f"[量词] a+b:    {re.findall(r'a+b', test)}")
    print(f"[量词] a*b:    {re.findall(r'a*b', test)}")
    print(f"[量词] a?b:    {re.findall(r'a?b', test)}")
    print(f"[量词] a{{2}}b:  {re.findall(r'a{2}b', test)}")
    print(f"[量词] a{{2,3}}b: {re.findall(r'a{2,3}b', test)}")


# === 5. 锚点 ===

def demo_anchors() -> None:
    """演示锚点。"""
    lines: list[str] = [
        "ERROR: disk full",
        "INFO: all good",
        "ERROR: network down",
        "WARNING: high load",
    ]

    # ^ 行首匹配
    errors: list[str] = [line for line in lines if re.match(r"^ERROR", line)]
    print(f"[锚点] ERROR 开头的行: {errors}")

    # \b 单词边界
    text: str = "cat catalog scattered wildcat"
    standalone_cat: list[str] = re.findall(r"\bcat\b", text)
    all_cat: list[str] = re.findall(r"cat", text)
    print(f"[锚点] 独立的 'cat': {standalone_cat}")  # ['cat']
    print(f"[锚点] 所有 'cat': {all_cat}")            # ['cat', 'cat', 'cat', 'cat']

    # fullmatch: 完整匹配
    is_hex: bool = re.fullmatch(r"[0-9a-fA-F]+", "1a2b3c") is not None
    not_hex: bool = re.fullmatch(r"[0-9a-fA-F]+", "1a2bGz") is not None
    print(f"[锚点] '1a2b3c' 是十六进制? {is_hex}")
    print(f"[锚点] '1a2bGz' 是十六进制? {not_hex}")


# === 主程序 ===

if __name__ == "__main__":
    print("=" * 60)
    print("正则表达式基础示例")
    print("=" * 60)

    demo_match_search_findall()
    print()
    demo_sub()
    print()
    demo_split()
    print()
    demo_character_classes()
    print()
    demo_anchors()
