// server/routers/app.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const appRouter = router({
  // 定义 hello procedure
  hello: publicProcedure
    // 输入验证(使用 Zod)
    .input(z.object({
      name: z.string(),
    }))
    // 处理函数
    .query(({ input }) => {
      console.log(`[tRPC] hello 被调用,参数:`, input);
      
      return {
        message: `你好, ${input.name}!`,
      };
    }),
});

// 导出类型定义
export type AppRouter = typeof appRouter;
