// app/actions/auth.ts
"use server"

import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/[A-Z]/, "密码必须包含大写字母")
    .regex(/[a-z]/, "密码必须包含小写字母")
    .regex(/[0-9]/, "密码必须包含数字"),
  name: z.string().min(1, "名字不能为空"),
})

export async function registerUser(formData: FormData) {
  console.log('📝 注册请求开始');
  
  // 1️⃣ 验证输入
  const result = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });
  
  if (!result.success) {
    console.error('❌ 验证失败:', result.error.flatten());
    return { success: false, error: result.error.flatten().fieldErrors };
  }
  
  const { email, password, name } = result.data;
  
  // 2️⃣ 检查邮箱是否已存在
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    console.error('❌ 邮箱已被注册:', email);
    return { success: false, error: { email: ['邮箱已被注册'] } };
  }
  
  // 3️⃣ 哈希密码
  console.log('🔐 开始哈希密码...');
  const saltRounds = 12; // Cost factor: 2^12 = 4096 次迭代
  const passwordHash = await bcrypt.hash(password, saltRounds);
  console.log('✅ 密码哈希完成,耗时:', performance.now());
  
  // ⚠️ 永远不要记录明文密码!
  // console.log('密码:', password); // ❌ 危险!
  
  // 4️⃣ 创建用户
  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "USER",
    },
  });
  
  console.log('✅ 用户创建成功:', user.id);
  
  return { success: true, userId: user.id };
}
