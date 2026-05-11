# 第 5 章:DOM 操作基础

在本章中,你将学习如何使用 JavaScript 操作网页的 DOM(文档对象模型)。你将掌握选择元素、修改内容和样式、处理事件、动态创建元素以及使用浏览器存储 API。

## 📖 本章内容

1. [什么是 DOM](#1-什么是-dom)
2. [选择元素](#2-选择元素)
3. [修改元素](#3-修改元素)
4. [创建和删除元素](#4-创建和删除元素)
5. [事件处理](#5-事件处理)
6. [样式操作](#6-样式操作)
7. [表单处理](#7-表单处理)
8. [浏览器存储](#8-浏览器存储)
9. [渲染管线](#9-渲染管线)
10. [最佳实践](#10-最佳实践)
11. [章节练习](#11-章节练习)

---

## 1. 什么是 DOM

### 1.1 DOM 简介

> **🌳 The Metaphor: The Tree of Life**
> DOM (Document Object Model) 是网页的**生命之树**。
> HTML 代码只是这棵树的 DNA（蓝图），而 DOM 是它生长出来的实体。
> 每一个标签（Tag）都是树上的一个果实（Node）。
> 就像园丁修剪枝叶一样，JavaScript 通过 DOM API 对这棵树进行修剪、嫁接、采摘。
> 但请记住：**修剪树木是累人的活**（操作 DOM 很慢），不要没事就拿剪刀乱剪。

**DOM (Document Object Model)** 是 HTML 文档的编程接口。它将网页表示为一个树状结构,每个节点都是一个对象,代表文档的一部分。

> **🎓 CS Perspective: DOM as an N-ary Tree**
>
> 对于 CS Master 来说，DOM 本质上就是一个 **N-ary Tree (N 叉树)** 数据结构。
> *   **Nodes**: 每个 HTML 标签都是树的一个节点。
> *   **Edges**: 父子关系 (Parent-Child relationship)。
> *   **Root**: `document` 对象 (对应 `<html>`)。
>
> 但 DOM 并不是普通的 JS 对象。它是 **Host Objects**。
> *   在 Chrome V8 中，普通的 JS 对象都在 V8 的 Heap 中。
> *   但 DOM 节点实际上是 **C++ 对象** (WebCore/Blink 引擎中的 C++ 类实例) 的包装器 (Wrapper)。
> *   当你访问 `div.style.width` 时，实际上是跨越了 **JS/C++ Boundary**，调用了底层的 C++ 函数。这就是为什么频繁操作 DOM 会慢的原因 —— **Context Switch Overhead**。
>
> > **🎭 The Drama: The Great Divide (柏林墙)**
> > 想象一下，V8 引擎（JS）和渲染引擎（Blink/WebCore）是两个语言不通的国家。
> > *   **JS 引擎**：住在内存堆里的嬉皮士，崇尚自由（动态类型），随心所欲。
> > *   **渲染引擎**：住在 C++ 堆里的德国工程师，严谨、刻板、追求极致的性能。
> > DOM API 就是这两个国家之间的**海关**。
> > 每次你写 `document.getElementById`，就像是派了一个外交官穿过边境去办事。
> > 如果你写了一个循环频繁操作 DOM，就像是让外交官在边境线上反复横跳。海关官员（浏览器）会愤怒地把你的护照扔在地上，然后你的页面就卡顿了（Jank）。
> > **React/Vue 的本质，就是在这个边境线上建立了一个"保税区" (Virtual DOM)，把所有的交易先在保税区里批量处理好，然后一次性通关。**

```
Document
  └── html
      ├── head
      │   ├── title
      │   └── meta
      └── body
          ├── h1
          ├── p
          └── div
              ├── span
              └── button
```

### 1.2 DOM 基本概念

```javascript
/**
 * DOM 基本概念
 */

console.log('=== DOM 基本概念 ===\n');

// document 对象 - DOM 的入口
console.log('document 对象类型:', typeof document);

// 常用属性
console.log('文档标题:', document.title);
console.log('URL:', document.URL);
console.log('域名:', document.domain);

// document.body - body 元素
console.log('\nbody 元素:', document.body);

// document.head - head 元素
console.log('head 元素:', document.head);

// 文档准备状态
console.log('\n文档状态:', document.readyState);
// 'loading' - 正在加载
// 'interactive' - 已加载,但资源还在加载
// 'complete' - 完全加载
```

---

## 2. 选择元素

### 2.1 基本选择方法

> **🔎 The Metaphor: The Detective's Tools**
> *   `getElementById`: 像是**指纹识别**。ID 是唯一的，所以这是最快、最精准的查找方式。
> *   `getElementsByClassName`: 像是**喊名字**。“姓‘王’的都站出来！”你会得到一群人（HTMLCollection）。
> *   `querySelector`: 像是**狙击手的瞄准镜**。你可以用极其复杂的 CSS 选择器（`.container > ul li.active`）精准定位到某一个元素。虽然慢一点（解析选择器需要时间），但极其强大。

```javascript
/**
 * 选择 DOM 元素
 */

console.log('\n=== 选择元素 ===\n');

// getElementById - 通过 ID 选择(最快)
const header = document.getElementById('header');
console.log('通过 ID 选择:', header);

// getElementsByClassName - 通过类名选择(返回 HTMLCollection)
const items = document.getElementsByClassName('item');
console.log('通过类名选择:', items);
console.log('数量:', items.length);

// getElementsByTagName - 通过标签名选择
const paragraphs = document.getElementsByTagName('p');
console.log('通过标签选择:', paragraphs);

// ⚠️ 注意: HTMLCollection 是类数组对象,不是真正的数组
// 转换为数组
const itemsArray = Array.from(items);
console.log('转换为数组:', itemsArray);

/*
 * 🔧 Under the Hood: Live vs Static Collections
 * 
 * getElementsByClassName 返回的是 HTMLCollection，它是 "Live" (动态) 的。
 * 如果你删除了 DOM 中的一个元素，HTMLCollection 会自动更新长度。
 * 这就像是一个 C++ 指针的动态视图。
 * 
 * querySelectorAll 返回的是 NodeList，通常是 "Static" (静态) 的 (快照)。
 * 即使 DOM 变了，它也不会变。
 * 
 * 陷阱: 在循环中遍历 Live Collection 并删除元素会导致 "Index Shift" Bug。
 * 解决方案: 总是先转换为 Array (快照)。
 */
```

### 2.2 现代选择方法(推荐)

```javascript
/**
 * querySelector 和 querySelectorAll
 * 使用 CSS 选择器语法
 */

console.log('\n=== 现代选择方法 ===\n');

// querySelector - 选择第一个匹配元素
const firstItem = document.querySelector('.item');
console.log('第一个 .item:', firstItem);

const firstButton = document.querySelector('button');
console.log('第一个 button:', firstButton);

// querySelectorAll - 选择所有匹配元素(返回 NodeList)
const allItems = document.querySelectorAll('.item');
console.log('所有 .item:', allItems);

// NodeList 可以直接使用 forEach
allItems.forEach((item, index) => {
  console.log(`  项目 ${index + 1}:`, item.textContent);
});

// 复杂选择器
const specific = document.querySelector('#container > .item:first-child');
console.log('复杂选择器:', specific);

// 多个选择器
const multiple = document.querySelectorAll('.item, .card, .box');
console.log('多个选择器:', multiple.length);

// 属性选择器
const withDataAttr = document.querySelectorAll('[data-id]');
console.log('有 data-id 属性的元素:', withDataAttr);
```

### 2.3 遍历 DOM 树

```javascript
/**
 * 遍历 DOM 树
 */

console.log('\n=== 遍历 DOM 树 ===\n');

const element = document.querySelector('.item');

if (element) {
  console.log('当前元素:', element);
  
  // 父元素
  console.log('父元素:', element.parentElement);
  console.log('父节点:', element.parentNode);
  
  // 子元素
  console.log('子元素:', element.children); // HTMLCollection
  console.log('第一个子元素:', element.firstElementChild);
  console.log('最后一个子元素:', element.lastElementChild);
  
  // 兄弟元素
  console.log('上一个兄弟:', element.previousElementSibling);
  console.log('下一个兄弟:', element.nextElementSibling);
  
  // 检查元素
  console.log('是否匹配选择器:', element.matches('.item')); // true
  console.log('最近的匹配:', element.closest('.container'));
}
```

---

## 3. 修改元素

### 3.1 修改内容

> **🦋 The Chaos Theory: The Butterfly Effect**
> 在 DOM 的世界里，**蝴蝶效应**是真实存在的。
> 当你修改了一个 `div` 的 `width`，你以为你只是改了一个属性？
> **错。**
> 你可能改变了它的子元素的换行方式，进而改变了父元素的高度，进而改变了兄弟元素的位置，甚至导致整个页面的滚动条出现，强制整个文档重新布局。
> 这就是 **Layout Thrashing (布局抖动)**。
> 浏览器就像一个强迫症患者，一旦发现几何属性变了，它就必须把所有受影响的元素重新算一遍。
> 所以，不要在循环里读写 DOM。这就像是在告诉强迫症患者：“把地扫干净”，等他刚扫完，你又扔了一片纸屑，说“再扫一遍”。他会崩溃的。

```javascript
/**
 * 修改元素内容
 */

console.log('\n=== 修改内容 ===\n');

const paragraph = document.querySelector('p');

if (paragraph) {
  console.log('原始内容:', paragraph.textContent);
  
  // textContent - 纯文本(推荐)
  paragraph.textContent = '这是新的文本内容';
  console.log('textContent 修改后:', paragraph.textContent);
  
  // innerHTML - HTML 内容
  paragraph.innerHTML = '这是 <strong>加粗</strong> 的文本';
  console.log('innerHTML 修改后:', paragraph.innerHTML);
  
  // ⚠️ 安全警告: innerHTML 可能导致 XSS 攻击
  // 不要直接插入用户输入的内容
  const userInput = '<img src=x onerror=alert("XSS")>';
  // paragraph.innerHTML = userInput; // ❌ 危险!
  paragraph.textContent = userInput; // ✅ 安全
  
  // innerText vs textContent 的区别
  console.log('\ninnerText:', paragraph.innerText); // 考虑样式,不包含隐藏元素
  console.log('textContent:', paragraph.textContent); // 包含所有文本

  /*
   * 🔧 Under the Hood: Reflow vs Repaint
   * 
   * 当你修改 DOM 时，浏览器需要重新计算布局和绘制。
   * 
   * 1. Reflow (重排/回流): 当你修改布局属性 (width, height, margin, display) 时触发。
   *    浏览器必须重新计算 Render Tree 中受影响部分的几何形状。这非常昂贵 (CPU 密集)。
   *    读取某些属性 (offsetWidth, scrollTop) 也会强制触发 Reflow (同步布局抖动)。
   * 
   * 2. Repaint (重绘): 当你修改外观属性 (color, background-color, visibility) 时触发。
   *    浏览器只需要重新绘制像素，不需要重新计算几何形状。比 Reflow 便宜。
   * 
   * 💡 Optimization: 尽量使用 classList 批量修改样式，而不是逐行修改 style 属性。
   *
   * > **🦋 The Chaos Theory: The Butterfly Effect**
   * > 在 DOM 的世界里，混沌理论是真实存在的。
   * > 当你修改了一个 `div` 的 `width`，你以为你只是改了一个属性？
   * > **错。**
   * > 你可能改变了它的子元素的换行方式，进而改变了父元素的高度，进而改变了兄弟元素的位置，甚至导致整个页面的滚动条出现，强制整个文档重新布局。
   * > 这就是 **Layout Thrashing (布局抖动)**。
   * > 浏览器就像一个强迫症患者，一旦发现几何属性变了，它就必须把所有受影响的元素重新算一遍。
   * > 所以，不要在循环里读写 DOM。这就像是在告诉强迫症患者：“把地扫干净”，等他刚扫完，你又扔了一片纸屑，说“再扫一遍”。他会崩溃的。
   */
}
```

### 3.2 修改属性

```javascript
/**
 * 修改元素属性
 */

console.log('\n=== 修改属性 ===\n');

const link = document.querySelector('a');

if (link) {
  console.log('原始链接:', link);
  
  // 获取属性
  console.log('href:', link.getAttribute('href'));
  console.log('title:', link.getAttribute('title'));
  
  // 设置属性
  link.setAttribute('href', 'https://example.com');
  link.setAttribute('target', '_blank');
  link.setAttribute('title', '新标题');
  
  console.log('修改后的 href:', link.href);
  
  // 删除属性
  link.removeAttribute('title');
  
  // 检查属性
  console.log('是否有 target:', link.hasAttribute('target')); // true
  
  // 直接访问属性(常用属性)
  link.href = 'https://another.com';
  link.className = 'active link';
  link.id = 'main-link';
  
  console.log('最终链接:', link.href);
}

// data 属性
const item = document.querySelector('[data-id]');

if (item) {
  console.log('\ndata 属性:');
  
  // 读取 data-* 属性
  console.log('data-id:', item.dataset.id);
  console.log('data-name:', item.dataset.name);
  
  // 设置 data-* 属性
  item.dataset.status = 'active';
  item.dataset.createdAt = '2024-01-01';
  
  console.log('所有 data 属性:', item.dataset);
}
```

---

## 4. 创建和删除元素

### 4.1 创建元素

> **🏗️ The Metaphor: The Construction Site**
> *   `createElement`: 就像在工厂里**预制**了一块砖头。此时它还只存在于你的卡车上（内存），不在楼房上（页面）。
> *   `appendChild`: 就像把砖头真正**砌**到了墙上。
> *   **DocumentFragment**: 就像是一个**托盘**。如果你要砌 100 块砖，不要一块一块地往楼上搬（触发 100 次重绘）。把 100 块砖先码在托盘上，然后一次性用起重机吊上去（只触发 1 次重绘）。这是 DOM 操作性能优化的核心心法。

```javascript
/**
 * 创建新元素
 */

console.log('\n=== 创建元素 ===\n');

// 创建元素
const newDiv = document.createElement('div');
console.log('创建 div:', newDiv);

// 设置属性和内容
newDiv.className = 'new-item';
newDiv.id = 'item-new';
newDiv.textContent = '这是新创建的元素';

// 设置样式
newDiv.style.backgroundColor = '#f0f0f0';
newDiv.style.padding = '10px';
newDiv.style.margin = '10px';

console.log('配置后的元素:', newDiv);

// 将元素添加到 DOM
const container = document.querySelector('#container');

/*
 * 🎓 CS Perspective: Double Buffering with DocumentFragment
 * 
 * 在图形编程中，为了避免屏幕闪烁，我们通常在后台 Buffer 中绘制，画好了一次性 Swap 到前台。
 * 
 * DocumentFragment 就是 DOM 世界的 "Back Buffer"。
 * 它是一个轻量级的 DOM 节点，但不是真实 DOM 树的一部分。
 * 
 * 1. 创建 Fragment。
 * 2. 在 Fragment 中进行多次 DOM 操作 (append, modify)。此时不会触发 Reflow。
 * 3. 将 Fragment 一次性 append 到真实 DOM。只触发一次 Reflow。
 */

if (container) {
  // appendChild - 添加到末尾
  container.appendChild(newDiv);
  console.log('已添加到容器');
  
  // prepend - 添加到开头
  const firstDiv = document.createElement('div');
  firstDiv.textContent = '我是第一个';
  container.prepend(firstDiv);
  
  // 在特定位置插入
  const middleDiv = document.createElement('div');
  middleDiv.textContent = '我在中间';
  
  const referenceNode = container.children[1];
  container.insertBefore(middleDiv, referenceNode);
  
  console.log('容器子元素:', container.children);
}

// 创建复杂元素
console.log('\n创建复杂元素:');

const article = document.createElement('article');
article.className = 'article-card';

const title = document.createElement('h2');
title.textContent = '文章标题';

const content = document.createElement('p');
content.textContent = '这是文章内容...';

const button = document.createElement('button');
button.textContent = '阅读更多';
button.className = 'btn btn-primary';

// 组装元素
article.appendChild(title);
article.appendChild(content);
article.appendChild(button);

console.log('创建的文章卡片:', article);

// 使用 innerHTML 创建(更快,但要注意安全)
const cardHTML = `
  <div class="card">
    <h3>卡片标题</h3>
    <p>卡片内容</p>
    <button>按钮</button>
  </div>
`;

const tempContainer = document.createElement('div');
tempContainer.innerHTML = cardHTML;
const card = tempContainer.firstElementChild;

console.log('通过 HTML 创建:', card);
```

### 4.2 删除和替换元素

```javascript
/**
 * 删除和替换元素
 */

console.log('\n=== 删除和替换元素 ===\n');

const itemToRemove = document.querySelector('.item-to-remove');

if (itemToRemove) {
  console.log('待删除元素:', itemToRemove);
  
  // 删除元素 - 现代方法
  itemToRemove.remove();
  console.log('已删除(使用 remove)');
  
  // 旧方法(需要父元素)
  // itemToRemove.parentElement.removeChild(itemToRemove);
}

// 替换元素
const oldElement = document.querySelector('.old');
const newElement = document.createElement('div');
newElement.className = 'new';
newElement.textContent = '新元素';

if (oldElement) {
  // 现代方法
  oldElement.replaceWith(newElement);
  console.log('已替换');
  
  // 旧方法
  // oldElement.parentElement.replaceChild(newElement, oldElement);
}

// 清空容器
const containerToClear = document.querySelector('#to-clear');

if (containerToClear) {
  console.log('\n清空容器前子元素数:', containerToClear.children.length);
  
  // 方法1: innerHTML
  containerToClear.innerHTML = '';
  
  // 方法2: 循环删除
  // while (containerToClear.firstChild) {
  //   containerToClear.removeChild(containerToClear.firstChild);
  // }
  
  console.log('清空后子元素数:', containerToClear.children.length);
}
```

---

## 5. 事件处理

### 5.1 添加事件监听器

> **👂 The Metaphor: The Spy Network**
> `addEventListener` 就像是在 DOM 节点上安插了**间谍**（Listener）。
> 间谍潜伏在那里，平时不说话。
> 一旦目标（Element）发生了特定动作（Event，如点击、输入），间谍就会立刻通过无线电（Callback）向总部汇报。
> 你可以给同一个目标安插多个间谍，也可以随时撤回间谍（`removeEventListener`）。
> **内存泄漏警示**: 如果你撤销了目标（删除了 DOM 节点），但忘记撤回间谍，间谍会一直像幽灵一样留在内存里，等待一个永远不会再出现的上级。

```javascript
/**
 * 事件处理基础
 */

console.log('\n=== 事件处理 ===\n');

const button = document.querySelector('#myButton');

if (button) {
  // 添加点击事件
  button.addEventListener('click', function(event) {
    console.log('按钮被点击!');
    console.log('事件对象:', event);
    console.log('点击的元素:', event.target);
  });
  
  // 使用箭头函数
  button.addEventListener('click', (e) => {
    console.log('箭头函数处理点击');
  });
  
  // 命名函数(可以移除)
  function handleClick(event) {
    console.log('命名函数处理点击');
  }
  
  button.addEventListener('click', handleClick);
  
  /*
   * 🎓 CS Perspective: The Observer Pattern & Interrupts
   * 
   * 1. Observer Pattern (观察者模式):
   *    DOM 元素是 Subject，你的回调函数是 Observer。
   *    当 Event 发生时，Subject 通知所有注册的 Observer。
   * 
   * 2. Interrupt Handling (中断处理):
   *    操作系统通过中断 (Interrupts) 处理硬件事件 (如键盘输入)。
   *    浏览器虽然运行在用户态，但机制类似：
   *    Main Thread 忙于执行 JS。当点击发生时，浏览器内核 (C++) 捕获该事件，
   *    并将回调函数推入 "Task Queue" (任务队列)。
   *    Event Loop 等待 Stack 清空后，执行该回调。
   *    (这就是为什么 `while(true)` 会卡死页面 —— Event Loop 没机会运行了)
   */
  
  // 移除事件监听器
  button.removeEventListener('click', handleClick);
  console.log('已移除 handleClick');
}

// 事件选项
const link = document.querySelector('a');

if (link) {
  // 只执行一次
  link.addEventListener('click', function(e) {
    e.preventDefault(); // 阻止默认行为
    console.log('链接被点击(仅一次)');
  }, { once: true });
  
  // 捕获阶段
  link.addEventListener('click', function(e) {
    console.log('捕获阶段');
  }, { capture: true });
  
  // 被动监听器(提高滚动性能)
  window.addEventListener('scroll', function() {
    console.log('滚动事件');
  }, { passive: true });
}
```

### 5.2 常见事件类型

```javascript
/**
 * 常见事件类型
 */

console.log('\n=== 常见事件 ===\n');

const input = document.querySelector('input');

if (input) {
  // 输入事件
  input.addEventListener('input', (e) => {
    console.log('输入中:', e.target.value);
  });
  
  // 改变事件(失去焦点时触发)
  input.addEventListener('change', (e) => {
    console.log('值改变:', e.target.value);
  });
  
  // 聚焦事件
  input.addEventListener('focus', () => {
    console.log('获得焦点');
    input.style.borderColor = 'blue';
  });
  
  // 失焦事件
  input.addEventListener('blur', () => {
    console.log('失去焦点');
    input.style.borderColor = '';
  });
  
  // 键盘事件
  input.addEventListener('keydown', (e) => {
    console.log('按下键:', e.key, '键码:', e.keyCode);
    
    if (e.key === 'Enter') {
      console.log('按下回车!');
    }
  });
  
  input.addEventListener('keyup', (e) => {
    console.log('释放键:', e.key);
  });
}

// 鼠标事件
const box = document.querySelector('.box');

if (box) {
  box.addEventListener('mouseenter', () => {
    console.log('鼠标进入');
    box.style.backgroundColor = '#e0e0e0';
  });
  
  box.addEventListener('mouseleave', () => {
    console.log('鼠标离开');
    box.style.backgroundColor = '';
  });
  
  box.addEventListener('mousemove', (e) => {
    // console.log('鼠标移动:', e.clientX, e.clientY);
  });
  
  box.addEventListener('mousedown', () => {
    console.log('鼠标按下');
  });
  
  box.addEventListener('mouseup', () => {
    console.log('鼠标释放');
  });
  
  box.addEventListener('dblclick', () => {
    console.log('双击');
  });
}

// 表单事件
const form = document.querySelector('form');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // 阻止表单提交
    console.log('表单提交');
    
    // 获取表单数据
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  });
  
  form.addEventListener('reset', () => {
    console.log('表单重置');
  });
}

// 文档事件
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 加载完成');
});

window.addEventListener('load', () => {
  console.log('页面完全加载(包括图片等资源)');
});

window.addEventListener('beforeunload', (e) => {
  // 用户即将离开页面
  // e.preventDefault();
  // e.returnValue = ''; // 显示确认对话框
});
```

### 5.3 事件委托

> **🏢 The Metaphor: The Corporate Ladder (职场政治)**
> 事件冒泡 (Event Bubbling) 就像是公司的**层级汇报制度**。
> 
> 1.  **Target (点击的按钮)**: 这是刚入职的实习生。他遇到了一个问题（被点击了）。
> 2.  **Bubbling (冒泡)**: 实习生解决不了，汇报给组长 (`div`)，组长汇报给经理 (`section`)，经理汇报给 CEO (`body`)，最后汇报给上帝 (`window`)。
> 
> **事件委托 (Event Delegation)** 的智慧在于：
> CEO (`ul`) 觉得：“我不养闲人。与其给每个实习生 (`li`) 都配一个秘书（Event Listener），不如我在办公室门口放一个前台。”
> 无论哪个实习生出事了，都会最终汇报到前台。前台看一眼工牌 (`e.target`)：“哦，是小王啊，按流程处理。”
> 
> 这就是为什么事件委托能省内存——**裁员增效**。

```javascript
/**
 * 事件委托
 * 利用事件冒泡,在父元素上处理子元素的事件
 */

console.log('\n=== 事件委托 ===\n');

const list = document.querySelector('#item-list');

if (list) {
  // ❌ 不推荐: 为每个子元素添加监听器
  // const items = list.querySelectorAll('.item');
  // items.forEach(item => {
  //   item.addEventListener('click', handleItemClick);
  // });
  
  // ✅ 推荐: 事件委托
  list.addEventListener('click', function(e) {
    // 检查点击的是否是 .item
    if (e.target.matches('.item')) {
      console.log('点击了项目:', e.target.textContent);
      e.target.classList.toggle('active');
    }
    
    // 或者使用 closest 查找最近的匹配
    const item = e.target.closest('.item');
    if (item) {
      console.log('点击了项目(使用 closest):', item.textContent);
    }
  });
  
  console.log('使用事件委托,为列表添加了一个监听器');
  console.log('即使动态添加新项目,也能响应点击');
}

// 动态添加元素示例
function addNewItem() {
  const newItem = document.createElement('div');
  newItem.className = 'item';
  newItem.textContent = `新项目 ${Date.now()}`;
  list.appendChild(newItem);
  console.log('添加了新项目(自动具有点击事件)');
}

/*
 * > **🎭 The Drama: The Corporate Ladder (职场政治)**
 * >
 * > 事件冒泡 (Event Bubbling) 就像是公司的**层级汇报制度**。
 * >
 * > 1.  **Target (点击的按钮)**: 这是刚入职的实习生。他遇到了一个问题（被点击了）。
 * > 2.  **Bubbling (冒泡)**: 实习生解决不了，汇报给组长 (`div`)，组长汇报给经理 (`section`)，经理汇报给 CEO (`body`)，最后汇报给上帝 (`window`)。
 * >
 * > **事件委托 (Event Delegation)** 的智慧在于：
 * > CEO (`ul`) 觉得：“我不养闲人。与其给每个实习生 (`li`) 都配一个秘书（Event Listener），不如我在办公室门口放一个前台。”
 * > 无论哪个实习生出事了，都会最终汇报到前台。前台看一眼工牌 (`e.target`)：“哦，是小王啊，按流程处理。”
 * >
 * > 这就是为什么事件委托能省内存——**裁员增效**。
 */
```

### 5.4 事件对象

> **🌊 The Metaphor: The Ripple Effect (涟漪效应)**
> 事件传播 (Propagation) 就像是向湖中扔了一块石头。
> *   **Capturing (捕获)**: 石头从空中落下，穿过水面（Window -> Document -> Body -> ... -> Target）。
> *   **Target (目标)**: 石头击中湖底（Button）。
> *   **Bubbling (冒泡)**: 撞击产生的涟漪向四周扩散，一层层传回水面（Target -> ... -> Body -> Document -> Window）。
> 
> 大多数时候，我们只关心涟漪（冒泡）。但有时候，我们需要在石头落下时就拦截它（捕获），或者用 `stopPropagation` 强行平息涟漪，防止它惊扰到岸边的观察者。

```javascript
/**
 * 事件对象的属性和方法
 */

console.log('\n=== 事件对象 ===\n');

document.addEventListener('click', function(event) {
  console.log('\n点击事件详情:');
  
  // 事件类型
  console.log('类型:', event.type); // 'click'
  
  // 目标元素
  console.log('目标:', event.target); // 实际被点击的元素
  console.log('当前目标:', event.currentTarget); // 监听器绑定的元素
  
  // 鼠标位置
  console.log('客户端坐标:', event.clientX, event.clientY); // 相对于视口
  console.log('页面坐标:', event.pageX, event.pageY); // 相对于页面
  console.log('屏幕坐标:', event.screenX, event.screenY); // 相对于屏幕
  
  // 修饰键
  console.log('Ctrl 键:', event.ctrlKey);
  console.log('Shift 键:', event.shiftKey);
  console.log('Alt 键:', event.altKey);
  console.log('Meta 键:', event.metaKey); // Windows 键 / Command 键
  
  // 事件方法
  // event.preventDefault(); // 阻止默认行为
  // event.stopPropagation(); // 阻止冒泡
  // event.stopImmediatePropagation(); // 阻止冒泡和其他监听器
  
  console.log('事件阶段:', event.eventPhase);
  // 1: CAPTURING_PHASE(捕获阶段)
  // 2: AT_TARGET(目标阶段)
  // 3: BUBBLING_PHASE(冒泡阶段)

  /*
   * 🔧 Under the Hood: Tree Traversal
   * 
   * 事件传播 (Event Propagation) 本质上是两次 DOM 树遍历：
   * 
   * 1. Capture Phase (捕获): Root -> Target (Top-down Traversal)
   * 2. Target Phase: 到达目标
   * 3. Bubble Phase (冒泡): Target -> Root (Bottom-up Traversal)
   * 
   * 默认情况下，addEventListener 只监听冒泡阶段 (Bubble)。
   * 设置 { capture: true } 可以监听捕获阶段。
   * 
   * 事件委托 (Event Delegation) 利用了冒泡机制，是一种典型的 "Space-Time Trade-off"。
   * 牺牲一点 CPU (冒泡遍历)，换取内存 (减少 Listener 对象数量) 和 动态性 (无需为新元素绑定)。
   * 
   * 💡 Memory Footprint Analysis:
   * 假设你有 1000 个列表项。
   * 方法 A (Direct Binding): 1000 个 Function Objects + 1000 个 Event Listeners。V8 堆内存消耗 ~100KB。
   * 方法 B (Delegation): 1 个 Function Object + 1 个 Event Listener。V8 堆内存消耗 ~100 Bytes。
   * 结论: Delegation 节省了 1000x 的内存开销。
   */
});
```

---

## 6. 样式操作

### 6.1 内联样式

```javascript
/**
 * 操作内联样式
 */

console.log('\n=== 样式操作 ===\n');

const box = document.querySelector('.styled-box');

if (box) {
  console.log('原始样式:', box.style.cssText);
  
  // 设置单个样式
  box.style.backgroundColor = '#007bff';
  box.style.color = 'white';
  box.style.padding = '20px';
  box.style.borderRadius = '5px';
  box.style.fontSize = '16px';
  
  // 注意: CSS 属性名要用驼峰命名
  box.style.marginTop = '10px';
  box.style.marginBottom = '10px';
  
  // 获取样式
  console.log('背景色:', box.style.backgroundColor);
  console.log('内边距:', box.style.padding);
  
  // 批量设置样式
  box.style.cssText = `
    background-color: #28a745;
    color: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  
  console.log('批量设置后:', box.style.cssText);
  
  // 使用 Object.assign
  Object.assign(box.style, {
    backgroundColor: '#dc3545',
    padding: '30px',
    fontSize: '18px'
  });
}

// 获取计算后的样式
if (box) {
  const computedStyle = window.getComputedStyle(box);
  
  console.log('\n计算后的样式:');
  console.log('宽度:', computedStyle.width);
  console.log('高度:', computedStyle.height);
  console.log('显示:', computedStyle.display);
  console.log('字体大小:', computedStyle.fontSize);
}
```

### 6.2 CSS 类操作

```javascript
/**
 * 操作 CSS 类
 */

console.log('\n=== CSS 类操作 ===\n');

const element = document.querySelector('.class-demo');

if (element) {
  console.log('初始类:', element.className);
  
  // classList API (推荐)
  console.log('\nclassList 操作:');
  
  // 添加类
  element.classList.add('active');
  console.log('添加 active:', element.className);
  
  // 添加多个类
  element.classList.add('highlighted', 'important');
  console.log('添加多个:', element.className);
  
  // 删除类
  element.classList.remove('highlighted');
  console.log('删除 highlighted:', element.className);
  
  // 切换类(有则删除,无则添加)
  element.classList.toggle('active');
  console.log('切换 active:', element.className);
  
  element.classList.toggle('active');
  console.log('再次切换:', element.className);
  
  // 替换类
  element.classList.replace('important', 'urgent');
  console.log('替换后:', element.className);
  
  // 检查类
  console.log('\n检查类:');
  console.log('是否有 active:', element.classList.contains('active'));
  console.log('是否有 urgent:', element.classList.contains('urgent'));
  
  // 遍历类
  console.log('\n所有类:');
  element.classList.forEach(className => {
    console.log('  -', className);
  });
  
  // 直接设置 className
  element.className = 'new-class another-class';
  console.log('\n直接设置:', element.className);
}
```

---

## 7. 表单处理

### 7.1 获取表单值

```javascript
/**
 * 表单处理
 */

console.log('\n=== 表单处理 ===\n');

const form = document.querySelector('#userForm');

if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('表单提交:');
    
    // 获取输入值
    const username = form.elements.username.value;
    const email = form.elements.email.value;
    const age = form.elements.age.value;
    
    console.log('用户名:', username);
    console.log('邮箱:', email);
    console.log('年龄:', age);
    
    // 获取单选框值
    const gender = form.elements.gender.value;
    console.log('性别:', gender);
    
    // 获取复选框值
    const interests = Array.from(form.querySelectorAll('[name="interests"]:checked'))
      .map(cb => cb.value);
    console.log('兴趣:', interests);
    
    // 获取下拉选择值
    const country = form.elements.country.value;
    console.log('国家:', country);
    
    // 使用 FormData
    console.log('\n使用 FormData:');
    const formData = new FormData(form);
    
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // 转换为对象
    const formObject = Object.fromEntries(formData.entries());
    console.log('\n表单对象:', formObject);
  });
}
```

### 7.2 表单验证

```javascript
/**
 * 表单验证
 */

console.log('\n=== 表单验证 ===\n');

const loginForm = document.querySelector('#loginForm');

if (loginForm) {
  const usernameInput = loginForm.elements.username;
  const passwordInput = loginForm.elements.password;
  
  // 实时验证
  usernameInput.addEventListener('input', function() {
    validateUsername(this);
  });
  
  passwordInput.addEventListener('input', function() {
    validatePassword(this);
  });
  
  // 提交时验证
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    console.log('验证表单:');
    
    const usernameValid = validateUsername(usernameInput);
    const passwordValid = validatePassword(passwordInput);
    
    if (usernameValid && passwordValid) {
      console.log('✅ 表单验证通过');
      // 提交表单...
    } else {
      console.log('❌ 表单验证失败');
    }
  });
}

function validateUsername(input) {
  const value = input.value.trim();
  const errorElement = input.nextElementSibling;
  
  if (value.length < 3) {
    showError(input, errorElement, '用户名至少3个字符');
    return false;
  } else {
    showSuccess(input, errorElement);
    return true;
  }
}

function validatePassword(input) {
  const value = input.value;
  const errorElement = input.nextElementSibling;
  
  if (value.length < 6) {
    showError(input, errorElement, '密码至少6个字符');
    return false;
  } else {
    showSuccess(input, errorElement);
    return true;
  }
}

function showError(input, errorElement, message) {
  input.classList.add('error');
  input.classList.remove('success');
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  console.log(`  ❌ ${input.name}: ${message}`);
}

function showSuccess(input, errorElement) {
  input.classList.remove('error');
  input.classList.add('success');
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.style.display = 'none';
  }
  console.log(`  ✅ ${input.name}: 验证通过`);
}
```

---

## 8. 浏览器存储

### 8.1 localStorage

```javascript
/**
 * localStorage
 * 持久化存储,不会过期
 */

console.log('\n=== localStorage ===\n');

// 存储数据
localStorage.setItem('username', 'Alice');
localStorage.setItem('userId', '123');
console.log('已存储数据');

// 读取数据
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');
console.log('读取数据:');
console.log('  username:', username);
console.log('  userId:', userId);

// 删除数据
localStorage.removeItem('userId');
console.log('已删除 userId');

// 清空所有数据
// localStorage.clear();

// 存储对象(需要序列化)
const user = {
  name: 'Bob',
  age: 25,
  email: 'bob@example.com'
};

localStorage.setItem('user', JSON.stringify(user));
console.log('\n存储对象:', user);

// 读取对象
const storedUser = JSON.parse(localStorage.getItem('user'));
console.log('读取对象:', storedUser);

// 检查存储空间
console.log('\nlocalStorage 键值对数量:', localStorage.length);

// 遍历所有键
console.log('所有键:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`  ${key}: ${localStorage.getItem(key)}`);
}

// 实用函数
const storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`存储: ${key}`);
  },
  
  get(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  
  remove(key) {
    localStorage.removeItem(key);
    console.log(`删除: ${key}`);
  },
  
  clear() {
    localStorage.clear();
    console.log('清空所有数据');
  }
};

// 使用
storage.set('settings', { theme: 'dark', language: 'zh' });
const settings = storage.get('settings');
console.log('\n读取设置:', settings);
```

### 8.2 sessionStorage

```javascript
/**
 * sessionStorage
 * 会话存储,关闭标签页后清除
 */

console.log('\n=== sessionStorage ===\n');

// API 与 localStorage 相同
sessionStorage.setItem('token', 'abc123');
sessionStorage.setItem('sessionId', 'xyz789');

console.log('存储会话数据:');
console.log('  token:', sessionStorage.getItem('token'));
console.log('  sessionId:', sessionStorage.getItem('sessionId'));

// 存储临时数据
const tempData = {
  step: 1,
  formData: {
    name: 'Test',
    email: 'test@example.com'
  }
};

sessionStorage.setItem('wizardProgress', JSON.stringify(tempData));
console.log('\n存储向导进度:', tempData);

// 读取
const progress = JSON.parse(sessionStorage.getItem('wizardProgress'));
console.log('读取进度:', progress);

// ⚠️ sessionStorage vs localStorage
console.log('\n区别:');
console.log('  localStorage: 永久存储,除非手动删除');
console.log('  sessionStorage: 标签页关闭后清除');
console.log('  两者都限制在同源(协议+域名+端口)');
```

### 8.3 Cookie(简介)

```javascript
/**
 * Cookie
 * 可以设置过期时间,会随 HTTP 请求发送到服务器
 */

console.log('\n=== Cookie ===\n');

// 设置 cookie
document.cookie = 'username=Alice';
document.cookie = 'theme=dark; max-age=3600'; // 1小时后过期
document.cookie = 'session=xyz; path=/; secure'; // 仅 HTTPS

console.log('当前 cookies:', document.cookie);

// Cookie 工具函数
const cookies = {
  set(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
    console.log(`设置 cookie: ${name}=${value}`);
  },
  
  get(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length);
      }
    }
    
    return null;
  },
  
  delete(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    console.log(`删除 cookie: ${name}`);
  }
};

