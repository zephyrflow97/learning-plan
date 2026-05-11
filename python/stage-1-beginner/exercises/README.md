# 缁冧範棰橀泦 鈥?Stage 1 缁煎悎缁冧範

> *"I hear and I forget. I see and I remember. I do and I understand."*
> 鈥?Confucius

20 閬撶紪绋嬬粌涔犻锛岄毦搴﹂€掑锛屾兜鐩?Stage 1 鎵€鏈夌煡璇嗙偣銆?
## 鍩虹璇硶锛?-5锛?
### 缁冧範 1锛氭俯搴﹁浆鎹㈠櫒

缂栧啓鍑芥暟 `celsius_to_fahrenheit(c)` 鍜?`fahrenheit_to_celsius(f)`銆?
```python
# 鍏紡: F = C * 9/5 + 32
#        C = (F - 32) * 5/9
```

<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def celsius_to_fahrenheit(c: float) -> float:
    return c * 9 / 5 + 32

def fahrenheit_to_celsius(f: float) -> float:
    return (f - 32) * 5 / 9

print(f"0°C = {celsius_to_fahrenheit(0):.1f}°F")
print(f"100°C = {celsius_to_fahrenheit(100):.1f}°F")
print(f"72°F = {fahrenheit_to_celsius(72):.1f}°C")
```

</details>

---

### 缁冧範 2锛氬洖鏂囧垽鏂?
缂栧啓鍑芥暟 `is_palindrome(s)`锛屽垽鏂瓧绗︿覆鏄惁涓哄洖鏂囷紙蹇界暐澶у皬鍐欏拰绌烘牸锛夈€?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def is_palindrome(s: str) -> bool:
    cleaned = s.lower().replace(" ", "")
    return cleaned == cleaned[::-1]

print(is_palindrome("racecar"))          # True
print(is_palindrome("A man a plan a canal Panama".replace(" ", "")))  # True
print(is_palindrome("hello"))             # False
```

</details>

---

### 缁冧範 3锛氱寽鏁板瓧娓告垙

瀹炵幇涓€涓寽鏁板瓧娓告垙锛氶殢鏈虹敓鎴?1-100 鐨勬暟瀛楋紝鐢ㄦ埛杈撳叆鐚滄祴锛岀▼搴忔彁绀?澶ぇ"鎴?澶皬"銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
import random

