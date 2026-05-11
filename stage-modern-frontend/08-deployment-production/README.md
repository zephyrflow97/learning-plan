# 部署与生产 — 从 Localhost 到全世界的惊险一跳

> *"Real artists ship."* — Steve Jobs
>
> 一个从未上线的完美项目,其价值为零。一个有 Bug 但已经在用户手中的项目,至少已经开始创造价值了。这一章的目标只有一个:**当你读完最后一行,你的应用应该已经在互联网上运行了。** 部署不是项目的最后一步,部署是真正学习的开始——因为 `localhost:3000` 永远不会告诉你 CORS 是什么、HTTPS 证书为什么过期、为什么巴西用户的请求需要 3 秒才能返回。生产环境是最严苛的老师,也是最诚实的评委。

---

## 📖 本章内容

1. **从 `npm run build` 到上线** — 构建产物分析,你的代码变成了什么
2. **Vercel 部署** — Git 集成、Preview Deployments、环境变量
3. **边缘计算 (Edge Functions)** — 把服务器搬到用户身边
4. **环境管理** — `.env` 文件层级、Secrets 管理、环境隔离
5. **监控与可观测性** — Vercel Analytics、Error Tracking (Sentry)
6. **CI/CD 基础** — GitHub Actions 与自动化部署
7. **成本意识** — Serverless 定价模型,何时需要自建
8. **🧘 Zen of Code** — 完成比完美重要
9. **最佳实践与常见陷阱**
10. **章节练习**

**前置知识**: Stage 2 Git 基础, Next.js App Router, 环境变量基础概念
**学习时间**: 2-3 天
**关键术语**: Deployment, Edge Computing, Serverless, CI/CD, Observability

---

## 1. 从 `npm run build` 到上线 — 构建产物的解剖学

### 🎭 The Drama: 开发环境的美丽谎言

> **在 `localhost:3000` 上的你**: "我的应用完美运行!React 热更新快如闪电,API 响应不到 10ms,数据库就在隔壁进程,环境变量在 `.env.local` 文件里安安静静。"
>
> **部署到生产后的现实**: 用户在巴西,服务器在美国弗吉尼亚,延迟 200ms。数据库连接池在并发 100 时耗尽。你发现忘了在 Vercel 后台设置 `DATABASE_URL` 环境变量,整个应用 500 错误。前端 JS 包 3MB,用户在 3G 网络下等了 30 秒。
>
> **教训**: 开发环境是一个精心设计的温室。生产环境是丛林。你的应用在温室里长得很好,不代表它能在丛林中存活。

### 构建流程:从源码到产物

当你运行 `npm run build` 时,Next.js 执行了一系列复杂的转换:

```bash
# 构建命令
npm run build

# 输出示例
Route (app)                              Size     First Load JS
┌ ○ /                                    142 B          87.3 kB
├ ○ /about                               142 B          87.3 kB
├ ƒ /api/users                           0 B                0 B
└ ○ /dashboard                           2.1 kB         89.4 kB

○  (Static)  automatically rendered as static HTML
ƒ  (Dynamic) server-rendered on demand
```

**图例说明**:

- `○ (Static)`: 这个页面在构建时就生成了 HTML(SSG - Static Site Generation)
- `ƒ (Dynamic)`: 这个页面在每次请求时动态渲染(SSR - Server-Side Rendering)
- `Size`: 这个页面特有的 JS 代码大小
- `First Load JS`: 用户首次访问这个页面需要下载的总 JS 大小(包括共享的框架代码)

### 构建产物的目录结构

```
.next/
├── cache/                    # 构建缓存(加速后续构建)
├── server/                   # 服务端代码
│   ├── app/                  # App Router 页面
│   │   ├── page.html         # 预渲染的 HTML
│   │   └── page.js           # 服务端组件代码
│   └── chunks/               # 服务端代码分割
├── static/                   # 静态资源
│   ├── chunks/               # 客户端 JS 代码分割
│   ├── css/                  # CSS 文件
│   └── media/                # 图片、字体等
└── BUILD_ID                  # 构建唯一标识符
```

> 🧠 **CS Master's Bridge: 构建优化的黑魔法**
>
> Next.js 的构建器(基于 Webpack/Turbopack)执行以下优化:
> 1. **Tree Shaking**: 删除未使用的代码(如果你导入了 `lodash` 但只用了 `debounce`,只有 `debounce` 会被打包)
> 2. **Code Splitting**: 按路由自动分割代码(访问 `/about` 不需要下载 `/dashboard` 的代码)
> 3. **Minification**: 删除空格、缩短变量名(`function calculateUserScore` → `function a`)
> 4. **Image Optimization**: 自动生成 WebP/AVIF 格式,按设备尺寸裁剪
> 5. **CSS Purging**: Tailwind 只包含你实际使用的 class
>
> 最终结果:一个 10MB 的源码项目可能打包成 200KB 的生产构建。

### 验证构建产物

```typescript
// 构建完成后,本地预览生产版本
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start"  // 启动生产服务器
  }
}
```

```bash
# 1. 构建
npm run build

# 2. 启动生产服务器
npm run start
# > Local: http://localhost:3000

# 3. 访问 http://localhost:3000
# 你会发现:
# - 热更新消失了(不再需要,代码已经编译好了)
# - 控制台没有开发模式的警告
# - 页面加载明显更快(生产版本经过优化)
```

**检查清单**:

```typescript
// ✅ 构建前检查清单
const preBuildChecklist = {
  // 1. 所有环境变量都在 .env.example 中有文档说明吗?
  envDocumented: true,
  
  // 2. 是否有被提交到 Git 的敏感信息?
  noSecrets: true,
  
  // 3. 是否测试了生产构建?
  productionTested: true,
  
  // 4. 是否配置了错误边界?
  errorBoundaries: true,
  
  // 5. 是否有日志和监控?
  observability: true,
};

console.log('部署前,逐项检查:', preBuildChecklist);
```

> ⚛️ **The Physics: 从开发到生产的相变**
>
> 开发环境和生产环境是软件的两种"物理状态"。开发环境是高能态——快速迭代、详细日志、热更新、Source Maps。生产环境是低能态——稳定、压缩、缓存、错误隐藏。从开发到生产的转换,就像水的凝固——你需要主动"降温"(删除开发工具、压缩代码),否则系统会"蒸发"(性能差、安全漏洞)。

---

## 2. Vercel 部署 — Git 即部署的哲学

### 🌌 The Big Picture: 部署的考古学

> **2000 年代 (FTP 时代)**:
> ```bash
> # 1. 用 FileZilla 连接服务器
> # 2. 手动上传 index.html, style.css, script.js
> # 3. 祈祷没有传错文件
> # 4. 上线后发现 Bug,重复步骤 1-3
> ```
>
> **2010 年代 (Heroku 时代)**:
> ```bash
> git push heroku main
> # Heroku 自动构建、部署
> # 革命性的简化!但需要手动管理数据库、配置环境变量、扩展实例
> ```
>
> **2020 年代 (Vercel 时代)**:
> ```bash
> git push origin main
> # Vercel 自动检测推送、构建、部署、全球 CDN 分发、HTTPS 证书、环境变量
> # 部署不再是一个"动作",而是 Git 推送的副作用
> ```

### Vercel 的核心哲学

Vercel 的设计围绕三个核心理念:

1. **Git 是事实来源** (Git as Source of Truth)
   - 每个 Git 分支自动对应一个部署环境
   - `main` 分支 → 生产环境 (Production)
   - `feature/new-ui` 分支 → 预览环境 (Preview)

2. **零配置优化** (Zero Config Optimization)
   - 自动检测 Next.js 项目
   - 自动设置构建命令 (`npm run build`)
   - 自动配置全球 CDN 和 Edge Network

3. **开发者体验优先** (Developer Experience First)
   - 部署状态通过 GitHub PR 评论实时反馈
   - 每个 PR 都有独立的预览 URL
   - 一键回滚到任何历史版本

### 实战:部署你的第一个 Next.js 应用

#### 步骤 1: 准备 Git 仓库

