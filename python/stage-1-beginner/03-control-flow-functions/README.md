# 绗?3 绔狅細鎺у埗娴佷笌鍑芥暟 鈥?璁╀唬鐮佸浼氭€濊€冨拰缁勭粐

> *"Flat is better than nested."*
> 鈥?The Zen of Python, Line 5
>
> 绋嬪簭鐨勬湰璐ㄦ槸浠€涔堬紵杈撳叆鏁版嵁锛屽仛鍑哄喅绛栵紝鎵ц鎿嶄綔锛岃緭鍑虹粨鏋溿€?> 鎺у埗娴佹槸绋嬪簭鐨?澶ц剳"鈥斺€斿畠鍐冲畾璧板摢鏉¤矾锛涘嚱鏁版槸绋嬪簭鐨?鍣ㄥ畼"鈥斺€旀瘡涓櫒瀹樺悇鍙稿叾鑱屻€?> 瀛︿細鎺у埗娴佸拰鍑芥暟锛屼綘灏卞浼氫簡缂栫▼鐨勬牳蹇冩妧鑳姐€?
## 馃摉 鏈珷鍐呭

- [1. 鏉′欢璇彞](#1-鏉′欢璇彞)
- [2. 寰幆](#2-寰幆)
- [3. 鎺ㄥ寮廬(#3-鎺ㄥ寮?
- [4. 鍑芥暟瀹氫箟](#4-鍑芥暟瀹氫箟)
- [5. 涓€绛夊叕姘戝嚱鏁癩(#5-涓€绛夊叕姘戝嚱鏁?
- [6. LEGB 浣滅敤鍩熻鍒橾(#6-legb-浣滅敤鍩熻鍒?
- [7. 闂寘](#7-闂寘)
- [8. 娴疯薄杩愮畻绗?:=](#8-娴疯薄杩愮畻绗?)
- [浠ｇ爜绀轰緥](#浠ｇ爜绀轰緥)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [甯歌闄烽槺](#甯歌闄烽槺)
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?
- [涓嬩竴姝(#涓嬩竴姝?

---

## 1. 鏉′欢璇彞

> 馃幁 **The Drama: Python 鐨勬潯浠惰鍙モ€斺€斾紭闆呯殑鍑忔硶**
>
> C/Java: `if (condition) { ... } else if (condition) { ... } else { ... }`
> Python: `if condition: ... elif condition: ... else: ...`
>
> 娌℃湁鎷彿锛屾病鏈夎姳鎷彿锛屾病鏈夊垎鍙枫€侾ython 閫氳繃**缂╄繘**鏉ュ畾涔変唬鐮佸潡銆?> 杩欎笉鏄伔鎳掆€斺€旇繖鏄竴绉嶅摬瀛︼細濡傛灉缂╄繘宸茬粡琛ㄨ揪浜嗙粨鏋勶紝涓轰粈涔堣繕瑕侀噸澶嶇敤鑺辨嫭鍙疯〃杈句竴閬嶏紵

### 1.1 if / elif / else

```python
# 鍩烘湰鏉′欢璇彞
score = 85

if score >= 90:
    grade = "A"
    print("[鎺у埗娴乚 浼樼锛?)
elif score >= 80:
    grade = "B"
    print("[鎺у埗娴乚 鑹ソ")
elif score >= 70:
    grade = "C"
    print("[鎺у埗娴乚 涓瓑")
elif score >= 60:
    grade = "D"
    print("[鎺у埗娴乚 鍙婃牸")
else:
    grade = "F"
    print("[鎺у埗娴乚 涓嶅強鏍?)

print(f"[鎺у埗娴乚 鍒嗘暟: {score}, 绛夌骇: {grade}")
```

### 1.2 涓夊厓琛ㄨ揪寮忥紙鏉′欢琛ㄨ揪寮忥級

```python
# 璇硶: value_if_true if condition else value_if_false
age = 20
status = "鎴愬勾" if age >= 18 else "鏈垚骞?

# 鉁?閫傚悎绠€鍗曠殑浜岄€変竴
result = "鍋舵暟" if x % 2 == 0 else "濂囨暟"

# 鉂?涓嶈宓屽涓夊厓琛ㄨ揪寮忥紙鍙读鎬ф瀬宸級
# grade = "A" if s >= 90 else "B" if s >= 80 else "C" if s >= 70 else "F"
```

### 1.3 閾惧紡姣旇緝锛圥ython 鐗规湁锛?
```python
# Python 鏀寔閾惧紡姣旇緝锛屽叾浠栬瑷€闇€瑕佺敤 and 杩炴帴
x = 5
print(1 < x < 10)     # True锛岀瓑浠蜂簬 1 < x and x < 10
print(1 < x < 3)      # False
print(0 <= x <= 100)   # True
```

### 1.4 match-case锛圥ython 3.10+锛?
> 馃寣 **The Big Picture: 缁撴瀯鍖栨ā寮忓尮閰嶇殑璇炵敓**
>
> Python 鍦?3.10 鐗堟湰寮曞叆浜?`match-case`锛圥EP 634锛夈€傝繖涓嶆槸绠€鍗曠殑 switch-case鈥斺€?> 瀹冩槸**缁撴瀯鍖栨ā寮忓尮閰?*锛屽彲浠ヨВ鏋勬暟鎹粨鏋勩€佺粦瀹氬彉閲忋€佹坊鍔犲畧鍗潯浠躲€?> 鐏垫劅鏉ヨ嚜 Rust 鐨?`match`銆丼cala 鐨勬ā寮忓尮閰嶅拰 Erlang 鐨勬ā寮忓尮閰嶃€?
```python
# 鍩烘湰妯″紡鍖归厤
def handle_command(command: str) -> str:
    match command:
        case "quit" | "exit":       # 鎴栨ā寮?            return "閫€鍑虹▼搴?
        case "help":
            return "鏄剧ず甯姪"
        case _:                     # 閫氶厤绗︼紙榛樿鍒嗘敮锛?            return f"鏈煡鍛戒护: {command}"

# 瑙ｆ瀯妯″紡鍖归厤
def describe_point(point: tuple) -> str:
    match point:
        case (0, 0):
            return "鍘熺偣"
        case (x, 0):
            return f"x 杞翠笂, x={x}"
        case (0, y):
            return f"y 杞翠笂, y={y}"
        case (x, y) if x == y:     # 瀹堝崼鏉′欢
            return f"瀵硅绾夸笂, ({x}, {y})"
        case (x, y):
            return f"鐐?({x}, {y})"
```

| 瀵规瘮 | `if/elif` | `match-case` |
|------|-----------|-------------|
| Python 鐗堟湰 | 鎵€鏈夌増鏈?| 3.10+ |
| 鍊煎尮閰?| 鉁?| 鉁?|
| 瑙ｆ瀯 | 鉂?闇€瑕佹墜鍔?| 鉁?鍐呯疆鏀寔 |
| 瀹堝崼鏉′欢 | 鉁?| 鉁?(`if` 瀹堝崼) |
| 绫诲瀷妫€鏌?| 闇€瑕?isinstance | 鉁?绫绘ā寮?|
| 閫傜敤鍦烘櫙 | 绠€鍗曟潯浠?| 澶嶆潅鏁版嵁缁撴瀯鍖归厤 |

---

## 2. 寰幆

### 2.1 for...in 寰幆

> 馃 **CS Master's Bridge: Python 鐨?for 涓嶆槸 C 鐨?for**
>
> C 鐨?`for (int i = 0; i < n; i++)` 鏄竴涓甫鏈夊垵濮嬪寲銆佹潯浠躲€侀€掑鐨勯€氱敤寰幆銆?> Python 鐨?`for x in iterable` 鏄竴涓?*杩唬鍣ㄥ崗璁?*鈥斺€斿畠閬嶅巻鍙凯浠ｅ璞′腑鐨勬瘡涓厓绱犮€?> Python 娌℃湁 C 椋庢牸鐨?for 寰幆銆傚鏋滀綘鎯宠绱㈠紩锛岀敤 `enumerate()`锛涙兂瑕佹暟瀛楀簭鍒楋紝鐢?`range()`銆?
```python
# 閬嶅巻鍒楄〃
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"[寰幆] {fruit}")

# 閬嶅巻瀛楀吀
person = {"name": "Alice", "age": 30, "city": "鍖椾含"}
for key, value in person.items():
    print(f"[寰幆] {key}: {value}")

# range() 鈥?鐢熸垚鏁板瓧搴忓垪
for i in range(5):          # 0, 1, 2, 3, 4
    print(i, end=" ")

for i in range(2, 10, 2):   # 2, 4, 6, 8锛堣捣濮? 缁撴潫, 姝ラ暱锛?    print(i, end=" ")
```

### 2.2 enumerate() 鍜?zip()

```python
# enumerate() 鈥?鍚屾椂鑾峰彇绱㈠紩鍜屽€?fruits = ["apple", "banana", "cherry"]

# 鉂?涓?Pythonic
for i in range(len(fruits)):
    print(f"{i}: {fruits[i]}")

# 鉁?Pythonic
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# zip() 鈥?骞惰閬嶅巻
names = ["Alice", "Bob", "Charlie"]
scores = [95, 87, 72]
for name, score in zip(names, scores):
    print(f"{name}: {score}鍒?)

# zip() 浠ユ渶鐭簭鍒椾负鍑?# 濡傛灉闇€瑕佷互鏈€闀夸负鍑嗭紝浣跨敤 itertools.zip_longest
from itertools import zip_longest
for a, b in zip_longest([1, 2], [10, 20, 30], fillvalue=0):
    print(f"({a}, {b})")  # (1,10) (2,20) (0,30)
```

### 2.3 while 寰幆

```python
# 鍩烘湰 while 寰幆
count = 5
while count > 0:
    print(f"[寰幆] 鍊掕鏃? {count}")
    count -= 1

# while True + break 妯″紡
while True:
    user_input = input("杈撳叆鍛戒护 (quit 閫€鍑?: ")
    if user_input == "quit":
        break
    print(f"[寰幆] 澶勭悊: {user_input}")
```

### 2.4 break銆乧ontinue 鍜?for...else

```python
# for...else 鈥?寰幆姝ｅ父瀹屾垚鏃舵墽琛?else
# else 鍦ㄥ惊鐜病鏈夎 break 涓柇鏃舵墽琛?n = 17
for i in range(2, int(n**0.5) + 1):
    if n % i == 0:
        print(f"{n} 涓嶆槸璐ㄦ暟锛屽洜瀛? {i}")
        break
else:
    print(f"{n} 鏄川鏁?)  # 寰幆娌¤ break 鈫?鏄川鏁?```

| 瀵规瘮 | `for` 寰幆 | `while` 寰幆 |
|------|-----------|-------------|
| 閫傜敤鍦烘櫙 | 宸茬煡杩唬娆℃暟/閬嶅巻闆嗗悎 | 鏈煡杩唬娆℃暟/鏉′欢鎺у埗 |
| 璇硶 | `for x in iterable` | `while condition` |
| 璁℃暟鍣?| 鑷姩锛堥€氳繃 enumerate锛?| 鎵嬪姩绠＄悊 |
| 鏃犻檺寰幆 | 涓嶆敮鎸?| `while True` |
| 鎺ㄨ崘搴?| 鉁?浼樺厛浣跨敤 | 浠呭湪 for 涓嶉€傜敤鏃?|

---

## 3. 鎺ㄥ寮?
> 馃幁 **The Drama: 鎺ㄥ寮?鈥?Python 鏈€浼橀泤鐨勬鍣?*
>
> 鎺ㄥ寮忎笉鍙槸璇硶绯栤€斺€斿畠琛ㄨ揪浜?*鎰忓浘**锛氫粠搴忓垪涓瓫閫夊苟杞崲锛屽緱鍒版柊搴忓垪銆?> 寰幆琛ㄨ揪鐨勬槸**姝ラ**锛氬垵濮嬪寲銆侀亶鍘嗐€佸垽鏂€佽拷鍔犮€?> 褰撲綘鐢ㄦ帹瀵煎紡鏃讹紝璇昏€呬竴鐪肩煡閬撶粨鏋滄槸浠€涔堬紱鐢ㄥ惊鐜椂锛屽繀椤诲湪鑴戜腑"鎵ц"浠ｇ爜銆?
### 3.1 鍒楄〃鎺ㄥ寮?
```python
# 鍩烘湰璇硶: [琛ㄨ揪寮?for 鍙橀噺 in 鍙凯浠ｅ璞
squares = [x**2 for x in range(10)]

# 甯﹁繃婊? [琛ㄨ揪寮?for 鍙橀噺 in 鍙凯浠ｅ璞?if 鏉′欢]
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# 甯?if-else锛堟敞鎰忎綅缃紒锛?labels = ["鍋舵暟" if x % 2 == 0 else "濂囨暟" for x in range(6)]

# 宓屽鎺ㄥ寮?鈥?灞曞钩浜岀淮鍒楄〃
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in matrix for x in row]
```

### 3.2 瀛楀吀鎺ㄥ寮忎笌闆嗗悎鎺ㄥ寮?
```python
# 瀛楀吀鎺ㄥ寮? {閿? 鍊?for 鍙橀噺 in 鍙凯浠ｅ璞
squares_dict = {x: x**2 for x in range(6)}

# 鍙嶈浆瀛楀吀
original = {"a": 1, "b": 2, "c": 3}
reversed_dict = {v: k for k, v in original.items()}

# 闆嗗悎鎺ㄥ寮? {琛ㄨ揪寮?for 鍙橀噺 in 鍙凯浠ｅ璞
unique_lengths = {len(word) for word in ["hello", "world", "hi"]}
```

### 3.3 鐢熸垚鍣ㄨ〃杈惧紡

```python
# 鐢熸垚鍣ㄨ〃杈惧紡: (琛ㄨ揪寮?for 鍙橀噺 in 鍙凯浠ｅ璞?
# 鎯版€ф眰鍊硷紝涓嶄細涓€娆℃€х敓鎴愭墍鏈夊厓绱?gen = (x**2 for x in range(1000000))  # 鍑犱箮涓嶅崰鍐呭瓨
total = sum(x**2 for x in range(1000000))  # 鐩存帴浼犵粰鍑芥暟

# 鉁?澶ф暟鎹噺鏃剁敤鐢熸垚鍣ㄨ〃杈惧紡
# 鉂?澶ф暟鎹噺鏃剁敤鍒楄〃鎺ㄥ寮忥紙鍗犵敤澶ч噺鍐呭瓨锛?```

| 鎺ㄥ寮忕被鍨?| 璇硶 | 缁撴灉绫诲瀷 | 閫傜敤鍦烘櫙 |
|-----------|------|---------|---------|
| 鍒楄〃鎺ㄥ寮?| `[expr for x in iter]` | `list` | 闇€瑕侀殢鏈鸿闂粨鏋?|
| 瀛楀吀鎺ㄥ寮?| `{k: v for x in iter}` | `dict` | 鏋勫缓閿€兼槧灏?|
| 闆嗗悎鎺ㄥ寮?| `{expr for x in iter}` | `set` | 闇€瑕佸幓閲?|
| 鐢熸垚鍣ㄨ〃杈惧紡 | `(expr for x in iter)` | `generator` | 澶ф暟鎹?鍙亶鍘嗕竴娆?|

---

## 4. 鍑芥暟瀹氫箟

### 4.1 鍩烘湰鍑芥暟瀹氫箟

```python
def greet(name: str) -> str:
    """闂€欏嚱鏁?""
    return f"浣犲ソ, {name}!"

# 澶氳繑鍥炲€硷紙杩斿洖鍏冪粍锛?def divmod_custom(a: int, b: int) -> tuple[int, int]:
    return a // b, a % b

quotient, remainder = divmod_custom(17, 5)
```

### 4.2 鍙傛暟绫诲瀷

```python
# 榛樿鍙傛暟
def power(base: float, exp: int = 2) -> float:
    return base ** exp

# 鍏抽敭瀛楀弬鏁?def connect(host: str, port: int = 3306, timeout: int = 30) -> str:
    return f"杩炴帴鍒?{host}:{port} (瓒呮椂: {timeout}s)"

connect("localhost", port=5432, timeout=5)

# 浠呴檺浣嶇疆鍙傛暟 (/) 鍜屼粎闄愬叧閿瓧鍙傛暟 (*)
def strict(pos_only, /, normal, *, kw_only):
    pass

strict(1, 2, kw_only=3)      # 鉁?# strict(pos_only=1, ...)     # 鉂?TypeError
```

### 4.3 *args 鍜?**kwargs

> 鈿涳笍 **The Science: *args 鍜?**kwargs 鐨勬湰璐?*
>
> `*args` 灏嗗浣欑殑**浣嶇疆鍙傛暟**鎵撳寘涓?*鍏冪粍 (tuple)**銆?> `**kwargs` 灏嗗浣欑殑**鍏抽敭瀛楀弬鏁?*鎵撳寘涓?*瀛楀吀 (dict)**銆?> 鍙傛暟椤哄簭锛歚def f(pos, /, normal, *args, kw_only, **kwargs)`

```python
# *args 鈥?鍙彉浣嶇疆鍙傛暟
def sum_all(*args: float) -> float:
    return sum(args)

sum_all(1, 2, 3)  # 6

# **kwargs 鈥?鍙彉鍏抽敭瀛楀弬鏁?def build_url(base: str, **kwargs: str) -> str:
    params = "&".join(f"{k}={v}" for k, v in kwargs.items())
    return f"{base}?{params}" if params else base

url = build_url("https://api.example.com", page="1", limit="10")

# 瑙ｅ寘璋冪敤
args = [1, 2, 3]
kwargs = {"sep": " + ", "end": "\n"}
print(*args, **kwargs)  # 1 + 2 + 3
```

### 4.4 Lambda 琛ㄨ揪寮?
```python
# lambda 鏄尶鍚嶇殑鍗曡〃杈惧紡鍑芥暟
square = lambda x: x**2

# 鏈€甯歌鐨勭敤閫旓細浣滀负鎺掑簭 key
students = [("Alice", 95), ("Bob", 87), ("Charlie", 72)]
sorted_students = sorted(students, key=lambda s: s[1], reverse=True)

# 鉁?lambda 閫傜敤锛氱畝鍗曘€佷竴娆℃€с€佸崟琛ㄨ揪寮?# 鉂?lambda 涓嶉€傜敤锛氬鏉傞€昏緫銆侀渶瑕佹枃妗ｃ€侀渶瑕佸鐢?```

---

## 5. 涓€绛夊叕姘戝嚱鏁?
> 馃 **Zen of Code: 鍑芥暟鏄竴绛夊叕姘?*
>
> 鍦?Python 涓紝鍑芥暟鍜?`int`銆乣str` 涓€鏍凤紝鏄竴涓櫘閫氱殑瀵硅薄銆?> 浣犲彲浠ユ妸鍑芥暟璧嬪€肩粰鍙橀噺銆佹斁杩涘垪琛ㄣ€佷紶缁欏彟涓€涓嚱鏁般€佷粠鍑芥暟涓繑鍥炪€?> 杩欐槸鍑芥暟寮忕紪绋嬬殑鍩虹锛屼篃鏄?Python 鐏垫椿鎬х殑閲嶈鏉ユ簮銆?
```python
# 鍑芥暟鍙互璧嬪€肩粰鍙橀噺
operation = add

# 鍑芥暟鍙互瀛樺湪鏁版嵁缁撴瀯涓?ops = {"+": lambda a, b: a + b, "-": lambda a, b: a - b}

# 鍑芥暟鍙互浣滀负鍙傛暟锛堥珮闃跺嚱鏁帮級
def apply_twice(func, value):
    return func(func(value))

# 鍑芥暟鍙互浣滀负杩斿洖鍊?def make_multiplier(n):
    def multiplier(x):
        return x * n
    return multiplier

double = make_multiplier(2)
print(double(5))  # 10
```

---

## 6. LEGB 浣滅敤鍩熻鍒?
> 馃 **CS Master's Bridge: 鍙橀噺鏌ユ壘鐨勫洓涓眰绾?*
>
> Python 鏌ユ壘鍙橀噺鍚嶆椂锛屾寜鐓?**LEGB** 椤哄簭鎼滅储锛?> 1. **L**ocal 鈥?褰撳墠鍑芥暟鍐呴儴
> 2. **E**nclosing 鈥?澶栧眰鍑芥暟锛堥棴鍖咃級
> 3. **G**lobal 鈥?妯″潡绾у埆
> 4. **B**uilt-in 鈥?Python 鍐呯疆锛坄print`銆乣len` 绛夛級

```python
global_var = "鍏ㄥ眬"

def outer():
    enclosing_var = "澶栧眰"

    def inner():
        local_var = "灞€閮?
        print(local_var)      # Local
        print(enclosing_var)  # Enclosing
        print(global_var)     # Global
        print(len("hello"))   # Built-in

    inner()

# global 鍜?nonlocal 鍏抽敭瀛?counter = 0
def increment():
    global counter
    counter += 1

def outer_counter():
    count = 0
    def inner():
        nonlocal count
        count += 1
        return count
    return inner
```

---

## 7. 闂寘

> 馃幁 **The Drama: 闂寘 鈥?鍑芥暟鐨?璁板繂"**
>
> 闂寘鏄竴涓嚱鏁帮紝瀹?璁颁綇"浜嗗畾涔夋椂鎵€鍦ㄧ幆澧冧腑鐨勫彉閲忊€斺€斿嵆浣块偅涓幆澧冨凡缁忎笉瀛樺湪浜嗐€?> 杩欏氨鍍忎竴涓汉绂诲紑浜嗗涔★紝浣嗘案杩滆寰楀涔＄殑椋庢櫙銆?
```python
def make_counter(initial: int = 0):
    count = initial

    def increment() -> int:
        nonlocal count
        count += 1
        return count

    def get_count() -> int:
        return count

    return increment, get_count

inc, get = make_counter(0)
print(inc())  # 1
print(inc())  # 2
print(get())  # 2

# 闂寘鐨勫疄闄呭簲鐢細閰嶇疆宸ュ巶
def make_logger(prefix: str):
    def log(message: str) -> None:
        print(f"[{prefix}] {message}")
    return log

info = make_logger("INFO")
error = make_logger("ERROR")
info("鏈嶅姟鍚姩")    # [INFO] 鏈嶅姟鍚姩
error("杩炴帴澶辫触")   # [ERROR] 杩炴帴澶辫触
```

---

## 8. 娴疯薄杩愮畻绗?:=

> 馃О **Toolbox: 娴疯薄杩愮畻绗?鈥?Python 3.8 鐨勪簤璁€ф柊鐗规€?*
>
> `:=` 鏄祴鍊艰〃杈惧紡锛圓ssignment Expression锛夛紝鍥犱负闀垮緱鍍忔捣璞′晶鑴歌€屽緱鍚嶃€?> 瀹冨厑璁稿湪琛ㄨ揪寮忎腑璧嬪€硷紝鍑忓皯閲嶅浠ｇ爜銆侾EP 572 寮曞叆鏃跺紩鍙戜簡宸ㄥぇ浜夎锛?> 鐢氳嚦瀵艰嚧 Python 涔嬬埗 Guido van Rossum 杈炲幓浜?BDFL锛堢粓韬粊鎱堢嫭瑁佽€咃級鑱屼綅銆?
```python
# 鍦?while 鏉′欢涓祴鍊?while (line := input("杈撳叆: ")) != "quit":
    print(f"澶勭悊: {line}")

# 鍦ㄥ垪琛ㄦ帹瀵间腑閬垮厤閲嶅璁＄畻
data = [1, 5, 3, 8, 2, 9]
results = [(x, sq) for x in data if (sq := x**2) > 20]

# 鍦?if 鏉′欢涓祴鍊?import re
text = "2026-02-09"
if (match := re.match(r"(\d{4})-(\d{2})-(\d{2})", text)):
    year, month, day = match.groups()
    print(f"鏃ユ湡: {year}骞磠month}鏈坽day}鏃?)
```

---

## 浠ｇ爜绀轰緥

### 绀轰緥 1: 鎺у埗娴?
鍙傝 [`examples/01-control-flow.py`](./examples/01-control-flow.py)

### 绀轰緥 2: 鎺ㄥ寮?
鍙傝 [`examples/02-comprehensions.py`](./examples/02-comprehensions.py)

### 绀轰緥 3: 鍑芥暟

鍙傝 [`examples/03-functions.py`](./examples/03-functions.py)

### 绀轰緥 4: 闂寘

鍙傝 [`examples/04-closures.py`](./examples/04-closures.py)

---

## 鏈€浣冲疄璺?
```python
# 鉁?1. 浼樺厛浣跨敤 for 寰幆锛岃€屼笉鏄?while
for item in collection:
    process(item)

# 鉁?2. 鐢ㄦ帹瀵煎紡鏇夸唬绠€鍗曠殑 map/filter
squares = [x**2 for x in range(10)]

# 鉁?3. 鍑芥暟搴旇鍋氫竴浠朵簨锛屽仛濂藉畠
def calculate_area(radius: float) -> float:
    import math
    return math.pi * radius ** 2

# 鉁?4. 浣跨敤绫诲瀷鏍囨敞
def greet(name: str, greeting: str = "浣犲ソ") -> str:
    return f"{greeting}, {name}!"

# 鉁?5. 鐢?enumerate() 浠ｆ浛 range(len())
for i, item in enumerate(items):
    print(f"{i}: {item}")
```

### 鉂?搴旈伩鍏嶇殑鍋氭硶

```python
# 鉂?1. 涓嶈鐢?range(len())
for i in range(len(items)):
    print(items[i])

# 鉂?2. 涓嶈婊ョ敤 lambda
sort_key = lambda x: (x["priority"], -x["score"], x["name"].lower())

# 鉂?3. 涓嶈淇敼姝ｅ湪閬嶅巻鐨勫垪琛?for item in items:
    if some_condition(item):
        items.remove(item)  # 鍗遍櫓锛?
# 鉁?姝ｇ‘鏂瑰紡锛氫娇鐢ㄦ帹瀵煎紡鍒涘缓鏂板垪琛?items = [item for item in items if not some_condition(item)]
```

---

## 甯歌闄烽槺

### 闄烽槺 1锛氬彲鍙橀粯璁ゅ弬鏁?
```python
# 鉂?缁忓吀闄烽槺
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item("a"))  # ['a']
print(add_item("b"))  # ['a', 'b'] 鈥?涓嶆槸 ['b']锛?
# 鉁?浣跨敤 None 浣滀负榛樿鍊?def add_item_safe(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### 闄烽槺 2锛氬惊鐜腑鐨勯棴鍖?
```python
# 鉂?鎵€鏈夊嚱鏁板叡浜悓涓€涓彉閲?functions = [lambda: i for i in range(5)]
print([f() for f in functions])  # [4, 4, 4, 4, 4]

# 鉁?鐢ㄩ粯璁ゅ弬鏁版崟鑾?functions = [lambda x=i: x for i in range(5)]
print([f() for f in functions])  # [0, 1, 2, 3, 4]
```

### 闄烽槺 3锛氭帹瀵煎紡涓殑浣滅敤鍩?
```python
# Python 3 涓帹瀵煎紡鏈夎嚜宸辩殑浣滅敤鍩?x = 10
squares = [x**2 for x in range(5)]
print(x)  # 10锛坸 娌℃湁琚帹瀵煎紡瑕嗙洊锛?# Python 2 涓?x 浼氬彉鎴?4
```

---

## 缁冧範棰?
### 缁冧範 1锛欶izzBuzz

鍐欎竴涓嚱鏁?`fizzbuzz(n)`锛屾墦鍗?1 鍒?n 鐨勬暟瀛楋紝浣嗭細3 鐨勫€嶆暟鎵撳嵃 "Fizz"锛? 鐨勫€嶆暟鎵撳嵃 "Buzz"锛?5 鐨勫€嶆暟鎵撳嵃 "FizzBuzz"銆?
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

print(fizzbuzz(20))
```

</details>

### 缁冧範 2锛氱煩闃佃浆缃?
鐢ㄦ帹瀵煎紡瀹炵幇鐭╅樀杞疆鍑芥暟銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def transpose(matrix: list[list]) -> list[list]:
    return [[row[i] for row in matrix] for i in range(len(matrix[0]))]

m = [[1, 2, 3], [4, 5, 6]]
print(transpose(m))  # [[1, 4], [2, 5], [3, 6]]
```

</details>

### 缁冧範 3锛氬疄鐜?my_map 鍜?my_filter

<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def my_map(func, iterable):
    return [func(x) for x in iterable]

def my_filter(func, iterable):
    return [x for x in iterable if func(x)]

print(my_map(lambda x: x**2, [1, 2, 3, 4]))     # [1, 4, 9, 16]
print(my_filter(lambda x: x > 2, [1, 2, 3, 4]))  # [3, 4]
```

</details>

---

## 鍙傝€冭祫婧?
- [Python 瀹樻柟鏂囨。 - 鎺у埗娴乚(https://docs.python.org/3/tutorial/controlflow.html)
- [Python 瀹樻柟鏂囨。 - 鍑芥暟瀹氫箟](https://docs.python.org/3/reference/compound_stmts.html#function-definitions)
- [PEP 572 - 璧嬪€艰〃杈惧紡](https://peps.python.org/pep-0572/)
- [PEP 634 - 缁撴瀯鍖栨ā寮忓尮閰峕(https://peps.python.org/pep-0634/)
- [Real Python - 鎺ㄥ寮廬(https://realpython.com/list-comprehension-python/)

---

## 涓嬩竴姝?
浣犲凡缁忔帉鎻′簡 Python 鐨勬帶鍒舵祦鍜屽嚱鏁般€傛帴涓嬫潵锛岃鎴戜滑娣卞叆 Python 鏈€寮哄ぇ鐨勬鍣細鏍稿績鏁版嵁缁撴瀯銆?
**[馃憠 绗?4 绔狅細鏍稿績鏁版嵁缁撴瀯](../04-data-structures/)**