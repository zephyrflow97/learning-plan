/**
 * 嵌套布局示例
 * 
 * 嵌套布局允许不同的路由段使用不同的布局:
 * - 根布局: 全局导航 + 页脚
 * - Dashboard 布局: 侧边栏 + 主内容
 * - Blog 布局: 文章侧边栏
 * 
 * 布局是嵌套的,像俄罗斯套娃:
 * <RootLayout>
 *   <DashboardLayout>
 *     <DashboardPage />
 *   </DashboardLayout>
 * </RootLayout>
 * 
 * 文件位置: app/dashboard/layout.tsx
 * 
 * @see examples/layouts/RootLayout.tsx
 */

/**
 * Dashboard 布局
 * 
 * 这个布局只对 /dashboard 路由及其子路由生效
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[DashboardLayout] 渲染 Dashboard 布局');
  console.log('[DashboardLayout] 这个布局包裹所有 /dashboard/* 页面');

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 - Dashboard 所有页面共享 */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">仪表盘</h2>
          
          <nav className="space-y-2">
            <a 
              href="/dashboard" 
              className="block px-4 py-2 rounded hover:bg-gray-800"
            >
              📊 概览
            </a>
            <a 
              href="/dashboard/analytics" 
              className="block px-4 py-2 rounded hover:bg-gray-800"
            >
              📈 分析
            </a>
            <a 
              href="/dashboard/users" 
              className="block px-4 py-2 rounded hover:bg-gray-800"
            >
              👥 用户
            </a>
            <a 
              href="/dashboard/settings" 
              className="block px-4 py-2 rounded hover:bg-gray-800"
            >
              ⚙️ 设置
            </a>
          </nav>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1">
        {/* 顶部操作栏 */}
        <div className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                新建
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </div>

        {/* 页面内容 - children */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * 完整的渲染结构:
 * 
 * 访问 /dashboard/settings 时:
 * 
 * <RootLayout>                  ← app/layout.tsx
 *   <header>全局导航</header>
 *   <main>
 *     <DashboardLayout>         ← app/dashboard/layout.tsx
 *       <aside>侧边栏</aside>
 *       <div>
 *         <SettingsPage />      ← app/dashboard/settings/page.tsx
 *       </div>
 *     </DashboardLayout>
 *   </main>
 *   <footer>全局页脚</footer>
 * </RootLayout>
 */

/**
 * 另一个示例:博客布局
 * 
 * 文件位置: app/blog/layout.tsx
 */
export function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-8">
      {/* 主内容 */}
      <div className="col-span-2">
        {children}
      </div>

      {/* 侧边栏 - 博客特有 */}
      <aside className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">热门文章</h3>
          <ul className="space-y-2">
            <li><a href="/blog/post-1" className="text-blue-600">文章 1</a></li>
            <li><a href="/blog/post-2" className="text-blue-600">文章 2</a></li>
            <li><a href="/blog/post-3" className="text-blue-600">文章 3</a></li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="font-bold mb-4">分类</h3>
          <ul className="space-y-2">
            <li><a href="/blog/category/tech" className="text-blue-600">技术</a></li>
            <li><a href="/blog/category/life" className="text-blue-600">生活</a></li>
            <li><a href="/blog/category/travel" className="text-blue-600">旅行</a></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

/**
 * 布局的嵌套规则:
 * 
 * 1. 子布局会包裹在父布局内
 * 2. 页面切换时,只有改变的布局会重新渲染
 * 3. 共享的布局会保持状态(不重新挂载)
 * 
 * 示例:
 * 
 * /dashboard → /dashboard/settings
 * 
 * - RootLayout: ✅ 不重新渲染(共享)
 * - DashboardLayout: ✅ 不重新渲染(共享)
 * - Page: ❌ 重新渲染(从 DashboardPage → SettingsPage)
 * 
 * /dashboard → /blog
 * 
 * - RootLayout: ✅ 不重新渲染(共享)
 * - DashboardLayout: ❌ 卸载
 * - BlogLayout: ❌ 挂载
 * - Page: ❌ 重新渲染
 */

/**
 * 性能优化:
 * 
 * 布局不重新渲染的好处:
 * 1. 侧边栏的滚动位置保持
 * 2. 输入框的焦点状态保持
 * 3. React 组件状态保持
 * 4. 不重复发起相同的数据请求
 * 
 * 这就是为什么 Next.js 使用嵌套布局而不是每个页面都有独立的布局。
 */

/**
 * Template vs Layout:
 * 
 * Layout: 页面切换时保持状态(不重新挂载)
 * Template: 每次页面切换都重新挂载
 * 
 * 文件位置: app/dashboard/template.tsx
 * 
 * export default function DashboardTemplate({ children }) {
 *   console.log('每次页面切换都会执行');
 *   return <div>{children}</div>;
 * }
 * 
 * 使用场景:
 * - 需要每次进入页面都触发动画
 * - 需要每次都重置状态
 * - 需要每次都记录页面浏览
 */
