/**
 * @file task-queue.ts
 * @description 任务队列 — 可控并发数的异步任务执行器
 * @module task-runner
 *
 * 核心功能:
 *   - TaskQueue: 类 API, 支持 add/addAll/pause/start/onIdle
 *   - pLimit:    函数 API, 一行完成并发限制
 *   - retry:     带指数退避的重试
 *   - batch:     将大数组分批处理
 *   - throttle / debounce: 频率控制
 */

// ============================================================
// 1. 类型定义
// ============================================================

/** 任务函数: 返回 Promise 的无参函数 */
export type Task<T = unknown> = () => Promise<T>;

/** 单个任务的结果 */
export type TaskResult<T = unknown> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: Error };

/** 队列选项 */
export interface TaskQueueOptions {
  /** 并发数 (默认 1) */
  concurrency?: number;
  /** 是否自动启动 (默认 true) */
  autoStart?: boolean;
  /** 单个任务超时 (ms) */
  timeout?: number;
}

// ============================================================
// 2. TaskQueue 类
// ============================================================

/**
 * 并发任务队列 — 控制同时运行的 Promise 数量
 *
 * @example
 * ```ts
 * const q = new TaskQueue({ concurrency: 3 });
 * q.add(async () => fetch('/api/1'));
 * q.add(async () => fetch('/api/2'));
 * await q.onIdle();
 * ```
 */
export class TaskQueue<T = unknown> {
  private queue: Array<{
    task: Task<T>;
    resolve: (v: T) => void;
    reject: (e: Error) => void;
  }> = [];
  private running = 0;
  private results: TaskResult<T>[] = [];
  private readonly concurrency: number;
  private readonly timeout?: number;
  private paused: boolean;
  private idleResolvers: Array<() => void> = [];

  constructor(options: TaskQueueOptions = {}) {
    const { concurrency = 1, autoStart = true, timeout } = options;
    this.concurrency = Math.max(1, concurrency);
    this.timeout = timeout;
    this.paused = !autoStart;
    console.log(`[TaskQueue] 创建队列 (并发=${this.concurrency}, 超时=${timeout ?? '无'}ms)`);
  }

  /** 添加单个任务 */
  add(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      if (!this.paused) this.process();
    });
  }

  /** 批量添加任务 */
  addAll(tasks: Task<T>[]): Promise<T[]> {
    return Promise.all(tasks.map((t) => this.add(t)));
  }

  /** 启动 (从暂停恢复) */
  start(): void {
    if (this.paused) { this.paused = false; this.process(); }
  }

  /** 暂停 */
  pause(): void { this.paused = true; }

  /** 清空等待队列 */
  clear(): void { this.queue = []; }

  /** 等待所有任务完成 */
  onIdle(): Promise<void> {
    if (this.running === 0 && this.queue.length === 0) return Promise.resolve();
    return new Promise((r) => { this.idleResolvers.push(r); });
  }

  get size(): number { return this.queue.length; }
  get pending(): number { return this.running; }
  get isIdle(): boolean { return this.running === 0 && this.queue.length === 0; }
  getResults(): TaskResult<T>[] { return [...this.results]; }

  // --- 内部 ---

  private async process(): Promise<void> {
    if (this.paused || this.running >= this.concurrency) return;

    const item = this.queue.shift();
    if (!item) {
      if (this.running === 0) this.notifyIdle();
      return;
    }

    this.running++;
    console.log(`[TaskQueue] 执行任务 (running=${this.running}, queued=${this.queue.length})`);

    try {
      const value = await this.exec(item.task);
      this.results.push({ status: 'fulfilled', value });
      item.resolve(value);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.results.push({ status: 'rejected', reason: error });
      item.reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }

  private async exec(task: Task<T>): Promise<T> {
    if (this.timeout === undefined) return task();
    return Promise.race([
      task(),
      new Promise<T>((_, rej) =>
        setTimeout(() => rej(new Error(`Task timeout (${this.timeout}ms)`)), this.timeout),
      ),
    ]);
  }

  private notifyIdle(): void {
    for (const r of this.idleResolvers) r();
    this.idleResolvers = [];
  }
}

// ============================================================
// 3. pLimit — 函数式并发限制
// ============================================================

/**
 * 并发限制: 最多同时执行 concurrency 个任务
 *
 * @example
 * ```ts
 * const tasks = urls.map(url => () => fetch(url));
 * const results = await pLimit(tasks, 5);
 * ```
 */
export async function pLimit<T>(tasks: Task<T>[], concurrency: number): Promise<T[]> {
  const q = new TaskQueue<T>({ concurrency });
  return q.addAll(tasks);
}

// ============================================================
// 4. retry — 带指数退避的重试
// ============================================================

/**
 * 带重试的任务执行
 *
 * @example
 * ```ts
 * const data = await retry(
 *   async () => { const r = await fetch(url); return r.json(); },
 *   { retries: 3, delay: 1000 },
 * );
 * ```
 */
export async function retry<T>(
  task: Task<T>,
  options: {
    retries?: number;
    delay?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {},
): Promise<T> {
  const { retries = 3, delay = 1000, onRetry } = options;
  let lastErr: Error = new Error('Task failed');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await task();
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) {
        onRetry?.(lastErr, attempt + 1);
        console.log(`[retry] 第 ${attempt + 1} 次重试, 延迟 ${delay * 2 ** attempt}ms`);
        await sleep(delay * 2 ** attempt);
      }
    }
  }
  throw lastErr;
}

// ============================================================
// 5. batch — 分批处理
// ============================================================

/**
 * 将大数组分批处理
 *
 * @example
 * ```ts
 * const results = await batch([1,2,3,4,5], 2, async (b) => b.map(x => x*2));
 * // results: [2,4,6,8,10]
 * ```
 */
export async function batch<T, R>(
  items: T[],
  batchSize: number,
  processor: (chunk: T[]) => Promise<R[]>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    console.log(`[batch] 处理第 ${Math.floor(i / batchSize) + 1} 批 (${chunk.length} 项)`);
    results.push(...await processor(chunk));
  }
  return results;
}

// ============================================================
// 6. throttle / debounce
// ============================================================

/** 节流: 在 wait 时间内最多执行一次 */
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  let lastTime = 0;
  return (...args: Args) => {
    const now = Date.now();
    if (now - lastTime >= wait) { lastTime = now; fn(...args); }
  };
}

/** 防抖: 只执行最后一次调用 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// --- 内部工具 ---
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
