// app/api/export/csv/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[导出] 开始生成 CSV');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // 生成 CSV
    const headers = ['ID', '姓名', '邮箱', '创建时间'];
    const rows = users.map(user => [
      user.id,
      user.name || '',
      user.email,
      user.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    console.log(`[导出] 生成 CSV 完成,共 ${users.length} 条记录`);

    // 返回 CSV 文件
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('[导出] 失败:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
