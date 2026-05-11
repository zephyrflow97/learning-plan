# tRPC + TanStack Query — 端到端类型安全的未来

> *"The best error message is the one that never shows up."* — Thomas Fuchs
>
> 想象一下：你修改了一个 API 的返回字段名，但忘了更新前端的解析逻辑。在 REST 世界里，这个 Bug 会在上线后的某个深夜被用户发现，你会收到一个"Cannot read property 'userName' of undefined"的错误报告。在 GraphQL 世界里，你的构建可能会通过，但运行时会返回 null。在 tRPC 世界里，你保存文件的瞬间，IDE 就会用红色波浪线尖叫着告诉你："这个字段不存在了！"
>
> 这就是端到端类型安全的力量——**把运行时的地雷变成编译时的警告**。这一章，我们将探索这个激进的想法：如果前端和后端说同一种语言，为什么还需要 API 文档？

---

## 📖 本章内容

1. [API 的进化三部曲](#1-api-的进化三部曲)
2. [tRPC 核心概念](#2-trpc-核心概念)
3. [端到端类型安全的魔法](#3-端到端类型安全的魔法)
4. [TanStack Query — 服务端状态管家](#4-tanstack-query--服务端状态管家)
5. [缓存策略的艺术](#5-缓存策略的艺术)
6. [tRPC + TanStack Query 的完美结合](#6-trpc--tanstack-query-的完美结合)
7. [错误处理的类型安全之路](#7-错误处理的类型安全之路)
8. [性能与权衡](#8-性能与权衡)
9. [🧘 Zen of Code: 消灭中间人](#9-🧘-zen-of-code-消灭中间人)
10. [最佳实践](#10-最佳实践)
11. [常见陷阱](#11-常见陷阱)
12. [章节练习](#12-章节练习)

**向前连接**:
- **Stage 4 微服务章节** — REST/GraphQL 的架构原理
- **Stage 5 权衡的艺术** — 没有银弹，只有取舍
- **Prisma 章节** — Prisma 的类型会流入 tRPC

**向后连接**:
- **Forms 章节** — tRPC mutation 处理表单提交
- **Authentication 章节** — tRPC Context 携带用户信息
- **Project: TeamPulse** — 完整的 tRPC 应用

---

## 1. API 的进化三部曲

> 🎭 **The Drama: API 的三幕剧**
>
> **第一幕 (REST, 2000-2015)**：前后端之间有一堵墙，他们通过在墙上贴便条（API 文档）交流。便条经常过期，两边经常误解对方的意思。前端说："给我用户数据。" 后端说："好的，给你 JSON。" 但 JSON 里有什么？谁知道呢，去看文档吧。文档过期了？祝你好运。
>
> **第二幕 (GraphQL, 2015-2020)**：他们把墙换成了一扇窗户（Schema），能看到对方了。前端可以精确地说："我只要 id、name 和 avatarUrl。" 后端根据窗户上的规格说明书（GraphQL SDL）返回。但窗户上的规格说明书还需要手动维护，而且维护它的成本比建这扇窗还高。
>
> **第三幕 (tRPC, 2020-现在)**：他们推倒了这堵墙。前端直接调用后端函数，类型自动传递。没有文档、没有代码生成、没有不同步——因为根本就没有"API 边界"了。前端说 `trpc.user.get({ id: 1 })`，后端说 `async get(input: { id: number }) { return db.user.findUnique(...) }`。TypeScript 编译器是唯一的裁判。

### 1.1 REST: 辉煌与局限

2000 年，Roy Fielding 在他的博士论文中定义了 REST 架构风格。这是 Web API 的黄金标准，持续了 15 年。

**REST 的优点**:
- **简单** — 基于 HTTP，无需学习新协议
- **无状态** — 每个请求独立，易于横向扩展
- **语言中立** — Java 后端可以服务 JavaScript 前端
- **工具成熟** — Postman、Swagger、curl 无处不在

**REST 的痛点**:

```typescript
// ❌ REST 的类型安全噩梦
async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json(); // 返回类型: any 😱
  
  // 你必须手动声明类型，而且它可能是错的
  return data as User;
  
  // 如果后端改了字段名 userName → username，编译时不会报错
  // 运行时会悄悄返回 undefined
  // 用户会看到 "Hello, undefined!"
}

// ❌ Over-fetching (过取)
// 你只需要用户名，但拿回了整个用户对象（包括密码哈希、创建时间、上次登录...）
const user = await fetch('/api/users/1').then(r => r.json());
console.log(user.name); // 浪费了 95% 的带宽

// ❌ Under-fetching (欠取)
// 你需要用户和他的帖子，必须发两次请求
const user = await fetch('/api/users/1').then(r => r.json());
const posts = await fetch(`/api/users/${user.id}/posts`).then(r => r.json());
// 两次网络往返，延迟翻倍
```

> 🌌 **The Big Picture: API 文档的熵增定律**
>
> 所有 API 文档的自然演化方向是**过期**。这不是因为工程师懒惰，这是因为文档和代码是两个独立的系统。当你修改代码时，你必须**记得**同步更新文档。人类的记忆是不可靠的。OpenAPI/Swagger 试图通过"从代码生成文档"来解决这个问题，但它只解决了一半——前端依然需要手动写类型定义（或者引入一个代码生成步骤，这又是一个新的不同步点）。

### 1.2 GraphQL: 光与影

2015 年，Facebook 开源了 GraphQL。它解决了 REST 的 Over-fetching 和 Under-fetching 问题，但带来了新的复杂度。

**GraphQL 的革命性想法**:

```graphql
# 客户端精确描述需要什么
query {
  user(id: 1) {
    id
    name
    posts {
      title
      createdAt
    }
  }
}

# 一次请求，获取所有需要的数据，不多不少
```

**GraphQL 的代价**:

```typescript
// ❌ Schema 定义是另一个需要维护的文件
// schema.graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

// 你的 TypeScript 类型
interface User {
  id: string;
  name: string;
  email: string;
  posts: Post[];
}

// 两份定义，手动同步。如果忘了？运行时爆炸 💥
```

```typescript
// ❌ Resolver 地狱 + N+1 问题
const resolvers = {
  User: {
    // 每个用户都会触发一次数据库查询
    posts: async (user) => {
      return db.post.findMany({ where: { userId: user.id } });
      // 100 个用户 = 101 次查询 (1 次查用户 + 100 次查帖子)
    }
  }
};

// 解决方案: DataLoader (又一层抽象，又一个要学的东西)
const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.post.findMany({ where: { userId: { in: userIds } } });
  // 批量加载逻辑... 200 行样板代码
});
```

```typescript
// ❌ 客户端缓存归一化 — Apollo Client 的噩梦
import { InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        posts: {
          merge(existing = [], incoming) {
            // 你需要手动写合并逻辑
            // 否则缓存更新会出现幽灵数据
          }
        }
      }
    }
  }
});

// 配置文件比业务逻辑还长
```

> 🧠 **CS Master's Bridge: GraphQL 的复杂度来源**
>
> GraphQL 的核心问题是它试图在**通用性**和**性能**之间寻找平衡。它允许客户端发送任意查询，这意味着服务端无法预知会执行什么查询，因此无法优化。为了防止恶意查询（如深度嵌套导致数据库爆炸），你需要引入查询复杂度分析、深度限制、速率限制。为了解决 N+1 问题，你需要 DataLoader。为了缓存，你需要归一化缓存。每一层优化都引入了新的抽象层。这是一个**通用性税 (Tax of Generality)**：工具越通用,在特定场景下的摩擦力越大。

### 1.3 tRPC: 激进的简化

2020 年，tRPC 诞生了。它提出了一个激进的问题：

**如果前端和后端都是 TypeScript，为什么还需要中间的 Schema 定义语言？**

答案是：**不需要**。

```typescript
// ✅ tRPC: 服务端定义一个函数
export const userRouter = t.router({
  getById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.user.findUnique({ where: { id: input.id } });
    }),
});

// ✅ 客户端直接调用，完整的类型推断
const user = await trpc.user.getById.query({ id: 1 });
//    ^? const user: { id: number; name: string; email: string; ... }

// 如果后端改了返回类型，这里会立刻报错 ✅
console.log(user.name);

// 如果你写错了参数类型
const user = await trpc.user.getById.query({ id: "1" });
//                                              ^^^^
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'
```

**tRPC 的三个核心洞察**:

1. **TypeScript 本身就是 Schema 语言** — 不需要 GraphQL SDL 或 OpenAPI YAML
2. **RPC (远程过程调用) 足够了** — 前端调用后端函数，不需要 REST 的资源模型或 GraphQL 的查询语言
3. **类型推断穿透网络边界** — 服务端的类型自动流向客户端，零手写

> ⚛️ **The Physics: 把问题域缩小从而消灭问题**
>
> tRPC 的策略像物理学中的**降维打击**。REST 和 GraphQL 要解决的是"如何让任意语言的客户端和服务端通信"——这是一个高维度的问题，需要引入中间语言（JSON Schema, GraphQL SDL）。tRPC 把问题域缩小到"TypeScript 前端 + TypeScript 后端"——问题的维度降低了，解决方案就简单了。这就像爱因斯坦的相对论：通过改变坐标系（问题的框架），复杂的方程变成了简单的形式。

---

## 2. tRPC 核心概念

### 2.1 Procedure (过程)

tRPC 的基本单元是 **Procedure**，它类似于一个函数。有两种 Procedure:

- **Query** — 读取数据，幂等，可缓存（类似 HTTP GET）
- **Mutation** — 修改数据，非幂等（类似 HTTP POST/PUT/DELETE）

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  // ✅ Query — 读取数据
  getUser: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      console.log('[tRPC] 执行 getUser query, input:', input);
      const user = await db.user.findUnique({
        where: { id: input.id },
      });
      console.log('[tRPC] getUser 返回:', user);
      return user;
    }),
  
  // ✅ Mutation — 修改数据
  createUser: t.procedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      console.log('[tRPC] 执行 createUser mutation, input:', input);
      const user = await db.user.create({
        data: input,
      });
      console.log('[tRPC] createUser 返回:', user);
      return user;
    }),
});

export type AppRouter = typeof appRouter;
```

**关键点**:

1. **Input Validation** — `z.object(...)` 是 Zod Schema，它会在运行时验证输入
2. **Type Inference** — `typeof appRouter` 导出类型，客户端会导入这个类型
3. **No Manual Types** — 你不需要手动定义 `GetUserInput` 或 `User` 类型，Zod 会推断

> 🧰 **The Toolbox: Query vs Mutation 的语义选择**
>
> **何时用 Query**:
> - 读取数据（`getUser`, `listPosts`）
> - 幂等操作（多次调用结果相同）
> - 可以被缓存
>
> **何时用 Mutation**:
> - 修改数据（`createUser`, `updatePost`, `deleteComment`）
> - 非幂等（每次调用都有副作用）
> - 不应被缓存
>
> 错误的选择不会导致代码崩溃，但会影响 TanStack Query 的缓存行为和开发者工具的显示。

### 2.2 Router (路由器)

Router 是 Procedure 的集合。你可以嵌套 Router 来组织代码。

> 📄 **完整代码示例**：查看 [`examples/routers/`](./examples/routers/) 目录
> - [`user.ts`](./examples/routers/user.ts) — 用户路由器
> - [`post.ts`](./examples/routers/post.ts) — 帖子路由器（完整示例）
> - [`_app.ts`](./examples/routers/_app.ts) — 主路由器

```typescript
// 客户端调用示例
trpc.user.getById.query({ id: 1 })
trpc.post.create.mutation({ title: "Hello", content: "World" })
```

**最佳实践**:

```
server/
  trpc/
    trpc.ts           # initTRPC 配置
    routers/
      user.ts         # userRouter
      post.ts         # postRouter
      _app.ts         # appRouter (汇总)
    context.ts        # Context 定义
```

### 2.3 Context (上下文)

Context 是每个 Procedure 都能访问的共享数据。通常用于携带认证信息、数据库连接等。

```typescript
// ✅ 定义 Context
import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth';

export async function createContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(opts.req, opts.res, authOptions);
  
  console.log('[tRPC Context] 创建上下文, session:', session?.user?.email || 'anonymous');
  
  return {
    session,
    db,  // Prisma Client
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

// ✅ 使用 Context
const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  getMyProfile: t.procedure.query(async ({ ctx }) => {
    // ctx.session 来自 Context
    if (!ctx.session?.user?.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    
    console.log('[tRPC] 获取用户资料, email:', ctx.session.user.email);
    return ctx.db.user.findUnique({
      where: { email: ctx.session.user.email },
    });
  }),
});
```

**Context 的生命周期**:

```
每个 HTTP 请求 → createContext() 被调用 → 生成 ctx 对象 → 所有 Procedure 共享这个 ctx → 请求结束,ctx 销毁
```

> 🧠 **CS Master's Bridge: Context 与依赖注入**
>
> tRPC 的 Context 本质上是**依赖注入 (Dependency Injection)** 模式的函数式实现。在 OOP 中，你会通过构造函数注入依赖（`new UserService(db, logger)`）。在 tRPC 中，你通过 Context 注入依赖。这样做的好处是**可测试性**——你可以在测试中传入 mock 的 Context，而不修改 Procedure 的代码。

### 2.4 Middleware (中间件)

Middleware 可以在 Procedure 执行前后插入逻辑，常用于日志、认证、性能监控。

> 📄 **完整代码示例**：查看 [`examples/trpc.ts`](./examples/trpc.ts)（包含完整的 Middleware 定义和使用示例）

```typescript
// 简化示例：中间件的使用
const protectedProcedure = t.procedure.use(isAuthed);

export const appRouter = t.router({
  publicHello: t.procedure.query(() => {
    return { message: 'Hello, World!' };
  }),
  
  privateProfile: protectedProcedure.query(({ ctx }) => {
    // ctx.session.user 保证存在 (TypeScript 知道这一点)
    return { email: ctx.session.user.email };
  }),
});
```

**Middleware 链**:

```typescript
const procedure = t.procedure
  .use(loggerMiddleware)     // 先执行
  .use(isAuthed)             // 再执行
  .use(rateLimitMiddleware); // 最后执行
```

---

## 3. 端到端类型安全的魔法

> 🎭 **The Drama: 类型推断的接力赛**
>
> 想象一条信息接力赛：
> 1. **数据库 Schema (Prisma)** → 生成 TypeScript 类型 `User`
> 2. **tRPC Procedure** → 从数据库返回 `User`，类型自动推断
> 3. **AppRouter** → 聚合所有 Procedure，导出类型 `AppRouter`
> 4. **客户端 tRPC Client** → 导入 `AppRouter` 类型，推断所有可用的调用
> 5. **React 组件** → 调用 `trpc.user.getById.query()`，自动知道返回类型是 `User`
>
> 整个链条中，你只在第一步（Prisma Schema）手写了类型定义。其余都是**自动推断**。一旦数据库 Schema 改变（比如给 User 加一个 `age` 字段），整条链路的类型都会自动更新。这就是端到端类型安全。

### 3.1 类型推断的魔法原理

```typescript
// server/trpc/routers/user.ts
import { z } from 'zod';

export const userRouter = t.router({
  getById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // Prisma 返回的类型会被自动推断
      return db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      // 返回类型: { id: number; name: string; email: string } | null
    }),
});

export type UserRouter = typeof userRouter;
```

```typescript
// server/trpc/routers/_app.ts
import { userRouter } from './user';

export const appRouter = t.router({
  user: userRouter,
});

// ✅ 导出类型（这是唯一需要导出的东西）
export type AppRouter = typeof appRouter;
```

```typescript
// utils/trpc.ts (客户端)
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/trpc/routers/_app';

// ✅ 类型魔法发生在这里
export const trpc = createTRPCReact<AppRouter>();
//                                  ^^^^^^^^^^
// 这个类型参数让 trpc 对象知道所有可用的 Procedure
```

```tsx
// components/UserProfile.tsx
'use client';

import { trpc } from '@/utils/trpc';

export function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading } = trpc.user.getById.useQuery({ id: userId });
  //     ^^^^                                                 ^^
  //     data 的类型自动推断为: { id: number; name: string; email: string } | null
  //                                                       ^^
  //                                                       如果传 string 会报错
  
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>User not found</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      {/* 如果你写 data.age，TypeScript 会报错（因为 Prisma select 里没有 age） */}
    </div>
  );
}
```

### 3.2 修改类型时的开发体验

**场景**: 你需要在 User 中添加一个 `avatarUrl` 字段。

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  avatarUrl String?  // ✅ 新增字段
}
```

```bash
# 运行迁移
npx prisma migrate dev
# Prisma Client 自动重新生成，User 类型现在包含 avatarUrl
```

```typescript
// server/trpc/routers/user.ts
export const userRouter = t.router({
  getById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,  // ✅ 如果忘了加这一行，data.avatarUrl 会是 undefined
        },
      });
    }),
});
```

```tsx
// components/UserProfile.tsx
export function UserProfile({ userId }: { userId: number }) {
  const { data } = trpc.user.getById.useQuery({ id: userId });
  
  return (
    <div>
      <img src={data?.avatarUrl ?? '/default-avatar.png'} />
      {/*        ^^^^^^^^^^^^
          TypeScript 知道 avatarUrl 的类型是 string | null | undefined
          如果你在 select 中加了 avatarUrl，类型会变成 string | null
      */}
    </div>
  );
}
```

**关键点**:

1. 数据库 Schema 改变 → Prisma 类型自动更新
2. tRPC Procedure 返回值类型自动更新
3. 客户端调用处的类型自动更新
4. **你只修改了一个地方（Prisma Schema），整个系统的类型都同步了**

> 🌌 **The Big Picture: 单一数据源的胜利**
>
> tRPC + Prisma 的组合实现了**类型的单一数据源 (Single Source of Truth)**。在传统架构中，你有三份类型定义：
> 1. 数据库 Schema (SQL)
> 2. 后端类型 (TypeScript/Java/Go interface)
> 3. 前端类型 (TypeScript interface)
>
> 这三份定义需要手动同步。手动同步必然失败。tRPC + Prisma 把这三份定义合并成一份——Prisma Schema。其余都是自动推断。这就是为什么它能消灭一整类 Bug（类型不同步的 Bug）。

---

## 4. TanStack Query — 服务端状态管家

> 🌌 **TanStack Query — 服务端状态的专属管家**
>
> 你有两种状态：
> - **客户端状态** (Client State) — UI 是否展开、主题是亮色还是暗色、当前输入框的文本
> - **服务端状态** (Server State) — 用户数据、帖子列表、购物车内容
>
> 它们的本质完全不同：
> - 客户端状态是你**独占**的，只存在于你的浏览器中
> - 服务端状态是全世界**共享**的（其他用户也在修改它）、**异步**的、有**过期时间**的
>
> 很多开发者犯的第一个错误是：**把服务端数据塞进 Redux/Zustand**。这就像用冰箱存放活鱼——冰箱是为了存储静态食物设计的，活鱼需要鱼缸（流动的水、氧气、温度控制）。
>
> TanStack Query (前身是 React Query) 的洞察是：**给服务端状态一个专属管家 (QueryClient)**，让管家负责缓存、过期、重新拉取、乐观更新、后台同步。你不再手动 `setUsers([...])`，你只需要声明"我要这个数据"，管家会处理剩下的。

### 4.1 基本用法

> 📄 **完整代码示例**：查看 [`examples/client/components/UserList.tsx`](./examples/client/components/UserList.tsx)（包含 useQuery 和 useMutation 的完整示例）

```tsx
// 简化示例
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### 4.2 QueryKey — 缓存的索引

`queryKey` 是 TanStack Query 缓存的核心。它是一个数组，类似于数据库的主键。

```tsx
// ✅ 静态 queryKey
useQuery({
  queryKey: ['users'],  // 所有用户
  queryFn: fetchUsers,
});

// ✅ 动态 queryKey (包含参数)
useQuery({
  queryKey: ['user', userId],  // 特定用户
  queryFn: () => fetchUser(userId),
});

// ✅ 嵌套 queryKey
useQuery({
  queryKey: ['user', userId, 'posts'],  // 特定用户的帖子
  queryFn: () => fetchUserPosts(userId),
});
```

**QueryKey 的规则**:

1. **顺序敏感** — `['user', 1]` 和 `[1, 'user']` 是两个不同的缓存项
2. **深度比较** — `['user', { id: 1 }]` 和 `['user', { id: 1 }]` 是**相同的** (TanStack Query 会深度比较对象)
3. **依赖追踪** — `queryKey` 中的变量变化时，自动触发重新查询

```tsx
function UserPosts({ userId }: { userId: number }) {
  const { data } = useQuery({
    queryKey: ['user', userId, 'posts'],
    queryFn: () => fetchUserPosts(userId),
  });
  
  // 当 userId prop 变化时，queryKey 变化，自动触发新的查询
  // userId: 1 → 2 时，会自动取消旧查询，启动新查询
  
  return <div>{data?.length} posts</div>;
}
```

> 🧰 **The Toolbox: QueryKey 的最佳实践**
>
> ```typescript
> // ✅ 集中管理 queryKey
> export const queryKeys = {
>   users: {
>     all: ['users'] as const,
>     detail: (id: number) => ['user', id] as const,
>     posts: (id: number) => ['user', id, 'posts'] as const,
>   },
>   posts: {
>     all: ['posts'] as const,
>     detail: (id: number) => ['post', id] as const,
>   },
> };
> 
> // 使用
> useQuery({
>   queryKey: queryKeys.users.detail(1),
>   queryFn: () => fetchUser(1),
> });
> ```
>
> 好处:
> 1. **类型安全** — `as const` 确保 TypeScript 知道精确的数组内容
> 2. **重构友好** — 修改 queryKey 格式时，只需改一个地方
> 3. **批量失效** — `invalidateQueries({ queryKey: queryKeys.users.all })` 会失效所有以 `['users']` 开头的查询

---

## 5. 缓存策略的艺术

> ⚛️ **缓存是计算机科学中最难的两件事之一**
>
> Phil Karlton 有一句名言："计算机科学中只有两件难事：缓存失效和命名。" TanStack Query 的缓存系统需要回答三个问题：
> 1. **何时拉取新数据？** (何时认为缓存"过期"了)
> 2. **何时删除旧数据？** (内存有限，不能无限缓存)
> 3. **何时显示旧数据？** (用户体验 vs 数据新鲜度的平衡)

### 5.1 核心概念

```tsx
useQuery({
  queryKey: ['user', 1],
  queryFn: fetchUser,
  
  // ✅ staleTime (过时时间) — 默认: 0ms
  // 数据在这个时间内被认为是"新鲜的"，不会重新拉取
  staleTime: 5 * 60 * 1000,  // 5 分钟
  
  // ✅ gcTime (垃圾回收时间, 旧名 cacheTime) — 默认: 5 分钟
  // 数据在内存中保留多久（即使组件已卸载）
  gcTime: 10 * 60 * 1000,  // 10 分钟
  
  // ✅ refetchOnWindowFocus — 默认: true
  // 用户切换回浏览器 tab 时，是否重新拉取
  refetchOnWindowFocus: true,
  
  // ✅ refetchOnReconnect — 默认: true
  // 网络重新连接时，是否重新拉取
  refetchOnReconnect: true,
  
  // ✅ refetchInterval — 默认: false
  // 自动轮询间隔（用于实时数据）
  refetchInterval: 30000,  // 每 30 秒拉取一次
});
```

### 5.2 缓存生命周期详解

```
1. 组件挂载
   ↓
2. useQuery 执行
   ↓
3. 检查缓存是否存在
   ├─ 不存在 → 执行 queryFn，显示 loading 状态
   └─ 存在 → 立刻返回缓存数据（即使可能过时）
       ↓
4. 检查数据是否 stale (过时)
   ├─ 数据新鲜 (age < staleTime) → 不重新拉取
   └─ 数据过时 (age >= staleTime) → 后台重新拉取
       ↓
5. 后台拉取完成
   ↓
6. 更新缓存，触发组件重新渲染
   ↓
7. 组件卸载
   ↓
8. 缓存保留在内存中 (gcTime 倒计时开始)
   ↓
9. gcTime 到期 → 缓存被删除
```

**示例: 用户体验优化**

```tsx
// ❌ 不好: 每次切换 tab 都重新加载
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 0,  // 默认值，数据立刻过时
});

