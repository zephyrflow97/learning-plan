# 第 4 章：NumPy 与 Pandas — Python 数据分析核心

> 数据科学的第一步不是建模，而是理解数据。NumPy 提供高效数值计算，Pandas 提供表格数据处理能力。

## 📖 本章内容

- [1. NumPy ndarray](#1-numpy-ndarray)
- [2. 向量化与广播](#2-向量化与广播)
- [3. Pandas Series 与 DataFrame](#3-pandas-series-与-dataframe)
- [4. 数据清洗与分组聚合](#4-数据清洗与分组聚合)
- [5. 时间序列](#5-时间序列)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)

---

## 1. NumPy ndarray

Python 列表是通用容器，元素是 Python 对象；NumPy 数组是连续内存块，适合批量数值计算。

```python
import numpy as np

arr = np.array([1, 2, 3, 4, 5])
zeros = np.zeros((2, 3))
ones = np.ones((2, 3))
matrix = np.arange(12).reshape(3, 4)
random_values = np.random.randn(3, 3)

print(arr.dtype)
print(matrix.shape)
print(matrix.ndim)
```

---

## 2. 向量化与广播

向量化把循环交给 NumPy 的 C 层实现，通常比 Python 循环快很多。

```python
x = np.arange(1_000_000)
result = x ** 2 + 2 * x + 1

data = np.random.randn(100, 5)
means = data.mean(axis=0)
stds = data.std(axis=0)
standardized = (data - means) / stds
```

广播规则从右向左对齐维度：

```text
(4, 3) + (3,)    -> (4, 3)
(4, 3) + (1, 3) -> (4, 3)
(4, 3) + (4, 1) -> (4, 3)
(4, 3) + (4,)   -> 报错
```

### 线性代数

```python
A = np.array([[1, 2], [3, 4]])
b = np.array([1, 0])

det = np.linalg.det(A)
inv = np.linalg.inv(A)
solution = np.linalg.solve(A, b)
eigenvalues, eigenvectors = np.linalg.eig(A)
U, S, Vt = np.linalg.svd(A)
```

---

## 3. Pandas Series 与 DataFrame

`Series` 是带标签的一维数组，`DataFrame` 是带标签的二维表格。

```python
import pandas as pd

df_csv = pd.read_csv("data.csv")
df_json = pd.read_json("data.json")
df_excel = pd.read_excel("data.xlsx")

print(df_csv.shape)
print(df_csv.dtypes)
print(df_csv.describe())
print(df_csv.head())
print(df_csv.info())
```

### 数据选择

```python
df["name"]                 # 单列，返回 Series
df[["name", "age"]]        # 多列，返回 DataFrame

df.loc[0]                  # 按标签
df.iloc[0]                 # 按位置
df.loc[0:5, "name":"age"]  # 标签切片

adults = df[df["age"] >= 18]
rich_adults = df[(df["age"] >= 18) & (df["income"] > 50_000)]
```

---

## 4. 数据清洗与分组聚合

```python
df.isnull().sum()
df = df.dropna()
df["age"] = df["age"].fillna(df["age"].median())

df.duplicated().sum()
df = df.drop_duplicates()

df["age"] = df["age"].astype(int)
df["date"] = pd.to_datetime(df["date"])
```

```python
grouped = df.groupby("department")
print(grouped["salary"].mean())
print(grouped["salary"].agg(["mean", "median", "std"]))

summary = df.groupby("department").agg(
    avg_salary=("salary", "mean"),
    max_salary=("salary", "max"),
    headcount=("id", "count"),
)

pivot = df.pivot_table(
    values="salary",
    index="department",
    columns="level",
    aggfunc="mean",
)
```

---

## 5. 时间序列

```python
dates = pd.date_range("2024-01-01", periods=90, freq="D")
ts = pd.Series(np.random.randn(90), index=dates)

monthly = ts.resample("M").mean()
weekly = ts.resample("W").sum()

rolling_mean = ts.rolling(window=7).mean()
expanding_sum = ts.expanding().sum()

january = ts["2024-01"]
q1 = ts["2024-01":"2024-03"]
```

---

## 最佳实践

- 优先使用向量化操作，不要轻易写 Python 循环。
- 读入数据后先看 `shape`、`dtypes`、`head()`、`describe()`。
- 清洗步骤写成可复用函数，避免一次性脚本失控。
- 大数据集注意内存：合理使用 `category`、`float32`、分块读取。
- Pandas 链式赋值容易产生副本问题，必要时使用 `.copy()`。

## 常见陷阱

```python
# 可能触发 SettingWithCopyWarning
df[df["age"] > 18]["group"] = "adult"

# 推荐
df.loc[df["age"] > 18, "group"] = "adult"
```

## 练习题

1. 创建一个 100x100 随机矩阵，计算特征值和行列式。
2. 读取销售数据，按月汇总并计算环比增长率。
3. 找出销售额 Top 10 产品，并绘制趋势表。

---

## 参考资源

- [NumPy 官方文档](https://numpy.org/doc/)
- [Pandas 官方文档](https://pandas.pydata.org/docs/)
- [Python for Data Analysis](https://wesmckinney.com/book/)
- [100 NumPy Exercises](https://github.com/rougier/numpy-100)
