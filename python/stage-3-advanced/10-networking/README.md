# 第 10 章：网络编程 — 让程序会说话

> "The network is the computer."
> — John Gage, Sun Microsystems
>
> 在万物互联的时代，一个不会上网的程序就像一个不会说话的人——
> 它可能很聪明，但无法与世界交流。
> 本章让你的 Python 程序开口说话。

---

## 📖 本章内容

- [1. Socket 编程基础](#1-socket-编程基础)
- [2. TCP vs UDP](#2-tcp-vs-udp)
- [3. HTTP 客户端](#3-http-客户端)
- [4. HTTP 服务器概念](#4-http-服务器概念)
- [5. WebSocket 基础](#5-websocket-基础)
- [6. 序列化协议](#6-序列化协议)
- [最佳实践 / 常见陷阱](#最佳实践--常见陷阱)
- [练习题](#练习题)
- [参考资源 / 下一步](#参考资源--下一步)

---

## 1. Socket 编程基础

> 🎭 **The Drama: 网络的本质**
>
> 网络编程的本质就是两个程序之间的对话。
> Socket 是这场对话的"电话线"——一端说话（发送数据），另一端听（接收数据）。
>
> 你在浏览器里输入 URL，按下回车——
> 浏览器通过 Socket 连接服务器，发送 HTTP 请求，接收响应，渲染页面。
> 整个过程，底层都是 Socket。

### 1.1 Socket 是什么

```
+---------------------------+
|      应用层 (HTTP/WS)      |
+---------------------------+
|      传输层 (TCP/UDP)       |     ← Socket API 在这里
+---------------------------+
|      网络层 (IP)           |
+---------------------------+
|    链路层 (Ethernet/WiFi)   |
+---------------------------+

Socket = IP 地址 + 端口号
```

Socket 是操作系统提供的网络通信接口。Python 的 `socket` 模块是对系统 socket API 的薄封装。

### 1.2 TCP Socket 基础流程

```
服务端                              客户端
  │                                  │
  │ socket()                         │ socket()
  │ bind(addr)                       │
  │ listen()                         │
  │ accept() ──── 等待连接 ────────── │ connect(addr)
  │         ←── 三次握手 ───→         │
  │ recv() ←──── 数据传输 ────→ send()│
  │ send() ────→ 数据传输 ──→ recv()  │
  │ close()                          │ close()
  │         ←── 四次挥手 ───→         │
```

```python
import socket
import logging

logger = logging.getLogger(__name__)


# ✅ TCP 服务端基础
def tcp_server(host: str = "127.0.0.1", port: int = 8888) -> None:
    """TCP 回显服务器"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind((host, port))
        server.listen(5)
        logger.info("服务器监听: %s:%d", host, port)

        while True:
            conn, addr = server.accept()
            logger.info("客户端连接: %s", addr)
            with conn:
                while True:
                    data = conn.recv(1024)
                    if not data:
                        break
                    logger.info("收到: %s", data.decode())
                    conn.sendall(data)  # 回显
                logger.info("客户端断开: %s", addr)


# ✅ TCP 客户端基础
def tcp_client(host: str = "127.0.0.1", port: int = 8888) -> None:
    """TCP 客户端"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
        client.connect((host, port))
        logger.info("已连接到 %s:%d", host, port)

        message = "Hello, Server!"
        client.sendall(message.encode())
        logger.info("发送: %s", message)

        data = client.recv(1024)
        logger.info("收到回显: %s", data.decode())
```

### 1.3 Socket 参数详解

| 参数 | 含义 | 常用值 |
|:---|:---|:---|
| `AF_INET` | IPv4 地址族 | 最常用 |
| `AF_INET6` | IPv6 地址族 | IPv6 环境 |
| `SOCK_STREAM` | TCP（面向连接） | 可靠传输 |
| `SOCK_DGRAM` | UDP（无连接） | 低延迟 |
| `SO_REUSEADDR` | 地址重用 | 服务端必设 |

---

## 2. TCP vs UDP

> 🧠 **CS Master's Bridge: 可靠性 vs 速度的权衡**
>
> TCP 是"挂号信"——保证送达、按序到达、不重复。代价是慢。
> UDP 是"投信"——扔进去就完了，能不能到不保证。优势是快。
>
> 选哪个取决于你的场景：
> - 文件传输、网页、API → TCP（不能丢数据）
> - 视频通话、游戏、DNS → UDP（丢几帧无所谓，延迟更重要）

| 特性 | TCP | UDP |
|:---|:---|:---|
| 连接方式 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 保证送达、有序 | 不保证 |
| 流量控制 | 有 | 无 |
| 速度 | 较慢 | 更快 |
| 头部开销 | 20 字节 | 8 字节 |
| 适用场景 | HTTP、文件传输、邮件 | DNS、视频流、游戏 |

### 2.1 UDP Socket 示例

```python
import socket
import logging

logger = logging.getLogger(__name__)


# ✅ UDP 服务端
def udp_server(host: str = "127.0.0.1", port: int = 9999) -> None:
    """UDP 回显服务器 — 注意：没有 listen/accept"""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as server:
        server.bind((host, port))
        logger.info("UDP 服务器监听: %s:%d", host, port)

        while True:
            data, addr = server.recvfrom(1024)
            logger.info("收到来自 %s: %s", addr, data.decode())
            server.sendto(data, addr)  # 回显给发送者


# ✅ UDP 客户端
def udp_client(host: str = "127.0.0.1", port: int = 9999) -> None:
    """UDP 客户端 — 注意：不需要 connect"""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as client:
        message = "Hello UDP!"
        client.sendto(message.encode(), (host, port))
        logger.info("发送: %s", message)

        data, _ = client.recvfrom(1024)
        logger.info("收到回显: %s", data.decode())
```

```python
# ❌ 常见错误：UDP 用 connect/listen/accept
# UDP 是无连接的，不需要这些步骤
with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
    s.listen(5)   # ❌ UDP 不支持 listen
    s.accept()    # ❌ UDP 不支持 accept
```

---

## 3. HTTP 客户端

> 🧰 **Toolbox: requests vs httpx**
>
> `requests` 是 Python HTTP 客户端的事实标准，简单好用。
> `httpx` 是新一代客户端，API 兼容 requests，且支持异步。

### 3.1 requests 基础

```python
import json
import logging

logger = logging.getLogger(__name__)

# pip install requests
import requests


def requests_demo() -> None:
    """requests 基础用法"""

    # ✅ GET 请求
    response = requests.get(
        "https://httpbin.org/get",
        params={"key": "value", "lang": "python"},
        headers={"User-Agent": "PythonLearner/1.0"},
        timeout=10,  # ✅ 永远设置 timeout！
    )
    logger.info("GET 状态码: %d", response.status_code)
    print(f"GET 响应: {response.json()['args']}")

    # ✅ POST 请求（JSON）
    response = requests.post(
        "https://httpbin.org/post",
        json={"name": "Alice", "age": 30},
        timeout=10,
    )
    logger.info("POST 状态码: %d", response.status_code)
    print(f"POST 响应: {response.json()['json']}")

    # ✅ Session 复用（保持连接 + Cookie）
    with requests.Session() as session:
        session.headers.update({"Authorization": "Bearer token123"})

        r1 = session.get("https://httpbin.org/headers", timeout=10)
        logger.info("Session 请求 1: %d", r1.status_code)

        r2 = session.get("https://httpbin.org/headers", timeout=10)
        logger.info("Session 请求 2: %d", r2.status_code)
```

```python
# ❌ 不设置 timeout — 可能永远阻塞
response = requests.get("https://example.com")  # 如果服务器不响应呢？

# ✅ 永远设置 timeout
response = requests.get("https://example.com", timeout=10)

# ❌ 不检查状态码
data = requests.get("https://api.example.com/data").json()

# ✅ 检查或使用 raise_for_status()
response = requests.get("https://api.example.com/data", timeout=10)
response.raise_for_status()  # 4xx/5xx 时抛出异常
data = response.json()
```

### 3.2 httpx — 异步 HTTP 客户端

```python
import logging

logger = logging.getLogger(__name__)

# pip install httpx
import httpx


# ✅ 同步用法（与 requests 几乎相同）
def httpx_sync_demo() -> None:
    """httpx 同步用法"""
    with httpx.Client(timeout=10.0) as client:
        response = client.get("https://httpbin.org/get")
        logger.info("httpx 同步: %d", response.status_code)
        print(f"httpx 响应: {response.json()['url']}")


# ✅ 异步用法 — httpx 的杀手锏
async def httpx_async_demo() -> None:
    """httpx 异步用法 — 并发请求"""
    import asyncio

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 并发发送多个请求
        urls = [
            "https://httpbin.org/delay/1",
            "https://httpbin.org/delay/1",
            "https://httpbin.org/delay/1",
        ]
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)

        for i, resp in enumerate(responses):
            logger.info("异步请求 %d: %d", i, resp.status_code)
```

### 3.3 requests vs httpx 对比

| 特性 | requests | httpx |
|:---|:---|:---|
| 同步支持 | 是 | 是 |
| 异步支持 | 否 | 是（`AsyncClient`） |
| HTTP/2 | 否 | 是（需安装 `h2`） |
| API 兼容性 | 事实标准 | 几乎兼容 requests |
| 成熟度 | 非常成熟 | 较成熟 |
| 推荐场景 | 简单同步请求 | 需要异步/HTTP2 |

---

## 4. HTTP 服务器概念

> 🌌 **The Big Picture: WSGI 与 ASGI**
>
> Python Web 生态有两个核心接口标准：
> - **WSGI** (Web Server Gateway Interface) — 同步的，经典的（Flask、Django）
> - **ASGI** (Asynchronous Server Gateway Interface) — 异步的，现代的（FastAPI、Starlette）
>
> 它们定义了"Web 服务器"和"Python 应用"之间的通信协议。

### 4.1 WSGI 最简实现

```python
from typing import Any, Callable
import logging

logger = logging.getLogger(__name__)


def simple_wsgi_app(
    environ: dict[str, Any],
    start_response: Callable[..., Any],
) -> list[bytes]:
    """最简 WSGI 应用 — 理解 WSGI 接口"""
    path = environ.get("PATH_INFO", "/")
    method = environ.get("REQUEST_METHOD", "GET")
    logger.info("WSGI 请求: %s %s", method, path)

    if path == "/":
        status = "200 OK"
        body = b"Hello from WSGI!"
    elif path == "/about":
        status = "200 OK"
        body = b"About page"
    else:
        status = "404 Not Found"
        body = b"Not Found"

    headers = [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Content-Length", str(len(body))),
    ]
    start_response(status, headers)
    return [body]


# 运行：
# from wsgiref.simple_server import make_server
# server = make_server("", 8000, simple_wsgi_app)
# server.serve_forever()
```

### 4.2 ASGI 最简实现

```python
import logging

logger = logging.getLogger(__name__)


async def simple_asgi_app(scope: dict, receive, send) -> None:
    """最简 ASGI 应用 — 理解 ASGI 接口"""
    if scope["type"] == "http":
        path = scope.get("path", "/")
        logger.info("ASGI 请求: %s", path)

        if path == "/":
            body = b"Hello from ASGI!"
            status = 200
        else:
            body = b"Not Found"
            status = 404

        await send({
            "type": "http.response.start",
            "status": status,
            "headers": [
                [b"content-type", b"text/plain"],
            ],
        })
        await send({
            "type": "http.response.body",
            "body": body,
        })

# 运行：uvicorn module_name:simple_asgi_app
```

### 4.3 用标准库快速启动 HTTP 服务器

```python
from http.server import HTTPServer, SimpleHTTPRequestHandler
import logging

logger = logging.getLogger(__name__)


class MyHandler(SimpleHTTPRequestHandler):
    """自定义 HTTP 处理器"""

    def do_GET(self) -> None:
        logger.info("收到 GET: %s", self.path)
        if self.path == "/api/hello":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"message": "Hello!"}')
        elif self.path == "/api/time":
            import datetime
            now = datetime.datetime.now().isoformat()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(f'{{"time": "{now}"}}'.encode())
        else:
            super().do_GET()  # 默认：静态文件服务


# 启动：
# server = HTTPServer(("", 8000), MyHandler)
# server.serve_forever()

# 或命令行快速启动静态文件服务器：
# python -m http.server 8000
```

### 4.4 WSGI vs ASGI 对比

| 特性 | WSGI | ASGI |
|:---|:---|:---|
| 并发模型 | 同步（一请求一线程） | 异步（事件驱动） |
| WebSocket | 不支持 | 支持 |
| HTTP/2 | 通过反代 | 原生支持 |
| 框架 | Flask, Django | FastAPI, Starlette |
| 服务器 | Gunicorn, uWSGI | Uvicorn, Daphne |
| 性能 | 中等 | 高（IO 密集型） |

---

## 5. WebSocket 基础

> 🎭 **The Drama: 当 HTTP 不够用时**
>
> HTTP 是"请求-响应"模型——客户端问，服务器答。
> 但如果服务器有新消息想主动推给客户端呢？ HTTP 做不到。
>
> WebSocket 解决了这个问题：它建立一个持久的双向通道，
> 双方可以随时互发消息。聊天应用、实时通知、在线游戏——都靠它。

### 5.1 WebSocket 握手

```
客户端                                    服务器
  │                                        │
  │ ── HTTP Upgrade 请求 ────────────────→ │
  │    GET /ws HTTP/1.1                    │
  │    Upgrade: websocket                  │
  │    Connection: Upgrade                 │
  │                                        │
  │ ←──── 101 Switching Protocols ──────── │
  │                                        │
  │ ←═══════ WebSocket 双向通道 ═══════════→ │
  │    消息帧（文本/二进制）                   │
  │ ←═══════════════════════════════════→  │
```

### 5.2 WebSocket 服务端

```python
import asyncio
import json
import logging

logger = logging.getLogger(__name__)

# pip install websockets
import websockets
from websockets.server import serve


async def ws_handler(websocket) -> None:
    """WebSocket 处理器 — 回显 + 广播"""
    client_id = id(websocket)
    logger.info("客户端连接: %d", client_id)

    try:
        async for message in websocket:
            logger.info("收到消息 [%d]: %s", client_id, message)

            # 回显
            response = json.dumps({
                "echo": message,
                "client_id": client_id,
            })
            await websocket.send(response)
            logger.info("发送响应 [%d]: %s", client_id, response)

    except websockets.ConnectionClosed:
        logger.info("客户端断开: %d", client_id)


async def start_server(host: str = "127.0.0.1", port: int = 8765) -> None:
    """启动 WebSocket 服务器"""
    async with serve(ws_handler, host, port):
        logger.info("WebSocket 服务器: ws://%s:%d", host, port)
        await asyncio.Future()  # 永不结束


# asyncio.run(start_server())
```

### 5.3 WebSocket 客户端

```python
import asyncio
import json
import logging

logger = logging.getLogger(__name__)

import websockets


async def ws_client(uri: str = "ws://127.0.0.1:8765") -> None:
    """WebSocket 客户端"""
    async with websockets.connect(uri) as ws:
        logger.info("已连接: %s", uri)

        # 发送消息
        messages = ["Hello", "你好", "Goodbye"]
        for msg in messages:
            await ws.send(msg)
            logger.info("发送: %s", msg)

            response = await ws.recv()
            data = json.loads(response)
            logger.info("收到: %s", data)
            print(f"  回显: {data['echo']}")


# asyncio.run(ws_client())
```

---

## 6. 序列化协议

> 🧠 **CS Master's Bridge: 数据在线上长什么样**
>
> 程序之间通信需要共同的"语言"——序列化协议。
> 发送方把对象变成字节流（序列化），接收方把字节流变回对象（反序列化）。
>
> 选择哪种协议取决于：人可读性、性能、跨语言支持。

### 6.1 JSON — 人类可读的通用选择

```python
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


def json_demo() -> None:
    """JSON 序列化演示"""
    data: dict[str, Any] = {
        "name": "Alice",
        "age": 30,
        "scores": [95, 87, 92],
        "address": {"city": "Shanghai", "country": "China"},
    }

    # 序列化
    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    logger.info("JSON 大小: %d bytes", len(json_str.encode()))
    print(f"JSON:\n{json_str}")

    # 反序列化
    restored = json.loads(json_str)
    logger.info("反序列化: %s", type(restored).__name__)
    assert restored == data

    # ✅ 自定义序列化器
    from datetime import datetime

    class DateTimeEncoder(json.JSONEncoder):
        def default(self, obj: Any) -> Any:
            if isinstance(obj, datetime):
                return obj.isoformat()
            return super().default(obj)

    event = {"name": "meeting", "time": datetime.now()}
    print(json.dumps(event, cls=DateTimeEncoder))
```

### 6.2 Protocol Buffers — 高性能二进制

```python
# Protocol Buffers（protobuf）需要定义 .proto 文件
# 这里展示概念和对比

# message.proto:
# syntax = "proto3";
# message Person {
#     string name = 1;
#     int32 age = 2;
#     repeated string hobbies = 3;
# }

# pip install protobuf
# protoc --python_out=. message.proto

# 使用：
# from message_pb2 import Person
# person = Person(name="Alice", age=30)
# person.hobbies.append("coding")
# binary = person.SerializeToString()   # 序列化
# restored = Person.FromString(binary)   # 反序列化
```

### 6.3 MessagePack — 紧凑的二进制 JSON

```python
import json
import logging

logger = logging.getLogger(__name__)

# pip install msgpack
try:
    import msgpack

    def msgpack_demo() -> None:
        """MessagePack 演示"""
        data = {
            "name": "Alice",
            "age": 30,
            "scores": [95, 87, 92],
            "active": True,
        }

        # MessagePack 序列化
        packed = msgpack.packb(data, use_bin_type=True)
        logger.info("MessagePack 大小: %d bytes", len(packed))

        # JSON 序列化（对比）
        json_bytes = json.dumps(data).encode()
        logger.info("JSON 大小: %d bytes", len(json_bytes))

        # 反序列化
        unpacked = msgpack.unpackb(packed, raw=False)
        logger.info("反序列化: %s", unpacked)

        print(f"  MessagePack: {len(packed)} bytes")
        print(f"  JSON:        {len(json_bytes)} bytes")
        print(f"  节省: {(1 - len(packed) / len(json_bytes)) * 100:.0f}%")

except ImportError:
    logger.warning("msgpack 未安装")
```

### 6.4 序列化协议对比

| 特性 | JSON | Protocol Buffers | MessagePack | pickle |
|:---|:---|:---|:---|:---|
| 人可读 | 是 | 否 | 否 | 否 |
| 大小 | 大 | 小 | 中 | 中 |
| 速度 | 中 | 快 | 快 | 中 |
| 跨语言 | 是 | 是 | 是 | 仅 Python |
| Schema | 无 | 必须 | 无 | 无 |
| 安全性 | 安全 | 安全 | 安全 | **不安全** |

```python
# ❌ 永远不要反序列化不受信任的 pickle 数据
import pickle

# 恶意 pickle 可以执行任意代码！
# pickle.loads(untrusted_data)  # 极度危险！

# ✅ 对外通信用 JSON / protobuf / msgpack
# pickle 只用于本地、可信的临时缓存
```

---

## 最佳实践 / 常见陷阱

### 最佳实践

| 原则 | 说明 |
|:---|:---|
| 设置 timeout | 所有网络操作必须设置超时 |
| 使用 context manager | `with socket()`, `with requests.Session()` |
| 错误处理 | 网络总会出错——连接失败、超时、断开 |
| 复用连接 | 使用 Session/连接池，避免每次新建连接 |
| 安全传输 | 生产环境用 HTTPS/TLS |

### 常见陷阱

```python
# ❌ 陷阱 1：不设置 timeout
socket.connect(("example.com", 80))           # 可能永远阻塞
requests.get("https://slow-server.com")       # 可能永远等待

# ✅ 解决
socket.settimeout(10.0)
requests.get("https://slow-server.com", timeout=10)

# ❌ 陷阱 2：忽略 recv 可能返回部分数据
data = conn.recv(4096)  # 不保证收到完整消息！

# ✅ 解决：循环接收或使用 sendall
def recv_all(conn: socket.socket, length: int) -> bytes:
    """接收指定长度的数据"""
    data = b""
    while len(data) < length:
        chunk = conn.recv(length - len(data))
        if not chunk:
            raise ConnectionError("连接断开")
        data += chunk
    return data

# ❌ 陷阱 3：不处理连接异常
response = requests.get("https://api.example.com/data")

# ✅ 解决
import requests
try:
    response = requests.get("https://api.example.com/data", timeout=10)
    response.raise_for_status()
except requests.ConnectionError:
    print("连接失败")
except requests.Timeout:
    print("请求超时")
except requests.HTTPError as e:
    print(f"HTTP 错误: {e.response.status_code}")

# ❌ 陷阱 4：pickle 反序列化不受信任的数据
pickle.loads(data_from_network)  # 任意代码执行漏洞！

# ✅ 解决：用 JSON / protobuf / msgpack
```

---

## 练习题

### 练习 1：实现简单的聊天室

**要求**：用 TCP socket 实现一个多人聊天室：
- 服务端接受多个客户端连接
- 一个客户端发送的消息广播给所有其他客户端

<details>
<summary>💡 提示</summary>

使用 `threading` 处理多个客户端，维护一个客户端列表。

```python
import threading

clients: list[socket.socket] = []

def handle_client(conn, addr):
    while True:
        data = conn.recv(1024)
        if not data:
            break
        for c in clients:
            if c != conn:
                c.sendall(data)
```
</details>

### 练习 2：HTTP API 客户端

**要求**：用 `requests` 或 `httpx` 实现一个 GitHub API 客户端：
- 获取用户信息
- 获取仓库列表
- 处理分页

<details>
<summary>✅ 参考答案</summary>

```python
import requests
import logging

logger = logging.getLogger(__name__)

class GitHubClient:
    BASE_URL = "https://api.github.com"

    def __init__(self, token: str | None = None) -> None:
        self.session = requests.Session()
        self.session.headers["Accept"] = "application/vnd.github.v3+json"
        if token:
            self.session.headers["Authorization"] = f"token {token}"

    def get_user(self, username: str) -> dict:
        resp = self.session.get(f"{self.BASE_URL}/users/{username}", timeout=10)
        resp.raise_for_status()
        return resp.json()

    def get_repos(self, username: str, page: int = 1) -> list[dict]:
        resp = self.session.get(
            f"{self.BASE_URL}/users/{username}/repos",
            params={"page": page, "per_page": 30},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

client = GitHubClient()
user = client.get_user("python")
print(f"{user['login']}: {user.get('bio', 'N/A')}")
```
</details>

---

## 参考资源 / 下一步

- [Python socket 官方文档](https://docs.python.org/3/library/socket.html)
- [requests 文档](https://docs.python-requests.org/)
- [httpx 文档](https://www.python-httpx.org/)
- [websockets 文档](https://websockets.readthedocs.io/)
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/)
- [Real Python: Socket Programming](https://realpython.com/python-sockets/)

---

[⬅️ 第 9 章：性能优化](../09-performance-profiling/README.md) | [🏠 返回目录](../README.md) | [➡️ 练习题集](../exercises/README.md)