```bash
# 初始化 Git 仓库(如果还没有)
git init

# 添加 .gitignore
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

# 提交代码
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

#### 步骤 2: 连接 Vercel

**方式 1: 通过 Vercel Dashboard (推荐初学者)**

1. 访问 [vercel.com](https://vercel.com)
2. 用 GitHub 账号登录
3. 点击 "Add New..." → "Project"
4. 选择你的 GitHub 仓库
5. Vercel 自动检测到 Next.js,点击 "Deploy"
6. 等待 30-60 秒,部署完成!

**方式 2: 通过 Vercel CLI (推荐高级用户)**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login
# 选择 GitHub 登录

# 部署
vercel
# 第一次运行时,会问你一系列问题:
# ? Set up and deploy "~/my-app"? [Y/n] y
# ? Which scope do you want to deploy to? 你的用户名
# ? Link to existing project? [y/N] n
# ? What's your project's name? my-app
# ? In which directory is your code located? ./
# 
# Vercel 自动检测到 Next.js 项目
# ✅ Production: https://my-app-abc123.vercel.app

# 部署到生产环境
vercel --prod
```

#### 步骤 3: 配置环境变量

```typescript
// 你的 Next.js 应用需要环境变量
// .env.example (提交到 Git,用于文档说明)
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com

// .env.local (本地开发,不提交到 Git)
DATABASE_URL=postgresql://localhost:5432/mydb
NEXTAUTH_SECRET=local-dev-secret
NEXTAUTH_URL=http://localhost:3000
```

**在 Vercel 设置环境变量**:

```bash
# 方式 1: 通过 Dashboard
# 1. 进入项目 → Settings → Environment Variables
# 2. 添加变量:
#    Name: DATABASE_URL
#    Value: postgresql://...
#    Environment: Production, Preview, Development

# 方式 2: 通过 CLI
vercel env add DATABASE_URL production
# 粘贴值,按回车
```

**环境变量的三种环境**:

| 环境 | 何时使用 | 示例场景 |
|------|---------|---------|
| **Production** | `main` 分支部署 | 生产数据库、真实 API 密钥 |
| **Preview** | 其他分支部署 | 测试数据库、测试 API 密钥 |
| **Development** | 本地 `vercel dev` | 本地数据库 |

> 🎭 **The Drama: 环境变量泄露的恐怖故事**
>
> **2023 年某创业公司事件**:
> 1. 开发者在测试时,把 `.env` 文件提交到了 GitHub
> 2. 文件中包含生产数据库的 `DATABASE_URL` 和 `JWT_SECRET`
> 3. GitHub 仓库是公开的
> 4. 一个爬虫扫描 GitHub,发现了这个文件
> 5. 48 小时内,数据库被删除,所有用户数据丢失
>
> **教训**:
> - ✅ 永远不要提交 `.env` 文件到 Git
> - ✅ 使用 `.env.example` 作为模板(只包含键名,不包含真实值)
> - ✅ 在 `.gitignore` 中明确排除 `.env*`
> - ✅ 使用 GitHub Secret Scanning 功能
> - ✅ 定期轮换敏感密钥

### Preview Deployments: 平行宇宙的魔法

> ⚛️ **The Physics: 平行宇宙的实用化**
>
> 量子力学说,每一个决策点都会创造一个平行宇宙。Vercel 的 Preview Deployment 把这个概念带到了软件工程:
> - **主宇宙**: `main` 分支,生产环境,用户在这里
> - **平行宇宙**: 每个功能分支,独立的预览环境,完全隔离
> - **宇宙融合**: PR 合并时,平行宇宙合并到主宇宙
>
> 在合并之前,你可以在平行宇宙里随便折腾——改 UI、破坏数据库、实验新功能——完全不影响主宇宙。

**实战演示**:

```bash
# 1. 创建功能分支
git checkout -b feature/new-landing-page

# 2. 修改代码
# src/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">
        全新的落地页! 🚀
      </h1>
    </main>
  );
}

# 3. 提交并推送
git add .
git commit -m "feat: redesign landing page"
git push origin feature/new-landing-page

# 4. 创建 Pull Request
# GitHub 上创建 PR

# 5. Vercel 自动部署 Preview
# Vercel Bot 会在 PR 下方评论:
# ✅ Preview: https://my-app-git-feature-new-landing-page-username.vercel.app
```

**Preview Deployment 的威力**:

```typescript
// 场景:你需要给设计师审查新 UI
const traditionalWay = {
  steps: [
    "1. 开发者截图发给设计师",
    "2. 设计师反馈 '这个按钮太小了'",
    "3. 开发者改代码,重新截图",
    "4. 来回十几轮邮件",
  ],
  pain: "高延迟、低带宽的沟通",
};

const vercelWay = {
  steps: [
    "1. 开发者推送代码",
    "2. Vercel 生成 Preview URL",
    "3. 设计师在真实环境中点击、调整窗口大小、测试交互",
    "4. 设计师直接在 PR 中评论具体问题",
  ],
  benefit: "所见即所得、异步协作、完整上下文",
};

console.log('Preview Deployments 将反馈周期从天降到分钟');
```

---

## 3. 边缘计算 (Edge Functions) — 把服务器搬到用户身边

### 🌌 The Big Picture: 从集中式到分布式

> **传统架构 (2010s)**:
> - 你的服务器在美国弗吉尼亚州(AWS us-east-1)
> - 巴西用户的请求要穿越半个地球
> - 光速限制: 30,000 km ÷ 300,000 km/s = 100ms(仅物理延迟,不算网络拥堵)
> - 实际延迟: 200-500ms
>
> **边缘计算架构 (2020s)**:
> - 你的代码分布在全球 300+ 个边缘节点(Edge Locations)
> - 巴西用户的请求由圣保罗的边缘节点处理
> - 延迟: 10-50ms
>
> **类比**: 从"全国只有一家总行"到"每个城市都有分行"。

### Edge Functions vs Serverless Functions

```typescript
// Serverless Function (传统)
// app/api/hello/route.ts
export async function GET() {
  // 运行在 Node.js 环境
  // 冷启动: 200ms - 5s
  // 可用所有 Node.js API (fs, child_process, etc.)
  const data = await fetch('https://api.example.com/data');
  return Response.json({ data });
}

// Edge Function (边缘计算)
// app/api/hello-edge/route.ts
export const runtime = 'edge'; // 关键配置

export async function GET() {
  // 运行在 V8 Isolate (轻量级 JS 沙箱)
  // 冷启动: <5ms
  // 只能使用 Web 标准 API (fetch, Response, etc.)
  const data = await fetch('https://api.example.com/data');
  return Response.json({ data });
}
```

**对比表**:

| 特性 | Serverless Functions | Edge Functions |
|------|---------------------|----------------|
| **运行时** | Node.js | V8 Isolate (V8 引擎的隔离环境) |
| **冷启动** | 200ms - 5s | <5ms |
| **地理分布** | 单一区域 | 全球 300+ 节点 |
| **可用 API** | 所有 Node.js API | Web 标准 API (fetch, Headers, URL, etc.) |
| **适用场景** | 复杂计算、数据库操作 | 认证检查、A/B 测试、重定向、简单 API |
| **成本** | 按执行时间计费 | 按请求数计费(通常更便宜) |

> 🧠 **CS Master's Bridge: V8 Isolate 的魔法**
>
> 传统 Serverless Function 每个请求启动一个独立的 Node.js 进程:
> ```
> 请求 1 → 启动 Node.js 进程 → 加载代码 → 执行 → 销毁进程
> 请求 2 → 启动 Node.js 进程 → 加载代码 → 执行 → 销毁进程
> ```
>
> Edge Function 使用 V8 Isolate(Chrome 浏览器用来隔离网页 Tab 的技术):
> ```
> 单个 V8 进程 → 创建 Isolate 1(请求 1) → 创建 Isolate 2(请求 2) → ...
> ```
>
> Isolate 是进程内的隔离环境:
> - 共享 V8 引擎(不需要重复启动)
> - 内存隔离(Isolate 之间互不干扰)
> - 启动成本极低(只分配一小块内存)
>
> 类比:进程是独立的房子(建造成本高),Isolate 是房子里的房间(隔墙成本低)。