// 使用
cookies.set('userPreference', 'darkMode', 30);
console.log('读取:', cookies.get('userPreference'));

// ⚠️ 存储对比
console.log('\n存储方式对比:');
console.log('Cookie:');
console.log('  - 大小: ~4KB');
console.log('  - 随请求发送: 是');
console.log('  - 可设置过期: 是');
console.log('\nlocalStorage:');
console.log('  - 大小: ~5-10MB');
console.log('  - 随请求发送: 否');
console.log('  - 持久化: 是');
console.log('\nsessionStorage:');
console.log('  - 大小: ~5-10MB');
console.log('  - 随请求发送: 否');
console.log('  - 持久化: 仅会话期间');
```

---

## 9. 🔧 渲染管线 (Critical Rendering Path)

> **CS Master Deep Dive**
> 浏览器如何将 HTML 字符串转换为屏幕上的像素？这是一个经典的 Pipeline 处理过程。

### 9.1 The Pipeline

> **🎬 The Metaphor: The Movie Set**
> 浏览器的渲染过程就像是在**拍电影**。
> 
> 1.  **Parsing (剧本研读)**: 导演（浏览器）读 HTML（剧本）和 CSS（分镜），理解要拍什么。
> 2.  **Render Tree (选角)**: 决定哪些角色（元素）要上镜。`display: none` 的角色被踢出剧组。
> 3.  **Layout (走位)**: 确定每个演员在舞台上的确切位置和占地面积。这是最耗时的排练。
> 4.  **Paint (化妆与打光)**: 给演员穿衣服、打光、上色。
> 5.  **Composite (后期合成)**: 将不同的图层（背景、人物、特效）合成到一起，输出最终画面。
> 
> **性能优化的秘诀**：尽量只做后期合成（Composite），少做走位（Layout）。`transform` 和 `opacity` 就是后期特效，不影响走位，所以快。

1.  **Parsing (解析)**:
    *   **HTML -> DOM**: 词法分析 (Lexing) -> Tokenization -> Tree Construction。
    *   **CSS -> CSSOM**: CSS Object Model，也是树状结构。

2.  **Render Tree Construction (构建渲染树)**:
    *   DOM + CSSOM = Render Tree。
    *   **Filtering**: `display: none` 的元素不会出现在 Render Tree 中 (但 `visibility: hidden` 会，因为它占据空间)。
    *   **CS Analogy**: 类似于编译器的 IR (Intermediate Representation) 生成。

3.  **Layout (布局/Reflow)**:
    *   计算每个节点在屏幕上的确切坐标和大小 (Geometry)。
    *   **Algorithm**: 递归遍历 Render Tree。类似于 GUI 框架中的 `measure()` 和 `layout()` pass。

4.  **Paint (绘制/Repaint)**:
    *   填充像素 (Rasterization)。绘制文本、颜色、图像、边框、阴影。
    *   这一步通常在 CPU 上完成。

5.  **Composite (合成)**:
    *   浏览器将页面分成多个 **Layers** (图层)。
    *   GPU 将这些图层合成到一起，显示在屏幕上。
    *   **Optimization**: `transform` 和 `opacity` 属性只会触发 Composite，不会触发 Layout 或 Paint。这是最高效的动画方式 (GPU Accelerated)。

### 9.2 Virtual DOM (The Double Buffering of Web)

> **🎓 CS Master's Bridge**
> 你可能听说过 React/Vue 的 Virtual DOM。这不就是图形学中的 **Double Buffering** 吗？
>
> 1.  **Direct DOM**: 就像直接往显存 (Frame Buffer) 里写像素。每次操作都会导致屏幕闪烁 (Reflow/Repaint)。
> 2.  **Virtual DOM**: 就像在内存中画好一帧 (Back Buffer)。
> 3.  **Diff Algorithm**: 计算前后两帧的差异 (Dirty Rectangles)。
> 4.  **Patch**: 一次性将差异应用到真实 DOM (Swap Buffers)。
>
> 虽然 VDOM 在 CPU 上有额外开销 (Diffing)，但它极大地减少了昂贵的 DOM IPC 调用和 Layout/Paint 次数。
>
> > **🧘 Zen of Code: The Art of Deception (欺骗的艺术)**
> > 计算机科学的很多问题，归根结底都是**缓存 (Caching)** 和 **中间层 (Indirection)** 的问题。
> > Virtual DOM 是一场宏大的**模拟 (Simulation)**。
> > 我们欺骗开发者：“嘿，你可以假装整个页面都被重绘了（声明式编程）。”
> > 然后我们在幕后疯狂地计算差异，只把最小的变更应用到真实世界。
> > 这就像《黑客帝国》：你以为你吃的是牛排（React Component），其实那只是脑后插管传来的电信号（Virtual DOM Diff）。
> > 但这重要吗？只要牛排的味道是对的（UI 是对的），而且系统没有崩溃（性能达标），**谎言就是真理**。

### 9.3 优化策略 (Performance Implications)

*   **避免强制同步布局 (Forced Synchronous Layout)**:
    *   不要在循环中交替读写 DOM (读 -> 写 -> 读 -> 写)。
    *   这会破坏浏览器的批量优化，导致每一轮循环都强制 Layout。
    *   **Fix**: 读读读 -> 写写写 (Batching)。

*   **使用 `requestAnimationFrame`**:
    *   将 DOM 操作对齐到显示器的刷新率 (60Hz)。
    *   避免在不可见时浪费 CPU。

---

## 10. 最佳实践

### 9.1 性能优化

```javascript
/**
 * DOM 操作性能优化
 */

