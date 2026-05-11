"""
FastAPI OAuth2 Password 娴佺▼绀轰緥
=================================
婕旂ず瀹屾暣鐨勭櫥褰曘€乀oken 鍒锋柊銆佸彈淇濇姢璺敱
杩愯: uvicorn examples.03_oauth2_flow:app --reload
"""

import logging
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="OAuth2 Demo")

# 閰嶇疆
SECRET_KEY = "demo-secret-key"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 妯℃嫙鐢ㄦ埛鏁版嵁搴?USERS_DB = {
    "alice": {
        "username": "alice",
        "hashed_password": pwd_context.hash("alice123"),
        "role": "admin",
    },
    "bob": {
        "username": "bob",
        "hashed_password": pwd_context.hash("bob123"),
        "role": "user",
    },
}


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    username: str
    role: str


def create_token(sub: str, token_type: str, minutes: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    return jwt.encode({"sub": sub, "exp": expire, "type": token_type}, SECRET_KEY, ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="璁よ瘉澶辫触",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username or payload.get("type") != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = USERS_DB.get(username)
    if not user:
        raise credentials_exception
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="闇€瑕佺鐞嗗憳鏉冮檺")
    return user


@app.post("/auth/login", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends()) -> Token:
    user = USERS_DB.get(form.username)
    if not user or not pwd_context.verify(form.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="鐢ㄦ埛鍚嶆垨瀵嗙爜閿欒")

    logger.info(f"[Auth] 鐢ㄦ埛鐧诲綍: {form.username}")
    return Token(
        access_token=create_token(form.username, "access", 30),
        refresh_token=create_token(form.username, "refresh", 60 * 24 * 7),
    )


@app.get("/users/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)) -> UserResponse:
    return UserResponse(username=user["username"], role=user["role"])


@app.get("/admin/users")
async def admin_list_users(admin: dict = Depends(require_admin)) -> list[dict]:
    return [{"username": u["username"], "role": u["role"]} for u in USERS_DB.values()]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
