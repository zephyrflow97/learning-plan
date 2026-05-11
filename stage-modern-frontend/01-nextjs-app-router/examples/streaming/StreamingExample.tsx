/**
 * 流式渲染(Streaming SSR)示例
 * 
 * 这个文件展示了 Next.js 的流式渲染能力:
 * - 使用 Suspense 组件包裹慢速内容
 * - 多层 Suspense 实现渐进式加载
 * - 性能对比(传统 SSR vs 流式 SSR)
 * - 实战示例:仪表盘页面
 * 
 * 核心概念:
 * - 不等所有数据准备好再返回 HTML
 * - 快速内容立即发送,慢速内容后续流式传输
 * - 用户立刻看到内容,而不是盯着空白屏幕
 * 
 * 使用位置: app/dashboard/page.tsx
 */

import { Suspense } from 'react';
import { db } from '@/lib/db';

// ==================== 类型定义 ====================

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  orders: number;
}

interface ChartData {
  labels: string[];
  values: number[];
}

// ==================== Loading 组件 ====================

/**
 * 骨架屏(Skeleton)组件
 * 
 * 在数据加载时显示占位符,提升用户体验
 */
function UserInfoSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

// ==================== 数据获取函数 ====================

/**
 * 获取用户信息(快速查询,~50ms)
 */
async function getUser(userId: string): Promise<User> {
  console.log('🟢 [Streaming] 开始获取用户信息');
  const startTime = Date.now();

  // 模拟数据库查询
  await new Promise(resolve => setTimeout(resolve, 50));

  const user: User = {
    id: userId,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
  };

  const duration = Date.now() - startTime;
  console.log('✅ [Streaming] 用户信息获取完成,耗时:', duration, 'ms');

  return user;
}

/**
 * 获取统计数据(中等速度,~500ms)
 */
async function getStats(): Promise<Stats> {
  console.log('🟢 [Streaming] 开始获取统计数据');
  const startTime = Date.now();

  // 模拟复杂查询(聚合、计算)
  await new Promise(resolve => setTimeout(resolve, 500));

  const stats: Stats = {
    totalUsers: 12534,
    activeUsers: 8291,
    revenue: 145678,
    orders: 3456,
  };

  const duration = Date.now() - startTime;
  console.log('✅ [Streaming] 统计数据获取完成,耗时:', duration, 'ms');

  return stats;
}

/**
 * 生成图表数据(慢速查询,~3000ms)
 */
async function generateChartData(): Promise<ChartData> {
  console.log('🟢 [Streaming] 开始生成图表数据');
  const startTime = Date.now();

  // 模拟慢速查询(复杂聚合、大数据量)
  await new Promise(resolve => setTimeout(resolve, 3000));

  const chartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [4200, 5100, 4800, 6200, 5900, 7100],
  };

  const duration = Date.now() - startTime;
  console.log('✅ [Streaming] 图表数据生成完成,耗时:', duration, 'ms');

  return chartData;
}

/**
 * 获取最近活动(慢速查询,~2000ms)
 */
async function getRecentActivity(): Promise<any[]> {
  console.log('🟢 [Streaming] 开始获取最近活动');
  const startTime = Date.now();

  await new Promise(resolve => setTimeout(resolve, 2000));

  const activities = [
    { id: '1', user: 'Bob', action: '创建了订单', time: '2 分钟前' },
    { id: '2', user: 'Carol', action: '更新了资料', time: '5 分钟前' },
    { id: '3', user: 'David', action: '上传了文件', time: '10 分钟前' },
  ];

  const duration = Date.now() - startTime;
  console.log('✅ [Streaming] 最近活动获取完成,耗时:', duration, 'ms');

  return activities;
}

// ==================== Server Components(异步数据获取) ====================

/**
 * 用户信息组件(快速加载)
 */
