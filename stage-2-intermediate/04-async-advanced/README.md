# 异步编程进阶

## 学习目标

完成本章节后，你将能够：

1. 深入理解 Promise 链式调用和错误处理
2. 掌握 async/await 的高级用法和最佳实践
3. 理解异步编程中的常见陷阱和解决方案
4. 能够实现并发控制和队列管理
5. 掌握异步错误处理策略
6. 理解事件循环和微任务/宏任务

## 前置知识

- JavaScript 基础
- Promise 基础
- async/await 入门

## 1. Promise 深入

### 1.1 Promise 链式调用

```typescript
console.log('[INFO] Promise 链式调用示例');

// 基本链式调用
function fetchUser(id: number): Promise<{ id: number; name: string }> {
  console.log(`[TRACE] 获取用户 ID: ${id}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: `User ${id}` });
    }, 100);
  });
}

function fetchUserPosts(userId: number): Promise<{ userId: number; posts: string[] }> {
  console.log(`[TRACE] 获取用户 ${userId} 的文章`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ userId, posts: ['Post 1', 'Post 2', 'Post 3'] });
    }, 100);
  });
}

function fetchPostComments(postTitle: string): Promise<string[]> {
  console.log(`[TRACE] 获取文章"${postTitle}"的评论`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['Comment 1', 'Comment 2']);
    }, 100);
  });
}

// 链式调用
fetchUser(1)
  .then(user => {
    console.log(`[INFO] 用户: ${user.name}`);
    return fetchUserPosts(user.id);
  })
  .then(result => {
    console.log(`[INFO] 文章数量: ${result.posts.length}`);
    return fetchPostComments(result.posts[0]);
  })
  .then(comments => {
    console.log(`[INFO] 评论数量: ${comments.length}`);
  })
  .catch(error => {
    console.log(`[ERROR] 发生错误: ${error}`);
  })
  .finally(() => {
    console.log('[INFO] 链式调用完成');
  });
```

### 1.2 Promise.all - 并发执行

> **🏇 The Metaphor: The Horse Race**
> `Promise.all` 就像是一场**团队赛马**。
> *   你派出了 3 匹马（并发请求）。
> *   只有当**所有**马都冲过终点线时，裁判才会举旗（Resolve）。
> *   但是，只要有**任何一匹马**摔倒了（Reject），比赛立即结束，所有成绩作废。
> 
> 这就是 **Fail-Fast** 机制。如果你想要“能跑多少跑多少”，请使用 `Promise.allSettled`。

```typescript
console.log('[INFO] Promise.all 示例');

async function fetchMultipleUsers(ids: number[]): Promise<any[]> {
  console.log(`[INFO] 并发获取 ${ids.length} 个用户`);
  
  const promises = ids.map(id => fetchUser(id));
  
  try {
    const users = await Promise.all(promises);
    console.log(`[SUCCESS] 成功获取所有用户`);
    return users;
  } catch (error) {
    console.log(`[ERROR] 获取用户失败: ${error}`);
    throw error;
  }
}

// 使用
fetchMultipleUsers([1, 2, 3, 4, 5])
  .then(users => {
    console.log(`[LOG] 用户列表: ${JSON.stringify(users)}`);
  });

// ⚠️ Promise.all 的问题：一个失败全部失败
async function demonstratePromiseAllFailure() {
  console.log('[INFO] 演示 Promise.all 失败场景');
  
  const promises = [
    Promise.resolve(1),
    Promise.reject(new Error('失败')),
    Promise.resolve(3)
  ];
  
  try {
    await Promise.all(promises);
  } catch (error) {
    console.log(`[ERROR] Promise.all 失败: ${error}`);
    // 即使第1个和第3个成功，也会因为第2个失败而报错
  }
}
```

### 1.3 Promise.allSettled - 等待所有结果

```typescript
console.log('[INFO] Promise.allSettled 示例');

