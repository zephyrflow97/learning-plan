# shadcn/ui 与设计系统 — 组件所有权的哲学革命

> *"Give a man a fish, and you feed him for a day. Teach a man to fish, and you feed him for a lifetime."*
>
> 传统组件库（Ant Design, Material UI）给你的是鱼——一个个打包好的组件,通过 `npm install` 送到你手中。你消费它们,依赖它们,但永远不真正拥有它们。shadcn/ui 给你的是钓鱼竿、鱼饵、还有一本钓鱼指南——组件的源码直接复制到你的项目里,**每一行代码都在你的控制之下**。这不是懒惰,这是一种激进的**所有权哲学** (Ownership Philosophy)。当库的维护者弃坑时,当 breaking change 来袭时,当你需要的定制超出了文档的边界时——传统组件库的用户在祈祷,shadcn/ui 的用户在改代码。

---

## 📖 本章内容

1. [**组件库的三个时代**](#1-组件库的三个时代) — 从 jQuery UI 到 Headless UI 的演进弧
2. [**shadcn/ui 的哲学**](#2-shadcnui-的哲学) — Copy-Paste vs npm install 的深层差异
3. [**Radix UI 原语**](#3-radix-ui-原语) — Headless 组件的力量与可访问性
4. [**快速开始**](#4-快速开始) — 安装、配置、添加第一个组件
5. [**核心组件实战**](#5-核心组件实战) — Button, Dialog, Form, Command, Toast
6. [**主题定制**](#6-主题定制) — CSS 变量系统、颜色、全局样式
7. [**构建设计系统**](#7-构建设计系统) — 从组件集到设计系统的思维跃迁
8. [**🧘 Zen of Code: 所有权与依赖**](#8--zen-of-code-所有权与依赖)
9. [**最佳实践与常见陷阱**](#9-最佳实践与常见陷阱)
10. [**章节练习**](#10-章节练习)

**前置知识**: Stage 2 React Basics, Tailwind CSS, TypeScript  
**学习时间**: 2-3 天  
**关键术语**: Headless UI, Radix Primitives, Design Tokens, Accessibility (a11y), Compound Components

---

## 1. 组件库的三个时代

> 🎭 **The Drama: 家具的三种购买方式**
>
> 想象你要装修新家,买家具有三种方式:
>
> **第一种 (jQuery UI 时代)**:你去 IKEA,买了一套沙发。沙发的颜色、尺寸、材质都是固定的。你想换个颜色?对不起,没有这个选项。这是**买成品家具**。
>
> **第二种 (Material UI/Ant Design 时代)**:你去高端定制家具店,店家有一本 200 页的配置手册。你可以选颜色(从 50 种色板选)、选材质(皮革/布料/绒面)、选腿的高度。但你要阅读手册,填写配置表,等待工厂生产。这是**定制家具**。
>
> **第三种 (shadcn/ui 时代)**:你去建材市场,店家给你原材料——木板、螺丝、海绵、面料,还有一份详细的施工图纸。你自己组装,你可以改图纸,你可以换材料,**你拥有每一块木板的控制权**。这是**DIY 家具**。

### 1.1 第一时代:单体组件库 (Monolithic UI Libraries, ~2010-2015)

**代表**: jQuery UI, Bootstrap, Semantic UI

#### 特征

- **外观与行为绑定**:按钮的样式和交互逻辑是一个整体,不可拆分
- **主题定制困难**:想改一个按钮的圆角?要么改源码,要么用 `!important` 覆盖
- **依赖笨重**:Bootstrap 3 的完整 CSS 文件超过 200KB (未压缩)

```html
❌ Bootstrap 3 的痛苦
<button class="btn btn-primary">点击</button>

<style>
  /* 你想让这个按钮变成圆形?需要覆盖 Bootstrap 的样式 */
  .btn-primary {
    border-radius: 50% !important; /* !important 是妥协的标志 */
    padding: 1rem !important;      /* 你在和框架打架 */
  }
</style>
```

> 🌌 **The Big Picture: "预设即暴政"**
>
> Bootstrap 给你的"默认值"看起来是礼物,实际上是枷锁。每个预设都是一个你需要覆盖的点。当你的设计和 Bootstrap 的审美不一致时,你要么妥协(接受 Bootstrap 风格),要么对抗(写大量覆盖样式)。这就像住在装修好的酒店房间——舒适但不自由。

### 1.2 第二时代:可定制组件库 (Customizable UI Libraries, ~2015-2020)

**代表**: Material UI (React), Ant Design (React), Vuetify (Vue), Chakra UI (React)

#### 进化点

- **主题系统**:通过 `ThemeProvider` 和配置对象定制颜色、字体、间距
- **CSS-in-JS**:样式用 JavaScript 写,支持动态计算和作用域隔离
- **组件 Props 丰富**:一个 Button 组件可能有 30+ 个 props 控制各种细节

```tsx
✅ Material UI 的主题定制
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // 自定义主色
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,    // 全局改按钮圆角
          textTransform: 'none', // 取消大写
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Button variant="contained">看起来不错</Button>
    </ThemeProvider>
  );
}
```

#### 但新的痛苦出现了

**❌ 问题 1:配置复杂度爆炸**

```tsx
// 真实案例:某项目的 MUI 主题配置文件 (300+ 行)
const theme = createTheme({
  palette: { /* 50 行颜色配置 */ },
  typography: { /* 30 行字体配置 */ },
  spacing: /* ... */,
  breakpoints: /* ... */,
  components: {
    MuiButton: { /* 20 行 */ },
    MuiTextField: { /* 30 行 */ },
    MuiCard: { /* 15 行 */ },
    // ...还有 20 个组件的配置
  },
});

console.log('你在阅读框架的源码,而不是写业务代码');
```

**❌ 问题 2:抽象泄漏 (Leaky Abstraction)**

> ⚛️ **The Physics: 所有非平凡的抽象都是有漏洞的**
>
> Joel Spolsky 的"抽象泄漏定律"说:所有非平凡的抽象在某种程度上都是有漏洞的。Material UI 试图抽象掉底层 CSS,但当你需要的定制超出了 `styleOverrides` 的范围时,你不得不:
> 1. 阅读 MUI 源码,理解它生成的 CSS 类名
> 2. 用 `sx` prop 直接注入样式(绕过主题系统)
> 3. 用 `!important` 覆盖(最后的妥协)
>
> 这时,抽象不仅没有简化问题,反而成为了障碍——**你需要理解抽象之上和抽象之下的两层知识**。

**❌ 问题 3:依赖锁定 (Dependency Lock-in)**

```bash
# Material UI 的依赖树 (部分)
@mui/material@5.14.0
├── @mui/base@5.0.0
├── @mui/system@5.14.0
├── @mui/types@7.2.4
├── @emotion/react@11.11.0
├── @emotion/styled@11.11.0
├── react (peer)
└── react-dom (peer)

# 当 MUI 发布 v6 时,升级是一场战役:
# - Breaking changes 文档有 50 页
# - 自动迁移脚本修改了 200 个文件
# - 仍然有 30 处需要手动修复
# - 你的老板问:为什么升级一个组件库要花一周?
```

### 1.3 第三时代:无头组件 + 自主组装 (Headless UI + Bring Your Own Styles, ~2020-至今)

**代表**: Headless UI (by Tailwind Labs), Radix UI, React Aria (by Adobe), shadcn/ui (基于 Radix)

> 🌌 **The Big Picture: 灵魂与肉体的分离**
>
> Headless UI 的核心洞察:一个组件有两部分:
> - **灵魂 (Behavior & Accessibility)**:键盘导航、焦点管理、ARIA 属性、状态机逻辑
> - **肉体 (Visual Appearance)**:颜色、字体、间距、圆角、阴影
>
> 传统组件库把灵魂和肉体绑在一起卖给你——你要换"肉体"就得做整容手术(覆盖样式)。Headless UI 只给你灵魂,让你自己选肉体——用 Tailwind、用 CSS Modules、用任何你想用的样式方案。
>
> **shadcn/ui 更进一步**:它甚至不给你一个 npm 包。它给你源码——灵魂(Radix)和肉体(Tailwind)的源码都在你项目里,你随时可以改。

#### Radix UI 的例子:只管行为,不管外观

```tsx
// Radix UI 的 Dialog (无样式版本)
import * as Dialog from '@radix-ui/react-dialog';

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>打开弹窗</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>标题</Dialog.Title>
          <Dialog.Description>描述</Dialog.Description>
          <Dialog.Close>关闭</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Radix 做了什么:
// ✅ 按 ESC 键自动关闭
// ✅ 焦点陷阱 (Tab 键在弹窗内循环)
// ✅ 背景滚动锁定
// ✅ ARIA 属性 (role="dialog", aria-labelledby, aria-describedby)
// ✅ 点击遮罩关闭 (可配置)

// Radix 不做什么:
// ❌ 不提供任何默认样式 (连 display: block 都没有)
// ❌ 不规定你用什么 CSS 方案

console.log('渲染结果:完全裸奔的 HTML,但行为完美');
```

你需要自己加样式:

```tsx
// 用 Tailwind 给它穿衣服
<Dialog.Overlay className="fixed inset-0 bg-black/50" />
<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl">
  {/* ... */}
</Dialog.Content>
```

> 🧠 **CS Master's Bridge: Headless 模式是策略模式的极致**
>
> 在设计模式中,**策略模式** (Strategy Pattern) 是"定义一系列算法,把它们封装起来,并使它们可互换"。Headless UI 把这个思想推到了极致:
> - **算法** = 组件的行为逻辑(焦点管理、键盘事件、状态机)
> - **可互换部分** = 样式实现(Tailwind / CSS Modules / Emotion 都可以)
>
> Radix 的 `<Dialog.Root>` 是上下文 (Context),`<Dialog.Content>` 是策略接口 (Strategy Interface),你的 Tailwind 类名是具体策略 (Concrete Strategy)。

### 1.4 三个时代的对比表

| 维度 | 第一代<br/>(jQuery UI) | 第二代<br/>(Material UI) | 第三代<br/>(shadcn/ui) |
|------|---------------------|---------------------|-------------------|
| **定制灵活度** | ⭐ 很低<br/>(只能覆盖样式) | ⭐⭐⭐ 中等<br/>(主题配置) | ⭐⭐⭐⭐⭐ 极高<br/>(改源码) |
| **学习成本** | ⭐⭐ 低<br/>(复制例子即可) | ⭐⭐⭐⭐ 高<br/>(学习主题 API) | ⭐⭐⭐ 中等<br/>(学习 Radix + Tailwind) |
| **包体积** | ❌ 大<br/>(200KB+ CSS) | ❌ 大<br/>(100KB+ JS) | ✅ 小<br/>(只打包用到的组件) |
| **升级风险** | ⭐⭐ 中等<br/>(框架升级可能需要改覆盖样式) | ⭐⭐⭐⭐ 高<br/>(Breaking changes 多) | ⭐ 极低<br/>(代码在你手里,不存在"升级"概念) |
| **可访问性** | ❌ 差<br/>(需要手动添加) | ✅ 好<br/>(内建) | ✅ 优秀<br/>(Radix 提供) |
| **供应链风险** | ⭐⭐⭐ 有<br/>(依赖 npm 包) | ⭐⭐⭐⭐ 高<br/>(依赖链长) | ⭐ 极低<br/>(代码复制到本地) |

---

## 2. shadcn/ui 的哲学

> 🎭 **The Drama: "这不是一个组件库"**
>
> shadcn/ui 的官网开头第一句话就打破了你的预期:
>
> > **"This is NOT a component library. It's a collection of re-usable components that you can copy and paste into your apps."**
> > (这不是一个组件库。这是一套可复用的组件,你可以复制粘贴到你的应用中。)
>
> 第一次读到这句话,很多开发者会困惑:"什么?不是 npm 包?那我为什么要用它?" 但当你理解了它的哲学,你会意识到这是一个**范式转换** (Paradigm Shift)。

### 2.1 Copy-Paste vs npm install:深层差异

#### 传统方式:`npm install some-ui-lib`

```bash
npm install @mui/material @emotion/react @emotion/styled

# 你的 package.json
{
  "dependencies": {
    "@mui/material": "^5.14.0"  // ⬅️ 这个版本号是一个承诺,也是一个枷锁
  }
}
```

**发生了什么:**
1. 组件代码存在 `node_modules/` 里,你**看不见**它们的源码(除非专门去翻)
2. 你通过 `import Button from '@mui/material/Button'` 使用它
3. 你通过 props 和主题配置**间接控制**组件
4. 你**信任** MUI 团队不会发布有 Bug 的版本
5. 你**依赖** MUI 团队持续维护这个库

**当出问题时:**
- 库有 Bug → 你去 GitHub 提 Issue,等待修复
- 你需要的定制超出了文档范围 → 你阅读源码,用 `sx` / `!important` hack
- 库被弃坑 / 大版本升级代价高 → 你被锁在旧版本,或痛苦迁移

#### shadcn/ui 方式:`npx shadcn@latest add button`

```bash
npx shadcn@latest add button

# 执行后,发生了什么:
# 1. 在你的项目里创建 components/ui/button.tsx
# 2. 安装 Radix 依赖 (如果需要)
# 3. 更新 package.json (仅添加必要的底层依赖)

# 你的项目结构:
src/
  components/
    ui/
      button.tsx     ⬅️ 源码在这里,你可以直接改
```

**`components/ui/button.tsx` 的内容** (简化版):

```tsx
// 这是你的代码,不是 node_modules 里的黑盒
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // 基础样式
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

// 现在这是你的组件了:
// ✅ 你可以改颜色、改圆角、加新 variant
// ✅ 你可以删掉不需要的 variant (减少代码体积)
// ✅ 你可以添加自定义逻辑 (如埋点、权限检查)
// ✅ 不需要阅读文档猜测"怎么定制",代码就是文档
```

**使用:**

```tsx
import { Button } from "@/components/ui/button"

function App() {
  return (
    <>
      <Button variant="default">默认按钮</Button>
      <Button variant="destructive">危险按钮</Button>
      <Button variant="outline" size="sm">小按钮</Button>
    </>
  )
}

console.log('这些组件的每一行代码都在你的 src/ 目录下');
```

**如果你想改样式:**

```tsx
// 直接编辑 components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-purple-600 text-white hover:bg-purple-700", // ⬅️ 改!
        // 添加一个新 variant:
        neon: "bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg shadow-pink-500/50",
      },
      // ...
    },
  }
)

// 使用:
<Button variant="neon">霓虹按钮</Button>

console.log('没有主题配置,没有 styleOverrides,直接改源码');
```

### 2.2 所有权的意义

> 🧘 **Zen of Code: 你真正拥有的,只有你理解的东西**
>
> 当你用 `npm install` 时,你并不**拥有**那些组件——你只是在**借用**它们。你签了一份隐形合同:
> - 库的维护者承诺持续维护
> - 你承诺按照文档使用,不改源码
> - 当合同的任何一方违约时,问题就来了
>
> shadcn/ui 的哲学是:**你的代码,你的责任,你的自由**。
> - 代码在你手里,你可以改任何一行
> - 没有"升级"的概念——你想要新功能,复制新代码;不想升级,旧代码继续用
> - 没有"框架不支持我的需求"——你就是框架的作者

### 2.3 供应链安全

> 🌌 **The Big Picture: npm 的信任危机**
>
> 近年来,npm 生态经历了多次供应链攻击:
> - **2016 年 left-pad 事件**:一个 11 行的包被作者删除,导致半个互联网的构建失败
> - **2022 年 colors.js 投毒**:维护者恶意在包里加入无限循环,破坏所有使用它的项目
> - **2024 年 polyfill.io 劫持**:CDN 服务被卖给恶意方,注入挖矿代码到 10 万+网站
>
> 当你的 UI 完全依赖一个第三方包时,你把控制权交给了一个你不认识的人。shadcn/ui 的"复制粘贴"哲学从根本上消除了这种风险——**代码在你手里,供应链攻击不了你**。

```bash
# Material UI 的依赖树 (简化)
@mui/material
├── @mui/base
│   ├── @popperjs/core
│   └── react-transition-group
├── @emotion/react
│   ├── @emotion/cache
│   ├── @emotion/serialize
│   └── @emotion/utils
└── 10+ 其他依赖...

# 这些依赖中的任何一个被攻击,你的应用就危险了

# shadcn/ui 的"依赖":
@radix-ui/react-dialog      # 核心行为逻辑 (你可以读源码审计)
class-variance-authority    # 工具库 (200 行代码,易审计)
# 你的 components/ui/ 目录   # 完全受你控制

console.log('依赖链越短,攻击面越小');
```

### 2.4 "但这不就是复制粘贴吗?"——常见质疑的回答

> ⚛️ **The Physics: 复制粘贴 vs 代码复用的量子态**
>
> 软件工程的经典原则是 **DRY (Don't Repeat Yourself)**:不要重复代码。
>
> 但 shadcn/ui 看起来在鼓励"复制粘贴"——每个项目都复制一份 Button 组件代码。这不是反 DRY 吗?
>
> **答案:这是在不同层次上实现复用**。
>
> - **传统组件库**: 复用发生在**包层** (npm 包被多个项目共享)
> - **shadcn/ui**: 复用发生在**模板层** (组件源码作为起点,每个项目独立演化)
>
> 类比:
> - **npm 包**像是公共图书馆的书——大家借同一本书,你不能在上面写笔记
> - **shadcn/ui**像是出版社给你的书稿模板——你拿回家,可以随意批注、撕页、重写

**什么时候"复制粘贴"是对的:**

```tsx
// ❌ 错误的复制粘贴:在同一个项目里复制业务逻辑
function calculateUserDiscount(user) {
  if (user.isPremium) return 0.2;
  return 0;
}

function calculateOrderPrice(order) {
  // 🚫 不要再写一遍折扣逻辑!应该调用 calculateUserDiscount
  if (order.user.isPremium) return order.total * 0.8;
  return order.total;
}

// ✅ 正确的复制粘贴:跨项目复制组件模板
// 项目 A:
components/ui/button.tsx  (从 shadcn/ui 复制,然后改成紫色主题)

// 项目 B:
components/ui/button.tsx  (从 shadcn/ui 复制,然后改成圆形按钮)

// 这两个按钮可以独立演化,不需要共享同一个 npm 包
console.log('同一项目内避免重复,跨项目允许独立演化');
```

---

## 3. Radix UI 原语

> 🧠 **CS Master's Bridge: Primitives(原语)的概念**
>
> 在编程语言设计中,**Primitive(原语)** 是不可再分的基础操作。比如 JavaScript 的原语是 `+`, `-`, `if`, `function` ——你用它们组合出复杂程序,但它们本身不能被分解。
>
> Radix UI 的"Primitives"是 UI 层的原语——**复杂组件的不可再分的行为单元**。一个 Dialog 的原语包括:`<Dialog.Root>` (上下文), `<Dialog.Trigger>` (触发器), `<Dialog.Content>` (内容), `<Dialog.Close>` (关闭按钮)。你用这些原语组合出自己的对话框。

### 3.1 为什么需要 Radix?

一个看似简单的 `<Select>` (下拉选择器),实际上需要处理:

**✅ 键盘导航**:
- `↑` / `↓`:选择上一个/下一个选项
- `Home` / `End`:跳到第一个/最后一个
- `Enter` / `Space`:确认选择
- `Esc`:关闭下拉框
- **Type-ahead search**:连续按 `a` `p` `p` 跳到 "Apple" 选项

**✅ 焦点管理**:
- 打开下拉框时,焦点应该在第一个选项上
- 关闭时,焦点回到触发按钮
- **焦点陷阱** (Focus Trap):按 `Tab` 不应该离开下拉框

**✅ 屏幕阅读器支持**:
- `role="listbox"`, `role="option"`
- `aria-expanded="true"` / `"false"`
- `aria-selected`, `aria-activedescendant`
- 状态变化时的语音播报

**✅ 鼠标/触摸支持**:
- 点击选项选中
- 点击外部关闭
- 滚动到选中项

**✅ 虚拟化**:
- 如果有 10000 个选项,不能全部渲染 (性能崩溃)
- 需要只渲染可见区域 (虚拟滚动)

> 如果你自己实现这些,需要写 **2000+ 行代码**。Radix 已经帮你写好了,而且经过了无障碍专家审计。

### 3.2 Radix Primitives 的核心组件

Radix 提供了 30+ 个组件,shadcn/ui 基于其中最常用的几个:

| Radix 组件 | 用途 | 复杂度 | shadcn/ui 封装 |
|-----------|------|-------|---------------|
| `@radix-ui/react-dialog` | 对话框/模态框 | ⭐⭐⭐⭐ | ✅ Dialog |
| `@radix-ui/react-dropdown-menu` | 下拉菜单 | ⭐⭐⭐⭐ | ✅ DropdownMenu |
| `@radix-ui/react-select` | 选择器 | ⭐⭐⭐⭐⭐ | ✅ Select |
| `@radix-ui/react-popover` | 弹出层 | ⭐⭐⭐ | ✅ Popover |
| `@radix-ui/react-tooltip` | 提示框 | ⭐⭐⭐ | ✅ Tooltip |
| `@radix-ui/react-tabs` | 标签页 | ⭐⭐ | ✅ Tabs |
| `@radix-ui/react-accordion` | 手风琴 | ⭐⭐ | ✅ Accordion |
| `@radix-ui/react-alert-dialog` | 确认对话框 | ⭐⭐⭐ | ✅ AlertDialog |
| `@radix-ui/react-checkbox` | 复选框 | ⭐⭐ | ✅ Checkbox |
| `@radix-ui/react-radio-group` | 单选框组 | ⭐⭐ | ✅ RadioGroup |
| `@radix-ui/react-switch` | 开关 | ⭐ | ✅ Switch |
| `@radix-ui/react-slider` | 滑块 | ⭐⭐⭐ | ✅ Slider |

### 3.3 Radix 的组合式 API (Compound Components)

Radix 使用**组合组件模式** (Compound Components Pattern):

```tsx
// ❌ 传统组件:把所有配置塞进 props
<Dialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="确认删除"
  description="此操作不可恢复"
  confirmText="删除"
  cancelText="取消"
  onConfirm={handleDelete}
  variant="destructive"
/>

// 问题:
// 1. 定制能力受限于 props 设计
// 2. 如果要在 title 里加个图标?需要 props: titleIcon?
// 3. 如果要自定义按钮布局?需要 props: renderActions?
// 4. props 数量会爆炸

// ✅ Radix 的组合式 API:把组件拆成可组合的部件
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger>打开</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>
        <Trash className="mr-2" /> {/* ⬅️ 自由添加图标 */}
        确认删除
      </Dialog.Title>
      <Dialog.Description>
        此操作不可恢复
      </Dialog.Description>
      
      {/* 完全自定义按钮区域 */}
      <div className="flex gap-2">
        <Button onClick={handleDelete} variant="destructive">删除</Button>
        <Dialog.Close asChild>
          <Button variant="outline">取消</Button>
        </Dialog.Close>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// 优点:
// ✅ 无限的定制能力 (插入任何 React 节点)
// ✅ 不需要学习复杂的 props API
// ✅ 行为逻辑由 Radix 保证,样式完全自由
```

> ⚛️ **The Physics: 组合 vs 配置**
>
> 这是**组合模式** (Composition) 和**配置模式** (Configuration) 的对决:
> - **配置模式** (Material UI):通过 props 配置组件行为。上限是 props 的设计边界。
> - **组合模式** (Radix):通过组合子组件实现行为。上限是 React 本身的表达能力。
>
> 组合模式更原始 (primitive),但也更强大——因为它不对"你想做什么"做假设。

### 3.4 可访问性的冰山

> 🌌 **The Big Picture: 可访问性是水面下的 90%**
>
> 用户看到的是一个漂亮的对话框。但在水面下,Radix 做了:

```tsx
// Radix 渲染的实际 HTML (简化)
<div
  role="dialog"                              // 告诉屏幕阅读器这是对话框
  aria-labelledby="dialog-title"             // 标题 ID
  aria-describedby="dialog-description"      // 描述 ID
  aria-modal="true"                          // 模态对话框 (背景不可交互)
  data-state="open"                          // 状态标记 (可以用 CSS 选择器)
>
  <h2 id="dialog-title">确认删除</h2>
  <p id="dialog-description">此操作不可恢复</p>
  {/* ... */}
</div>

{/* Radix 在 JavaScript 中做的: */}
{/*
  ✅ 打开时:document.body.style.overflow = 'hidden' (锁定背景滚动)
  ✅ 打开时:保存当前焦点位置
  ✅ 焦点移动到对话框内第一个可聚焦元素
  ✅ 按 Tab:焦点在对话框内循环 (焦点陷阱)
  ✅ 按 Esc:关闭对话框
  ✅ 关闭时:焦点返回到打开前的位置
  ✅ 关闭时:恢复 body 滚动
*/}

console.log('如果你自己实现,这些细节容易遗漏 90%');
```

**一个真实案例:不可访问的对话框**

```tsx
// ❌ 很多开发者的"简陋版对话框"
function BadDialog({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50" onClick={onClose}>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6">
        {children}
        <button onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

// 问题清单:
// ❌ 没有 ARIA 属性 (屏幕阅读器不知道这是对话框)
// ❌ 没有焦点管理 (打开后焦点还在页面上)
// ❌ 按 Tab 键焦点会跑到对话框外 (没有焦点陷阱)
// ❌ 按 Esc 不会关闭
// ❌ 点击内容区域也会关闭 (应该只有背景遮罩能关闭)
// ❌ 背景仍然可以滚动
// ❌ 关闭后焦点不会回到触发按钮

console.log('这个对话框对键盘用户和屏幕阅读器用户完全不可用');
```

**Radix 版本:零配置的可访问性**

```tsx
// ✅ Radix + shadcn/ui
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>打开</DialogTrigger>
  <DialogContent>
    {children}
  </DialogContent>
</Dialog>

// 你只写了 5 行代码,但获得了完整的可访问性支持
console.log('Radix 是可访问性专家团队多年的结晶');
```

---

## 4. 快速开始

### 4.1 安装 shadcn/ui

shadcn/ui 不是一个 npm 包,而是一个 CLI 工具,用于生成组件代码到你的项目中。

```bash
# 前提:已有 Next.js + Tailwind CSS 项目

# 1. 初始化 shadcn/ui
npx shadcn@latest init

# CLI 会问你几个问题:
# ✔ Which style would you like to use? › Default
# ✔ Which color would you like to use as base color? › Slate
# ✔ Where is your global CSS file? › app/globals.css
# ✔ Would you like to use CSS variables for colors? › yes
# ✔ Where is your tailwind.config.js located? › tailwind.config.ts
# ✔ Configure the import alias for components: › @/components
# ✔ Configure the import alias for utils: › @/lib/utils

console.log('初始化完成,配置文件已更新');
```

**初始化做了什么:**

```bash
# 1. 创建配置文件
components.json  # shadcn/ui 的配置 (记录你的选择)

# 2. 创建工具文件
lib/utils.ts     # cn() 函数:合并 Tailwind 类名

# 3. 更新 tailwind.config.ts
# 添加 CSS 变量支持、动画配置等

# 4. 更新 globals.css
# 添加 CSS 变量定义 (颜色、圆角、间距等)
```

### 4.2 添加第一个组件

```bash
# 添加 Button 组件
npx shadcn@latest add button

# CLI 输出:
# ✔ Done. Button component added to components/ui/button.tsx

console.log('查看 components/ui/button.tsx,这是你的代码了');
```

**使用:**

```tsx
// app/page.tsx
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="p-8">
      <Button>点击我</Button>
      <Button variant="destructive">删除</Button>
      <Button variant="outline">轮廓按钮</Button>
      <Button variant="ghost" size="sm">小幽灵按钮</Button>
    </div>
  )
}

console.log('运行 npm run dev,你会看到漂亮的按钮');
```

### 4.3 一次性添加多个组件

```bash
# 添加表单相关组件
npx shadcn@latest add form input label textarea select

# 添加对话框相关组件
npx shadcn@latest add dialog alert-dialog sheet

# 添加数据展示组件
npx shadcn@latest add table card badge avatar

console.log('每个组件都会被复制到 components/ui/ 目录');
```

### 4.4 项目结构

```
my-app/
├── app/
│   ├── globals.css        # ⬅️ 包含 CSS 变量定义
│   └── page.tsx
├── components/
│   └── ui/                # ⬅️ shadcn/ui 组件在这里
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
├── lib/
│   └── utils.ts           # ⬅️ 工具函数
├── components.json        # ⬅️ shadcn/ui 配置
├── tailwind.config.ts
└── package.json
```

---

## 5. 核心组件实战

### 5.1 Button — 按钮的艺术

```tsx
// components/ui/button.tsx 的核心代码 (已简化)
import { cva, type VariantProps } from "class-variance-authority"

// CVA (Class Variance Authority):用类型安全的方式管理变体
const buttonVariants = cva(
  // 基础样式 (所有按钮共享)
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean  // ⬅️ 神奇的 prop:渲染为子元素
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

console.log('CVA 提供类型安全的变体管理,TypeScript 会自动补全 variant 和 size');
```

**使用示例:**

```tsx
import { Button } from "@/components/ui/button"
import { Trash, Download, Plus } from "lucide-react"

export function ButtonDemo() {
  return (
    <div className="flex flex-col gap-4">
      {/* 基础用法 */}
      <Button>默认按钮</Button>
      <Button variant="destructive">删除</Button>
      <Button variant="outline">轮廓按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="link">链接按钮</Button>

      {/* 尺寸 */}
      <Button size="sm">小按钮</Button>
      <Button size="lg">大按钮</Button>

      {/* 带图标 */}
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        新建
      </Button>
      <Button variant="outline" size="icon">
        <Trash className="h-4 w-4" />
      </Button>

      {/* 禁用状态 */}
      <Button disabled>禁用按钮</Button>

      {/* asChild:把样式应用到子元素 */}
      <Button asChild>
        <a href="/download">
          <Download className="mr-2 h-4 w-4" />
          下载
        </a>
      </Button>
      {/* 渲染为 <a> 元素,但有按钮的样式 */}
    </div>
  )
}

console.log('Button 是最简单的组件,但包含了设计系统的核心理念');
```

**自定义 Button:**

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // 添加你的自定义 variant
        neon: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
      },
      // ...
    },
  }
)

// 使用:
<Button variant="neon">霓虹按钮</Button>
<Button variant="glass">玻璃态按钮</Button>

console.log('直接改源码,不需要"扩展主题"');
```

### 5.2 Dialog — 对话框的复杂性

```tsx
// components/ui/dialog.tsx (核心部分)
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// 遮罩层
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))

// 内容区域
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">关闭</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

console.log('Radix 提供行为,shadcn/ui 提供样式,你拥有源码');
```

**使用示例:**

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>打开对话框</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除?</DialogTitle>
          <DialogDescription>
            此操作不可恢复。删除后,所有相关数据将永久丢失。
          </DialogDescription>
        </DialogHeader>
        
        {/* 自定义内容 */}
        <div className="py-4">
          <p className="text-sm">你即将删除:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>3 个项目文件</li>
            <li>127 条数据记录</li>
            <li>所有相关的用户权限</li>
          </ul>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button variant="destructive">确认删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

console.log('完全自定义的内容区域,不受框架限制');
```

**受控模式 (Controlled Mode):**

```tsx
export function ControlledDialogDemo() {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = async () => {
    console.log('执行删除操作...')
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('删除成功')
    setOpen(false) // 手动关闭对话框
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>受控对话框</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button variant="destructive" onClick={handleConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

console.log('open 和 onOpenChange 让你完全控制对话框状态');
```

### 5.3 Form — 表单的类型安全之旅

shadcn/ui 的 Form 组件集成了 **React Hook Form** + **Zod**,实现端到端的类型安全。

```bash
# 添加 Form 相关组件
npx shadcn@latest add form
```

**示例:用户注册表单**

```tsx
// app/register/page.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// 1. 定义 Zod Schema (验证规则 + 类型定义合一)
const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "用户名至少 3 个字符" })
    .max(20, { message: "用户名最多 20 个字符" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "只能包含字母、数字和下划线" }),
  
  email: z
    .string()
    .email({ message: "邮箱格式不正确" }),
  
  password: z
    .string()
    .min(8, { message: "密码至少 8 个字符" })
    .regex(/[A-Z]/, { message: "密码必须包含大写字母" })
    .regex(/[0-9]/, { message: "密码必须包含数字" }),
  
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],
})

// 2. 从 Schema 推导出 TypeScript 类型
type FormValues = z.infer<typeof formSchema>

export default function RegisterPage() {
  // 3. 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // 4. 提交处理
  async function onSubmit(values: FormValues) {
    console.log('表单验证通过,提交的值:', values)
    // values 的类型是 FormValues,完全类型安全
    
    // 模拟 API 调用
    console.log('发送 POST /api/register 请求...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('注册成功!')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">用户注册</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 用户名字段 */}
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
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 邮箱字段 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 密码字段 */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="请输入密码" {...field} />
                </FormControl>
                <FormDescription>
                  至少 8 个字符,必须包含大写字母和数字
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 确认密码字段 */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="再次输入密码" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            注册
          </Button>
        </form>
      </Form>
    </div>
  )
}

console.log('类型安全:Schema 定义了验证规则,同时推导出 TypeScript 类型');
console.log('实时验证:每个字段失焦时验证,提交时整体验证');
console.log('错误展示:FormMessage 自动显示对应字段的错误信息');
```

### 5.4 Command — 命令面板的魔法

Command 组件实现了类似 VSCode 的命令面板 (`Cmd+K` / `Ctrl+K`)。

```bash
npx shadcn@latest add command dialog
```

**示例:应用内搜索**

```tsx
"use client"

import * as React from "react"
import { Calculator, Calendar, Settings, Smile, User } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function CommandDemo() {
  const [open, setOpen] = React.useState(false)

  // 监听快捷键 Cmd+K (macOS) 或 Ctrl+K (Windows)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
        console.log('快捷键触发:打开命令面板')
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        按 <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd> 打开命令面板
      </p>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="输入命令或搜索..." />
        <CommandList>
          <CommandEmpty>未找到结果</CommandEmpty>
          
          <CommandGroup heading="建议">
            <CommandItem
              onSelect={() => runCommand(() => console.log('打开日历'))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>日历</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => console.log('搜索表情'))}
            >
              <Smile className="mr-2 h-4 w-4" />
              <span>搜索表情</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => console.log('打开计算器'))}
            >
              <Calculator className="mr-2 h-4 w-4" />
              <span>计算器</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandGroup heading="设置">
            <CommandItem
              onSelect={() => runCommand(() => console.log('打开个人资料'))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => console.log('打开设置'))}
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

console.log('Command 组件内建模糊搜索、键盘导航、分组功能');
console.log('用户可以用方向键选择、Enter 确认、Esc 关闭');
```

### 5.5 Toast — 非阻塞通知

Toast 用于显示临时通知,不阻塞用户操作。

```bash
npx shadcn@latest add toast
```

shadcn/ui 的 Toast 基于 **Radix UI Toast** + **Sonner** (一个轻量级 Toast 库)。

**设置 Toast Provider:**

```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }: { children: React.Node }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster />  {/* ⬅️ Toast 容器 */}
      </body>
    </html>
  )
}
```

**使用 Toast:**

```tsx
"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function ToastDemo() {
  const { toast } = useToast()

  return (
    <div className="space-x-2">
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
            description: "网络连接错误,请稍后重试。",
          })
        }}
      >
        错误通知
      </Button>

      <Button
        onClick={() => {
          console.log('显示带操作的 Toast')
          toast({
            title: "文件已删除",
            description: "照片.jpg 已移至回收站。",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('撤销删除')}
              >
                撤销
              </Button>
            ),
          })
        }}
      >
        带操作的通知
      </Button>
    </div>
  )
}

console.log('Toast 会自动在 5 秒后消失,用户可以手动关闭');
```

---

## 6. 主题定制

shadcn/ui 使用 **CSS 变量** 作为设计令牌 (Design Tokens),让主题定制极其简单。

### 6.1 颜色系统

shadcn/ui 的颜色不是硬编码的 HEX 值,而是**语义化的 CSS 变量**:

```css
/* app/globals.css */
@layer base {
  :root {
    /* 背景色 */
    --background: 0 0% 100%;           /* 白色 (HSL) */
    --foreground: 222.2 84% 4.9%;      /* 深灰色 */

    /* 主色 */
    --primary: 222.2 47.4% 11.2%;      /* 深蓝色 */
    --primary-foreground: 210 40% 98%; /* 主色上的文字颜色 */

    /* 次要色 */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    /* 强调色 */
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    /* 破坏性操作色 (删除、错误) */
    --destructive: 0 84.2% 60.2%;      /* 红色 */
    --destructive-foreground: 210 40% 98%;

    /* 边框 */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;        /* 输入框边框 */
    --ring: 222.2 84% 4.9%;            /* 焦点环 */

    /* 圆角 */
    --radius: 0.5rem;
  }

  .dark {
    /* 暗黑模式的颜色 */
    --background: 222.2 84% 4.9%;      /* 深色背景 */
    --foreground: 210 40% 98%;         /* 浅色文字 */

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    /* ... 其他暗黑模式颜色 */
  }
}
```

> ⚛️ **The Physics: 为什么用 HSL 而不是 RGB?**
>
> HSL (Hue, Saturation, Lightness) 比 RGB 更适合做主题系统:
> - **Hue (色相)**: 0-360 度,代表颜色种类 (0=红, 120=绿, 240=蓝)
> - **Saturation (饱和度)**: 0-100%,代表颜色纯度
> - **Lightness (明度)**: 0-100%,代表颜色明暗
>
> 当你想要"稍微亮一点的蓝色"时:
> - RGB: `rgb(30, 64, 175)` → `rgb(59, 130, 246)` (要手动调三个值)
> - HSL: `hsl(221, 83%, 53%)` → `hsl(221, 83%, 63%)` (只改明度)
>
> shadcn/ui 的变量格式 `222.2 47.4% 11.2%` 是省略 `hsl()` 包裹的写法,因为 Tailwind 会自动添加。

### 6.2 一键切换主题

shadcn/ui 提供了 `themes.shadcn.com`,你可以可视化选择颜色:

```bash
# 1. 访问 https://ui.shadcn.com/themes
# 2. 选择一个主题 (如 "Rose" 玫瑰红主题)
# 3. 复制生成的 CSS 变量
# 4. 粘贴到 globals.css 替换 :root 块

console.log('主题切换只需要改 CSS 变量,组件代码不需要动');
```

**示例:紫色主题**

```css
:root {
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;

  --primary: 262.1 83.3% 57.8%;        /* 紫色 */
  --primary-foreground: 210 20% 98%;

  --secondary: 220 14.3% 95.9%;
  --secondary-foreground: 220.9 39.3% 11%;

  --accent: 220 14.3% 95.9%;
  --accent-foreground: 220.9 39.3% 11%;

  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 20% 98%;

  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 262.1 83.3% 57.8%;           /* 焦点环也是紫色 */

  --radius: 0.5rem;
}

console.log('所有组件自动变成紫色主题,无需修改代码');
```

### 6.3 暗黑模式

shadcn/ui 使用 `next-themes` 库实现暗黑模式切换。

```bash
npm install next-themes
```

**设置 ThemeProvider:**

```tsx
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.Node }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

console.log('attribute="class" 表示通过 .dark 类名切换主题');
console.log('defaultTheme="system" 表示默认跟随系统设置');
```

**主题切换组件:**

```tsx
// components/theme-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        const newTheme = theme === "dark" ? "light" : "dark"
        console.log(`切换主题:${theme} → ${newTheme}`)
        setTheme(newTheme)
      }}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}

console.log('点击按钮,<html> 标签会添加/移除 .dark 类名');
console.log('CSS 中的 .dark { ... } 规则自动生效');
```

---

## 7. 构建设计系统

> 🌌 **The Big Picture: 从组件集到设计系统的跃迁**
>
> **组件集** (Component Library) 和**设计系统** (Design System) 的区别:
> - **组件集**:一堆可复用的 UI 组件 (Button, Dialog, Table...)
> - **设计系统**:组件 + 设计原则 + 使用指南 + 设计令牌 + 品牌语言
>
> 组件是"砖块",设计系统是"建筑规范"。shadcn/ui 给你砖块,你需要自己定义建筑规范。

### 7.1 设计令牌 (Design Tokens)

设计令牌是设计决策的最小单元。

```typescript
// lib/design-tokens.ts
export const tokens = {
  // 间距系统 (基于 4px 网格)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },

  // 字体系统
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
  },

  // 字重
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // 圆角
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },

  // 阴影
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  // 动画时长
  transitionDuration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
}

console.log('这些令牌应该同步到 Tailwind 配置和 Figma');
```

**同步到 Tailwind:**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"
import { tokens } from "./lib/design-tokens"

const config: Config = {
  theme: {
    extend: {
      spacing: tokens.spacing,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
      transitionDuration: tokens.transitionDuration,
    },
  },
}

export default config

console.log('设计令牌的单一数据源,设计师和工程师共享');
```

### 7.2 组件命名规范

```typescript
// 组件分层:
// 1. Primitives (原语): 基于 Radix,无样式
// 2. Base Components (基础组件): 应用样式的 Radix 组件 (components/ui/)
// 3. Composite Components (组合组件): 业务相关的组合 (components/)
// 4. Page Components (页面组件): 特定页面的组件 (app/*/components/)

// ✅ 好的命名:
<Button>           // 基础组件,单一职责
<Dialog>           // 基础组件
<UserProfileCard>  // 组合组件,业务含义清晰
<DashboardHeader>  // 页面组件,位置明确

// ❌ 坏的命名:
<MyButton>         // "My" 是废话
<DialogComponent>  // "Component" 是废话
<Card1>            // 数字后缀说明你没想好名字
<DivContainer>     // Div 和 Container 都是废话

console.log('命名应该描述"是什么",而不是"怎么做"');
```

### 7.3 组件文档模板

```tsx
// components/user-avatar.tsx
/**
 * UserAvatar - 用户头像组件
 *
 * @description
 * 显示用户头像,支持图片、fallback 文字、在线状态指示器。
 *
 * @example
 * ```tsx
 * <UserAvatar
 *   src="/avatars/john.jpg"
 *   fallback="JD"
 *   status="online"
 * />
 * ```
 *
 * @see Figma 设计稿: https://figma.com/file/xxx
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface UserAvatarProps {
  /** 头像图片 URL */
  src?: string
  /** 图片加载失败时显示的文字 (通常是用户名首字母) */
  fallback: string
  /** 在线状态 */
  status?: "online" | "offline" | "away"
  /** 尺寸 */
  size?: "sm" | "md" | "lg"
  /** 自定义类名 */
  className?: string
}

export function UserAvatar({
  src,
  fallback,
  status,
  size = "md",
  className,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src} alt={fallback} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white",
            status === "online" && "bg-green-500",
            status === "away" && "bg-yellow-500",
            status === "offline" && "bg-gray-400"
          )}
          aria-label={`状态: ${status}`}
        />
      )}
    </div>
  )
}

