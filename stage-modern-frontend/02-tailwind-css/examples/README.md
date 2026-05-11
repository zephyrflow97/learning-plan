# Tailwind CSS 代码示例索引

本目录包含 Tailwind CSS 章节的完整代码示例。所有示例都是可直接运行的完整文件,包含详细注释和控制台日志。

## 📁 目录结构

```
examples/
├── layouts/              # 布局系统示例
├── components/           # 组件示例
├── animations/           # 动画和过渡效果
├── themes/               # 主题和暗黑模式
├── config/               # 配置文件示例
└── README.md             # 本文件
```

---

## 🏗️ 布局系统 (`layouts/`)

### 1. Flexbox 导航栏
**文件**: `layouts/flexbox-navbar.html`

**演示内容**:
- Flexbox 水平布局
- `justify-between` 两端对齐
- `items-center` 垂直居中
- 响应式设计 (移动端隐藏导航链接)

**关键类名**:
```html
<nav class="flex items-center justify-between px-6 py-4">
```

**学习要点**:
- CSS 史上最难问题之一:垂直居中,现在只需 3 个类
- Flexbox 主轴和交叉轴的对齐方式
- `gap-*` 控制子元素间距

---

### 2. Grid 仪表盘布局
**文件**: `layouts/grid-dashboard.html`

**演示内容**:
- CSS Grid 二维布局
- 固定宽度列 + 自适应列
- 固定高度行 + 自适应行
- `col-span-*` 跨列布局

**关键类名**:
```html
<div class="grid grid-cols-[240px_1fr] grid-rows-[64px_1fr] h-screen">
```

**学习要点**:
- Grid 适合整页布局,Flexbox 适合单行/单列
- `[240px_1fr]` 语法:第一列固定,第二列自适应
- 侧边栏 + 顶栏 + 主内容区的经典布局

---

## 🧩 组件示例 (`components/`)

### 3. 响应式卡片网格
**文件**: `components/card-grid.html`

**演示内容**:
- 响应式 Grid:手机 1 列,平板 2 列,笔记本 3 列
- 卡片悬停效果:`hover:shadow-2xl` + `hover:-translate-y-2`
- 渐变背景和图标
- 推荐标签 (ring-2 ring-purple-500)

**关键类名**:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
```

**学习要点**:
- 移动优先响应式设计
- `transition-all duration-300` 平滑过渡
- 阴影变化 + 位移 = 深度感

---

## 🎨 动画与交互 (`animations/`)

### 4. 动画和过渡效果
**文件**: `animations/transitions-and-animations.html`

**演示内容**:
- 基础过渡:`transition`, `duration-*`, `ease-*`
- Tailwind 内置动画:`animate-spin`, `animate-pulse`, `animate-bounce`, `animate-ping`
- 自定义动画:fadeIn, slideIn, wiggle (通过 tailwind.config 配置)
- Group 交互:父元素悬停时子元素响应
- Peer 交互:前一个兄弟元素状态影响后续元素
- 实战:加载按钮 (带 Spinner 图标)

**关键类名**:
```html
<!-- 基础过渡 -->
<button class="transition duration-200 hover:bg-blue-700">

<!-- 内置动画 -->
<div class="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full">

<!-- Group 交互 -->
<div class="group">
  <h3 class="group-hover:text-blue-600">标题</h3>
</div>

<!-- Peer 交互 -->
<input type="checkbox" class="peer sr-only" />
<label class="peer-checked:bg-green-600">复选框</label>
```

**学习要点**:
- **性能提示**:
  - ✅ 高性能:`opacity`, `transform` (GPU 加速)
  - ⚠️ 中性能:`colors`, `border`, `shadow`
  - ❌ 低性能:`width`, `height`, `padding` (触发重排)
- **时长建议**:
  - 150ms:快速反馈
  - 200-300ms:标准过渡
  - 500ms+:强调效果
- Group 的本质:父元素加 `group` 类,子元素用 `group-hover:*` 响应
- Peer 的本质:前一个兄弟元素加 `peer` 类,后续元素用 `peer-*:*` 响应

---

## 🌓 主题系统 (`themes/`)

### 5. 暗黑模式主题
**文件**: `themes/dark-mode.html`

**演示内容**:
- 暗黑模式切换按钮
- 自动保存用户偏好到 localStorage
- 跟随系统主题偏好 (`prefers-color-scheme`)
- 所有组件的暗黑模式适配
- 表单元素的主题适配

**关键类名**:
```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