async function fetchAllUsers(ids: number[]): Promise<void> {
  console.log(`[INFO] 获取所有用户（包括失败的）`);
  
  const promises = ids.map(id => {
    if (id === 3) {
      return Promise.reject(new Error(`用户 ${id} 不存在`));
    }
    return fetchUser(id);
  });
  
  const results = await Promise.allSettled(promises);
  
  console.log('[INFO] 所有请求完成');
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`[SUCCESS] 用户 ${index + 1}: ${result.value.name}`);
    } else {
      console.log(`[ERROR] 用户 ${index + 1}: ${result.reason.message}`);
    }
  });
}

fetchAllUsers([1, 2, 3, 4]);
```

### 1.4 Promise.race - 竞速

```typescript
console.log('[INFO] Promise.race 示例');

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      console.log(`[ERROR] 超时: ${ms}ms`);
      reject(new Error(`操作超时: ${ms}ms`));
    }, ms);
  });
}

async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  console.log(`[INFO] 设置超时: ${timeoutMs}ms`);
  
  try {
    const result = await Promise.race([promise, timeout(timeoutMs)]);
    console.log('[SUCCESS] 操作在超时前完成');
    return result;
  } catch (error) {
    console.log(`[ERROR] 操作失败或超时: ${error}`);
    throw error;
  }
}

// 使用示例
const slowOperation = new Promise(resolve => {
  setTimeout(() => resolve('成功'), 2000);
});

fetchWithTimeout(slowOperation, 1000)
  .catch(error => {
    console.log(`[LOG] 捕获到错误: ${error.message}`);
  });
```

### 1.5 Promise.any - 第一个成功

```typescript
console.log('[INFO] Promise.any 示例');

async function fetchFromMultipleSources<T>(
  sources: (() => Promise<T>)[]
): Promise<T> {
  console.log(`[INFO] 从 ${sources.length} 个数据源获取`);
  
  const promises = sources.map(source => source());
  
  try {
    const result = await Promise.any(promises);
    console.log('[SUCCESS] 获取到第一个成功的结果');
    return result;
  } catch (error) {
    console.log('[ERROR] 所有数据源都失败了');
    throw new Error('所有数据源都失败了');
  }
}

// 使用示例
const sources = [
  () => new Promise((resolve, reject) => setTimeout(() => reject('源1失败'), 100)),
  () => new Promise(resolve => setTimeout(() => resolve('源2成功'), 200)),
  () => new Promise(resolve => setTimeout(() => resolve('源3成功'), 300))
];

fetchFromMultipleSources(sources)
  .then(result => {
    console.log(`[LOG] 结果: ${result}`);
  });
```

## 2. Async/Await 深入

### 2.1 错误处理策略

```typescript
// 策略 1：try-catch 包装
async function strategy1() {
  console.log('[INFO] 策略1: try-catch 包装');
  
  try {
    const user = await fetchUser(1);
    const posts = await fetchUserPosts(user.id);
    console.log(`[SUCCESS] 获取到 ${posts.posts.length} 篇文章`);
  } catch (error) {
    console.log(`[ERROR] 操作失败: ${error}`);
    // 处理错误
  }
}

// 策略 2：包装为返回值
type Result<T> = { success: true; data: T } | { success: false; error: Error };

async function safeAsync<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

async function strategy2() {
  console.log('[INFO] 策略2: 包装为返回值');
  
  const result = await safeAsync(fetchUser(1));
  
  if (result.success) {
    console.log(`[SUCCESS] 用户: ${result.data.name}`);
  } else {
    console.log(`[ERROR] 错误: ${result.error.message}`);
  }
}

