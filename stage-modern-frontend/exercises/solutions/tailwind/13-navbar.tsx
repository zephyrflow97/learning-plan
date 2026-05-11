'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: '首页', href: '#home' },
    { name: '关于', href: '#about' },
    { name: '服务', href: '#services' },
    { name: '联系', href: '#contact' },
  ];

  const handleMenuClick = () => {
    console.log('[导航栏] 菜单项被点击,关闭移动端菜单');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#" className="text-2xl font-bold text-blue-600">
              MyApp
            </a>
          </div>

          {/* 桌面端菜单 */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map(item => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* 移动端汉堡图标 */}
          <button
            className="md:hidden"
            onClick={() => {
              setIsOpen(!isOpen);
              console.log('[导航栏] 切换菜单状态:', !isOpen);
            }}
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                // X 图标(关闭)
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                // 汉堡图标(打开)
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端菜单(可展开) */}
      <div
        className={`
          md:hidden bg-white border-t border-gray-200
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {menuItems.map(item => (
          <a
            key={item.name}
            href={item.href}
            onClick={handleMenuClick}
            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 transition"
          >
            {item.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
