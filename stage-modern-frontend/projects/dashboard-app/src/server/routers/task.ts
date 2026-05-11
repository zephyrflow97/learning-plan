import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const taskRouter = router({
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const tasks = await ctx.prisma.task.findMany({
        where: { projectId: input.projectId },
        include: {
          assignee: {
            select: { id: true, name: true, image: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { order: 'asc' },
        ],
      });

      const grouped = {
        TODO: tasks.filter((t) => t.status === 'TODO'),
        IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
        DONE: tasks.filter((t) => t.status === 'DONE'),
      };

      return grouped;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, '浠诲姟鏍囬涓嶈兘涓虹┖'),
        description: z.string().optional(),
        projectId: z.string(),
        status: z.nativeEnum(TaskStatus).default('TODO'),
        priority: z.nativeEnum(TaskPriority).default('MEDIUM'),
        assigneeId: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const maxOrder = await ctx.prisma.task.aggregate({
        where: {
          projectId: input.projectId,
          status: input.status,
        },
        _max: {
          order: true,
        },
      });

      const task = await ctx.prisma.task.create({
        data: {
          ...input,
          order: (maxOrder._max.order ?? -1) + 1,
        },
        include: {
          assignee: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      return task;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(TaskPriority).optional(),
        assigneeId: z.string().optional(),
        dueDate: z.date().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const updateData: any = { ...data };
      if (data.status === 'DONE') {
        updateData.completedAt = new Date();
      }

      const task = await ctx.prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          assignee: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      return task;
    }),

  reorder: protectedProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            id: z.string(),
            status: z.nativeEnum(TaskStatus),
            order: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(
        input.updates.map((update) =>
          ctx.prisma.task.update({
            where: { id: update.id },
            data: {
              status: update.status,
              order: update.order,
            },
          })
        )
      );

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.task.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
