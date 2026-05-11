# tRPC + TanStack Query 完整代码示例

本目录包含 tRPC 章节的所有可运行代码示例。所有代码包含详细注释和日志输出。

## 📁 目录结构

```
examples/
├── routers/                    # tRPC Router 定义（服务端）
│   ├── trpc.ts                # tRPC 配置和 Middleware
│   ├── user.ts                # User Router（完整 CRUD）
│   ├── post.ts                # Post Router（博客示例）
│   └── _app.ts                # App Router（汇总）
├── client/                     # 客户端配置
│   ├── trpc.ts                # tRPC 客户端配置
│   └── Provider.tsx           # TRPCProvider 组件
├── optimistic-updates/         # 乐观更新示例
│   └── LikeButton.tsx         # 点赞按钮（完整时间线）
├── caching/                    # 缓存策略示例
│   └── prefetching.tsx        # Server Component 预拉取
└── README.md                   # 本文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
npm install @tanstack/react-query zod superjson
```

### 2. 创建 tRPC Router（服务端）

复制 `routers/` 目录下的文件到你的项目：

```
server/
  trpc/
    trpc.ts          # 从 examples/routers/trpc.ts 复制
    routers/
      user.ts        # 从 examples/routers/user.ts 复制
      post.ts        # 从 examples/routers/post.ts 复制
      _app.ts        # 从 examples/routers/_app.ts 复制
```

### 3. 创建 API Route Handler

在 Next.js App Router 中创建 `app/api/trpc/[trpc]/route.ts`:

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/routers/_app';
import { createContext } from '@/server/trpc/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
```

### 4. 配置客户端

复制 `client/` 目录下的文件：

```
app/
  utils/
    trpc.ts          # 从 examples/client/trpc.ts 复制
  providers/
    TRPCProvider.tsx # 从 examples/client/Provider.tsx 复制
```

### 5. 在 Layout 中使用 Provider

```tsx
// app/layout.tsx
import { TRPCProvider } from './providers/TRPCProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
```

### 6. 在组件中使用

```tsx
'use client';

import { trpc } from '@/app/utils/trpc';