async function UserInfo({ userId }: { userId: string }) {
  const user = await getUser(userId);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 统计卡片组件(中等速度)
 */
async function StatsCards() {
  const stats = await getStats();

  const cards = [
    { label: '总用户数', value: stats.totalUsers, icon: '👥' },
    { label: '活跃用户', value: stats.activeUsers, icon: '🟢' },
    { label: '总收入', value: `$${stats.revenue.toLocaleString()}`, icon: '💰' },
    { label: '订单数', value: stats.orders, icon: '📦' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{card.label}</span>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * 收入图表组件(慢速加载)
 */
async function RevenueChart() {
  const chartData = await generateChartData();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">收入趋势</h3>
      <div className="h-64 flex items-end justify-between gap-2">
        {chartData.values.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{
                height: `${(value / Math.max(...chartData.values)) * 100}%`,
              }}
            ></div>
            <span className="text-xs text-gray-600 mt-2">
              {chartData.labels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 最近活动组件(慢速加载)
 */
async function RecentActivity() {
  const activities = await getRecentActivity();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">最近活动</h3>
      <ul className="space-y-3">
        {activities.map(activity => (
          <li key={activity.id} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <strong>{activity.user}</strong> {activity.action}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ==================== 主页面组件(流式渲染) ====================

/**
 * 仪表盘页面 - 使用流式渲染
 * 
 * 渲染时间线(使用 Suspense):
 * 
 * 0ms:    客户端收到 HTML
 *         - 页面标题
 *         - 用户信息 Loading 骨架屏
 *         - 统计数据 Loading 骨架屏
 *         - 图表 Loading 骨架屏
 * 
 * 50ms:   用户信息流式传输完成
 *         - 用户信息替换骨架屏
 *         - 其他部分仍显示 Loading
 * 
 * 500ms:  统计数据流式传输完成
 *         - 统计卡片替换骨架屏
 *         - 图表仍显示 Loading
 * 
 * 2000ms: 最近活动流式传输完成
 *         - 活动列表显示
 * 
 * 3000ms: 图表流式传输完成
 *         - 页面完全加载完毕
 * 
 * 用户在第 0ms 就看到了结构,不再盯着空白屏幕!
 */
export default function DashboardPage() {
  const userId = 'user-123'; // 从 session 获取

  console.log('🟢 [Streaming] 开始渲染仪表盘页面');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 静态内容 - 立即显示 */}
      <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>

      {/* 快速内容 - 第 1 优先级(~50ms) */}
      <Suspense fallback={<UserInfoSkeleton />}>
        <UserInfo userId={userId} />
      </Suspense>

      {/* 中等速度内容 - 第 2 优先级(~500ms) */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* 布局:图表和活动并排 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 慢速内容 - 第 3 优先级(~3000ms) */}
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>

        {/* 慢速内容 - 第 3 优先级(~2000ms) */}
        <Suspense fallback={<ChartSkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>

      {/* 静态页脚 - 立即显示 */}
      <footer className="text-center text-sm text-gray-500 mt-8">
        最后更新: {new Date().toLocaleString('zh-CN')}
      </footer>
    </div>
  );
}

// ==================== 对比:传统 SSR(无流式渲染) ====================

/**
 * 传统 SSR 的实现(❌ 不推荐)
 * 
 * 问题:
 * 1. 必须等所有数据准备好才返回 HTML
 * 2. 用户等待 3 秒才看到任何内容
 * 3. 慢查询阻塞了快查询的显示
 */
/*
export default async function DashboardPageTraditional() {
  const userId = 'user-123';

  console.log('🟢 [Traditional] 开始获取所有数据');
  const startTime = Date.now();

  // ❌ 串行获取所有数据(总耗时: 50 + 500 + 3000 + 2000 = 5550ms)
  const user = await getUser(userId);
  const stats = await getStats();
  const chartData = await generateChartData();
  const activities = await getRecentActivity();

  const duration = Date.now() - startTime;
  console.log('✅ [Traditional] 所有数据获取完成,总耗时:', duration, 'ms');

  // 用户在这 5.5 秒内看到的是空白屏幕!

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">仪表盘</h1>
      
      <div>用户: {user.name}</div>
      <div>统计: {stats.totalUsers} 用户</div>
      <div>图表数据已加载</div>
      <div>活动: {activities.length} 条</div>
    </div>
  );
}
*/

// ==================== 对比:并行获取(✅ 比传统好,但不如流式) ====================

/**
 * 并行获取数据(改进,但仍不如流式渲染)
 * 
 * 优势:
 * - 总耗时 = 最慢的查询(3000ms)
 * 
 * 劣势:
 * - 用户仍然要等 3 秒才看到任何内容
 * - 快速数据被慢速数据拖累
 */
/*
export default async function DashboardPageParallel() {
  const userId = 'user-123';

  console.log('🟢 [Parallel] 开始并行获取数据');
  const startTime = Date.now();

  // ✅ 并行获取(总耗时: max(50, 500, 3000, 2000) = 3000ms)
  const [user, stats, chartData, activities] = await Promise.all([
    getUser(userId),      // 50ms
    getStats(),           // 500ms
    generateChartData(),  // 3000ms
    getRecentActivity(),  // 2000ms
  ]);

  const duration = Date.now() - startTime;
  console.log('✅ [Parallel] 所有数据获取完成,总耗时:', duration, 'ms');

  // 用户在这 3 秒内看到的是空白屏幕(比 5.5 秒好,但仍然很糟)

  return <div>...</div>;
}
*/

// ==================== 性能对比总结 ====================

/**
 * 性能对比(用户看到第一个内容的时间):
 * 
 * 1. 传统串行 SSR:
 *    - 耗时: 5550ms
 *    - 用户体验: ⭐ (5.5 秒空白屏幕)
 * 
 * 2. 并行 SSR:
 *    - 耗时: 3000ms
 *    - 用户体验: ⭐⭐ (3 秒空白屏幕)
 * 
 * 3. 流式 SSR(Streaming):
 *    - 首屏: 0ms (立即显示结构和 Loading)
 *    - 第一个内容: 50ms (用户信息)
 *    - 第二个内容: 500ms (统计卡片)
 *    - 完全加载: 3000ms (图表)
 *    - 用户体验: ⭐⭐⭐⭐⭐ (渐进式加载,无空白)
 * 
 * 感知性能提升: 60 倍!(从 3000ms 到 50ms)
 */

// ==================== 最佳实践 ====================

/**
 * 1. **合理划分 Suspense 边界**:
 *    - 独立的数据获取 = 独立的 Suspense
 *    - 相关联的内容可以共享一个 Suspense
 * 
 * 2. **设计优质的 Loading 骨架屏**:
 *    - 骨架屏应该和真实内容的布局一致
 *    - 使用动画(animate-pulse)提升体验
 *    - 避免布局跳动(CLS - Cumulative Layout Shift)
 * 
 * 3. **优先级排序**:
 *    - 快速内容先加载(用户信息、导航)
 *    - 慢速内容后加载(图表、大数据列表)
 *    - 可选内容最后加载(推荐、广告)
 * 
 * 4. **错误处理**:
 *    - 每个 Suspense 可以配合 Error Boundary
 *    - 慢查询失败不会影响快查询的显示
 * 
 *    <ErrorBoundary fallback={<ErrorMessage />}>
 *      <Suspense fallback={<Loading />}>
 *        <SlowComponent />
 *      </Suspense>
 *    </ErrorBoundary>
 * 
 * 5. **避免过度嵌套**:
 *    - 不要为每个小组件都包一层 Suspense
 *    - 按"功能区域"划分边界
 */

// ==================== 配合 loading.tsx 使用 ====================

/**
 * app/dashboard/loading.tsx
 * 
 * Next.js 会自动将 page.tsx 包裹在 Suspense 中,
 * loading.tsx 就是 fallback
 * 
 * export default function DashboardLoading() {
 *   return (
 *     <div className="max-w-7xl mx-auto p-6 space-y-6">
 *       <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
 *       <UserInfoSkeleton />
 *       <StatsSkeleton />
 *       <ChartSkeleton />
 *     </div>
 *   );
 * }
 * 
 * 等价于:
 * 
 * <Suspense fallback={<DashboardLoading />}>
 *   <DashboardPage />
 * </Suspense>
 */

// ==================== 监控和调试 ====================

/**
 * 1. 查看流式渲染效果:
 *    - 打开浏览器开发者工具 Network 面板
 *    - 查看 HTML 文档的 Response
 *    - 可以看到 HTML 是分块传输的(Transfer-Encoding: chunked)
 * 
 * 2. 性能测试:
 *    - 使用 React DevTools Profiler
 *    - 测量 Time to First Byte (TTFB)
 *    - 测量 First Contentful Paint (FCP)
 * 
 * 3. 日志输出:
 *    - console.log 会在服务器终端显示
 *    - 观察数据获取的时间线
 */

// ==================== 常见问题 ====================

/**
 * Q: Suspense 的 fallback 何时显示?
 * A: 当组件正在等待异步数据时显示。数据准备好后,React 会替换掉 fallback。
 * 
 * Q: 可以嵌套 Suspense 吗?
 * A: 可以。子 Suspense 独立工作,不影响父 Suspense。
 * 
 * Q: Suspense 在 Client Component 中可用吗?
 * A: 可以,但主要用于 React.lazy() 动态导入,不是数据获取。
 *    数据获取的 Suspense 主要在 Server Components 中使用。
 * 
 * Q: 流式渲染和 ISR/SSG 冲突吗?
 * A: 不冲突。流式渲染用于动态内容,ISR/SSG 用于静态内容。
 *    你可以在静态页面中使用 Suspense + Client Component 实现客户端数据获取。
 * 
 * Q: 如何禁用流式渲染?
 * A: 移除所有 Suspense,所有数据在顶层 await(回到传统 SSR)。
 */
