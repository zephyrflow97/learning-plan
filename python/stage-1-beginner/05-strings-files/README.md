# 绗?5 绔狅細瀛楃涓插鐞嗕笌鏂囦欢鎿嶄綔 鈥?鏁版嵁鐨勫叆鍙ｅ拰鍑哄彛

> *"There are only two hard things in Computer Science: cache invalidation and naming things."*
> 鈥?Phil Karlton
>
> 鍦ㄧ幇瀹炰笘鐣屼腑锛?0% 鐨勭紪绋嬩换鍔￠兘娑夊強瀛楃涓插拰鏂囦欢銆?> 璇诲彇閰嶇疆鏂囦欢銆佽В鏋愮敤鎴疯緭鍏ャ€佺敓鎴愭姤鍛娿€佸鐞?JSON API鈥斺€?> 瀛楃涓插拰鏂囦欢鎿嶄綔鏄繛鎺ヤ唬鐮佷笘鐣屼笌鐜板疄涓栫晫鐨勬ˉ姊併€?
## 馃摉 鏈珷鍐呭

- [1. 瀛楃涓叉柟娉昡(#1-瀛楃涓叉柟娉?
- [2. f-string 鏍煎紡鍖朷(#2-f-string-鏍煎紡鍖?
- [3. 缂栫爜涓庤В鐮侊細str vs bytes](#3-缂栫爜涓庤В鐮乻tr-vs-bytes)
- [4. pathlib 鐜颁唬璺緞鎿嶄綔](#4-pathlib-鐜颁唬璺緞鎿嶄綔)
- [5. 鏂囦欢璇诲啓锛歸ith 璇彞](#5-鏂囦欢璇诲啓with-璇彞)
- [6. JSON銆丆SV銆乀OML 澶勭悊](#6-jsoncsvtoml-澶勭悊)
- [浠ｇ爜绀轰緥](#浠ｇ爜绀轰緥)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [甯歌闄烽槺](#甯歌闄烽槺)
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?
- [涓嬩竴姝(#涓嬩竴姝?

---

## 1. 瀛楃涓叉柟娉?
> 馃О **Toolbox: 瀛楃涓叉槸涓嶅彲鍙樼殑鈥斺€旀墍鏈夋柟娉曢兘杩斿洖鏂板瓧绗︿覆**
>
> Python 鐨勫瓧绗︿覆鏄笉鍙彉鐨勩€俙s.upper()` 涓嶄細淇敼 `s`锛岃€屾槸杩斿洖涓€涓柊瀛楃涓层€?> 杩欐剰鍛崇潃瀛楃涓叉柟娉曞彲浠ュ畨鍏ㄥ湴閾惧紡璋冪敤锛歚s.strip().lower().replace(" ", "_")`

```python
s = "  Hello, Python World!  "

# 澶у皬鍐欒浆鎹?s.upper()        # "  HELLO, PYTHON WORLD!  "
s.lower()        # "  hello, python world!  "
s.title()        # "  Hello, Python World!  "
s.capitalize()   # "  hello, python world!  "

# 鍘荤┖鐧?s.strip()        # "Hello, Python World!"
s.lstrip()       # "Hello, Python World!  "
s.rstrip()       # "  Hello, Python World!"

# 鏌ユ壘
s.find("Python")      # 9锛堣繑鍥炵储寮曪紝鎵句笉鍒拌繑鍥?-1锛?s.index("Python")     # 9锛堟壘涓嶅埌鎶涘嚭 ValueError锛?s.count("o")          # 2
s.startswith("  He")   # True
s.endswith("!  ")      # True

# 鏇挎崲鍜屽垎鍓?s.replace("Python", "Java")  # 鏇挎崲
"a,b,c".split(",")           # ["a", "b", "c"]
", ".join(["a", "b", "c"])   # "a, b, c"

# 鍒ゆ柇
"123".isdigit()     # True
"abc".isalpha()     # True
"abc123".isalnum()  # True
```

| 鏂规硶 | 鍔熻兘 | 杩斿洖鍊?| 绀轰緥 |
|------|------|--------|------|
| `strip()` | 鍘讳袱绔┖鐧?| 鏂板瓧绗︿覆 | `"  hi  ".strip()` 鈫?`"hi"` |
| `split(sep)` | 鎸夊垎闅旂鍒嗗壊 | 鍒楄〃 | `"a,b,c".split(",")` 鈫?`["a","b","c"]` |
| `join(iter)` | 杩炴帴瀛楃涓?| 鏂板瓧绗︿覆 | `",".join(["a","b"])` 鈫?`"a,b"` |
| `replace(old,new)` | 鏇挎崲 | 鏂板瓧绗︿覆 | `"hello".replace("l","r")` 鈫?`"herro"` |
| `find(sub)` | 鏌ユ壘瀛愪覆 | 绱㈠紩/-1 | `"hello".find("ll")` 鈫?`2` |
| `startswith()` | 鍓嶇紑妫€鏌?| bool | `"hello".startswith("he")` 鈫?`True` |
| `format()` | 鏍煎紡鍖?| 鏂板瓧绗︿覆 | `"{} {}".format("a","b")` 鈫?`"a b"` |

---

## 2. f-string 鏍煎紡鍖?
> 馃幁 **The Drama: Python 鏍煎紡鍖栫殑杩涘寲鍙?*
>
> - Python 2: `"Hello, %s" % name` 鈥?C 椋庢牸锛屽鏄撳嚭閿?> - Python 3.0: `"Hello, {}".format(name)` 鈥?寮哄ぇ浣嗗暟鍡?> - Python 3.6: `f"Hello, {name}"` 鈥?绠€娲佺洿瑙傦紝**鎺ㄨ崘浣跨敤**
> - Python 3.8: `f"{name=}"` 鈥?璋冭瘯妯″紡锛屾墦鍗板彉閲忓悕鍜屽€?
```python
name = "Alice"
age = 30
score = 95.678

# 鍩烘湰鐢ㄦ硶
print(f"濮撳悕: {name}, 骞撮緞: {age}")

# 琛ㄨ揪寮?print(f"鏄庡勾 {age + 1} 宀?)
print(f"{'鎴愬勾' if age >= 18 else '鏈垚骞?}")

# 鏍煎紡鍖栬鑼?print(f"淇濈暀2浣嶅皬鏁? {score:.2f}")       # 95.68
print(f"鐧惧垎姣? {0.856:.1%}")            # 85.6%
print(f"鍗冧綅鍒嗛殧: {1000000:,}")          # 1,000,000
print(f"鍙冲榻?0瀛楃: '{name:>10}'")     # '     Alice'
print(f"灞呬腑濉厖: '{name:*^10}'")        # '**Alice***'

# 璋冭瘯妯″紡锛圥ython 3.8+锛?x = 42
print(f"{x=}")          # x=42
print(f"{x * 2=}")      # x * 2=84
print(f"{len(name)=}")  # len(name)=5
```

---

## 3. 缂栫爜涓庤В鐮侊細str vs bytes

> 鈿涳笍 **The Science: Unicode 涓?UTF-8**
>
> `str` 鏄?Unicode 瀛楃涓诧紙鏂囨湰锛夛紝`bytes` 鏄瓧鑺傚簭鍒楋紙浜岃繘鍒舵暟鎹級銆?> UTF-8 鏄?Unicode 鐨勪竴绉嶇紪鐮佹柟寮忥紝鏄簰鑱旂綉鐨勬爣鍑嗙紪鐮併€?>
> - ASCII 瀛楃锛堣嫳鏂囷級锛? 瀛楄妭
> - 涓枃瀛楃锛氶€氬父 3 瀛楄妭锛圲TF-8锛?> - 琛ㄦ儏绗﹀彿锛? 瀛楄妭

```python
text = "浣犲ソ, Python!"

# str -> bytes (缂栫爜)
encoded = text.encode("utf-8")
print(type(encoded))  # <class 'bytes'>
print(len(text))      # 11 (瀛楃鏁?
print(len(encoded))   # 15 (瀛楄妭鏁帮紝涓枃姣忎釜3瀛楄妭)

# bytes -> str (瑙ｇ爜)
decoded = encoded.decode("utf-8")
print(decoded)  # "浣犲ソ, Python!"

# 鈿狅笍 缂栬В鐮佷笉鍖归厤浼氭姤閿?# "浣犲ソ".encode("utf-8").decode("ascii")  # UnicodeDecodeError!
```

---

## 4. pathlib 鐜颁唬璺緞鎿嶄綔

> 馃О **Toolbox: pathlib vs os.path 鈥?鎷ユ姳鐜颁唬鏂瑰紡**
>
> `pathlib` 浠?Python 3.4 寮曞叆锛岀敤闈㈠悜瀵硅薄鐨勬柟寮忓鐞嗚矾寰勩€?> 鏈暀绋嬪叏绋嬩娇鐢?`pathlib`锛屼笉鍐嶄娇鐢?`os.path`銆?
```python
from pathlib import Path

# 鍒涘缓璺緞
p = Path.home() / "documents" / "file.txt"

# 璺緞灞炴€?p.name       # "file.txt"
p.stem       # "file"
p.suffix     # ".txt"
p.parent     # Path("/Users/alice/documents")

# 鏂囦欢绯荤粺鎿嶄綔
p.exists()   # 璺緞鏄惁瀛樺湪
p.is_file()  # 鏄惁鏄枃浠?p.is_dir()   # 鏄惁鏄洰褰?p.mkdir(parents=True, exist_ok=True)  # 鍒涘缓鐩綍

# 璇诲啓鏂囦欢
p.write_text("鍐呭", encoding="utf-8")
content = p.read_text(encoding="utf-8")

# 閬嶅巻鏂囦欢
for f in Path(".").glob("**/*.py"):
    print(f)
```

---

## 5. 鏂囦欢璇诲啓锛歸ith 璇彞

> 馃 **Zen of Code: with 璇彞鈥斺€旇祫婧愮鐞嗙殑 Pythonic 鏂瑰紡**
>
> `with` 璇彞鏄笂涓嬫枃绠＄悊鍣ㄧ殑璇硶绯栥€傚畠纭繚鏂囦欢鍦ㄤ娇鐢ㄥ悗姝ｇ‘鍏抽棴锛?> 鍗充娇鍙戠敓寮傚父銆傛案杩滀娇鐢?`with` 鏉ユ墦寮€鏂囦欢銆?
```python
# 鉁?鎺ㄨ崘锛歸ith 璇彞锛堣嚜鍔ㄥ叧闂枃浠讹級
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 鉂?涓嶆帹鑽愶細鎵嬪姩鍏抽棴
f = open("data.txt", "r", encoding="utf-8")
content = f.read()
f.close()  # 濡傛灉涓婇潰鍑洪敊锛宑lose() 涓嶄細琚皟鐢?
# 鏂囦欢妯″紡
# "r" 鈥?璇诲彇锛堥粯璁わ級
# "w" 鈥?鍐欏叆锛堣鐩栵級
# "a" 鈥?杩藉姞
# "x" 鈥?鐙崰鍒涘缓锛堟枃浠跺凡瀛樺湪鍒欐姤閿欙級
# "rb"/"wb" 鈥?浜岃繘鍒舵ā寮?
# 閫愯璇诲彇锛堝唴瀛樺弸濂斤級
with open("data.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.rstrip())  # rstrip() 鍘绘帀鎹㈣绗?```

---

## 6. JSON銆丆SV銆乀OML 澶勭悊

```python
import json
import csv
from pathlib import Path

# === JSON ===
data = {"name": "Alice", "scores": [95, 87, 72]}

# 搴忓垪鍖?json_str = json.dumps(data, ensure_ascii=False, indent=2)
Path("data.json").write_text(json_str, encoding="utf-8")

# 鍙嶅簭鍒楀寲
loaded = json.loads(Path("data.json").read_text(encoding="utf-8"))

# === CSV ===
with open("data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerow({"name": "Alice", "score": 95})

with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)

# === TOML (Python 3.11+) ===
import tomllib  # 鍙读锛孭ython 3.11+
with open("config.toml", "rb") as f:
    config = tomllib.load(f)
```

---

## 浠ｇ爜绀轰緥

鍙傝 [`examples/01-string-methods.py`](./examples/01-string-methods.py) | [`examples/02-fstring.py`](./examples/02-fstring.py) | [`examples/03-pathlib.py`](./examples/03-pathlib.py) | [`examples/04-file-formats.py`](./examples/04-file-formats.py)

---

## 鏈€浣冲疄璺?
```python
# 鉁?1. 鎬绘槸鎸囧畾缂栫爜
open("file.txt", encoding="utf-8")

# 鉁?2. 鐢?f-string 鏍煎紡鍖?print(f"Hello, {name}!")

# 鉁?3. 鐢?pathlib 澶勭悊璺緞
from pathlib import Path
config = Path.home() / ".config" / "app.toml"

# 鉁?4. 鐢?with 璇彞绠＄悊鏂囦欢
with open("data.txt") as f: ...

# 鉁?5. 澶ф枃浠堕€愯璇诲彇
with open("huge.txt") as f:
    for line in f:  # 涓嶄細涓€娆℃€ц读鍏ュ唴瀛?        process(line)
```

---

## 甯歌闄烽槺

### 闄烽槺 1锛氬繕璁版寚瀹氱紪鐮?
```python
# 鉂?Windows 榛樿缂栫爜涓嶆槸 UTF-8
open("data.txt")  # 鍙兘鐢?GBK 璇诲彇 UTF-8 鏂囦欢锛?
# 鉁?鎬绘槸鎸囧畾 encoding
open("data.txt", encoding="utf-8")
```

### 闄烽槺 2锛氬瓧绗︿覆鎷兼帴鎬ц兘

```python
# 鉂?寰幆涓敤 + 鎷兼帴瀛楃涓诧紙姣忔鍒涘缓鏂板璞★級
result = ""
for word in words:
    result += word + " "  # O(n^2)

# 鉁?鐢?join()
result = " ".join(words)  # O(n)
```

### 闄烽槺 3锛歐indows 璺緞鍒嗛殧绗?
```python
# 鉂?纭紪鐮佽矾寰勫垎闅旂
path = "C:\\Users\\alice\\file.txt"

# 鉁?鐢?pathlib锛堣嚜鍔ㄥ鐞嗗垎闅旂锛?from pathlib import Path
path = Path("C:/Users/alice/file.txt")
# 鎴?path = Path.home() / "file.txt"
```

---

## 缁冧範棰?
### 缁冧範 1锛氬崟璇嶈鏁板櫒

璇诲彇涓€娈垫枃鏈紝缁熻鍗曡瘝鏁般€佽鏁般€佸瓧绗︽暟銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
from pathlib import Path

def count_text(text: str) -> dict:
    lines = text.split("\n")
    words = text.split()
    return {"lines": len(lines), "words": len(words), "chars": len(text)}

text = "Hello World\nPython is great\nLet us code"
print(count_text(text))
```

</details>

### 缁冧範 2锛欳SV 杞?JSON

璇诲彇 CSV 鏂囦欢锛岃浆鎹负 JSON 鏍煎紡銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
import csv, json
from io import StringIO

csv_data = "name,age,city\nAlice,30,Beijing\nBob,25,Shanghai"
reader = csv.DictReader(StringIO(csv_data))
result = [row for row in reader]
print(json.dumps(result, ensure_ascii=False, indent=2))
```

</details>

---

## 鍙傝€冭祫婧?
- [Python 瀹樻柟鏂囨。 - 瀛楃涓叉柟娉昡(https://docs.python.org/3/library/stdtypes.html#string-methods)
- [Python 瀹樻柟鏂囨。 - pathlib](https://docs.python.org/3/library/pathlib.html)
- [Python 瀹樻柟鏂囨。 - json](https://docs.python.org/3/library/json.html)
- [Real Python - f-string](https://realpython.com/python-f-strings/)

---

## 涓嬩竴姝?
浣犵幇鍦ㄦ帉鎻′簡瀛楃涓插拰鏂囦欢鎿嶄綔銆傛帴涓嬫潵瀛︿範寮傚父澶勭悊鈥斺€斿綋浜嬫儏鍑洪敊鏃讹紝濡備綍浼橀泤鍦板鐞嗐€?
**[馃憠 绗?6 绔狅細寮傚父澶勭悊涓庤皟璇昡(../06-exceptions-debugging/)**