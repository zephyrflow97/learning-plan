/**
 * tRPC 客户端配置
 * 
 * 用于在 Next.js App Router 中配置 tRPC 客户端
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from '../routers/_app';
import superjson from 'superjson';

// ==========================================
// 创建 tRPC React Query 客户端
// ==========================================

export const trpc = createTRPCReact<AppRouter>();

// ==========================================
// 创建 tRPC 客户端实例
// ==========================================

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      // Logger Link（开发环境）
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),

      // HTTP Batch Link（批量处理请求）
      httpBatchLink({
        url: '/api/trpc',
        
        // 可选：批处理配置
        // maxURLLength: 2083, // 防止 URL 过长
        
        // 可选：自定义 headers
        headers() {
          return {
            // 如果需要，可以添加认证 token
            // authorization: `Bearer ${getToken()}`,
          };
        },
      }),
    ],
    
    // 使用 SuperJSON 序列化
    transformer: superjson,
  });
}

// ==========================================
// 使用说明
// ==========================================

/**
 * 在 Next.js App Router 中使用：
 * 
 * 1. 创建 Provider 组件（app/providers.tsx）
 * 
 * ```tsx
 * 'use client';
 * 
 * import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 * import { useState } from 'react';
 * import { trpc, createTRPCClient } from './trpc';
 * 
 * export function TRPCProvider({ children }: { children: React.ReactNode }) {
 *   const [queryClient] = useState(() => new QueryClient());
 *   const [trpcClient] = useState(() => createTRPCClient());
 * 
 *   return (
 *     <trpc.Provider client={trpcClient} queryClient={queryClient}>
 *       <QueryClientProvider client={queryClient}>
 *         {children}
 *       </QueryClientProvider>
 *     </trpc.Provider>
 *   );
 * }
 * ```
 * 
 * 2. 在 layout.tsx 中使用 Provider
 * 
 * ```tsx
 * import { TRPCProvider } from './providers';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <TRPCProvider>{children}</TRPCProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * 3. 在组件中使用
 * 
 * ```tsx
 * 'use client';
 * 
 * import { trpc } from './trpc';
 * 
 * export function UserList() {
 *   const { data, isLoading } = trpc.user.list.useQuery({ page: 1 });
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return (
 *     <ul>
 *       {data?.users.map(user => (
 *         <li key={user.id}>{user.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
