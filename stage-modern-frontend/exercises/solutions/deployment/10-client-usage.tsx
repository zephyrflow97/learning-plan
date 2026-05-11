'use client';

export default function ClientComponent() {
  // 客户端只能访问 NEXT_PUBLIC_ 开头的变量
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  console.log('[客户端] SITE_NAME:', siteName);
  console.log('[客户端] API_URL:', apiUrl);

  // ⚠️ 下面这行会是 undefined(客户端访问不到)
  const dbUrl = process.env.DATABASE_URL;
  console.log('[客户端] DATABASE_URL:', dbUrl); // undefined

  return (
    <div>
      <h1>欢迎来到 {siteName}</h1>
      <p>API 地址: {apiUrl}</p>
    </div>
  );
}
