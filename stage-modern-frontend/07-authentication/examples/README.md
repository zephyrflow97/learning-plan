# Authentication Examples

本目录包含认证章节的完整代码示例。

## 📁 目录结构

```
examples/
├── nextauth/              NextAuth.js 完整配置
│   ├── auth.ts           认证核心配置(Providers, Callbacks, Events)
│   └── middleware.ts     路由级别的访问控制中间件
│
├── oauth/                 OAuth 集成示例
│   └── schema.prisma     Prisma 数据库表结构(User, Account, Session)
│
├── credentials/           密码登录示例
│   └── register-action.ts 用户注册 Server Action(密码哈希、验证)
│
└── rbac/                  RBAC 权限系统
    └── roles.ts          角色与权限模型(权限检查、资源所有权)
```

## 🚀 使用指南

### 1. NextAuth 配置

**文件**: `nextauth/auth.ts`

包含完整的 NextAuth v5 配置:
- **Providers**: GitHub OAuth + Credentials(邮箱密码)
- **Callbacks**: JWT/Session 回调,控制 Token 内容
- **Events**: 登录/登出事件钩子
- **Pages**: 自定义认证页面路径

**关键概念**:
- **JWT 策略** vs **Database Session 策略**
- **双因素认证** 的回调实现
- **登录日志** 记录

### 2. Middleware 路由保护

**文件**: `nextauth/middleware.ts`

实现路由级别的访问控制:
- ✅ 定义公开路由(无需登录)
- ✅ 未登录用户自动重定向到登录页
- ✅ 基于角色的路由保护(`/admin` 只允许 ADMIN)
- ✅ `callbackUrl` 参数,登录后跳回原页面

**执行流程**:
```
每个请求 → Middleware
  ↓
1️⃣ 是公开路由? → 是 → 放行
  ↓ 否
2️⃣ 已登录? → 否 → 重定向到 /auth/signin
  ↓ 是
3️⃣ 角色权限够? → 否 → 403
  ↓ 是
4️⃣ 放行
```

### 3. Prisma Schema

**文件**: `oauth/schema.prisma`

NextAuth 所需的数据库表结构:

- **User**: 用户基础信息
  - `passwordHash`: 密码登录用(bcrypt 哈希)
  - `emailVerified`: 邮箱验证时间戳
  - `role`: 用户角色(USER/MODERATOR/ADMIN)

- **Account**: OAuth 账户信息
  - GitHub/Google 登录后的 `access_token`, `refresh_token`

- **Session**: Database Session 策略时使用

- **VerificationToken**: 邮箱验证 Token

- **LoginAttempt**: 登录尝试记录(安全审计、速率限制)

**迁移命令**:
```bash
npx prisma migrate dev --name add_auth_tables
```

### 4. 密码注册

**文件**: `credentials/register-action.ts`

用户注册的 4 个步骤:
1. **验证输入**(Zod Schema: 邮箱格式、密码强度)
2. **检查邮箱唯一性**(防止重复注册)
3. **哈希密码**(bcrypt, saltRounds=12)
4. **创建用户**(Prisma)

**安全措施**:
- ✅ 使用 bcrypt 慢哈希(2^12 = 4096 次迭代)
- ✅ 密码复杂度要求(大小写字母 + 数字)
- ❌ 永远不记录明文密码

### 5. RBAC 权限系统

**文件**: `rbac/roles.ts`

基于角色的访问控制模型:

**权限命名规范**: `resource:action:scope`
- `post:delete:own` — 删除自己的帖子
- `post:delete:any` — 删除任何人的帖子

**角色层级**:
```
GUEST → 只读
  ↓
USER → 创建/编辑/删除自己的内容
  ↓
MODERATOR → + 编辑/删除任何内容 + 封禁用户
  ↓
ADMIN → + 删除用户
```

**使用示例**:
```typescript
import { canPerformAction, Role } from './roles';

// 检查用户是否可以删除帖子
const canDelete = canPerformAction(
  Role.USER,           // 用户角色
  userId,              // 用户 ID
  { authorId: post.authorId }, // 资源所有者
  'post:delete:any'    // 需要的权限
);
```

## 🔗 关联文件

在实际项目中,你还需要:

### 环境变量 (`.env.local`)
```bash
# NextAuth
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# 数据库
DATABASE_URL=postgresql://...
```

### 客户端组件 (未在此目录)
- `app/auth/signin/page.tsx` - 登录页面
- `app/auth/signup/page.tsx` - 注册页面
- `components/AuthButton.tsx` - 登录/登出按钮

### API 路由
```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

## 📚 学习路径

1. **先读** `nextauth/auth.ts` 了解 NextAuth 配置结构
2. **再看** `oauth/schema.prisma` 理解数据库表关系
3. **然后** `credentials/register-action.ts` 学习密码处理
4. **接着** `rbac/roles.ts` 理解权限模型
5. **最后** `nextauth/middleware.ts` 学习路由保护

## ⚠️ 安全注意事项

### 永远不要这样做:
❌ 明文存储密码
❌ 在 JWT 中存储敏感信息(信用卡号、密码)
❌ 忘记在 Server Action 中验证权限
❌ 混淆认证(你是谁)和授权(你能做什么)

### 一定要这样做:
✅ 使用 bcrypt/scrypt/argon2 哈希密码
✅ 实现速率限制(防止暴力破解)
✅ 记录登录尝试(安全审计)
✅ 双重检查:客户端 UI 隐藏 + 服务端权限验证

## 🧪 测试建议

```typescript
// 测试密码哈希
const password = "MySecretPassword123";
const hash = await bcrypt.hash(password, 12);
console.log('哈希:', hash);
// $2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW

// 验证密码
const isValid = await bcrypt.compare(password, hash);
console.log('验证结果:', isValid); // true

// 测试权限检查
const canDelete = hasPermission(Role.USER, 'post:delete:own');
console.log('USER 可以删除自己的帖子:', canDelete); // true

const canDeleteAny = hasPermission(Role.USER, 'post:delete:any');
console.log('USER 可以删除任何帖子:', canDeleteAny); // false
```

## 📖 相关章节

- **主章节**: `../README.md`
- **Forms 章节**: `../../06-forms-validation/`(登录表单验证)
- **Deployment 章节**: `../../08-deployment-production/`(环境变量管理)

---

**最后更新**: 2026-02-08
