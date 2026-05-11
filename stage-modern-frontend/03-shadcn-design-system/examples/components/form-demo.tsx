// shadcn/ui Form 组件完整示例
// 集成 React Hook Form + Zod 的类型安全表单

"use client"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

// 1. 定义 Zod Schema（验证规则 + 类型定义）
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
  
  role: z.enum(["admin", "user", "guest"], {
    required_error: "请选择角色",
  }),
  
  bio: z
    .string()
    .max(500, { message: "简介最多 500 个字符" })
    .optional(),
  
  notifications: z.boolean().default(false),
  
  theme: z.enum(["light", "dark"], {
    required_error: "请选择主题",
  }),
})

// 2. 从 Schema 推导出 TypeScript 类型
type FormValues = z.infer<typeof formSchema>

export default function FormDemo() {
  // 3. 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
      bio: "",
      notifications: false,
      theme: "light",
    },
  })

  // 4. 提交处理
  async function onSubmit(values: FormValues) {
    console.log('✅ 表单验证通过')
    console.log('📋 提交的值:', values)
    
    // 模拟 API 调用
    console.log('🔄 发送 POST /api/register 请求...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('🎉 注册成功!')
    toast.success("注册成功", {
      description: "你的账户已创建，欢迎使用！",
    })
    
    // 重置表单
    form.reset()
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">用户注册</h1>
        <p className="text-gray-600 mb-8">
          shadcn/ui Form 示例 - React Hook Form + Zod 类型安全表单
        </p>
        
        <div className="bg-white p-8 rounded-lg shadow">
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
                      3-20 个字符，仅支持字母、数字和下划线
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
                      至少 8 个字符，必须包含大写字母和数字
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 角色选择 */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">管理员</SelectItem>
                        <SelectItem value="user">普通用户</SelectItem>
                        <SelectItem value="guest">访客</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 简介（可选） */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>个人简介（可选）</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="介绍一下你自己..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      最多 500 个字符
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 主题单选 */}
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>主题偏好</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="light" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            亮色模式
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="dark" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            暗黑模式
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 通知复选框 */}
              <FormField
                control={form.control}
                name="notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        接收邮件通知
                      </FormLabel>
                      <FormDescription>
                        我们会向你发送产品更新和新功能通知
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* 提交按钮 */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  注册
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  重置
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* 说明 */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Form 特性</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ <strong>类型安全:</strong> Zod Schema 自动推导 TypeScript 类型</li>
            <li>✅ <strong>实时验证:</strong> 字段失焦时验证，提交时整体验证</li>
            <li>✅ <strong>错误展示:</strong> FormMessage 自动显示对应错误</li>
            <li>✅ <strong>可访问性:</strong> 自动添加 aria 属性和 label 关联</li>
            <li>✅ <strong>可组合:</strong> 支持 Input、Textarea、Select、Checkbox、RadioGroup</li>
          </ul>
        </div>

        {/* 表单值预览 */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-bold mb-2 text-sm">表单值（实时）:</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

console.log('✅ shadcn/ui Form 完整示例');
console.log('🔧 集成: React Hook Form + Zod');
console.log('📝 端到端类型安全');
