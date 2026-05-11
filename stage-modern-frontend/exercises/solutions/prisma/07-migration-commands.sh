#!/bin/bash

# 1. 创建迁移
npx prisma migrate dev --name init

# 2. 生成 Prisma Client
npx prisma generate

# 3. (可选) 打开 Prisma Studio 查看数据
npx prisma studio
