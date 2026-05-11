# Authentication — 你是谁?你能做什么?

> *"Security is always excessive until it's not enough."* — Robbie Sinclair
>
> 在一个没有门锁的世界里,你不需要钥匙。但 Web 不是这样的世界。每一个 HTTP 请求都来自一个你无法确认身份的陌生人。认证 (Authentication) 回答"你是谁?",授权 (Authorization) 回答"你能做什么?"。混淆这两个问题,是安全事故的第一大原因。2019 年,Capital One 的数据泄露事故(1 亿用户信息被盗)的根本原因就是:系统认证了请求,但没有正确授权。黑客拿着一张"普通客人"的门卡,走进了"金库"。

---

## 📖 本章内容

1. **认证 vs 授权** — 两个容易混淆的概念
2. **NextAuth/Auth.js 架构** — 现代认证的标准解决方案
3. **OAuth 实战** — GitHub/Google 登录的完整流程
4. **Credentials Provider** — 邮箱密码登录的正确姿势
5. **Session 管理** — JWT vs Database Sessions 的深度对比
6. **中间件保护** — 路由级别的访问控制
7. **RBAC 基础** — 角色与权限模型
8. **🧘 Zen of Code** — 信任边界与最小权限原则
9. **最佳实践与常见陷阱**
10. **章节练习**

**前置知识**: Stage 2 React Basics, Next.js App Router, Stage 4 Security Basics, Prisma
**学习时间**: 3-4 天
**关键术语**: Authentication, Authorization, OAuth, JWT, Session, RBAC, Middleware

---

## 1. 认证 vs 授权 — 两个概念,一个世界

### 🎭 The Drama: 酒店的门卡系统

> **场景 1: 认证 (Authentication) — 你是谁?**
>
> 你走进一家五星级酒店,前台问:"先生,您有预订吗?" 你出示身份证和预订确认邮件。前台核实后,给你一张门卡。这个过程就是**认证**——证明"我就是我"。
>
> 在 Web 世界里:
> - 身份证/邮件 = 用户名密码、OAuth Token、生物识别
> - 前台核实 = 服务器验证 credentials
> - 门卡 = Session Token / JWT
>
> **场景 2: 授权 (Authorization) — 你能做什么?**
>
> 你拿着门卡去开房门——成功。你去开隔壁的总统套房——失败,卡片权限不够。你去员工休息室——失败,只有员工卡能开。这就是**授权**——即使我知道你是谁,也不代表你能为所欲为。
>
> 在 Web 世界里:
> - 房门 = 受保护的资源 (API endpoint, 页面路由)
> - 门卡权限 = 用户角色 (admin, user, guest)
> - 门禁系统 = 中间件 (Middleware) + 权限检查

```typescript
// ❌ 常见的混淆
async function deleteUser(userId: string) {
  // 只检查了认证(是否登录),没检查授权(是否有权限删除)
  const session = await auth();
  if (!session) throw new Error('请先登录'); // 认证检查
  
  // ⚠️ 任何登录用户都能删除任何用户!
  await db.user.delete({ where: { id: userId } });
}

// ✅ 正确的做法
async function deleteUser(userId: string) {
  const session = await auth();
  
  // 1️⃣ 认证检查: 你是谁?
  if (!session) throw new Error('请先登录');
  console.log('认证通过, 用户:', session.user.email);
  
  // 2️⃣ 授权检查: 你能做什么?
  const isAdmin = session.user.role === 'ADMIN';
  const isOwner = session.user.id === userId;
  
  if (!isAdmin && !isOwner) {
    console.error('授权失败: 用户', session.user.id, '尝试删除用户', userId);
    throw new Error('权限不足: 只能删除自己的账户');
  }
  
  console.log('授权通过, 执行删除操作');
  await db.user.delete({ where: { id: userId } });
}
```

### 🌌 The Big Picture: 认证的三个维度

| 维度 | 问题 | 技术实现 | 对应隐喻 |
|------|------|----------|----------|
| **Authentication** | 你是谁? | 登录、Token 验证 | 酒店前台验证身份证 |
| **Authorization** | 你能做什么? | 权限检查、RBAC | 门卡能开哪些门 |
| **Audit** | 你做了什么? | 日志记录、审计追踪 | 酒店监控录像 |

> ⚛️ **The Physics: 信息论中的身份证明**
>
> 认证本质上是一个**信息不对称**问题。客户端和服务端在网络两端,如何在不信任对方的前提下建立信任?
>
> - **对称密钥方案** (密码): 双方共享一个秘密(密码哈希存在数据库)。客户端证明"我知道密码",服务端验证"这个密码匹配"。
> - **非对称密钥方案** (JWT 签名): 服务端用私钥签名 Token,客户端用公钥验证。服务端证明"这个 Token 是我发的",客户端无法伪造。
> - **第三方信任方案** (OAuth): 你不信任网站,但你信任 Google/GitHub。网站通过"Google 说这个人是谁"来间接验证你。
>
> 这三种方案对应密码学的三大基石:哈希函数、公钥加密、数字签名。

---

## 2. NextAuth/Auth.js 架构 — 现代认证的瑞士军刀

### 2.1 为什么需要 NextAuth?

**认证看起来简单,实则是一个深坑:**

```typescript
// ❌ 你以为的登录实现
async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (user && user.password === password) { // 🚨 明文密码!
    return { success: true, userId: user.id };
  }
  return { success: false };
}

// ⚠️ 这个"简单"的实现有哪些问题?
// 1. 明文存储密码 → 数据库泄露 = 全部密码泄露
// 2. 没有防暴力破解 → 黑客可以每秒尝试 1000 次
// 3. 没有 Session 管理 → 用户每次请求都要重新登录?
// 4. 没有 CSRF 保护 → 跨站请求伪造攻击
// 5. 没有 OAuth 支持 → 无法集成 GitHub/Google 登录
// 6. 没有邮箱验证 → 任何人可以用别人的邮箱注册
// 7. 没有密码重置 → 用户忘记密码就废了
// 8. 没有多因素认证 → 密码泄露 = 账户失守
```

