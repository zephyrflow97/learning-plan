// app/api/users/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[API] 获取所有用户');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // 不返回敏感字段(如密码)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[API] 查询到 ${users.length} 个用户`);

    return NextResponse.json(users);
  } catch (error) {
    console.error('[API] 查询失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