// 策略 3：Promise 方式处理错误
async function strategy3() {
  console.log('[INFO] 策略3: Promise 方式');
  
  await fetchUser(1)
    .then(user => {
      console.log(`[SUCCESS] 用户: ${user.name}`);
      return fetchUserPosts(user.id);
    })
    .catch(error => {
      console.log(`[ERROR] 获取用户失败: ${error}`);
      // 返回默认值继续执行
      return { userId: 0, posts: [] };
    })
    .then(posts => {
      console.log(`[INFO] 文章数量: ${posts.posts.length}`);
    });
}
```

### 2.2 并行执行优化

```typescript
// ❌ 不推荐：串行执行（慢）
async function serialExecution() {
  console.log('[WARNING] 串行执行开始');
  const start = Date.now();
  
  const user1 = await fetchUser(1);  // 等待 100ms
  const user2 = await fetchUser(2);  // 再等待 100ms
  const user3 = await fetchUser(3);  // 再等待 100ms
  
  const duration = Date.now() - start;
  console.log(`[INFO] 串行执行完成，耗时: ${duration}ms`);  // 约 300ms
  return [user1, user2, user3];
}

// ✅ 推荐：并行执行（快）
async function parallelExecution() {
  console.log('[INFO] 并行执行开始');
  const start = Date.now();
  
  const [user1, user2, user3] = await Promise.all([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
  ]);
  
  const duration = Date.now() - start;
  console.log(`[SUCCESS] 并行执行完成，耗时: ${duration}ms`);  // 约 100ms
  return [user1, user2, user3];
}

// 条件性并行
async function conditionalParallel(ids: number[]) {
  console.log(`[INFO] 条件性并行执行: ${ids.length} 个任务`);
  
  // 如果 ID 少，串行执行；如果 ID 多，并行执行
  if (ids.length <= 3) {
    const results = [];
    for (const id of ids) {
      results.push(await fetchUser(id));
    }
    return results;
  } else {
    return await Promise.all(ids.map(id => fetchUser(id)));
  }
}
```

### 2.3 循环中的 async/await

```typescript
// ❌ 不推荐：forEach 中使用 async（不会等待）
async function forEachBad(ids: number[]) {
  console.log('[WARNING] forEach 中使用 async（错误用法）');
  
  ids.forEach(async (id) => {
    const user = await fetchUser(id);
    console.log(`[LOG] 用户: ${user.name}`);
  });
  
  console.log('[INFO] forEach 循环"完成"（实际上异步操作还在进行）');
}

// ✅ 推荐：for...of 循环（串行）
async function forOfSerial(ids: number[]) {
  console.log('[INFO] for...of 串行执行');
  
  for (const id of ids) {
    const user = await fetchUser(id);
    console.log(`[LOG] 用户: ${user.name}`);
  }
  
  console.log('[SUCCESS] for...of 循环完成');
}

// ✅ 推荐：map + Promise.all（并行）
async function mapParallel(ids: number[]) {
  console.log('[INFO] map + Promise.all 并行执行');
  
  const users = await Promise.all(
    ids.map(async (id) => {
      const user = await fetchUser(id);
      console.log(`[LOG] 获取用户: ${user.name}`);
      return user;
    })
  );
  
  console.log(`[SUCCESS] 并行执行完成，获取 ${users.length} 个用户`);
  return users;
}

// reduce 中使用 async（串行累积）
async function reduceAsync(ids: number[]) {
  console.log('[INFO] reduce 串行累积');
  
  const result = await ids.reduce(async (previousPromise, id) => {
    const accumulated = await previousPromise;
    const user = await fetchUser(id);
    console.log(`[LOG] 处理用户: ${user.name}`);
    return [...accumulated, user];
  }, Promise.resolve([] as any[]));
  
  console.log(`[SUCCESS] reduce 完成，结果数量: ${result.length}`);
  return result;
}
```

## 3. 并发控制

### 3.1 限制并发数量

> **🚦 The Metaphor: The Traffic Light**
> 如果没有并发控制，你的程序就像是**没有红绿灯的十字路口**。
> 当 1000 个请求同时涌入时，它们会互相拥挤、争抢资源（CPU/内存/网络带宽），最后导致**大塞车**（系统崩溃）。
> **并发限制 (Concurrency Limit)** 就是**红绿灯**。
> 它规定：“一次只能过 3 辆车。”
> 后面的车（任务）必须在队列里排队等待。
> 这样虽然单辆车的速度可能变慢了，但整个交通系统（应用）保持了**吞吐量**和**稳定性**。

```typescript
class ConcurrencyLimiter<T> {
  constructor(private limit: number) {
    console.log(`[INFO] 创建并发限制器，限制: ${limit}`);
  }
  
