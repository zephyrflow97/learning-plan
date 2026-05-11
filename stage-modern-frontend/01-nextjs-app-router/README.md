# Next.js App Router — 历史的螺旋与 Meta-Framework 的觉醒

> *"History doesn't repeat itself, but it often rhymes."* — Mark Twain
>
> 在 Web 的历史中,有一个令人啼笑皆非的螺旋:我们从 PHP 的服务端渲染开始,逃向了 SPA 的客户端渲染,现在又被 Next.js 带回了服务端渲染。我们是在原地踏步吗?不。我们是在螺旋上升——每一次"回归"都带着前一个时代的教训和新时代的武器。2013 年,React 告诉我们 UI = f(State)。2016 年,Next.js 问了一个更深刻的问题:这个函数应该在哪里执行?2023 年,App Router 给出了最激进的答案:让编译器替你决定。

---

> 💻 **代码示例**: 本章所有超过 30 行的代码已提取到 [`examples/`](./examples/) 目录,包含详细注释、日志和使用说明。  
> 📚 **快速导航**: [Server Components](./examples/server-components/) | [Server Actions](./examples/server-actions/) | [中间件](./examples/middleware/) | [流式渲染](./examples/streaming/)

---

## 📖 本章内容

1. **为什么需要 Meta-Framework** — 从 Create React App 到 Next.js 的演进动因
2. **App Router 核心概念** — 文件系统路由、Layouts、Templates、Loading/Error UI
3. **Server Components vs Client Components** — "代码运行在哪里"的哲学
4. **数据获取模式** — Server Component 直接 fetch、`cache()`、revalidation 策略
5. **Server Actions** — 表单提交的新范式(回到 PHP 的螺旋?)
6. **中间件** — 请求拦截、重定向、认证检查
7. **路由高级** — 路由组、平行路由、拦截路由
8. **流式渲染与 Suspense** — 渐进式加载的艺术
9. **🧘 Zen of Code** — 关注点分离的再定义
10. **最佳实践与常见陷阱**
11. **章节练习**

**前置知识**: Stage 2 React Basics, Stage 2 TypeScript
**学习时间**: 5-6 天
**关键术语**: RSC (React Server Components), SSR, SSG, ISR, Hydration

---

## 1. 为什么需要 Meta-Framework — Create React App 的困境

### 🎭 The Drama: 从自由到困境

> **2016 年的承诺**: "Create React App (CRA) 解放了 React 开发者——零配置,开箱即用。你只需要专注于业务逻辑。"
>
> **2020 年的现实**: 你的 React 应用已经 3 个月上线了。用户抱怨首屏加载需要 5 秒,Google 爬虫抓不到你的内容(SEO 为 0),你开始尝试配置 Webpack 的代码分割,阅读了 50 页 Babel 文档,然后你开始怀疑:这真的还是"零配置"吗?

Create React App 的核心理念是**隐藏复杂度**。它把 Webpack、Babel、ESLint 都配置好了,给你一个简洁的起点。但它有三个致命的假设:

1. **你的应用是纯客户端渲染 (CSR)** — 所有代码打包成 JS,浏览器下载后执行渲染
2. **你不需要服务端能力** — 没有 SSR (服务端渲染),没有 API Routes,没有中间件
3. **你能自己解决生产环境问题** — 路由、数据获取、SEO、性能优化,都是你的事

这三个假设在 2016 年还算合理。但到了 2020 年,Web 应用的复杂度已经远远超越了这些假设:

**❌ 问题 1: 首屏性能灾难**

```typescript
// CRA 的典型加载流程
// 1. 浏览器请求 index.html (2KB)
// 2. HTML 里几乎是空的,只有一个 <div id="root"></div>
// 3. 浏览器下载 bundle.js (500KB+ gzipped)
// 4. 执行 JS,React 渲染 DOM
// 5. 用户终于看到内容 (总耗时: 3-8秒)

console.log('用户在前 3 秒看到的是空白屏幕或 Loading...');
```

**❌ 问题 2: SEO 黑洞**

```html
<!-- Google 爬虫看到的 HTML (CRA) -->
<!DOCTYPE html>
<html>
<head><title>My App</title></head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>

<!-- 爬虫:内容在哪?我只看到一个空 div。 -->
```

**❌ 问题 3: 配置地狱**

当你需要自定义 Webpack 配置时,CRA 提供了 `eject` 命令——这是一个**单向的不可逆操作**。一旦执行,你会得到 100+ 个配置文件。从此再也回不到"零配置"的天堂。

> 🌌 **The Big Picture: Meta-Framework 的崛起**
>
> Meta-Framework 不是替代 React,而是**替代 CRA 的角色**。它们说:"我们不仅配置好构建工具,我们还为你解决路由、数据获取、渲染策略、部署优化——所有生产环境的真实问题。" Next.js 是 React 生态最成功的 Meta-Framework。类似的还有 Vue 的 Nuxt、Svelte 的 SvelteKit、Solid 的 SolidStart。

### Next.js 解决的核心问题

| 问题 | CRA 方案 | Next.js 方案 |
|------|---------|-------------|
| **首屏性能** | 客户端渲染,用户等待 JS 下载+执行 | SSR/SSG,服务器直接返回 HTML,用户立刻看到内容 |
| **SEO** | 爬虫看到空 HTML | 爬虫看到完整内容 |
| **路由** | 手动安装 `react-router-dom`,手动配置 | 文件系统路由,零配置 |
| **数据获取** | `useEffect` + `fetch`,手动处理加载/错误 | `getServerSideProps` / Server Component 直接 `await`,自动处理 |
| **代码分割** | 手动配置 `React.lazy` | 自动按路由分割,按需加载 |
| **API Routes** | 需要单独的后端服务器 | 内建 API Routes,同一个项目 |
| **部署** | 需要配置 Nginx/CDN | Vercel 一键部署,自动优化 |

> ⚛️ **The Physics: 从库到框架的相变**
>
> React 是一个**库** (Library)——它只负责 UI 渲染,其他的都是你的事。Next.js 是一个**框架** (Framework)——它定义了整个应用的结构,你在它的规则内写代码。这就像水的相变:
> - **库**是液态水,你可以倒进任何容器(自由度高,但需要容器)
> - **框架**是冰块,已经有固定形状(约束多,但自带结构)
>
> 自由度和生产力是此消彼长的——React 给你自由,Next.js 给你速度。

---

## 2. App Router 核心概念 — 文件系统即路由

### 🎭 The Drama: 路由配置的三个时代

**第一代 (React Router v5, 2019)**:

```typescript
// 你需要手动维护一个路由配置文件
import { BrowserRouter, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/about" component={About} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/dashboard" component={Dashboard} />
        {/* 每加一个页面,这里就多一行配置 */}
      </Switch>
    </BrowserRouter>
  );
}
```

**第二代 (Next.js Pages Router, 2016-2022)**:

```
pages/
  index.tsx          → /
  about.tsx          → /about
  blog/[slug].tsx    → /blog/:slug
  dashboard.tsx      → /dashboard
```

文件路径 = URL 路径。这是 **Convention over Configuration** (约定优于配置) 的胜利。

**第三代 (Next.js App Router, 2023)**:

```
app/
  page.tsx                    → /
  about/page.tsx              → /about
  blog/[slug]/page.tsx        → /blog/:slug
  dashboard/
    layout.tsx                (共享布局)
    page.tsx                  → /dashboard
    settings/page.tsx         → /dashboard/settings
```

不仅文件路径是路由,连**布局 (Layout)** 都是文件系统的一部分。

### 文件系统路由的核心约定

#### 2.1 特殊文件名

| 文件名 | 作用 | 必需? |
|--------|------|-------|
| `page.tsx` | 定义路由的 UI,**这个路由才可访问** | ✅ |
| `layout.tsx` | 共享布局,包裹子路由 | ❌ (但根目录必需) |
| `loading.tsx` | 加载状态 UI (自动包裹在 `<Suspense>` 中) | ❌ |
| `error.tsx` | 错误边界 UI | ❌ |
| `not-found.tsx` | 404 页面 | ❌ |
| `template.tsx` | 类似 Layout,但每次导航都重新挂载 | ❌ |
| `route.ts` | API 路由 (不能与 `page.tsx` 共存) | ❌ |

