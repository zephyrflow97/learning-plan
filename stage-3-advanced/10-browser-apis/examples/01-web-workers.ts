/**
 * @file 01-web-workers.ts
 * @description 演示 Web Workers 多线程编程：专用 Worker、消息传递、Transferable Objects、错误处理
 * @prerequisites Stage 2 Ch04 异步进阶, Stage 1 Ch05 DOM 基础
 * @related examples/03-file-and-stream-api.ts (Worker 中处理文件)
 */

console.log('[INFO] === Web Workers 多线程编程演示 ===\n');

// ============================================================================
// 1. 专用 Worker (Dedicated Worker) 基础
// ============================================================================
console.log('[1] 专用 Worker — 基本消息传递');

/**
 * @description 模拟 Worker 线程的消息处理逻辑
 * 在真实场景中，Worker 代码在独立文件中运行
 */
function simulateWorkerLogic(data: { type: string; payload: unknown }): unknown {
  switch (data.type) {
    case 'FIBONACCI': {
      const n = data.payload as number;
      function fib(n: number): number {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
      }
      const start = performance.now();
      const result = fib(n);
      const elapsed = performance.now() - start;
      console.log(`  [WORKER] fibonacci(${n}) = ${result}，耗时 ${elapsed.toFixed(2)}ms`);
      return { result, elapsed };
    }
    case 'SORT': {
      const arr = data.payload as number[];
      const start = performance.now();
      const sorted = [...arr].sort((a, b) => a - b);
      const elapsed = performance.now() - start;
      console.log(`  [WORKER] 排序 ${arr.length} 个元素，耗时 ${elapsed.toFixed(2)}ms`);
      return { sorted: sorted.slice(0, 5), totalLength: sorted.length, elapsed };
    }
    default:
      return { error: `未知任务类型: ${data.type}` };
  }
}

// 模拟主线程 <-> Worker 线程的消息交互
const fibResult = simulateWorkerLogic({ type: 'FIBONACCI', payload: 30 });
console.log('  [MAIN] 收到结果:', fibResult);

const largeArray = Array.from({ length: 100_000 }, () => Math.random() * 100_000);
const sortResult = simulateWorkerLogic({ type: 'SORT', payload: largeArray });
console.log('  [MAIN] 排序结果前5:', sortResult);
console.log('');

// ============================================================================
// 2. Worker 通信模式
// ============================================================================
console.log('[2] Worker 通信模式 — 请求/响应 + 消息 ID');

/**
 * @description 封装 Worker 通信为 Promise 风格（带消息 ID 追踪）
 * 每个请求分配唯一 ID，响应时通过 ID 匹配，避免回调混乱
 */
class WorkerRPC {
  private nextId = 0;
  private pending = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (reason: Error) => void;
  }>();

  /**
   * 发送请求并返回 Promise
   */
  call(method: string, params: unknown): Promise<unknown> {
    const id = this.nextId++;
    console.log(`  [RPC] 发送请求 #${id}: ${method}`);

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      // 模拟异步处理（真实场景中 worker.postMessage）
      setTimeout(() => {
        this.handleResponse(id, method, params);
      }, 10);
    });
  }

  private handleResponse(id: number, method: string, params: unknown): void {
    const pending = this.pending.get(id);
    if (!pending) return;

    try {
      const result = simulateWorkerLogic({ type: method, payload: params });
      console.log(`  [RPC] 请求 #${id} 完成`);
      pending.resolve(result);
    } catch (error) {
      pending.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.pending.delete(id);
    }
  }
}

async function demoWorkerRPC() {
  const rpc = new WorkerRPC();

  // 并行发送多个请求
  const [result1, result2] = await Promise.all([
    rpc.call('FIBONACCI', 25),
    rpc.call('FIBONACCI', 20),
  ]);

  console.log('  [MAIN] 并行结果:', result1, result2);
}

demoWorkerRPC().then(() => console.log(''));

// ============================================================================
// 3. Transferable Objects — 零拷贝传输
// ============================================================================
console.log('\n[3] Transferable Objects — 零拷贝传输');

/**
 * @description 演示 ArrayBuffer 的所有权转移概念
 * Transferable 传输后原引用变为空（byteLength === 0）
 */
