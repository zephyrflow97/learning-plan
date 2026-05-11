# 第 6 章：CSS 的艺术与科学 —— 从约束中涌现的美

> **"The medium is the message."**  
> — Marshall McLuhan

CSS 不仅仅是"给网页化妆"的工具。它本身就是一种语言,一种声明式的、约束求解的语言。理解 CSS,就是理解"描述目标"和"命令过程"的根本区别。

当你写 `display: flex; justify-content: center; align-items: center;` 时,你并没有告诉浏览器"先把这个盒子放在这里,再移动那个盒子到那里"。你只是在描述一个目标状态:"我想让这些元素居中"。至于浏览器如何计算坐标、如何重排像素——那是约束求解引擎的事。

这种范式转换,是从命令式思维到声明式思维的第一课。如果你能理解 CSS,你就能理解 SQL、Prolog、React JSX——所有声明式系统的本质。

> 🎭 **The Drama: CSS 的身份危机**
>
> CSS 长期被嘲笑为"不是真正的编程语言"。但声明式范式恰恰是编程的高级形态。SQL 是声明式的,没人说 SQL 不是语言。CSS 的痛苦不是因为它太简单,而是因为它被误用了——**命令式思维的人试图用声明式工具解决问题,就像用筷子喝汤**。
>
> 2013 年,一个问题在 Stack Overflow 上被浏览了 150 万次:"如何在 CSS 中垂直居中一个元素?"。这个问题有至少 7 种解法,每种都有副作用。工程师们发明了 `clearfix` hack、负边距、绝对定位加 `transform`——这些都是用命令式思维在声明式语言中制造的补丁。
>
> 直到 Flexbox 出现,一行代码 `align-items: center` 解决了这个困扰了 20 年的问题。这不是技术的进步,这是范式的胜利。

## 📖 本章内容