#### 2.2 动态路由

```
app/
  blog/
    [slug]/
      page.tsx          → /blog/hello-world
                        → /blog/nextjs-guide
```

```typescript
// app/blog/[slug]/page.tsx
type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function BlogPost({ params, searchParams }: Props) {
  console.log('当前文章 slug:', params.slug);
  console.log('URL 参数:', searchParams);
  // 访问 /blog/hello?ref=twitter
  // → params: { slug: 'hello' }
  // → searchParams: { ref: 'twitter' }

  return <h1>文章: {params.slug}</h1>;
}
```

**✅ Catch-all 路由**:

```
app/
  docs/
    [...slug]/
      page.tsx          → /docs/a
                        → /docs/a/b
                        → /docs/a/b/c
```

```typescript
// params.slug 是一个数组
// /docs/a/b/c → { slug: ['a', 'b', 'c'] }
export default function Docs({ params }: { params: { slug: string[] } }) {
  const path = params.slug.join('/');
  console.log('文档路径:', path);
  return <h1>Docs: {path}</h1>;
}
```

### 2.3 Layouts — 布局的嵌套魔法

> 🌌 **The Big Picture: 俄罗斯套娃模型**
>
> App Router 的布局系统是嵌套的。每一层目录都可以有自己的 `layout.tsx`,它会包裹这个目录及其所有子目录的页面。这就像俄罗斯套娃——每打开一个娃娃,里面还有一个。

```
app/
  layout.tsx              (根布局,所有页面共享)
  page.tsx                (首页)
  dashboard/
    layout.tsx            (Dashboard 专属布局)
    page.tsx              → /dashboard
    settings/
      page.tsx            → /dashboard/settings
```

```typescript
// app/layout.tsx (根布局 - 所有页面共享)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('根布局渲染 - 只在应用启动时渲染一次');
  return (
    <html lang="zh-CN">
      <body>
        <header>全局导航栏</header>
        {children} {/* 这里插入子路由的内容 */}
        <footer>全局页脚</footer>
      </body>
    </html>
  );
}
```

```typescript
// app/dashboard/layout.tsx (Dashboard 专属布局)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('Dashboard 布局渲染');
  return (
    <div className="dashboard-container">
      <aside>侧边栏 (所有 Dashboard 页面共享)</aside>
      <main>{children}</main>
    </div>
  );
}
```

**渲染嵌套流程** (访问 `/dashboard/settings`):

```
<RootLayout>
  <header>全局导航栏</header>
  <DashboardLayout>
    <aside>侧边栏</aside>
    <main>
      <SettingsPage />  ← app/dashboard/settings/page.tsx
    </main>
  </DashboardLayout>
  <footer>全局页脚</footer>
</RootLayout>
```

**❌ 常见错误**:

```typescript
// ❌ 错误:Layout 里不能使用 usePathname 来决定是否渲染
'use client'; // 这会让整个 Layout 变成 Client Component!
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();
  if (pathname === '/special') {
    return <SpecialLayout>{children}</SpecialLayout>;
  }
  return <NormalLayout>{children}</NormalLayout>;
}
```

**✅ 正确做法**: 使用**路由组** (Route Groups):

```
app/
  (marketing)/
    layout.tsx          (营销页面专属布局)
    page.tsx            → /
    about/page.tsx      → /about
  (app)/
    layout.tsx          (应用页面专属布局)
    dashboard/page.tsx  → /dashboard
```

`(marketing)` 和 `(app)` 的括号表示这是**路由组**——它们**不会出现在 URL 里**,只是为了组织文件和共享布局。

### 2.4 Loading UI — 优雅的加载状态

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  console.log('显示 Loading 骨架屏');
  return (
    <div className="skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-content"></div>
    </div>
  );
}
```

Next.js 会自动把 `page.tsx` 包裹在 `<Suspense>` 中,`loading.tsx` 就是 `fallback`:

```typescript
// Next.js 自动生成的结构
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

**✅ 粒度控制**: 你可以在任何层级放置 `loading.tsx`:

```
app/
  dashboard/
    loading.tsx         (整个 Dashboard 的 Loading)
    analytics/
      loading.tsx       (只有 Analytics 页面的 Loading)
      page.tsx
```

### 2.5 Error Boundaries — 错误处理

```typescript
// app/dashboard/error.tsx
'use client'; // Error 组件必须是 Client Component

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 错误上报到监控系统 (如 Sentry)
    console.error('捕获到错误:', error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>出错了!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

**✅ 错误边界的作用域**:

```
app/
  layout.tsx
  error.tsx              ← 捕获所有子路由的错误
  dashboard/
    error.tsx            ← 只捕获 Dashboard 子路由的错误
    page.tsx
```

**❌ 注意**: `error.tsx` **不能捕获同级 `layout.tsx` 的错误**。要捕获根 Layout 的错误,需要用 `app/global-error.tsx`。

> 🧠 **CS Master's Bridge: React Error Boundaries 的实现原理**
>
> Error Boundary 是 React 16 引入的特性。它本质上是一个 Class Component,实现了 `componentDidCatch` 或 `static getDerivedStateFromError`。当子组件抛出错误时,React 会向上冒泡,直到遇到第一个 Error Boundary。
>
> Next.js 的 `error.tsx` 是对这个机制的封装——它自动生成一个 Error Boundary 包裹 `page.tsx`。

---

## 3. Server Components vs Client Components — "代码运行在哪里"的哲学

### 🎭 The Drama: 餐厅隐喻

> **Next.js 是一座餐厅。**
>
> - **Server Components (服务器组件)** 是**后厨**——顾客(浏览器)永远看不到厨师在做什么,只收到做好的菜(HTML)。后厨可以直接访问仓库(数据库),可以用昂贵的食材(大型 npm 包),顾客不需要为这些买单(不增加客户端 JS 体积)。
>
> - **Client Components (客户端组件)** 是**前厅**——顾客看得见,能互动(点击、输入、动画)。但前厅的每一件家具(组件代码)都需要运到顾客那里(下载 JS),所以前厅要精简。
>
> - **Server Actions** 是**点餐单**——顾客填好需求(表单数据),送到后厨处理(服务器执行)。
>
> - `layout.tsx` 是餐厅的装修——不会因为换菜(页面导航)就重新装修(Layout 不重新渲染)。

### 3.1 React Server Components (RSC) 的革命性

在传统 React 中,所有组件都运行在**浏览器**。即使数据来自服务器,组件的代码本身也要下载到客户端执行:

```typescript
// 传统 React (所有代码都在客户端运行)
function BlogPost({ id }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(setPost);
  }, [id]);

  if (!post) return <div>Loading...</div>;
  return <h1>{post.title}</h1>;
}

// 问题:
// 1. 用户下载了这个组件的 JS 代码
// 2. 执行 useEffect,发起网络请求
// 3. 等待数据返回,期间显示 Loading
// 4. 数据返回后重新渲染
```

**React Server Components (RSC)** 说:如果这个组件不需要交互,**为什么要在客户端运行?**

```typescript
// Next.js App Router - Server Component (默认)
async function BlogPost({ id }: { id: string }) {
  // 这段代码在服务器执行!
  const post = await db.post.findUnique({ where: { id } });
  console.log('这条日志出现在服务器终端,不是浏览器控制台');

  return <h1>{post.title}</h1>;
}