function demoTransferable() {
  // 创建一个 10MB 的 ArrayBuffer
  const bufferSize = 10 * 1024 * 1024; // 10 MB
  const buffer = new ArrayBuffer(bufferSize);
  const view = new Uint8Array(buffer);

  // 填充数据
  for (let i = 0; i < 100; i++) {
    view[i] = i;
  }

  console.log(`  [创建] ArrayBuffer 大小: ${buffer.byteLength} bytes (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`  [数据] 前 10 字节: [${Array.from(view.slice(0, 10)).join(', ')}]`);

  // 模拟 Transfer（真实场景：worker.postMessage(buffer, [buffer])）
  // 转移后原 buffer 被 "neutered"（清空）
  const transferredBuffer = buffer.slice(0); // 模拟转移：复制到新位置
  // 真实的 transfer 会使 buffer.byteLength === 0

  console.log(`  [转移后] 新 buffer 大小: ${transferredBuffer.byteLength} bytes`);
  console.log(`  [注意] 真实 transfer 后原 buffer.byteLength 会变为 0`);
  console.log(`  [对比] 复制 vs 转移:`);
  console.log(`    复制: 分配新内存 → 逐字节复制 → 两份数据共存 → O(n) 时间和空间`);
  console.log(`    转移: 移交指针 → 原引用失效 → 只有一份数据 → O(1) 时间和空间`);
}

demoTransferable();
console.log('');

// ============================================================================
// 4. Worker 错误处理
// ============================================================================
console.log('[4] Worker 错误处理');

/**
 * @description Worker 中的错误会通过 error 事件冒泡到主线程
 */
function demoWorkerErrorHandling() {
  // 模拟 Worker 抛出错误
  function workerWithError(task: string): { success: boolean; data?: unknown; error?: string } {
    try {
      if (task === 'CRASH') {
        throw new Error('Worker 任务崩溃！');
      }
      return { success: true, data: `任务 ${task} 完成` };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  [WORKER ERROR] ${message}`);
      // Worker 中捕获错误并发送错误消息回主线程
      return { success: false, error: message };
    }
  }

  // 正常任务
  const ok = workerWithError('FIBONACCI');
  console.log(`  [MAIN] 正常任务:`, ok);

  // 崩溃任务
  const fail = workerWithError('CRASH');
  console.log(`  [MAIN] 崩溃任务:`, fail);

  // Worker 全局错误处理（真实代码中在 Worker 文件内）
  console.log('  [TIP] 真实 Worker 中应设置全局错误处理:');
  console.log('    self.onerror = (e) => { self.postMessage({ type: "ERROR", error: e.message }); }');
}

demoWorkerErrorHandling();
console.log('');

// ============================================================================
// 5. Worker 池模式
// ============================================================================
console.log('[5] Worker 池 — 复用线程避免创建开销');

/**
 * @description Worker 池管理器 —— 维护固定数量的 Worker，复用而非反复创建
 * 创建 Worker 有成本（~10ms 启动 + 内存分配），池化可以摊薄这个成本
 */
class WorkerPool {
  private poolSize: number;
  private taskQueue: Array<{ task: string; resolve: (v: string) => void }> = [];
  private activeWorkers = 0;

  constructor(poolSize: number) {
    this.poolSize = poolSize;
    console.log(`  [POOL] 创建 Worker 池，大小: ${poolSize}`);
  }

  async execute(task: string): Promise<string> {
    return new Promise((resolve) => {
      this.taskQueue.push({ task, resolve });
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.activeWorkers < this.poolSize && this.taskQueue.length > 0) {
      const { task, resolve } = this.taskQueue.shift()!;
      this.activeWorkers++;
      console.log(`  [POOL] 分配任务 "${task}" (活跃: ${this.activeWorkers}/${this.poolSize}, 队列: ${this.taskQueue.length})`);

      // 模拟异步 Worker 执行
      setTimeout(() => {
        const result = `任务 "${task}" 完成`;
        console.log(`  [POOL] ${result} (活跃: ${this.activeWorkers - 1}/${this.poolSize})`);
        this.activeWorkers--;
        resolve(result);
        this.processQueue(); // 处理队列中的下一个
      }, Math.random() * 100 + 50);
    }
  }
}

async function demoWorkerPool() {
  const pool = new WorkerPool(2); // 最多 2 个并发 Worker

  // 提交 5 个任务 — 只有 2 个并行执行，其余排队
  const tasks = ['数据分析', '图片压缩', 'CSV解析', '加密计算', '排序去重'];
  const results = await Promise.all(
    tasks.map(task => pool.execute(task))
  );

  console.log(`  [MAIN] 所有任务完成:`, results);
}

demoWorkerPool().then(() => {
  console.log('\n[INFO] === Web Workers 演示结束 ===');
});