// 用户体验:
// 1. 打开页面 → loading 3 秒 → 看到帖子列表
// 2. 切换到另一个 tab
// 3. 切回来 → loading 3 秒 → 又看到相同的帖子列表
// 为什么要让我再等 3 秒？！

// ✅ 好: 平衡新鲜度和用户体验
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 2 * 60 * 1000,  // 2 分钟内认为数据是新鲜的
  gcTime: 5 * 60 * 1000,     // 5 分钟后才删除缓存
});

// 用户体验:
// 1. 打开页面 → loading 3 秒 → 看到帖子列表
// 2. 切换到另一个 tab (1 分钟后回来)
// 3. 切回来 → 立刻看到帖子列表 (因为数据还在 staleTime 内)
// 4. 切换到另一个 tab (3 分钟后回来)
// 5. 切回来 → 立刻看到旧数据 + 后台拉取新数据 + 无感更新
```

### 5.3 乐观更新 (Optimistic Updates)

> ⚛️ **乐观更新 — 薛定谔的猫**
>
> 当你点"赞"时，UI 立刻显示已点赞（乐观假设成功）。如果服务器返回失败，再回滚。这就像量子物理中的薛定谔的猫——在服务器返回之前，这个"赞"既存在又不存在。TanStack Query 的 `onMutate` / `onError` / `onSettled` 回调就是管理这种"量子叠加态"的状态机。

> 📄 **完整代码示例**：查看 [`examples/optimistic-updates/LikeButton.tsx`](./examples/optimistic-updates/LikeButton.tsx)（包含详细的乐观更新流程和时间线说明）

```tsx
// 简化示例：乐观更新的三个关键步骤
const mutation = useMutation({
  mutationFn: likePost,
  onMutate: async () => {
    await queryClient.cancelQueries({ queryKey: ['post', postId] });
    const previousPost = queryClient.getQueryData(['post', postId]);
    queryClient.setQueryData(['post', postId], optimisticUpdate);
    return { previousPost };
  },
  onError: (err, vars, ctx) => queryClient.setQueryData(['post', postId], ctx?.previousPost),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['post', postId] }),
});
```

**时间线**:

```
T0: 用户点击 Like 按钮
T0+1ms: onMutate 执行，UI 立刻显示 "已点赞" ✅
T0+2ms: 发送 HTTP 请求到服务器
...等待网络...
T0+300ms: 服务器返回成功
T0+301ms: onSettled 执行，重新拉取真实数据
T0+600ms: 拉取完成，缓存更新 (通常和乐观更新一致)

