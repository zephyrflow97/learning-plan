# 瀹炴垬椤圭洰锛氬叏鏍堟暟鎹垎鏋愬钩鍙?
> 缁煎悎杩愮敤 Stage 4 鍏ㄩ儴鎶€鏈爤锛屾瀯寤轰竴涓畬鏁寸殑鏁版嵁鍒嗘瀽骞冲彴銆?
## 椤圭洰鏋舵瀯

```
data-analytics-platform/
|-- src/
|   |-- main.py            # FastAPI 鍏ュ彛
|   |-- api/                # API 璺敱
|   |   |-- __init__.py
|   |   |-- router.py       # 璺敱姹囨€?|   |   |-- datasets.py     # 鏁版嵁闆嗙鐐?|   |   |-- analysis.py     # 鍒嗘瀽绔偣
|   |   |-- auth.py         # 璁よ瘉绔偣
|   |-- analysis/           # 鏁版嵁鍒嗘瀽寮曟搸
|   |   |-- __init__.py
|   |   |-- engine.py       # Pandas 鍒嗘瀽
|   |   |-- ml.py           # ML 妯″瀷
|   |-- models/             # 鏁版嵁搴撴ā鍨?|   |   |-- __init__.py
|   |   |-- dataset.py      # 鏁版嵁闆嗘ā鍨?|   |   |-- user.py         # 鐢ㄦ埛妯″瀷
|   |-- auth/               # 璁よ瘉妯″潡
|   |   |-- __init__.py
|   |   |-- jwt.py          # JWT 宸ュ叿
|   |   |-- deps.py         # 璁よ瘉渚濊禆
|-- tests/
|   |-- conftest.py         # 娴嬭瘯閰嶇疆
|   |-- test_api.py         # API 娴嬭瘯
|-- Dockerfile
|-- docker-compose.yml
|-- requirements.txt
```

## 鍔熻兘鍒楄〃

### 1. 鐢ㄦ埛璁よ瘉
- POST `/auth/register` -- 鐢ㄦ埛娉ㄥ唽
- POST `/auth/login` -- 鐧诲綍鑾峰彇 JWT
- GET `/auth/me` -- 鑾峰彇褰撳墠鐢ㄦ埛

### 2. 鏁版嵁闆嗙鐞?- POST `/datasets/upload` -- 涓婁紶 CSV/JSON
- GET `/datasets` -- 鍒楄〃
- GET `/datasets/{id}` -- 璇︽儏
- DELETE `/datasets/{id}` -- 鍒犻櫎

### 3. 鏁版嵁鍒嗘瀽
- GET `/analysis/{dataset_id}/summary` -- 缁熻鎽樿
- GET `/analysis/{dataset_id}/correlation` -- 鐩稿叧鎬у垎鏋?- GET `/analysis/{dataset_id}/outliers` -- 寮傚父鍊兼娴?- POST `/analysis/{dataset_id}/predict` -- ML 棰勬祴

## 鎶€鏈爤

| 灞?| 鎶€鏈?|
|----|------|
| Web 妗嗘灦 | FastAPI |
| 鏁版嵁搴?ORM | SQLModel |
| 鏁版嵁鍒嗘瀽 | Pandas + NumPy |
| 鏈哄櫒瀛︿範 | scikit-learn |
| 璁よ瘉 | JWT (python-jose) |
| 鏃ュ織 | structlog |
| 閰嶇疆 | pydantic-settings |
| 瀹瑰櫒鍖?| Docker + Compose |
| CI/CD | GitHub Actions |

## 蹇€熷紑濮?
```bash
# 1. 鍏嬮殕椤圭洰
git clone <repo-url>
cd data-analytics-platform

# 2. Docker 鍚姩
docker compose up -d

# 3. 璁块棶 API 鏂囨。
open http://localhost:8000/docs
```

## 寮€鍙戞寚鍗?
```bash
# 鏈湴寮€鍙?pip install -r requirements.txt
uvicorn src.main:app --reload

# 杩愯娴嬭瘯
pytest -v --cov=src
```
