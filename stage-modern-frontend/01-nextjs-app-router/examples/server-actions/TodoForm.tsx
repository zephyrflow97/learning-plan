/**
 * Server Actions - 表单组件示例
 * 
 * 这个文件展示了如何在 Client Component 中使用 Server Actions:
 * - useFormStatus - 获取表单提交状态
 * - useOptimistic - 乐观更新 UI
 * - 错误处理和成功消息
 * - 渐进增强(Progressive Enhancement)
 * 
 * 核心理念:
 * - 即使 JavaScript 禁用,表单仍然可以提交(降级为普通 POST)
 * - 当 JS 可用时,提供更好的用户体验(即时反馈、乐观更新)
 * 
 * 使用位置: app/todos/components/TodoForm.tsx
 */

'use client';

import { useFormStatus } from 'react-dom';
import { useOptimistic, useState, useEffect, useRef } from 'react';
import { createTodo, updateTodo, deleteTodo, toggleTodo } from '@/actions/todos';
import type { Todo, ActionResult } from '@/actions/todos';

// ==================== 类型定义 ====================

interface TodoFormProps {
  userId: string;
  onSuccess?: (todo: Todo) => void;
}

interface TodoListProps {
  initialTodos: Todo[];
  userId: string;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// ==================== 提交按钮组件 ====================

/**
 * 提交按钮 - 使用 useFormStatus 显示加载状态
 * 
 * 注意: useFormStatus 必须在 <form> 的子组件中使用
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  console.log('🔵 [Client] 表单提交状态:', pending ? '提交中...' : '空闲');

  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-4 py-2 rounded font-medium transition-colors ${
        pending
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {pending ? (
        <>
          <span className="inline-block animate-spin mr-2">⏳</span>
          提交中...
        </>
      ) : (
        '添加 Todo'
      )}
    </button>
  );
}

// ==================== 添加 Todo 表单 ====================

/**
 * 添加 Todo 的表单组件
 * 
 * 特性:
 * 1. 自动禁用提交按钮(防止重复提交)
 * 2. 错误处理(显示验证错误)
 * 3. 成功后清空输入框
 * 4. 自动聚焦输入框
 */
export function AddTodoForm({ userId, onSuccess }: TodoFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理表单提交
  const handleSubmit = async (formData: FormData) => {
    console.log('🔵 [Client] 开始提交表单');
    
    // 清除之前的错误
    setError(null);
    setFieldErrors({});

    // 添加 userId
    formData.set('userId', userId);

    // 调用 Server Action
    const result = await createTodo(formData);

    console.log('🔵 [Client] Server Action 返回:', result);

    if (result.success) {
      console.log('✅ [Client] Todo 创建成功:', result.data);
      
      // 清空表单
      formRef.current?.reset();
      
      // 重新聚焦输入框
      inputRef.current?.focus();

      // 调用成功回调
      onSuccess?.(result.data);
    } else {
      console.error('🔴 [Client] 创建失败:', result.error);
      
      setError(result.error);
      
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Todo 标题
        </label>
        <input
          ref={inputRef}
          type="text"
          id="title"
          name="title"
          required
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例如:完成 Next.js 教程"
        />
        
        {/* 字段级错误 */}
        {fieldErrors.title && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.title[0]}
          </p>
        )}
      </div>

      {/* 全局错误 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

// ==================== Todo 列表项 ====================

/**
 * 单个 Todo 项组件
 * 
 * 特性:
 * 1. 切换完成状态(乐观更新)
 * 2. 内联编辑
 * 3. 删除确认
 */
function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // 切换完成状态
  const handleToggle = async () => {
    console.log('🔵 [Client] 切换 Todo 状态:', todo.id);
    
    setIsPending(true);
    onToggle(todo.id); // 乐观更新(立即更新 UI)
    
    const result = await toggleTodo(todo.id);
    setIsPending(false);

    if (!result.success) {
      console.error('🔴 [Client] 切换失败:', result.error);
      // 失败时,UI 会在服务器重新验证后恢复
      alert(`切换失败: ${result.error}`);
    }
  };

  // 删除 Todo
  const handleDelete = async () => {
    if (!confirm(`确定要删除 "${todo.title}" 吗?`)) {
      return;
    }

    console.log('🔵 [Client] 删除 Todo:', todo.id);
    
    setIsPending(true);
    onDelete(todo.id); // 乐观更新
    
    const formData = new FormData();
    formData.set('id', todo.id);
    
    const result = await deleteTodo(formData);
    setIsPending(false);

    if (!result.success) {
      console.error('🔴 [Client] 删除失败:', result.error);
      alert(`删除失败: ${result.error}`);
    }
  };

  return (
    <li
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        todo.completed
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-300'
      } ${isPending ? 'opacity-50' : ''}`}
    >
      {/* 完成状态复选框 */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={isPending}
        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
      />

      {/* 标题 */}
      <span
        className={`flex-1 ${
          todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
        }`}
      >
        {todo.title}
      </span>

      {/* 创建时间 */}
      <span className="text-xs text-gray-400">
        {new Date(todo.createdAt).toLocaleDateString('zh-CN')}
      </span>

      {/* 删除按钮 */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
      >
        删除
      </button>
    </li>
  );
}

// ==================== Todo 列表(带乐观更新) ====================

/**
 * Todo 列表组件 - 使用 useOptimistic 实现乐观更新
 * 
 * 乐观更新的工作流程:
 * 1. 用户操作(切换/删除) → 立即更新 UI(乐观假设成功)
 * 2. 发送请求到服务器
 * 3. 服务器处理完成后,重新验证缓存(revalidatePath)
 * 4. 服务器重新渲染组件,传入最新数据
 * 5. UI 自动同步到真实数据
 * 
 * 如果服务器操作失败,UI 会在重新验证后自动恢复
 */
export function TodoList({ initialTodos, userId }: TodoListProps) {
  console.log('🔵 [Client] TodoList 渲染,初始数据:', initialTodos.length, '条');

  // useOptimistic: 管理乐观更新的状态
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    initialTodos,
    (state, action: { type: 'toggle' | 'delete'; id: string }) => {
      console.log('🔵 [Client] 乐观更新:', action);

      switch (action.type) {
        case 'toggle':
          // 切换完成状态
          return state.map(todo =>
            todo.id === action.id
              ? { ...todo, completed: !todo.completed }
              : todo
          );
        
        case 'delete':
          // 删除 Todo
          return state.filter(todo => todo.id !== action.id);
        
        default:
          return state;
      }
    }
  );

  // 处理切换(触发乐观更新)
  const handleToggle = (id: string) => {
    updateOptimisticTodos({ type: 'toggle', id });
  };

  // 处理删除(触发乐观更新)
  const handleDelete = (id: string) => {
    updateOptimisticTodos({ type: 'delete', id });
  };

  // 计算统计信息
  const totalCount = optimisticTodos.length;
  const completedCount = optimisticTodos.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;

  return (
    <div className="space-y-4">
      {/* 统计信息 */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>总计: {totalCount}</span>
        <span>活跃: {activeCount}</span>
        <span>已完成: {completedCount}</span>
      </div>

      {/* Todo 列表 */}
      {optimisticTodos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">📝 暂无 Todo</p>
          <p className="text-sm mt-2">添加一个开始吧!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {optimisticTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ==================== 完整页面示例 ====================

/**
 * 使用示例:
 * 
 * // app/todos/page.tsx (Server Component)
 * import { getTodos } from '@/actions/todos';
 * import { AddTodoForm, TodoList } from './components/TodoForm';
 * import { auth } from '@/lib/auth';
 * 
 * export default async function TodosPage() {
 *   const session = await auth();
 *   const userId = session.user.id;
 * 
 *   const result = await getTodos(userId);
 * 
 *   if (!result.success) {
 *     return <div>错误: {result.error}</div>;
 *   }
 * 
 *   return (
 *     <div className="max-w-2xl mx-auto p-6 space-y-6">
 *       <h1 className="text-3xl font-bold">我的 Todos</h1>
 *       
 *       <AddTodoForm userId={userId} />
 *       
 *       <TodoList initialTodos={result.data} userId={userId} />
 *     </div>
 *   );
 * }
 */

// ==================== 渐进增强说明 ====================

/**
 * 渐进增强(Progressive Enhancement)的体现:
 * 
 * 1. **基础层(无 JavaScript)**:
 *    - 表单仍然可以提交(降级为普通 POST 请求)
 *    - Server Action 会处理请求并重定向回页面
 *    - 用户可以完成所有核心功能
 * 
 * 2. **增强层(有 JavaScript)**:
 *    - Next.js 拦截表单提交,通过 AJAX 发送
 *    - useFormStatus 显示实时提交状态
 *    - 提交后不刷新页面,只更新必要部分
 * 
 * 3. **高级层(React 18+)**:
 *    - useOptimistic 实现乐观更新
 *    - 用户操作立即反馈(无等待)
 *    - 失败时自动回滚
 * 
 * 这种设计让你的应用在任何环境下都可用,然后根据用户的浏览器能力逐步增强体验。
 */

// ==================== 性能优化建议 ====================

/**
 * 1. **避免过度乐观更新**:
 *    - 只对快速操作使用乐观更新(切换状态、删除)
 *    - 慢操作(如文件上传)不适合乐观更新
 * 
 * 2. **错误处理**:
 *    - 乐观更新失败时,给用户明确的错误提示
 *    - 服务器重新验证后,UI 会自动恢复到正确状态
 * 
 * 3. **Loading 状态**:
 *    - 使用 isPending 禁用按钮,防止重复操作
 *    - useFormStatus 的 pending 会自动同步
 * 
 * 4. **缓存策略**:
 *    - revalidatePath 会重新渲染整个页面
 *    - revalidateTag 可以细粒度控制缓存失效
 *    - 考虑使用 router.refresh() 手动刷新
 */
