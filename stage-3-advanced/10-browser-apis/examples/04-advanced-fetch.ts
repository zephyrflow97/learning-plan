/**
 * @file 04-advanced-fetch.ts
 * @description 演示 Fetch API 高级用法：AbortController、流式处理、请求拦截中间件、错误处理
 * @prerequisites Stage 2 Ch04 异步进阶, Stage 2 Ch08 错误处理体系
 * @related examples/03-file-and-stream-api.ts (Stream API)
 */

console.log('[INFO] === Fetch API 高级用法演示 ===\n');

// ============================================================================
// 1. AbortController — 请求取消与超时控制
// ============================================================================
console.log('[1] AbortController — 取消请求与超时控制');

/**
 * @description AbortController 是浏览器的通用取消机制
 * 不仅可以取消 fetch，还可以取消 addEventListener、ReadableStream 等
 */
async function demoAbortController() {
  // 1.1 基本取消
  console.log('  --- 1.1 基本取消 ---');

  const controller = new AbortController();
  const { signal } = controller;

  console.log(`  [SIGNAL] aborted: ${signal.aborted}`);

  // 监听取消事件
  signal.addEventListener('abort', () => {
    console.log(`  [SIGNAL] 收到取消信号! reason: ${signal.reason}`);
  });

  // 取消请求
  controller.abort('用户手动取消');
  console.log(`  [SIGNAL] aborted: ${signal.aborted}`);
  console.log('');

  // 1.2 超时控制
  console.log('  --- 1.2 超时控制 ---');

  /**
   * @description 使用 AbortSignal.timeout() 实现请求超时
   * 这是 AbortSignal 的静态方法，比手动 setTimeout + abort 更简洁
   */
  function fetchWithTimeout(url: string, timeoutMs: number): { signal: AbortSignal; info: string } {
    // AbortSignal.timeout() — 现代浏览器内置
    // const signal = AbortSignal.timeout(timeoutMs);
    // return fetch(url, { signal });

    // 兼容方式
    const controller = new AbortController();
    setTimeout(() => controller.abort(`超时 ${timeoutMs}ms`), timeoutMs);
    return {
      signal: controller.signal,
      info: `fetch("${url}", { signal, timeout: ${timeoutMs}ms })`
    };
  }

  const timeoutFetch = fetchWithTimeout('/api/slow-endpoint', 5000);
  console.log(`  [TIMEOUT] ${timeoutFetch.info}`);
  console.log('');

  // 1.3 AbortSignal.any() — 组合多个取消信号
  console.log('  --- 1.3 组合取消信号 ---');
  console.log('  AbortSignal.any([userSignal, timeoutSignal])');
  console.log('  → 任一信号触发都会取消操作');
  console.log('  → 用于 "用户取消 OR 超时" 的场景');
}

await demoAbortController();
console.log('');

// ============================================================================
// 2. Fetch 五大陷阱与正确写法
// ============================================================================
console.log('[2] Fetch 五大陷阱');

/**
 * @description Fetch 的常见坑和正确处理方式
 */
