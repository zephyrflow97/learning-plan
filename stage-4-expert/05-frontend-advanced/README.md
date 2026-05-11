# 第 5 章：前端高级

## 📋 本章概述

现代前端开发已经演变成复杂的工程领域。本章将深入学习 React 高级模式、状态管理方案、服务端渲染、性能优化、可访问性和前端安全，帮助你构建高性能、可维护的前端应用。

### 学习目标

完成本章后，你将能够：

- ✅ 掌握 React Hooks、Context、HOC 等高级模式
- ✅ 选择和使用合适的状态管理方案
- ✅ 理解和实现服务端渲染（SSR）
- ✅ 进行前端性能优化
- ✅ 实现可访问性（a11y）最佳实践
- ✅ 掌握前端安全防护
- ✅ 编写高质量的前端测试

### 前置知识

- ✅ 熟练掌握 React 基础
- ✅ 理解 JavaScript/TypeScript
- ✅ 熟悉 HTML、CSS
- ✅ 了解 HTTP 协议

---

## 1. React 高级模式

### 1.1 Custom Hooks

> **🧱 The Metaphor: The Lego Brick**
> Custom Hooks 就像是**乐高积木**。
> 你把复杂的逻辑（状态管理、副作用、API 调用）封装在一个小方块里。
> 在组件中，你不需要关心积木内部是怎么连接电路的，你只需要把积木**插上去**（调用 Hook）。
> 这样，你的组件就从“一团乱麻的电线”变成了“整洁的积木搭建”。

Custom Hooks 是复用组件逻辑的强大工具。

**设计原则：**
- 以 `use` 开头命名
- 封装可复用的逻辑
- 保持单一职责
- 返回值应该简洁明确

**常见模式：**

**数据获取 Hook：**
```typescript
function useAsync<T>(asyncFunction: () => Promise<T>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [asyncFunction]);

  return { ...state, execute };
}
```

### 1.2 高阶组件（HOC）

HOC 是接受组件并返回新组件的函数，用于复用组件逻辑。

**使用场景：**
- 权限控制
- 数据预加载
- 日志记录
- 性能监控

**vs Hooks：** Hooks 通常更简洁，HOC 更适合包装整个组件。

### 1.3 Render Props

通过函数prop共享代码的技术。

**使用场景：**
- 需要精确控制渲染时机
- 组件需要高度可定制

**vs Hooks：** Hooks 通常是更好的选择，除非需要 render props 的特定优势。

### 1.4 Compound Components

组合组件模式，允许组件共享隐式状态。

**典型例子：**
```typescript
<Select value={value} onChange={setValue}>
  <Select.Option value="1">选项 1</Select.Option>
  <Select.Option value="2">选项 2</Select.Option>
</Select>
```

---

## 2. 状态管理

### 2.1 状态管理方案对比

> **🏢 The Metaphor: The Corporation vs The Startup**
> *   **Redux (The Corporation)**: 就像一家**大公司**。有严格的流程（Action -> Reducer -> Store），所有变更都要打报告（Dispatch），所有状态都归中央管理。适合大型、复杂的业务，虽然繁琐，但可预测、可追溯。
> *   **Zustand/Jotai (The Startup)**: 就像一家**初创公司**。扁平化管理，直接修改状态（Hooks），灵活、快速、没有太多废话。适合中小型项目，或者追求开发效率的场景。

| 方案 | 适用场景 | 学习曲线 | 性能 | TypeScript 支持 |
|------|----------|----------|------|----------------|
| **useState** | 本地状态 | 低 | 优秀 | 优秀 |
| **Context** | 跨组件状态 | 低 | 一般 | 优秀 |
| **Redux Toolkit** | 大型应用 | 中 | 优秀 | 优秀 |
| **Zustand** | 中小型应用 | 低 | 优秀 | 优秀 |
| **Jotai** | 原子化状态 | 低 | 优秀 | 优秀 |
| **MobX** | 响应式状态 | 中 | 优秀 | 良好 |

### 2.2 Redux Toolkit