1. [CSS 的哲学 —— 声明式思维](#1-css-的哲学--声明式思维)
2. [盒模型与布局基础](#2-盒模型与布局基础)
3. [Flexbox —— 一维布局的艺术](#3-flexbox--一维布局的艺术)
4. [Grid —— 二维布局的力量](#4-grid--二维布局的力量)
5. [响应式设计](#5-响应式设计)
6. [CSS 变量 —— 设计令牌的起源](#6-css-变量--设计令牌的起源)
7. [动画与过渡](#7-动画与过渡)
8. [CSS 架构思想](#8-css-架构思想)
9. [最佳实践与常见陷阱](#9-最佳实践与常见陷阱)
10. [章节练习](#10-章节练习)

---

## 💻 代码示例

本章包含 **8 个实用代码示例**，涵盖 Flexbox、Grid、响应式设计、CSS 变量和动画。

所有示例代码位于 [`examples/`](./examples/) 目录，包括：
- 🎯 **Flexbox 布局**: 导航栏、卡片网格、完美居中
- 🎯 **Grid 布局**: Dashboard、Holy Grail 经典布局
- 🎯 **CSS 变量**: 深色模式主题切换
- 🎯 **动画效果**: 加载动画
- 🎯 **响应式设计**: Media Queries 实战

**推荐学习方式**:
1. 📖 先阅读本章理论部分
2. 💻 然后查看 [`examples/`](./examples/) 中的代码示例
3. 🔨 在浏览器中打开并修改示例
4. 🎯 完成章节练习

→ [查看所有代码示例](./examples/README.md)

---

## 1. CSS 的哲学 —— 声明式思维

### 1.1 两种世界观的碰撞

在编程世界中,有两种根本不同的思维方式:

**命令式 (Imperative)**: "怎么做"
```javascript
// 命令式: 告诉计算机每一步该做什么
const div = document.getElementById('box');
div.style.position = 'absolute';
div.style.left = '50%';
div.style.top = '50%';
div.style.transform = 'translate(-50%, -50%)';
console.log('已手动计算并设置居中位置');
```

**声明式 (Declarative)**: "做什么"
```css
/* 声明式: 描述期望的结果 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

> ⚛️ **物理学类比: 牛顿 vs 拉格朗日**
>
> 在经典力学中,有两种等价但思维方式完全不同的体系:
>
> - **牛顿力学 (命令式)**: F = ma。你计算每一瞬间每个物体受到的力,然后推导出它的运动轨迹。这是"过程"。
> - **拉格朗日力学 (声明式)**: 最小作用量原理。你描述系统的约束条件和目标(能量最小化),大自然会自动找到满足约束的运动轨迹。这是"结果"。
>
> CSS 的布局引擎就像拉格朗日力学——你描述约束(宽度、对齐方式、间距),浏览器会自动求解出满足所有约束的布局方案。

### 1.2 CSS 的本质:约束求解系统

当你写下这样的 CSS:

```css
.box {
  width: 50%;
  max-width: 600px;
  min-width: 300px;
  margin: 0 auto;
}
```

你实际上在定义一个约束系统:
- 约束 1: 宽度是父容器的 50%
- 约束 2: 但不能超过 600px
- 约束 3: 也不能小于 300px
- 约束 4: 左右边距相等(居中)

浏览器的布局引擎会求解这个方程组,找出满足所有约束的唯一解(或最优解)。

> 🧠 **CS Master's Bridge: 约束满足问题 (CSP)**
>
> CSS 布局本质上是一个 **Constraint Satisfaction Problem (CSP)**。在 AI 课程中,你可能学过数独求解器或 N 皇后问题——它们都是 CSP。
>
> 浏览器的布局引擎使用了类似的算法:
> 1. **变量**: 每个盒子的宽、高、位置
> 2. **域**: 每个变量的可能取值范围
> 3. **约束**: CSS 规则(如 `width: 50%`, `display: flex`)
> 4. **求解**: 使用启发式搜索 + 约束传播算法找到一致解
>
> Flexbox 是一维线性约束系统,Grid 是二维矩阵约束系统。理解这一点,你就理解了为什么某些看似简单的布局需求在 CSS 中却很难实现——因为你试图表达的约束可能是**不可满足的 (Unsatisfiable)** 或**欠约束的 (Under-constrained)**。

### 1.3 为什么样式与结构要分离

在 Web 的早期,HTML 混杂了内容和样式:

```html
<!-- 1995 年的噩梦 -->
<font color="red" size="7">
  <center>
    <b>Welcome to my homepage!!!</b>
  </center>
</font>
```

这就像把建筑的结构图和装修方案画在同一张图纸上。当你想换个装修风格时,你得拆掉整栋楼重建。

CSS 的诞生(1996 年,Håkon Wium Lie 和 Bert Bos)带来了关注点分离:

```html
<!-- HTML: 结构与语义 -->
<h1 class="hero-title">Welcome to my homepage</h1>
```

```css
/* CSS: 视觉表现 */
.hero-title {
  color: #e63946;
  font-size: 3rem;
  text-align: center;
  font-weight: bold;
}
```

> 🌌 **The Big Picture: Unix 哲学的回响**
>
> "Do one thing and do well." —— Unix 哲学
>
> - HTML 的职责: 描述内容的**语义**(`<h1>` 是标题,`<nav>` 是导航)
> - CSS 的职责: 描述内容的**外观**(颜色、大小、位置)
> - JavaScript 的职责: 描述内容的**行为**(交互、动态更新)
>
> 这种分离不是为了遵循某种教条,而是为了**可维护性**。当你需要改版网站时,你只需要修改 CSS;当你需要重构逻辑时,你只需要修改 JS;当你需要改善 SEO 时,你只需要修改 HTML。
>
> 但请注意:这种分离在 React 时代受到了挑战(JSX 混合了 HTML 和 JS,CSS-in-JS 混合了 CSS 和 JS)。这不是倒退,而是**关注点分离维度的变化**——从"按技术类型分离"转向"按组件分离"。我们会在后续章节深入探讨这个话题。

---

## 2. 盒模型与布局基础

### 2.1 盒模型 (Box Model)

> 🎭 **The Drama: 盒子里的俄罗斯套娃**
>
> 在 CSS 的世界里,**一切皆盒子**。每个 HTML 元素都是一个矩形盒子,即使它看起来是圆的(`border-radius: 50%`),它仍然占据着一个矩形的空间。
>
> 更有趣的是,每个盒子实际上是四个嵌套的盒子:
> 1. **Content Box** (内容盒): 真正显示文字/图片的区域
> 2. **Padding Box** (内边距盒): Content 周围的缓冲区
> 3. **Border Box** (边框盒): Padding 周围的边框
> 4. **Margin Box** (外边距盒): Border 周围的透明空间
>
> 就像俄罗斯套娃,一层套一层。当你问"这个盒子的宽度是多少?"时,你必须先问清楚:"你说的是哪一层盒子?"

```css
.box {
  /* Content: 200px × 100px */
  width: 200px;
  height: 100px;
  
  /* Padding: 内边距,透明但占空间 */
  padding: 20px;
  
  /* Border: 边框 */
  border: 5px solid #333;
  
  /* Margin: 外边距,透明且不算在元素内 */
  margin: 10px;
}

/*
 * 问题: 这个盒子最终占据的总宽度是多少?
 * 
 * 在默认的 content-box 模型下:
 * 总宽度 = margin-left + border-left + padding-left + width + padding-right + border-right + margin-right
 *        = 10 + 5 + 20 + 200 + 20 + 5 + 10
 *        = 270px
 * 
 * 实际内容区宽度 = 200px
 * 
 * 这就是为什么你设置 width: 200px,但实际占据空间远大于 200px。
 */
```

### 2.2 box-sizing: 拯救盒模型的灾难

> ☠️ **历史的教训: IE 做对了什么**
>
> 在浏览器大战中,微软的 IE 被认为是标准的破坏者。但在盒模型上,**IE 的设计实际上比 W3C 标准更合理**。
>
> - **W3C 标准 (content-box)**: `width` 只包含内容区,padding 和 border 会额外增加总宽度。
> - **IE 怪异模式 (border-box)**: `width` 包含 padding 和 border,内容区自动收缩。
>
> 哪个更符合人类直觉?当你说"这个盒子宽 200px"时,你期望的是**整个盒子**宽 200px,而不是"内容区 + padding + border" 总共宽 250px。
>
> 2012 年,Paul Irish 写了一篇文章 "* { box-sizing: border-box } FTW",建议全局使用 `border-box`。这成为了现代 CSS 的标准实践。IE 赢了,只是晚了 15 年。

```css
/* ✅ 推荐: 全局设置 border-box */
*, *::before, *::after {
  box-sizing: border-box;
}

.box-border-box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
}

/*
 * 现在的行为:
 * - 总宽度 = 200px (包含 padding 和 border)
 * - 内容区宽度 = 200 - 20*2 - 5*2 = 150px
 * 
 * 这符合直觉: "我要一个 200px 宽的盒子",你得到的就是 200px。
 */
```

**对比:**

```css
/* ❌ 不推荐: content-box (默认值) */
.box-content {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
  /* 实际占据宽度: 200 + 40 + 10 = 250px */
}

/* ✅ 推荐: border-box */
.box-border {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
  /* 实际占据宽度: 200px */
}
```

### 2.3 Display: 盒子的性格

`display` 属性决定了元素的"性格"——它如何与周围元素相处,以及内部如何排列子元素。

```css
/* ========== 外部显示类型 (Outer Display Type) ========== */

/* Block: 独占一行,像个霸道总裁 */
.block {
  display: block;
  /* 
   * 行为:
   * - 独占一行(宽度默认 100%)
   * - 可以设置 width/height
   * - 垂直堆叠
   */
}

/* Inline: 随波逐流,像个顺从的员工 */
.inline {
  display: inline;
  /*
   * 行为:
   * - 与其他 inline 元素排成一行
   * - width/height 无效
   * - 只占据内容所需的空间
   * - padding/margin 的垂直方向不影响布局(但视觉上可见)
   */
}

/* Inline-Block: 外圆内方,最佳妥协 */
.inline-block {
  display: inline-block;
  /*
   * 行为:
   * - 外部像 inline(可以并排)
   * - 内部像 block(可以设置宽高)
   * - 常用于按钮、图标等
   */
}

/* ========== 内部显示类型 (Inner Display Type) ========== */

/* Flex: 一维布局系统(下一节详细讲解) */
.flex-container {
  display: flex;
  /* 子元素会变成 flex items,遵循 flex 布局规则 */
}

/* Grid: 二维布局系统 */
.grid-container {
  display: grid;
  /* 子元素会变成 grid items */
}

/* None: 消失,不留痕迹 */
.hidden {
  display: none;
  /* 
   * 元素完全从文档流中移除,不占空间
   * 对比: visibility: hidden (不可见但占空间,像隐形人)
   */
}
```

> ⚛️ **量子力学类比: 波粒二象性**
>
> `display` 属性实际上定义了**两个独立的特性**:
> 1. **Outer Display**: 元素相对于外部世界的行为(block/inline)
> 2. **Inner Display**: 元素内部如何排列子元素(flow/flex/grid)
>
> `display: flex` 其实是 `display: block flex` 的简写——外部是 block,内部是 flex。
> `display: inline-flex` 就是 `display: inline flex`——外部是 inline,内部是 flex。
>
> 就像光既是波也是粒子,CSS 盒子既有"对外性格"也有"对内规则"。

### 2.4 Position: 盒子的定位方式

```css
/* ========== Static: 默认值,遵循文档流 ========== */
.static {
  position: static;
  /* top/left/right/bottom 无效 */
}

/* ========== Relative: 相对于自己原本的位置偏移 ========== */
.relative {
  position: relative;
  top: 20px;    /* 相对于原位置向下移动 20px */
  left: 10px;   /* 相对于原位置向右移动 10px */
  /*
   * ⚠️ 注意:
   * - 原本占据的空间仍然保留(不脱离文档流)
   * - 其他元素不会填补它移动后留下的空白
   * - 常用于作为 absolute 子元素的定位上下文
   */
}

/* ========== Absolute: 相对于最近的非 static 祖先定位 ========== */
.absolute {
  position: absolute;
  top: 0;
  right: 0;
  /*
   * ⚠️ 行为:
   * - 脱离文档流(原本占据的空间被释放)
   * - 相对于最近的 position 不是 static 的祖先元素定位
   * - 如果找不到这样的祖先,就相对于 <html> 定位
   * 
   * 常见模式: 父元素设置 position: relative,子元素设置 position: absolute
   */
}

/* ========== Fixed: 相对于视口 (Viewport) 定位 ========== */
.fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
  /*
   * 用途: 固定导航栏、返回顶部按钮、悬浮广告(请不要做恶)
   * 
   * ⚠️ 注意:
   * - 脱离文档流
   * - 即使页面滚动,元素也不动(固定在屏幕上)
   * - 在移动端需要考虑 iOS Safari 的地址栏动态隐藏问题
   */
}

/* ========== Sticky: 粘性定位,最年轻的成员 ========== */
.sticky {
  position: sticky;
  top: 0;
  /*
   * 行为: 平时像 relative,滚动到阈值后变成 fixed
   * 
   * 示例: 表格标题在滚动时固定在顶部
   * 
   * ⚠️ 浏览器支持: IE 不支持,2017 年之后的浏览器支持良好
   */
}
```

> 🧰 **实战案例: 模态框居中**

```css
/* 半透明遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  /*
   * 为什么用 fixed?
   * - 需要覆盖整个视口
   * - 即使页面滚动,遮罩也要保持覆盖
   */
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  /*
   * 居中由父元素的 flex 布局实现
   * 不需要 position: absolute + transform: translate
   */
}
```

---

## 3. Flexbox —— 一维布局的艺术

> ⚛️ **核心隐喻: 排队理论 (Queueing Theory)**
>
> 想象一个机场安检口。旅客(元素)排成一行。
>
> - **主轴 (Main Axis)**: 队伍的方向(水平或垂直)
> - **交叉轴 (Cross Axis)**: 垂直于队伍的方向
> - **justify-content**: 安检员决定队伍的间距策略
>   - `flex-start`: 大家挤在队伍开头
>   - `flex-end`: 大家挤在队伍末尾
>   - `space-between`: 首尾贴边,中间均匀分布
>   - `space-around`: 每个人周围都有相等的空间
>   - `space-evenly`: 所有间隙都相等(最公平)
> - **align-items**: 让高个子和矮个子如何对齐
>   - `flex-start`: 顶部对齐(矮个子头顶齐平)
>   - `flex-end`: 底部对齐(脚底齐平)
>   - `center`: 中间对齐(腰带齐平)
>   - `stretch`: 拉伸到相同高度(强行长高)
> - **flex-grow**: 你告诉某人"如果有多余空间,你可以占更多"
> - **flex-shrink**: 你告诉某人"如果空间不够,你要牺牲一点"

### 3.1 Flex 容器属性

```css
.flex-container {
  display: flex;
  
  /* ========== 主轴方向 ========== */
  flex-direction: row;          /* 默认: 水平从左到右 */
  /* flex-direction: row-reverse;   水平从右到左 */
  /* flex-direction: column;        垂直从上到下 */
  /* flex-direction: column-reverse; 垂直从下到上 */
  
  /* ========== 换行 ========== */
  flex-wrap: nowrap;            /* 默认: 不换行,挤死也要排成一行 */
  /* flex-wrap: wrap;              允许换行 */
  /* flex-wrap: wrap-reverse;      换行,但反向 */
  
  /* ========== 主轴对齐 (水平对齐,如果是 row) ========== */
  justify-content: flex-start;  /* 默认: 靠左 */
  /* justify-content: flex-end;    靠右 */
  /* justify-content: center;      居中 */
  /* justify-content: space-between; 两端对齐,中间均分 */
  /* justify-content: space-around;  每个元素周围有相等空间 */
  /* justify-content: space-evenly;  所有间隙相等 */
  
  /* ========== 交叉轴对齐 (垂直对齐,如果是 row) ========== */
  align-items: stretch;         /* 默认: 拉伸填满容器高度 */
  /* align-items: flex-start;     顶部对齐 */
  /* align-items: flex-end;       底部对齐 */
  /* align-items: center;         垂直居中(最常用!) */
  /* align-items: baseline;       基线对齐(文本底线齐平) */
  
  /* ========== 多行对齐 (只在 flex-wrap: wrap 时有效) ========== */
  align-content: stretch;       /* 默认值 */
  /* align-content: flex-start;   */
  /* align-content: center;       */
  /* align-content: space-between; */
  
  /* ========== 间距 (现代方式,替代 margin) ========== */
  gap: 1rem;                    /* 元素之间的间距 */
  /* row-gap: 1rem;                行间距 */
  /* column-gap: 1rem;             列间距 */
}
```

### 3.2 Flex 子元素属性

```css
.flex-item {
  /* ========== 伸缩比例 ========== */
  flex-grow: 0;     /* 默认: 不占据多余空间 */
  flex-shrink: 1;   /* 默认: 空间不足时等比收缩 */
  flex-basis: auto; /* 默认: 基于内容大小 */
  
  /* 简写: flex: <grow> <shrink> <basis> */
  flex: 0 1 auto;   /* 默认值 */
  /* flex: 1;          等同于 flex: 1 1 0%(常用,平分空间) */
  /* flex: auto;       等同于 flex: 1 1 auto */
  /* flex: none;       等同于 flex: 0 0 auto(不伸缩) */
  
  /* ========== 单独对齐 (覆盖容器的 align-items) ========== */
  align-self: auto; /* 默认: 继承容器的 align-items */
  /* align-self: flex-start; */
  /* align-self: center; */
  
  /* ========== 顺序 (改变视觉顺序,不改变 DOM 顺序) ========== */
  order: 0;         /* 默认: 0,数字越小越靠前 */
}
```

> ⚠️ **Accessibility Warning: order 属性的危险**
>
> `order` 只改变视觉顺序,不改变 DOM 顺序。这意味着:
> - 键盘导航(Tab 键)仍然按照 DOM 顺序
> - 屏幕阅读器仍然按照 DOM 顺序读取
>
> **永远不要用 `order` 来修复错误的 HTML 结构**。如果你发现需要用 `order`,可能你的 HTML 顺序就错了。

### 3.3 实战案例

**案例 1: 经典的垂直水平居中**

```css
/* ✅ Flexbox 时代的解法 (一行代码) */
.center-everything {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  min-height: 100vh;       /* 占据全屏高度 */
}

/* ❌ 前 Flexbox 时代的噩梦 (2010 年之前) */
.old-school-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /*
   * 问题:
   * - 需要 position: absolute (脱离文档流)
   * - 需要知道父元素的 position 设置
   * - 需要理解 transform 的坐标系
   * - 代码量是 Flexbox 的 3 倍
   */
}
```

**案例 2: 响应式导航栏**

```css
.navbar {
  display: flex;
  justify-content: space-between; /* Logo 左,菜单右 */
  align-items: center;            /* 垂直居中 */
  padding: 1rem 2rem;
  background: #333;
  color: white;
}

.nav-menu {
  display: flex;
  gap: 2rem;                      /* 菜单项之间的间距 */
  list-style: none;
}

/* 移动端: 垂直堆叠 */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;       /* 改为垂直方向 */
    gap: 1rem;
  }
  
  .nav-menu {
    flex-direction: column;
    width: 100%;
  }
}
```

**案例 3: 卡片网格 (等高卡片)**

```css
.card-container {
  display: flex;
  flex-wrap: wrap;                /* 允许换行 */
  gap: 1.5rem;
}

.card {
  flex: 1 1 300px;                /* 最小宽度 300px,会伸缩 */
  /*
   * 解释:
   * - flex-grow: 1  (如果一行有多余空间,平分)
   * - flex-shrink: 1 (如果空间不足,等比收缩)
   * - flex-basis: 300px (基准宽度 300px)
   * 
   * 效果: 每行尽可能多地排列卡片,每张卡片宽度自动调整
   */
  
  display: flex;
  flex-direction: column;
  
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-content {
  flex: 1;                        /* 占据剩余空间 */
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  /* 不设置 flex,保持原始高度 */
}

/*
 * 关键点: 外层的 flex 让卡片等高,内层的 flex 让内容填充
 * 
 * 原理:
 * - 外层容器的 align-items 默认是 stretch
 * - 所有卡片会被拉伸到同一高度(最高卡片的高度)
 * - 内层 flex-direction: column 让内容和底部按钮正确排列
 */
```

> 🧠 **深入原理: Flex 的计算模型**
>
> Flexbox 的空间分配算法分为 4 个步骤:
>
> 1. **确定 flex-basis**: 每个 flex item 的初始主尺寸
> 2. **计算剩余空间**: 容器主尺寸 - 所有 flex-basis 之和 - gap
> 3. **分配剩余空间(如果为正)**:
>    - 按 `flex-grow` 比例分配
>    - 公式: `额外宽度 = 剩余空间 × (自己的 flex-grow / 所有 flex-grow 之和)`
> 4. **收缩空间(如果为负)**:
>    - 按 `flex-shrink` 比例收缩
>    - 但还要考虑 `flex-basis`(大的元素收缩得更多)
>
> 这就是为什么 `flex: 1` 不一定会让所有元素等宽——它只是等比分配**剩余空间**,而不是等比分配总空间。

---

## 4. Grid —— 二维布局的力量

> 🌌 **核心隐喻: 城市规划师 (Urban Planner)**
>
> 如果 Flexbox 是在一条街道上安排车位,Grid 就是俯瞰整座城市的规划师。
>
> - **网格线 (Grid Lines)**: 城市的街道网格
> - **网格轨道 (Grid Tracks)**: 两条网格线之间的空间(街区)
> - **网格单元 (Grid Cells)**: 最小的格子(地块)
> - **网格区域 (Grid Areas)**: 多个单元组成的区域(一栋建筑可以占多个地块)
>
> 你先画好街道网格(`grid-template-columns/rows`),然后安排每栋建筑占几个街区(`grid-column: span 2`)。Container Queries 就像是说"这栋楼内部的装修取决于楼的大小,而不是城市的大小"。

### 4.1 Grid 容器属性

```css
.grid-container {
  display: grid;
  
  /* ========== 定义列 ========== */
  grid-template-columns: 200px 1fr 2fr;
  /*
   * 创建 3 列:
   * - 第 1 列: 固定 200px
   * - 第 2 列: 1 份剩余空间
   * - 第 3 列: 2 份剩余空间 (是第 2 列的 2 倍宽)
   * 
   * fr (fraction) 单位:
   * - 专为 Grid 设计的单位
   * - 表示"剩余空间的分数"
   * - 计算时机: 减去固定尺寸(如 200px)后,再分配 fr
   */
  
  /* ========== 定义行 ========== */
  grid-template-rows: 100px auto 100px;
  /*
   * 创建 3 行:
   * - 第 1 行: 100px (头部)
   * - 第 2 行: auto (内容,自适应高度)
   * - 第 3 行: 100px (底部)
   */
  
  /* ========== 间距 ========== */
  gap: 1rem;                      /* 行间距和列间距都是 1rem */
  /* row-gap: 1rem; */
  /* column-gap: 2rem; */
  
  /* ========== 对齐 ========== */
  justify-items: stretch;         /* 默认: 单元格内容水平拉伸 */
  align-items: stretch;           /* 默认: 单元格内容垂直拉伸 */
  
  justify-content: start;         /* 整个网格在容器中的水平位置 */
  align-content: start;           /* 整个网格在容器中的垂直位置 */
}
```

**重复模式:**

```css
.grid-repeat {
  /* ❌ 繁琐写法 */
  grid-template-columns: 1fr 1fr 1fr 1fr;
  
  /* ✅ 使用 repeat() */
  grid-template-columns: repeat(4, 1fr);
  
  /* ✅ 混合使用 */
  grid-template-columns: 200px repeat(3, 1fr) 100px;
  /* 等同于: 200px 1fr 1fr 1fr 100px */
  
  /* ✅ 自动填充(响应式神器!) */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  /*
   * 魔法解释:
   * - auto-fill: 自动计算能放下多少列
   * - minmax(250px, 1fr): 每列最小 250px,最大 1fr
   * 
   * 效果: 浏览器宽度变化时,自动调整列数
   * - 宽度 1000px: 4 列 (每列 250px)
   * - 宽度 600px: 2 列 (每列 300px)
   * - 宽度 300px: 1 列 (拉伸到 300px)
   * 
   * 不需要任何媒体查询!
   */
}
```

### 4.2 Grid 子元素属性

```css
.grid-item {
  /* ========== 指定列位置 ========== */
  grid-column-start: 1;           /* 从第 1 条列线开始 */
  grid-column-end: 3;             /* 到第 3 条列线结束(占 2 列) */
  
  /* 简写 */
  grid-column: 1 / 3;             /* 等同于上面两行 */
  
  /* 更简洁的写法 */
  grid-column: span 2;            /* 占据 2 列 */
  
  /* ========== 指定行位置 ========== */
  grid-row: 1 / 3;                /* 占据第 1-2 行 */
  grid-row: span 2;               /* 占据 2 行 */
  
  /* ========== 单个元素对齐 ========== */
  justify-self: center;           /* 在单元格内水平居中 */
  align-self: center;             /* 在单元格内垂直居中 */
}
```

### 4.3 命名网格区域 (强大但容易被忽略的特性)

```css
.grid-layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 80px 1fr 60px;
  
  /* 用 ASCII 艺术定义布局! */
  grid-template-areas:
    "header  header  header"
    "sidebar content aside"
    "footer  footer  footer";
  /*
   * 每个字符串代表一行
   * 每个单词代表一个区域
   * 重复的单词会合并为一个区域
   * 
   * 这就像是在画草图,直观到哭!
   */
  
  gap: 1rem;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }

/* 响应式: 移动端改为单列 */
@media (max-width: 768px) {
  .grid-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "content"
      "sidebar"
      "aside"
      "footer";
  }
}

/*
 * ✨ 美在何处?
 * 
 * 1. 视觉化: 看代码就能想象出布局
 * 2. 语义化: 不用记网格线编号,用名字即可
 * 3. 响应式: 只需改变 grid-template-areas,区域自动重排
 */
```

### 4.4 实战案例

**案例 1: 圣杯布局 (Holy Grail Layout)**

```css
/* ✅ Grid 时代的解法 (9 行 CSS) */
.holy-grail {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  min-height: 100vh;
  gap: 1rem;
}

.header { grid-area: header; }
.nav    { grid-area: nav; }
.main   { grid-area: main; }
.aside  { grid-area: aside; }
.footer { grid-area: footer; }

/* ❌ Float 时代的噩梦 (2005-2012) */
.old-holy-grail {
  /* 需要:
   * - 负 margin 技巧
   * - clearfix hack
   * - 精确的宽度计算
   * - position: relative 层叠
   * 
   * 代码量 > 50 行,Bug 无数
   */
}
```

**案例 2: 图片画廊 (自适应瀑布流)**

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  /*
   * 自动响应式:
   * - 屏幕宽 1200px: 6 列
   * - 屏幕宽 800px: 4 列
   * - 屏幕宽 400px: 2 列
   * 
   * 不需要写任何媒体查询!
   */
}

.gallery-item {
  /* 可以让某些元素占据多个格子 */
}

.gallery-item.large {
  grid-column: span 2;
  grid-row: span 2;
}
```

**案例 3: Dashboard 布局**

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12 列网格系统 */
  gap: 1.5rem;
  padding: 1.5rem;
}

/* 不同组件占据不同列数 */
.widget-full    { grid-column: span 12; }  /* 占满整行 */
.widget-half    { grid-column: span 6; }   /* 占半行 */
.widget-third   { grid-column: span 4; }   /* 占 1/3 */
.widget-quarter { grid-column: span 3; }   /* 占 1/4 */

/* 可以混合使用 */
/*
 * 第 1 行: 1 个 full (12)
 * 第 2 行: 2 个 half (6 + 6)
 * 第 3 行: 3 个 third (4 + 4 + 4)
 * 第 4 行: 4 个 quarter (3 + 3 + 3 + 3)
 */

/* 响应式 */
@media (max-width: 768px) {
  .widget-half,
  .widget-third,
  .widget-quarter {
    grid-column: span 12; /* 移动端全部占满一行 */
  }
}
```

> 🧠 **Grid vs Flexbox: 何时用哪个?**
>
> | 场景 | 使用 | 原因 |
> |------|------|------|
> | 导航栏(一行排列) | Flexbox | 一维布局,需要灵活间距 |
> | 页面整体布局(头部/侧边栏/内容/底部) | Grid | 二维布局,需要对齐行和列 |
> | 卡片列表(自适应列数) | Grid | `repeat(auto-fill)` 魔法 |
> | 表单(标签和输入框) | Grid | 需要对齐标签列和输入框列 |
> | 按钮组 | Flexbox | 一维,需要居中和间距 |
> | 图片画廊(瀑布流) | Grid | 但可能需要 JS 库(CSS Grid 不支持不等高瀑布流) |
>
> **经验法则**:
> - **一维排列(一行或一列)** → Flexbox
> - **二维布局(行和列同时对齐)** → Grid
> - **内容决定布局(容器大小适应内容)** → Flexbox
> - **布局决定内容(内容填充预定义网格)** → Grid
>
> 但记住:**它们可以嵌套使用**。Grid 做外层布局,Flexbox 做内层组件布局。

---

## 5. 响应式设计

> 🎭 **The Drama: 一次编写,到处崩溃**
>
> 2007 年,iPhone 发布。Web 开发者突然发现,他们为 1024×768 桌面显示器精心设计的网站,在 320×480 的手机屏幕上完全崩溃了。
>
> 最初的解决方案是"移动端单独做一个网站"(`m.example.com`)。但这意味着两套代码、两次维护、两倍的 Bug。
>
> 2010 年,Ethan Marcotte 在一篇文章中提出了 **Responsive Web Design (响应式设计)** 的概念:
> - **流式网格 (Fluid Grids)**: 用百分比而非像素
> - **弹性图片 (Flexible Images)**: `max-width: 100%`
> - **媒体查询 (Media Queries)**: 根据屏幕尺寸调整样式
>
> 这不仅仅是技术的进步,这是设计哲学的转变——从"为设备设计"到"为内容设计"。

### 5.1 媒体查询 (Media Queries)

```css
/* ========== 基本语法 ========== */

/* 移动优先 (Mobile First) - 推荐 */
/* 默认样式是为小屏设计的 */
.container {
  width: 100%;
  padding: 1rem;
}

/* 平板及以上 */
@media (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

/* 桌面及以上 */
@media (min-width: 1024px) {
  .container {
    width: 960px;
  }
}

/* 大屏幕 */
@media (min-width: 1280px) {
  .container {
    width: 1200px;
  }
}

/*
 * 为什么推荐移动优先?
 * 
 * 1. 性能: 移动端通常网速慢,优先加载最小的样式
 * 2. 渐进增强: 基础体验优先,然后逐步增强
 * 3. 代码更简洁: 移动端样式通常更简单
 */

/* ========== 桌面优先 (Desktop First) - 不推荐 ========== */
.old-way {
  width: 1200px; /* 默认是桌面样式 */
}

@media (max-width: 1024px) {
  .old-way { width: 960px; }
}

@media (max-width: 768px) {
  .old-way { width: 100%; }
}
/*
 * 问题: 移动端要覆盖更多的样式,增加 CSS 大小
 */

/* ========== 其他媒体特性 ========== */

/* 横屏 */
@media (orientation: landscape) {
  .sidebar {
    display: flex;
  }
}

/* 竖屏 */
@media (orientation: portrait) {
  .sidebar {
    display: none;
  }
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
  }
}

/* 减少动画(无障碍) */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* 打印样式 */
@media print {
  .no-print {
    display: none;
  }
  
  body {
    color: black;
    background: white;
  }
}
```

**常见断点 (Breakpoints)**

```css
/* 基于常见设备的断点 */
/* 
 * 手机: < 640px
 * 平板: 640px - 1024px
 * 桌面: > 1024px
 */

/* Tailwind CSS 的断点体系 */
/* sm:  640px */
/* md:  768px */
/* lg:  1024px */
/* xl:  1280px */
/* 2xl: 1536px */

/* Bootstrap 的断点 */
/* xs: < 576px */
/* sm: 576px */
/* md: 768px */
/* lg: 992px */
/* xl: 1200px */
/* xxl: 1400px */

/*
 * ⚠️ 重要原则: 不要为设备设计,为内容设计
 * 
 * 断点应该由你的内容决定,而不是由 iPhone 的尺寸决定。
 * 如果你的导航栏在 850px 时开始换行,那 850px 就应该是你的断点。
 */
```

### 5.2 Container Queries (容器查询)

> 🌌 **The Big Picture: 从全局到局部的范式转换**
>
> 媒体查询的问题:**它们只关心视口 (Viewport) 的大小,不关心组件自己的容器大小**。
>
> 想象一个 `<Card>` 组件:
> - 在主区域,它有 800px 宽 → 应该显示为多列布局
> - 在侧边栏,它只有 300px 宽 → 应该显示为单列布局
>
> 但如果视口是 1200px,媒体查询会让两个卡片都用多列布局,导致侧边栏的卡片崩溃。
>
> **Container Queries 让组件根据自己容器的大小做决策**,而不是根据整个页面的大小。这是组件化时代的必然需求。

```css
/* ========== 定义容器 ========== */
.sidebar {
  container-type: inline-size; /* 监听宽度变化 */
  container-name: sidebar;     /* 可选: 给容器命名 */
}

/* ========== 容器查询 ========== */
@container sidebar (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@container sidebar (max-width: 399px) {
  .card {
    display: block;
  }
}

/*
 * 效果: .card 的布局取决于 .sidebar 的宽度,而非视口宽度
 * 
 * 同一个 .card 组件:
 * - 在宽侧边栏中: 两列布局
 * - 在窄侧边栏中: 单列布局
 * - 完全独立于页面宽度!
 */

/* ========== 容器查询单位 ========== */
.card-title {
  font-size: clamp(1.5rem, 5cqw, 3rem);
  /*
   * cqw: 容器宽度的 1%
   * cqh: 容器高度的 1%
   * cqi: 容器 inline 方向的 1%
   * cqb: 容器 block 方向的 1%
   * cqmin: min(cqi, cqb)
   * cqmax: max(cqi, cqb)
   */
}
```

> ⚠️ **浏览器支持 (2024 年)**
>
> Container Queries 在 2023 年才获得主流浏览器支持:
> - Chrome 105+ (2022-09)
> - Safari 16+ (2022-09)
> - Firefox 110+ (2023-02)
>
> 如果需要支持旧浏览器,使用 `@supports` 做渐进增强:
>
> ```css
> @supports (container-type: inline-size) {
>   /* Container Queries 代码 */
> }
> ```

### 5.3 响应式单位

```css
/* ========== 绝对单位 ========== */
.absolute {
  width: 100px;   /* 像素,不随任何东西变化 */
  width: 1in;     /* 英寸(很少用) */
  width: 1cm;     /* 厘米(很少用) */
}

/* ========== 相对单位 ========== */

/* em: 相对于父元素的 font-size */
.em-example {
  font-size: 16px;
}
.em-example .child {
  font-size: 1.5em;     /* 16 * 1.5 = 24px */
  padding: 1em;         /* 24px (相对于自己的 font-size) */
}
/*
 * ⚠️ em 的陷阱: 嵌套会累积
 * 
 * <div style="font-size: 16px">
 *   <div style="font-size: 1.5em"> <!-- 24px -->
 *     <div style="font-size: 1.5em"> <!-- 36px -->
 *       <div style="font-size: 1.5em"> <!-- 54px -->
 */

/* rem: 相对于根元素(<html>)的 font-size */
:root {
  font-size: 16px; /* 设置基准 */
}

.rem-example {
  font-size: 1.5rem;    /* 永远是 16 * 1.5 = 24px */
  padding: 1rem;        /* 永远是 16px */
  margin: 2rem;         /* 永远是 32px */
}
/*
 * ✅ rem 的优势: 不会累积,可预测
 * 
 * 全局字号调整:
 * 只需改变 :root { font-size },整个网站的间距和字号都会等比缩放
 */

/* ========== 视口单位 ========== */
.viewport-units {
  width: 100vw;         /* 视口宽度的 100% */
  height: 100vh;        /* 视口高度的 100% */
  font-size: 5vw;       /* 视口宽度的 5% */
}

/* ⚠️ 移动端的 vh 问题 */
/*
 * 在 iOS Safari 中,100vh 会包括地址栏的高度
 * 当地址栏隐藏时,内容会被截断
 * 
 * 解决方案: 使用 dvh (Dynamic Viewport Height)
 */
.mobile-safe {
  height: 100dvh;       /* 动态视口高度 */
  /* 或使用 svh (Small VH) / lvh (Large VH) */
}

/* ========== 百分比 ========== */
.percentage {
  width: 50%;           /* 父元素宽度的 50% */
  padding: 10%;         /* 父元素宽度的 10% (注意:不是高度!) */
}
/*
 * ⚠️ 诡异行为: padding/margin 的百分比永远相对于宽度,不是高度
 * 
 * 原因: 防止循环依赖
 * (如果 padding-top 相对于高度,而高度又受 padding 影响,就死循环了)
 */

/* ========== clamp(): 响应式的终极武器 ========== */
.responsive-text {
  font-size: clamp(1rem, 2.5vw, 2rem);
  /*
   * 语法: clamp(最小值, 首选值, 最大值)
   * 
   * 行为:
   * - 如果 2.5vw < 1rem,使用 1rem
   * - 如果 2.5vw > 2rem,使用 2rem
   * - 否则使用 2.5vw
   * 
   * 效果: 字号随视口变化,但有上下限
   * 不需要任何媒体查询!
   */
}

.responsive-spacing {
  padding: clamp(1rem, 5vw, 3rem);
  gap: clamp(0.5rem, 2vw, 1.5rem);
}
```

> 🧰 **单位选择指南**
>
> | 用途 | 推荐单位 | 原因 |
> |------|---------|------|
> | 字体大小 | `rem` | 用户可以调整浏览器默认字号 |
> | 间距(padding/margin) | `rem` | 随字号等比缩放,保持视觉平衡 |
> | 边框 | `px` | 1px 的边框就应该是 1px,不要缩放 |
> | 容器宽度 | `%`, `fr`, `vw` | 响应式布局 |
> | 响应式字号 | `clamp()` + `vw` | 流畅缩放,有上下限 |
> | 媒体查询断点 | `px` 或 `em` | `em` 会随用户字号调整(无障碍更好) |

---

## 6. CSS 变量 —— 设计令牌的起源

> ⚛️ **编程语言的演化: 从硬编码到符号**
>
> 在早期编程语言中,所有的值都是硬编码的:
> ```asm
> MOV AX, 42  ; 魔法数字,没人知道 42 代表什么
> ```
>
> 后来,我们发明了变量:
> ```c
> const int MAX_USERS = 42;  // 语义化,可复用
> ```
>
> CSS 经历了同样的演化:
> ```css
> /* 过去: 硬编码的噩梦 */
> .button { background: #3b82f6; }
> .link { color: #3b82f6; }
> .border { border-color: #3b82f6; }
> /* 
>  * 问题: 改品牌色需要全局搜索替换,容易漏,容易错
>  */
>
> /* 现在: CSS 变量 */
> :root {
>   --color-primary: #3b82f6;
> }
> .button { background: var(--color-primary); }
> .link { color: var(--color-primary); }
> /* 
>  * 修改一处,全局生效
>  */
> ```

### 6.1 CSS 自定义属性 (Custom Properties)

```css
/* ========== 定义变量 ========== */
:root {
  /* 颜色系统 */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  
  /* 中性色 */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-900: #111827;
  
  /* 间距系统 */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  
  /* 字体 */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', Consolas, monospace;
  
  /* 字号 */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  
  /* 圆角 */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  
  /* 动画时长 */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  
  /* 缓动函数 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ========== 使用变量 ========== */
.button {
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all var(--duration-base) var(--ease-out);
}

.button:hover {
  background: var(--color-primary-dark, #2563eb); 
  /* 
   * 第二个参数是回退值 (Fallback)
   * 如果 --color-primary-dark 不存在,使用 #2563eb
   */
}

/* ========== 作用域变量 ========== */
.card {
  --card-padding: var(--spacing-lg);
  --card-bg: white;
  
  padding: var(--card-padding);
  background: var(--card-bg);
}

.card.compact {
  --card-padding: var(--spacing-sm); /* 覆盖变量 */
}

/* ========== 动态计算 ========== */
.container {
  --container-width: 1200px;
  --gutter: 2rem;
  
  max-width: var(--container-width);
  padding-left: var(--gutter);
  padding-right: var(--gutter);
}

@media (max-width: 768px) {
  .container {
    --gutter: 1rem; /* 只需改变变量,不需要重写所有属性 */
  }
}
```

### 6.2 暗黑模式实现

```css
/* ========== 方案 1: 媒体查询自动检测 ========== */
:root {
  --bg: white;
  --text: #111;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111;
    --text: #f0f0f0;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}

/* ========== 方案 2: 类名切换(用户手动选择) ========== */
:root {
  --bg: white;
  --text: #111;
  --border: #e5e7eb;
}

:root.dark {
  --bg: #1a1a1a;
  --text: #f0f0f0;
  --border: #374151;
}

/* ========== 方案 3: data 属性(最灵活) ========== */
:root[data-theme="light"] {
  --color-bg: white;
  --color-text: black;
}

:root[data-theme="dark"] {
  --color-bg: #0d1117;
  --color-text: #c9d1d9;
}

:root[data-theme="high-contrast"] {
  --color-bg: black;
  --color-text: yellow;
}

/* JavaScript 切换:
 * document.documentElement.dataset.theme = 'dark';
 */
```

> 🧠 **CSS 变量 vs Sass 变量**
>
> | 特性 | CSS 变量 | Sass 变量 |
> |------|---------|----------|
> | 运行时修改 | ✅ 可以(通过 JS) | ❌ 编译时确定 |
> | 作用域 | ✅ 支持(继承) | ✅ 支持 |
> | 浏览器支持 | 现代浏览器(IE 不支持) | 编译后兼容所有 |
> | 性能 | 运行时计算 | 编译时替换(更快) |
> | 媒体查询内修改 | ✅ 可以 | ❌ 不可以 |
> | DevTools 调试 | ✅ 可见 | ❌ 已被替换 |
>
> **结论**: 现代项目推荐 CSS 变量。如果需要支持 IE,用 Sass 变量 + PostCSS 编译。

### 6.3 设计令牌 (Design Tokens)

> 🌌 **The Big Picture: 从设计到代码的桥梁**
>
> **设计令牌 (Design Tokens)** 是 Salesforce 在 2014 年提出的概念。它指的是**设计决策的原子化命名约定**。
>
> 传统流程:
> 1. 设计师在 Figma 里用 #3b82f6
> 2. 工程师在代码里硬编码 #3b82f6
> 3. 设计师说"这个蓝色太浅了,改成 #2563eb"
> 4. 工程师全局搜索替换,漏改了 3 处,产生 Bug
>
> 设计令牌流程:
> 1. 设计师定义 `color.primary.500 = #3b82f6`
> 2. 工程师使用 `var(--color-primary-500)`
> 3. 设计师修改设计令牌,自动同步到代码
> 4. 一处修改,全局生效

```css
/* ========== 设计令牌的层级体系 ========== */

/* Layer 1: 原始值 (Raw Values) */
:root {
  --blue-50: #eff6ff;
  --blue-100: #dbeafe;
  --blue-500: #3b82f6;
  --blue-900: #1e3a8a;
}

/* Layer 2: 语义化令牌 (Semantic Tokens) */
:root {
  --color-primary: var(--blue-500);
  --color-primary-light: var(--blue-100);
  --color-primary-dark: var(--blue-900);
}

/* Layer 3: 组件令牌 (Component Tokens) */
:root {
  --button-bg: var(--color-primary);
  --button-text: white;
  --button-hover-bg: var(--color-primary-dark);
}

.button {
  background: var(--button-bg);
  color: var(--button-text);
}

.button:hover {
  background: var(--button-hover-bg);
}

/*
 * 为什么需要三层?
 * 
 * 1. 原始值: 色板,不包含语义
 * 2. 语义化: 赋予颜色意义(primary/success/danger)
 * 3. 组件: 解耦组件和语义(按钮不直接依赖 "primary" 的定义)
 * 
 * 好处: 改变品牌色时,只需修改 Layer 2,Layer 3 自动更新
 */
```

---

## 7. 动画与过渡

> 🎭 **The Drama: 动画不是装饰,是沟通**
>
> 很多工程师认为动画是"锦上添花"的东西,可有可无。这是错误的。
>
> **动画是 UI 的润滑剂,是状态转换的叙事者**。
>
> 想象一个模态框:
> - 没有动画: 突然出现,像闪现,吓用户一跳
> - 有淡入动画: 从透明到不透明,告诉用户"这是新内容,但不要惊慌"
>
> 想象一个加载按钮:
> - 没有动画: 点击后无反应,用户疯狂点击
> - 有旋转动画: 告诉用户"我收到了,正在处理,请等待"
>
> **动画不是视觉效果,动画是信息传递**。

### 7.1 Transition (过渡)

```css
/* ========== 基本语法 ========== */
.button {
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  
  /* 单个属性过渡 */
  transition: background 0.3s ease;
  
  /* 多个属性过渡 */
  /* transition: background 0.3s ease, transform 0.2s ease; */
  
  /* 所有属性过渡(不推荐,性能差) */
  /* transition: all 0.3s ease; */
}

.button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px); /* 轻微上浮 */
}

.button:active {
  transform: translateY(0); /* 按下时回到原位 */
}

/* ========== Transition 属性详解 ========== */
.element {
  /* transition: <property> <duration> <timing-function> <delay> */
  
  /* property: 要过渡的属性 */
  transition-property: background, transform;
  
  /* duration: 持续时间 */
  transition-duration: 0.3s;
  
  /* timing-function: 缓动函数 */
  transition-timing-function: ease;
  /*
   * ease: 慢-快-慢(默认,最自然)
   * linear: 匀速(机械感,少用)
   * ease-in: 慢-快(启动)
   * ease-out: 快-慢(刹车,最常用)
   * ease-in-out: 慢-快-慢(和 ease 类似但更对称)
   * cubic-bezier(x1, y1, x2, y2): 自定义贝塞尔曲线
   */
  
  /* delay: 延迟 */
  transition-delay: 0s;
}

/* ========== 缓动函数对比 ========== */
.box-linear {
  transition: transform 1s linear;
}

.box-ease-out {
  transition: transform 1s ease-out; /* ✅ 推荐,感觉最自然 */
}

.box-custom {
  /* Material Design 的缓动曲线 */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ========== 可过渡的属性 ========== */
/*
 * ✅ 性能好(GPU 加速):
 * - transform (translate, rotate, scale)
 * - opacity
 * 
 * ⚠️ 性能中等:
 * - color, background-color
 * - box-shadow
 * - filter
 * 
 * ❌ 性能差(触发重排):
 * - width, height
 * - top, left, right, bottom
 * - padding, margin
 */

/* ========== 实战案例 ========== */

/* 卡片悬停效果 */
.card {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

/* 输入框焦点效果 */
.input {
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 导航链接下划线 */
.nav-link {
  position: relative;
  text-decoration: none;
  color: inherit;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.nav-link:hover::after {
  transform: scaleX(1);
}
```

> 🧠 **性能优化: 为什么 transform 和 opacity 快?**
>
> 浏览器渲染管线分为 5 个阶段:
> 1. **JS**: 执行 JavaScript
> 2. **Style**: 计算样式
> 3. **Layout**: 计算元素位置(重排/Reflow)
> 4. **Paint**: 绘制像素(重绘/Repaint)
> 5. **Composite**: 合成层
>
> 不同属性会触发不同阶段:
> - `width/height`: 触发 Layout + Paint + Composite (最慢)
> - `color/background`: 触发 Paint + Composite (中等)
> - `transform/opacity`: 只触发 Composite (最快,GPU 加速)
>
> **原理**: `transform` 和 `opacity` 的元素会被提升到**合成层 (Composite Layer)**,由 GPU 独立处理,不影响主线程的布局和绘制。
>
> **验证**: 在 Chrome DevTools 中打开 "Rendering" → "Layer borders",你会看到被提升的层有绿色边框。

### 7.2 Animation (关键帧动画)

```css
/* ========== 定义关键帧 ========== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 或者用百分比定义更复杂的动画 */
@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}

/* ========== 应用动画 ========== */
.fade-in {
  animation: fadeIn 0.5s ease-out;
  /* animation: <name> <duration> <timing-function> <delay> <iteration-count> <direction> <fill-mode> */
}

/* ========== 详细属性 ========== */
.animated {
  animation-name: fadeIn;              /* 动画名称 */
  animation-duration: 0.5s;            /* 持续时间 */
  animation-timing-function: ease-out; /* 缓动函数 */
  animation-delay: 0s;                 /* 延迟 */
  animation-iteration-count: 1;        /* 播放次数(infinite=无限) */
  animation-direction: normal;         /* 方向(normal/reverse/alternate) */
  animation-fill-mode: forwards;       /* 结束后的状态 */
  /*
   * fill-mode:
   * - none: 动画前后都不应用样式(默认)
   * - forwards: 保持最后一帧的样式
   * - backwards: 在 delay 期间应用第一帧样式
   * - both: forwards + backwards
   */
  animation-play-state: running;       /* 播放状态(running/paused) */
}

/* ========== 实战案例 ========== */

/* 加载旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 脉冲动画(提示用户注意) */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.notification-badge {
  animation: pulse 2s ease-in-out infinite;
}

/* 打字机效果 */
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typewriter {
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid;
  animation: 
    typing 3s steps(30) forwards,
    blink 0.75s step-end infinite;
}

/* 错误抖动 */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}

.input-error {
  animation: shake 0.5s ease-in-out;
}

/* 渐入从下方滑入(页面元素入场) */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-on-scroll {
  animation: slideInUp 0.6s ease-out forwards;
}

/* 延迟动画(瀑布流效果) */
.item:nth-child(1) { animation-delay: 0s; }
.item:nth-child(2) { animation-delay: 0.1s; }
.item:nth-child(3) { animation-delay: 0.2s; }
.item:nth-child(4) { animation-delay: 0.3s; }
```

### 7.3 性能优化与最佳实践

```css
/* ========== will-change: 性能提示 ========== */
.element-will-animate {
  will-change: transform, opacity;
  /*
   * 告诉浏览器: "这个元素即将发生变化,请提前优化"
   * 
   * 浏览器会:
   * 1. 提前创建合成层
   * 2. 预分配 GPU 资源
   * 3. 准备重绘缓冲区
   * 
   * ⚠️ 不要滥用!
   * - 只在动画开始前设置
   * - 动画结束后移除(避免浪费内存)
   * - 不要在所有元素上都用
   */
}

/* JavaScript 控制 will-change */
/*
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform';
});

element.addEventListener('mouseleave', () => {
  element.style.willChange = 'auto';
});
*/

/* ========== 减少动画(无障碍) ========== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
/*
 * 尊重用户的选择!
 * 
 * 在 macOS: System Preferences → Accessibility → Display → Reduce motion
 * 在 Windows: Settings → Ease of Access → Display → Show animations
 * 
 * 前庭功能障碍的用户会因为过多动画而感到眩晕恶心。
 * 这不仅是无障碍要求,也是人文关怀。
 */

/* ========== 性能最佳实践 ========== */

/* ✅ 好: 只动画 transform 和 opacity */
.good-animation {
  transition: transform 0.3s, opacity 0.3s;
}

.good-animation:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

/* ❌ 坏: 动画 width 触发重排 */
.bad-animation {
  transition: width 0.3s;
}

.bad-animation:hover {
  width: 300px; /* 每一帧都要重新计算整个页面的布局! */
}

/* ✅ 替代方案: 用 scaleX 模拟宽度变化 */
.better-animation {
  transform-origin: left;
  transition: transform 0.3s;
}

.better-animation:hover {
  transform: scaleX(1.5);
}
```

> 🧰 **动画设计原则**
>
> 1. **有目的性**: 每个动画都应该传递信息,不是为了炫技
> 2. **快速**: 大多数动画应该在 200-500ms 内完成
> 3. **自然**: 使用 `ease-out` 让动画像物理世界一样减速停止
> 4. **一致性**: 整个网站使用统一的动画时长和缓动函数
> 5. **可中断**: 用户应该能随时中断动画(如点击其他地方)
> 6. **性能优先**: 只动画 `transform` 和 `opacity`,避免动画 `width/height/top/left`
> 7. **无障碍**: 尊重 `prefers-reduced-motion`

---

## 8. CSS 架构思想

> 🧘 **Zen of Code: CSS 的熵增定律**
>
> CSS 是唯一一种**越写越乱**的语言。
>
> 在其他语言中,代码量和复杂度是线性关系。在 CSS 中,是指数关系。
>
> 为什么?
> 1. **全局命名空间**: 所有类名在同一个池子里,容易冲突
> 2. **级联**: 后来的规则会覆盖之前的,难以预测
> 3. **特异性**: `#id` > `.class` > `tag`,优先级战争
> 4. **副作用**: 改一处样式,可能影响全局
>
> **CSS 架构的核心目标,就是对抗熵增。**

### 8.1 CSS 命名方法论的演进

**阶段 1: 无架构时代(2000-2010)**

```css
/* ❌ 混乱的命名 */
.red { color: red; }
.big { font-size: 2rem; }
.left { float: left; }

<div class="red big left">...</div>

/*
 * 问题:
 * 1. 语义丧失(red 是颜色还是状态?)
 * 2. 维护困难(改设计要改 HTML)
 * 3. 没有命名空间(容易冲突)
 */
```

**阶段 2: BEM (Block Element Modifier, 2010)**

```css
/* ✅ BEM 命名约定 */
/* Block: 独立组件 */
.card { }

/* Element: 组件的子元素 */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier: 组件的变体 */
.card--featured { }
.card--compact { }

/* 组合使用 */
.card__header--highlighted { }

/*
 * 优点:
 * 1. 命名即文档(看类名就知道结构)
 * 2. 避免冲突(Block 作为命名空间)
 * 3. 低特异性(都是单类名)
 * 
 * 缺点:
 * 1. 类名很长(.card__header__title__icon)
 * 2. HTML 变丑
 * 3. 重构困难(改组件名要全局替换)
 */
```

```html
<!-- BEM 示例 -->
<div class="card card--featured">
  <div class="card__header">
    <h2 class="card__title">Title</h2>
  </div>
  <div class="card__body">
    <p class="card__text">Content</p>
  </div>
</div>
```

**阶段 3: CSS Modules (2015)**

```css
/* styles.module.css */
.card {
  /* 编译后变成 .styles_card_k3j2h1 */
}

.header {
  /* 编译后变成 .styles_header_a8s7d9 */
}
```

```jsx
// React 组件
import styles from './styles.module.css';

function Card() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>Header</div>
    </div>
  );
}

/*
 * 优点:
 * 1. 真正的作用域隔离(编译时生成唯一类名)
 * 2. 类名可以简短
 * 3. 不需要担心全局冲突
 * 
 * 缺点:
 * 1. 需要构建工具
 * 2. 难以覆盖第三方组件样式
 * 3. 调试时类名不可读
 */
```

**阶段 4: CSS-in-JS (2016)**

```jsx
// Styled Components
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
`;

const Header = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  /* 可以访问 props */
  color: ${props => props.primary ? 'blue' : 'black'};
`;

function App() {
  return (
    <Card>
      <Header primary>Title</Header>
    </Card>
  );
}

/*
 * 优点:
 * 1. 组件和样式完全封装
 * 2. 动态样式(基于 props/state)
 * 3. Dead Code Elimination(未使用的样式不会打包)
 * 4. 类型安全(TypeScript 支持)
 * 
 * 缺点:
 * 1. 运行时成本(需要在浏览器中生成样式)
 * 2. 增加 JS 包体积
 * 3. 学习曲线
 * 4. SSR 复杂度
 */
```

**阶段 5: Utility-First (Tailwind, 2017)**

```html
<!-- Tailwind CSS -->
<div class="bg-white p-4 rounded-lg shadow-md">
  <div class="text-xl font-bold text-gray-900">
    Title
  </div>
  <p class="text-gray-600 mt-2">
    Content
  </p>
</div>

<!--
优点:
1. 极快的开发速度(不需要写 CSS 文件)
2. 一致性(使用设计令牌)
3. 小的最终 CSS 文件(PurgeCSS)
4. 响应式简单(md:flex lg:grid)

缺点:
1. HTML 变"丑"(类名爆炸)
2. 学习曲线(需要记大量类名)
3. 自定义设计需要配置
4. 团队协作需要统一理解

争议:
"这不就是内联样式吗?"
→ 不,Tailwind 有响应式、伪类、设计约束
"HTML 和 CSS 不应该分离吗?"
→ 关注点分离的维度变了:不是按技术分离,而是按组件分离
-->
```

### 8.2 从语义化到实用化的思想演变

> 🎭 **The Drama: 语义化 CSS 的理想与现实**
>
> 2010 年代,CSS 社区的主流观点是"类名应该描述内容的语义,而非外观"。
>
> ```html
> <!-- ✅ "正确"的语义化 -->
> <button class="btn-primary">Click me</button>
>
> <!-- ❌ "错误"的表现层类名 -->
> <button class="blue-button">Click me</button>
> ```
>
> 理由:"如果哪天设计师说主按钮要改成红色,`.blue-button` 就变成谎言了"。
>
> 但实践中,我们发现:
> 1. **命名是困难的**: 为每个组件想一个"完美的语义名"消耗大量时间
> 2. **映射关系是脆弱的**: `.btn-primary` 对应哪些样式?需要在两个文件之间跳转
> 3. **抽象是有成本的**: 过度抽象导致维护困难
>
> Tailwind 的作者 Adam Wathan 在 2017 年写了一篇文章 "CSS Utility Classes and 'Separation of Concerns'",引发了思想革命:
>
> **"关注点分离"的真正含义不是"不同类型的代码放在不同文件",而是"不同功能的代码隔离"。**
>
> 在组件化时代,一个 `<Card>` 组件的 HTML、CSS、JS 逻辑是**高度内聚**的。把它们拆到三个文件里,并没有提高可维护性,反而增加了认知负荷——你需要在三个文件间跳来跳去才能理解一个组件。

**对比:**

```jsx
/* ❌ 传统方式: 三个文件 */

// Card.jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// Card.css
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
}
.card-body {
  padding: 1.5rem;
}

// Card.module.scss (如果用 BEM)
.card {
  &__header { ... }
  &__title { ... }
  &__body { ... }
}

/* ✅ Utility-First 方式: 一个文件 */

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

/*
 * 区别:
 * 1. 传统方式: 在 3 个文件之间跳转才能理解组件
 * 2. Utility 方式: 在一个文件里就能看到全部
 * 
 * 哪个更"关注点分离"?
 * 从"按技术分离"的角度,传统方式胜出。
 * 从"按组件分离"的角度,Utility 方式胜出。
 * 
 * 这不是对错,这是设计哲学的选择。
 */
```

### 8.3 Dead CSS 问题

> ☠️ **危险区域: 你的 CSS 文件中有多少行代码是死的?**
>
> 大型项目中,CSS 文件会不断膨胀,但没人敢删除旧样式——"万一还有地方在用呢?"
>
> 结果:
> - Bootstrap 完整版: 200KB+
> - 实际使用的: < 20KB
> - 浪费: 90%

**解决方案对比:**

| 方案 | 原理 | 效果 |
|------|------|------|
| PurgeCSS (Tailwind) | 扫描 HTML/JS,移除未使用的类 | 10KB 最终 CSS |
| CSS Modules | 只打包被 import 的样式 | 按需加载 |
| CSS-in-JS | 组件被删除,样式也被删除 | 零 Dead CSS |
| Critical CSS | 只内联首屏必需的 CSS | 提升首屏性能 |

---

## 9. 最佳实践与常见陷阱

### 9.1 ✅ 最佳实践

```css
/* ========== 1. 使用 CSS Reset/Normalize ========== */
/* 消除浏览器默认样式差异 */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ========== 2. 移动优先响应式 ========== */
/* 默认样式 = 移动端样式 */
.container {
  padding: 1rem;
}

/* 逐步增强到大屏 */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* ========== 3. 使用 CSS 变量实现主题 ========== */
:root {
  --color-primary: #3b82f6;
  --spacing-unit: 8px;
}

.button {
  background: var(--color-primary);
  padding: calc(var(--spacing-unit) * 2);
}

/* ========== 4. 避免过深的选择器嵌套 ========== */
/* ❌ 坏: 特异性过高,难以覆盖 */
.header .nav .menu .item a.active {
  color: red;
}

/* ✅ 好: 单一类名,低特异性 */
.nav-link-active {
  color: red;
}

/* ========== 5. 使用语义化的 HTML ========== */
/* ❌ 坏 */
<div class="header">
  <div class="nav">...</div>
</div>

/* ✅ 好 */
<header>
  <nav>...</nav>
</header>

/* ========== 6. 避免 !important ========== */
/* ❌ 坏: !important 是代码的口臭 */
.text {
  color: red !important;
}

/* ✅ 好: 提高选择器特异性 */
.container .text {
  color: red;
}

/* !important 的唯一合法使用场景: 覆盖第三方库样式 */
.react-datepicker__input {
  border: 2px solid blue !important;
}

/* ========== 7. 组织 CSS 文件 ========== */
/* 推荐顺序: */
/*
1. Variables
2. Reset/Normalize
3. Typography
4. Layout
5. Components
6. Utilities
7. States (hover, active, disabled)
8. Media Queries
*/

/* ========== 8. 命名约定 ========== */
/* 使用一致的命名方式(kebab-case 推荐) */
.user-profile { }        /* ✅ */
.user_profile { }        /* ⚠️ */
.userProfile { }         /* ❌ 不符合 CSS 惯例 */

/* ========== 9. 性能优化 ========== */
/* 只动画 transform 和 opacity */
.animate {
  transition: transform 0.3s, opacity 0.3s;
}

/* 使用 will-change 提示浏览器 */
.will-animate {
  will-change: transform;
}

/* ========== 10. 可访问性 ========== */
/* 提供焦点样式 */
a:focus,
button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 尊重用户设置 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111;
    --text: #f0f0f0;
  }
}
```

### 9.2 ☠️ 常见陷阱

**陷阱 1: Margin Collapse (外边距折叠)**

```css
/* ❌ 问题 */
.box-1 {
  margin-bottom: 20px;
}

.box-2 {
  margin-top: 30px;
}

/*
 * 你期望: box-1 和 box-2 之间有 50px 间距
 * 实际: 只有 30px (两个 margin 折叠,取最大值)
 * 
 * 原因: CSS 的 Margin Collapse 规则
 * 
 * 解决方案:
 * 1. 只用一个方向的 margin(如只用 margin-bottom)
 * 2. 使用 padding 代替
 * 3. 使用 Flexbox/Grid 的 gap
 */

/* ✅ 解决方案 */
.container {
  display: flex;
  flex-direction: column;
  gap: 30px; /* 不会折叠! */
}
```

**陷阱 2: 百分比 padding/margin 的诡异行为**

```css
.box {
  width: 200px;
  height: 100px;
  padding-top: 50%; /* 你期望 50px,实际是 100px! */
}

/*
 * ⚠️ 诡异规则: padding/margin 的百分比永远相对于宽度,不是高度
 * 
 * 原因: 防止循环依赖
 * 
 * 利用: 创建固定宽高比的容器
 */

/* 实用技巧: 16:9 视频容器 */
.video-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 9/16 = 0.5625 = 56.25% */
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

**陷阱 3: z-index 战争**

```css
/* ❌ z-index 失控 */
.modal { z-index: 9999; }
.tooltip { z-index: 99999; }
.dropdown { z-index: 999999; }

/*
 * 问题:
 * 1. z-index 只在同一个 stacking context 内有效
 * 2. 无节制的数字导致混乱
 * 
 * 解决方案: 使用分层系统
 */

/* ✅ 系统化的 z-index */
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-tooltip: 400;
  --z-notification: 500;
}

.modal {
  z-index: var(--z-modal);
}
```

**陷阱 4: 绝对定位脱离文档流**

```css
.container {
  /* 忘记设置 position: relative */
}

.child {
  position: absolute;
  top: 0;
  right: 0;
  /* 相对于整个页面定位,而不是 .container! */
}

/* ✅ 修复 */
.container {
  position: relative; /* 创建定位上下文 */
}

.child {
  position: absolute;
  top: 0;
  right: 0;
}
```

**陷阱 5: Flexbox 的 min-width: auto**

```css
.flex-container {
  display: flex;
}

.flex-item {
  /* 默认 min-width: auto */
  /* 如果内容很长,会撑破容器! */
}

/* ✅ 修复 */
.flex-item {
  min-width: 0; /* 允许缩小到 0 */
  overflow: hidden; /* 或者隐藏溢出内容 */
  text-overflow: ellipsis; /* 文字省略号 */
}
```

---

## 10. 章节练习

<details>
<summary><strong>练习 1: 实现一个完美居中的登录框</strong></summary>

**要求:**
- 在视口中垂直水平居中
- 宽度 400px(移动端 90%)
- 包含标题、两个输入框、一个按钮
- 使用 Flexbox

**提示:**
```css
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

**答案:**
```html
<!DOCTYPE html>
<html>
<head>
<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover {
  background: #5568d3;
}
</style>
</head>
<body>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Welcome Back</h2>
      <form>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" placeholder="••••••••">
        </div>
        <button type="submit" class="login-button">Sign In</button>
      </form>
    </div>
  </div>
</body>
</html>
```

</details>

<details>
<summary><strong>练习 2: 创建一个响应式卡片网格</strong></summary>

**要求:**
- 桌面: 3 列
- 平板: 2 列
- 手机: 1 列
- 使用 Grid 和 `repeat(auto-fill)`
- 卡片等高

**答案:**
```html
<!DOCTYPE html>
<html>
<head>
<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui;
  background: #f3f4f6;
  padding: 2rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #6b7280;
  line-height: 1.6;
  flex: 1;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-tag {
  background: #ede9fe;
  color: #7c3aed;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.card-date {
  color: #9ca3af;
  font-size: 0.875rem;
}
</style>
</head>
<body>
  <div class="grid-container">
    <!-- Card 1 -->
    <div class="card">
      <div class="card-image"></div>
      <div class="card-content">
        <h3 class="card-title">CSS Grid Layout</h3>
        <p class="card-description">
          Learn how to create powerful two-dimensional layouts with CSS Grid.
        </p>
      </div>
      <div class="card-footer">
        <span class="card-tag">Tutorial</span>
        <span class="card-date">2 days ago</span>
      </div>
    </div>
    
    <!-- Card 2-6: 复制上面的结构 -->
  </div>
</body>
</html>
```

</details>

<details>
<summary><strong>练习 3: 实现暗黑模式切换</strong></summary>

**要求:**
- 使用 CSS 变量
- 提供切换按钮
- 保存用户偏好到 localStorage

**答案:**
```html
<!DOCTYPE html>
<html>
<head>
<style>
:root {
  --bg: #ffffff;
  --text: #111827;
  --card-bg: #f9fafb;
  --border: #e5e7eb;
  --shadow: rgba(0,0,0,0.1);
}

:root.dark {
  --bg: #111827;
  --text: #f9fafb;
  --card-bg: #1f2937;
  --border: #374151;
  --shadow: rgba(0,0,0,0.5);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

body {
  font-family: system-ui;
  background: var(--bg);
  color: var(--text);
  padding: 2rem;
  min-height: 100vh;
}

.theme-toggle {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  background: var(--card-bg);
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text);
  box-shadow: 0 4px 6px var(--shadow);
}

.theme-toggle:hover {
  transform: scale(1.05);
}

.content {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px var(--shadow);
}
</style>
</head>
<body>
  <button class="theme-toggle" id="themeToggle">
    🌙 Toggle Theme
  </button>
  
  <div class="content">
    <div class="card">
      <h1>Dark Mode Example</h1>
      <p>Click the button to toggle between light and dark mode.</p>
    </div>
    
    <div class="card">
      <h2>Features</h2>
      <ul>
        <li>CSS Variables for theming</li>
        <li>LocalStorage persistence</li>
        <li>Smooth transitions</li>
      </ul>
    </div>
  </div>

  <script>
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  
  // 从 localStorage 加载主题
  const savedTheme = localStorage.getItem('theme') || 'light';
  root.className = savedTheme;
  updateButton(savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = root.className;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    root.className = newTheme;
    localStorage.setItem('theme', newTheme);
    updateButton(newTheme);
  });
  
  function updateButton(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
  </script>
</body>
</html>
```

</details>

<details>
<summary><strong>练习 4: 创建一个加载动画</strong></summary>

**要求:**
- 旋转的圆环
- 使用 CSS Animation
- 流畅的 60fps

**答案:**
```html
<!DOCTYPE html>
<html>
<head>
<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f3f4f6;
  font-family: system-ui;
}

.loader-container {
  text-align: center;
}

/* 方案 1: 旋转圆环 */
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 方案 2: 跳动的点 */
.dots {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 2rem 0;
}

.dot {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 方案 3: 进度条 */
.progress-bar {
  width: 200px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin: 2rem auto;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 70%;
    margin-left: 15%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}

.loading-text {
  color: #6b7280;
  margin-top: 1rem;
}
</style>
</head>
<body>
  <div class="loader-container">
    <div class="spinner"></div>
    
    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    
    <p class="loading-text">Loading...</p>
  </div>
</body>
</html>
```

</details>

<details>
<summary><strong>挑战练习: 实现一个完整的 Dashboard 布局</strong></summary>

**要求:**
- 固定顶部导航栏
- 侧边栏(可折叠)
- 主内容区使用 Grid 布局
- 响应式设计
- 包含卡片、图表占位符

```html
<!DOCTYPE html>
<html>
<head>
<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --sidebar-width: 250px;
  --header-height: 60px;
  --primary: #3b82f6;
}

body {
  font-family: system-ui;
  background: #f3f4f6;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  z-index: 100;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: var(--header-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 1rem;
  transition: transform 0.3s;
}

.sidebar-nav {
  list-style: none;
}

.sidebar-link {
  display: block;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
  transition: background 0.2s;
}

.sidebar-link:hover,
.sidebar-link.active {
  background: #eff6ff;
  color: var(--primary);
}

/* Main Content */
.main {
  margin-left: var(--sidebar-width);
  margin-top: var(--header-height);
  padding: 2rem;
}

/* Dashboard Grid */
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-full {
  grid-column: span 12;
}

.card-half {
  grid-column: span 6;
}

.card-third {
  grid-column: span 4;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

.chart-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .main {
    margin-left: 0;
  }
  
  .card-half,
  .card-third {
    grid-column: span 12;
  }
}
</style>
</head>
<body>
  <header class="header">
    <h1 class="header-title">Dashboard</h1>
  </header>
  
  <aside class="sidebar">
    <nav>
      <ul class="sidebar-nav">
        <li><a href="#" class="sidebar-link active">📊 Overview</a></li>
        <li><a href="#" class="sidebar-link">📈 Analytics</a></li>
        <li><a href="#" class="sidebar-link">👥 Users</a></li>
        <li><a href="#" class="sidebar-link">⚙️ Settings</a></li>
      </ul>
    </nav>
  </aside>
  
  <main class="main">
    <div class="dashboard">
      <!-- Stats Cards -->
      <div class="card card-third">
        <div class="card-title">Total Users</div>
        <div class="stat-value">24,568</div>
      </div>
      
      <div class="card card-third">
        <div class="card-title">Revenue</div>
        <div class="stat-value">$45,231</div>
      </div>
      
      <div class="card card-third">
        <div class="card-title">Growth</div>
        <div class="stat-value">+12.5%</div>
      </div>
      
      <!-- Chart Cards -->
      <div class="card card-half">
        <div class="card-title">Traffic Overview</div>
        <div class="chart-placeholder">Chart Placeholder</div>
      </div>
      
      <div class="card card-half">
        <div class="card-title">Revenue Breakdown</div>
        <div class="chart-placeholder">Chart Placeholder</div>
      </div>
      
      <!-- Full Width Table -->
      <div class="card card-full">
        <div class="card-title">Recent Orders</div>
        <div class="chart-placeholder">Table Placeholder</div>
      </div>
    </div>
  </main>
</body>
</html>
```

</details>

---

## 🧘 结语: CSS 的禅意

CSS 不是一种你"学会"就能掌握的技术。它是一种你需要**与之和解**的哲学。

当你停止把 CSS 当成"命令式语言"来使用,开始拥抱它的声明式本质时,你会发现:

- 垂直居中不再是噩梦,而是一行代码
- 响应式设计不再是噩梦,而是自然的流动
- 动画不再是性能杀手,而是信息的叙事者

**CSS 的美,在约束中涌现。**

Flexbox 的主轴和交叉轴、Grid 的网格线、媒体查询的断点——这些都是约束。但正是这些约束,让我们的布局**可预测、可维护、可扩展**。

在下一章,我们将学习 Tailwind CSS——一个将"约束即自由"这一哲学推向极致的框架。它不会让你写更少的代码,但会让你做更少的决策。

**记住: 最好的 CSS 代码,是你不需要写的 CSS 代码。**

---

**向前连接**: 在 [Stage 1 DOM 操作](../../stage-1-beginner/05-dom-basics/README.md) 中,你学会了如何用 JavaScript 选择和操作元素。现在,你理解了那些元素的视觉呈现是如何被 CSS 控制的。

**向后连接**: 在 [Stage Modern Frontend: Tailwind CSS](../../stage-modern-frontend/02-tailwind-css/README.md) 中,你将看到 CSS 架构思想的最新演化——从"语义化类名"到"实用优先"的范式转换,以及它如何在 2020 年代重新定义了前端开发的工作流程。

