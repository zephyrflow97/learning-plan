# Tailwind CSS 练习题答案

本目录包含 Tailwind CSS 相关练习题的答案。

## 📋 练习题列表

### 6. 卡片组件
- **文件**: `06-card-component.html`
- **技术点**: utility classes、hover 状态、阴影
- **使用方法**: 直接在浏览器中打开(使用 CDN 版本)
- **关键概念**:
  - Utility-first CSS: 使用预定义的类名
  - `hover:` 前缀: 悬停状态
  - `transition-*`: 平滑过渡动画
  - 响应式前缀: `md:`, `lg:` 等

### 13. 响应式导航栏
- **文件**: `13-navbar.tsx`
- **技术点**: useState、响应式设计、动画
- **关键概念**:
  - 移动优先设计: 先写移动端样式,再添加桌面端
  - `md:hidden` / `hidden md:flex`: 控制不同屏幕显示
  - `max-h-0` → `max-h-64` + `opacity`: 平滑展开动画
  - `transition-all duration-300`: 动画过渡

---

## 🎯 学习要点

### Utility-First 思想

#### 传统 CSS
```css
.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

#### Tailwind 方式
```html
<div class="bg-white p-5 rounded-lg shadow-md">
  ...
</div>
```

**优点**:
- 不需要命名
- 不会产生 CSS 膨胀
- 响应式和状态变化更简单

### 响应式断点

| 前缀 | 最小宽度 | 设备 |
|------|---------|------|
| (无) | 0px | 移动端 |
| `sm:` | 640px | 大手机 |
| `md:` | 768px | 平板 |
| `lg:` | 1024px | 笔记本 |
| `xl:` | 1280px | 桌面 |
| `2xl:` | 1536px | 大屏 |

```html
<!-- 移动端1列,平板2列,桌面3列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### 状态变体

```html
<!-- 悬停 -->
<button class="bg-blue-500 hover:bg-blue-600">

<!-- 焦点 -->
<input class="border-gray-300 focus:border-blue-500">

<!-- 禁用 -->
<button class="disabled:opacity-50 disabled:cursor-not-allowed">

<!-- 组合 -->
<div class="hover:scale-105 transition duration-300">
```

### 常用模式

#### Flexbox 居中
```html
<div class="flex items-center justify-center">
  居中内容
</div>
```

#### 卡片布局
```html
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition">
  卡片内容
</div>
```

#### 响应式容器
```html
<div class="container mx-auto px-4 max-w-7xl">
  内容
</div>
```

### 性能优化

1. **生产环境自动 PurgeCSS**: 移除未使用的样式
2. **JIT 模式**: 按需生成样式,启动更快
3. **避免过度使用 `@apply`**: 保持 utility-first

---

## 🔗 相关资源

- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [Tailwind Play](https://play.tailwindcss.com/) - 在线试验
- [Tailwind UI](https://tailwindui.com/) - 官方组件库
- [Headless UI](https://headlessui.com/) - 无样式组件库
