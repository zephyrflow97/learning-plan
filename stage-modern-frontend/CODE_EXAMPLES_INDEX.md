# Stage: Modern Frontend - 代码示例索引

本文档汇总了现代前端阶段所有章节的代码示例。

## 📁 章节概览

```
stage-modern-frontend/
├── 06-forms-validation/
│   └── examples/          表单与验证代码示例
├── 07-authentication/
│   └── examples/          认证与授权代码示例
└── 08-deployment-production/
    └── examples/          部署与生产代码示例
```

---

## 🔐 Authentication (07-authentication)

### 目录结构

```
07-authentication/examples/
├── nextauth/              NextAuth.js 完整配置
│   ├── auth.ts           认证核心配置
│   └── middleware.ts     路由级别保护
│
├── oauth/                 OAuth 集成
│   └── schema.prisma     数据库表结构
│
├── credentials/           密码登录
│   └── register-action.ts 用户注册
│
├── rbac/                  RBAC 权限系统
│   └── roles.ts          角色与权限模型
│
└── README.md             完整使用指南
```

### 核心文件

| 文件 | 描述 | 关键功能 |
|------|------|---------|
| `nextauth/auth.ts` | NextAuth v5 配置 | Providers, Callbacks, Events, Session 管理 |
| `nextauth/middleware.ts` | 路由保护中间件 | 公开路由、角色检查、重定向逻辑 |
| `oauth/schema.prisma` | Prisma Schema | User, Account, Session, LoginAttempt 表 |
| `credentials/register-action.ts` | 注册 Server Action | Zod 验证、bcrypt 哈希、唯一性检查 |
| `rbac/roles.ts` | RBAC 模型 | 角色层级、权限映射、资源所有权检查 |

### 使用场景

```typescript
// 1. 配置 NextAuth
import { auth, signIn, signOut } from '@/examples/nextauth/auth';

// 2. 保护路由
// 复制 middleware.ts 到项目根目录

// 3. 用户注册
import { registerUser } from '@/examples/credentials/register-action';

// 4. 权限检查
import { hasPermission, canPerformAction } from '@/examples/rbac/roles';
const canDelete = canPerformAction(userRole, userId, resource, 'post:delete:any');
```

---

## 📝 Forms & Validation (06-forms-validation)

### 目录结构

```
06-forms-validation/examples/
├── basic-forms/           基础表单
│   └── LoginForm.tsx     shadcn + RHF + Zod 登录表单
│
├── validation/            Zod 验证
│   └── zod-schema.ts     复杂 Schema 定义
│
├── server-actions/        Server Actions 集成
│   └── register-with-validation.ts 双重验证
│
├── complex-forms/         复杂表单模式
│   └── dynamic-array-fields.tsx 动态字段 + 文件上传
│
└── README.md             完整使用指南
```

### 核心文件

| 文件 | 描述 | 关键功能 |
|------|------|---------|
| `basic-forms/LoginForm.tsx` | 登录表单组件 | shadcn/ui Form, useForm, NextAuth 集成 |
| `validation/zod-schema.ts` | Zod Schema 库 | 嵌套对象、数组、文件、条件验证 |
| `server-actions/register-with-validation.ts` | 双重验证示例 | 客户端 + 服务端 Zod 验证,错误映射 |
| `complex-forms/dynamic-array-fields.tsx` | 高级表单 | useFieldArray, 文件上传, 图片预览 |

### 使用场景

```typescript
// 1. 基础登录表单
import { LoginForm } from '@/examples/basic-forms/LoginForm';
<LoginForm />

// 2. 复杂验证 Schema
import { createUserSchema, avatarUploadSchema } from '@/examples/validation/zod-schema';

// 3. Server Action 双重验证
import { createUser } from '@/examples/server-actions/register-with-validation';

// 4. 动态字段数组
import { DynamicArrayFieldsExample, ImageUploadExample } from '@/examples/complex-forms/dynamic-array-fields';
```

---

## 🚀 Deployment & Production (08-deployment-production)

### 目录结构

```
08-deployment-production/examples/
├── github-actions/        CI/CD 配置
│   └── ci.yml            持续集成工作流
│
├── sentry/                错误追踪
│   ├── sentry.client.config.ts 客户端配置
│   └── sentry.server.config.ts 服务端配置
│
├── env/                   环境变量管理
│   ├── env-validation.ts  Zod 类型安全验证
│   └── .env.example      环境变量模板
│
├── docker/                容器化部署
│   ├── Dockerfile        多阶段构建
│   └── .dockerignore     排除文件列表
│
└── README.md             完整使用指南
```

### 核心文件

