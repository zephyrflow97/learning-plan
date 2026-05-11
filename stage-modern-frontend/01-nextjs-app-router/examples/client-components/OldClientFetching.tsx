/**
 * 传统 React 客户端数据获取示例
 * 
 * 这个示例展示了传统 React SPA 中数据获取的典型模式:
 * - 使用 useEffect 发起网络请求
 * - 手动管理 loading、error、data 状态
 * - 所有逻辑在客户端执行
 * 
 * 问题:
 * 1. 样板代码多(20+ 行仅用于状态管理)
 * 2. 客户端发起请求,增加延迟(服务器 → 客户端 → API)
 * 3. SEO 差(爬虫看不到数据)
 * 4. 需要额外的 API Route
 * 
 * 对比: 查看 server-components/ServerFetching.tsx 了解新方式
 */

'use client';

import { useState, useEffect } from 'react';

// ==================== 类型定义 ====================

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface BlogPostProps {
  id: string;
}

// ==================== 主组件 ====================

export default function BlogPost({ id }: BlogPostProps) {
  // 状态管理三件套
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔵 [Client] useEffect 触发,准备获取数据');
    console.log('🔵 [Client] 文章 ID:', id);

    // 重置状态(处理 id 变化的情况)
    setLoading(true);
    setError(null);

    // 发起网络请求
    fetch(`/api/posts/${id}`)
      .then(res => {
        console.log('🔵 [Client] 收到响应,状态码:', res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        return res.json();
      })
      .then(data => {
        console.log('🔵 [Client] 数据解析成功:', data);
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('🔴 [Client] 请求失败:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]); // id 变化时重新请求

  // ==================== 渲染逻辑 ====================

  // Loading 状态
  if (loading) {
    console.log('🔵 [Client] 渲染 Loading 状态');
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Error 状态
  if (error) {
    console.log('🔴 [Client] 渲染 Error 状态');
    return (
      <div className="error-container">
        <h2>❌ 加载失败</h2>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    );
  }

  // 数据为空
  if (!post) {
    console.log('⚠️ [Client] 数据为空');
    return <div>文章不存在</div>;
  }

  // 正常渲染
  console.log('✅ [Client] 渲染文章内容');
  return (
    <article className="blog-post">
      <h1>{post.title}</h1>
      <div className="meta">
        <span className="author">作者: {post.author}</span>
        <span className="date">
          发布于: {new Date(post.createdAt).toLocaleDateString('zh-CN')}
        </span>
      </div>
      <div className="content">
        {post.content}
      </div>
    </article>
  );
}

// ==================== 配套 API Route ====================

/**
 * 这个组件还需要一个 API Route:
 * 
 * // app/api/posts/[id]/route.ts
 * import { NextResponse } from 'next/server';
 * import { db } from '@/lib/db';
 * 
 * export async function GET(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   try {
 *     const post = await db.post.findUnique({
 *       where: { id: params.id },
 *     });
 * 
 *     if (!post) {
 *       return NextResponse.json(
 *         { error: 'Post not found' },
 *         { status: 404 }
 *       );
 *     }
 * 
 *     return NextResponse.json(post);
 *   } catch (error) {
 *     return NextResponse.json(
 *       { error: 'Internal Server Error' },
 *       { status: 500 }
 *     );
 *   }
 * }
 */

// ==================== 使用示例 ====================

/**
 * // app/blog/[id]/page.tsx
 * import BlogPost from '@/components/BlogPost';
 * 
 * export default function Page({ params }: { params: { id: string } }) {
 *   return <BlogPost id={params.id} />;
 * }
 */

// ==================== 性能分析 ====================

/**
 * 时间线(用户访问 /blog/123):
 * 
 * 0ms:    浏览器请求 /blog/123
 * 100ms:  服务器返回 HTML (几乎空的,只有 <div id="root"></div>)
 * 200ms:  浏览器下载 JS bundle (包含这个组件代码)
 * 300ms:  React 渲染组件,useEffect 触发
 * 400ms:  发起 /api/posts/123 请求
 * 600ms:  API 查询数据库,返回数据
 * 700ms:  组件重新渲染,用户终于看到内容
 * 
 * 总耗时: 700ms
 * 用户前 700ms 看到的: Loading... 或空白
 * SEO: ❌ 爬虫看不到内容
 * JS 体积: ✅ 这个组件的代码 + useState/useEffect 都打包到客户端
 */

// ==================== 对比 Server Component ====================

/**
 * Server Component 方式(app/blog/[id]/page.tsx):
 * 
 * export default async function Page({ params }: { params: { id: string } }) {
 *   const post = await db.post.findUnique({ where: { id: params.id } });
 *   
 *   if (!post) throw new Error('Post not found');
 *   
 *   return <article>...</article>;
 * }
 * 
 * 时间线:
 * 0ms:    浏览器请求 /blog/123
 * 100ms:  服务器查询数据库
 * 200ms:  服务器渲染 HTML,返回完整内容
 * 200ms:  用户看到完整页面 ✅
 * 
 * 总耗时: 200ms (快 3.5 倍!)
 * SEO: ✅ 爬虫看到完整 HTML
 * JS 体积: ✅ 组件代码不发送到客户端
 * API Route: ✅ 不需要额外的 API
 */
