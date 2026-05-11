/**
 * Next.js Server Actions 示例
 * 
 * 展示：在 Server Actions 中使用 Prisma 处理表单提交
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ==========================================
// 创建用户 Action
// ==========================================

export async function createUser(formData: FormData) {
  console.log('[Server Action] createUser');

  try {
    // 从 FormData 获取数据
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    console.log('[Server Action] 表单数据:', { name, email });

    // 验证输入
    if (!name || !email) {
      return {
        success: false,
        error: '姓名和邮箱不能为空',
      };
    }

    if (!email.includes('@')) {
      return {
        success: false,
        error: '邮箱格式不正确',
      };
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    });

    console.log('[Server Action] 用户创建成功:', user.id);

    // 重新验证缓存（刷新用户列表页面）
    revalidatePath('/users');

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('[Server Action] 创建失败:', error);

    // 处理 Prisma 错误
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: '该邮箱已被注册',
        };
      }
    }

    return {
      success: false,
      error: '创建用户失败，请稍后重试',
    };
  }
}

// ==========================================
// 创建帖子 Action
// ==========================================

export async function createPost(formData: FormData) {
  console.log('[Server Action] createPost');

  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const authorId = parseInt(formData.get('authorId') as string, 10);
    const published = formData.get('published') === 'on';

    console.log('[Server Action] 表单数据:', { title, authorId, published });

    // 验证输入
    if (!title || !content || !authorId) {
      return {
        success: false,
        error: '标题、内容和作者不能为空',
      };
    }

    // 创建帖子
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        published,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('[Server Action] 帖子创建成功:', post.id);

    // 重新验证缓存
    revalidatePath('/posts');
    revalidatePath(`/users/${authorId}`);

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error('[Server Action] 创建失败:', error);

    // 处理外键约束错误
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return {
          success: false,
          error: '用户不存在',
        };
      }
    }

    return {
      success: false,
      error: '创建帖子失败，请稍后重试',
    };
  }
}

// ==========================================
// 更新用户 Action
// ==========================================

export async function updateUser(userId: number, formData: FormData) {
  console.log('[Server Action] updateUser:', userId);

  try {
    const name = formData.get('name') as string;

    if (!name) {
      return {
        success: false,
        error: '姓名不能为空',
      };
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
      },
    });

    console.log('[Server Action] 用户更新成功:', user.id);

    // 重新验证缓存
    revalidatePath('/users');
    revalidatePath(`/users/${userId}`);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('[Server Action] 更新失败:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: '用户不存在',
        };
      }
    }

    return {
      success: false,
      error: '更新用户失败，请稍后重试',
    };
  }
}

// ==========================================
// 删除用户 Action
// ==========================================

export async function deleteUser(userId: number) {
  console.log('[Server Action] deleteUser:', userId);

  try {
    // 使用事务删除用户及其所有关联数据
    await prisma.$transaction([
      // 1. 删除用户的评论
      prisma.comment.deleteMany({
        where: { authorId: userId },
      }),
      // 2. 删除用户的帖子
      prisma.post.deleteMany({
        where: { authorId: userId },
      }),
      // 3. 删除用户的资料
      prisma.profile.deleteMany({
        where: { userId },
      }),
      // 4. 删除用户
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    console.log('[Server Action] 用户删除成功:', userId);

    // 重新验证缓存
    revalidatePath('/users');

    // 重定向到用户列表页面
    redirect('/users');
  } catch (error) {
    console.error('[Server Action] 删除失败:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: '用户不存在',
        };
      }
    }

    return {
      success: false,
      error: '删除用户失败，请稍后重试',
    };
  }
}

// ==========================================
// 批量删除帖子 Action
// ==========================================

export async function bulkDeletePosts(postIds: number[]) {
  console.log('[Server Action] bulkDeletePosts:', postIds);

  try {
    if (!postIds || postIds.length === 0) {
      return {
        success: false,
        error: '未选择要删除的帖子',
      };
    }

    // 批量删除
    const result = await prisma.post.deleteMany({
      where: {
        id: {
          in: postIds,
        },
      },
    });

    console.log(`[Server Action] 删除成功: ${result.count} 篇帖子`);

    // 重新验证缓存
    revalidatePath('/posts');

    return {
      success: true,
      data: {
        deletedCount: result.count,
      },
    };
  } catch (error) {
    console.error('[Server Action] 批量删除失败:', error);

    return {
      success: false,
      error: '删除帖子失败，请稍后重试',
    };
  }
}

// ==========================================
// 发布/取消发布帖子 Action
// ==========================================

export async function togglePostPublished(postId: number) {
  console.log('[Server Action] togglePostPublished:', postId);

  try {
    // 先查询当前状态
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, published: true },
    });

    if (!post) {
      return {
        success: false,
        error: '帖子不存在',
      };
    }

    // 切换发布状态
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        published: !post.published,
      },
    });

    console.log(
      `[Server Action] 帖子状态切换成功: ${updatedPost.published ? '已发布' : '未发布'}`
    );

    // 重新验证缓存
    revalidatePath('/posts');
    revalidatePath(`/posts/${postId}`);

    return {
      success: true,
      data: {
        published: updatedPost.published,
      },
    };
  } catch (error) {
    console.error('[Server Action] 切换状态失败:', error);

    return {
      success: false,
      error: '操作失败，请稍后重试',
    };
  }
}
