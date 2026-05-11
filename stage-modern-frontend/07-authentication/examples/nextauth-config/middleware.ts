// middleware.ts (项目根目录)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./lib/auth"

export async function middleware(request: NextRequest) {
  console.log('🛡️ Middleware 执行:', request.nextUrl.pathname);
  
  // 1️⃣ 获取 Session
  const session = await auth();
  
  const { pathname } = request.nextUrl;
  
  // 2️⃣ 公开路由(无需登录)
  const publicPaths = ['/', '/auth/signin', '/auth/signup', '/api/auth'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isPublicPath) {
    console.log('✅ 公开路由,允许访问');
    return NextResponse.next();
  }
  
  // 3️⃣ 未登录用户 → 重定向到登录页
  if (!session) {
    console.log('❌ 未登录,重定向到登录页');
    const loginUrl = new URL('/auth/signin', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname); // 登录后跳回原页面
    return NextResponse.redirect(loginUrl);
  }
  
  // 4️⃣ 管理员路由检查
  if (pathname.startsWith('/admin')) {
    if (session.user.role !== 'ADMIN') {
      console.error('❌ 权限不足,用户角色:', session.user.role);
      return NextResponse.redirect(new URL('/403', request.url));
    }
    console.log('✅ 管理员权限验证通过');
  }
  
  // 5️⃣ 通过验证
  console.log('✅ 授权通过,用户:', session.user.email);
  return NextResponse.next();
}

// 配置 Middleware 匹配规则
export const config = {
  matcher: [
    /*
     * 匹配所有路径,除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (图标)
     * - public 文件夹
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