Redux Toolkit 是 Redux 的官方推荐工具集，大幅简化了 Redux 的使用。

**核心概念：**
- **Slice**：包含 reducer 和 actions 的状态片段
- **createSlice**：自动生成 actions 和 reducers
- **configureStore**：简化 store 配置
- **createAsyncThunk**：处理异步逻辑

### 2.3 Zustand

轻量级状态管理库，API 简洁直观。

**特点：**
- 无样板代码
- 无需 Provider
- 基于 Hooks
- 支持中间件

### 2.4 状态管理最佳实践

**状态分层：**
1. **本地状态**：UI 状态（展开/折叠）→ useState
2. **共享状态**：跨组件状态 → Context/Zustand
3. **服务端状态**：API 数据 → React Query
4. **URL 状态**：路由参数 → React Router
5. **全局状态**：用户信息、主题 → Redux/Zustand

**避免过度使用全局状态：**
- 能用本地状态就不用全局状态
- 能用 props 传递就不用 Context
- 优先使用状态提升而不是全局状态

---

## 3. 服务端渲染（SSR）

### 3.1 渲染模式对比

> **🍱 The Metaphor: The Pre-cooked Meal**
> *   **CSR (Client-Side Rendering)**: 就像**自助火锅**。给你一堆生食材（JS Bundle），你自己煮（浏览器执行 JS 渲染 DOM）。首屏慢（要等水开），但吃起来爽（交互快）。
> *   **SSR (Server-Side Rendering)**: 就像**外卖**。厨师（服务器）把菜做好了（HTML）送过来。你打开就能吃（首屏快），但如果要加菜，还得等厨师做（服务器压力大）。
> *   **SSG (Static Site Generation)**: 就像**超市便当**。工厂提前批量做好了（构建时生成），放在货架上。最快，但每个人吃到的都一样（静态内容）。

**客户端渲染（CSR）：**
- 优势：交互性强，服务器压力小
- 劣势：首屏慢，SEO 不友好

**服务端渲染（SSR）：**
- 优势：首屏快，SEO 友好
- 劣势：服务器压力大，开发复杂

**静态生成（SSG）：**
- 优势：性能最佳，成本低
- 劣势：只适合静态内容

**增量静态生成（ISR）：**
- 优势：兼顾性能和实时性
- 劣势：Next.js 特有

### 3.2 Next.js

Next.js 是 React 的全栈框架，内置 SSR、SSG、ISR 支持。

**核心特性：**

**页面路由：**
```
pages/
  index.tsx          → /
  about.tsx          → /about
  posts/[id].tsx     → /posts/1, /posts/2, ...
  api/users.ts       → /api/users
```

**数据获取方法：**

- **getServerSideProps**：每次请求时服务端渲染
- **getStaticProps**：构建时生成静态页面
- **getStaticPaths**：定义动态路由的路径
- **Client-side**：客户端获取数据（SWR/React Query）

**选择指南：**
- 数据经常变化 → getServerSideProps
- 数据不常变化 → getStaticProps + ISR
- 用户特定数据 → Client-side

---

## 4. 性能优化

### 4.1 性能监控

**Web Vitals 核心指标：**

- **LCP（Largest Contentful Paint）**：最大内容绘制 < 2.5s
- **FID（First Input Delay）**：首次输入延迟 < 100ms
- **CLS（Cumulative Layout Shift）**：累积布局偏移 < 0.1

**监控工具：**
- Chrome DevTools
- Lighthouse
- Web Vitals 库
- Google Analytics

### 4.2 优化技巧

**代码分割：**
```typescript
// 动态导入
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 路由级别代码分割
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

**图片优化：**
- 使用 Next.js Image 组件
- 懒加载
- 响应式图片
- WebP 格式

**渲染优化：**
```typescript
// React.memo - 避免不必要的重渲染
const MemoizedComponent = memo(Component);

// useMemo - 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback - 缓存函数
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

**虚拟列表：**

对于长列表，只渲染可见区域的元素：
- react-window
- react-virtualized

---

