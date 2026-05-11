# ts-toolkit — TypeScript 实用工具库

> *"A library is a collection of implementations of behavior, written in terms of a language, that has a well-defined interface by which the behavior is invoked."*
> — Bjarne Stroustrup

一个轻量级 TypeScript 实用工具库，综合运用 JS/TS 核心深化学习阶段的所有知识点：原型链、错误处理、正则表达式、Proxy/Reflect、函数式编程、TypeScript 高级类型。

---

## 📋 目录

- [项目目标](#项目目标)
- [架构设计](#架构设计)
- [快速开始](#快速开始)
- [模块详解](#模块详解)
  - [Result — 函数式错误处理](#result--函数式错误处理)
  - [Validate — Proxy 验证器](#validate--proxy-验证器)
  - [FP — 函数式编程工具](#fp--函数式编程工具)
  - [Type Utils — 品牌类型与工具类型](#type-utils--品牌类型与工具类型)
  - [Event Emitter — 类型安全事件系统](#event-emitter--类型安全事件系统)
  - [Task Runner — 并发控制](#task-runner--并发控制)
- [实施步骤](#实施步骤)
- [测试策略](#测试策略)
- [构建与发布](#构建与发布)
- [最佳实践](#最佳实践)
- [常见陷阱](#常见陷阱)
- [扩展阅读](#扩展阅读)

---

## 项目目标

### 学习目标

ts-toolkit 是一个**教学型项目**，旨在通过构建真实工具库来综合运用以下知识：

| 知识点 | 应用模块 |
|--------|----------|
| **TypeScript 严格模式** | 全项目 `strict: true` |
| **函数式错误处理** (Result/Either) | `result` 模块 |
| **Proxy 元编程** | `validate` 模块 |
| **正则表达式** | `validate/patterns` |
| **函数组合 (pipe/compose)** | `fp` 模块 |
| **柯里化与记忆化** | `fp` 模块 |
| **品牌类型 (Branded Types)** | `type-utils` 模块 |
| **高级类型 (DeepReadonly/Prettify)** | `type-utils` 模块 |
| **泛型事件系统** | `event-emitter` 模块 |
| **并发控制 (Promise 池)** | `task-runner` 模块 |
| **Worker 池设计** | `task-runner` 模块 |
| **ESM 模块化 + exports** | `package.json` 配置 |

### 工程目标

1. **深模块原则** — 接口简单，实现复杂
2. **零依赖** — 不依赖第三方运行时库
3. **类型完备** — 100% TypeScript，完整类型推断
4. **文档先行** — 每个函数包含 JSDoc + 使用示例
5. **可测试** — 纯函数设计，自带断言测试

---

## 架构设计

### 模块依赖关系

```
              @learn/ts-toolkit (index.ts)
                       │
      ┌────────────────┼────────────────┐
      │                │                │
   result          validate            fp
  (Result<T,E>)  (Proxy验证器)    (pipe/curry/memo)
      │                │                │
      │          type-utils      event-emitter
      │        (Brand/DeepRO)    (类型安全事件)
      │                │                │
      └────────────────┼────────────────┘
                       │
                  task-runner
              (TaskQueue/WorkerPool)
```

**设计规则**：
- ✅ **单向依赖** — 无循环引用
- ✅ **低耦合** — 各模块可独立使用
- ✅ **高内聚** — 每个模块只关注一个核心职责

### 目录结构

```
ts-toolkit/
├── src/
│   ├── index.ts              # 统一导出
│   ├── result/
│   │   ├── result.ts         # Ok/Err/tryCatch/map/flatMap
│   │   └── result.test.ts    # 测试
│   ├── validate/
│   │   ├── validator.ts      # createValidator (Proxy)
│   │   ├── patterns.ts       # 常用正则表达式
│   │   └── validator.test.ts # 测试
│   ├── fp/
│   │   ├── compose.ts        # pipe/compose
│   │   ├── curry.ts          # curry/partial
│   │   ├── memoize.ts        # memoize/memoizeTTL
│   │   └── fp.test.ts        # 测试
│   ├── type-utils/
│   │   ├── brand.ts          # Brand<T,B> 品牌类型
│   │   └── deep-readonly.ts  # DeepReadonly/Prettify 等
│   ├── event-emitter/
│   │   ├── emitter.ts        # EventEmitter<Events>
│   │   └── emitter.test.ts   # 测试
│   └── task-runner/
│       ├── task-queue.ts      # TaskQueue/pLimit/retry
│       └── worker-pool.ts     # WorkerPool/parallel
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md                  # 本文档
```

---

## 快速开始

### 安装依赖

```bash
cd learning-plan/stage-3-advanced/projects/ts-toolkit
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 类型检查
npm run typecheck
```

### 构建

```bash
npm run build
```

### 基本使用

```typescript
import {
  ok, err, tryCatch,
  createValidator, Patterns,
  pipe, curry, memoize,
  EventEmitter,
  TaskQueue,
} from '@learn/ts-toolkit';

// Result: 函数式错误处理
const safeJSON = tryCatch((s: string) => JSON.parse(s));
const r = safeJSON('{"a":1}');
if (r.ok) console.log(r.value); // { a: 1 }

// Pipe: 数据管道
const transform = pipe(
  (x: number) => x * 2,
  (x) => x + 10,
  (x) => `Result: ${x}`,
);
console.log(transform(5)); // "Result: 20"
```

---

## 模块详解

---

### Result — 函数式错误处理

#### 核心思想

Result 模式来自 Rust/Go/Haskell，核心思想是**将错误作为值返回，而不是抛出异常**。

```typescript
// 传统方式: 隐式错误，调用者容易忘记 try/catch
function parseJSON(text: string): unknown {
  return JSON.parse(text); // 可能抛异常
}

// Result 方式: 显式错误，编译器强制处理
const parseJSON = tryCatch((s: string) => JSON.parse(s));
const result = parseJSON(input);
if (result.ok) {
  console.log(result.value);  // 编译器知道这里有值
} else {
  console.error(result.error); // 编译器知道这里有错误
}
```

#### API

| 函数 | 签名 | 说明 |
|------|------|------|
| `ok(value)` | `<T>(value: T) => Ok<T>` | 创建成功 Result |
| `err(error)` | `<E>(error: E) => Err<E>` | 创建失败 Result |
| `tryCatch(fn)` | `<A,T>(fn) => (...args) => Result<T,Error>` | 包装同步函数 |
| `tryCatchAsync(fn)` | `<A,T>(fn) => (...args) => Promise<Result<T,Error>>` | 包装异步函数 |
| `map(result, fn)` | `<T,U,E>(r, fn) => Result<U,E>` | 映射成功值 |
| `flatMap(result, fn)` | `<T,U,E>(r, fn) => Result<U,E>` | 链式操作 |
| `mapErr(result, fn)` | `<T,E,F>(r, fn) => Result<T,F>` | 映射错误值 |
| `unwrapOr(result, default)` | `<T,E>(r, d) => T` | 提供默认值 |
| `unwrap(result)` | `<T,E>(r) => T` | 强制取值 (可能抛出) |
| `isOk(result)` | `<T,E>(r) => r is Ok<T>` | 类型守卫 |
| `isErr(result)` | `<T,E>(r) => r is Err<E>` | 类型守卫 |
| `all(results)` | `<T,E>(rs) => Result<T[],E>` | 合并多个 Result |

#### 使用示例

**替代 try/catch:**

```typescript
import { tryCatch, flatMap } from '@learn/ts-toolkit';

const readFile = tryCatch((path: string) =>
  fs.readFileSync(path, 'utf-8')
);
const parseJSON = tryCatch((text: string) =>
  JSON.parse(text) as Config
);

function loadConfig(path: string) {
  return flatMap(readFile(path), (text) => parseJSON(text));
}

const config = loadConfig('./config.json');
if (config.ok) {
  console.log('Config loaded:', config.value);
} else {
  console.error('Failed:', config.error.message);
}
```

**表单验证管道:**

```typescript
import { ok, err, flatMap, type Result } from '@learn/ts-toolkit';

const validateEmail = (email: string): Result<string, string> =>
  /^[\w.-]+@/.test(email) ? ok(email) : err('Invalid email');

const validateLength = (min: number) => (s: string): Result<string, string> =>
  s.length >= min ? ok(s) : err(`Too short (min ${min})`);

const result = flatMap(
  validateEmail(input),
  validateLength(5)
);
```

---

### Validate — Proxy 验证器

#### 核心思想

使用 ES6 Proxy 拦截属性赋值，在运行时实施类型检查和业务规则验证。

```typescript
// Proxy 的 set trap 拦截每次 obj.prop = value
const validated = new Proxy(data, {
  set(target, prop, value) {
    // 在赋值前执行验证逻辑
    if (!isValid(value)) throw new ValidationError(prop, '...');
    target[prop] = value;
    return true;
  }
});
```

#### API

| 函数 | 说明 |
|------|------|
| `createValidator<T>(schema, options?)` | 创建 Proxy 验证器 |
| `createReadonly<T>(obj)` | 创建只读 Proxy |
| `createTracked<T>(obj)` | 创建变更追踪 Proxy |

**Schema 配置:**

```typescript
interface FieldSchema {
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  min?: number;       // 字符串长度 / 数字下限 / 数组长度
  max?: number;       // 字符串长度 / 数字上限 / 数组长度
  pattern?: RegExp;   // 正则匹配
  custom?: ValidationRule[];  // 自定义规则
}
```

#### 使用示例

```typescript
import { createValidator, Patterns } from '@learn/ts-toolkit';

interface User {
  name: string;
  age: number;
  email: string;
}

const validateUser = createValidator<User>({
  name:  { type: 'string', required: true, min: 2, max: 50 },
  age:   { type: 'number', min: 0, max: 120 },
  email: { type: 'string', required: true, pattern: Patterns.email },
});

const user = validateUser({
  name: 'Alice', age: 25, email: 'alice@example.com'
});

user.age = 26;      // ✅ 通过
user.age = -1;      // ❌ throws ValidationError
user.email = 'bad'; // ❌ throws ValidationError
```

#### 常用正则模式

`Patterns` 对象包含 20+ 个验证正则：

| 名称 | 用途 |
|------|------|
| `email` | 邮箱地址 |
| `phoneChina` | 中国手机号 |
| `url` | HTTP/HTTPS URL |
| `ipv4` | IPv4 地址 |
| `dateISO` | YYYY-MM-DD 日期 |
| `time24` | HH:MM:SS 时间 |
| `hexColor` | #RGB / #RRGGBB |
| `username` | 3-16位字母数字 |
| `passwordStrong` | 强密码 (大小写+数字) |
| `chinese` | 中文字符 |
| `idCardChina` | 身份证号 |

---

### FP — 函数式编程工具

#### 核心思想

函数式编程的三大支柱：
1. **纯函数** — 相同输入 → 相同输出，无副作用
2. **函数组合** — 小函数 → 组合成 → 复杂函数
3. **不可变数据** — 永远返回新数据，不修改原数据

#### API

**函数组合:**

| 函数 | 执行方向 | 示例 |
|------|---------|------|
| `pipe(...fns)` | 左→右 | `pipe(f, g, h)(x) = h(g(f(x)))` |
| `compose(...fns)` | 右→左 | `compose(f, g, h)(x) = f(g(h(x)))` |
| `pipeTyped(...)` | 左→右 (异构类型) | 支持不同输入输出类型 |
| `pipeAsync(...)` | 左→右 (异步) | 每步 await |

**柯里化:**

| 函数 | 说明 |
|------|------|
| `curry(fn)` | 柯里化: `f(a,b,c)` → `f(a)(b)(c)` |
| `partial(fn, ...args)` | 偏应用: 固定前 N 个参数 |
| `partialRight(fn, ...args)` | 右偏应用: 固定后 N 个参数 |

**记忆化:**

| 函数 | 缓存策略 |
|------|---------|
| `memoize(fn, options?)` | LRU 缓存 (maxSize) |
| `memoizeTTL(fn, ttl)` | 时间过期缓存 |
| `memoizeWeak(fn)` | WeakMap 缓存 (对象参数, 自动 GC) |

#### 使用示例

**数据管道:**

```typescript
import { pipe } from '@learn/ts-toolkit';

const process = pipe(
  (users: User[]) => users.filter(u => u.active),
  (users) => users.filter(u => u.age >= 18),
  (users) => users.map(u => u.name.toUpperCase()),
);

const names = process(allUsers);
```

**柯里化复用:**

```typescript
import { curry } from '@learn/ts-toolkit';

const multiply = curry((a: number, b: number) => a * b);
const double = multiply(2);
const triple = multiply(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

**记忆化缓存:**

```typescript
import { memoize } from '@learn/ts-toolkit';

let calls = 0;
const fib = memoize((n: number): number => {
  calls++;
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

fib(40);         // 计算
calls = 0;
fib(40);         // 从缓存, calls === 0
```

---

### Type Utils — 品牌类型与工具类型

#### Brand — 品牌类型

**问题:** TypeScript 是结构化类型系统，`string` 就是 `string`，无法区分 `UserId` 和 `OrderId`。

**解法:** 给 `string` 添加编译时品牌标记，运行时零开销。

```typescript
import { type Brand, brand } from '@learn/ts-toolkit';

type UserId  = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

const createUserId = brand<UserId>((v) => {
  if (typeof v !== 'string' || !v) throw new Error('Invalid');
  return v;
});

const uid = createUserId('user-1');
const oid = createOrderId('order-1');

getUser(uid);  // ✅
getUser(oid);  // ❌ 类型错误!
```

**内置品牌类型:** `PositiveInt`, `Percentage`, `MoneyInCents`, `NonEmptyString`, `EmailBrand`, `URLBrand`, `ISODateString`, `Timestamp`, `UserId`, `OrderId`, `ProductId`

#### 工具类型

| 类型 | 说明 |
|------|------|
| `DeepReadonly<T>` | 递归只读 |
| `DeepMutable<T>` | 递归移除 readonly |
| `DeepPartial<T>` | 递归可选 |
| `DeepRequired<T>` | 递归必选 |
| `Prettify<T>` | 展开交叉类型 (IDE 可读) |
| `PickByType<T, V>` | 提取值为 V 类型的属性 |
| `OmitByType<T, V>` | 排除值为 V 类型的属性 |
| `OptionalKeys<T>` | 提取可选键名 |
| `RequiredKeys<T>` | 提取必选键名 |
| `MutableKeys<T>` | 提取可变键名 |
| `ReadonlyKeys<T>` | 提取只读键名 |
| `UnionToIntersection<U>` | 联合 → 交叉 |
| `TupleToUnion<T>` | 元组 → 联合 |
| `Nullable<T>` | `T \| null \| undefined` |
| `AwaitedType<T>` | 提取 Promise 内部类型 |

---

### Event Emitter — 类型安全事件系统

#### 核心思想

传统 EventEmitter 是类型不安全的。ts-toolkit 的 EventEmitter 用泛型约束事件名和参数类型。

```typescript
// ❌ Node.js EventEmitter — 事件名拼错不报错
emitter.on('user:loginn', (data: any) => { ... });

// ✅ ts-toolkit EventEmitter — 编译时检查
type Events = {
  'user:login': { userId: string; timestamp: number };
};
const emitter = new EventEmitter<Events>();
emitter.on('user:loginn', ...); // ❌ 编译错误!
```

#### API

| 方法 | 说明 |
|------|------|
| `on(event, listener)` | 注册监听器 |
| `once(event, listener)` | 注册一次性监听器 |
| `off(event, listener)` | 移除监听器 |
| `emit(event, data)` | 触发事件 |
| `removeAllListeners(event?)` | 移除所有监听器 |
| `listenerCount(event)` | 获取监听器数量 |
| `eventNames()` | 获取所有事件名 |

**工具函数:**

| 函数 | 说明 |
|------|------|
| `onceAsync(emitter, event, timeout?)` | 事件 → Promise |
| `eventStream(emitter, event)` | 事件 → AsyncIterator |

#### 使用示例

```typescript
import { EventEmitter, onceAsync } from '@learn/ts-toolkit';

type OrderEvents = {
  'order:created': { orderId: string; total: number };
  'order:paid':    { orderId: string; paymentId: string };
};

const bus = new EventEmitter<OrderEvents>();

bus.on('order:created', (data) => {
  console.log(`新订单 ${data.orderId}, 金额 ${data.total}`);
});

bus.emit('order:created', {
  orderId: 'ord-001', total: 9999,
});

// Promise 风格等待
const paid = await onceAsync(bus, 'order:paid', 30000);
console.log(`订单已支付: ${paid.paymentId}`);
```

---

### Task Runner — 并发控制

#### 核心思想

JavaScript 单线程但可异步并发。task-runner 提供：
- **Promise 并发控制** — TaskQueue / pLimit
- **重试机制** — retry (指数退避)
- **批处理** — batch
- **频率控制** — throttle / debounce
- **Worker 池** — WorkerPool (浏览器多线程)

#### API

**TaskQueue:**

```typescript
import { TaskQueue } from '@learn/ts-toolkit';

const queue = new TaskQueue({ concurrency: 3, timeout: 5000 });

queue.add(async () => fetch('/api/1'));
queue.add(async () => fetch('/api/2'));

await queue.onIdle();
console.log('所有任务完成');
```

**pLimit:**

```typescript
import { pLimit } from '@learn/ts-toolkit';

const tasks = urls.map(url => () => fetch(url));
const results = await pLimit(tasks, 5); // 最多 5 个并发
```

**retry:**

```typescript
import { retry } from '@learn/ts-toolkit';

const data = await retry(
  async () => {
    const r = await fetch(apiUrl);
    if (!r.ok) throw new Error('Failed');
    return r.json();
  },
  {
    retries: 3,
    delay: 1000,  // 指数退避: 1s, 2s, 4s
    onRetry: (err, attempt) => {
      console.log(`重试 #${attempt}: ${err.message}`);
    },
  }
);
```

**batch:**

```typescript
import { batch } from '@learn/ts-toolkit';

const results = await batch(
  [1, 2, 3, 4, 5, 6, 7, 8],
  3,
  async (chunk) => chunk.map(x => x * 2),
);
// [2, 4, 6, 8, 10, 12, 14, 16]
```

**throttle / debounce:**

```typescript
import { throttle, debounce } from '@learn/ts-toolkit';

// 节流: 每 1s 最多执行一次
const throttled = throttle(handleScroll, 1000);

// 防抖: 停止输入 500ms 后执行
const debounced = debounce(handleSearch, 500);
```

**WorkerPool (浏览器):**

```typescript
import { WorkerPool } from '@learn/ts-toolkit';

const pool = new WorkerPool('/worker.js', { size: 4 });
const result = await pool.exec({ n: 1000000 });
pool.terminate();
```

---

## 实施步骤

建议按以下顺序开发，每完成一个模块立即编写测试：

### Phase 1: 基础模块 (第 1-2 天)

| Step | 模块 | 为什么先做 |
|------|------|-----------|
| 1 | `result` | 最简单，无依赖，其他模块可能用到 |
| 2 | `type-utils` | 纯类型，品牌类型可被其他模块使用 |

### Phase 2: 核心工具 (第 3-5 天)

| Step | 模块 | 为什么 |
|------|------|--------|
| 3 | `fp` | pipe/curry/memoize 是后续模块的基础工具 |
| 4 | `validate` | 综合 Proxy + 正则，中等复杂度 |

### Phase 3: 高级模块 (第 6-8 天)

| Step | 模块 | 为什么 |
|------|------|--------|
| 5 | `event-emitter` | 泛型约束实战 |
| 6 | `task-runner` | 最复杂，涉及并发和 Worker |

### Phase 4: 集成 (第 9-10 天)

| Step | 内容 |
|------|------|
| 7 | 创建 `index.ts` 统一导出 |
| 8 | 配置 `package.json` exports |
| 9 | 完善文档和示例 |

---

## 测试策略

### 测试原则

- **不依赖外部测试框架** — 使用自带的简单断言函数
- **测试与源码同目录** — `result.test.ts` 和 `result.ts` 同级
- **每个模块独立可测** — 单独运行不报错
- **覆盖正常路径和异常路径**

### 断言工具设计

每个测试文件自带极简断言：

```typescript
function assert(condition: boolean, message: string): void {
  if (condition) { passed++; console.log(`  ✅ ${message}`); }
  else           { failed++; console.error(`  ❌ ${message}`); }
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  assert(actual === expected, `${msg} (actual=${actual}, expected=${expected})`);
}

function assertThrows(fn: () => unknown, msg: string): void {
  try { fn(); assert(false, `${msg} — 应该抛出`); }
  catch { assert(true, msg); }
}
```

### 运行方式

```bash
# 运行所有测试
npm test

# 运行单个模块测试
npx tsx src/result/result.test.ts
npx tsx src/fp/fp.test.ts
npx tsx src/validate/validator.test.ts
npx tsx src/event-emitter/emitter.test.ts

# 类型检查
npm run typecheck
```

---

## 构建与发布

### 构建配置

`tsconfig.build.json` 继承主配置，排除测试文件：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "removeComments": true
  },
  "exclude": ["**/*.test.ts"]
}
```

### 构建步骤

```bash
# 1. 类型检查
npm run typecheck

# 2. 运行测试
npm test

# 3. 构建
npm run build

# 4. 检查产物
ls dist/
# result/ validate/ fp/ type-utils/ event-emitter/ task-runner/ index.js index.d.ts
```

### package.json exports

`exports` 字段支持按需导入和 Tree Shaking：

```json
{
  "exports": {
    ".": { "import": "./dist/index.js" },
    "./result":   { "import": "./dist/result/result.js" },
    "./validate": { "import": "./dist/validate/validator.js" },
    "./fp":       { "import": "./dist/fp/compose.js" }
  }
}
```

### 本地测试

```bash
# 在工具库目录
npm link

# 在消费者项目
npm link @learn/ts-toolkit

# 测试导入
import { ok, err, pipe } from '@learn/ts-toolkit';
```

---

## 最佳实践

### 1. 优先 Result, 不抛异常

```typescript
// ❌ 隐式错误
function parse(text: string): Config {
  return JSON.parse(text);
}

// ✅ 显式错误
const parse = tryCatch((text: string): Config => JSON.parse(text));
```

### 2. 用 pipe 替代嵌套调用

```typescript
// ❌ 从右到左, 反直觉
const result = f(g(h(x)));

// ✅ 从左到右, 清晰
const result = pipe(h, g, f)(x);
```

### 3. 用品牌类型防止参数混淆

```typescript
// ❌ 容易传错
function transfer(from: string, to: string, amount: number) {}

// ✅ 编译时安全
function transfer(from: UserId, to: UserId, amount: MoneyInCents) {}
```

### 4. 用 memoize 优化昂贵计算

```typescript
// ❌ 每次重新计算
const hash = computeHash(data);

// ✅ 自动缓存
const cachedHash = memoize(computeHash);
```

### 5. 用 TaskQueue 控制并发

```typescript
// ❌ 同时 1000 个请求
await Promise.all(ids.map(id => fetch(`/api/${id}`)));

// ✅ 限制为 5 个并发
await pLimit(ids.map(id => () => fetch(`/api/${id}`)), 5);
```

---

## 常见陷阱

### 陷阱 1: 忘记检查 Result.ok

```typescript
// ❌ 直接访问 value
const result = safeJSON('invalid');
console.log(result.value); // Err 时 value 是 undefined!

// ✅ 先检查
if (result.ok) {
  console.log(result.value);
}
```

### 陷阱 2: memoize 的 key 碰撞

```typescript
// ❌ 对象属性顺序不同, JSON.stringify 生成不同 key
fn({ a: 1, b: 2 }); // key: '{"a":1,"b":2}'
fn({ b: 2, a: 1 }); // key: '{"b":2,"a":1}' — 缓存未命中!

// ✅ 自定义 keyGenerator
memoize(fn, {
  keyGenerator: (args) => `${args[0].a}-${args[0].b}`,
});
```

### 陷阱 3: Proxy 验证的性能

```typescript
// ❌ 循环中频繁触发 Proxy set trap
for (let i = 0; i < 1000000; i++) {
  validatedObj.count = i; // 每次都验证
}

// ✅ 只在边界处验证
const validated = validateUser(rawInput);
// 后续读取, 少量修改
```

### 陷阱 4: 品牌类型绕过验证

```typescript
// ❌ 用 as 强转, 绕过验证
const email: Email = 'invalid' as Email;

// ✅ 必须通过工厂函数
const email = createEmail('user@example.com');
```

### 陷阱 5: Worker 池忘记 terminate

```typescript
// ❌ Worker 持续占用资源
const pool = new WorkerPool('/worker.js');
const result = await pool.exec(data);
// 忘记 terminate!

// ✅ 用 finally 保证清理
try {
  const result = await pool.exec(data);
} finally {
  pool.terminate();
}
```

---

## 工程化配置说明

### tsconfig.json 严格模式

```json
{
  "compilerOptions": {
    "strict": true,                     // 启用所有严格检查
    "noUnusedLocals": true,             // 禁止未使用变量
    "noUnusedParameters": true,         // 禁止未使用参数
    "noFallthroughCasesInSwitch": true, // switch 必须 break
    "noUncheckedIndexedAccess": true,   // 数组索引可能 undefined
    "noImplicitReturns": true           // 所有分支必须返回值
  }
}
```

### package.json 关键配置

- `"type": "module"` — 启用 ESM
- `"exports"` — 子路径导入, 支持 Tree Shaking
- `"scripts.test"` — 使用 tsx 运行 .test.ts 文件
- `"scripts.typecheck"` — 仅类型检查, 不生成文件
- `"scripts.build"` — 使用 tsconfig.build.json 构建

---

## 综合示例: 用户注册流程

```typescript
import {
  ok, err, tryCatch, flatMap, type Result,
  createValidator, Patterns,
  EventEmitter,
  type Brand, brand,
} from '@learn/ts-toolkit';

// 1. 品牌类型
type Email = Brand<string, 'Email'>;
const createEmail = brand<Email>((v) => {
  if (typeof v !== 'string' || !Patterns.email.test(v))
    throw new Error('Invalid email');
  return v;
});

// 2. 验证器
interface SignupData { email: string; password: string; username: string }
const validateSignup = createValidator<SignupData>({
  email:    { type: 'string', required: true, pattern: Patterns.email },
  password: { type: 'string', required: true, min: 8 },
  username: { type: 'string', required: true, min: 3, max: 20 },
});

// 3. 事件系统
type Events = {
  'signup:ok':   { userId: string };
  'signup:fail': { error: string };
};
const bus = new EventEmitter<Events>();
bus.on('signup:ok',   (d) => console.log(`欢迎 ${d.userId}`));
bus.on('signup:fail', (d) => console.error(`注册失败: ${d.error}`));

// 4. 业务逻辑
async function signup(raw: unknown): Promise<Result<string, string>> {
  try {
    const data = validateSignup(raw as SignupData);
    const email = createEmail(data.email);
    const userId = `user-${Date.now()}`;
    bus.emit('signup:ok', { userId });
    return ok(userId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    bus.emit('signup:fail', { error: msg });
    return err(msg);
  }
}
```

---

## 扩展阅读

### 推荐资源

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — 官方文档
- [Rust Book: Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html) — Result 模式的灵感来源
- [Professor Frisby's Guide to FP](https://mostly-adequate.gitbook.io/) — 函数式编程入门
- [MDN: Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) — Proxy API 参考
- [MDN: Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) — Worker API 参考

### 相关项目

| 项目 | 类比模块 | 说明 |
|------|---------|------|
| [neverthrow](https://github.com/supermacro/neverthrow) | result | 生产级 Result 类型库 |
| [zod](https://github.com/colinhacks/zod) | validate | Schema 验证标准库 |
| [fp-ts](https://github.com/gcanti/fp-ts) | fp | 重量级 FP 库 |
| [mitt](https://github.com/developit/mitt) | event-emitter | 300B 事件库 |
| [p-limit](https://github.com/sindresorhus/p-limit) | task-runner | 并发控制 |

---

## 知识点覆盖矩阵

| 章节 | 知识点 | 在 ts-toolkit 中的应用 |
|------|--------|----------------------|
| 06-原型链 | 原型继承、构造函数 | EventEmitter 类设计 |
| 08-错误处理 | Error 类型体系、Result 模式 | result 模块 |
| 09-正则表达式 | 捕获组、常用模式 | validate/patterns |
| 10-执行机制 | 闭包、作用域链 | memoize 的闭包缓存 |
| 08-Proxy/Reflect | Proxy set trap、不变量 | validate/validator |
| 09-函数式编程 | 纯函数、组合、柯里化 | fp 模块 |
| 11-TS 工程化 | 品牌类型、声明文件、tsconfig | type-utils + 构建配置 |

---

**Made with ❤️ for learning TypeScript engineering**
