"use client"

/**
 * 用户注册表单示例
 * 
 * 演示 shadcn/ui Form 组件与 React Hook Form + Zod 的集成:
 * - 端到端类型安全
 * - 实时验证
 * - 错误提示
 * - 自定义验证规则
 * 
 * 技术栈:
 * - React Hook Form: 表单状态管理
 * - Zod: Schema 验证 + TypeScript 类型推导
 * - shadcn/ui: UI 组件
 */

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"

// 1. 定义 Zod Schema (验证规则 + 类型定义合一)
const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "用户名至少 3 个字符" })
    .max(20, { message: "用户名最多 20 个字符" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "只能包含字母、数字和下划线" }),
  
  email: z
    .string()
    .email({ message: "邮箱格式不正确" }),
  
  password: z
    .string()
    .min(8, { message: "密码至少 8 个字符" })
    .regex(/[A-Z]/, { message: "密码必须包含大写字母" })
    .regex(/[0-9]/, { message: "密码必须包含数字" }),
  
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],
})

// 2. 从 Schema 推导出 TypeScript 类型
type FormValues = z.infer<typeof formSchema>

export default function RegisterForm() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  // 3. 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // 4. 提交处理
  async function onSubmit(values: FormValues) {
    console.log('表单验证通过,提交的值:', values)
    // values 的类型是 FormValues,完全类型安全
    
    setSubmitStatus('submitting')
    
    try {
      // 模拟 API 调用
      console.log('发送 POST /api/register 请求...')
      console.log('用户名:', values.username)
      console.log('邮箱:', values.email)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('✅ 注册成功!')
      setSubmitStatus('success')
      
      // 重置表单
      setTimeout(() => {
        form.reset()
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('❌ 注册失败:', error)
      setSubmitStatus('error')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">用户注册</h1>
        <p className="text-sm text-muted-foreground">
          创建你的账号,开始使用我们的服务
        </p>
      </div>
      
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
                  <Input placeholder="请输入用户名" {...field} />
                </FormControl>
                <FormDescription>
                  3-20 个字符,仅支持字母、数字和下划线
                </FormDescription>
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
                  <Input type="email" placeholder="your@email.com" {...field} />
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
                  <Input type="password" placeholder="请输入密码" {...field} />
                </FormControl>
                <FormDescription>
                  至少 8 个字符,必须包含大写字母和数字
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 确认密码字段 */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="再次输入密码" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 提交状态提示 */}
          {submitStatus === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-900">✅ 注册成功!正在跳转...</p>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-900">❌ 注册失败,请稍后重试</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitStatus === 'submitting'}
          >
            {submitStatus === 'submitting' ? '注册中...' : '注册'}
          </Button>
        </form>
      </Form>

      {/* 表单状态调试 */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2 text-sm">表单状态 (调试)</h3>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(form.formState.errors, null, 2)}
        </pre>
      </div>

      {/* 技术说明 */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">技术亮点</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>✅ <strong>类型安全:</strong> Schema 定义了验证规则,同时推导出 TypeScript 类型</li>
          <li>✅ <strong>实时验证:</strong> 每个字段失焦时验证,提交时整体验证</li>
          <li>✅ <strong>错误展示:</strong> FormMessage 自动显示对应字段的错误信息</li>
          <li>✅ <strong>跨字段验证:</strong> refine() 实现"确认密码"与"密码"一致性检查</li>
          <li>✅ <strong>无样板代码:</strong> shadcn/ui Form 组件封装了 React Hook Form 的复杂性</li>
        </ul>
      </div>
    </div>
  )
}

console.log('✅ RegisterForm 组件已加载')
console.log('📦 技术栈: React Hook Form + Zod + shadcn/ui')
console.log('🎯 端到端类型安全: Zod Schema → TypeScript 类型 → 表单值')
console.log('⚡ 实时验证: 失焦时验证,提交时整体验证')
