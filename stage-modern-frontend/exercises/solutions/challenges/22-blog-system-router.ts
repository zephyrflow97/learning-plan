// server/routers/post.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';

export const postRouter = router({
  // 获取所有文章
  getAll: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ input }) => {
      const posts = await prisma.post.findMany({
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await prisma.post.count();

      return {
        posts,
        total,
        pages: Math.ceil(total / input.limit),
      };
    }),

  // 创建文章
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      tagIds: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const post = await prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          tags: {
            create: input.tagIds.map(tagId => ({
              tagId,
            })),
          },
        },
      });

      return post;
    }),
});
