# CSS Fundamentals 代码示例

本目录包含 CSS 基础章节的所有代码示例，均为可直接运行的 HTML 文件。

## 📁 目录结构

### 1. Flexbox 布局 (`flexbox/`)
- `basic.html` - Flexbox 基础：主轴、交叉轴对齐
- `navbar.html` - 响应式导航栏
- `cards.html` - 等高卡片网格
- `center.html` - 垂直水平居中

### 2. Grid 布局 (`grid/`)
- `basic.html` - Grid 基础：行列定义
- `holy-grail.html` - 圣杯布局
- `gallery.html` - 图片画廊（自适应列数）
- `dashboard.html` - Dashboard 布局
- `named-areas.html` - 命名网格区域

### 3. 响应式设计 (`responsive/`)
- `media-queries.html` - 媒体查询基础
- `mobile-first.html` - 移动优先设计
- `container-queries.html` - 容器查询（现代特性）
- `responsive-units.html` - 响应式单位（rem, vw, clamp）

### 4. 动画与过渡 (`animations/`)
- `transitions.html` - CSS 过渡（transition）
- `keyframes.html` - 关键帧动画（@keyframes）
- `loading.html` - 加载动画集合
- `hover-effects.html` - 悬停效果

### 5. CSS 变量与主题 (`variables/`)
- `basic.html` - CSS 自定义属性基础
- `dark-mode.html` - 暗黑模式切换（完整实现）
- `design-tokens.html` - 设计令牌系统

## 🚀 使用方法

所有文件都是独立的 HTML 文件，可以直接在浏览器中打开：

1. **双击打开**: 直接双击任何 `.html` 文件
2. **本地服务器**: 使用 VS Code Live Server 插件
3. **命令行**: `python -m http.server 8000`（在当前目录）

## 🎯 学习建议

1. **按顺序学习**: 从 Flexbox → Grid → 响应式 → 动画 → 变量
2. **打开 DevTools**: 使用浏览器开发者工具查看元素、修改样式
3. **动手修改**: 尝试修改代码参数，观察变化
4. **对比实验**: 同时打开多个示例，对比不同方案

## 📚 相关章节

- [主 README](../README.md) - CSS 的艺术与科学
- [练习题](../README.md#10-章节练习) - 实战练习

## ⚠️ 浏览器兼容性

- **Flexbox**: 所有现代浏览器支持
- **Grid**: 所有现代浏览器支持
- **Container Queries**: Chrome 105+, Safari 16+, Firefox 110+
- **CSS 变量**: 所有现代浏览器（IE 不支持）

## 💡 提示

- 所有示例都包含详细注释
- 建议配合主 README 阅读
- 每个示例都可以作为项目的起点
