// ==========================================
// CreatePost 组件 — tRPC Mutation 示例
// ==========================================

'use client';

import { trpc } from '../trpc';
import { useState } from 'react';

/**
 * 创建帖子表单组件
 * 
 * 演示 tRPC Mutation 的用法：
 * - trpc.post.create.useMutation() 调用 mutation
 * - 成功后使缓存失效
 * - 手动更新缓存（避免重新拉取）
 */
export function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const utils = trpc.useUtils();
  
  /**
   * 创建帖子 Mutation
   * 
   * ✅ tRPC 自动推断类型：
   * - input 必须是 { title: string, content: string, tags?: string[] }
   * - 返回值类型自动推断
   */
  const mutation = trpc.post.create.useMutation({
    /**
     * onSuccess — Mutation 成功后的回调
     * 
     * @param newPost - 新创建的帖子（从服务器返回）
     */
    onSuccess: (newPost) => {
      console.log('[Mutation] 创建成功, 新帖子:', newPost);
      
      /**
       * 方式 1: 使缓存失效，触发重新拉取
       * 
       * ✅ 简单，保证数据一致性
       * ❌ 需要额外的网络请求
       */
      utils.post.list.invalidate();
      
      /**
       * 方式 2: 手动更新缓存（避免重新拉取）
       * 
       * ✅ 不需要网络请求，用户体验更好
       * ⚠️ 需要手动维护缓存一致性
       */
      // utils.post.list.setData(undefined, (old) => {
      //   if (!old) return old;
      //   return {
      //     ...old,
      //     posts: [newPost, ...old.posts],
      //   };
      // });
      
      // 清空表单
      setTitle('');
      setContent('');
    },
    
    /**
     * onError — Mutation 失败后的回调
     */
    onError: (error) => {
      console.error('[Mutation] 创建失败:', error);
      alert(`创建失败: ${error.message}`);
    },
  });
  
  /**
   * 表单提交处理
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('[CreatePost] 提交表单, title:', title, 'content:', content);
    
    // 验证
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空');
      return;
    }
    
    // 调用 mutation
    mutation.mutate({
      title,
      content,
      tags: ['tRPC', 'TypeScript'], // 可选字段
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <h2>创建新帖子</h2>
      
      {/* 标题输入 */}
      <div className="form-group">
        <label htmlFor="title">标题</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入标题"
          disabled={mutation.isPending}
        />
      </div>
      
      {/* 内容输入 */}
      <div className="form-group">
        <label htmlFor="content">内容</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="输入内容"
          rows={5}
          disabled={mutation.isPending}
        />
      </div>
      
      {/* 提交按钮 */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '发布中...' : '发布'}
      </button>
      
      {/* 错误提示 */}
      {mutation.error && (
        <div className="error">
          错误: {mutation.error.message}
          
          {/* ✅ tRPC 错误包含详细信息 */}
          {mutation.error.data?.code && (
            <div className="error-code">
              错误码: {mutation.error.data.code}
            </div>
          )}
          
          {/* ✅ Zod 验证错误 */}
          {mutation.error.data?.zodError && (
            <div className="validation-errors">
              <pre>{JSON.stringify(mutation.error.data.zodError, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      
      {/* 成功提示 */}
      {mutation.isSuccess && (
        <div className="success">
          ✅ 帖子已发布！
        </div>
      )}
    </form>
  );
}

/**
 * 📚 类型安全的好处
 * 
 * 如果你传错参数：
 * 
 * ```typescript
 * mutation.mutate({ title: 123, content: "abc" });
 * //                       ^^^
 * // ❌ Type 'number' is not assignable to type 'string'
 * ```
 * 
 * 如果你访问不存在的字段：
 * 
 * ```typescript
 * onSuccess: (newPost) => {
 *   console.log(newPost.author.name);
 *   //          ^^^^^^^
 *   // ❌ Property 'author' does not exist on type 'Post'
 * }
 * ```
 * 
 * TypeScript 会立刻报错，而不是等到运行时才崩溃。
 */

/**
 * 📚 Mutation 状态
 * 
 * - mutation.isPending: Mutation 正在执行
 * - mutation.isSuccess: Mutation 成功完成
 * - mutation.isError: Mutation 失败
 * - mutation.error: 错误对象（如果失败）
 * - mutation.data: 返回数据（如果成功）
 */

/**
 * 📚 样式（仅供参考）
 * 
 * ```css
 * .create-post-form {
 *   max-width: 600px;
 *   margin: 20px auto;
 *   padding: 20px;
 *   border: 1px solid #ddd;
 *   border-radius: 8px;
 * }
 * 
 * .form-group {
 *   margin-bottom: 15px;
 * }
 * 
 * .form-group label {
 *   display: block;
 *   margin-bottom: 5px;
 *   font-weight: bold;
 * }
 * 
 * .form-group input,
 * .form-group textarea {
 *   width: 100%;
 *   padding: 8px;
 *   border: 1px solid #ccc;
 *   border-radius: 4px;
 * }
 * 
 * .error {
 *   padding: 10px;
 *   background: #fee;
 *   color: #c00;
 *   border-radius: 4px;
 *   margin-top: 10px;
 * }
 * 
 * .success {
 *   padding: 10px;
 *   background: #efe;
 *   color: #0a0;
 *   border-radius: 4px;
 *   margin-top: 10px;
 * }
 * ```
 */
