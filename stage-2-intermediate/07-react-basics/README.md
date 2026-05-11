# React 基础 — UI 即函数的范式革命

> *"Simplicity is the ultimate sophistication."* — Leonardo da Vinci
> 
> 2013 年 5 月,Facebook 总部。工程师 Jordan Walke 站在会议室前,向团队展示他的疯狂想法:在 JavaScript 里写 HTML。整个会议室爆发了嘲笑声:"这是倒退!这是 PHP!这违背了关注点分离!" 但 Jordan 没有退缩。他在白板上写下了一个等式: **`UI = f(State)`**。这个简单的等式,击中了一个深刻的真理——UI 不应该是你手动操纵的对象,而应该是数据的纯粹映射。十年后,React 成为了全球最流行的前端框架。这不仅是技术的胜利,这是**认知模型**的颠覆。

## 📖 本章内容

1. [React 的哲学 — 从命令式到声明式的认知跃迁](#1-react-的哲学--从命令式到声明式的认知跃迁)
2. [JSX — "HTML in JS" 的争议与胜利](#2-jsx--html-in-js-的争议与胜利)
3. [组件与 Props — 函数即组件,Props 即参数](#3-组件与-props--函数即组件props-即参数)
4. [State 与 useState — 状态是 UI 的记忆](#4-state-与-usestate--状态是-ui-的记忆)
5. [事件处理 — 合成事件系统](#5-事件处理--合成事件系统)
6. [条件渲染与列表 — 数据驱动的 UI](#6-条件渲染与列表--数据驱动的-ui)
7. [useEffect 与副作用 — 纯函数核心,不纯的壳](#7-useeffect-与副作用--纯函数核心不纯的壳)
8. [Hooks 进阶 — useRef, useContext, 自定义 Hook](#8-hooks-进阶--useref-usecontext-自定义-hook)
9. [组件设计原则 — 单一职责、组合优于继承](#9-组件设计原则--单一职责组合优于继承)
10. [🧘 Zen of Code: 声明式的禅](#10--zen-of-code-声明式的禅)
11. [章节练习](#11-章节练习)

---

## 学习目标

完成本章后,你将能够:

- ✅ 理解 React 的核心哲学:`UI = f(State)`
- ✅ 熟练使用 JSX 语法编写 UI
- ✅ 创建函数组件并通过 Props 传递数据
- ✅ 使用 `useState` 管理组件状态
- ✅ 使用 `useEffect` 处理副作用(API 调用、订阅等)
- ✅ 掌握事件处理和表单交互
- ✅ 实现条件渲染和列表渲染
- ✅ 使用 `useRef` 和 `useContext` 等高级 Hooks
- ✅ 遵循 React 组件设计最佳实践

---

## 💻 代码示例

本章包含 **12 个实用代码示例**，从基础组件到完整应用。

所有示例代码位于 [`examples/`](./examples/) 目录，包括：
- 🎯 **组件基础**: UserCard 组件
- 🎯 **状态管理**: Counter 计数器
- 🎯 **副作用**: 数据获取示例
- 🎯 **自定义 Hooks**: useFetch, useLocalStorage, useDebounce
- 🎯 **完整应用**: Todo App (含输入、列表、过滤、统计)

**推荐学习方式**:
1. 📖 先阅读本章理论部分，理解 React 核心概念
2. 💻 然后查看 [`examples/`](./examples/) 中的代码示例
3. 🔨 在本地运行示例代码（需要 React 环境）
4. 🎯 从简单示例开始，逐步学习到 Todo App
5. 💪 完成章节练习，巩固所学知识

**快速开始**:
- 基础学习: `components/` → `state/` → `effects/`
- 进阶学习: `hooks/` (自定义 Hooks)
- 综合实战: `todo-app/` (完整应用)

→ [查看所有代码示例](./examples/README.md)

---

## 前置知识

- JavaScript ES6+ 基础(箭头函数、解构、模板字符串)
- DOM 操作基础(你将看到 React 如何让你摆脱它)
- 函数式编程概念(纯函数、不可变性 — 如果不熟悉,本章会带你入门)

---

## 1. React 的哲学 — 从命令式到声明式的认知跃迁

### 1.1 The Drama: 范式革命的血与火

> 🎭 **The Drama: 地心说 vs 日心说**
> 
> 在 jQuery 时代,开发者直接操纵 DOM。这就像**地心说**——以 DOM 为中心,JavaScript 围着 DOM 转。你要显示一个用户列表?好,你得:`$('#userList').empty()`,然后 `for` 循环,然后 `.append('<li>...</li>')`,然后祈祷你没有拼错 HTML 字符串。你要更新一个用户?再来一遍。删除?再来一遍。每次数据变化,你都要手动同步 DOM。
> 
> **React 说:不。这个模型是错的。**
> 
> React 的**日心说**是:State 才是中心,DOM 只是 State 的投影。你不应该操纵 DOM,你应该操纵数据。DOM 会自动跟随数据变化。这不仅是技术的变革,这是**认知模型**的哥白尼式革命。

让我们看看这两种范式的对比:

**❌ 命令式(jQuery 时代)— 你告诉浏览器怎么做**

```javascript
// 命令式:手动操作 DOM
console.log('[命令式] 开始渲染用户列表');

const users = ['Alice', 'Bob', 'Charlie'];
const ul = document.getElementById('userList');

// 第一步:清空列表
console.log('[命令式] 清空现有列表');
ul.innerHTML = '';

// 第二步:遍历数据,逐个创建 DOM 元素
users.forEach((user, index) => {
  console.log(`[命令式] 创建第 ${index + 1} 个 <li> 元素,内容: ${user}`);
  const li = document.createElement('li');
  li.textContent = user;
  ul.appendChild(li);
});

console.log('[命令式] 渲染完成');

// 如果要更新?你得记住 DOM 结构,找到对应元素,手动改
console.log('[命令式] 更新第 2 个用户名为 Robert');
ul.children[1].textContent = 'Robert';

// 如果要删除?又是一套流程
console.log('[命令式] 删除第 1 个用户');
ul.removeChild(ul.children[0]);
```

**问题**:
- 你既要管理数据(`users` 数组),又要管理 DOM(DOM 树)
- 两者容易不同步(数据变了,DOM 没变;DOM 变了,数据没变)
- 代码难以维护:业务逻辑和 DOM 操作纠缠在一起

**✅ 声明式(React)— 你告诉 React 结果应该是什么**

```jsx
// 声明式:描述 UI 应该是什么样子,React 负责渲染
import { useState } from 'react';

function UserList() {
  console.log('[React] UserList 组件函数执行');
  
  const [users, setUsers] = useState(['Alice', 'Bob', 'Charlie']);
  
  // 你只需要描述"UI 应该长什么样"
  console.log('[React] 渲染 UI,当前用户列表:', users);
  
  return (
    <ul>
      {users.map((user, index) => {
        console.log(`[React] 渲染用户 ${index + 1}: ${user}`);
        return <li key={index}>{user}</li>;
      })}
    </ul>
  );
}

// 如果要更新?只需要改数据,React 自动同步 DOM
function handleUpdate() {
  console.log('[React] 更新用户数据');
  setUsers(prevUsers => {
    const newUsers = [...prevUsers];
    newUsers[1] = 'Robert';
    console.log('[React] 新的用户列表:', newUsers);
    return newUsers;
  });
  // React 会自动重新调用 UserList(),重新计算 UI
}

// 如果要删除?同样只需要改数据
function handleDelete() {
  console.log('[React] 删除第一个用户');
  setUsers(prevUsers => {
    const newUsers = prevUsers.slice(1);
    console.log('[React] 新的用户列表:', newUsers);
    return newUsers;
  });
}
```

**优势**:
- 你只管理一个东西:**数据(State)**
- DOM 自动跟随数据变化,不会不同步
- 代码可预测:相同的数据 → 相同的 UI

### 1.2 The Big Picture: 投影仪理论

> 🌌 **The Big Picture: 投影仪理论**
> 
> React 是一台**投影仪**。
> 
> - **State(状态)** 是胶片(数据源)
> - **组件函数** 是镜头(转换函数)
> - **DOM** 是银幕(输出)
> 
> 你不会跑到银幕前面用手指去修改画面(直接操作 DOM),你会换一张胶片(更新 State)。React 的 Virtual DOM Diff 算法就是那个自动计算"胶片变了哪几帧"的智能系统。
> 
> 当你调用 `setState`,你不是在命令 React "去把 DOM 的第三个 `<li>` 改成 Robert"。你是在说:"这是新的胶片,请重新投影。" React 会计算旧胶片和新胶片的差异,然后只更新变化的部分。

**核心等式**:

```
UI = f(State)
```

- **UI** — 用户看到的界面
- **f** — 你的组件函数
- **State** — 应用的状态(数据)

这个等式意味着:给定相同的 State,总是得到相同的 UI。这就是**纯函数**的思想。

### 1.3 历史叙事弧:从 jQuery 到 React 的演进

> 🌌 **The Big Picture: 三次范式跳跃**
> 
> Web 前端经历了三次范式跳跃:
> 
> **第一代 — 手动操作 DOM (jQuery, 2006-2012)**
> - 直接 `$('#id').text('new value')`
> - 问题:数据和 DOM 分离,容易不同步,代码如意大利面
> 
> **第二代 — 双向数据绑定 (Angular 1, Knockout, 2010-2014)**
> - `ng-model="user.name"`,数据变了 → DOM 变,DOM 变了 → 数据变
> - 问题:**脏检查**(Dirty Checking)性能灾难。Angular 1 会定期遍历所有绑定检查是否变化。当页面超过 2000 个绑定时,性能崩溃。
> 
> **第三代 — 单向数据流 + Virtual DOM (React, 2013-至今)**
> - State → UI(单向)
> - Virtual DOM Diff:不是检查所有绑定,而是计算新旧 UI 树的差异
> - 性能和可预测性兼得

**Angular 1 的脏检查灾难**:

```javascript
// Angular 1 内部的脏检查伪代码
console.log('[Angular] 触发 $digest 循环');

let dirty = true;
let iterations = 0;
const MAX_ITERATIONS = 10;

while (dirty && iterations < MAX_ITERATIONS) {
  iterations++;
  console.log(`[Angular] 第 ${iterations} 次脏检查遍历`);
  
  dirty = false;
  
  // 遍历所有 $watch 监听器(可能有几千个)
  watchers.forEach((watcher, index) => {
    const oldValue = watcher.lastValue;
    const newValue = watcher.getValue();
    
    if (oldValue !== newValue) {
      console.log(`[Angular] 检测到变化: watcher ${index}, ${oldValue} → ${newValue}`);
      dirty = true; // 发现变化,需要再检查一遍
      watcher.lastValue = newValue;
      watcher.callback(newValue, oldValue);
    }
  });
}

if (iterations === MAX_ITERATIONS) {
  console.error('[Angular] 脏检查超过最大迭代次数,可能有无限循环!');
}

console.log(`[Angular] 脏检查完成,共遍历 ${iterations} 次`);
```

**问题**:每次任何数据变化(甚至鼠标移动),Angular 都要遍历**所有** `$watch`,开销巨大。

**React 的 Virtual DOM Diff**:

```javascript
// React 的 Diff 算法伪代码(简化版)
console.log('[React] 开始 Virtual DOM Diff');

function diff(oldVNode, newVNode) {
  console.log('[React] 比较两个虚拟节点');
  
  // 情况 1:节点类型不同 → 直接替换
  if (oldVNode.type !== newVNode.type) {
    console.log('[React] 节点类型变化,直接替换整个子树');
    return { type: 'REPLACE', node: newVNode };
  }
  
  // 情况 2:文本节点内容变化
  if (typeof newVNode === 'string') {
    if (oldVNode !== newVNode) {
      console.log(`[React] 文本变化: "${oldVNode}" → "${newVNode}"`);
      return { type: 'TEXT', content: newVNode };
    }
    return null;
  }
  
  // 情况 3:属性变化
  const propsPatches = diffProps(oldVNode.props, newVNode.props);
  if (propsPatches.length > 0) {
    console.log('[React] 属性变化:', propsPatches);
  }
  
  // 情况 4:递归比较子节点
  const childrenPatches = diffChildren(oldVNode.children, newVNode.children);
  
  return {
    type: 'UPDATE',
    props: propsPatches,
    children: childrenPatches
  };
}

console.log('[React] Diff 完成,生成补丁(patches)');
console.log('[React] 只更新变化的部分,而非整个页面');
```

**优势**:
- **O(n) 复杂度**:React 假设跨层级移动节点极其罕见,用启发式算法将复杂度从 O(n³) 降到 O(n)
- **按需更新**:只有变化的部分才会真正操作 DOM
- **批量更新**:多次 `setState` 会被合并,只触发一次 DOM 更新

> 🧠 **CS Master's Bridge: 为什么是 O(n) 而不是 O(n³)?**
> 
> 传统的树编辑距离算法(Tree Edit Distance)是 O(n³) 的——它会尝试所有可能的移动、插入、删除操作来找到最优解。
> 
> React 做了一个**工程权衡**:它假设:
> 1. 不同类型的元素会生成不同的树(比如 `<div>` 变成 `<span>`,直接替换子树,不尝试复用)
> 2. 同一层级的子节点用 `key` 来标识(帮助 React 识别哪些是同一个元素)
> 3. 跨层级移动节点非常罕见(如果检测到,直接删除旧的,创建新的)
> 
> 这些假设在 99% 的 UI 场景下都成立,所以 React 用"不完美但快速"的算法替代了"完美但慢"的算法。这是**用假设换性能**的经典案例。

---

## 2. JSX — "HTML in JS" 的争议与胜利

### 2.1 The Drama: JSX 的审判

> 🎭 **The Drama: JSX 的审判**
> 
> 2013 年,React 开源时,最大的争议不是 Virtual DOM,而是 **JSX**。
> 
> 前端社区的反应是震惊和愤怒:"你在 JS 里写 HTML?这违背了关注点分离!这是回到 PHP 的黑暗时代!这是邪恶的!"
> 
> 但 React 团队坚持:真正的**关注点分离**不是"按文件类型分"(HTML、CSS、JS 分三个文件),而是"按功能模块分"(一个 UserCard 组件包含它的结构、样式、逻辑)。
> 
> 十年后,JSX 成为了事实标准。Vue 的 SFC(Single File Component)、Svelte、Solid.js 都采用了类似的思想。胜利属于那些敢于挑战教条的人。

### 2.2 JSX 是什么?

JSX 是 JavaScript 的语法扩展,让你可以在 JS 里写类似 HTML 的代码:

```jsx
// JSX 看起来像 HTML,但实际上是 JavaScript
function Welcome() {
  console.log('[JSX] Welcome 组件渲染');
  
  const userName = 'Alice';
  const isLoggedIn = true;
  
  return (
    <div className="welcome">
      <h1>Hello, {userName}!</h1>
      {isLoggedIn && <p>欢迎回来!</p>}
    </div>
  );
}
```

**JSX 会被编译成 JavaScript**:

```javascript
// 上面的 JSX 会被 Babel 编译成这样:
function Welcome() {
  console.log('[JSX] Welcome 组件渲染');
  
  const userName = 'Alice';
  const isLoggedIn = true;
  
  return React.createElement(
    'div',
    { className: 'welcome' },
    React.createElement('h1', null, 'Hello, ', userName, '!'),
    isLoggedIn && React.createElement('p', null, '欢迎回来!')
  );
}

console.log('[JSX] 编译结果:', Welcome());
// 输出: { type: 'div', props: { className: 'welcome', children: [...] } }
```

`React.createElement` 返回的是一个**纯 JavaScript 对象**,描述了 UI 的结构。这就是 **Virtual DOM 节点**。

### 2.3 JSX 语法规则

**规则 1:必须有一个根元素**

```jsx
// ❌ 错误:多个根元素
function Bad() {
  return (
    <h1>标题</h1>
    <p>段落</p>
  );
}

// ✅ 正确:用 <div> 包裹
function Good1() {
  return (
    <div>
      <h1>标题</h1>
      <p>段落</p>
    </div>
  );
}

// ✅ 更好:用 Fragment(<>...</>),不会生成额外 DOM 节点
function Good2() {
  return (
    <>
      <h1>标题</h1>
      <p>段落</p>
    </>
  );
}
```

**规则 2:用 `{}` 嵌入 JavaScript 表达式**

```jsx
function Greeting() {
  const user = { name: 'Alice', age: 25 };
  const numbers = [1, 2, 3];
  
  return (
    <div>
      {/* 变量 */}
      <p>姓名: {user.name}</p>
      
      {/* 表达式 */}
      <p>明年: {user.age + 1} 岁</p>
      
      {/* 函数调用 */}
      <p>当前时间: {new Date().toLocaleTimeString()}</p>
      
      {/* 数组映射 */}
      <ul>
        {numbers.map(n => <li key={n}>{n * 2}</li>)}
      </ul>
      
      {/* 三元运算符 */}
      {user.age >= 18 ? <p>成年人</p> : <p>未成年</p>}
    </div>
  );
}
```

**规则 3:`className` 而非 `class`,`htmlFor` 而非 `for`**

```jsx
// ❌ 错误:class 是 JavaScript 保留字
<div class="container">...</div>

// ✅ 正确:使用 className
<div className="container">...</div>

// ❌ 错误:for 是 JavaScript 保留字
<label for="name">姓名</label>

// ✅ 正确:使用 htmlFor
<label htmlFor="name">姓名</label>
```

**规则 4:所有标签必须闭合**

```jsx
// ❌ 错误:自闭合标签没有 /
<img src="avatar.jpg">
<input type="text">

// ✅ 正确
<img src="avatar.jpg" />
<input type="text" />
```

**规则 5:样式属性用对象**

```jsx
function StyledDiv() {
  const style = {
    color: 'red',
    fontSize: '16px', // 注意:驼峰命名,不是 font-size
    marginTop: '20px'
  };
  
  return (
    <div style={style}>
      我是红色文字
    </div>
  );
}

// 或者内联
<div style={{ color: 'blue', fontWeight: 'bold' }}>
  蓝色粗体
</div>
```

### 2.4 JSX 中的注释

```jsx
function Comments() {
  return (
    <div>
      {/* 这是 JSX 注释 */}
      
      {/* 
        多行注释
        也可以这样写
      */}
      
      <p>内容</p>
      
      {
        // 这是 JavaScript 单行注释(在 {} 里)
      }
      
      {
        /* 这也是 JavaScript 注释 */
      }
    </div>
  );
}
```

### 2.5 JSX 的本质:只是语法糖

> ⚛️ **The Physics: JSX 是编译时的魔法,运行时的普通对象**
> 
> JSX 没有任何运行时开销。它在构建时(通过 Babel)被编译成 `React.createElement` 调用。浏览器永远不会看到 JSX,它只看到编译后的 JavaScript。
> 
> 这和 TypeScript 类似:TypeScript 是编译时的类型检查,编译后就是普通 JavaScript。JSX 是编译时的语法糖,编译后就是普通的函数调用。

```jsx
// 这段 JSX
<Button color="blue" onClick={handleClick}>
  点击我
</Button>

// 等价于
React.createElement(
  Button,
  { color: 'blue', onClick: handleClick },
  '点击我'
)

// 返回一个对象
{
  type: Button,
  props: {
    color: 'blue',
    onClick: handleClick,
    children: '点击我'
  }
}
```

---

## 3. 组件与 Props — 函数即组件,Props 即参数

### 3.1 组件:UI 的乐高积木

> 🎭 **The Drama: 乐高积木的接口**
> 
> 组件就像**乐高积木**。每块积木有凸起(输出)和凹槽(输入)。凸起和凹槽的形状必须匹配,积木才能拼接。
> 
> 在 React 中:
> - **凹槽(输入)** = Props
> - **凸起(输出)** = JSX
> - **形状(接口)** = TypeScript 类型(可选,但强烈推荐)
> 
> 一个设计良好的组件应该像一个**纯函数**:
> - 给定相同的 Props,总是返回相同的 JSX
> - 不修改外部状态(无副作用)
> - 可预测、可测试、可复用

### 3.2 函数组件

**最简单的组件**:

```jsx
// 一个组件就是一个返回 JSX 的函数
function Hello() {
  console.log('[组件] Hello 组件渲染');
  return <h1>Hello, React!</h1>;
}

// 使用组件
function App() {
  return (
    <div>
      <Hello />
      <Hello />
      <Hello />
    </div>
  );
}

console.log('[App] App 组件渲染,会创建 3 个 Hello 组件实例');
```

**组件命名规则**:
- ✅ 必须以大写字母开头(`Hello`,不是 `hello`)
- ✅ 使用 PascalCase 命名(`UserProfile`,不是 `userProfile`)

**为什么必须大写?**

```jsx
// 小写 = HTML 原生标签
<div />  // React.createElement('div')

// 大写 = React 组件
<Hello />  // React.createElement(Hello)
```

### 3.3 Props:组件的 API 合同

> ⚛️ **The Physics: Props — 组件的 API 合同**
> 
> Props 就像一份**合同**。父组件说:"我给你这些数据,你按约定渲染。" 如果你违反合同(传了错误的类型),TypeScript 会在编译时就把合同撕了扔你脸上。
> 
> 这就是**契约式编程**(Design by Contract)在 UI 层的体现。

**传递 Props**:

```jsx
// 定义一个接受 Props 的组件
function Greeting(props) {
  console.log('[Greeting] 接收到的 Props:', props);
  
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>你今年 {props.age} 岁</p>
    </div>
  );
}

// 使用组件并传递 Props
function App() {
  console.log('[App] 渲染 App 组件');
  
  return (
    <div>
      <Greeting name="Alice" age={25} />
      <Greeting name="Bob" age={30} />
    </div>
  );
}

// 输出:
// [App] 渲染 App 组件
// [Greeting] 接收到的 Props: { name: 'Alice', age: 25 }
// [Greeting] 接收到的 Props: { name: 'Bob', age: 30 }
```

**Props 解构(推荐写法)**:

```jsx
// ✅ 推荐:解构 Props,代码更简洁
function Greeting({ name, age }) {
  console.log(`[Greeting] 渲染用户 ${name},年龄 ${age}`);
  
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>你今年 {age} 岁</p>
    </div>
  );
}

// 默认值
function Greeting({ name = 'Guest', age = 0 }) {
  return <h1>Hello, {name}! (年龄: {age})</h1>;
}

<Greeting name="Alice" /> 
// → Hello, Alice! (年龄: 0)
```

**Props 可以传递任何数据**:

```jsx
function Profile({ user, isAdmin, onLogout, children }) {
  console.log('[Profile] Props:', { user, isAdmin, onLogout, children });
  
  return (
    <div>
      {/* 对象 */}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      
      {/* 布尔值 */}
      {isAdmin && <span>管理员</span>}
      
      {/* 函数 */}
      <button onClick={onLogout}>登出</button>
      
      {/* 子元素 */}
      <div>{children}</div>
    </div>
  );
}

// 使用
<Profile
  user={{ name: 'Alice', email: 'alice@example.com' }}
  isAdmin={true}
  onLogout={() => console.log('用户登出')}
>
  <p>这是子元素</p>
</Profile>
```

### 3.4 Props 的不可变性

> 🧘 **Zen of Code: Props 是只读的**
> 
> **核心原则:组件必须像纯函数一样对待 Props,永远不能修改它们。**
> 
> 这不仅是技术要求,这是**函数式编程的哲学**:
> - 纯函数不修改输入参数
> - 纯函数的输出只依赖输入
> - 相同输入 → 相同输出
> 
> 违反这个原则,你会打破 React 的可预测性,引入难以调试的 Bug。

```jsx
// ❌ 错误:修改 Props
function Bad({ user }) {
  user.name = 'Modified'; // 🚨 永远不要这样做!
  return <h1>{user.name}</h1>;
}

// ✅ 正确:如果需要修改,创建副本
function Good({ user }) {
  const modifiedUser = { ...user, name: 'Modified' };
  return <h1>{modifiedUser.name}</h1>;
}
```

### 3.5 children:特殊的 Prop

```jsx
// children 是一个特殊的 Prop,代表组件标签之间的内容
function Card({ title, children }) {
  console.log('[Card] title:', title);
  console.log('[Card] children:', children);
  
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// 使用
<Card title="用户信息">
  <p>姓名: Alice</p>
  <p>邮箱: alice@example.com</p>
</Card>

// children 可以是任何东西:字符串、JSX、甚至函数
<Card title="动态内容">
  {['A', 'B', 'C'].map(letter => <span key={letter}>{letter}</span>)}
</Card>
```

### 3.6 实战示例:用户卡片组件

```jsx
// UserCard.jsx
function UserCard({ user, onEdit, onDelete }) {
  console.log('[UserCard] 渲染用户卡片:', user.name);
  
  // 计算派生数据
  const initials = user.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
  
  console.log('[UserCard] 用户名首字母:', initials);
  
  return (
    <div className="user-card">
      {/* 头像 */}
      <div className="avatar">{initials}</div>
      
      {/* 用户信息 */}
      <div className="info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <p>加入于: {new Date(user.joinedAt).toLocaleDateString()}</p>
      </div>
      
      {/* 操作按钮 */}
      <div className="actions">
        <button onClick={() => {
          console.log('[UserCard] 编辑用户:', user.id);
          onEdit(user.id);
        }}>
          编辑
        </button>
        
        <button onClick={() => {
          console.log('[UserCard] 删除用户:', user.id);
          onDelete(user.id);
        }}>
          删除
        </button>
      </div>
    </div>
  );
}

// 使用
function App() {
  const users = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', joinedAt: '2023-01-15' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', joinedAt: '2023-02-20' }
  ];
  
  return (
    <div>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={(id) => console.log(`编辑用户 ${id}`)}
          onDelete={(id) => console.log(`删除用户 ${id}`)}
        />
      ))}
    </div>
  );
}
```

---

## 4. State 与 useState — 状态是 UI 的记忆

### 4.1 什么是 State?

> 🌌 **The Big Picture: State — UI 的记忆**
> 
> 如果 Props 是组件的**输入参数**(由外部传入,只读),那么 State 就是组件的**内部记忆**(由自己管理,可变)。
> 
> 想象一个计数器:
> - **Props**: 初始值、增量步长、最大值(由父组件决定)
> - **State**: 当前计数(由自己记住)
> 
> State 是组件的"大脑"。没有 State,组件只能是静态的;有了 State,组件可以响应用户交互,可以"记住"事情。

### 4.2 useState Hook 基础

```jsx
import { useState } from 'react';

function Counter() {
  console.log('[Counter] 组件函数执行');
  
  // useState 返回一个数组:[当前值, 更新函数]
  const [count, setCount] = useState(0);
  //      ↑        ↑           ↑
  //    当前值  更新函数    初始值
  
  console.log('[Counter] 当前 count:', count);
  
  const handleIncrement = () => {
    console.log('[Counter] 点击 +1 按钮');
    setCount(count + 1);
    console.log('[Counter] setCount 调用完成(注意:此时 count 还是旧值)');
    // ⚠️ 重要:setCount 不会立即改变 count,它会触发重新渲染
  };
  
  return (
    <div>
      <h1>计数: {count}</h1>
      <button onClick={handleIncrement}>+1</button>
    </div>
  );
}

// 执行流程:
// 1. [Counter] 组件函数执行
// 2. [Counter] 当前 count: 0
// 3. 渲染 UI,显示"计数: 0"
// 4. 用户点击按钮
// 5. [Counter] 点击 +1 按钮
// 6. [Counter] setCount 调用完成(注意:此时 count 还是旧值)
// 7. React 安排重新渲染
// 8. [Counter] 组件函数执行(重新执行)
// 9. [Counter] 当前 count: 1
// 10. 渲染 UI,显示"计数: 1"
```

**关键点**:
- `useState` 返回一个数组,通常用解构赋值
- 初始值只在第一次渲染时使用
- 调用 `setCount` 会触发重新渲染
- 在重新渲染之前,`count` 不会改变(异步更新)

### 4.3 State 更新是异步的

> ⚛️ **The Physics: State 更新的批处理**
> 
> React 不会立即更新 State。它会把多次 `setState` 调用**批量处理**(batching),在当前事件处理函数结束后统一更新,然后触发一次重新渲染。
> 
> 为什么?**性能**。如果每次 `setState` 都立即重新渲染,一个函数里调用 3 次 `setState` 就会重新渲染 3 次,浪费资源。

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    console.log('[1] count:', count); // 0
    
    setCount(count + 1);
    console.log('[2] count:', count); // 还是 0(没有立即改变)
    
    setCount(count + 1);
    console.log('[3] count:', count); // 还是 0
    
    setCount(count + 1);
    console.log('[4] count:', count); // 还是 0
    
    // 最终 count 会变成多少?
    // 答案:1(不是 3!)
    // 因为三次 setCount 都是基于同一个 count(0),所以都是 setCount(0 + 1)
  };
  
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}
```

**解决方案:函数式更新**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    console.log('[正确写法] 使用函数式更新');
    
    // 传入一个函数,参数是上一次的 State
    setCount(prevCount => {
      console.log('[setCount 1] prevCount:', prevCount); // 0
      return prevCount + 1; // 返回 1
    });
    
    setCount(prevCount => {
      console.log('[setCount 2] prevCount:', prevCount); // 1(上一次的结果)
      return prevCount + 1; // 返回 2
    });
    
    setCount(prevCount => {
      console.log('[setCount 3] prevCount:', prevCount); // 2
      return prevCount + 1; // 返回 3
    });
    
    // 最终 count = 3 ✅
  };
  
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={handleClick}>+3</button>
    </div>
  );
}
```

### 4.4 State 可以是任何类型

```jsx
function StateTypes() {
  // 数字
  const [count, setCount] = useState(0);
  
  // 字符串
  const [name, setName] = useState('Alice');
  
  // 布尔值
  const [isVisible, setIsVisible] = useState(false);
  
  // 数组
  const [todos, setTodos] = useState(['学习 React', '写代码']);
  
  // 对象
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  });
  
  // 添加 Todo
  const handleAddTodo = (newTodo) => {
    console.log('[添加 Todo]', newTodo);
    // ✅ 正确:创建新数组
    setTodos(prevTodos => [...prevTodos, newTodo]);
    
    // ❌ 错误:直接修改数组
    // todos.push(newTodo); // 不会触发重新渲染!
  };
  
  // 更新用户信息
  const handleUpdateUser = () => {
    console.log('[更新用户]');
    // ✅ 正确:创建新对象
    setUser(prevUser => ({
      ...prevUser,
      age: prevUser.age + 1
    }));
    
    // ❌ 错误:直接修改对象
    // user.age = user.age + 1; // 不会触发重新渲染!
  };
  
  return <div>...</div>;
}
```

**核心原则:不可变更新**

```jsx
// ❌ 错误:直接修改 State
const [user, setUser] = useState({ name: 'Alice', age: 25 });
user.age = 26; // 不会触发重新渲染
setUser(user); // React 发现对象引用没变,不会重新渲染

// ✅ 正确:创建新对象
setUser({ ...user, age: 26 }); // 新对象,触发重新渲染

// 数组同理
const [items, setItems] = useState([1, 2, 3]);

// ❌ 错误
items.push(4);
setItems(items);

// ✅ 正确
setItems([...items, 4]);

// ✅ 删除
setItems(items.filter(item => item !== 2));

// ✅ 更新
setItems(items.map(item => item === 2 ? 20 : item));
```

### 4.5 实战示例:Todo 列表

```jsx
import { useState } from 'react';

function TodoApp() {
  console.log('[TodoApp] 组件渲染');
  
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React', completed: false },
    { id: 2, text: '写代码', completed: false }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  
  console.log('[TodoApp] 当前 todos:', todos);
  console.log('[TodoApp] 当前 inputValue:', inputValue);
  
  // 添加 Todo
  const handleAdd = () => {
    if (inputValue.trim() === '') {
      console.log('[TodoApp] 输入为空,忽略');
      return;
    }
    
    console.log('[TodoApp] 添加新 Todo:', inputValue);
    
    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false
    };
    
    setTodos(prevTodos => [...prevTodos, newTodo]);
    setInputValue('');
  };
  
  // 切换完成状态
  const handleToggle = (id) => {
    console.log('[TodoApp] 切换 Todo 状态:', id);
    
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };
  
  // 删除 Todo
  const handleDelete = (id) => {
    console.log('[TodoApp] 删除 Todo:', id);
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };
  
  return (
    <div>
      <h1>Todo 列表</h1>
      
      {/* 输入框 */}
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            console.log('[TodoApp] 输入框变化:', e.target.value);
            setInputValue(e.target.value);
          }}
          placeholder="输入新任务"
        />
        <button onClick={handleAdd}>添加</button>
      </div>
      
      {/* Todo 列表 */}
      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => handleDelete(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
      
      {/* 统计 */}
      <p>
        共 {todos.length} 项,
        已完成 {todos.filter(t => t.completed).length} 项
      </p>
    </div>
  );
}
```

---

## 5. 事件处理 — 合成事件系统

### 5.1 React 事件 vs 原生事件

> ⚛️ **The Physics: 合成事件 (SyntheticEvent)**
> 
> React 不直接使用浏览器的原生事件。它实现了一个**合成事件系统**,在所有浏览器中行为一致。
> 
> **好处**:
> - 跨浏览器兼容性(IE、Chrome、Firefox 事件系统差异大)
> - 性能优化(事件委托:React 在根节点监听所有事件,而不是每个元素)
> - 自动清理(事件池复用对象,减少 GC 压力)

**语法对比**:

```jsx
// ❌ HTML 原生事件(字符串,小写)
<button onclick="handleClick()">点击</button>

// ✅ React 事件(驼峰命名,传函数)
<button onClick={handleClick}>点击</button>
```

**常见事件**:

```jsx
function Events() {
  return (
    <div>
      {/* 鼠标事件 */}
      <button onClick={() => console.log('点击')}>onClick</button>
      <div onMouseEnter={() => console.log('鼠标进入')}>onMouseEnter</div>
      <div onMouseLeave={() => console.log('鼠标离开')}>onMouseLeave</div>
      
      {/* 键盘事件 */}
      <input onKeyDown={(e) => console.log('按键:', e.key)} />
      <input onKeyUp={(e) => console.log('松开:', e.key)} />
      
      {/* 表单事件 */}
      <input onChange={(e) => console.log('值变化:', e.target.value)} />
      <form onSubmit={(e) => {
        e.preventDefault();
        console.log('表单提交');
      }}>
        <button type="submit">提交</button>
      </form>
      
      {/* 焦点事件 */}
      <input onFocus={() => console.log('获得焦点')} />
      <input onBlur={() => console.log('失去焦点')} />
    </div>
  );
}
```

### 5.2 事件对象 (Event Object)

```jsx
function EventObject() {
  const handleClick = (event) => {
    console.log('[事件] 类型:', event.type); // 'click'
    console.log('[事件] 目标元素:', event.target); // <button>
    console.log('[事件] 当前元素:', event.currentTarget); // <button>
    console.log('[事件] 鼠标坐标:', event.clientX, event.clientY);
    
    // 阻止默认行为
    event.preventDefault();
    
    // 阻止事件冒泡
    event.stopPropagation();
  };
  
  const handleKeyDown = (event) => {
    console.log('[键盘] 按键:', event.key);
    console.log('[键盘] 按键码:', event.keyCode);
    console.log('[键盘] Ctrl:', event.ctrlKey);
    console.log('[键盘] Shift:', event.shiftKey);
    
    // 检测特定按键
    if (event.key === 'Enter') {
      console.log('[键盘] 用户按下回车');
    }
    
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault(); // 阻止浏览器保存
      console.log('[键盘] 用户按下 Ctrl+S');
    }
  };
  
  return (
    <div>
      <button onClick={handleClick}>点击我</button>
      <input onKeyDown={handleKeyDown} placeholder="按键测试" />
    </div>
  );
}
```

### 5.3 事件处理的常见模式

**模式 1:内联箭头函数**

```jsx
function Inline() {
  const [count, setCount] = useState(0);
  
  return (
    // ✅ 适用于简单逻辑
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}
```

**模式 2:提取为函数**

```jsx
function Extracted() {
  const [count, setCount] = useState(0);
  
  // ✅ 适用于复杂逻辑
  const handleClick = () => {
    console.log('[点击] 当前 count:', count);
    setCount(count + 1);
    console.log('[点击] 更新后将变为:', count + 1);
  };
  
  return <button onClick={handleClick}>点击次数: {count}</button>;
}
```

**模式 3:传递参数**

```jsx
function WithParams() {
  const handleDelete = (id) => {
    console.log('[删除] 删除项目:', id);
  };
  
  const items = [1, 2, 3];
  
  return (
    <ul>
      {items.map(id => (
        <li key={id}>
          项目 {id}
          {/* ✅ 使用箭头函数传递参数 */}
          <button onClick={() => handleDelete(id)}>删除</button>
        </li>
      ))}
    </ul>
  );
}
```

**模式 4:阻止默认行为**

```jsx
function PreventDefault() {
  const handleSubmit = (e) => {
    // 阻止表单提交刷新页面
    e.preventDefault();
    
    console.log('[表单] 提交表单');
    // 处理表单数据...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 5.4 实战示例:表单处理

```jsx
import { useState } from 'react';

function LoginForm() {
  console.log('[LoginForm] 组件渲染');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  
  console.log('[LoginForm] 当前表单数据:', formData);
  
  // 处理输入变化
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log('[表单] 字段变化:', name, type === 'checkbox' ? checked : value);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // 表单验证
  const validate = () => {
    console.log('[表单] 开始验证');
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少 3 个字符';
    }
    
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少 6 个字符';
    }
    
    console.log('[表单] 验证结果:', newErrors);
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理提交
  const handleSubmit = (e) => {
    e.preventDefault(); // 阻止默认提交
    
    console.log('[表单] 提交表单');
    
    if (!validate()) {
      console.log('[表单] 验证失败,阻止提交');
      return;
    }
    
    console.log('[表单] 验证通过,提交数据:', formData);
    
    // 模拟 API 调用
    setTimeout(() => {
      console.log('[API] 登录成功');
      alert(`欢迎, ${formData.username}!`);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>登录</h2>
      
      {/* 用户名 */}
      <div>
        <label htmlFor="username">用户名:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <span style={{ color: 'red' }}>{errors.username}</span>}
      </div>
      
      {/* 密码 */}
      <div>
        <label htmlFor="password">密码:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
      </div>
      
      {/* 记住我 */}
      <div>
        <label>
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          记住我
        </label>
      </div>
      
      {/* 提交按钮 */}
      <button type="submit">登录</button>
    </form>
  );
}
```

---

## 6. 条件渲染与列表 — 数据驱动的 UI

### 6.1 条件渲染

**模式 1:`if`/`else`**

```jsx
function Greeting({ isLoggedIn }) {
  console.log('[Greeting] isLoggedIn:', isLoggedIn);
  
  if (isLoggedIn) {
    return <h1>欢迎回来!</h1>;
  } else {
    return <h1>请先登录</h1>;
  }
}
```

**模式 2:三元运算符**

```jsx
function Greeting({ isLoggedIn }) {
  return (
    <div>
      <h1>
        {isLoggedIn ? '欢迎回来!' : '请先登录'}
      </h1>
    </div>
  );
}
```

**模式 3:逻辑与 (`&&`)**

```jsx
function Notifications({ messages }) {
  console.log('[Notifications] 消息数量:', messages.length);
  
  return (
    <div>
      <h1>通知</h1>
      {messages.length > 0 && (
        <p>你有 {messages.length} 条新消息</p>
      )}
    </div>
  );
}

// 注意:这个写法的陷阱
function Bad({ count }) {
  return (
    <div>
      {/* ❌ 错误:如果 count 是 0,会渲染 "0" */}
      {count && <p>数量: {count}</p>}
      
      {/* ✅ 正确:显式比较 */}
      {count > 0 && <p>数量: {count}</p>}
    </div>
  );
}
```

**模式 4:立即执行函数(IIFE)**

```jsx
function Complex({ user }) {
  return (
    <div>
      {(() => {
        console.log('[IIFE] 计算用户状态');
        
        if (!user) {
          return <p>未登录</p>;
        }
        
        if (user.role === 'admin') {
          return <p>管理员: {user.name}</p>;
        }
        
        if (user.isPremium) {
          return <p>高级用户: {user.name}</p>;
        }
        
        return <p>普通用户: {user.name}</p>;
      })()}
    </div>
  );
}
```

### 6.2 列表渲染

**基础用法**:

```jsx
function UserList() {
  const users = ['Alice', 'Bob', 'Charlie'];
  
  console.log('[UserList] 渲染用户列表:', users);
  
  return (
    <ul>
      {users.map((user, index) => {
        console.log(`[UserList] 渲染用户 ${index}: ${user}`);
        return <li key={index}>{user}</li>;
      })}
    </ul>
  );
}
```

**key 的重要性**:

> 🧠 **CS Master's Bridge: key 为什么重要?**
> 
> React 用 `key` 来识别列表中的每个元素。当列表变化时(增删改),React 通过 `key` 来判断:
> - 哪些元素是新的(需要创建)
> - 哪些元素被删除了(需要销毁)
> - 哪些元素只是移动了位置(可以复用)
> 
> **没有 `key` 的后果**:
> - React 会用索引作为 `key`,导致元素复用错误
> - 性能下降(不必要的 DOM 操作)
> - Bug(状态错乱)

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React' },
    { id: 2, text: '写代码' },
    { id: 3, text: '睡觉' }
  ]);
  
  // ❌ 错误:使用 index 作为 key
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>{todo.text}</li>
      ))}
    </ul>
  );
  
  // ✅ 正确:使用唯一 ID 作为 key
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

**为什么不用 index 作为 key?**

```jsx
function Problem() {
  const [items, setItems] = useState([
    { id: 1, text: 'A' },
    { id: 2, text: 'B' },
    { id: 3, text: 'C' }
  ]);
  
  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // ❌ 使用 index 作为 key
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item.text}
          <input type="text" />
          <button onClick={() => handleDelete(item.id)}>删除</button>
        </li>
      ))}
    </ul>
  );
  
  // 问题:
  // 1. 初始: [A, B, C],key 分别是 [0, 1, 2]
  // 2. 删除 B
  // 3. 新列表: [A, C],key 分别是 [0, 1]
  // 4. React 认为:key=0 的元素还是 A,key=1 的元素从 B 变成了 C
  // 5. React 会复用 key=1 的 DOM 节点,但内容从 B 变成 C
  // 6. 问题:如果 B 的输入框里有内容,删除 B 后,那个内容会跑到 C 上!
}
```

### 6.3 实战示例:数据表格

```jsx
import { useState } from 'react';

function DataTable() {
  console.log('[DataTable] 组件渲染');
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice', age: 25, role: 'admin', active: true },
    { id: 2, name: 'Bob', age: 30, role: 'user', active: true },
    { id: 3, name: 'Charlie', age: 35, role: 'user', active: false }
  ]);
  
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [sortKey, setSortKey] = useState('name'); // 'name' | 'age'
  
  console.log('[DataTable] 当前筛选:', filter);
  console.log('[DataTable] 当前排序:', sortKey);
  
  // 筛选
  const filteredUsers = users.filter(user => {
    if (filter === 'active') return user.active;
    if (filter === 'inactive') return !user.active;
    return true;
  });
  
  console.log('[DataTable] 筛选后用户数:', filteredUsers.length);
  
  // 排序
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.age - b.age;
    }
  });
  
  console.log('[DataTable] 最终显示用户:', sortedUsers);
  
  // 切换激活状态
  const toggleActive = (id) => {
    console.log('[DataTable] 切换用户激活状态:', id);
    
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id
          ? { ...user, active: !user.active }
          : user
      )
    );
  };
  
  return (
    <div>
      <h2>用户列表</h2>
      
      {/* 筛选按钮 */}
      <div>
        <button onClick={() => setFilter('all')}>全部</button>
        <button onClick={() => setFilter('active')}>激活</button>
        <button onClick={() => setFilter('inactive')}>未激活</button>
      </div>
      
      {/* 排序按钮 */}
      <div>
        <button onClick={() => setSortKey('name')}>按名字排序</button>
        <button onClick={() => setSortKey('age')}>按年龄排序</button>
      </div>
      
      {/* 表格 */}
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>名字</th>
            <th>年龄</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                没有数据
              </td>
            </tr>
          ) : (
            sortedUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.age}</td>
                <td>
                  {user.role === 'admin' ? (
                    <span style={{ color: 'red' }}>管理员</span>
                  ) : (
                    <span>普通用户</span>
                  )}
                </td>
                <td>
                  {user.active ? (
                    <span style={{ color: 'green' }}>✓ 激活</span>
                  ) : (
                    <span style={{ color: 'gray' }}>✗ 未激活</span>
                  )}
                </td>
                <td>
                  <button onClick={() => toggleActive(user.id)}>
                    {user.active ? '停用' : '启用'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 7. useEffect 与副作用 — 纯函数核心,不纯的壳

### 7.1 什么是副作用?

> 🧘 **Zen of Code: 纯函数核心,不纯的壳**
> 
> React 组件本质上想做一个**纯函数**:
> - 给相同的 Props 和 State,返回相同的 JSX
> - 不修改外部状态
> - 可预测、可测试
> 
> 但现实世界充满了**副作用**(Side Effects):
> - API 调用
> - 定时器
> - DOM 操作
> - 订阅(WebSocket, 事件监听器)
> - localStorage 读写
> 
> `useEffect` 就是那个**"不纯的壳"**——它把脏活累活隔离在一个明确的边界里,保持组件函数本身的纯净。

**副作用示例**:

```jsx
// ❌ 错误:在组件函数体里直接调用 API(副作用)
function Bad() {
  const [data, setData] = useState(null);
  
  // 🚨 问题:每次渲染都会发请求!
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data)); // setData 触发重新渲染 → 再发请求 → 无限循环!
  
  return <div>{data}</div>;
}

// ✅ 正确:在 useEffect 里调用 API
function Good() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    console.log('[useEffect] 发起 API 请求');
    
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        console.log('[API] 数据返回:', data);
        setData(data);
      });
  }, []); // 空依赖数组 → 只在组件挂载时执行一次
  
  return <div>{data}</div>;
}
```

### 7.2 useEffect 基础

```jsx
import { useEffect } from 'react';

function Example() {
  console.log('[Example] 组件函数执行');
  
  useEffect(() => {
    console.log('[useEffect] Effect 执行');
    
    // 副作用逻辑
    document.title = '新标题';
  });
  
  return <div>Hello</div>;
}

// 执行顺序:
// 1. [Example] 组件函数执行
// 2. React 渲染 JSX
// 3. React 更新 DOM
// 4. [useEffect] Effect 执行(在 DOM 更新后)
```

### 7.3 依赖数组(Dependency Array)

**模式 1:无依赖数组 — 每次渲染都执行**

```jsx
useEffect(() => {
  console.log('[useEffect] 每次渲染都执行');
});
```

**模式 2:空依赖数组 — 只在挂载时执行一次**

```jsx
useEffect(() => {
  console.log('[useEffect] 只在组件挂载时执行一次');
  
  // 常用于:
  // - 初始化 API 调用
  // - 订阅外部数据源
  // - 设置事件监听器
}, []);
```

**模式 3:指定依赖 — 依赖变化时执行**

```jsx
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    console.log('[useEffect] query 变化,重新搜索:', query);
    
    if (query === '') {
      setResults([]);
      return;
    }
    
    // 模拟 API 调用
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(data => {
        console.log('[API] 搜索结果:', data);
        setResults(data);
      });
  }, [query]); // 只在 query 变化时执行
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      <ul>
        {results.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  );
}
```

### 7.4 清理函数(Cleanup)

> ⚛️ **The Physics: 清理函数 — 防止内存泄漏**
> 
> 有些副作用需要**清理**:
> - 定时器(setTimeout, setInterval)
> - 事件监听器
> - WebSocket 连接
> - 订阅
> 
> 如果不清理,这些资源会一直占用内存,导致**内存泄漏**。

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    console.log('[useEffect] 启动定时器');
    
    const intervalId = setInterval(() => {
      console.log('[定时器] 1 秒过去');
      setSeconds(prev => prev + 1);
    }, 1000);
    
    // 返回清理函数
    return () => {
      console.log('[useEffect] 清理:停止定时器');
      clearInterval(intervalId);
    };
  }, []); // 空依赖数组 → 只在挂载时启动,卸载时清理
  
  return <div>已运行 {seconds} 秒</div>;
}