def guess_number() -> None:
    target = random.randint(1, 100)
    attempts = 0

    print("[鐚滄暟瀛梋 鎴戞兂浜嗕竴涓?1-100 鐨勬暟瀛楋紝璇风寽锛?)
    while True:
        try:
            guess = int(input("浣犵殑鐚滄祴: "))
            attempts += 1
        except ValueError:
            print("[鐚滄暟瀛梋 璇疯緭鍏ユ暟瀛楋紒")
            continue

        if guess < target:
            print("[鐚滄暟瀛梋 澶皬浜嗭紒")
        elif guess > target:
            print("[鐚滄暟瀛梋 澶ぇ浜嗭紒")
        else:
            print(f"[鐚滄暟瀛梋 鎭枩锛佺瓟妗堟槸 {target}锛屼綘鐢ㄤ簡 {attempts} 娆?)
            break

# guess_number()  # 鍙栨秷娉ㄩ噴鏉ヨ繍琛?```

</details>

---

### 缁冧範 4锛欶izzBuzz

鎵撳嵃 1-100锛? 鐨勫€嶆暟鎵撳嵃 Fizz锛? 鐨勫€嶆暟鎵撳嵃 Buzz锛?5 鐨勫€嶆暟鎵撳嵃 FizzBuzz銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def fizzbuzz(n: int) -> list[str]:
    return [
        "FizzBuzz" if i % 15 == 0
        else "Fizz" if i % 3 == 0
        else "Buzz" if i % 5 == 0
        else str(i)
        for i in range(1, n + 1)
    ]

for item in fizzbuzz(20):
    print(item, end=" ")
print()
```

</details>

---

### 缁冧範 5锛氬瓧绗︾粺璁?
缂栧啓鍑芥暟缁熻瀛楃涓蹭腑姣忎釜瀛楃鍑虹幇鐨勬鏁帮紝杩斿洖瀛楀吀銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
from collections import Counter

def char_count(s: str) -> dict[str, int]:
    return dict(Counter(s.lower()))

result = char_count("Hello World")
print(result)
# 涔熷彲浠ヤ笉鐢?Counter:
def char_count_manual(s: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for c in s.lower():
        counts[c] = counts.get(c, 0) + 1
    return counts
```

</details>

---

## 鏁版嵁缁撴瀯锛?-10锛?
### 缁冧範 6锛氬幓閲嶅苟淇濆簭

缂栧啓鍑芥暟锛屼粠鍒楄〃涓幓闄ら噸澶嶅厓绱狅紝鍚屾椂淇濇寔鍘熸湁椤哄簭銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def unique_ordered(items: list) -> list:
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

print(unique_ordered([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]))
# [3, 1, 4, 5, 9, 2, 6]

# Python 3.7+ dict 淇濆簭鐨勬妧宸?
def unique_ordered_v2(items: list) -> list:
    return list(dict.fromkeys(items))
```

</details>

---

### 缁冧範 7锛氱煩闃佃浆缃?
鐢ㄦ帹瀵煎紡瀹炵幇鐭╅樀杞疆銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def transpose(matrix: list[list]) -> list[list]:
    return [[row[i] for row in matrix] for i in range(len(matrix[0]))]

m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(transpose(m))
# [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
```

</details>

---

### 缁冧範 8锛氳瘝棰戠粺璁?Top N

缁欏畾涓€娈垫枃鏈紝杩斿洖鍑虹幇棰戠巼鏈€楂樼殑 N 涓崟璇嶃€?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
from collections import Counter

def top_words(text: str, n: int = 5) -> list[tuple[str, int]]:
    words = text.lower().split()
    return Counter(words).most_common(n)

text = "the quick brown fox jumps over the lazy dog the fox the dog"
print(top_words(text, 3))
# [('the', 3), ('fox', 2), ('dog', 2)]
```

</details>

---

### 缁冧範 9锛氬垎缁勭粺璁?
缁欏畾瀛︾敓鍒楄〃 `[(name, score)]`锛屾寜鎴愮哗绛夌骇鍒嗙粍骞惰绠楁瘡缁勫钩鍧囧垎銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
from collections import defaultdict

def grade_stats(students: list[tuple[str, int]]) -> dict:
    groups = defaultdict(list)
    for name, score in students:
        if score >= 90: grade = "A"
        elif score >= 80: grade = "B"
        elif score >= 70: grade = "C"
        else: grade = "D"
        groups[grade].append(score)

    return {
        grade: {"count": len(scores), "avg": sum(scores) / len(scores)}
        for grade, scores in sorted(groups.items())
    }

students = [("Alice", 95), ("Bob", 87), ("Charlie", 72),
            ("David", 63), ("Eve", 91), ("Frank", 85)]
for grade, stats in grade_stats(students).items():
    print(f"{grade}: {stats}")
```

</details>

---

### 缁冧範 10锛氫袱涓垪琛ㄧ殑瀵圭О宸?
鎵惧嚭鍙睘浜庡叾涓竴涓垪琛ㄧ殑鍏冪礌銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def symmetric_diff(a: list, b: list) -> list:
    return list(set(a) ^ set(b))

print(symmetric_diff([1, 2, 3, 4], [3, 4, 5, 6]))
# [1, 2, 5, 6]
```

</details>

---

## 鍑芥暟涓庡紓甯革紙11-15锛?
### 缁冧範 11锛氬畨鍏ㄩ櫎娉?
缂栧啓 `safe_divide`锛屽鐞嗛櫎闆跺拰绫诲瀷閿欒銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def safe_divide(a, b, default=None):
    try:
        return a / b
    except ZeroDivisionError:
        return default
    except TypeError:
        return default

print(safe_divide(10, 3))     # 3.333...
print(safe_divide(10, 0))     # None
print(safe_divide("a", 2))    # None
```

</details>

---

### 缁冧範 12锛氶€掑綊闃朵箻

鐢ㄩ€掑綊鍜岄潪閫掑綊涓ょ鏂瑰紡瀹炵幇闃朵箻銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def factorial_recursive(n: int) -> int:
    if n < 0:
        raise ValueError("n 涓嶈兘涓鸿礋")
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)

def factorial_iterative(n: int) -> int:
    if n < 0:
        raise ValueError("n 涓嶈兘涓鸿礋")
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

import math
for n in [0, 1, 5, 10]:
    assert factorial_recursive(n) == math.factorial(n)
    assert factorial_iterative(n) == math.factorial(n)
print("鎵€鏈夋祴璇曢€氳繃锛?)
```

</details>

---

### 缁冧範 13锛氳楗板櫒鍏ラ棬

缂栧啓涓€涓?`timer` 瑁呴グ鍣紝鎵撳嵃鍑芥暟鎵ц鏃堕棿銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[timer] {func.__name__} 鑰楁椂: {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(0.1)
    return "done"

slow_function()
```

</details>

---

### 缁冧範 14锛氳嚜瀹氫箟寮傚父

涓哄浘涔︾鐞嗙郴缁熷垱寤哄紓甯革細`BookNotFoundError`, `BookAlreadyExistsError`銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
class LibraryError(Exception):
    pass

class BookNotFoundError(LibraryError):
    def __init__(self, isbn: str):
        super().__init__(f"鍥句功涓嶅瓨鍦? ISBN {isbn}")

class BookAlreadyExistsError(LibraryError):
    def __init__(self, isbn: str):
        super().__init__(f"鍥句功宸插瓨鍦? ISBN {isbn}")

class Library:
    def __init__(self):
        self.books: dict[str, str] = {}

    def add(self, isbn: str, title: str) -> None:
        if isbn in self.books:
            raise BookAlreadyExistsError(isbn)
        self.books[isbn] = title

    def get(self, isbn: str) -> str:
        if isbn not in self.books:
            raise BookNotFoundError(isbn)
        return self.books[isbn]

lib = Library()
lib.add("978-0", "Python Crash Course")
try:
    lib.get("000-0")
except BookNotFoundError as e:
    print(e)
```

</details>

---

### 缁冧範 15锛氶棴鍖呰鏁板櫒

瀹炵幇涓€涓棴鍖呭伐鍘?`make_counter`锛屾敮鎸佸銆佸噺銆佽幏鍙栥€侀噸缃€?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def make_counter(initial: int = 0):
    count = initial

    def increment(n: int = 1) -> int:
        nonlocal count
        count += n
        return count

    def decrement(n: int = 1) -> int:
        nonlocal count
        count -= n
        return count

    def get() -> int:
        return count

    def reset() -> int:
        nonlocal count
        count = initial
        return count

    return {"inc": increment, "dec": decrement, "get": get, "reset": reset}

c = make_counter(10)
print(c["inc"]())     # 11
print(c["inc"](5))    # 16
print(c["dec"](3))    # 13
print(c["get"]())     # 13
print(c["reset"]())   # 10
```

</details>

---

## Pythonic锛?6-20锛?
### 缁冧範 16锛歅ythonic 鏀瑰啓

灏嗕互涓嬩唬鐮佹敼鍐欎负鏈€ Pythonic 鐨勭増鏈細

```python
# 鍘熷浠ｇ爜
result = []
i = 0
while i < len(numbers):
    if numbers[i] > 0:
        result.append(numbers[i] ** 2)
    i += 1
```

<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
result = [n**2 for n in numbers if n > 0]
```

</details>

---

### 缁冧範 17锛氭墎骞冲寲宓屽鍒楄〃

缂栧啓鍑芥暟灏嗕换鎰忔繁搴︾殑宓屽鍒楄〃灞曞钩銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def flatten(nested) -> list:
    result = []
    for item in nested:
        if isinstance(item, (list, tuple)):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

print(flatten([1, [2, 3], [4, [5, 6]], 7]))
# [1, 2, 3, 4, 5, 6, 7]
```

</details>

---

### 缁冧範 18锛氶摼寮忓瓧鍏告煡鎵?
瀹炵幇 `get_nested(data, *keys, default=None)`锛屽畨鍏ㄨ幏鍙栧祵濂楀瓧鍏哥殑鍊笺€?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def get_nested(data: dict, *keys, default=None):
    current = data
    for key in keys:
        try:
            current = current[key]
        except (KeyError, TypeError, IndexError):
            return default
    return current

data = {"a": {"b": {"c": 42}}}
print(get_nested(data, "a", "b", "c"))           # 42
print(get_nested(data, "a", "x", default="N/A"))  # N/A
```

</details>

---

### 缁冧範 19锛氱閬撳嚱鏁?
瀹炵幇 `pipe(value, *functions)`锛屽皢鍊间緷娆￠€氳繃澶氫釜鍑芥暟銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
from functools import reduce

def pipe(value, *functions):
    return reduce(lambda v, f: f(v), functions, value)

result = pipe(
    "  Hello, World!  ",
    str.strip,
    str.lower,
    lambda s: s.replace("world", "python"),
)
print(result)  # "hello, python!"
```

</details>

---

### 缁冧範 20锛氱畝鏄?CSV 瑙ｆ瀽鍣?
涓嶄娇鐢?csv 妯″潡锛屾墜鍔ㄨВ鏋?CSV 瀛楃涓诧紝杩斿洖瀛楀吀鍒楄〃銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def parse_csv(csv_text: str) -> list[dict[str, str]]:
    lines = csv_text.strip().split("\n")
    if not lines:
        return []
    headers = [h.strip() for h in lines[0].split(",")]
    return [
        dict(zip(headers, [v.strip() for v in line.split(",")]))
        for line in lines[1:]
    ]

csv_data = \"\"\"name, age, city
Alice, 30, Beijing
Bob, 25, Shanghai
Charlie, 35, Guangzhou\"\"\"

for row in parse_csv(csv_data):
    print(row)
```

</details>

---

## 瀹屾垚鏍囧噯

- [ ] 瀹屾垚鎵€鏈?20 閬撻
- [ ] 涓嶇湅绛旀鑳界嫭绔嬪畬鎴?16 閬撲互涓?- [ ] 鐞嗚В姣忛亾棰樼殑 Pythonic 瑙ｆ硶
- [ ] 鑳借В閲婁负浠€涔?Pythonic 鍐欐硶鏇村ソ

---

## 涓嬩竴姝?
瀹屾垚缁冧範鍚庯紝鎸戞垬瀹炴垬椤圭洰锛?
**[馃憠 瀹炴垬椤圭洰锛欳LI 浠诲姟绠＄悊鍣╙(../projects/cli-task-manager/)**