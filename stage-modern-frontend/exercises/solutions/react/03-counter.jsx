import { useState, useEffect } from 'react';

/**
 * 计数器组件 - 带 localStorage 持久化
 */
function Counter() {
  // 初始化状态:优先从 localStorage 读取
  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem('counter');
    console.log('[初始化] 从 localStorage 读取:', savedCount);
    
    // localStorage 返回的是字符串,需要转换为数字
    return savedCount !== null ? parseInt(savedCount, 10) : 0;
  });

  // 副作用:每次 count 变化时,保存到 localStorage
  useEffect(() => {
    console.log('[副作用] 保存计数到 localStorage:', count);
    localStorage.setItem('counter', count.toString());
  }, [count]); // 依赖数组:只在 count 变化时执行

  // 事件处理函数
  const increment = () => {
    console.log('[操作] +1, 当前值:', count);
    setCount(count + 1);
  };

  const decrement = () => {
    console.log('[操作] -1, 当前值:', count);
    setCount(count - 1);
  };

  const reset = () => {
    console.log('[操作] 重置');
    setCount(0);
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '40px',
      fontFamily: 'sans-serif'
    }}>
      <h1>🔢 计数器</h1>
      
      {/* 显示当前计数 */}
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        margin: '20px 0',
        color: count > 0 ? 'green' : count < 0 ? 'red' : 'gray'
      }}>
        {count}
      </div>

      {/* 按钮组 */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>重置</button>
        <button onClick={increment}>+1</button>
      </div>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        💾 计数已自动保存,刷新页面不会丢失
      </p>
    </div>
  );
}

export default Counter;
