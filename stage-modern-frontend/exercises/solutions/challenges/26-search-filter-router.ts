// server/routers/product.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';

export const productRouter = router({
  search: publicProcedure
    .input(z.object({
      keyword: z.string().optional(),
      categoryId: z.number().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      tags: z.array(z.string()).optional(),
      sortBy: z.enum(['price', 'createdAt', 'sales']).default('createdAt'),
      order: z.enum(['asc', 'desc']).default('desc'),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      console.log('[搜索] 参数:', input);

      const where: any = {};

      // 关键词搜索(标题或描述包含)
      if (input.keyword) {
        where.OR = [
          { title: { contains: input.keyword, mode: 'insensitive' } },
          { description: { contains: input.keyword, mode: 'insensitive' } },
        ];
      }

      // 分类过滤
      if (input.categoryId) {
        where.categoryId = input.categoryId;
      }

      // 价格区间
      if (input.minPrice || input.maxPrice) {
        where.price = {};
        if (input.minPrice) where.price.gte = input.minPrice;
        if (input.maxPrice) where.price.lte = input.maxPrice;
      }

      // 标签过滤(多对多关系)
      if (input.tags && input.tags.length > 0) {
        where.tags = {
          some: {
            tag: {
              name: { in: input.tags },
            },
          },
        };
      }

      // 查询
      const products = await prisma.product.findMany({
        where,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        orderBy: {
          [input.sortBy]: input.order,
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      const total = await prisma.product.count({ where });

      console.log(`[搜索] 查询到 ${products.length} 个商品,共 ${total} 个`);

      return {
        products,
        total,
        pages: Math.ceil(total / input.limit),
      };
    }),
});
