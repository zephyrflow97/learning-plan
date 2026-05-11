"""
FastAPI 渚濊禆娉ㄥ叆绀轰緥
=====================
婕旂ず渚濊禆娉ㄥ叆锛氬熀鏈緷璧栥€佷緷璧栭摼銆亂ield 渚濊禆銆佺被渚濊禆
杩愯: uvicorn examples.03_dependency_injection:app --reload
"""

import logging
from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException, Header, Query

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Dependency Injection Demo")


# =============================================
# 1. 鍩烘湰渚濊禆 鈥?鍏变韩閫氱敤鍙傛暟
# =============================================

async def common_parameters(
    skip: int = Query(default=0, ge=0, description="璺宠繃鐨勮褰曟暟"),
    limit: int = Query(default=100, ge=1, le=1000, description="鏈€澶ц繑鍥炴暟"),
    q: str | None = Query(default=None, description="鎼滅储鍏抽敭璇?),
) -> dict:
    """閫氱敤鍒嗛〉 + 鎼滅储鍙傛暟 鈥?澶氫釜璺敱鍏变韩"""
    logger.info(f"[Deps] 閫氱敤鍙傛暟: skip={skip}, limit={limit}, q={q}")
    return {"skip": skip, "limit": limit, "q": q}


# 鉁?浣跨敤 Annotated 绠€鍖栦緷璧栧０鏄庯紙Python 3.9+ 鎺ㄨ崘鍐欐硶锛?CommonParams = Annotated[dict, Depends(common_parameters)]


@app.get("/items", tags=["鍩烘湰渚濊禆"])
async def list_items(params: CommonParams) -> dict:
    """鍒楄〃鎺ュ彛 鈥?娉ㄥ叆閫氱敤鍒嗛〉鍙傛暟"""
    return {"endpoint": "items", **params}


@app.get("/users", tags=["鍩烘湰渚濊禆"])
async def list_users(params: CommonParams) -> dict:
    """鐢ㄦ埛鍒楄〃 鈥?鍚屾牱娉ㄥ叆閫氱敤鍒嗛〉鍙傛暟"""
    return {"endpoint": "users", **params}


# =============================================
# 2. 渚濊禆閾撅紙澶氱骇渚濊禆锛?# =============================================

async def verify_token(authorization: str = Header(...)) -> str:
    """绗竴灞傦細浠?Header 鎻愬彇骞堕獙璇?Token 鏍煎紡"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="鏃犳晥鐨?Token 鏍煎紡")
    token = authorization.split(" ", 1)[1]
    logger.info(f"[Auth] Token 鎻愬彇鎴愬姛: {token[:8]}...")
    return token


# 妯℃嫙鐢ㄦ埛鏁版嵁搴?FAKE_USERS_DB = {
    "valid-token-alice": {"user_id": 1, "username": "alice", "role": "admin"},
    "valid-token-bob": {"user_id": 2, "username": "bob", "role": "user"},
}


async def get_current_user(token: str = Depends(verify_token)) -> dict:
    """绗簩灞傦細鏍规嵁 Token 鏌ユ壘鐢ㄦ埛锛堜緷璧?verify_token锛?""
    user = FAKE_USERS_DB.get(token)
    if not user:
        raise HTTPException(status_code=401, detail="鏃犳晥鐨?Token")
    logger.info(f"[Auth] 鐢ㄦ埛璁よ瘉: {user['username']} (role={user['role']})")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """绗笁灞傦細妫€鏌ョ鐞嗗憳鏉冮檺锛堜緷璧?get_current_user锛?""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="闇€瑕佺鐞嗗憳鏉冮檺")
    logger.info(f"[Auth] 绠＄悊鍛樻潈闄愰獙璇侀€氳繃: {user['username']}")
    return user


# 渚濊禆閾? Header -> verify_token -> get_current_user -> require_admin
@app.get("/admin/dashboard", tags=["渚濊禆閾?])
async def admin_dashboard(admin: dict = Depends(require_admin)) -> dict:
    """绠＄悊鍛橀潰鏉?鈥?闇€瑕佷笁绾ц璇?""
    return {"message": f"娆㈣繋, {admin['username']}!", "dashboard_data": {"users": 100}}


@app.get("/profile", tags=["渚濊禆閾?])
async def get_profile(user: dict = Depends(get_current_user)) -> dict:
    """涓汉淇℃伅 鈥?鍙渶瑕佺櫥褰?""
    return {"user": user}


# =============================================
# 3. yield 渚濊禆锛堣祫婧愮鐞嗭級
# =============================================

class FakeDatabaseSession:
    """妯℃嫙鏁版嵁搴撲細璇?""

    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self.is_active = True

    def query(self, table: str) -> list[dict]:
        logger.info(f"[DB] 鏌ヨ {table} (session={self.session_id})")
        return [{"id": 1, "name": "绀轰緥鏁版嵁"}]

    def close(self) -> None:
        self.is_active = False
        logger.info(f"[DB] 鍏抽棴浼氳瘽: {self.session_id}")


_session_counter = 0


async def get_db():
    """
    yield 渚濊禆 鈥?鑷姩绠＄悊鏁版嵁搴撲細璇濈敓鍛藉懆鏈熴€?    yield 涔嬪墠鐨勪唬鐮佸湪璇锋眰澶勭悊鍓嶆墽琛岋紙setup锛夈€?    yield 涔嬪悗鐨勪唬鐮佸湪璇锋眰澶勭悊鍚庢墽琛岋紙teardown锛夈€?    """
    global _session_counter
    _session_counter += 1
    session_id = f"session-{_session_counter}"

    db = FakeDatabaseSession(session_id)
    logger.info(f"[DB] 鍒涘缓浼氳瘽: {session_id}")
    try:
        yield db  # 璇锋眰澶勭悊鏈熼棿浣跨敤杩欎釜浼氳瘽
    finally:
        db.close()  # 璇锋眰缁撴潫鍚庤嚜鍔ㄦ竻鐞嗭紙鏃犺鎴愬姛鎴栧紓甯革級


@app.get("/data", tags=["yield 渚濊禆"])
async def get_data(db: FakeDatabaseSession = Depends(get_db)) -> dict:
    """浣跨敤鏁版嵁搴撲細璇濇煡璇㈡暟鎹?""
    results = db.query("items")
    return {"session": db.session_id, "data": results}


# =============================================
# 4. 绫讳綔涓轰緷璧?# =============================================

class Pagination:
    """
    鍒嗛〉渚濊禆绫?鈥?灏佽鍒嗛〉閫昏緫銆?    FastAPI 浼氳皟鐢?__init__ 骞舵敞鍏ユ煡璇㈠弬鏁般€?    """

    def __init__(
        self,
        page: int = Query(default=1, ge=1, description="椤电爜"),
        page_size: int = Query(default=20, ge=1, le=100, description="姣忛〉鏁伴噺"),
    ) -> None:
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size

    def __repr__(self) -> str:
        return f"Pagination(page={self.page}, size={self.page_size})"


@app.get("/products", tags=["绫讳緷璧?])
async def list_products(pagination: Pagination = Depends()) -> dict:
    """
    鍟嗗搧鍒楄〃 鈥?浣跨敤绫讳綔涓轰緷璧栥€?    Depends() 涓嶄紶鍙傛暟鏃讹紝FastAPI 鑷姩浣跨敤绫荤殑 __init__銆?    """
    logger.info(f"[Products] 鍒嗛〉: {pagination}")
    all_products = [{"id": i, "name": f"鍟嗗搧 {i}"} for i in range(1, 101)]
    paginated = all_products[pagination.offset : pagination.offset + pagination.page_size]
    return {
        "page": pagination.page,
        "page_size": pagination.page_size,
        "total": len(all_products),
        "items": paginated,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)