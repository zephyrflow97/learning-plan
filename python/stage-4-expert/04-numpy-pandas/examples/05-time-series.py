"""
Pandas 鏃堕棿搴忓垪绀轰緥
"""
import pandas as pd
import numpy as np


def demo_datetime():
    """鏃堕棿绱㈠紩"""
    print("=== 鏃堕棿绱㈠紩 ===")
    dates = pd.date_range("2024-01-01", periods=365, freq="D")
    ts = pd.Series(np.random.randn(365).cumsum(), index=dates, name="value")

    print(f"鏃堕棿搴忓垪 shape: {ts.shape}")
    print(f"璧锋: {ts.index[0]} ~ {ts.index[-1]}")
    print(f"\n鍓?澶?\n{ts.head()}")

    # 鏃堕棿鍒囩墖
    jan = ts["2024-01"]
    print(f"\n涓€鏈堟暟鎹? {len(jan)} 澶? mean={jan.mean():.2f}")

    q1 = ts["2024-01":"2024-03"]
    print(f"Q1 鏁版嵁: {len(q1)} 澶?)


def demo_resample():
    """閲嶉噰鏍?""
    print("\n=== 閲嶉噰鏍?===")
    dates = pd.date_range("2024-01-01", periods=365, freq="D")
    daily = pd.Series(np.random.randint(100, 500, 365), index=dates, name="sales")

    monthly = daily.resample("M").agg(["sum", "mean", "std"])
    print(f"鏈堝害姹囨€?\n{monthly.head()}")

    weekly = daily.resample("W").sum()
    print(f"\n鍛ㄦ眹鎬?(鍓?鍛?:\n{weekly.head()}")


def demo_rolling():
    """绉诲姩绐楀彛"""
    print("\n=== 绉诲姩绐楀彛 ===")
    dates = pd.date_range("2024-01-01", periods=100, freq="D")
    ts = pd.Series(np.random.randn(100).cumsum() + 100, index=dates)

    df = pd.DataFrame({
        "original": ts,
        "ma_7": ts.rolling(window=7).mean(),
        "ma_30": ts.rolling(window=30).mean(),
        "expanding_mean": ts.expanding().mean(),
    })
    print(f"鏈€鍚?澶?\n{df.tail()}")


def demo_shift():
    """鏃堕棿鍋忕些"""
    print("\n=== 鏃堕棿鍋忕些涓庡闀跨巼 ===")
    dates = pd.date_range("2024-01-01", periods=12, freq="M")
    sales = pd.Series([100, 120, 115, 130, 145, 160, 155, 170, 180, 190, 200, 220], index=dates)

    df = pd.DataFrame({
        "sales": sales,
        "prev_month": sales.shift(1),
        "mom_growth": sales.pct_change() * 100,  # 鐜瘮澧為暱鐜?        "yoy_growth": sales.pct_change(periods=12) * 100,  # 鍚屾瘮
    })
    print(df)


if __name__ == "__main__":
    demo_datetime()
    demo_resample()
    demo_rolling()
    demo_shift()