**NextAuth (现在叫 Auth.js v5) 帮你处理这一切:**

```bash
npm install next-auth@beta
```

### 2.2 核心架构

```
┌─────────────────────────────────────────────────────────┐
│                    Your Next.js App                      │
├─────────────────────────────────────────────────────────┤
│  Pages/Components                                        │
│    ↓ call                                                │
│  auth() / useSession()                                   │
│    ↓ read                                                │
│  Session (JWT or Database)                               │
│    ↑ written by                                          │
│  NextAuth.js Core                                        │
│    ↑ uses                                                │
│  Providers (OAuth, Credentials, Email...)                │
│    ↑ validate with                                       │
│  Database (Prisma, SQL...) or External APIs              │
└─────────────────────────────────────────────────────────┘
```

### 2.3 基础配置 — 从零开始

#### Step 1: 安装依赖

```bash
npm install next-auth@beta @auth/prisma-adapter
```

#### Step 2: 生成 Secret Key

```bash
npx auth secret
# 这会生成一个 AUTH_SECRET,添加到 .env
```

#### Step 3: 创建 `auth.ts`

**完整配置**: [examples/nextauth/auth.ts](./examples/nextauth/auth.ts)

**配置结构解析**:

```typescript
NextAuth({
  adapter: PrismaAdapter(db),      // 1️⃣ 数据库适配器
  session: { strategy: "jwt" },    // 2️⃣ Session 策略
  providers: [                     // 3️⃣ 认证提供商
    GitHub({ ... }),
    Credentials({ ... })
  ],
  callbacks: {                     // 4️⃣ 自定义回调
    jwt({ token, user }) { ... },
    session({ session, token }) { ... }
  },
  pages: { ... },                  // 5️⃣ 自定义页面
  events: { ... }                  // 6️⃣ 事件钩子
})
```

关键要点:
- **Callbacks**: 控制 JWT/Session 中存储的信息
- **Providers**: 可以同时配置多个认证方式(OAuth + Credentials)
- **Events**: 记录登录/登出日志,发送通知

> 💡 **查看完整代码**: 包含详细注释和日志的完整配置请查看 [examples/nextauth/auth.ts](./examples/nextauth/auth.ts)

#### Step 4: API Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

#### Step 5: Prisma Schema (数据库表结构)

**完整 Schema**: [examples/oauth/schema.prisma](./examples/oauth/schema.prisma)

**表结构说明**:
- `User`: 用户基础信息 + `passwordHash` + `role`
- `Account`: OAuth 账户信息(GitHub/Google 登录后的 Token)
- `Session`: Database Session 策略时使用
- `VerificationToken`: 邮箱验证 Token
- `LoginAttempt`: 登录尝试记录(用于速率限制和安全审计)

关键字段:
- `passwordHash`: 密码登录用(bcrypt 哈希)
- `emailVerified`: 邮箱验证时间戳
- `role`: 用户角色(USER/ADMIN/MODERATOR)

> 💡 **查看完整 Schema**: 包含所有表定义和关系的完整 Prisma Schema 请查看 [examples/oauth/schema.prisma](./examples/oauth/schema.prisma)

```bash
npx prisma migrate dev --name add_auth_tables
```

### 🧠 CS Master's Bridge: NextAuth 的架构设计

> **Provider Pattern (策略模式)**:
>
> NextAuth 的 Providers 是策略模式的经典应用。每个 Provider (GitHub, Google, Credentials) 实现相同的接口,但认证逻辑不同:
>
> ```typescript
> interface AuthProvider {
>   id: string;
>   name: string;
>   type: "oauth" | "credentials" | "email";
>   authorize: (credentials) => Promise<User | null>;
> }
> ```
>
> 这让你可以在运行时动态选择认证方式,而核心逻辑无需改变。这是"开放封闭原则"的实践——对扩展开放(新增 Provider),对修改封闭(核心代码不变)。

---

## 3. OAuth 实战 — 把钥匙交给第三方

### 🎭 The Drama: OAuth 的信任委托

> **没有 OAuth 的世界**:
>
> 用户:"我想在你的网站上展示我的 GitHub 仓库。"
> 网站:"好的,请把你的 GitHub 用户名和密码给我。"
> 用户:"???"
>
> 这显然很荒谬——你不会把家门钥匙给快递员,只是为了让他把包裹放在客厅。
>
> **有 OAuth 的世界**:
>
> 用户:"我想在你的网站上展示我的 GitHub 仓库。"
> 网站:"好的,我把你重定向到 GitHub,你在那里授权。"
> (用户去 GitHub,点击"允许某网站读取我的公开仓库")
> GitHub:"这是一个临时通行证(Access Token),它只能读公开仓库,1 小时后过期。"
> 网站:"收到,我用这个通行证访问你的仓库。"
>
> **核心思想**: 用户永远不需要把密码交给第三方网站。网站拿到的只是一个"有限权限的临时通行证"。

### 3.1 OAuth 2.0 授权流程 (Authorization Code Flow)

```
┌──────────┐                                         ┌──────────┐
│          │                                         │          │
│  用户     │                                         │  你的    │
│ (浏览器) │                                         │  网站    │
│          │                                         │          │
└─────┬────┘                                         └─────┬────┘
      │                                                    │
      │ 1. 点击 "GitHub 登录"                               │
      ├──────────────────────────────────────────────────►│
      │                                                    │
      │ 2. 重定向到 GitHub                                 │
      │◄───────────────────────────────────────────────────┤
      │    https://github.com/login/oauth/authorize?       │
      │    client_id=YOUR_CLIENT_ID&                       │
      │    redirect_uri=YOUR_CALLBACK_URL&                 │
      │    scope=read:user                                 │
      │                                                    │
┌─────▼────┐                                               │
│          │                                               │
│  GitHub  │                                               │
│          │                                               │
└─────┬────┘                                               │
      │ 3. 用户登录 GitHub 并授权                           │
      │                                                    │
      │ 4. 重定向回你的网站,带着 code                       │
      ├──────────────────────────────────────────────────►│
      │    https://yoursite.com/api/auth/callback/github? │
      │    code=AUTHORIZATION_CODE                         │
      │                                                    │
      │                                                    │ 5. 用 code 换 token
      │                                                    ├─────────►┐
      │                                                    │          │ GitHub API
      │                                                    │◄─────────┤
      │                                                    │ { access_token, ... }
      │                                                    │
      │ 6. 设置 Session Cookie                             │
      │◄───────────────────────────────────────────────────┤
      │                                                    │
      │ 7. 重定向到首页                                     │
      │◄───────────────────────────────────────────────────┤
      │                                                    │
```

