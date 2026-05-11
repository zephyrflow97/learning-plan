/**
 * 根布局示例
 * 
 * 根布局 (Root Layout) 是整个应用的最外层布局,所有页面都会包裹在其中。
 * 
 * 特点:
 * 1. ✅ 必需的 - 每个 Next.js 应用必须有根布局
 * 2. ✅ 必须包含 <html> 和 <body> 标签
 * 3. ✅ 只在应用启动时渲染一次(页面切换时不重新渲染)
 * 4. ✅ 可以包含全局状态、主题提供者、分析脚本等
 * 
 * 文件位置: app/layout.tsx
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
 */

import './globals.css';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

/**
 * 配置字体
 * Next.js 会自动优化字体加载(内联字体 CSS,避免布局偏移)
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * 元数据配置
 * 
 * 这些元数据会被 Next.js 自动注入到 <head> 中
 */
export const metadata = {
  title: {
    default: '我的应用',
    template: '%s | 我的应用', // 子页面可以用 title: '关于' → '关于 | 我的应用'
  },
  description: '这是一个使用 Next.js App Router 构建的应用',
  keywords: ['Next.js', 'React', 'TypeScript'],
  authors: [{ name: 'Your Name' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  console.log('[RootLayout] 渲染根布局');
  console.log('[RootLayout] 这条日志只在应用启动时出现一次');
  console.log('[RootLayout] 页面切换时不会重新渲染');

  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-screen bg-gray-50">
        {/* 全局导航栏 - 所有页面共享 */}
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold">
                我的应用
              </a>
              <ul className="flex gap-6">
                <li><a href="/" className="hover:text-blue-600">首页</a></li>
                <li><a href="/about" className="hover:text-blue-600">关于</a></li>
                <li><a href="/blog" className="hover:text-blue-600">博客</a></li>
                <li><a href="/dashboard" className="hover:text-blue-600">仪表盘</a></li>
              </ul>
            </div>
          </nav>
        </header>

        {/* 主内容区 - children 是当前页面的内容 */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* 全局页脚 - 所有页面共享 */}
        <footer className="bg-gray-800 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-center text-sm">
              © 2024 我的应用. All rights reserved.
            </p>
          </div>
        </footer>

        {/* Analytics - 只需要添加一次 */}
        <Analytics />
      </body>
    </html>
  );
}

/**
 * 渲染结构示例:
 * 
 * 访问 /about 时:
 * 
 * <RootLayout>
 *   <header>全局导航栏</header>
 *   <main>
 *     <AboutPage />  ← children
 *   </main>
 *   <footer>全局页脚</footer>
 * </RootLayout>
 * 
 * 访问 /dashboard 时:
 * 
 * <RootLayout>
 *   <header>全局导航栏</header>
 *   <main>
 *     <DashboardLayout>
 *       <aside>仪表盘侧边栏</aside>
 *       <DashboardPage />
 *     </DashboardLayout>
 *   </main>
 *   <footer>全局页脚</footer>
 * </RootLayout>
 */

/**
 * 常见用途:
 * 
 * 1. 全局样式
 * import './globals.css';
 * 
 * 2. 字体加载
 * const inter = Inter({ subsets: ['latin'] });
 * <body className={inter.className}>
 * 
 * 3. 主题提供者
 * <ThemeProvider>
 *   {children}
 * </ThemeProvider>
 * 
 * 4. 状态管理
 * <ReduxProvider>
 *   {children}
 * </ReduxProvider>
 * 
 * 5. 分析和监控
 * <Analytics />
 * <SpeedInsights />
 * 
 * 6. 认证上下文
 * <SessionProvider>
 *   {children}
 * </SessionProvider>
 */

/**
 * ❌ 常见错误:
 * 
 * 错误 1: 忘记 <html> 和 <body>
 * export default function RootLayout({ children }) {
 *   return <div>{children}</div>; // ❌ 必须包含 <html> 和 <body>
 * }
 * 
 * 错误 2: 在 Layout 中使用 usePathname 而不标记 'use client'
 * import { usePathname } from 'next/navigation';
 * export default function RootLayout({ children }) {
 *   const pathname = usePathname(); // ❌ 需要 'use client'
 * }
 * 
 * 正确做法: 把需要交互的部分提取为 Client Component
 * 'use client';
 * import { usePathname } from 'next/navigation';
 * export function Navigation() {
 *   const pathname = usePathname();
 *   return <nav>...</nav>;
 * }
 * 
 * // layout.tsx (Server Component)
 * import { Navigation } from './Navigation';
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Navigation />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 */