// 执行流程:
// 1. 组件挂载
// 2. [useEffect] 启动定时器
// 3. [定时器] 每秒执行一次
// 4. 组件卸载(例如:父组件条件渲染)
// 5. [useEffect] 清理:停止定时器
```

**事件监听器清理**:

```jsx
function WindowSize() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    console.log('[useEffect] 添加 resize 监听器');
    
    const handleResize = () => {
      console.log('[resize] 窗口大小变化:', window.innerWidth);
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      console.log('[useEffect] 移除 resize 监听器');
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div>窗口宽度: {windowWidth}px</div>;
}
```

### 7.5 常见副作用模式

**模式 1:数据获取**

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log('[useEffect] 开始获取用户数据, userId:', userId);
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/users/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('获取失败');
        return res.json();
      })
      .then(data => {
        console.log('[API] 用户数据:', data);
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[API] 错误:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId]); // userId 变化时重新获取
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!user) return <div>无数据</div>;
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

**模式 2:订阅外部数据**

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    console.log('[useEffect] 连接聊天室:', roomId);
    
    // 创建 WebSocket 连接
    const ws = new WebSocket(`ws://chat.example.com/${roomId}`);
    
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      console.log('[WebSocket] 新消息:', newMessage);
      setMessages(prev => [...prev, newMessage]);
    };
    
    // 清理函数:关闭连接
    return () => {
      console.log('[useEffect] 断开聊天室连接:', roomId);
      ws.close();
    };
  }, [roomId]); // roomId 变化时重新连接
  
  return (
    <div>
      <h2>聊天室 {roomId}</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

**模式 3:localStorage 同步**

```jsx
function Counter() {
  const [count, setCount] = useState(() => {
    // 初始化时从 localStorage 读取
    const saved = localStorage.getItem('count');
    console.log('[useState] 从 localStorage 读取:', saved);
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  
  // 每次 count 变化时保存到 localStorage
  useEffect(() => {
    console.log('[useEffect] 保存 count 到 localStorage:', count);
    localStorage.setItem('count', count.toString());
  }, [count]);
  
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### 7.6 useEffect 的常见陷阱

**陷阱 1:依赖项遗漏**

```jsx
// ❌ 错误:依赖项遗漏
function Bad() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // 🚨 使用了 count,但没在依赖数组里
    }, 1000);
    
    return () => clearInterval(id);
  }, []); // 空依赖数组 → count 永远是 0
  
  // 结果:count 只会从 0 变成 1,然后卡住
}

