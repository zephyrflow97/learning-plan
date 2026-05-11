"""
Pandas 鍩虹绀轰緥锛氬垱寤恒€侀€夋嫨銆佽繃婊ゃ€佹竻娲?"""
import pandas as pd
import numpy as np


def demo_creation():
    """DataFrame 鍒涘缓"""
    print("=== DataFrame 鍒涘缓 ===")

    # 浠庡瓧鍏?    df = pd.DataFrame({
        "name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
        "age": [25, 30, 35, 28, 32],
        "city": ["Beijing", "Shanghai", "Beijing", "Guangzhou", "Shanghai"],
        "salary": [15000, 25000, 30000, 20000, 28000],
    })
    print(df)
    print(f"\nshape: {df.shape}")
    print(f"dtypes:\n{df.dtypes}")
    print(f"\ndescribe:\n{df.describe()}")


def demo_selection():
    """鏁版嵁閫夋嫨"""
    print("\n=== 鏁版嵁閫夋嫨 ===")
    df = pd.DataFrame({
        "name": ["Alice", "Bob", "Charlie", "Diana"],
        "age": [25, 30, 35, 28],
        "salary": [15000, 25000, 30000, 20000],
    })

    # 鍒楅€夋嫨
    print(f"鍗曞垪:\n{df['name']}")
    print(f"\n澶氬垪:\n{df[['name', 'salary']]}")

    # 琛岄€夋嫨
    print(f"\nloc[1]:\n{df.loc[1]}")
    print(f"\niloc[0:2]:\n{df.iloc[0:2]}")

    # 鏉′欢杩囨护
    print(f"\nage > 28:\n{df[df['age'] > 28]}")
    print(f"\n澶嶅悎鏉′欢:\n{df[(df['age'] > 25) & (df['salary'] > 20000)]}")


def demo_cleaning():
    """鏁版嵁娓呮礂"""
    print("\n=== 鏁版嵁娓呮礂 ===")
    df = pd.DataFrame({
        "name": ["Alice", "Bob", None, "Diana", "Alice"],
        "age": [25, None, 35, 28, 25],
        "salary": [15000, 25000, 30000, None, 15000],
    })
    print(f"鍘熷鏁版嵁:\n{df}")
    print(f"\n缂哄け鍊肩粺璁?\n{df.isnull().sum()}")

    # 濉厖缂哄け鍊?    df_filled = df.copy()
    df_filled["age"] = df_filled["age"].fillna(df_filled["age"].median())
    df_filled["salary"] = df_filled["salary"].fillna(df_filled["salary"].mean())
    df_filled["name"] = df_filled["name"].fillna("Unknown")
    print(f"\n濉厖鍚?\n{df_filled}")

    # 鍘婚噸
    print(f"\n閲嶅琛? {df_filled.duplicated().sum()}")
    df_unique = df_filled.drop_duplicates()
    print(f"鍘婚噸鍚? {len(df_unique)} 琛?)


def demo_operations():
    """鏁版嵁鎿嶄綔"""
    print("\n=== 鏁版嵁鎿嶄綔 ===")
    df = pd.DataFrame({
        "name": ["Alice", "Bob", "Charlie", "Diana"],
        "department": ["Engineering", "Marketing", "Engineering", "Marketing"],
        "salary": [15000, 25000, 30000, 20000],
    })

    # 鎺掑簭
    print(f"鎸夎柂璧勯檷搴?\n{df.sort_values('salary', ascending=False)}")

    # 鏂板鍒?    df["salary_k"] = df["salary"] / 1000
    df["is_high"] = df["salary"] > 20000
    print(f"\n鏂板鍒?\n{df}")

    # apply
    df["name_upper"] = df["name"].apply(str.upper)
    print(f"\napply:\n{df[['name', 'name_upper']]}")


if __name__ == "__main__":
    demo_creation()
    demo_selection()
    demo_cleaning()
    demo_operations()