### 实战:何时使用 Edge Functions

**✅ 适合 Edge Functions 的场景**:

```typescript
// 1. 中间件 - 认证检查
// middleware.ts
export const config = { matcher: '/dashboard/:path*' };

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  if (!token) {
    // 在边缘节点直接重定向,不需要到达主服务器
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 验证 JWT (轻量级计算)
  const isValid = await verifyJWT(token.value);
  
  if (!isValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// 2. A/B 测试
export async function GET(request: Request) {
  const geo = request.headers.get('x-vercel-ip-country');
  const variant = Math.random() > 0.5 ? 'A' : 'B';
  
  // 根据地理位置和随机数返回不同内容
  return Response.json({
    variant,
    country: geo,
    message: variant === 'A' ? '欢迎!' : 'Welcome!',
  });
}

// 3. 动态重定向
export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = request.headers.get('accept-language')?.split(',')[0];
  
  // 根据用户语言重定向
  if (locale?.startsWith('zh')) {
    return Response.redirect(new URL('/zh' + url.pathname, request.url));
  }
  
  return Response.redirect(new URL('/en' + url.pathname, request.url));
}
```

**❌ 不适合 Edge Functions 的场景**:

```typescript
// ❌ 1. 数据库操作 (需要 Node.js 驱动)
export const runtime = 'edge';

export async function GET() {
  // 错误! Edge 环境没有 Node.js fs 模块
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  // 这会失败,因为 Prisma Client 依赖 Node.js
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// ✅ 解决方案: 使用 Serverless Function + Prisma Accelerate
export async function GET() {
  // 不设置 runtime = 'edge',使用默认的 Node.js
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// ❌ 2. 文件系统操作
export const runtime = 'edge';

export async function GET() {
  const fs = await import('fs'); // 错误! Edge 没有 fs 模块
  const data = fs.readFileSync('/path/to/file');
  return Response.json(data);
}

// ❌ 3. CPU 密集型计算
export const runtime = 'edge';

export async function GET() {
  // Edge Functions 有执行时间限制(通常 30 秒)
  // 复杂计算应该用 Serverless Function 或后台任务
  const result = complexCalculation(); // 需要 10 分钟
  return Response.json(result);
}
```

**决策树**:

```
你的 API 需要:
├─ 数据库操作? (Prisma, 原生 SQL)
│  └─ 是 → Serverless Function
│
├─ 文件系统操作? (读写文件, child_process)
│  └─ 是 → Serverless Function
│
├─ 复杂计算? (图像处理, 视频转码)
│  └─ 是 → Serverless Function / 后台任务队列
│
└─ 轻量级逻辑? (认证检查, 重定向, 简单 fetch)
   └─ 是 → Edge Function
```

---

## 4. 环境管理 — 信任边界的第一道防线

### 🎭 The Drama: 环境变量的三宗罪

> **罪行 1: 硬编码敏感信息**
> ```typescript
> // ❌ 永远不要这样做
> const DATABASE_URL = 'postgresql://admin:password123@db.example.com:5432/prod';
> const JWT_SECRET = 'my-super-secret-key';
> ```
> **后果**: 代码提交到 GitHub → 任何人都能看到 → 数据库被攻击 → 公司倒闭
>
> **罪行 2: 混淆开发和生产环境**
> ```typescript
> // ❌ 在生产环境使用开发数据库
> const db = new Database(process.env.DEV_DATABASE_URL);
> // 后果: 开发时测试删除操作 → 删掉了生产数据
> ```
>
> **罪行 3: 把 Secret 暴露给客户端**
> ```typescript
> // ❌ next.config.ts
> export default {
>   env: {
>     // 这会把密钥编译进客户端 JS!
>     DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
>   },
> };
> ```
> **后果**: 任何用户打开浏览器 DevTools → 在 JS 文件里搜索 "DATABASE" → 拿到密码

### 环境变量的四个层级

```bash
# 1. .env (所有环境的默认值,可提交到 Git)
DATABASE_URL=postgresql://localhost:5432/myapp
NEXT_PUBLIC_APP_NAME=MyApp

# 2. .env.local (本地开发,覆盖 .env,不提交)
DATABASE_URL=postgresql://localhost:5432/myapp_dev
NEXTAUTH_SECRET=local-dev-secret-change-in-production

# 3. .env.production (生产构建时加载,可提交)
NEXT_PUBLIC_API_URL=https://api.production.com

# 4. .env.production.local (生产机密,不提交)
DATABASE_URL=postgresql://prod-db.example.com:5432/myapp
NEXTAUTH_SECRET=prod-secret-2849fjsdf8923
```

**加载优先级**(从高到低):

```
1. .env.$(NODE_ENV).local  (如 .env.production.local)
2. .env.local
3. .env.$(NODE_ENV)        (如 .env.production)
4. .env
```

### 客户端 vs 服务端环境变量

Next.js 的环境变量有严格的安全边界:

```typescript
// .env
DATABASE_URL=postgresql://...           // 仅服务端可访问
NEXTAUTH_SECRET=abc123                  // 仅服务端可访问
NEXT_PUBLIC_API_URL=https://api.com    // 客户端和服务端都可访问

// Server Component (可访问所有环境变量)
export default async function ServerPage() {
  // ✅ 可以访问
  const dbUrl = process.env.DATABASE_URL;
  const secret = process.env.NEXTAUTH_SECRET;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  console.log('这些日志只在服务器控制台打印');
  console.log('DATABASE_URL:', dbUrl); // 安全,用户看不到
  
  return <div>Server Page</div>;
}

// Client Component (只能访问 NEXT_PUBLIC_ 变量)
'use client';

export default function ClientComponent() {
  // ❌ undefined (Next.js 在构建时移除了这个变量)
  const dbUrl = process.env.DATABASE_URL;
  console.log(dbUrl); // undefined
  
  // ✅ 可以访问
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log('这条日志在浏览器控制台打印');
  console.log('API URL:', apiUrl); // 安全暴露(设计如此)
  
  return <div>Client Component</div>;
}
```

> 🧠 **CS Master's Bridge: 环境变量的编译时替换**
>
> Next.js 在构建时执行**静态替换** (Static Replacement):
>
> ```typescript
> // 源码
> const apiUrl = process.env.NEXT_PUBLIC_API_URL;
>
> // 构建后的客户端 JS (NEXT_PUBLIC_ 变量被替换为实际值)
> const apiUrl = "https://api.com";
>
> // 构建后的客户端 JS (非 NEXT_PUBLIC_ 变量被替换为 undefined)
> const dbUrl = undefined;
> ```
>
> 这不是运行时的环境变量读取,而是编译时的文本替换——类似 C 语言的 `#define`。这意味着:
> 1. 客户端代码里的 `NEXT_PUBLIC_` 变量在构建后就不再是"变量",而是硬编码的字符串
> 2. 改变环境变量需要重新构建,不能在运行时动态切换
> 3. 永远不要在 `NEXT_PUBLIC_` 变量里放密钥——它会被写死在用户下载的 JS 文件里

### 在 Vercel 管理环境变量

**方法 1: Dashboard UI**

```
1. 进入项目 → Settings → Environment Variables
2. 点击 "Add New"
3. 填写:
   Key: DATABASE_URL
   Value: postgresql://...
   Environment: ☑ Production ☑ Preview ☐ Development
4. Save
```

**方法 2: CLI**

```bash
# 添加生产环境变量
vercel env add DATABASE_URL production
# 输入值,按回车

# 添加 Preview 环境变量
vercel env add DATABASE_URL preview

# 查看所有环境变量
vercel env ls

# 拉取环境变量到本地 .env.local
vercel env pull .env.local
```

**方法 3: `.env.production` + Vercel 自动加载**

```bash
# 在项目根目录创建 .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://myapp.com
EOF

# 提交到 Git
git add .env.production
git commit -m "chore: add production env"
git push

# Vercel 会自动加载这个文件
# 但敏感信息仍然应该在 Dashboard 设置,不应该提交到 Git
```

### 环境变量的类型安全

