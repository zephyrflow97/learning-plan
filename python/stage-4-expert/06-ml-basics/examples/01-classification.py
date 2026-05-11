"""
鍒嗙被绠楁硶绀轰緥
"""
import numpy as np
from sklearn.datasets import load_iris, load_wine
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix

def demo_iris():
    """楦㈠熬鑺卞垎绫?""
    print("=== 楦㈠熬鑺卞垎绫?===")
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=200),
        "Decision Tree": DecisionTreeClassifier(max_depth=3, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "SVM": SVC(kernel="rbf", random_state=42),
    }

    for name, model in models.items():
        model.fit(X_train, y_train)
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        cv_scores = cross_val_score(model, X, y, cv=5)
        print(f"  {name:25s}: train={train_score:.4f}, test={test_score:.4f}, cv={cv_scores.mean():.4f}")

    # 鏈€浣虫ā鍨嬭缁嗘姤鍛?    best = RandomForestClassifier(n_estimators=100, random_state=42)
    best.fit(X_train, y_train)
    y_pred = best.predict(X_test)
    print(f"\nRandom Forest 鍒嗙被鎶ュ憡:\n{classification_report(y_test, y_pred)}")


def demo_feature_importance():
    """鐗瑰緛閲嶈鎬?""
    print("\n=== 鐗瑰緛閲嶈鎬?===")
    X, y = load_iris(return_X_y=True)
    feature_names = ["sepal_length", "sepal_width", "petal_length", "petal_width"]

    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X, y)

    importances = rf.feature_importances_
    for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
        print(f"  {name:20s}: {imp:.4f} {'*' * int(imp * 50)}")


if __name__ == "__main__":
    demo_iris()
    demo_feature_importance()