// ✅ 正确:使用函数式更新
function Good() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + 1); // ✅ 不依赖外部 count
    }, 1000);
    
    return () => clearInterval(id);
  }, []);
}
```

**陷阱 2:无限循环**

```jsx
// ❌ 错误:在 useEffect 里修改依赖项
function Bad() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(newData => setData(newData)); // 修改 data
  }, [data]); // 依赖 data → 无限循环!
  
  // data 变化 → useEffect 执行 → setData → data 变化 → useEffect 执行 → ...
}

// ✅ 正确:只在挂载时获取
function Good() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(newData => setData(newData));
  }, []); // 空依赖数组
}
```

---

## 8. Hooks 进阶 — useRef, useContext, 自定义 Hook

### 8.1 useRef — 跨渲染的"记事本"

> 🌌 **The Big Picture: useRef vs useState**
> 
> - **useState**: 变化会触发重新渲染
> - **useRef**: 变化**不会**触发重新渲染
> 
> useRef 就像组件的"记事本",你可以在上面记录数据,但改变它不会让组件重新渲染。

**用途 1:访问 DOM 元素**

```jsx
import { useRef } from 'react';

function FocusInput() {
  const inputRef = useRef(null);
  
  const handleFocus = () => {
    console.log('[useRef] 聚焦输入框');
    console.log('[useRef] inputRef.current:', inputRef.current);
    
    // 直接操作 DOM
    inputRef.current.focus();
  };
  
  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  );
}
```

**用途 2:保存上一次的值**

```jsx
function PreviousValue({ value }) {
  const prevValueRef = useRef();
  
  console.log('[组件] 当前值:', value);
  console.log('[组件] 上一次的值:', prevValueRef.current);
  
  useEffect(() => {
    // 在渲染之后更新 ref
    prevValueRef.current = value;
  });
  
  return (
    <div>
      <p>当前值: {value}</p>
      <p>上一次的值: {prevValueRef.current}</p>
    </div>
  );
}