如果服务器失败:
T0+300ms: 服务器返回 500 错误
T0+301ms: onError 执行，UI 回滚到 "未点赞" ❌
T0+302ms: 显示错误提示
```

> 🧘 **Zen of Code: 乐观的人生哲学**
>
> 乐观更新不仅是一种技术，它是一种**人生态度**的代码化。悲观的系统假设一切都会失败，只有在服务器确认成功后才更新 UI。乐观的系统假设大多数操作会成功，先做了再说，失败了再道歉。现实世界中，99% 的"点赞"请求会成功。为什么要让 99% 的用户等待那 1% 的失败情况？**先给用户即时的反馈，再在后台处理复杂性**——这就是好的产品设计。

### 5.4 后台刷新 (Background Refetch)

```tsx
// ✅ 用户看到旧数据的同时，后台拉取新数据
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 1 * 60 * 1000,  // 1 分钟
});

// isLoading: 首次加载，没有缓存数据
// isFetching: 正在拉取数据 (包括后台刷新)

if (isLoading) {
  // 第一次加载，显示骨架屏
  return <Skeleton />;
}

return (
  <div>
    {isFetching && <span className="refresh-indicator">更新中...</span>}
    <PostList posts={data} />
  </div>
);
```

**区别**:

| 状态 | 含义 | 何时为 true |
|------|------|------------|
| `isLoading` | 首次加载 | 没有缓存数据 + 正在拉取 |
| `isFetching` | 拉取中 | 任何时候拉取数据 (包括后台刷新) |
| `isRefetching` | 后台刷新 | 有缓存数据 + 正在拉取 |

```tsx
// ✅ 精细化 UI 控制
if (isLoading) return <Skeleton />;
if (error) return <Error />;

