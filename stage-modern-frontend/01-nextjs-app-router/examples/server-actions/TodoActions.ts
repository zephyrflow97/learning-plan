/**
 * Server Actions - 完整的 Todo CRUD 示例
 * 
 * 这个文件展示了 Server Actions 的最佳实践:
 * - 使用 Zod 进行输入验证
 * - 完整的错误处理
 * - 缓存重新验证(revalidation)
 * - 类型安全的返回值
 * 
 * Server Actions 的核心特性:
 * 1. 'use server' 指令标记服务器代码
 * 2. 可以在客户端调用,但在服务器执行
 * 3. 自动序列化参数和返回值
 * 4. 内建 CSRF 防护
 * 
 * 使用位置: app/actions/todos.ts
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';

// ==================== 类型定义 ====================

/**
 * Todo 类型(与数据库模型对应)
 */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

/**
 * Action 返回类型
 * 使用 discriminated union 确保类型安全
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ==================== Zod Schemas ====================

/**
 * 创建 Todo 的验证 Schema
 */
const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(100, '标题最多 100 个字符')
    .trim(),
  userId: z.string().cuid('无效的用户 ID'),
});

/**
 * 更新 Todo 的验证 Schema
 */
const updateTodoSchema = z.object({
  id: z.string().cuid('无效的 Todo ID'),
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(100, '标题最多 100 个字符')
    .trim()
    .optional(),
  completed: z.boolean().optional(),
});

/**
 * 删除 Todo 的验证 Schema
 */
const deleteTodoSchema = z.object({
  id: z.string().cuid('无效的 Todo ID'),
});

// ==================== CREATE ====================

/**
 * 创建新的 Todo
 * 
 * @param formData - 表单数据或对象
 * @returns 创建的 Todo 或错误信息
 * 
 * 使用示例:
 * ```tsx
 * <form action={createTodo}>
 *   <input name="title" />
 *   <input type="hidden" name="userId" value={userId} />
 *   <button type="submit">添加</button>
 * </form>
 * ```
 */