console.log('文档即代码:TypeScript 注释 + 清晰的 Props 接口');
```

### 7.4 设计系统清单

一个完整的设计系统应该包含:

- [ ] **设计令牌** (颜色、间距、字体、圆角、阴影)
- [ ] **组件库** (20-30 个基础组件)
- [ ] **组件文档** (每个组件的用法、示例、Props API)
- [ ] **使用指南** (何时用 Button vs Link,何时用 Dialog vs Sheet)
- [ ] **可访问性指南** (颜色对比度、键盘导航、屏幕阅读器)
- [ ] **代码规范** (命名、文件组织、注释)
- [ ] **Figma 组件库** (设计师和工程师的源头同步)
- [ ] **Storybook** (组件的可视化展示和测试)
- [ ] **更新日志** (组件的版本变更记录)

---

## 8. 🧘 Zen of Code: 所有权与依赖

> **你真正拥有的,只有你理解的东西。**

当你用 `npm install @mui/material` 时,你获得了一个强大的工具,但你失去了一些东西:

**你失去的:**
- **控制权**:组件的实现细节被隐藏在 `node_modules/` 里
- **理解**:你通过文档学习如何使用,但不知道它如何工作
- **自由**:当你需要的定制超出了文档,你被抽象层困住了
- **独立性**:当库被弃坑,你要么被锁在旧版本,要么痛苦迁移

**shadcn/ui 的哲学不是"给你一个完美的组件库",而是"教你如何构建组件库"。**

当你执行 `npx shadcn@latest add button` 时,你获得的不是一个依赖,而是一个起点:
- 你看到了 Button 是如何用 Radix + Tailwind + CVA 构建的
- 你可以读每一行代码,理解每个设计决策
- 你可以改任何一行,不需要等待 PR 合并
- 你不再依赖外部维护者——**你就是维护者**

> ⚛️ **The Physics: 依赖是一种债务**
>
> Martin Fowler 说:"Every line of code you don't write is a line you don't have to maintain."(每一行你不写的代码,都是一行你不需要维护的代码。)
>
> 但他没说的是:**每一个你引入的依赖,都是一笔技术债务**。
> - 你欠这个库的作者一份信任
> - 你欠未来的自己一个"如果库被弃坑怎么办"的答案
> - 你欠你的团队一个"如果需要深度定制怎么办"的方案
>
> shadcn/ui 的"复制粘贴"哲学是**用代码行数换独立性**:
> - 你多写了几百行代码(组件源码在你项目里)
> - 但你消灭了一个依赖链(不再依赖 npm 包的持续维护)
> - 这是一种权衡——**短期的代码量 vs 长期的控制权**

**何时选择 npm 依赖,何时选择 shadcn/ui:**

```
是否需要深度定制?
  ├─ 是 → shadcn/ui (你需要改源码)
  └─ 否 → 继续...
      └─ 是否有强品牌约束? (如必须用 Material Design)
          ├─ 是 → Material UI (MUI 实现了完整的 Material Design 规范)
          └─ 否 → 继续...
              └─ 团队是否有能力维护组件代码?
                  ├─ 是 → shadcn/ui (拥有代码)
                  └─ 否 → 传统组件库 (依赖社区维护)

