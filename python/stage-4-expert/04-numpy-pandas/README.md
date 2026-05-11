# 绗?4 绔狅細鏁版嵁绉戝 鈥?NumPy + Pandas

> *"In God we trust; all others must bring data."*
> 鈥?W. Edwards Deming
>
> 鏁版嵁绉戝鐨勭涓€姝ヤ笉鏄缓妯♀€斺€旀槸**鐞嗚В鏁版嵁**銆?> NumPy 缁欎綘楂樻晥璁＄畻鐨勫紩鎿庯紝Pandas 缁欎綘鎿嶇旱鏁版嵁鐨勭憺澹啗鍒€銆?
---

## 馃摉 鏈珷鍐呭

- [1. NumPy 鍩虹](#1-numpy-鍩虹)
- [2. NumPy 楂樼骇](#2-numpy-楂樼骇)
- [3. Pandas 鍩虹](#3-pandas-鍩虹)
- [4. Pandas 楂樼骇](#4-pandas-楂樼骇)
- [5. 鏃堕棿搴忓垪](#5-鏃堕棿搴忓垪)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [甯歌闄烽槺](#甯歌闄烽槺)
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?

---

## 1. NumPy 鍩虹

> 馃幁 **The Drama: 涓轰粈涔?Python 闇€瑕?NumPy**
>
> Python 鐨勫垪琛ㄦ槸閫氱敤瀹瑰櫒鈥斺€旀瘡涓厓绱犻兘鏄竴涓?Python 瀵硅薄锛堟湁寮曠敤璁℃暟銆佺被鍨嬫寚閽堢瓑寮€閿€锛夈€?> 瀵?1000 涓囦釜鏁板瓧鍋氬姞娉曪紝Python 鍒楄〃闇€瑕?1000 涓囨绫诲瀷妫€鏌ャ€佸嚱鏁拌皟鐢ㄣ€佽绠辨媶绠便€?>
> NumPy 鐨?`ndarray` 鏄繛缁殑鍐呭瓨鍧楋紝瀛樺偍鐨勬槸鍘熷鏁板€硷紙C 鐨?`double`/`int`锛夈€?> 鍚戦噺鍖栨搷浣滅洿鎺ュ湪 C 灞傞潰鎵归噺澶勭悊鈥斺€?*娌℃湁 Python 瑙ｉ噴鍣ㄧ殑寮€閿€**銆?>
> 杩欎笉鏄畻娉曚紭鍖栵紝杩欐槸**鎵ц灞傞潰鐨勯檷缁存墦鍑?*銆?
### 1.1 ndarray 鍒涘缓

```python
import numpy as np

# 鉁?浠庡垪琛ㄥ垱寤?arr = np.array([1, 2, 3, 4, 5])
print(arr.dtype)   # int64
print(arr.shape)   # (5,)

# 鉁?甯哥敤鍒涘缓鍑芥暟
zeros = np.zeros((3, 4))          # 3x4 鍏ㄩ浂鐭╅樀
ones = np.ones((2, 3))            # 2x3 鍏ㄤ竴鐭╅樀
arange = np.arange(0, 10, 2)     # [0, 2, 4, 6, 8]
linspace = np.linspace(0, 1, 5)  # [0, 0.25, 0.5, 0.75, 1.0]
rand = np.random.randn(3, 3)     # 3x3 鏍囧噯姝ｆ€佸垎甯?
# 鉁?鏁版嵁绫诲瀷
arr_f32 = np.array([1.0, 2.0], dtype=np.float32)  # 鎸囧畾绫诲瀷
arr_int = np.array([1.5, 2.7]).astype(np.int32)    # 绫诲瀷杞崲
```

### 1.2 鍚戦噺鍖栨搷浣?
```python
# 鉂?Python 寰幆 鈥?鎱?result = []
for x in range(1_000_000):
    result.append(x ** 2 + 2 * x + 1)

# 鉁?NumPy 鍚戦噺鍖?鈥?蹇?50-100 鍊?x = np.arange(1_000_000)
result = x ** 2 + 2 * x + 1  # 鏁翠釜鏁扮粍涓€娆℃€ц绠?
# 鉁?姣旇緝杩愮畻锛堣繑鍥炲竷灏旀暟缁勶級
data = np.array([1, 5, 3, 8, 2, 9])
mask = data > 4           # [False, True, False, True, False, True]
filtered = data[mask]     # [5, 8, 9] 鈥?甯冨皵绱㈠紩
```

### 1.3 Broadcasting

> 鈿涳笍 **The Science: Broadcasting 瑙勫垯**
>
> 褰撲袱涓笉鍚屽舰鐘剁殑鏁扮粍杩愮畻鏃讹紝NumPy 浼氳嚜鍔?骞挎挱"杈冨皬鐨勬暟缁勶細
>
> **瑙勫垯**锛?> 1. 缁村害浠庡彸鍚戝乏瀵归綈
> 2. 缁村害涓?1 鐨勬柟鍚戣嚜鍔ㄦ墿灞?> 3. 缁村害涓嶅吋瀹规椂鎶ラ敊
>
> ```
> (4, 3) + (3,)   鈫?(4, 3) + (1, 3) 鈫?(4, 3)  鉁?> (4, 3) + (4, 1) 鈫?(4, 3)                       鉁?> (4, 3) + (4,)   鈫?鎶ラ敊锛? != 4                 鉂?> ```

```python
# Broadcasting 绀轰緥
matrix = np.array([[1, 2, 3],
                   [4, 5, 6]])     # shape: (2, 3)
row = np.array([10, 20, 30])       # shape: (3,)

result = matrix + row  # row 琚箍鎾负 (2, 3)
# [[11, 22, 33],
#  [14, 25, 36]]

# 鏍囧噯鍖栵細姣忓垪鍑忓幓鍧囧€?data = np.random.randn(100, 5)  # 100 琛?5 鍒?means = data.mean(axis=0)       # shape: (5,)
normalized = data - means        # Broadcasting!
```

---

## 2. NumPy 楂樼骇

### 绾挎€т唬鏁?
```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 鐭╅樀涔樻硶
C = A @ B            # 鎴?np.dot(A, B)
C = np.matmul(A, B)  # 绛変环

# 绾挎€т唬鏁版搷浣?det = np.linalg.det(A)            # 琛屽垪寮?inv = np.linalg.inv(A)            # 閫嗙煩闃?eigenvalues, eigenvectors = np.linalg.eig(A)  # 鐗瑰緛鍊煎垎瑙?U, S, Vt = np.linalg.svd(A)      # SVD 鍒嗚В
```

---

## 3. Pandas 鍩虹

> 馃 **CS Master's Bridge: Pandas 鐨勬湰璐?*
>
> Pandas 鐨勬牳蹇冩暟鎹粨鏋勶細
> - **Series** = 甯︽爣绛剧殑涓€缁存暟缁勶紙绫讳技 dict + array锛?> - **DataFrame** = 甯︽爣绛剧殑浜岀淮琛ㄦ牸锛堢被浼?SQL 琛?/ Excel 琛級
>
> Pandas 涓嶆槸鏁版嵁搴撯€斺€斿畠鏄?*鍐呭瓨涓殑鏁版嵁鎿嶄綔宸ュ叿**銆?> 閫傚悎澶勭悊鍑犵櫨 MB 浠ュ唴鐨勬暟鎹€傛洿澶х殑鏁版嵁鐢?Spark/Dask/Polars銆?
### 3.1 鏁版嵁鍔犺浇

```python
import pandas as pd

# 鉁?浠庡悇绉嶆暟鎹簮鍔犺浇
df_csv = pd.read_csv("data.csv")
df_json = pd.read_json("data.json")
df_excel = pd.read_excel("data.xlsx")
df_sql = pd.read_sql("SELECT * FROM users", connection)

# 鉁?蹇€熸煡鐪嬫暟鎹?print(df.shape)          # (琛屾暟, 鍒楁暟)
print(df.dtypes)         # 姣忓垪鏁版嵁绫诲瀷
print(df.describe())     # 缁熻鎽樿
print(df.head())         # 鍓?5 琛?print(df.info())         # 鍐呭瓨浣跨敤鍜岄潪绌鸿鏁?```

### 3.2 鏁版嵁閫夋嫨

```python
# 鉁?鍒楅€夋嫨
df["name"]           # 鍗曞垪锛堣繑鍥?Series锛?df[["name", "age"]]  # 澶氬垪锛堣繑鍥?DataFrame锛?
# 鉁?琛岄€夋嫨
df.loc[0]                    # 鎸夋爣绛?df.iloc[0]                   # 鎸変綅缃?df.loc[0:5, "name":"age"]   # 鏍囩鍒囩墖

# 鉁?鏉′欢杩囨护
adults = df[df["age"] >= 18]
rich_adults = df[(df["age"] >= 18) & (df["income"] > 50000)]
# 娉ㄦ剰锛氱敤 & 鍜?| 鑰岄潪 and 鍜?or锛屼笖蹇呴』鍔犳嫭鍙?```

### 3.3 鏁版嵁娓呮礂

```python
# 鉁?缂哄け鍊煎鐞?df.isnull().sum()              # 姣忓垪缂哄け鍊艰鏁?df.dropna()                    # 鍒犻櫎鍚己澶卞€肩殑琛?df.fillna(0)                   # 鐢?0 濉厖
df["age"].fillna(df["age"].median(), inplace=True)  # 鐢ㄤ腑浣嶆暟濉厖

# 鉁?閲嶅鍊?df.duplicated().sum()          # 閲嶅琛屾暟
df.drop_duplicates()           # 鍒犻櫎閲嶅

# 鉁?绫诲瀷杞崲
df["age"] = df["age"].astype(int)
df["date"] = pd.to_datetime(df["date"])
```

### 3.4 鍒嗙粍鑱氬悎

```python
# 鉁?GroupBy 鈥?鍒嗙粍鑱氬悎
grouped = df.groupby("department")
print(grouped["salary"].mean())       # 姣忎釜閮ㄩ棬鐨勫钩鍧囪柂璧?print(grouped["salary"].agg(["mean", "median", "std"]))  # 澶氫釜鑱氬悎

# 鉁?鑷畾涔夎仛鍚?result = df.groupby("department").agg(
    avg_salary=("salary", "mean"),
    max_salary=("salary", "max"),
    headcount=("id", "count"),
)

# 鉁?閫忚琛?pivot = df.pivot_table(
    values="salary",
    index="department",
    columns="level",
    aggfunc="mean",
)
```

### 3.5 鍚堝苟

```python
# 鉁?merge 鈥?绫讳技 SQL JOIN
merged = pd.merge(df_users, df_orders, on="user_id", how="left")

# 鉁?concat 鈥?鍨傜洿/姘村钩鎷兼帴
combined = pd.concat([df1, df2], axis=0)       # 鍨傜洿鎷兼帴
combined = pd.concat([df1, df2], axis=1)       # 姘村钩鎷兼帴
```

---

## 4. Pandas 楂樼骇

### apply 涓?transform

```python
# 鉁?apply 鈥?瀵规瘡琛?姣忓垪搴旂敤鍑芥暟
df["name_upper"] = df["name"].apply(str.upper)

# 鉁?transform 鈥?淇濇寔褰㈢姸涓嶅彉鐨勫彉鎹紙閫傚悎鍒嗙粍鍚庝娇鐢級
df["salary_zscore"] = df.groupby("dept")["salary"].transform(
    lambda x: (x - x.mean()) / x.std()
)
```

### 閾惧紡鎿嶄綔

```python
# 鉁?鎺ㄨ崘锛氭柟娉曢摼
result = (
    df
    .query("age >= 18")
    .assign(salary_k=lambda x: x["salary"] / 1000)
    .groupby("department")
    .agg(avg_salary_k=("salary_k", "mean"))
    .sort_values("avg_salary_k", ascending=False)
    .head(10)
)
```

---

## 5. 鏃堕棿搴忓垪

```python
# 鉁?鏃堕棿绱㈠紩
dates = pd.date_range("2024-01-01", periods=365, freq="D")
ts = pd.Series(np.random.randn(365), index=dates)

# 鉁?閲嶉噰鏍?monthly = ts.resample("M").mean()       # 鏈堝潎鍊?weekly = ts.resample("W").sum()         # 鍛ㄦ€诲拰

# 鉁?绉诲姩绐楀彛
rolling_mean = ts.rolling(window=7).mean()   # 7 澶╃些鍔ㄥ钩鍧?expanding_sum = ts.expanding().sum()          # 绱Н鍜?
# 鉁?鏃堕棿鍒囩墖
jan_data = ts["2024-01"]                     # 鏁翠釜涓€鏈?q1_data = ts["2024-01":"2024-03"]            # 绗竴瀛ｅ害
```

---

## 鏈€浣冲疄璺?
1. **鍚戦噺鍖栦紭鍏?* 鈥?姘歌繙浼樺厛浣跨敤 NumPy/Pandas 鐨勫悜閲忓寲鎿嶄綔锛岃€岄潪 Python 寰幆
2. **鏌ョ湅 dtypes** 鈥?纭繚鍒楃殑鏁版嵁绫诲瀷姝ｇ‘锛宍object` 绫诲瀷寰€寰€鎰忓懗鐫€闇€瑕佽浆鎹?3. **閾惧紡鎿嶄綔** 鈥?鐢ㄦ柟娉曢摼鎻愰珮鍙读鎬э紝閬垮厤涓棿鍙橀噺
4. **鍐呭瓨绠＄悊** 鈥?澶ф暟鎹泦鐢?`float32` 鑰岄潪 `float64`锛涚敤 `category` 绫诲瀷澶勭悊浣庡熀鏁板瓧绗︿覆鍒?5. **copy 娉ㄦ剰** 鈥?`df2 = df` 鏄鍥撅紝`df2 = df.copy()` 鏄壇鏈?
---

## 甯歌闄烽槺

### 闄烽槺 1锛歋ettingWithCopyWarning

```python
# 鉂?閾惧紡绱㈠紩璧嬪€?鈥?鍙兘淇敼鐨勬槸鍓湰
df[df["age"] > 18]["name"] = "adult"  # Warning!

# 鉁?浣跨敤 .loc
df.loc[df["age"] > 18, "name"] = "adult"
```

### 闄烽槺 2锛氱敤 `and`/`or` 鍋氬竷灏旇繃婊?
```python
# 鉂?Python 鐨?and/or 涓嶈兘鐢ㄤ簬 Series
df[(df["age"] > 18) and (df["salary"] > 50000)]  # ValueError!

# 鉁?鐢?& 鍜?|锛堣寰楀姞鎷彿锛?df[(df["age"] > 18) & (df["salary"] > 50000)]
```

---

## 缁冧範棰?
<details>
<summary><b>缁冧範 1锛歂umPy 鐭╅樀杩愮畻</b></summary>

鍒涘缓涓€涓?100x100 鐨勯殢鏈虹煩闃碉紝璁＄畻鍏剁壒寰佸€煎拰琛屽垪寮忋€?
</details>

<details>
<summary><b>缁冧範 2锛歅andas 鏁版嵁娓呮礂</b></summary>

缁欏畾涓€涓惈缂哄け鍊煎拰閲嶅鍊肩殑 DataFrame锛屽畬鎴愬畬鏁寸殑娓呮礂娴佺▼銆?
</details>

<details>
<summary><b>缁冧範 3锛氶攢鍞暟鎹垎鏋?/b></summary>

鍒嗘瀽涓€涓攢鍞暟鎹泦锛氭寜鏈堟眹鎬汇€佽绠楃幆姣斿闀跨巼銆佹壘鍑?Top 10 浜у搧銆?
</details>

---

## 鍙傝€冭祫婧?
- [NumPy 瀹樻柟鏂囨。](https://numpy.org/doc/) 鈥?鍏ㄩ潰鍙傝€?- [Pandas 瀹樻柟鏂囨。](https://pandas.pydata.org/docs/) 鈥?瀹樻柟鏁欑▼鍜?API
- [Python for Data Analysis (Wes McKinney)](https://wesmckinney.com/book/) 鈥?Pandas 浣滆€呯殑涔?- [100 NumPy Exercises](https://github.com/rougier/numpy-100) 鈥?缁冧範闆?
---

**[馃憠 绗?5 绔狅細鏁版嵁鍙鍖朷(../05-data-visualization/)**

[猬咃笍 杩斿洖 Stage 4 鐩綍](../README.md)
