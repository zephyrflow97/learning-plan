/**
 * 认证中间件示例
 * 
 * 这个文件展示了如何在中间件中实现认证检查:
 * - Cookie/JWT 验证
 * - 受保护路由
 * - 登录重定向
 * - 角色权限检查
 * 
 * 使用场景:
 * - 保护 Dashboard、Admin 等需要登录的页面
 * - 未登录用户自动重定向到登录页
 * - 登录后跳转回原页面
 * 
 * 注意:
 * - 中间件运行在 Edge Runtime,不能访问数据库
 * - 复杂的权限检查应该在 Server Component 或 API Route 中进行
 * 
 * 使用位置: middleware.ts (项目根目录)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // JWT 验证库(Edge 兼容)

// ==================== 配置 ====================

/**
 * 需要登录的路径前缀
 */
const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
];

/**
 * 需要特定角色的路径
 */
const ROLE_BASED_PATHS: Record<string, string[]> = {
  '/admin': ['admin', 'superadmin'],
  '/admin/users': ['superadmin'],
};

/**
 * 公开路径(即使登录也可以访问)
 */
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth',
];

/**
 * JWT 密钥(从环境变量读取)
 */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// ==================== 类型定义 ====================

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// ==================== 辅助函数 ====================

/**
 * 检查路径是否需要保护
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

/**
 * 检查路径是否是公开的
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

/**
 * 获取路径需要的角色
 */
function getRequiredRoles(pathname: string): string[] | null {
  for (const [path, roles] of Object.entries(ROLE_BASED_PATHS)) {
    if (pathname.startsWith(path)) {
      return roles;
    }
  }
  return null;
}

/**
 * 验证 JWT Token
 * 
 * @param token - JWT 字符串
 * @returns 解码后的 Payload 或 null
 */
async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log('🟡 [Auth Middleware] 验证 JWT Token');
    
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    console.log('✅ [Auth Middleware] Token 验证成功:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return payload as JWTPayload;
  } catch (error) {
    console.error('🔴 [Auth Middleware] Token 验证失败:', error);
    return null;
  }
}

/**
 * 从 Cookie 中获取 Session Token
 */
function getSessionToken(request: NextRequest): string | null {
  // 方式 1: 从 Cookie 读取
  const token = request.cookies.get('session')?.value;
  
  if (token) {
    console.log('🟡 [Auth Middleware] 从 Cookie 读取 Token');
    return token;
  }

  // 方式 2: 从 Authorization Header 读取
  const authHeader = request.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    console.log('🟡 [Auth Middleware] 从 Authorization Header 读取 Token');
    return authHeader.substring(7);
  }

  console.log('⚠️ [Auth Middleware] 未找到 Token');
  return null;
}

