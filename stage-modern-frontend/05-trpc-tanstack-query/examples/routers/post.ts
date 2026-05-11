/**
 * Post Router（帖子路由器）
 * 
 * 完整的博客系统 CRUD 示例
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './trpc';
import { TRPCError } from '@trpc/server';

// ==========================================
// 模拟数据库
// ==========================================

type Post = {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
};

const posts: Post[] = [
  {
    id: 1,
    title: 'Hello Prisma',
    content: 'This is my first post about Prisma.',
    published: true,
    authorId: 1,
    likeCount: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    title: 'tRPC Tutorial',
    content: 'Learn tRPC with this comprehensive guide.',
    published: true,
    authorId: 1,
    likeCount: 10,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 3,
    title: 'Draft Post',
    content: 'This post is not published yet.',
    published: false,
    authorId: 2,
    likeCount: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

// ==========================================
// Post Router
// ==========================================

export const postRouter = router({
  /**
   * Query: 获取帖子列表
   * 
   * 支持分页、搜索、过滤（已发布/草稿）
   */
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        published: z.boolean().optional(), // 过滤：已发布/草稿
        authorId: z.number().optional(), // 过滤：特定作者
      })
    )
    .query(({ input }) => {
      console.log('[Post Router] 查询帖子列表, 参数:', input);

      const { page, limit, search, published, authorId } = input;

      // 过滤
      let filteredPosts = posts;

      // 搜索过滤
      if (search) {
        filteredPosts = filteredPosts.filter(
          (post) =>
            post.title.toLowerCase().includes(search.toLowerCase()) ||
            post.content.toLowerCase().includes(search.toLowerCase())
        );
      }

      // 发布状态过滤
      if (published !== undefined) {
        filteredPosts = filteredPosts.filter((post) => post.published === published);
      }

      // 作者过滤
      if (authorId !== undefined) {
        filteredPosts = filteredPosts.filter((post) => post.authorId === authorId);
      }

      // 排序（最新优先）
      filteredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // 分页
      const start = (page - 1) * limit;
      const paginatedPosts = filteredPosts.slice(start, start + limit);

      console.log(`[Post Router] 返回 ${paginatedPosts.length}/${filteredPosts.length} 篇帖子`);

      return {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: filteredPosts.length,
          totalPages: Math.ceil(filteredPosts.length / limit),
        },
      };
    }),

  /**
   * Query: 根据 ID 获取单个帖子
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .query(({ input }) => {
      console.log('[Post Router] 查询帖子, ID:', input.id);

      const post = posts.find((p) => p.id === input.id);

      if (!post) {
        console.log('[Post Router] ❌ 帖子不存在');
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `帖子 ${input.id} 不存在`,
        });
      }

      console.log('[Post Router] ✅ 找到帖子:', post.title);
      return post;
    }),

  /**
   * Mutation: 创建新帖子
   * 
   * 需要登录
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, '标题不能为空').max(200),
        content: z.string().min(1, '内容不能为空'),
        published: z.boolean().default(false),
      })
    )
    .mutation(({ input, ctx }) => {
      console.log('[Post Router] 创建帖子, 数据:', input);

      // 创建帖子
      const newPost: Post = {
        id: Math.max(...posts.map((p) => p.id), 0) + 1,
        title: input.title,
        content: input.content,
        published: input.published,
        authorId: ctx.user.id, // 当前登录用户
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      posts.push(newPost);

      console.log('[Post Router] ✅ 帖子创建成功, ID:', newPost.id);
      return newPost;
    }),

  /**
   * Mutation: 更新帖子
   * 
   * 需要登录，只能更新自己的帖子
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      console.log('[Post Router] 更新帖子, 数据:', input);

      const post = posts.find((p) => p.id === input.id);

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '帖子不存在',
        });
      }

      // 权限检查：只能更新自己的帖子（除非是管理员）
      if (post.authorId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        console.log('[Post Router] ❌ 权限不足');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '你无权修改此帖子',
        });
      }

      // 更新帖子
      if (input.title) post.title = input.title;
      if (input.content) post.content = input.content;
      if (input.published !== undefined) post.published = input.published;
      post.updatedAt = new Date();

      console.log('[Post Router] ✅ 帖子更新成功');
      return post;
    }),

  /**
   * Mutation: 删除帖子
   * 
   * 需要登录，只能删除自己的帖子
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .mutation(({ input, ctx }) => {
      console.log('[Post Router] 删除帖子, ID:', input.id);

      const index = posts.findIndex((p) => p.id === input.id);

      if (index === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '帖子不存在',
        });
      }

      const post = posts[index];

      // 权限检查
      if (post.authorId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        console.log('[Post Router] ❌ 权限不足');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '你无权删除此帖子',
        });
      }

      posts.splice(index, 1);

      console.log('[Post Router] ✅ 帖子删除成功');
      return { success: true };
    }),

  /**
   * Mutation: 点赞帖子（Toggle）
   * 
   * 需要登录，切换点赞状态
   */
  like: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .mutation(({ input }) => {
      console.log('[Post Router] 点赞帖子, ID:', input.id);

      const post = posts.find((p) => p.id === input.id);

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '帖子不存在',
        });
      }

      // 简单的 toggle 逻辑（实际应用中需要记录用户点赞记录）
      // 这里假设: likeCount 增加表示点赞，减少表示取消点赞
      // 实际应用中应该维护一个 PostLike 表
      const liked = false; // 模拟：假设当前未点赞
      post.likeCount += liked ? -1 : 1;

      console.log(`[Post Router] ✅ 点赞成功, 当前点赞数: ${post.likeCount}`);

      return {
        likeCount: post.likeCount,
        liked: !liked,
      };
    }),

  /**
   * Mutation: 发布/取消发布帖子
   * 
   * 需要登录，只能操作自己的帖子
   */
  togglePublish: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .mutation(({ input, ctx }) => {
      console.log('[Post Router] 切换发布状态, ID:', input.id);

      const post = posts.find((p) => p.id === input.id);

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '帖子不存在',
        });
      }

      // 权限检查
      if (post.authorId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        console.log('[Post Router] ❌ 权限不足');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '你无权修改此帖子',
        });
      }

      post.published = !post.published;
      post.updatedAt = new Date();

      console.log(`[Post Router] ✅ 发布状态已切换为: ${post.published ? '已发布' : '草稿'}`);

      return {
        published: post.published,
      };
    }),

  /**
   * Query: 获取帖子统计
   */
  stats: publicProcedure.query(() => {
    console.log('[Post Router] 查询帖子统计');

    const stats = {
      total: posts.length,
      published: posts.filter((p) => p.published).length,
      draft: posts.filter((p) => !p.published).length,
      totalLikes: posts.reduce((sum, p) => sum + p.likeCount, 0),
    };

    console.log('[Post Router] 统计结果:', stats);
    return stats;
  }),
});
