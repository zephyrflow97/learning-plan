"""
Pandas 楂樼骇绀轰緥锛欸roupBy銆佸悎骞躲€侀€忚琛?"""
import pandas as pd
import numpy as np


def demo_groupby():
    """鍒嗙粍鑱氬悎"""
    print("=== GroupBy 鍒嗙粍鑱氬悎 ===")
    df = pd.DataFrame({
        "department": ["Eng", "Eng", "Eng", "Mkt", "Mkt", "HR", "HR"],
        "name": ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"],
        "salary": [15000, 25000, 30000, 20000, 22000, 12000, 13000],
        "years": [2, 5, 8, 3, 4, 1, 2],
    })

    # 鍩烘湰鑱氬悎
    print(df.groupby("department")["salary"].mean())

    # 澶氫釜鑱氬悎
    result = df.groupby("department").agg(
        avg_salary=("salary", "mean"),
        max_salary=("salary", "max"),
        headcount=("name", "count"),
        avg_years=("years", "mean"),
    )
    print(f"\n璇︾粏鑱氬悎:\n{result}")

    # transform锛堜繚鎸佸師濮嬪舰鐘讹級
    df["dept_avg"] = df.groupby("department")["salary"].transform("mean")
    df["vs_dept_avg"] = df["salary"] - df["dept_avg"]
    print(f"\n涓庨儴闂ㄥ钩鍧囨瘮杈?\n{df[['name', 'department', 'salary', 'dept_avg', 'vs_dept_avg']]}")


def demo_merge():
    """鏁版嵁鍚堝苟"""
    print("\n=== 鏁版嵁鍚堝苟 ===")
    users = pd.DataFrame({
        "user_id": [1, 2, 3, 4],
        "name": ["Alice", "Bob", "Charlie", "Diana"],
    })
    orders = pd.DataFrame({
        "order_id": [101, 102, 103, 104, 105],
        "user_id": [1, 1, 2, 3, 5],
        "amount": [100, 200, 150, 300, 250],
    })

    # INNER JOIN
    inner = pd.merge(users, orders, on="user_id", how="inner")
    print(f"INNER JOIN:\n{inner}")

    # LEFT JOIN
    left = pd.merge(users, orders, on="user_id", how="left")
    print(f"\nLEFT JOIN:\n{left}")

    # concat
    df1 = pd.DataFrame({"A": [1, 2], "B": [3, 4]})
    df2 = pd.DataFrame({"A": [5, 6], "B": [7, 8]})
    combined = pd.concat([df1, df2], ignore_index=True)
    print(f"\nconcat:\n{combined}")


def demo_pivot():
    """閫忚琛?""
    print("\n=== 閫忚琛?===")
    df = pd.DataFrame({
        "date": pd.date_range("2024-01-01", periods=12, freq="M"),
        "product": ["A", "B"] * 6,
        "sales": np.random.randint(100, 1000, 12),
        "region": ["North", "South"] * 6,
    })

    pivot = df.pivot_table(
        values="sales",
        index="product",
        columns="region",
        aggfunc=["mean", "sum"],
    )
    print(pivot)


def demo_method_chain():
    """鏂规硶閾?""
    print("\n=== 鏂规硶閾?===")
    np.random.seed(42)
    df = pd.DataFrame({
        "name": [f"User_{i}" for i in range(20)],
        "age": np.random.randint(18, 60, 20),
        "salary": np.random.randint(8000, 50000, 20),
        "dept": np.random.choice(["Eng", "Mkt", "HR"], 20),
    })

    result = (
        df
        .query("age >= 25")
        .assign(salary_k=lambda x: x["salary"] / 1000)
        .groupby("dept")
        .agg(avg_salary_k=("salary_k", "mean"), count=("name", "count"))
        .sort_values("avg_salary_k", ascending=False)
    )
    print(result)


if __name__ == "__main__":
    demo_groupby()
    demo_merge()
    demo_pivot()
    demo_method_chain()
