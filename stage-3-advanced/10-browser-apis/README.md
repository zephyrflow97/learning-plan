# 第 10 章：现代浏览器 API — 从 JavaScript 运行时到操作系统级平台

> *"The Web is the most hostile software engineering environment imaginable."*
> — Douglas Crockford, *JavaScript: The Good Parts*
>
> 浏览器不只是一个 JavaScript 运行时——它是一个操作系统级的平台。它有自己的线程模型（Web Workers）、文件系统（File API）、网络栈（Fetch）、进程间通信（postMessage）、甚至 GPU 访问（WebGL/WebGPU）。你在 Stage 1 学会了 DOM 操作，就像学会了操作系统的文件浏览器。本章带你进入操作系统的**内核**。

## 📖 本章内容

1. [Web Workers — 多线程的 JavaScript](#1-web-workers--多线程的-javascript) — 专用 Worker、共享 Worker、Transferable Objects
2. [Observer 三剑客](#2-observer-三剑客) — IntersectionObserver、MutationObserver、ResizeObserver
3. [File API 与 Blob](#3-file-api-与-blob) — 文件读取、Blob URL、二进制处理、切片上传
4. [Fetch API 深入](#4-fetch-api-深入) — AbortController、ReadableStream、请求拦截模式
5. [结构化克隆与序列化](#5-结构化克隆与序列化) — `structuredClone`、序列化边界
6. [通信 API](#6-通信-api) — BroadcastChannel、postMessage、跨 Tab 通信
7. [模块化生态](#7-模块化生态) — 动态 import()、CJS vs ESM、Tree Shaking 原理
8. [🧘 Zen of Code：平台 API 的选择哲学](#8--zen-of-code平台-api-的选择哲学)
9. [最佳实践与常见陷阱](#9-最佳实践与常见陷阱)
10. [本章总结](#10-本章总结)
11. [章节练习](#11-章节练习)

---

## 1. Web Workers — 多线程的 JavaScript

> 🎭 **The Drama：给主线程请一个助手**
>
> JavaScript 是单线程的。主线程既要处理用户交互（事件、动画），又要执行业务逻辑（数据处理）。当你要处理 10 万条数据的排序时，主线程会被阻塞 3 秒，页面卡死。Web Worker 就是给主线程请了一个**助手**——助手在另一个线程中默默干活，干完了通过 `postMessage` 把结果交回来。主线程全程不受影响。
>
> 但这个助手有一个限制：**它看不到 DOM**。Worker 没有 `document`、`window`，不能操作页面。它是一个纯计算线程，就像后端的微服务——只负责处理数据，不负责展示。

### 1.1 JavaScript 的线程模型

浏览器是多线程的，但 JavaScript 代码默认只在一个线程（主线程/UI 线程）上运行：

```
浏览器进程
  ├── UI 线程（主线程）  ← JS 执行 + DOM 渲染 + 事件处理
  ├── 网络线程           ← 处理 HTTP 请求
  ├── GPU 线程           ← 处理合成与渲染
  ├── Worker 线程 1      ← Web Worker (独立 JS 上下文)
  └── Worker 线程 N      ← 可以创建多个
```

这意味着：**一个 CPU 密集型任务就能冻结整个 UI**。Web Workers 打破了这个瓶颈。

### 1.2 三种 Worker 类型

| Worker 类型 | 作用域 | 共享 | 生命周期 |
|-------------|--------|------|---------|
| **Dedicated Worker** | 单个页面独占 | 不共享 | 随页面关闭而终止 |
| **Shared Worker** | 多个页面/iframe 共享 | 同源页面共享 | 最后一个连接断开时终止 |
| **Service Worker** | 注册到 origin + scope | 同 origin 页面 | 独立于页面，支持离线 |

### 1.3 专用 Worker 基本用法

```typescript
// 主线程
const worker = new Worker('heavy-task.js');
worker.postMessage({ data: largeArray });
worker.onmessage = (e) => console.log('结果:', e.data);

// Worker 线程 (heavy-task.js)
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};
```

### 1.4 Transferable Objects — 零拷贝传输

`postMessage` 默认使用结构化克隆——数据被**复制**到 Worker 线程。对于大型 ArrayBuffer，这个复制成本很高。

Transferable Objects 是"所有权转移"：数据的内存直接移交给目标线程，原线程**失去访问权**。

```typescript
// ❌ 复制 100MB 数据 — 耗时！
worker.postMessage(hugeBuffer);

// ✅ 转移所有权 — 零拷贝！
worker.postMessage(hugeBuffer, [hugeBuffer]);
// hugeBuffer.byteLength === 0  ← 主线程已失去访问权
```

> 🧠 **CS Master's Bridge：消息传递 vs 共享内存**
>
> Web Workers 默认使用**消息传递** (Message Passing) 模型——每个线程有独立的内存空间，通过消息通信。这是 Erlang/Actor 模型的思路，天然避免了竞态条件。
>
> `SharedArrayBuffer` + `Atomics` API 则提供了**共享内存**模型——多个线程读写同一块内存，需要手动加锁。这是 C/Java 的思路，性能更高但复杂度暴增。
>
> 90% 的场景用 `postMessage` 就够了。只有在处理音视频编解码等极端性能需求时才需要 SharedArrayBuffer。

### 1.5 Comlink — 让 Worker 像调用本地函数一样简单

```typescript
// worker.ts — 导出函数
import { expose } from 'comlink';
const api = {
  fibonacci(n: number): number { /* ... */ }
};
expose(api);

// main.ts — 调用远程函数
import { wrap } from 'comlink';
const api = wrap<typeof import('./worker')>(new Worker('./worker.js'));
const result = await api.fibonacci(40); // 像调用本地函数！
```

Comlink 的魔法：用 Proxy 把 `postMessage` 的异步消息传递包装成 RPC (远程过程调用) 风格。底层仍然是消息传递，但 API 使用体验和本地函数调用一模一样。

> 完整的 Worker 多线程演示见 [`examples/01-web-workers.ts`](./examples/01-web-workers.ts)

---

## 2. Observer 三剑客

> 🌌 **The Big Picture：从轮询到订阅的范式转变**
>
> 传统做法是"你去检查"（轮询）：每隔 100ms 检查元素是否在视口中、DOM 是否变化、元素尺寸是否改变。这是**命令式的、高开销的**。
>
> Observer API 是"变化来通知你"（订阅）：你告诉浏览器"我关心什么"，浏览器在**合适的时机**批量通知你。这不仅性能更好（计算在浏览器原生层完成），而且更符合声明式编程思维。

### 2.1 IntersectionObserver — 懒加载的正确姿势

> ⚛️ **IntersectionObserver — 把高频计算从 JS 下沉到浏览器原生层**
>
> 以前做懒加载，你要在 `scroll` 事件中用 `getBoundingClientRect()` 计算元素位置——每次滚动触发几十次，性能灾难。IntersectionObserver 把这个计算交给了浏览器引擎（C++ 层），你只需要说"当这个元素进入视口时通知我"。

**核心概念**：监听目标元素与祖先元素（或视口）的交叉比例。

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target); // 元素进入视口，加载图片
        observer.unobserve(entry.target); // 加载后停止观察
      }
    });
  },
  { threshold: 0.1, rootMargin: '200px' }
  // threshold: 交叉比例阈值
  // rootMargin: 提前 200px 触发（预加载）
);

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

**常见用途**：

| 场景 | 配置 | 说明 |
|------|------|------|
| **图片懒加载** | `threshold: 0.1` | 元素 10% 可见时开始加载 |
| **无限滚动** | `rootMargin: '0px 0px 500px 0px'` | 距底部 500px 时触发加载下一页 |
| **广告曝光追踪** | `threshold: 0.5` | 元素 50% 可见才算一次曝光 |
| **动画触发** | `threshold: [0, 0.5, 1]` | 多个阈值触发不同动画阶段 |

### 2.2 MutationObserver — DOM 变化监听

MutationObserver 监听 DOM 树的变化：子节点增删、属性修改、文本内容变化。

```typescript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      console.log('子节点变化:', mutation.addedNodes.length, '个新增');
    } else if (mutation.type === 'attributes') {
      console.log(`属性 ${mutation.attributeName} 被修改`);
    }
  });
});

observer.observe(targetNode, {
  childList: true,  // 监听子节点变化
  attributes: true, // 监听属性变化
  subtree: true,    // 监听所有后代
  characterData: true // 监听文本内容变化
});
```

**实际用途**：

- 表单自动保存（监听输入区域 DOM 变化）
- 第三方脚本注入检测（监听 `<script>` 标签添加）
- 无障碍辅助工具（监听 ARIA 属性变化）
- 浏览器扩展（监听页面内容变化）

### 2.3 ResizeObserver — 元素尺寸变化

与 `window.onresize` 不同，ResizeObserver 监听的是**单个元素**的尺寸变化：

```typescript
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`元素尺寸: ${width}x${height}`);
    // 根据尺寸切换布局
    entry.target.classList.toggle('compact', width < 400);
  }
});

observer.observe(containerElement);
```

**对比三剑客**：

| Observer | 监听对象 | 回调时机 | 性能 |
|----------|---------|---------|------|
| **IntersectionObserver** | 元素与视口/祖先的交叉 | 异步，浏览器空闲时 | 极高 |
| **MutationObserver** | DOM 树结构/属性 | 微任务（microtask） | 高 |
| **ResizeObserver** | 元素的 content rect | 在 layout 之后、paint 之前 | 高 |

> 完整的 Observer 三剑客演示见 [`examples/02-observer-apis.ts`](./examples/02-observer-apis.ts)

---

## 3. File API 与 Blob

> 🎭 **The Drama：浏览器从"只读窗口"到"文件处理中心"**
>
> 早期的浏览器只能通过 `<input type="file">` 获得一个文件路径字符串，然后提交给服务器处理。File API 让浏览器能**在客户端直接读取、处理、生成文件**——图片裁剪、CSV 解析、视频切片上传、PDF 生成，全部在浏览器端完成。

### 3.1 Blob — 二进制大对象

Blob (Binary Large Object) 是浏览器中表示二进制数据的基础类型：

```typescript
// 创建 Blob
const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' });
const jsonBlob = new Blob(
  [JSON.stringify({ name: 'Alice' })],
  { type: 'application/json' }
);

console.log(textBlob.size);  // 13 (字节)
console.log(textBlob.type);  // 'text/plain'
```

**Blob 家族关系**：

```
Blob (二进制大对象)
  └── File (继承自 Blob，额外有 name/lastModified)
        └── <input type="file"> 返回的就是 File 对象
```

### 3.2 FileReader — 读取文件内容

```typescript
const input = document.querySelector('input[type="file"]')!;
input.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files![0];
  const reader = new FileReader();

  reader.onload = () => {
    console.log(reader.result); // 文件内容
  };

  // 四种读取方式
  reader.readAsText(file);        // → string
  // reader.readAsDataURL(file);   // → data:image/png;base64,...
  // reader.readAsArrayBuffer(file); // → ArrayBuffer
  // reader.readAsBinaryString(file); // → binary string (已废弃)
});
```

### 3.3 Blob URL vs Data URL

| 特性 | Blob URL | Data URL |
|------|---------|----------|
| **格式** | `blob:http://.../<uuid>` | `data:image/png;base64,...` |
| **大小** | 短字符串（引用） | 与数据大小成正比 |
| **性能** | 快（零拷贝引用） | 慢（Base64 编码增加 33% 体积） |
| **生命周期** | 手动 revoke 或页面关闭 | 永久有效 |
| **跨域** | 不可用 | 可跨域使用 |

```typescript
// ✅ 推荐：Blob URL（大文件）
const url = URL.createObjectURL(blob);
img.src = url;
// 用完务必释放！
URL.revokeObjectURL(url);

// ❌ Data URL（小图标可用，大文件避免）
reader.readAsDataURL(file); // 结果是巨长的 base64 字符串
```

### 3.4 文件切片上传

大文件上传的核心策略：将文件切分为多个 chunk，逐块上传，支持断点续传。

```typescript
function sliceFile(file: File, chunkSize = 2 * 1024 * 1024) {
  const chunks: Blob[] = [];
  for (let start = 0; start < file.size; start += chunkSize) {
    chunks.push(file.slice(start, start + chunkSize));
  }
  return chunks;
}
// ... 完整实现见 examples/03-file-and-stream-api.ts
```

> 完整的 File API 与 Stream 演示见 [`examples/03-file-and-stream-api.ts`](./examples/03-file-and-stream-api.ts)

---

## 4. Fetch API 深入

> 🌌 **The Big Picture：从 XMLHttpRequest 到 Fetch — 20 年的进化**
>
> XMLHttpRequest (XHR) 诞生于 1999 年（IE5 的 ActiveX 控件），它让 AJAX 成为可能，但 API 设计是回调式的、状态机式的（readyState 0-4），充满了历史包袱。Fetch API（2015）用 Promise + Stream 重新设计了网络请求接口——声明式、可组合、流式处理。
>
> 但 Fetch 也有自己的"坑"：HTTP 404 **不会** reject Promise（只有网络错误才 reject），需要手动检查 `response.ok`。

### 4.1 AbortController — 取消请求

```typescript
const controller = new AbortController();

// 5 秒超时
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch('/api/data', {
    signal: controller.signal
  });
  clearTimeout(timeoutId);
  const data = await response.json();
} catch (error) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    console.log('请求被取消');
  }
}
```

**AbortController 的通用性**：它不仅能取消 Fetch，还能用于：

- 取消 `addEventListener`（`{ signal }` 选项）
- 取消 `ReadableStream`
- 取消自定义的异步操作

```typescript
// ✅ 用 AbortSignal 管理事件监听器的生命周期
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });
// 一键移除所有通过此 signal 注册的监听器
controller.abort();
```

### 4.2 ReadableStream — 流式处理响应

传统方式等待整个响应体下载完毕才开始处理。Stream API 让你**边下载边处理**：

```typescript
const response = await fetch('/api/large-data');
const reader = response.body!.getReader();
const decoder = new TextDecoder();

let received = 0;
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  received += value.length;
  const text = decoder.decode(value, { stream: true });
  // 实时处理每个 chunk
  processChunk(text);
}
```

**流式处理的典型场景**：

| 场景 | 传统方式 | Stream 方式 |
|------|---------|------------|
| **大文件下载** | 等全部下载完 | 边下载边写入磁盘 |
| **SSE/LLM 流式输出** | 轮询或 EventSource | 直接读取 body stream |
| **进度显示** | 无法获取进度 | 通过已读字节数计算 |
| **管道转换** | 全量处理 | `pipeThrough(TransformStream)` |

### 4.3 请求拦截模式 — 构建 API 客户端

```typescript
// ✅ 用高阶函数构建可组合的 fetch 增强
type FetchMiddleware = (
  next: typeof fetch
) => typeof fetch;

const withBaseURL = (baseURL: string): FetchMiddleware =>
  (next) => (input, init) => {
    const url = typeof input === 'string'
      ? `${baseURL}${input}` : input;
    return next(url, init);
  };

const withAuth = (getToken: () => string): FetchMiddleware =>
  (next) => (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${getToken()}`);
    return next(input, { ...init, headers });
  };

// ... 完整实现见 examples/04-advanced-fetch.ts
```

### 4.4 Fetch 的五个常见陷阱

```typescript
// ❌ 陷阱 1: 404 不 reject
const res = await fetch('/not-found');
// res.ok === false, 但 Promise 没有 reject!

// ✅ 正确做法
const res = await fetch('/api/data');
if (!res.ok) throw new Error(`HTTP ${res.status}`);

// ❌ 陷阱 2: body 只能读一次
const data1 = await res.json();
const data2 = await res.json(); // ❌ TypeError: body已被消费

// ✅ 正确做法: 先 clone
const data1 = await res.clone().json();
const data2 = await res.json();
```

> 完整的 Fetch 高级用法演示见 [`examples/04-advanced-fetch.ts`](./examples/04-advanced-fetch.ts)

---

## 5. 结构化克隆与序列化

> ⚛️ **structuredClone — 深拷贝的标准答案**
>
> 在 `structuredClone` 出现之前，JS 开发者用 `JSON.parse(JSON.stringify(obj))` 做深拷贝——它无法处理 `Date`、`Map`、`Set`、循环引用、`undefined`、函数。Lodash 的 `_.cloneDeep` 解决了这些问题，但要引入一个库。2022 年，`structuredClone` 成为浏览器和 Node.js 的原生 API，结束了这场"深拷贝战争"。

### 5.1 structuredClone 基本用法

```typescript
const original = {
  name: 'Alice',
  date: new Date(),
  scores: new Map([['math', 95]]),
  tags: new Set(['admin', 'user']),
  nested: { deep: { value: 42 } }
};

const clone = structuredClone(original);
clone.nested.deep.value = 100;
console.log(original.nested.deep.value); // 42 — 完全独立
```

### 5.2 可克隆 vs 不可克隆

| 可克隆 ✅ | 不可克隆 ❌ | 说明 |
|-----------|------------|------|
| 原始类型 | **Function** | 函数不能被结构化克隆 |
| Date | **DOM 节点** | `Element`、`Document` 等 |
| Map / Set | **Symbol** | Symbol 是唯一的，克隆违背语义 |
| ArrayBuffer / TypedArray | **Error** (部分浏览器) | 规范允许，但实现不一致 |
| RegExp | **WeakMap / WeakRef** | 弱引用的语义不允许克隆 |
| Blob / File | **Proxy** | Proxy 是行为层包装，无法序列化 |
| 循环引用 ✅ | 原型链上的属性 | 只克隆自有属性 |

### 5.3 structuredClone vs 其他方案

```typescript
// ❌ JSON 方式 — 丢失 Date、Map、Set、undefined
const clone1 = JSON.parse(JSON.stringify(obj));

// ⚠️ 展开运算符 — 浅拷贝
const clone2 = { ...obj }; // 嵌套对象仍然是引用

// ✅ structuredClone — 原生深拷贝
const clone3 = structuredClone(obj);
```

> 🧠 **CS Master's Bridge：结构化克隆算法的用途远不止 clone**
>
> 浏览器内部在很多地方使用结构化克隆算法：
> - `postMessage` 跨线程/窗口传输数据
> - `IndexedDB` 存储对象
> - `history.pushState` 保存状态
> - `Notification` 构造函数
>
> 理解哪些类型可以结构化克隆，就等于理解了**哪些数据可以跨越这些边界**。

---

## 6. 通信 API

> 🎭 **The Drama：浏览器 Tab 之间的"无线电"**
>
> 现代 Web 应用经常在多个 Tab 中打开。用户在 Tab A 中登出，Tab B 却还保持着登录态——这就是"多 Tab 状态不同步"问题。浏览器提供了多种跨 Tab 通信机制，让你的应用在多个窗口间保持一致。

### 6.1 BroadcastChannel — 同源广播

最简单的跨 Tab 通信方式：

```typescript
// Tab A: 发送消息
const channel = new BroadcastChannel('auth-events');
channel.postMessage({ type: 'LOGOUT', timestamp: Date.now() });

// Tab B: 接收消息
const channel = new BroadcastChannel('auth-events');
channel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
    redirectToLogin();
  }
};
```

**限制**：
- 仅同源（same-origin）页面
- 不能跨浏览器
- 数据使用结构化克隆（不能传函数）

### 6.2 window.postMessage — 跨源通信

```typescript
// 父窗口 → iframe（可跨域）
const iframe = document.querySelector('iframe')!;
iframe.contentWindow!.postMessage(
  { type: 'INIT', config: { theme: 'dark' } },
  'https://widget.example.com'  // 必须指定目标 origin！
);

// iframe 接收
window.addEventListener('message', (event) => {
  // ⚠️ 安全！始终验证来源
  if (event.origin !== 'https://parent.example.com') return;
  console.log('收到消息:', event.data);
});
```

**安全注意事项**：

```typescript
// ❌ 危险！接受任何来源的消息
window.addEventListener('message', (e) => {
  eval(e.data); // 恶意页面可以注入代码！
});

// ✅ 安全！始终验证 origin 和数据结构
window.addEventListener('message', (e) => {
  if (e.origin !== TRUSTED_ORIGIN) return;
  if (!isValidMessage(e.data)) return;
  handleMessage(e.data);
});
```

### 6.3 跨 Tab 通信方案对比

| 方案 | 跨域 | 实时性 | 浏览器兼容 | 适用场景 |
|------|------|--------|-----------|---------|
| **BroadcastChannel** | ❌ 同源 | 实时 | 现代浏览器 | 登录/登出同步、主题切换 |
| **localStorage 事件** | ❌ 同源 | 近实时 | 所有浏览器 | 简单状态同步（兼容性好） |
| **postMessage** | ✅ 跨域 | 实时 | 所有浏览器 | iframe 通信、微前端 |
| **SharedWorker** | ❌ 同源 | 实时 | 部分浏览器 | 共享 WebSocket 连接 |
| **Service Worker** | ❌ 同源 | 近实时 | 现代浏览器 | 后台同步、推送通知 |

```typescript
// localStorage 事件 — 最简单的跨 Tab 同步
// 注意：只在其他 Tab 中触发，不在当前 Tab 触发
window.addEventListener('storage', (e) => {
  if (e.key === 'user-session') {
    const session = JSON.parse(e.newValue || 'null');
    if (!session) redirectToLogin();
  }
});

// 触发
localStorage.setItem('user-session', JSON.stringify(session));
```

---

## 7. 模块化生态

> ⚛️ **动态 import() — 代码的按需快递**
>
> 传统 `import` 在应用启动时就加载所有模块（把整座仓库搬到你家）。动态 `import()` 是按需快递——用户点击"管理面板"时再加载管理模块。配合路由级代码分割（Next.js 的 `dynamic()`），初始加载可以从 2MB 降到 200KB。

### 7.1 CommonJS vs ESM — 两个世界的碰撞

> 🧠 **CS Master's Bridge：静态分析 vs 动态加载**
>
> CJS 和 ESM 的核心区别不是语法（`require` vs `import`），而是**解析时机**：
> - CJS 是**运行时**加载：`require()` 是一个函数调用，可以出现在 `if` 块中，模块路径可以是变量。引擎必须运行代码才能知道依赖关系。
> - ESM 是**编译时**解析：`import` 是声明式语法，必须在文件顶层，路径必须是字符串字面量。引擎不执行代码就能分析依赖图。
>
> 这个区别是 Tree Shaking 能存在的根本原因——只有编译时可分析的依赖关系，才能让构建工具判断哪些导出没有被使用。

| 特性 | CommonJS (CJS) | ES Modules (ESM) |
|------|---------------|-----------------|
| **语法** | `require()` / `module.exports` | `import` / `export` |
| **加载时机** | 运行时 | 编译时（静态） |
| **值类型** | 值的拷贝 | 值的实时绑定 (Live Binding) |
| **循环依赖** | 返回已执行部分的快照 | 支持（因为是绑定） |
| **顶层 await** | ❌ 不支持 | ✅ 支持 |
| **Tree Shaking** | ❌ 不可能 | ✅ 支持 |
| **默认环境** | Node.js（传统） | 浏览器 / Node.js（现代） |

### 7.2 动态 import() — 按需加载

```typescript
// 路由级代码分割
const routes = {
  '/dashboard': () => import('./pages/Dashboard'),
  '/settings': () => import('./pages/Settings'),
  '/admin':    () => import('./pages/AdminPanel'),
};

async function navigate(path: string) {
  const loader = routes[path];
  if (!loader) return show404();
  const module = await loader();
  render(module.default);
}
```

### 7.3 Tree Shaking 原理

Tree Shaking 是"摇树"——摇掉没有被引用的代码，只打包真正使用的部分。

```typescript
// utils.ts
export function add(a: number, b: number) { return a + b; }
export function multiply(a: number, b: number) { return a * b; }
export function divide(a: number, b: number) { return a / b; }

// app.ts — 只用了 add
import { add } from './utils';
console.log(add(1, 2));
// Tree Shaking 后: multiply 和 divide 被删除
```

**Tree Shaking 失败的常见原因**：

```typescript
// ❌ 副作用导致不可 shake
import './polyfill'; // 整个文件都会保留

// ❌ 动态属性访问
import * as utils from './utils';
const fn = utils[methodName]; // 构建工具无法静态分析

// ❌ re-export 整个命名空间
export * from './utils'; // barrel file 反模式
```

### 7.4 package.json 的模块化字段

```json
{
  "name": "my-lib",
  "type": "module",         // 默认使用 ESM
  "main": "./dist/cjs/index.cjs",  // CJS 入口（兼容旧工具）
  "module": "./dist/esm/index.mjs", // ESM 入口（构建工具使用）
  "types": "./dist/types/index.d.ts", // TypeScript 类型
  "exports": {               // 现代入口点映射（优先级最高）
    ".": {
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.cjs",
      "types": "./dist/types/index.d.ts"
    },
    "./utils": {
      "import": "./dist/esm/utils.mjs",
      "require": "./dist/cjs/utils.cjs"
    }
  }
}
```

> `exports` 字段是 Node.js 12.11+ 引入的"条件导出"（Conditional Exports），它让库作者可以为不同的消费环境（ESM/CJS/TypeScript/浏览器）提供不同的入口文件。这是解决 CJS/ESM 双模发布 (Dual Package) 问题的标准方案。

> 完整的模块化生态演示见 [`examples/05-module-ecosystem.ts`](./examples/05-module-ecosystem.ts)

---

## 8. 🧘 Zen of Code：平台 API 的选择哲学

> 🧘 **浏览器 API 不是你的代码——它们是你的基础设施**
>
> 当你需要一把锤子时，不要自己冶铁。浏览器已经为你准备了一整套工具箱：
>
> - 需要懒加载？**用 IntersectionObserver**，不要在 scroll 事件里手算位置
> - 需要深拷贝？**用 structuredClone**，不要 `JSON.parse(JSON.stringify())`
> - 需要取消请求？**用 AbortController**，不要自己维护 flag 变量
> - 需要多线程？**用 Web Worker**，不要把 CPU 密集任务放在主线程
> - 需要跨 Tab 同步？**用 BroadcastChannel**，不要轮询 localStorage
>
> 这些 API 不仅更简洁——它们在浏览器的 **C++ 层** 实现，性能远超你的 JS 轮子。
>
> **但也要记住**：不是所有浏览器都支持所有 API。在使用之前，检查 [caniuse.com](https://caniuse.com)，准备好 polyfill 或优雅降级方案。平台 API 的选择标准是：**覆盖率 × 性能收益 × 替代方案的代价**。

---

## 9. 最佳实践与常见陷阱

### ✅ 最佳实践

**1. Worker 中避免过度通信**

```typescript
// ❌ 每条数据都发一次消息（IPC 开销大）
for (const item of items) {
  worker.postMessage(item);
}

// ✅ 批量发送
worker.postMessage(items);
```

**2. Observer 用完要断开**

```typescript
// ❌ 忘记 disconnect，内存泄漏
const observer = new IntersectionObserver(callback);
observer.observe(element);
// element 被移除后 observer 仍然活着

// ✅ 在 cleanup 中断开
function cleanup() {
  observer.disconnect();
}
// React: useEffect return cleanup
// Vue: onUnmounted(cleanup)
```

**3. Blob URL 必须手动释放**

```typescript
// ❌ 内存泄漏
img.src = URL.createObjectURL(blob);

// ✅ 使用后释放
const url = URL.createObjectURL(blob);
img.src = url;
img.onload = () => URL.revokeObjectURL(url);
```

**4. Fetch 始终检查 response.ok**

```typescript
// ❌ 404 也进 then，不报错
const data = await fetch('/api/data').then(r => r.json());

// ✅ 显式检查
const res = await fetch('/api/data');
if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
const data = await res.json();
```

**5. 动态 import 配合路由使用**

```typescript
// ❌ 在组件顶层动态 import（每次渲染都触发）
function Component() {
  const mod = await import('./heavy');
  // ...
}

// ✅ 在路由配置中使用，配合 React.lazy / Next.js dynamic
const AdminPanel = React.lazy(() => import('./AdminPanel'));
```

### ❌ 常见陷阱

**1. Transferable 转移后原线程不可用**

```typescript
const buffer = new ArrayBuffer(1024);
worker.postMessage(buffer, [buffer]);
console.log(buffer.byteLength); // 0 — 已被转移！
// 如果后续代码还依赖 buffer，会出错
```

**2. MutationObserver 回调中修改 DOM 导致无限循环**

```typescript
// ❌ 危险！observer 回调中再修改 DOM
const observer = new MutationObserver(() => {
  targetNode.setAttribute('data-count',
    String(Number(targetNode.getAttribute('data-count')) + 1)
  );
  // → 触发新的 mutation → 再次回调 → 无限循环
});
```

**3. structuredClone 不克隆方法**

```typescript
class User {
  constructor(public name: string) {}
  greet() { return `Hello, ${this.name}`; }
}

const clone = structuredClone(new User('Alice'));
clone.greet(); // ❌ TypeError: clone.greet is not a function
// structuredClone 只克隆数据，不克隆原型链上的方法
```

**4. ESM 的 Live Binding 可能让人困惑**

```typescript
// counter.mjs
export let count = 0;
export function increment() { count++; }

// app.mjs
import { count, increment } from './counter.mjs';
console.log(count); // 0
increment();
console.log(count); // 1 — 值变了！因为 ESM 是 live binding
// 在 CJS 中，这里还是 0（值的拷贝）
```

**5. BroadcastChannel 在同一个 Tab 中也能收到消息**

```typescript
// ❌ 如果在同一个页面中既发又收，发送方也会收到
const channel = new BroadcastChannel('events');
channel.postMessage('test');
channel.onmessage = (e) => {
  console.log(e.data);
  // 同一个 Tab 的同一个 channel 实例不会收到
  // 但如果另一个 channel 实例订阅了同名频道，它会收到
};
```

---

## 10. 本章总结

| 核心概念 | 关键要点 |
|---------|---------|
| **Web Workers** | 真正的多线程；postMessage 通信；Transferable 零拷贝；不能访问 DOM |
| **Observer 三剑客** | IntersectionObserver (可见性)、MutationObserver (DOM 变化)、ResizeObserver (尺寸)；全部异步通知 |
| **File API / Blob** | Blob 是二进制大对象；File 继承 Blob；Blob URL 需手动释放；切片上传处理大文件 |
| **Fetch 深入** | AbortController 取消请求；Stream 流式处理；404 不 reject；body 只能读一次 |
| **structuredClone** | 原生深拷贝；支持 Date/Map/Set/循环引用；不支持函数/DOM/Symbol |
| **通信 API** | BroadcastChannel 同源广播；postMessage 跨域通信；验证 origin 保安全 |
| **模块化** | ESM 静态分析 → Tree Shaking；CJS 运行时加载；动态 import() 按需加载 |
| **选择哲学** | 优先使用平台原生 API；检查兼容性；准备降级方案 |

**下一步**：
- 尝试用 Web Worker 处理一个真实的 CPU 密集型任务（如图片处理或数据分析）
- 在你的项目中用 IntersectionObserver 替换 scroll 事件监听
- 审查项目的 bundle size，使用动态 import 优化加载性能

**相关章节**：
- [Stage 1 Ch05：DOM 基础](../../stage-1-beginner/05-dom-basics/) — 浏览器 API 的第一次接触
- [Stage 2 Ch04：异步进阶](../../stage-2-intermediate/04-async-advanced/) — Web Workers 是真正的并发，而非异步
- [Stage 3 Ch05：性能优化](../05-performance-optimization/) — 虚拟列表、代码分割等性能优化实战
- [Stage 3 Ch08：Proxy 与 Reflect](../08-proxy-reflect/) — Comlink 底层使用 Proxy 实现 RPC

---

## 11. 章节练习

### 练习 1：Worker 素数计算器

**难度**：⭐
**涉及知识点**：Web Worker、postMessage

**题目描述**：创建一个 Web Worker，接收一个上限 N，计算从 2 到 N 的所有素数并返回。主线程在等待时应保持响应。

**要求**：
1. Worker 接收 `{ limit: number }` 消息
2. 使用埃氏筛法 (Sieve of Eratosthenes) 计算素数
3. 返回 `{ primes: number[], time: number }` 结果
4. 主线程用 `console.log` 打印结果

**提示**：可以用 `performance.now()` 计时。

<details>
<summary>💡 参考答案</summary>

```typescript
// worker.ts
self.onmessage = (e: MessageEvent<{ limit: number }>) => {
  const start = performance.now();
  const { limit } = e.data;
  const sieve = new Uint8Array(limit + 1).fill(1);
  sieve[0] = sieve[1] = 0;
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) sieve[j] = 0;
    }
  }
  const primes = [];
  for (let i = 2; i <= limit; i++) if (sieve[i]) primes.push(i);
  self.postMessage({ primes, time: performance.now() - start });
};

