// ==========================================
// Context 创建示例（实际应用）
// ==========================================

import { inferAsyncReturnType } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';

/**
 * 创建 tRPC Context
 * 
 * Context 在每个 HTTP 请求中都会创建，
 * 所有 Procedure 都能访问。
 * 
 * 通常包含：
 * - db: 数据库客户端（如 Prisma）
 * - session: 用户会话信息（从 NextAuth 获取）
 * - req/res: HTTP 请求和响应对象
 * 
 * @param opts - Next.js 请求选项
 */
export async function createContext(opts: CreateNextContextOptions) {
  console.log('[Context] 创建新的请求上下文');
  console.log('[Context] 请求路径:', opts.req.url);
  console.log('[Context] 请求方法:', opts.req.method);
  
  /**
   * 1. 获取用户会话
   * 
   * 使用 NextAuth 获取当前登录用户的信息
   */
  // const session = await getServerSession(opts.req, opts.res, authOptions);
  // console.log('[Context] 会话用户:', session?.user?.email || 'anonymous');
  
  // 示例：模拟会话
  const session = {
    user: {
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
      role: 'USER' as const,
    },
  };
  
  /**
   * 2. 初始化数据库客户端
   * 
   * ⚠️ Prisma Client 应该是单例，不要每次都创建
   */
  // import { prisma } from '@/lib/prisma';
  // const db = prisma;
  
  // 示例：模拟 db
  const db = {
    user: {
      findUnique: async () => null,
      findMany: async () => [],
    },
    post: {
      findUnique: async () => null,
      findMany: async () => [],
    },
  };
  
  /**
   * 3. 其他上下文数据
   */
  const userAgent = opts.req.headers['user-agent'];
  const ipAddress = opts.req.headers['x-forwarded-for'] || opts.req.socket.remoteAddress;
  
  console.log('[Context] User-Agent:', userAgent);
  console.log('[Context] IP:', ipAddress);
  
  /**
   * 返回 Context 对象
   * 
   * 所有 Procedure 都能通过 `ctx` 参数访问这些数据
   */
  return {
    // ✅ 始终可用
    db,
    req: opts.req,
    res: opts.res,
    
    // ⚠️ 可能为 null（未登录用户）
    session,
    
    // 其他元数据
    userAgent,
    ipAddress,
  };
}

/**
 * 推断 Context 类型
 * 
 * ✅ 使用 inferAsyncReturnType 而不是手写类型
 * 这样 Context 类型会随着 createContext 函数自动更新
 */
export type Context = inferAsyncReturnType<typeof createContext>;

/**
 * 📚 Context 的生命周期
 * 
 * ```
 * 客户端发送请求
 *   ↓
 * Next.js API Route 接收请求
 *   ↓
 * 调用 createContext(opts) → 创建 ctx 对象
 *   ↓
 * 执行 Middleware 链（可以扩展 ctx）
 *   ↓
 * 执行 Procedure，访问 ctx
 *   ↓
 * 返回响应
 *   ↓
 * ctx 对象被销毁
 * ```
 */

/**
 * 📚 Context 的最佳实践
 * 
 * ✅ DO:
 * - 将数据库客户端放在 Context 中
 * - 将用户会话放在 Context 中
 * - 将请求元数据（IP、User-Agent）放在 Context 中
 * 
 * ❌ DON'T:
 * - 不要在 Context 中执行耗时操作（如数据库查询）
 * - 不要在 Context 中执行有副作用的操作
 * - 不要在 Context 中缓存数据（Context 是临时的）
 * 
 * 原因：createContext 在每个请求中都会执行，
 * 如果它很慢，所有请求都会变慢。
 */

/**
 * 📚 扩展 Context（通过 Middleware）
 * 
 * 某些 Procedure 需要额外的 Context 字段，
 * 可以通过 Middleware 扩展：
 * 
 * ```typescript
 * const isAuthed = t.middleware(async ({ ctx, next }) => {
 *   if (!ctx.session?.user) {
 *     throw new TRPCError({ code: 'UNAUTHORIZED' });
 *   }
 *   
 *   // ✅ 扩展 Context，保证 user 不为 null
 *   return next({
 *     ctx: {
 *       ...ctx,
 *       user: ctx.session.user, // 现在 ctx.user 保证存在
 *     },
 *   });
 * });
 * 
 * const protectedProcedure = t.procedure.use(isAuthed);
 * 
 * // 使用
 * export const appRouter = router({
 *   getMyProfile: protectedProcedure.query(({ ctx }) => {
 *     // ctx.user 保证存在（TypeScript 类型安全）
 *     return ctx.db.user.findUnique({ where: { id: ctx.user.id } });
 *   }),
 * });
 * ```
 */

/**
 * 📚 Context 与测试
 * 
 * 在测试中，你可以传入 mock 的 Context：
 * 
 * ```typescript
 * import { appRouter } from '@/server/trpc/routers/_app';
 * 
 * test('getMyProfile returns user', async () => {
 *   const caller = appRouter.createCaller({
 *     // Mock Context
 *     db: mockDb,
 *     session: {
 *       user: { id: 1, email: 'test@example.com', name: 'Test User' },
 *     },
 *   });
 *   
 *   const result = await caller.user.getMyProfile();
 *   expect(result.email).toBe('test@example.com');
 * });
 * ```
 */
