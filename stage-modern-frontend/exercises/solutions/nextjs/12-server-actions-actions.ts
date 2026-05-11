'use server';

import { revalidatePath } from 'next/cache';

// 模拟数据库(实际项目应该用真实数据库)
let todos: string[] = ['学习 Next.js', '做练习题'];

export async function addTodo(formData: FormData) {
  const text = formData.get('text');

  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input');
  }

  console.log('[Server Action] 添加待办:', text);

  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  todos.push(text);

  // 刷新页面数据
  revalidatePath('/');

  return { success: true };
}

export async function getTodos() {
  return todos;
}
