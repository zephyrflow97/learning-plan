// app/actions/auth.ts - 注册 Server Action
"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// 注册表单的 Schema
const registerSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  email: z.string().email("邮箱格式不正确"),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/[A-Z]/, "必须包含大写字母")
    .regex(/[a-z]/, "必须包含小写字母")
    .regex(/[0-9]/, "必须包含数字"),
});

export async function registerUser(formData: FormData) {
  console.log('📝 注册请求:', formData.get('email'));

  // 1️⃣ 验证输入
  const result = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    console.error('❌ 验证失败:', result.error.issues);
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = result.data;

  // 2️⃣ 检查邮箱唯一性
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error('❌ 邮箱已被注册');
    return {
      success: false,
      errors: { email: ['该邮箱已被注册'] },
    };
  }

  // 3️⃣ 哈希密码
  console.log('🔐 哈希密码...');
  const startTime = performance.now();
  const saltRounds = 12; // 平衡安全性和性能
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const duration = performance.now() - startTime;
  console.log(`密码哈希耗时: ${duration.toFixed(2)}ms`);

  // 4️⃣ 创建用户
  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log('✅ 用户创建成功:', user.email);

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('❌ 创建用户失败:', error);
    return {
      success: false,
      errors: { _form: ['注册失败,请稍后重试'] },
    };
  }
}
