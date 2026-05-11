# Deployment 练习题答案

本目录包含部署和环境配置相关练习题的答案。

## 📋 练习题列表

### 10. Next.js 环境变量
- **文件**:
  - `10-env-local-example.txt` - `.env.local` 示例
  - `10-server-usage.tsx` - 服务端使用示例
  - `10-client-usage.tsx` - 客户端使用示例
- **技术点**: 环境变量、`.env` 文件、NEXT_PUBLIC_ 前缀
- **关键概念**:
  - 服务端可以访问所有环境变量
  - 客户端只能访问 `NEXT_PUBLIC_` 开头的变量
  - 不要把敏感信息暴露到客户端

---

## 🎯 学习要点

### Next.js 环境变量

#### 文件优先级(从高到低)
```
.env.local          # 本地覆盖(所有环境),不应提交到 Git
.env.production     # 生产环境
.env.development    # 开发环境
.env                # 所有环境的默认值
```

#### 基础用法

**.env.local**:
```bash
# 服务端变量(不会发送到客户端)
DATABASE_URL=postgresql://user:password@localhost:5432/db
API_SECRET_KEY=super_secret_key

# 客户端变量(会打包到客户端 JavaScript 中)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_NAME=MyAwesomeSite
```

**服务端使用** (Server Component、API Route、Server Action):
```ts
// 可以访问所有环境变量
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_SECRET_KEY;
const publicUrl = process.env.NEXT_PUBLIC_API_URL;
```

**客户端使用** (Client Component):
```tsx
'use client';

export default function Component() {
  // ✅ 可以访问
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // ❌ undefined(客户端访问不到)
  const dbUrl = process.env.DATABASE_URL;
  
  return <div>{apiUrl}</div>;
}
```

### 安全原则

#### ❌ 危险做法
```bash
# 不要用 NEXT_PUBLIC_ 前缀暴露敏感信息!
NEXT_PUBLIC_DATABASE_URL=postgresql://...  # ❌ 危险!
NEXT_PUBLIC_API_SECRET=secret123           # ❌ 危险!
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...  # ❌ 危险!
```

#### ✅ 正确做法
```bash
# 服务端变量(敏感信息)
DATABASE_URL=postgresql://...              # ✅ 安全
API_SECRET_KEY=secret123                   # ✅ 安全
STRIPE_SECRET_KEY=sk_live_...              # ✅ 安全

# 客户端变量(公开信息)
NEXT_PUBLIC_API_URL=https://api.example.com  # ✅ 安全
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...    # ✅ 安全(公钥)
```

### 类型安全

#### 定义环境变量类型
```ts
// env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      API_SECRET_KEY: string;
      NEXT_PUBLIC_API_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
```

#### 使用 Zod 验证
```ts
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);

// 使用时有类型提示和运行时验证
const dbUrl = env.DATABASE_URL;  // string
```

### 部署平台配置

#### Vercel
1. 在项目设置 → Environment Variables 中添加
2. 区分 Production、Preview、Development 环境
3. 敏感信息使用 Vercel Secret

#### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

# 构建时传入环境变量
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 运行时从环境读取(敏感信息)
# DATABASE_URL 等变量在运行时注入,不写在 Dockerfile 中

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

```bash
# docker-compose.yml
services:
  app:
    build:
      args:
        NEXT_PUBLIC_API_URL: https://api.example.com
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - API_SECRET_KEY=${API_SECRET_KEY}
```

### 开发环境 vs 生产环境

```ts
// 根据环境使用不同的配置
const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://api.example.com'
    : 'http://localhost:3000/api',
    
  enableDebug: process.env.NODE_ENV === 'development',
  
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
};
```

### 常见陷阱

#### 1. 环境变量缓存
```bash
# ❌ 修改 .env 后,Next.js 不会自动重启
# 需要手动重启开发服务器

# 停止服务器
Ctrl + C

# 重新启动
npm run dev
```

#### 2. 构建时嵌入
```bash
# NEXT_PUBLIC_ 变量在构建时被嵌入到 JavaScript 中
# 修改环境变量后需要重新构建

npm run build
```

#### 3. 空字符串 vs undefined
```ts
// .env.local
FEATURE_FLAG=

// 代码中
process.env.FEATURE_FLAG  // "" (空字符串,不是 undefined!)

// 正确的检查方式
const isEnabled = process.env.FEATURE_FLAG === 'true';
```

### 最佳实践

1. **使用 `.env.example`** 作为模板:
```bash
# .env.example (提交到 Git)
DATABASE_URL=postgresql://user:password@localhost:5432/db
API_SECRET_KEY=change_this_in_production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

2. **`.env.local` 添加到 `.gitignore`**:
```gitignore
# .gitignore
.env*.local
```

3. **验证环境变量**:
```ts
// 启动时验证
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
```

4. **使用默认值**:
```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

---

## 🔗 相关资源

- [Next.js 环境变量文档](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel 环境变量](https://vercel.com/docs/projects/environment-variables)
- [Zod 验证库](https://zod.dev/)
- [dotenv](https://www.npmjs.com/package/dotenv) - Node.js 环境变量加载库
