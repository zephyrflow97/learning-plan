"""
妯″瀷璇勪及绀轰緥
"""
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score, roc_curve
)

def demo_cv():
    print("=== 浜ゅ弶楠岃瘉 ===")
    X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)

    # 绠€鍗?CV
    scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
    print(f"5-Fold CV: {scores.mean():.4f} (+/- {scores.std()*2:.4f})")
    print(f"鍚勬姌: {scores}")

    # 鍒嗗眰 CV
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(model, X, y, cv=skf, scoring="f1_weighted")
    print(f"\nStratified 5-Fold F1: {scores.mean():.4f}")

def demo_metrics():
    print("\n=== 鍒嗙被鎸囨爣 ===")
    X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print(f"鍒嗙被鎶ュ憡:\n{classification_report(y_test, y_pred)}")
    print(f"娣锋穯鐭╅樀:\n{confusion_matrix(y_test, y_pred)}")
    print(f"AUC-ROC: {roc_auc_score(y_test, y_prob):.4f}")

def demo_overfitting():
    print("\n=== 杩囨嫙鍚堟娴?===")
    X, y = make_classification(n_samples=200, n_features=20, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 涓嶅悓澶嶆潅搴︾殑妯″瀷
    for depth in [2, 5, 10, None]:
        model = RandomForestClassifier(n_estimators=100, max_depth=depth, random_state=42)
        model.fit(X_train, y_train)
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        gap = train_score - test_score
        status = "杩囨嫙鍚?" if gap > 0.1 else "OK"
        print(f"  depth={str(depth):5s}: train={train_score:.4f}, test={test_score:.4f}, gap={gap:.4f} {status}")

if __name__ == "__main__":
    demo_cv()
    demo_metrics()
    demo_overfitting()
