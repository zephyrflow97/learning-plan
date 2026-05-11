# 绗?6 绔狅細鏈哄櫒瀛︿範鍏ラ棬 鈥?浠庢暟鎹埌棰勬祴

> *"All models are wrong, but some are useful."*
> 鈥?George E.P. Box
>
> 鏈哄櫒瀛︿範涓嶆槸榄旀硶鈥斺€斿畠鏄?*缁熻瀛?+ 宸ョ▼瀛?*銆?> 缁熻瀛﹀府浣犵悊瑙ｆ暟鎹寰嬶紝宸ョ▼瀛﹀府浣犳妸妯″瀷閮ㄧ讲鍒扮敓浜х幆澧冦€?
---

## 馃摉 鏈珷鍐呭

- [1. ML 鍩烘湰姒傚康](#1-ml-鍩烘湰姒傚康)
- [2. scikit-learn 鏍稿績 API](#2-scikit-learn-鏍稿績-api)
- [3. 鍒嗙被绠楁硶](#3-鍒嗙被绠楁硶)
- [4. 鍥炲綊绠楁硶](#4-鍥炲綊绠楁硶)
- [5. 鐗瑰緛宸ョ▼](#5-鐗瑰緛宸ョ▼)
- [6. 妯″瀷璇勪及](#6-妯″瀷璇勪及)
- [7. Pipeline 涓庨槻娉勬紡](#7-pipeline-涓庨槻娉勬紡)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [甯歌闄烽槺](#甯歌闄烽槺)
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?

---

## 1. ML 鍩烘湰姒傚康

> 馃幁 **The Drama: 涓夌瀛︿範鑼冨紡**
>
> | 鑼冨紡 | 鏈夋爣绛撅紵 | 鐩爣 | 渚嬪瓙 |
> |------|---------|------|------|
> | **鐩戠潱瀛︿範** | 鉁?鏈?| 棰勬祴鏍囩 | 鍨冨溇閭欢鍒嗙被銆佹埧浠烽娴?|
> | **闈炵洃鐫ｅ涔?* | 鉂?鏃?| 鍙戠幇缁撴瀯 | 瀹㈡埛鍒嗙兢銆佸紓甯告娴?|
> | **寮哄寲瀛︿範** | 濂栧姳淇″彿 | 鏈€澶у寲濂栧姳 | 娓告垙 AI銆佹満鍣ㄤ汉鎺у埗 |
>
> 鏈珷鑱氱劍**鐩戠潱瀛︿範**鈥斺€旇繖鏄伐涓氱晫 80% 鐨?ML 搴旂敤銆?
### ML 宸ヤ綔娴?
```
鏁版嵁鏀堕泦 鈫?鏁版嵁娓呮礂 鈫?鐗瑰緛宸ョ▼ 鈫?妯″瀷璁粌 鈫?妯″瀷璇勪及 鈫?閮ㄧ讲
                                    鈫慱__________鈫?                                   锛堣凯浠ｄ紭鍖栵級
```

> 馃 **Zen of Code: ML 鐨?80/20 娉曞垯**
>
> 80% 鐨勬椂闂磋姳鍦?*鏁版嵁鍑嗗鍜岀壒寰佸伐绋?*涓娿€?> 鍙湁 20% 鐨勬椂闂村湪閫夋嫨鍜岃缁冩ā鍨嬨€?> 濂界殑鐗瑰緛 + 绠€鍗曟ā鍨?> 宸殑鐗瑰緛 + 澶嶆潅妯″瀷銆?
---

## 2. scikit-learn 鏍稿績 API

> 馃 **CS Master's Bridge: 缁熶竴鐨?Estimator API**
>
> scikit-learn 鐨勮璁＄簿楂撴槸**缁熶竴鐨?API**锛?> - `fit(X, y)` 鈥?浠庢暟鎹腑瀛︿範
> - `predict(X)` 鈥?鍋氶娴?> - `score(X, y)` 鈥?璇勪及鎬ц兘
>
> 鏃犺鏄嚎鎬у洖褰掋€侀殢鏈烘．鏋楄繕鏄?SVM锛屾帴鍙ｅ畬鍏ㄧ浉鍚屻€?> 杩欏氨鏄?*澶氭€?*鐨勫姏閲忋€?
```python
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier

# 鉁?鎵€鏈夋ā鍨嬬殑鎺ュ彛瀹屽叏涓€鑷?model = LinearRegression()     # 鎴?RandomForestClassifier()
model.fit(X_train, y_train)    # 璁粌
predictions = model.predict(X_test)  # 棰勬祴
score = model.score(X_test, y_test)  # 璇勪及
```

---

## 3. 鍒嗙被绠楁硶

### 甯哥敤鍒嗙被鍣ㄥ姣?
| 绠楁硶 | 浼樼偣 | 缂虹偣 | 閫傜敤鍦烘櫙 |
|------|------|------|---------|
| **閫昏緫鍥炲綊** | 绠€鍗曘€佸彲瑙ｉ噴銆佸揩 | 绾挎€ц竟鐣?| 鍩虹嚎妯″瀷 |
| **鍐崇瓥鏍?* | 鐩磋銆佸彲瑙ｉ噴 | 瀹规槗杩囨嫙鍚?| 鐗瑰緛閲嶈鎬у垎鏋?|
| **闅忔満妫灄** | 鍑嗙‘銆佹姉杩囨嫙鍚?| 杈冩參銆佷笉閫忔槑 | 閫氱敤棣栭€?|
| **SVM** | 楂樼淮鏈夋晥 | 澶ф暟鎹泦鎱?| 鏂囨湰鍒嗙被 |

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# 鍔犺浇鏁版嵁
X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 璁粌澶氫釜妯″瀷
models = {
    "Logistic Regression": LogisticRegression(max_iter=200),
    "Decision Tree": DecisionTreeClassifier(max_depth=3),
    "Random Forest": RandomForestClassifier(n_estimators=100),
}

for name, model in models.items():
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"{name}: accuracy={score:.4f}")
```

---

## 4. 鍥炲綊绠楁硶

```python
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# 鐢熸垚绀轰緥鏁版嵁
np.random.seed(42)
X = np.random.randn(100, 1)
y = 3 * X.squeeze() + 2 + np.random.randn(100) * 0.5

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# 绾挎€у洖褰?lr = LinearRegression()
lr.fit(X_train, y_train)
y_pred = lr.predict(X_test)
print(f"Linear: MSE={mean_squared_error(y_test, y_pred):.4f}, R2={r2_score(y_test, y_pred):.4f}")

# 宀洖褰掞紙L2 姝ｅ垯鍖栵級
ridge = Ridge(alpha=1.0)
ridge.fit(X_train, y_train)
y_pred = ridge.predict(X_test)
print(f"Ridge:  MSE={mean_squared_error(y_test, y_pred):.4f}, R2={r2_score(y_test, y_pred):.4f}")
```

---

## 5. 鐗瑰緛宸ョ▼

> 鈿涳笍 **The Science: 鐗瑰緛宸ョ▼ 鈥?ML 鐨勬牳蹇冩妧鑹?*
>
> | 鐗瑰緛绫诲瀷 | 澶勭悊鏂规硶 |
> |---------|---------|
> | 鏁板€?| 鏍囧噯鍖栵紙StandardScaler锛夈€佸綊涓€鍖栵紙MinMaxScaler锛?|
> | 绫诲埆 | One-Hot 缂栫爜锛圤neHotEncoder锛夈€丩abel 缂栫爜 |
> | 缂哄け鍊?| 鍧囧€?涓綅鏁?浼楁暟濉厖锛圫impleImputer锛?|
> | 鏂囨湰 | TF-IDF銆佽瘝琚嬫ā鍨?|
> | 鏃堕棿 | 鎻愬彇骞?鏈?鏃?鏄熸湡銆佸懆鏈熸€х紪鐮?|

```python
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer

# 鉁?浣跨敤 ColumnTransformer 缁熶竴澶勭悊
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), ["age", "salary"]),
        ("cat", OneHotEncoder(handle_unknown="ignore"), ["department", "city"]),
    ]
)
```

---

## 6. 妯″瀷璇勪及

### 浜ゅ弶楠岃瘉

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
print(f"CV Accuracy: {scores.mean():.4f} (+/- {scores.std()*2:.4f})")
```

### 璇勪及鎸囨爣

| 鎸囨爣 | 閫傜敤 | 鍏紡姒傚康 |
|------|------|---------|
| **Accuracy** | 骞宠　鏁版嵁闆?| 姝ｇ‘鏁?/ 鎬绘暟 |
| **Precision** | 鍑忓皯璇姤 | TP / (TP + FP) |
| **Recall** | 鍑忓皯婕忔姤 | TP / (TP + FN) |
| **F1** | 缁煎悎 P 鍜?R | 2 * P * R / (P + R) |
| **AUC-ROC** | 浜屽垎绫绘帓搴?| 鏇茬嚎涓嬮潰绉?|
| **MSE/RMSE** | 鍥炲綊 | 鍧囨柟璇樊 |
| **R2** | 鍥炲綊 | 瑙ｉ噴鏂瑰樊姣斾緥 |

---

## 7. Pipeline 涓庨槻娉勬紡

> 馃幁 **The Drama: 鏁版嵁娉勬紡 鈥?ML 鐨勫ご鍙峰叕鏁?*
>
> 鏁版嵁娉勬紡鏄寚**娴嬭瘯闆嗙殑淇℃伅娉勯湶鍒颁簡璁粌杩囩▼涓?*銆?> 鏈€甯歌鐨勬硠婕忥細鍏堝鎵€鏈夋暟鎹仛鏍囧噯鍖栵紝鍐嶅垝鍒嗚缁?娴嬭瘯闆嗐€?>
> ```python
> # 鉂?鏁版嵁娉勬紡锛?> scaler.fit_transform(X)  # 鐢ㄤ簡娴嬭瘯闆嗙殑鍧囧€煎拰鏂瑰樊
> X_train, X_test = train_test_split(X)
>
> # 鉁?姝ｇ‘锛歅ipeline 鑷姩闃叉硠婕?> pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
> pipe.fit(X_train, y_train)  # scaler 鍙湪 X_train 涓?fit
> pipe.score(X_test, y_test)  # 鐢?X_train 鐨勫弬鏁?transform X_test
> ```

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# 鉁?Pipeline 鈥?鑷姩绠＄悊棰勫鐞嗗拰妯″瀷
pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression()),
])