function demoFetchPitfalls() {
  // 陷阱 1: HTTP 错误码不 reject
  console.log('  [陷阱 1] 404/500 不触发 catch');
  console.log('    ❌ fetch("/404").then(r => r.json())  // 正常进入 then');
  console.log('    ✅ fetch("/404").then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); })');
  console.log('');

  // 陷阱 2: body 只能读一次
  console.log('  [陷阱 2] Response body 只能消费一次');
  console.log('    ❌ await res.json(); await res.json()  // TypeError: body已被读取');
  console.log('    ✅ const clone = res.clone(); await clone.json(); await res.text()');
  console.log('');

  // 陷阱 3: 默认不发送 cookies
  console.log('  [陷阱 3] 跨域请求默认不带 cookies');
  console.log('    ❌ fetch("https://api.example.com/data")  // 无 cookie');
  console.log('    ✅ fetch(url, { credentials: "include" })  // 带 cookie');
  console.log('');

  // 陷阱 4: Content-Type 不自动设置
  console.log('  [陷阱 4] POST JSON 时需要手动设置 Content-Type');
  console.log('    ❌ fetch(url, { method: "POST", body: JSON.stringify(data) })');
  console.log('    ✅ fetch(url, { method: "POST", body: JSON.stringify(data),');
  console.log('         headers: { "Content-Type": "application/json" } })');
  console.log('    💡 但 FormData 不需要设置 — 浏览器自动加 multipart boundary');
  console.log('');

  // 陷阱 5: 网络错误 vs HTTP 错误
  console.log('  [陷阱 5] reject 只在网络错误时触发');
  console.log('    网络错误 → TypeError: Failed to fetch → catch 中处理');
  console.log('    HTTP 404  → Response { ok: false }    → then 中检查');
  console.log('    请求取消 → AbortError                → catch 中区分');
}

demoFetchPitfalls();
console.log('');

// ============================================================================
// 3. 安全的 Fetch 封装
// ============================================================================
console.log('[3] 安全的 Fetch 封装');

/**
 * @description 生产级 fetch 封装，处理所有陷阱
 */
type FetchResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };

async function safeFetch<T>(
  url: string,
  options?: RequestInit & { timeoutMs?: number }
): Promise<FetchResult<T>> {
  const { timeoutMs = 10000, ...fetchOptions } = options || {};

  // 创建超时 AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('Timeout'), timeoutMs);

  // 合并用户的 signal（如果提供了）
  const signal = options?.signal
    ? options.signal // 用户自定义的 signal 优先
    : controller.signal;

  try {
    console.log(`  [FETCH] GET ${url} (timeout: ${timeoutMs}ms)`);

    // 模拟 fetch（真实场景直接 await fetch）
    // const response = await fetch(url, { ...fetchOptions, signal });
    const mockStatus = url.includes('404') ? 404 : url.includes('error') ? 500 : 200;

    clearTimeout(timeoutId);

    // 检查 HTTP 状态
    if (mockStatus >= 400) {
      console.log(`  [FETCH] HTTP ${mockStatus} — 返回错误结果`);
      return {
        ok: false,
        error: `HTTP Error: ${mockStatus}`,
        status: mockStatus
      };
    }

    // 解析 JSON
    const data = { message: 'mock data' } as T;
    console.log(`  [FETCH] HTTP ${mockStatus} — 成功`);
    return { ok: true, data, status: mockStatus };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log(`  [FETCH] 请求被取消: ${error.message}`);
      return { ok: false, error: 'Request aborted', status: 0 };
    }

    const message = error instanceof Error ? error.message : String(error);
    console.log(`  [FETCH] 网络错误: ${message}`);
    return { ok: false, error: message, status: 0 };
  }
}

// 演示
async function demoSafeFetch() {
  const result1 = await safeFetch<{ message: string }>('/api/users');
  console.log('  结果1:', result1);

  const result2 = await safeFetch('/api/404');
  console.log('  结果2:', result2);
}

await demoSafeFetch();
console.log('');

// ============================================================================
// 4. 请求中间件模式
// ============================================================================
console.log('[4] 请求中间件 — 可组合的 Fetch 增强');

/**
 * @description 用高阶函数构建 fetch 中间件链
 * 类似 Express/Koa 的中间件思路，但用于客户端请求
 */
type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;
type FetchMiddleware = (next: FetchFn) => FetchFn;

/**
 * @description 中间件 1: 添加基础 URL
 */
function withBaseURL(baseURL: string): FetchMiddleware {
  return (next) => (url, init) => {
    const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;
    console.log(`  [MW:BaseURL] ${url} → ${fullURL}`);
    return next(fullURL, init);
  };
}

/**
 * @description 中间件 2: 添加认证头
 */