return (
  <div>
    {/* 后台刷新时，显示一个小 spinner，不阻塞 UI */}
    {isFetching && !isLoading && <Spinner size="sm" />}
    <PostList posts={data} />
  </div>
);
```

---

## 6. tRPC + TanStack Query 的完美结合

> 🎭 **The Drama: 一加一大于二**
>
> 单独使用 tRPC，你得到了**类型安全**。单独使用 TanStack Query，你得到了**智能缓存**。把它们结合在一起，你得到的不是两个独立的好处——你得到的是一个**新的开发范式**：
> - 调用后端就像调用本地函数（tRPC）
> - 但它自动缓存、自动刷新、自动重试（TanStack Query）
> - 而且全程类型安全（TypeScript）
>
> 这就像化学反应：氢气 + 氧气 = 水。水的性质不是氢和氧的简单叠加，而是一种全新的物质。

### 6.1 集成配置

```typescript
// server/trpc/trpc.ts
import { initTRPC } from '@trpc/server';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

```typescript
// server/trpc/routers/_app.ts
import { router } from '../trpc';
import { userRouter } from './user';
import { postRouter } from './post';

export const appRouter = router({
  user: userRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
```

> 📄 **完整代码示例**：
> - [`examples/client/trpc.ts`](./examples/client/trpc.ts) — 客户端 tRPC 配置
> - [`examples/client/Provider.tsx`](./examples/client/Provider.tsx) — TRPCProvider 组件（包含详细的配置说明）

