"""
JWT 璁よ瘉绀轰緥
=============
婕旂ず JWT 鐢熸垚銆侀獙璇併€佸埛鏂?"""

import logging
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# 閰嶇疆
SECRET_KEY = "demo-secret-key-do-not-use-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_token(user_id: str, token_type: str = "access", extra: dict = None) -> str:
    """鍒涘缓 JWT Token"""
    if token_type == "access":
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    payload = {"sub": user_id, "exp": expire, "type": token_type, "iat": datetime.now(timezone.utc)}
    if extra:
        payload.update(extra)

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"[JWT] 鍒涘缓 {token_type} token: user={user_id}")
    return token


def verify_token(token: str, expected_type: str = "access") -> dict:
    """楠岃瘉 JWT Token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != expected_type:
            raise JWTError(f"Token 绫诲瀷涓嶅尮閰? 鏈熸湜 {expected_type}")
        logger.info(f"[JWT] Token 楠岃瘉鎴愬姛: user={payload['sub']}")
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("[JWT] Token 宸茶繃鏈?)
        raise
    except JWTError as e:
        logger.warning(f"[JWT] Token 楠岃瘉澶辫触: {e}")
        raise


def demo():
    print("=== JWT 璁よ瘉婕旂ず ===")

    # 鍒涘缓 Token
    access_token = create_token("user_123", "access", {"role": "admin"})
    refresh_token = create_token("user_123", "refresh")

    print(f"\nAccess Token: {access_token[:50]}...")
    print(f"Refresh Token: {refresh_token[:50]}...")

    # 楠岃瘉 Token
    payload = verify_token(access_token, "access")
    print(f"\n瑙ｇ爜缁撴灉: sub={payload['sub']}, role={payload.get('role')}")

    # 楠岃瘉绫诲瀷涓嶅尮閰?    try:
        verify_token(refresh_token, "access")  # 鐢?refresh token 褰?access token
    except JWTError as e:
        print(f"\n绫诲瀷涓嶅尮閰? {e}")

    # 杩囨湡 Token
    expired = create_token("user_123", "access")
    # 妯℃嫙杩囨湡锛堝疄闄呯敓浜т腑涓嶄細杩欐牱鍋氾級
    expired_payload = {"sub": "user_123", "exp": datetime.now(timezone.utc) - timedelta(hours=1), "type": "access"}
    expired_token = jwt.encode(expired_payload, SECRET_KEY, algorithm=ALGORITHM)
    try:
        verify_token(expired_token)
    except Exception as e:
        print(f"杩囨湡 Token: {type(e).__name__}")


if __name__ == "__main__":
    demo()