// main.ts
const worker = new Worker('worker.js');
worker.postMessage({ limit: 1_000_000 });
worker.onmessage = (e) => {
  console.log(`找到 ${e.data.primes.length} 个素数，耗时 ${e.data.time}ms`);
};
```

</details>

### 练习 2：IntersectionObserver 无限滚动

**难度**：⭐⭐
**涉及知识点**：IntersectionObserver、DOM 操作

**题目描述**：实现一个无限滚动列表，当用户滚动到底部"哨兵"元素时，自动加载更多数据。

**要求**：
1. 使用 IntersectionObserver 监听底部哨兵元素
2. 每次加载 20 条模拟数据
3. 显示加载状态（Loading...）
4. 最多加载 5 页（100 条）后停止

**提示**：创建一个 `<div id="sentinel">` 作为哨兵元素放在列表末尾。

<details>
<summary>💡 参考答案</summary>

```typescript
let page = 0;
const maxPages = 5;

const observer = new IntersectionObserver(async (entries) => {
  if (entries[0].isIntersecting && page < maxPages) {
    page++;
    const items = await fetchPage(page); // 模拟 API 调用
    appendItems(items);
    if (page >= maxPages) {
      observer.disconnect();
      sentinel.textContent = '没有更多数据了';
    }
  }
}, { rootMargin: '200px' });