// 优势:
// 1. 组件代码不发送到客户端 (减少 JS 体积)
// 2. 可以直接访问数据库 (db.post.findUnique)
// 3. 没有 Loading 状态 (服务器等数据准备好再返回 HTML)
// 4. 可以使用任意大的 npm 包,不影响客户端性能
```

### 3.2 Server Component vs Client Component 对比

| 特性 | Server Component | Client Component |
|------|-----------------|------------------|
| **运行位置** | 服务器 | 浏览器 |
| **标记方式** | 默认,无需标记 | 文件顶部 `'use client'` |
| **能否使用 Hooks** | ❌ 不能 (`useState`, `useEffect` 等) | ✅ 可以 |
| **能否访问浏览器 API** | ❌ 不能 (`window`, `document`, `localStorage`) | ✅ 可以 |
| **能否直接访问数据库** | ✅ 可以 | ❌ 不能 (需要通过 API) |
| **能否 `async`** | ✅ 可以 `async function Component()` | ❌ 不能 (组件本身不能 async) |
| **能否监听事件** | ❌ 不能 (`onClick`, `onChange`) | ✅ 可以 |
| **导入第三方包** | ✅ 不计入客户端 JS 体积 | ❌ 会增加客户端 JS 体积 |

**✅ Server Component 示例** (默认):

```typescript
// app/dashboard/page.tsx
import { db } from '@/lib/db'; // Prisma 客户端
import { formatDate } from 'date-fns'; // 大型日期库,不发送到客户端!

export default async function DashboardPage() {
  // ✅ 可以直接查询数据库
  const users = await db.user.findMany({ take: 10 });

  console.log('这条日志在服务器终端显示');

  return (
    <div>
      <h1>用户列表</h1>
      {users.map(user => (
        <div key={user.id}>
          <p>{user.name}</p>
          <p>{formatDate(user.createdAt, 'yyyy-MM-dd')}</p>
        </div>
      ))}
    </div>
  );
}
```

**✅ Client Component 示例**:

```typescript
// app/components/counter.tsx
'use client'; // 👈 必须声明

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  console.log('这条日志在浏览器控制台显示');

  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}
```

### 3.3 Server 和 Client 的边界规则

> 🌌 **The Big Picture: 边界难题**
>
> 在 Server Component 和 Client Component 之间划线,就像在餐厅里划分"后厨"和"前厅"的边界。如果你把所有东西都放前厅(`'use client'` 满天飞),你的厨房就空了,JS 包就爆了。如果你把所有东西都放后厨,顾客就没法交互了。这就是架构师的艺术——**在正确的位置划界**。

**规则 1: Server Component 可以导入 Client Component**

```typescript
// app/page.tsx (Server Component)
import { Counter } from './components/counter'; // Client Component

export default async function Page() {
  const data = await fetchData(); // 服务器逻辑

  return (
    <div>
      <h1>{data.title}</h1>
      <Counter /> {/* ✅ 可以使用 Client Component */}
    </div>
  );
}
```

**规则 2: Client Component 不能导入 Server Component**

```typescript
// ❌ 错误示例
'use client';

import { ServerComponent } from './server-component'; // 这是 Server Component

export function ClientComponent() {
  return <ServerComponent />; // ❌ 运行时错误!
}
```

**✅ 正确做法**: 通过 `children` 传递

```typescript
// app/components/client-wrapper.tsx
'use client';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <div className="fancy-animation">{children}</div>;
}

// app/page.tsx (Server Component)
import { ClientWrapper } from './components/client-wrapper';
import { ServerComponent } from './components/server-component';

export default function Page() {
  return (
    <ClientWrapper>
      {/* ✅ Server Component 作为 children 传入 */}
      <ServerComponent />
    </ClientWrapper>
  );
}
```

**规则 3: 一旦标记 `'use client'`,整个文件及其依赖都变成 Client**

```typescript
// button.tsx
'use client';
import { someUtil } from './utils'; // utils.ts 也会打包到客户端!

export function Button() {
  return <button>Click</button>;
}
```

**✅ 优化策略**: 尽量延迟 `'use client'` 边界

```typescript
// ❌ 整个页面变成 Client Component
'use client';

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h1>静态标题</h1>
      <p>静态内容</p>
      <button onClick={() => setIsOpen(!isOpen)}>切换</button>
    </div>
  );
}

// ✅ 只有交互部分是 Client Component
// app/page.tsx (Server Component)
import { ToggleButton } from './toggle-button';

export default function Page() {
  return (
    <div>
      <h1>静态标题</h1>
      <p>静态内容</p>
      <ToggleButton /> {/* 只有这个按钮是 Client */}
    </div>
  );
}

// app/toggle-button.tsx
'use client';
import { useState } from 'react';

export function ToggleButton() {
  const [isOpen, setIsOpen] = useState(false);
  return <button onClick={() => setIsOpen(!isOpen)}>切换</button>;
}
```

> ⚛️ **The Physics: Hydration — 从干尸到活人的魔法**
>
> Server Component 返回的 HTML 是"静态的"——就像一具干尸,有形状但没有生命。Client Component 的 JS 下载后,React 会执行 **Hydration (水合)**——给 HTML "注入灵魂",绑定事件监听器、建立 Virtual DOM 映射。
>
> ```
> 服务器: <button>Click</button>  (静态 HTML,点击无效)
>          ↓ (下载 JS)
>          ↓ (Hydration)
> 浏览器: <button onClick={...}>Click</button>  (可交互)
> ```
>
> **Hydration Mismatch** 是常见的错误——服务器渲染的 HTML 和客户端 Hydration 时生成的 HTML 不一致。例如:
>
> ```typescript
> // ❌ 会导致 Hydration Mismatch
> export default function Time() {
>   return <p>当前时间: {new Date().toLocaleString()}</p>;
>   // 服务器渲染时的时间 ≠ 客户端 Hydration 时的时间
> }
> ```

---

## 4. 数据获取模式 — Server Component 的超能力

### 🎭 The Drama: 从 useEffect 地狱到 async/await 天堂

**旧世界 (Client-Side Fetching)**:

> 📄 **完整代码**: [`examples/client-components/OldClientFetching.tsx`](./examples/client-components/OldClientFetching.tsx)

```typescript
'use client';
import { useState, useEffect } from 'react';

function BlogPost({ id }: { id: string }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(setPost)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <h1>{post.title}</h1>;
}

// 问题:
// 1. 20+ 行样板代码 (loading, error, useEffect)
// 2. 客户端发起请求,增加延迟
// 3. 需要额外的 /api/posts/[id] API Route
```

**新世界 (Server Component Fetching)**:

> 📄 **完整代码**: [`examples/server-components/ServerFetching.tsx`](./examples/server-components/ServerFetching.tsx)

```typescript
// app/blog/[id]/page.tsx
import { db } from '@/lib/db';

export default async function BlogPost({ params }: { params: { id: string } }) {
  console.log('服务器查询数据:', params.id);
  const post = await db.post.findUnique({ where: { id: params.id } });

  if (!post) throw new Error('文章不存在');
  return <h1>{post.title}</h1>;
}

// 优势:
// 1. 3 行核心代码,零样板 ✅
// 2. 服务器直接查询数据库,最快速度 ✅
// 3. 不需要额外的 API Route ✅
```

### 4.1 直接 fetch — 自动缓存与重复数据消除

Next.js 扩展了原生 `fetch`,增加了自动缓存和请求去重:

```typescript
// app/products/[id]/page.tsx
async function getProduct(id: string) {
  console.log('Fetching product:', id);
  const res = await fetch(`https://api.example.com/products/${id}`, {
    // Next.js 扩展的选项
    next: {
      revalidate: 60, // 缓存 60 秒
      tags: ['product'], // 缓存标签,用于按需清除
    },
  });

  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  const relatedProducts = await getRelatedProducts(product.category);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
```

**自动去重**: 如果同一个请求在组件树中被多次调用,Next.js 只会发起一次网络请求:

```typescript
async function getUser(id: string) {
  console.log('Fetching user:', id); // 只打印一次!
  return fetch(`/api/users/${id}`).then(r => r.json());
}

async function Header() {
  const user = await getUser('123'); // 第一次调用
  return <div>{user.name}</div>;
}

async function Sidebar() {
  const user = await getUser('123'); // 重复调用,使用缓存结果
  return <div>{user.avatar}</div>;
}

export default function Page() {
  return (
    <>
      <Header />
      <Sidebar />
    </>
  );
}

// 实际只发起 1 次网络请求,Header 和 Sidebar 共享结果
```

### 4.2 `cache()` — 自定义函数的请求去重

对于数据库查询或非 `fetch` 的异步函数,使用 React 的 `cache()`:

```typescript
import { cache } from 'react';
import { db } from '@/lib/db';

// ✅ 包裹在 cache() 中,同一请求期间只执行一次
export const getUser = cache(async (id: string) => {
  console.log('数据库查询:', id); // 只打印一次
  return db.user.findUnique({ where: { id } });
});

// app/dashboard/page.tsx
async function UserHeader() {
  const user = await getUser('123'); // 第一次调用
  return <header>{user.name}</header>;
}

async function UserProfile() {
  const user = await getUser('123'); // 重复调用,返回缓存结果
  return <div>{user.bio}</div>;
}

export default function Dashboard() {
  return (
    <>
      <UserHeader />
      <UserProfile />
    </>
  );
}

// 数据库查询只执行一次!
```

> 🧠 **CS Master's Bridge: `cache()` 的实现原理**
>
> `cache()` 使用 **React 的请求上下文 (Request Memoization)** 实现。它为每个请求创建一个隔离的缓存空间——同一个用户请求期间,相同参数的函数调用返回相同结果;但不同用户的请求之间是隔离的。
>
> 这避免了传统服务端缓存的两个问题:
> 1. **无需担心缓存失效** (请求结束,缓存自动清除)
> 2. **无需担心多用户数据混淆** (每个请求独立缓存)

### 4.3 Revalidation — 缓存更新策略

#### 时间基础重新验证 (Time-based Revalidation)

```typescript
// 每 60 秒重新获取数据
fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
});