// ==================== 主中间件函数 ====================

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  console.log('🟡 [Auth Middleware] 请求:', pathname);

  // ==================== 1. 跳过公开路径 ====================

  if (isPublicPath(pathname)) {
    console.log('🟡 [Auth Middleware] 公开路径,跳过检查');
    return NextResponse.next();
  }

  // ==================== 2. 检查是否需要认证 ====================

  if (!isProtectedPath(pathname)) {
    console.log('🟡 [Auth Middleware] 非受保护路径,跳过检查');
    return NextResponse.next();
  }

  console.log('🟡 [Auth Middleware] 受保护路径,开始认证检查');

  // ==================== 3. 获取并验证 Token ====================

  const token = getSessionToken(request);

  if (!token) {
    console.log('⚠️ [Auth Middleware] 未登录,重定向到登录页');
    
    // 构建登录 URL,带上回调参数
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname); // 登录后跳转回来
    
    return NextResponse.redirect(loginUrl);
  }

  // 验证 Token
  const payload = await verifyToken(token);

  if (!payload) {
    console.log('🔴 [Auth Middleware] Token 无效,清除并重定向');
    
    // Token 无效,清除 Cookie 并重定向
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('error', 'session_expired');
    
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    
    return response;
  }

  // ==================== 4. 角色权限检查 ====================

  const requiredRoles = getRequiredRoles(pathname);

  if (requiredRoles) {
    console.log('🟡 [Auth Middleware] 检查角色权限');
    console.log('🟡 [Auth Middleware] 需要角色:', requiredRoles);
    console.log('🟡 [Auth Middleware] 用户角色:', payload.role);

    if (!requiredRoles.includes(payload.role)) {
      console.log('🔴 [Auth Middleware] 权限不足,返回 403');
      
      // 权限不足,返回 403 或重定向到无权限页面
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/403';
      
      return NextResponse.redirect(forbiddenUrl);
    }

    console.log('✅ [Auth Middleware] 权限检查通过');
  }

  // ==================== 5. 添加用户信息到 Headers ====================

  /**
   * 将用户信息添加到 Headers,传递给 Server Component
   * 
   * 在 Server Component 中读取:
   * import { headers } from 'next/headers';
   * 
   * const userId = headers().get('x-user-id');
   * const userRole = headers().get('x-user-role');
   */
  const response = NextResponse.next();

  response.headers.set('X-User-ID', payload.userId);
  response.headers.set('X-User-Email', payload.email);
  response.headers.set('X-User-Role', payload.role);

  console.log('✅ [Auth Middleware] 认证成功,继续到页面');

  // ==================== 6. Token 刷新(可选) ====================

  /**
   * 如果 Token 即将过期(如剩余时间 < 10 分钟),自动刷新
   */
  const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
  const TEN_MINUTES = 10 * 60;

  if (expiresIn < TEN_MINUTES && expiresIn > 0) {
    console.log('🟡 [Auth Middleware] Token 即将过期,需要刷新');
    
    // 这里可以调用 API 刷新 Token
    // 由于中间件的限制,通常在客户端或 Server Component 中处理
    response.headers.set('X-Token-Refresh-Required', 'true');
  }

  return response;
}

// ==================== Matcher 配置 ====================

