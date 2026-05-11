// lib/auth.ts - NextAuth v5 完整配置
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // 1️⃣ 数据库适配器
  adapter: PrismaAdapter(db),

  // 2️⃣ Session 策略
  session: {
    strategy: "jwt", // 使用 JWT 而不是 Database Session
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  // 3️⃣ 认证提供商
  providers: [
    // GitHub OAuth Provider
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // Credentials Provider (邮箱密码登录)
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔍 查找用户:', credentials.email);

        // 1️⃣ 查找用户
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            image: true,
          },
        });

        if (!user || !user.passwordHash) {
          console.error('❌ 用户不存在或未设置密码');
          return null;
        }

        // 2️⃣ 验证密码
        console.log('🔐 验证密码...');
        const startTime = performance.now();
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        const duration = performance.now() - startTime;
        console.log(`密码验证耗时: ${duration.toFixed(2)}ms`);

        if (!isValid) {
          console.error('❌ 密码错误');
          return null;
        }

        console.log('✅ 登录成功:', user.email);

        // 3️⃣ 返回用户对象
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],

  // 4️⃣ 自定义回调
  callbacks: {
    // JWT 回调:控制 JWT Token 中存储的信息
    async jwt({ token, user, trigger, session }) {
      console.log('📝 JWT 回调:', { trigger, hasUser: !!user });

      // 初次登录时,将用户信息添加到 token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        console.log('✅ JWT 已创建,包含 role:', user.role);
      }

      // 处理 update 触发(如用户更新个人资料)
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.image = session.user.image;
        console.log('🔄 JWT 已更新');
      }

      return token;
    },

    // Session 回调:控制返回给客户端的 session 对象
    async session({ session, token }) {
      console.log('🔑 Session 回调,用户:', token.email);

      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },

    // 授权回调:控制用户是否可以访问某些页面
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) {
          console.log('✅ 已登录用户访问 Dashboard');
          return true;
        }
        console.log('❌ 未登录用户尝试访问 Dashboard,重定向到登录页');
        return false; // 重定向到登录页
      } else if (isLoggedIn) {
        // 已登录用户访问登录/注册页时,重定向到 Dashboard
        if (nextUrl.pathname === '/auth/signin' || nextUrl.pathname === '/auth/signup') {
          console.log('🔄 已登录用户访问登录页,重定向到 Dashboard');
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
  },

  // 5️⃣ 自定义页面路径
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  // 6️⃣ 事件钩子
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('🎉 用户登录:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });

      // 记录登录日志到数据库
      await db.loginAttempt.create({
        data: {
          userId: user.id,
          success: true,
          provider: account?.provider || 'credentials',
          ipAddress: 'unknown', // 在实际应用中从请求头获取
        },
      });
    },

    async signOut({ token }) {
      console.log('👋 用户登出:', { userId: token?.id });
    },

    async createUser({ user }) {
      console.log('👤 新用户创建:', { userId: user.id, email: user.email });
    },
  },

  // 7️⃣ 其他配置
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
