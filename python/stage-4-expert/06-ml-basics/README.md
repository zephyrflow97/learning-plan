# 第 6 章：机器学习基础 — 用工程方式训练模型

> 机器学习不是魔法，而是统计学和工程实践的结合。模型很重要，但数据准备、特征工程、评估和部署同样关键。

## 📖 本章内容

- [1. 机器学习工作流](#1-机器学习工作流)
- [2. scikit-learn 核心 API](#2-scikit-learn-核心-api)
- [3. 常见监督学习模型](#3-常见监督学习模型)
- [4. 特征工程](#4-特征工程)
- [5. 评估与交叉验证](#5-评估与交叉验证)
- [6. Pipeline 与数据泄漏](#6-pipeline-与数据泄漏)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)

---

## 1. 机器学习工作流

```text
数据收集 -> 数据清洗 -> 特征工程 -> 模型训练 -> 模型评估 -> 部署监控
                                      ↑__________________________|
```

工业项目中，80% 的时间通常花在数据准备和特征工程上。好的特征加简单模型，经常胜过差的特征加复杂模型。

---

## 2. scikit-learn 核心 API

scikit-learn 的核心是统一 Estimator API：

- `fit(X, y)`：从数据中学习。
- `predict(X)`：做预测。
- `score(X, y)`：评估性能。
- `transform(X)`：转换特征。

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)

model = LinearRegression()
model.fit(X_train, y_train)

predictions = model.predict(X_test)
score = model.score(X_test, y_test)
```

---

## 3. 常见监督学习模型

| 模型 | 优点 | 局限 | 常见用途 |
|------|------|------|---------|
| 线性回归 | 简单、可解释、快 | 只能表达线性关系 | 回归基线 |
| 逻辑回归 | 简单、可解释、快 | 线性边界 | 分类基线 |
| 决策树 | 直观、可解释 | 容易过拟合 | 规则型数据 |
| 随机森林 | 稳定、抗过拟合 | 较慢、不透明 | 通用分类/回归 |
| SVM | 小数据集表现好 | 大数据较慢 | 高维分类 |
| Gradient Boosting | 准确率高 | 参数多 | 表格数据 |

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))
```

---

## 4. 特征工程

| 数据类型 | 常见处理 |
|---------|---------|
| 数值 | 标准化、归一化、缺失值填充 |
| 类别 | One-Hot、Ordinal Encoding |
| 文本 | TF-IDF、Embedding |
| 时间 | 星期、月份、周期特征 |
| 缺失值 | 均值、中位数、众数或模型填充 |

```python
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

numeric_features = ["age", "income"]
categorical_features = ["city", "plan"]

preprocess = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
    ]
)
```

---

## 5. 评估与交叉验证

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
print(scores.mean(), scores.std())
```

分类问题常看 accuracy、precision、recall、F1、ROC-AUC；回归问题常看 MAE、MSE、RMSE、R2。

---

## 6. Pipeline 与数据泄漏

数据泄漏指测试集信息进入训练过程。最常见错误是先对全部数据做标准化，再切分训练集和测试集。

```python
from sklearn.pipeline import Pipeline

pipeline = Pipeline(
    steps=[
        ("preprocess", preprocess),
        ("model", RandomForestClassifier(random_state=42)),
    ]
)

pipeline.fit(X_train, y_train)
print(pipeline.score(X_test, y_test))
```

Pipeline 确保预处理只在训练集上 `fit`，再应用到验证集或测试集。

---

## 最佳实践

- 先建立简单基线模型。
- 使用 `train_test_split` 或交叉验证评估泛化能力。
- 用 Pipeline 避免数据泄漏。
- 特征工程优先于盲目更换模型。
- 记录每次实验的数据版本、特征、模型和指标。

## 常见陷阱

```python
# 错误：先标准化全部数据，再切分
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)

# 正确：把标准化放进 Pipeline
pipeline.fit(X_train, y_train)
```

## 练习题

1. 在鸢尾花数据集上比较逻辑回归、决策树和随机森林。
2. 在 California Housing 数据集上构建回归模型。
3. 构建一个包含缺失值处理、标准化、One-Hot 编码和模型训练的 Pipeline。

---

## 参考资源

- [scikit-learn 官方文档](https://scikit-learn.org/stable/)
- [Kaggle Learn](https://www.kaggle.com/learn)
- [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course)