```typescript
// 简化示例
export const trpc = createTRPCReact<AppRouter>();

// 在 app/layout.tsx 中使用
<TRPCProvider>{children}</TRPCProvider>
```

### 6.2 Query 调用

```tsx
// components/UserProfile.tsx
'use client';

import { trpc } from '@/utils/trpc';

export function UserProfile({ userId }: { userId: number }) {
  // ✅ trpc.user.getById.useQuery 是 TanStack Query 的 useQuery 的封装
  const { data, isLoading, error } = trpc.user.getById.useQuery(
    { id: userId },
    {
      // ✅ 所有 TanStack Query 的选项都可用
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: userId > 0,  // 条件查询
    }
  );
  
  console.log('[Component] UserProfile 渲染, isLoading:', isLoading, 'data:', data);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>User not found</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      {/* 类型安全: data 的类型是 Prisma 返回的精确类型 */}
    </div>
  );
}
```

**并行查询**:

```tsx
function Dashboard() {
  const userQuery = trpc.user.getById.useQuery({ id: 1 });
  const postsQuery = trpc.post.list.useQuery({ limit: 10 });
  const statsQuery = trpc.stats.get.useQuery();
  
  // ✅ 三个查询会自动批量处理 (httpBatchLink)
  // 只发送一个 HTTP 请求: POST /api/trpc
  // Body: [
  //   { id: 0, method: 'query', path: 'user.getById', input: { id: 1 } },
  //   { id: 1, method: 'query', path: 'post.list', input: { limit: 10 } },
  //   { id: 2, method: 'query', path: 'stats.get', input: undefined }
  // ]
  
  if (userQuery.isLoading || postsQuery.isLoading || statsQuery.isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {userQuery.data.name}</h1>
      <PostList posts={postsQuery.data} />
      <Stats data={statsQuery.data} />
    </div>
  );
}
```

### 6.3 Mutation 调用

> 📄 **完整代码示例**：查看 [`examples/client/components/CreatePost.tsx`](./examples/client/components/CreatePost.tsx)（包含完整的表单处理和错误提示）

```tsx
// 简化示例
const mutation = trpc.post.create.useMutation({
  onSuccess: (newPost) => {
    utils.post.list.invalidate();  // 方式 1: 使缓存失效
    // 或
    utils.post.list.setData(undefined, (old) => [newPost, ...old]);  // 方式 2: 手动更新
  },
});
```

### 6.4 乐观更新 (tRPC 版本)

> 📄 **完整代码示例**：查看 [`examples/optimistic-updates/LikeButton.tsx`](./examples/optimistic-updates/LikeButton.tsx)（tRPC 版本的乐观更新，包含详细注释）
>
> 另见 [`examples/optimistic-updates/TodoList.tsx`](./examples/optimistic-updates/TodoList.tsx)（列表操作的乐观更新示例）

```tsx
// 简化示例：tRPC 的乐观更新 API
const utils = trpc.useUtils();
const mutation = trpc.post.like.useMutation({
  onMutate: async () => {
    await utils.post.getById.cancel({ id: postId });
    const previous = utils.post.getById.getData({ id: postId });
    utils.post.getById.setData({ id: postId }, optimisticUpdate);
    return { previous };
  },
  onError: (err, vars, ctx) => utils.post.getById.setData({ id: postId }, ctx?.previous),
  onSettled: () => utils.post.getById.invalidate({ id: postId }),
});
```

---

## 7. 错误处理的类型安全之路

> 🎭 **The Drama: 错误也需要类型**
>
> 在传统 REST API 中，错误是运行时的惊喜：
> ```typescript
> const res = await fetch('/api/user/1');
> if (!res.ok) {
>   const error = await res.json();
>   // error 是 any 类型，你不知道里面有什么
>   // 可能是 { message: string }，可能是 { error: { code: string } }
>   // 谁知道呢？
> }
> ```
>
> tRPC 说：**错误也应该是类型安全的**。

### 7.1 定义类型安全的错误

```typescript
// server/trpc/trpc.ts
import { TRPCError } from '@trpc/server';

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    console.log('[Middleware] ❌ 未认证访问被拒绝');
    
    // ✅ 抛出类型安全的错误
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '请先登录',
      cause: new Error('No session found'),  // 可选，用于调试
    });
  }
  
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});
```

**tRPC 内置的错误码**:

| 错误码 | HTTP 状态码 | 含义 |
|--------|------------|------|
| `BAD_REQUEST` | 400 | 客户端请求格式错误 |
| `UNAUTHORIZED` | 401 | 未认证 |
| `FORBIDDEN` | 403 | 已认证但无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `METHOD_NOT_SUPPORTED` | 405 | 方法不支持 |
| `TIMEOUT` | 408 | 请求超时 |
| `CONFLICT` | 409 | 资源冲突 |
| `PRECONDITION_FAILED` | 412 | 前置条件失败 |
| `PAYLOAD_TOO_LARGE` | 413 | 请求体过大 |
| `UNPROCESSABLE_CONTENT` | 422 | 验证失败 |
| `TOO_MANY_REQUESTS` | 429 | 速率限制 |
| `CLIENT_CLOSED_REQUEST` | 499 | 客户端取消请求 |
| `INTERNAL_SERVER_ERROR` | 500 | 服务器错误 |

### 7.2 错误传播

```typescript
// server/trpc/routers/user.ts
export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input.id } });
      
      if (!user) {
        console.log('[tRPC] 用户不存在, id:', input.id);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `用户 ${input.id} 不存在`,
        });
      }
      
      console.log('[tRPC] 找到用户:', user);
      return user;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.user.findUnique({ where: { id: input.id } });
      
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });
      }
      
      // ✅ 权限检查
      if (user.id !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        console.log('[tRPC] 权限不足, 用户:', ctx.user.id, '目标:', user.id);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '你无权删除此用户',
        });
      }
      
      await db.user.delete({ where: { id: input.id } });
      console.log('[tRPC] 用户已删除, id:', input.id);
      return { success: true };
    }),
});
```

### 7.3 客户端错误处理

