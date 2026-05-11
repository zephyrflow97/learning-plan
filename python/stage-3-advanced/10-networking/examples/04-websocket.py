"""
第 10 章 示例 04：WebSocket 与序列化
- WebSocket 服务端/客户端（使用标准库模拟概念）
- JSON 序列化
- 消息协议设计
- 序列化格式对比
"""

import asyncio
import json
import logging
import struct
import sys
import time
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


# ======================================================================
# 1. WebSocket 概念演示（用 asyncio 模拟）
# ======================================================================

class MessageBroker:
    """消息代理 — 模拟 WebSocket 的发布/订阅功能

    注意：真实 WebSocket 请使用 `websockets` 库
    这里用 asyncio.Queue 模拟双向通信概念
    """

    def __init__(self) -> None:
        self._channels: dict[str, list[asyncio.Queue[str]]] = {}
        logger.info("消息代理已创建")

    def subscribe(self, channel: str) -> asyncio.Queue[str]:
        """订阅频道"""
        queue: asyncio.Queue[str] = asyncio.Queue()
        self._channels.setdefault(channel, []).append(queue)
        logger.info("新订阅: %s (共 %d 个)", channel, len(self._channels[channel]))
        return queue

    async def publish(self, channel: str, message: str) -> int:
        """发布消息到频道"""
        queues = self._channels.get(channel, [])
        for q in queues:
            await q.put(message)
        logger.info("发布到 '%s': %s (→ %d 个订阅者)", channel, message, len(queues))
        return len(queues)

    def unsubscribe(self, channel: str, queue: asyncio.Queue[str]) -> None:
        """取消订阅"""
        if channel in self._channels:
            self._channels[channel].remove(queue)
            logger.info("取消订阅: %s", channel)


async def websocket_simulation() -> None:
    """模拟 WebSocket 实时通信场景"""
    broker = MessageBroker()

    # 模拟客户端订阅
    chat_q1 = broker.subscribe("chat")
    chat_q2 = broker.subscribe("chat")
    news_q = broker.subscribe("news")

    # 模拟发送消息
    await broker.publish("chat", json.dumps({"user": "Alice", "msg": "你好！"}))
    await broker.publish("chat", json.dumps({"user": "Bob", "msg": "Hi!"}))
    await broker.publish("news", json.dumps({"title": "Python 3.13 发布"}))

    # 模拟接收消息
    print("\n  客户端 1 (chat):")
    while not chat_q1.empty():
        msg = await chat_q1.get()
        data = json.loads(msg)
        print(f"    收到: [{data['user']}] {data['msg']}")

    print("\n  客户端 2 (chat):")
    while not chat_q2.empty():
        msg = await chat_q2.get()
        data = json.loads(msg)
        print(f"    收到: [{data['user']}] {data['msg']}")

    print("\n  新闻订阅者:")
    while not news_q.empty():
        msg = await news_q.get()
        data = json.loads(msg)
        print(f"    收到: {data['title']}")


# ======================================================================
# 2. 消息协议设计
# ======================================================================

class MessageProtocol:
    """简单的二进制消息协议

    协议格式：
    +--------+--------+--------+----------+
    | 类型   | 序列号  | 长度    | 消息体    |
    | 1 byte | 4 bytes| 4 bytes| N bytes  |
    +--------+--------+--------+----------+
    """

    # 消息类型
    TYPE_TEXT = 0x01
    TYPE_BINARY = 0x02
    TYPE_PING = 0x03
    TYPE_PONG = 0x04

    HEADER_FORMAT = "!BII"  # 网络字节序：1B type + 4B seq + 4B length
    HEADER_SIZE = struct.calcsize(HEADER_FORMAT)

    @staticmethod
    def encode(msg_type: int, seq: int, payload: bytes) -> bytes:
        """编码消息"""
        header = struct.pack(
            MessageProtocol.HEADER_FORMAT,
            msg_type, seq, len(payload),
        )
        logger.info(
            "编码消息: type=%d, seq=%d, len=%d",
            msg_type, seq, len(payload),
        )
        return header + payload

    @staticmethod
    def decode(data: bytes) -> tuple[int, int, bytes]:
        """解码消息 → (type, seq, payload)"""
        if len(data) < MessageProtocol.HEADER_SIZE:
            raise ValueError(f"数据太短: {len(data)} < {MessageProtocol.HEADER_SIZE}")

        msg_type, seq, length = struct.unpack(
            MessageProtocol.HEADER_FORMAT,
            data[:MessageProtocol.HEADER_SIZE],
        )
        payload = data[MessageProtocol.HEADER_SIZE:MessageProtocol.HEADER_SIZE + length]
        logger.info(
            "解码消息: type=%d, seq=%d, len=%d",
            msg_type, seq, length,
        )
        return msg_type, seq, payload