pipe.fit(X_train, y_train)
score = pipe.score(X_test, y_test)
print(f"Pipeline score: {score:.4f}")

# 淇濆瓨妯″瀷
import joblib
joblib.dump(pipe, "model.joblib")

# 鍔犺浇妯″瀷
loaded_pipe = joblib.load("model.joblib")
```

---

## 鏈€浣冲疄璺?
1. **浠庣畝鍗曟ā鍨嬪紑濮?* 鈥?绾挎€у洖褰?閫昏緫鍥炲綊浣滀负鍩虹嚎
2. **浣跨敤 Pipeline** 鈥?闃叉鏁版嵁娉勬紡
3. **浜ゅ弶楠岃瘉** 鈥?涓嶈鍙湅鍗曟娴嬭瘯缁撴灉
4. **鐗瑰緛宸ョ▼ > 妯″瀷閫夋嫨** 鈥?鑺辨椂闂寸悊瑙ｆ暟鎹?5. **鍏堣繃鎷熷悎鍐嶆鍒欏寲** 鈥?纭妯″瀷鏈夊涔犺兘鍔?6. **璁板綍瀹為獙** 鈥?姣忔鏀逛簡浠€涔堛€佺粨鏋滃浣?
---

## 甯歌闄烽槺

### 闄烽槺 1锛氭暟鎹硠婕?```python
# 鉂?鍦ㄥ垝鍒嗗墠鍋氶澶勭悊
X_scaled = StandardScaler().fit_transform(X)
X_train, X_test = train_test_split(X_scaled)

