// ✅ app/login/page.tsx (客户端)
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { loginSchema, loginAction } from './actions';
import { z } from 'zod';

export default function LoginPage() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),  // 客户端验证(第一道城门)
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    console.log('[Client] 表单提交,客户端验证通过:', data);
    
    // 调用 Server Action
    const result = await loginAction(data);
    
    if (!result.success) {
      console.log('[Client] 服务器返回错误:', result.errors);
      
      // 将服务器错误映射回表单
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: 'server',
            message: messages?.[0],
          });
        });
      }
    } else {
      console.log('[Client] 登录成功,跳转到仪表盘');
      // redirect('/dashboard');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... 表单字段 ... */}
    </form>
  );
}