console.log('\n=== 性能优化 ===\n');

// ❌ 避免: 频繁操作 DOM
function inefficientUpdate() {
  const container = document.querySelector('#list');
  
  for (let i = 0; i < 100; i++) {
    const item = document.createElement('li');
    item.textContent = `Item ${i}`;
    container.appendChild(item); // 每次都触发重排
  }
}

// ✅ 推荐: 批量更新
function efficientUpdate() {
  const container = document.querySelector('#list');
  const fragment = document.createDocumentFragment();
  
  for (let i = 0; i < 100; i++) {
    const item = document.createElement('li');
    item.textContent = `Item ${i}`;
    fragment.appendChild(item); // 不触发重排
  }
  
  container.appendChild(fragment); // 只触发一次重排
  console.log('批量添加 100 个项目');
}

// ❌ 避免: 在循环中读取布局属性
function badLayout() {
  const elements = document.querySelectorAll('.item');
  
  elements.forEach(el => {
    el.style.width = el.offsetWidth + 10 + 'px'; // 强制重排
  });
}

// ✅ 推荐: 先读取所有值,再修改
function goodLayout() {
  const elements = document.querySelectorAll('.item');
  const widths = [];
  
  // 先读取
  elements.forEach(el => {
    widths.push(el.offsetWidth);
  });
  
  // 再修改
  elements.forEach((el, i) => {
    el.style.width = widths[i] + 10 + 'px';
  });
}

