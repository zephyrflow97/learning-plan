// ==========================================
// UserList 组件 — TanStack Query 基础示例
// ==========================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * 用户列表组件
 * 
 * 演示 TanStack Query 的基本用法：
 * - useQuery 读取数据
 * - useMutation 修改数据
 * - queryClient.invalidateQueries 使缓存失效
 */
export function UserList() {
  const queryClient = useQueryClient();
  
  /**
   * useQuery — 读取数据
   * 
   * @param queryKey - 缓存的键（数组形式）
   * @param queryFn - 获取数据的函数
   */
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['users'], // 缓存键
    queryFn: async () => {
      console.log('[TanStack Query] 执行 queryFn, 从服务器拉取用户列表');
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      return res.json();
    },
    
    // ✅ 可选配置
    staleTime: 5 * 60 * 1000, // 5 分钟内认为数据是新鲜的
    gcTime: 10 * 60 * 1000,   // 10 分钟后删除缓存
    refetchOnWindowFocus: true, // 切换回窗口时重新拉取
  });
  
  /**
   * useMutation — 修改数据
   * 
   * @param mutationFn - 执行修改的函数
   * @param onSuccess - 成功后的回调
   */
  const createUserMutation = useMutation({
    mutationFn: async (newUser: { name: string; email: string }) => {
      console.log('[TanStack Query] 执行 mutation, 创建用户:', newUser);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        throw new Error('Failed to create user');
      }
      return res.json();
    },
    
    /**
     * onSuccess — Mutation 成功后的回调
     * 
     * ✅ 使缓存失效，触发重新拉取
     * 这样用户列表会自动更新，包含新创建的用户
     */
    onSuccess: () => {
      console.log('[TanStack Query] Mutation 成功, 使缓存失效');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    
    /**
     * onError — Mutation 失败后的回调
     */
    onError: (error) => {
      console.error('[TanStack Query] Mutation 失败:', error);
      alert(`创建用户失败: ${error.message}`);
    },
  });
  
  /**
   * 创建用户按钮点击处理
   */
  const handleCreateUser = () => {
    const name = prompt('用户名:');
    const email = prompt('邮箱:');
    
    if (name && email) {
      createUserMutation.mutate({ name, email });
    }
  };
  
  /**
   * 渲染逻辑
   */
  
  // 首次加载中（没有缓存数据）
  if (isLoading) {
    console.log('[UserList] 数据加载中...');
    return (
      <div className="user-list">
        <div className="loading">Loading...</div>
      </div>
    );
  }
  
  // 加载失败
  if (error) {
    console.log('[UserList] 错误:', error);
    return (
      <div className="user-list">
        <div className="error">Error: {error.message}</div>
      </div>
    );
  }
  
  // 数据已就绪
  console.log('[UserList] 数据已就绪:', data);
  
  return (
    <div className="user-list">
      {/* 后台刷新指示器 */}
      {isFetching && !isLoading && (
        <div className="refresh-indicator">
          🔄 更新中...
        </div>
      )}
      
      {/* 用户列表 */}
      <ul>
        {data.map((user: any) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
      
      {/* 创建用户按钮 */}
      <button 
        onClick={handleCreateUser}
        disabled={createUserMutation.isPending}
      >
        {createUserMutation.isPending ? '创建中...' : '创建用户'}
      </button>
      
      {/* Mutation 错误提示 */}
      {createUserMutation.error && (
        <div className="error">
          创建失败: {createUserMutation.error.message}
        </div>
      )}
    </div>
  );
}

/**
 * 📚 状态说明
 * 
 * isLoading vs isFetching:
 * - isLoading: 首次加载，没有缓存数据
 * - isFetching: 任何时候拉取数据（包括后台刷新）
 * 
 * 示例时间线：
 * 1. 组件挂载 → isLoading: true, isFetching: true
 * 2. 数据返回 → isLoading: false, isFetching: false
 * 3. 用户切换到其他 tab，5 分钟后回来 → isLoading: false, isFetching: true（后台刷新）
 * 4. 刷新完成 → isLoading: false, isFetching: false
 */

/**
 * 📚 QueryKey 的作用
 * 
 * queryKey 是缓存的索引，类似数据库的主键。
 * 
 * - ['users'] — 所有用户
 * - ['user', 1] — ID 为 1 的用户
 * - ['user', 1, 'posts'] — ID 为 1 的用户的帖子
 * 
 * 当你调用 invalidateQueries({ queryKey: ['users'] }) 时，
 * 所有以 ['users'] 开头的查询都会失效。
 */

/**
 * 📚 样式（仅供参考）
 * 
 * ```css
 * .user-list {
 *   padding: 20px;
 * }
 * 
 * .loading, .error {
 *   padding: 10px;
 *   border-radius: 4px;
 * }
 * 
 * .loading {
 *   background: #f0f0f0;
 * }
 * 
 * .error {
 *   background: #fee;
 *   color: #c00;
 * }
 * 
 * .refresh-indicator {
 *   padding: 5px 10px;
 *   background: #e3f2fd;
 *   border-radius: 4px;
 *   margin-bottom: 10px;
 * }
 * ```
 */