// 或者在路由段级别设置
// app/blog/page.tsx
export const revalidate = 3600; // 1 小时

export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  return <PostList posts={posts} />;
}
```

#### 按需重新验证 (On-Demand Revalidation)

```typescript
// app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  // 验证密钥 (防止未授权的缓存清除)
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }

  // 方式 1: 按路径清除缓存
  revalidatePath('/blog');
  console.log('已清除 /blog 路径的缓存');

  // 方式 2: 按标签清除缓存
  revalidateTag('products');
  console.log('已清除所有带 "products" 标签的缓存');

  return Response.json({ revalidated: true });
}

// 使用方式:
// POST /api/revalidate?secret=xxx
```

**在数据变更后触发重新验证**:

```typescript
// app/actions.ts
'use server';

import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

export async function createPost(title: string) {
  console.log('创建文章:', title);
  await db.post.create({ data: { title } });

  // 清除 posts 标签的缓存,让页面显示最新数据
  revalidateTag('posts');
  console.log('已清除 posts 缓存');
}
```

### 4.4 并行数据获取 vs 瀑布流

**❌ 瀑布流 (Waterfall)** — 串行获取,慢:

```typescript
export default async function Page() {
  const user = await getUser();        // 等待 200ms
  const posts = await getPosts(user.id); // 又等待 200ms
  const comments = await getComments(posts[0].id); // 又等待 200ms
  // 总耗时: 600ms
  return <div>...</div>;
}
```

**✅ 并行获取** — 同时发起,快:

```typescript
export default async function Page() {
  // Promise.all 并行发起
  const [user, posts, stats] = await Promise.all([
    getUser(),       // 200ms
    getPosts(),      // 200ms
    getStats(),      // 200ms
  ]);
  // 总耗时: 200ms (最慢的那个)

  return <div>...</div>;
}
```

**❌ 依赖数据时的错误做法**:

```typescript
// ❌ 还是串行,慢
const user = await getUser();
const posts = await getPosts(user.id);
```

**✅ 正确做法** — 尽早发起独立请求:

```typescript
// ✅ 并行发起可以并行的部分
const userPromise = getUser();
const statsPromise = getStats(); // 不依赖 user,可以同时发起

const user = await userPromise;
const posts = await getPosts(user.id); // 依赖 user,必须等待

const stats = await statsPromise;
```

> ⚛️ **The Physics: 请求瀑布 (Request Waterfall) — 性能杀手**
>
> 瀑布流是服务端性能的最大杀手。想象三个水龙头:
> - **串行**: 接满第一个桶,再接第二个,再接第三个 (600ms)
> - **并行**: 三个桶同时接水 (200ms)
>
> 在网络请求中,延迟是不可避免的,但**串行等待是可避免的**。并行是服务端性能优化的第一法则。

---

## 5. Server Actions — 表单提交的新范式

### 🎭 The Drama: 时光倒流

> **2005 年 (PHP 时代)**:
>
> ```php
> <form action="/create-post.php" method="POST">
>   <input name="title" />
>   <button type="submit">发布</button>
> </form>
>
> // create-post.php
> <?php
>   $title = $_POST['title'];
>   mysqli_query($conn, "INSERT INTO posts (title) VALUES ('$title')");
>   header('Location: /posts');
> ?>
> ```
>
> **2015 年 (React SPA 时代)**:
>
> ```typescript
> function CreatePost() {
>   const [title, setTitle] = useState('');
>
>   const handleSubmit = async (e) => {
>     e.preventDefault();
>     await fetch('/api/posts', {
>       method: 'POST',
>       headers: { 'Content-Type': 'application/json' },
>       body: JSON.stringify({ title }),
>     });
>     router.push('/posts');
>   };
>
>   return (
>     <form onSubmit={handleSubmit}>
>       <input value={title} onChange={(e) => setTitle(e.target.value)} />
>       <button type="submit">发布</button>
>     </form>
>   );
> }
> ```
>
> **2024 年 (Server Actions 时代)**:
>
> ```typescript
> async function createPost(formData: FormData) {
>   'use server';
>   const title = formData.get('title');
>   await db.post.create({ data: { title } });
>   redirect('/posts');
> }
>
> export default function CreatePost() {
>   return (
>     <form action={createPost}>
>       <input name="title" />
>       <button type="submit">发布</button>
>     </form>
>   );
> }
> ```
>
> 我们花了 20 年,绕了一圈回到了起点。但这一圈的代价是值得的——现在我们有 TypeScript 类型安全、Zod 验证、自动 CSRF 防护、渐进增强 (Progressive Enhancement)。

### 5.1 什么是 Server Actions

> 📄 **完整代码**: [`examples/server-actions/TodoActions.ts`](./examples/server-actions/TodoActions.ts)  
> 包含:完整的 CRUD 操作、Zod 验证、错误处理、返回类型

Server Actions 是可以在客户端调用、但在服务器执行的异步函数。它们用 `'use server'` 指令标记:

```typescript
// app/actions.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createTodo(formData: FormData) {
  console.log('服务器接收到表单数据');
  const title = formData.get('title') as string;

  await db.todo.create({
    data: { title, completed: false },
  });

  revalidatePath('/todos');
}
```

**在 Server Component 中使用**:

```typescript
// app/todos/page.tsx
import { createTodo } from '../actions';

export default function TodosPage() {
  return (
    <form action={createTodo}>
      <input name="title" required />
      <button type="submit">添加 Todo</button>
    </form>
  );
}

// 当用户点击提交:
// 1. Next.js 拦截表单提交
// 2. 通过 POST 请求发送 FormData 到服务器
// 3. 服务器执行 createTodo 函数
// 4. 执行完毕后,客户端自动重新渲染页面
```

**在 Client Component 中使用**:

> 📄 **完整代码**: [`examples/server-actions/TodoForm.tsx`](./examples/server-actions/TodoForm.tsx)  
> 包含:useFormStatus、useOptimistic、错误处理、成功消息

```typescript
// app/components/add-todo.tsx
'use client';

import { createTodo } from '../actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '添加'}
    </button>
  );
}

export function AddTodo() {
  return (
    <form action={createTodo}>
      <input name="title" required />
      <SubmitButton />
    </form>
  );
}
```

### 5.2 Server Actions 的优势

| 特性 | 传统 API Route | Server Actions |
|------|---------------|----------------|
| **类型安全** | ❌ 需要手动定义请求/响应类型 | ✅ 函数参数和返回值自动推断 |
| **代码位置** | 分离 (组件 + API 文件) | ✅ 可以和组件放在一起 |
| **CSRF 防护** | ❌ 需要手动实现 | ✅ 内建 (使用加密 token) |
| **渐进增强** | ❌ JS 禁用时表单不可用 | ✅ 即使 JS 禁用也能提交 (降级为普通 POST) |
| **Loading 状态** | 需要手动管理 | ✅ `useFormStatus()` 自动获取 |
| **错误处理** | 需要手动 try-catch | ✅ 可以用 Error Boundary 捕获 |

### 5.3 Server Actions 高级用法

#### 返回数据

```typescript
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;

  const user = await db.user.create({
    data: { name },
  });

  console.log('用户已创建:', user);

  // ✅ 返回创建的用户对象
  return { success: true, user };
}

