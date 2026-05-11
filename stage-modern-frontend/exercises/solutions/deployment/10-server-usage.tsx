// app/api/test/route.ts

export async function GET() {
  // 服务端可以访问所有环境变量
  const dbUrl = process.env.DATABASE_URL;
  const apiKey = process.env.API_SECRET_KEY;

  console.log('[服务端] DATABASE_URL:', dbUrl);
  console.log('[服务端] API_SECRET_KEY:', apiKey);

  return Response.json({
    message: '环境变量读取成功',
    // ⚠️ 不要返回敏感信息给客户端!
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
  });
}