  async run(tasks: (() => Promise<T>)[]): Promise<T[]> {
    console.log(`[INFO] 执行 ${tasks.length} 个任务，并发限制: ${this.limit}`);
    
    const results: T[] = [];
    const executing: Promise<void>[] = [];
    
    for (const task of tasks) {
      const promise = task().then(result => {
        results.push(result);
        console.log(`[TRACE] 任务完成，已完成: ${results.length}/${tasks.length}`);
      });
      
      executing.push(promise);
      
      if (executing.length >= this.limit) {
        console.log(`[DEBUG] 达到并发限制 ${this.limit}，等待...`);
        await Promise.race(executing);
        const index = executing.findIndex(p => {
          return Promise.race([p, Promise.resolve()]).then(() => true);
        });
        executing.splice(index, 1);
      }
    }
    
    await Promise.all(executing);
    console.log(`[SUCCESS] 所有任务完成`);
    return results;
  }
}

// 使用示例
async function limitedConcurrency() {
  const tasks = Array.from({ length: 10 }, (_, i) => 
    () => fetchUser(i + 1)
  );
  
  const limiter = new ConcurrencyLimiter(3);  // 最多 3 个并发
  const results = await limiter.run(tasks);
  console.log(`[LOG] 结果数量: ${results.length}`);
}
```

### 3.2 任务队列

```typescript
class TaskQueue<T> {
  private queue: (() => Promise<T>)[] = [];
  private running = 0;
  
  constructor(private concurrency: number) {
    console.log(`[INFO] 创建任务队列，并发数: ${concurrency}`);
  }
  
  add(task: () => Promise<T>): Promise<T> {
    console.log(`[TRACE] 添加任务到队列，队列长度: ${this.queue.length + 1}`);
    
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        } finally {
          this.running--;
          this.processQueue();
        }
      });
      
      this.processQueue();
    });
  }
  
  private processQueue(): void {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    const task = this.queue.shift();
    if (task) {
      console.log(`[TRACE] 开始执行任务，当前运行: ${this.running + 1}/${this.concurrency}`);
      this.running++;
      task();
    }
  }
}

