/**
 * tRPC 配置和 Middleware
 * 
 * 这个文件是 tRPC 的核心配置，包含：
 * - initTRPC 初始化
 * - Context 类型定义
 * - Middleware（日志、认证）
 * - Procedure（公开、受保护）
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';

// ==========================================
// Context 定义
// ==========================================

/**
 * 创建 tRPC Context
 * 
 * Context 会在每个请求中创建，包含：
 * - req/res: Next.js 请求/响应对象
 * - session: 用户会话（如果已登录）
 * - db: Prisma Client 实例
 */
export async function createContext(opts: CreateNextContextOptions) {
  console.log('[tRPC Context] 创建上下文');
  console.log('[tRPC Context] Request URL:', opts.req.url);
  console.log('[tRPC Context] Request Method:', opts.req.method);

  // 这里应该从 NextAuth 或其他认证系统获取 session
  // const session = await getServerSession(opts.req, opts.res, authOptions);
  
  // 模拟 session（实际应用中从 NextAuth 获取）
  const session = null; // 未登录

  console.log('[tRPC Context] Session:', session ? 'Authenticated' : 'Guest');

  return {
    req: opts.req,
    res: opts.res,
    session,
    // db: prisma, // 在实际应用中导入 Prisma Client
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// ==========================================
// tRPC 初始化
// ==========================================

const t = initTRPC.context<Context>().create({
  /**
   * SuperJSON 用于序列化复杂类型
   * 
   * 好处:
   * - 支持 Date、Map、Set、BigInt 等类型
   * - 不需要手动 JSON.stringify/parse
   */
  transformer: superjson,
  
  /**
   * 错误格式化
   * 
   * 可以自定义错误信息的格式，方便前端处理
   */
  errorFormatter({ shape, error }) {
    console.log('[tRPC Error]', error);
    
    return {
      ...shape,
      data: {
        ...shape.data,
        // 如果是 Zod 验证错误，包含详细信息
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ==========================================
// 导出基础工具
// ==========================================

export const router = t.router;
export const middleware = t.middleware;

// ==========================================
// Logger Middleware（日志中间件）
// ==========================================

const loggerMiddleware = middleware(async ({ path, type, next, rawInput }) => {
  const start = Date.now();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[tRPC] → ${type.toUpperCase()} ${path}`);
  console.log('[tRPC] Input:', rawInput);
  console.log(`[tRPC] Time: ${new Date().toISOString()}`);

  try {
    const result = await next();
    const duration = Date.now() - start;
    
    console.log(`[tRPC] ← ${type.toUpperCase()} ${path} (${duration}ms)`);
    console.log('[tRPC] Success: ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    console.error(`[tRPC] ✖ ${type.toUpperCase()} ${path} (${duration}ms)`);
    console.error('[tRPC] Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    throw error;
  }
});

// ==========================================
// Auth Middleware（认证中间件）
// ==========================================

/**
 * 认证中间件
 * 
 * 检查用户是否已登录，如果未登录则抛出 UNAUTHORIZED 错误
 */
const isAuthed = middleware(async ({ ctx, next }) => {
  console.log('[Middleware] 检查认证状态...');

  if (!ctx.session?.user) {
    console.log('[Middleware] ❌ 未认证访问被拒绝');
    
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '请先登录',
    });
  }

  console.log('[Middleware] ✅ 认证通过, 用户:', ctx.session.user.email);

  // 扩展 Context，添加 user 字段
  return next({
    ctx: {
      ...ctx,
      // ✅ 现在 user 保证不为 null
      user: ctx.session.user,
    },
  });
});

// ==========================================
// Rate Limit Middleware（速率限制中间件）
// ==========================================

/**
 * 简单的速率限制中间件（示例）
 * 
 * 实际应用中应该使用 Redis 等持久化存储
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

const rateLimitMiddleware = middleware(async ({ ctx, next, path }) => {
  const ip = ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress || 'unknown';
  const key = `${ip}:${path}`;
  const now = Date.now();
  const limit = 10; // 每分钟最多 10 次请求
  const window = 60 * 1000; // 1 分钟

  const record = requestCounts.get(key);

  if (record && record.resetAt > now) {
    if (record.count >= limit) {
      console.log(`[Middleware] ❌ 速率限制: ${key} (${record.count}/${limit})`);
      
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: '请求过于频繁，请稍后再试',
      });
    }
    record.count++;
  } else {
    requestCounts.set(key, { count: 1, resetAt: now + window });
  }

  console.log(`[Middleware] 速率检查通过: ${key} (${requestCounts.get(key)?.count}/${limit})`);

  return next();
});

// ==========================================
// Procedure 定义
// ==========================================

/**
 * 公开 Procedure
 * 
 * 所有人都可以访问，包含日志中间件
 */
export const publicProcedure = t.procedure.use(loggerMiddleware);

/**
 * 受保护 Procedure
 * 
 * 需要登录才能访问，包含日志 + 认证中间件
 */
export const protectedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(isAuthed);

/**
 * 速率限制 Procedure
 * 
 * 限制请求频率，防止滥用
 */
export const rateLimitedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(rateLimitMiddleware);

/**
 * 管理员 Procedure
 * 
 * 只有管理员才能访问
 */
export const adminProcedure = t.procedure
  .use(loggerMiddleware)
  .use(isAuthed)
  .use(
    middleware(async ({ ctx, next }) => {
      if (ctx.user.role !== 'ADMIN') {
        console.log('[Middleware] ❌ 权限不足, 用户角色:', ctx.user.role);
        
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '需要管理员权限',
        });
      }

      console.log('[Middleware] ✅ 管理员权限检查通过');
      
      return next();
    })
  );
