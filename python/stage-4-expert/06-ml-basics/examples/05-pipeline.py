"""
ML Pipeline 绀轰緥
"""
import numpy as np
import pandas as pd
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
import joblib

def demo_simple_pipeline():
    print("=== 绠€鍗?Pipeline ===")
    data = fetch_california_housing()
    X, y = data.data, data.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Pipeline 鑷姩绠＄悊棰勫鐞?+ 妯″瀷
    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("model", Ridge(alpha=1.0)),
    ])

    # fit 鏃讹細scaler.fit_transform(X_train) -> model.fit(X_scaled, y_train)
    pipe.fit(X_train, y_train)

    # predict 鏃讹細scaler.transform(X_test) -> model.predict(X_scaled)
    y_pred = pipe.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"Ridge Pipeline: RMSE={rmse:.4f}, R2={r2:.4f}")

    # 浜ゅ弶楠岃瘉
    cv_scores = cross_val_score(pipe, X, y, cv=5, scoring="r2")
    print(f"CV R2: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")


def demo_full_pipeline():
    print("\n=== 瀹屾暣 Pipeline锛堝惈 ColumnTransformer锛?==")

    # 妯℃嫙娣峰悎绫诲瀷鏁版嵁
    np.random.seed(42)
    df = pd.DataFrame({
        "age": np.random.randint(18, 65, 500).astype(float),
        "salary": np.random.randint(30000, 150000, 500).astype(float),
        "department": np.random.choice(["Eng", "Mkt", "HR", "Sales"], 500),
        "city": np.random.choice(["BJ", "SH", "GZ", "SZ"], 500),
    })
    # 娣诲姞缂哄け鍊?    df.loc[np.random.choice(500, 50), "age"] = np.nan
    df.loc[np.random.choice(500, 30), "salary"] = np.nan
    y = df["salary"].fillna(df["salary"].median()) * 0.3 + df["age"].fillna(30) * 100 + np.random.randn(500) * 5000

    X = df
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 瀹氫箟棰勫鐞?    num_features = ["age", "salary"]
    cat_features = ["department", "city"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]), num_features),
            ("cat", Pipeline([
                ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
                ("encoder", OneHotEncoder(handle_unknown="ignore")),
            ]), cat_features),
        ]
    )

    # 瀹屾暣 Pipeline
    full_pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("model", RandomForestRegressor(n_estimators=100, random_state=42)),
    ])

    full_pipe.fit(X_train, y_train)
    y_pred = full_pipe.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"Full Pipeline: RMSE={rmse:.4f}, R2={r2:.4f}")

    # 淇濆瓨鍜屽姞杞?    joblib.dump(full_pipe, "full_pipeline.joblib")
    loaded = joblib.load("full_pipeline.joblib")
    print(f"Loaded pipeline score: R2={loaded.score(X_test, y_test):.4f}")
    print("妯″瀷宸蹭繚瀛? full_pipeline.joblib")


if __name__ == "__main__":
    demo_simple_pipeline()
    demo_full_pipeline()
