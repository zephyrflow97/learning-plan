"use client"

/**
 * Command 组件示例 (命令面板)
 * 
 * 演示类似 VSCode 的命令面板功能:
 * - 快捷键触发 (Cmd+K / Ctrl+K)
 * - 模糊搜索
 * - 键盘导航
 * - 分组显示
 * 
 * 基于 cmdk (Command Menu for React) + Radix UI Dialog
 */

import * as React from "react"
import { Calculator, Calendar, Settings, Smile, User, CreditCard, FileText, Mail } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandDemo() {
  const [open, setOpen] = React.useState(false)
  const [selectedCommand, setSelectedCommand] = React.useState<string | null>(null)

  // 监听快捷键 Cmd+K (macOS) 或 Ctrl+K (Windows/Linux)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
        console.log('⌨️ 快捷键触发: 打开/关闭命令面板')
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: string, action: () => void) => {
    setSelectedCommand(command)
    setOpen(false)
    action()
    
    console.log(`🎯 执行命令: ${command}`)
    
    // 重置选中状态
    setTimeout(() => setSelectedCommand(null), 100)
  }

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          按{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>{" "}
          打开命令面板
        </p>

        {selectedCommand && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              ✅ 已执行: <strong>{selectedCommand}</strong>
            </p>
          </div>
        )}
      </div>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="输入命令或搜索..." />
        <CommandList>
          <CommandEmpty>未找到结果</CommandEmpty>
          
          <CommandGroup heading="建议">
            <CommandItem
              onSelect={() => runCommand('打开日历', () => console.log('📅 打开日历页面'))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>日历</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand('搜索表情', () => console.log('😀 打开表情选择器'))}
            >
              <Smile className="mr-2 h-4 w-4" />
              <span>搜索表情</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand('打开计算器', () => console.log('🔢 打开计算器'))}
            >
              <Calculator className="mr-2 h-4 w-4" />
              <span>计算器</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="导航">
            <CommandItem
              onSelect={() => runCommand('我的账单', () => console.log('💳 跳转到账单页面'))}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>账单</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand('文档中心', () => console.log('📄 打开文档'))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>文档</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand('邮件收件箱', () => console.log('📧 打开邮箱'))}
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>邮件</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="设置">
            <CommandItem
              onSelect={() => runCommand('个人资料', () => console.log('👤 打开个人资料设置'))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand('系统设置', () => console.log('⚙️ 打开系统设置'))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>设置</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

// 使用说明组件
export function CommandUsageGuide() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Command 组件特性</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">🎹 键盘操作</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">⌘ K</kbd> / <kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Ctrl K</kbd> - 打开/关闭</li>
            <li>• <kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">↑</kbd> <kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">↓</kbd> - 上下选择</li>
            <li>• <kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Enter</kbd> - 执行命令</li>
            <li>• <kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Esc</kbd> - 关闭面板</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
          <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">🔍 搜索功能</h3>
          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
            <li>• 内建模糊搜索算法</li>
            <li>• 实时过滤结果</li>
            <li>• 支持拼音搜索 (可配置)</li>
            <li>• 高亮匹配文本</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
          <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">📂 分组管理</h3>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• CommandGroup 分组</li>
            <li>• CommandSeparator 分隔线</li>
            <li>• 支持嵌套分组</li>
            <li>• 自定义分组标题</li>
          </ul>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded">
          <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-2">✨ 高级特性</h3>
          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
            <li>• 完全可访问 (ARIA 支持)</li>
            <li>• 虚拟化 (支持大量选项)</li>
            <li>• 异步加载选项</li>
            <li>• 自定义渲染</li>
          </ul>
        </div>
      </div>

      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">基础代码示例</h3>
        <pre className="text-xs overflow-x-auto">
          <code>{`<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="搜索..." />
  <CommandList>
    <CommandEmpty>未找到结果</CommandEmpty>
    <CommandGroup heading="建议">
      <CommandItem onSelect={() => runCommand()}>
        <Icon className="mr-2 h-4 w-4" />
        <span>命令名称</span>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`}</code>
        </pre>
      </div>
    </div>
  )
}

// 完整演示页面
export default function CommandDemoPage() {
  console.log('✅ Command 组件示例已加载')
  console.log('⌨️ 快捷键: Cmd+K (macOS) / Ctrl+K (Windows)')
  console.log('🔍 内建模糊搜索、键盘导航、分组功能')
  console.log('📦 基于: cmdk + Radix UI Dialog')

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold">Command 命令面板</h1>
      
      <div className="max-w-2xl">
        <CommandDemo />
      </div>
      
      <CommandUsageGuide />
    </div>
  )
}
