import { z } from 'zod';

// ✅ 导出 schema,客户端和服务器共用
export const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ✅ 导出类型
export type CreateUserInput = z.infer<typeof createUserSchema>;

// 服务器端可能需要更严格的验证
export const createUserServerSchema = createUserSchema.extend({
  // 服务器端额外检查
  email: z.string().email().refine(async (email) => {
    // 检查邮箱是否已存在(异步验证)
    // const exists = await db.user.findUnique({ where: { email } });
    // return !exists;
    return true;
  }, 'Email already exists'),
});