export async function createTodo(
  formData: FormData
): Promise<ActionResult<Todo>> {
  console.log('🟢 [Server Action] createTodo 开始执行');
  console.log('🟢 [Server Action] 接收到的表单数据:', {
    title: formData.get('title'),
    userId: formData.get('userId'),
  });

  try {
    // 1. 提取并验证数据
    const rawData = {
      title: formData.get('title'),
      userId: formData.get('userId'),
    };

    console.log('🟢 [Server Action] 开始验证数据');
    const validatedData = createTodoSchema.parse(rawData);
    console.log('✅ [Server Action] 验证通过:', validatedData);

    // 2. 数据库操作
    console.log('🟢 [Server Action] 开始创建 Todo');
    const todo = await db.todo.create({
      data: {
        title: validatedData.title,
        userId: validatedData.userId,
        completed: false,
      },
    });

    console.log('✅ [Server Action] Todo 创建成功:', {
      id: todo.id,
      title: todo.title,
    });

    // 3. 重新验证缓存
    // 清除 /todos 页面的缓存,让它重新渲染以显示新数据
    console.log('🟢 [Server Action] 重新验证缓存');
    revalidatePath('/todos');
    revalidateTag('todos'); // 如果使用了 fetch(..., { next: { tags: ['todos'] } })

    // 4. 返回成功结果
    return {
      success: true,
      data: todo as Todo,
    };
  } catch (error) {
    console.error('🔴 [Server Action] createTodo 失败:', error);

    // Zod 验证错误
    if (error instanceof z.ZodError) {
      console.error('🔴 [Server Action] 验证错误:', error.flatten());
      return {
        success: false,
        error: '输入数据无效',
        fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // 数据库错误
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // 未知错误
    return {
      success: false,
      error: '创建 Todo 失败,请稍后重试',
    };
  }
}

// ==================== READ ====================

/**
 * 获取用户的所有 Todos
 * 
 * 注意: 这是一个 Server Action,但也可以在 Server Component 中直接调用
 * 
 * @param userId - 用户 ID
 * @returns Todo 列表或错误信息
 */
export async function getTodos(userId: string): Promise<ActionResult<Todo[]>> {
  console.log('🟢 [Server Action] getTodos 开始执行,用户:', userId);

  try {
    const todos = await db.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log('✅ [Server Action] 找到', todos.length, '个 Todos');

    return {
      success: true,
      data: todos as Todo[],
    };
  } catch (error) {
    console.error('🔴 [Server Action] getTodos 失败:', error);

    return {
      success: false,
      error: '获取 Todos 失败',
    };
  }
}

// ==================== UPDATE ====================

/**
 * 更新 Todo
 * 
 * @param formData - 包含 id 和要更新的字段
 * @returns 更新后的 Todo 或错误信息
 * 
 * 使用示例:
 * ```tsx
 * <form action={updateTodo}>
 *   <input type="hidden" name="id" value={todo.id} />
 *   <input name="title" defaultValue={todo.title} />
 *   <button type="submit">更新</button>
 * </form>
 * ```
 */
export async function updateTodo(
  formData: FormData
): Promise<ActionResult<Todo>> {
  console.log('🟢 [Server Action] updateTodo 开始执行');

  try {
    // 1. 提取并验证数据
    const rawData = {
      id: formData.get('id'),
      title: formData.get('title') || undefined,
      completed: formData.get('completed') === 'true' || undefined,
    };

    console.log('🟢 [Server Action] 原始数据:', rawData);

    const validatedData = updateTodoSchema.parse(rawData);
    console.log('✅ [Server Action] 验证通过:', validatedData);

    // 2. 构建更新数据(只更新提供的字段)
    const updateData: Partial<Pick<Todo, 'title' | 'completed'>> = {};
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.completed !== undefined) {
      updateData.completed = validatedData.completed;
    }

    console.log('🟢 [Server Action] 更新数据:', updateData);

    // 3. 数据库操作
    const todo = await db.todo.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    console.log('✅ [Server Action] Todo 更新成功:', {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
    });

    // 4. 重新验证缓存
    revalidatePath('/todos');
    revalidateTag('todos');

    return {
      success: true,
      data: todo as Todo,
    };
  } catch (error) {
    console.error('🔴 [Server Action] updateTodo 失败:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '输入数据无效',
        fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '更新 Todo 失败',
    };
  }
}

/**
 * 切换 Todo 的完成状态
 * 
 * 这是一个简化版的 updateTodo,专门用于切换 completed 状态
 */
export async function toggleTodo(todoId: string): Promise<ActionResult<Todo>> {
  console.log('🟢 [Server Action] toggleTodo 开始执行,ID:', todoId);

  try {
    // 1. 获取当前状态
    const currentTodo = await db.todo.findUnique({
      where: { id: todoId },
    });

    if (!currentTodo) {
      throw new Error('Todo 不存在');
    }

    // 2. 切换状态
    const todo = await db.todo.update({
      where: { id: todoId },
      data: { completed: !currentTodo.completed },
    });

    console.log('✅ [Server Action] 状态切换成功:', {
      id: todo.id,
      completed: todo.completed,
    });

    // 3. 重新验证缓存
    revalidatePath('/todos');
    revalidateTag('todos');

    return {
      success: true,
      data: todo as Todo,
    };
  } catch (error) {
    console.error('🔴 [Server Action] toggleTodo 失败:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : '切换状态失败',
    };
  }
}

// ==================== DELETE ====================

/**
 * 删除 Todo
 * 
 * @param formData - 包含要删除的 Todo ID
 * @returns 成功或错误信息
 * 
 * 使用示例:
 * ```tsx
 * <form action={deleteTodo}>
 *   <input type="hidden" name="id" value={todo.id} />
 *   <button type="submit">删除</button>
 * </form>
 * ```
 */
export async function deleteTodo(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  console.log('🟢 [Server Action] deleteTodo 开始执行');

  try {
    // 1. 提取并验证数据
    const rawData = {
      id: formData.get('id'),
    };

    const validatedData = deleteTodoSchema.parse(rawData);
    console.log('🟢 [Server Action] 要删除的 ID:', validatedData.id);

    // 2. 数据库操作
    await db.todo.delete({
      where: { id: validatedData.id },
    });

    console.log('✅ [Server Action] Todo 删除成功');

    // 3. 重新验证缓存
    revalidatePath('/todos');
    revalidateTag('todos');

    return {
      success: true,
      data: { id: validatedData.id },
    };
  } catch (error) {
    console.error('🔴 [Server Action] deleteTodo 失败:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '无效的 Todo ID',
        fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '删除 Todo 失败',
    };
  }
}

// ==================== 批量操作 ====================

/**
 * 删除所有已完成的 Todos
 * 
 * @param userId - 用户 ID
 * @returns 删除的数量或错误信息
 */
export async function deleteCompletedTodos(
  userId: string
): Promise<ActionResult<{ count: number }>> {
  console.log('🟢 [Server Action] deleteCompletedTodos 开始执行');

  try {
    const result = await db.todo.deleteMany({
      where: {
        userId,
        completed: true,
      },
    });

    console.log('✅ [Server Action] 删除了', result.count, '个已完成的 Todos');

    // 重新验证缓存
    revalidatePath('/todos');
    revalidateTag('todos');

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error('🔴 [Server Action] deleteCompletedTodos 失败:', error);

    return {
      success: false,
      error: '删除失败',
    };
  }
}

/**
 * 全部标记为已完成
 * 
 * @param userId - 用户 ID
 * @returns 更新的数量或错误信息
 */
export async function markAllComplete(
  userId: string
): Promise<ActionResult<{ count: number }>> {
  console.log('🟢 [Server Action] markAllComplete 开始执行');

  try {
    const result = await db.todo.updateMany({
      where: {
        userId,
        completed: false,
      },
      data: {
        completed: true,
      },
    });

    console.log('✅ [Server Action] 标记了', result.count, '个 Todos 为已完成');

    revalidatePath('/todos');
    revalidateTag('todos');

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error('🔴 [Server Action] markAllComplete 失败:', error);

    return {
      success: false,
      error: '操作失败',
    };
  }
}

// ==================== 带重定向的 Action ====================

/**
 * 创建 Todo 并重定向到详情页
 * 
 * 使用 redirect() 会抛出一个特殊的错误,Next.js 会捕获它并执行重定向
 */
export async function createTodoAndRedirect(formData: FormData): Promise<void> {
  console.log('🟢 [Server Action] createTodoAndRedirect 开始执行');

  const result = await createTodo(formData);

  if (result.success) {
    console.log('🟢 [Server Action] 重定向到:', `/todos/${result.data.id}`);
    redirect(`/todos/${result.data.id}`);
  } else {
    // 如果创建失败,抛出错误(会被 error.tsx 捕获)
    throw new Error(result.error);
  }
}

// ==================== 配套 Prisma Schema ====================

/**
 * prisma/schema.prisma
 * 
 * model Todo {
 *   id        String   @id @default(cuid())
 *   title     String
 *   completed Boolean  @default(false)
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 *   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 *   userId    String
 * 
 *   @@index([userId])
 *   @@index([completed])
 * }
 * 
 * model User {
 *   id    String @id @default(cuid())
 *   name  String
 *   email String @unique
 *   todos Todo[]
 * }
 */

// ==================== 使用说明 ====================

/**
 * 在 Server Component 中使用:
 * 
 * import { getTodos } from '@/actions/todos';
 * 
 * export default async function TodosPage() {
 *   const result = await getTodos(userId);
 *   
 *   if (!result.success) {
 *     return <div>错误: {result.error}</div>;
 *   }
 *   
 *   return <TodoList todos={result.data} />;
 * }
 * 
 * 
 * 在 Client Component 中使用:
 * 
 * 'use client';
 * import { createTodo } from '@/actions/todos';
 * 
 * export function AddTodoForm() {
 *   const handleSubmit = async (formData: FormData) => {
 *     const result = await createTodo(formData);
 *     
 *     if (result.success) {
 *       alert('创建成功!');
 *     } else {
 *       alert(`错误: ${result.error}`);
 *     }
 *   };
 *   
 *   return (
 *     <form action={handleSubmit}>
 *       <input name="title" required />
 *       <button type="submit">添加</button>
 *     </form>
 *   );
 * }
 */