// 使用示例
async function queueExample() {
  const queue = new TaskQueue(2);  // 最多 2 个并发
  
  const tasks = Array.from({ length: 5 }, (_, i) => 
    queue.add(() => {
      console.log(`[LOG] 执行任务 ${i + 1}`);
      return fetchUser(i + 1);
    })
  );
  
  const results = await Promise.all(tasks);
  console.log(`[SUCCESS] 队列执行完成，结果数量: ${results.length}`);
}
```

### 3.3 重试机制

> **🔄 The Metaphor: The Persistence of Hope**
> 在分布式系统中，**失败是常态**。网络会抖动，服务会重启。
> 如果一次请求失败了就直接报错，那系统也太脆弱了。
> **重试 (Retry)** 就是**不要轻言放弃**。
> 但是，盲目的重试（立即重试）可能会导致**雪崩**——如果服务已经过载了，你的重试只会让它死得更快。
> **指数退避 (Exponential Backoff)** 是**理性的坚持**。
> "第一次失败，等 1 秒；第二次，等 2 秒；第三次，等 4 秒..."
> 给对方一点喘息的时间，也许下一次就成功了。

```typescript
async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  console.log(`[INFO] 开始重试机制，最多尝试 ${maxAttempts} 次`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[TRACE] 尝试 ${attempt}/${maxAttempts}`);
      const result = await fn();
      console.log(`[SUCCESS] 第 ${attempt} 次尝试成功`);
      return result;
    } catch (error) {
      console.log(`[WARNING] 第 ${attempt} 次尝试失败: ${error}`);
      
      if (attempt === maxAttempts) {
        console.log(`[ERROR] 所有尝试都失败了`);
        throw error;
      }
      
      console.log(`[INFO] 等待 ${delay}ms 后重试`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('不应该到达这里');
}

// 指数退避重试
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  console.log(`[INFO] 开始指数退避重试`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[TRACE] 尝试 ${attempt}/${maxAttempts}`);
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const delay = Math.pow(2, attempt) * 1000;  // 2s, 4s, 8s...
      console.log(`[INFO] 指数退避，等待 ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('不应该到达这里');
}

// 使用示例
async function retryExample() {
  let attempts = 0;
  
  const unreliableOperation = () => {
    attempts++;
    console.log(`[LOG] 执行不稳定操作，尝试 ${attempts}`);
    
    if (attempts < 3) {
      return Promise.reject(new Error('操作失败'));
    }
    
    return Promise.resolve('操作成功');
  };
  
  try {
    const result = await retry(unreliableOperation);
    console.log(`[LOG] 最终结果: ${result}`);
  } catch (error) {
    console.log(`[ERROR] 最终失败: ${error}`);
  }
}
```

## 4. 异步模式

### 4.1 防抖（Debounce）

> **🛑 The Metaphor: The Elevator Door**
> 防抖 (Debounce) 就像是**电梯门**。
> 当一个人进电梯时，门会打开，并等待 5 秒。
> 如果在这 5 秒内又来了一个人，计时器**重置**，重新等待 5 秒。
> 只有当**连续 5 秒没人进电梯**时，门才会真正关上（执行函数）。
> 这对于处理搜索框输入（用户停止输入后再搜索）非常有效。

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  console.log(`[INFO] 创建防抖函数，延迟: ${wait}ms`);
  
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    console.log(`[TRACE] 防抖函数调用`);
    
    if (timeoutId) {
      console.log('[DEBUG] 清除之前的定时器');
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      console.log('[TRACE] 执行防抖函数');
      func(...args);
    }, wait);
  };
}

// 使用示例
const search = debounce((query: string) => {
  console.log(`[LOG] 搜索: ${query}`);
}, 300);

search('a');
search('ab');
search('abc');  // 只有这个会执行
```

### 4.2 节流（Throttle）

> **💧 The Metaphor: The Dripping Tap**
> 节流 (Throttle) 就像是**滴水的水龙头**。
> 无论水管里的水压有多大（事件触发多频繁），水龙头都严格控制**每秒只滴一滴水**。
> 即使你在 1 秒内疯狂点击了 100 次按钮，节流函数也只会执行 1 次。
> 这对于处理滚动事件（Scroll）、窗口调整大小（Resize）等高频触发的事件非常有用，防止 CPU 过载。

```typescript
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  console.log(`[INFO] 创建节流函数，间隔: ${limit}ms`);
  
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      console.log('[TRACE] 执行节流函数');
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        console.log('[DEBUG] 节流解除');
        inThrottle = false;
      }, limit);
    } else {
      console.log('[DEBUG] 节流中，跳过执行');
    }
  };
}

// 使用示例
const handleScroll = throttle(() => {
  console.log(`[LOG] 滚动处理`);
}, 1000);