// 在 Client Component 中使用
'use client';

import { createUser } from '../actions';

export function SignupForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await createUser(formData);
    if (result.success) {
      console.log('创建成功:', result.user);
      alert(`欢迎, ${result.user.name}!`);
    }
  };

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <button type="submit">注册</button>
    </form>
  );
}
```

#### 使用 Zod 验证输入

```typescript
'use server';

import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题过长'),
  content: z.string().min(10, '内容至少 10 个字符'),
});

export async function createPost(formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
  };

  console.log('验证输入:', rawData);

  // 验证数据
  const validatedData = createPostSchema.parse(rawData);
  // 如果验证失败,会抛出 ZodError,被 Error Boundary 捕获

  await db.post.create({
    data: validatedData,
  });

  console.log('文章已创建');
  revalidatePath('/blog');

  return { success: true };
}
```

#### 乐观更新 (Optimistic Updates)

```typescript
'use client';

import { useOptimistic } from 'react';
import { toggleTodo } from '../actions';

type Todo = { id: string; title: string; completed: boolean };

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get('title') as string;

    // 立即更新 UI (乐观假设成功)
    addOptimisticTodo({
      id: crypto.randomUUID(),
      title,
      completed: false,
    });

    // 发送到服务器
    await createTodo(formData);
  };

  return (
    <div>
      <form action={handleSubmit}>
        <input name="title" />
        <button>添加</button>
      </form>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

> 🌌 **The Big Picture: Server Actions 的哲学**
>
> Server Actions 的核心理念是 **Progressive Enhancement (渐进增强)**:
> 1. **基础层**: 即使 JavaScript 完全禁用,表单仍然可以提交 (降级为传统的 POST 请求)
> 2. **增强层**: 当 JS 可用时,Next.js 拦截提交,通过 AJAX 发送,用户体验更流畅
> 3. **高级层**: 配合 `useOptimistic`, `useFormStatus`,实现即时反馈和乐观更新
>
> 这是对"JavaScript First"思维的反思——你的应用应该**先在没有 JS 的情况下可用,然后再通过 JS 增强**,而不是完全依赖 JS。

---

## 6. 中间件 — 请求拦截的艺术

### 🎭 The Drama: 门卫与守夜人

> 中间件 (Middleware) 是你的应用的**门卫**。在请求到达页面之前,门卫先检查身份、检查权限、决定是放行、重定向、还是拒绝。
>
> 想象一个夜店:门卫不会让每个客人都进去,然后再一个个检查 ID——那太晚了,舞池已经乱了。门卫在门口就把工作做完:未成年人止步,VIP 走快速通道,黑名单直接拒绝。

### 6.1 创建中间件

> 📄 **完整代码**: [`examples/middleware/01-basic-middleware.ts`](./examples/middleware/01-basic-middleware.ts)  
> 包含:URL 重定向、自定义 Headers、A/B 测试、地理位置重定向

```typescript
// middleware.ts (放在项目根目录)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('中间件拦截:', request.nextUrl.pathname);

  // 重定向旧 URL
  if (request.nextUrl.pathname.startsWith('/old-blog')) {
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = newUrl.pathname.replace('/old-blog', '/blog');
    return NextResponse.redirect(newUrl);
  }

  // 添加自定义 Header 和 A/B 测试
  const response = NextResponse.next();
  response.headers.set('X-Custom-Header', 'MyValue');
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 6.2 中间件的典型用例

#### 用例 1: 认证检查

> 📄 **完整代码**: [`examples/middleware/02-auth-middleware.ts`](./examples/middleware/02-auth-middleware.ts)  
> 包含:认证检查、角色权限、登录后跳转

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('session')?.value;

  // 受保护的路由
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
```

#### 用例 2: 国际化 (i18n) 重定向

> 📄 **完整代码**: [`examples/middleware/03-i18n-middleware.ts`](./examples/middleware/03-i18n-middleware.ts)  
> 包含:语言检测、Cookie 偏好、Accept-Language 解析、URL 重定向

```typescript
// middleware.ts
const locales = ['en', 'zh', 'ja'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // 1. 从 Cookie 读取
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && locales.includes(localeCookie)) return localeCookie;
  
  // 2. 从 Accept-Language Header 推断
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage?.startsWith('zh')) return 'zh';
  
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${request.nextUrl.pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}
```

#### 用例 3: 速率限制 (Rate Limiting)

> 📄 **完整代码**: [`examples/middleware/04-rate-limiting-middleware.ts`](./examples/middleware/04-rate-limiting-middleware.ts)  
> 包含:内存存储实现、Redis 生产方案、Rate Limit Headers、IP 白名单

```typescript
// middleware.ts
// ⚠️ 简化版:生产环境应使用 Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;
  
  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown';
  if (!rateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  return NextResponse.next();
}
```

> 🧠 **CS Master's Bridge: 中间件的执行环境**
>
> Next.js 中间件运行在 **Edge Runtime**,而不是 Node.js Runtime。这意味着:
>
> 1. **不能使用 Node.js API** (`fs`, `path`, `crypto` 的部分 API)
> 2. **不能访问数据库** (没有 Prisma Client)
> 3. **可用的 npm 包受限** (必须是 Edge 兼容的)
>
> **为什么用 Edge?** 因为中间件需要极快的响应速度 (< 50ms)。Edge Runtime 基于 V8 Isolate,冷启动时间 < 5ms,远快于 Node.js 的数百毫秒。这意味着中间件可以部署到全球的边缘节点,在离用户最近的位置执行,减少延迟。
>
> **限制**: 如果需要访问数据库 (如检查用户权限),你需要在 Server Component 或 API Route 中做,而不是在中间件中。中间件只能做"轻量级"的检查 (读 Cookie/Header、简单重定向)。

---

## 7. 路由高级 — 路由组、平行路由、拦截路由

### 🎭 The Drama: 路由的三维空间

> 传统路由是一条直线: `/` → `/about` → `/blog` → `/blog/post-1`。App Router 的高级路由打破了这个线性思维,引入了三个维度:
> 1. **路由组** (Route Groups): 组织文件,不影响 URL
> 2. **平行路由** (Parallel Routes): 同一个 URL,渲染多个独立区域
> 3. **拦截路由** (Intercepting Routes): 在不离开当前页面的情况下,打开另一个路由

### 7.1 路由组 (Route Groups)

用 `(folderName)` 包裹,不会出现在 URL 中:

```
app/
  (marketing)/
    layout.tsx          (营销页面专属布局)
    page.tsx            → /
    about/page.tsx      → /about
    pricing/page.tsx    → /pricing
  (shop)/
    layout.tsx          (商店页面专属布局)
    products/page.tsx   → /products
    cart/page.tsx       → /cart
  (dashboard)/
    layout.tsx          (仪表盘专属布局)
    page.tsx            → /dashboard
```

**用途 1: 不同区域使用不同布局**

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <div className="marketing">
      <nav>营销导航栏</nav>
      {children}
    </div>
  );
}

// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <aside>仪表盘侧边栏</aside>
      <main>{children}</main>
    </div>
  );
}
```

**用途 2: 组织文件,不改变 URL**

```
app/
  (auth)/
    login/page.tsx      → /login  (不是 /auth/login)
    signup/page.tsx     → /signup
    reset/page.tsx      → /reset
