# shadcn/ui 代码示例总结

本文档列出了所有已提取到独立文件的代码示例,避免 README 过长。

## 📂 所有示例文件

### 基础组件
| 示例 | 文件路径 | 难度 | 说明 |
|------|---------|------|------|
| **Dialog 对话框** | `examples/components/dialog-demo.tsx` | ⭐⭐ | 基础/受控模式,完整演示 |
| **Command 命令面板** | `examples/components/command-demo.tsx` | ⭐⭐⭐ | Cmd+K 快捷键,模糊搜索 |

### 表单组件
| 示例 | 文件路径 | 难度 | 说明 |
|------|---------|------|------|
| **注册表单** | `examples/forms/register-form.tsx` | ⭐⭐⭐ | React Hook Form + Zod 验证 |

### 自定义组件
| 示例 | 文件路径 | 难度 | 说明 |
|------|---------|------|------|
| **确认对话框** | `examples/custom-components/confirm-dialog.tsx` | ⭐⭐ | 基于 Dialog 的高层抽象 |

---

## 🚀 快速开始

### 1. 前置要求

```bash
# 确保项目已安装 shadcn/ui
npx shadcn@latest init

# 安装必要的组件
npx shadcn@latest add dialog button form input
```

### 2. 复制代码到项目

```bash
# 方法 1: 手动复制
# 将 examples/ 目录中的文件复制到你的项目

# 方法 2: 直接在项目中创建
# 参考示例代码,在你的项目中创建相应的组件
```

### 3. 导入并使用

```tsx
// 在你的页面中导入
import DialogDemo from '@/examples/components/dialog-demo'
import RegisterForm from '@/examples/forms/register-form'
import { ConfirmDialog } from '@/examples/custom-components/confirm-dialog'

export default function DemoPage() {
  return (
    <div>
      <DialogDemo />
      <RegisterForm />
    </div>
  )
}
```

---

## 📚 学习路径

### 🎯 初学者路线
1. **dialog-demo.tsx** - 理解 shadcn/ui 基本用法
2. **register-form.tsx** - 学习表单验证和类型安全
3. **command-demo.tsx** - 体验复杂交互组件

### 🚀 进阶路线
1. **confirm-dialog.tsx** - 学习组合模式,构建高层抽象
2. 修改示例代码,添加自己的功能
3. 创建自己的自定义组件库

---

## 💡 代码对应关系

### README 中的章节 → 对应的代码文件

| README 章节 | 示例代码 |
|------------|---------|
| **5.2 Dialog - 对话框** | `examples/components/dialog-demo.tsx` |
| **5.3 Form - 表单** | `examples/forms/register-form.tsx` |
| **5.4 Command - 命令面板** | `examples/components/command-demo.tsx` |
| **练习 2: 确认对话框** | `examples/custom-components/confirm-dialog.tsx` |

---

## 🎨 代码特点

所有示例文件都包含:
- ✅ 完整的 TypeScript 类型定义
- ✅ 详细的注释和文档
- ✅ console.log 日志输出
- ✅ 使用说明和最佳实践
- ✅ 可访问性支持 (ARIA)

---

## 🔧 技术栈

| 层次 | 技术 | 作用 |
|------|------|------|
| **行为逻辑** | Radix UI | 键盘导航、焦点管理、ARIA |
| **样式** | Tailwind CSS | Utility-first 样式 |
| **变体管理** | class-variance-authority | 类型安全的变体系统 |
| **表单** | React Hook Form + Zod | 状态管理 + 验证 |
| **图标** | lucide-react | 开源图标库 |
| **封装** | shadcn/ui | 组合以上技术 |

---

## 📖 组件详解

### Dialog 对话框 (`examples/components/dialog-demo.tsx`)

**功能:**
- ✅ 基础对话框 (非受控)
- ✅ 受控模式 (open + onOpenChange)
- ✅ 自定义内容区域
- ✅ Loading 状态管理

**Radix 提供的能力:**
- 按 ESC 键自动关闭
- 焦点陷阱 (Tab 在对话框内循环)
- 背景滚动锁定
- 完整的 ARIA 属性
- 点击遮罩关闭

**使用示例:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>打开</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
      <DialogDescription>描述</DialogDescription>
    </DialogHeader>
    {/* 自定义内容 */}
    <DialogFooter>
      <Button>确认</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Command 命令面板 (`examples/components/command-demo.tsx`)

