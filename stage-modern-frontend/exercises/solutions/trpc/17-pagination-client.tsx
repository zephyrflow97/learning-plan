'use client';

import { trpc } from '@/lib/trpc';

export default function PostsPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.post.getPostsPaginated.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (isLoading) return <div>加载中...</div>;

  const allPosts = data?.pages.flatMap(page => page.posts) ?? [];

  console.log('[客户端] 当前已加载文章数:', allPosts.length);
  console.log('[客户端] 是否有下一页:', hasNextPage);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1>📄 文章列表</h1>

      <div style={{ marginTop: '20px' }}>
        {allPosts.map(post => (
          <div
            key={post.id}
            style={{
              padding: '20px',
              marginBottom: '15px',
              border: '1px solid #eee',
              borderRadius: '8px',
            }}
          >
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>
              {post.title}
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {new Date(post.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <button
          onClick={() => {
            console.log('[客户端] 加载下一页');
            fetchNextPage();
          }}
          disabled={isFetchingNextPage}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: isFetchingNextPage ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isFetchingNextPage ? 'not-allowed' : 'pointer',
          }}
        >
          {isFetchingNextPage ? '加载中...' : '加载更多'}
        </button>
      )}

      {!hasNextPage && (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
          已加载全部文章
        </p>
      )}
    </div>
  );
}