**配置**:
```javascript
tailwind.config = {
  darkMode: 'class', // 通过 .dark 类名切换
}
```

**JavaScript 逻辑**:
```javascript
// 切换主题
html.classList.toggle('dark')
localStorage.setItem('theme', isDark ? 'dark' : 'light')
```

**学习要点**:
- `darkMode: 'class'` vs `darkMode: 'media'`
  - `'class'`:手动控制,可控性强
  - `'media'`:自动跟随系统,无法手动切换
- 主题策略:
  1. 优先使用 localStorage 保存的用户偏好
  2. 若无保存,跟随系统设置
  3. 监听系统主题变化(仅当用户未手动设置时)
- 所有颜色都应该有 `dark:` 变体,确保暗黑模式可用

---

## ⚙️ 配置文件 (`config/`)

### 6. Tailwind 配置文件
**文件**: `config/tailwind.config.example.ts`

**包含内容**:
- 内容路径配置 (`content`)
- 暗黑模式策略 (`darkMode`)
- 主题扩展 (`theme.extend`)
  - 颜色系统 (简单颜色、色板、CSS 变量)
  - 间距、字体、圆角、阴影
  - 自定义动画 (keyframes + animation)
  - 过渡时长和缓动函数
  - 响应式断点扩展
- 插件系统 (`plugins`)
  - 第三方插件:forms, typography
  - 自定义工具类:`scrollbar-hide`, `text-shadow`
  - 自定义组件类:`.container-custom`, `.card-base`
  - 自定义变体:`active-state`, `loading`
- 生产环境优化 (`safelist`)

**使用场景**:
- ✅ 有品牌色要求 → 添加自定义颜色色板
- ✅ 需要特殊间距 → 扩展 spacing
- ✅ 需要自定义动画 → 定义 keyframes 和 animation
- ✅ 需要隐藏滚动条等常用样式 → 自定义插件

**不推荐**:
- ❌ 完全覆盖默认值 (`theme: { colors: {...} }`) — 会失去 Tailwind 的默认色板
- ❌ 过度使用 safelist — 会增加 CSS 体积

---

### 7. 全局样式文件
**文件**: `config/globals.example.css`

**包含内容**:
- Tailwind 指令:`@tailwind base/components/utilities`
- CSS 变量系统 (HSL 格式)
  - 亮色模式变量 (`:root`)
  - 暗黑模式变量 (`.dark`)
  - 语义化颜色:`--primary`, `--destructive`, `--muted` 等
- 基础样式重置 (`@layer base`)
- 自定义组件类 (`@layer components`)
  - 按钮变体:`.btn-primary`, `.btn-outline` 等
  - 卡片、输入框、徽章样式
- 自定义工具类 (`@layer utilities`)
  - 隐藏滚动条、文字省略、玻璃态、渐变文字
- 辅助功能优化 (`.sr-only`, `.skip-link`)
- 自定义滚动条样式

**为什么用 HSL 而不是 RGB**:
- HSL = Hue (色相) + Saturation (饱和度) + Lightness (明度)
- 想要"稍微亮一点的蓝色"时:
  - RGB: `rgb(30, 64, 175)` → `rgb(59, 130, 246)` (要手动调三个值)
  - HSL: `hsl(221, 83%, 53%)` → `hsl(221, 83%, 63%)` (只改明度)

**@layer 的作用**:
- `@layer base`:HTML 元素默认样式 (优先级最低)
- `@layer components`:可复用的组件样式 (中等优先级)
- `@layer utilities`:单一用途的工具类 (优先级最高)

