# shadcn/ui 代码示例索引

本目录包含 shadcn/ui 章节的完整代码示例。所有示例都是完整的 React 组件 (`.tsx` 文件),需要在 Next.js + Tailwind CSS + shadcn/ui 环境中运行。

## 📁 目录结构

```
examples/
├── components/           # 核心组件示例
│   ├── button-demo.tsx
│   └── dialog-demo.tsx
├── forms/                # 表单示例
│   └── complete-form.tsx
├── themes/               # 主题系统
│   └── theme-customization.tsx
└── README.md             # 本文件
```

---

## 🚀 快速开始

### 前置要求

1. **Next.js 项目**:
   ```bash
   npx create-next-app@latest my-app --typescript --tailwind --app
   cd my-app
   ```

2. **安装 shadcn/ui**:
   ```bash
   npx shadcn@latest init
   ```

3. **添加需要的组件**:
   ```bash
   npx shadcn@latest add button dialog form input select textarea checkbox radio-group card badge label
   ```

### 运行示例

将示例文件复制到你的项目中:

```bash
# 创建示例页面
cp examples/components/button-demo.tsx ./app/examples/button/page.tsx
cp examples/components/dialog-demo.tsx ./app/examples/dialog/page.tsx
cp examples/forms/complete-form.tsx ./app/examples/form/page.tsx
cp examples/themes/theme-customization.tsx ./app/examples/theme/page.tsx

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000/examples/button
```

---

## 🧩 组件示例 (`components/`)

### 1. Button 组件完整演示
**文件**: `components/button-demo.tsx`

**演示内容**:
- ✅ 所有 variant 变体 (default, destructive, outline, secondary, ghost, link)
- ✅ 所有 size 尺寸 (sm, default, lg, icon)
- ✅ 带图标的按钮 (lucide-react)
- ✅ 加载状态按钮 (Loader2 + animate-spin)
- ✅ 禁用状态
- ✅ **asChild 用法** (渲染为 `<a>` 标签,与 Next.js Link 结合)
- ✅ 自定义扩展示例 (添加新 variant)

**关键概念**:
```tsx
// Variant 变体
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>

// Size 尺寸
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// 加载状态
<Button disabled={loading}>
  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {loading ? "提交中..." : "提交"}
</Button>

// asChild (渲染为子元素)
<Button asChild>
  <a href="/download">下载</a>
</Button>
```

**技术栈**:
- **底层依赖**: `@radix-ui/react-slot` (asChild 功能)
- **样式管理**: `class-variance-authority` (CVA,管理变体)
- **图标库**: `lucide-react` (推荐 h-4 w-4 大小)

**最佳实践**:
1. 主要操作用 `variant="default"`
2. 次要操作用 `variant="outline"` 或 `variant="secondary"`
3. 危险操作用 `variant="destructive"`
4. 图标按钮用 `size="icon"`
5. 需要链接语义时用 `asChild` + `<a>`

---

### 2. Dialog 组件完整演示
**文件**: `components/dialog-demo.tsx`

**演示内容**:
- ✅ 基础对话框 (非受控模式)
- ✅ 受控模式对话框 (通过 open 和 onOpenChange 控制)
- ✅ 确认对话框 (危险操作确认)
- ✅ 表单对话框 (带输入框)
- ✅ 不同样式的对话框 (成功提示、信息提示)
- ✅ 自定义样式 (max-w-2xl 等)

**关键概念**:
```tsx
// 非受控模式 (Dialog 自己管理 open 状态)
<Dialog>
  <DialogTrigger>打开</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
      <DialogDescription>描述</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>确认</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// 受控模式 (手动控制状态)
const [open, setOpen] = useState(false)
<Dialog open={open} onOpenChange={setOpen}>
  {/* ... */}
</Dialog>
```

**技术实现**:
- **底层库**: `@radix-ui/react-dialog` (Radix UI)
- **Radix 提供的功能**:
  - 焦点陷阱 (Tab 键在对话框内循环)
  - Esc 键关闭
  - 背景滚动锁定
  - 点击遮罩关闭 (可配置)
  - 完整的 ARIA 无障碍属性