// 使用
<PreviousValue value={count} />
```

**用途 3:保存定时器 ID**

```jsx
function StopWatch() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  
  const handleStart = () => {
    console.log('[计时器] 启动');
    setIsRunning(true);
    
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };
  
  const handleStop = () => {
    console.log('[计时器] 停止');
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };
  
  const handleReset = () => {
    console.log('[计时器] 重置');
    clearInterval(intervalRef.current);
    setSeconds(0);
    setIsRunning(false);
  };
  
  return (
    <div>
      <h1>{seconds}秒</h1>
      {!isRunning ? (
        <button onClick={handleStart}>开始</button>
      ) : (
        <button onClick={handleStop}>停止</button>
      )}
      <button onClick={handleReset}>重置</button>
    </div>
  );
}
```

### 8.2 useContext — 跨组件传递数据

> 🎭 **The Drama: Props Drilling 地狱**
> 
> 想象一个 5 层嵌套的组件树:
> ```
> <App>
>   <Page>
>     <Sidebar>
>       <Menu>
>         <MenuItem> {/* 需要 user 数据 */}
> ```
> 
> 如果用 Props 传递,你需要把 `user` 从 `App` 一路传到 `MenuItem`,即使中间的组件根本不需要它。这就是 **Props Drilling**(属性钻取)地狱。
> 
> `useContext` 让你"穿透"中间层,直接把数据传递到需要的组件。

**创建 Context**:

```jsx
import { createContext, useContext, useState } from 'react';

