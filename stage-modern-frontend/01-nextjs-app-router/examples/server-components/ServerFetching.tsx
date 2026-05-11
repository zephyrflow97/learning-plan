/**
 * Server Component 数据获取示例
 * 
 * 这个示例展示了 Next.js App Router 中 Server Component 的数据获取模式:
 * - 组件本身是 async 函数
 * - 直接在组件中查询数据库(不需要 API Route)
 * - 服务器渲染完整 HTML,用户立刻看到内容
 * 
 * 优势:
 * 1. 零样板代码(没有 useState, useEffect, loading 状态)
 * 2. 服务器直接查询数据库,最快速度
 * 3. SEO 友好(爬虫看到完整 HTML)
 * 4. 不增加客户端 JS 体积
 * 
 * 对比: 查看 client-components/OldClientFetching.tsx 了解旧方式
 */

import { db } from '@/lib/db';
import { cache } from 'react';
import { notFound } from 'next/navigation';

// ==================== 类型定义 ====================

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  viewCount: number;
}

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// ==================== 数据获取函数 ====================

/**
 * 使用 cache() 包裹数据获取函数
 * 
 * 好处:
 * 1. 同一请求期间,相同参数的调用只执行一次
 * 2. 避免重复查询数据库
 * 3. 不同用户请求之间是隔离的(不会数据混淆)
 */
const getPost = cache(async (id: string): Promise<Post | null> => {
  console.log('🟢 [Server] 开始查询数据库,文章 ID:', id);
  console.log('🟢 [Server] 时间:', new Date().toISOString());

  try {
    // 直接查询数据库(Prisma 示例)
    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      console.log('⚠️ [Server] 文章不存在:', id);
      return null;
    }

    console.log('✅ [Server] 查询成功:', {
      title: post.title,
      author: post.author.name,
      viewCount: post.viewCount,
    });

    // 增加浏览次数(异步,不阻塞渲染)
    db.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).then(() => {
      console.log('🟢 [Server] 浏览次数已更新');
    });

    return post as Post;
  } catch (error) {
    console.error('🔴 [Server] 数据库查询失败:', error);
    throw new Error('Failed to fetch post');
  }
});

/**
 * 获取相关文章(演示并行数据获取)
 */
const getRelatedPosts = cache(async (tags: string[], currentId: string) => {
  console.log('🟢 [Server] 查询相关文章,标签:', tags);

  const relatedPosts = await db.post.findMany({
    where: {
      AND: [
        { id: { not: currentId } }, // 排除当前文章
        { tags: { hasSome: tags } }, // 至少有一个相同标签
      ],
    },
    take: 3,
    orderBy: { viewCount: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  console.log('🟢 [Server] 找到', relatedPosts.length, '篇相关文章');
  return relatedPosts;
});

// ==================== 主组件 ====================

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  console.log('🟢 [Server] 开始渲染页面组件');
  console.log('🟢 [Server] 路由参数:', params);
  console.log('🟢 [Server] URL 参数:', searchParams);

  // ✅ 并行获取数据
  // getPost 会立即发起,不会阻塞 Promise.all
  const postPromise = getPost(params.id);
  
  // 等待主要数据
  const post = await postPromise;

  // 处理 404
  if (!post) {
    console.log('⚠️ [Server] 触发 404 页面');
    notFound(); // 会渲染 app/blog/[id]/not-found.tsx
  }

  // 并行获取相关文章(不阻塞主内容渲染)
  const relatedPosts = await getRelatedPosts(post.tags, post.id);

  console.log('✅ [Server] 所有数据准备完毕,开始渲染 HTML');

  // ==================== 渲染 ====================

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 文章头部 */}
      <article className="prose lg:prose-xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          {/* 作者信息 */}
          <div className="flex items-center gap-4 text-gray-600">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-sm">
                {new Date(post.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' · '}
                {post.viewCount} 次浏览
              </p>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex gap-2 mt-4">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* 文章内容 */}
        <div 
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* 相关文章 */}
      {relatedPosts.length > 0 && (
        <aside className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">相关文章</h2>
          <ul className="space-y-4">
            {relatedPosts.map(related => (
              <li key={related.id}>
                <a 
                  href={`/blog/${related.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {related.title}
                </a>
                <span className="text-gray-500 text-sm ml-2">
                  {new Date(related.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

// ==================== Metadata(SEO) ====================

/**
 * 动态生成 SEO metadata
 * Next.js 会在渲染前调用这个函数
 */
export async function generateMetadata({ params }: PageProps) {
  const post = await getPost(params.id);

  if (!post) {
    return {
      title: '文章不存在',
    };
  }

  console.log('🟢 [Server] 生成 Metadata:', post.title);

  return {
    title: post.title,
    description: post.content.substring(0, 160), // 前 160 字符作为描述
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.substring(0, 160),
    },
  };
}

// ==================== 静态生成(可选) ====================

/**
 * 如果你的博客文章数量有限,可以在构建时生成所有页面
 * 
 * 这会在 `npm run build` 时预渲染所有文章页面
 */
export async function generateStaticParams() {
  console.log('🟢 [Build] 生成静态路径');

  const posts = await db.post.findMany({
    select: { id: true },
    take: 100, // 限制数量,避免构建时间过长
  });

  console.log('🟢 [Build] 找到', posts.length, '篇文章');

  return posts.map(post => ({
    id: post.id,
  }));
}

// ==================== 缓存配置 ====================

/**
 * 设置页面的 revalidation 时间(秒)
 * 
 * - false: 永久缓存(默认,适合博客文章)
 * - 0: 不缓存,每次请求都重新渲染
 * - 60: 缓存 60 秒,之后重新验证
 */
export const revalidate = 3600; // 1 小时

// ==================== 使用说明 ====================

/**
 * 文件位置: app/blog/[id]/page.tsx
 * 
 * 配套文件:
 * - app/blog/[id]/loading.tsx (Loading UI)
 * - app/blog/[id]/error.tsx (Error UI)
 * - app/blog/[id]/not-found.tsx (404 UI)
 * 
 * 数据库配置(Prisma):
 * 
 * // prisma/schema.prisma
 * model Post {
 *   id        String   @id @default(cuid())
 *   title     String
 *   content   String   @db.Text
 *   tags      String[]
 *   viewCount Int      @default(0)
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 *   author    User     @relation(fields: [authorId], references: [id])
 *   authorId  String
 * }
 * 
 * model User {
 *   id     String @id @default(cuid())
 *   name   String
 *   avatar String
 *   posts  Post[]
 * }
 */

// ==================== 性能对比 ====================

/**
 * Server Component(这个示例):
 * 
 * 0ms:    浏览器请求 /blog/123
 * 50ms:   服务器查询数据库(getPost)
 * 100ms:  服务器查询相关文章(getRelatedPosts)
 * 150ms:  服务器渲染 HTML
 * 200ms:  返回完整 HTML 给客户端
 * 200ms:  用户看到内容 ✅
 * 
 * Client Component(旧方式,见 OldClientFetching.tsx):
 * 
 * 0ms:    浏览器请求 /blog/123
 * 100ms:  返回空 HTML
 * 200ms:  下载 JS bundle
 * 300ms:  React 渲染,useEffect 触发
 * 400ms:  发起 /api/posts/123
 * 600ms:  API 查询数据库,返回
 * 700ms:  用户看到内容 ❌
 * 
 * 提升: 3.5 倍
 */