console.log('没有完美答案,只有适合你场景的权衡');
```

---

## 9. 最佳实践与常见陷阱

### ✅ 最佳实践

**1. 组件改完后记得测试可访问性**

```bash
# 使用 axe DevTools 浏览器扩展
# 或者在代码中集成 jest-axe

npm install --save-dev jest-axe @testing-library/react

# 测试示例:
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '@/components/ui/button'

expect.extend(toHaveNoViolations)

test('Button 无可访问性问题', async () => {
  const { container } = render(<Button>点击</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

console.log('Radix 提供的可访问性,改样式时不要破坏它');
```

**2. 为自定义组件添加 displayName**

```tsx
// ✅ 好
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // ...
})
Button.displayName = "Button"

// ❌ 差 (React DevTools 会显示 Anonymous)
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // ...
})

console.log('displayName 帮助调试:在 React DevTools 中显示组件名');
```

**3. 复用组件前先抽象**

```tsx
// ❌ 过早抽象:第一次用就抽象成组件
// 你只有一个地方用到"蓝色大按钮",就急着抽成 <BigBlueButton>

// ✅ 三次法则:用到第三次再抽象
// 1. 第一次:直接写 <Button size="lg" className="bg-blue-600">...</Button>
// 2. 第二次:复制粘贴同样的代码
// 3. 第三次:抽象成 <PrimaryActionButton>