// 1. 创建 Context
const UserContext = createContext(null);

// 2. 提供 Context
function App() {
  const [user, setUser] = useState({ name: 'Alice', role: 'admin' });
  
  console.log('[App] 提供 UserContext:', user);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Page />
    </UserContext.Provider>
  );
}

// 3. 消费 Context
function Page() {
  console.log('[Page] 渲染 Page,不需要 user,不用接收 Props');
  return <Sidebar />;
}

function Sidebar() {
  console.log('[Sidebar] 渲染 Sidebar,不需要 user,不用接收 Props');
  return <Menu />;
}

function Menu() {
  const { user } = useContext(UserContext);
  
  console.log('[Menu] 从 Context 获取 user:', user);
  
  return (
    <div>
      <p>欢迎, {user.name}</p>
      <p>角色: {user.role}</p>
    </div>
  );
}
```

**实战示例:主题切换**

```jsx
const ThemeContext = createContext('light');

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  console.log('[ThemeProvider] 当前主题:', theme);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const styles = {
    backgroundColor: theme === 'light' ? '#fff' : '#333',
    color: theme === 'light' ? '#000' : '#fff',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer'
  };
  
  return (
    <button style={styles} onClick={toggleTheme}>
      切换主题 (当前: {theme})
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>主题示例</h1>
        <ThemedButton />
      </div>
    </ThemeProvider>
  );
}
```

### 8.3 自定义 Hook — 逻辑复用

> ⚛️ **The Physics: 自定义 Hook — 逻辑的乐高积木**
> 
> 自定义 Hook 是**提取和复用状态逻辑**的方式。它不是复用 UI(那是组件的工作),而是复用**逻辑**。
> 
> 命名规则:必须以 `use` 开头(如 `useLocalStorage`, `useFetch`)

**示例 1:useLocalStorage**

```jsx
function useLocalStorage(key, initialValue) {
  console.log(`[useLocalStorage] 初始化, key: ${key}`);
  
  // 从 localStorage 读取初始值
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      console.log(`[useLocalStorage] 从 localStorage 读取:`, saved);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] 读取失败:`, error);
      return initialValue;
    }
  });
  
  // 保存到 localStorage
  useEffect(() => {
    console.log(`[useLocalStorage] 保存到 localStorage, key: ${key}, value:`, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[useLocalStorage] 保存失败:`, error);
    }
  }, [key, value]);
  
  return [value, setValue];
}