# ======================================================================
# 3. 序列化格式对比
# ======================================================================

def serialization_comparison() -> None:
    """对比不同序列化格式的大小和速度"""
    import pickle

    data: dict[str, Any] = {
        "users": [
            {"name": "Alice", "age": 30, "email": "alice@example.com", "scores": [95, 87, 92]},
            {"name": "Bob", "age": 25, "email": "bob@example.com", "scores": [88, 91, 76]},
            {"name": "Charlie", "age": 35, "email": "charlie@example.com", "scores": [100, 95, 98]},
        ],
        "metadata": {
            "total": 3,
            "page": 1,
            "timestamp": 1700000000,
        },
    }

    results: list[dict[str, Any]] = []

    # JSON
    start = time.perf_counter()
    for _ in range(10_000):
        encoded = json.dumps(data).encode("utf-8")
        json.loads(encoded)
    json_time = time.perf_counter() - start
    results.append({
        "format": "JSON",
        "size": len(encoded),
        "time": json_time,
        "human_readable": True,
    })

    # pickle（仅限 Python）
    start = time.perf_counter()
    for _ in range(10_000):
        encoded_pickle = pickle.dumps(data)
        pickle.loads(encoded_pickle)
    pickle_time = time.perf_counter() - start
    results.append({
        "format": "pickle",
        "size": len(encoded_pickle),
        "time": pickle_time,
        "human_readable": False,
    })

    # msgpack（如果安装了）
    try:
        import msgpack
        start = time.perf_counter()
        for _ in range(10_000):
            encoded_mp = msgpack.packb(data, use_bin_type=True)
            msgpack.unpackb(encoded_mp, raw=False)
        mp_time = time.perf_counter() - start
        results.append({
            "format": "msgpack",
            "size": len(encoded_mp),
            "time": mp_time,
            "human_readable": False,
        })
    except ImportError:
        logger.info("msgpack 未安装，跳过")

    # 打印对比结果
    print(f"\n  {'格式':<12} {'大小 (bytes)':<15} {'10K 轮次 (s)':<15} {'可读'}")
    print(f"  {'-' * 55}")
    for r in results:
        readable = "是" if r["human_readable"] else "否"
        print(f"  {r['format']:<12} {r['size']:<15} {r['time']:<15.4f} {readable}")


# ======================================================================
# 演示
# ======================================================================

def main() -> None:
    print("=" * 60)
    print("1. WebSocket 概念模拟（发布/订阅）")
    print("=" * 60)
    asyncio.run(websocket_simulation())

    print("\n" + "=" * 60)
    print("2. 二进制消息协议")
    print("=" * 60)

    # 编码
    msg1 = MessageProtocol.encode(
        MessageProtocol.TYPE_TEXT, 1,
        "Hello, Protocol!".encode("utf-8"),
    )
    msg2 = MessageProtocol.encode(
        MessageProtocol.TYPE_PING, 2,
        b"",
    )
    msg3 = MessageProtocol.encode(
        MessageProtocol.TYPE_TEXT, 3,
        json.dumps({"action": "subscribe", "channel": "chat"}).encode("utf-8"),
    )

    # 解码
    for raw in [msg1, msg2, msg3]:
        msg_type, seq, payload = MessageProtocol.decode(raw)
        type_name = {1: "TEXT", 2: "BINARY", 3: "PING", 4: "PONG"}.get(msg_type, "?")
        print(f"  [{type_name}] seq={seq}, payload={payload.decode('utf-8') if payload else '(empty)'}")

    print(f"\n  协议头大小: {MessageProtocol.HEADER_SIZE} bytes")

    print("\n" + "=" * 60)
    print("3. 序列化格式对比")
    print("=" * 60)
    serialization_comparison()


if __name__ == "__main__":
    main()
