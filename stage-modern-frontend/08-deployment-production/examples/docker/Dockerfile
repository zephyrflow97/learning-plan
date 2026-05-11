# Dockerfile - 容器化部署(可选,适用于自建服务器)
# 这是一个多阶段构建,优化镜像大小

# ========== 阶段 1: 依赖安装 ==========
FROM node:20-alpine AS deps

# 安装 libc6-compat 以支持某些 Node 包
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖(使用 ci 而不是 install,确保版本一致)
RUN npm ci

# ========== 阶段 2: 构建 ==========
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 设置环境变量(构建时需要)
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# ========== 阶段 3: 运行 ==========
FROM node:20-alpine AS runner

WORKDIR /app

# 创建非 root 用户(安全性)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置环境变量
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置文件所有者
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动命令
CMD ["node", "server.js"]