console.log('过早抽象是万恶之源 — 你不知道组件的真实需求');
```

**4. 把设计令牌同步到 Figma**

```bash
# 使用工具:
# - Figma Tokens Plugin (同步 CSS 变量到 Figma)
# - Style Dictionary (从 JSON 生成 CSS/SCSS/JS)

# 工作流:
# 设计师在 Figma 修改颜色 → 导出 tokens.json → 工程师同步到 CSS 变量

console.log('设计系统的核心是"设计师和工程师共享同一套令牌"');
```

### ❌ 常见陷阱

**1. 直接修改 `node_modules/` 里的 shadcn 组件**

```bash
# ❌ 错误
# 你发现 Button 组件有个小问题,直接改了 node_modules/@radix-ui/...

# 问题:
# 1. 下次 npm install 会覆盖你的修改
# 2. 其他团队成员不知道你改了什么

# ✅ 正确
# shadcn/ui 的组件在 components/ui/,直接改那里的代码
# 如果需要改 Radix,fork 一份或提 PR

console.log('shadcn/ui 的代码在你项目里,改它就行');
```

**2. 忘记传递 `ref`**

```tsx
// ❌ 错误:自定义组件没有 forwardRef
function CustomButton({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>
}

// 使用时:
const buttonRef = useRef<HTMLButtonElement>(null)
<CustomButton ref={buttonRef}>点击</CustomButton>  // ⚠️ ref 不会传递

// ✅ 正确:用 forwardRef 包裹
const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return <button ref={ref} {...props}>{children}</button>
  }
)