// 模拟快速滚动
for (let i = 0; i < 10; i++) {
  setTimeout(() => handleScroll(), i * 100);
}
```

### 4.3 缓存（Memoization）

> **📝 The Metaphor: The Cheat Sheet**
> 记忆化 (Memoization) 就像是考试时的**小抄**。
> 遇到一道难题（耗时计算），你先算一遍，然后把答案写在手心（缓存）。
> 下次再遇到同样的题，你不用再算一遍，直接看手心就行了。
> 这是一种**空间换时间**的策略。只要手心（内存）够大，你就能答得飞快。

```typescript
function memoize<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  console.log('[INFO] 创建缓存函数');
  
  const cache = new Map<string, any>();
  
  return (async (...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log(`[DEBUG] 缓存命中: ${key}`);
      return cache.get(key);
    }
    
    console.log(`[TRACE] 缓存未命中，执行函数: ${key}`);
    const result = await fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

// 使用示例
const cachedFetchUser = memoize(fetchUser);

async function cacheExample() {
  await cachedFetchUser(1);  // 执行函数
  await cachedFetchUser(1);  // 使用缓存
  await cachedFetchUser(2);  // 执行函数
}
```

## 5. 事件循环深入

### 5.1 微任务 vs 宏任务

> **🎫 The Metaphor: The VIP Line**
> Event Loop 处理任务是有优先级的。
> *   **MacroTask (宏任务)**: 普通排队。`setTimeout`, `setInterval`, I/O。就像去游乐园排队玩项目，玩完一个，得重新去排队。
> *   **MicroTask (微任务)**: VIP 快速通道。`Promise.then`, `process.nextTick`。
> *   **规则**: 只要 VIP 通道里还有人，普通通道的人就别想动。
> *   **危险**: 如果你无限递归地创建微任务（例如 `function loop() { Promise.resolve().then(loop) }`），你会**饿死**整个 Event Loop，导致页面卡死或服务器无响应。

```typescript
console.log('[1] 同步代码 - 开始');

setTimeout(() => {
  console.log('[7] 宏任务 - setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('[4] 微任务 - Promise.then');
});

queueMicrotask(() => {
  console.log('[5] 微任务 - queueMicrotask');
});

process.nextTick(() => {
  console.log('[3] process.nextTick（优先级最高的微任务）');
});

setTimeout(() => {
  console.log('[8] 宏任务 - setTimeout 2');
  
  Promise.resolve().then(() => {
    console.log('[9] 微任务 - Promise in setTimeout');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('[6] 微任务 - Promise.then 2');
});

console.log('[2] 同步代码 - 结束');

// 输出顺序：
// [1] -> [2] -> [3] -> [4] -> [5] -> [6] -> [7] -> [8] -> [9]
```

### 5.2 事件循环阶段

```typescript
import * as fs from 'fs';

console.log('[INFO] 事件循环阶段演示');

// 1. Timers 阶段
setTimeout(() => {
  console.log('[LOG] setTimeout - Timers 阶段');
}, 0);

setImmediate(() => {
  console.log('[LOG] setImmediate - Check 阶段');
});

// 2. I/O 回调
fs.readFile(__filename, () => {
  console.log('[LOG] 文件读取回调 - Poll 阶段');
  
  setTimeout(() => {
    console.log('[LOG] setTimeout in I/O');
  }, 0);
  
  setImmediate(() => {
    console.log('[LOG] setImmediate in I/O');
  });
});

// 3. process.nextTick（微任务，优先级最高）
process.nextTick(() => {
  console.log('[LOG] process.nextTick');
});

// 4. Promise（微任务）
Promise.resolve().then(() => {
  console.log('[LOG] Promise');
});
```

## 6. 实践练习

### 练习 1：实现 Promise.all

```typescript
function myPromiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    console.log(`[INFO] myPromiseAll: 处理 ${promises.length} 个 Promise`);
    
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    const results: T[] = [];
    let completed = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(result => {
          results[index] = result;
          completed++;
          console.log(`[TRACE] Promise ${index} 完成: ${completed}/${promises.length}`);
          
          if (completed === promises.length) {
            console.log('[SUCCESS] 所有 Promise 完成');
            resolve(results);
          }
        })
        .catch(error => {
          console.log(`[ERROR] Promise ${index} 失败: ${error}`);
          reject(error);
        });
    });
  });
}

