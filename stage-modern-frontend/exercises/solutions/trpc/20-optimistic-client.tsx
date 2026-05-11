'use client';

import { trpc } from '@/lib/trpc';

export default function LikeButton({ postId }: { postId: number }) {
  const utils = trpc.useUtils();

  const { data } = trpc.like.getLikes.useQuery({ postId });

  const likeMutation = trpc.like.toggleLike.useMutation({
    // 乐观更新:立即更新 UI
    onMutate: async (variables) => {
      console.log('[乐观更新] 开始,postId:', variables.postId);

      // 取消正在进行的查询(避免覆盖乐观更新)
      await utils.like.getLikes.cancel({ postId: variables.postId });

      // 保存当前数据(用于回滚)
      const previousData = utils.like.getLikes.getData({ postId: variables.postId });

      // 乐观更新 UI
      utils.like.getLikes.setData(
        { postId: variables.postId },
        (old) => ({
          postId: variables.postId,
          likes: (old?.likes || 0) + 1,
        })
      );

      return { previousData };
    },

    // 成功时刷新数据
    onSuccess: (data) => {
      console.log('[成功] 点赞成功,最新点赞数:', data.likes);
      utils.like.getLikes.invalidate({ postId: data.postId });
    },

    // 失败时回滚
    onError: (error, variables, context) => {
      console.error('[失败] 点赞失败,回滚数据');

      if (context?.previousData) {
        utils.like.getLikes.setData(
          { postId: variables.postId },
          context.previousData
        );
      }

      alert(`❌ ${error.message}`);
    },
  });

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '10px' }}>
        ❤️
      </div>
      
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
        {data?.likes || 0} 个赞
      </div>

      <button
        onClick={() => {
          console.log('[用户操作] 点击点赞按钮');
          likeMutation.mutate({ postId });
        }}
        disabled={likeMutation.isLoading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: likeMutation.isLoading ? '#ccc' : '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: likeMutation.isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {likeMutation.isLoading ? '处理中...' : '👍 点赞'}
      </button>

      <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
        ℹ️ 有 20% 概率失败(测试错误回滚)
      </p>
    </div>
  );
}