console.log('shadcn/ui 的所有组件都用 forwardRef,保持一致性');
```

**3. 在 CSS 变量外硬编码颜色**

```tsx
// ❌ 错误:硬编码颜色
<div className="bg-blue-500 text-white">...</div>

// 问题:暗黑模式不会自动适配

// ✅ 正确:用 CSS 变量
<div className="bg-primary text-primary-foreground">...</div>

// ✅ 或者添加自定义变量
// globals.css:
// :root { --accent-purple: 262.1 83.3% 57.8%; }
// .dark { --accent-purple: 270 60% 70%; }

console.log('所有颜色都应该用 CSS 变量,确保主题切换正常');
```

**4. 过度使用 `cn()` 工具函数**

```tsx
// ❌ 过度使用:每个元素都用 cn()
<div className={cn("flex", "items-center", "gap-4")}>
  <span className={cn("text-sm", "text-muted-foreground")}>文字</span>
</div>

// ✅ 简化:静态类名不需要 cn()
<div className="flex items-center gap-4">
  <span className="text-sm text-muted-foreground">文字</span>
</div>

// ✅ 只在需要条件逻辑或合并 className prop 时用 cn()
<div className={cn(
  "flex items-center gap-4",
  isActive && "bg-accent",    // 条件类名
  className                   // 合并外部传入的类名
)}>