// 使用
function Counter() {
  const [count, setCount] = useLocalStorage('count', 0);
  
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

**示例 2:useFetch**

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log(`[useFetch] 开始请求:`, url);
    
    setLoading(true);
    setError(null);
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(`[useFetch] 数据返回:`, data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(`[useFetch] 错误:`, err);
        setError(err.message);
        setLoading(false);
      });
  }, [url]);
  
  return { data, loading, error };
}

// 使用
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

**示例 3:useDebounce(防抖)**

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    console.log(`[useDebounce] 值变化:`, value);
    console.log(`[useDebounce] 设置 ${delay}ms 延迟`);
    
    const timeoutId = setTimeout(() => {
      console.log(`[useDebounce] 延迟结束,更新为:`, value);
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      console.log(`[useDebounce] 清理定时器`);
      clearTimeout(timeoutId);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// 使用:搜索框
function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery) {
      console.log(`[搜索] 发起搜索:`, debouncedQuery);
      // fetch(`/api/search?q=${debouncedQuery}`)...
    }
  }, [debouncedQuery]);
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="输入搜索..."
      />
      <p>搜索: {debouncedQuery}</p>
    </div>
  );
}
```

---

## 9. 组件设计原则 — 单一职责、组合优于继承

### 9.1 单一职责原则(SRP)

> 🧘 **Zen of Code: 一个组件应该只做一件事**
> 
> 如果你的组件叫 `UserProfileAndSettingsAndNotifications`,你可能做错了。
> 
> 好的组件应该像一个纯函数:名字就是它的职责,代码就是它的实现。

**❌ 坏示例:职责混乱**

```jsx
function UserDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [settings, setSettings] = useState({});
  
  // 获取用户
  useEffect(() => { /* fetch user */ }, [userId]);
  
  // 获取帖子
  useEffect(() => { /* fetch posts */ }, [userId]);
  
  // 获取评论
  useEffect(() => { /* fetch comments */ }, [userId]);
  
  // 获取设置
  useEffect(() => { /* fetch settings */ }, [userId]);
  
  // ... 200 行代码 ...
  
  return (
    <div>
      {/* 用户信息 */}
      <div>{user?.name}</div>
      
      {/* 帖子列表 */}
      <div>{posts.map(...)}</div>
      
      {/* 评论列表 */}
      <div>{comments.map(...)}</div>
      
      {/* 设置面板 */}
      <div>{/* 设置表单 */}</div>
    </div>
  );
}
```

**✅ 好示例:拆分组件**

```jsx
// 用户信息组件(单一职责:显示用户信息)
function UserProfile({ userId }) {
  const { data: user, loading } = useFetch(`/api/users/${userId}`);
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 帖子列表组件(单一职责:显示帖子)
function UserPosts({ userId }) {
  const { data: posts, loading } = useFetch(`/api/users/${userId}/posts`);
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div className="user-posts">
      <h3>帖子</h3>
      {posts.map(post => <PostItem key={post.id} post={post} />)}
    </div>
  );
}