// 测试
async function testMyPromiseAll() {
  const promises = [
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
  ];
  
  const results = await myPromiseAll(promises);
  console.log(`[LOG] 结果: ${results}`);
}
```

### 练习 2：实现异步队列

```typescript
class AsyncQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  
  enqueue(task: () => Promise<void>): void {
    console.log(`[TRACE] 添加任务到队列，队列长度: ${this.queue.length + 1}`);
    this.queue.push(task);
    this.process();
  }
  
  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    console.log('[INFO] 开始处理队列');
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        console.log(`[TRACE] 执行任务，剩余: ${this.queue.length}`);
        try {
          await task();
          console.log('[SUCCESS] 任务完成');
        } catch (error) {
          console.log(`[ERROR] 任务失败: ${error}`);
        }
      }
    }
    
    this.isProcessing = false;
    console.log('[INFO] 队列处理完成');
  }
}

// 测试
const queue = new AsyncQueue();

queue.enqueue(async () => {
  console.log('[LOG] 任务 1 开始');
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('[LOG] 任务 1 结束');
});

queue.enqueue(async () => {
  console.log('[LOG] 任务 2 开始');
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('[LOG] 任务 2 结束');
});
```

## 7. 常见问题解答

**Q: 什么时候使用 Promise.all，什么时候使用 Promise.allSettled？**

A:
- `Promise.all`：需要所有操作都成功时使用，任何一个失败就停止
- `Promise.allSettled`：想要所有操作的结果（无论成功失败）时使用

**Q: async 函数中的 return 和 Promise.resolve 有什么区别？**

A:
- 没有区别，`async function` 总是返回 Promise
- `return value` 等同于 `return Promise.resolve(value)`
- `throw error` 等同于 `return Promise.reject(error)`

**Q: 为什么 forEach 中的 async 不会等待？**

A:
- `forEach` 不理解 Promise，不会等待异步操作
- 使用 `for...of` 循环或 `map` + `Promise.all`

## 8. 最佳实践

### 8.1 避免Promise嵌套

```typescript
// ❌ 不推荐：Promise 嵌套
fetchUser(1)
  .then(user => {
    return fetchUserPosts(user.id)
      .then(posts => {
        return fetchPostComments(posts.posts[0])
          .then(comments => {
            return comments;
          });
      });
  });

// ✅ 推荐：Promise 链式调用
fetchUser(1)
  .then(user => fetchUserPosts(user.id))
  .then(posts => fetchPostComments(posts.posts[0]))
  .then(comments => comments);

// ✅ 更推荐：async/await
async function getBetter() {
  const user = await fetchUser(1);
  const posts = await fetchUserPosts(user.id);
  const comments = await fetchPostComments(posts.posts[0]);
  return comments;
}
```

### 8.2 适当使用并发

```typescript
// ✅ 推荐：合理使用并发
async function goodConcurrency() {
  // 独立的操作并行执行
  const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts()
  ]);
  
  // 依赖的操作串行执行
  const firstUser = users[0];
  const userPosts = await fetchUserPosts(firstUser.id);
  
  return { users, products, userPosts };
}
```

## 9. 小结

本章我们深入学习了异步编程：

- ✅ Promise 高级用法（all, allSettled, race, any）
- ✅ async/await 最佳实践
- ✅ 并发控制和队列管理
- ✅ 重试和错误处理策略
- ✅ 事件循环和微任务/宏任务

掌握这些知识后，你就可以高效处理复杂的异步场景了。

## 10. 下一步

- 开始项目：[任务管理 API](../projects/task-api/README.md)
- 完成练习题：[异步编程练习](../exercises/README.md#异步编程进阶)
