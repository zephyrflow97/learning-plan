# Alembic 迁移配置示例
# ====================
# 本目录展Alembic 项目结构

# 初始化步
# 1. pip install alembic
# 2. alembic init alembic
# 3. 修改 alembic.ini 中的 sqlalchemy.url
# 4. 修改 alembic/env.py 导入你的模型
# 5. alembic revision --autogenerate -m "init"
# 6. alembic upgrade head

# 目录结构:
# alembic/
#   env.py          - 环境配置
#   script.py.mako  - 迁移脚本模板
#   versions/       - 迁移版本文件
# alembic.ini       - Alembic 配置文件