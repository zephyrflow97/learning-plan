// middleware.ts - 路由级别的访问控制
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// 定义公开路由(不需要登录)
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/about',
  '/contact',
];

// 定义需要特定角色的路由
const roleBasedRoutes = {
  '/admin': ['ADMIN'],
  '/moderator': ['ADMIN', 'MODERATOR'],
} as const;

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔍 Middleware 检查:', pathname);

  // 1️⃣ 检查是否是公开路由
  if (publicRoutes.includes(pathname)) {
    console.log('✅ 公开路由,放行');
    return NextResponse.next();
  }

  // 2️⃣ 获取用户 session
  const session = await auth();

  // 3️⃣ 检查是否登录
  if (!session?.user) {
    console.log('❌ 未登录,重定向到登录页');
    const loginUrl = new URL('/auth/signin', request.url);
    // 添加 callbackUrl 参数,登录后跳回原页面
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log('✅ 用户已登录:', session.user.email);

  // 4️⃣ 基于角色的访问控制
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      const userRole = session.user.role as string;

      if (!allowedRoles.includes(userRole as any)) {
        console.log('❌ 权限不足,用户角色:', userRole, '需要:', allowedRoles);
        return NextResponse.redirect(new URL('/403', request.url));
      }

      console.log('✅ 角色验证通过:', userRole);
    }
  }

  // 5️⃣ 放行
  return NextResponse.next();
}

// 配置 Middleware 匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径,除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹 (公开资源)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
