/**
 * 基础中间件示例
 * 
 * 这个文件展示了 Next.js 中间件的基础用法:
 * - URL 重定向和重写
 * - 自定义 Headers
 * - A/B 测试
 * - 地理位置重定向
 * 
 * 中间件的特性:
 * 1. 在请求到达页面之前执行
 * 2. 运行在 Edge Runtime(极快的冷启动 < 5ms)
 * 3. 可以修改请求和响应
 * 4. 限制:不能使用 Node.js API、不能访问数据库
 * 
 * 使用位置: middleware.ts (项目根目录,与 app/ 同级)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==================== 主中间件函数 ====================

/**
 * 中间件主函数
 * 
 * 每个匹配的请求都会经过这里
 * 
 * @param request - Next.js 请求对象
 * @returns NextResponse - 可以是 redirect, rewrite, next() 等
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  console.log('🟡 [Middleware] 请求拦截');
  console.log('🟡 [Middleware] URL:', pathname);
  console.log('🟡 [Middleware] Method:', request.method);
  console.log('🟡 [Middleware] User-Agent:', request.headers.get('user-agent'));

  // ==================== 1. URL 重定向 ====================

  /**
   * 将旧的 URL 重定向到新的 URL
   * 
   * 使用场景: 网站重构、SEO 优化、旧链接兼容
   */
  if (pathname.startsWith('/old-blog')) {
    console.log('🟡 [Middleware] 检测到旧博客 URL,重定向到新地址');
    
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = newUrl.pathname.replace('/old-blog', '/blog');
    
    // 301 永久重定向(告诉搜索引擎更新索引)
    return NextResponse.redirect(newUrl, 301);
  }

  // 移除尾部斜杠(标准化 URL)
  if (pathname.endsWith('/') && pathname !== '/') {
    console.log('🟡 [Middleware] 移除尾部斜杠');
    
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = pathname.slice(0, -1);
    
    return NextResponse.redirect(newUrl, 308); // 308 保留 HTTP 方法
  }

  // ==================== 2. URL 重写 (Rewrite) ====================

  /**
   * Rewrite vs Redirect:
   * - Redirect: 浏览器地址栏改变,向用户可见
   * - Rewrite: 内部转发,浏览器地址栏不变,对用户透明
   * 
   * 使用场景: 内部路由、多租户系统、A/B 测试
   */
  if (pathname.startsWith('/api-proxy')) {
    console.log('🟡 [Middleware] 代理 API 请求');
    
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = pathname.replace('/api-proxy', '/api');
    
    // Rewrite: 用户看到 /api-proxy/users,但实际请求 /api/users
    return NextResponse.rewrite(newUrl);
  }

  // ==================== 3. 自定义 Headers ====================

  /**
   * 添加自定义 Headers
   * 
   * 使用场景: 安全Headers、CORS、追踪、调试
   */
  const response = NextResponse.next();

  // 安全相关 Headers
  response.headers.set('X-Frame-Options', 'DENY'); // 防止点击劫持
  response.headers.set('X-Content-Type-Options', 'nosniff'); // 防止 MIME 类型嗅探
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 自定义追踪 Header
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);
  console.log('🟡 [Middleware] Request ID:', requestId);

  // 添加服务器时间戳(调试用)
  response.headers.set('X-Server-Time', new Date().toISOString());

  // ==================== 4. A/B 测试 ====================

  /**
   * 简单的 A/B 测试实现
   * 
   * 随机将用户分配到不同的版本
   */
  if (pathname === '/') {
    const bucket = request.cookies.get('ab-test-bucket')?.value;

    if (!bucket) {
      // 新用户,随机分配 A/B 组
      const newBucket = Math.random() < 0.5 ? 'A' : 'B';
      console.log('🟡 [Middleware] 新用户,分配到 A/B 组:', newBucket);

      const response = NextResponse.next();
      
      // 设置 Cookie(30 天过期)
      response.cookies.set('ab-test-bucket', newBucket, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });

      // 根据分组重写到不同页面
      if (newBucket === 'B') {
        const newUrl = request.nextUrl.clone();
        newUrl.pathname = '/home-variant-b';
        return NextResponse.rewrite(newUrl);
      }

      return response;
    } else {
      console.log('🟡 [Middleware] 已有用户,A/B 组:', bucket);

      // 已有用户,根据 Cookie 返回对应版本
      if (bucket === 'B') {
        const newUrl = request.nextUrl.clone();
        newUrl.pathname = '/home-variant-b';
        return NextResponse.rewrite(newUrl);
      }
    }
  }

  // ==================== 5. 地理位置重定向 ====================

  /**
   * 根据用户地理位置重定向
   * 
   * request.geo 在 Vercel 等平台上可用
   * 本地开发时为 undefined
   */
  const country = request.geo?.country;
  const city = request.geo?.city;

  if (country) {
    console.log('🟡 [Middleware] 用户位置:', { country, city });

    // 添加地理位置 Header(传递给页面组件)
    response.headers.set('X-User-Country', country);
    if (city) {
      response.headers.set('X-User-City', city);
    }

    // 根据国家重定向到不同的子域
    // if (country === 'CN' && !request.nextUrl.hostname.includes('cn.')) {
    //   const newUrl = new URL(request.url);
    //   newUrl.hostname = `cn.${newUrl.hostname}`;
    //   return NextResponse.redirect(newUrl);
    // }
  }

  // ==================== 6. 维护模式 ====================

  /**
   * 全站维护模式
   * 
   * 通过环境变量控制
   */
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode && pathname !== '/maintenance') {
    console.log('🟡 [Middleware] 维护模式已启用,重定向到维护页面');
    
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = '/maintenance';
    
    return NextResponse.redirect(maintenanceUrl);
  }

  // ==================== 7. 请求日志 ====================

  /**
   * 记录请求信息(生产环境可发送到日志服务)
   */
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: pathname,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    ip: request.ip,
    country,
    city,
  };

  console.log('🟡 [Middleware] 请求日志:', JSON.stringify(logData, null, 2));

  // 生产环境可以发送到日志服务
  // if (process.env.NODE_ENV === 'production') {
  //   fetch('https://logs.example.com/collect', {
  //     method: 'POST',
  //     body: JSON.stringify(logData),
  //   }).catch(() => {}); // 不阻塞请求
  // }

  // ==================== 返回响应 ====================

  console.log('✅ [Middleware] 请求处理完成,继续到页面');
  
  return response;
}

