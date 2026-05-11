# Deployment & Production Examples

本目录包含部署与生产环境的完整配置示例。

## 📁 目录结构

```
examples/
├── github-actions/           CI/CD 配置
│   └── ci.yml               持续集成工作流(Lint, Test, Build)
│
├── sentry/                   错误追踪
│   ├── sentry.client.config.ts  客户端 Sentry 配置
│   └── sentry.server.config.ts  服务端 Sentry 配置
│
├── env/                      环境变量管理
│   ├── env-validation.ts    Zod 类型安全验证
│   └── .env.example         环境变量模板
│
└── docker/                   容器化部署(可选)
    ├── Dockerfile           多阶段构建配置
    └── .dockerignore        排除文件列表
```

## 🚀 使用指南

### 1. GitHub Actions CI/CD

**文件**: `github-actions/ci.yml`

这是一个完整的 CI 工作流,包含:

#### 任务 1: 代码质量检查
```yaml
quality:
  steps:
    - Checkout code
    - Setup Node.js (v20, 缓存 npm)
    - Install dependencies (npm ci)
    - Run ESLint
    - Run TypeScript Check (tsc --noEmit)
```

#### 任务 2: 单元测试
```yaml
test:
  steps:
    - Run tests (npm test)
    - Upload coverage to Codecov
```

#### 任务 3: 构建验证
```yaml
build:
  steps:
    - Create .env file (from GitHub Secrets)
    - Build application (npm run build)
    - Analyze bundle size
```

#### 任务 4: 安全检查
```yaml
security:
  steps:
    - Run npm audit (检查依赖漏洞)
    - Check outdated dependencies
```

**触发条件**:
- ✅ 每次推送到任何分支
- ✅ 每次创建或更新 Pull Request
- ✅ 并发控制:新推送取消旧运行

**设置 GitHub Secrets**:
```
仓库 → Settings → Secrets and variables → Actions → New repository secret

添加:
- DATABASE_URL
- NEXTAUTH_SECRET
- SENTRY_DSN
```

### 2. Sentry 错误追踪

#### 客户端配置

**文件**: `sentry/sentry.client.config.ts`

```typescript
// 初始化 Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% 追踪
  enabled: process.env.NODE_ENV === 'production',
  
  // 过滤敏感信息
  beforeSend(event) {
    delete event.user?.email;
    delete event.request?.headers?.cookie;
    return event;
  },
  
  // 集成
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({ maskAllText: true }),
  ],
});

// 手动使用
import { captureException, addBreadcrumb } from './sentry';

captureException(error, {
  tags: { component: 'LoginForm' },
  extra: { userId: '123' },
});

addBreadcrumb('User clicked submit', 'ui', { buttonId: 'login' });
```

#### 服务端配置

**文件**: `sentry/sentry.server.config.ts`

```typescript
// API Route 中使用
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: '/api/data' },
      extra: { url: request.url },
    });
    
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**关键配置**:
- ✅ 客户端用 `NEXT_PUBLIC_SENTRY_DSN`
- ✅ 服务端用 `SENTRY_DSN`
- ✅ `beforeSend` 过滤敏感信息
- ✅ `ignoreErrors` 忽略噪音错误

### 3. 环境变量管理

#### 类型安全验证

**文件**: `env/env-validation.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // 服务端变量
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // 客户端变量
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
// 如果验证失败,构建会报错

// 使用
import { env } from '@/env';
const dbUrl = env.DATABASE_URL; // 类型安全!
```

**优势**:
- ✅ 编译时捕获缺失的环境变量
- ✅ TypeScript 自动补全
- ✅ 运行时类型验证
- ❌ 防止拼写错误

#### 环境变量模板

**文件**: `env/.env.example`

这是一个完整的环境变量文档,包含:

```bash
# 数据库
DATABASE_URL=postgresql://...

# 认证
NEXTAUTH_SECRET=your-secret-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# 客户端变量
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**使用流程**:
1. 复制 `.env.example` 为 `.env.local`
2. 填入真实值
3. ⚠️ 永远不要提交 `.env.local` 到 Git!

### 4. Docker 容器化(可选)

**文件**: `docker/Dockerfile`

多阶段构建,优化镜像大小:

```dockerfile
# 阶段 1: 安装依赖
FROM node:20-alpine AS deps
COPY package*.json ./
RUN npm ci

# 阶段 2: 构建
FROM node:20-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 阶段 3: 运行
FROM node:20-alpine AS runner
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

**构建与运行**:

```bash
# 构建镜像
docker build -t myapp .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  myapp

# 使用 Docker Compose
docker-compose up
```

**Docker Compose 示例**:

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - db
  
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## 🔧 部署流程

### Vercel 部署(推荐)

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 设置环境变量
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production

# 5. 部署到生产
vercel --prod
```

### 自建服务器部署

```bash
# 1. 构建应用
npm run build

# 2. 上传到服务器
scp -r .next package.json server.js user@yourserver:/var/www/myapp/

# 3. SSH 到服务器
ssh user@yourserver

# 4. 安装依赖
cd /var/www/myapp
npm ci --production

# 5. 启动应用(使用 PM2)
pm2 start server.js --name myapp

# 6. 设置反向代理(Nginx)
# /etc/nginx/sites-available/myapp
server {
  listen 80;
  server_name yourapp.com;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# 7. 启用 HTTPS(Let's Encrypt)
sudo certbot --nginx -d yourapp.com
```

## 📊 监控与观测

### 1. Vercel Analytics

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. 自定义性能追踪

```typescript
import { sendToAnalytics } from '@vercel/speed-insights';

export async function fetchData() {
  const start = performance.now();
  
  const data = await db.query();
  
  const duration = performance.now() - start;
  
  sendToAnalytics({
    name: 'database_query',
    value: duration,
    tags: { query: 'users' },
  });
  
  return data;
}
```

## ⚠️ 常见陷阱

### 1. 忘记设置环境变量

```
症状: 本地运行正常,部署后 500 错误
原因: Vercel 没有设置 DATABASE_URL
解决: vercel env add DATABASE_URL production
```

### 2. 数据库连接池耗尽

```typescript
// ❌ 每次请求创建新 Prisma Client
export async function GET() {
  const prisma = new PrismaClient();
  return Response.json(await prisma.user.findMany());
}

// ✅ 复用 Prisma Client
import { prisma } from '@/lib/prisma';
export async function GET() {
  return Response.json(await prisma.user.findMany());
}
```

### 3. CORS 错误

```typescript
// 解决方案:添加 CORS 头
export async function GET(request: Request) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

## 📖 学习路径

1. **先配置** `env/env-validation.ts` 实现类型安全
2. **再设置** `github-actions/ci.yml` 自动化测试
3. **然后集成** `sentry/*.ts` 错误追踪
4. **最后部署** 到 Vercel 或自建服务器

## 🔗 相关章节

- **主章节**: `../README.md`
- **Authentication**: `../../07-authentication/`(环境变量管理)
- **Forms**: `../../06-forms-validation/`(Server Actions 部署)

---

**最后更新**: 2026-02-08
