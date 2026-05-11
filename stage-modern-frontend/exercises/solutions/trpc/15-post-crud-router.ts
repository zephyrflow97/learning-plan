// server/routers/post.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';

export const postRouter = router({
  // 创建文章
  createPost: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      authorId: z.number(),
    }))
    .mutation(async ({ input }) => {
      console.log('[tRPC] 创建文章:', input.title);

      const post = await prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          authorId: input.authorId,
        },
      });

      return post;
    }),

  // 获取所有文章
  getPosts: publicProcedure
    .input(z.object({
      published: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      console.log('[tRPC] 获取文章,过滤:', input);

      const posts = await prisma.post.findMany({
        where: {
          published: input.published,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`[tRPC] 查询到 ${posts.length} 篇文章`);
      return posts;
    }),

  // 更新文章
  updatePost: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      published: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      console.log('[tRPC] 更新文章 ID:', input.id);

      const post = await prisma.post.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
          published: input.published,
        },
      });

      return post;
    }),

  // 删除文章
  deletePost: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      console.log('[tRPC] 删除文章 ID:', input.id);

      await prisma.post.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
