// shadcn/ui Form 组件使用示例
// 文件路径: examples/forms/complete-form.tsx

'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

/**
 * 完整表单示例
 * 
 * 演示内容:
 * 1. Zod Schema 定义 (验证规则 + 类型推导)
 * 2. React Hook Form 集成
 * 3. 多种表单控件 (Input, Select, Textarea, Checkbox, Radio)
 * 4. 实时验证和错误提示
 * 5. 表单提交处理
 */

// ==========================================
// 1. 定义 Zod Schema (验证规则 + 类型定义合一)
// ==========================================
const formSchema = z.object({
  // 用户名
  username: z
    .string()
    .min(3, { message: "用户名至少 3 个字符" })
    .max(20, { message: "用户名最多 20 个字符" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "只能包含字母、数字和下划线" }),

  // 邮箱
  email: z
    .string()
    .email({ message: "邮箱格式不正确" }),

  // 密码
  password: z
    .string()
    .min(8, { message: "密码至少 8 个字符" })
    .regex(/[A-Z]/, { message: "密码必须包含大写字母" })
    .regex(/[0-9]/, { message: "密码必须包含数字" }),

  // 确认密码
  confirmPassword: z.string(),

  // 年龄 (可选)
  age: z.coerce
    .number({ invalid_type_error: "请输入有效的数字" })
    .int({ message: "年龄必须是整数" })
    .min(18, { message: "必须年满 18 岁" })
    .max(120, { message: "年龄不能超过 120 岁" })
    .optional(),

  // 国家 (下拉选择)
  country: z.string({
    required_error: "请选择国家",
  }),

  // 性别 (单选)
  gender: z.enum(["male", "female", "other"], {
    required_error: "请选择性别",
  }),

  // 个人简介 (可选)
  bio: z
    .string()
    .max(500, { message: "简介不能超过 500 个字符" })
    .optional(),

  // 同意条款 (必选)
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "必须同意服务条款",
  }),

  // 接收通知 (可选)
  receiveNotifications: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"], // 错误信息显示在 confirmPassword 字段
})

// ==========================================
// 2. 从 Schema 推导出 TypeScript 类型
// ==========================================
type FormValues = z.infer<typeof formSchema>

export default function CompleteFormDemo() {
  const { toast } = useToast()

  console.log('📝 完整表单示例加载')

  // ==========================================
  // 3. 初始化表单 (React Hook Form + Zod)
  // ==========================================
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: undefined,
      country: "",
      gender: undefined,
      bio: "",
      acceptTerms: false,
      receiveNotifications: false,
    },
  })

  // ==========================================
  // 4. 提交处理
  // ==========================================
  async function onSubmit(values: FormValues) {
    console.log('✅ 表单验证通过,提交的值:', values)
    
    // 模拟 API 调用
    console.log('🔄 发送 POST /api/register 请求...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('🎉 注册成功!')
    
    // 显示成功提示
    toast({
      title: "注册成功!",
      description: `欢迎你,${values.username}!`,
    })

    // 重置表单
    form.reset()
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">用户注册表单</h1>
        <p className="text-muted-foreground">
          演示 shadcn/ui Form 组件的完整用法 (React Hook Form + Zod)
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
                <FormLabel>用户名 *</FormLabel>
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
                <FormLabel>邮箱 *</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    {...field} 
                  />
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
                <FormLabel>密码 *</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="请输入密码" 
                    {...field} 
                  />
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
                <FormLabel>确认密码 *</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="再次输入密码" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 年龄字段 (可选) */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>年龄</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="请输入年龄" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  必须年满 18 岁
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 国家下拉选择 */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>国家 *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择国家" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cn">中国</SelectItem>
                    <SelectItem value="us">美国</SelectItem>
                    <SelectItem value="uk">英国</SelectItem>
                    <SelectItem value="jp">日本</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 性别单选 */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>性别 *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        男
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        女
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        其他
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 个人简介 (多行文本) */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>个人简介</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="介绍一下自己..."
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

          {/* 同意条款 (复选框 - 必选) */}
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    我同意 <a href="#" className="text-primary hover:underline">服务条款</a> 和 <a href="#" className="text-primary hover:underline">隐私政策</a> *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* 接收通知 (复选框 - 可选) */}
          <FormField
            control={form.control}
            name="receiveNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    接收产品更新和营销邮件
                  </FormLabel>
                  <FormDescription>
                    我们会偶尔发送重要通知 (可随时取消订阅)
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

      {/* 表单状态调试 */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-bold mb-2">📊 表单状态 (调试用)</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>是否有错误:</strong>{" "}
            {Object.keys(form.formState.errors).length > 0 ? "是" : "否"}
          </p>
          <p>
            <strong>是否已修改:</strong>{" "}
            {form.formState.isDirty ? "是" : "否"}
          </p>
          <p>
            <strong>是否正在提交:</strong>{" "}
            {form.formState.isSubmitting ? "是" : "否"}
          </p>
          {Object.keys(form.formState.errors).length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-destructive">
                查看错误详情
              </summary>
              <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                {JSON.stringify(form.formState.errors, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* 技术说明 */}
      <div className="mt-8 p-6 bg-muted rounded-lg space-y-4">
        <h3 className="font-bold">🔧 技术栈</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>React Hook Form:</strong> 表单状态管理和验证
          </p>
          <p>
            <strong>Zod:</strong> Schema 定义和类型推导
          </p>
          <p>
            <strong>shadcn/ui Form:</strong> 预设样式和布局
          </p>
          <div className="mt-3">
            <p className="font-medium text-foreground mb-1">优势:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>端到端类型安全 (Zod Schema → TypeScript 类型)</li>
              <li>实时验证 (失焦时验证,提交时整体验证)</li>
              <li>零配置的错误提示 (FormMessage 自动显示错误)</li>
              <li>性能优化 (非受控组件,减少 re-render)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// 组件挂载时输出信息
console.log('📦 Form 组件依赖:')
console.log('  shadcn/ui: form, input, select, textarea, checkbox, radio-group')
console.log('  第三方库: react-hook-form, zod, @hookform/resolvers')
console.log('')
console.log('🎨 Form 工作流程:')
console.log('  1. 定义 Zod Schema (验证规则 + 类型)')
console.log('  2. 用 z.infer<typeof schema> 推导 TypeScript 类型')
console.log('  3. useForm 初始化表单,传入 zodResolver')
console.log('  4. FormField 渲染每个字段,绑定 control')
console.log('  5. 提交时自动验证,验证通过才调用 onSubmit')
console.log('')
console.log('💡 最佳实践:')
console.log('  1. 必填字段在 label 后加 * 标记')
console.log('  2. 复杂验证用 .refine() (如密码确认)')
console.log('  3. 数字字段用 z.coerce.number() 自动转换类型')
console.log('  4. 可选字段用 .optional()')
console.log('  5. 提交成功后 form.reset() 重置表单')