# 鉁?浣跨敤 Pipeline
pipe = Pipeline([("scaler", StandardScaler()), ("model", SVC())])
```

### 闄烽槺 2锛氬拷鐣ョ被鍒笉骞宠　
```python
# 鉂?鐩存帴璁粌锛堝皯鏁扮被琚拷鐣ワ級
model.fit(X_train, y_train)

# 鉁?澶勭悊涓嶅钩琛?model = RandomForestClassifier(class_weight="balanced")
```

---

## 缁冧範棰?
<details>
<summary><b>缁冧範 1锛氶涪灏捐姳鍒嗙被</b></summary>

浣跨敤 scikit-learn 鐨?iris 鏁版嵁闆嗭紝姣旇緝閫昏緫鍥炲綊銆佸喅绛栨爲銆侀殢鏈烘．鏋楃殑琛ㄧ幇銆?
</details>

<details>
<summary><b>缁冧範 2锛氭埧浠烽娴?/b></summary>

浣跨敤 California Housing 鏁版嵁闆嗭紝鏋勫缓鍥炲綊妯″瀷骞惰瘎浼般€?
</details>

<details>
<summary><b>缁冧範 3锛氬畬鏁?Pipeline</b></summary>

鏋勫缓涓€涓寘鍚己澶卞€煎鐞嗐€佹爣鍑嗗寲銆佺壒寰侀€夋嫨鍜屾ā鍨嬭缁冪殑瀹屾暣 Pipeline銆?
</details>

---

## 鍙傝€冭祫婧?
- [scikit-learn 瀹樻柟鏂囨。](https://scikit-learn.org/stable/) 鈥?鏈€濂界殑 ML 鍏ラ棬鏂囨。
- [Hands-On ML (Aurelien Geron)](https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/) 鈥?ML 瀹炴垬缁忓吀
- [Kaggle Learn](https://www.kaggle.com/learn) 鈥?鍏嶈垂浜掑姩璇剧▼
- [StatQuest (YouTube)](https://www.youtube.com/c/joshstarmer) 鈥?ML 姒傚康瑙嗛

---

**[馃憠 绗?7 绔狅細DevOps 涓庨儴缃瞉(../07-devops-deployment/)**

[猬咃笍 杩斿洖 Stage 4 鐩綍](../README.md)
