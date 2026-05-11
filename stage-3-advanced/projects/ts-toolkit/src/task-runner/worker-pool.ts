/**
 * @file worker-pool.ts
 * @description Worker 线程池概念实现
 * @module task-runner
 *
 * 注意: 此模块展示 Worker 池的**设计概念**。
 *   - 在浏览器中使用 Web Worker API
 *   - 在 Node.js 中可替换为 worker_threads
 *
 * 核心思想:
 *   - 预创建 N 个 Worker 线程
 *   - 任务通过 postMessage 分发到空闲 Worker
 *   - Worker 完成后放回池中复用
 *   - 支持任务队列: 当所有 Worker 忙碌时, 新任务排队等候
 */

// ============================================================
// 1. 类型定义
// ============================================================

/** Worker 任务 */
export interface WorkerTask<T = unknown, R = unknown> {
  id: string;
  data: T;
  resolve: (value: R) => void;
  reject: (error: Error) => void;
}

/** Worker 池选项 */
export interface WorkerPoolOptions {
  /** Worker 数量 (默认 4) */
  size?: number;
  /** 任务超时 (ms) */
  timeout?: number;
}

// ============================================================
// 2. WorkerPool 类
// ============================================================

/**
 * Worker 线程池 — 管理多个 Worker 进行并行计算
 *
 * @example
 * ```ts
 * // worker.js:
 * // self.onmessage = (e) => {
 * //   const result = e.data.data * 2;
 * //   self.postMessage({ id: e.data.id, result });
 * // };
 *
 * const pool = new WorkerPool('/worker.js', { size: 4 });
 * const result = await pool.exec(21); // 42
 * pool.terminate();
 * ```
 */
export class WorkerPool<T = unknown, R = unknown> {
  private workers: Worker[] = [];
  private available: Worker[] = [];
  private taskQueue: WorkerTask<T, R>[] = [];
  private activeTasks = new Map<string, WorkerTask<T, R>>();
  private readonly timeout?: number;
  private taskIdCounter = 0;

  constructor(
    private readonly workerScript: string | URL,
    options: WorkerPoolOptions = {},
  ) {
    if (typeof Worker === 'undefined') {
      console.warn('[WorkerPool] ⚠️ Worker API 不可用 (非浏览器环境)');
      return;
    }

    const size = options.size ?? 4;
    this.timeout = options.timeout;
    console.log(`[WorkerPool] 创建 ${size} 个 Worker`);

    for (let i = 0; i < size; i++) {
      const w = new Worker(workerScript);
      w.onmessage = (e) => this.handleMessage(w, e);
      w.onerror = (e) => this.handleError(w, e);
      this.workers.push(w);
      this.available.push(w);
    }
  }

  /** 执行单个任务 */
  exec(data: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const task: WorkerTask<T, R> = {
        id: `task-${++this.taskIdCounter}`,
        data, resolve, reject,
      };
      this.taskQueue.push(task);
      this.dispatch();
    });
  }

  /** 批量执行 */
  execAll(dataArr: T[]): Promise<R[]> {
    return Promise.all(dataArr.map((d) => this.exec(d)));
  }

  /** 终止所有 Worker */
  terminate(): void {
    console.log('[WorkerPool] 终止所有 Worker');
    for (const w of this.workers) w.terminate();
    this.workers = [];
    this.available = [];
    this.taskQueue = [];
    this.activeTasks.clear();
  }

  get poolSize(): number { return this.workers.length; }
  get availableCount(): number { return this.available.length; }
  get pendingCount(): number { return this.taskQueue.length; }

  // --- 内部 ---

  private dispatch(): void {
    while (this.taskQueue.length > 0 && this.available.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.available.shift()!;

      this.activeTasks.set(task.id, task);

      if (this.timeout !== undefined) {
        setTimeout(() => {
          if (this.activeTasks.has(task.id)) {
            this.activeTasks.delete(task.id);
            this.available.push(worker);
            task.reject(new Error(`Worker task timeout (${this.timeout}ms)`));
            this.dispatch();
          }
        }, this.timeout);
      }

      worker.postMessage({ id: task.id, data: task.data });
    }
  }

  private handleMessage(worker: Worker, event: MessageEvent): void {
    const { id, result, error } = event.data as {
      id: string; result?: R; error?: string;
    };
    const task = this.activeTasks.get(id);
    if (!task) return;

    this.activeTasks.delete(id);
    this.available.push(worker);

    if (error) task.reject(new Error(error));
    else task.resolve(result as R);

    this.dispatch();
  }

  private handleError(worker: Worker, event: ErrorEvent): void {
    console.error('[WorkerPool] Worker 错误:', event.message);
    for (const [id, task] of this.activeTasks) {
      this.activeTasks.delete(id);
      task.reject(new Error(`Worker error: ${event.message}`));
    }
    if (!this.available.includes(worker)) this.available.push(worker);
    this.dispatch();
  }
}

// ============================================================
// 3. 工具函数
// ============================================================

/**
 * 从函数创建内联 Worker URL
 *
 * @example
 * ```ts
 * const url = createInlineWorker((n: number) => n * 2);
 * const pool = new WorkerPool(url, { size: 2 });
 * ```
 */
export function createInlineWorker<T, R>(fn: (data: T) => R | Promise<R>): string {
  const script = `
    self.onmessage = async (e) => {
      const { id, data } = e.data;
      try {
        const fn = ${fn.toString()};
        const result = await fn(data);
        self.postMessage({ id, result });
      } catch (error) {
        self.postMessage({ id, error: error.message });
      }
    };
  `;
  const blob = new Blob([script], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}

/**
 * 简单并行计算: 自动创建 Worker 池, 处理数据, 然后销毁
 *
 * @example
 * ```ts
 * const sums = await parallel([1,2,3,4], (n) => {
 *   let s = 0;
 *   for (let i = 0; i < n * 1e6; i++) s += Math.sqrt(i);
 *   return s;
 * }, 4);
 * ```
 */
export async function parallel<T, R>(
  data: T[],
  fn: (item: T) => R | Promise<R>,
  poolSize?: number,
): Promise<R[]> {
  const url = createInlineWorker(fn);
  const pool = new WorkerPool<T, R>(url, { size: poolSize });
  try {
    return await pool.execAll(data);
  } finally {
    pool.terminate();
    if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(url);
    }
  }
}
