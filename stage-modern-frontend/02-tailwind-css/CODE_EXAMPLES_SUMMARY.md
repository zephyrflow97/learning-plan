# Tailwind CSS 代码示例总结

本文档列出了所有已提取到独立文件的代码示例,避免 README 过长。

## 📂 所有示例文件

### 布局系统
| 示例 | 文件路径 | 难度 | 说明 |
|------|---------|------|------|
| **垂直居中卡片** | `examples/layouts/centered-card.html` | ⭐ | CSS 史上最难问题的 Flexbox 解决方案 |
| **仪表盘布局** | `examples/layouts/dashboard-layout.html` | ⭐⭐⭐ | Grid 布局构建管理后台 |

### 组件示例
| 示例 | 文件路径 | 难度 | 说明 |
|------|---------|------|------|
| **基础导航栏** | `examples/components/navbar.html` | ⭐ | Flexbox 水平布局 |
| **响应式导航栏** | `examples/components/responsive-navbar.html` | ⭐⭐⭐ | 汉堡菜单 + 暗黑模式 |
| **卡片网格** | `examples/components/card-grid.html` | ⭐⭐ | 响应式 Grid (1/2/3 列) |

### 主题系统
| 示例 | 文件路径 | 难度 | 说明 |
|------|---------|------|------|
| **暗黑模式切换** | `examples/themes/theme-toggle.html` | ⭐⭐ | localStorage + 系统主题感知 |

### 动画与交互
| 示例 | 文件路径 | 难度 | 说明 |
|------|---------|------|------|
| **交互式卡片** | `examples/animations/interactive-card.html` | ⭐⭐⭐ | group 交互 + 4 种动画效果 |

### 配置与扩展
| 示例 | 文件路径 | 难度 | 说明 |
|------|---------|------|------|
| **自定义配置** | `examples/config/tailwind.config.ts` | ⭐⭐ | 颜色、间距、动画等扩展 |

---

## 🚀 快速开始

### 1. 直接打开 HTML 文件
所有示例都使用 Tailwind CDN,无需安装,直接在浏览器中打开:

```bash
# Windows
start examples/layouts/centered-card.html

# macOS
open examples/layouts/centered-card.html

# Linux
xdg-open examples/layouts/centered-card.html
```

### 2. 使用 Live Server (推荐)
安装 VSCode 插件 "Live Server",右键 HTML 文件选择 "Open with Live Server"

### 3. 本地服务器
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# 然后访问 http://localhost:8000/examples/
```

---

## 📚 学习路径

### 🎯 初学者路线
1. `examples/layouts/centered-card.html` - 理解 Flexbox
2. `examples/components/navbar.html` - 水平布局
3. `examples/themes/theme-toggle.html` - 暗黑模式

### 🚀 进阶路线
1. `examples/layouts/dashboard-layout.html` - Grid 布局
2. `examples/components/responsive-navbar.html` - 响应式设计
3. `examples/animations/interactive-card.html` - 复杂交互

### 🏆 高级路线
1. `examples/config/tailwind.config.ts` - 自定义配置
2. 修改示例代码,添加自己的功能
3. 将 HTML 示例转换为 React/Vue 组件

---

## 💡 代码对应关系

### README 中的章节 → 对应的代码文件

| README 章节 | 示例代码 |
|------------|---------|
| **4.1 Flexbox 布局 - 导航栏** | `examples/components/navbar.html` |
| **4.1 Flexbox 布局 - 垂直居中** | `examples/layouts/centered-card.html` |
| **4.2 Grid 布局 - 仪表盘** | `examples/layouts/dashboard-layout.html` |
| **5.2 暗黑模式** | `examples/themes/theme-toggle.html` |
| **6.3 群组交互 (group)** | `examples/animations/interactive-card.html` |
| **7.1 配置文件** | `examples/config/tailwind.config.ts` |
| **练习 1: 响应式导航栏** | `examples/components/responsive-navbar.html` |
| **练习 2: 卡片网格** | `examples/components/card-grid.html` |
| **练习 4: 自定义品牌色** | `examples/config/tailwind.config.ts` |
| **练习 5: 交互卡片** | `examples/animations/interactive-card.html` |

---

## 🎨 代码特点

所有示例文件都包含:
- ✅ 完整的 HTML 结构 (使用 Tailwind CDN)
- ✅ 详细的注释说明
- ✅ console.log 日志输出
- ✅ 可独立运行,无需配置
- ✅ 响应式设计 (移动优先)

---

## 🔗 相关文档

- [examples/README.md](./examples/README.md) - 完整的示例索引
- [README.md](./README.md) - Tailwind CSS 章节主文档
- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)

---

**提示:** 所有超过 30 行的代码都已提取到独立文件,README.md 中只保留简化的代码片段和文件引用。