### 3.2 配置 GitHub OAuth

#### Step 1: 在 GitHub 创建 OAuth App

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写:
   - Application name: `My App`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. 获得 `Client ID` 和 `Client Secret`

#### Step 2: 配置环境变量

```bash
# .env.local
GITHUB_ID=your_client_id_here
GITHUB_SECRET=your_client_secret_here
AUTH_SECRET=your_generated_secret_here
```

#### Step 3: 使用 GitHub 登录

```typescript
// app/auth/signin/page.tsx
import { signIn } from "@/lib/auth"

export default function SignInPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <form action={async () => {
        "use server"
        await signIn("github", { redirectTo: "/dashboard" })
      }}>
        <button type="submit">Sign in with GitHub</button>
      </form>
    </div>
  )
}
```

关键要点:
- 使用 **Server Actions** 调用 `signIn()`
- `redirectTo` 参数指定登录后跳转页面
- 支持多个 OAuth Provider 并存

### 3.3 获取用户信息

**受保护页面的两种实现**:

```typescript
// 方式 1: 服务端组件(推荐)
import { auth } from "@/lib/auth"
export default async function Page() {
  const session = await auth();
  if (!session) redirect('/auth/signin');
  // ...
}

// 方式 2: 客户端组件
'use client';
import { useSession } from "next-auth/react"
export default function Page() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) redirect('/auth/signin');
  // ...
}
```

### ⚛️ OAuth 的安全机制: State & PKCE

> **问题 1: CSRF 攻击**
>
> 攻击者可以伪造一个 OAuth 回调请求,让你的账户绑定到攻击者的 GitHub 账户。
>
> **解决方案: State 参数**
>
> ```typescript
> // NextAuth 自动处理,你不需要手写
> const state = generateRandomString(); // 随机字符串
> storeInSession(state); // 存在 session 中
>
> // 重定向到 GitHub 时带上 state
> const authUrl = `https://github.com/login/oauth/authorize?
>   client_id=${CLIENT_ID}&
>   redirect_uri=${CALLBACK_URL}&
>   state=${state}`;
>
> // GitHub 回调时会原样返回 state
> // 验证 state 是否匹配
> if (callbackState !== storedState) {
>   throw new Error('CSRF attack detected');
> }
> ```
>
> **问题 2: 授权码拦截 (移动应用/SPA)**
>
> 在移动应用或 SPA 中,回调 URL 可能被恶意 App 拦截,从而窃取 `code`。
>
> **解决方案: PKCE (Proof Key for Code Exchange)**
>
> ```typescript
> // 1️⃣ 客户端生成随机字符串 (Code Verifier)
> const codeVerifier = generateRandomString(128);
>
> // 2️⃣ 计算哈希 (Code Challenge)
> const codeChallenge = base64url(sha256(codeVerifier));
>
> // 3️⃣ 授权请求带上 code_challenge
> const authUrl = `https://github.com/login/oauth/authorize?
>   client_id=${CLIENT_ID}&
>   code_challenge=${codeChallenge}&
>   code_challenge_method=S256`;
>
> // 4️⃣ 换 token 时提交原始的 code_verifier
> const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
>   method: 'POST',
>   body: JSON.stringify({
>     code: authCode,
>     code_verifier: codeVerifier, // 攻击者拿到 code 也没用,因为没有 verifier
>   }),
> });
> ```
>
> **为什么有效?** 攻击者即使拦截了 `code` 和 `code_challenge`,但 `code_challenge` 是哈希值,无法反推出 `code_verifier`。没有正确的 `verifier`,就换不到 `access_token`。

---

## 4. Credentials Provider — 密码登录的正确姿势

### 🎭 The Drama: 密码存储的血泪史

> **2012 年 6 月 6 日,LinkedIn 数据泄露**:
>
> 650 万个 SHA-1 哈希密码被黑客窃取。因为 LinkedIn 没有使用"盐"(Salt),相同的密码有相同的哈希值。黑客用彩虹表(预先计算的常见密码哈希)在几小时内破解了 90% 的密码。
>
> **2013 年 10 月,Adobe 数据泄露**:
>
> 1.5 亿个密码被盗。Adobe 使用了加密(3DES ECB 模式),但犯了一个致命错误:相同的密码用了相同的密钥加密,导致密文也相同。黑客不需要破解加密,只需要找到常见密码的密文模式,就能反推出明文。
>
> **2019 年,Facebook 被曝光**:
>
> 在内部日志中以明文存储了数亿个用户密码,长达 7 年。虽然没有外泄,但任何有权限访问日志的员工都能看到。
>
> **这些事故教会我们的教训**:
> 1. ❌ **永远不要明文存储密码**
> 2. ❌ **永远不要用简单哈希(MD5, SHA1)存储密码**
> 3. ❌ **永远不要用加密(Encryption)存储密码** — 加密是可逆的,有密钥就能解密
> 4. ✅ **必须用带盐的慢哈希算法** — bcrypt, scrypt, argon2

### 4.1 密码哈希的正确姿势: bcrypt

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

#### 注册用户 (Server Action)

**完整代码**: [examples/credentials/register-action.ts](./examples/credentials/register-action.ts)

**注册流程的 4 个步骤**:

