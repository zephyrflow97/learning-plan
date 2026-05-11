// ==========================================
// tRPC 基础配置
// ==========================================

import { initTRPC, TRPCError } from '@trpc/server';

/**
 * Context 类型定义
 * 
 * Context 在每个请求中都会创建，所有 Procedure 都能访问。
 * 通常包含：
 * - db: 数据库客户端（如 Prisma）
 * - session: 用户会话信息
 * - req/res: HTTP 请求和响应对象
 */
interface Context {
  // 示例 Context
  db?: any; // 实际应该是 PrismaClient
  session?: {
    user?: {
      id: number;
      email: string;
      name: string;
    };
  };
}

/**
 * 初始化 tRPC
 * 
 * 这是 tRPC 的核心配置，所有 Router 和 Procedure 都从这里创建。
 */
const t = initTRPC.context<Context>().create({
  // 可选配置
  errorFormatter({ shape, error }) {
    console.log('[tRPC] 错误格式化:', error.message);
    return {
      ...shape,
      data: {
        ...shape.data,
        // 可以添加自定义错误信息
        timestamp: new Date().toISOString(),
      },
    };
  },
});

/**
 * 导出基础构建块
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * 日志中间件
 * 
 * 记录所有 Procedure 的执行日志，包括：
 * - 输入参数
 * - 执行时间
 * - 成功/失败状态
 */
const loggerMiddleware = t.middleware(async ({ path, type, next, rawInput }) => {
  const start = Date.now();
  
  console.log(`[tRPC Middleware] → ${type} ${path}`, {
    input: rawInput,
    timestamp: new Date().toISOString(),
  });
  
  try {
    const result = await next();
    const duration = Date.now() - start;
    
    console.log(`[tRPC Middleware] ← ${type} ${path} (${duration}ms)`, {
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    console.error(`[tRPC Middleware] ✖ ${type} ${path} (${duration}ms)`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    throw error;
  }
});

/**
 * 认证中间件
 * 
 * 检查用户是否已登录，如果未登录则抛出 UNAUTHORIZED 错误。
 * 认证通过后，扩展 Context，确保 ctx.user 不为 null。
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    console.log('[tRPC Middleware] ❌ 未认证访问被拒绝');
    
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '请先登录',
    });
  }
  
  console.log('[tRPC Middleware] ✅ 认证通过, 用户:', ctx.session.user.email);
  
  // 扩展 Context，保证 user 不为 null
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user, // 现在 ctx.user 保证存在
    },
  });
});

/**
 * 受保护的 Procedure
 * 
 * 使用认证中间件和日志中间件。
 * 所有使用 protectedProcedure 的 API 都需要用户登录。
 * 
 * 使用示例：
 * ```typescript
 * export const myRouter = router({
 *   getMyProfile: protectedProcedure.query(async ({ ctx }) => {
 *     // ctx.user 保证存在（TypeScript 类型安全）
 *     return ctx.db.user.findUnique({ where: { id: ctx.user.id } });
 *   }),
 * });
 * ```
 */
export const protectedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(isAuthed);

/**
 * 📚 中间件执行顺序
 * 
 * 请求 → loggerMiddleware → isAuthed → Procedure
 *   ↓
 * 响应 ← loggerMiddleware ← isAuthed ← Procedure
 * 
 * 如果 isAuthed 抛出错误，Procedure 不会执行，
 * 错误会被 loggerMiddleware 捕获并记录。
 */

/**
 * 📚 Context 创建（实际应用中的示例）
 * 
 * ```typescript
 * // server/trpc/context.ts
 * import { inferAsyncReturnType } from '@trpc/server';
 * import { CreateNextContextOptions } from '@trpc/server/adapters/next';
 * import { getServerSession } from 'next-auth';
 * import { prisma } from '@/lib/prisma';
 * 
 * export async function createContext(opts: CreateNextContextOptions) {
 *   const session = await getServerSession(opts.req, opts.res, authOptions);
 *   
 *   console.log('[tRPC Context] 创建上下文, session:', session?.user?.email || 'anonymous');
 *   
 *   return {
 *     session,
 *     db: prisma,
 *   };
 * }
 * 
 * export type Context = inferAsyncReturnType<typeof createContext>;
 * ```
 */