- **动画**: Tailwind 的 `data-[state]` 选择器 + 过渡动画

**组件结构**:
```
<Dialog> - 根组件 (管理状态)
  <DialogTrigger> - 触发按钮
  <DialogContent> - 对话框内容
    <DialogHeader> - 头部区域
      <DialogTitle> - 标题 (必需,ARIA 要求)
      <DialogDescription> - 描述 (可选,ARIA 推荐)
    <DialogFooter> - 底部按钮区域
    <DialogClose> - 关闭按钮
```

**注意事项**:
- ⚠️ `DialogTitle` 是必需的 (ARIA 要求)
- ⚠️ 避免嵌套 Dialog (用户体验差)
- ⚠️ 危险操作需要明确的确认步骤
- ⚠️ 表单在 Dialog 中时,记得处理提交后的关闭逻辑

---

## 📝 表单示例 (`forms/`)

### 3. 完整表单示例
**文件**: `forms/complete-form.tsx`

**演示内容**:
- ✅ **Zod Schema** 定义 (验证规则 + 类型推导)
- ✅ **React Hook Form** 集成
- ✅ 多种表单控件:
  - Input (文本输入)
  - Select (下拉选择)
  - Textarea (多行文本)
  - Checkbox (复选框)
  - RadioGroup (单选框)
- ✅ 实时验证 (失焦时验证)
- ✅ 错误提示 (FormMessage 自动显示)
- ✅ 表单提交处理
- ✅ 表单状态调试

**关键概念**:

**1. 定义 Zod Schema** (验证规则 + 类型):
```tsx
const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "用户名至少 3 个字符" })
    .max(20, { message: "用户名最多 20 个字符" }),
  
  email: z.string().email({ message: "邮箱格式不正确" }),
  
  password: z
    .string()
    .min(8, { message: "密码至少 8 个字符" })
    .regex(/[A-Z]/, { message: "必须包含大写字母" }),
  
  age: z.coerce.number().min(18).optional(),  // 可选字段
  
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "必须同意服务条款",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],  // 错误信息显示在此字段
})

// 从 Schema 推导出 TypeScript 类型
type FormValues = z.infer<typeof formSchema>
```

**2. 初始化表单**:
```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    username: "",
    email: "",
    // ...
  },
})
```

**3. 渲染表单字段**:
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>用户名</FormLabel>
          <FormControl>
            <Input placeholder="请输入用户名" {...field} />
          </FormControl>
          <FormDescription>
            3-20 个字符,仅支持字母、数字和下划线
          </FormDescription>
          <FormMessage />  {/* 自动显示错误 */}
        </FormItem>
      )}
    />
  </form>
</Form>
```

**技术栈**:
- **React Hook Form**: 表单状态管理和验证
- **Zod**: Schema 定义和类型推导
- **shadcn/ui Form**: 预设样式和布局

**优势**:
1. ✅ **端到端类型安全** (Zod Schema → TypeScript 类型)
2. ✅ **实时验证** (失焦时验证,提交时整体验证)
3. ✅ **零配置的错误提示** (FormMessage 自动显示错误)
4. ✅ **性能优化** (非受控组件,减少 re-render)

**最佳实践**:
1. 必填字段在 label 后加 `*` 标记
2. 复杂验证用 `.refine()` (如密码确认)
3. 数字字段用 `z.coerce.number()` 自动转换类型
4. 可选字段用 `.optional()`
5. 提交成功后 `form.reset()` 重置表单

---

## 🎨 主题系统 (`themes/`)

### 4. 主题定制示例
**文件**: `themes/theme-customization.tsx`

**演示内容**:
- ✅ CSS 变量系统 (HSL 格式)
- ✅ 实时主题切换
- ✅ 预设主题展示 (默认、紫色、绿色、橙色)
- ✅ 暗黑模式切换
- ✅ 组件预览 (按钮、徽章、输入框、卡片)
- ✅ 自定义主题创建

**CSS 变量系统**:

shadcn/ui 使用 **CSS 变量 (HSL 格式)** 作为设计令牌:

```css
/* app/globals.css */
@layer base {
  :root {
    /* 亮色模式 */
    --primary: 222.2 47.4% 11.2%;  /* 深蓝色 */
    --primary-foreground: 210 40% 98%;  /* 主色上的文字 */
    --secondary: 210 40% 96.1%;
    --destructive: 0 84.2% 60.2%;  /* 红色 */
    --border: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;  /* 焦点环 */
    /* ...更多变量 */
  }

  .dark {
    /* 暗黑模式 */
    --primary: 210 40% 98%;  /* 亮色 (暗黑模式提亮) */
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ...更多变量 */
  }
}
```

**使用方式**:

```tsx
// 在 Tailwind 类中使用
<div className="bg-primary text-primary-foreground">
  这个元素会自动适配主题
