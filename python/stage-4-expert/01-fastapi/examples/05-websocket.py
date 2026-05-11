"""
FastAPI WebSocket + 鑳屾櫙浠诲姟绀轰緥
================================
婕旂ず WebSocket 瀹炴椂閫氫俊銆佽繛鎺ョ鐞嗗櫒銆佽儗鏅换鍔?杩愯: uvicorn examples.05_websocket:app --reload
"""

import asyncio
import json
import logging
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="WebSocket & Background Tasks Demo")


# =============================================
# 绗竴閮ㄥ垎锛氳儗鏅换鍔?# =============================================

def send_email_notification(to: str, subject: str, body: str) -> None:
    """妯℃嫙鍙戦€侀偖浠讹紙鑰楁椂鍚屾鎿嶄綔锛?""
    import time
    logger.info(f"[Email] 寮€濮嬪彂閫? to={to}, subject={subject}")
    time.sleep(2)  # 妯℃嫙閭欢鍙戦€佽€楁椂
    logger.info(f"[Email] 鍙戦€佸畬鎴? to={to}")


def generate_report(report_id: str, title: str) -> None:
    """妯℃嫙鐢熸垚鎶ュ憡"""
    import time
    logger.info(f"[Report] 寮€濮嬬敓鎴? id={report_id}")
    time.sleep(3)
    logger.info(f"[Report] 鐢熸垚瀹屾垚: id={report_id}")


class UserRegistration(BaseModel):
    username: str
    email: str


@app.post("/register", status_code=201, tags=["鑳屾櫙浠诲姟"])
async def register_user(
    user: UserRegistration,
    background_tasks: BackgroundTasks,
) -> dict:
    """鐢ㄦ埛娉ㄥ唽 鈥?绔嬪嵆杩斿洖锛岄偖浠跺悗鍙板彂閫?""
    logger.info(f"[Register] 鏂扮敤鎴? {user.username}")
    background_tasks.add_task(
        send_email_notification,
        to=user.email,
        subject="娆㈣繋鍔犲叆!",
        body=f"浣犲ソ {user.username}",
    )
    return {"message": "娉ㄥ唽鎴愬姛", "username": user.username}


class ReportRequest(BaseModel):
    title: str
    data_source: str


@app.post("/reports", status_code=202, tags=["鑳屾櫙浠诲姟"])
async def create_report(
    report: ReportRequest,
    background_tasks: BackgroundTasks,
) -> dict:
    """鍒涘缓鎶ュ憡 鈥?杩斿洖 202锛屽悗鍙扮敓鎴?""
    report_id = f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    background_tasks.add_task(generate_report, report_id, report.title)
    background_tasks.add_task(
        send_email_notification,
        to="admin@example.com",
        subject=f"鎶ュ憡 {report_id} 宸插紑濮?,
        body=f"鎶ュ憡 '{report.title}' 姝ｅ湪鐢熸垚",
    )
    return {"report_id": report_id, "status": "processing"}


# =============================================
# 绗簩閮ㄥ垎锛歐ebSocket 杩炴帴绠＄悊
# =============================================

class ConnectionManager:
    """WebSocket 杩炴帴绠＄悊鍣?鈥?鏀寔鎴块棿鍒嗙粍"""

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str = "general") -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        if room not in self.rooms:
            self.rooms[room] = []
        self.rooms[room].append(websocket)
        logger.info(f"[WS] 鏂拌繛鎺ュ姞鍏?'{room}'锛屾€昏繛鎺? {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, room: str = "general") -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if room in self.rooms and websocket in self.rooms[room]:
            self.rooms[room].remove(websocket)
            if not self.rooms[room]:
                del self.rooms[room]
        logger.info(f"[WS] 杩炴帴鏂紑锛屾€昏繛鎺? {len(self.active_connections)}")

    async def broadcast(self, message: str) -> None:
        for conn in self.active_connections:
            try:
                await conn.send_text(message)
            except Exception:
                pass

    async def broadcast_to_room(self, message: str, room: str) -> None:
        for conn in self.rooms.get(room, []):
            try:
                await conn.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()


@app.websocket("/ws/chat/{room}")
async def chat_endpoint(websocket: WebSocket, room: str) -> None:
    """鑱婂ぉ WebSocket 绔偣"""
    await manager.connect(websocket, room)

    await manager.broadcast_to_room(
        json.dumps({
            "type": "system",
            "message": f"鏂扮敤鎴峰姞鍏?'{room}'",
            "timestamp": datetime.now().isoformat(),
        }),
        room,
    )

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"[WS] 鏀跺埌娑堟伅 (room={room}): {data}")

            try:
                msg = json.loads(data)
                broadcast_msg = json.dumps({
                    "type": "message",
                    "username": msg.get("username", "鍖垮悕"),
                    "content": msg.get("content", data),
                    "room": room,
                    "timestamp": datetime.now().isoformat(),
                })
            except json.JSONDecodeError:
                broadcast_msg = json.dumps({
                    "type": "message",
                    "username": "鍖垮悕",
                    "content": data,
                    "room": room,
                    "timestamp": datetime.now().isoformat(),
                })

            await manager.broadcast_to_room(broadcast_msg, room)

    except WebSocketDisconnect:
        manager.disconnect(websocket, room)
        await manager.broadcast_to_room(
            json.dumps({
                "type": "system",
                "message": "涓€浣嶇敤鎴风寮€浜?,
                "timestamp": datetime.now().isoformat(),
            }),
            room,
        )


# =============================================
# 绗笁閮ㄥ垎锛氭祴璇曢〉闈?# =============================================

CHAT_HTML = """<!DOCTYPE html>
<html><head><title>WS Chat</title>
<style>
body{font-family:Arial;max-width:600px;margin:50px auto}
#messages{border:1px solid #ccc;height:300px;overflow-y:auto;padding:10px}
.system{color:#888;font-style:italic}.msg{margin:5px 0}
input,button{padding:8px;margin:5px}
</style></head><body>
<h1>WebSocket Chat Demo</h1>
<div><input id="user" placeholder="鐢ㄦ埛鍚? value="User1">
<input id="room" placeholder="鎴块棿" value="general">
<button onclick="connect()">杩炴帴</button>
<button onclick="disconnect()">鏂紑</button></div>
<div id="messages"></div>
<div><input id="msg" placeholder="娑堟伅..." onkeypress="if(event.key==='Enter')send()">
<button onclick="send()">鍙戦€?/button></div>
<script>
let ws;
function connect(){
  const room=document.getElementById('room').value;
  ws=new WebSocket('ws://localhost:8000/ws/chat/'+room);
  ws.onmessage=function(e){
    const d=JSON.parse(e.data),m=document.getElementById('messages'),
    div=document.createElement('div');
    if(d.type==='system'){div.className='system';div.textContent='[绯荤粺] '+d.message}
    else{div.className='msg';div.textContent='['+d.username+'] '+d.content}
    m.appendChild(div);m.scrollTop=m.scrollHeight};
  ws.onclose=function(){const m=document.getElementById('messages'),
    div=document.createElement('div');div.className='system';
    div.textContent='[绯荤粺] 杩炴帴宸叉柇寮€';m.appendChild(div)}}
function disconnect(){if(ws)ws.close()}
function send(){const i=document.getElementById('msg'),
  u=document.getElementById('user').value;
  if(ws&&i.value){ws.send(JSON.stringify({username:u,content:i.value}));i.value=''}}
</script></body></html>"""


@app.get("/chat", tags=["WebSocket"], response_class=HTMLResponse)
async def chat_page() -> HTMLResponse:
    return HTMLResponse(content=CHAT_HTML)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)