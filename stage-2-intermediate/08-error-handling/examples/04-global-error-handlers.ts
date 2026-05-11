/**
 * @file 04-global-error-handlers.ts
 * @description 浏览器/Node.js 全局错误处理机制 — 安全网设计
 * @prerequisites Stage 2 Ch08 异步错误处理 (03-async-error-handling.ts)
 * @related Stage 2 Ch05 可观测性基础, Stage 3 Ch04 架构最佳实践
 */

console.log('=== 全局错误处理机制 ===\n');

// ============================================
// 辅助: 模拟上报系统
// ============================================

interface ErrorReport {
  type: string;
  message: string;
  timestamp: string;
  stack?: string;
  context?: Record<string, unknown>;
}

const errorReports: ErrorReport[] = [];

function reportToServer(report: ErrorReport): void {
  errorReports.push(report);
  console.log('[TRACE] 📤 上报错误:', JSON.stringify({
    type: report.type,
    message: report.message,
    timestamp: report.timestamp,
  }));
}

// ============================================
// 1. 浏览器环境: window.onerror (概念演示)
// ============================================
console.log('[INFO] 1. 浏览器 window.onerror (概念演示)\n');

// 注意: 以下代码在浏览器环境中运行
// 在 Node.js 中用 console.log 模拟其行为

function setupBrowserErrorHandlers(): void {
  // --- window.onerror: 捕获同步的未捕获异常 ---
  // window.onerror = (message, source, lineno, colno, error) => {
  //   reportToServer({
  //     type: 'uncaught_error',
  //     message: String(message),
  //     timestamp: new Date().toISOString(),
  //     stack: error?.stack,
  //     context: { source, lineno, colno },
  //   });
  //   return true; // true = 阻止默认的控制台错误输出
  // };

  console.log('[TRACE] window.onerror 参数说明:');
  console.log('[TRACE]   message  — 错误消息字符串');
  console.log('[TRACE]   source   — 发生错误的脚本 URL');
  console.log('[TRACE]   lineno   — 行号');
  console.log('[TRACE]   colno    — 列号');
  console.log('[TRACE]   error    — Error 对象 (可能为 null)');
  console.log('[VERIFY] 返回 true 阻止默认错误输出, 返回 false 保留');
}

setupBrowserErrorHandlers();
console.log();

// ============================================
// 2. 浏览器环境: unhandledrejection (概念演示)
// ============================================
console.log('[INFO] 2. 浏览器 unhandledrejection 事件\n');

function setupBrowserRejectionHandler(): void {
  // window.addEventListener('unhandledrejection', (event) => {
  //   const reason = event.reason;
  //   reportToServer({
  //     type: 'unhandled_rejection',
  //     message: reason instanceof Error ? reason.message : String(reason),
  //     timestamp: new Date().toISOString(),
  //     stack: reason instanceof Error ? reason.stack : undefined,
  //   });
  //   event.preventDefault(); // 阻止默认的控制台警告
  // });

  console.log('[TRACE] unhandledrejection 事件:');
  console.log('[TRACE]   event.reason  — reject 的值 (Error 或任意值)');
  console.log('[TRACE]   event.promise — 被 reject 的 Promise 对象');
  console.log('[TRACE]   event.preventDefault() — 阻止默认警告');
  console.log('[VERIFY] 没有 .catch() 的 rejected Promise 会触发此事件');
}

setupBrowserRejectionHandler();
console.log();

// ============================================
// 3. Node.js 环境: 实际可运行的全局处理
// ============================================
console.log('[INFO] 3. Node.js 全局错误处理 (实际演示)\n');

// --- uncaughtException: 未捕获的同步异常 ---
const uncaughtHandler = (error: Error, origin: string) => {
  reportToServer({
    type: 'uncaught_exception',
    message: error.message,
    timestamp: new Date().toISOString(),
    stack: error.stack,
    context: { origin },
  });
  console.log('[TRACE] ⚠️ uncaughtException: 进程应该退出!');
  // 生产环境: process.exit(1);
  // 这里为了演示不退出
};

