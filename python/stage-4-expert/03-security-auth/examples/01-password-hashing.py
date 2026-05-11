"""
瀵嗙爜鍝堝笇绀轰緥
=============
婕旂ず bcrypt 鍜?argon2 瀵嗙爜鍝堝笇
"""

import logging
from passlib.context import CryptContext

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# 鉁?bcrypt 閰嶇疆
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 鉁?argon2 閰嶇疆
argon2_context = CryptContext(schemes=["argon2"], deprecated="auto")


def demo_bcrypt():
    """bcrypt 鍝堝笇婕旂ず"""
    print("\n=== bcrypt 婕旂ず ===")
    password = "MySecurePassword123!"

    # 鍝堝笇
    hashed = bcrypt_context.hash(password)
    print(f"鍘熷瀵嗙爜: {password}")
    print(f"鍝堝笇缁撴灉: {hashed}")
    print(f"鍝堝笇闀垮害: {len(hashed)}")

    # 楠岃瘉
    assert bcrypt_context.verify(password, hashed)
    assert not bcrypt_context.verify("WrongPassword", hashed)
    print("瀵嗙爜楠岃瘉: 鉁?閫氳繃")

    # 鍚屼竴瀵嗙爜姣忔鍝堝笇缁撴灉涓嶅悓锛堝洜涓洪殢鏈虹洂锛?    hashed2 = bcrypt_context.hash(password)
    print(f"\n涓ゆ鍝堝笇鐩稿悓? {hashed == hashed2}")  # False
    print("浣嗛兘鑳介€氳繃楠岃瘉!")
    assert bcrypt_context.verify(password, hashed2)


def demo_argon2():
    """argon2 鍝堝笇婕旂ず"""
    print("\n=== argon2 婕旂ず ===")
    password = "AnotherSecurePassword!"

    hashed = argon2_context.hash(password)
    print(f"Argon2 鍝堝笇: {hashed[:60]}...")
    assert argon2_context.verify(password, hashed)
    print("瀵嗙爜楠岃瘉: 鉁?閫氳繃")


def demo_timing():
    """鎬ц兘姣旇緝"""
    import time
    print("\n=== 鎬ц兘姣旇緝 ===")
    password = "TestPassword123!"

    # bcrypt
    start = time.perf_counter()
    for _ in range(5):
        bcrypt_context.hash(password)
    bcrypt_time = (time.perf_counter() - start) / 5
    print(f"bcrypt 骞冲潎鑰楁椂: {bcrypt_time*1000:.1f}ms")

    # argon2
    start = time.perf_counter()
    for _ in range(5):
        argon2_context.hash(password)
    argon2_time = (time.perf_counter() - start) / 5
    print(f"argon2 骞冲潎鑰楁椂: {argon2_time*1000:.1f}ms")


if __name__ == "__main__":
    demo_bcrypt()
    demo_argon2()
    demo_timing()
