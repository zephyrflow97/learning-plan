import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, '椤圭洰鍚嶇О涓嶈兘涓虹┖'),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  deadline: z.date().optional(),
});

export const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  deadline: z.date().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