const sentinel = document.getElementById('sentinel')!;
observer.observe(sentinel);

function appendItems(items: string[]) {
  const list = document.getElementById('list')!;
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
}
```

</details>

### 练习 3：带进度的大文件上传器

**难度**：⭐⭐⭐
**涉及知识点**：File API、Blob.slice、Fetch、AbortController

**题目描述**：实现一个支持断点续传的大文件上传功能。

**要求**：
1. 文件切片为 2MB 每块
2. 显示上传进度（已上传 chunks / 总 chunks）
3. 支持取消上传（AbortController）
4. 上传失败的 chunk 自动重试 3 次
5. 所有 chunk 上传完成后调用合并接口

**提示**：使用 `file.slice(start, end)` 切片，每个 chunk 通过 `FormData` 上传。

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `examples/03-file-and-stream-api.ts` 中的切片上传实现

简要思路：
1. 用 `sliceFile(file, 2 * 1024 * 1024)` 切片
2. 为每个 chunk 创建 `FormData`，附带 `chunkIndex` 和 `totalChunks`
3. 用 `Promise.allSettled` 或顺序上传，配合 AbortController
4. 失败的 chunk 放入重试队列，最多重试 3 次
5. 所有 chunk 成功后，调用 `POST /merge` 接口

</details>

---

> *"The browser is not a limitation — it is a platform. The more you understand its native capabilities, the less code you need to write."* — Unknown
>
> 每一个浏览器原生 API 都是 W3C 工作组几十位工程师花几年时间设计、评审、实现的成果。在你手写一个 scroll 事件节流函数之前，先想想 IntersectionObserver。在你实现一个深拷贝库之前，先试试 structuredClone。**站在平台的肩膀上，而不是和平台较劲。**
