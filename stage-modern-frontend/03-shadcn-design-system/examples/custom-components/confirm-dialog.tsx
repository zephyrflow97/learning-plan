"use client"

/**
 * ConfirmDialog - 确认对话框组件
 * 
 * 基于 shadcn/ui Dialog 构建的高层组件
 * 功能:
 * - 简化的 API (只需传入标题、描述、回调)
 * - 支持 loading 状态
 * - 支持不同的 variant (default / destructive)
 * - 异步操作支持
 * 
 * 这是"组合模式"的典型案例:基于低层组件构建高层抽象
 */

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

export interface ConfirmDialogProps {
  /** 对话框是否打开 */
  open: boolean
  /** 打开/关闭状态变化回调 */
  onOpenChange: (open: boolean) => void
  /** 对话框标题 */
  title: string
  /** 对话框描述 */
  description: string
  /** 确认按钮回调 (支持异步) */
  onConfirm: () => void | Promise<void>
  /** 确认按钮文字 */
  confirmText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 按钮样式变体 */
  variant?: "default" | "destructive"
  /** 额外内容 (在描述和按钮之间) */
  children?: React.ReactNode
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
  children,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const handleConfirm = async () => {
    console.log('用户点击确认按钮')
    setLoading(true)
    
    try {
      await onConfirm()
      console.log('✅ 操作成功,关闭对话框')
      onOpenChange(false)
    } catch (error) {
      console.error('❌ 操作失败:', error)
      // 保持对话框打开,让用户看到错误
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
        
        {/* 额外内容插槽 */}
        {children}

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

// ============= 使用示例 =============

export function ConfirmDialogExample() {
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [logoutOpen, setLogoutOpen] = React.useState(false)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">ConfirmDialog 使用示例</h2>
      
      <div className="flex gap-4">
        {/* 删除操作示例 */}
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
          description="此操作不可恢复,所有数据将永久丢失。"
          confirmText="删除"
          cancelText="取消"
          variant="destructive"
          onConfirm={async () => {
            console.log('执行删除 API 调用...')
            await new Promise(r => setTimeout(r, 1000))
            console.log('删除成功')
          }}
        >
          {/* 额外内容:删除项目列表 */}
          <div className="py-4">
            <p className="text-sm font-medium mb-2">将删除以下内容:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>3 个项目文件</li>
              <li>127 条数据记录</li>
              <li>所有相关的用户权限</li>
            </ul>
          </div>
        </ConfirmDialog>

        {/* 登出操作示例 */}
        <Button 
          variant="outline"
          onClick={() => setLogoutOpen(true)}
        >
          登出
        </Button>
        
        <ConfirmDialog
          open={logoutOpen}
          onOpenChange={setLogoutOpen}
          title="确认登出?"
          description="登出后需要重新登录才能访问你的账号。"
          confirmText="登出"
          cancelText="取消"
          variant="default"
          onConfirm={async () => {
            console.log('执行登出操作...')
            await new Promise(r => setTimeout(r, 800))
            console.log('登出成功')
          }}
        />
      </div>

      {/* 代码示例 */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">代码示例</h3>
        <pre className="text-xs overflow-x-auto">
          <code>{`const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>删除</Button>

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="确认删除?"
  description="此操作不可恢复"
  confirmText="删除"
  variant="destructive"
  onConfirm={async () => {
    await deleteItem()
  }}
>
  {/* 可选的额外内容 */}
  <div>自定义内容</div>
</ConfirmDialog>`}</code>
        </pre>
      </div>

      {/* 设计说明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">✅ 优点</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 简化的 API,易于使用</li>
            <li>• 自动处理 loading 状态</li>
            <li>• 支持异步操作</li>
            <li>• 内建错误处理</li>
            <li>• 完全类型安全</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
          <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2">🎨 设计模式</h4>
          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
            <li>• <strong>组合模式:</strong> 基于 Dialog 构建</li>
            <li>• <strong>受控组件:</strong> 状态由父组件控制</li>
            <li>• <strong>插槽模式:</strong> children 支持自定义内容</li>
            <li>• <strong>Promise 友好:</strong> onConfirm 支持 async</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmDialogDemo() {
  console.log('✅ ConfirmDialog 组件示例已加载')
  console.log('📦 组合模式: 基于 Dialog 构建高层组件')
  console.log('⚡ 简化 API: 只需传入标题、描述、回调')
  console.log('🔄 异步支持: 自动处理 loading 状态')

  return (
    <div className="container mx-auto px-4 py-8">
      <ConfirmDialogExample />
    </div>
  )
}
