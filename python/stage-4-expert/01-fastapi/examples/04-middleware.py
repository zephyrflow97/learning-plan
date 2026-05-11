"""
FastAPI 涓棿浠剁ず渚?==================
婕旂ず鑷畾涔変腑闂翠欢銆丆ORS 閰嶇疆銆佸紓甯稿鐞?杩愯: uvicorn examples.04_middleware:app --reload
"""

import logging
import time
import uuid
from typing import Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Middleware Demo")


# --- 1. 璇锋眰璁℃椂涓棿浠?---

@app.middleware("http")
async def timing_middleware(request: Request, call_next: Callable) -> Response:
    """璁板綍姣忎釜璇锋眰鐨勫鐞嗘椂闂达紙娲嬭懕妯″瀷锛氬厛杩涘悗鍑猴級"""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    start_time = time.perf_counter()

    logger.info(
        f"[Timing] >>> 璇锋眰寮€濮? "
        f"{request.method} {request.url.path} "
        f"(request_id={request_id})"
    )

    response: Response = await call_next(request)

    elapsed = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = f"{elapsed:.4f}"
    response.headers["X-Request-ID"] = request_id

    logger.info(
        f"[Timing] <<< 璇锋眰瀹屾垚: "
        f"status={response.status_code}, elapsed={elapsed:.4f}s"
    )
    return response


# --- 2. 璇锋眰鏃ュ織涓棿浠?---

@app.middleware("http")
async def request_logging_middleware(request: Request, call_next: Callable) -> Response:
    """璁板綍璇锋眰璇︾粏淇℃伅"""
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("User-Agent", "unknown")
    logger.info(
        f"[Access] {request.method} {request.url.path} | IP={client_ip}"
    )
    response = await call_next(request)
    return response


# --- 3. CORS 閰嶇疆 ---

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # React 寮€鍙戞湇鍔″櫒
        "http://localhost:5173",       # Vite 寮€鍙戞湇鍔″櫒
        "https://myapp.example.com",   # 鐢熶骇鐜
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Process-Time", "X-Request-ID"],
    max_age=600,  # 棰勬璇锋眰缂撳瓨 10 鍒嗛挓
)


# --- 4. 鍏ㄥ眬寮傚父澶勭悊 ---

class AppError(Exception):
    """搴旂敤绾ц嚜瀹氫箟寮傚父"""
    def __init__(self, message: str, error_code: str, status_code: int = 400) -> None:
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(message)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    logger.error(f"[AppError] {exc.error_code}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.error_code, "message": exc.message}},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    logger.error(f"[ValueError] {exc}")
    return JSONResponse(
        status_code=400,
        content={"error": {"code": "VALIDATION_ERROR", "message": str(exc)}},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """鍏滃簳寮傚父澶勭悊 鈥?鐢熶骇鐜涓嶆毚闇插紓甯歌鎯?""
    logger.error(f"[Unhandled] {type(exc).__name__}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "鏈嶅姟鍣ㄥ唴閮ㄩ敊璇?}},
    )


# --- 5. 娴嬭瘯璺敱 ---

@app.get("/", tags=["娴嬭瘯"])
async def root() -> dict:
    return {"status": "healthy"}


@app.get("/slow", tags=["娴嬭瘯"])
async def slow_endpoint() -> dict:
    """妯℃嫙鎱㈣姹?""
    import asyncio
    await asyncio.sleep(1.5)
    return {"message": "鎱㈣姹傚畬鎴?}


@app.get("/error/app", tags=["寮傚父娴嬭瘯"])
async def trigger_app_error() -> dict:
    raise AppError(message="璧勬簮涓嶅瓨鍦?, error_code="NOT_FOUND", status_code=404)


@app.get("/error/value", tags=["寮傚父娴嬭瘯"])
async def trigger_value_error() -> dict:
    raise ValueError("鍙傛暟鏍煎紡涓嶆纭?)


@app.get("/error/unexpected", tags=["寮傚父娴嬭瘯"])
async def trigger_unexpected() -> dict:
    return {"result": 1 / 0}  # ZeroDivisionError


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)