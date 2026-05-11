# 实战项目：全栈数据分析平台

> 综合运用 Stage 4 的技术栈，构建一个完整的数据分析平台。

## 项目架构

```text
data-analytics-platform/
├── src/
│   ├── main.py              # FastAPI 入口
│   ├── api/
│   │   ├── router.py        # 路由汇总
│   │   ├── datasets.py      # 数据集端点
│   │   ├── analysis.py      # 分析端点
│   │   └── auth.py          # 认证端点
│   ├── analysis/
│   │   ├── engine.py        # Pandas 分析
│   │   └── ml.py            # ML 模型
│   ├── models/
│   │   ├── dataset.py       # 数据集模型
│   │   └── user.py          # 用户模型
│   └── auth/
│       ├── jwt.py           # JWT 工具
│       └── deps.py          # 认证依赖
├── tests/
│   ├── conftest.py
│   └── test_api.py
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## 功能列表

### 1. 用户认证

- `POST /auth/register`：用户注册。
- `POST /auth/login`：登录获取 JWT。
- `GET /auth/me`：获取当前用户。

### 2. 数据集管理

- `POST /datasets/upload`：上传 CSV / JSON。
- `GET /datasets`：数据集列表。
- `GET /datasets/{id}`：数据集详情。
- `DELETE /datasets/{id}`：删除数据集。

### 3. 数据分析

- `GET /analysis/{dataset_id}/summary`：统计摘要。
- `GET /analysis/{dataset_id}/correlation`：相关性分析。
- `GET /analysis/{dataset_id}/outliers`：异常值检测。
- `POST /analysis/{dataset_id}/predict`：机器学习预测。

## 技术栈

| 层级 | 技术 |
|------|------|
| Web 框架 | FastAPI |
| 数据 ORM | SQLModel |
| 数据分析 | Pandas + NumPy |
| 机器学习 | scikit-learn |
| 认证 | JWT (`python-jose`) |
| 日志 | structlog |
| 配置 | pydantic-settings |
| 容器 | Docker + Compose |
| CI/CD | GitHub Actions |

## 快速开始

```bash
git clone <repo-url>
cd data-analytics-platform
docker compose up -d
open http://localhost:8000/docs
```

## 开发指南

```bash
pip install -r requirements.txt
uvicorn src.main:app --reload
pytest -v --cov=src
```
