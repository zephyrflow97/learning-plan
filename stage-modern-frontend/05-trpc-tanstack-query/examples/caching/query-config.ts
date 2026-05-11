// ==========================================
// Query 缓存配置示例
// ==========================================

import { QueryClient } from '@tanstack/react-query';

/**
 * 创建自定义 QueryClient
 * 
 * 这里展示了各种缓存策略的配置。
 * 你可以根据应用的需求调整这些参数。
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * staleTime (过时时间)
         * 
         * 数据在这个时间内被认为是"新鲜的"，不会重新拉取。
         * 
         * 默认: 0ms (立刻过时)
         * 推荐:
         * - 静态数据（如配置）: Infinity
         * - 用户数据: 5 分钟
         * - 实时数据: 30 秒
         */
        staleTime: 5 * 60 * 1000, // 5 分钟
        
        /**
         * gcTime (垃圾回收时间，旧名 cacheTime)
         * 
         * 数据在内存中保留多久（即使组件已卸载）
         * 
         * 默认: 5 分钟
         * 推荐: 2-3 倍的 staleTime
         */
        gcTime: 10 * 60 * 1000, // 10 分钟
        
        /**
         * refetchOnWindowFocus
         * 
         * 用户切换回浏览器 tab 时，是否重新拉取数据
         * 
         * 默认: true
         * 推荐:
         * - 社交媒体、仪表盘: true
         * - 表单、编辑器: false（避免打断用户）
         */
        refetchOnWindowFocus: true,
        
        /**
         * refetchOnReconnect
         * 
         * 网络重新连接时，是否重新拉取数据
         * 
         * 默认: true
         */
        refetchOnReconnect: true,
        
        /**
         * refetchOnMount
         * 
         * 组件挂载时，是否重新拉取数据
         * 
         * 默认: true
         * 选项:
         * - true: 总是重新拉取
         * - false: 从不重新拉取
         * - 'always': 即使数据新鲜也重新拉取
         */
        refetchOnMount: true,
        
        /**
         * retry (重试次数)
         * 
         * 查询失败时重试几次
         * 
         * 默认: 3
         * 推荐:
         * - 关键数据: 3-5
         * - 非关键数据: 1-2
         * - 昂贵查询: 0-1
         */
        retry: 3,
        
        /**
         * retryDelay (重试延迟)
         * 
         * 失败后等待多久再重试
         * 
         * 默认: 指数退避 (1s, 2s, 4s, 8s...)
         */
        retryDelay: (attemptIndex) => {
          // 指数退避，最大 30 秒
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
        
        /**
         * networkMode
         * 
         * 网络模式
         * 
         * - 'online': 只在在线时查询
         * - 'always': 即使离线也查询
         * - 'offlineFirst': 离线优先
         */
        networkMode: 'online',
      },
      
      mutations: {
        /**
         * Mutation 默认配置
         * 
         * ⚠️ Mutation 有副作用，通常不应重试
         */
        retry: false,
        
        /**
         * networkMode
         * 
         * - 'online': 只在在线时执行
         * - 'always': 即使离线也执行（会排队）
         */
        networkMode: 'online',
      },
    },
  });
};

/**
 * 📚 不同场景的缓存策略
 */

/**
 * 场景 1: 静态配置数据
 * 
 * 特点: 几乎不变化
 * 策略: 永久缓存
 */
export const staticDataConfig = {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

/**
 * 场景 2: 用户资料数据
 * 
 * 特点: 不经常变化
 * 策略: 中等缓存时间
 */
export const userProfileConfig = {
  staleTime: 5 * 60 * 1000,  // 5 分钟
  gcTime: 10 * 60 * 1000,    // 10 分钟
  refetchOnWindowFocus: true,
};

/**
 * 场景 3: 实时数据（如股票价格）
 * 
 * 特点: 频繁变化
 * 策略: 短缓存时间 + 自动轮询
 */
export const realtimeDataConfig = {
  staleTime: 0,                // 立刻过时
  gcTime: 1 * 60 * 1000,       // 1 分钟
  refetchOnWindowFocus: true,
  refetchInterval: 30000,      // 每 30 秒轮询一次
};

/**
 * 场景 4: 表单数据
 * 
 * 特点: 用户正在编辑
 * 策略: 避免自动刷新（防止打断用户）
 */
export const formDataConfig = {
  staleTime: Infinity,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false, // ⚠️ 关键：避免刷新打断用户编辑
  refetchOnMount: false,
};

/**
 * 场景 5: 分页列表
 * 
 * 特点: 需要保留多页缓存
 * 策略: 较长的 gcTime，使用 keepPreviousData
 */
export const paginatedListConfig = {
  staleTime: 2 * 60 * 1000,   // 2 分钟
  gcTime: 30 * 60 * 1000,     // 30 分钟（保留多页缓存）
  // keepPreviousData: true,   // 切换页面时，保留旧数据（避免 loading）
};

/**
 * 📚 使用示例
 * 
 * ```typescript
 * import { staticDataConfig } from '@/config/query-config';
 * 
 * function ConfigPage() {
 *   const { data } = useQuery({
 *     queryKey: ['config'],
 *     queryFn: fetchConfig,
 *     ...staticDataConfig, // 应用静态数据配置
 *   });
 * }
 * ```
 */

/**
 * 📚 内存管理
 * 
 * 问题：如果用户浏览了 100 个用户的资料，是不是会缓存 100 个用户？
 * 答案：是的，直到 gcTime 到期。
 * 
 * 解决方案：
 * 1. 合理设置 gcTime（不要设太长）
 * 2. 手动清理不需要的缓存：
 * 
 * ```typescript
 * // 清理特定用户的缓存
 * queryClient.removeQueries({ queryKey: ['user', userId] });
 * 
 * // 清理所有用户缓存
 * queryClient.removeQueries({ queryKey: ['user'] });
 * ```
 */

/**
 * 📚 调试缓存
 * 
 * TanStack Query DevTools 可以查看缓存状态：
 * 
 * ```tsx
 * import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
 * 
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <ReactQueryDevtools initialIsOpen={false} />
 *     </>
 *   );
 * }
 * ```
 * 
 * DevTools 显示：
 * - 所有缓存的查询
 * - 每个查询的状态（fresh/stale/inactive）
 * - 查询的数据
 * - 查询的历史（refetch、error 等）
 */
