// shadcn/ui 主题定制示例
// 文件路径: examples/themes/theme-customization.tsx

'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * 主题定制示例
 * 
 * 演示内容:
 * 1. CSS 变量系统 (HSL 格式)
 * 2. 实时主题切换
 * 3. 预设主题展示
 * 4. 自定义主题创建
 */

// 预设主题
const PRESET_THEMES = {
  default: {
    name: "默认主题",
    light: {
      primary: "222.2 47.4% 11.2%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96.1%",
      accent: "210 40% 96.1%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "210 40% 98%",
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      accent: "217.2 32.6% 17.5%",
      destructive: "0 62.8% 30.6%",
    },
  },
  purple: {
    name: "紫色主题",
    light: {
      primary: "262.1 83.3% 57.8%",
      primaryForeground: "210 20% 98%",
      secondary: "270 14.3% 95.9%",
      accent: "270 14.3% 95.9%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "263 70% 60%",
      primaryForeground: "270 20% 10%",
      secondary: "270 15% 15%",
      accent: "270 15% 20%",
      destructive: "0 62.8% 30.6%",
    },
  },
  green: {
    name: "森林绿主题",
    light: {
      primary: "142 76% 36%",
      primaryForeground: "0 0% 100%",
      secondary: "120 30% 90%",
      accent: "120 30% 92%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "142 70% 50%",
      primaryForeground: "120 50% 10%",
      secondary: "120 15% 15%",
      accent: "120 15% 20%",
      destructive: "0 62.8% 30.6%",
    },
  },
  orange: {
    name: "橙色主题",
    light: {
      primary: "24 94% 50%",
      primaryForeground: "0 0% 100%",
      secondary: "24 40% 96%",
      accent: "24 40% 92%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "24 90% 60%",
      primaryForeground: "24 50% 10%",
      secondary: "24 15% 15%",
      accent: "24 15% 20%",
      destructive: "0 62.8% 30.6%",
    },
  },
}

export default function ThemeCustomizationDemo() {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof PRESET_THEMES>("default")
  const [isDark, setIsDark] = useState(false)

  console.log('🎨 主题定制示例加载')

  // 应用主题
  const applyTheme = (themeName: keyof typeof PRESET_THEMES) => {
    const theme = PRESET_THEMES[themeName]
    const colors = isDark ? theme.dark : theme.light

    // 更新 CSS 变量
    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVarName, value)
    })

    setCurrentTheme(themeName)
    console.log('🔄 主题切换:', theme.name, isDark ? '(暗黑)' : '(亮色)')
  }

  // 切换暗黑模式
  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
    // 重新应用当前主题
    applyTheme(currentTheme)
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">主题定制系统</h1>
        <p className="text-muted-foreground">
          shadcn/ui 使用 CSS 变量 (HSL 格式) 实现主题系统
        </p>
      </div>

      {/* 主题选择器 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">预设主题</h2>
          <Button
            variant="outline"
            onClick={toggleDarkMode}
          >
            {isDark ? "🌙" : "☀️"} {isDark ? "暗黑" : "亮色"}模式
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(PRESET_THEMES).map(([key, theme]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                currentTheme === key ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => applyTheme(key as keyof typeof PRESET_THEMES)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{theme.name}</CardTitle>
                {currentTheme === key && (
                  <Badge variant="default">当前主题</Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {Object.values(isDark ? theme.dark : theme.light).slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: `hsl(${color})` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 组件预览 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">组件预览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 按钮组 */}
          <Card>
            <CardHeader>
              <CardTitle>按钮</CardTitle>
              <CardDescription>不同变体的按钮样式</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>

          {/* 徽章 */}
          <Card>
            <CardHeader>
              <CardTitle>徽章</CardTitle>
              <CardDescription>不同状态的徽章</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>

          {/* 输入框 */}
          <Card>
            <CardHeader>
              <CardTitle>输入框</CardTitle>
              <CardDescription>表单控件样式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input1">标签</Label>
                <Input id="input1" placeholder="请输入内容..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="input2">禁用状态</Label>
                <Input id="input2" placeholder="禁用" disabled />
              </div>
            </CardContent>
          </Card>

          {/* 卡片示例 */}
          <Card>
            <CardHeader>
              <CardTitle>卡片示例</CardTitle>
              <CardDescription>这是一个卡片组件</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                卡片会自动适配当前主题的背景色、边框色和文字颜色。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CSS 变量说明 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">CSS 变量系统</h2>
        <Card>
          <CardHeader>
            <CardTitle>核心颜色变量</CardTitle>
            <CardDescription>HSL 格式的设计令牌</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 主色 */}
              <div>
                <p className="text-sm font-medium mb-2">--primary</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-primary" />
                  <div className="text-xs text-muted-foreground">
                    <code>hsl(var(--primary))</code>
                  </div>
                </div>
              </div>

              {/* 次要色 */}
              <div>
                <p className="text-sm font-medium mb-2">--secondary</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-secondary" />
                  <div className="text-xs text-muted-foreground">
                    <code>hsl(var(--secondary))</code>
                  </div>
                </div>
              </div>

              {/* 强调色 */}
              <div>
                <p className="text-sm font-medium mb-2">--accent</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-accent" />
                  <div className="text-xs text-muted-foreground">
                    <code>hsl(var(--accent))</code>
                  </div>
                </div>
              </div>

              {/* 破坏性色 */}
              <div>
                <p className="text-sm font-medium mb-2">--destructive</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-destructive" />
                  <div className="text-xs text-muted-foreground">
                    <code>hsl(var(--destructive))</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 实现说明 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">如何自定义主题</h2>
        <Card>
          <CardHeader>
            <CardTitle>步骤 1: 定义 CSS 变量</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`/* app/globals.css */
@layer base {
  :root {
    /* 亮色模式 */
    --primary: 262.1 83.3% 57.8%;  /* 紫色 */
    --primary-foreground: 210 20% 98%;
    /* ...其他变量 */
  }

  .dark {
    /* 暗黑模式 */
    --primary: 263 70% 60%;  /* 亮紫色 */
    --primary-foreground: 270 20% 10%;
    /* ...其他变量 */
  }
}`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>步骤 2: 使用变量</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// 在 Tailwind 类中使用
<div className="bg-primary text-primary-foreground">
  这个元素会自动适配主题