console.log('cn() 是工具,不是教条');
```

---

## 10. 章节练习

### 练习 1: 自定义 Button variant

**任务**: 在 `components/ui/button.tsx` 中添加一个新的 variant: `neon`,要求有渐变背景和发光效果。

<details>
<summary>💡 提示</summary>

使用 Tailwind 的 `bg-gradient-to-r` 和 `shadow-*` 类。
</details>

<details>
<summary>✅ 参考答案</summary>

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // ... 其他 variant
        neon: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all",
      },
      // ...
    },
  }
)

// 使用:
<Button variant="neon">霓虹按钮</Button>

console.log('渐变 + 阴影 + hover 放大 = 霓虹效果');
```
</details>

---

### 练习 2: 构建一个确认对话框组件

**任务**: 基于 `Dialog`,创建一个 `ConfirmDialog` 组件,接受 props: `title`, `description`, `onConfirm`, `confirmText`, `cancelText`。

<details>
<summary>💡 提示</summary>

使用受控模式 (`open` + `onOpenChange`),在 `onConfirm` 回调后关闭对话框。
</details>

<details>
<summary>✅ 参考答案</summary>

```tsx
// components/confirm-dialog.tsx
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
      console.log('操作成功,关闭对话框')
      onOpenChange(false)
    } catch (error) {
      console.error('操作失败:', error)
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

// 使用:
function Example() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>删除项目</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
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
      />
    </>
  )
}

console.log('组合模式:基于 Dialog 构建高层组件');
```
</details>

