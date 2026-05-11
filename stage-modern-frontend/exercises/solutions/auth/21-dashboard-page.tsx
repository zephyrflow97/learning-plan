// app/dashboard/page.tsx

'use client';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    console.log('[登出] 删除 token');

    // 删除 cookie
    document.cookie = 'auth-token=; path=/; max-age=0';

    router.push('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        🎛️ Dashboard
      </h1>

      <p style={{ marginBottom: '20px' }}>
        欢迎进入受保护的 Dashboard 页面!
      </p>

      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        登出
      </button>
    </div>
  );
}
