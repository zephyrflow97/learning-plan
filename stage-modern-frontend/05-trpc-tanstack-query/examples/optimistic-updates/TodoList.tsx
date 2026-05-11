// ==========================================
// TodoList — 乐观更新 + 列表操作示例
// ==========================================

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Todo 类型
 */
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

/**
 * TodoList 组件（乐观更新版本）
 * 
 * 演示列表操作的乐观更新：
 * - 添加 Todo
 * - 切换完成状态
 * - 删除 Todo
 * 
 * 所有操作都使用乐观更新，用户体验丝滑。
 */
export function TodoList() {
  const [inputText, setInputText] = useState('');
  const queryClient = useQueryClient();
  
  /**
   * 查询：获取 Todo 列表
   */
  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      console.log('[TodoList] 拉取 Todo 列表');
      const res = await fetch('/api/todos');
      return res.json();
    },
  });
  
  /**
   * Mutation：添加 Todo
   */
  const addTodoMutation = useMutation({
    mutationFn: async (text: string) => {
      console.log('[Mutation] 添加 Todo:', text);
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      return res.json();
    },
    
    onMutate: async (text) => {
      console.log('[乐观更新] 添加 Todo - onMutate');
      
      // 1️⃣ 取消进行中的查询
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      // 2️⃣ 保存快照
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      console.log('[乐观更新] 保存快照:', previousTodos);
      
      // 3️⃣ 乐观更新：立刻添加到列表
      const optimisticTodo: Todo = {
        id: Date.now(), // 临时 ID
        text,
        completed: false,
      };
      
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => {
        console.log('[乐观更新] 添加临时 Todo:', optimisticTodo);
        return [...old, optimisticTodo];
      });
      
      return { previousTodos };
    },
    
    onError: (error, variables, context) => {
      console.error('[乐观更新] 添加失败，回滚');
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    
    onSettled: () => {
      console.log('[乐观更新] 重新拉取 Todo 列表');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  /**
   * Mutation：切换完成状态
   */
  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      console.log('[Mutation] 切换 Todo 状态:', id, completed);
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      return res.json();
    },
    
    onMutate: async ({ id, completed }) => {
      console.log('[乐观更新] 切换状态 - onMutate');
      
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      
      // 乐观更新：立刻切换状态
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => {
        return old.map(todo =>
          todo.id === id
            ? { ...todo, completed }
            : todo
        );
      });
      
      console.log('[乐观更新] 状态已切换为:', completed);
      
      return { previousTodos };
    },
    
    onError: (error, variables, context) => {
      console.error('[乐观更新] 切换失败，回滚');
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  /**
   * Mutation：删除 Todo
   */
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('[Mutation] 删除 Todo:', id);
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    },
    
    onMutate: async (id) => {
      console.log('[乐观更新] 删除 Todo - onMutate');
      
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      
      // 乐观更新：立刻从列表中移除
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => {
        return old.filter(todo => todo.id !== id);
      });
      
      console.log('[乐观更新] Todo 已从列表移除');
      
      return { previousTodos };
    },
    
    onError: (error, variables, context) => {
      console.error('[乐观更新] 删除失败，回滚');
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  /**
   * 处理添加 Todo
   */
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    console.log('[TodoList] 添加 Todo:', inputText);
    addTodoMutation.mutate(inputText);
    setInputText('');
  };
  
  /**
   * 处理切换完成状态
   */
  const handleToggleTodo = (todo: Todo) => {
    console.log('[TodoList] 切换 Todo:', todo.id, !todo.completed);
    toggleTodoMutation.mutate({
      id: todo.id,
      completed: !todo.completed,
    });
  };
  
  /**
   * 处理删除 Todo
   */
  const handleDeleteTodo = (id: number) => {
    console.log('[TodoList] 删除 Todo:', id);
    deleteTodoMutation.mutate(id);
  };
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="todo-list">
      <h2>Todo List (乐观更新)</h2>
      
      {/* 添加表单 */}
      <form onSubmit={handleAddTodo} className="add-todo-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="添加新任务..."
          disabled={addTodoMutation.isPending}
        />
        <button type="submit" disabled={addTodoMutation.isPending}>
          {addTodoMutation.isPending ? '添加中...' : '添加'}
        </button>
      </form>
      
      {/* Todo 列表 */}
      <ul className="todos">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            {/* 复选框 */}
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo)}
              disabled={toggleTodoMutation.isPending}
            />
            
            {/* 文本 */}
            <span className="todo-text">{todo.text}</span>
            
            {/* 删除按钮 */}
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              disabled={deleteTodoMutation.isPending}
              className="delete-button"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
      
      {/* 统计 */}
      <div className="stats">
        <span>总计: {todos.length}</span>
        <span>已完成: {todos.filter(t => t.completed).length}</span>
        <span>未完成: {todos.filter(t => !t.completed).length}</span>
      </div>
    </div>
  );
}

/**
 * 📚 乐观更新的用户体验
 * 
 * 没有乐观更新：
 * 1. 用户点击复选框
 * 2. 等待 300ms（网络请求）
 * 3. UI 才更新 → 感觉很卡顿 😞
 * 
 * 有乐观更新：
 * 1. 用户点击复选框
 * 2. UI 立刻更新 → 感觉很流畅 ✨
 * 3. 后台静默发送请求
 * 4. 如果失败，才回滚 + 提示错误
 */

/**
 * 📚 临时 ID 的处理
 * 
 * 问题：乐观更新添加 Todo 时，我们不知道服务器会分配什么 ID。
 * 解决方案：
 * 1. 使用临时 ID (Date.now())
 * 2. onSettled 重新拉取，获取真实 ID
 * 3. TanStack Query 会自动合并数据
 * 
 * 更好的方案（如果使用 tRPC）：
 * - 服务器立刻返回新创建的 Todo（包含真实 ID）
 * - onSuccess 直接更新缓存，无需重新拉取
 */

/**
 * 📚 样式（仅供参考）
 * 
 * ```css
 * .todo-list {
 *   max-width: 600px;
 *   margin: 20px auto;
 *   padding: 20px;
 * }
 * 
 * .add-todo-form {
 *   display: flex;
 *   gap: 10px;
 *   margin-bottom: 20px;
 * }
 * 
 * .add-todo-form input {
 *   flex: 1;
 *   padding: 8px;
 *   border: 1px solid #ddd;
 *   border-radius: 4px;
 * }
 * 
 * .todos {
 *   list-style: none;
 *   padding: 0;
 * }
 * 
 * .todos li {
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   padding: 10px;
 *   border-bottom: 1px solid #eee;
 * }
 * 
 * .todos li.completed .todo-text {
 *   text-decoration: line-through;
 *   color: #999;
 * }
 * 
 * .delete-button {
 *   margin-left: auto;
 *   background: none;
 *   border: none;
 *   cursor: pointer;
 * }
 * 
 * .stats {
 *   display: flex;
 *   gap: 20px;
 *   margin-top: 20px;
 *   padding: 10px;
 *   background: #f5f5f5;
 *   border-radius: 4px;
 * }
 * ```
 */
