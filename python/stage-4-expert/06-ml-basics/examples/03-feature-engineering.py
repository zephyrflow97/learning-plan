"""
鐗瑰緛宸ョ▼绀轰緥
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer

def demo_scaling():
    print("=== 鐗瑰緛缂╂斁 ===")
    data = np.array([[25, 50000], [30, 80000], [22, 35000], [45, 120000]])
    print(f"鍘熷鏁版嵁:\n{data}")

    scaler = StandardScaler()
    scaled = scaler.fit_transform(data)
    print(f"\nStandardScaler (鍧囧€?0, 鏂瑰樊=1):\n{scaled}")

    minmax = MinMaxScaler()
    normalized = minmax.fit_transform(data)
    print(f"\nMinMaxScaler (0~1):\n{normalized}")

def demo_encoding():
    print("\n=== 绫诲埆缂栫爜 ===")
    df = pd.DataFrame({
        "color": ["red", "blue", "green", "red", "blue"],
        "size": ["S", "M", "L", "M", "L"],
    })
    print(f"鍘熷鏁版嵁:\n{df}")

    # One-Hot 缂栫爜
    encoder = OneHotEncoder(sparse_output=False)
    encoded = encoder.fit_transform(df)
    print(f"\nOne-Hot:\n{encoded}")
    print(f"鐗瑰緛鍚? {encoder.get_feature_names_out()}")

def demo_imputation():
    print("\n=== 缂哄け鍊煎鐞?===")
    data = np.array([[1, 2, np.nan], [3, np.nan, 6], [7, 8, 9], [np.nan, 5, 3]])
    print(f"鍘熷鏁版嵁:\n{data}")

    # 鍧囧€煎～鍏?    imp_mean = SimpleImputer(strategy="mean")
    filled = imp_mean.fit_transform(data)
    print(f"\n鍧囧€煎～鍏?\n{filled}")

    # 涓綅鏁板～鍏?    imp_median = SimpleImputer(strategy="median")
    filled = imp_median.fit_transform(data)
    print(f"\n涓綅鏁板～鍏?\n{filled}")

def demo_column_transformer():
    print("\n=== ColumnTransformer ===")
    df = pd.DataFrame({
        "age": [25, 30, None, 45],
        "salary": [50000, 80000, 35000, None],
        "department": ["Engineering", "Marketing", "Engineering", "HR"],
        "city": ["Beijing", "Shanghai", "Beijing", "Guangzhou"],
    })
    print(f"鍘熷鏁版嵁:\n{df}")

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", SimpleImputer(strategy="median"), ["age", "salary"]),
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["department", "city"]),
        ]
    )

    result = preprocessor.fit_transform(df)
    print(f"\n澶勭悊鍚?shape: {result.shape}")
    print(f"澶勭悊鍚?\n{result}")

if __name__ == "__main__":
    demo_scaling()
    demo_encoding()
    demo_imputation()
    demo_column_transformer()