function withAuth(getToken: () => string): FetchMiddleware {
  return (next) => (url, init) => {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${getToken()}`);
    console.log(`  [MW:Auth] 添加 Authorization 头`);
    return next(url, { ...init, headers });
  };
}

/**
 * @description 中间件 3: 请求日志
 */
function withLogging(): FetchMiddleware {
  return (next) => async (url, init) => {
    const method = init?.method || 'GET';
    const start = performance.now();
    console.log(`  [MW:Log] → ${method} ${url}`);

    try {
      const response = await next(url, init);
      const elapsed = (performance.now() - start).toFixed(2);
      console.log(`  [MW:Log] ← ${response.status} (${elapsed}ms)`);
      return response;
    } catch (error) {
      const elapsed = (performance.now() - start).toFixed(2);
      console.log(`  [MW:Log] ← ERROR (${elapsed}ms): ${error}`);
      throw error;
    }
  };
}

/**
 * @description 中间件 4: 自动重试
 */
function withRetry(maxRetries: number = 3): FetchMiddleware {
  return (next) => async (url, init) => {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await next(url, init);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`  [MW:Retry] 第 ${attempt}/${maxRetries} 次失败: ${lastError.message}`);
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100;
          console.log(`  [MW:Retry] 等待 ${delay}ms 后重试`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  };
}

/**
 * @description 将多个中间件组合成一个增强后的 fetch 函数
 */
function applyMiddlewares(
  baseFetch: FetchFn,
  ...middlewares: FetchMiddleware[]
): FetchFn {
  return middlewares.reduceRight(
    (next, middleware) => middleware(next),
    baseFetch
  );
}

// 组合中间件创建 API 客户端
function demoMiddleware() {
  console.log('  中间件组合:');
  console.log('    withLogging → withAuth → withBaseURL → fetch');
  console.log('');

  // 模拟中间件处理流程
  const mockToken = () => 'eyJhbGciOiJIUzI1NiJ9...';

  console.log('  请求处理链:');
  console.log(`    1. withLogging:  记录 → GET /api/users`);
  console.log(`    2. withAuth:     添加 Authorization: Bearer ${mockToken().slice(0, 20)}...`);
  console.log(`    3. withBaseURL:  /api/users → https://api.example.com/api/users`);
  console.log(`    4. fetch:        发送实际请求`);
  console.log(`    5. withLogging:  记录 ← 200 (45.23ms)`);
}

demoMiddleware();
console.log('');

// ============================================================================
// 5. 流式响应处理 (SSE / LLM 场景)
// ============================================================================
console.log('[5] 流式响应 — LLM/ChatGPT 风格的逐字输出');

/**
 * @description 模拟 LLM 流式响应的客户端处理
 * 真实场景中使用 response.body.getReader() 逐块读取
 */
async function demoStreamingResponse() {
  const fullResponse = 'Web Workers 让 JavaScript 拥有了真正的多线程能力，它通过 postMessage 进行线程间通信。';
  const chars = fullResponse.split('');

  console.log('  [STREAM] 模拟 LLM 流式输出:');
  process.stdout.write('  [OUTPUT] ');

  for (const char of chars) {
    process.stdout.write(char);
    await new Promise(resolve => setTimeout(resolve, 20)); // 模拟网络延迟
  }

  console.log('\n  [STREAM] 流式输出完成');

  // 代码模式
  console.log('\n  流式读取代码模式:');
  console.log('    const reader = response.body.getReader();');
  console.log('    const decoder = new TextDecoder();');
  console.log('    while (true) {');
  console.log('      const { done, value } = await reader.read();');
  console.log('      if (done) break;');
  console.log('      const text = decoder.decode(value, { stream: true });');
  console.log('      appendToUI(text);');
  console.log('    }');
}

await demoStreamingResponse();

console.log('\n[INFO] === Fetch API 高级用法演示结束 ===');