</div>

// 在 CSS 中使用
.my-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>为什么用 HSL 格式?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              HSL = Hue (色相) + Saturation (饱和度) + Lightness (明度)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">RGB 方式:</p>
                <code className="bg-muted px-2 py-1 rounded">rgb(59, 130, 246)</code>
                <p className="text-muted-foreground mt-1">
                  想要更亮的版本?需要手动调三个值
                </p>
              </div>
              <div>
                <p className="font-medium mb-2">HSL 方式:</p>
                <code className="bg-muted px-2 py-1 rounded">hsl(221, 83%, 53%)</code>
                <p className="text-muted-foreground mt-1">
                  想要更亮的版本?只改明度: 53% → 63%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 工具推荐 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">工具推荐</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">shadcn/ui Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                官方主题生成器,可视化选择颜色
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="https://ui.shadcn.com/themes" target="_blank">
                  访问
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">UI Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                生成完整的颜色色板 (50-950)
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="https://uicolors.app/create" target="_blank">
                  访问
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">对比度检查</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                确保颜色符合 WCAG 无障碍标准
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="https://coolors.co/contrast-checker" target="_blank">
                  访问
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

// 组件挂载时输出信息
console.log('🎨 主题系统说明:')
console.log('')
console.log('1. CSS 变量定义在 app/globals.css:')
console.log('   :root { --primary: 222.2 47.4% 11.2%; }')
console.log('   .dark { --primary: 210 40% 98%; }')
console.log('')
console.log('2. Tailwind 配置引用变量:')
console.log('   colors: { primary: "hsl(var(--primary))" }')
console.log('')
console.log('3. 使用:')
console.log('   <div className="bg-primary text-primary-foreground">')
console.log('')
console.log('💡 优势:')
console.log('  - 一次定义,全站生效')
console.log('  - 暗黑模式自动切换')
console.log('  - HSL 格式便于调整明度')
console.log('  - 语义化颜色名 (primary, destructive, muted)')