// 缓存 DOM 查询
console.log('\n缓存 DOM 查询:');

// ❌ 避免
for (let i = 0; i < 100; i++) {
  document.querySelector('#container').appendChild(
    document.createElement('div')
  ); // 每次都查询
}

// ✅ 推荐
const container = document.querySelector('#container'); // 缓存
for (let i = 0; i < 100; i++) {
  container.appendChild(document.createElement('div'));
}
```

### 9.2 安全实践

```javascript
/**
 * 安全实践
 */

console.log('\n=== 安全实践 ===\n');

// ❌ 危险: 直接使用用户输入
const userInput = '<img src=x onerror=alert("XSS")>';

function dangerousInsert() {
  const div = document.querySelector('#output');
  div.innerHTML = userInput; // ❌ XSS 攻击!
}

// ✅ 安全: 使用 textContent
function safeInsert() {
  const div = document.querySelector('#output');
  div.textContent = userInput; // ✅ 转义 HTML
  console.log('安全插入文本');
}

// ✅ 安全: 清理 HTML
function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

const sanitized = sanitizeHTML(userInput);
console.log('清理后:', sanitized);

// ✅ 安全: 使用 DOMPurify 库(推荐)
// const clean = DOMPurify.sanitize(userInput);
```

### 9.3 代码组织

```javascript
/**
 * 代码组织
 */