// --- unhandledRejection: 未处理的 Promise rejection ---
const rejectionHandler = (reason: unknown, promise: Promise<unknown>) => {
  reportToServer({
    type: 'unhandled_rejection',
    message: reason instanceof Error ? reason.message : String(reason),
    timestamp: new Date().toISOString(),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  console.log('[TRACE] ⚠️ unhandledRejection 被全局处理器捕获');
};

// 注册处理器
process.on('uncaughtException', uncaughtHandler);
process.on('unhandledRejection', rejectionHandler);
console.log('[TRACE] 已注册 Node.js 全局错误处理器');
console.log();

// ============================================
// 4. 模拟触发 unhandledRejection
// ============================================
console.log('[INFO] 4. 触发 unhandledRejection\n');

// 创建一个被 reject 但没有 .catch() 的 Promise
// 全局处理器会捕获它
Promise.reject(new Error('Simulated unhandled rejection'));

// 等待一个 tick 让 unhandledRejection 触发
setTimeout(() => {
  console.log('[VERIFY] unhandledRejection 已被全局处理器捕获\n');

  // ============================================
  // 5. 优雅退出策略 (Graceful Shutdown)
  // ============================================
  console.log('[INFO] 5. 优雅退出策略\n');

  class GracefulShutdown {
    private cleanupFunctions: Array<() => Promise<void>> = [];
    private isShuttingDown = false;

    /** 注册清理函数 */
    register(name: string, fn: () => Promise<void>): void {
      this.cleanupFunctions.push(async () => {
        console.log(`[TRACE]   清理: ${name}...`);
        await fn();
        console.log(`[TRACE]   清理: ${name} ✓`);
      });
    }

    /** 执行所有清理函数 */
    async shutdown(reason: string): Promise<void> {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      console.log(`[TRACE] 🔄 开始优雅退出, 原因: ${reason}`);
      const startTime = Date.now();

      for (const cleanup of this.cleanupFunctions) {
        try {
          await cleanup();
        } catch (error) {
          console.log(`[TRACE]   ⚠️ 清理失败: ${error instanceof Error ? error.message : error}`);
        }
      }

      const elapsed = Date.now() - startTime;
      console.log(`[TRACE] ✅ 优雅退出完成, 耗时 ${elapsed}ms`);
    }
  }

  // 演示优雅退出
  const shutdown = new GracefulShutdown();

  shutdown.register('数据库连接', async () => {
    // 模拟关闭数据库连接
    await new Promise(r => setTimeout(r, 10));
  });

  shutdown.register('HTTP 服务器', async () => {
    // 模拟停止 HTTP 服务器
    await new Promise(r => setTimeout(r, 10));
  });

  shutdown.register('消息队列', async () => {
    // 模拟断开消息队列
    await new Promise(r => setTimeout(r, 10));
  });

  // 模拟触发优雅退出
  shutdown.shutdown('SIGTERM').then(() => {
    console.log();

    // ============================================
    // 6. 错误上报完整示例
    // ============================================
    console.log('[INFO] 6. 错误上报完整方案\n');

    class ErrorReporter {
      private queue: ErrorReport[] = [];
      private readonly maxBatchSize = 10;

      /** 记录错误 */
      capture(error: unknown, context?: Record<string, unknown>): void {
        const report: ErrorReport = {
          type: error instanceof Error ? error.constructor.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          stack: error instanceof Error ? error.stack : undefined,
          context: this.sanitize(context || {}),
        };

        this.queue.push(report);
        console.log(`[TRACE] 📝 错误已入队: ${report.type} — ${report.message}`);

        if (this.queue.length >= this.maxBatchSize) {
          this.flush();
        }
      }

      /** 过滤敏感信息 */
      private sanitize(data: Record<string, unknown>): Record<string, unknown> {
        const sensitiveKeys = ['password', 'token', 'secret', 'authorization'];
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
          if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
            result[key] = '[REDACTED]';
          } else {
            result[key] = value;
          }
        }
        return result;
      }

      /** 批量发送 */
      flush(): void {
        if (this.queue.length === 0) return;
        console.log(`[TRACE] 📤 批量上报 ${this.queue.length} 条错误`);
        // 生产环境: 发送到 Sentry/Datadog 等
        this.queue = [];
      }
    }

    const reporter = new ErrorReporter();

    // 模拟捕获各种错误
    reporter.capture(new TypeError('Cannot read property "x" of null'), {
      userId: 'u-123',
      action: 'fetchProfile',
    });

    reporter.capture(new Error('Database connection timeout'), {
      service: 'user-service',
      password: 'secret123',  // 会被过滤!
      dbHost: 'db.example.com',
    });

    reporter.capture('string error without stack trace');

    reporter.flush();

    console.log('[VERIFY] 密码等敏感信息已被过滤为 [REDACTED]');

    // ============================================
    // 7. 总结: 全局错误处理清单
    // ============================================
    console.log('\n[INFO] 7. 全局错误处理清单\n');
    console.log('[TRACE] ┌──────────────────────────────────────────────────┐');
    console.log('[TRACE] │  环境        │  同步异常           │  异步拒绝          │');
    console.log('[TRACE] ├──────────────────────────────────────────────────┤');
    console.log('[TRACE] │  浏览器      │  window.onerror      │  unhandledrejection│');
    console.log('[TRACE] │  Node.js     │  uncaughtException   │  unhandledRejection│');
    console.log('[TRACE] │  React       │  ErrorBoundary       │  N/A (需手动处理)  │');
    console.log('[TRACE] │  Express     │  错误中间件          │  asyncHandler      │');
    console.log('[TRACE] └──────────────────────────────────────────────────┘');

    // 清理: 移除全局处理器 (避免影响后续代码)
    process.removeListener('uncaughtException', uncaughtHandler);
    process.removeListener('unhandledRejection', rejectionHandler);
    console.log('\n[TRACE] 已清理全局错误处理器');

    console.log('\n[INFO] === 示例结束 ===');
  });
}, 50);