```

### 7.2 平行路由 (Parallel Routes)

使用 `@folderName` 定义**插槽** (Slot),在同一个 URL 渲染多个独立区域:

```
app/
  layout.tsx
  @analytics/
    page.tsx
    loading.tsx
  @team/
    page.tsx
    loading.tsx
  page.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  analytics, // @analytics 插槽
  team,      // @team 插槽
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      <div className="main">{children}</div>
      <aside className="analytics">{analytics}</aside>
      <aside className="team">{team}</aside>
    </div>
  );
}
```

**访问 `/` 时的渲染结构**:

```
<Layout>
  <div className="main">
    <page.tsx />  ← app/page.tsx
  </div>
  <aside className="analytics">
    <@analytics/page.tsx />  ← 独立的 Suspense 边界
  </aside>
  <aside className="team">
    <@team/page.tsx />  ← 独立的 Suspense 边界
  </aside>
</Layout>
```

**优势**: 每个插槽有独立的 `loading.tsx` 和 `error.tsx`,可以独立加载和错误处理:

```typescript
// @analytics/loading.tsx
export default function AnalyticsLoading() {
  return <div>分析数据加载中...</div>;
}

// @team/loading.tsx
export default function TeamLoading() {
  return <div>团队信息加载中...</div>;
}

// 即使 @analytics 加载很慢,@team 和主内容可以先显示
```

### 7.3 拦截路由 (Intercepting Routes)

使用 `(..)` 拦截其他路由,实现"模态框"效果:

```
app/
  feed/
    page.tsx            → /feed
  photo/
    [id]/
      page.tsx          → /photo/123 (完整页面)
  @modal/
    (.)photo/
      [id]/
        page.tsx        (拦截 /photo/123,在模态框中显示)
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal} {/* 模态框插槽 */}
    </>
  );
}

// app/@modal/(.)photo/[id]/page.tsx
import { Modal } from '@/components/modal';

export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <img src={`/photos/${params.id}.jpg`} alt="照片" />
    </Modal>
  );
}

// app/photo/[id]/page.tsx
export default function PhotoPage({ params }: { params: { id: string } }) {
  // 完整页面版本 (直接访问 URL 或刷新时显示)
  return (
    <div>
      <h1>照片详情</h1>
      <img src={`/photos/${params.id}.jpg`} alt="照片" />
    </div>
  );
}
```

**行为**:

1. 在 `/feed` 页面点击链接 `<Link href="/photo/123">` → 弹出模态框 (拦截)
2. 直接访问 `/photo/123` 或刷新页面 → 显示完整页面 (不拦截)

**拦截规则**:

| 约定 | 含义 |
|------|------|
| `(.)` | 拦截同级路由 |
| `(..)` | 拦截上一级路由 |
| `(..)(..)` | 拦截上两级路由 |
| `(...)` | 拦截从根目录开始的路由 |

> ⚛️ **The Physics: 软导航 vs 硬导航**
>
> - **软导航 (Soft Navigation)**: 用户在应用内点击 `<Link>` 组件,客户端路由生效,拦截路由被触发 → 模态框
> - **硬导航 (Hard Navigation)**: 用户直接输入 URL、刷新页面、或从外部链接进入 → 拦截不生效 → 完整页面
>
> 这是一个优雅的降级机制——用户在应用内享受 SPA 的流畅体验 (模态框),但直接访问 URL 时仍然能看到完整内容 (利于 SEO 和分享)。

---

## 8. 流式渲染与 Suspense — 渐进式加载的艺术

### 🎭 The Drama: 从"全或无"到"渐进式"

> **传统 SSR 的问题 (全或无)**:
>
> 用户请求一个页面。服务器必须:
> 1. 获取所有数据 (等待最慢的查询完成)
> 2. 渲染整个 HTML
> 3. 一次性发送给客户端
>
> 如果页面有 10 个组件,其中 1 个需要查询 5 秒,用户就要等 5 秒才能看到任何内容——即使其他 9 个组件的数据早就准备好了。

**✅ 流式渲染 (Streaming SSR) 的革命**:

服务器边渲染边发送 HTML。快的部分先发送,慢的部分后发送。用户立刻看到内容,而不是盯着空白屏幕。

### 8.1 Suspense 基础

> 📄 **完整代码**: [`examples/streaming/StreamingExample.tsx`](./examples/streaming/StreamingExample.tsx)  
> 包含:多层 Suspense、性能对比、仪表盘示例、嵌套边界

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>我的页面</h1>
      <p>这部分立刻显示</p>

      <Suspense fallback={<div>加载中...</div>}>
        <SlowComponent />
      </Suspense>

      <p>这部分也立刻显示</p>
    </div>
  );
}

async function SlowComponent() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return <div>慢数据加载完成</div>;
}
```

**渲染流程** (3 秒的慢查询):

```
时间 0ms:   客户端收到 HTML
            <h1>我的页面</h1>
            <p>这部分立刻显示</p>
            <div>加载中...</div>  ← Suspense fallback
            <p>这部分也立刻显示</p>

时间 3000ms: 客户端收到更新的 HTML 片段
            <div>慢数据: 42</div>  ← 替换掉 fallback
```

用户在第 0ms 就看到了内容,而不是等 3 秒。

### 8.2 多层 Suspense — 粒度控制

```typescript
import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <div>
      <h1>仪表盘</h1>

      {/* 第一优先级:快速数据 */}
      <Suspense fallback={<div>用户信息加载中...</div>}>
        <UserInfo />
      </Suspense>

      {/* 第二优先级:中等速度数据 */}
      <Suspense fallback={<div>统计数据加载中...</div>}>
        <Stats />
      </Suspense>

      {/* 第三优先级:慢速数据 */}
      <Suspense fallback={<div>图表加载中...</div>}>
        <Charts />
      </Suspense>
    </div>
  );
}

async function UserInfo() {
  const user = await getUser(); // 50ms
  return <div>{user.name}</div>;
}

async function Stats() {
  const stats = await getStats(); // 500ms
  return <div>访问量: {stats.views}</div>;
}

async function Charts() {
  const charts = await generateCharts(); // 3000ms
  return <div>{/* 复杂图表 */}</div>;
}
```

**渲染时间线**:

```
0ms:    <h1>仪表盘</h1>
        <div>用户信息加载中...</div>
        <div>统计数据加载中...</div>
        <div>图表加载中...</div>

50ms:   <div>Alice</div>  ← UserInfo 完成
        <div>统计数据加载中...</div>
        <div>图表加载中...</div>

500ms:  <div>Alice</div>
        <div>访问量: 1234</div>  ← Stats 完成
        <div>图表加载中...</div>

3000ms: <div>Alice</div>
        <div>访问量: 1234</div>
        <div>[复杂图表]</div>  ← Charts 完成
```

用户逐步看到内容,而不是等待最慢的组件。

### 8.3 `loading.tsx` 的本质

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>仪表盘加载中...</div>;
}

// 等价于:
// Next.js 自动生成
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

**嵌套 Loading**:

```
app/
  dashboard/
    loading.tsx         ← 整个 Dashboard 的 Loading
    page.tsx
    analytics/
      loading.tsx       ← 只有 Analytics 的 Loading
      page.tsx
```

### 8.4 Streaming 的底层原理

> 🧠 **CS Master's Bridge: HTTP Chunked Transfer Encoding**
>
> 传统 HTTP 响应:
>
> ```
> HTTP/1.1 200 OK
> Content-Length: 1024
>
> [完整的 HTML,1024 字节]
> ```
>
> 服务器必须先计算出完整响应的长度 (`Content-Length`),这意味着必须等所有内容渲染完毕。
>
> **Streaming SSR 使用 Chunked Transfer Encoding**:
>
> ```
> HTTP/1.1 200 OK
> Transfer-Encoding: chunked
>
> 200
> <html><h1>快速内容</h1>...
> 150
> <div id="slow">加载中...</div>...
> (3 秒后)
> 100
> <script>替换 slow div 的内容</script>...
> 0
> (结束)
> ```
>
> 服务器边渲染边发送"块"(chunk)。客户端边接收边渲染。这是 HTTP/1.1 的标准特性,但 Next.js 是第一个在 React SSR 中大规模应用的框架。

**RSC Payload 格式** (简化版):

```
M1:{"id":"./src/app/page.tsx","chunks":[],"name":""}
S2:"react.suspense"
J0:["$","div",null,{"children":["$","h1",null,{"children":"标题"}]}]
J1:["$","$2",null,{"fallback":"加载中...","children":"$3"}]
(3 秒后)
J3:["$","div",null,{"children":"慢数据: 42"}]
```

