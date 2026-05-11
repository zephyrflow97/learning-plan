"""
鍥炲綊绠楁硶绀轰緥
"""
import numpy as np
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

def demo_regression():
    print("=== 鍔犲窞鎴夸环鍥炲綊 ===")
    data = fetch_california_housing()
    X, y = data.data, data.target
    feature_names = data.feature_names
    print(f"鏁版嵁闆? {X.shape[0]} 鏍锋湰, {X.shape[1]} 鐗瑰緛")
    print(f"鐗瑰緛: {feature_names}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    models = {
        "Linear Regression": LinearRegression(),
        "Ridge (alpha=1)": Ridge(alpha=1.0),
        "Lasso (alpha=0.01)": Lasso(alpha=0.01),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
    }

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        print(f"  {name:25s}: RMSE={rmse:.4f}, R2={r2:.4f}")

    # 绾挎€у洖褰掔郴鏁板垎鏋?    lr = LinearRegression().fit(X_train, y_train)
    print("\n绾挎€у洖褰掔郴鏁?")
    for name, coef in sorted(zip(feature_names, lr.coef_), key=lambda x: abs(x[1]), reverse=True):
        print(f"  {name:15s}: {coef:+.4f}")

if __name__ == "__main__":
    demo_regression()
