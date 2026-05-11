/**
 * @file 03-async-error-handling.ts
 * @description Promise/async/await 错误处理完整演示 — 从回调到统一模型
 * @prerequisites Stage 1 Ch04 异步基础, Stage 2 Ch04 异步进阶
 * @related Stage 2 Ch08 全局错误处理 (04-global-error-handlers.ts)
 */

console.log('=== 异步错误处理 ===\n');

// ============================================
// 辅助: 模拟异步操作
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface User {
  id: number;
  name: string;
}

interface Post {
  userId: number;
  title: string;
}

// 模拟数据库
const users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const posts: Post[] = [
  { userId: 1, title: 'Hello World' },
  { userId: 1, title: 'Async Patterns' },
];

async function fetchUser(id: number): Promise<User> {
  await delay(50);
  const user = users.find(u => u.id === id);
  if (!user) throw new Error(`User ${id} not found`);
  return user;
}

async function fetchPosts(userId: number): Promise<Post[]> {
  await delay(50);
  return posts.filter(p => p.userId === userId);
}

async function fetchUnreliable(): Promise<string> {
  await delay(50);
  if (Math.random() > 0.5) throw new Error('Service temporarily unavailable');
  return 'success';
}

// ============================================
// 1. catch 参数类型: unknown vs any
// ============================================
console.log('[INFO] 1. catch 参数类型 — unknown 是安全的选择\n');

async function demo1() {
  // ❌ 危险: catch(error) 默认是 unknown, 但有人写 any
  try {
    throw 42; // JavaScript 允许 throw 任何值
  } catch (error: unknown) {
    // 必须做类型检查才能安全使用
    if (error instanceof Error) {
      console.log('[TRACE] Error:', error.message);
    } else {
      console.log('[TRACE] Non-Error thrown:', String(error));
    }
  }

  // ✅ 类型安全的错误提取函数
  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return JSON.stringify(error);
  }

  try { throw new Error('test'); } catch (e) { console.log('[TRACE]', getErrorMessage(e)); }
  try { throw 'string error'; } catch (e) { console.log('[TRACE]', getErrorMessage(e)); }
  try { throw { code: 42 }; } catch (e) { console.log('[TRACE]', getErrorMessage(e)); }
  console.log('[VERIFY] getErrorMessage 安全处理了所有类型');
}

// ============================================
// 2. Promise 链式错误处理
// ============================================
async function demo2() {
  console.log('\n[INFO] 2. Promise 链式错误处理\n');

  // .catch() 捕获链上所有之前的错误
  await fetchUser(1)
    .then(user => {
      console.log('[TRACE] 找到用户:', user.name);
      return fetchPosts(user.id);
    })
    .then(userPosts => {
      console.log('[TRACE] 文章数量:', userPosts.length);
    })
    .catch(error => {
      console.log('[TRACE] 链上某步失败:', error.message);
    });

  // 不存在的用户 — 错误在第一步就触发
  await fetchUser(999)
    .then(user => {
      console.log('[TRACE] 这行不会执行');
      return fetchPosts(user.id);
    })
    .catch(error => {
      console.log('[TRACE] 捕获到错误:', error.message);
      console.log('[VERIFY] 后续 .then() 被跳过');
    });
}

// ============================================
// 3. .then(onFulfilled, onRejected) vs .catch() 的区别
// ============================================
async function demo3() {
  console.log('\n[INFO] 3. .then 第二参数 vs .catch() 的关键区别\n');

  // ❌ .then 的 onRejected 不会捕获同一个 .then 的 onFulfilled 中的错误
  await Promise.resolve('ok')
    .then(
      (value) => {
        console.log('[TRACE] onFulfilled 执行, 然后故意抛错');
        throw new Error('Error inside onFulfilled');
      },
      (error) => {
        // 这个 onRejected 不会捕获上面 onFulfilled 抛出的错误!
        console.log('[TRACE] onRejected:', error.message);
      }
    )
    .catch(error => {
      console.log('[TRACE] .catch() 捕获了 onFulfilled 的错误:', error.message);
      console.log('[VERIFY] .catch() 能捕获同一步 .then 中的错误, 但 onRejected 不能');
    });
}

// ============================================
// 4. async/await — 统一的错误处理模型
// ============================================
async function demo4() {
  console.log('\n[INFO] 4. async/await 统一的 try/catch\n');

  async function getUserPostTitles(userId: number): Promise<string[]> {
    try {
      const user = await fetchUser(userId);
      console.log('[TRACE] 获取用户:', user.name);

      const userPosts = await fetchPosts(user.id);
      console.log('[TRACE] 获取文章:', userPosts.length, '篇');

      return userPosts.map(p => p.title);
    } catch (error: unknown) {
      console.log('[TRACE] 捕获异步错误:', error instanceof Error ? error.message : error);
      return []; // 降级: 返回空数组
    }
  }

  const titles = await getUserPostTitles(1);
  console.log('[VERIFY] 成功获取文章标题:', titles);

  const emptyTitles = await getUserPostTitles(999);
  console.log('[VERIFY] 用户不存在, 降级返回空数组:', emptyTitles);
}

