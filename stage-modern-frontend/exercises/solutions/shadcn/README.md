# shadcn/ui 练习题答案

本目录包含 shadcn/ui 组件库相关练习题的答案。

## 📋 练习题列表

### 11. 表单组件
- **文件**:
  - `11-register-form.tsx` - 注册表单组件
  - `11-installation-commands.sh` - 安装命令
- **技术点**: shadcn Form、React Hook Form、Zod
- **关键概念**:
  - `npx shadcn@latest add` 添加组件
  - Form 组件自动集成 React Hook Form
  - `FormField` render prop 模式

### 18. 暗黑模式切换
- **文件**:
  - `18-theme-provider.tsx` - ThemeProvider 包装
  - `18-theme-layout.tsx` - Layout 配置
  - `18-theme-toggle.tsx` - 切换按钮组件
  - `18-theme-usage.tsx` - 使用示例
  - `18-installation-commands.sh` - 安装命令
- **技术点**: next-themes、dark 模式、Context API
- **关键概念**:
  - `next-themes` 库管理主题
  - `dark:` Tailwind 前缀
  - `suppressHydrationWarning` 避免 SSR 不匹配

---

## 🎯 学习要点

### shadcn/ui 核心概念

#### 什么是 shadcn/ui?
- **不是** NPM 包,而是可复制粘贴的组件代码
- **不是** 组件库,而是组件集合
- 基于 Radix UI + Tailwind CSS
- 完全可定制,代码归你所有

#### 安装和使用
```bash
# 初始化 shadcn
npx shadcn@latest init

# 添加组件(会下载源代码到 components/ui/)
npx shadcn@latest add button
npx shadcn@latest add form input

# 使用组件
import { Button } from '@/components/ui/button';

<Button variant="outline">Click me</Button>
```

### 常用组件

#### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

#### Form
```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  username: z.string().min(2),
});

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

#### Dialog
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>打开对话框</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
      <DialogDescription>描述文字</DialogDescription>
    </DialogHeader>
    <div>对话框内容</div>
  </DialogContent>
</Dialog>
```

#### Card
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>
    内容
  </CardContent>
  <CardFooter>
    底部
  </CardFooter>
</Card>
```

### 暗黑模式实现

#### 1. 安装 next-themes
```bash
npm install next-themes
```

#### 2. 配置 Tailwind
```js
// tailwind.config.js
module.exports = {
  darkMode: ['class'],  // 使用 class 策略
  // ...
};
```

#### 3. 创建 ThemeProvider
```tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

#### 4. 在 Layout 中使用
```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 5. 创建切换按钮
```tsx
'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </Button>
  );
}
```

#### 6. 使用 dark: 前缀
```tsx
// 根据主题自动切换颜色
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  这段文字会根据主题自动切换颜色
</div>
```

### 定制组件

shadcn/ui 组件代码在你的项目中,可以随意修改:

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        // 添加自定义变体
        custom: "bg-gradient-to-r from-purple-500 to-pink-500",
      },
    },
  }
);

// 使用自定义变体
<Button variant="custom">渐变按钮</Button>
```

### 常用组合

#### 表单 + Dialog
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>新建用户</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>新建用户</DialogTitle>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* 表单字段 */}
        <Button type="submit">提交</Button>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

#### 数据表格
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map(user => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 🔗 相关资源

- [shadcn/ui 官网](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/) - 无样式组件库
- [next-themes](https://github.com/pacocoursey/next-themes) - 主题管理
- [cva](https://cva.style/) - Class Variance Authority
