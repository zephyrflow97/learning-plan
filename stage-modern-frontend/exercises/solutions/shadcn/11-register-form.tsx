'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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

// Zod schema 定义
const formSchema = z.object({
  username: z.string().min(2, {
    message: '用户名至少 2 个字符',
  }),
  email: z.string().email({
    message: '请输入有效的邮箱地址',
  }),
  password: z.string().min(6, {
    message: '密码至少 6 位',
  }),
});

export default function RegisterForm() {
  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // 提交处理
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('[表单提交]', values);
    alert(`注册成功!\n用户名: ${values.username}`);
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">注册</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 用户名字段 */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input placeholder="输入用户名" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 邮箱字段 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="输入邮箱" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 密码字段 */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="输入密码" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            注册
          </Button>
        </form>
      </Form>
    </div>
  );
}
