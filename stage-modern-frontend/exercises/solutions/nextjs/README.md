# Next.js 练习题答案

本目录包含 Next.js App Router 相关练习题的答案。

## 📋 练习题列表

### 5. 静态页面生成
- **文件**: `05-about-page.tsx`
- **技术点**: 文件路由、Server Component、Metadata
- **关键概念**:
  - 文件路由: `app/about/page.tsx` → `/about`
  - `export const metadata` 静态元数据
  - Server Component: 默认所有组件都是服务端组件

### 12. Server Actions 表单提交
- **文件**:
  - `12-server-actions-actions.ts` - Server Action 定义
  - `12-server-actions-page.tsx` - 服务端页面组件
  - `12-server-actions-form.tsx` - 客户端表单组件
- **技术点**: Server Actions、FormData、revalidatePath
- **关键概念**:
  - `'use server'` 标记服务端函数
  - `FormData` 获取表单数据
  - `revalidatePath()` 刷新缓存数据
  - `useFormStatus()` 获取表单提交状态

### 19. 服务端 + 客户端数据同步
- **文件**:
  - `19-hybrid-router.ts` - tRPC Router
  - `19-hybrid-page.tsx` - Server Component
  - `19-hybrid-client.tsx` - Client Component
- **技术点**: Server Component、Client Component、数据流
- **关键概念**:
  - Server Component 在服务端渲染,可直接访问数据库
  - Client Component 标记 `'use client'`,可使用 hooks
  - 数据通过 props 从 Server → Client

---

## 🎯 学习要点

### App Router vs Pages Router

| 特性 | App Router | Pages Router |
|------|-----------|--------------|
| 路由文件 | `app/page.tsx` | `pages/index.tsx` |
| 布局 | `layout.tsx` | `_app.tsx` |
| Server Component | 默认 | 不支持 |
| Data Fetching | `async` 组件 | `getServerSideProps` |
| 推荐使用 | ✅ 新项目 | ❌ 已废弃 |

### Server Component vs Client Component

#### Server Component (默认)
```tsx
// app/page.tsx
export default async function Page() {
  const data = await db.query(); // 直接访问数据库
  return <div>{data}</div>;
}
```

**优点**:
- 不增加客户端 bundle 大小
- 可以直接访问数据库和文件系统
- 更好的 SEO

**限制**:
- 不能使用 hooks (useState、useEffect 等)
- 不能添加事件监听器

#### Client Component
```tsx
'use client'; // 必须标记

import { useState } from 'react';

export default function Component() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**何时使用**:
- 需要使用 React hooks
- 需要事件监听器
- 需要浏览器 API (localStorage、window 等)

### Server Actions

```tsx
// actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.post.create({ data: { title } });
  revalidatePath('/posts'); // 刷新缓存
}
```

**优点**:
- 类型安全
- 不需要手写 API 路由
- 自动处理序列化
- 渐进增强(无 JS 也能工作)

### 数据获取模式

```tsx
// 服务端获取初始数据
export default async function Page() {
  const posts = await db.post.findMany();
  
  // 传递给客户端组件
  return <ClientList initialPosts={posts} />;
}
```

---

## 🔗 相关资源

- [Next.js App Router 官方文档](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [File Conventions](https://nextjs.org/docs/app/api-reference/file-conventions)
