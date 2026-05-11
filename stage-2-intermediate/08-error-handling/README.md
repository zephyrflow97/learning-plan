# 第 8 章:错误处理体系 — 与混乱世界的和解协议

> *"The only truly secure system is one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards."*
> — Gene Spafford
>
> 你的代码会崩溃。不是"可能",是"一定"。网络会断、磁盘会满、用户会输入 emoji 到手机号字段、第三方 API 会返回 `null`。区别不在于你的代码是否会遇到错误,而在于**它遇到错误时的行为是否可预测**。一个没有错误处理的程序就像一辆没有安全气囊的汽车——晴天开起来毫无区别,但下雨天你会后悔。

## 📖 本章内容

1. [错误的哲学](#1-错误的哲学)
2. [Error 类型体系](#2-error-类型体系)
3. [自定义错误类](#3-自定义错误类)
4. [同步与异步错误处理](#4-同步与异步错误处理)
5. [全局错误兜底](#5-全局错误兜底)
6. [错误处理策略](#6-错误处理策略)
7. [结构化错误日志](#7-结构化错误日志)
8. [🧘 Zen of Code: 与错误共处](#8--zen-of-code-与错误共处)
9. [最佳实践与常见陷阱](#9-最佳实践与常见陷阱)
10. [章节练习](#10-章节练习)

---

## 1. 错误的哲学

> 🎭 **The Drama: 错误的三重人格**
>
> 错误有三张面孔,但很多程序员把它们混为一谈,用同一个 `catch` 打包处理。这就像医院把骨折、感冒和心脏骤停的病人都送进同一间病房——结果是所有人都得不到正确的治疗。
>
> 1. **程序员的 Bug**——`TypeError: Cannot read property 'x' of undefined`。你写错了代码。修它。
> 2. **业务的例外**——用户余额不足、用户名已存在。可预期,应优雅处理,给用户友好反馈。
> 3. **环境的灾难**——数据库挂了、内存耗尽、网络断开。不可控,快速失败 + 告警。
>
> **三张面孔需要三种完全不同的处理策略**。

### 1.1 错误不是"出了问题"

初学者看到 `Error` 就慌张,仿佛程序出了不可饶恕的错误。但真相是:**错误是系统与现实世界交互的必然产物**。

- 用户输入是不可控的——你永远无法预测用户会在表单中填什么
- 网络是不可靠的——分布式系统的第一条定律就是"网络会失败"
- 外部服务是不可信的——第三方 API 的响应格式可能在没有通知的情况下改变
- 硬件是有限的——内存、磁盘、CPU 都可能达到极限

与其恐惧错误,不如**拥抱错误**。好的代码不是"不出错的代码",而是"出错时行为可预测的代码"。

### 1.2 错误处理的三个层次

```
┌─────────────────────────────────────────────────┐
│         第三层:全局兜底 (Safety Net)              │
│    window.onerror / unhandledrejection           │
│    ┌──────────────────────────────────────────┐  │
│    │      第二层:策略选择 (Strategy)            │  │
│    │    抛出 vs 返回 / Fail Fast vs Safe        │  │
│    │    ┌─────────────────────────────────┐    │  │
│    │    │   第一层:检测与分类 (Detection)   │    │  │
│    │    │   Error类型 / 自定义错误 / 类型守卫 │    │  │
│    │    └─────────────────────────────────┘    │  │
│    └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

这三层从内到外构成了完整的错误处理体系。本章将逐层展开。

---

## 2. Error 类型体系

> ⚛️ **The Science: JavaScript 的内置错误家族**
>
> JavaScript 定义了一组**内置错误类型**,每种都有明确的语义。它们不是随意分类的——每种错误对应一种**特定的编程错误模式**。理解它们就像医生理解不同的疾病:名字告诉你病因,病因告诉你治疗方案。

### 2.1 Error 基类

`Error` 是所有错误的基类。它有三个核心属性:

```typescript
const error = new Error('Something went wrong');
console.log(error.message);  // "Something went wrong"
console.log(error.name);     // "Error"
console.log(error.stack);    // 完整调用栈
// ... 完整演示见 examples/01-error-types.ts
```

`stack` 是调试的生命线——它告诉你错误发生在**哪一行代码**,以及调用链是什么。没有 `stack` 的错误日志就像没有地址的求救信。

### 2.2 TypeError

最常见的运行时错误。当操作数或参数的**类型不匹配**时抛出:

```typescript
❌ 常见 TypeError 场景

const user = null;
user.name;          // TypeError: Cannot read properties of null
undefined();        // TypeError: undefined is not a function
const num = 42;
num.toUpperCase();  // TypeError: num.toUpperCase is not a function
```

> 🧠 **CS Master's Bridge**: TypeScript 能在编译期捕获绝大部分 TypeError。这就是类型系统的价值——把运行时错误前移到编译时。

### 2.3 RangeError

当数值**超出有效范围**时抛出:

```typescript
new Array(-1);                    // RangeError: Invalid array length
(1.5).toFixed(200);               // RangeError: toFixed() digits argument must be between 0 and 100
function infinite() { infinite(); } // RangeError: Maximum call stack size exceeded
```

最后一个例子——**栈溢出**——本质上也是 RangeError,因为调用栈的深度超出了引擎允许的范围。

### 2.4 ReferenceError

访问一个**不存在的变量**时抛出:

```typescript
console.log(foo);     // ReferenceError: foo is not defined
// 注意:访问对象上不存在的属性返回 undefined,不是 ReferenceError
const obj = {};
console.log(obj.foo); // undefined (不报错!)
```

> 🧰 **Toolbox**: 区分 `ReferenceError` 和 `undefined` 是面试高频题。变量不存在 → ReferenceError;变量存在但未赋值或属性不存在 → `undefined`。

### 2.5 SyntaxError

代码的**语法不合法**时抛出。注意:大多数 SyntaxError 在**解析阶段**就会被捕获,你甚至无法 try/catch 它们:

```typescript
// 解析期 SyntaxError — 无法被 try/catch 捕获
// eval("function(") → SyntaxError: Unexpected end of input

// 运行期可捕获的 SyntaxError (通过 eval 或 JSON.parse)
try {
  JSON.parse("{invalid json}");
} catch (e) {
  console.log(e instanceof SyntaxError); // true
}
```

> 完整的内置错误类型演示见 [`examples/01-error-types.ts`](./examples/01-error-types.ts)

### 2.6 错误类型速查表

| 错误类型 | 触发条件 | 典型例子 | 修复方向 |
|---------|---------|---------|---------|
| `TypeError` | 类型不匹配 | 读取 null 的属性 | 空值检查 / 类型守卫 |
| `RangeError` | 值超出有效范围 | 数组长度为负、栈溢出 | 输入验证 / 终止条件 |
| `ReferenceError` | 变量不存在 | 使用未声明变量 | 检查拼写 / 声明变量 |
| `SyntaxError` | 语法不合法 | JSON.parse 无效字符串 | 修复语法 / 输入校验 |
| `URIError` | URI 处理错误 | `decodeURI('%')` | 编码前校验 |
| `EvalError` | eval 相关错误 | 历史遗留,现代 JS 几乎不抛 | — |

---

## 3. 自定义错误类

> 🌌 **The Big Picture: 为什么内置错误不够用?**
>
> 内置的 `Error` 家族处理的是**语言层面**的错误——类型错误、语法错误、引用错误。但你的业务逻辑有自己的错误语义:订单超时、余额不足、权限不足、速率限制。你需要**业务错误类型**,它们能携带业务上下文(错误码、HTTP 状态码、用户提示信息)。

### 3.1 基础自定义错误

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    // 修复原型链 (TypeScript 编译到 ES5 时的陷阱)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
// ... 完整实现见 examples/02-custom-errors.ts
```

### 3.2 为什么需要 `Object.setPrototypeOf`?

> 🧠 **CS Master's Bridge: TypeScript 继承 Error 的原型链陷阱**
>
> 当 TypeScript 编译目标是 ES5 时,`class AppError extends Error` 编译后的代码使用 `Error.call(this, message)`,但 `Error` 构造函数**不会正确设置 `this`**——它返回一个新对象而不是修改传入的 `this`。结果是 `instanceof AppError` 返回 `false`。
>
> `Object.setPrototypeOf(this, new.target.prototype)` 手动修复了原型链。在编译目标为 ES6+ 时,原生 `class` 语法不需要这个修复。但作为防御性编程,建议始终加上。

### 3.3 错误类层次设计

```typescript
// 应用错误基类
class AppError extends Error { /* code, statusCode */ }

// 业务错误 (可预期的业务规则违反)
class ValidationError extends AppError { /* field, constraints */ }
class NotFoundError extends AppError { /* resource, id */ }
class ConflictError extends AppError { /* existingId */ }

// 外部依赖错误 (第三方服务故障)
class ExternalServiceError extends AppError { /* service, originalError */ }

// 认证/授权错误
class AuthError extends AppError { /* requiredRole */ }
```

### 3.4 错误码设计

❌ 错误做法:使用魔法字符串

```typescript
if (error.message.includes('not found')) { /* ... */ }
// 如果有人改了 message 文案,逻辑就断了
```

✅ 正确做法:使用结构化错误码

```typescript
enum ErrorCode {
  VALIDATION_FAILED = 'ERR_VALIDATION',
  NOT_FOUND         = 'ERR_NOT_FOUND',
  UNAUTHORIZED      = 'ERR_UNAUTHORIZED',
  RATE_LIMITED       = 'ERR_RATE_LIMITED',
  EXTERNAL_FAILURE   = 'ERR_EXTERNAL',
}
// switch(error.code) 永远不会因为文案修改而失效
```

### 3.5 错误链 (Error Cause)

ES2022 引入了 `cause` 属性,让你可以**链接**错误的上下文:

```typescript
try {
  await database.query(sql);
} catch (dbError) {
  throw new AppError(
    'Failed to fetch user',
    'ERR_DB_QUERY',
    500,
    { cause: dbError } // 保留原始错误
  );
}
// error.cause → 原始的数据库错误
```

这就像医疗档案中的"转诊链"——每一层错误都保留了上一层的完整记录。调试时,你可以沿着 `cause` 链追溯到问题的根源。

> 完整的自定义错误实现见 [`examples/02-custom-errors.ts`](./examples/02-custom-errors.ts)

---

## 4. 同步与异步错误处理

> 🎭 **The Drama: 两个世界的错误**
>
> JavaScript 有两个平行世界:**同步世界**和**异步世界**。同步世界的错误通过 `throw` 抛出,用 `try/catch` 捕获。异步世界的错误通过 `reject` 传播,用 `.catch()` 捕获。`async/await` 的伟大之处在于——它**统一了两个世界**,让你用同一个 `try/catch` 处理所有错误。

### 4.1 同步 try/catch

```typescript
try {
  const result = riskyOperation();
  console.log(result);
} catch (error: unknown) {  // TS 5.0+: catch 参数默认 unknown
  if (error instanceof AppError) {
    handleAppError(error);    // 类型收窄为 AppError
  } else if (error instanceof Error) {
    handleGenericError(error); // 类型收窄为 Error
  } else {
    handleUnknown(error);      // string、number 等
  }
} finally {
  cleanup(); // 无论成功失败都执行
}
```

### 4.2 catch 参数类型:为什么是 `unknown`?

> 🧠 **CS Master's Bridge: JavaScript 的"盲盒" catch**
>
> 在 Java 中,`catch (IOException e)` 的 `e` 类型明确是 `IOException`。但 JavaScript 允许 `throw` 任何值——字符串、数字、对象、甚至 `undefined`。所以 `catch (e)` 中的 `e` 就是一个**盲盒**。
>
> TypeScript 5.0 之前,`e` 默认是 `any`,这意味着你可以直接 `e.message` 而不报错——即使 `e` 是一个数字。TypeScript 5.0+ 允许 `catch (e: unknown)`,强制你先做类型检查再使用。这是**对 JavaScript 历史债务的清算**。

```typescript
// ❌ 危险:假设 error 一定是 Error
catch (error) {
  console.log(error.message); // 如果有人 throw "oops",这里爆炸
}

// ✅ 安全:先检查类型
catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
}
```

### 4.3 Promise 错误处理

```typescript
// Promise 有三种状态: pending → fulfilled / rejected
// rejected 的 Promise 如果没有被 .catch(),会触发 unhandledrejection

fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => renderPosts(posts))
  .catch(error => {
    // 捕获链上任何一步的错误
    console.error('[ERROR]', error);
  });
```

> ⚠️ **陷阱**: `.then()` 的第二个参数 vs `.catch()` 的区别

```typescript
// .then(onFulfilled, onRejected) — onRejected 只捕获前面的错误
// .catch(onRejected) — 捕获链上所有之前的错误

promise.then(
  result => { throw new Error('oops'); },
  error => { /* 不会捕获上面那行的错误! */ }
);

// 用 .catch() 代替
promise
  .then(result => { throw new Error('oops'); })
  .catch(error => { /* 能捕获上面 then 中的错误 */ });
```

### 4.4 async/await:统一的错误处理模型

```typescript
async function getUserPosts(userId: number) {
  try {
    const user = await fetchUser(userId);    // 可能 reject
    const posts = await fetchPosts(user.id); // 可能 reject
    return posts;
  } catch (error: unknown) {
    // 同一个 catch 处理所有异步错误
    if (error instanceof NotFoundError) {
      return [];  // 用户不存在,返回空列表
    }
    throw error;  // 其他错误继续向上抛
  }
}
```

`async/await` 让异步代码的错误处理和同步代码**完全一致**。这是 JavaScript 错误处理模型演进的终点:callback(err) → Promise.catch() → try/catch with await。

### 4.5 Promise 组合的错误行为

| 方法 | 成功条件 | 失败条件 | 错误行为 |
|-----|---------|---------|---------|
| `Promise.all` | 所有成功 | 任一失败 | **Fail Fast**: 第一个 reject 立即结束 |
| `Promise.allSettled` | — (总是 fulfilled) | — | **不会 reject**: 返回所有结果(含失败) |
| `Promise.race` | 第一个 settle 成功 | 第一个 settle 失败 | 取决于谁先完成 |
| `Promise.any` | 任一成功 | 所有失败 | 所有都 reject 才抛 AggregateError |

```typescript
// Promise.allSettled — 需要所有结果(无论成败)时使用
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(999), // 不存在,会 reject
  fetchUser(3),
]);
// results: [
//   { status: 'fulfilled', value: user1 },
//   { status: 'rejected', reason: Error('not found') },
//   { status: 'fulfilled', value: user3 },
// ]
```

> 完整的异步错误处理演示见 [`examples/03-async-error-handling.ts`](./examples/03-async-error-handling.ts)

---

## 5. 全局错误兜底

> 🌌 **The Big Picture: 安全网,不是主防线**
>
> 全局错误处理是你的**最后一道防线**——就像体操运动员下面的安全网。你不应该依赖它(那说明你的代码有未处理的错误路径),但你必须有它(因为 Bug 总会存在)。全局兜底的职责不是"修复错误",而是**记录现场、通知团队、优雅降级**。

### 5.1 浏览器环境

#### window.onerror — 同步错误的全局捕获

```typescript
window.onerror = (message, source, lineno, colno, error) => {
  reportToServer({
    type: 'uncaught_error',
    message, source, lineno, colno,
    stack: error?.stack,
  });
  return true; // 阻止默认的控制台错误输出
};
```

#### window.onunhandledrejection — 未处理的 Promise rejection

```typescript
window.addEventListener('unhandledrejection', (event) => {
  console.error('[CRITICAL] Unhandled rejection:', event.reason);
  reportToServer({
    type: 'unhandled_rejection',
    reason: event.reason,
  });
  event.preventDefault(); // 阻止默认控制台警告
});
```

### 5.2 Node.js 环境

```typescript
// 未捕获的同步异常
process.on('uncaughtException', (error, origin) => {
  logger.fatal({ error, origin }, 'Uncaught exception');
  // 记录完日志后退出进程 (重要!)
  process.exit(1);
});

// 未处理的 Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason }, 'Unhandled rejection');
  // Node.js 15+ 默认会终止进程
});
```

> ⚠️ **关键警告**: `uncaughtException` 触发后,进程可能处于**不一致状态**。官方文档明确建议:**记录日志后立即退出进程**,由进程管理器(PM2、Docker、K8s)负责重启。不要试图"吞掉"异常继续运行——那会导致数据损坏。

### 5.3 框架级错误边界

```typescript
// React Error Boundary (类组件)
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    reportToServer({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />;  // 显示友好的备用界面
    }
    return this.props.children;
  }
}
```

> 完整的全局错误处理演示见 [`examples/04-global-error-handlers.ts`](./examples/04-global-error-handlers.ts)

---

## 6. 错误处理策略

> 🎭 **The Drama: Fail Fast vs Fail Safe — 核电站与航空电子**
>
> 核电站的设计原则是 **Fail Safe**——出错时自动关闭反应堆,进入安全状态。宁可停工,不可泄漏。
>
> 航空电子的设计原则是 **Fail Operational**——出错时切换到备用系统,继续飞行。因为在 30000 英尺高空,停机不是选项。
>
> 你的代码中:
> - **API 接口**应该 Fail Fast——参数非法就立刻 400,不要带着脏数据走完整条链路
> - **UI 界面**应该 Fail Safe——后端挂了就显示缓存数据或友好提示,不要白屏

### 6.1 抛出 (throw) vs 返回 (return)

这是错误处理中最根本的设计决策:

```
错误发生了,怎么告诉调用者?

方案 A: throw new Error('...')
  → 调用者必须 try/catch,否则程序崩溃
  → 强制处理,但容易被遗漏

方案 B: return { ok: false, error: '...' }
  → 调用者必须检查返回值,编译器可以强制
  → 不会崩溃,但可能被忽略
```

| 策略 | 适用场景 | 语言/框架 |
|-----|---------|----------|
| throw 异常 | 不可恢复的错误 (Bug, 系统故障) | Java, C#, JavaScript |
| 返回错误值 | 可恢复的业务错误 | Go (`err`), Rust (`Result<T,E>`) |
| 混合策略 | 两者结合 | TypeScript (推荐) |

### 6.2 Result 模式

> ⚛️ **The Science: Go 的"错误即值"哲学在 TypeScript 中的化身**
>
> Go 不用 try/catch,它返回 `(value, error)` 元组。Rust 用 `Result<T, E>` 枚举。在 TypeScript 中,你可以用**可区分联合 (Discriminated Union)** 实现类似模式。这种方式的好处是:**错误不会被意外忽略**——你必须检查 `ok` 字段才能拿到 `data`,编译器强制你处理错误路径。

```typescript
// Result 类型定义
type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// 使用
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: 'Division by zero' };
  return { ok: true, data: a / b };
}

const result = divide(10, 0);
if (result.ok) {
  console.log(result.data);  // TS 知道这里有 data
} else {
  console.log(result.error); // TS 知道这里有 error
}
// ... 完整实现见 examples/05-error-strategies.ts
```

### 6.3 tryCatch 工具函数

将 try/catch 包装为 Result 模式:

```typescript
async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
// const result = await tryCatch(() => fetchUser(123));
```

### 6.4 何时用 throw,何时用 Result?

```
┌─────────────────────┐
│  这个错误可恢复吗?    │
└──────┬──────────────┘
       │
   ┌───▼───┐     ┌───────────────────────────────┐
   │  是   │────→│ 用 Result 模式返回错误          │
   │       │     │ 调用者决定如何处理               │
   └───────┘     └───────────────────────────────┘
       │
   ┌───▼───┐     ┌───────────────────────────────┐
   │  否   │────→│ 用 throw 抛出错误               │
   │       │     │ 让错误冒泡到全局兜底层           │
   └───────┘     └───────────────────────────────┘
```

**实践建议**:
- **函数库 / 工具函数**: 优先 Result 模式(调用者有最多上下文来决定如何处理)
- **业务服务层**: 混合使用(业务错误用 Result,系统错误用 throw)
- **控制器 / 入口层**: 用 try/catch 做统一的错误转换(转为 HTTP 响应)

### 6.5 Fail Fast 实践:输入验证

```typescript
function createUser(input: unknown): User {
  // 第一道防线:类型检查 (Fail Fast)
  if (!isObject(input)) throw new ValidationError('Input must be an object');
  if (typeof input.email !== 'string') throw new ValidationError('Email required');
  if (!isValidEmail(input.email)) throw new ValidationError('Invalid email format');

  // 通过验证后的代码可以放心使用,无需防御性编程
  return { id: generateId(), email: input.email, createdAt: new Date() };
}
```

Fail Fast 的好处:**早发现、早报错、错误离发生点越近越容易定位**。在链路入口处验证,比在链路中间某个深层函数里 `Cannot read property 'email' of undefined` 好一万倍。

> 完整的错误策略演示见 [`examples/05-error-strategies.ts`](./examples/05-error-strategies.ts)

---

## 7. 结构化错误日志

> 🌌 **The Big Picture: 可观测性设计**
>
> 错误发生时你需要回答四个问题:
> 1. **什么**出错了?(错误类型、消息)
> 2. **哪里**出错了?(调用栈、文件行号)
> 3. **谁**触发的?(用户ID、请求ID)
> 4. **上下文**是什么?(输入参数、系统状态)
>
> 一个好的错误日志应该让你不需要 Debugger 就能**还原事故现场**。

### 7.1 错误日志的反模式

❌ 无用的错误日志:

```typescript
try { /* ... */ }
catch (e) {
  console.log('Error occurred');  // 完全没有有用信息
}
```

❌ 不安全的错误日志:

```typescript
catch (e) {
  // 泄露敏感信息到日志
  console.log('Login failed:', { password: input.password, token: session.token });
}
```

### 7.2 结构化错误信息

✅ 好的错误日志:

```typescript
function logError(error: unknown, context: Record<string, unknown>) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    name: error instanceof Error ? error.name : 'UnknownError',
    message: error instanceof Error ? error.message : String(error),
    code: error instanceof AppError ? error.code : undefined,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,  // requestId, userId, action 等
  };
  console.error(JSON.stringify(errorInfo));
}
// ... 完整实现见 examples/05-error-strategies.ts
```

### 7.3 敏感信息过滤

```typescript
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie'];

function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
```

### 7.4 错误上下文传播

在分层架构中,每一层都应该**增加上下文**而不是**吞掉上下文**:

```
Controller 层:
  + requestId, userId, httpMethod, path

    Service 层:
      + operation, input params

        Repository 层:
          + query, tableName

            ↑ 原始错误发生: "connection refused"
```

每一层 catch 住错误后,添加自己的上下文信息,然后向上抛。最终,顶层的错误日志包含了**完整的调用链路上下文**。

---

## 8. 🧘 Zen of Code: 与错误共处

> **"The bug is not in the code. The bug is in the assumption."**
>
> 大多数错误不是"代码写错了",而是"假设错了"。你假设 API 总是返回 200,假设用户输入总是合法,假设网络总是通的。**成熟的程序员不是不犯错的人,而是假设一切都会出错的人**。
>
> 错误处理不是编程的"防御部分"——它**就是编程本身**。一个函数如果不考虑失败路径,它就只完成了一半。
>
> 拥抱这个事实:你的代码终将面对混乱的现实世界。而你能做的,就是让它在混乱中保持**可预测**。

---

## 9. 最佳实践与常见陷阱

### ✅ 最佳实践

#### 1. 使用 `unknown` 而非 `any` 作为 catch 参数类型

```typescript
// ✅ 安全:强制类型检查
catch (error: unknown) {
  if (error instanceof Error) { /* ... */ }
}

// ❌ 危险:跳过类型检查
catch (error: any) {
  console.log(error.message); // error 可能不是 Error
}
```

#### 2. 永远不要吞掉错误 (Silent Catch)

```typescript
// ❌ 灾难:错误被吞掉,出了问题你永远不知道
try { riskyOperation(); }
catch (e) { /* 什么都不做 */ }

// ✅ 至少记录日志
try { riskyOperation(); }
catch (e) { logger.warn('riskyOperation failed', { error: e }); }
```

#### 3. 不要在 catch 中只记录不处理

```typescript
// ❌ 半吊子:记了日志但没有恢复逻辑
catch (error) {
  console.error(error);
  // 然后呢?调用者以为成功了
}

// ✅ 记录 + 恢复 或 记录 + 重新抛出
catch (error) {
  logger.error(error);
  throw error;  // 或 return fallbackValue;
}
```

#### 4. 区分可恢复错误和不可恢复错误

```typescript
// 可恢复:提供降级方案
async function getConfig(): Promise<Config> {
  try {
    return await fetchRemoteConfig();
  } catch {
    logger.warn('Remote config unavailable, using defaults');
    return DEFAULT_CONFIG; // 降级到默认配置
  }
}

// 不可恢复:快速失败
function connectDatabase(url: string): Connection {
  if (!url) throw new Error('Database URL is required');
  // 没有数据库连接,应用不应该启动
}
```

#### 5. 使用 Error Cause 链接上下文

```typescript
// ✅ 保留原始错误作为 cause
catch (dbError) {
  throw new AppError('User creation failed', 'ERR_USER_CREATE', 500, {
    cause: dbError,
  });
}
```

### ❌ 常见陷阱

#### 陷阱 1: throw 非 Error 对象

```typescript
// ❌ 抛出字符串:丢失调用栈
throw 'something went wrong';
// catch(e) { e.stack }  → undefined

// ✅ 始终抛出 Error 实例
throw new Error('something went wrong');
```

#### 陷阱 2: 忘记 await 导致错误逃逸

```typescript
// ❌ 忘记 await,try/catch 捕获不到异步错误
try {
  fetchData();  // 没有 await!
} catch (error) {
  // 永远不会执行
}

// ✅ 记得 await
try {
  await fetchData();
} catch (error) {
  // 正确捕获
}
```

#### 陷阱 3: catch 后忘记 return 或 throw

```typescript
// ❌ catch 后代码继续执行,使用未定义的变量
let data;
try {
  data = await fetchData();
} catch (error) {
  console.error(error);
  // 忘记 return 或 throw!
}
process(data); // data 是 undefined,又一个 TypeError

// ✅ catch 后明确控制流
try {
  data = await fetchData();
} catch (error) {
  console.error(error);
  return; // 或 throw error;
}
process(data); // 只有成功时才执行
```

#### 陷阱 4: finally 中的 return 覆盖 try 中的 return

```typescript
// ❌ finally 中的 return 会覆盖 try 和 catch 中的 return/throw
function getNumber(): number {
  try {
    return 1;
  } finally {
    return 2; // 覆盖了 try 中的 return 1!
  }
}
console.log(getNumber()); // 2, 不是 1!
// finally 中永远不要 return
```

#### 陷阱 5: 循环中的 try/catch 位置

```typescript
// ❌ try/catch 在循环内部:一个错误中断当前迭代但继续循环
for (const item of items) {
  try { process(item); }
  catch (e) { /* 吞掉错误,继续处理下一个 */ }
}

// ✅ 根据需求选择策略
// 策略A: 一个错误就全部中止 (Fail Fast)
try {
  for (const item of items) { process(item); }
} catch (e) { /* 全部回滚 */ }

// 策略B: 收集所有错误,最后统一处理
const errors: Error[] = [];
for (const item of items) {
  try { process(item); }
  catch (e) { errors.push(e instanceof Error ? e : new Error(String(e))); }
}
if (errors.length > 0) reportErrors(errors);
```

---

## 10. 章节练习

### 练习 1: 自定义错误体系

**难度**: ⭐⭐
**涉及知识点**: 自定义Error类、错误码、instanceof

**题目描述**:
为一个"用户注册"场景设计完整的错误类型体系。

**要求**:
1. 创建 `AppError` 基类(含 code, statusCode)
2. 创建 `ValidationError`(含 field, constraint)
3. 创建 `DuplicateError`(含 existingId)
4. 每个错误类的 `instanceof` 检查都能正确工作
5. 编写一个 `registerUser` 函数,对不同输入抛出不同错误

**提示**: 别忘了 `Object.setPrototypeOf` 和 `name` 属性设置。

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `examples/02-custom-errors.ts`

核心思路:继承 Error 基类,在构造函数中修复原型链,设计枚举化的错误码,通过 `instanceof` 在 catch 中做类型分发。

</details>

### 练习 2: 实现 Result 模式

**难度**: ⭐⭐⭐
**涉及知识点**: 可区分联合、泛型、类型收窄

**题目描述**:
实现一个类型安全的 `Result<T, E>` 类型和配套的工具函数。

**要求**:
1. 定义 `Result<T, E>` 类型(可区分联合)
2. 实现 `Ok<T>(data: T)` 和 `Err<E>(error: E)` 构造函数
3. 实现 `tryCatch` 将 try/catch 转为 Result
4. 实现 `map` 和 `flatMap` 方法,支持 Result 的链式转换
5. TypeScript 能正确推断 `ok` 为 `true` 时 `data` 存在

**提示**: 利用 TypeScript 的类型收窄(Type Narrowing)——当你检查 `result.ok === true` 后,TS 自动知道 `result.data` 可用。

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `examples/05-error-strategies.ts`

核心思路:

```typescript
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };
function Ok<T>(data: T): Result<T, never> { return { ok: true, data }; }
function Err<E>(error: E): Result<never, E> { return { ok: false, error }; }
```

`Ok` 返回 `Result<T, never>`,`Err` 返回 `Result<never, E>`,这让 TypeScript 能正确推断联合类型。

</details>

### 练习 3: 全链路错误处理

**难度**: ⭐⭐⭐⭐
**涉及知识点**: 异步错误、错误链、结构化日志、全局兜底

**题目描述**:
实现一个模拟的"订单处理系统",包含完整的错误处理链路。

**要求**:
1. 模拟三层架构:Controller → Service → Repository
2. Repository 层模拟数据库错误(随机失败)
3. Service 层捕获 Repository 错误,添加业务上下文后重新包装抛出
4. Controller 层做最终的错误转换(转为 HTTP 响应格式)
5. 添加全局的 `unhandledRejection` 兜底处理
6. 所有错误日志包含 `requestId`、`timestamp`、`stack`

**提示**: 使用 ES2022 的 `{ cause }` 选项链接每一层的错误,最终能从顶层错误追溯到底层原因。

<details>
<summary>💡 参考答案</summary>

> 综合参考 `examples/02-custom-errors.ts` + `examples/03-async-error-handling.ts` + `examples/04-global-error-handlers.ts`

核心思路:每一层 catch 后用 `new AppError(message, code, statusCode, { cause: originalError })` 包装,最终在 Controller 层用 `formatErrorResponse(error)` 转为 `{ status, code, message }` 的 HTTP 响应。

</details>

---

## 章节间连接

| 向前连接 | 向后连接 |
|---------|---------|
| Stage 1 Ch04 异步基础(Promise 错误处理的入门) | Stage 3 Ch04 架构最佳实践(错误边界、防御性编程) |
| Stage 2 Ch01 TS 基础(类型收窄、自定义类) | Stage Modern Frontend Ch05 tRPC(类型安全的错误传播) |
| Stage 2 Ch05 可观测性(日志、追踪) | Stage 4 Ch04 可靠性工程(熔断、降级) |

---

> **下一章**: [09-正则表达式](../09-regexp/) — 当字符串匹配需要超能力时
>
> **上一章**: [07-React 基础](../07-react-basics/) — 声明式 UI 与组件思维
