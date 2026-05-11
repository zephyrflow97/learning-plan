# 绗?7 绔狅細DevOps 涓庨儴缃?鈥?璁╀唬鐮佽蛋鍚戠敓浜?
> *"It works on my machine."*
> 鈥?Every developer, right before a production incident
>
> 浠ｇ爜鍐欏畬鍙槸寮€濮嬨€傛妸瀹冨彲闈犲湴杩愯鍦ㄧ敓浜х幆澧冧腑鎵嶆槸鐪熸鐨勬寫鎴樸€?
---

## 馃摉 鏈珷鍐呭

- [1. Docker 瀹瑰櫒鍖朷(#1-docker-瀹瑰櫒鍖?
- [2. Docker Compose](#2-docker-compose)
- [3. CI/CD 鈥?GitHub Actions](#3-cicd--github-actions)
- [4. 缁撴瀯鍖栨棩蹇梋(#4-缁撴瀯鍖栨棩蹇?
- [5. 閰嶇疆绠＄悊](#5-閰嶇疆绠＄悊)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?

---

## 1. Docker 瀹瑰櫒鍖?
> 馃幁 **The Drama: "鍦ㄦ垜鏈哄櫒涓婅兘璺? 鐨勭粓缁撹€?*
>
> Docker 瑙ｅ喅鐨勬牳蹇冮棶棰橈細**鐜涓€鑷存€?*銆?> 寮€鍙戠幆澧冦€佹祴璇曠幆澧冦€佺敓浜х幆澧冧娇鐢ㄥ畬鍏ㄧ浉鍚岀殑瀹瑰櫒闀滃儚銆?
### Python Docker 鏈€浣冲疄璺?
```dockerfile
# 澶氶樁娈垫瀯寤?鈥?鍑忓皬闀滃儚浣撶Н
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim AS runtime
RUN groupadd -r appuser && useradd -r -g appuser appuser
WORKDIR /app
COPY --from=builder /install /usr/local
COPY ./src ./src
USER appuser
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> 鈿涳笍 **The Science: Docker 闀滃儚灞備紭鍖?*
>
> Docker 闀滃儚鏄?*鍒嗗眰**鐨勶紝姣忔潯鎸囦护鍒涘缓涓€灞傘€?> 棰戠箒鍙樺寲鐨勫眰鏀惧湪鍚庨潰锛屼笉鍙樼殑灞傛斁鍦ㄥ墠闈€?> 杩欐牱浠ｇ爜鍙樻洿鏃跺彧闇€閲嶅缓鏈€鍚庝竴灞傦紝鏋勫缓閫熷害蹇?10 鍊嶃€?
### 闀滃儚澶у皬瀵规瘮

| 鍩虹闀滃儚 | 澶у皬 | 閫傜敤 |
|---------|------|------|
| `python:3.12` | ~1GB | 涓嶆帹鑽愮敓浜?|
| `python:3.12-slim` | ~150MB | 鎺ㄨ崘 |
| `python:3.12-alpine` | ~50MB | 鍙兘鏈夊吋瀹归棶棰?|

---

## 2. Docker Compose

> 馃О **Toolbox: Docker Compose 缂栨帓澶氭湇鍔?*
>
> 鐜板疄椤圭洰涓嶅彧涓€涓鍣ㄣ€傞€氬父浣犻渶瑕侊細搴旂敤 + 鏁版嵁搴?+ 缂撳瓨 + 娑堟伅闃熷垪銆?> Docker Compose 鐢ㄤ竴涓?YAML 鏂囦欢瀹氫箟鍜岀紪鎺掓墍鏈夋湇鍔°€?
```yaml
version: "3.9"
services:
  app:
    build: .
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://postgres:secret@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

甯哥敤鍛戒护锛?
```bash
docker compose up -d       # 鍚姩鎵€鏈夋湇鍔?docker compose logs -f app # 鏌ョ湅鏃ュ織
docker compose down        # 鍋滄骞跺垹闄?docker compose ps          # 鏌ョ湅鐘舵€?```

---

## 3. CI/CD 鈥?GitHub Actions

> 馃寣 **The Big Picture: CI/CD 鐨勪环鍊?*
>
> - **CI锛堟寔缁泦鎴愶級**锛氭瘡娆℃彁浜よ嚜鍔ㄨ繍琛屾祴璇曞拰浠ｇ爜妫€鏌?> - **CD锛堟寔缁儴缃诧級**锛氭祴璇曢€氳繃鍚庤嚜鍔ㄩ儴缃插埌鐢熶骇鐜
>
> 鎵嬪姩閮ㄧ讲 = 浜轰负澶辫 + 鏃堕棿娴垂銆傝嚜鍔ㄥ寲 = 涓€鑷存€?+ 閫熷害銆?
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: pytest --cov=src -v
```

---

## 4. 缁撴瀯鍖栨棩蹇?
> 馃 **CS Master's Bridge: 鏃ュ織绾у埆鐨勬纭娇鐢?*
>
> | 绾у埆 | 鐢ㄩ€?| 渚嬪瓙 |
> |------|------|------|
> | DEBUG | 璋冭瘯缁嗚妭 | 鍙橀噺鍊笺€丼QL 璇彞 |
> | INFO | 姝ｅ父浜嬩欢 | 鐢ㄦ埛鐧诲綍銆佽姹傚畬鎴?|
> | WARNING | 娼滃湪闂 | 鎺ヨ繎闄愭祦銆佺鐩樼┖闂翠綆 |
> | ERROR | 閿欒锛堝彲鎭㈠锛?| API 璋冪敤澶辫触銆侀噸璇?|
> | CRITICAL | 涓ラ噸閿欒 | 鏁版嵁搴撹繛鎺ユ柇寮€ |

```python
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)
logger = structlog.get_logger()

# 缁撴瀯鍖栨棩蹇?鈥?鏂逛究 ELK/Grafana 鎼滅储鍜岃仛鍚?logger.info("user.login", user_id=42, ip="192.168.1.1")
# {"event": "user.login", "user_id": 42, "ip": "192.168.1.1", ...}
```

---

## 5. 閰嶇疆绠＄悊

> 馃 **Zen of Code: 閰嶇疆涓庝唬鐮佸垎绂?*
>
> 鍗佷簩瑕佺礌搴旂敤锛?2-Factor App锛夌殑绗?3 鏉★細
> **鍦ㄧ幆澧冧腑瀛樺偍閰嶇疆**锛屼笉瑕佺‖缂栫爜鍦ㄤ唬鐮侀噷銆?
```python
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "My App"
    DEBUG: bool = False
    DATABASE_URL: str = Field(...)
    SECRET_KEY: str = Field(..., min_length=32)
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env"}

settings = Settings()
```

`.env` 鏂囦欢锛堜笉鎻愪氦鍒?Git锛夛細
```
DATABASE_URL=postgresql://user:pass@localhost/db
SECRET_KEY=your-super-secret-key-at-least-32-chars
DEBUG=true
```

---

## 鏈€浣冲疄璺?
1. **澶氶樁娈?Docker 鏋勫缓** 鈥?鍒嗙鏋勫缓鍜岃繍琛屾椂锛屽噺灏忛暅鍍?2. **闈?root 鐢ㄦ埛** 鈥?瀹瑰櫒鍐呬娇鐢ㄩ潪鐗规潈鐢ㄦ埛杩愯
3. **鍋ュ悍妫€鏌?* 鈥?閰嶇疆 healthcheck 璁╃紪鎺掑櫒鐭ラ亾鏈嶅姟鐘舵€?4. **缁撴瀯鍖栨棩蹇?* 鈥?JSON 鏍煎紡鏂逛究鏈哄櫒瑙ｆ瀽鍜屾悳绱?5. **鐜鍙橀噺绠＄悊** 鈥?鐢?`pydantic-settings` 鎻愪緵绫诲瀷瀹夊叏
6. **CI 鍏堟祴璇?* 鈥?娴嬭瘯閫氳繃鎵嶅厑璁搁儴缃?
---

## 缁冧範棰?
<details>
<summary><b>缁冧範 1锛欴ocker 鍖?FastAPI 椤圭洰</b></summary>

涓轰竴涓?FastAPI 椤圭洰缂栧啓澶氶樁娈?Dockerfile 鍜?docker-compose.yml銆?
</details>

<details>
<summary><b>缁冧範 2锛欸itHub Actions CI</b></summary>

缂栧啓 GitHub Actions 閰嶇疆锛屽疄鐜拌嚜鍔?lint + test + coverage銆?
</details>

---

## 鍙傝€冭祫婧?
- [Docker 瀹樻柟 Python 鎸囧崡](https://docs.docker.com/language/python/)
- [GitHub Actions 鏂囨。](https://docs.github.com/en/actions)
- [structlog 鏂囨。](https://www.structlog.org/)
- [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [12-Factor App](https://12factor.net/)

---

**[馃憠 瀹炴垬椤圭洰锛氬叏鏍堟暟鎹垎鏋愬钩鍙癩(../projects/data-analytics-platform/)**

[猬咃笍 杩斿洖 Stage 4 鐩綍](../README.md)