这是一种自定义的流式格式,客户端 React 逐行解析,渐进式渲染。

---

## 9. 🧘 Zen of Code — 关注点分离的再定义

> **传统的关注点分离**: 按文件类型分 (HTML / CSS / JS)
>
> ```
> components/
>   button.html         ← 结构
>   button.css          ← 样式
>   button.js           ← 行为
> ```
>
> **React 的关注点分离**: 按组件分 (每个组件自包含 UI/逻辑/样式)
>
> ```
> components/
>   Button.tsx          ← JSX + 逻辑
>   Button.module.css   ← 样式
> ```
>
> **Next.js 的关注点分离**: 按**运行环境**分 (服务端 / 客户端)
>
> ```
> app/
>   page.tsx            ← Server Component (数据获取)
>   components/
>     interactive.tsx   ← Client Component (交互)
> ```

**关注点分离的本质不是"把 HTML、CSS、JS 分开",而是"把不同职责的代码分开"**。

- 在 2000 年代,职责是按"表现层技术"划分的 (结构、样式、行为)
- 在 2010 年代,职责是按"UI 模块"划分的 (每个组件是一个职责)
- 在 2020 年代,职责是按"执行环境"划分的 (服务端的职责 vs 客户端的职责)

**高内聚、低耦合**的原则从未改变,改变的只是划分的维度。

> ⚛️ **The Physics: 熵与边界**
>
> 软件系统的自然演化方向是**熵增**——混乱度增加。代码会越来越难以理解,直到重写。
>
> **关注点分离是对抗熵增的武器**——你在系统中划出清晰的边界:
> - "这里是数据获取,那里是 UI 渲染"
> - "这里是服务端代码,那里是客户端代码"
> - "这里是业务逻辑,那里是基础设施"
>
> 边界越清晰,系统的熵增速度越慢。Next.js 的 Server/Client 边界是一条**物理边界**(网络边界),比传统的"逻辑边界"更难以违反——你不能在 Server Component 里用 `useState`,编译器会直接报错。
>
> **物理边界 > 逻辑边界 > 无边界**。

---

## 10. 最佳实践与常见陷阱

### ✅ 最佳实践

#### 1. 默认使用 Server Component,按需使用 Client Component

```typescript
// ✅ 好的做法
// app/page.tsx (Server Component)
import { db } from '@/lib/db';
import { InteractiveChart } from './interactive-chart'; // Client Component

export default async function Dashboard() {
  const data = await db.stats.findMany(); // 服务器查询

  return (
    <div>
      <h1>仪表盘</h1>
      <InteractiveChart data={data} /> {/* 只有图表需要交互 */}
    </div>
  );
}

// app/interactive-chart.tsx
'use client';
export function InteractiveChart({ data }) {
  // 交互逻辑
}
```

#### 2. 使用 `cache()` 避免重复查询

```typescript
// ✅ lib/data.ts
import { cache } from 'react';
import { db } from './db';

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});

// 在多个组件中调用,只查询一次
```

#### 3. 并行数据获取

```typescript
// ✅ 好的做法
export default async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);
  return <div>...</div>;
}

// ❌ 坏的做法 (串行,慢)
export default async function Page() {
  const user = await getUser();
  const posts = await getPosts();
  const comments = await getComments();
  return <div>...</div>;
}
```

#### 4. 使用 Metadata API 优化 SEO

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}
```

### ❌ 常见陷阱

#### ☠️ 陷阱 1: 在 Client Component 里尝试数据库操作

```typescript
// ❌ 错误
'use client';
import { db } from '@/lib/db'; // ❌ db 只能在服务端使用

export function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // ❌ 运行时错误:db 在浏览器里不存在
    db.user.findMany().then(setUsers);
  }, []);

  return <ul>...</ul>;
}

// ✅ 正确做法 1: 在 Server Component 查询,作为 props 传递
// app/page.tsx
export default async function Page() {
  const users = await db.user.findMany();
  return <UserList users={users} />;
}

// ✅ 正确做法 2: 使用 Server Action
'use client';
import { getUsers } from '../actions';

