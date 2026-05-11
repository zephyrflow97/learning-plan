/**
 * 预拉取（Prefetching）示例
 * 
 * 展示如何在 Server Component 中预拉取数据，提升首屏加载速度
 */

import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '../routers/_app';
import { createContext } from '../routers/trpc';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { UserList } from './UserList';

// ==========================================
// Server Component - 预拉取数据
// ==========================================

export default async function UsersPage() {
  console.log('[Server Component] UsersPage: 开始预拉取数据');

  // 创建 Server-Side Helpers
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext({
      req: {} as any,
      res: {} as any,
    }),
  });

  // ✅ 在服务端预拉取数据
  await helpers.user.list.prefetch({ page: 1, limit: 10 });
  console.log('[Server Component] 数据已预拉取完成');

  return (
    <HydrationBoundary state={helpers.dehydrate()}>
      {/* 客户端组件会立刻使用预拉取的数据，不需要等待 */}
      <UserList />
    </HydrationBoundary>
  );
}

// ==========================================
// 使用说明
// ==========================================

/**
 * 预拉取的好处：
 * 
 * 1. **首屏速度更快**
 *    - 服务端渲染时就已经获取了数据
 *    - 客户端组件立刻显示内容，无 loading 状态
 * 
 * 2. **SEO 友好**
 *    - 数据在 HTML 中，搜索引擎可以抓取
 * 
 * 3. **用户体验更好**
 *    - 用户看到页面就有内容，不是白屏或骨架屏
 * 
 * 
 * 工作流程：
 * 
 * 1. Server Component 渲染时:
 *    - 创建 helpers
 *    - 调用 helpers.user.list.prefetch()
 *    - 服务端执行查询，获取数据
 *    - 数据序列化后嵌入 HTML
 * 
 * 2. 客户端 Hydration 时:
 *    - HydrationBoundary 将数据注入 TanStack Query 缓存
 *    - UserList 组件调用 useQuery 时，立刻从缓存获取数据
 *    - 无需等待网络请求
 * 
 * 3. 后续行为:
 *    - 如果数据过时（staleTime 到期），自动后台刷新
 *    - 用户始终看到内容，体验流畅
 */
