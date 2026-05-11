# CSS 练习题答案

本目录包含 CSS Fundamentals 相关练习题的答案。

## 📋 练习题列表

### 1. Flexbox 三列布局
- **文件**: `01-flexbox-layout.html`
- **技术点**: Flexbox、响应式设计、Media Query
- **使用方法**: 直接在浏览器中打开 HTML 文件
- **关键概念**:
  - `display: flex` 创建弹性容器
  - `flex: 1` 占据剩余空间
  - `@media` 响应式断点
  - `flex-direction: column` 堆叠布局

### 2. Grid 响应式图片画廊
- **文件**: `02-grid-gallery.html`
- **技术点**: CSS Grid、auto-fit、minmax
- **使用方法**: 直接在浏览器中打开 HTML 文件
- **关键概念**:
  - `display: grid` 创建网格容器
  - `repeat(auto-fit, minmax(200px, 1fr))` 自动响应式
  - `aspect-ratio` 固定宽高比
  - `object-fit: cover` 图片填充

---

## 🎯 学习要点

### Flexbox vs Grid
- **Flexbox**: 一维布局(行或列)
- **Grid**: 二维布局(行和列)
- **选择原则**: 简单的行/列布局用 Flexbox,复杂的二维布局用 Grid

### 响应式设计
- **Media Query 方式**: 明确控制断点
- **Grid 自动响应**: `auto-fit` + `minmax()` 无需 Media Query

### 性能优化
- 使用 `transform` 而非 `top/left` 做动画
- `will-change` 提示浏览器优化
- 避免在动画中触发重排(reflow)

---

## 🔗 相关资源

- [CSS Flexbox Guide - CSS-Tricks](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Grid Guide - CSS-Tricks](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [MDN Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [MDN Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
