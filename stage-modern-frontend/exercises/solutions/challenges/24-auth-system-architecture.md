# 用户认证系统 - 完整实现

## 功能清单

✅ **基础认证**:
- 邮箱密码注册
- 邮箱密码登录
- 退出登录

✅ **OAuth 集成**:
- GitHub OAuth
- Google OAuth

✅ **安全功能**:
- 密码哈希 (bcrypt)
- 邮箱验证
- 密码重置

✅ **权限控制**:
- 角色管理 (RBAC)
- Middleware 路由保护

## 技术栈

- **认证框架**: NextAuth.js v5 (Auth.js)
- **密码哈希**: bcrypt
- **邮件发送**: nodemailer
- **数据库**: Prisma + PostgreSQL

## 关键功能实现

### 1. 密码哈希

```ts
import bcrypt from 'bcrypt';

// 注册时
const hashedPassword = await bcrypt.hash(password, 10);

// 登录时
const isValid = await bcrypt.compare(password, user.password);
```

### 2. 邮箱验证

流程:
1. 用户注册后,生成验证 token
2. 发送包含 token 的验证邮件
3. 用户点击邮件中的链接
4. 验证 token,标记邮箱已验证

### 3. 密码重置

流程:
1. 用户请求密码重置
2. 生成重置 token,发送邮件
3. 用户点击邮件链接,输入新密码
4. 验证 token,更新密码

### 4. RBAC (基于角色的访问控制)

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession(request);
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.redirect('/unauthorized');
    }
  }
  
  return NextResponse.next();
}
```

## 环境变量

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth Providers
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 代码结构

```
app/
  auth/
    signin/
      page.tsx          # 登录页面
    signup/
      page.tsx          # 注册页面
    verify/
      page.tsx          # 邮箱验证页面
  api/
    auth/
      [...nextauth]/
        route.ts        # NextAuth 配置
lib/
  auth.ts               # 认证工具函数
  email.ts              # 邮件发送
middleware.ts           # 路由保护
```
