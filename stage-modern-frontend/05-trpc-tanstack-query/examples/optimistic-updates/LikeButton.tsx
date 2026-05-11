/**
 * 乐观更新完整示例 - 点赞按钮
 * 
 * 展示如何使用 tRPC + TanStack Query 实现乐观更新
 */

'use client';

import { trpc } from '../client/trpc';
import { useState } from 'react';

// ==========================================
// LikeButton 组件
// ==========================================

export function LikeButton({ postId }: { postId: number }) {
  console.log(`[LikeButton] 渲染组件, postId: ${postId}`);

  const utils = trpc.useUtils();

  // 查询帖子数据
  const { data: post, isLoading } = trpc.post.getById.useQuery({ id: postId });

  // 点赞 Mutation
  const likeMutation = trpc.post.like.useMutation({
    /**
     * onMutate: 在 Mutation 发送到服务器之前执行
     * 
     * 这里实现乐观更新：立刻更新 UI，不等服务器响应
     */
    onMutate: async () => {
      console.log(`[LikeButton] onMutate: 开始乐观更新 (postId: ${postId})`);
      console.log(`[LikeButton] 时间戳: ${new Date().toISOString()}`);

      // 1. 取消正在进行的查询，避免覆盖乐观更新
      await utils.post.getById.cancel({ id: postId });
      console.log('[LikeButton] 已取消正在进行的查询');

      // 2. 保存当前数据快照（用于错误回滚）
      const previousPost = utils.post.getById.getData({ id: postId });
      console.log('[LikeButton] 保存数据快照:', previousPost);

      // 3. 乐观更新：立刻修改缓存数据
      if (previousPost) {
        const optimisticPost = {
          ...previousPost,
          likeCount: previousPost.likeCount + 1, // ✅ 立刻 +1
        };

        utils.post.getById.setData({ id: postId }, optimisticPost);
        console.log('[LikeButton] ✅ 乐观更新成功, 新点赞数:', optimisticPost.likeCount);
      }

      // 4. 返回上下文（用于错误处理）
      return { previousPost };
    },

    /**
     * onError: 如果 Mutation 失败，执行回滚
     */
    onError: (err, variables, context) => {
      console.error('[LikeButton] onError: Mutation 失败!', err.message);
      console.log('[LikeButton] 开始回滚到之前的数据...');

      // 回滚到之前的数据
      if (context?.previousPost) {
        utils.post.getById.setData({ id: postId }, context.previousPost);
        console.log('[LikeButton] ❌ 已回滚, 点赞数:', context.previousPost.likeCount);
      }

      // 显示错误提示
      alert(`点赞失败: ${err.message}`);
    },

    /**
     * onSuccess: Mutation 成功后执行
     */
    onSuccess: (data) => {
      console.log('[LikeButton] onSuccess: Mutation 成功!');
      console.log('[LikeButton] 服务器返回的真实点赞数:', data.likeCount);
      console.log('[LikeButton] 是否已点赞:', data.liked);
    },

    /**
     * onSettled: 无论成功还是失败，最后都会执行
     * 
     * 这里重新拉取真实数据，确保数据一致性
     */
    onSettled: () => {
      console.log('[LikeButton] onSettled: Mutation 结束，重新拉取数据...');
      
      // 使缓存失效，触发重新拉取
      utils.post.getById.invalidate({ id: postId });
      console.log('[LikeButton] 已触发数据重新拉取');
    },
  });

  // 处理点击
  const handleLike = () => {
    console.log(`\n━━━ 用户点击点赞按钮 (postId: ${postId}) ━━━`);
    likeMutation.mutate({ id: postId });
  };

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!post) {
    return <div>帖子不存在</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className={`
          px-4 py-2 rounded-md font-medium transition-colors
          ${likeMutation.isPending 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {likeMutation.isPending ? '处理中...' : '❤️ 点赞'}
      </button>
      
      <span className="text-gray-700 dark:text-gray-300">
        {post.likeCount} 个赞
      </span>

      {/* 显示 Mutation 状态 */}
      {likeMutation.isPending && (
        <span className="text-sm text-blue-600">正在点赞...</span>
      )}
      {likeMutation.isError && (
        <span className="text-sm text-red-600">点赞失败!</span>
      )}
      {likeMutation.isSuccess && (
        <span className="text-sm text-green-600">点赞成功!</span>
      )}
    </div>
  );
}

// ==========================================
// 乐观更新的时间线
// ==========================================

/**
 * 时间线示例（假设网络延迟 300ms）:
 * 
 * T0ms: 用户点击按钮
 * T0ms: onMutate 执行
 *       - 取消正在进行的查询
 *       - 保存数据快照 (likeCount: 5)
 *       - 乐观更新 (likeCount: 6) ✅ UI 立刻显示 6
 * 
 * T1ms: 发送 HTTP 请求到服务器
 * 
 * T300ms: 服务器返回成功
 * T300ms: onSuccess 执行
 *         - 服务器返回真实数据 (likeCount: 6)
 * 
 * T301ms: onSettled 执行
 *         - 重新拉取数据
 * 
 * T600ms: 拉取完成，缓存更新
 *         - 确认数据一致 (likeCount: 6)
 * 
 * 
 * 如果服务器失败:
 * 
 * T0ms: 用户点击按钮
 * T0ms: onMutate 执行 (likeCount: 5 → 6)
 * T1ms: 发送请求
 * T300ms: 服务器返回 500 错误
 * T300ms: onError 执行
 *         - 回滚数据 (likeCount: 6 → 5) ❌
 *         - 显示错误提示
 * T301ms: onSettled 执行
 *         - 重新拉取数据（确保数据一致）
 */

// ==========================================
// 对比：不使用乐观更新
// ==========================================

/**
 * 不使用乐观更新的体验:
 * 
 * T0ms: 用户点击按钮
 * T0ms: UI 显示 "加载中..."
 * T300ms: 服务器返回成功
 * T300ms: UI 更新为新的点赞数
 * 
 * 用户体验: 需要等待 300ms 才能看到反馈 ❌
 * 
 * 使用乐观更新的体验:
 * 
 * T0ms: 用户点击按钮
 * T0ms: UI 立刻更新（乐观假设成功）✅
 * T300ms: 服务器确认成功（或失败时回滚）
 * 
 * 用户体验: 立刻看到反馈，感觉非常流畅 ✅
 */