1. **验证输入** (Zod Schema)
2. **检查邮箱唯一性** (防止重复注册)
3. **哈希密码** (bcrypt, saltRounds=12)
4. **创建用户** (Prisma)

关键安全措施:
- ✅ 使用 `bcrypt` 而不是简单哈希(MD5/SHA1)
- ✅ `saltRounds=12` 平衡安全性和性能
- ❌ **永远不要记录明文密码**

#### 登录验证 (在 NextAuth Credentials Provider 中)

```typescript
// lib/auth.ts (Credentials Provider 部分)
Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    console.log('🔍 查找用户:', credentials.email);
    
    // 1️⃣ 查找用户
    const user = await db.user.findUnique({
      where: { email: credentials.email as string },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        image: true,
      },
    });
    
    if (!user || !user.passwordHash) {
      console.error('❌ 用户不存在或未设置密码');
      // ⚠️ 不要告诉用户"邮箱不存在"还是"密码错误" → 防止用户枚举攻击
      return null;
    }
    
    // 2️⃣ 验证密码
    console.log('🔐 验证密码...');
    const startTime = performance.now();
    const isValid = await bcrypt.compare(
      credentials.password as string,
      user.passwordHash
    );
    const duration = performance.now() - startTime;
    console.log(`密码验证耗时: ${duration.toFixed(2)}ms`);
    
    if (!isValid) {
      console.error('❌ 密码错误');
      // ⚠️ 可以在这里记录失败尝试,实现速率限制
      await logFailedLoginAttempt(user.id);
      return null;
    }
    
    console.log('✅ 登录成功:', user.email);
    
    // 3️⃣ 返回用户对象
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    };
  },
}),
```

### 🧠 CS Master's Bridge: bcrypt 的工作原理

> **为什么 bcrypt 比 MD5 安全 1000 倍?**
>
> ```typescript
> // ❌ MD5 (快速哈希,危险!)
> const hash = md5(password); // 耗时: ~0.001ms
> // 黑客可以每秒计算 1,000,000,000 次 MD5
> // GPU 破解速度: 100 亿次/秒
>
> // ✅ bcrypt (慢速哈希,安全!)
> const hash = await bcrypt.hash(password, 12); // 耗时: ~300ms
> // 黑客每秒只能计算 3 次 bcrypt
> // 破解 8 位随机密码需要: 62^8 / 3 = 7000 年
> ```
>
> **bcrypt 的三个关键特性**:
>
> 1. **自适应成本 (Adaptive Cost)**:
>    - `saltRounds = 12` 意味着 2^12 = 4096 次迭代
>    - 计算机越来越快? 调高 saltRounds 即可
>    - 典型值: 10 (快,适合高频登录), 12 (平衡), 14 (慢,高安全性)
>
> 2. **内置随机盐 (Built-in Salt)**:
>    - 每次调用 `bcrypt.hash()` 都会生成新的随机盐
>    - 相同的密码会产生不同的哈希值
>    - 盐值存储在哈希结果中: `$2a$12$[22字符的盐][31字符的哈希]`
>
> 3. **抗并行破解 (GPU-Resistant)**:
>    - bcrypt 的内存访问模式对 GPU 不友好
>    - GPU 破解 bcrypt 的速度只比 CPU 快 10 倍,不是 1000 倍
>
> **示例输出**:
> ```
> 密码: "MySecretPassword123"
>
> bcrypt 哈希:
> $2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
> │ │  │  │                                         │
> │ │  │  └─ 盐 (22 字符)                           └─ 哈希 (31 字符)
> │ │  └─ Cost Factor (12 = 2^12 次迭代)
> │ └─ bcrypt 变体 (2a = 标准版本)
> └─ 标识符
>
> 同样的密码,再次哈希:
> $2a$12$3.kXGqV5PJqZLNEu5sDnJ.lKNlQMPNFQfP3XLfKvRqQqPzY5gFJfO
>                  ^^^^^^^^^^^^^^^^^^^^^ 不同的盐!
> ```

### 4.2 防御措施: 速率限制

```typescript
// lib/rate-limit.ts
import { db } from "./db"

const MAX_ATTEMPTS = 5; // 最多 5 次失败
const LOCKOUT_DURATION = 15 * 60 * 1000; // 锁定 15 分钟

export async function checkRateLimit(email: string): Promise<boolean> {
  const recentAttempts = await db.loginAttempt.count({
    where: {
      email,
      createdAt: {
        gte: new Date(Date.now() - LOCKOUT_DURATION),
      },
      success: false,
    },
  });
  
  if (recentAttempts >= MAX_ATTEMPTS) {
    console.warn(`🚨 账户被锁定: ${email} (${recentAttempts} 次失败尝试)`);
    return false; // 锁定
  }
  
  return true; // 允许尝试
}

export async function logLoginAttempt(email: string, success: boolean) {
  await db.loginAttempt.create({
    data: {
      email,
      success,
      ipAddress: getClientIP(), // 获取客户端 IP
      userAgent: getUserAgent(), // 获取浏览器信息
    },
  });
  
  console.log(`📊 登录记录: ${email} - ${success ? '成功' : '失败'}`);
}
```

---

## 5. Session 管理 — JWT vs Database Sessions

### 🌌 The Big Picture: 两种 Session 策略的深度对比

| 维度 | JWT (无状态) | Database Session (有状态) |
|------|-------------|--------------------------|
| **存储位置** | 客户端 Cookie (加密) | 服务端数据库 |
| **验证方式** | 签名验证 (无需查库) | 每次请求查库 |
| **性能** | 快 (无数据库查询) | 慢 (每次查库) |
| **可扩展性** | 极佳 (无状态,水平扩展) | 需要共享 Session 存储 (Redis) |
| **注销能力** | 差 (只能等 Token 过期) | 优秀 (直接删除 Session) |
| **实时吊销** | 需要黑名单 (引入状态) | 原生支持 |
| **Session 更新** | 需要刷新 Token | 直接更新数据库 |
| **安全性** | Token 泄露风险 (XSS) | 只有 Session ID 泄露 |
| **存储大小** | 受 Cookie 限制 (4KB) | 无限制 |

