# Next.js App Router 代码示例

本目录包含从主文档中提取的完整代码示例。所有代码都包含详细注释、日志输出和使用说明,可以直接复制到项目中运行。

## 📁 目录结构

```
examples/
├── client-components/      # 客户端组件示例
├── server-components/      # 服务器组件示例
├── server-actions/         # Server Actions 示例
├── middleware/             # 中间件示例
└── streaming/              # 流式渲染示例
```

## 🎯 示例索引

### 客户端组件 (Client Components)

| 文件 | 说明 | 关键概念 |
|------|------|---------|
| [`client-components/OldClientFetching.tsx`](./client-components/OldClientFetching.tsx) | 传统 React 客户端数据获取 | useState, useEffect, Loading 状态 |

**适用场景**: 理解为什么需要 Server Components,学习传统方式的缺点。

---

### 服务器组件 (Server Components)

| 文件 | 说明 | 关键概念 |
|------|------|---------|
| [`server-components/ServerFetching.tsx`](./server-components/ServerFetching.tsx) | Server Component 直接查询数据库 | async 组件, 直接数据库访问 |

**适用场景**: 数据获取、SEO 优化、减少客户端 JS 体积。

---

### Server Actions

| 文件 | 说明 | 关键概念 |
|------|------|---------|
| [`server-actions/TodoActions.ts`](./server-actions/TodoActions.ts) | 完整的 CRUD 操作 | Zod 验证, 错误处理, revalidation |
| [`server-actions/TodoForm.tsx`](./server-actions/TodoForm.tsx) | 表单组件 | useFormStatus, useOptimistic, 乐观更新 |

**适用场景**: 表单提交、数据变更、乐观更新。

---

### 中间件 (Middleware)

| 文件 | 说明 | 关键概念 |
|------|------|---------|
| [`middleware/01-basic-middleware.ts`](./middleware/01-basic-middleware.ts) | 基础中间件 | URL 重定向, Headers, A/B 测试 |
| [`middleware/02-auth-middleware.ts`](./middleware/02-auth-middleware.ts) | 认证检查 | Cookie 验证, 登录重定向 |
| [`middleware/03-i18n-middleware.ts`](./middleware/03-i18n-middleware.ts) | 国际化 | 语言检测, Accept-Language |
| [`middleware/04-rate-limiting-middleware.ts`](./middleware/04-rate-limiting-middleware.ts) | 速率限制 | Rate Limiting, Redis 方案 |

**适用场景**: 认证、国际化、速率限制、URL 重写。

---

### 流式渲染 (Streaming)

| 文件 | 说明 | 关键概念 |
|------|------|---------|
| [`streaming/StreamingExample.tsx`](./streaming/StreamingExample.tsx) | 多层 Suspense 示例 | 渐进式加载, 性能优化 |

**适用场景**: 仪表盘、慢数据加载、提升首屏性能。

---

## 🚀 如何使用

### 1. 复制代码到项目

每个示例都是独立的,可以直接复制到你的 Next.js 项目中:

```bash
# 例如:复制 Server Actions 示例
cp examples/server-actions/TodoActions.ts app/actions/todos.ts
```

### 2. 安装依赖

某些示例需要额外的依赖:

```bash
# Server Actions 验证
npm install zod

# 数据库操作(示例中使用 Prisma)
npm install @prisma/client
npm install -D prisma
```

### 3. 配置环境

根据示例需要配置数据库、环境变量等:

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

### 4. 运行示例

```bash
npm run dev
```

---

## 📝 代码规范

所有示例遵循以下规范:

1. **详细注释**: 每个关键步骤都有注释说明
2. **日志输出**: 使用 `console.log` 展示执行流程
3. **错误处理**: 包含完整的错误处理逻辑
4. **类型安全**: 使用 TypeScript 类型注解
5. **最佳实践**: 遵循 Next.js 官方推荐的最佳实践

---

## 🔗 相关资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [主文档 README](../README.md)

---

## ⚠️ 注意事项

1. **生产环境使用**: 这些示例用于学习,生产环境需要额外的安全措施(如 CSRF token、输入清理等)
2. **Edge Runtime 限制**: 中间件示例运行在 Edge Runtime,不能使用 Node.js API
3. **数据库连接**: Server Components 示例假设你已配置好数据库(Prisma)

---

最后更新: 2026-02-08