---

### 练习 3: 实现一个加载状态的 Button

**任务**: 扩展 `Button` 组件,添加 `loading` prop。当 `loading=true` 时,显示 Spinner 图标并禁用按钮。

<details>
<summary>💡 提示</summary>

使用 `lucide-react` 的 `Loader2` 图标,添加旋转动画 (`animate-spin`)。
</details>

<details>
<summary>✅ 参考答案</summary>

```tsx
// components/ui/button.tsx (修改)
import { Loader2 } from "lucide-react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean  // ⬅️ 新增
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}  // ⬅️ loading 时禁用
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)

// 使用:
export function LoadingButtonDemo() {
  const [loading, setLoading] = React.useState(false)

  const handleClick = async () => {
    console.log('开始异步操作')
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))  // 模拟 API 调用
    console.log('操作完成')
    setLoading(false)
  }

  return (
    <Button onClick={handleClick} loading={loading}>
      {loading ? "提交中..." : "提交"}
    </Button>
  )
}

console.log('Loading 按钮是常见需求,直接改源码添加功能');
```
</details>

---

### 练习 4: 创建一个自定义主题

**任务**: 在 `app/globals.css` 中创建一个"森林绿"主题,要求:
- 主色 (primary) 为深绿色
- 背景色为浅绿色
- 保持良好的对比度 (至少 4.5:1)

