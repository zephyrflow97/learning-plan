// Tailwind CSS 暗黑模式示例
// 展示如何实现主题切换

'use client';

import { useState, useEffect } from 'react';

export default function DarkModeExample() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 初始化：从 localStorage 读取或跟随系统
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored === 'dark' || (!stored && prefersDark);
    
    setIsDark(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
    
    console.log('🌓 主题初始化:', initialDark ? '暗黑' : '亮色');
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    
    console.log('🔄 主题切换至:', newDark ? '暗黑' : '亮色');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* 顶栏 */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dark Mode Demo
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 卡片示例 */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Card {i}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This card adapts to both light and dark themes automatically.
              </p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition">
                Learn More
              </button>
            </div>
          ))}
        </div>

        {/* 表单示例 */}
        <div className="mt-12 max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Contact Form
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your message"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* 代码示例 */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Implementation
          </h2>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-200">
{`<!-- HTML 根元素 -->
<html class="dark">  <!-- 添加 dark 类 -->

<!-- 组件使用 dark: 前缀 -->
<div class="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border border-gray-200 dark:border-gray-700
">
  内容会根据暗黑模式自动切换样式
</div>`}
            </pre>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-20 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>Dark mode powered by Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}

console.log('✅ 暗黑模式示例完成');
console.log('🌓 策略: class 模式(手动切换) + localStorage 持久化');
console.log('💡 所有交互元素都支持暗黑模式');