export const config = {
  matcher: [
    /*
     * 匹配所有路径,除了:
     * - API 路由 (/api/*)
     * - Next.js 静态资源 (_next/static, _next/image)
     * - 静态文件 (favicon.ico, robots.txt 等)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};

// ==================== 使用说明 ====================

/**
 * 1. 安装依赖:
 * 
 * npm install jose
 * 
 * 
 * 2. 配置环境变量(.env.local):
 * 
 * JWT_SECRET=your-super-secret-key-change-this-in-production
 * 
 * 
 * 3. 登录 API 示例(app/api/auth/login/route.ts):
 * 
 * import { SignJWT } from 'jose';
 * import { NextResponse } from 'next/server';
 * 
 * const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
 * 
 * export async function POST(request: Request) {
 *   const { email, password } = await request.json();
 *   
 *   // 验证用户(从数据库查询)
 *   const user = await db.user.findUnique({ where: { email } });
 *   
 *   if (!user || !verifyPassword(password, user.password)) {
 *     return NextResponse.json(
 *       { error: 'Invalid credentials' },
 *       { status: 401 }
 *     );
 *   }
 *   
 *   // 生成 JWT
 *   const token = await new SignJWT({
 *     userId: user.id,
 *     email: user.email,
 *     role: user.role,
 *   })
 *     .setProtectedHeader({ alg: 'HS256' })
 *     .setIssuedAt()
 *     .setExpirationTime('7d')
 *     .sign(JWT_SECRET);
 *   
 *   // 设置 Cookie
 *   const response = NextResponse.json({ success: true });
 *   response.cookies.set('session', token, {
 *     httpOnly: true,
 *     secure: process.env.NODE_ENV === 'production',
 *     sameSite: 'lax',
 *     maxAge: 7 * 24 * 60 * 60, // 7 天
 *   });
 *   
 *   return response;
 * }
 * 
 * 
 * 4. 在 Server Component 中读取用户信息:
 * 
 * import { headers } from 'next/headers';
 * 
 * export default function DashboardPage() {
 *   const headersList = headers();
 *   const userId = headersList.get('x-user-id');
 *   const userRole = headersList.get('x-user-role');
 *   
 *   return (
 *     <div>
 *       <h1>Dashboard</h1>
 *       <p>User ID: {userId}</p>
 *       <p>Role: {userRole}</p>
 *     </div>
 *   );
 * }
 * 
 * 
 * 5. 退出登录(app/api/auth/logout/route.ts):
 * 
 * import { NextResponse } from 'next/server';
 * 
 * export async function POST() {
 *   const response = NextResponse.json({ success: true });
 *   response.cookies.delete('session');
 *   return response;
 * }
 */

// ==================== 高级用法 ====================

/**
 * 1. 基于 Session 的认证(不用 JWT):
 * 
 * - 中间件中只检查 Cookie 是否存在
 * - 详细验证在 Server Component 中进行(查询数据库)
 * - 使用 Redis 存储 Session
 * 
 * const sessionId = request.cookies.get('session_id')?.value;
 * if (!sessionId) {
 *   return redirectToLogin();
 * }
 * 
 * // 在 Server Component 中:
 * const session = await redis.get(`session:${sessionId}`);
 * 
 * 
 * 2. OAuth 认证(如 NextAuth.js):
 * 
 * import { getToken } from 'next-auth/jwt';
 * 
 * const token = await getToken({ req: request });
 * if (!token) {
 *   return redirectToLogin();
 * }
 * 
 * 
 * 3. API 密钥认证:
 * 
 * const apiKey = request.headers.get('x-api-key');
 * 
 * if (pathname.startsWith('/api/external')) {
 *   if (!apiKey || apiKey !== process.env.API_KEY) {
 *     return new NextResponse('Unauthorized', { status: 401 });
 *   }
 * }
 */

// ==================== 安全建议 ====================

/**
 * 1. **使用 HTTPS**: 生产环境必须使用 HTTPS,否则 Cookie 可能被窃取
 * 
 * 2. **HttpOnly Cookie**: 防止 XSS 攻击读取 Cookie
 *    response.cookies.set('session', token, { httpOnly: true });
 * 
 * 3. **SameSite**: 防止 CSRF 攻击
 *    response.cookies.set('session', token, { sameSite: 'lax' });
 * 
 * 4. **Secure Flag**: 只在 HTTPS 下传输 Cookie
 *    response.cookies.set('session', token, { 
 *      secure: process.env.NODE_ENV === 'production' 
 *    });
 * 
 * 5. **Token 过期时间**: 不要设置过长的过期时间
 *    .setExpirationTime('7d') // 最多 7 天
 * 
 * 6. **刷新 Token**: 长期会话使用 Refresh Token 机制
 * 
 * 7. **密钥管理**: 使用强随机密钥,定期轮换
 *    openssl rand -base64 32
 */

// ==================== 常见问题 ====================

/**
 * Q: 为什么不在中间件中查询数据库验证 Session?
 * A: 中间件运行在 Edge Runtime,不支持数据库连接。
 *    应该在 Server Component 或 API Route 中进行详细验证。
 * 
 * Q: 如何处理 Token 过期?
 * A: 1. 中间件检测到过期,重定向到登录页
 *    2. 使用 Refresh Token 机制自动续期
 *    3. 客户端定期检查并刷新 Token
 * 
 * Q: 如何实现"记住我"功能?
 * A: 设置更长的 Cookie 过期时间(如 30 天)
 *    response.cookies.set('session', token, { maxAge: 30 * 24 * 60 * 60 });
 * 
 * Q: 如何防止会话固定攻击?
 * A: 登录成功后重新生成 Session ID/Token
 */