export function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers); // ✅ Server Action 在服务端执行
  }, []);
}
```

#### ☠️ 陷阱 2: 忘记标记交互组件为 Client Component

```typescript
// ❌ 错误
export function Counter() {
  const [count, setCount] = useState(0); // ❌ 运行时错误:useState 只能在 Client Component 使用

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ 正确
'use client'; // 👈 必须添加

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### ☠️ 陷阱 3: 过度使用 Client Component

```typescript
// ❌ 坏的做法:整个页面变成 Client Component
'use client';

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h1>大量静态内容</h1>
      <p>更多静态内容</p>
      {/* 只有这个按钮需要交互,但整个页面的 JS 都发送到客户端了 */}
      <button onClick={() => setIsOpen(!isOpen)}>切换</button>
    </div>
  );
}

// ✅ 好的做法:提取交互部分为独立组件
export default function Page() {
  return (
    <div>
      <h1>大量静态内容</h1>
      <p>更多静态内容</p>
      <ToggleButton /> {/* 只有这个组件是 Client Component */}
    </div>
  );
}

// toggle-button.tsx
'use client';
export function ToggleButton() {
  const [isOpen, setIsOpen] = useState(false);
  return <button onClick={() => setIsOpen(!isOpen)}>切换</button>;
}
```

#### ☠️ 陷阱 4: 在 Middleware 中使用 Node.js API

```typescript
// ❌ 错误:Middleware 运行在 Edge Runtime,不支持 Node.js API
import fs from 'fs'; // ❌ fs 不存在

export function middleware(request) {
  const config = fs.readFileSync('./config.json'); // ❌ 运行时错误
  // ...
}

// ✅ 正确:使用环境变量或边缘兼容的存储
export function middleware(request) {
  const config = process.env.CONFIG; // ✅ 环境变量可用
  // 或者使用 Vercel KV、Upstash Redis 等边缘兼容的存储
}
```

#### ☠️ 陷阱 5: 忽略 Hydration Mismatch

```typescript
// ❌ 会导致 Hydration Mismatch
export default function Page() {
  return <p>当前时间: {new Date().toLocaleString()}</p>;
  // 服务器渲染时的时间 ≠ 客户端 Hydration 时的时间
}

// ✅ 正确做法:用 Client Component + useEffect
'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(new Date().toLocaleString()); // 只在客户端设置
  }, []);

  return <p>当前时间: {time ?? '加载中...'}</p>;
}
```

---

## 11. 争议与反思 — Next.js 是否过度耦合?

> 🎭 **The Drama: 技术的政治学**
>
> Next.js 是 React 生态最成功的框架,但它也是最有争议的。批评主要集中在两个方面:
>
> 1. **Vercel Lock-in**: Next.js 的很多特性 (ISR, Edge Functions, Image Optimization) 在 Vercel 上体验最好,在其他平台上则需要额外配置甚至功能受限。这是"中立的开源框架"还是"Vercel 的产品营销工具"?
>
> 2. **React 的方向是否被 Vercel 绑架?**: React Server Components 是 React 核心团队和 Vercel 合作开发的。Vercel 的 CEO Guillermo Rauch 在 React 生态有巨大影响力。这导致一个尖锐的问题:**React 还是一个独立的、中立的 UI 库吗?**

### 11.1 批评 1: Vendor Lock-in (供应商锁定)

**论据**:

- **ISR (Incremental Static Regeneration)**: 在 Vercel 上开箱即用,在自建 Node.js 服务器上需要额外配置 (如 Redis 缓存)
- **Edge Middleware**: 在 Vercel 上部署到全球边缘节点,在其他平台上可能只能跑在单个区域
- **Image Optimization**: Vercel 提供内建的图片优化服务,自建需要配置 `sharp` 或第三方服务

**辩护**:

- **标准化 vs 优化**: Next.js 本质上是开源的,你可以部署到任何 Node.js 环境 (AWS, Google Cloud, 自建服务器)。Vercel 只是提供了**最优化的体验**,但不是唯一选择。
- **类比 Ruby on Rails + Heroku**: Rails 是开源的,但 Heroku 为 Rails 提供了最好的部署体验。没人说 Rails 被 Heroku 绑架了。

### 11.2 批评 2: React 的中立性

**论据**:

- React Server Components 的参考实现几乎只有 Next.js
- React 文档现在推荐"使用框架 (如 Next.js)",而不是"使用 Create React App"
- React 核心团队成员 (如 Dan Abramov, Andrew Clark) 加入了 Vercel

**辩护**:

- **框架是 React 的未来**: React 团队承认,生产环境的 React 应用需要解决路由、数据获取、SSR 等问题——这些不是 React 本身的职责。**框架是必然的**,Next.js 只是最成功的一个。Remix, Gatsby, Expo (移动端) 也在用 React。
- **开放标准**: RSC 的协议是开放的,任何框架都可以实现 (Remix 也在实现)。

### 11.3 如何评估这类技术政治问题?

**作为学习者,你应该问自己的问题**:

1. **我的项目需要多平台部署吗?**
   - 如果答案是"不,Vercel 够用了",那 Lock-in 不是问题
   - 如果答案是"是,需要部署到内网/AWS/GCP",你需要评估迁移成本

2. **技术栈的生命周期是多久?**
   - 如果你的项目预期运行 10 年,你需要考虑 Next.js 在 5 年后是否还是主流
   - 如果是创业公司的 MVP,速度 > 长期风险

3. **替代方案是什么?**
   - **Remix**: Shopify 支持,更"web 标准"(使用原生 `<form>`, `fetch`),但生态较小
   - **Astro**: 适合内容网站,不适合复杂交互应用
   - **自建 React + Vite + Express**: 完全控制,但你要自己解决 Next.js 帮你解决的所有问题

**我的观点** (作为教程作者):

> **没有完美的技术,只有最适合当前场景的权衡。**
>
> Next.js 的 Vercel 耦合是真实存在的,但它解决的问题 (SSR、路由、数据获取、部署) 也是真实的。如果你的团队有能力自建整套基础设施,你可以选择更"中立"的方案。但对于大多数团队,Next.js 提供的生产力提升远大于 Lock-in 的风险。
>
> **学习 Next.js 不是"信仰 Vercel",而是学习"现代 React 应用应该解决哪些问题"。** 即使你最终选择了 Remix 或自建方案,Next.js 教给你的思维模型 (Server Component、Streaming SSR、文件系统路由) 仍然是有价值的。

---

## 12. 章节练习

<details>
<summary><strong>练习 1: Server Component vs Client Component 判断</strong></summary>

以下组件应该是 Server Component 还是 Client Component?说明理由。

```typescript
// A.
function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } });
  return <div>{user.name}</div>;
}

// B.
function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</button>;
}

// C.
function BlogPost({ slug }: { slug: string }) {
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(r => r.json());
  return <article>{post.content}</article>;
}

// D.
function SearchBar() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**答案**:

- **A: Server Component** — 直接查询数据库,没有交互
- **B: Client Component** — 使用 `useState` 和 `onClick`,需要 `'use client'`
- **C: Server Component** — 异步 `fetch`,可以在服务端执行 (但如果需要缓存,应该用 `cache()` 包裹)
- **D: Client Component** — 使用 `useState` 和受控输入,需要 `'use client'`

</details>

<details>
<summary><strong>练习 2: 修复数据获取瀑布流</strong></summary>

以下代码存在瀑布流问题,如何优化?

```typescript
export default async function Page() {
  const user = await getUser();
  const posts = await getPosts(user.id);
  const comments = await getComments(posts[0].id);

  return <div>...</div>;
}
```

**答案**:

```typescript
export default async function Page() {
  // 并行发起独立请求
  const userPromise = getUser();
  const statsPromise = getGlobalStats(); // 假设这是不依赖 user 的

  const user = await userPromise;
  const posts = await getPosts(user.id); // 依赖 user,必须等待

  const comments = await getComments(posts[0].id); // 依赖 posts,必须等待

  const stats = await statsPromise; // 等待之前就发起了

  return <div>...</div>;
}

// 或者使用 Suspense 分离慢查询
export default function Page() {
  return (
    <div>
      <Suspense fallback={<div>用户信息加载中...</div>}>
        <UserSection />
      </Suspense>
      <Suspense fallback={<div>文章加载中...</div>}>
        <PostsSection />
      </Suspense>
    </div>
  );
}
```

</details>

<details>
<summary><strong>练习 3: 实现一个带 Loading 和 Error 的页面</strong></summary>

为 `/products/[id]` 路由实现:
1. Loading UI (骨架屏)
2. Error UI (显示错误信息和重试按钮)
3. Not Found UI (404 页面)

**答案**:

```
app/
  products/
    [id]/
      page.tsx
      loading.tsx
      error.tsx
      not-found.tsx
```

```typescript
// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });

  if (!product) {
    notFound(); // 触发 not-found.tsx
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}

// app/products/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="skeleton">
      <div className="skeleton-title"></div>
      <div className="skeleton-description"></div>
    </div>
  );
}

// app/products/[id]/error.tsx
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-container">
      <h2>加载失败</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}

// app/products/[id]/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>产品不存在</h2>
      <p>您访问的产品 ID 不存在</p>
    </div>
  );
}
```

</details>

<details>
<summary><strong>练习 4: Server Action 表单验证</strong></summary>

实现一个创建文章的表单,包含:
1. 标题 (必填,最少 5 字符)
2. 内容 (必填,最少 50 字符)
3. 使用 Zod 验证
4. 验证失败时显示错误信息

**答案**:

```typescript
// app/actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const createPostSchema = z.object({
  title: z.string().min(5, '标题至少 5 个字符').max(100, '标题最多 100 个字符'),
  content: z.string().min(50, '内容至少 50 个字符'),
});

export async function createPost(formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
  };

  // 验证数据
  const result = createPostSchema.safeParse(rawData);

  if (!result.success) {
    // 返回错误信息
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // 创建文章
  await db.post.create({
    data: result.data,
  });

  revalidatePath('/blog');

  return { success: true };
}

// app/create-post/page.tsx
'use client';

import { createPost } from '../actions';
import { useState } from 'react';

export default function CreatePostPage() {
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (formData: FormData) => {
    const result = await createPost(formData);

    if (!result.success) {
      setErrors(result.errors);
    } else {
      alert('文章创建成功!');
    }
  };

  return (
    <form action={handleSubmit}>
      <div>
        <label>标题</label>
        <input name="title" />
        {errors.title && <p className="error">{errors.title[0]}</p>}
      </div>

      <div>
        <label>内容</label>
        <textarea name="content" rows={10} />
        {errors.content && <p className="error">{errors.content[0]}</p>}
      </div>

      <button type="submit">发布</button>
    </form>
  );
}
```

</details>

---

## 总结

**你学到了什么**:

1. **Meta-Framework 的必要性** — CRA 的局限和 Next.js 解决的问题
2. **文件系统路由** — Layouts, Loading, Error, 动态路由的约定
3. **Server Components vs Client Components** — 运行环境的边界和划分策略
4. **数据获取模式** — `async/await`, `cache()`, Revalidation, 并行获取
5. **Server Actions** — 表单提交的现代范式,渐进增强
6. **中间件** — 请求拦截、认证、重定向
7. **高级路由** — 路由组、平行路由、拦截路由
8. **流式渲染** — Suspense, Streaming SSR, 渐进式加载

**下一步**:

- 学习 **Tailwind CSS** (实用优先的样式方案)
- 学习 **shadcn/ui** (组件库的所有权哲学)
- 实战 **TeamPulse 项目** (综合运用 Next.js + Prisma + tRPC)

**最重要的思维转变**:

> 从"所有代码都在客户端运行"转变为"**让每一行代码在最合适的地方运行**"——数据获取在服务端,交互在客户端,路由在 Edge,验证在两端。这是现代全栈工程师的核心思维模型。

**记住**: Next.js 不是终点,它是一个窗口——透过这个窗口,你看到了 Web 应用的本质问题 (性能、SEO、用户体验) 和一种可能的解决方案。未来的框架会变,但问题和思维模型是永恒的。
