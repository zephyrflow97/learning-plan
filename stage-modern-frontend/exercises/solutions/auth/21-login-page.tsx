// app/login/page.tsx

'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    console.log('[登录] 设置 token');

    // 设置 cookie(实际项目应该调用 API)
    document.cookie = 'auth-token=fake-jwt-token; path=/';

    router.push('/dashboard');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>登录</h1>
      
      <button
        onClick={handleLogin}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        登录
      </button>
    </div>
  );
}
