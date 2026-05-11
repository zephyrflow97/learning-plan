/**
 * Next.js Server Component 示例
 * 
 * 展示：在 Server Component 中直接使用 Prisma
 */

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// ==========================================
// Server Component（异步组件）
// ==========================================

export default async function UsersPage() {
  console.log('[Server Component] UsersPage 开始渲染');
  console.log('[Server Component] 当前时间:', new Date().toISOString());

  // ✅ Server Component 中可以直接使用 async/await
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10, // 最多显示 10 个用户
  });

  console.log(`[Server Component] 查询到 ${users.length} 个用户`);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          用户列表
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          共 {users.length} 个用户
        </p>
      </div>

      {/* 用户列表 */}
      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {user.name}
                </h2>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
                <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>📝 {user._count.posts} 篇帖子</span>
                  <span>💬 {user._count.comments} 条评论</span>
                </div>
              </div>
              <Link
                href={`/users/${user.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                查看详情
              </Link>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              注册时间: {new Date(user.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </div>
        ))}
      </div>

      {/* 无数据提示 */}
      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          暂无用户数据
        </div>
      )}
    </div>
  );
}

// ==========================================
// 元数据（SEO 优化）
// ==========================================

export const metadata = {
  title: '用户列表 | Prisma Next.js 示例',
  description: '展示如何在 Next.js Server Component 中使用 Prisma 查询数据',
};

// ==========================================
// Streaming 和 Suspense
// ==========================================

// 如果查询很慢，可以使用 Suspense 实现 Streaming
// export default function UsersPage() {
//   return (
//     <Suspense fallback={<UserListSkeleton />}>
//       <UserList />
//     </Suspense>
//   );
// }
//
// async function UserList() {
//   const users = await prisma.user.findMany(...);
//   return <div>...</div>;
// }