**@apply 使用建议**:
- ✅ 用于组件库中重复出现的固定模式
- ✅ 用于第三方库的样式覆盖
- ❌ 避免过度使用 (失去 Tailwind 的优势)
- ❌ 优先使用 React 组件复用而非 @apply

---

## 🚀 如何使用这些示例

### 1. HTML 文件 (直接运行)
所有 `.html` 文件都使用 Tailwind CDN,可以直接在浏览器中打开:

```bash
# 双击打开,或使用 Live Server
open layouts/flexbox-navbar.html
```

### 2. 配置文件 (Next.js 项目)
复制配置文件到你的 Next.js 项目:

```bash
# 复制 Tailwind 配置
cp config/tailwind.config.example.ts ./tailwind.config.ts

# 复制全局样式
cp config/globals.example.css ./app/globals.css
```

### 3. 在线预览
推荐工具:
- **Tailwind Play**: https://play.tailwindcss.com/ (在线编辑器)
- **CodePen**: https://codepen.io/ (需要手动添加 Tailwind CDN)
- **StackBlitz**: https://stackblitz.com/ (完整的 Next.js 环境)

---

## 📚 学习路径建议

### 初学者
1. ✅ 先看 `layouts/flexbox-navbar.html` — 理解 Flexbox 基础
2. ✅ 再看 `components/card-grid.html` — 理解响应式设计
3. ✅ 然后看 `animations/transitions-and-animations.html` — 理解交互效果
4. ✅ 最后看 `themes/dark-mode.html` — 理解主题系统

### 进阶开发者
1. ✅ 先看 `config/tailwind.config.example.ts` — 理解配置系统
2. ✅ 再看 `config/globals.example.css` — 理解 CSS 变量和 @layer
3. ✅ 然后看 `layouts/grid-dashboard.html` — 理解复杂布局
4. ✅ 实战:结合 shadcn/ui 构建完整设计系统

---

## 💡 最佳实践

### ✅ 推荐做法
1. **移动优先**:默认写手机样式,用 `md:` `lg:` 扩展到大屏幕
2. **使用预设值**:优先从 Tailwind 的间距/颜色系统选择,避免任意值 `[13px]`
3. **提取组件**:重复 5+ 次的模式提取成 React 组件,而非用 `@apply`
4. **语义化配色**:使用 CSS 变量 (`bg-primary`) 而非硬编码 (`bg-blue-600`)
5. **性能优化**:过渡动画优先用 `opacity` 和 `transform` (GPU 加速)

### ❌ 避免做法
1. **动态字符串拼接**:`bg-${color}-500` (Tailwind 无法提取,用完整类名或 safelist)
2. **过度使用 @apply**:失去 Tailwind 的优势,优先用组件复用
3. **任意值滥用**:`p-[13.7px]` 破坏设计系统一致性
4. **在 content 中包含 node_modules**:构建速度慢,只扫描自己的代码
5. **忘记 dark: 变体**:实现暗黑模式时,所有颜色都需要 `dark:` 适配

---

## 🔗 相关资源

- **Tailwind CSS 官方文档**: https://tailwindcss.com/docs
- **Tailwind Play (在线编辑器)**: https://play.tailwindcss.com/
- **UI Colors (色板生成器)**: https://uicolors.app/
- **Tailwind Components (社区组件)**: https://tailwindcomponents.com/
- **Heroicons (官方图标库)**: https://heroicons.com/

---

## 📝 更新日志

- **2026-02-08**: 初始版本,包含 7 个完整示例
- 布局系统 (Flexbox + Grid)
- 响应式卡片网格
- 动画和过渡效果 (包含 Group/Peer 交互)
- 暗黑模式主题切换
- Tailwind 配置文件示例
- 全局样式和 CSS 变量系统

---

**祝学习愉快!如有问题,欢迎参考 README.md 主文件或查看官方文档。** 🚀
