// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('[Middleware] 拦截请求:', pathname);

  // 从 cookie 获取 token
  const token = request.cookies.get('auth-token')?.value;

  // 判断是否已登录
  const isAuthenticated = Boolean(token);

  console.log('[Middleware] 认证状态:', isAuthenticated);

  // 保护 /dashboard 路由
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      console.log('[Middleware] 未登录,重定向到 /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 已登录用户访问 /login,重定向到 /dashboard
  if (pathname === '/login' && isAuthenticated) {
    console.log('[Middleware] 已登录,重定向到 /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 配置 Middleware 匹配的路径
export const config = {
  matcher: [
    '/dashboard/:path*', // 匹配所有 /dashboard 子路由
    '/login',
  ],
};
