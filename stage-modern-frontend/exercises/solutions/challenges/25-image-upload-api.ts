// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    console.log('[API] 收到文件:', file.name, file.size);

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 保存到本地(实际项目应上传到 S3)
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    console.log('[API] 文件保存成功:', url);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[API] 上传失败:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
