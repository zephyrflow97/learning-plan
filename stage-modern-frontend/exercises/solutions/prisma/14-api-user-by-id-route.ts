// app/api/users/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    console.log(`[API] 获取用户 ID: ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
          },
        },
      },
    });

    if (!user) {
      console.warn(`[API] 用户不存在: ${userId}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[API] 查询成功:', user.name);
    return NextResponse.json(user);
  } catch (error) {
    console.error('[API] 查询失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