### 5.1 JWT 策略 (默认推荐)

```typescript
// lib/auth.ts
export const { handlers, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  
  callbacks: {
    async jwt({ token, user, trigger }) {
      // JWT Payload 示例:
      // {
      //   "id": "user_123",
      //   "email": "user@example.com",
      //   "role": "ADMIN",
      //   "iat": 1704067200,  // Issued At
      //   "exp": 1706745600,  // Expiration
      //   "jti": "unique_id"  // JWT ID
      // }
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      return token;
    },
  },
})
```

**JWT 的内部结构**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTIzIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE3MDY3NDU2MDB9.4f3g5h6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4
│                                       │                                                                                                                    │
└─ Header (算法和类型)                   └─ Payload (用户数据)                                                                                                 └─ Signature (签名)
```

解码 JWT (任何人都能看到 Payload!):

```typescript
// ⚠️ JWT 不是加密,只是签名!
const parts = jwt.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
// {
//   "id": "user_123",
//   "email": "user@example.com",
//   "role": "ADMIN",
//   "iat": 1704067200,
//   "exp": 1706745600
// }

// ❌ 永远不要在 JWT 里放敏感信息!
// - 密码
// - 信用卡号
// - 社会安全号
// - 私钥
```

### 5.2 Database Session 策略

```typescript
// lib/auth.ts
export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60, // 每 24 小时更新一次 Session
  },
})
```

**数据库查询流程**:

```typescript
// 每次请求都会:
async function getSession(sessionToken: string) {
  console.log('🔍 查找 Session:', sessionToken);
  
  const session = await db.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          image: true,
        },
      },
    },
  });
  
  if (!session) {
    console.error('❌ Session 不存在');
    return null;
  }
  
  if (session.expires < new Date()) {
    console.error('❌ Session 已过期');
    await db.session.delete({ where: { sessionToken } });
    return null;
  }
  
  console.log('✅ Session 有效:', session.user.email);
  return session;
}
```

### 5.3 实现 JWT 黑名单 (解决 JWT 无法注销的问题)

```typescript
// lib/token-blacklist.ts
import { db } from "./db"

export async function blacklistToken(jti: string, expiresAt: Date) {
  console.log('🚫 将 Token 加入黑名单:', jti);
  
  await db.tokenBlacklist.create({
    data: {
      jti,
      expiresAt,
    },
  });
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const entry = await db.tokenBlacklist.findUnique({
    where: { jti },
  });
  
  if (entry) {
    console.log('❌ Token 已被吊销:', jti);
    return true;
  }
  
  return false;
}

// 定期清理过期的黑名单记录
export async function cleanupExpiredTokens() {
  const deleted = await db.tokenBlacklist.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  
  console.log(`🧹 清理了 ${deleted.count} 条过期黑名单记录`);
}
```

```prisma
// prisma/schema.prisma
model TokenBlacklist {
  id        String   @id @default(cuid())
  jti       String   @unique // JWT ID
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([expiresAt])
}
```

### 🧘 Zen of Code: 无状态的代价

> "无状态"听起来像是完美的架构——水平扩展、无需共享存储、性能优越。但在真实世界,**完全的无状态是一个谎言**。
>
> 当你用 JWT 时,你把状态从服务端转移到了客户端。但状态并没有消失——它只是换了个地方。当你需要"注销"或"立即吊销权限"时,你不得不引入黑名单——这又是一个状态存储。
>
> **没有银弹。每一种架构选择都是一种权衡。**
>
> - JWT → 牺牲"实时控制"换取"性能和扩展性"
> - Database Session → 牺牲"性能"换取"实时控制和灵活性"
>
> 选择哪个?取决于你的业务需求:
> - 银行系统、后台管理 → Database Session (需要实时吊销权限)
> - 内容平台、电商 → JWT (用户量大,登录状态不需要频繁变更)

---

## 6. 中间件保护 — 路由级别的访问控制

### 6.1 Next.js Middleware 基础

**完整代码**: [examples/nextauth/middleware.ts](./examples/nextauth/middleware.ts)

**Middleware 执行流程**:

```
每个请求
  ↓
1️⃣ 检查是否公开路由? → 是 → 放行
  ↓ 否
2️⃣ 检查是否登录? → 否 → 重定向到登录页
  ↓ 是
3️⃣ 检查角色权限? → 不足 → 403
  ↓ 通过
4️⃣ 放行
```

关键要点:
- **callbackUrl**: 登录后跳回原页面(`loginUrl.searchParams.set('callbackUrl', pathname)`)
- **matcher**: 精确控制哪些路径触发 Middleware
- **性能**: Middleware 每个请求都执行,避免重操作(如数据库查询)

### 6.2 基于角色的路由保护 (RBAC)

**完整代码**: [examples/rbac/roles.ts](./examples/rbac/roles.ts)

**RBAC 权限模型**:

```
GUEST → 无权限
  ↓
USER → 创建/编辑/删除自己的内容
  ↓
MODERATOR → + 编辑/删除任何内容 + 封禁用户
  ↓
ADMIN → + 删除用户
```

**权限命名规范**: `resource:action:scope`
- `post:delete:own` — 删除自己的帖子
- `post:delete:any` — 删除任何人的帖子

关键要点:
- **双重检查**: 既检查角色,也检查是否资源所有者
- **细粒度权限**: 区分 `own` 和 `any`

### 6.3 客户端组件的权限控制

```typescript
// components/delete-button.tsx
"use client"

import { useSession } from "next-auth/react"
import { hasPermission } from "@/lib/rbac"

interface DeleteButtonProps {
  postId: string;
  authorId: string;
}

