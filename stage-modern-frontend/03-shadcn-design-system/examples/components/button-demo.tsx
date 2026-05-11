// shadcn/ui Button 组件使用示例
// 文件路径: examples/components/button-demo.tsx

'use client'

import { Button } from "@/components/ui/button"
import { 
  Download, 
  Plus, 
  Trash, 
  Loader2,
  Mail,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

/**
 * Button 组件完整演示
 * 
 * 演示内容:
 * 1. 所有 variant 变体
 * 2. 所有 size 尺寸
 * 3. 带图标的按钮
 * 4. 加载状态按钮
 * 5. asChild 用法
 */
export default function ButtonDemo() {
  const [loading, setLoading] = useState(false)

  console.log('🎨 Button 组件演示页面加载')

  const handleAsyncAction = async () => {
    console.log('🔄 开始异步操作...')
    setLoading(true)
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(false)
    console.log('✅ 异步操作完成')
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Button 组件示例</h1>
        <p className="text-muted-foreground">
          展示 shadcn/ui Button 组件的所有用法
        </p>
      </div>

      {/* 1. Variant 变体 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. Variant 变体</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          💡 variant 定义在 buttonVariants 的 CVA 配置中
        </p>
      </section>

      {/* 2. Size 尺寸 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. Size 尺寸</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          💡 size="icon" 专门用于只有图标的按钮 (正方形)
        </p>
      </section>

      {/* 3. 带图标的按钮 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. 带图标的按钮</h2>
        <div className="flex flex-wrap gap-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建
          </Button>
          
          <Button variant="destructive">
            <Trash className="mr-2 h-4 w-4" />
            删除
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            下载
          </Button>
          
          <Button variant="secondary">
            <Mail className="mr-2 h-4 w-4" />
            发送邮件
          </Button>

          <Button>
            继续
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          💡 图标推荐使用 lucide-react,大小通常为 h-4 w-4
        </p>
      </section>

      {/* 4. 加载状态 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. 加载状态</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleAsyncAction} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "提交中..." : "提交"}
          </Button>

          <Button variant="outline" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          💡 加载状态: disabled + Loader2 图标 + animate-spin
        </p>
      </section>

      {/* 5. 禁用状态 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">5. 禁用状态</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled Default</Button>
          <Button variant="destructive" disabled>Disabled Destructive</Button>
          <Button variant="outline" disabled>Disabled Outline</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          💡 disabled 状态会自动应用 opacity-50 和 cursor-not-allowed
        </p>
      </section>

      {/* 6. asChild 用法 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">6. asChild 用法</h2>
        <div className="flex flex-wrap gap-4">
          {/* 普通按钮 */}
          <Button>
            普通按钮 (button 元素)
          </Button>

          {/* 渲染为 <a> 标签 */}
          <Button asChild>
            <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              下载文档 (a 元素)
            </a>
          </Button>

          {/* 与 Next.js Link 结合 */}
          <Button asChild variant="outline">
            <a href="/docs">
              查看文档 (内部链接)
            </a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          💡 asChild: 把 Button 的样式应用到子元素上 (使用 Radix Slot)
        </p>
      </section>

      {/* 7. 组合使用 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">7. 实战组合</h2>
        <div className="flex flex-wrap items-center gap-4">
          {/* 主要操作 */}
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            创建项目
          </Button>

          {/* 次要操作 */}
          <Button variant="outline" size="lg">
            取消
          </Button>

          {/* 危险操作 */}
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            删除
          </Button>

          {/* 图标按钮 */}
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* 8. 自定义扩展 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">8. 自定义扩展示例</h2>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            如果你需要添加新的 variant (如霓虹色、玻璃态),直接编辑 <code className="bg-muted px-2 py-0.5 rounded">components/ui/button.tsx</code>:
          </p>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        // 添加新 variant
        neon: "bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg shadow-purple-500/50",
        glass: "bg-white/10 backdrop-blur-md border border-white/20",
      },
    },
  }
)`}
          </pre>
          <p className="text-sm text-muted-foreground">
            💡 这是 shadcn/ui 的核心优势:代码在你手里,随时可以改
          </p>
        </div>
      </section>

      {/* 日志输出 */}
      <section className="bg-muted p-4 rounded-lg">
        <h3 className="font-bold mb-2">📊 控制台日志</h3>
        <p className="text-sm text-muted-foreground">
          打开浏览器控制台查看详细日志 (F12 或 Cmd+Option+I)
        </p>
      </section>
    </div>
  )
}

// 组件挂载时输出信息
console.log('📦 Button 组件来源:')
console.log('  shadcn/ui CLI: npx shadcn@latest add button')
console.log('  底层依赖: @radix-ui/react-slot (asChild 功能)')
console.log('  样式管理: class-variance-authority (CVA)')
console.log('')
console.log('🎨 buttonVariants 使用 CVA 管理变体:')
console.log('  variant: default, destructive, outline, secondary, ghost, link')
console.log('  size: default, sm, lg, icon')
console.log('')
console.log('💡 最佳实践:')
console.log('  1. 主要操作用 variant="default"')
console.log('  2. 次要操作用 variant="outline" 或 variant="secondary"')
console.log('  3. 危险操作用 variant="destructive"')
console.log('  4. 图标按钮用 size="icon"')
console.log('  5. 需要链接语义时用 asChild + <a>')
