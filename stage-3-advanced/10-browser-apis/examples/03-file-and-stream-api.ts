/**
 * @file 03-file-and-stream-api.ts
 * @description 演示 File API、Blob 操作、Stream 流式处理、文件切片上传
 * @prerequisites Stage 2 Ch04 异步进阶, Stage 1 Ch03 对象和数组
 * @related examples/04-advanced-fetch.ts (Fetch 与 Stream 结合)
 */

console.log('[INFO] === File API 与 Stream 演示 ===\n');

// ============================================================================
// 1. Blob 基础 — 二进制大对象
// ============================================================================
console.log('[1] Blob — 二进制大对象基础');

/**
 * @description Blob (Binary Large Object) 是浏览器中表示二进制数据的核心类型
 * File 继承自 Blob，额外拥有 name 和 lastModified 属性
 */
function demoBlobBasics() {
  // 创建不同类型的 Blob
  const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' });
  console.log(`  [TEXT] Blob: size=${textBlob.size} bytes, type="${textBlob.type}"`);

  const jsonData = JSON.stringify({ name: 'Alice', scores: [95, 87, 92] }, null, 2);
  const jsonBlob = new Blob([jsonData], { type: 'application/json' });
  console.log(`  [JSON] Blob: size=${jsonBlob.size} bytes, type="${jsonBlob.type}"`);

  // 多片段组合成一个 Blob
  const header = new Blob(['=== Report Header ===\n']);
  const body = new Blob(['Total: 100 items\nPassed: 95\nFailed: 5\n']);
  const footer = new Blob(['=== End ===\n']);
  const report = new Blob([header, body, footer], { type: 'text/plain' });
  console.log(`  [COMBINED] Blob: size=${report.size} bytes (3 片段组合)`);

  // ArrayBuffer → Blob
  const buffer = new ArrayBuffer(16);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < 16; i++) view[i] = i * 16;
  const binaryBlob = new Blob([buffer], { type: 'application/octet-stream' });
  console.log(`  [BINARY] Blob: size=${binaryBlob.size} bytes (ArrayBuffer → Blob)`);

  // Blob 家族关系
  console.log('\n  Blob 家族层次:');
  console.log('    Blob (base)');
  console.log('    └── File (extends Blob, +name, +lastModified)');
  console.log('          └── <input type="file"> 返回 File 对象');
}

demoBlobBasics();
console.log('');

// ============================================================================
// 2. Blob URL vs Data URL
// ============================================================================
console.log('[2] Blob URL vs Data URL — 两种引用方式对比');

/**
 * @description Blob URL 是对内存中 Blob 的临时引用（高效）
 * Data URL 是 Base64 编码的内联数据（膨胀 33%）
 */
function demoBlobUrls() {
  const imageData = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, // PNG header magic bytes
    0x0D, 0x0A, 0x1A, 0x0A, // 续
  ]);
  const pngBlob = new Blob([imageData], { type: 'image/png' });

  // Blob URL — 零拷贝引用
  // const blobUrl = URL.createObjectURL(pngBlob);
  // 格式: blob:http://localhost:3000/550e8400-e29b-41d4-a716-446655440000
  console.log('  [Blob URL]');
  console.log('    格式: blob:http://origin/<uuid>');
  console.log(`    大小: 短字符串（~50字符），引用 ${pngBlob.size} bytes 的内存数据`);
  console.log('    性能: O(1) 创建 — 只生成一个 UUID 引用');
  console.log('    生命周期: 手动 URL.revokeObjectURL() 或页面关闭');
  console.log('    ⚠️ 必须手动释放，否则内存泄漏！');

  // Data URL — Base64 编码
  console.log('\n  [Data URL]');
  console.log('    格式: data:image/png;base64,iVBORw0KGgo...');
  console.log(`    大小: ${Math.ceil(pngBlob.size * 4 / 3)} bytes (原始的 133%)`);
  console.log('    性能: O(n) 创建 — 需要 Base64 编码全部数据');
  console.log('    生命周期: 无需释放（是字符串，自动 GC）');
  console.log('    适用: 小图标（< 10KB）、CSS 内联图片');

  // 对比表
  console.log('\n  推荐策略:');
  console.log('    < 10KB  → Data URL（减少 HTTP 请求）');
  console.log('    > 10KB  → Blob URL（避免 Base64 膨胀）');
  console.log('    跨域场景 → Data URL（Blob URL 不可跨域）');
}