```tsx
function UserProfile({ userId }: { userId: number }) {
  const { data, error, isLoading } = trpc.user.getById.useQuery({ id: userId });
  
  if (isLoading) return <div>Loading...</div>;
  
  if (error) {
    console.log('[Component] 错误:', error);
    console.log('[Component] 错误码:', error.data?.code);
    console.log('[Component] HTTP 状态:', error.data?.httpStatus);
    
    // ✅ 根据错误码分别处理
    if (error.data?.code === 'NOT_FOUND') {
      return <div>用户不存在</div>;
    }
    
    if (error.data?.code === 'UNAUTHORIZED') {
      return <div>请先登录</div>;
    }
    
    // 其他错误
    return <div>发生错误: {error.message}</div>;
  }
  
  return <div>{data.name}</div>;
}
```

**Mutation 错误处理**:

```tsx
function CreateUserForm() {
  const mutation = trpc.user.create.useMutation({
    onError: (error) => {
      console.log('[Mutation] 错误:', error);
      
      // ✅ Zod 验证错误
      if (error.data?.code === 'BAD_REQUEST') {
        // error.data.zodError 包含详细的验证错误
        console.log('[Mutation] 验证错误:', error.data.zodError);
        toast.error('输入格式错误');
        return;
      }
      
      // ✅ 业务逻辑错误
      if (error.data?.code === 'CONFLICT') {
        toast.error('该邮箱已被注册');
        return;
      }
      
      // 默认错误
      toast.error(error.message);
    },
  });
  
  return <form onSubmit={(e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  }}>
    <input name="name" />
    <input name="email" type="email" />
    <button type="submit">创建</button>
  </form>;
}
```

### 7.4 全局错误边界

> 📄 **完整代码示例**：查看 [`examples/error-handling/ErrorBoundary.tsx`](./examples/error-handling/ErrorBoundary.tsx)（完整的错误边界实现，包含 tRPC 错误处理和上报逻辑）

```tsx
// 简化示例：错误边界的核心逻辑
export class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error) {
    if (error instanceof TRPCClientError) {
      // 处理 tRPC 错误
      const code = error.data?.code;
      // 上报错误监控
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## 8. 性能与权衡

### 8.1 HTTP 批量处理 (Batching)

```typescript
// utils/trpc.ts
import { httpBatchLink } from '@trpc/client';

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      maxURLLength: 2083,  // 防止 URL 过长
      // ✅ 批处理配置
      // 默认: 10ms 内的请求会合并成一个 HTTP 请求
    }),
  ],
});
```

**批处理的效果**:

```tsx
// ❌ 不使用批处理: 3 个 HTTP 请求
const user = await fetch('/api/trpc/user.getById?input={"id":1}');
const posts = await fetch('/api/trpc/post.list?input={"limit":10}');
const stats = await fetch('/api/trpc/stats.get');

// ✅ 使用批处理: 1 个 HTTP 请求
// POST /api/trpc
// Body: [
//   { id: 0, method: 'query', path: 'user.getById', input: { id: 1 } },
//   { id: 1, method: 'query', path: 'post.list', input: { limit: 10 } },
//   { id: 2, method: 'query', path: 'stats.get' }
// ]
```

**何时禁用批处理**:

```typescript
// ✅ 某些请求不应被批处理 (如文件上传)
const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => op.path === 'upload.file',
      true: httpLink({ url: '/api/trpc' }),   // 不批处理
      false: httpBatchLink({ url: '/api/trpc' }),  // 批处理
    }),
  ],
});
```

### 8.2 tRPC 的权衡

> 🧘 **Zen of Code: 没有银弹**
>
> tRPC 不是完美的。它做出了激进的权衡：**牺牲通用性，换取特定场景下的极致体验**。理解这些权衡，才能做出明智的技术选择。

**tRPC 的适用场景**:

✅ **适合**:
- TypeScript 全栈应用 (前端 + 后端都是 TS)
- 单体应用或微前端 (前后端在同一个 repo)
- 内部 API (不需要给第三方消费)
- 快速迭代的团队项目

❌ **不适合**:
- 多语言架构 (后端是 Java/Go/Python)
- 公开 API (需要给其他公司/开发者调用)
- 需要人类可读的 API 文档 (tRPC 没有自动生成的 API 文档)
- 移动端原生应用 (iOS/Android) 消费的 API

**对比表**:

| 维度 | REST | GraphQL | tRPC |
|------|------|---------|------|
| 类型安全 | ❌ (需手写或代码生成) | ⚠️ (需手写 SDL 或代码生成) | ✅ (零手写) |
| 学习曲线 | ✅ 简单 | ❌ 陡峭 (Schema, Resolver, 缓存归一化) | ✅ 简单 (如果你会 TypeScript) |
| 语言中立 | ✅ | ✅ | ❌ (仅 TypeScript) |
| 公开 API | ✅ | ✅ | ❌ |
| Over-fetching | ❌ | ✅ | ⚠️ (需手动 select) |
| 工具成熟度 | ✅ (Postman, Swagger) | ✅ (GraphiQL, Apollo DevTools) | ⚠️ (tRPC Panel, 相对年轻) |
| 生态规模 | ✅ 巨大 | ✅ 大 | ⚠️ 快速增长但较小 |

> 🧠 **CS Master's Bridge: 通用性税 (Tax of Generality)**
>
> REST 是一个通用协议，它必须支持任意语言、任意平台、任意用例。这种通用性的代价是：在任何特定场景下，你都需要引入额外的抽象层（API 文档、类型定义、代码生成）。
>
> tRPC 反其道而行之：**把问题域缩小到 TypeScript 单体应用**。在这个狭窄的领域内，它消灭了中间层，达到了零摩擦。这是一个经典的工程权衡：**专用工具在特定场景下总是优于通用工具**。
>
> 这就像瑞士军刀 vs 专业工具：瑞士军刀能做很多事，但切菜不如菜刀，拧螺丝不如螺丝刀。tRPC 是菜刀，REST 是瑞士军刀。

### 8.3 性能优化技巧

**1. 减少查询次数**:

```tsx
// ❌ 多次查询
function UserPosts({ userId }: { userId: number }) {
  const user = trpc.user.getById.useQuery({ id: userId });
  const posts = trpc.post.listByUser.useQuery({ userId });
  
  // 2 次查询，2 次 HTTP 请求 (即使有批处理，也是 2 个 Procedure)
}

// ✅ 合并查询
// server/trpc/routers/user.ts
export const userRouter = router({
  getWithPosts: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
        include: { posts: true },  // Prisma 一次查询搞定
      });
      return user;
    }),
});

// 客户端
function UserPosts({ userId }: { userId: number }) {
  const { data } = trpc.user.getWithPosts.useQuery({ id: userId });
  
  // 1 次查询，1 次 HTTP 请求
}
```

**2. 使用 `select` 减少数据传输**:

```typescript
// ❌ 拉取整个用户对象 (包括密码哈希、元数据等)
const user = await db.user.findUnique({ where: { id: 1 } });

// ✅ 只拉取需要的字段
const user = await db.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    name: true,
    avatarUrl: true,
    // 不包括 passwordHash, createdAt 等不需要的字段
  },
});
```

**3. 预拉取 (Prefetching)**:

```tsx
// app/users/[id]/page.tsx (Server Component)
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/trpc/routers/_app';

