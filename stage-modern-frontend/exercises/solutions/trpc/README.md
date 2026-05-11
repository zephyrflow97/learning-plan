# tRPC 练习题答案

本目录包含 tRPC 相关练习题的答案。

## 📋 练习题列表

### 8. 简单查询
- **文件**:
  - `08-hello-procedure-server.ts` - tRPC 初始化
  - `08-hello-procedure-router.ts` - API Router 定义
  - `08-hello-procedure-client.ts` - 客户端调用
- **技术点**: tRPC Router、Procedure、类型安全
- **关键概念**:
  - `router()` 定义 API 路由
  - `.query()` 查询操作(读取数据)
  - `.input()` 使用 Zod 验证输入
  - 类型自动推导,无需手写类型定义

### 15. Prisma CRUD 操作
- **文件**:
  - `15-post-crud-router.ts` - 完整 CRUD Router
  - `15-post-crud-client.tsx` - 客户端使用示例
- **技术点**: tRPC Mutation、Prisma 集成、类型安全
- **关键概念**:
  - `.mutation()` 变更操作(创建/更新/删除)
  - `useMutation` hook
  - `invalidate()` 刷新查询缓存

### 17. 分页查询
- **文件**:
  - `17-pagination-router.ts` - Cursor Pagination
  - `17-pagination-client.tsx` - 无限滚动实现
- **技术点**: Cursor Pagination、性能优化
- **关键概念**:
  - `cursor` 基于 ID 的分页,性能优于 offset
  - `useInfiniteQuery` 无限滚动 hook
  - `getNextPageParam` 获取下一页参数

### 20. 乐观更新
- **文件**:
  - `20-optimistic-router.ts` - 带错误处理的 API
  - `20-optimistic-client.tsx` - 乐观更新实现
- **技术点**: 乐观更新、错误回滚、UX 优化
- **关键概念**:
  - `onMutate` 立即更新 UI
  - `setData()` 手动设置缓存
  - `onError` 失败时回滚

---

## 🎯 学习要点

### tRPC 核心概念

#### 1. 类型安全的 RPC
```ts
// 服务端定义
const appRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return db.user.findUnique({ where: { id: input.id } });
    }),
});

// 客户端调用 - 完全类型安全!
const user = await trpc.getUser.query({ id: 1 });
//    ^? { id: number, name: string, ... }
```

#### 2. Query vs Mutation

| 操作类型 | 用途 | 示例 |
|---------|------|------|
| `.query()` | 读取数据 | 获取用户、文章列表 |
| `.mutation()` | 修改数据 | 创建、更新、删除 |

```ts
// Query - 用于读取
getUserById: publicProcedure
  .input(z.number())
  .query(({ input }) => db.user.findUnique({ where: { id: input } }))

// Mutation - 用于写入
createUser: publicProcedure
  .input(z.object({ name: z.string() }))
  .mutation(({ input }) => db.user.create({ data: input }))
```

#### 3. 中间件和上下文

```ts
// 创建带认证的 procedure
const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

### 客户端集成

#### React Query 集成
```tsx
const { data, isLoading, error } = trpc.getUser.useQuery({ id: 1 });

const createMutation = trpc.createUser.useMutation({
  onSuccess: () => {
    // 刷新用户列表
    trpc.useUtils().getUsers.invalidate();
  },
});
```

#### 批量查询
```tsx
// 这三个请求会被自动批量合并为一个 HTTP 请求
const user1 = trpc.getUser.useQuery({ id: 1 });
const user2 = trpc.getUser.useQuery({ id: 2 });
const user3 = trpc.getUser.useQuery({ id: 3 });
```

### 分页模式

#### Offset Pagination(简单但慢)
```ts
.input(z.object({ page: z.number() }))
.query(({ input }) => {
  const skip = (input.page - 1) * 10;
  return db.post.findMany({ skip, take: 10 });
})
```

#### Cursor Pagination(推荐)
```ts
.input(z.object({ cursor: z.number().optional() }))
.query(({ input }) => {
  const items = await db.post.findMany({
    take: 10 + 1, // 多取一个判断是否有下一页
    cursor: input.cursor ? { id: input.cursor } : undefined,
    skip: input.cursor ? 1 : 0,
  });
  
  let nextCursor = undefined;
  if (items.length > 10) {
    const nextItem = items.pop();
    nextCursor = nextItem.id;
  }
  
  return { items, nextCursor };
})
```

### 乐观更新模式

```tsx
const utils = trpc.useUtils();

const likeMutation = trpc.toggleLike.useMutation({
  // 1. 立即更新 UI
  onMutate: async (variables) => {
    await utils.getLikes.cancel();
    const prev = utils.getLikes.getData();
    utils.getLikes.setData(undefined, (old) => ({
      ...old,
      likes: old.likes + 1,
    }));
    return { prev };
  },
  
  // 2. 失败时回滚
  onError: (err, variables, context) => {
    utils.getLikes.setData(undefined, context.prev);
  },
  
  // 3. 成功后刷新
  onSuccess: () => {
    utils.getLikes.invalidate();
  },
});
```

### 错误处理

```ts
import { TRPCError } from '@trpc/server';

throw new TRPCError({
  code: 'NOT_FOUND',
  message: '用户不存在',
});
```

**错误代码**:
- `BAD_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `INTERNAL_SERVER_ERROR` (500)

---

## 🔗 相关资源

- [tRPC 官方文档](https://trpc.io/docs)
- [tRPC + Next.js 完整示例](https://trpc.io/docs/nextjs)
- [React Query 文档](https://tanstack.com/query/latest)
- [Zod 验证库](https://zod.dev/)