// ============================================
// 5. 忘记 await 的陷阱
// ============================================
async function demo5() {
  console.log('\n[INFO] 5. 忘记 await 的陷阱\n');

  // ❌ 忘记 await — try/catch 捕获不到异步错误
  try {
    const promise = fetchUser(999); // 没有 await!
    console.log('[TRACE] ❌ 这行会执行, promise 是一个 pending 的 Promise');
    console.log('[TRACE] promise:', promise);
    // 错误会变成 unhandled rejection
    // 手动处理以避免 unhandled rejection 警告
    promise.catch(() => {});
  } catch (error) {
    console.log('[TRACE] ❌ 这里永远不会执行');
  }

  // ✅ 正确: 使用 await
  try {
    const user = await fetchUser(999); // 有 await
  } catch (error: unknown) {
    console.log('[TRACE] ✅ 正确捕获:', error instanceof Error ? error.message : error);
    console.log('[VERIFY] 使用 await 后 try/catch 能正确捕获异步错误');
  }
}

// ============================================
// 6. Promise 组合的错误行为
// ============================================
async function demo6() {
  console.log('\n[INFO] 6. Promise 组合方法的错误行为\n');

  // --- Promise.all: Fail Fast ---
  console.log('[TRACE] --- Promise.all (Fail Fast) ---');
  try {
    const results = await Promise.all([
      fetchUser(1),
      fetchUser(999),  // 这个会失败
      fetchUser(2),
    ]);
  } catch (error: unknown) {
    console.log('[TRACE] Promise.all 失败:', error instanceof Error ? error.message : error);
    console.log('[VERIFY] 第一个 reject 立即中止所有');
  }

  // --- Promise.allSettled: 不会 reject ---
  console.log('[TRACE] --- Promise.allSettled (收集所有结果) ---');
  const settled = await Promise.allSettled([
    fetchUser(1),
    fetchUser(999),  // 失败
    fetchUser(2),
  ]);

  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`[TRACE]   #${i}: fulfilled, user=${result.value.name}`);
    } else {
      console.log(`[TRACE]   #${i}: rejected, reason=${result.reason.message}`);
    }
  });
  console.log('[VERIFY] allSettled 永远 fulfilled, 每个结果独立');

  // --- Promise.any: 任一成功即可 ---
  console.log('[TRACE] --- Promise.any (任一成功) ---');
  try {
    const first = await Promise.any([
      fetchUser(999),    // 失败
      fetchUser(1),      // 成功
      fetchUser(999),    // 失败
    ]);
    console.log('[TRACE] Promise.any 成功:', first.name);
  } catch (error) {
    // 只有全部失败才到这里, error 是 AggregateError
    console.log('[TRACE] 所有都失败了');
  }
}

// ============================================
// 7. finally — 无论成功失败都执行清理
// ============================================
async function demo7() {
  console.log('\n[INFO] 7. finally — 清理资源\n');

  async function processWithCleanup(userId: number): Promise<void> {
    console.log('[TRACE] 开始处理, 获取资源...');
    const startTime = Date.now();

    try {
      const user = await fetchUser(userId);
      console.log('[TRACE] 处理用户:', user.name);
    } catch (error: unknown) {
      console.log('[TRACE] 处理失败:', error instanceof Error ? error.message : error);
    } finally {
      const elapsed = Date.now() - startTime;
      console.log(`[TRACE] finally: 清理资源, 耗时 ${elapsed}ms`);
      console.log('[VERIFY] finally 无论成功或失败都会执行');
    }
  }

  await processWithCleanup(1);  // 成功
  await processWithCleanup(999); // 失败
}

// ============================================
// 8. 重试模式 — 应对不可靠的异步操作
// ============================================
async function demo8() {
  console.log('\n[INFO] 8. 重试模式 (Retry Pattern)\n');

  async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 100,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[TRACE]   尝试 #${attempt}...`);
        const result = await fn();
        console.log(`[TRACE]   尝试 #${attempt} 成功`);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`[TRACE]   尝试 #${attempt} 失败: ${error instanceof Error ? error.message : error}`);
        if (attempt < maxRetries) {
          await delay(delayMs * attempt); // 指数退避
        }
      }
    }

    throw new Error(
      `Failed after ${maxRetries} retries`,
      { cause: lastError }
    );
  }

  try {
    const result = await withRetry(() => fetchUnreliable(), 3, 20);
    console.log('[TRACE] 最终结果:', result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('[TRACE] 最终失败:', error.message);
      console.log('[TRACE] 原始原因:', (error.cause as Error)?.message);
    }
  }
  console.log('[VERIFY] 重试模式能处理间歇性故障');
}

// ============================================
// 运行所有 demo
// ============================================
async function main() {
  await demo1();
  await demo2();
  await demo3();
  await demo4();
  await demo5();
  await demo6();
  await demo7();
  await demo8();
  console.log('\n[INFO] === 示例结束 ===');
}

main().catch(console.error);
