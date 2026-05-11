/**
 * @file emitter.ts
 * @description 类型安全的事件发射器 — 泛型约束事件名和参数类型
 * @module event-emitter
 *
 * 与 Node.js EventEmitter 的区别:
 *   - 事件名和数据类型在编译时检查
 *   - 拼写错误的事件名会被编译器拦截
 *   - 事件数据的形状 (shape) 由泛型约束
 *
 * 设计参考:
 *   - Node.js events 模块
 *   - mitt (零依赖 300B 事件库)
 */

// ============================================================
// 1. 类型定义
// ============================================================

/** 事件监听器函数 */
export type EventListener<T = unknown> = (data: T) => void | Promise<void>;

/** 事件映射: { 事件名: 数据类型 } */
export type EventMap = Record<string, unknown>;

// ============================================================
// 2. EventEmitter 类
// ============================================================

/**
 * 类型安全的事件发射器
 *
 * @example
 * ```ts
 * type Events = {
 *   'user:login':  { userId: string; timestamp: number };
 *   'user:logout': { userId: string };
 * };
 *
 * const bus = new EventEmitter<Events>();
 * bus.on('user:login', (data) => {
 *   console.log(data.userId);    // ✅ 类型推断为 string
 * });
 * bus.emit('user:loginn', ...);  // ❌ 编译错误: 事件名拼写错误
 * ```
 */
export class EventEmitter<Events extends EventMap = EventMap> {
  private listeners = new Map<keyof Events, Set<EventListener<Events[keyof Events]>>>();
  private onceListeners = new Map<keyof Events, Set<EventListener<Events[keyof Events]>>>();
  private maxListeners = 10;
  private warningEmitted = new Set<keyof Events>();

  /** 注册事件监听器 */
  on<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    console.log(`[EventEmitter] on("${String(event)}")`);
    this.addListener(event, listener, this.listeners);
    return this;
  }

  /** 注册一次性监听器 (触发后自动移除) */
  once<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    console.log(`[EventEmitter] once("${String(event)}")`);
    this.addListener(event, listener, this.onceListeners);
    return this;
  }

  /** 移除监听器 */
  off<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    this.removeListener(event, listener, this.listeners);
    this.removeListener(event, listener, this.onceListeners);
    return this;
  }

  /**
   * 触发事件
   * @returns true 如果至少有一个监听器被调用
   */
  emit<K extends keyof Events>(event: K, data: Events[K]): boolean {
    console.log(`[EventEmitter] emit("${String(event)}")`, data);
    let called = false;

    const regular = this.listeners.get(event);
    if (regular && regular.size > 0) {
      called = true;
      for (const fn of regular) this.invoke(fn, data);
    }

    const once = this.onceListeners.get(event);
    if (once && once.size > 0) {
      called = true;
      for (const fn of once) this.invoke(fn, data);
      once.clear();
    }

    return called;
  }

  /** 移除指定事件的所有监听器; 不传参则移除全部 */
  removeAllListeners<K extends keyof Events>(event?: K): this {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
    return this;
  }

  /** 获取监听器数量 */
  listenerCount<K extends keyof Events>(event: K): number {
    return (this.listeners.get(event)?.size ?? 0) +
           (this.onceListeners.get(event)?.size ?? 0);
  }

  /** 获取所有已注册的事件名 */
  eventNames(): Array<keyof Events> {
    const names = new Set<keyof Events>();
    for (const k of this.listeners.keys()) names.add(k);
    for (const k of this.onceListeners.keys()) names.add(k);
    return Array.from(names);
  }

  /** 设置最大监听器数量警告阈值 */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    this.warningEmitted.clear();
    return this;
  }

  getMaxListeners(): number { return this.maxListeners; }

  // --- 内部方法 ---

  private addListener<K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>,
    map: Map<keyof Events, Set<EventListener<Events[keyof Events]>>>,
  ): void {
    if (!map.has(event)) map.set(event, new Set());
    const set = map.get(event)!;
    set.add(listener as EventListener<Events[keyof Events]>);

    if (set.size > this.maxListeners && !this.warningEmitted.has(event)) {
      this.warningEmitted.add(event);
      console.warn(
        `[EventEmitter] ⚠️ "${String(event)}" 有 ${set.size} 个监听器, ` +
        `可能存在内存泄漏。使用 setMaxListeners() 调整阈值。`,
      );
    }
  }

  private removeListener<K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>,
    map: Map<keyof Events, Set<EventListener<Events[keyof Events]>>>,
  ): void {
    const set = map.get(event);
    if (set) {
      set.delete(listener as EventListener<Events[keyof Events]>);
      if (set.size === 0) map.delete(event);
    }
  }

  private invoke<T>(listener: EventListener<T>, data: T): void {
    try {
      const result = listener(data);
      if (result instanceof Promise) {
        result.catch((e) => console.error('[EventEmitter] 异步监听器错误:', e));
      }
    } catch (e) {
      console.error('[EventEmitter] 监听器错误:', e);
    }
  }
}

// ============================================================
// 3. 工具函数
// ============================================================

/** 便捷创建函数 */
export function createEventEmitter<E extends EventMap = EventMap>(): EventEmitter<E> {
  return new EventEmitter<E>();
}

/** 将事件转为 Promise (等待一次触发) */
export function onceAsync<Events extends EventMap, K extends keyof Events>(
  emitter: EventEmitter<Events>,
  event: K,
  timeout?: number,
): Promise<Events[K]> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const listener = (data: Events[K]) => {
      if (timer) clearTimeout(timer);
      resolve(data);
    };

    emitter.once(event, listener);

    if (timeout !== undefined) {
      timer = setTimeout(() => {
        emitter.off(event, listener);
        reject(new Error(`Timeout waiting for event "${String(event)}"`));
      }, timeout);
    }
  });
}

/** 将事件转为异步迭代器 */
export function eventStream<Events extends EventMap, K extends keyof Events>(
  emitter: EventEmitter<Events>,
  event: K,
): AsyncIterableIterator<Events[K]> {
  const queue: Events[K][] = [];
  const resolvers: Array<(v: IteratorResult<Events[K]>) => void> = [];
  let stopped = false;

  const listener = (data: Events[K]) => {
    if (resolvers.length > 0) {
      resolvers.shift()!({ value: data, done: false });
    } else {
      queue.push(data);
    }
  };

  emitter.on(event, listener);

  return {
    [Symbol.asyncIterator]() { return this; },
    next(): Promise<IteratorResult<Events[K]>> {
      if (queue.length > 0) return Promise.resolve({ value: queue.shift()!, done: false });
      if (stopped) return Promise.resolve({ value: undefined as Events[K], done: true });
      return new Promise((r) => { resolvers.push(r); });
    },
    return(): Promise<IteratorResult<Events[K]>> {
      stopped = true;
      emitter.off(event, listener);
      for (const r of resolvers) r({ value: undefined as Events[K], done: true });
      resolvers.length = 0;
      return Promise.resolve({ value: undefined as Events[K], done: true });
    },
  };
}