> 💡 **查看完整实现**: 包含所有环境变量验证、辅助函数的完整类型安全方案请查看 [examples/env/env-validation.ts](./examples/env/env-validation.ts)

```typescript
// src/env.ts (简化示例)
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_NAME: z.string(),
});

// 验证环境变量(构建时失败而不是运行时)
export const env = envSchema.parse(process.env);

// 使用
import { env } from '@/env';
const dbUrl = env.DATABASE_URL; // 类型安全!
```

**进阶: T3 Stack 的 `create-t3-app` 环境变量模式**

```typescript
// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * 服务端环境变量
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(32)
        : z.string().min(32).optional(),
    NEXTAUTH_URL: z.preprocess(
      // Vercel 自动设置 VERCEL_URL,可以作为 NEXTAUTH_URL 的后备
      (str) => process.env.VERCEL_URL ?? str,
      z.string().url(),
    ),
  },
  
  /**
   * 客户端环境变量(必须以 NEXT_PUBLIC_ 开头)
   */
  client: {
    NEXT_PUBLIC_APP_NAME: z.string(),
  },
  
  /**
   * 运行时环境变量(从 process.env 读取)
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  
  /**
   * 跳过验证的环境(如在 Docker 构建时)
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
```

> ⚛️ **The Physics: 环境即状态空间**
>
> 在物理学中,一个系统的"状态"由所有变量的值决定。在软件中,环境变量定义了你的应用运行在哪个"状态空间":
> - **开发环境**: `DATABASE_URL=localhost`, `LOG_LEVEL=debug`, `CACHE=off`
> - **生产环境**: `DATABASE_URL=aws-rds`, `LOG_LEVEL=error`, `CACHE=on`
>
> 两个环境是两个完全不同的状态空间。你的应用在两个空间里的行为可能完全不同。**环境隔离**就是确保状态空间不会意外交叉——你不想在开发时删掉生产数据库的表。

---

## 5. 监控与可观测性 — 你不能改进你无法测量的东西

### 🧘 Zen of Code: 盲飞的危险

> "在云端飞行时,飞行员完全依赖仪表盘——高度计、速度计、姿态仪。没有这些仪器,飞行员会陷入'空间定向障碍',分不清上下左右,最终坠毁。这被称为'盲飞'。
>
> 没有监控的生产环境就是盲飞。你不知道:
> - 有多少用户在线?(流量)
> - 他们遇到了哪些错误?(错误率)
> - 页面加载要多久?(性能)
> - 数据库查询是否变慢了?(延迟)
>
> 当用户在 Twitter 上抱怨'你的网站挂了'时,你才发现问题——这时你已经坠毁了。
>
> **可观测性 (Observability)** 是你的仪表盘。它不能阻止问题发生,但能让你在问题变成灾难之前发现它。"

### 可观测性的三大支柱

```typescript
// 1. Metrics (指标) - 数值化的系统状态
const metrics = {
  requestsPerSecond: 1250,      // 每秒请求数
  errorRate: 0.02,              // 错误率 2%
  p95Latency: 350,              // 95% 的请求在 350ms 内完成
  cpuUsage: 0.65,               // CPU 使用率 65%
  memoryUsage: 1200,            // 内存使用 1.2GB
};

// 2. Logs (日志) - 离散的事件记录
console.log('2024-01-15 10:23:45 INFO User login successful', { userId: 123 });
console.error('2024-01-15 10:24:01 ERROR Database connection failed', { error: 'ETIMEDOUT' });

// 3. Traces (追踪) - 分布式请求的完整路径
const trace = {
  traceId: '7f8a3b2c-9d1e-4a5f-b6c7-8d9e0f1a2b3c',
  spans: [
    { name: 'HTTP GET /api/users', duration: 350 },
    { name: 'Database Query', duration: 200 },
    { name: 'External API Call', duration: 120 },
  ],
};
```

### Vercel Analytics: 开箱即用的性能监控

Vercel 提供两种内建的分析工具:

#### Web Analytics (网页分析)

```typescript
// 1. 在 Vercel Dashboard 启用
// Project → Analytics → Enable Web Analytics

// 2. 在你的应用中添加脚本(Next.js 自动注入,无需手动添加)
// Vercel 会自动追踪:
const webAnalytics = {
  pageViews: '每个页面的访问次数',
  visitors: '唯一访客数',
  topPages: '最受欢迎的页面',
  topReferrers: '流量来源(Google, Twitter, 直接访问)',
  devices: '设备类型分布(桌面 vs 移动)',
  browsers: '浏览器分布(Chrome, Safari, Firefox)',
  countries: '访客地理位置',
};

// 3. 查看数据
// Dashboard → Analytics → Web Analytics
```

#### Speed Insights (性能洞察)

```bash
# 安装
npm install @vercel/speed-insights

# 添加到根布局
# src/app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

Vercel Speed Insights 追踪 **Core Web Vitals**(Google 的性能指标):

| 指标 | 含义 | 目标 |
|------|------|------|
| **LCP** (Largest Contentful Paint) | 最大内容绘制时间(主要内容何时可见) | <2.5s |
| **FID** (First Input Delay) | 首次输入延迟(点击按钮到响应的时间) | <100ms |
| **CLS** (Cumulative Layout Shift) | 累积布局偏移(页面元素是否跳动) | <0.1 |
| **TTFB** (Time to First Byte) | 首字节时间(服务器响应速度) | <600ms |

```typescript
// 在代码中自定义性能追踪
import { sendToAnalytics } from '@vercel/speed-insights';

export async function fetchUserData(userId: string) {
  const startTime = performance.now();
  
  const user = await db.user.findUnique({ where: { id: userId } });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // 发送自定义指标到 Vercel
  sendToAnalytics({
    name: 'database_query',
    value: duration,
    tags: {
      query: 'user.findUnique',
      userId,
    },
  });
  
  return user;
}
```

### Sentry: 错误追踪与崩溃报告

> 🎭 **The Drama: 无声的错误**
>
> 用户 A 在使用你的应用时,点击"提交订单"按钮。客户端发送请求到 `/api/orders`,服务端抛出了一个错误:
> ```
> TypeError: Cannot read property 'id' of undefined
>   at createOrder (app/api/orders/route.ts:23:15)
> ```
> 用户看到"Something went wrong",然后离开了你的网站。
>
> **你知道这个错误发生了吗?** 不知道。
> **你能重现这个 Bug 吗?** 不能,你不知道用户的操作步骤。
> **你损失了多少订单?** 不知道,可能这个 Bug 已经存在一周了。
>
> Sentry 的作用就是捕获这些"无声的错误",并告诉你:
> - 谁遇到了这个错误?(用户 ID、IP、浏览器)
> - 错误发生的完整上下文(请求参数、用户操作、浏览器状态)
> - 错误发生了多少次?(是偶发还是频繁?)

**集成 Sentry**:

```bash
# 安装 Sentry
npm install @sentry/nextjs

# 初始化(自动配置)
npx @sentry/wizard@latest -i nextjs
```

> 💡 **查看完整配置**: 
> - 客户端配置(含 Replay、Breadcrumbs): [examples/sentry/sentry.client.config.ts](./examples/sentry/sentry.client.config.ts)
> - 服务端配置(含 API/Server Actions 错误处理): [examples/sentry/sentry.server.config.ts](./examples/sentry/sentry.server.config.ts)

初始化后,Sentry 会创建三个配置文件,关键配置包括:
- ✅ `beforeSend` 过滤敏感信息
- ✅ `tracesSampleRate: 0.1` 控制采样率
- ✅ `enabled: NODE_ENV === 'production'` 只在生产环境启用

**在代码中使用 Sentry**:

```typescript
// app/api/orders/route.ts
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 业务逻辑
    const order = await createOrder(body);
    
    return Response.json(order);
  } catch (error) {
    // 捕获错误并发送到 Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/orders',
        method: 'POST',
      },
      extra: {
        requestBody: body,
        userId: body.userId,
      },
    });
    
    // 返回友好的错误信息(不暴露内部细节)
    return Response.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// 手动发送事件
Sentry.captureMessage('User completed onboarding', {
  level: 'info',
  tags: { feature: 'onboarding' },
});

