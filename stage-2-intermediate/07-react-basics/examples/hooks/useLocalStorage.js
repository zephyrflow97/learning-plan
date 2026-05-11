// useLocalStorage.js - localStorage 自定义 Hook
import { useState, useEffect } from 'react';

/**
 * 自定义 Hook: useLocalStorage
 * 
 * 功能: 将 State 同步到 localStorage
 * 
 * @param {string} key - localStorage 的键名
 * @param {any} initialValue - 初始值
 * @returns {[any, Function]} - [当前值, 设置值的函数]
 */
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

// 使用示例
function Counter() {
  const [count, setCount] = useLocalStorage('count', 0);
  
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p>刷新页面,计数会保持!</p>
    </div>
  );
}

export { Counter };
export default useLocalStorage;
