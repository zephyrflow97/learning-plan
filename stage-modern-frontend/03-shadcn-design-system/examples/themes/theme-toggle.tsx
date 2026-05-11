// shadcn/ui 主题切换组件
// 集成 next-themes 实现暗黑模式

"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          console.log('切换到亮色模式')
          setTheme("light")
        }}>
          <Sun className="mr-2 h-4 w-4" />
          <span>亮色</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          console.log('切换到暗黑模式')
          setTheme("dark")
        }}>
          <Moon className="mr-2 h-4 w-4" />
          <span>暗黑</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          console.log('跟随系统')
          setTheme("system")
        }}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>跟随系统</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ========================================
// ThemeProvider 组件
// ========================================

// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// ========================================
// 在 app/layout.tsx 中使用
// ========================================

/*
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider 
          attribute="class"          // 使用 class 模式
          defaultTheme="system"      // 默认跟随系统
          enableSystem              // 启用系统主题检测
          disableTransitionOnChange // 切换时禁用过渡（避免闪烁）
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
*/

// ========================================
// 完整示例页面
// ========================================

export default function ThemeToggleDemo() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">主题切换</h1>
            <p className="text-muted-foreground">
              使用 next-themes 实现完整的主题系统
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* 主题演示 */}
        <div className="space-y-6">
          {/* 卡片 */}
          <div className="p-6 bg-card border rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Card 组件</h3>
            <p className="text-muted-foreground">
              这个卡片会根据主题自动切换背景色和边框颜色
            </p>
          </div>

          {/* 按钮 */}
          <div className="p-6 bg-card border rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Button 组件</h3>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* 输入框 */}
          <div className="p-6 bg-card border rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Input 组件</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="输入框会自动适配主题..."
                className="w-full px-4 py-2 bg-background border border-input rounded-md"
              />
              <textarea
                placeholder="文本域也会自动适配..."
                rows={3}
                className="w-full px-4 py-2 bg-background border border-input rounded-md resize-none"
              ></textarea>
            </div>
          </div>

          {/* 说明 */}
          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-bold mb-2">实现要点</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ 使用 CSS 变量定义所有颜色</li>
              <li>✅ next-themes 提供主题切换逻辑</li>
              <li>✅ 自动跟随系统偏好</li>
              <li>✅ localStorage 持久化</li>
              <li>✅ 防止 FOUC (Flash of Unstyled Content)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

console.log('✅ shadcn/ui 主题切换完整示例');
console.log('🔧 集成: next-themes + CSS 变量');
console.log('🎨 支持: 亮色、暗黑、跟随系统');
