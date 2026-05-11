# React 练习题答案

本目录包含 React Basics 相关练习题的答案。

## 📋 练习题列表

### 3. 计数器组件 (带 localStorage 持久化)
- **文件**: `03-counter.jsx`
- **技术点**: useState、useEffect、localStorage
- **关键概念**:
  - `useState(() => {})` 函数式初始化,只在首次渲染时执行
  - `useEffect` 副作用管理,依赖数组控制执行时机
  - `localStorage.setItem/getItem` 浏览器本地存储
  - 类型转换: localStorage 只存储字符串

### 4. 列表过滤器
- **文件**: `04-user-list.jsx`
- **技术点**: 列表渲染、条件渲染、状态管理
- **关键概念**:
  - `array.filter()` 过滤数组
  - `array.map()` 渲染列表,必须提供 `key` prop
  - `toLowerCase()` 大小写不敏感搜索
  - `条件渲染`: 三元表达式、逻辑与运算符

---

## 🎯 学习要点

### React Hooks 核心概念

#### useState
```jsx
// 基础用法
const [count, setCount] = useState(0);

// 函数式初始化(只执行一次)
const [count, setCount] = useState(() => {
  const saved = localStorage.getItem('count');
  return saved ? parseInt(saved) : 0;
});

// 基于前值更新
setCount(prev => prev + 1);
```

#### useEffect
```jsx
// 每次渲染后执行
useEffect(() => {
  console.log('渲染完成');
});

// 只在首次渲染执行
useEffect(() => {
  console.log('组件挂载');
}, []);

// 依赖变化时执行
useEffect(() => {
  console.log('count 变化了');
}, [count]);

// 清理函数
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);
```

### 常见陷阱

1. **忘记依赖数组**: `useEffect` 没有依赖数组会在每次渲染后执行
2. **错误的初始化方式**: `useState(expensive())` 每次渲染都执行,应该用 `useState(() => expensive())`
3. **直接修改状态**: 应该用 `setCount(count + 1)`,不要 `count++`
4. **列表渲染缺少 key**: 会导致性能问题和渲染错误

### 性能优化

- **useMemo**: 缓存计算结果
- **useCallback**: 缓存函数引用
- **React.memo**: 防止不必要的重渲染

---

## 🔗 相关资源

- [React Hooks 官方文档](https://react.dev/reference/react)
- [useState Hook](https://react.dev/reference/react/useState)
- [useEffect Hook](https://react.dev/reference/react/useEffect)
- [Thinking in React](https://react.dev/learn/thinking-in-react)