</div>

// 在 CSS 中使用
.my-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

**为什么用 HSL 格式?**

HSL = Hue (色相) + Saturation (饱和度) + Lightness (明度)

| 格式 | 调整亮度 | 说明 |
|------|---------|------|
| **RGB** | `rgb(59, 130, 246)` → `rgb(?, ?, ?)` | 需要手动调三个值 |
| **HSL** | `hsl(221, 83%, 53%)` → `hsl(221, 83%, 63%)` | 只改明度 (53% → 63%) |

**shadcn/ui 变量格式**: `222.2 47.4% 11.2%` (省略 `hsl()` 包裹,Tailwind 会自动添加)

**如何自定义主题**:

**步骤 1**: 访问 https://ui.shadcn.com/themes,选择主题

**步骤 2**: 复制生成的 CSS 变量

**步骤 3**: 粘贴到 `app/globals.css` 的 `:root` 块

**步骤 4**: 所有组件自动应用新主题!

**工具推荐**:
- **shadcn/ui Themes**: https://ui.shadcn.com/themes (官方主题生成器)
- **UI Colors**: https://uicolors.app/create (生成完整色板)
- **对比度检查**: https://coolors.co/contrast-checker (WCAG 无障碍标准)

---

## 🔧 安装和配置

### 1. 创建 Next.js 项目

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
```

### 2. 初始化 shadcn/ui

```bash
npx shadcn@latest init
```

CLI 会问你几个问题:
```
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? › app/globals.css
✔ Would you like to use CSS variables for colors? › yes
✔ Configure the import alias for components: › @/components
```

### 3. 添加组件

```bash
# 一次性添加所有需要的组件
npx shadcn@latest add button dialog form input select textarea checkbox radio-group card badge label toast

# 或单独添加
npx shadcn@latest add button
npx shadcn@latest add dialog
```

### 4. 查看组件代码

组件会被复制到 `components/ui/` 目录:

```
components/
└── ui/
    ├── button.tsx
    ├── dialog.tsx
    ├── form.tsx
    ├── input.tsx
    └── ...
