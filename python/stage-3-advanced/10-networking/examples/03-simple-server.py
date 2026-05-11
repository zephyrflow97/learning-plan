"""
第 10 章 示例 03：HTTP 服务器
- 标准库 HTTPServer
- 简单路由
- WSGI 应用
- JSON API
"""

import json
import logging
import threading
import time
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Any, Callable
from urllib.parse import urlparse, parse_qs
from wsgiref.simple_server import make_server

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


# ======================================================================
# 1. 自定义 HTTP 处理器
# ======================================================================

class APIHandler(BaseHTTPRequestHandler):
    """简单的 JSON API 服务器"""

    # ✅ 路由表 — 简单的路由映射
    routes: dict[str, Callable[["APIHandler"], dict[str, Any]]] = {}

    @classmethod
    def route(cls, path: str) -> Callable:
        """路由注册装饰器"""
        def decorator(func: Callable) -> Callable:
            cls.routes[path] = func
            return func
        return decorator

    def do_GET(self) -> None:
        """处理 GET 请求"""
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        logger.info("GET %s (query=%s)", path, query)

        handler = self.routes.get(path)
        if handler:
            try:
                result = handler(self)
                self._send_json(200, result)
            except Exception as e:
                logger.error("处理出错: %s", e)
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Not Found", "path": path})

    def do_POST(self) -> None:
        """处理 POST 请求"""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        logger.info("POST %s (body=%s)", self.path, body[:100])

        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON"})
            return

        handler = self.routes.get(self.path)
        if handler:
            # 将解析后的 body 临时存储
            self._body_data = data  # type: ignore[attr-defined]
            result = handler(self)
            self._send_json(200, result)
        else:
            self._send_json(404, {"error": "Not Found"})

    def _send_json(self, status: int, data: dict[str, Any]) -> None:
        """发送 JSON 响应"""
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: Any) -> None:
        """覆盖默认日志，使用 logger"""
        logger.debug("HTTP %s", format % args)


# ✅ 注册路由
@APIHandler.route("/")
def index(handler: APIHandler) -> dict[str, Any]:
    return {"message": "Welcome to Python API Server!", "version": "1.0"}


@APIHandler.route("/api/time")
def get_time(handler: APIHandler) -> dict[str, Any]:
    now = datetime.now()
    return {"time": now.isoformat(), "timestamp": now.timestamp()}


@APIHandler.route("/api/echo")
def echo(handler: APIHandler) -> dict[str, Any]:
    parsed = urlparse(handler.path)
    params = parse_qs(parsed.query)
    return {"echo": params, "method": "GET"}


@APIHandler.route("/api/greet")
def greet(handler: APIHandler) -> dict[str, Any]:
    parsed = urlparse(handler.path)
    params = parse_qs(parsed.query)
    name = params.get("name", ["World"])[0]
    return {"greeting": f"Hello, {name}!", "name": name}


# ======================================================================
# 2. WSGI 应用
# ======================================================================

def wsgi_app(
    environ: dict[str, Any],
    start_response: Callable[..., Any],
) -> list[bytes]:
    """WSGI 应用 — 简单的 JSON API"""
    path = environ.get("PATH_INFO", "/")
    method = environ.get("REQUEST_METHOD", "GET")
    logger.info("[WSGI] %s %s", method, path)

    routes: dict[str, dict[str, Any]] = {
        "/": {"message": "Hello from WSGI!"},
        "/health": {"status": "ok", "time": datetime.now().isoformat()},
    }

    if path in routes:
        status = "200 OK"
        body = json.dumps(routes[path], ensure_ascii=False).encode("utf-8")
    else:
        status = "404 Not Found"
        body = json.dumps({"error": "Not Found"}).encode("utf-8")

    headers = [
        ("Content-Type", "application/json; charset=utf-8"),
        ("Content-Length", str(len(body))),
    ]
    start_response(status, headers)
    return [body]


# ======================================================================
# 演示
# ======================================================================

def run_server_in_thread(server: HTTPServer, label: str) -> None:
    """在后台线程中运行服务器"""
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    port = server.server_address[1]
    logger.info("[%s] 服务器运行在 http://127.0.0.1:%d", label, port)


def main() -> None:
    print("=" * 60)
    print("1. 自定义 HTTP API 服务器")
    print("=" * 60)

    api_server = HTTPServer(("127.0.0.1", 0), APIHandler)
    api_port = api_server.server_address[1]
    run_server_in_thread(api_server, "API")

    # 测试服务器
    time.sleep(0.2)
    from urllib.request import urlopen

    urls = [
        f"http://127.0.0.1:{api_port}/",
        f"http://127.0.0.1:{api_port}/api/time",
        f"http://127.0.0.1:{api_port}/api/greet?name=Python",
        f"http://127.0.0.1:{api_port}/api/echo?key=value&lang=python",
        f"http://127.0.0.1:{api_port}/nonexistent",
    ]

    for url in urls:
        try:
            with urlopen(url, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                print(f"  {url}")
                print(f"    → {data}")
        except Exception as e:
            print(f"  {url}")
            print(f"    → 错误: {e}")

    api_server.shutdown()

    print("\n" + "=" * 60)
    print("2. WSGI 服务器")
    print("=" * 60)

    wsgi_server = make_server("127.0.0.1", 0, wsgi_app)
    wsgi_port = wsgi_server.server_address[1]
    run_server_in_thread(wsgi_server, "WSGI")

    time.sleep(0.2)
    for path in ["/", "/health", "/missing"]:
        url = f"http://127.0.0.1:{wsgi_port}{path}"
        try:
            with urlopen(url, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                print(f"  {path} → {data}")
        except Exception as e:
            print(f"  {path} → 错误: {e}")

    wsgi_server.shutdown()
    print("\n服务器已关闭")


if __name__ == "__main__":
    main()
