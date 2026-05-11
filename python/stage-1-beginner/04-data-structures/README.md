# 绗?4 绔狅細鏍稿績鏁版嵁缁撴瀯 鈥?Python 鐨勫洓澶ч噾鍒?
> *"Data dominates. If you've chosen the right data structures and organized things well, the algorithms will almost always be self-evident."*
> 鈥?Rob Pike
>
> 鍒楄〃銆佸瓧鍏搞€佸厓缁勩€侀泦鍚堚€斺€旇繖鏄?Python 鐨勫洓澶ф牳蹇冩暟鎹粨鏋勩€?> 鎺屾彙瀹冧滑鐨勭壒鎬у拰閫傜敤鍦烘櫙锛屾槸浠?鑳藉啓浠ｇ爜"鍒?鍐欏ソ浠ｇ爜"鐨勫叧閿竴姝ャ€?
## 馃摉 鏈珷鍐呭

- [1. list 鈥?鍔ㄦ€佹暟缁刔(#1-list--鍔ㄦ€佹暟缁?
- [2. tuple 鈥?涓嶅彲鍙樺簭鍒梋(#2-tuple--涓嶅彲鍙樺簭鍒?
- [3. dict 鈥?鍝堝笇琛╙(#3-dict--鍝堝笇琛?
- [4. set 鈥?闆嗗悎](#4-set--闆嗗悎)
- [5. collections 妯″潡](#5-collections-妯″潡)
- [6. 鏁版嵁缁撴瀯閫夋嫨鎸囧崡](#6-鏁版嵁缁撴瀯閫夋嫨鎸囧崡)
- [浠ｇ爜绀轰緥](#浠ｇ爜绀轰緥)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [甯歌闄烽槺](#甯歌闄烽槺)
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?
- [涓嬩竴姝(#涓嬩竴姝?

---

## 1. list 鈥?鍔ㄦ€佹暟缁?
> 鈿涳笍 **The Science: list 鐨勫簳灞傚疄鐜?*
>
> Python 鐨?`list` 搴曞眰鏄竴涓?*鍔ㄦ€佹暟缁?*锛堢被浼?C++ 鐨?`vector`銆丣ava 鐨?`ArrayList`锛夈€?> 瀹冨湪鍐呭瓨涓槸杩炵画瀛樺偍鐨勬寚閽堟暟缁勨€斺€旀瘡涓厓绱犳槸鎸囧悜 Python 瀵硅薄鐨勬寚閽堛€?>
> - `append()`锛氬潎鎽?O(1)锛堝伓灏旈渶瑕佹墿瀹癸紝浼氶噸鏂板垎閰嶅唴瀛橈級
> - `insert(0, x)`锛歄(n)锛堥渶瑕佺些鍔ㄦ墍鏈夊厓绱狅級
> - `pop()`锛歄(1)锛沗pop(0)`锛歄(n)
> - 濡傛灉闇€瑕侀绻佸ご閮ㄦ搷浣滐紝鐢?`collections.deque`

### 1.1 鍒涘缓鍜屽熀鏈搷浣?
```python
# 鍒涘缓鍒楄〃
fruits = ["apple", "banana", "cherry"]
numbers = list(range(10))
empty = []

# 璁块棶
print(fruits[0])    # "apple"锛堟绱㈠紩锛?print(fruits[-1])   # "cherry"锛堣礋绱㈠紩锛?
# 淇敼
fruits[1] = "blueberry"
fruits.append("date")        # 鏈熬娣诲姞
fruits.insert(0, "avocado")  # 鎸囧畾浣嶇疆鎻掑叆
fruits.extend(["fig", "grape"])  # 鎵╁睍

# 鍒犻櫎
fruits.remove("cherry")  # 鎸夊€煎垹闄わ紙鍒犻櫎绗竴涓尮閰嶏級
popped = fruits.pop()    # 寮瑰嚭鏈€鍚庝竴涓?del fruits[0]            # 鎸夌储寮曞垹闄?
# 鏌ユ壘
print("apple" in fruits)        # True/False
print(fruits.index("apple"))    # 杩斿洖绱㈠紩
print(fruits.count("apple"))    # 璁℃暟
```

### 1.2 鍒囩墖 (Slicing)

> 馃О **Toolbox: 鍒囩墖鏄?Python 鏈€寮哄ぇ鐨勭壒鎬т箣涓€**
>
> 璇硶: `list[start:stop:step]`
> - `start`锛氳捣濮嬬储寮曪紙鍖呭惈锛夛紝榛樿 0
> - `stop`锛氱粨鏉熺储寮曪紙涓嶅寘鍚級锛岄粯璁?len
> - `step`锛氭闀匡紝榛樿 1

```python
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

nums[2:5]     # [2, 3, 4]
nums[:3]      # [0, 1, 2]
nums[7:]      # [7, 8, 9]
nums[::2]     # [0, 2, 4, 6, 8]锛堟瘡闅斾竴涓級
nums[::-1]    # [9, 8, 7, ..., 0]锛堝弽杞級
nums[1:8:2]   # [1, 3, 5, 7]

# 鍒囩墖璧嬪€?nums[2:5] = [20, 30, 40]  # 鏇挎崲
nums[2:5] = []             # 鍒犻櫎
nums[2:2] = [99]           # 鎻掑叆
```

### 1.3 鎺掑簭

```python
# sort() 鈥?鍘熷湴鎺掑簭锛堜慨鏀瑰師鍒楄〃锛岃繑鍥?None锛?numbers = [3, 1, 4, 1, 5, 9]
numbers.sort()                    # 鍗囧簭
numbers.sort(reverse=True)        # 闄嶅簭
numbers.sort(key=abs)             # 鎸夌粷瀵瑰€兼帓搴?
# sorted() 鈥?杩斿洖鏂板垪琛紙涓嶄慨鏀瑰師鍒楄〃锛?original = [3, 1, 4, 1, 5]
sorted_list = sorted(original)    # original 涓嶅彉

# 鑷畾涔夋帓搴?students = [("Alice", 95), ("Bob", 87), ("Charlie", 72)]
sorted(students, key=lambda s: s[1], reverse=True)
```

---

## 2. tuple 鈥?涓嶅彲鍙樺簭鍒?
> 馃 **Zen of Code: 涓嶅彲鍙?= 鍙俊璧?*
>
> 鍏冪粍鐨勪笉鍙彉鎬у甫鏉ヤ笁涓ソ澶勶細
> 1. **鍙搱甯?* 鈥?鍙互浣滀负瀛楀吀閿拰闆嗗悎鍏冪礌
> 2. **绾跨▼瀹夊叏** 鈥?涓嶉渶瑕侀攣
> 3. **璇箟娓呮櫚** 鈥?琛ㄧず"杩欑粍鏁版嵁涓嶅簲璇ヨ淇敼"

```python
# 鍒涘缓鍏冪粍
point = (3, 4)
single = (42,)    # 娉ㄦ剰閫楀彿锛?42) 鏄?int 涓嶆槸 tuple
rgb = (255, 128, 0)

# 瑙ｅ寘
x, y = point
r, g, b = rgb

# 鍛藉悕鍏冪粍 鈥?缁欏厓缁勭殑瀛楁鍛藉悕
from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float

p = Point(3, 4)
print(p.x, p.y)   # 3 4
print(p[0], p[1])  # 涔熷彲浠ョ敤绱㈠紩
```

| 瀵规瘮 | `list` | `tuple` |
|------|---------|---------|
| 鍙彉鎬?| 鉁?鍙彉 | 鉂?涓嶅彲鍙?|
| 鍙搱甯?| 鉂?| 鉁咃紙鍏冪礌閮藉彲鍝堝笇鏃讹級 |
| 鍐呭瓨 | 杈冨ぇ | 杈冨皬 |
| 閫熷害 | 杈冩參 | 杈冨揩 |
| 閫傜敤鍦烘櫙 | 鍚岀被鍏冪礌闆嗗悎 | 寮傛瀯璁板綍銆佸瓧鍏搁敭 |

---

## 3. dict 鈥?鍝堝笇琛?
> 鈿涳笍 **The Science: dict 鐨勬椂闂村鏉傚害 鈥?O(1) 鐨勭瀵?*
>
> Python 鐨?`dict` 鍩轰簬鍝堝笇琛ㄥ疄鐜帮紝鏌ユ壘銆佹彃鍏ャ€佸垹闄ゅ潎涓?*骞冲潎 O(1)**銆?> 涓や釜鍓嶆彁锛氶敭蹇呴』鍙搱甯岋紱涓嶉€€鍖栵紙CPython 鐨勬帰娴嬬瓥鐣ヤ繚璇佷簡杩欎竴鐐癸級銆?>
> 浠?Python 3.7 寮€濮嬶紝`dict` **淇濊瘉鎻掑叆椤哄簭**銆傝繖鏄?CPython 3.6 寮曞叆鐨?> 绱у噾瀛楀吀瀹炵幇鐨勫壇浣滅敤锛?.7 灏嗗叾绾冲叆璇█瑙勮寖銆?
### 3.1 鍩烘湰鎿嶄綔

```python
# 鍒涘缓
person = {"name": "Alice", "age": 30}
from_keys = dict.fromkeys(["a", "b", "c"], 0)

# 瀹夊叏璁块棶
person.get("email", "鏈缃?)  # 涓嶅瓨鍦ㄦ椂杩斿洖榛樿鍊?
# 鍚堝苟锛圥ython 3.9+锛?dict1 = {"a": 1}
dict2 = {"b": 2}
merged = dict1 | dict2       # {"a": 1, "b": 2}
dict1 |= dict2               # 鍘熷湴鍚堝苟
```

### 3.2 defaultdict 鍜?Counter

```python
from collections import defaultdict, Counter

# defaultdict 鈥?鑷姩鍒涘缓榛樿鍊?word_count = defaultdict(int)
for word in "the cat sat on the mat".split():
    word_count[word] += 1

groups = defaultdict(list)
for name, dept in [("Alice", "Eng"), ("Bob", "Eng"), ("Charlie", "Sales")]:
    groups[dept].append(name)

# Counter 鈥?涓撲笟璁℃暟鍣?colors = ["red", "blue", "red", "green", "blue", "red"]
counter = Counter(colors)
print(counter.most_common(2))  # [("red", 3), ("blue", 2)]
```

---

## 4. set 鈥?闆嗗悎

> 馃 **CS Master's Bridge: 闆嗗悎璁哄湪缂栫▼涓殑搴旂敤**
>
> Python 鐨?`set` 鐩存帴鏄犲皠浜嗘暟瀛︿腑鐨勯泦鍚堟蹇碉細
> 骞堕泦 (`|`)銆佷氦闆?(`&`)銆佸樊闆?(`-`)銆佸绉板樊 (`^`)銆?> 搴曞眰鍚屾牱鍩轰簬鍝堝笇琛紝鎴愬憳鍒ゆ柇鏄?O(1)鈥斺€旀瘮 list 鐨?O(n) 蹇緱澶氥€?
```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b    # {1, 2, 3, 4, 5, 6}  骞堕泦
a & b    # {3, 4}              浜ら泦
a - b    # {1, 2}              宸泦
a ^ b    # {1, 2, 5, 6}        瀵圭О宸?
# 甯歌鐢ㄩ€?unique = list(set([1, 2, 2, 3, 3]))  # 鍘婚噸
valid = {"USD", "EUR", "GBP"}
print("USD" in valid)                  # O(1) 鎴愬憳鍒ゆ柇
```

---

## 5. collections 妯″潡

```python
from collections import deque, OrderedDict, ChainMap

# deque 鈥?鍙岀闃熷垪锛屼袱绔搷浣?O(1)
dq = deque([1, 2, 3])
dq.appendleft(0)  # O(1)锛宭ist.insert(0,x) 鏄?O(n)
dq.popleft()       # O(1)

# deque(maxlen=N) 鈥?鍥哄畾澶у皬锛岃嚜鍔ㄤ涪寮冩棫鍏冪礌
recent = deque(maxlen=5)

# OrderedDict 鈥?鏈夊簭瀛楀吀锛?.7 鍚?dict 宸叉湁搴忥紝浣嗗畠鏈夐澶栨柟娉曪級
od = OrderedDict(a=1, b=2, c=3)
od.move_to_end("a")  # 绉诲埌鏈熬

# ChainMap 鈥?閾惧紡瀛楀吀鏌ユ壘
defaults = {"color": "blue", "size": "M"}
user = {"color": "red"}
config = ChainMap(user, defaults)
print(config["color"])  # "red" (浼樺厛 user)
print(config["size"])   # "M" (鍥為€€鍒?defaults)
```

---

## 6. 鏁版嵁缁撴瀯閫夋嫨鎸囧崡

| 鏁版嵁缁撴瀯 | 鏌ユ壘 | 鎻掑叆 | 鍒犻櫎 | 鏈夊簭 | 鍙彉 | 鍘婚噸 | 閫傜敤鍦烘櫙 |
|---------|------|------|------|------|------|------|---------|
| `list` | O(n) | O(1)* | O(n) | 鉁?| 鉁?| 鉂?| 鏈夊簭闆嗗悎銆佹爤 |
| `tuple` | O(n) | 鈥?| 鈥?| 鉁?| 鉂?| 鉂?| 涓嶅彲鍙樿褰曘€佸瓧鍏搁敭 |
| `dict` | O(1) | O(1) | O(1) | 鉁? | 鉁?| 閿敮涓€ | 閿€兼槧灏勩€佺紦瀛?|
| `set` | O(1) | O(1) | O(1) | 鉂?| 鉁?| 鉁?| 鍘婚噸銆佹垚鍛樺垽鏂?|
| `deque` | O(n) | O(1)涓ょ | O(1)涓ょ | 鉁?| 鉁?| 鉂?| 闃熷垪銆佸弻绔搷浣?|

*娉細list 鐨?append 鏄潎鎽?O(1)锛沝ict 浠?3.7+ 淇濇寔鎻掑叆椤哄簭*

---

## 浠ｇ爜绀轰緥

### 绀轰緥 1: 鍒楄〃

鍙傝 [`examples/01-lists.py`](./examples/01-lists.py)

### 绀轰緥 2: 瀛楀吀

鍙傝 [`examples/02-dicts.py`](./examples/02-dicts.py)

### 绀轰緥 3: 鍏冪粍涓庨泦鍚?
鍙傝 [`examples/03-tuples-sets.py`](./examples/03-tuples-sets.py)

### 绀轰緥 4: collections 妯″潡

鍙傝 [`examples/04-collections-module.py`](./examples/04-collections-module.py)

---

## 鏈€浣冲疄璺?
```python
# 鉁?1. 鐢?dict.get() 瀹夊叏璁块棶
value = d.get("key", default_value)

# 鉁?2. 鐢?set 鍋氭垚鍛樺垽鏂紙O(1) vs list 鐨?O(n)锛?valid = {"admin", "editor", "viewer"}
if role in valid: ...

# 鉁?3. 鐢?defaultdict 閬垮厤閿鏌?from collections import defaultdict
groups = defaultdict(list)

# 鉁?4. 鐢?Counter 璁℃暟
from collections import Counter
counter = Counter(items)

# 鉁?5. 鐢?tuple 琛ㄧず涓嶅彲鍙樿褰?point = (3, 4)  # 鑰屼笉鏄?[3, 4]

# 鉁?6. 鍒楄〃鎺ㄥ寮忎唬鏇?append 寰幆
result = [x**2 for x in range(10)]
```

---

## 甯歌闄烽槺

### 闄烽槺 1锛氬瓧鍏搁亶鍘嗘椂淇敼

```python
# 鉂?閬嶅巻鏃朵慨鏀瑰瓧鍏?d = {"a": 1, "b": 2, "c": 3}
for key in d:
    if d[key] < 2:
        del d[key]  # RuntimeError!

# 鉁?鍏堟敹闆嗛敭锛屽啀鍒犻櫎
keys_to_delete = [k for k, v in d.items() if v < 2]
for key in keys_to_delete:
    del d[key]

# 鉁?鎴栫敤瀛楀吀鎺ㄥ寮忓垱寤烘柊瀛楀吀
d = {k: v for k, v in d.items() if v >= 2}
```

### 闄烽槺 2锛歭ist * n 鐨勫紩鐢ㄩ櫡闃?
```python
# 鉂?鍒涘缓宓屽鍒楄〃鏃剁殑闄烽槺
matrix = [[0] * 3] * 3  # 涓夎鏄悓涓€涓垪琛ㄧ殑寮曠敤锛?matrix[0][0] = 1
print(matrix)  # [[1, 0, 0], [1, 0, 0], [1, 0, 0]] 鈥?涓夎閮藉彉浜嗭紒

# 鉁?姝ｇ‘鏂瑰紡
matrix = [[0] * 3 for _ in range(3)]  # 姣忚鏄嫭绔嬬殑鍒楄〃
matrix[0][0] = 1
print(matrix)  # [[1, 0, 0], [0, 0, 0], [0, 0, 0]]
```

### 闄烽槺 3锛氱┖闆嗗悎鐨勫垱寤?
```python
# 鉂?{} 鍒涘缓鐨勬槸绌哄瓧鍏革紝涓嶆槸绌洪泦鍚?empty = {}
print(type(empty))  # <class 'dict'>

# 鉁?绌洪泦鍚堝繀椤荤敤 set()
empty_set = set()
print(type(empty_set))  # <class 'set'>
```

---

## 缁冧範棰?
### 缁冧範 1锛氳瘝棰戠粺璁?
缁欏畾涓€娈垫枃鏈紝缁熻姣忎釜鍗曡瘝鍑虹幇鐨勬鏁帮紝杈撳嚭鍓?5 涓渶甯歌鐨勫崟璇嶃€?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
from collections import Counter

text = "the quick brown fox jumps over the lazy dog the fox"
words = text.lower().split()
counter = Counter(words)
print(counter.most_common(5))
```

</details>

### 缁冧範 2锛氫袱涓垪琛ㄧ殑浜ら泦

涓嶄娇鐢?set锛岀敤鍒楄〃鎺ㄥ寮忔壘鍑轰袱涓垪琛ㄧ殑浜ら泦銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def intersection(a: list, b: list) -> list:
    b_set = set(b)  # 浼樺寲鏌ユ壘鎬ц兘
    return [x for x in a if x in b_set]

print(intersection([1, 2, 3, 4], [3, 4, 5, 6]))  # [3, 4]
```

</details>

### 缁冧範 3锛氬垎缁?
灏嗗鐢熷垪琛ㄦ寜鎴愮哗绛夌骇鍒嗙粍锛圓: >=90, B: >=80, C: >=70, D: <70锛夈€?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
from collections import defaultdict

students = [("Alice", 95), ("Bob", 87), ("Charlie", 72), ("David", 63), ("Eve", 91)]

def get_grade(score: int) -> str:
    if score >= 90: return "A"
    if score >= 80: return "B"
    if score >= 70: return "C"
    return "D"

groups = defaultdict(list)
for name, score in students:
    groups[get_grade(score)].append(name)

for grade in sorted(groups):
    print(f"{grade}: {groups[grade]}")
```

</details>

---

## 鍙傝€冭祫婧?
- [Python 瀹樻柟鏂囨。 - 鍐呯疆绫诲瀷](https://docs.python.org/3/library/stdtypes.html)
- [Python 瀹樻柟鏂囨。 - collections](https://docs.python.org/3/library/collections.html)
- [Real Python - 鍒楄〃鍜屽厓缁刔(https://realpython.com/python-lists-tuples/)
- [Real Python - 瀛楀吀](https://realpython.com/python-dicts/)

---

## 涓嬩竴姝?
浣犲凡缁忕簿閫氫簡 Python 鐨勫洓澶ф牳蹇冩暟鎹粨鏋勩€傛帴涓嬫潵瀛︿範瀛楃涓插鐞嗗拰鏂囦欢鎿嶄綔鈥斺€旇繖鏄疄闄呴」鐩腑鏈€甯哥敤鐨勬妧鑳姐€?
**[馃憠 绗?5 绔狅細瀛楃涓插鐞嗕笌鏂囦欢鎿嶄綔](../05-strings-files/)**