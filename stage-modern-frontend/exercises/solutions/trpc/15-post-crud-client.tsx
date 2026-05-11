'use client';

import { trpc } from '@/lib/trpc';

export default function PostManager() {
  const utils = trpc.useUtils();

  // 查询所有文章
  const { data: posts, isLoading } = trpc.post.getPosts.useQuery({
    published: true,
  });

  // 创建文章 mutation
  const createMutation = trpc.post.createPost.useMutation({
    onSuccess: () => {
      // 刷新文章列表
      utils.post.getPosts.invalidate();
      console.log('[客户端] 文章创建成功,刷新列表');
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      title: '新文章',
      content: '内容...',
      authorId: 1,
    });
  };

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      <button onClick={handleCreate}>创建文章</button>
      
      <ul>
        {posts?.map(post => (
          <li key={post.id}>
            {post.title} - by {post.author.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
