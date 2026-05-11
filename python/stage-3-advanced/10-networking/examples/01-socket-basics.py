"""
第 10 章 示例 01：Socket 编程基础
- TCP 服务端/客户端
- UDP 服务端/客户端
- Socket 实用工具
"""

import logging
import socket
import threading
import time

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


# ======================================================================
# 1. TCP 回显服务器
# ======================================================================

def tcp_echo_server(host: str = "127.0.0.1", port: int = 0) -> int:
    """TCP 回显服务器 — 在单独线程中运行，返回实际端口"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(5)
    actual_port = server.getsockname()[1]
    server.settimeout(5.0)  # ✅ 设置超时防止永久阻塞
    logger.info("[TCP 服务器] 监听: %s:%d", host, actual_port)

    def serve() -> None:
        try:
            conn, addr = server.accept()
            logger.info("[TCP 服务器] 客户端连接: %s", addr)
            with conn:
                conn.settimeout(5.0)
                while True:
                    data = conn.recv(1024)
                    if not data:
                        break
                    logger.info("[TCP 服务器] 收到: %s", data.decode())
                    conn.sendall(data)  # ✅ sendall 确保所有数据发送
                    logger.info("[TCP 服务器] 回显: %s", data.decode())
        except socket.timeout:
            logger.info("[TCP 服务器] 超时关闭")
        finally:
            server.close()

    threading.Thread(target=serve, daemon=True).start()
    return actual_port


def tcp_client(host: str, port: int, messages: list[str]) -> list[str]:
    """TCP 客户端 — 发送消息并接收回显"""
    responses: list[str] = []

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
        client.settimeout(5.0)
        client.connect((host, port))
        logger.info("[TCP 客户端] 已连接到 %s:%d", host, port)

        for msg in messages:
            client.sendall(msg.encode("utf-8"))
            logger.info("[TCP 客户端] 发送: %s", msg)

            data = client.recv(1024)
            response = data.decode("utf-8")
            responses.append(response)
            logger.info("[TCP 客户端] 收到: %s", response)

    return responses


# ======================================================================
# 2. UDP 回显服务器
# ======================================================================

def udp_echo_server(host: str = "127.0.0.1", port: int = 0) -> int:
    """UDP 回显服务器"""
    server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    server.bind((host, port))
    actual_port = server.getsockname()[1]
    server.settimeout(5.0)
    logger.info("[UDP 服务器] 监听: %s:%d", host, actual_port)

    def serve() -> None:
        try:
            for _ in range(10):  # 最多处理 10 个消息
                data, addr = server.recvfrom(1024)
                logger.info("[UDP 服务器] 收到来自 %s: %s", addr, data.decode())
                server.sendto(data, addr)
        except socket.timeout:
            logger.info("[UDP 服务器] 超时关闭")
        finally:
            server.close()

    threading.Thread(target=serve, daemon=True).start()
    return actual_port


def udp_client(host: str, port: int, messages: list[str]) -> list[str]:
    """UDP 客户端"""
    responses: list[str] = []

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as client:
        client.settimeout(5.0)

        for msg in messages:
            client.sendto(msg.encode("utf-8"), (host, port))
            logger.info("[UDP 客户端] 发送: %s", msg)

            data, _ = client.recvfrom(1024)
            response = data.decode("utf-8")
            responses.append(response)
            logger.info("[UDP 客户端] 收到: %s", response)

    return responses


# ======================================================================
# 3. 实用工具
# ======================================================================

def get_local_ip() -> str:
    """获取本机 IP 地址"""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        try:
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
        except OSError:
            ip = "127.0.0.1"
    logger.info("本机 IP: %s", ip)
    return ip


def resolve_hostname(hostname: str) -> list[str]:
    """DNS 解析"""
    try:
        results = socket.getaddrinfo(hostname, None, socket.AF_INET)
        ips = list({r[4][0] for r in results})
        logger.info("DNS 解析 %s → %s", hostname, ips)
        return ips
    except socket.gaierror as e:
        logger.error("DNS 解析失败: %s (%s)", hostname, e)
        return []


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    HOST = "127.0.0.1"

    print("=" * 60)
    print("1. TCP 回显")
    print("=" * 60)
    port = tcp_echo_server(HOST)
    time.sleep(0.1)  # 等待服务器启动
    responses = tcp_client(HOST, port, ["Hello TCP", "你好世界", "Goodbye"])
    for r in responses:
        print(f"  回显: {r}")

    print("\n" + "=" * 60)
    print("2. UDP 回显")
    print("=" * 60)
    port = udp_echo_server(HOST)
    time.sleep(0.1)
    responses = udp_client(HOST, port, ["Hello UDP", "快速消息"])
    for r in responses:
        print(f"  回显: {r}")

    print("\n" + "=" * 60)
    print("3. 网络工具")
    print("=" * 60)
    print(f"  本机 IP: {get_local_ip()}")
    ips = resolve_hostname("python.org")
    print(f"  python.org → {ips}")


if __name__ == "__main__":
    main()