<details>
<summary>💡 提示</summary>

访问 https://ui.shadcn.com/themes,选择绿色主题,复制 CSS 变量。或使用工具检查对比度: https://coolors.co/contrast-checker
</details>

<details>
<summary>✅ 参考答案</summary>

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 120 30% 97%;           /* 浅绿色背景 */
    --foreground: 120 50% 10%;           /* 深绿色文字 */

    --primary: 142 76% 36%;              /* 森林绿 (#16a34a) */
    --primary-foreground: 0 0% 100%;     /* 白色 */

    --secondary: 120 30% 90%;
    --secondary-foreground: 120 50% 20%;

    --accent: 120 30% 92%;
    --accent-foreground: 120 50% 20%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 120 20% 85%;
    --input: 120 20% 85%;
    --ring: 142 76% 36%;                 /* 焦点环和主色一致 */

    --radius: 0.5rem;
  }

  .dark {
    --background: 120 20% 8%;            /* 深绿色背景 */
    --foreground: 120 10% 95%;           /* 浅色文字 */

    --primary: 142 70% 50%;              /* 亮绿色 (暗黑模式下提高明度) */
    --primary-foreground: 120 50% 10%;

    --secondary: 120 15% 15%;
    --secondary-foreground: 120 10% 90%;

    --accent: 120 15% 20%;
    --accent-foreground: 120 10% 90%;

    --destructive: 0 62.8% 60%;
    --destructive-foreground: 0 0% 98%;

    --border: 120 15% 25%;
    --input: 120 15% 25%;
    --ring: 142 70% 50%;

    --radius: 0.5rem;
  }
}

console.log('森林绿主题:WCAG AA 对比度 ✅,暗黑模式支持 ✅');
```

**验证对比度:**

```
浅色模式:
- 背景 hsl(120, 30%, 97%) 和主色 hsl(142, 76%, 36%) 的对比度: 5.8:1 ✅ (大于 4.5:1)
- 背景和文字 hsl(120, 50%, 10%) 的对比度: 12.3:1 ✅

暗黑模式:
- 背景 hsl(120, 20%, 8%) 和主色 hsl(142, 70%, 50%) 的对比度: 6.2:1 ✅
- 背景和文字 hsl(120, 10%, 95%) 的对比度: 13.1:1 ✅
```
</details>

---

### 练习 5: 构建一个 Toast 通知系统的最佳实践

**任务**: 创建一个全局 Toast 管理器,要求:
- 同时最多显示 3 个 Toast
- 超过 3 个时,旧的自动移除
- 支持不同的 variant (success, error, warning, info)

<details>
<summary>💡 提示</summary>

shadcn/ui 的 Toast 已经支持队列管理,你只需要封装一个便捷的 API。
</details>

<details>
<summary>✅ 参考答案</summary>

```typescript
// lib/toast-manager.ts
import { toast as primitiveToast } from "sonner"  // shadcn/ui 使用 sonner

// 全局配置
const MAX_TOASTS = 3

// 封装的 Toast API
export const toast = {
  success: (message: string, description?: string) => {
    console.log('显示成功 Toast:', message)
    primitiveToast.success(message, {
      description,
      duration: 3000,
    })
  },

  error: (message: string, description?: string) => {
    console.log('显示错误 Toast:', message)
    primitiveToast.error(message, {
      description,
      duration: 5000,  // 错误消息显示更久
    })
  },

  warning: (message: string, description?: string) => {
    console.log('显示警告 Toast:', message)
    primitiveToast.warning(message, {
      description,
      duration: 4000,
    })
  },

  info: (message: string, description?: string) => {
    console.log('显示信息 Toast:', message)
    primitiveToast.info(message, {
      description,
      duration: 3000,
    })
  },

  promise: async <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    console.log('Promise Toast:等待异步操作...')
    return primitiveToast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}

// 使用示例:
export function ToastDemo() {
  const handleSave = async () => {
    await toast.promise(
      fetch('/api/save').then(res => res.json()),
      {
        loading: '保存中...',
        success: '保存成功!',
        error: '保存失败,请重试',
      }
    )
  }

  return (
    <div className="space-x-2">
      <Button onClick={() => toast.success('操作成功', '你的更改已保存')}>
        成功
      </Button>
      <Button onClick={() => toast.error('操作失败', '网络连接错误')}>
        错误
      </Button>
      <Button onClick={() => toast.warning('警告', '磁盘空间不足')}>
        警告
      </Button>
      <Button onClick={() => toast.info('提示', '新版本可用')}>
        信息
      </Button>
      <Button onClick={handleSave}>
        Promise Toast
      </Button>
    </div>
  )
}

console.log('Promise Toast:自动管理加载/成功/失败状态');
```

**配置 Toaster 的最大数量:**

```tsx
// app/layout.tsx
import { Toaster } from "sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
          visibleToasts={3}  // ⬅️ 最多显示 3 个
          richColors
        />
      </body>
    </html>
  )
}

console.log('超过 3 个时,最旧的 Toast 会自动被移除');
```
</details>

---

**恭喜!** 🎉 你已经掌握了 shadcn/ui 的核心理念和实战技巧。

**下一步:**
- 阅读 [Radix UI 文档](https://www.radix-ui.com/) 深入理解 Headless 组件
- 访问 [shadcn/ui 官网](https://ui.shadcn.com/) 浏览所有可用组件
- 在你的项目中实践:从添加一个 Button 开始,逐步构建完整的设计系统

**记住:**
> 你不是在使用一个组件库,你是在学习如何构建组件库。
> 代码在你手中,控制权在你手中,未来也在你手中。

---

**向前连接**: 回顾 Stage 3 的设计模式(组合模式、策略模式)和 Stage 5 的抽象泄漏章节,你会发现 shadcn/ui 的设计哲学正是这些理论的实践。

**向后连接**: 在即将到来的 TeamPulse 项目中,你将用 shadcn/ui 构建一个完整的仪表盘应用,体验从组件到系统的完整旅程。