console.log('\n=== 代码组织 ===\n');

// ✅ 推荐: 模块化组织
const TodoApp = {
  // 元素
  elements: {
    form: null,
    input: null,
    list: null
  },
  
  // 数据
  todos: [],
  
  // 初始化
  init() {
    console.log('初始化 TodoApp');
    this.cacheElements();
    this.bindEvents();
    this.loadFromStorage();
    this.render();
  },
  
  // 缓存元素
  cacheElements() {
    this.elements.form = document.querySelector('#todoForm');
    this.elements.input = document.querySelector('#todoInput');
    this.elements.list = document.querySelector('#todoList');
    console.log('元素已缓存');
  },
  
  // 绑定事件
  bindEvents() {
    this.elements.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTodo(this.elements.input.value);
    });
    
    this.elements.list?.addEventListener('click', (e) => {
      if (e.target.matches('.delete-btn')) {
        const id = e.target.dataset.id;
        this.deleteTodo(id);
      }
    });
    
    console.log('事件已绑定');
  },
  
  // 业务逻辑
  addTodo(text) {
    if (!text.trim()) return;
    
    const todo = {
      id: Date.now(),
      text: text.trim(),
      completed: false
    };
    
    this.todos.push(todo);
    this.saveToStorage();
    this.render();
    this.elements.input.value = '';
    
    console.log('添加待办:', todo);
  },
  
  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== parseInt(id));
    this.saveToStorage();
    this.render();
    console.log('删除待办:', id);
  },
  
  // 渲染
  render() {
    if (!this.elements.list) return;
    
    this.elements.list.innerHTML = this.todos.map(todo => `
      <li class="todo-item">
        <span>${todo.text}</span>
        <button class="delete-btn" data-id="${todo.id}">删除</button>
      </li>
    `).join('');
    
    console.log('渲染完成,共', this.todos.length, '项');
  },
  
  // 存储
  saveToStorage() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  },
  
  loadFromStorage() {
    const stored = localStorage.getItem('todos');
    this.todos = stored ? JSON.parse(stored) : [];
    console.log('从存储加载:', this.todos.length, '项');
  }
};

