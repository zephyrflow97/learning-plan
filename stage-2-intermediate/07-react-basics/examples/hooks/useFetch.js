// useFetch.js - 数据获取自定义 Hook
import { useState, useEffect } from 'react';

/**
 * 自定义 Hook: useFetch
 * 
 * 功能: 简化数据获取逻辑
 * 
 * @param {string} url - API 地址
 * @returns {Object} - { data, loading, error }
 */
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

// 使用示例
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

// 真实 API 示例
function PostList() {
  const { data: posts, loading, error } = useFetch(
    'https://jsonplaceholder.typicode.com/posts?_limit=5'
  );
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  return (
    <ul>
      {posts?.map(post => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </li>
      ))}
    </ul>
  );
}

export { UserProfile, PostList };
export default useFetch;
