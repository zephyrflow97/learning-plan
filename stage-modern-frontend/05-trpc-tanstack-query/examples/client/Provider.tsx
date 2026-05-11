/**
 * TRPCProvider 组件
 * 
 * 封装 tRPC + TanStack Query 的 Provider
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { trpc, createTRPCClient } from './trpc';

// ==========================================
// TRPCProvider 组件
// ==========================================

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  console.log('[Provider] 初始化 TRPCProvider');

  // ✅ 使用 useState 确保客户端实例只创建一次
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认缓存配置
            staleTime: 60 * 1000, // 1 分钟内数据认为是新鲜的
            gcTime: 5 * 60 * 1000, // 5 分钟后从缓存中删除（旧名 cacheTime）
            
            // 默认重试配置
            retry: 1, // 失败后重试 1 次
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // 窗口聚焦时重新拉取
            refetchOnWindowFocus: false, // 建议在生产环境禁用
            refetchOnReconnect: true,
          },
          mutations: {
            // Mutation 默认配置
            retry: 0, // Mutation 默认不重试
          },
        },
      })
  );

  const [trpcClient] = useState(() => createTRPCClient());

  console.log('[Provider] QueryClient 和 TRPCClient 已创建');

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        
        {/* React Query Devtools（开发环境） */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// ==========================================
// 使用说明
// ==========================================

/**
 * 在 app/layout.tsx 中使用：
 * 
 * ```tsx
 * import { TRPCProvider } from './providers/TRPCProvider';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <TRPCProvider>
 *           {children}
 *         </TRPCProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * 配置说明：
 * 
 * 1. **staleTime**: 数据在这个时间内认为是"新鲜的"，不会重新拉取
 *    - 0 (默认): 数据立刻过时
 *    - 60000 (1分钟): 1 分钟内不重新拉取
 *    - Infinity: 永远不过时
 * 
 * 2. **gcTime** (旧名 cacheTime): 数据在内存中保留多久
 *    - 300000 (5分钟): 5 分钟后从缓存中删除
 *    - Infinity: 永远不删除
 * 
 * 3. **refetchOnWindowFocus**: 窗口获得焦点时是否重新拉取
 *    - true: 切换窗口时会重新拉取（可能导致频繁请求）
 *    - false: 不自动重新拉取
 * 
 * 4. **retry**: 失败后重试次数
 *    - 0: 不重试
 *    - 1: 重试 1 次
 *    - 3 (默认): 重试 3 次
 */
