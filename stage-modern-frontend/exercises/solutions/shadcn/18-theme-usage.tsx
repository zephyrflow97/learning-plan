// app/page.tsx

import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">主题切换示例</h1>
      
      <ThemeToggle />

      <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">示例卡片</h2>
        <p className="text-gray-600 dark:text-gray-300">
          这个卡片会根据主题自动切换颜色。
        </p>
      </div>
    </div>
  );
}
