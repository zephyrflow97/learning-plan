# Alembic 杩佺些閰嶇疆绀轰緥
# ====================
# 鏈洰褰曞睍绀?Alembic 椤圭洰缁撴瀯

# 鍒濆鍖栨楠?
# 1. pip install alembic
# 2. alembic init alembic
# 3. 淇敼 alembic.ini 涓殑 sqlalchemy.url
# 4. 淇敼 alembic/env.py 瀵煎叆浣犵殑妯″瀷
# 5. alembic revision --autogenerate -m "init"
# 6. alembic upgrade head

# 鐩綍缁撴瀯:
# alembic/
#   env.py          - 鐜閰嶇疆
#   script.py.mako  - 杩佺些鑴氭湰妯℃澘
#   versions/       - 杩佺些鐗堟湰鏂囦欢
# alembic.ini       - Alembic 閰嶇疆鏂囦欢