export function DeleteButton({ postId, authorId }: DeleteButtonProps) {
  const { data: session } = useSession();
  
  if (!session) return null;
  
  const isOwner = session.user.id === authorId;
  const canDelete = isOwner 
    ? hasPermission(session.user.role, "post:delete:own")
    : hasPermission(session.user.role, "post:delete:any");
  
  if (!canDelete) {
    console.log('🚫 无删除权限,隐藏按钮');
    return null; // 不显示按钮
  }
  
  return (
    <button onClick={() => deletePost(postId)}>
      删除
    </button>
  );
}
```

> ⚠️ **重要**: 客户端的权限检查只是 UI 优化,**真正的权限检查必须在服务端**。永远不要信任客户端的任何判断。

---

## 7. 🧘 Zen of Code — 信任边界与最小权限原则

### 信任边界 (Trust Boundary)

> 你的系统中最重要的设计决策之一,就是**信任边界画在哪里**。
>
> ```
> ┌─────────────────────────────────────────────┐
> │  不可信区域 (Untrusted Zone)                 │
> │  - 用户浏览器                                │
> │  - 客户端 JavaScript                         │
> │  - HTTP 请求体/参数                          │
> │  - Cookies                                  │
> └──────────────┬──────────────────────────────┘
>                │
>      🚧 信任边界 (Trust Boundary) 🚧
>                │
> ┌──────────────▼──────────────────────────────┐
> │  可信区域 (Trusted Zone)                     │
> │  - 服务端代码                                │
> │  - 数据库                                    │
> │  - 环境变量                                  │
> │  - Session 存储                              │
> └─────────────────────────────────────────────┘
> ```
>
> **在信任边界上的原则**:
>
> 1. **永远不信任客户端输入** — 即使有客户端验证,也要在服务端重新验证
> 2. **敏感操作必须在服务端** — 价格计算、权限检查、密码验证
> 3. **Secret 永远不出服务端** — API Key、数据库密码、JWT Secret
> 4. **假设每个请求都是恶意的** — 在证明它是善意的之前

### 最小权限原则 (Principle of Least Privilege)

> 每个组件、每个用户、每个进程,应该只拥有完成其任务所需的**最小权限**。
>
> **错误示例**:
> ```typescript
> // ❌ 给前端暴露了完整的用户对象
> export async function getUser(id: string) {
>   return await db.user.findUnique({ where: { id } });
>   // 返回了: passwordHash, email, phone, address, 支付信息...
> }
> ```
>
> **正确示例**:
> ```typescript
> // ✅ 只返回必要的字段
> export async function getPublicUserProfile(id: string) {
>   return await db.user.findUnique({
>     where: { id },
>     select: {
>       id: true,
>       name: true,
>       image: true,
>       // ❌ 不包含: email, passwordHash, role
>     },
>   });
> }
>
> export async function getOwnUserProfile(id: string, requesterId: string) {
>   if (id !== requesterId) throw new Error('权限不足');
>   
>   return await db.user.findUnique({
>     where: { id },
>     select: {
>       id: true,
>       name: true,
>       email: true,
>       image: true,
>       // ✅ 自己可以看到 email,但仍然不返回 passwordHash
>     },
>   });
> }
> ```

### Defense in Depth (纵深防御)

> 不要依赖单一的防御层。多层防御,即使一层失败,其他层仍然能保护你。
>
> **认证的多层防御**:
> 1. **客户端验证** — 防止用户误操作(输入格式错误)
> 2. **服务端验证** — 防止恶意请求(绕过客户端验证)
> 3. **数据库约束** — 防止代码 Bug(unique, not null)
> 4. **速率限制** — 防止暴力破解
> 5. **审计日志** — 事后追踪攻击
>
> **授权的多层防御**:
> 1. **Middleware** — 路由级别拦截
> 2. **Server Action** — 函数级别权限检查
> 3. **数据库 RLS** — 行级别安全策略(Row-Level Security)

---

## 8. 最佳实践与常见陷阱

### ✅ 最佳实践

#### 1. 使用环境变量管理敏感信息

```bash
# .env.local (永远不要提交到 Git!)
AUTH_SECRET=your-generated-secret-here
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
DATABASE_URL=your-database-url
```

```bash
# .env.example (提交到 Git,作为模板)
AUTH_SECRET=
GITHUB_ID=
GITHUB_SECRET=
DATABASE_URL=
```

#### 2. 密码复杂度要求

```typescript
const passwordSchema = z
  .string()
  .min(8, "密码至少 8 位")
  .regex(/[A-Z]/, "必须包含大写字母")
  .regex(/[a-z]/, "必须包含小写字母")
  .regex(/[0-9]/, "必须包含数字")
  .regex(/[^A-Za-z0-9]/, "必须包含特殊字符");
```

#### 3. Session 过期策略

```typescript
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 天绝对过期
  updateAge: 24 * 60 * 60,   // 每 24 小时刷新一次(滑动过期)
}

// 用户连续 30 天不登录 → Session 过期
// 用户每天都登录 → Session 会被刷新,永不过期
```

#### 4. 错误信息不泄露

```typescript
// ❌ 泄露信息
if (!user) return { error: "用户不存在" };
if (wrongPassword) return { error: "密码错误" };
// 攻击者可以通过错误信息枚举有效邮箱

// ✅ 模糊错误
if (!user || wrongPassword) {
  return { error: "邮箱或密码错误" };
}
```

### ❌ 常见陷阱

#### 1. 在客户端组件中调用 `auth()`

```typescript
// ❌ 错误 (客户端组件不能用 auth())
"use client"
import { auth } from "@/lib/auth"

export function Component() {
  const session = await auth(); // ❌ 报错!
}

// ✅ 正确方式 1: 用 useSession
"use client"
import { useSession } from "next-auth/react"

export function Component() {
  const { data: session } = useSession();
}

// ✅ 正确方式 2: 在 Server Component 中调用
export async function ServerComponent() {
  const session = await auth();
  return <ClientComponent session={session} />;
}
```

#### 2. JWT 存储敏感信息

```typescript
// ❌ 危险!
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.creditCard = user.creditCard; // ❌ JWT 是 Base64,任何人都能解码!
      token.ssn = user.ssn;
    }
    return token;
  },
}

