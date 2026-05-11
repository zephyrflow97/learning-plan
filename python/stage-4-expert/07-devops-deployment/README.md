# 第 7 章：DevOps 与部署 — 让代码可靠运行

> 代码写完只是开始。把它稳定、安全、可观测地运行在生产环境中，才是工程落地。

## 📖 本章内容

- [1. Docker 基础](#1-docker-基础)
- [2. Docker Compose](#2-docker-compose)
- [3. GitHub Actions CI/CD](#3-github-actions-cicd)
- [4. 日志与监控](#4-日志与监控)
- [5. 环境变量与配置](#5-环境变量与配置)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [练习题](#练习题)
- [参考资源](#参考资源)

---

## 1. Docker 基础

Docker 解决“我的机器能跑，线上不能跑”的环境一致性问题。开发、测试、生产使用同一个镜像，可以显著减少部署差异。

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t my-api .
docker run -p 8000:8000 my-api
```

镜像是分层的。变化少的步骤放前面，变化多的代码复制放后面，可以提高构建缓存命中率。

---

## 2. Docker Compose

真实项目通常不只有一个容器，还会有数据库、缓存、消息队列等依赖服务。

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/app
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7

volumes:
  postgres_data:
```

```bash
docker compose up --build
docker compose down
docker compose ps
```

---

## 3. GitHub Actions CI/CD

CI 在每次提交后自动运行测试和构建；CD 在测试通过后自动部署。

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest
      - run: ruff check .
```

部署步骤要根据目标平台调整：GitHub Pages、Docker Registry、云服务器、Render、Railway、Fly.io 或 Kubernetes 都有不同流程。

---

## 4. 日志与监控

生产环境里，`print()` 不够用。日志需要结构化、分级，并能被收集系统搜索。

```python
import logging

logger = logging.getLogger(__name__)

logger.info("user.login", extra={"user_id": 42, "ip": "192.168.1.1"})
logger.warning("payment.retry", extra={"order_id": "A001"})
logger.error("job.failed", exc_info=True)
```

| 级别 | 用途 |
|------|------|
| DEBUG | 调试细节 |
| INFO | 正常业务事件 |
| WARNING | 需要关注但不影响服务 |
| ERROR | 请求或任务失败 |
| CRITICAL | 服务不可用或严重故障 |

监控至少覆盖请求耗时、错误率、吞吐量、CPU、内存、磁盘和数据库连接池。

---

## 5. 环境变量与配置

配置应该来自环境，而不是硬编码在代码里。密钥、数据库地址、第三方 API Key 都不能提交到仓库。

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str
    secret_key: str
    debug: bool = False

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
```

---

## 最佳实践

- 使用多阶段 Docker 构建，减少镜像体积。
- 容器内使用非 root 用户运行应用。
- 配置 healthcheck，让平台知道服务是否健康。
- CI 中运行测试、lint 和构建。
- 日志使用结构化格式，避免记录敏感信息。
- 环境变量使用类型化配置管理。

## 常见陷阱

```dockerfile
# 不推荐：把密钥写进镜像
ENV SECRET_KEY=super-secret

# 不推荐：每次构建都先复制全部代码再安装依赖，缓存命中率低
COPY . .
RUN pip install -r requirements.txt
```

## 练习题

1. 给 FastAPI 项目写 Dockerfile。
2. 用 Docker Compose 启动 API、PostgreSQL 和 Redis。
3. 写一个 GitHub Actions 工作流，运行测试并构建镜像。

---

## 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [pydantic-settings 文档](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
