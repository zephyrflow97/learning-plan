import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('閭鏍煎紡涓嶆纭?),
  password: z.string().min(8, '瀵嗙爜鑷冲皯 8 浣?),
  name: z.string().min(1, '濮撳悕涓嶈兘涓虹┖'),
});

export const loginSchema = z.object({
  email: z.string().email('閭鏍煎紡涓嶆纭?),
  password: z.string().min(1, '瀵嗙爜涓嶈兘涓虹┖'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