export default async function UserPage({ params }: { params: { id: string } }) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  
  // ✅ 在服务端预拉取数据
  await helpers.user.getById.prefetch({ id: Number(params.id) });
  
  return (
    <HydrationBoundary state={helpers.dehydrate()}>
      <UserProfile userId={Number(params.id)} />
    </HydrationBoundary>
  );
}
```

---

## 9. 🧘 Zen of Code: 消灭中间人

> *"The best code is no code at all."*
>
> tRPC 的哲学可以用三个字总结：**消灭中间人**。
>
> 在软件架构中，每一层抽象都是一个中间人。中间人的存在是为了解耦、为了灵活性、为了应对变化。但中间人也带来了成本：
> - **认知负担** — 你需要理解中间人的规则
> - **同步成本** — 中间人和两端的数据需要手动同步
> - **Bug 的栖息地** — 中间人是 Bug 最喜欢藏身的地方
>
> REST API 的中间人是 **API 文档** — 它描述了前后端的协议，但文档和代码是两个独立的系统，必须手动同步。
>
> GraphQL 的中间人是 **Schema Definition Language** — 它是类型系统和查询语言的混合体，比 REST 更精确,但依然是一层需要维护的抽象。
>
> tRPC 问了一个激进的问题：**如果前后端说同一种语言，为什么还需要中间人？**
>
> 答案是：**不需要**。TypeScript 的类型系统本身就是 Schema。函数调用本身就是 API 定义。类型推断穿透网络边界，让前端直接"看到"后端的函数签名。
>
> 这是一个**降维打击**的策略：通过缩小问题域（从"任意语言通信"缩小到"TypeScript 单体应用"），让问题本身消失。
>
> **The best abstraction is the one that doesn't exist.**
>
> 这不仅是编程原则，这是**道家思想**在代码中的投射。老子说："为无为，则无不治。" 最好的治理是看起来没有治理的治理。最好的抽象层是看起来没有抽象层的抽象层。tRPC 不是在"做得更好"，它是在"做得更少"——通过消灭中间层，让系统回到本质。

**连接到 Stage 5 哲学章节**:

- **抽象泄漏定律** (Leaky Abstractions) — 所有非平凡的抽象都会泄漏。tRPC 的策略是：没有抽象，就没有泄漏。
- **偶然复杂度 vs 本质复杂度** — 前后端通信的本质复杂度是"数据传输 + 类型安全"。REST/GraphQL 引入的 Schema 定义、代码生成、文档同步都是偶然复杂度。tRPC 消灭了偶然复杂度,只留下本质。
- **KISS 原则** (Keep It Simple, Stupid) — 简单不是容易，简单是消除不必要的部分。tRPC 通过缩小问题域,达到了在特定场景下的极致简单。

---

## 10. 最佳实践

### ✅ Router 组织

```
server/
  trpc/
    trpc.ts                  # initTRPC, middleware
    context.ts               # Context 定义
    routers/
      _app.ts                # 主 Router
      user.ts                # 用户相关
      post.ts                # 帖子相关
      comment.ts             # 评论相关
      admin/                 # 管理员功能
        index.ts
        user-management.ts
```

### ✅ Input 验证集中管理

```typescript
// lib/validations.ts
import { z } from 'zod';

export const userSchema = {
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
};

export const createUserInput = z.object({
  email: userSchema.email,
  name: userSchema.name,
  password: z.string().min(8),
});

export const updateUserInput = z.object({
  id: userSchema.id,
  name: userSchema.name.optional(),
  email: userSchema.email.optional(),
});

// 在 Router 中复用
export const userRouter = router({
  create: publicProcedure.input(createUserInput).mutation(...),
  update: protectedProcedure.input(updateUserInput).mutation(...),
});
```

### ✅ Context 分层

```typescript
// server/trpc/context.ts
export async function createContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(opts.req, opts.res);
  
  return {
    // ✅ 始终可用
    db,
    req: opts.req,
    res: opts.res,
    
    // ⚠️ 可能为 null
    session,
  };
}

// ✅ 通过 middleware 扩展 Context
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      ...ctx,
      // ✅ 保证 user 不为 null
      user: ctx.session.user,
    },
  });
});

const protectedProcedure = t.procedure.use(isAuthed);

