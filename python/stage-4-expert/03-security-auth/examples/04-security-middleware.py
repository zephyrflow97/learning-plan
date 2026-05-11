"""
瀹夊叏涓棿浠剁ず渚?===============
婕旂ず CORS銆佸畨鍏ㄥご銆丷ate Limiting 姒傚康
杩愯: uvicorn examples.04_security_middleware:app --reload
"""

import logging
import time
from collections import defaultdict

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Security Middleware Demo")

# 鉁?CORS 閰嶇疆
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)


# 鉁?瀹夊叏鍝嶅簲澶翠腑闂翠欢
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Cache-Control"] = "no-store"
    return response


# 鉁?绠€鏄?Rate Limiter锛堢敓浜х幆澧冪敤 Redis锛?class InMemoryRateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        # 娓呯悊杩囨湡璁板綍
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < self.window
        ]
        if len(self.requests[client_ip]) >= self.max_requests:
            return False
        self.requests[client_ip].append(now)
        return True


rate_limiter = InMemoryRateLimiter(max_requests=10, window_seconds=60)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"[RateLimit] IP {client_ip} 琚檺娴?)
        return JSONResponse(
            status_code=429,
            content={"detail": "璇锋眰杩囦簬棰戠箒锛岃绋嶅悗鍐嶈瘯"},
        )
    return await call_next(request)


@app.get("/")
async def root() -> dict:
    return {"message": "鍙椾繚鎶ょ殑 API"}


@app.get("/sensitive")
async def sensitive_data() -> dict:
    return {"secret": "杩欐槸鏁忔劅鏁版嵁", "note": "宸查€氳繃瀹夊叏涓棿浠朵繚鎶?}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
