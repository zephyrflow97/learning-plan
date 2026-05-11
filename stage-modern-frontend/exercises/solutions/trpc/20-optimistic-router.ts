// server/routers/like.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

// 模拟数据库
let postLikes: Record<number, number> = {
  1: 10,
  2: 5,
  3: 20,
};

export const likeRouter = router({
  getLikes: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(({ input }) => {
      return { postId: input.postId, likes: postLikes[input.postId] || 0 };
    }),

  toggleLike: publicProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      console.log('[tRPC] 切换点赞,postId:', input.postId);

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟 20% 失败率
      if (Math.random() < 0.2) {
        console.error('[tRPC] 点赞失败(模拟错误)');
        throw new Error('点赞失败,请稍后重试');
      }

      postLikes[input.postId] = (postLikes[input.postId] || 0) + 1;
      return { postId: input.postId, likes: postLikes[input.postId] };
    }),
});