// 添加用户上下文
Sentry.setUser({
  id: '123',
  username: 'john_doe',
  // 不要添加邮箱和敏感信息!
});

// 添加面包屑(用户操作痕迹)
Sentry.addBreadcrumb({
  category: 'ui',
  message: 'User clicked submit button',
  level: 'info',
});
```

**Sentry 错误报告示例**:

```
TypeError: Cannot read property 'id' of undefined

Stack Trace:
  at createOrder (app/api/orders/route.ts:23:15)
  at POST (app/api/orders/route.ts:10:20)

Context:
  User: { id: '123', username: 'john_doe' }
  Tags: { endpoint: '/api/orders', method: 'POST' }
  Extra: { requestBody: {...}, userId: '123' }
  
Breadcrumbs:
  1. Navigation: User navigated to /checkout
  2. UI: User clicked "Add to cart"
  3. API: POST /api/cart/add returned 200
  4. UI: User clicked "Submit order"
  5. API: POST /api/orders returned 500 ← Error occurred here

Browser: Chrome 120.0 on macOS
First Seen: 2024-01-15 10:23:45
Last Seen: 2024-01-15 15:42:10
Occurrences: 47 times
Affected Users: 23 users
```

> 🧠 **CS Master's Bridge: Source Maps 的魔法**
>
> 生产环境的 JS 代码是压缩和混淆的:
> ```javascript
> // 生产构建
> function a(b){return b.c.id}
> ```
>
> 当错误发生时,堆栈追踪是这样的:
> ```
> TypeError: Cannot read property 'id' of undefined
>   at a (chunk-abc123.js:1:234)
> ```
>
> 你根本不知道 `a` 函数是什么,`chunk-abc123.js:1:234` 对应源码的哪一行。
>
> **Source Map** 是一个映射文件(`.js.map`),记录了压缩代码和源码的对应关系:
> ```json
> {
>   "version": 3,
>   "sources": ["app/api/orders/route.ts"],
>   "mappings": "AAAA,SAASA,EAAA..."
> }
> ```
>
> Sentry 上传 Source Maps 后,能自动将错误堆栈"翻译"回源码:
> ```
> TypeError: Cannot read property 'id' of undefined
>   at createOrder (app/api/orders/route.ts:23:15)
>                    ↑ 真实的文件名和行号
> ```
>
> **安全注意**: Source Maps 包含完整的源码信息,不应该公开。Sentry 通过私有上传保证安全。

---

## 6. CI/CD 基础 — 自动化的力量

### 🌌 The Big Picture: 从手动到自动的进化

> **2005 年的部署流程**:
> 1. 开发者在本地测试代码
> 2. 手动运行测试套件(如果有的话)
> 3. 通过 FTP 上传文件到服务器
> 4. SSH 登录服务器,手动重启应用
> 5. 祈祷没有出错
> 6. 出错了,重复步骤 3-4
>
> **2015 年的部署流程**:
> 1. 开发者推送代码到 Git
> 2. CI 服务器(如 Jenkins)自动拉取代码
> 3. 自动运行测试
> 4. 测试通过后,自动部署到测试环境
> 5. 手动批准后,自动部署到生产环境
>
> **2025 年的部署流程(Vercel + GitHub Actions)**:
> 1. 开发者推送代码到 Git
> 2. GitHub Actions 自动运行 Lint、Type Check、单元测试
> 3. Vercel 自动部署 Preview 环境
> 4. PR 合并到 main 后,Vercel 自动部署到生产环境
> 5. Sentry 自动监控错误,Vercel Analytics 自动追踪性能
> 6. 出错了,一键回滚到上个版本
>
> **节省的时间**: 从 30 分钟人工部署 → 3 分钟自动部署

### CI/CD 的核心概念

```typescript
// CI (Continuous Integration) - 持续集成
const CI = {
  definition: '每次代码推送后,自动运行测试和检查',
  benefits: [
    '早期发现 Bug(在合并前而不是部署后)',
    '强制代码质量标准(Lint、Type Check)',
    '减少"我的机器上能跑"的问题(所有测试在统一环境运行)',
  ],
  tools: ['GitHub Actions', 'GitLab CI', 'CircleCI', 'Travis CI'],
};

// CD (Continuous Deployment) - 持续部署
const CD = {
  definition: '测试通过后,自动部署到生产环境',
  benefits: [
    '消除手动部署的人为错误',
    '加速发布周期(每天部署多次而不是每月一次)',
    '快速回滚能力',
  ],
  variants: {
    'Continuous Delivery': '自动部署到测试环境,手动批准生产部署',
    'Continuous Deployment': '完全自动,测试通过就自动上线',
  },
};
```

### GitHub Actions: 实战配置

GitHub Actions 是 GitHub 内建的 CI/CD 工具。它通过 **Workflow**(工作流)定义自动化任务。

**创建你的第一个 Workflow**:

```yaml
# .github/workflows/ci.yml
name: CI

# 触发条件
on:
  # 每次推送到任何分支时触发
  push:
    branches: ['**']
  # 每次创建或更新 Pull Request 时触发
  pull_request:
    branches: ['main']

# 并发控制(同一个 PR 的新推送会取消旧的运行)
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# 任务定义
jobs:
  # 任务 1: Lint 和 Type Check
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
      # 1. 检出代码
      - name: Checkout code
        uses: actions/checkout@v4
      
      # 2. 设置 Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      # 3. 安装依赖
      - name: Install dependencies
        run: npm ci
      
      # 4. 运行 Lint
      - name: Run ESLint
        run: npm run lint
      
      # 5. 运行 Type Check
      - name: Run TypeScript Check
        run: npx tsc --noEmit
  
  # 任务 2: 单元测试
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      # 运行测试(假设你用 Vitest 或 Jest)
      - name: Run tests
        run: npm test
      
      # 上传测试覆盖率报告
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
  
  # 任务 3: 构建测试
  build:
    name: Build
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      # 设置环境变量(用于构建)
      - name: Create .env file
        run: |
          echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> .env
          echo "NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}" >> .env
          echo "NEXT_PUBLIC_APP_NAME=MyApp" >> .env
      
      # 运行构建
      - name: Build application
        run: npm run build
      
      # 检查构建产物大小
      - name: Analyze bundle size
        run: |
          echo "Build output:"
          ls -lh .next/static/chunks/
```

**配置 GitHub Secrets**:

```bash
# 1. 在 GitHub 仓库页面:
#    Settings → Secrets and variables → Actions → New repository secret

# 2. 添加 secrets:
#    Name: DATABASE_URL
#    Value: postgresql://...

#    Name: NEXTAUTH_SECRET
#    Value: your-secret-key

# 3. 在 Workflow 中使用:
#    ${{ secrets.DATABASE_URL }}
```

**进阶: 矩阵测试(多版本兼容性)**

```yaml
jobs:
  test:
    name: Test on Node ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    
    # 矩阵策略:在多个 Node.js 版本上测试
    strategy:
      matrix:
        node-version: [18, 20, 21]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - run: npm ci
      - run: npm test
```

### Vercel + GitHub Actions 集成

Vercel 已经内建了 Git 集成,但你可能想在 GitHub Actions 中做一些 Vercel 不做的事(如数据库迁移):

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: ['main']

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      # 运行数据库迁移(在 Vercel 部署之前)
      - name: Run database migrations
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
        run: npx prisma migrate deploy
      
      # 触发 Vercel 部署
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npm install -g vercel
          vercel pull --yes --environment=production --token=$VERCEL_TOKEN
          vercel build --prod --token=$VERCEL_TOKEN
          vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
      
      # 部署后:清理缓存
      - name: Purge CDN cache
        run: curl -X POST https://api.vercel.com/v1/purge/...
```

> ⚛️ **The Physics: 自动化的复利效应**
>
> 投资中的复利公式: `FV = PV × (1 + r)^n`
> - PV: 初始投资
> - r: 增长率
> - n: 时间
>
> 自动化的复利:
> - **初始投资**: 2 小时配置 CI/CD
> - **增长率**: 每次部署节省 20 分钟
> - **时间**: 如果你一天部署 5 次,一年 250 个工作日
> - **回报**: 节省 (20 分钟 × 5 × 250) = 20,833 分钟 ≈ 347 小时 ≈ 43 个工作日
>
> 你花 2 小时配置,一年后省下 43 天。这就是自动化的力量——前期投资,终身受益。