// 初始化应用
// document.addEventListener('DOMContentLoaded', () => {
//   TodoApp.init();
// });
```

---

## 11. 章节练习

### 练习1: 元素选择和修改

选择页面上的 h1 元素,将其文本改为 "欢迎来到我的网站",并添加 "title" 类。

<details>
<summary>查看答案</summary>

```javascript
const h1 = document.querySelector('h1');

if (h1) {
  h1.textContent = '欢迎来到我的网站';
  h1.classList.add('title');
  console.log('标题已修改');
}
```
</details>

### 练习2: 动态创建列表

创建一个函数 `createList(items)`,接收数组,创建 ul 列表并添加到页面。

<details>
<summary>查看答案</summary>

```javascript
function createList(items) {
  console.log('创建列表,项目数:', items.length);
  
  // 创建 ul 元素
  const ul = document.createElement('ul');
  ul.className = 'item-list';
  
  // 创建 li 元素
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
  
  // 添加到页面
  document.body.appendChild(ul);
  
  console.log('列表已添加到页面');
  return ul;
}

// 使用
createList(['苹果', '香蕉', '橙子', '葡萄']);
```
</details>

### 练习3: 事件处理

为按钮添加点击事件,每次点击时切换 "active" 类,并更新按钮文本显示点击次数。

<details>
<summary>查看答案</summary>

```javascript
const button = document.querySelector('#myButton');
let clickCount = 0;