export function UserList() {
  const { data, isLoading } = trpc.user.list.useQuery({ page: 1 });

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {data?.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## 📚 示例索引

### 1. tRPC 配置和 Middleware

**文件**: [`routers/trpc.ts`](./routers/trpc.ts)

**包含**:
- ✅ Context 定义
- ✅ Logger Middleware（日志）
- ✅ Auth Middleware（认证）
- ✅ Rate Limit Middleware（速率限制）
- ✅ Procedure 定义（publicProcedure, protectedProcedure）

**适用场景**: 初始化 tRPC 项目

---

### 2. User Router（完整 CRUD）

**文件**: [`routers/user.ts`](./routers/user.ts)

**包含**:
- ✅ Query: `list`（分页、搜索）
- ✅ Query: `getById`（根据 ID 查询）
- ✅ Query: `getProfile`（获取当前用户）
- ✅ Mutation: `create`（创建用户）
- ✅ Mutation: `update`（更新用户）
- ✅ Mutation: `delete`（删除用户）
- ✅ Query: `stats`（统计）

**适用场景**: 学习 tRPC 的基础 API

---

### 3. Post Router（博客示例）

**文件**: [`routers/post.ts`](./routers/post.ts)

**包含**:
- ✅ Query: `list`（分页、搜索、过滤）
- ✅ Query: `getById`
- ✅ Mutation: `create`
- ✅ Mutation: `update`
- ✅ Mutation: `delete`
- ✅ Mutation: `like`（点赞 toggle）
- ✅ Mutation: `togglePublish`（发布/取消发布）

**适用场景**: 实际业务场景示例

---

### 4. 客户端配置

#### 4.1 tRPC 客户端

**文件**: [`client/trpc.ts`](./client/trpc.ts)

**包含**:
- ✅ `createTRPCReact` 配置
- ✅ HTTP Batch Link（批量处理）
- ✅ Logger Link（开发日志）
- ✅ SuperJSON 序列化

**适用场景**: 配置 tRPC 客户端

---

#### 4.2 TRPCProvider 组件

**文件**: [`client/Provider.tsx`](./client/Provider.tsx)

**包含**:
- ✅ QueryClient 配置（staleTime, gcTime, retry）
- ✅ React Query Devtools 集成
- ✅ 详细的配置说明

**适用场景**: 在 Next.js App Router 中使用 tRPC

---

### 5. 乐观更新

**文件**: [`optimistic-updates/LikeButton.tsx`](./optimistic-updates/LikeButton.tsx)

**包含**:
- ✅ `onMutate`：立刻更新 UI
- ✅ `onError`：失败时回滚
- ✅ `onSuccess`：成功确认
- ✅ `onSettled`：重新拉取数据
- ✅ 完整的时间线说明
- ✅ 详细的日志输出

**适用场景**: 实现即时反馈的 UI 更新

**时间线**:
```
T0ms: 用户点击 → UI 立刻更新 ✅
T300ms: 服务器返回 → 确认/回滚
T600ms: 重新拉取 → 确保一致性
```

---

### 6. 预拉取（Prefetching）

**文件**: [`caching/prefetching.tsx`](./caching/prefetching.tsx)

**包含**:
- ✅ Server Component 预拉取数据
- ✅ `createServerSideHelpers` 使用
- ✅ HydrationBoundary 配置
- ✅ SEO 优化

**适用场景**: 提升首屏加载速度

---

## 🎯 学习路径

### 初学者

1. **tRPC 配置** → [`routers/trpc.ts`](./routers/trpc.ts)
2. **User Router** → [`routers/user.ts`](./routers/user.ts)
3. **客户端配置** → [`client/`](./client/)

### 进阶者

1. **乐观更新** → [`optimistic-updates/LikeButton.tsx`](./optimistic-updates/LikeButton.tsx)
2. **预拉取** → [`caching/prefetching.tsx`](./caching/prefetching.tsx)
3. **Post Router** → [`routers/post.ts`](./routers/post.ts)

## 💡 常见问题

### Q: 如何在客户端调用 tRPC？

```tsx
'use client';

import { trpc } from '@/app/utils/trpc';

export function MyComponent() {
  // Query: 查询数据
  const { data, isLoading } = trpc.user.getById.useQuery({ id: 1 });

  // Mutation: 修改数据
  const mutation = trpc.user.create.useMutation();

  const handleCreate = async () => {
    await mutation.mutateAsync({
      name: 'Alice',
      email: 'alice@example.com',
    });
  };

  return <div>...</div>;
}
```

### Q: 如何处理错误？

```tsx
const { data, error } = trpc.user.getById.useQuery({ id: 1 });

if (error) {
  // error.data.code: 'NOT_FOUND' | 'UNAUTHORIZED' | ...
  // error.message: 错误信息
  return <div>错误: {error.message}</div>;
}
```

### Q: 如何刷新缓存？

```tsx
const utils = trpc.useUtils();

// 方式 1: 使缓存失效（触发重新拉取）
utils.user.list.invalidate();

// 方式 2: 手动更新缓存
utils.user.list.setData({ page: 1 }, (old) => ({
  ...old,
  users: [...old.users, newUser],
}));

// 方式 3: 重新拉取
utils.user.list.refetch({ page: 1 });
```

### Q: HTTP Batch Link 是什么？

多个 Query 在短时间内（默认 10ms）发起时，会合并成一个 HTTP 请求：

```tsx
// 这三个查询会合并成一个 HTTP 请求
const user = trpc.user.getById.useQuery({ id: 1 });
const posts = trpc.post.list.useQuery({ page: 1 });
const stats = trpc.user.stats.useQuery();

// HTTP 请求: POST /api/trpc
// Body: [
//   { id: 0, method: 'query', path: 'user.getById', input: { id: 1 } },
//   { id: 1, method: 'query', path: 'post.list', input: { page: 1 } },
//   { id: 2, method: 'query', path: 'user.stats' }
// ]
```

### Q: 乐观更新什么时候用？

**适用场景**:
- ✅ 点赞/收藏（高频操作）
- ✅ 简单的 toggle 操作
- ✅ 成功率高的操作

**不适用场景**:
- ❌ 支付/转账（需要等待确认）
- ❌ 复杂的数据验证
- ❌ 失败率高的操作

## 🔗 相关章节

- [Chapter 04: Prisma Database](../../04-prisma-database/examples/README.md) - Prisma 会为 tRPC 提供类型
- [Chapter 05: tRPC](../README.md) - 主章节

## 📖 更多资源

- [tRPC 官方文档](https://trpc.io)
- [TanStack Query 官方文档](https://tanstack.com/query/latest)
- [tRPC Examples](https://github.com/trpc/trpc/tree/main/examples)