---

## 7. 成本意识 — Serverless 的经济学

### 🧰 The Toolbox: 何时 Serverless,何时 Dedicated Server

> **争议**: "Serverless 是未来" vs "Serverless 是陷阱"
>
> 真相: **两者都对,但只在特定场景下**。

### Serverless 的定价模型

以 Vercel 为例(2024 年定价):

```typescript
const vercelPricing = {
  hobby: {
    price: 0,
    limits: {
      bandwidth: '100 GB/月',
      functionInvocations: '100 GB-Hrs',
      edgeFunctionExecutionTime: '500k 请求',
      buildExecutionTime: '6000 分钟/月',
    },
  },
  
  pro: {
    price: 20, // USD/月
    limits: {
      bandwidth: '1 TB/月',
      functionInvocations: '1000 GB-Hrs',
      edgeFunctionExecutionTime: '1M 请求',
      buildExecutionTime: '无限',
    },
    overageCharges: {
      bandwidth: '0.15 USD/GB',
      functionInvocations: '0.60 USD/GB-Hr',
      edgeFunctions: '0.65 USD/1M 请求',
    },
  },
};

// GB-Hr 计算公式
const calculateGBHr = (executionTimeMs: number, memoryMB: number) => {
  const hours = executionTimeMs / 1000 / 3600;
  const gb = memoryMB / 1024;
  return hours * gb;
};

// 示例:一个 API 请求
const exampleRequest = {
  executionTime: 200, // ms
  memory: 1024,       // MB (默认)
  cost: calculateGBHr(200, 1024),
  // = (200/1000/3600) * (1024/1024)
  // = 0.0000555 GB-Hr
};

console.log('单次请求成本:', exampleRequest.cost, 'GB-Hr');
console.log('100 万次请求成本:', exampleRequest.cost * 1_000_000, 'GB-Hr');
// ≈ 55.5 GB-Hr (Pro 计划免费额度是 1000 GB-Hr)
```

### 成本对比: Serverless vs Dedicated Server

**场景 1: 小型项目(每天 1000 次访问)**

```typescript
const smallProject = {
  serverless: {
    platform: 'Vercel Pro',
    cost: 20, // 固定月费
    reasoning: '流量远低于免费额度,只需付基础费用',
  },
  
  dedicatedServer: {
    platform: 'AWS EC2 t3.micro',
    cost: 7.5, // 0.0104 USD/小时 × 24 × 30
    reasoning: '最小实例也足够',
  },
  
  verdict: 'Serverless 更贵,但考虑到 DDoS 防护、CDN、自动扩展、零运维,仍值得',
};
```

**场景 2: 中型项目(每天 100 万次访问)**

```typescript
const mediumProject = {
  traffic: {
    requestsPerDay: 1_000_000,
    requestsPerMonth: 30_000_000,
    avgExecutionTime: 100, // ms
    avgMemory: 1024,       // MB
  },
  
  serverless: {
    platform: 'Vercel Pro',
    calculations: {
      gbHrPerRequest: calculateGBHr(100, 1024),
      // = 0.0000278 GB-Hr
      
      totalGBHr: 0.0000278 * 30_000_000,
      // = 833 GB-Hr
      
      baseCost: 20,
      overageCost: 0, // 低于 1000 GB-Hr 免费额度
      totalCost: 20,
    },
  },
  
  dedicatedServer: {
    platform: 'AWS EC2 c6a.large (2 vCPU, 4GB RAM)',
    cost: 62, // 0.0864 USD/小时 × 24 × 30
    reasoning: '可能需要 2-3 个实例 + 负载均衡器',
    totalCost: 62 * 2 + 20, // 2 实例 + ALB
    // = 144
  },
  
  verdict: 'Serverless 更便宜',
};
```

**场景 3: 大型项目(每天 1 亿次访问)**

```typescript
const largeProject = {
  traffic: {
    requestsPerDay: 100_000_000,
    requestsPerMonth: 3_000_000_000,
    avgExecutionTime: 150, // ms
    avgMemory: 1024,       // MB
  },
  
  serverless: {
    platform: 'Vercel Enterprise',
    calculations: {
      gbHrPerRequest: calculateGBHr(150, 1024),
      // = 0.0000417 GB-Hr
      
      totalGBHr: 0.0000417 * 3_000_000_000,
      // = 125,000 GB-Hr
      
      baseCost: 20,
      overageCost: (125_000 - 1000) * 0.60,
      // = 124,000 * 0.60 = 74,400
      
      totalCost: 20 + 74_400,
      // = 74,420
    },
  },
  
  dedicatedServer: {
    platform: 'AWS EC2 c6a.4xlarge (16 vCPU, 32GB RAM)',
    instances: 10,
    costPerInstance: 496, // 0.6912 USD/小时 × 24 × 30
    loadBalancer: 20,
    totalCost: 496 * 10 + 20,
    // = 4,980
  },
  
  verdict: 'Dedicated Server 便宜 15 倍!',
};
```

### 成本优化策略

**策略 1: 混合架构**

```typescript
// 将高频低复杂度的请求放在 Edge Functions
// middleware.ts
export const config = { matcher: '/api/health' };

export function middleware() {
  // 在 Edge 运行,成本 0.65 USD/1M 请求
  return Response.json({ status: 'ok' });
}

// 将低频高复杂度的请求放在 Serverless Functions
// app/api/process-video/route.ts
export async function POST(request: Request) {
  // 复杂的视频处理逻辑
  // 虽然成本高,但请求量少
  return Response.json({ taskId: '...' });
}

// 将极高频的请求放在 Dedicated Server
// 通过 Vercel 的 Rewrites 代理到自建服务器
// next.config.ts
export default {
  async rewrites() {
    return [
      {
        source: '/api/heavy-traffic/:path*',
        destination: 'https://my-dedicated-server.com/api/:path*',
      },
    ];
  },
};
```

**策略 2: 缓存激进化**

```typescript
// 减少函数调用次数 = 降低成本
// app/api/popular-posts/route.ts
export async function GET() {
  // 缓存 1 小时(3600 秒)
  // 如果每秒 100 次请求,缓存能将 360,000 次函数调用降到 1 次
  const posts = await fetch('https://cms.example.com/posts', {
    next: { revalidate: 3600 },
  });
  
  return Response.json(await posts.json());
}

// 静态生成(构建时渲染,运行时零成本)
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  // 这个页面在构建时生成 HTML,部署后直接从 CDN 返回
  // 1 亿次访问的成本 = 0(只收 CDN 流量费)
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}
```

**策略 3: 监控与预警**

```typescript
// 设置成本预警(Vercel Dashboard)
const costAlert = {
  threshold: 100, // USD
  action: '当月成本超过 100 美元时发送邮件预警',
};

// 在代码中监控成本相关指标
import { sendToAnalytics } from '@vercel/speed-insights';

export async function expensiveOperation() {
  const start = Date.now();
  
  // 执行操作...
  await heavyDatabaseQuery();
  
  const duration = Date.now() - start;
  
  // 如果操作超过 1 秒,记录警告
  if (duration > 1000) {
    console.warn('Expensive operation detected:', {
      duration,
      function: 'expensiveOperation',
      timestamp: new Date().toISOString(),
    });
    
    sendToAnalytics({
      name: 'expensive_operation',
      value: duration,
    });
  }
}
```

> 🧘 **Zen of Code: 成本意识是工程师的成熟标志**
>
> "初级工程师关心'代码能不能跑'。中级工程师关心'代码跑得快不快'。高级工程师关心'代码跑得值不值'。
>
> 成本意识不是吝啬,而是理解**资源是有限的**。你选择的每一个技术,都在消耗某种资源:
> - Serverless 消耗金钱
> - Dedicated Server 消耗运维时间
> - 自建基础设施消耗学习曲线
>
> 没有免费的午餐。但聪明的工程师知道如何优化这个交换比。"

