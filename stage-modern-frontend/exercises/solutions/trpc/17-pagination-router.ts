// server/routers/post.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';

export const postRouter = router({
  getPostsPaginated: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.number().optional(), // 上一页的最后一个 ID
    }))
    .query(async ({ input }) => {
      console.log('[tRPC] 分页查询,cursor:', input.cursor, 'limit:', input.limit);

      const posts = await prisma.post.findMany({
        take: input.limit + 1, // 多取一条判断是否有下一页
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0, // 跳过 cursor 本身
        orderBy: {
          id: 'desc',
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
      });

      let nextCursor: number | undefined = undefined;

      // 如果返回了 limit + 1 条,说明有下一页
      if (posts.length > input.limit) {
        const nextItem = posts.pop(); // 移除多余的一条
        nextCursor = nextItem!.id;
      }

      console.log(`[tRPC] 返回 ${posts.length} 条记录,下一页cursor: ${nextCursor}`);

      return {
        posts,
        nextCursor,
      };
    }),
});
