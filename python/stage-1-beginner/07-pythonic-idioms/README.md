# 绗?7 绔狅細Pythonic 鎯敤娉?鈥?浠?浼氬啓 Python"鍒?鍐欏ソ Python"

> *"There should be one-- and preferably only one --obvious way to do it."*
> 鈥?The Zen of Python, Line 13
>
> "Pythonic"涓嶆槸涓€涓簿纭殑鎶€鏈湳璇紝瀹冩槸涓€绉?*瀹＄編鍒ゆ柇**銆?> 瀹冩剰鍛崇潃浠ｇ爜閬靛惊浜?Python 绀惧尯鐨勫叡璇嗭細绠€娲併€佸彲璇汇€佺鍚堢洿瑙夈€?> 鏈珷鏄綘浠?Python 鏂版墜鍒?Python 鑰佹墜鐨勫叧閿浆鎶樼偣銆?
## 馃摉 鏈珷鍐呭

- [1. 瑙ｅ寘璧嬪€糫(#1-瑙ｅ寘璧嬪€?
- [2. 鎺ㄥ寮忚繘闃禲(#2-鎺ㄥ寮忚繘闃?
- [3. 鍐呯疆鍑芥暟濡欑敤](#3-鍐呯疆鍑芥暟濡欑敤)
- [4. 涓嬪垝绾挎儻鐢ㄦ硶](#4-涓嬪垝绾挎儻鐢ㄦ硶)
- [5. 鍒囩墖璧嬪€间笌鍒囩墖瀵硅薄](#5-鍒囩墖璧嬪€间笌鍒囩墖瀵硅薄)
- [6. for...else 鍜?while...else](#6-forelse-鍜?whileelse)
- [7. 鍙凯浠ｅ璞¤В鍖匽(#7-鍙凯浠ｅ璞¤В鍖?
- [8. 甯歌鍙嶆ā寮忎笌鏇夸唬鏂规](#8-甯歌鍙嶆ā寮忎笌鏇夸唬鏂规)
- [浠ｇ爜绀轰緥](#浠ｇ爜绀轰緥)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?
- [涓嬩竴姝(#涓嬩竴姝?

---

## 1. 瑙ｅ寘璧嬪€?
> 馃幁 **The Drama: 瑙ｅ寘鈥斺€擯ython 鏈€浼橀泤鐨勭壒鎬?*
>
> 鍦?C 涓氦鎹袱涓彉閲忛渶瑕佷复鏃跺彉閲忥細`temp = a; a = b; b = temp;`
> 鍦?Python 涓細`a, b = b, a`銆備竴琛屾悶瀹氾紝鎰忓浘娓呮櫚銆?
```python
# 鍩烘湰瑙ｅ寘
x, y = (3, 4)
name, age, city = "Alice", 30, "Beijing"

# 浜ゆ崲鍙橀噺
a, b = 1, 2
a, b = b, a  # 涓€琛屼氦鎹紒

# 宓屽瑙ｅ寘
(a, b), c = (1, 2), 3

# 鏄熷彿瑙ｅ寘锛堟敹闆嗗墿浣欏厓绱狅級
first, *rest = [1, 2, 3, 4, 5]       # first=1, rest=[2,3,4,5]
*init, last = [1, 2, 3, 4, 5]        # init=[1,2,3,4], last=5
first, *mid, last = [1, 2, 3, 4, 5]  # first=1, mid=[2,3,4], last=5

# 蹇界暐涓嶉渶瑕佺殑鍊?_, _, third = (1, 2, 3)
first, *_ = [1, 2, 3, 4, 5]
```

---

## 2. 鎺ㄥ寮忚繘闃?
```python
# 宓屽鎺ㄥ寮?matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in matrix for x in row]

# 鏉′欢鎺ㄥ寮?data = [1, -2, 3, -4, 5]
positives = [x for x in data if x > 0]
labels = ["姝? if x > 0 else "璐? for x in data]

# 瀛楀吀鎺ㄥ寮忕炕杞?original = {"a": 1, "b": 2, "c": 3}
flipped = {v: k for k, v in original.items()}

# 闆嗗悎鎺ㄥ寮忓幓閲?words = ["hello", "HELLO", "Hello"]
unique = {w.lower() for w in words}  # {"hello"}

# 鐢熸垚鍣ㄨ〃杈惧紡锛堟儼鎬ф眰鍊硷級
total = sum(x**2 for x in range(1000000))  # 涓嶅垱寤轰腑闂村垪琛?```

---

## 3. 鍐呯疆鍑芥暟濡欑敤

> 馃О **Toolbox: 杩欎簺鍐呯疆鍑芥暟璁╀綘浜嬪崐鍔熷€?*

```python
# enumerate 鈥?姘歌繙涓嶈鐢?range(len())
for i, item in enumerate(items, start=1):
    print(f"{i}. {item}")

# zip 鈥?骞惰閬嶅巻
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# any / all 鈥?搴忓垪鏉′欢鍒ゆ柇
any(x > 10 for x in numbers)   # 鏈変换鎰忎竴涓?> 10?
all(x > 0 for x in numbers)    # 鍏ㄩ儴 > 0?

# sorted + key 鈥?鐏垫椿鎺掑簭
sorted(words, key=str.lower)
sorted(students, key=lambda s: s["score"], reverse=True)

# min / max + key
shortest = min(words, key=len)
oldest = max(people, key=lambda p: p["age"])

# map / filter锛堟帹瀵煎紡閫氬父鏇村ソ锛?doubled = list(map(lambda x: x * 2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
# 鎺ㄥ寮忕増鏈洿娓呮櫚:
doubled = [x * 2 for x in numbers]
evens = [x for x in numbers if x % 2 == 0]
```

---

## 4. 涓嬪垝绾挎儻鐢ㄦ硶

```python
# 1. _ 蹇界暐涓嶉渶瑕佺殑鍊?x, _, z = (1, 2, 3)
for _ in range(5):
    do_something()

# 2. _name 鍐呴儴浣跨敤锛堢害瀹氾紝闈炲己鍒讹級
class MyClass:
    _internal_var = "鍐呴儴浣跨敤"

# 3. __name 鍚嶇О鏀瑰啓锛堥槻姝㈠瓙绫诲啿绐侊級
class MyClass:
    __private_var = "浼氳鏀瑰啓涓?_MyClass__private_var"

# 4. __name__ 榄旀湳鏂规硶
# __init__, __str__, __repr__, __len__ 绛?
# 5. 鏁板瓧鍒嗛殧绗?population = 8_000_000_000
hex_color = 0xFF_AA_CC
```

---

## 5. 鍒囩墖璧嬪€间笌鍒囩墖瀵硅薄

```python
# 鍒囩墖璧嬪€?lst = [0, 1, 2, 3, 4, 5]
lst[2:4] = [20, 30]      # 鏇挎崲
lst[2:4] = [20, 30, 40]  # 鏇挎崲锛堥暱搴﹀彲涓嶅悓锛?lst[2:2] = [99]           # 鎻掑叆
lst[2:5] = []             # 鍒犻櫎

# 鍛藉悕鍒囩墖锛堟彁楂樺彲璇绘€э級
HEADER = slice(0, 10)
BODY = slice(10, 50)
data = "0123456789" * 5 + "extra"
print(data[HEADER])
print(data[BODY])
```

---

## 6. for...else 鍜?while...else

> 馃 **Zen of Code: else 瀛愬彞鐨勭湡姝ｅ惈涔?*
>
> `for...else` 涓殑 `else` 涓嶆槸"濡傛灉寰幆娌℃墽琛?锛岃€屾槸"濡傛灉寰幆娌℃湁琚?`break` 涓柇"銆?> 鏇村ソ鐨勭悊瑙ｆ柟寮忔槸鎶?`else` 璇讳綔 `nobreak`銆?
```python
# 鏌ユ壘璐ㄦ暟鍥犲瓙
n = 17
for i in range(2, int(n**0.5) + 1):
    if n % i == 0:
        print(f"{n} 涓嶆槸璐ㄦ暟")
        break
else:
    print(f"{n} 鏄川鏁?)  # 娌℃湁 break 鏃舵墽琛?
# 鏌ユ壘鐩爣鍊?def find_target(items, target):
    for item in items:
        if item == target:
            print(f"鎵惧埌: {target}")
            break
    else:
        print(f"鏈壘鍒? {target}")
```

---

## 7. 鍙凯浠ｅ璞¤В鍖?
```python
# 鍒楄〃瑙ｅ寘
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = [*list1, *list2]  # [1, 2, 3, 4, 5, 6]

# 瀛楀吀瑙ｅ寘鍚堝苟
defaults = {"color": "blue", "size": "M"}
user = {"color": "red"}
config = {**defaults, **user}  # {"color": "red", "size": "M"}

# Python 3.9+ 瀛楀吀鍚堝苟杩愮畻绗?config = defaults | user

# 鍑芥暟璋冪敤涓В鍖?args = [1, 2, 3]
kwargs = {"sep": " + "}
print(*args, **kwargs)  # 1 + 2 + 3
```

---

## 8. 甯歌鍙嶆ā寮忎笌鏇夸唬鏂规

| 鍙嶆ā寮?鉂?| Pythonic 鉁?| 璇存槑 |
|-----------|-----------|------|
| `for i in range(len(x))` | `for item in x` | 鐩存帴閬嶅巻 |
| `for i in range(len(x))` | `for i, item in enumerate(x)` | 闇€瑕佺储寮曟椂 |
| `result += word + " "` | `" ".join(words)` | 瀛楃涓叉嫾鎺?|
| `temp = a; a = b; b = temp` | `a, b = b, a` | 浜ゆ崲鍙橀噺 |
| `if key in dict: dict[key]` | `dict.get(key, default)` | 瀹夊叏鍙栧€?|
| `result = []; for...: append` | `[expr for x in iter]` | 鎺ㄥ寮?|
| `f = open(); ...; f.close()` | `with open() as f:` | 鏂囦欢鎿嶄綔 |
| `if x == None` | `if x is None` | None 妫€鏌?|
| `type(x) == int` | `isinstance(x, int)` | 绫诲瀷妫€鏌?|
| `if len(lst) > 0` | `if lst` | 绌哄€兼鏌?|

---

## 浠ｇ爜绀轰緥

鍙傝 [`examples/01-unpacking.py`](./examples/01-unpacking.py) | [`examples/02-idioms.py`](./examples/02-idioms.py) | [`examples/03-antipatterns.py`](./examples/03-antipatterns.py)

---

## 鏈€浣冲疄璺?
```python
# 鉁?1. 鐩存帴琛ㄨ揪鎰忓浘
for item in items:       # 鑰屼笉鏄?for i in range(len(items))
    process(item)

# 鉁?2. 浣跨敤鎺ㄥ寮?squares = [x**2 for x in range(10)]

# 鉁?3. 鍒╃敤 Truthy/Falsy
if items:  # 鑰屼笉鏄?if len(items) > 0
    process(items)

# 鉁?4. 鐢?with 绠＄悊璧勬簮
with open("file.txt") as f:
    content = f.read()

# 鉁?5. 鐢?is 妫€鏌?None
if result is None:
    handle_missing()

# 鉁?6. 瑙ｅ寘浠ｆ浛绱㈠紩
x, y, z = point  # 鑰屼笉鏄?x = point[0]
```

---

## 缁冧範棰?
### 缁冧範 1锛歅ythonic 鏀瑰啓

灏嗕互涓嬩唬鐮佹敼鍐欎负 Pythonic 椋庢牸锛?
```python
# 鍘熷浠ｇ爜
result = []
for i in range(len(numbers)):
    if numbers[i] > 0:
        result.append(numbers[i] * 2)
```

<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
result = [n * 2 for n in numbers if n > 0]
```

</details>

### 缁冧範 2锛氬瓧鍏告搷浣?
鐢ㄦ渶 Pythonic 鐨勬柟寮忓悎骞朵袱涓瓧鍏革紝骞剁粺璁℃墍鏈夊€肩殑鎬诲拰銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}

# 鍚堝苟锛圥ython 3.9+锛?merged = dict1 | dict2

# 鍊肩殑鎬诲拰
total = sum(merged.values())
print(f"鍚堝苟: {merged}, 鎬诲拰: {total}")
```

</details>

### 缁冧範 3锛氳В鍖呯粌涔?
浠庝竴涓寘鍚嚦灏?3 涓厓绱犵殑鍒楄〃涓紝鎻愬彇绗竴涓€佹渶鍚庝竴涓拰涓棿鎵€鏈夊厓绱犮€?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
data = [1, 2, 3, 4, 5, 6, 7]
first, *middle, last = data
print(f"first={first}, middle={middle}, last={last}")
# first=1, middle=[2, 3, 4, 5, 6], last=7
```

</details>

---

## 鍙傝€冭祫婧?
- [The Zen of Python](https://peps.python.org/pep-0020/)
- [PEP 8 鈥?Python 浠ｇ爜椋庢牸鎸囧崡](https://peps.python.org/pep-0008/)
- [Effective Python](https://effectivepython.com/) 鈥?Brett Slatkin
- [Fluent Python](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/) 鈥?Luciano Ramalho
- [Real Python - Pythonic Code](https://realpython.com/learning-paths/writing-pythonic-code/)

---

## 涓嬩竴姝?
鎭枩锛佷綘宸茬粡瀹屾垚浜?Python 鍩虹鐨勬墍鏈夌珷鑺傚涔犮€傜幇鍦ㄦ槸鏃跺€欐妸鐭ヨ瘑浠樿瀹炶返浜嗐€?
**[馃憠 缁冧範棰橀泦](../exercises/)**

**[馃憠 瀹炴垬椤圭洰锛欳LI 浠诲姟绠＄悊鍣╙(../projects/cli-task-manager/)**