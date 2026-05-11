// app/api/export/excel/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    console.log('[导出] 开始生成 Excel');

    const users = await prisma.user.findMany();

    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('用户列表');

    // 设置列
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '姓名', key: 'name', width: 20 },
      { header: '邮箱', key: 'email', width: 30 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    // 添加数据
    users.forEach(user => {
      worksheet.addRow(user);
    });

    // 生成 buffer
    const buffer = await workbook.xlsx.writeBuffer();

    console.log(`[导出] 生成 Excel 完成,共 ${users.length} 条记录`);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="users-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('[导出] 失败:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