---

## 8. 🧘 Zen of Code — 完成比完美重要

> "Art is never finished, only abandoned." — Leonardo da Vinci
>
> 达芬奇的《蒙娜丽莎》画了 4 年,直到他去世都没有交付给委托人——因为他一直觉得"还差一点就完美了"。
>
> 软件工程的陷阱和艺术一样:永远有下一个可以优化的地方。你可以花一个月优化首屏加载从 1.2 秒到 1.0 秒,但在这一个月里,你的竞争对手已经上线了三个新功能,抢走了你的用户。
>
> **部署是最好的老师**,因为它强迫你面对真实世界的问题:
> - 你的"完美设计"在 200ms 延迟下还好用吗?
> - 你的"优雅架构"在 1000 个并发用户下会崩溃吗?
> - 你的"精美 UI"在 3G 网络下要加载 30 秒?
>
> 这些问题在 localhost 永远不会出现。**只有上线,你才能知道你不知道的东西。**

### 完成主义 vs 完美主义

```typescript
const perfectionist = {
  mindset: '等我优化完所有性能、添加所有功能、修复所有 Bug,再上线',
  timeline: '3 个月后',
  risk: '3 个月后发现方向错了,用户根本不需要这些功能',
  learning: '延迟 3 个月',
};

const completionist = {
  mindset: '先上线一个 MVP,收集真实用户反馈,再迭代优化',
  timeline: '2 周后',
  risk: '可能有 Bug,但能快速修复',
  learning: '立即开始',
};

console.log('Facebook 的座右铭: "Move fast and break things"');
console.log('后来改成了: "Move fast with stable infrastructure"');
console.log('但核心没变: 先动起来,再求完美');
```

### 部署后的迭代循环

```typescript
const deploymentLoop = {
  step1: {
    action: '部署 MVP(最小可行产品)',
    time: '2 周',
  },
  
  step2: {
    action: '收集用户反馈和数据',
    metrics: [
      'Vercel Analytics: 用户在哪个页面停留最久?',
      'Sentry: 哪些功能报错最多?',
      '用户反馈: 哪些功能最常被要求?',
    ],
  },
  
  step3: {
    action: '优先级排序',
    method: 'Impact vs Effort 矩阵',
    decisions: {
      highImpactLowEffort: '立即做',
      highImpactHighEffort: '排期做',
      lowImpactLowEffort: '有空做',
      lowImpactHighEffort: '不做',
    },
  },
  
  step4: {
    action: '发布下一个版本',
    time: '1-2 周后',
  },
  
  repeat: true,
};

console.log('软件不是书(出版后不能修改),软件是花园(需要持续修剪)');
```

---

## 9. 最佳实践与常见陷阱

### ✅ 部署最佳实践

```typescript
// 1. ✅ 使用环境变量,永不硬编码
const goodPractice = {
  database: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
};

// ❌ 永不硬编码
const badPractice = {
  database: 'postgresql://user:pass@localhost:5432/db',
  apiKey: 'sk-abc123...',
};

// 2. ✅ 设置健康检查端点
// app/api/health/route.ts
export const runtime = 'edge';

export async function GET() {
  // 检查关键服务是否正常
  try {
    // 检查数据库(在 Serverless Function 里做,不在 Edge)
    // await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { status: 'error', error: error.message },
      { status: 503 }
    );
  }
}

// 3. ✅ 添加错误边界
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <button
          onClick={reset}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// 4. ✅ 实现优雅降级
export async function getRecommendations() {
  try {
    // 尝试调用 AI 推荐服务
    const response = await fetch('https://ai.example.com/recommend', {
      signal: AbortSignal.timeout(2000), // 2 秒超时
    });
    return await response.json();
  } catch (error) {
    // AI 服务挂了,返回静态推荐
    console.warn('AI service failed, using fallback');
    return getStaticRecommendations();
  }
}

// 5. ✅ 使用 robots.txt 和 sitemap.xml
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: 'https://myapp.com/sitemap.xml',
  };
}

// app/sitemap.ts
export default async function sitemap() {
  const posts = await getPosts();
  
  return [
    {
      url: 'https://myapp.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map(post => ({
      url: `https://myapp.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}
```

### ☠️ 常见陷阱

**陷阱 1: 忘记设置环境变量**

```typescript
// 症状: 本地运行正常,部署后 500 错误
// 原因: Vercel 没有 DATABASE_URL 环境变量

// 解决方案: 部署前检查清单
const preDeploymentChecklist = [
  '✅ 所有环境变量都在 Vercel Dashboard 设置了吗?',
  '✅ .env.example 文件包含所有必需的变量吗?',
  '✅ 生产数据库的连接字符串正确吗?',
  '✅ NEXTAUTH_URL 设置为生产域名了吗?',
];
```

**陷阱 2: 数据库连接池耗尽**

```typescript
// ❌ 每次请求创建新的 Prisma Client
export async function GET() {
  const prisma = new PrismaClient(); // 错误!
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// 问题: Serverless 函数可能同时运行 100 个实例
//       每个实例创建一个数据库连接
//       → 100 个连接同时打开
//       → 数据库连接池(默认 10-20)耗尽
//       → 错误: "Too many connections"

// ✅ 复用 Prisma Client
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 使用
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}
```

**陷阱 3: 冷启动导致超时**

```typescript
// 症状: 第一次访问很慢(5 秒+),后续正常
// 原因: Serverless 函数冷启动

// 解决方案 1: 使用 Edge Functions(冷启动 <5ms)
export const runtime = 'edge';

// 解决方案 2: 设置 Cron 预热
// vercel.json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"  // 每 5 分钟访问一次,保持温暖
    }
  ]
}

// 解决方案 3: 优化初始化逻辑
// ❌ 在模块顶层做复杂初始化
const heavyData = loadMassiveJSON(); // 每次冷启动都要执行

export async function GET() {
  return Response.json(heavyData);
}

// ✅ 延迟初始化
let cachedData: any;

export async function GET() {
  if (!cachedData) {
    cachedData = await loadMassiveJSON();
  }
  return Response.json(cachedData);
}
```

**陷阱 4: 忘记添加 .gitignore**

```bash
# ❌ 如果没有 .gitignore,可能会提交:
.env              # 敏感信息泄露!
node_modules/     # 100MB+ 的依赖包
.next/            # 构建产物(不需要版本控制)

# ✅ 确保 .gitignore 包含:
.env*.local
.env
node_modules
.next
out
.vercel
*.log
.DS_Store
```

**陷阱 5: CORS 错误**

```typescript
// 症状: 前端调用 API 时浏览器报错
//       "Access to fetch at '...' has been blocked by CORS policy"

// 原因: API 没有设置 CORS 头

