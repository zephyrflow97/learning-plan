import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(1, '浠诲姟鏍囬涓嶈兘涓虹┖'),
  description: z.string().optional(),
  projectId: z.string(),
  status: z.nativeEnum(TaskStatus).default('TODO'),
  priority: z.nativeEnum(TaskPriority).default('MEDIUM'),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
});

export const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
  order: z.number().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