| 文件 | 描述 | 关键功能 |
|------|------|---------|
| `github-actions/ci.yml` | CI 工作流 | Lint, Test, Build, Security 检查 |
| `sentry/sentry.client.config.ts` | 客户端 Sentry | 错误捕获, Breadcrumbs, Replay |
| `sentry/sentry.server.config.ts` | 服务端 Sentry | API 错误追踪, Server Actions 集成 |
| `env/env-validation.ts` | 环境变量验证 | Zod Schema 验证,类型安全,辅助函数 |
| `env/.env.example` | 环境变量模板 | 所有常用环境变量的文档化示例 |
| `docker/Dockerfile` | Docker 配置 | 多阶段构建,优化镜像大小 |

### 使用场景

```typescript
// 1. 环境变量类型安全
import { env, isProduction, getAppUrl } from '@/examples/env/env-validation';
const dbUrl = env.DATABASE_URL; // 类型安全!

// 2. Sentry 错误追踪
import { captureException, addBreadcrumb } from '@/examples/sentry/sentry.client.config';
captureException(error, { tags: { component: 'LoginForm' } });

// 3. CI/CD
// 复制 ci.yml 到 .github/workflows/

// 4. Docker 部署
// docker build -f examples/docker/Dockerfile -t myapp .
```

---

## 🎯 快速开始指南

### 1. 设置认证系统

```bash
# 1. 复制配置文件
cp learning-plan/stage-modern-frontend/07-authentication/examples/nextauth/auth.ts lib/auth.ts
cp learning-plan/stage-modern-frontend/07-authentication/examples/nextauth/middleware.ts middleware.ts

# 2. 复制 Prisma Schema
cp learning-plan/stage-modern-frontend/07-authentication/examples/oauth/schema.prisma prisma/schema.prisma

# 3. 安装依赖
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs

# 4. 生成 Secret
npx auth secret

# 5. 迁移数据库
npx prisma migrate dev --name add_auth

# 6. 创建登录页面(参考 examples/basic-forms/LoginForm.tsx)
```

### 2. 设置表单验证

```bash
# 1. 安装依赖
npm install react-hook-form @hookform/resolvers zod
npx shadcn@latest add form

# 2. 复制 Schema 库
cp learning-plan/stage-modern-frontend/06-forms-validation/examples/validation/zod-schema.ts lib/schemas/user.ts

# 3. 使用表单组件
# 参考 examples/basic-forms/LoginForm.tsx
# 参考 examples/complex-forms/dynamic-array-fields.tsx
```

### 3. 设置部署环境

```bash
# 1. 环境变量验证
cp learning-plan/stage-modern-frontend/08-deployment-production/examples/env/env-validation.ts src/env.ts
cp learning-plan/stage-modern-frontend/08-deployment-production/examples/env/.env.example .env.example

# 2. CI/CD
mkdir -p .github/workflows
cp learning-plan/stage-modern-frontend/08-deployment-production/examples/github-actions/ci.yml .github/workflows/

# 3. Sentry
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
# 参考 examples/sentry/*.ts 进行自定义配置

# 4. 部署到 Vercel
vercel
```

---

## 🔗 交叉引用

### 认证 → 表单
- 登录表单使用 `LoginForm.tsx`
- 注册表单使用 Zod 验证
- Server Action 双重验证

### 表单 → 认证
- 表单提交调用 `signIn()`
- 注册后调用 `registerUser()`

### 认证 → 部署
- 环境变量管理(`NEXTAUTH_SECRET`, `GITHUB_ID`)
- Sentry 追踪登录失败

### 部署 → 认证
- CI/CD 测试登录流程
- 环境隔离(开发/生产数据库)

---

## 📖 学习建议

### 初学者路径

1. **先学表单** (`06-forms-validation`)
   - 从 `basic-forms/LoginForm.tsx` 开始
   - 理解 React Hook Form 基础
   - 掌握 Zod 验证

2. **再学认证** (`07-authentication`)
   - 配置 NextAuth (`nextauth/auth.ts`)
   - 实现登录表单(结合前面学的表单知识)
   - 添加路由保护(`middleware.ts`)

3. **最后部署** (`08-deployment-production`)
   - 设置环境变量验证
   - 配置 CI/CD
   - 部署到 Vercel

### 进阶路径

1. **RBAC 权限系统** (`07-authentication/rbac/`)
2. **动态表单** (`06-forms-validation/complex-forms/`)
3. **错误追踪与监控** (`08-deployment-production/sentry/`)
4. **Docker 容器化** (`08-deployment-production/docker/`)

---

## ⚠️ 重要提醒

### 安全
- ❌ 永远不要提交 `.env` 文件到 Git
- ✅ 使用 `.env.example` 作为模板
- ✅ Vercel 中设置生产环境变量

### 性能
- ✅ 使用非受控组件(React Hook Form)
- ✅ 服务端验证是必需的
- ✅ Edge Functions 适合轻量级操作

### 最佳实践
- ✅ Schema 复用(客户端和服务端)
- ✅ 双重验证(客户端 + 服务端)
- ✅ 类型安全(TypeScript + Zod)

---

**最后更新**: 2026-02-08
**作者**: Modern Frontend Learning Path
**状态**: ✅ 已完成
