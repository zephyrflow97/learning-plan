// app/actions/user.ts - Server Action with Zod validation
"use server";

import { db } from "@/lib/db";
import { createUserServerSchema, type CreateUserInput } from "@/lib/schemas/user";
import bcrypt from "bcryptjs";

export async function createUser(data: CreateUserInput) {
  console.log('[Server] 收到注册请求:', data.email);

  // 1️⃣ 服务端验证(异步 refine)
  const result = await createUserServerSchema.safeParseAsync(data);

  if (!result.success) {
    console.log('[Server] 验证失败:', result.error.issues);
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const validatedData = result.data;
  console.log('[Server] 验证成功:', validatedData.email);

  try {
    // 2️⃣ 哈希密码
    const passwordHash = await bcrypt.hash(validatedData.password, 12);
    console.log('[Server] 密码已哈希');

    // 3️⃣ 创建用户
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        // confirmPassword 不存储(只用于验证)
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    console.log('[Server] 用户创建成功:', user.id);

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('[Server] 创建用户失败:', error);

    // 捕获数据库唯一性约束错误
    if (error.code === 'P2002') {
      return {
        success: false,
        errors: {
          email: ['Email already registered'],
        },
      };
    }

    return {
      success: false,
      errors: {
        _form: ['An error occurred. Please try again.'],
      },
    };
  }
}

// 客户端表单组件示例
// app/register/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserInput } from '@/lib/schemas/user';
import { createUser } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      age: 18,
      country: 'US',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    console.log('[Client] 提交注册表单:', data.email);

    // 调用 Server Action
    const result = await createUser(data);

    if (!result.success) {
      console.log('[Client] 服务器返回错误:', result.errors);

      // 将服务器端错误映射回表单
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (field === '_form') {
            form.setError('root', {
              type: 'server',
              message: messages?.[0],
            });
          } else {
            form.setError(field as any, {
              type: 'server',
              message: messages?.[0],
            });
          }
        });
      }

      return;
    }

    console.log('[Client] 注册成功:', result.user);
    router.push('/auth/signin?registered=true');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 表单字段... */}
    </form>
  );
}
