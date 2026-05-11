# 05. 可观测性基础 (Observability Basics)

> **🕵️ 核心理念**
>
> "如果一个系统在生产环境出错了，而你无法仅凭日志知道原因，那么这个系统就是不可维护的。"
>
> 在开发阶段，你可以用 Debugger。
> 在生产阶段，你只有 **Logs (日志)**、**Metrics (指标)** 和 **Traces (追踪)**。

## 1. 告别 `console.log`

新手最喜欢写 `console.log('User login error', err)`。
在生产环境，这是灾难。

### 为什么 `console.log` 不够用？
1.  **非结构化**: 它是纯文本。你没法在日志系统（如 ELK, Datadog）里搜索 "所有 `level=error` 且 `userId=123` 的日志"。
2.  **缺少上下文**: 当并发请求多了，日志会混在一起。你不知道这行日志属于哪个请求。
3.  **性能差**: `console.log` 是同步阻塞的（在某些环境），会拖慢 Node.js 的 Event Loop。

### 解决方案：结构化日志 (Structured Logging)
使用专业的日志库，如 **Pino** 或 **Winston**。

```typescript
// Bad
console.log('User logged in', user.id);

// Good (Pino)
logger.info({ userId: user.id, action: 'login' }, 'User logged in');
```

输出结果是 **JSON**:
```json
{"level":30,"time":1631234567890,"userId":123,"action":"login","msg":"User logged in"}
```
机器可以轻松解析 JSON，帮你做统计和报警。

---

## 2. 请求上下文 (Request Context)

在 Web 服务器中，成千上万个请求同时进来。
如果报错了，你怎么知道是哪个请求报错？

### Correlation ID (关联 ID)
给每个进来的 HTTP 请求分配一个唯一的 ID (UUID)。
在处理这个请求的所有日志中，都带上这个 ID。

```typescript
// Middleware
app.use((req, res, next) => {
  req.id = uuid(); // 生成唯一 ID
  next();
});

// Logger
logger.info({ reqId: req.id }, 'Processing order');
```

这样，你只需要在日志系统搜这个 ID，就能把这个请求的完整生命周期串起来。

---

## 3. 错误处理与清洗

不要把原始错误直接抛给用户，也不要吞掉错误。

*   **对用户**: 返回通用的 "Internal Server Error" (防止泄露代码细节)。
*   **对日志**: 记录完整的 `Error.stack`。
*   **清洗 (Sanitization)**: **严禁**在日志中记录密码、Token、信用卡号！这是严重的安全事故。

## 🎯 实战任务

在你的 **Task API** 项目中：
1.  安装 `pino`。
2.  创建一个全局的 `logger` 实例。
3.  编写一个中间件，为每个请求生成 `requestId`，并记录请求的开始和结束（包含耗时）。
4.  确保所有的错误日志都包含 `requestId` 和 `stack trace`。
