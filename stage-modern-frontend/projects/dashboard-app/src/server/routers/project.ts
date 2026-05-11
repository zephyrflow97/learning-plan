import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const projectRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return projects;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '椤圭洰涓嶅瓨鍦ㄦ垨鏃犳潈闄愯闂?,
        });
      }

      return project;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, '椤圭洰鍚嶇О涓嶈兘涓虹┖'),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        deadline: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({
        data: {
          ...input,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: 'OWNER',
            },
          },
        },
      });
      return project;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        deadline: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.session.user.id,
            projectId: input.id,
          },
        },
      });

      if (!member || member.role !== 'OWNER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '鍙湁椤圭洰鎷ユ湁鑰呭彲浠ョ紪杈戦」鐩?,
        });
      }

      const { id, ...data } = input;
      const project = await ctx.prisma.project.update({
        where: { id },
        data,
      });
      return project;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.session.user.id,
            projectId: input.id,
          },
        },
      });

      if (!member || member.role !== 'OWNER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '鍙湁椤圭洰鎷ユ湁鑰呭彲浠ュ垹闄ら」鐩?,
        });
      }

      await ctx.prisma.project.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