// ==================== Matcher 配置 ====================

/**
 * 配置哪些路径会触发中间件
 * 
 * 语法:
 * - '/path' - 精确匹配
 * - '/path/:param' - 动态路由
 * - '/path*' - 前缀匹配
 * - 正则表达式(通过 source 字段)
 * 
 * 注意:
 * - 默认情况下,中间件会匹配所有路径
 * - 通常需要排除静态资源(_next/static)、API 路由等
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径,除了:
     * - API 路由 (/api/*)
     * - Next.js 静态资源 (_next/static, _next/image)
     * - 静态文件 (favicon.ico, robots.txt, sitemap.xml 等)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],

  // 或者明确指定需要中间件的路径:
  // matcher: [
  //   '/',
  //   '/blog/:path*',
  //   '/dashboard/:path*',
  // ],
};

// ==================== 高级用法示例 ====================

/**
 * 1. 多语言重定向(基于 Accept-Language)
 * 
 * const acceptLanguage = request.headers.get('accept-language');
 * const preferredLanguage = acceptLanguage?.split(',')[0].split('-')[0];
 * 
 * if (!pathname.startsWith('/en') && !pathname.startsWith('/zh')) {
 *   const newUrl = request.nextUrl.clone();
 *   newUrl.pathname = `/${preferredLanguage}${pathname}`;
 *   return NextResponse.redirect(newUrl);
 * }
 */

/**
 * 2. 设备类型检测(移动端/桌面端)
 * 
 * const userAgent = request.headers.get('user-agent') || '';
 * const isMobile = /mobile/i.test(userAgent);
 * 
 * if (isMobile && !pathname.startsWith('/m')) {
 *   const newUrl = request.nextUrl.clone();
 *   newUrl.pathname = `/m${pathname}`;
 *   return NextResponse.rewrite(newUrl);
 * }
 */

/**
 * 3. 特性开关(Feature Flags)
 * 
 * const featureFlags = {
 *   newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
 * };
 * 
 * if (pathname === '/dashboard' && featureFlags.newDashboard) {
 *   const newUrl = request.nextUrl.clone();
 *   newUrl.pathname = '/dashboard-v2';
 *   return NextResponse.rewrite(newUrl);
 * }
 */

/**
 * 4. Bot 检测(防止爬虫访问敏感页面)
 * 
 * const userAgent = request.headers.get('user-agent') || '';
 * const isBot = /bot|crawler|spider/i.test(userAgent);
 * 
 * if (isBot && pathname.startsWith('/admin')) {
 *   return new NextResponse('Forbidden', { status: 403 });
 * }
 */

// ==================== 性能建议 ====================

/**
 * 1. **保持轻量**: 中间件运行在每个请求上,避免复杂计算
 * 2. **使用 Matcher**: 精确匹配需要中间件的路径,避免不必要的执行
 * 3. **避免阻塞操作**: 不要在中间件中等待外部 API(除非必需)
 * 4. **Edge Runtime 限制**: 
 *    - ❌ 不能使用 Node.js API (fs, path, crypto.createHash)
 *    - ❌ 不能访问数据库(Prisma)
 *    - ✅ 可以使用 fetch、Headers、Cookies
 *    - ✅ 可以访问 Edge 兼容的 KV 存储(Vercel KV, Upstash Redis)
 */

// ==================== 调试技巧 ====================

/**
 * 1. 查看中间件是否执行:
 *    - 在服务器终端查看 console.log 输出
 *    - 检查响应 Headers(X-Request-ID 等自定义 Header)
 * 
 * 2. 跳过中间件(调试用):
 *    - 在 URL 中添加 ?skip-middleware=true
 *    - 在中间件开头检查这个参数
 * 
 *    if (searchParams.get('skip-middleware') === 'true') {
 *      console.log('🟡 [Middleware] 跳过中间件');
 *      return NextResponse.next();
 *    }
 * 
 * 3. 本地测试地理位置:
 *    - 手动设置 geo 对象(开发环境)
 * 
 *    const mockGeo = {
 *      country: 'CN',
 *      city: 'Beijing',
 *    };
 */
