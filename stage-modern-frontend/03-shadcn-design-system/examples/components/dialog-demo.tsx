// shadcn/ui Dialog 组件使用示例
// 文件路径: examples/components/dialog-demo.tsx

'use client'

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash, AlertCircle, CheckCircle, Info } from "lucide-react"

/**
 * Dialog 组件完整演示
 * 
 * 演示内容:
 * 1. 基础对话框
 * 2. 受控模式对话框
 * 3. 确认对话框 (危险操作)
 * 4. 表单对话框
 * 5. 自定义内容对话框
 */
export default function DialogDemo() {
  const [openControlled, setOpenControlled] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [username, setUsername] = useState("")
  
  console.log('🎨 Dialog 组件演示页面加载')

  // 模拟删除操作
  const handleDelete = async () => {
    console.log('🗑️ 执行删除操作...')
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('✅ 删除成功')
    setOpenControlled(false)
  }

  // 表单提交
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 表单提交:', { username })
    setOpenForm(false)
    setUsername("")
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dialog 组件示例</h1>
        <p className="text-muted-foreground">
          展示 shadcn/ui Dialog 组件的所有用法
        </p>
      </div>

      {/* 1. 基础对话框 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. 基础对话框 (非受控)</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>打开对话框</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>欢迎使用 Dialog</DialogTitle>
              <DialogDescription>
                这是一个基础的对话框示例。点击遮罩或按 Esc 键可以关闭。
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Dialog 组件基于 Radix UI,自动处理:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>焦点陷阱 (Tab 键在对话框内循环)</li>
                <li>Esc 键关闭</li>
                <li>背景滚动锁定</li>
                <li>ARIA 无障碍属性</li>
              </ul>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">关闭</Button>
              </DialogClose>
              <Button>确认</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="text-sm text-muted-foreground">
          💡 非受控模式:Dialog 自己管理 open 状态
        </p>
      </section>

      {/* 2. 受控模式对话框 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. 受控模式对话框</h2>
        <Button onClick={() => setOpenControlled(true)}>
          打开受控对话框
        </Button>
        
        <Dialog open={openControlled} onOpenChange={setOpenControlled}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除?</DialogTitle>
              <DialogDescription>
                此操作不可恢复。删除后,所有相关数据将永久丢失。
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">即将删除:</p>
                  <ul className="text-sm text-muted-foreground space-y-0.5">
                    <li>• 3 个项目文件</li>
                    <li>• 127 条数据记录</li>
                    <li>• 所有相关的用户权限</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenControlled(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="text-sm text-muted-foreground">
          💡 受控模式:通过 open 和 onOpenChange props 控制状态
        </p>
      </section>

      {/* 3. 表单对话框 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. 表单对话框</h2>
        <Button onClick={() => setOpenForm(true)}>
          打开表单对话框
        </Button>
        
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑个人资料</DialogTitle>
              <DialogDescription>
                修改你的个人信息。点击保存后生效。
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Input
                    id="bio"
                    placeholder="介绍一下自己..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenForm(false)}
                >
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <p className="text-sm text-muted-foreground">
          💡 表单对话框:使用 &lt;form&gt; 元素,按 Enter 可提交
        </p>
      </section>

      {/* 4. 不同样式的对话框 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. 不同样式的对话框</h2>
        <div className="flex flex-wrap gap-4">
          {/* 成功提示 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">成功提示</Button>
            </DialogTrigger>
            <DialogContent>
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <DialogTitle className="mb-2">操作成功!</DialogTitle>
                <DialogDescription>
                  你的更改已保存并生效。
                </DialogDescription>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="w-full">确定</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 信息提示 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">信息提示</Button>
            </DialogTrigger>
            <DialogContent>
              <div className="flex items-start gap-4 py-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="mb-2">新功能上线</DialogTitle>
                  <DialogDescription>
                    我们刚刚发布了新版本,包含以下改进:
                  </DialogDescription>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• 性能优化:页面加载速度提升 40%</li>
                    <li>• 新增暗黑模式支持</li>
                    <li>• 修复了 15 个已知问题</li>
                  </ul>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button>知道了</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* 5. 自定义样式 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">5. 自定义样式</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">自定义样式对话框</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>自定义样式示例</DialogTitle>
              <DialogDescription>
                你可以通过 className 自定义对话框的样式
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                <h3 className="font-medium mb-2">更大的尺寸</h3>
                <p className="text-sm text-muted-foreground">
                  使用 className="max-w-2xl" 扩大对话框宽度
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                <h3 className="font-medium mb-2">自定义内容</h3>
                <p className="text-sm text-muted-foreground">
                  DialogContent 内可以放任何 React 组件
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button>关闭</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="text-sm text-muted-foreground">
          💡 DialogContent 接受所有标准的 div props,包括 className
        </p>
      </section>

      {/* 技术说明 */}
      <section className="bg-muted p-6 rounded-lg space-y-4">
        <h3 className="font-bold">🔧 技术实现</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>底层库:</strong> @radix-ui/react-dialog (Radix UI 提供行为逻辑)
          </p>
          <p>
            <strong>样式:</strong> Tailwind CSS (shadcn/ui 提供预设样式)
          </p>
          <p>
            <strong>动画:</strong> Tailwind 的 data-[state] 选择器 + 过渡动画
          </p>
          <div className="mt-3">
            <p className="font-medium text-foreground mb-1">Radix 提供的功能:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>焦点陷阱:Tab 键在对话框内循环</li>
              <li>Esc 键关闭</li>
              <li>背景滚动锁定</li>
              <li>点击遮罩关闭 (可配置)</li>
              <li>完整的 ARIA 无障碍属性</li>
            </ul>
          </div>
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
console.log('📦 Dialog 组件来源:')
console.log('  shadcn/ui CLI: npx shadcn@latest add dialog')
console.log('  底层依赖: @radix-ui/react-dialog')
console.log('')
console.log('🎨 Dialog 组件结构:')
console.log('  <Dialog> - 根组件 (管理状态)')
console.log('  <DialogTrigger> - 触发按钮')
console.log('  <DialogContent> - 对话框内容')
console.log('    <DialogHeader> - 头部区域')
console.log('      <DialogTitle> - 标题 (必需,ARIA 要求)')
console.log('      <DialogDescription> - 描述 (可选,ARIA 推荐)')
console.log('    <DialogFooter> - 底部按钮区域')
console.log('    <DialogClose> - 关闭按钮')
console.log('')
console.log('💡 两种模式:')
console.log('  非受控: <Dialog> (组件自己管理 open 状态)')
console.log('  受控: <Dialog open={bool} onOpenChange={fn}> (手动控制)')
console.log('')
console.log('⚠️ 注意事项:')
console.log('  1. DialogTitle 是必需的 (ARIA 要求)')
console.log('  2. 避免嵌套 Dialog (用户体验差)')
console.log('  3. 危险操作需要明确的确认步骤')
console.log('  4. 表单在 Dialog 中时,记得处理提交后的关闭逻辑')
