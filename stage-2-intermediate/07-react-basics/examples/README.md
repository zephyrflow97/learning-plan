# React Basics 代码示例

本目录包含 React 基础章节的所有代码示例，使用现代 React Hooks 和函数组件。

## 📁 目录结构

### 1. 基础组件 (`components/`)
- `Greeting.jsx` - Props 传递和解构
- `UserCard.jsx` - 实战组件：用户卡片
- `Card.jsx` - 组合组件（children）
- `Button.jsx` - 可复用按钮组件

### 2. State 管理 (`state/`)
- `Counter.jsx` - useState 基础
- `CounterAdvanced.jsx` - 函数式更新、历史记录
- `Form.jsx` - 表单状态管理
- `StateTypes.jsx` - 不同类型的 State（数组、对象）

### 3. 副作用处理 (`effects/`)
- `DataFetching.jsx` - useEffect 数据获取
- `Timer.jsx` - 定时器和清理函数
- `WindowSize.jsx` - 事件监听器
- `LocalStorage.jsx` - localStorage 同步

### 4. 完整应用 (`todo-app/`)
- `TodoApp.jsx` - 完整 Todo 应用（主组件）
- `TodoInput.jsx` - 输入组件
- `TodoItem.jsx` - 任务项组件
- `FilterButtons.jsx` - 过滤按钮
- `Stats.jsx` - 统计组件

### 5. 自定义 Hooks (`hooks/`)
- `useLocalStorage.js` - localStorage Hook
- `useFetch.js` - 数据获取 Hook
- `useDebounce.js` - 防抖 Hook
- `useToggle.js` - 开关 Hook
- `usePrevious.js` - 获取上一次的值

## 🚀 使用方法

这些是 React 组件文件（.jsx），需要在 React 项目中使用：

### 方法 1: Vite 快速开始（推荐）

```bash
# 创建新项目
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install

# 复制示例文件到 src/
# 然后在 App.jsx 中导入使用

npm run dev
```

### 方法 2: CodeSandbox 在线运行

1. 访问 [codesandbox.io](https://codesandbox.io)
2. 选择 React 模板
3. 粘贴示例代码
4. 立即预览

### 方法 3: 集成到现有项目

```jsx
// 在你的 React 项目中
import Counter from './examples/state/Counter';

function App() {
  return <Counter />;
}
```

## 🎯 学习建议

1. **按顺序学习**: 
   - 先学 `components/`（组件基础）
   - 再学 `state/`（状态管理）
   - 然后 `effects/`（副作用）
   - 最后 `hooks/`（自定义 Hook）

2. **实战练习**: 
   - 从 `todo-app/` 开始，理解完整应用结构
   - 尝试添加新功能（如优先级、截止日期）

3. **调试技巧**:
   - 使用 React DevTools 查看组件树
   - 在代码中添加 `console.log` 观察执行流程

## 📚 相关章节

- [主 README](../README.md) - React 基础完整教程
- [练习题](../README.md#11-章节练习) - 实战练习

## 🔧 依赖说明

所有示例只需要 React 核心库：

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

## 💡 提示

- 所有组件都包含详细注释和 `console.log`
- 建议配合主 README 阅读
- 每个示例都可以作为项目的起点
- 注意观察控制台输出，理解组件生命周期

## ⚠️ 注意事项

- 这些是示例代码，生产环境需要进一步优化
- 某些示例使用了模拟数据，实际项目需要替换为真实 API
- 建议使用 TypeScript 版本以获得更好的类型安全