// ✅ 只存必要的、非敏感的信息
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role; // 角色信息可以公开
    }
    return token;
  },
}
```

#### 3. 忘记在 Server Action 中验证权限

```typescript
// ❌ 只检查了认证,没检查授权
export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session) throw new Error('未登录');
  
  // ⚠️ 任何登录用户都能删除任何用户!
  await db.user.delete({ where: { id: userId } });
}

// ✅ 完整的检查
export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session) throw new Error('未登录');
  
  // 只能是管理员或用户本人
  if (session.user.role !== 'ADMIN' && session.user.id !== userId) {
    throw new Error('权限不足');
  }
  
  await db.user.delete({ where: { id: userId } });
}
```

#### 4. 在 Middleware 中执行重操作

```typescript
// ❌ Middleware 会在每个请求上执行,包括静态资源!
export async function middleware(request: NextRequest) {
  // ❌ 查询数据库 (太慢!)
  const user = await db.user.findUnique(...);
  
  // ❌ 调用外部 API (太慢!)
  const data = await fetch('https://api.example.com');
}

// ✅ Middleware 只做轻量级检查
export async function middleware(request: NextRequest) {
  const session = await auth(); // ✅ JWT 验证很快
  
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect('/signin');
  }
}
```

---

## 9. 章节练习

### 练习 1: 实现邮箱验证流程

<details>
<summary>点击查看题目</summary>

实现一个邮箱验证流程:

1. 用户注册时,账户状态为"未验证"
2. 发送验证邮件(包含一个 Token)
3. 用户点击邮件中的链接
4. 验证 Token,激活账户

提示: 使用 `VerificationToken` 模型,Token 24 小时过期。

</details>

<details>
<summary>点击查看答案</summary>

```typescript
// app/actions/email-verification.ts
"use server"

import { db } from "@/lib/db"
import crypto from "crypto"

export async function sendVerificationEmail(email: string) {
  // 1️⃣ 生成随机 Token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 小时
  
  // 2️⃣ 存储 Token
  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });
  
  // 3️⃣ 发送邮件
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/auth/verify?token=${token}`;
  
  console.log('📧 发送验证邮件:', email);
  console.log('🔗 验证链接:', verificationUrl);
  
  // 实际项目中,用 Resend / SendGrid 发送邮件
  // await sendEmail({
  //   to: email,
  //   subject: "验证你的邮箱",
  //   html: `<a href="${verificationUrl}">点击验证</a>`,
  // });
}

export async function verifyEmail(token: string) {
  console.log('🔍 验证 Token:', token);
  
  // 1️⃣ 查找 Token
  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });
  
  if (!verificationToken) {
    console.error('❌ Token 不存在');
    return { success: false, error: 'Token 无效' };
  }
  
  // 2️⃣ 检查是否过期
  if (verificationToken.expires < new Date()) {
    console.error('❌ Token 已过期');
    await db.verificationToken.delete({ where: { token } });
    return { success: false, error: 'Token 已过期' };
  }
  
  // 3️⃣ 激活用户
  await db.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });
  
  // 4️⃣ 删除已使用的 Token
  await db.verificationToken.delete({ where: { token } });
  
  console.log('✅ 邮箱验证成功:', verificationToken.identifier);
  return { success: true };
}
```

</details>

### 练习 2: 实现"记住我"功能

<details>
<summary>点击查看题目</summary>

实现一个"记住我"复选框:
- 勾选时,Session 30 天过期
- 不勾选时,Session 1 天过期(关闭浏览器后失效)

提示: 使用 `signIn()` 的 `maxAge` 选项。

</details>

<details>
<summary>点击查看答案</summary>

```typescript
// app/auth/signin/page.tsx
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignInPage() {
  const [rememberMe, setRememberMe] = useState(false);
  
  async function handleSubmit(formData: FormData) {
    const maxAge = rememberMe 
      ? 30 * 24 * 60 * 60  // 30 天
      : 24 * 60 * 60;      // 1 天
    
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: true,
      callbackUrl: "/dashboard",
    });
    
    // 注意: NextAuth 的 maxAge 是在 auth.ts 配置中设置的
    // 这里需要通过 cookies 设置来实现
    document.cookie = `sessionMaxAge=${maxAge}; path=/; max-age=${maxAge}`;
  }
  
  return (
    <form action={handleSubmit}>
      <input name="email" type="email" placeholder="邮箱" />
      <input name="password" type="password" placeholder="密码" />
      
      <label>
        <input 
          type="checkbox" 
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        记住我
      </label>
      
      <button type="submit">登录</button>
    </form>
  );
}
```

更优雅的方案(修改 NextAuth 配置):

```typescript
// lib/auth.ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 默认 30 天
},

cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      // 根据用户选择动态设置
    },
  },
},
```

</details>

### 练习 3: 实现双因素认证 (2FA)

<details>
<summary>点击查看题目</summary>

实现 TOTP 双因素认证(Time-based One-Time Password,类似 Google Authenticator):

1. 用户启用 2FA 时,生成一个 Secret
2. 显示 QR 码,用户用 Google Authenticator 扫描
3. 登录时,除了密码,还需要输入 6 位验证码

提示: 使用 `otpauth` 库生成 TOTP。

</details>

<details>
<summary>点击查看答案</summary>

```bash
npm install otpauth qrcode
```

```typescript
// lib/totp.ts
import { TOTP } from "otpauth"
import QRCode from "qrcode"

export function generateTOTPSecret(email: string) {
  const totp = new TOTP({
    issuer: "MyApp",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30, // 每 30 秒更换一次验证码
  });
  
  const secret = totp.secret.base32;
  const otpauth = totp.toString();
  
  console.log('🔐 生成 TOTP Secret:', secret);
  console.log('📱 OTP Auth URL:', otpauth);
  
  return { secret, otpauth };
}

export async function generateQRCode(otpauth: string): Promise<string> {
  const qrCodeDataURL = await QRCode.toDataURL(otpauth);
  console.log('🖼️ 生成 QR 码');
  return qrCodeDataURL;
}

export function verifyTOTP(secret: string, token: string): boolean {
  const totp = new TOTP({ secret: TOTP.Secret.fromBase32(secret) });
  const delta = totp.validate({ token, window: 1 });
  
  // delta 为 null 表示无效
  // delta 为数字表示有效(时间窗口偏移量)
  const isValid = delta !== null;
  
  console.log(`🔍 验证 TOTP: ${token} → ${isValid ? '✅' : '❌'}`);
  
  return isValid;
}
```

