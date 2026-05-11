# 第 5 章：性能优化

本章将深入学习 JavaScript 和 TypeScript 应用的性能优化技术，包括内存管理、异步优化、缓存策略等。

## 📚 本章目标

- ✅ 理解 JavaScript 内存管理和垃圾回收
- ✅ 掌握事件循环和异步优化
- ✅ 实现有效的缓存策略
- ✅ 优化数据库查询
- ✅ 使用性能分析工具

---

## 1. 内存管理

### 1.1 避免内存泄漏

> **🧹 The Metaphor: The Cleaning Lady**
> 垃圾回收器 (GC) 就像是一位**勤劳的清洁工**。
> 她会定期打扫房间（内存），把没人用的东西扔掉。
> *   **Reachability (可达性)**: 如果你手里拿着一个气球（引用），或者你朋友手里拿着，或者朋友的朋友拿着... 只要有一根线连着你（Root），清洁工就不会碰它。
> *   **Leak (泄漏)**: 如果你把气球拴在了一个**隐形的钩子**上（比如全局变量、未清理的定时器、闭包），然后你走了。清洁工看到气球还被拴着，就不敢扔。结果房间里的气球越来越多，最后爆炸了（OOM）。

> **🔧 Under the Hood: Garbage Collection (Mark-and-Sweep)**
>
> V8 引擎使用 **Mark-and-Sweep (标记-清除)** 算法进行垃圾回收。
> *   **Roots**: 全局对象 (window/global), 当前执行栈, DOM 引用。
> *   **Reachability**: 如果一个对象从 Roots 出发无法到达 (Unreachable)，它就会被回收。
>
> **常见的泄漏场景**:
> 1.  **Detached DOM Nodes**: JS 中保留了对 DOM 节点的引用，但该节点已从 DOM 树中移除。
> 2.  **Closures**: 意外捕获了不需要的大对象。
> 3.  **Timers/Events**: 忘记 `clearInterval` 或 `removeEventListener`。

```typescript
// ❌ 内存泄漏示例
class BadEventEmitter {
  private listeners: Function[] = [];
  
  on(handler: Function) {
    this.listeners.push(handler); // 永远不会被清理
  }
}

// ✅ 正确实现
class GoodEventEmitter {
  private listeners: Set<Function> = new Set();
  
  on(handler: Function): () => void {
    this.listeners.add(handler);
    // 返回清理函数
    return () => this.off(handler);
  }
  
  off(handler: Function): void {
    this.listeners.delete(handler);
  }
}
```

---

## 2. 异步优化

### 2.1 并发控制

> **⏱️ The Metaphor: The 16ms Deadline**
> 浏览器渲染就像是在**拍电影**，摄像机每秒转 60 次（60fps）。
> 这意味着你只有 **16.6 毫秒**的时间来准备每一帧画面。
> 如果你的 JavaScript 脚本运行了 20ms，摄像机就会拍到一张**静止**的画面（掉帧/卡顿）。
> 用户会立刻感觉到：“哎？怎么卡了一下？”
> 所以，长任务（Long Task）必须被切碎，像**切香肠**一样，塞进每一帧的空隙里。

> **🔧 Under the Hood: The RAIL Model**
>
> Google 提出的 **RAIL 模型** 是前端性能优化的黄金标准：
> *   **R (Response)**: 在 **50ms** 内响应用户输入。
> *   **A (Animation)**: 每一帧必须在 **16ms** (60fps) 内完成渲染。
> *   **I (Idle)**: 利用空闲时间 (Idle Time) 执行后台任务。
> *   **L (Load)**: 在 **5s** 内完成内容加载并可交互 (Time to Interactive)。
>
> **Frame Budget (帧预算)**:
> 为了达到 60fps，每一帧只有 16.6ms。扣除浏览器自身的开销，留给 JS 执行的时间只有 **10ms** 左右。
> 如果你的 JS 任务超过 10ms，就会导致丢帧 (Jank)。
>
> **Solution**: 使用 `requestIdleCallback` 或 `Scheduler API` 将长任务切片 (Time Slicing)。

```typescript
// 限制并发请求数量
async function fetchWithConcurrencyLimit<T>(
  items: string[],
  fetcher: (item: string) => Promise<T>,
  limit: number = 3
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (const item of items) {
    const promise = fetcher(item).then(result => {
      results.push(result);
    });
    
    executing.push(promise);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex(p => p === promise),
        1
      );
    }
  }
  
  await Promise.all(executing);
  return results;
}
```

---

## 3. 缓存策略

### 3.1 LRU 缓存实现

> **📚 The Metaphor: The Bookshelf**
> LRU (Least Recently Used) 缓存就像是一个**容量有限的书架**。
> *   当你拿一本书看时，你把它放回**最顺手**的位置（最近使用）。
> *   当书架满了，你想买新书时，你必须扔掉一本。
> *   扔哪本？当然是扔掉**积灰最厚**、放在最角落的那本（最久未使用）。

```typescript
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // 将访问的项移到最后（最近使用）
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  set(key: K, value: V): void {
    // 如果键已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // 添加新项
    this.cache.set(key, value);
    
    // 如果超过最大容量，删除最旧的项
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
```

---

## 4. 数据库优化

### 4.1 查询优化

```typescript
// ❌ N+1 查询问题
async function getBadUserPosts(userId: string) {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  const posts = [];
  
  for (const user of users) {
    const userPosts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
    posts.push(...userPosts);
  }
  
  return posts;
}

// ✅ 使用 JOIN 优化
async function getGoodUserPosts(userId: string) {
  return await db.query(`
    SELECT posts.* 
    FROM posts 
    JOIN users ON posts.user_id = users.id 
    WHERE users.id = ?
  `, [userId]);
}
```

---

## 5. 性能分析工具

### 5.1 自定义性能监控

```typescript
class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }
  
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }
  
  private recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }
  
  getStats(name: string) {
    const durations = this.metrics.get(name) || [];
    if (durations.length === 0) return null;
    
    const sorted = [...durations].sort((a, b) => a - b);
    return {
      count: durations.length,
      avg: durations.reduce((a, b) => a + b) / durations.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}
```

---

## 6. 最佳实践

### 6.1 Critical Rendering Path Optimization

> **🖼️ The Metaphor: The Window View (Virtualization)**
> 虚拟列表 (Virtual List) 就像是**透过窗户看风景**。
> 外面的世界很大（长列表有 10,000 项），但你的窗户（视口）只有这么大，一次只能看到 10 棵树。
> 你不需要把 10,000 棵树都画出来。你只需要画出窗户里的那 10 棵。
> 当你移动视线（滚动）时，你把旧的树擦掉，画上新的树。
> 这样，无论世界有多大，你的画笔（DOM 操作）永远只画 10 棵树的工作量。

> **🔧 渲染管线优化**
>
> 1.  **Minimize Reflows**: 避免在循环中读取布局属性 (`offsetWidth`, `scrollTop`)，这会强制浏览器同步计算布局 (Layout Thrashing)。
> 2.  **Layer Promotion**: 使用 `will-change: transform` 将元素提升到独立的 GPU 图层，避免重绘整个页面。
> 3.  **Virtualization**: 对于长列表，只渲染可视区域内的元素 (Virtual List)，将 DOM 节点数量保持在常数级。

### 6.2 测量优先
2. **关注瓶颈** - 优化最慢的部分
3. **避免过早优化** - 先保证正确性
4. **使用工具** - Chrome DevTools, Node.js Profiler
5. **持续监控** - 生产环境性能监控

---

## 下一步

**下一章：** [测试](../06-testing/)

继续学习如何编写高质量的测试代码！💪
