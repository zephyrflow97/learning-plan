// ✅ app/actions/auth.ts (服务器端)
'use server';

import { z } from 'zod';

// ✅ 在服务器端定义相同的 Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function loginAction(formData: z.infer<typeof loginSchema>) {
  console.log('[Server] 收到登录请求');
  
  // ✅ 服务器端验证(第二道城门)
  const result = loginSchema.safeParse(formData);
  
  if (!result.success) {
    console.log('[Server] 验证失败(客户端被绕过了!):', result.error.issues);
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  console.log('[Server] 验证通过:', result.data);
  
  // ✅ 数据已验证,可以安全使用
  const { email, password } = result.data;
  
  // 查询数据库,验证凭据
  // const user = await db.user.findUnique({ where: { email } });
  // if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
  //   return { success: false, error: 'Invalid credentials' };
  // }
  
  console.log('[Server] 用户认证成功');
  
  return { success: true };
}
