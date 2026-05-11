// Tailwind CSS 仪表盘布局示例
// 使用 Grid 实现经典的侧边栏+顶栏+内容区布局

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[240px_1fr] grid-rows-[64px_1fr] h-screen">
      {/* 
        列定义：240px（侧边栏固定宽度） + 1fr（主内容区自适应）
        行定义：64px（顶栏固定高度） + 1fr（内容区自适应）
      */}

      {/* 顶栏（横跨两列） */}
      <header className="col-span-2 flex items-center px-6 bg-white border-b">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </header>

      {/* 侧边栏 */}
      <aside className="bg-gray-900 text-white p-4">
        <nav className="flex flex-col gap-2">
          <a href="#" className="p-2 rounded hover:bg-gray-800">Home</a>
          <a href="#" className="p-2 rounded hover:bg-gray-800">Analytics</a>
          <a href="#" className="p-2 rounded hover:bg-gray-800">Settings</a>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="p-6 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

console.log('🎨 仪表盘布局结构:');
console.log('┌─────────┬─────────────┐');
console.log('│  Header (col-span-2)  │  ← 64px 高');
console.log('├─────────┼─────────────┤');
console.log('│ Sidebar │   Content   │');
console.log('│ 240px   │   自适应    │  ← 剩余高度');
console.log('└─────────┴─────────────┘');