```typescript
// app/actions/2fa.ts
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateTOTPSecret, generateQRCode } from "@/lib/totp"

export async function enable2FA() {
  const session = await auth();
  if (!session) throw new Error('未登录');
  
  // 1️⃣ 生成 Secret
  const { secret, otpauth } = generateTOTPSecret(session.user.email);
  
  // 2️⃣ 生成 QR 码
  const qrCode = await generateQRCode(otpauth);
  
  // 3️⃣ 保存到数据库(暂时未激活)
  await db.user.update({
    where: { id: session.user.id },
    data: { 
      totpSecret: secret,
      // ⚠️ 用户验证一次后才真正启用
    },
  });
  
  console.log('✅ 2FA 配置已生成,等待用户验证');
  
  return { qrCode, secret };
}

export async function confirm2FA(token: string) {
  const session = await auth();
  if (!session) throw new Error('未登录');
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true },
  });
  
  if (!user?.totpSecret) throw new Error('未配置 2FA');
  
  // 验证第一次输入的 Token
  const isValid = verifyTOTP(user.totpSecret, token);
  
  if (!isValid) {
    console.error('❌ 2FA 验证失败');
    return { success: false, error: '验证码错误' };
  }
  
  // 激活 2FA
  await db.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: true },
  });
  
  console.log('✅ 2FA 已启用');
  return { success: true };
}
```

修改登录流程:

```typescript
// lib/auth.ts (Credentials Provider)
async authorize(credentials) {
  const user = await db.user.findUnique({
    where: { email: credentials.email as string },
  });
  
  if (!user || !user.passwordHash) return null;
  
  const isPasswordValid = await bcrypt.compare(
    credentials.password as string,
    user.passwordHash
  );
  
  if (!isPasswordValid) return null;
  
  // ✅ 如果启用了 2FA,需要验证 TOTP
  if (user.twoFactorEnabled) {
    const token = credentials.token as string;
    
    if (!token) {
      // 第一步:密码正确,但需要 2FA
      throw new Error('NEED_2FA'); // 前端捕获这个错误,显示 2FA 输入框
    }
    
    const isTokenValid = verifyTOTP(user.totpSecret!, token);
    
    if (!isTokenValid) {
      console.error('❌ 2FA 验证失败');
      return null;
    }
    
    console.log('✅ 2FA 验证成功');
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
```

</details>

---

## 10. 总结与向后连接

### 你已经学会的

✅ 认证 vs 授权的本质区别
✅ NextAuth/Auth.js 的完整配置
✅ OAuth 2.0 授权流程与安全机制
✅ 密码哈希的正确姿势(bcrypt)
✅ JWT vs Database Session 的深度对比
✅ 中间件实现路由级别访问控制
✅ RBAC(基于角色的访问控制)模型
✅ 信任边界与最小权限原则

### 向前连接

- **Stage 4 Security** — 那章讲了 XSS/CSRF/SQL Injection 的攻击原理。本章讲的认证系统就是防御这些攻击的第一道防线。
- **Prisma** — 本章的用户数据、Session 存储都依赖 Prisma 的类型安全查询。

### 向后连接

- **Deployment** — 认证涉及大量环境变量(OAuth Client Secret, JWT Secret)。部署章节会教你如何安全管理这些 Secrets(Vercel 环境变量、加密存储)。
- **Project: TeamPulse** — 最终项目将整合本章的所有知识:用户登录、角色权限、路由保护。

---

## 🧠 终极思考题

> **问题**: 为什么 OAuth 2.0 被称为"授权协议"而不是"认证协议"?
>
> **提示**: OAuth 的核心目标是什么?Access Token 代表什么?

<details>
<summary>点击查看答案</summary>

**答案**:

OAuth 2.0 的核心目标是**授权 (Authorization)**,而不是**认证 (Authentication)**。

- **授权**: "某个网站可以访问我在 GitHub 上的公开仓库"
- **认证**: "证明我就是 GitHub 账户 xyz 的所有者"

OAuth 2.0 本身不关心"你是谁",它关心的是"你允许第三方做什么"。Access Token 代表的是**权限**,而不是**身份**。

这就是为什么:
- Facebook Login, Google Sign-In 使用的是 **OpenID Connect** (建立在 OAuth 2.0 之上的认证层)
- 如果你只用 OAuth 2.0,你会发现拿到 Access Token 后,你还需要调用 `/userinfo` 接口才能知道用户是谁

**类比**:
- OAuth 2.0 = 酒店给清洁工的门卡(授权进入房间打扫)
- OpenID Connect = 酒店前台验证身份证(认证你是房客)

**历史教训**: 很多早期的"OAuth 登录"实现实际上是不安全的,因为它们把授权流程当成了认证流程。2014 年,多个网站的"Facebook 登录"被发现存在漏洞,攻击者可以用自己的 Facebook Access Token 冒充任何用户登录。这就是为什么后来 OpenID Connect 被标准化。

</details>

---

> **下一章**: [Deployment & Production](../08-deployment-production/README.md) — 从 localhost 到全世界
>
> 你已经构建了一个完整的认证系统。接下来,让我们把它部署到真实的互联网上,面对真实的用户、真实的流量、真实的攻击。欢迎来到生产环境,这里没有 `console.log` 救得了你。

---

**编写**: 2026-02-08
**最后更新**: 2026-02-08
**字数**: ~15,000 字
**预计学习时间**: 3-4 天