```

**重点**: 这些代码在你的项目里,你可以直接修改!

---

## 📚 核心概念

### 1. shadcn/ui 不是 npm 包

> **"This is NOT a component library. It's a collection of re-usable components that you can copy and paste into your apps."**

shadcn/ui 的哲学:
- ❌ 不是 `npm install some-ui-lib`
- ✅ 是 `npx shadcn@latest add button` (复制代码到你项目里)
- ✅ 代码在你手里,随时可以改
- ✅ 不存在"升级"问题 (代码是你的,不依赖外部包)

### 2. 所有权哲学

**传统组件库 (Material UI)**:
- 组件在 `node_modules/` 里 (你看不见源码)
- 通过 props 和主题配置**间接控制**
- 升级需要阅读 Breaking Changes 文档
- 库被弃坑 = 你被锁定

**shadcn/ui**:
- 组件在 `components/ui/` 里 (你拥有源码)
- 直接修改源码,无需学习配置 API
- 不存在"升级"概念 (你想要新功能,复制新代码)
- **你就是维护者**

### 3. 技术栈

| 层级 | 技术 | 作用 |
|------|------|------|
| **行为逻辑** | Radix UI | 无障碍性、键盘导航、焦点管理 |
| **样式** | Tailwind CSS | 预设样式类 |
| **变体管理** | CVA (class-variance-authority) | 管理 variant 和 size |
| **表单** | React Hook Form + Zod | 状态管理 + 验证 |

### 4. Radix UI 原语 (Primitives)

shadcn/ui 基于 **Radix UI**,后者提供:

- ✅ 完整的无障碍支持 (ARIA 属性)
- ✅ 键盘导航 (Tab, Esc, 方向键)
- ✅ 焦点管理 (焦点陷阱、焦点恢复)
- ✅ 复杂的交互逻辑 (下拉框、对话框、选择器)

**Radix 是无头组件 (Headless UI)**:
- 提供行为逻辑,不提供样式
- shadcn/ui = Radix (行为) + Tailwind (样式)

**一个 Select 需要处理的细节** (Radix 已实现):
- 键盘导航 (↑↓ Home End)
- Type-ahead search (连续按键跳转)
- 焦点陷阱
- ARIA 属性
- 屏幕阅读器支持

如果你自己实现,需要 **2000+ 行代码**。

---

## 💡 最佳实践

### ✅ 推荐做法

1. **直接修改源码**:
   ```tsx
   // components/ui/button.tsx
   const buttonVariants = cva("...", {
     variants: {
       variant: {
         default: "...",
         // 添加新 variant
         neon: "bg-gradient-to-r from-pink-500 to-blue-500",
       },
     },
   })
   ```

2. **提取组件前先抽象** (三次法则):
   - 第一次:直接写 `<Button>...</Button>`
   - 第二次:复制粘贴同样的代码
   - 第三次:抽象成 `<SubmitButton>`

3. **为自定义组件添加 displayName**:
   ```tsx
   const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)
   Button.displayName = "Button"  // React DevTools 中显示
   ```

4. **使用语义化颜色**:
   ```tsx
   // ✅ 好
   <div className="bg-primary text-primary-foreground">

   // ❌ 差 (硬编码,暗黑模式不适配)
   <div className="bg-blue-600 text-white">
   ```

5. **改完组件后测试无障碍性**:
   ```bash
   npm install --save-dev jest-axe @testing-library/react
   ```

### ❌ 避免做法

1. **直接修改 node_modules/ 里的 Radix 代码**
   - 下次 `npm install` 会覆盖你的修改
   - shadcn/ui 的代码在 `components/ui/`,改那里

2. **忘记传递 ref**:
   ```tsx
   // ❌ 错误
   function CustomButton({ children, ...props }) {
     return <button {...props}>{children}</button>
   }

   // ✅ 正确
   const CustomButton = React.forwardRef<HTMLButtonElement, Props>(
     ({ children, ...props }, ref) => {
       return <button ref={ref} {...props}>{children}</button>
     }
   )
   ```

3. **过度使用 `cn()` 工具函数**:
   ```tsx
   // ❌ 过度使用
   <div className={cn("flex", "items-center", "gap-4")}>

   // ✅ 简化 (静态类名不需要 cn())
   <div className="flex items-center gap-4">

   // ✅ 只在需要条件逻辑时用 cn()
   <div className={cn("flex", isActive && "bg-accent", className)}>
   ```

---

## 🔗 相关资源

- **shadcn/ui 官网**: https://ui.shadcn.com/
- **Radix UI 文档**: https://www.radix-ui.com/
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **lucide-react (图标)**: https://lucide.dev/

---

## 📝 更新日志

- **2026-02-08**: 初始版本
  - Button 组件完整演示
  - Dialog 组件完整演示
  - 完整表单示例 (React Hook Form + Zod)
  - 主题定制系统

---

**祝学习愉快!记住:代码在你手里,控制权在你手里,未来也在你手里。** 🚀
