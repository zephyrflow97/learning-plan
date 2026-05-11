/**
 * Next.js API Route 示例
 * 
 * 展示：在 API Route 中使用 Prisma 处理 HTTP 请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ==========================================
// GET /api/users - 查询用户列表
// ==========================================

export async function GET(request: NextRequest) {
  console.log('[API] GET /api/users');

  try {
    // 从 URL 查询参数获取分页信息
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    console.log('[API] 查询参数:', { page, limit, search });

    // 构建查询条件
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // 并行查询：总数 + 分页数据
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    console.log(`[API] 查询成功: ${users.length}/${total} 个用户`);

    // 返回 JSON 响应
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('[API] 查询失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==========================================
// POST /api/users - 创建新用户
// ==========================================

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/users');

  try {
    // 解析请求体
    const body = await request.json();
    const { name, email } = body;

    console.log('[API] 请求数据:', { name, email });

    // 验证输入
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Name and email are required',
        },
        { status: 400 }
      );
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    console.log('[API] 用户创建成功:', user.id);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] 创建失败:', error);

    // 处理 Prisma 错误
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint failed
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: '该邮箱已被注册',
            field: error.meta?.target,
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE /api/users - 批量删除用户
// ==========================================

export async function DELETE(request: NextRequest) {
  console.log('[API] DELETE /api/users');

  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'User IDs array is required',
        },
        { status: 400 }
      );
    }

    console.log('[API] 删除用户:', ids);

    // 批量删除
    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    console.log(`[API] 删除成功: ${result.count} 个用户`);

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.count,
      },
    });
  } catch (error) {
    console.error('[API] 删除失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete users',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==========================================
// 导出配置（可选）
// ==========================================

// export const runtime = 'edge'; // 使用 Edge Runtime
// export const dynamic = 'force-dynamic'; // 强制动态渲染
// export const fetchCache = 'force-no-store'; // 禁用缓存