// 仪表盘组件(单一职责:组合子组件)
function UserDashboard({ userId }) {
  return (
    <div className="user-dashboard">
      <UserProfile userId={userId} />
      <UserPosts userId={userId} />
      <UserComments userId={userId} />
      <UserSettings userId={userId} />
    </div>
  );
}
```

### 9.2 组合优于继承

> 🎭 **The Drama: React 没有继承**
> 
> 你可能发现了:React 组件不用 `class` 继承。这是**刻意设计**的。
> 
> React 团队认为:**组合(Composition)比继承(Inheritance)更灵活、更容易理解**。
> 
> 不要试图创建一个 `BaseComponent` 然后让所有组件继承它。用组合:用小组件拼出大组件。

**组合示例:容器组件**

```jsx
// 通用卡片容器
function Card({ title, children }) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// 使用组合创建不同的卡片
function UserCard({ user }) {
  return (
    <Card title="用户信息">
      <p>{user.name}</p>
      <p>{user.email}</p>
    </Card>
  );
}

function StatsCard({ stats }) {
  return (
    <Card title="统计数据">
      <p>访问量: {stats.views}</p>
      <p>点赞: {stats.likes}</p>
    </Card>
  );
}
```

**组合示例:高阶组件(HOC)**

```jsx
// HOC:为组件添加加载状态
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>加载中...</div>;
    }
    
    return <Component {...props} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);

<UserListWithLoading isLoading={loading} users={users} />
```

### 9.3 受控组件 vs 非受控组件

**受控组件(Controlled)**:

```jsx
// 受控组件:React 控制输入框的值
function ControlledInput() {
  const [value, setValue] = useState('');
  
  console.log('[受控] 当前值:', value);
  
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        console.log('[受控] 值变化:', e.target.value);
        setValue(e.target.value);
      }}
    />
  );
}

