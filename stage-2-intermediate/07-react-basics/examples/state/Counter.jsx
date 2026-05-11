// Counter.jsx - useState 基础示例
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
  
  const handleDecrement = () => {
    console.log('[Counter] 点击 -1 按钮');
    setCount(count - 1);
  };
  
  const handleReset = () => {
    console.log('[Counter] 重置计数');
    setCount(0);
  };
  
  return (
    <div className="counter">
      <h1>计数: {count}</h1>
      <div className="button-group">
        <button onClick={handleDecrement}>-1</button>
        <button onClick={handleIncrement}>+1</button>
        <button onClick={handleReset}>重置</button>
      </div>
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

export default Counter;
