// shadcn/ui 组合组件示例: ConfirmDialog
// 基于 Dialog 构建的高层确认对话框组件

"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "确认",
  cancelText = "取消",
  variant = "default",
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const handleConfirm = async () => {
    console.log('用户点击确认按钮')
    setLoading(true)
    
    try {
      await onConfirm()
      console.log('操作成功，关闭对话框')
      onOpenChange(false)
    } catch (error) {
      console.error('操作失败:', error)
      // 保持对话框打开，让用户重试
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "处理中..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========================================
// 使用示例
// ========================================

export function ConfirmDialogDemo() {
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const [saveOpen, setSaveOpen] = React.useState(false)

  return (
    <div className="p-8 space-y-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">ConfirmDialog 组合组件</h1>
        <p className="text-gray-600 mb-8">
          基于 shadcn/ui Dialog 构建的高层确认对话框
        </p>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="font-bold">示例</h3>
          
          {/* 删除确认 */}
          <Button 
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            删除项目
          </Button>
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="确认删除?"
            description="此操作不可恢复，所有数据将永久丢失。"
            confirmText="删除"
            cancelText="取消"
            variant="destructive"
            onConfirm={async () => {
              console.log('执行删除 API 调用...')
              await new Promise(r => setTimeout(r, 1000))
              console.log('删除成功')
            }}
          />

          {/* 退出登录 */}
          <Button 
            variant="outline"
            onClick={() => setLogoutOpen(true)}
          >
            退出登录
          </Button>
          <ConfirmDialog
            open={logoutOpen}
            onOpenChange={setLogoutOpen}
            title="确认退出?"
            description="退出后需要重新登录才能访问你的账户。"
            confirmText="退出"
            onConfirm={async () => {
              console.log('清除 session...')
              await new Promise(r => setTimeout(r, 500))
              console.log('退出成功')
            }}
          />

          {/* 保存更改 */}
          <Button onClick={() => setSaveOpen(true)}>
            保存更改
          </Button>
          <ConfirmDialog
            open={saveOpen}
            onOpenChange={setSaveOpen}
            title="保存更改?"
            description="你的更改将被永久保存。"
            confirmText="保存"
            onConfirm={async () => {
              console.log('保存数据...')
              await new Promise(r => setTimeout(r, 800))
              console.log('保存成功')
            }}
          />
        </div>

        {/* 代码示例 */}
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">使用方法</h3>
          <pre className="text-xs overflow-auto">
{`import { ConfirmDialog } from "@/components/confirm-dialog"

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        删除项目
      </Button>
      
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="确认删除?"
        description="此操作不可恢复"
        confirmText="删除"
        variant="destructive"
        onConfirm={async () => {
          await deleteProject()
        }}
      />
    </>
  )
}`}
          </pre>
        </div>

        {/* 优势说明 */}
        <div className="mt-4 p-6 bg-white rounded-lg shadow">
          <h3 className="font-bold mb-2">组合组件的优势</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>✅ 封装常用模式，减少重复代码</li>
            <li>✅ 统一交互体验（加载状态、错误处理）</li>
            <li>✅ 保持低层组件的灵活性</li>
            <li>✅ 易于维护和修改</li>
            <li>✅ 完全类型安全</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

console.log('✅ ConfirmDialog 组合组件完成');
console.log('🧩 组合模式: 基于低层组件构建高层抽象');
console.log('🎯 单一职责: 专注于确认对话框场景');