**功能:**
- ✅ 快捷键触发 (⌘K / Ctrl+K)
- ✅ 模糊搜索
- ✅ 键盘导航 (↑↓ 选择, Enter 执行)
- ✅ 分组显示
- ✅ 实时过滤

**键盘操作:**
| 快捷键 | 功能 |
|--------|------|
| `⌘ K` / `Ctrl K` | 打开/关闭命令面板 |
| `↑` `↓` | 上下选择选项 |
| `Enter` | 执行选中的命令 |
| `Esc` | 关闭命令面板 |

**使用示例:**
```tsx
<CommandDialog open={open} onOpenChange={setOpen}>
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
</CommandDialog>
```

---

### 注册表单 (`examples/forms/register-form.tsx`)

**功能:**
- ✅ React Hook Form 集成
- ✅ Zod Schema 验证
- ✅ 端到端类型安全
- ✅ 实时验证 (失焦时)
- ✅ 跨字段验证 (密码一致性)

**验证规则:**
- **用户名:** 3-20 字符,只能包含字母、数字、下划线
- **邮箱:** 标准邮箱格式
- **密码:** 至少 8 字符,必须包含大写字母和数字
- **确认密码:** 必须与密码一致

**技术亮点:**
```typescript
// 1. 定义 Schema (验证 + 类型合一)
const formSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],
})

// 2. 类型推导
type FormValues = z.infer<typeof formSchema>

// 3. 完全类型安全的提交处理
async function onSubmit(values: FormValues) {
  // values 的类型由 Schema 自动推导
}
```

---

### 确认对话框 (`examples/custom-components/confirm-dialog.tsx`)

**设计模式:**
- **组合模式:** 基于 Dialog 构建高层组件
- **受控组件:** 状态由父组件控制
- **插槽模式:** children 支持自定义内容
- **Promise 友好:** onConfirm 支持 async/await

**使用示例:**
```tsx
const [open, setOpen] = useState(false)

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
  <div>将删除以下项目...</div>
</ConfirmDialog>
```

**优点:**
- 简化的 API,易于使用
- 自动处理 loading 状态
- 支持异步操作
- 内建错误处理
- 完全类型安全

---

## 🎯 核心概念

### 1. Headless UI (无头 UI)
Radix UI 只提供**行为逻辑**,不提供样式:
- 键盘导航
- 焦点管理
- ARIA 属性
- 状态机逻辑

### 2. 组合式 API
使用子组件组合,而非 props 配置:
```tsx
// ✅ 组合式 (灵活)
<Dialog>
  <DialogTrigger>打开</DialogTrigger>
  <DialogContent>
    {/* 完全自定义 */}
  </DialogContent>
</Dialog>

// ❌ Props 配置 (受限)
<Dialog title="..." description="..." />
```

### 3. 所有权哲学
shadcn/ui 的代码在你的项目里,你拥有完全控制权:
- ✅ 可以随意修改源码
- ✅ 不受框架版本升级影响
- ✅ 不存在"不支持的需求"
- ✅ 供应链安全 (代码在本地)

---

## 🛠️ 最佳实践

### ✅ 做这些
1. **先理解 Radix UI** - shadcn/ui 是基于 Radix 的样式封装
2. **不要过度抽象** - 只有重复 3 次以上才考虑抽象
3. **保持类型安全** - 利用 TypeScript 和 Zod 的类型推导
4. **测试可访问性** - 使用 axe DevTools 检查
5. **直接改源码** - 代码在你项目里,需要定制就改

### ❌ 避免这些
1. 直接修改 `node_modules/` 里的 Radix 代码
2. 忘记传递 `ref` (所有组件都应该用 forwardRef)
3. 在 CSS 变量外硬编码颜色
4. 过度使用 `cn()` 工具函数

---

## 🔗 相关文档

- [examples/README.md](./examples/README.md) - 完整的示例索引
- [README.md](./README.md) - shadcn/ui 章节主文档
- [Radix UI 文档](https://www.radix-ui.com/)
- [shadcn/ui 官网](https://ui.shadcn.com/)
- [React Hook Form 文档](https://react-hook-form.com/)
- [Zod 文档](https://zod.dev/)

---

**提示:** 所有超过 30 行的代码都已提取到独立文件,README.md 中只保留简化的代码片段和文件引用。
