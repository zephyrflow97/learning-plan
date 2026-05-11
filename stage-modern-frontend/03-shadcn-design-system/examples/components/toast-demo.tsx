// shadcn/ui Toast 组件完整示例
// 非阻塞通知系统

"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function ToastDemo() {
  const { toast } = useToast()

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Toast 通知</h1>
        <p className="text-gray-600 mb-8">
          非阻塞式通知，自动消失，支持操作按钮
        </p>

        <div className="bg-white p-8 rounded-lg shadow space-y-4">
          <section>
            <h3 className="font-bold mb-2">基础通知</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  console.log('显示默认 Toast')
                  toast({
                    title: "消息标题",
                    description: "这是一条基础通知消息",
                  })
                }}
              >
                默认通知
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  console.log('显示简单 Toast')
                  toast({
                    description: "只有描述文本的简单通知",
                  })
                }}
              >
                简单通知
              </Button>
            </div>
          </section>

          <section>
            <h3 className="font-bold mb-2">成功/错误通知</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  console.log('显示成功 Toast')
                  toast({
                    title: "操作成功",
                    description: "你的更改已保存。",
                  })
                }}
              >
                成功通知
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  console.log('显示错误 Toast')
                  toast({
                    variant: "destructive",
                    title: "操作失败",
                    description: "网络连接错误，请稍后重试。",
                  })
                }}
              >
                错误通知
              </Button>
            </div>
          </section>

          <section>
            <h3 className="font-bold mb-2">带操作的通知</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('显示带操作的 Toast')
                  toast({
                    title: "文件已删除",
                    description: "照片.jpg 已移至回收站。",
                    action: (
                      <ToastAction 
                        altText="撤销删除"
                        onClick={() => console.log('撤销删除')}
                      >
                        撤销
                      </ToastAction>
                    ),
                  })
                }}
              >
                撤销操作
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  console.log('显示更新通知')
                  toast({
                    title: "新版本可用",
                    description: "版本 2.0.0 已发布，包含重要更新。",
                    action: (
                      <ToastAction 
                        altText="立即更新"
                        onClick={() => console.log('开始更新')}
                      >
                        更新
                      </ToastAction>
                    ),
                  })
                }}
              >
                更新提示
              </Button>
            </div>
          </section>

          <section>
            <h3 className="font-bold mb-2">批量通知</h3>
            <Button
              onClick={() => {
                console.log('显示 3 个 Toast')
                toast({ title: "Toast 1", description: "第一条消息" })
                setTimeout(() => {
                  toast({ title: "Toast 2", description: "第二条消息" })
                }, 500)
                setTimeout(() => {
                  toast({ title: "Toast 3", description: "第三条消息" })
                }, 1000)
              }}
            >
              显示 3 个通知
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              通知会自动堆叠，最多显示 3 个
            </p>
          </section>

          <section>
            <h3 className="font-bold mb-2">自定义时长</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('显示短时 Toast (2 秒)')
                  toast({
                    title: "快速通知",
                    description: "2 秒后自动消失",
                    duration: 2000,
                  })
                }}
              >
                2 秒消失
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  console.log('显示长时 Toast (10 秒)')
                  toast({
                    title: "持久通知",
                    description: "10 秒后自动消失",
                    duration: 10000,
                  })
                }}
              >
                10 秒消失
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  console.log('显示永久 Toast')
                  toast({
                    title: "永久通知",
                    description: "需要手动关闭",
                    duration: Infinity,
                  })
                }}
              >
                永久显示
              </Button>
            </div>
          </section>
        </div>

        {/* Promise Toast 示例 */}
        <div className="mt-8 bg-white p-8 rounded-lg shadow">
          <h3 className="font-bold mb-4">Promise Toast（异步操作）</h3>
          <Button
            onClick={async () => {
              console.log('开始异步操作')
              
              const loadingToast = toast({
                title: "处理中...",
                description: "请稍候",
                duration: Infinity,
              })

              try {
                // 模拟 API 调用
                await new Promise((resolve) => setTimeout(resolve, 2000))
                
                console.log('操作成功')
                loadingToast.dismiss()
                toast({
                  title: "成功",
                  description: "操作已完成",
                })
              } catch (error) {
                console.error('操作失败:', error)
                loadingToast.dismiss()
                toast({
                  variant: "destructive",
                  title: "失败",
                  description: "操作失败，请重试",
                })
              }
            }}
          >
            模拟异步操作
          </Button>
        </div>

        {/* 说明 */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Toast 特性</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ <strong>非阻塞:</strong> 不影响用户操作</li>
            <li>✅ <strong>自动消失:</strong> 默认 5 秒后自动关闭</li>
            <li>✅ <strong>可堆叠:</strong> 多个通知自动排列</li>
            <li>✅ <strong>操作支持:</strong> 可添加操作按钮（如"撤销"）</li>
            <li>✅ <strong>可访问性:</strong> 支持屏幕阅读器</li>
            <li>✅ <strong>手动关闭:</strong> 点击 X 或调用 dismiss()</li>
          </ul>
        </div>

        {/* 实现要点 */}
        <div className="mt-4 p-6 bg-gray-100 rounded-lg">
          <h4 className="font-bold mb-2 text-sm">实现要点:</h4>
          <pre className="text-xs overflow-auto">
{`// 1. 在 layout.tsx 添加 Toaster
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />  {/* Toast 容器 */}
      </body>
    </html>
  )
}

// 2. 使用 useToast hook
const { toast } = useToast()

toast({
  title: "标题",
  description: "描述",
  duration: 5000,  // 可选
  action: <ToastAction>操作</ToastAction>,  // 可选
})`}
          </pre>
        </div>
      </div>
    </div>
  )
}

console.log('✅ shadcn/ui Toast 完整示例');
console.log('🔧 基于 @radix-ui/react-toast');
console.log('⏱️ 默认 5 秒自动消失');