if (button) {
  button.addEventListener('click', function() {
    // 切换类
    this.classList.toggle('active');
    
    // 更新计数
    clickCount++;
    this.textContent = `点击了 ${clickCount} 次`;
    
    console.log('按钮点击次数:', clickCount);
  });
  
  console.log('事件监听器已添加');
}
```
</details>

### 练习4: 表单验证

创建一个简单的邮箱验证,实时检查邮箱格式是否正确。

<details>
<summary>查看答案</summary>

```javascript
const emailInput = document.querySelector('#email');
const errorMessage = document.querySelector('#emailError');

if (emailInput && errorMessage) {
  emailInput.addEventListener('input', function() {
    const email = this.value.trim();
    
    // 简单的邮箱正则
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email === '') {
      // 空值
      errorMessage.textContent = '';
      this.classList.remove('error', 'success');
    } else if (emailRegex.test(email)) {
      // 有效
      errorMessage.textContent = '✅ 邮箱格式正确';
      errorMessage.style.color = 'green';
      this.classList.remove('error');
      this.classList.add('success');
    } else {
      // 无效
      errorMessage.textContent = '❌ 请输入有效的邮箱地址';
      errorMessage.style.color = 'red';
      this.classList.remove('success');
      this.classList.add('error');
    }
  });
  
  console.log('邮箱验证已启用');
}
```
</details>

### 练习5: localStorage 应用

实现一个简单的主题切换功能,将用户选择保存到 localStorage。

<details>
<summary>查看答案</summary>

```javascript
const ThemeToggle = {
  // 初始化
  init() {
    console.log('初始化主题切换');
    
    this.button = document.querySelector('#themeToggle');
    this.loadTheme();
    this.bindEvents();
  },
  
  // 绑定事件
  bindEvents() {
    this.button?.addEventListener('click', () => {
      this.toggleTheme();
    });
  },
  
  // 加载主题
  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.applyTheme(savedTheme);
    console.log('加载主题:', savedTheme);
  },
  
  // 切换主题
  toggleTheme() {
    const currentTheme = document.body.dataset.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    this.applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log('切换主题:', currentTheme, '→', newTheme);
  },
  
  // 应用主题
  applyTheme(theme) {
    document.body.dataset.theme = theme;
    
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
      this.button.textContent = '🌞 切换到亮色';
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
      this.button.textContent = '🌙 切换到暗色';
    }
  }
};

// 初始化
// document.addEventListener('DOMContentLoaded', () => {
//   ThemeToggle.init();
// });
```
</details>

---

## 📚 下一步

恭喜你完成了第5章的学习!现在你已经掌握了:
- ✅ DOM 的基本概念
- ✅ 选择和遍历元素
- ✅ 修改元素内容、属性和样式
- ✅ 创建和删除元素
- ✅ 事件处理和事件委托
- ✅ 表单处理和验证
- ✅ 浏览器存储 API

你已经完成了阶段 1 的所有理论章节!

**准备好了吗?** 让我们通过[实战项目:待办事项应用](../projects/todo-app/)来综合运用所学知识!

---

## 📖 参考资源

- [MDN - DOM 简介](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model/Introduction)
- [MDN - 事件参考](https://developer.mozilla.org/zh-CN/docs/Web/Events)
- [MDN - Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API)
- [JavaScript.info - DOM](https://zh.javascript.info/document)