// 优点:React 完全控制,可以验证、格式化
// 缺点:每次输入都触发渲染
```

**非受控组件(Uncontrolled)**:

```jsx
// 非受控组件:DOM 控制输入框的值,React 用 ref 读取
function UncontrolledInput() {
  const inputRef = useRef();
  
  const handleSubmit = () => {
    console.log('[非受控] 读取值:', inputRef.current.value);
  };
  
  return (
    <div>
      <input type="text" ref={inputRef} defaultValue="初始值" />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}

// 优点:性能好(不触发渲染)
// 缺点:React 控制力弱
```

---

## 10. 🧘 Zen of Code: 声明式的禅

> **"不要告诉世界怎么变,告诉它应该是什么样子。"**
> 
> 这不仅是编程原则,这是**道家思想在代码中的投射**。
> 
> 老子说:"无为而治"——不是什么都不做,而是不过度干预,顺应自然规律。
> 
> React 的声明式就是"无为"的程序化表达:
> - 你不直接做事(操纵 DOM)
> - 你只描述结果(JSX)
> - 让框架(道)去安排过程
> 
> **命令式**是微观管理:你告诉每个员工每一步怎么做。
> **声明式**是设定目标:你说"我要这个结果",团队自己找到最佳路径。
> 
> 这就是为什么 React 代码更容易维护:你只需要看一个地方(当前的 State 和 Props)就知道 UI 是什么样子,而不需要追踪一堆命令式的 DOM 操作。

**回顾 Stage 1 的 DOM 操作**:

```javascript
// Stage 1:命令式 DOM 操作
const button = document.createElement('button');
button.textContent = '点击次数: 0';

let count = 0;

button.addEventListener('click', () => {
  count++;
  button.textContent = `点击次数: ${count}`;
});

document.body.appendChild(button);

// 问题:
// - UI(button.textContent)和数据(count)分离
// - 每次变化都要手动同步
// - 代码难以理解(必须逐行执行才能知道结果)
```

**现在的 React 版本**:

```jsx
// React:声明式
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}

// 优点:
// - UI 是 State 的纯函数
// - 数据变化 → UI 自动变化
// - 代码可预测(一眼就知道 UI 长什么样)
```

**连接到未来的 Next.js**:

在 Next.js 章节,你会看到声明式思想的进一步演进:

- **文件系统路由**: 文件结构 = 路由结构(声明式)
- **Server Components**: 描述 UI,React 决定在哪里渲染(声明式)
- **Server Actions**: 描述表单应该做什么,框架处理网络传输(声明式)

声明式是一条贯穿现代前端的哲学主线。

---

## 11. 章节练习

### 练习 1:计数器增强版

创建一个计数器,支持:
- +1、-1、重置按钮
- 步长可调(1, 5, 10)
- 最大值和最小值限制
- 历史记录(可以撤销操作)

<details>
<summary>查看答案</summary>

```jsx
import { useState } from 'react';

function AdvancedCounter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const MAX = 100;
  const MIN = -100;
  
  const updateCount = (newCount) => {
    // 限制范围
    const clampedCount = Math.max(MIN, Math.min(MAX, newCount));
    
    // 更新历史
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(clampedCount);
    
    setCount(clampedCount);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const handleIncrement = () => updateCount(count + step);
  const handleDecrement = () => updateCount(count - step);
  const handleReset = () => updateCount(0);
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCount(history[newIndex]);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCount(history[newIndex]);
    }
  };
  
  return (
    <div>
      <h1>计数: {count}</h1>
      
      <div>
        <button onClick={handleDecrement} disabled={count <= MIN}>-{step}</button>
        <button onClick={handleIncrement} disabled={count >= MAX}>+{step}</button>
        <button onClick={handleReset}>重置</button>
      </div>
      
      <div>
        <label>
          步长:
          <select value={step} onChange={(e) => setStep(Number(e.target.value))}>
            <option value="1">1</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
        </label>
      </div>
      
      <div>
        <button onClick={handleUndo} disabled={historyIndex === 0}>撤销</button>
        <button onClick={handleRedo} disabled={historyIndex === history.length - 1}>重做</button>
      </div>
      
      <p>范围: {MIN} ~ {MAX}</p>
      <p>历史记录: {history.join(' → ')}</p>
    </div>
  );
}
```

</details>

### 练习 2:Todo 列表完整版

创建一个 Todo 应用,支持:
- 添加、删除、编辑任务
- 标记完成/未完成
- 过滤(全部/进行中/已完成)
- localStorage 持久化
- 任务统计

<details>
<summary>查看答案</summary>

```jsx
import { useState, useEffect } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  const handleAdd = (text) => {
    if (text.trim() === '') return;
    
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTodos(prev => [newTodo, ...prev]);
  };
  
  const handleToggle = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const handleDelete = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };
  
  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };
  
  const handleSaveEdit = () => {
    if (editText.trim() === '') return;
    
    setTodos(prev =>
      prev.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      )
    );
    
    setEditingId(null);
    setEditText('');
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };
  
  return (
    <div>
      <h1>Todo 列表</h1>
      
      <TodoInput onAdd={handleAdd} />
      
      <FilterButtons current={filter} onChange={setFilter} />
      
      <div>
        {filteredTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isEditing={editingId === todo.id}
            editText={editText}
            onEditTextChange={setEditText}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
          />
        ))}
      </div>
      
      <Stats stats={stats} />
    </div>
  );
}

function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(text);
    setText('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入新任务..."
      />
      <button type="submit">添加</button>
    </form>
  );
}

function FilterButtons({ current, onChange }) {
  const filters = ['all', 'active', 'completed'];
  
  return (
    <div>
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          style={{ fontWeight: current === filter ? 'bold' : 'normal' }}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

function TodoItem({
  todo,
  isEditing,
  editText,
  onEditTextChange,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit
}) {
  if (isEditing) {
    return (
      <div>
        <input
          type="text"
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
        />
        <button onClick={onSaveEdit}>保存</button>
        <button onClick={onCancelEdit}>取消</button>
      </div>
    );
  }
  
  return (
    <div style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onStartEdit(todo)}>编辑</button>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </div>
  );
}

function Stats({ stats }) {
  return (
    <div>
      <p>总计: {stats.total}</p>
      <p>进行中: {stats.active}</p>
      <p>已完成: {stats.completed}</p>
    </div>
  );
}
```

</details>

### 练习 3:实时搜索

创建一个搜索框,支持:
- 输入防抖(500ms)
- 显示搜索历史(最多 5 条)
- 清除历史
- 高亮匹配结果

<details>
<summary>查看答案</summary>

```jsx
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [value, delay]);
  
  return debouncedValue;
}

function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const debouncedQuery = useDebounce(query, 500);
  
  // 搜索
  useEffect(() => {
    if (debouncedQuery === '') {
      setResults([]);
      return;
    }
    
    console.log('[搜索] 搜索:', debouncedQuery);
    
    // 模拟 API 调用
    const mockData = [
      'React',
      'React Router',
      'React Query',
      'Redux',
      'Next.js',
      'Remix',
      'Vite'
    ];
    
    const filtered = mockData.filter(item =>
      item.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
    
    setResults(filtered);
    
    // 添加到历史
    if (!history.includes(debouncedQuery)) {
      const newHistory = [debouncedQuery, ...history.slice(0, 4)];
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [debouncedQuery]);
  
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };
  
  return (
    <div>
      <h2>搜索</h2>
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="输入搜索..."
      />
      
      {query && query !== debouncedQuery && <span>搜索中...</span>}
      
      <div>
        <h3>结果</h3>
        {results.map(item => (
          <div key={item}>
            <HighlightText text={item} highlight={debouncedQuery} />
          </div>
        ))}
      </div>
      
      {history.length > 0 && (
        <div>
          <h3>历史记录</h3>
          {history.map((item, index) => (
            <div key={index} onClick={() => setQuery(item)}>
              {item}
            </div>
          ))}
          <button onClick={clearHistory}>清除历史</button>
        </div>
      )}
    </div>
  );
}

function HighlightText({ text, highlight }) {
  if (!highlight) return <span>{text}</span>;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}
```

</details>

---

## 下一步

恭喜你完成了 React 基础!现在你已经掌握了:

- ✅ React 的核心哲学和声明式编程思想
- ✅ JSX 语法和组件化开发
- ✅ State 管理和副作用处理
- ✅ Hooks 的使用和自定义 Hook
- ✅ 组件设计最佳实践

**接下来的学习路径**:

1. **完成 Stage 2 其他章节** — TypeScript、Node.js、异步编程
2. **进入 Stage Modern Frontend** — Next.js、Tailwind CSS、shadcn/ui
3. **实战项目** — 用 React 构建真实应用

**向后连接**:

在 `stage-modern-frontend/01-nextjs-app-router` 章节,你会看到:
- React 的 Server Components(在服务器运行的组件)
- 文件系统路由(约定优于配置)
- Server Actions(表单提交的新范式)

React 是现代前端的基石。你在这里学到的声明式思维、组件化设计、状态管理,将贯穿你未来所有的前端开发工作。

**祝你学习愉快!** 🎉
