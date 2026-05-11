# Authentication 练习题答案

本目录包含用户认证相关练习题的答案。

## 📋 练习题列表

### 21. Next.js Middleware 权限控制
- **文件**:
  - `21-middleware.ts` - Middleware 路由拦截
  - `21-login-page.tsx` - 登录页面
  - `21-dashboard-page.tsx` - 受保护的 Dashboard
- **技术点**: Middleware、JWT 验证、路由保护
- **关键概念**:
  - Middleware 在请求到达页面前执行
  - Cookie 读取和验证
  - 重定向未登录用户
  - `matcher` 配置拦截路径

---

## 🎯 学习要点

### Next.js Middleware

#### 基础用法
```ts
// middleware.ts (根目录或 src/ 下)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 读取 cookie
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // 重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 继续请求
  return NextResponse.next();
}

// 配置匹配路径
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

#### Matcher 配置

```ts
export const config = {
  matcher: [
    // 匹配所有子路径
    '/dashboard/:path*',
    
    // 匹配多个路径
    ['/admin', '/settings'],
    
    // 排除某些路径
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### 修改请求/响应

```ts
export function middleware(request: NextRequest) {
  // 修改请求头
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-custom-header', 'value');
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // 修改响应头
  response.headers.set('x-modified', 'true');
  
  // 设置 cookie
  response.cookies.set('session', 'value', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7天
  });
  
  return response;
}
```

### JWT 认证流程

#### 1. 登录
```ts
// app/api/auth/login/route.ts
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  // 验证用户
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // 生成 JWT
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  
  // 设置 cookie
  const response = Response.json({ success: true });
  response.headers.set('Set-Cookie', `auth-token=${token}; HttpOnly; Secure; Path=/; Max-Age=604800`);
  
  return response;
}
```

#### 2. 验证 Token
```ts
// lib/auth.ts
import { jwtVerify } from 'jose';

export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: number };
  } catch {
    return null;
  }
}
```

#### 3. Middleware 验证
```ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 验证 token
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 将用户信息添加到请求头
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId.toString());
  
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
```

### Session 管理

#### Cookie vs LocalStorage vs SessionStorage

| 存储方式 | 大小限制 | HTTP 请求携带 | 安全性 | 过期时间 | 推荐用途 |
|---------|---------|--------------|--------|---------|---------|
| Cookie | 4KB | ✅ 自动携带 | 🔒 HttpOnly 防 XSS | 可设置 | **认证 Token** |
| LocalStorage | 5-10MB | ❌ 手动发送 | ⚠️ 可被 JS 访问 | 永久 | 用户偏好设置 |
| SessionStorage | 5-10MB | ❌ 手动发送 | ⚠️ 可被 JS 访问 | 关闭标签页 | 临时数据 |

**安全的 Token 存储**:
```ts
// ✅ 推荐:HttpOnly Cookie
response.headers.set('Set-Cookie', `token=${jwt}; HttpOnly; Secure; SameSite=Strict`);

// ❌ 不安全:LocalStorage(易受 XSS 攻击)
localStorage.setItem('token', jwt);
```

### 密码安全

#### 哈希密码
```ts
import bcrypt from 'bcrypt';

// 注册时哈希
const hashedPassword = await bcrypt.hash(password, 10);
await db.user.create({
  data: { email, password: hashedPassword },
});

// 登录时验证
const isValid = await bcrypt.compare(password, user.password);
```

#### 密码强度要求
```ts
import * as z from 'zod';

const passwordSchema = z.string()
  .min(8, '密码至少8位')
  .regex(/[a-z]/, '必须包含小写字母')
  .regex(/[A-Z]/, '必须包含大写字母')
  .regex(/[0-9]/, '必须包含数字')
  .regex(/[^a-zA-Z0-9]/, '必须包含特殊字符');
```

### 权限控制 (RBAC)

```prisma
// schema.prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id    Int    @id
  role  Role   @default(USER)
}
```

```ts
// middleware.ts
export async function middleware(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### 常见攻击防护

#### 1. CSRF 防护
```ts
// 使用 CSRF Token
import { generateCsrfToken, verifyCsrfToken } from './csrf';

// 表单中包含 CSRF Token
<input type="hidden" name="csrf" value={csrfToken} />
```

#### 2. Rate Limiting
```ts
// 限制登录尝试次数
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次尝试
  message: '登录尝试次数过多,请稍后再试',
});
```

#### 3. XSS 防护
```tsx
// ✅ React 自动转义
<div>{userInput}</div>

// ❌ 危险:直接插入 HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

---

## 🔗 相关资源

- [Next.js Middleware 文档](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextAuth.js](https://next-auth.js.org/) - 推荐的认证库
- [jose](https://github.com/panva/jose) - JWT 库
- [bcrypt](https://www.npmjs.com/package/bcrypt) - 密码哈希
- [OWASP 安全指南](https://owasp.org/www-project-top-ten/)
