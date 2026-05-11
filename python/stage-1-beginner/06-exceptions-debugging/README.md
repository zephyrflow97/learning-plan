# 绗?6 绔狅細寮傚父澶勭悊涓庤皟璇?鈥?褰撲簨鎯呬笉鎸夎鍒掕繘琛?
> *"Errors should never pass silently. Unless explicitly silenced."*
> 鈥?The Zen of Python, Line 10
>
> 瀹岀編鐨勪唬鐮佷笉瀛樺湪銆傜綉缁滀細鏂€佹枃浠朵細涓€佺敤鎴蜂細杈撳叆绂昏氨鐨勬暟鎹€?> 寮傚父澶勭悊涓嶆槸涓哄け璐ュ仛鍑嗗鈥斺€斿畠鏄负**浼橀泤鍦板鐞嗗け璐?*鍋氬噯澶囥€?
## 馃摉 鏈珷鍐呭

- [1. 寮傚父灞傛缁撴瀯](#1-寮傚父灞傛缁撴瀯)
- [2. try/except/else/finally](#2-tryexceptelsefinally)
- [3. 鑷畾涔夊紓甯哥被](#3-鑷畾涔夊紓甯哥被)
- [4. EAFP vs LBYL](#4-eafp-vs-lbyl)
- [5. 璋冭瘯鎶€宸(#5-璋冭瘯鎶€宸?
- [6. 甯歌寮傚父閫熸煡琛╙(#6-甯歌寮傚父閫熸煡琛?
- [浠ｇ爜绀轰緥](#浠ｇ爜绀轰緥)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [甯歌闄烽槺](#甯歌闄烽槺)
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?
- [涓嬩竴姝(#涓嬩竴姝?

---

## 1. 寮傚父灞傛缁撴瀯

> 鈿涳笍 **The Science: Python 寮傚父鏄被缁ф壙浣撶郴**
>
> Python 鐨勫紓甯告槸涓€涓被缁ф壙鏍戯紝鏍硅妭鐐规槸 `BaseException`銆?> 鏃ュ父缂栫▼涓彧闇€瑕佸叧娉?`Exception` 鍙婂叾瀛愮被銆?> `KeyboardInterrupt` 鍜?`SystemExit` 涓嶆槸 `Exception` 鐨勫瓙绫烩€斺€?> 杩欐剰鍛崇潃 `except Exception` 涓嶄細鎹曡幏 Ctrl+C銆?
```
BaseException
鈹溾攢鈹€ SystemExit              # sys.exit() 鎶涘嚭
鈹溾攢鈹€ KeyboardInterrupt       # Ctrl+C
鈹溾攢鈹€ GeneratorExit           # 鐢熸垚鍣ㄥ叧闂?鈹斺攢鈹€ Exception               # 鎵€鏈?姝ｅ父"寮傚父鐨勫熀绫?    鈹溾攢鈹€ ArithmeticError
    鈹?  鈹溾攢鈹€ ZeroDivisionError
    鈹?  鈹斺攢鈹€ OverflowError
    鈹溾攢鈹€ LookupError
    鈹?  鈹溾攢鈹€ IndexError
    鈹?  鈹斺攢鈹€ KeyError
    鈹溾攢鈹€ ValueError
    鈹溾攢鈹€ TypeError
    鈹溾攢鈹€ AttributeError
    鈹溾攢鈹€ OSError
    鈹?  鈹溾攢鈹€ FileNotFoundError
    鈹?  鈹溾攢鈹€ PermissionError
    鈹?  鈹斺攢鈹€ IsADirectoryError
    鈹溾攢鈹€ RuntimeError
    鈹?  鈹斺攢鈹€ RecursionError
    鈹斺攢鈹€ StopIteration
```

---

## 2. try/except/else/finally

> 馃幁 **The Drama: 鍥涗釜瀛愬彞鐨勫畬鏁磋涔?*
>
> - `try`: 灏濊瘯鎵ц鐨勪唬鐮?> - `except`: 寮傚父鍙戠敓鏃舵墽琛?> - `else`: **娌℃湁**寮傚父鏃舵墽琛岋紙寰堝浜轰笉鐭ラ亾杩欎釜锛侊級
> - `finally`: **鏃犺濡備綍**閮芥墽琛岋紙娓呯悊璧勬簮锛?
```python
def safe_divide(a: float, b: float) -> float | None:
    try:
        result = a / b                    # 灏濊瘯鎵ц
    except ZeroDivisionError:
        print("[寮傚父] 闄ゆ暟涓嶈兘涓洪浂")       # 闄ら浂鏃舵墽琛?        return None
    except TypeError as e:
        print(f"[寮傚父] 绫诲瀷閿欒: {e}")     # 绫诲瀷閿欒鏃舵墽琛?        return None
    else:
        print(f"[寮傚父] 璁＄畻鎴愬姛: {result}") # 娌℃湁寮傚父鏃舵墽琛?        return result
    finally:
        print("[寮傚父] 娓呯悊瀹屾垚")            # 鎬绘槸鎵ц

# 澶氫釜寮傚父鍙互鍚堝苟鎹曡幏
try:
    ...
except (ValueError, TypeError, KeyError) as e:
    print(f"鎹曡幏: {type(e).__name__}: {e}")

# 閲嶆柊鎶涘嚭寮傚父
try:
    risky_operation()
except SomeError:
    log_error()
    raise  # 閲嶆柊鎶涘嚭鍘熷寮傚父
```

---

## 3. 鑷畾涔夊紓甯哥被

> 馃О **Toolbox: 涓轰綘鐨勫簲鐢ㄥ垱寤哄紓甯稿眰娆?*
>
> 濂界殑瀹炶返鏄负搴旂敤瀹氫箟涓€涓熀纭€寮傚父绫伙紝鎵€鏈変笟鍔″紓甯搁兘缁ф壙瀹冦€?> 杩欐牱澶栭儴璋冪敤鑰呭彲浠ョ敤涓€涓?`except AppError` 鎹曡幏鎵€鏈変笟鍔″紓甯搞€?
```python
# 搴旂敤寮傚父灞傛
class AppError(Exception):
    """搴旂敤绋嬪簭鍩虹寮傚父"""
    pass

class ValidationError(AppError):
    """鏁版嵁楠岃瘉閿欒"""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"楠岃瘉閿欒 [{field}]: {message}")

class NotFoundError(AppError):
    """璧勬簮涓嶅瓨鍦?""
    def __init__(self, resource: str, identifier):
        self.resource = resource
        self.identifier = identifier
        super().__init__(f"{resource} 涓嶅瓨鍦? {identifier}")

# 浣跨敤
def create_user(name: str, age: int) -> dict:
    if len(name) < 2:
        raise ValidationError("name", "鑷冲皯 2 涓瓧绗?)
    if age < 0:
        raise ValidationError("age", "涓嶈兘涓鸿礋")
    return {"name": name, "age": age}
```

---

## 4. EAFP vs LBYL

> 馃寣 **The Big Picture: Python 鐨勭嫭鐗归敊璇鐞嗗摬瀛?*
>
> **LBYL** (Look Before You Leap): 鍏堟鏌ワ紝鍐嶆搷浣溿€侸ava/C++ 鐨勪範鎯€?> **EAFP** (Easier to Ask Forgiveness than Permission): 鍏堟搷浣滐紝鍑洪敊鍐嶅鐞嗐€侾ython 鐨勫摬瀛︺€?>
> EAFP 鍦?Python 涓洿濂界殑鍘熷洜锛?> 1. **鎬ц兘**: 閫氬父鎴愬姛鐨勫満鏅笅锛岄伩鍏嶄簡澶氫綑鐨勬鏌?> 2. **鍘熷瓙鎬?*: LBYL 鏈?TOCTOU 绔炴€佹潯浠?> 3. **楦瓙绫诲瀷**: 涓嶆鏌ョ被鍨嬶紝灏濊瘯浣跨敤鈥斺€旇蛋璺儚楦瓙灏辨槸楦瓙

```python
# LBYL 椋庢牸
if "key" in dictionary:
    value = dictionary["key"]
else:
    value = default

# EAFP 椋庢牸
try:
    value = dictionary["key"]
except KeyError:
    value = default

# 鏈€ Pythonic
value = dictionary.get("key", default)
```

| 瀵规瘮 | LBYL | EAFP |
|------|------|------|
| 鍝插 | 涓夋€濊€屽悗琛?| 鍏堟柀鍚庡 |
| 椋庢牸 | Java/C++ | Python |
| 鎬ц兘 | 妫€鏌ユ湁寮€閿€ | 鏃犲紓甯告椂鏇村揩 |
| 绔炴€?| 鏈?TOCTOU | 鍘熷瓙鎬ф洿濂?|
| 楦瓙绫诲瀷 | 涓嶆敮鎸?| 澶╃劧鏀寔 |

---

## 5. 璋冭瘯鎶€宸?
### 5.1 print 璋冭瘯

```python
# 鏈€绠€鍗曠洿鎺ョ殑璋冭瘯鏂瑰紡
def buggy_function(data):
    print(f"[DEBUG] data = {data}")        # 鏌ョ湅杈撳叆
    result = process(data)
    print(f"[DEBUG] result = {result}")     # 鏌ョ湅杈撳嚭
    return result
```

### 5.2 logging 妯″潡

```python
import logging

logging.basicConfig(level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s")

logger = logging.getLogger(__name__)

logger.debug("璇︾粏璋冭瘯淇℃伅")
logger.info("姝ｅ父杩愯淇℃伅")
logger.warning("璀﹀憡淇℃伅")
logger.error("閿欒淇℃伅")
logger.critical("涓ラ噸閿欒")
```

### 5.3 breakpoint()

```python
# Python 3.7+ 鍐呯疆璋冭瘯鍣ㄥ叆鍙?def my_function(x):
    breakpoint()  # 鍦ㄨ繖閲屾殏鍋滐紝杩涘叆 pdb 浜や簰妯″紡
    return x * 2

# pdb 甯哥敤鍛戒护:
# n (next)     鈥?涓嬩竴琛?# s (step)     鈥?杩涘叆鍑芥暟
# c (continue) 鈥?缁х画鎵ц
# p expr       鈥?鎵撳嵃琛ㄨ揪寮?# l (list)     鈥?鏄剧ず浠ｇ爜
# q (quit)     鈥?閫€鍑?```

| 璋冭瘯鏂瑰紡 | 閫傜敤鍦烘櫙 | 浼樼偣 | 缂虹偣 |
|---------|---------|------|------|
| `print()` | 蹇€熸鏌?| 绠€鍗?| 闇€瑕佹墜鍔ㄥ垹闄?|
| `logging` | 鐢熶骇鐜 | 鍙厤缃骇鍒?| 闇€瑕佽缃?|
| `breakpoint()` | 澶嶆潅 bug | 浜や簰寮?| 闇€瑕佷簡瑙?pdb |
| VS Code 鏂偣 | 鏃ュ父寮€鍙?| 鍙鍖?| 渚濊禆 IDE |

---

## 6. 甯歌寮傚父閫熸煡琛?
| 寮傚父 | 瑙﹀彂鏉′欢 | 绀轰緥 |
|------|---------|------|
| `ValueError` | 鍊间笉鍚堟硶 | `int("abc")` |
| `TypeError` | 绫诲瀷涓嶅尮閰?| `"hello" + 42` |
| `IndexError` | 绱㈠紩瓒婄晫 | `[1,2][10]` |
| `KeyError` | 閿笉瀛樺湪 | `{}["key"]` |
| `AttributeError` | 灞炴€т笉瀛樺湪 | `"hello".foo` |
| `ZeroDivisionError` | 闄や互闆?| `1 / 0` |
| `FileNotFoundError` | 鏂囦欢涓嶅瓨鍦?| `open("no.txt")` |
| `ImportError` | 瀵煎叆澶辫触 | `import nonexistent` |
| `StopIteration` | 杩唬鍣ㄨ€楀敖 | `next(iter([]))` |
| `RecursionError` | 閫掑綊杩囨繁 | 瓒呰繃閫掑綊闄愬埗 |

---

## 浠ｇ爜绀轰緥

鍙傝 [`examples/01-exception-hierarchy.py`](./examples/01-exception-hierarchy.py) | [`examples/02-custom-exceptions.py`](./examples/02-custom-exceptions.py) | [`examples/03-eafp-vs-lbyl.py`](./examples/03-eafp-vs-lbyl.py) | [`examples/04-debugging.py`](./examples/04-debugging.py)

---

## 鏈€浣冲疄璺?
```python
# 鉁?1. 鎹曡幏鍏蜂綋寮傚父锛屼笉瑕?except Exception
try:
    value = int(user_input)
except ValueError:
    print("璇疯緭鍏ユ暟瀛?)

# 鉁?2. 浣跨敤 else 鍒嗙姝ｅ父閫昏緫
try:
    data = load_file()
except FileNotFoundError:
    data = default_data
else:
    process(data)  # 鍙湪鍔犺浇鎴愬姛鏃舵墽琛?
# 鉁?3. 浣跨敤 finally 娓呯悊璧勬簮
# 锛堜絾鏇存帹鑽愮敤 with 璇彞锛?
# 鉁?4. 鑷畾涔夊紓甯哥户鎵?Exception
class MyError(Exception): ...

# 鉁?5. 浣跨敤 raise ... from ... 淇濈暀寮傚父閾?raise NewError("message") from original_error
```

---

## 甯歌闄烽槺

### 闄烽槺 1锛氳８ except

```python
# 鉂?鎹曡幏鎵€鏈夊紓甯革紙鍖呮嫭 KeyboardInterrupt锛?try:
    ...
except:  # 瑁?except锛屾案杩滀笉瑕佽繖鏍峰仛
    pass

# 鉂?涔熶笉濂斤細except Exception 鍔?pass
try:
    ...
except Exception:
    pass  # 鍚炴帀寮傚父锛宒ebug 鍣╂ⅵ

# 鉁?鎹曡幏鍏蜂綋寮傚父
try:
    ...
except (ValueError, KeyError) as e:
    logger.error(f"澶勭悊澶辫触: {e}")
```

### 闄烽槺 2锛氬湪 except 涓剰澶栬鐩栧紓甯?
```python
# 鉂?except 鍧椾腑鍙堟姏鍑哄紓甯革紝涓㈠け鍘熷淇℃伅
try:
    data = load_data()
except FileNotFoundError:
    raise RuntimeError("鍔犺浇澶辫触")  # 涓㈠け浜嗗師濮嬪紓甯镐俊鎭?
# 鉁?浣跨敤 from 淇濈暀寮傚父閾?try:
    data = load_data()
except FileNotFoundError as e:
    raise RuntimeError("鍔犺浇澶辫触") from e  # 淇濈暀鍘熷洜
```

---

## 缁冧範棰?
### 缁冧範 1锛氬畨鍏ㄧ殑鏁板瓧杞崲

鍐欎竴涓嚱鏁?`safe_int(value, default=0)`锛屽畨鍏ㄥ湴灏嗗€艰浆鎹负鏁存暟銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
def safe_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

print(safe_int("42"))       # 42
print(safe_int("abc"))      # 0
print(safe_int(None, -1))   # -1
```

</details>

### 缁冧範 2锛氳嚜瀹氫箟寮傚父

涓轰竴涓畝鍗曠殑閾惰璐︽埛绯荤粺鍒涘缓鑷畾涔夊紓甯革細`InsufficientFundsError` 鍜?`InvalidAmountError`銆?
<details>
<summary>馃挕 鍙傝€冪瓟妗?/summary>

```python
class BankError(Exception):
    pass

class InsufficientFundsError(BankError):
    def __init__(self, balance: float, amount: float):
        self.balance = balance
        self.amount = amount
        super().__init__(f"浣欓涓嶈冻: 浣欓 {balance}, 鍙栨 {amount}")

class InvalidAmountError(BankError):
    def __init__(self, amount: float):
        super().__init__(f"閲戦鏃犳晥: {amount}")

class Account:
    def __init__(self, balance: float = 0):
        self.balance = balance

    def withdraw(self, amount: float) -> float:
        if amount <= 0:
            raise InvalidAmountError(amount)
        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)
        self.balance -= amount
        return self.balance

# 娴嬭瘯
account = Account(100)
try:
    account.withdraw(150)
except InsufficientFundsError as e:
    print(e)
```

</details>

---

## 鍙傝€冭祫婧?
- [Python 瀹樻柟鏂囨。 - 寮傚父](https://docs.python.org/3/library/exceptions.html)
- [Python 瀹樻柟鏂囨。 - logging](https://docs.python.org/3/library/logging.html)
- [Python 瀹樻柟鏂囨。 - pdb](https://docs.python.org/3/library/pdb.html)
- [Real Python - 寮傚父澶勭悊](https://realpython.com/python-exceptions/)

---

## 涓嬩竴姝?
浣犲凡缁忓浼氫簡濡備綍浼橀泤鍦板鐞嗛敊璇€傛渶鍚庝竴绔狅紝鎴戜滑灏嗗涔?Pythonic 鎯敤娉曗€斺€旇浣犵殑浠ｇ爜浠?鑳界敤"鍙樻垚"鍦伴亾"銆?
**[馃憠 绗?7 绔狅細Pythonic 鎯敤娉昡(../07-pythonic-idioms/)**