// 现在 protectedProcedure 中的 ctx.user 保证存在
```

### ✅ QueryKey 集中管理

```typescript
// utils/queryKeys.ts
export const queryKeys = {
  user: {
    all: ['users'] as const,
    lists: () => [...queryKeys.user.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.user.lists(), { filters }] as const,
    details: () => [...queryKeys.user.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.user.details(), id] as const,
  },
};
```

### ✅ 错误日志

```typescript
// server/trpc/trpc.ts
const loggerMiddleware = t.middleware(async ({ path, type, next, rawInput }) => {
  const start = Date.now();
  
  console.log(`[tRPC] → ${type} ${path}`, {
    input: rawInput,
    timestamp: new Date().toISOString(),
  });
  
  try {
    const result = await next();
    const duration = Date.now() - start;
    
    console.log(`[tRPC] ← ${type} ${path} (${duration}ms)`, {
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    console.error(`[tRPC] ✖ ${type} ${path} (${duration}ms)`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    throw error;
  }
});

export const publicProcedure = t.procedure.use(loggerMiddleware);
```

---

## 11. 常见陷阱

### ☠️ 陷阱 1: 在 Server Component 中使用 tRPC hooks

```tsx
// ❌ 错误: Server Component 中不能用 hooks
export default function Page() {
  const { data } = trpc.user.list.useQuery();  // 💥 Error!
  return <div>{data.length}</div>;
}

// ✅ 正确: 使用 Server-Side Helpers
import { createServerSideHelpers } from '@trpc/react-query/server';

export default async function Page() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  
  const data = await helpers.user.list.fetch();
  return <div>{data.length}</div>;
}
```

### ☠️ 陷阱 2: 忘记 invalidate 缓存

```tsx
// ❌ 创建用户后，列表没有更新
const mutation = trpc.user.create.useMutation({
  onSuccess: () => {
    toast.success('创建成功');
    // 忘了 invalidate，用户列表还是旧的
  },
});

// ✅ 记得 invalidate
const utils = trpc.useUtils();
const mutation = trpc.user.create.useMutation({
  onSuccess: () => {
    utils.user.list.invalidate();  // ✅ 触发重新拉取
  },
});
```

### ☠️ 陷阱 3: Context 中执行耗时操作

```typescript
// ❌ Context 在每个请求中都会执行
export async function createContext() {
  const expensiveData = await fetchFromSlowAPI();  // 💥 每次请求都等 2 秒
  
  return { expensiveData };
}

// ✅ 耗时操作放在 Procedure 中，按需执行
export async function createContext() {
  return { db };
}

export const appRouter = router({
  getData: publicProcedure.query(async ({ ctx }) => {
    const expensiveData = await fetchFromSlowAPI();  // ✅ 只在需要时执行
    return expensiveData;
  }),
});
```

### ☠️ 陷阱 4: 批处理导致的意外延迟

```tsx
// ❌ 用户点击按钮，mutation 延迟 10ms 才发送 (等待批处理窗口)
<button onClick={() => mutation.mutate({ ... })}>
  Submit
</button>

// ✅ 关键 Mutation 禁用批处理
const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => op.type === 'mutation',
      true: httpLink({ url: '/api/trpc' }),   // Mutation 不批处理
      false: httpBatchLink({ url: '/api/trpc' }),  // Query 批处理
    }),
  ],
});
```

---

## 12. 章节练习

### 练习 1: 构建基础 tRPC Router

创建一个博客系统的 tRPC Router，包含以下功能:
- 获取所有帖子 (分页)
- 获取单个帖子
- 创建帖子 (需要认证)
- 点赞帖子

<details>
<summary>查看答案</summary>

> 📄 **完整代码**：查看 [`examples/routers/post.ts`](./examples/routers/post.ts)

这个文件包含了完整的博客系统 Router 实现，包括：
- ✅ 分页查询（`list`）
- ✅ 详情查询（`getById`）
- ✅ 创建帖子（`create`，需要认证）
- ✅ 点赞功能（`like`，toggle 逻辑）
- ✅ 完整的错误处理
- ✅ 详细的日志输出

</details>

---

### 练习 2: 实现乐观更新

为练习 1 中的"点赞"功能添加乐观更新，确保 UI 立刻响应用户操作。

<details>
<summary>查看答案</summary>

> 📄 **完整代码**：查看 [`examples/optimistic-updates/LikeButton.tsx`](./examples/optimistic-updates/LikeButton.tsx)

这个文件包含了完整的乐观更新实现，包括：
- ✅ `onMutate`：立刻更新 UI
- ✅ `onError`：失败时回滚
- ✅ `onSettled`：重新拉取真实数据
- ✅ 详细的时间线说明
- ✅ 完整的日志输出

**关键点**：
- 用户点击 → UI 立刻响应（1ms）
- 后台发送请求（300ms）
- 失败时自动回滚
- 成功后同步真实数据

</details>

---

### 练习 3: 权衡分析

你的团队正在讨论是否从 REST API 迁移到 tRPC。列出至少 3 个支持 tRPC 的理由和 3 个反对的理由。

<details>
<summary>查看答案</summary>

**支持 tRPC 的理由**:

1. **端到端类型安全** — 修改后端类型时，前端会立刻报错，消灭了一整类"类型不同步"的 Bug。在快速迭代的团队中，这可以节省大量调试时间。

2. **零样板代码** — 不需要手写类型定义、API 文档、或运行代码生成工具。开发体验极其流畅——后端写一个函数，前端立刻能调用。

3. **自动批处理和缓存** — 集成 TanStack Query 后，自动获得智能缓存、乐观更新、后台刷新等高级功能，不需要手动管理 fetch 逻辑。

**反对 tRPC 的理由**:

1. **仅限 TypeScript** — 如果你的后端是 Java/Go/Python，或者团队计划未来迁移到其他语言，tRPC 不可用。这是一个巨大的 vendor lock-in 风险。

2. **公开 API 不友好** — tRPC 没有人类可读的 API 文档（如 Swagger UI）。如果你的 API 需要给第三方开发者使用，或者需要给非技术人员查看，tRPC 不合适。

3. **生态较新** — tRPC 诞生于 2020 年，相比 REST/GraphQL，它的工具链、教程、社区支持都相对有限。遇到问题时，可能需要自己摸索解决方案。

**最终决策因素**:

- **团队规模**: 小团队（<10 人）更适合 tRPC（沟通成本低）
- **项目类型**: 内部工具、SaaS 应用适合；公开 API、移动端适合 REST
- **技术栈**: TypeScript 全栈单体应用是 tRPC 的最佳场景
- **迁移成本**: 如果已有成熟的 REST API，迁移成本可能大于收益

</details>

---

### 练习 4: 性能优化

你的 Dashboard 页面需要同时拉取用户信息、帖子列表、统计数据。如何优化这个场景？

<details>
<summary>查看答案</summary>

> 📄 **相关代码示例**：
> - [`examples/caching/prefetching.tsx`](./examples/caching/prefetching.tsx) — 预拉取示例（包含方案 2 的详细实现）

**三种优化方案对比**：

| 方案 | 网络请求 | 首屏速度 | 缓存粒度 | 适用场景 |
|------|---------|---------|---------|---------|
| 1. 并行查询 + 批处理 | 1 个（批处理） | 中等 | 细 | 独立模块 |
| 2. 服务端预拉取 | 0 个（SSR） | 快 | 细 | SEO 关键页面 |
| 3. 合并查询 | 1 个 | 快 | 粗 | 仪表盘页面 |

**推荐方案**：
- 仪表盘页面（数据关联紧密）→ **方案 3**（合并查询）
- 独立模块（数据独立）→ **方案 1**（并行查询）
- SEO 关键页面 → **方案 2**（服务端预拉取）

**核心代码**（方案 3 - 合并查询）：

```typescript
// 服务端：合并成一个 Procedure
const dashboardRouter = router({
  getData: protectedProcedure.query(async ({ ctx }) => {
    const [user, posts, stats] = await Promise.all([
      ctx.db.user.findUnique({ where: { id: ctx.user.id } }),
      ctx.db.post.findMany({ where: { authorId: ctx.user.id }, take: 10 }),
      ctx.db.$queryRaw`SELECT COUNT(*) FROM posts WHERE authorId = ${ctx.user.id}`,
    ]);
    return { user, posts, stats };
  }),
});

// 客户端：一个查询搞定
const { data } = trpc.dashboard.getData.useQuery();
```

</details>

---

## 总结

这一章，我们探索了 tRPC + TanStack Query 的组合——一个激进的、端到端类型安全的 API 解决方案。

**核心要点**:

1. **API 的进化** — REST (无类型) → GraphQL (手动 Schema) → tRPC (自动类型推断)
2. **tRPC 核心** — Procedure, Router, Context, Middleware
3. **端到端类型安全** — Prisma Schema → tRPC → Client，全链路自动推断
4. **TanStack Query** — 服务端状态的专属管家，智能缓存、乐观更新、后台刷新
5. **缓存策略** — staleTime, gcTime, refetch 策略的平衡
6. **错误处理** — 类型安全的错误传播，运行时和编译时的双重保障
7. **权衡** — tRPC 仅适用于 TypeScript 全栈应用，是一个专用工具而非通用解决方案

**哲学洞察**:

- **消灭中间人** — 最好的抽象层是不存在的抽象层
- **降维打击** — 通过缩小问题域，让问题本身消失
- **单一数据源** — 类型定义只写一次，全链路自动同步
- **乐观的人生哲学** — 假设成功,失败了再道歉

**向后展望**:

下一章，我们将学习 **Forms + Validation**——如何用 React Hook Form + Zod 构建高性能、类型安全的表单系统。tRPC 的 Zod Schema 会在表单验证中复用，实现客户端和服务端验证逻辑的单一数据源。

记住：**The best error message is the one that never shows up.** 类型安全不是为了让你的 IDE 更漂亮——它是为了让整个类别的 Bug 在编译时就被消灭，永远不会到达用户手中。

---

> *"Any sufficiently advanced technology is indistinguishable from magic."* — Arthur C. Clarke
>
> tRPC 的端到端类型推断看起来像魔法。但它不是魔法——它是对 TypeScript 类型系统的深刻理解,对工程权衡的清醒认识，以及对"消灭不必要复杂度"的不懈追求。
>
> 当你下次修改一个 API 字段时，看着 IDE 立刻在所有调用处标红，你会意识到：这不是工具在帮你——这是**类型系统在替你思考**。这就是类型安全的终极形态。
