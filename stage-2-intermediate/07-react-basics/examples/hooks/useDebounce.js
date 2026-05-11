// useDebounce.js - 防抖自定义 Hook
import { useState, useEffect } from 'react';

/**
 * 自定义 Hook: useDebounce
 * 
 * 功能: 延迟更新值,常用于搜索输入框
 * 
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {any} - 防抖后的值
 */
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

// 使用示例: 搜索框
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
      <p className="hint">
        输入会延迟 500ms 后才触发搜索,避免频繁请求
      </p>
    </div>
  );
}

// 实战示例: 实时搜索用户
function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery === '') {
      setResults([]);
      return;
    }
    
    // 模拟搜索
    const mockUsers = [
      'Alice', 'Alice Johnson', 'Bob', 'Bob Smith',
      'Charlie', 'David', 'Eve', 'Frank'
    ];
    
    const filtered = mockUsers.filter(name =>
      name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
    
    setResults(filtered);
  }, [debouncedQuery]);
  
  return (
    <div>
      <h2>搜索用户</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="输入用户名..."
      />
      
      {query && query !== debouncedQuery && (
        <p className="searching">搜索中...</p>
      )}
      
      <ul>
        {results.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
      
      {debouncedQuery && results.length === 0 && (
        <p>未找到用户</p>
      )}
    </div>
  );
}

export { SearchBox, UserSearch };
export default useDebounce;
