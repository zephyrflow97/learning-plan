'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// 登录表单的 Schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  console.log('组件渲染 - FormState:', {
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('🔐 提交登录表单:', { email: data.email, rememberMe: data.rememberMe });

    try {
      // 调用 NextAuth signIn
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // 不自动重定向,手动处理
      });

      console.log('登录结果:', result);

      if (result?.error) {
        console.error('❌ 登录失败:', result.error);
        // 设置表单级别错误
        form.setError('root', {
          type: 'manual',
          message: 'Invalid email or password',
        });
        return;
      }

      console.log('✅ 登录成功,重定向到 Dashboard');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('❌ 登录过程出错:', error);
      form.setError('root', {
        type: 'manual',
        message: 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-gray-500">Enter your credentials to access your account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email 字段 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password 字段 */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me */}
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Remember me</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* 表单级别错误 */}
          {form.formState.errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                {form.formState.errors.root.message}
              </p>
            </div>
          )}

          {/* Submit 按钮 */}
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>

      {/* 调试区域 */}
      <details className="rounded border p-4 text-xs">
        <summary className="cursor-pointer font-semibold">Debug Info</summary>
        <pre className="mt-2 overflow-auto">
          {JSON.stringify(
            {
              values: form.watch(),
              errors: form.formState.errors,
              isDirty: form.formState.isDirty,
              isSubmitting: form.formState.isSubmitting,
              isValid: form.formState.isValid,
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}