## 5. 可访问性（a11y）

### 5.1 可访问性基础

**为什么重要：**
- 法律要求（WCAG 标准）
- 更好的用户体验
- SEO 优化
- 社会责任

**WCAG 四大原则（POUR）：**
- **Perceivable**：可感知
- **Operable**：可操作
- **Understandable**：可理解
- **Robust**：鲁棒性

### 5.2 实践指南

**语义化 HTML：**
```tsx
// ✅ 使用语义化标签
<nav><a href="/home">首页</a></nav>
<main><article>...</article></main>
<button onClick={handleClick}>提交</button>

// ❌ 避免非语义化标签
<div onClick={handleClick}>提交</div>
```

**ARIA 属性：**
```tsx
<button 
  aria-label="关闭对话框"
  aria-expanded={isOpen}
>
  ×
</button>

<div role="alert" aria-live="polite">
  保存成功
</div>
```

**键盘导航：**
- 所有交互元素可通过键盘访问
- 焦点顺序合理
- 焦点可见
- 快捷键支持

**颜色对比度：**
- 正常文本：至少 4.5:1
- 大文本：至少 3:1
- 不仅依靠颜色传达信息

---

## 6. 前端安全

### 6.1 XSS 防护

**Content Security Policy (CSP)：**
```typescript
// Next.js 配置
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
  }
];
```

**输出转义：**
```tsx
// React 自动转义
<div>{userInput}</div>  // ✅ 安全

// 避免使用 dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // ⚠️ 危险
```

### 6.2 CSRF 防护

**SameSite Cookie：**
```typescript
res.cookie('token', value, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

**CSRF Token：**
- 服务端生成随机 Token
- 存储在 Session
- 每次请求验证 Token

---

## 7. 前端测试

### 7.1 测试金字塔

```
        E2E 测试（少量）
      /              \
    集成测试（适量）
   /                  \
单元测试（大量）
```

### 7.2 React Testing Library

**测试原则：**
- 测试用户行为，不是实现细节
- 使用可访问性查询（getByRole）
- 避免测试组件内部状态

**示例：**
```typescript
test('用户可以提交表单', async () => {
  render(<LoginForm />);
  
  // 查找输入框
  const emailInput = screen.getByRole('textbox', { name: /邮箱/i });
  const passwordInput = screen.getByLabelText(/密码/i);
  const submitButton = screen.getByRole('button', { name: /登录/i });
  
  // 模拟用户输入
  await userEvent.type(emailInput, 'user@example.com');
  await userEvent.type(passwordInput, 'password123');
  await userEvent.click(submitButton);
  
  // 断言
  expect(await screen.findByText(/登录成功/i)).toBeInTheDocument();
});
```

### 7.3 E2E 测试

使用 Cypress 或 Playwright 进行端到端测试。

---

## 8. 实战练习

### 练习 1：性能优化

给定一个性能较差的应用，进行优化：
1. 分析性能瓶颈
2. 实现代码分割
3. 优化图片加载
4. 减少重渲染

### 练习 2：状态管理

实现一个电商购物车：
1. 选择合适的状态管理方案
2. 实现添加/删除商品
3. 计算总价
4. 持久化到 localStorage

### 练习 3：可访问性

改进一个表单的可访问性：
1. 添加正确的 ARIA 属性
2. 实现键盘导航
3. 确保颜色对比度
4. 使用屏幕阅读器测试

---

## 9. 延伸阅读

### 推荐资源
- [React 官方文档](https://react.dev/)
- [Next.js 文档](https://nextjs.org/docs)
- [Web.dev](https://web.dev/) - Google 的 Web 性能指南
- [A11y Project](https://www.a11yproject.com/)

### 工具推荐
- **开发工具**：React DevTools
- **状态管理**：Redux DevTools, Zustand DevTools
- **性能分析**：Lighthouse, Web Vitals
- **测试**：Jest, React Testing Library, Cypress
- **可访问性**：axe DevTools, WAVE

---

**下一章：**[第 6 章 - 系统设计](../06-system-design/)
