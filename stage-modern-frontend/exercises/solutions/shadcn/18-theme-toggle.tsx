// components/ThemeToggle.tsx

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // 等待客户端水合完成
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // 避免 SSR 不匹配
  }

  console.log('[主题] 当前主题:', theme);

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={() => {
          console.log('[主题] 切换到明亮模式');
          setTheme('light');
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: theme === 'light' ? '#0070f3' : '#ccc',
          color: theme === 'light' ? 'white' : 'black',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ☀️ 明亮
      </button>

      <button
        onClick={() => {
          console.log('[主题] 切换到暗黑模式');
          setTheme('dark');
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: theme === 'dark' ? '#0070f3' : '#ccc',
          color: theme === 'dark' ? 'white' : 'black',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        🌙 暗黑
      </button>

      <button
        onClick={() => {
          console.log('[主题] 切换到系统模式');
          setTheme('system');
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: theme === 'system' ? '#0070f3' : '#ccc',
          color: theme === 'system' ? 'white' : 'black',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        💻 系统
      </button>
    </div>
  );
}
