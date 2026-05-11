/**
 * App Router（主路由器）
 * 
 * 汇总所有子路由器
 */

import { router } from './trpc';
import { userRouter } from './user';
import { postRouter } from './post';

// ==========================================
// App Router
// ==========================================

export const appRouter = router({
  user: userRouter,
  post: postRouter,
});

// ==========================================
// 导出类型（客户端会导入这个类型）
// ==========================================

export type AppRouter = typeof appRouter;

// ==========================================
// 使用示例
// ==========================================

// 客户端调用示例:
// 
// import { trpc } from '@/utils/trpc';
// 
// // Query: 查询用户列表
// const { data } = trpc.user.list.useQuery({ page: 1, limit: 10 });
// 
// // Query: 查询单个用户
// const { data } = trpc.user.getById.useQuery({ id: 1 });
// 
// // Mutation: 创建用户
// const mutation = trpc.user.create.useMutation();
// await mutation.mutateAsync({
//   name: 'Alice',
//   email: 'alice@example.com',
// });
// 
// // Query: 查询帖子列表
// const { data } = trpc.post.list.useQuery({ 
//   page: 1, 
//   published: true 
// });
// 
// // Mutation: 创建帖子
// const postMutation = trpc.post.create.useMutation();
// await postMutation.mutateAsync({
//   title: 'My First Post',
//   content: 'Hello World',
//   published: true,
// });