demoBlobUrls();
console.log('');

// ============================================================================
// 3. FileReader — 读取文件内容
// ============================================================================
console.log('[3] FileReader — 四种读取模式');

/**
 * @description FileReader 提供四种读取方式，适用于不同场景
 */
function demoFileReader() {
  console.log('  FileReader 四种读取模式:');
  console.log('');

  const modes = [
    {
      method: 'readAsText(file, encoding?)',
      result: 'string',
      useCase: 'CSV、JSON、日志文件等文本',
      example: '"Hello, World!"'
    },
    {
      method: 'readAsDataURL(file)',
      result: 'data:mime;base64,...',
      useCase: '图片预览（直接赋值给 img.src）',
      example: '"data:image/png;base64,iVBOR..."'
    },
    {
      method: 'readAsArrayBuffer(file)',
      result: 'ArrayBuffer',
      useCase: '二进制处理（音频、PDF、加密）',
      example: 'ArrayBuffer { byteLength: 1024 }'
    },
    {
      method: 'readAsBinaryString(file)',
      result: 'binary string',
      useCase: '⚠️ 已废弃，用 ArrayBuffer 替代',
      example: '(deprecated)'
    }
  ];

  modes.forEach((mode, i) => {
    console.log(`  [${i + 1}] ${mode.method}`);
    console.log(`      返回: ${mode.result}`);
    console.log(`      场景: ${mode.useCase}`);
    console.log(`      示例: ${mode.example}`);
    console.log('');
  });

  // FileReader 事件
  console.log('  FileReader 事件序列:');
  console.log('    loadstart → progress(多次) → load / error → loadend');
  console.log('    progress 事件中可以读取 event.loaded / event.total 计算进度');
}

demoFileReader();
console.log('');

// ============================================================================
// 4. 文件切片上传
// ============================================================================
console.log('[4] 文件切片上传 — 大文件分块策略');

/**
 * @description 大文件上传的核心：切片 → 并发/顺序上传 → 合并
 * Blob.slice() 是零拷贝操作，不会复制实际数据
 */
function sliceFile(fileSize: number, chunkSize: number): Array<{ index: number; start: number; end: number; size: number }> {
  const chunks: Array<{ index: number; start: number; end: number; size: number }> = [];
  for (let start = 0; start < fileSize; start += chunkSize) {
    const end = Math.min(start + chunkSize, fileSize);
    chunks.push({
      index: chunks.length,
      start,
      end,
      size: end - start
    });
  }
  return chunks;
}

function demoChunkUpload() {
  const fileSize = 10.5 * 1024 * 1024; // 10.5 MB
  const chunkSize = 2 * 1024 * 1024;   // 2 MB per chunk
  const chunks = sliceFile(fileSize, chunkSize);

  console.log(`  文件大小: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  切片大小: ${chunkSize / 1024 / 1024} MB`);
  console.log(`  切片数量: ${chunks.length}`);
  console.log('');

  chunks.forEach(chunk => {
    const sizeMB = (chunk.size / 1024 / 1024).toFixed(2);
    console.log(`  [CHUNK ${chunk.index}] ${(chunk.start / 1024 / 1024).toFixed(1)}MB ~ ${(chunk.end / 1024 / 1024).toFixed(1)}MB (${sizeMB} MB)`);
  });

  console.log('\n  上传流程:');
  console.log('    1. file.slice(start, end) → Blob chunk');
  console.log('    2. new FormData() + append(chunk, filename)');
  console.log('    3. fetch(uploadUrl, { method: "POST", body: formData })');
  console.log('    4. 所有 chunk 完成后 → POST /merge (合并请求)');
  console.log('    5. 断点续传: 服务端记录已上传 chunk → 客户端跳过已上传');
}

demoChunkUpload();
console.log('');

// ============================================================================
// 5. 带重试的切片上传器
// ============================================================================
console.log('[5] 带重试的切片上传器');

