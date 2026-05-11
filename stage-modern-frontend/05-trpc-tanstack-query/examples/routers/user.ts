/**
 * User Router（用户路由器）
 * 
 * 包含所有用户相关的 Procedure
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './trpc';
import { TRPCError } from '@trpc/server';

// ==========================================
// 模拟数据库（实际应用中使用 Prisma）
// ==========================================

type User = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
};

const users: User[] = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    role: 'ADMIN',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    role: 'USER',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 3,
    name: 'Charlie',
    email: 'charlie@example.com',
    role: 'USER',
    createdAt: new Date('2024-02-01'),
  },
];

// ==========================================
// User Router
// ==========================================

export const userRouter = router({
  /**
   * Query: 获取所有用户
   * 
   * 公开访问，支持分页和搜索
   */
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(({ input }) => {
      console.log('[User Router] 查询用户列表, 参数:', input);

      const { page, limit, search } = input;

      // 搜索过滤
      let filteredUsers = users;
      if (search) {
        filteredUsers = users.filter(
          (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // 分页
      const start = (page - 1) * limit;
      const paginatedUsers = filteredUsers.slice(start, start + limit);

      console.log(`[User Router] 返回 ${paginatedUsers.length}/${filteredUsers.length} 个用户`);

      return {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit),
        },
      };
    }),

  /**
   * Query: 根据 ID 获取单个用户
   * 
   * 公开访问
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .query(({ input }) => {
      console.log('[User Router] 查询用户, ID:', input.id);

      const user = users.find((u) => u.id === input.id);

      if (!user) {
        console.log('[User Router] ❌ 用户不存在');
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `用户 ${input.id} 不存在`,
        });
      }

      console.log('[User Router] ✅ 找到用户:', user.name);
      return user;
    }),

  /**
   * Query: 获取当前登录用户的资料
   * 
   * 需要登录
   */
  getProfile: protectedProcedure.query(({ ctx }) => {
    console.log('[User Router] 获取当前用户资料');

    // ctx.user 保证存在（由 protectedProcedure 保证）
    const user = users.find((u) => u.email === ctx.user.email);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: '用户不存在',
      });
    }

    console.log('[User Router] ✅ 返回用户资料:', user.name);
    return user;
  }),

  /**
   * Mutation: 创建新用户
   * 
   * 公开访问（注册）
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, '姓名不能为空').max(100),
        email: z.string().email('邮箱格式不正确'),
        role: z.enum(['USER', 'ADMIN']).default('USER'),
      })
    )
    .mutation(({ input }) => {
      console.log('[User Router] 创建用户, 数据:', input);

      // 检查邮箱是否已存在
      if (users.find((u) => u.email === input.email)) {
        console.log('[User Router] ❌ 邮箱已存在');
        throw new TRPCError({
          code: 'CONFLICT',
          message: '该邮箱已被注册',
        });
      }

      // 创建用户
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        name: input.name,
        email: input.email,
        role: input.role,
        createdAt: new Date(),
      };

      users.push(newUser);

      console.log('[User Router] ✅ 用户创建成功, ID:', newUser.id);
      return newUser;
    }),

  /**
   * Mutation: 更新用户信息
   * 
   * 需要登录，只能更新自己的信息
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      console.log('[User Router] 更新用户, 数据:', input);

      const user = users.find((u) => u.id === input.id);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        });
      }

      // 权限检查：只能更新自己的信息（除非是管理员）
      if (user.email !== ctx.user.email && ctx.user.role !== 'ADMIN') {
        console.log('[User Router] ❌ 权限不足');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '你无权修改此用户',
        });
      }

      // 更新用户
      if (input.name) user.name = input.name;
      if (input.email) {
        // 检查新邮箱是否已被使用
        if (users.find((u) => u.email === input.email && u.id !== input.id)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '该邮箱已被使用',
          });
        }
        user.email = input.email;
      }

      console.log('[User Router] ✅ 用户更新成功');
      return user;
    }),

  /**
   * Mutation: 删除用户
   * 
   * 需要登录，只能删除自己（或管理员可以删除任何人）
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .mutation(({ input, ctx }) => {
      console.log('[User Router] 删除用户, ID:', input.id);

      const index = users.findIndex((u) => u.id === input.id);

      if (index === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        });
      }

      const user = users[index];

      // 权限检查
      if (user.email !== ctx.user.email && ctx.user.role !== 'ADMIN') {
        console.log('[User Router] ❌ 权限不足');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '你无权删除此用户',
        });
      }

      users.splice(index, 1);

      console.log('[User Router] ✅ 用户删除成功');
      return { success: true };
    }),

  /**
   * Query: 统计用户数量（按角色）
   * 
   * 公开访问
   */
  stats: publicProcedure.query(() => {
    console.log('[User Router] 查询用户统计');

    const stats = {
      total: users.length,
      byRole: {
        USER: users.filter((u) => u.role === 'USER').length,
        ADMIN: users.filter((u) => u.role === 'ADMIN').length,
      },
    };

    console.log('[User Router] 统计结果:', stats);
    return stats;
  }),
});