// ✅ 解决方案
// app/api/data/route.ts
export async function GET(request: Request) {
  const data = { message: 'Hello' };
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      // 允许所有域名访问(开发环境)
      'Access-Control-Allow-Origin': '*',
      // 生产环境应该指定具体域名
      // 'Access-Control-Allow-Origin': 'https://myapp.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 处理 OPTIONS 预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

## 10. 章节练习

### 练习 1: 部署你的第一个应用

**任务**: 将一个 Next.js 应用部署到 Vercel,并验证基本功能。

<details>
<summary>点击查看详细步骤</summary>

```bash
# 1. 创建一个新的 Next.js 项目
npx create-next-app@latest my-deployment-app --typescript --tailwind --app
cd my-deployment-app

# 2. 添加一个 API 路由
# app/api/hello/route.ts
export async function GET() {
  return Response.json({
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString(),
  });
}

# 3. 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 4. 推送到 GitHub
# (先在 GitHub 创建一个新仓库)
git remote add origin https://github.com/你的用户名/my-deployment-app.git
git branch -M main
git push -u origin main

# 5. 登录 Vercel 并导入项目
# https://vercel.com/new

# 6. 测试部署的应用
# 访问 https://你的项目名.vercel.app/api/hello
```

**验证清单**:
- [ ] 主页能正常访问
- [ ] API 路由返回正确的 JSON
- [ ] HTTPS 自动配置(地址栏有锁图标)
- [ ] 访问速度快(< 2 秒)

</details>

---

### 练习 2: 配置环境变量

**任务**: 为你的应用配置开发、预览和生产三种环境的环境变量。

<details>
<summary>点击查看解决方案</summary>

```bash
# 1. 创建 .env.example(提交到 Git)
cat > .env.example << 'EOF'
# 数据库连接
DATABASE_URL=postgresql://...

# 认证密钥
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# 公开的 API 端点
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# 2. 创建 .env.local(本地开发,不提交)
cp .env.example .env.local
# 编辑 .env.local,填入真实的本地开发值

# 3. 在 Vercel 设置环境变量
vercel env add DATABASE_URL production
# 粘贴生产数据库 URL

vercel env add DATABASE_URL preview
# 粘贴测试数据库 URL

vercel env add NEXTAUTH_SECRET production
# 粘贴生产密钥(至少 32 字符)

vercel env add NEXTAUTH_URL production
# 输入: https://你的域名.com

# 4. 在代码中使用
# app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    // 服务端变量(不会暴露给客户端)
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasAuthSecret: !!process.env.NEXTAUTH_SECRET,
    
    // 客户端变量(会暴露)
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  });
}

# 5. 测试
# 本地: http://localhost:3000/api/test-env
# 生产: https://你的域名.vercel.app/api/test-env
```

**预期结果**:
```json
{
  "hasDatabaseUrl": true,
  "hasAuthSecret": true,
  "apiUrl": "https://你的域名.com/api"
}
```

</details>

---

### 练习 3: 配置 GitHub Actions

**任务**: 为你的项目添加 CI,在每次推送时自动运行 Lint 和 Type Check。

<details>
<summary>点击查看解决方案</summary>

```yaml
# 1. 创建 .github/workflows/ci.yml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: ['main']

jobs:
  lint-and-typecheck:
    name: Lint and Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run TypeScript Check
        run: npx tsc --noEmit
      
      - name: Build
        run: npm run build

# 2. 确保 package.json 有 lint 脚本
# package.json
{
  "scripts": {
    "lint": "next lint",
    "build": "next build"
  }
}

# 3. 提交并推送
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
git push

# 4. 查看结果
# GitHub 仓库 → Actions → 应该看到正在运行的 workflow
```

**预期结果**:
- 推送后,GitHub Actions 自动触发
- 所有检查通过,显示绿色 ✓
- 如果有 Lint 错误或类型错误,CI 会失败并显示具体错误

</details>

---

### 练习 4: 监控与错误追踪

**任务**: 集成 Sentry 并故意触发一个错误,验证错误报告。

<details>
<summary>点击查看解决方案</summary>

```bash
# 1. 安装 Sentry
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# 2. 配置 Sentry
# 向导会要求你:
# - 登录 Sentry 账号(或创建新账号)
# - 选择项目
# - 自动生成配置文件

# 3. 创建一个会报错的 API
# app/api/trigger-error/route.ts
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // 故意抛出错误
    throw new Error('这是一个测试错误');
  } catch (error) {
    // 捕获并发送到 Sentry
    Sentry.captureException(error, {
      tags: { test: 'true' },
      extra: { info: '这是练习 4 的测试错误' },
    });
    
    return Response.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

# 4. 部署到 Vercel
git add .
git commit -m "feat: add Sentry integration"
git push

# 5. 触发错误
# 访问: https://你的域名.vercel.app/api/trigger-error

# 6. 查看 Sentry Dashboard
# https://sentry.io → 你的项目
# 应该能看到刚才的错误报告
```

**验证清单**:
- [ ] Sentry 中能看到错误
- [ ] 错误堆栈追踪显示正确的文件名和行号
- [ ] Tags 和 Extra 信息正确显示

</details>

---

### 练习 5: 成本优化

**任务**: 分析你的应用的成本,并优化最昂贵的部分。

<details>
<summary>点击查看解决方案</summary>

```typescript
// 1. 启用 Vercel Analytics
// Vercel Dashboard → 项目 → Analytics → Enable

// 2. 分析函数执行时间
// app/api/expensive/route.ts
export async function GET() {
  const start = Date.now();
  
  // 模拟耗时操作
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const duration = Date.now() - start;
  
  console.log('Function execution time:', duration, 'ms');
  
  return Response.json({ duration });
}

// 3. 优化:转为 Edge Function
// app/api/fast/route.ts
export const runtime = 'edge'; // 关键!

export async function GET() {
  const start = Date.now();
  
  // Edge 没有 setTimeout,用 fetch 模拟延迟
  const data = await fetch('https://api.example.com/data');
  
  const duration = Date.now() - start;
  
  return Response.json({ duration });
}

// 4. 比较成本
const costComparison = {
  serverlessFunction: {
    executionTime: 3000, // ms
    memory: 1024,        // MB
    requests: 1_000_000, // 每月
    
    gbHr: (3000 / 1000 / 3600) * (1024 / 1024) * 1_000_000,
    // = 833 GB-Hr
    
    cost: 0, // 低于 Vercel Pro 的 1000 GB-Hr 免费额度
  },
  
  edgeFunction: {
    executionTime: 50,   // ms (快 60 倍!)
    requests: 1_000_000,
    
    cost: (1_000_000 / 1_000_000) * 0.65,
    // = 0.65 USD
  },
  
  savings: 'Edge Function 更快且更便宜',
};

console.log('优化建议:', costComparison.savings);
```

**优化清单**:
- [ ] 将简单 API 迁移到 Edge Functions
- [ ] 为静态内容添加缓存头
- [ ] 使用 ISR(Incremental Static Regeneration)而不是 SSR
- [ ] 优化数据库查询(添加索引)

</details>

---

## 总结与下一步

### 你已经学会了

1. **从构建到上线的完整流程** — `npm run build` → Vercel 部署 → 全球 CDN
2. **环境管理** — 开发/预览/生产环境隔离,密钥安全管理
3. **边缘计算** — Edge Functions 的原理与适用场景
4. **可观测性** — Metrics, Logs, Traces 三大支柱,Sentry 错误追踪
5. **自动化** — GitHub Actions CI/CD,从手动到自动的演进
6. **成本意识** — Serverless vs Dedicated Server 的权衡,优化策略

### 连接到 Stage 4

在 **Stage 4: 生产级应用开发** 中,你会深入学习:

- **可靠性工程 (SRE)** — 这章提到的监控和可观测性,在 Stage 4 会扩展为 SLI/SLO/SLA 体系
- **安全** — 这章的环境变量管理是第一道防线,Stage 4 会讲授 XSS/CSRF/SQL 注入等攻击与防御
- **性能优化** — 这章的 Core Web Vitals 是入门,Stage 4 会深入到渲染管线、缓存策略、CDN 架构
- **数据库** — 这章的 Prisma 是工具,Stage 4 会讲授关系模型、索引原理、查询优化

### 连接到 TeamPulse 项目

在 **TeamPulse 项目** 中,你会应用本章所学:

- 将 TeamPulse 部署到 Vercel
- 配置生产数据库(PostgreSQL on Neon/Supabase)
- 设置 GitHub Actions 自动测试和部署
- 集成 Sentry 追踪生产环境错误
- 监控应用性能和用户行为

### 最后的哲学

> 🌌 **The Big Picture: 从 localhost 到全世界**
>
> 当你在 `localhost:3000` 上敲下第一行代码时,你的应用只存在于你的电脑里——一个封闭的宇宙。
>
> 当你执行 `git push` 并完成部署后,你的应用穿越了网络边界,分布在全球 300+ 个边缘节点上,触及数十亿潜在用户。
>
> **这就是部署的魔法** — 它把你的想法从私有空间投射到公共空间,从可能性变成现实。
>
> localhost 是实验室,生产环境是战场。实验室里的成功不算数,战场上的存活才是真本事。
>
> **Real artists ship.** — 现在,轮到你了。

---

**下一章**: [实战项目: TeamPulse 团队仪表盘](../projects/dashboard-app/README.md)

**返回**: [Stage: Modern Frontend 目录](../README.md)
