// DataFetching.jsx - useEffect 数据获取示例
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log('[useEffect] 开始获取用户数据, userId:', userId);
    
    setLoading(true);
    setError(null);
    
    // 模拟 API 调用
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
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>角色: {user.role}</p>
    </div>
  );
}

// 使用真实 API 的示例
function RealDataFetching() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useEffect] 获取帖子列表');
    
    // 使用 JSONPlaceholder 公共 API
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
      .then(res => res.json())
      .then(data => {
        console.log('[API] 帖子数据:', data);
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[API] 错误:', err);
        setLoading(false);
      });
  }, []); // 空依赖数组: 只在组件挂载时执行一次

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <h1>帖子列表</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { UserProfile, RealDataFetching };
export default UserProfile;
