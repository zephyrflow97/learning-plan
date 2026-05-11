// lib/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./db" // Prisma client
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 1️⃣ 适配器: 连接数据库存储 session/user/account
  adapter: PrismaAdapter(db),
  
  // 2️⃣ Session 策略
  session: {
    strategy: "jwt", // 使用 JWT (无状态) vs "database" (有状态)
  },
  
  // 3️⃣ 认证提供商
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 Credentials 登录尝试:', credentials.email);
        
        // 1️⃣ 查找用户
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        
        if (!user || !user.passwordHash) {
          console.error('❌ 用户不存在或未设置密码');
          return null;
        }
        
        // 2️⃣ 验证密码
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        
        if (!isValid) {
          console.error('❌ 密码错误');
          return null;
        }
        
        console.log('✅ 登录成功:', user.email);
        
        // 3️⃣ 返回用户对象(会被存入 JWT/Session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  
  // 4️⃣ 回调函数: 控制 JWT 和 Session 的内容
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('🎫 JWT Callback 触发:', trigger);
      
      // 首次登录时,user 对象存在
      if (user) {
        token.id = user.id;
        token.role = user.role;
        console.log('✍️ 将用户信息写入 JWT:', { id: user.id, role: user.role });
      }
      
      // 当调用 update() 时,可以更新 session
      if (trigger === "update" && session) {
        token = { ...token, ...session };
        console.log('🔄 更新 JWT:', token);
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // 将 JWT 中的信息暴露给客户端
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        console.log('📋 生成 Session 对象:', session.user);
      }
      
      return session;
    },
  },
  
  // 5️⃣ 页面路由
  pages: {
    signIn: '/auth/signin', // 自定义登录页
    error: '/auth/error',   // 错误页
  },
  
  // 6️⃣ 事件钩子
  events: {
    async signIn(message) {
      console.log('🎉 用户登录:', message.user.email);
      // 可以在这里记录日志、发送通知等
    },
    async signOut(message) {
      console.log('👋 用户登出:', message.session?.user.email);
    },
  },
})
