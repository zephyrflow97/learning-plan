# 绗?3 绔狅細瀹夊叏涓庤璇?鈥?瀹堝崼浣犵殑 API

> *"Security is not a product, but a process."*
> 鈥?Bruce Schneier
>
> 瀹夊叏涓嶆槸鍔熻兘鍒楄〃涓婄殑涓€涓嬀閫夋鈥斺€斿畠鏄疮绌挎暣涓郴缁熺敓鍛藉懆鏈熺殑鎬濈淮鏂瑰紡銆?> 涓€涓病鏈夎璇佺殑 API锛屽氨鍍忎竴鏍嬫病鏈夐棬閿佺殑閾惰銆?
---

## 馃摉 鏈珷鍐呭

- [1. 瀵嗙爜瀹夊叏](#1-瀵嗙爜瀹夊叏)
- [2. JWT 璁よ瘉](#2-jwt-璁よ瘉)
- [3. OAuth2 娴佺▼](#3-oauth2-娴佺▼)
- [4. FastAPI 瀹夊叏渚濊禆](#4-fastapi-瀹夊叏渚濊禆)
- [5. 瀹夊叏闃叉姢](#5-瀹夊叏闃叉姢)
- [6. Rate Limiting](#6-rate-limiting)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [甯歌闄烽槺](#甯歌闄烽槺)
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?

---

## 1. 瀵嗙爜瀹夊叏

> 馃幁 **The Drama: 瀵嗙爜瀛樺偍鐨勮繘鍖栧彶**
>
> - **鐭冲櫒鏃朵唬**锛氭槑鏂囧瓨鍌ㄥ瘑鐮?鈫?鏁版嵁搴撴硠闇?= 鍏ㄩ儴瀵嗙爜娉勯湶
> - **闈掗摐鏃朵唬**锛歁D5/SHA1 鍝堝笇 鈫?褰╄櫣琛ㄦ敾鍑讳竴绉掔牬瑙?> - **鐧介摱鏃朵唬**锛氬姞鐩愬搱甯?鈫?杩樻槸澶揩锛孏PU 鏆村姏鐮磋В
> - **榛勯噾鏃朵唬**锛歜crypt/argon2 鈫?鍒绘剰鎱㈢殑鍝堝笇绠楁硶锛屾瘡娆￠獙璇?~100ms
>
> **鍏抽敭娲炲療**锛氬瘑鐮佸搱甯屽簲璇ユ槸**鏁呮剰鎱㈢殑**銆?> 鍚堟硶鐢ㄦ埛鐧诲綍涓€娆＄瓑 100ms 鏃犳墍璋擄紝浣嗘敾鍑昏€呮瘡绉掑彧鑳藉皾璇?10 娆¤€岄潪 10 浜挎銆?
### bcrypt vs argon2

| 绠楁硶 | 鐗圭偣 | 鎺ㄨ崘鍦烘櫙 |
|------|------|---------|
| **bcrypt** | 缁忓吀銆佸箍娉涙敮鎸併€丆PU 瀵嗛泦 | 澶у鏁伴」鐩?|
| **argon2** | 鏇存柊銆佸唴瀛樺瘑闆嗭紙鎶?GPU锛夈€丱WASP 鎺ㄨ崘 | 鏂伴」鐩閫?|

```python
# 鉁?浣跨敤 passlib 杩涜瀵嗙爜鍝堝笇
from passlib.context import CryptContext

# 閰嶇疆瀵嗙爜鍝堝笇涓婁笅鏂?pwd_context = CryptContext(
    schemes=["bcrypt"],      # 浣跨敤 bcrypt 绠楁硶
    deprecated="auto",       # 鑷姩鍗囩骇鏃у搱甯?)

def hash_password(password: str) -> str:
    """鍝堝笇瀵嗙爜"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """楠岃瘉瀵嗙爜"""
    return pwd_context.verify(plain_password, hashed_password)

# 浣跨敤绀轰緥
hashed = hash_password("MySecretPassword123!")
print(f"鍝堝笇缁撴灉: {hashed}")
# $2b$12$LJ3m4ys3Lk.xTVOqFH9.YeCfB5jBi4dNHNxLmUEm6eE2z5HFy2oO6

assert verify_password("MySecretPassword123!", hashed)  # 鉁?assert not verify_password("WrongPassword", hashed)     # 鉁?```

---

## 2. JWT 璁よ瘉

> 馃 **CS Master's Bridge: Token vs Session 璁よ瘉**
>
> | 鐗规€?| Session锛堟湇鍔＄鐘舵€侊級 | JWT锛堝鎴风鐘舵€侊級 |
> |------|---------------------|-----------------|
> | **鐘舵€佸瓨鍌?* | 鏈嶅姟鍣ㄥ唴瀛?Redis | 瀹㈡埛绔紙Token 鑷寘鍚級 |
> | **鎵╁睍鎬?* | 闇€瑕佸叡浜?session 瀛樺偍 | 澶╃劧鏃犵姸鎬侊紝鏄撴í鍚戞墿灞?|
> | **鎾ら攢** | 鍒犻櫎 session 鍗冲彲 | 闇€瑕侀澶栭粦鍚嶅崟鏈哄埗 |
> | **澶у皬** | Session ID (~32 bytes) | JWT (~500+ bytes) |
> | **閫傜敤** | 浼犵粺 Web 搴旂敤 | API銆佸井鏈嶅姟銆佺些鍔ㄧ |

### JWT 缁撴瀯

```
JWT = Header.Payload.Signature

Header:  {"alg": "HS256", "typ": "JWT"}     鈫?Base64
Payload: {"sub": "user_id", "exp": 123456}  鈫?Base64
Signature: HMAC-SHA256(Header.Payload, SECRET_KEY)
```

### 瀹炵幇

```python
import logging
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# 閰嶇疆
SECRET_KEY = "your-secret-key-change-in-production"  # 鐢熶骇鐜鐢ㄧ幆澧冨彉閲?ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class TokenPayload(BaseModel):
    sub: str          # Subject锛堥€氬父鏄?user_id锛?    exp: datetime     # Expiration
    type: str         # "access" 鎴?"refresh"

def create_access_token(user_id: str, expires_delta: timedelta | None = None) -> str:
    """鍒涘缓璁块棶浠ょ墝"""
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {"sub": user_id, "exp": expire, "type": "access"}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"[JWT] 鍒涘缓 access token: user={user_id}")
    return token

def create_refresh_token(user_id: str) -> str:
    """鍒涘缓鍒锋柊浠ょ墝"""
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str, expected_type: str = "access") -> TokenPayload:
    """楠岃瘉骞惰В鐮佷护鐗孿"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != expected_type:
            raise JWTError(f"鏈熸湜 {expected_type} token")
        return TokenPayload(**payload)
    except JWTError as e:
        logger.warning(f"[JWT] Token 楠岃瘉澶辫触: {e}")
        raise
```

---

## 3. OAuth2 娴佺▼

> 馃寣 **The Big Picture: OAuth2 鐨勫洓绉嶆巿鏉冩ā寮?*
>
> OAuth2 涓嶆槸涓€涓璇佸崗璁€斺€斿畠鏄竴涓?*鎺堟潈妗嗘灦**銆?> 瀹冭В鍐崇殑闂鏄細濡備綍璁╃涓夋柟搴旂敤鍦ㄤ笉鑾峰彇鐢ㄦ埛瀵嗙爜鐨勬儏鍐典笅璁块棶鐢ㄦ埛璧勬簮銆?>
> | 妯″紡 | 閫傜敤鍦烘櫙 | 瀹夊叏绾у埆 |
> |------|---------|---------|
> | **Authorization Code** | Web 搴旂敤锛堟湁鍚庣锛?| 鏈€楂?|
> | **Authorization Code + PKCE** | SPA / 绉诲姩绔?| 楂?|
> | **Client Credentials** | 鏈嶅姟闂撮€氫俊锛圡2M锛?| 楂?|
> | **Password** | 鑷湁瀹㈡埛绔紙涓嶆帹鑽愶級 | 浣?|

```
Authorization Code 娴佺▼锛?鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?   1. 閲嶅畾鍚戝埌鎺堟潈椤?    鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?鈹? 鐢ㄦ埛    鈹?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈫?鈹? 鎺堟潈鏈嶅姟鍣? 鈹?鈹? 娴忚鍣? 鈹?鈫愨攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鈹? (Google)   鈹?鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?   2. 杩斿洖鎺堟潈鐮?code     鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?     鈹?                                     鈹?     鈹?3. code 鍙戠粰浣犵殑鍚庣                   鈹?     鈻?                                     鈹?鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?   4. code + secret 鈫?token    鈹?鈹? 浣犵殑    鈹?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈫掆攤
鈹? 鍚庣    鈹?鈫愨攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?   5. 杩斿洖 access_token
```

---

## 4. FastAPI 瀹夊叏渚濊禆

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()

# 鉁?OAuth2 瀵嗙爜妯″紡 Bearer Token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """浠?Token 鑾峰彇褰撳墠鐢ㄦ埛"""
    try:
        payload = verify_token(token)
        user_id = payload.sub
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="鏃犳晥鐨勮璇佸嚟璇?,
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 浠庢暟鎹簱鏌ヨ鐢ㄦ埛
    user = {"id": user_id, "username": "alice"}  # 瀹為檯浠?DB 鏌ヨ
    return user

@app.post("/auth/login")
async def login(form: OAuth2PasswordRequestForm = Depends()) -> dict:
    """鐧诲綍 鈥?杩斿洖 JWT Token"""
    # 1. 楠岃瘉鐢ㄦ埛鍚嶅拰瀵嗙爜
    # 2. 鐢熸垚 Token
    access_token = create_access_token(user_id=form.username)
    refresh_token = create_refresh_token(user_id=form.username)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)) -> dict:
    """鑾峰彇褰撳墠鐢ㄦ埛淇℃伅 鈥?闇€瑕佽璇乗"""
    return current_user
```

---

## 5. 瀹夊叏闃叉姢

> 馃О **Toolbox: OWASP Top 10 Python 闃叉姢**
>
> | 濞佽儊 | 闃叉姢鎺柦 |
> |------|---------|
> | SQL 娉ㄥ叆 | ORM / 鍙傛暟鍖栨煡璇紙涓嶈鎷兼帴 SQL锛?|
> | XSS | 妯℃澘鑷姩杞箟銆丆SP 澶?|
> | CSRF | SameSite Cookie銆丆SRF Token |
> | 瀵嗙爜娉勯湶 | bcrypt/argon2 鍝堝笇 |
> | 鏆村姏鐮磋В | Rate Limiting |
> | 鏁忔劅鏁版嵁娉勯湶 | HTTPS銆佸搷搴旇繃婊ゆ晱鎰熷瓧娈?|

```python
# 鉁?SQL 娉ㄥ叆闃叉姢 鈥?浣跨敤鍙傛暟鍖栨煡璇?# 鉂?鍗遍櫓
stmt = f"SELECT * FROM users WHERE name = '{user_input}'"  # SQL 娉ㄥ叆锛?
# 鉁?瀹夊叏 鈥?ORM
users = session.exec(select(User).where(User.name == user_input)).all()

# 鉁?瀹夊叏 鈥?鍙傛暟鍖?from sqlalchemy import text
stmt = text("SELECT * FROM users WHERE name = :name")
result = session.execute(stmt, {"name": user_input})
```

---

## 6. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/data")
@limiter.limit("10/minute")  # 姣忓垎閽熸渶澶?10 娆?async def get_data(request: Request) -> dict:
    return {"data": "limited"}

@app.post("/auth/login")
@limiter.limit("5/minute")  # 鐧诲綍鎺ュ彛鏇翠弗鏍?async def login(request: Request) -> dict:
    ...
```

---

## 鏈€浣冲疄璺?
1. **姘歌繙涓嶈鏄庢枃瀛樺偍瀵嗙爜** 鈥?浣跨敤 bcrypt 鎴?argon2
2. **JWT Secret Key 鐢ㄧ幆澧冨彉閲?* 鈥?涓嶈纭紪鐮佸湪浠ｇ爜涓?3. **Access Token 鐭湡鏈夋晥** 鈥?寤鸿 15-30 鍒嗛挓
4. **Refresh Token 瀹夊叏瀛樺偍** 鈥?HttpOnly Cookie
5. **浣跨敤 HTTPS** 鈥?闃叉 Token 琚腑闂翠汉鎴幏
6. **鏈€灏忔潈闄愬師鍒?* 鈥?Token 涓彧鍖呭惈蹇呰淇℃伅
7. **杈撳叆楠岃瘉** 鈥?浣跨敤 Pydantic 楠岃瘉鎵€鏈夎緭鍏?
---

## 甯歌闄烽槺

### 闄烽槺 1锛欽WT 涓瓨鍌ㄦ晱鎰熶俊鎭?
```python
# 鉂?JWT Payload 鏄?Base64 缂栫爜锛屼笉鏄姞瀵嗭紒浠讳綍浜洪兘鑳借В鐮?payload = {"sub": "user_id", "password": "secret123"}  # 瀵嗙爜娉勯湶锛?
# 鉁?鍙瓨鍌ㄩ潪鏁忔劅鐨勬爣璇嗕俊鎭?payload = {"sub": "user_id", "role": "admin", "exp": expire}
```

### 闄烽槺 2锛氫笉楠岃瘉 Token 绫诲瀷

```python
# 鉂?Refresh Token 琚敤浣?Access Token
token = request.headers["Authorization"]
payload = jwt.decode(token, SECRET_KEY)  # 娌℃鏌?type锛?
# 鉁?楠岃瘉 Token 绫诲瀷
payload = verify_token(token, expected_type="access")
```

---

## 缁冧範棰?
<details>
<summary><b>缁冧範 1锛氬疄鐜板畬鏁存敞鍐岀櫥褰曠郴缁?/b></summary>

瀹炵幇鐢ㄦ埛娉ㄥ唽銆佺櫥褰曘€乀oken 鍒锋柊銆佽幏鍙栦釜浜轰俊鎭殑瀹屾暣 API銆?
</details>

<details>
<summary><b>缁冧範 2锛氬疄鐜?RBAC 鏉冮檺绯荤粺</b></summary>

瀹炵幇鍩轰簬瑙掕壊鐨勮闂帶鍒讹紙Role-Based Access Control锛夛細admin銆乪ditor銆乿iewer 涓夌瑙掕壊銆?
</details>

---

## 鍙傝€冭祫婧?
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) 鈥?Web 瀹夊叏鍗佸ぇ濞佽儊
- [JWT.io](https://jwt.io/) 鈥?JWT 璋冭瘯宸ュ叿
- [FastAPI Security 鏂囨。](https://fastapi.tiangolo.com/tutorial/security/) 鈥?瀹樻柟瀹夊叏鏁欑▼
- [passlib 鏂囨。](https://passlib.readthedocs.io/) 鈥?瀵嗙爜鍝堝笇搴?
---

**[馃憠 绗?4 绔狅細鏁版嵁绉戝 鈥?NumPy + Pandas](../04-numpy-pandas/)**

[猬咃笍 杩斿洖 Stage 4 鐩綍](../README.md)