/**
 * @description 生产级切片上传器，支持并发控制、自动重试、进度回调
 */
interface UploadChunkResult {
  index: number;
  success: boolean;
  attempts: number;
}

async function uploadWithRetry(
  chunkIndex: number,
  maxRetries: number = 3,
  failRate: number = 0.3  // 模拟 30% 失败率
): Promise<UploadChunkResult> {
  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;
    const success = Math.random() > failRate;

    if (success) {
      console.log(`  [UPLOAD] Chunk ${chunkIndex}: ✅ 成功 (第 ${attempts} 次尝试)`);
      return { index: chunkIndex, success: true, attempts };
    }

    console.log(`  [UPLOAD] Chunk ${chunkIndex}: ❌ 失败 (第 ${attempts}/${maxRetries} 次尝试)`);
    // 指数退避
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
  }

  console.log(`  [UPLOAD] Chunk ${chunkIndex}: 💀 放弃 (已重试 ${maxRetries} 次)`);
  return { index: chunkIndex, success: false, attempts };
}

async function demoUploader() {
  const totalChunks = 5;
  const concurrency = 2; // 最多同时上传 2 个

  console.log(`  总切片: ${totalChunks}, 并发度: ${concurrency}`);
  console.log('');

  // 简单的并发控制
  const results: UploadChunkResult[] = [];
  const queue = Array.from({ length: totalChunks }, (_, i) => i);

  async function processQueue() {
    while (queue.length > 0) {
      const chunkIndex = queue.shift()!;
      const result = await uploadWithRetry(chunkIndex);
      results.push(result);
    }
  }

  // 启动 concurrency 个"工人"
  const workers = Array.from({ length: concurrency }, () => processQueue());
  await Promise.all(workers);

  // 汇总结果
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0);

  console.log(`\n  === 上传汇总 ===`);
  console.log(`  成功: ${succeeded}/${totalChunks}`);
  console.log(`  失败: ${failed}/${totalChunks}`);
  console.log(`  总尝试次数: ${totalAttempts}`);

  if (failed === 0) {
    console.log('  ✅ 所有切片上传成功，可以发送合并请求');
  } else {
    console.log('  ❌ 部分切片上传失败，需要重新上传');
  }
}

demoUploader().then(() => {
  console.log('');

  // ============================================================================
  // 6. Stream API — 流式数据处理
  // ============================================================================
  console.log('[6] Stream API — 流式处理概念');

  /**
   * @description Streams API 让你逐块处理数据，而不是等全部加载到内存
   * 三种 Stream：ReadableStream、WritableStream、TransformStream
   */
  function demoStreams() {
    console.log('  三种 Stream:');
    console.log('    ReadableStream  — 数据来源（fetch response.body）');
    console.log('    WritableStream  — 数据去向（写入文件/网络）');
    console.log('    TransformStream — 中间处理（压缩、加密、解码）');

    console.log('\n  管道模式: 数据流水线');
    console.log('    ReadableStream → TransformStream → WritableStream');
    console.log('    (fetch body)   → (TextDecoder)  → (console.log)');

    // 模拟流式读取
    console.log('\n  模拟 ReadableStream 逐块读取:');

    const totalSize = 1000;
    const chunkSize = 200;
    let bytesRead = 0;

    while (bytesRead < totalSize) {
      const chunk = Math.min(chunkSize, totalSize - bytesRead);
      bytesRead += chunk;
      const progress = ((bytesRead / totalSize) * 100).toFixed(0);
      console.log(`    [STREAM] 读取 ${chunk} bytes → 累计 ${bytesRead}/${totalSize} (${progress}%)`);
    }

    console.log('    [STREAM] 读取完成 (done: true)');

    // 使用场景
    console.log('\n  Stream 适用场景:');
    console.log('    • 大文件下载 → 边下载边写入 (避免占满内存)');
    console.log('    • LLM/ChatGPT 流式输出 → 逐 token 渲染');
    console.log('    • 日志处理 → 逐行解析 GB 级日志文件');
    console.log('    • 视频处理 → 逐帧转码');
  }

  demoStreams();

  console.log('\n[INFO] === File API 与 Stream 演示结束 ===');
});
