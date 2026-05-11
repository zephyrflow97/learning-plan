import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
    return user;
  }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email('閭鏍煎紡涓嶆纭?),
        password: z.string().min(8, '瀵嗙爜鑷冲皯 8 浣?),
        name: z.string().min(1, '濮撳悕涓嶈兘涓虹┖'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '璇ラ偖绠卞凡琚敞鍐?,
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return { success: true, user };
    }),
});
