# Node.js 基础

## 学习目标

完成本章节后，你将能够：

1. 理解 Node.js 运行时环境和事件循环
2. 掌握文件系统操作（读写文件、目录操作）
3. 能够使用 HTTP 模块创建服务器
4. 理解 Express 框架的基本使用
5. 掌握中间件的概念和应用
6. 能够使用 npm/yarn 管理项目依赖

## 前置知识

- JavaScript 基础
- TypeScript 基础类型
- 异步编程（Promise、async/await）

## 1. Node.js 简介

### 1.1 什么是 Node.js？

> **🏭 The Metaphor: The Factory Without Workers**
> 传统的 Web 服务器（如 Apache/Tomcat）就像是一个**拥有大量工人的工厂**。
> 每个请求进来，就派一个工人（线程）去全程负责，直到产品做完。如果请求太多，工人不够用，工厂就瘫痪了。
> 
> Node.js 就像是一个**高度自动化的智能工厂**。
> 它只有一个工人（单线程），但他是一个**指挥官**。
> 他不亲自拧螺丝（I/O 操作），而是把任务分发给背后的**机器臂集群**（操作系统内核/libuv 线程池）。
> 指挥官只负责接收订单和分发成品。
> 只要机器臂足够快，这个指挥官每秒能处理成千上万的订单，而不会累死。

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让 JavaScript 可以在服务器端运行。

**主要特点**：
- **异步 I/O**：非阻塞 I/O 操作
- **事件驱动**：基于事件循环
- **单线程**：主线程是单线程，但可以利用多核
- **NPM**：丰富的第三方包生态系统

### 1.2 安装和验证

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 运行 JavaScript 文件
node app.js

# 进入 REPL（交互式解释器）
node
```

### 1.3 第一个 Node.js 程序

```typescript
// hello.ts
console.log('[INFO] Node.js 应用启动');
console.log(`[INFO] Node 版本: ${process.version}`);
console.log(`[INFO] 平台: ${process.platform}`);
console.log(`[INFO] 当前工作目录: ${process.cwd()}`);

console.log('[LOG] Hello, Node.js!');
```

运行：
```bash
npx ts-node hello.ts
```

## 2. Node.js 核心概念

### 2.1 全局对象

> **📻 The Metaphor: The Radio Station (EventEmitter)**
> Node.js 的核心是**事件驱动**的，而 `EventEmitter` 就是那个**广播电台**。
> *   **Emit (广播)**: 电台发出信号：“现在是整点新闻！”（事件触发）。
> *   **On (收听)**: 收音机（监听器）调到这个频道，听到信号后开始播放新闻（执行回调）。
> 
> 这种模式解耦了“发生事情的人”和“处理事情的人”。Node.js 的 HTTP Server、Stream、Socket 都是基于这个电台构建的。

```typescript
// 全局对象不需要导入

// console - 控制台输出
console.log('[INFO] 这是一条日志');
console.error('[ERROR] 这是一条错误信息');
console.warn('[WARNING] 这是一条警告');
console.time('timer');
console.log('[LOG] 执行某些操作...');
console.timeEnd('timer');

// process - 进程信息和控制
console.log(`[INFO] 进程 ID: ${process.pid}`);
console.log(`[INFO] Node 版本: ${process.version}`);
console.log(`[INFO] 平台: ${process.platform}`);
console.log(`[INFO] 内存使用: ${JSON.stringify(process.memoryUsage())}`);

// 环境变量
console.log(`[INFO] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// 命令行参数
console.log(`[INFO] 命令行参数: ${process.argv.slice(2)}`);

// 退出进程
// process.exit(0);  // 0 表示成功，非 0 表示错误

// __dirname 和 __filename（CommonJS）
// 在 ES 模块中使用：
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(`[INFO] 当前文件: ${__filename}`);
console.log(`[INFO] 当前目录: ${__dirname}`);

// setTimeout 和 setInterval
setTimeout(() => {
  console.log('[LOG] 延迟 1 秒后执行');
}, 1000);

const intervalId = setInterval(() => {
  console.log('[LOG] 每秒执行一次');
}, 1000);

// 清除定时器
setTimeout(() => {
  clearInterval(intervalId);
  console.log('[INFO] 清除定时器');
}, 5000);
```

### 2.2 事件循环

> **🤵 The Metaphor: The Single-Threaded Waiter**
> Node.js 就像一个**只有一名服务员**的繁忙餐厅。
> *   **Apache/Java (Multi-threaded)**: 每个顾客（请求）都配一个专属服务员。如果顾客在看菜单（I/O 等待），服务员就傻站着等。如果顾客太多，餐厅就得雇几千个服务员（线程），导致管理混乱（Context Switch）。
> *   **Node.js (Event Loop)**: 只有一个服务员。他飞快地在桌子间穿梭。
>     *   顾客 A 点菜（请求） -> 服务员记下，扔给厨房（OS/libuv），立刻去服务顾客 B。
>     *   厨房做好菜了（I/O 完成） -> 按铃通知服务员。
>     *   服务员在空闲时（Event Loop Tick），把菜端给顾客 A（执行回调）。
> 
> 只要服务员不被某个顾客拉着聊家常（CPU 密集型任务），这个餐厅就能用极低的成本服务成千上万的顾客。

```typescript
console.log('[1] 同步代码开始');

setTimeout(() => {
  console.log('[4] setTimeout 回调');
}, 0);

Promise.resolve().then(() => {
  console.log('[3] Promise 微任务');
});

console.log('[2] 同步代码结束');

// 输出顺序：
// [1] 同步代码开始
// [2] 同步代码结束
// [3] Promise 微任务
// [4] setTimeout 回调

// 解释：
// 1. 同步代码先执行
// 2. 微任务（Promise）在当前宏任务结束后立即执行
// 3. 宏任务（setTimeout）在下一轮事件循环执行
```

### 2.3 CommonJS vs ES Modules

```typescript
// CommonJS（传统方式）
// math.js
// module.exports = {
//   add: (a, b) => a + b,
//   subtract: (a, b) => a - b
// };

// 使用
// const math = require('./math');
// console.log(math.add(1, 2));

// ES Modules（现代方式，推荐）
// math.ts
export function add(a: number, b: number): number {
  console.log(`[TRACE] 执行加法: ${a} + ${b}`);
  return a + b;
}

export function subtract(a: number, b: number): number {
  console.log(`[TRACE] 执行减法: ${a} - ${b}`);
  return a - b;
}

// 使用
import { add, subtract } from './math';
console.log(`[LOG] 结果: ${add(1, 2)}`);
```

## 3. 文件系统操作

> **🎓 CS Perspective: Blocking vs Non-Blocking I/O**
>
> *   **Blocking I/O (Thread Pool)**: `fs.readFileSync` 会阻塞当前线程。在服务器端，这意味着你停止了服务所有其他用户。**永远不要在 Request Handler 中使用同步 I/O。**
> *   **Non-Blocking I/O (Worker Pool)**: `fs.readFile` (异步) 将任务提交给 libuv 的 **Worker Pool** (默认 4 个线程)。
>     *   文件 I/O 即使在 Linux 上也很难做到真正的非阻塞 (AIO 并不完美)，所以 Node.js 使用线程池来模拟非阻塞文件操作。
>     *   网络 I/O (Net/HTTP) 则是真正的非阻塞 (epoll)，不需要线程池。

### 3.1 读取文件

```typescript
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

// 同步读取（阻塞）
function readFileSync(filepath: string): string {
  console.log(`[INFO] 同步读取文件: ${filepath}`);
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    console.log(`[SUCCESS] 文件读取成功，大小: ${data.length} 字节`);
    return data;
  } catch (error) {
    console.log(`[ERROR] 读取文件失败: ${error}`);
    throw error;
  }
}

// 异步读取（回调方式）
function readFileAsync(filepath: string, callback: (err: Error | null, data?: string) => void): void {
  console.log(`[INFO] 异步读取文件（回调）: ${filepath}`);
  fs.readFile(filepath, 'utf-8', (err, data) => {
    if (err) {
      console.log(`[ERROR] 读取文件失败: ${err.message}`);
      callback(err);
      return;
    }
    console.log(`[SUCCESS] 文件读取成功，大小: ${data.length} 字节`);
    callback(null, data);
  });
}

// 异步读取（Promise 方式，推荐）
async function readFilePromise(filepath: string): Promise<string> {
  console.log(`[INFO] 异步读取文件（Promise）: ${filepath}`);
  try {
    const data = await fsPromises.readFile(filepath, 'utf-8');
    console.log(`[SUCCESS] 文件读取成功，大小: ${data.length} 字节`);
    return data;
  } catch (error) {
    console.log(`[ERROR] 读取文件失败: ${error}`);
    throw error;
  }
}

// 示例使用
async function example() {
  try {
    const content = await readFilePromise('./data.txt');
    console.log(`[LOG] 文件内容: ${content.substring(0, 100)}...`);
  } catch (error) {
    console.log('[ERROR] 读取失败');
  }
}
```

### 3.2 写入文件

```typescript
// 写入文件（覆盖）
async function writeFile(filepath: string, content: string): Promise<void> {
  console.log(`[INFO] 写入文件: ${filepath}`);
  try {
    await fsPromises.writeFile(filepath, content, 'utf-8');
    console.log('[SUCCESS] 文件写入成功');
  } catch (error) {
    console.log(`[ERROR] 写入文件失败: ${error}`);
    throw error;
  }
}

// 追加内容
async function appendFile(filepath: string, content: string): Promise<void> {
  console.log(`[INFO] 追加文件: ${filepath}`);
  try {
    await fsPromises.appendFile(filepath, content, 'utf-8');
    console.log('[SUCCESS] 内容追加成功');
  } catch (error) {
    console.log(`[ERROR] 追加内容失败: ${error}`);
    throw error;
  }
}

// 写入 JSON
async function writeJSON(filepath: string, data: any): Promise<void> {
  console.log(`[INFO] 写入 JSON 文件: ${filepath}`);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fsPromises.writeFile(filepath, jsonString, 'utf-8');
    console.log('[SUCCESS] JSON 文件写入成功');
  } catch (error) {
    console.log(`[ERROR] 写入 JSON 失败: ${error}`);
    throw error;
  }
}

// 读取 JSON
async function readJSON<T>(filepath: string): Promise<T> {
  console.log(`[INFO] 读取 JSON 文件: ${filepath}`);
  try {
    const content = await fsPromises.readFile(filepath, 'utf-8');
    const data = JSON.parse(content);
    console.log('[SUCCESS] JSON 文件解析成功');
    return data;
  } catch (error) {
    console.log(`[ERROR] 读取 JSON 失败: ${error}`);
    throw error;
  }
}

// 示例使用
async function jsonExample() {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ];
  
  await writeJSON('./users.json', users);
  const loadedUsers = await readJSON<typeof users>('./users.json');
  console.log(`[LOG] 加载了 ${loadedUsers.length} 个用户`);
}
```

### 3.3 目录操作

```typescript
// 创建目录
async function createDirectory(dirpath: string): Promise<void> {
  console.log(`[INFO] 创建目录: ${dirpath}`);
  try {
    await fsPromises.mkdir(dirpath, { recursive: true });
    console.log('[SUCCESS] 目录创建成功');
  } catch (error) {
    console.log(`[ERROR] 创建目录失败: ${error}`);
    throw error;
  }
}

// 读取目录内容
async function readDirectory(dirpath: string): Promise<string[]> {
  console.log(`[INFO] 读取目录: ${dirpath}`);
  try {
    const files = await fsPromises.readdir(dirpath);
    console.log(`[SUCCESS] 找到 ${files.length} 个文件/目录`);
    return files;
  } catch (error) {
    console.log(`[ERROR] 读取目录失败: ${error}`);
    throw error;
  }
}

// 删除目录
async function removeDirectory(dirpath: string): Promise<void> {
  console.log(`[INFO] 删除目录: ${dirpath}`);
  try {
    await fsPromises.rm(dirpath, { recursive: true, force: true });
    console.log('[SUCCESS] 目录删除成功');
  } catch (error) {
    console.log(`[ERROR] 删除目录失败: ${error}`);
    throw error;
  }
}

// 检查文件/目录是否存在
async function exists(filepath: string): Promise<boolean> {
  console.log(`[TRACE] 检查路径是否存在: ${filepath}`);
  try {
    await fsPromises.access(filepath);
    console.log('[DEBUG] 路径存在');
    return true;
  } catch {
    console.log('[DEBUG] 路径不存在');
    return false;
  }
}

// 获取文件信息
async function getFileInfo(filepath: string): Promise<fs.Stats> {
  console.log(`[INFO] 获取文件信息: ${filepath}`);
  try {
    const stats = await fsPromises.stat(filepath);
    console.log(`[INFO] 文件大小: ${stats.size} 字节`);
    console.log(`[INFO] 是否为文件: ${stats.isFile()}`);
    console.log(`[INFO] 是否为目录: ${stats.isDirectory()}`);
    console.log(`[INFO] 创建时间: ${stats.birthtime}`);
    console.log(`[INFO] 修改时间: ${stats.mtime}`);
    return stats;
  } catch (error) {
    console.log(`[ERROR] 获取文件信息失败: ${error}`);
    throw error;
  }
}
```

### 3.4 路径操作

> **🧊 The Metaphor: The Raw Material (Buffer)**
> 在 Node.js 中，字符串（String）是经过加工的**成品**（UTF-8 编码）。
> 而 **Buffer** 是**原材料**（原始二进制数据）。
> 当你从文件系统或网络读取数据时，你拿到的首先是原材料（010101...）。
> 就像你买家具，有时候买到的是组装好的椅子（String），有时候买到的是一堆木板和螺丝（Buffer）。
> 处理图片、视频或底层协议时，你必须学会直接操作木板和螺丝。

```typescript
import * as path from 'path';

console.log('[INFO] 路径操作示例:');

// 拼接路径
const fullPath = path.join('/users', 'alice', 'documents', 'file.txt');
console.log(`[LOG] 拼接路径: ${fullPath}`);

// 解析路径
const parsed = path.parse('/users/alice/documents/file.txt');
console.log(`[LOG] 路径解析: ${JSON.stringify(parsed, null, 2)}`);
// {
//   root: '/',
//   dir: '/users/alice/documents',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// 获取文件扩展名
const ext = path.extname('file.txt');
console.log(`[LOG] 扩展名: ${ext}`);

// 获取文件名
const basename = path.basename('/users/alice/file.txt');
console.log(`[LOG] 文件名: ${basename}`);

// 获取目录名
const dirname = path.dirname('/users/alice/file.txt');
console.log(`[LOG] 目录名: ${dirname}`);

// 规范化路径
const normalized = path.normalize('/users/alice/../bob/./file.txt');
console.log(`[LOG] 规范化路径: ${normalized}`);

// 获取相对路径
const relative = path.relative('/users/alice', '/users/bob/file.txt');
console.log(`[LOG] 相对路径: ${relative}`);

// 解析为绝对路径
const absolute = path.resolve('file.txt');
console.log(`[LOG] 绝对路径: ${absolute}`);
```

### 3.5 流（Streams）

> **🚰 The Metaphor: The Water Hose**
> Stream 是处理大数据的**水管**。
> *   **Buffer**: 就像用水桶接水。你必须等水桶满了（文件全部读入内存），才能把水倒进浴缸。如果文件太大（几个 GB），水桶（内存）就爆了。
> *   **Stream**: 就像直接接一根水管。水（数据）源源不断地流过来，你一边接，一边用（处理）。
> *   **Backpressure (背压)**: 如果水龙头开得太大（读取太快），下水道流不走（写入太慢），水就会溢出来。Node.js 的 `pipe` 会自动调节阀门：如果下水道堵了，就先把水龙头关小点（暂停读取）。

```typescript
import * as fs from 'fs';

// 读取流（适合大文件）
function readLargeFile(filepath: string): void {
  console.log(`[INFO] 使用流读取大文件: ${filepath}`);
  
  const readStream = fs.createReadStream(filepath, {
    encoding: 'utf-8',
    highWaterMark: 64 * 1024  // 64KB 缓冲区
  });
  
  let bytesRead = 0;
  
  readStream.on('data', (chunk: string) => {
    bytesRead += chunk.length;
    console.log(`[TRACE] 读取数据块，已读: ${bytesRead} 字节`);
  });
  
  readStream.on('end', () => {
    console.log(`[SUCCESS] 文件读取完成，总计: ${bytesRead} 字节`);
  });
  
  readStream.on('error', (error) => {
    console.log(`[ERROR] 读取失败: ${error.message}`);
  });
}

// 写入流
function writeLargeFile(filepath: string, data: string[]): void {
  console.log(`[INFO] 使用流写入文件: ${filepath}`);
  
  const writeStream = fs.createWriteStream(filepath, {
    encoding: 'utf-8'
  });
  
  data.forEach((chunk, index) => {
    const canWrite = writeStream.write(chunk);
    console.log(`[TRACE] 写入数据块 ${index + 1}, 缓冲区可写: ${canWrite}`);
    
    if (!canWrite) {
      console.log('[WARNING] 缓冲区已满，暂停写入');
      writeStream.once('drain', () => {
        console.log('[INFO] 缓冲区已清空，继续写入');
      });
    }
  });
  
  writeStream.end(() => {
    console.log('[SUCCESS] 文件写入完成');
  });
  
  writeStream.on('error', (error) => {
    console.log(`[ERROR] 写入失败: ${error.message}`);
  });
}

// 管道（复制文件）
function copyFile(source: string, destination: string): void {
  console.log(`[INFO] 复制文件: ${source} -> ${destination}`);
  
  const readStream = fs.createReadStream(source);
  const writeStream = fs.createWriteStream(destination);
  
  readStream.pipe(writeStream);
  
  writeStream.on('finish', () => {
    console.log('[SUCCESS] 文件复制完成');
  });
  
  readStream.on('error', (error) => {
    console.log(`[ERROR] 读取失败: ${error.message}`);
  });
  
  writeStream.on('error', (error) => {
    console.log(`[ERROR] 写入失败: ${error.message}`);
  });
}
```

## 4. HTTP 模块

### 4.1 创建简单的 HTTP 服务器

```typescript
import * as http from 'http';

const PORT = 3000;

// 创建服务器
const server = http.createServer((req, res) => {
  console.log(`[INFO] 收到请求: ${req.method} ${req.url}`);
  console.log(`[DEBUG] 请求头: ${JSON.stringify(req.headers)}`);
  
  // 设置响应头
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Custom-Header', 'Node.js Server');
  
  // 设置状态码
  res.statusCode = 200;
  
  // 发送响应
  res.end('你好，这是来自 Node.js 的响应！\n');
  
  console.log('[SUCCESS] 响应已发送');
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`[INFO] 服务器运行在 http://localhost:${PORT}`);
});

// 错误处理
server.on('error', (error) => {
  console.log(`[ERROR] 服务器错误: ${error.message}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('[INFO] 收到 SIGTERM 信号，开始优雅关闭');
  server.close(() => {
    console.log('[INFO] 服务器已关闭');
    process.exit(0);
  });
});
```

### 4.2 路由处理

```typescript
import * as http from 'http';
import * as url from 'url';

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  console.log(`[INFO] 路由: ${pathname}, 查询参数: ${JSON.stringify(query)}`);
  
  // 路由处理
  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>首页</h1>');
    
  } else if (pathname === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    res.end(JSON.stringify(users));
    console.log('[INFO] 返回用户列表');
    
  } else if (pathname === '/api/echo') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(query));
    console.log(`[INFO] 回显查询参数: ${JSON.stringify(query)}`);
    
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - 页面未找到');
    console.log(`[WARNING] 404: ${pathname}`);
  }
});

server.listen(3000, () => {
  console.log('[INFO] 服务器运行在 http://localhost:3000');
});
```

### 4.3 处理 POST 请求

```typescript
import * as http from 'http';

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/data') {
    console.log('[INFO] 处理 POST 请求');
    
    let body = '';
    
    // 接收数据
    req.on('data', (chunk) => {
      body += chunk.toString();
      console.log(`[TRACE] 接收数据块，大小: ${chunk.length}`);
    });
    
    // 数据接收完成
    req.on('end', () => {
      console.log(`[INFO] 接收完成，总大小: ${body.length} 字节`);
      
      try {
        const data = JSON.parse(body);
        console.log(`[DEBUG] 解析数据: ${JSON.stringify(data)}`);
        
        // 处理数据
        const response = {
          success: true,
          received: data,
          timestamp: new Date().toISOString()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        console.log('[SUCCESS] 响应已发送');
        
      } catch (error) {
        console.log(`[ERROR] JSON 解析失败: ${error}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '无效的 JSON 数据' }));
      }
    });
    
    // 错误处理
    req.on('error', (error) => {
      console.log(`[ERROR] 请求错误: ${error.message}`);
      res.writeHead(500);
      res.end();
    });
    
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    console.log(`[WARNING] 不支持的方法: ${req.method}`);
  }
});

server.listen(3000);
```

## 5. Express 框架

Express 是 Node.js 最流行的 Web 框架，简化了 Web 应用开发。

### 5.1 安装和基本使用

```bash
# 安装 Express
npm install express
npm install --save-dev @types/express
```

```typescript
import express, { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = 3000;

// 中间件：解析 JSON
app.use(express.json());
console.log('[INFO] JSON 中间件已加载');

// 中间件：解析 URL 编码数据
app.use(express.urlencoded({ extended: true }));
console.log('[INFO] URL 编码中间件已加载');

// 中间件：日志
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 基本路由
app.get('/', (req: Request, res: Response) => {
  console.log('[INFO] 处理首页请求');
  res.send('欢迎使用 Express!');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`[INFO] Express 服务器运行在 http://localhost:${PORT}`);
});
```

### 5.2 路由

```typescript
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// GET 请求
app.get('/api/users', (req: Request, res: Response) => {
  console.log('[INFO] 获取用户列表');
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ];
  res.json(users);
});

// GET 请求（带路径参数）
app.get('/api/users/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  console.log(`[INFO] 获取用户 ID: ${userId}`);
  
  // 模拟数据库查询
  const user = { id: userId, name: 'Alice', email: 'alice@example.com' };
  res.json(user);
});

// GET 请求（带查询参数）
app.get('/api/search', (req: Request, res: Response) => {
  const { q, page = '1', limit = '10' } = req.query;
  console.log(`[INFO] 搜索: q=${q}, page=${page}, limit=${limit}`);
  
  res.json({
    query: q,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    results: []
  });
});

// POST 请求
app.post('/api/users', (req: Request, res: Response) => {
  console.log('[INFO] 创建新用户');
  const { name, email } = req.body;
  console.log(`[DEBUG] 用户数据: name=${name}, email=${email}`);
  
  // 模拟创建用户
  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date()
  };
  
  console.log('[SUCCESS] 用户创建成功');
  res.status(201).json(newUser);
});

// PUT 请求（更新）
app.put('/api/users/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  console.log(`[INFO] 更新用户 ID: ${userId}`);
  
  const { name, email } = req.body;
  console.log(`[DEBUG] 更新数据: name=${name}, email=${email}`);
  
  const updatedUser = {
    id: userId,
    name,
    email,
    updatedAt: new Date()
  };
  
  console.log('[SUCCESS] 用户更新成功');
  res.json(updatedUser);
});

// DELETE 请求
app.delete('/api/users/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  console.log(`[INFO] 删除用户 ID: ${userId}`);
  
  // 模拟删除操作
  console.log('[SUCCESS] 用户删除成功');
  res.status(204).send();
});

app.listen(3000);
```

### 5.3 中间件

> **🧅 The Metaphor: The Onion Model**
> Express 的中间件就像是**洋葱的层**。
> 一个请求（Request）进来，必须穿过一层层的中间件。
> *   第一层：记录日志。
> *   第二层：检查身份（Auth）。
> *   第三层：解析数据（Body Parser）。
> *   ...
> *   核心：处理业务逻辑（Route Handler）。
> 
> 处理完后，响应（Response）再穿过这些层发出去。
> 每一层都可以**拦截**请求，或者**修改**请求，或者直接**响应**（比如发现没权限，直接打回）。
> 这种**管道 (Pipeline)** 机制让我们可以把复杂的逻辑拆解成一个个独立、可复用的小插件。

```typescript
import express, { Request, Response, NextFunction } from 'express';

const app = express();

// 1. 应用级中间件（所有请求）
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[MIDDLEWARE] 全局中间件: ${req.method} ${req.url}`);
  next();
});

// 2. 路径特定中间件
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  console.log('[MIDDLEWARE] API 中间件');
  next();
});

// 3. 日志中间件
const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[LOG] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

app.use(logger);

// 4. 认证中间件
interface AuthRequest extends Request {
  user?: { id: number; name: string };
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('[MIDDLEWARE] 认证检查');
  const token = req.headers.authorization;
  
  if (!token) {
    console.log('[WARNING] 缺少认证令牌');
    res.status(401).json({ error: '未认证' });
    return;
  }
  
  // 模拟验证令牌
  req.user = { id: 1, name: 'Alice' };
  console.log('[SUCCESS] 认证成功');
  next();
};

// 受保护的路由
app.get('/api/profile', authenticate, (req: AuthRequest, res: Response) => {
  console.log(`[INFO] 获取用户资料: ${req.user?.name}`);
  res.json(req.user);
});

// 5. 错误处理中间件（必须有 4 个参数）
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(`[ERROR] 错误处理中间件: ${err.message}`);
  console.error(err.stack);
  
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 6. 404 处理
app.use((req: Request, res: Response) => {
  console.log(`[WARNING] 404: ${req.url}`);
  res.status(404).json({ error: '路由未找到' });
});

app.listen(3000);
```

### 5.4 路由模块化

```typescript
// routes/users.ts
import express, { Request, Response } from 'express';

const router = express.Router();

// 中间件（只对这个路由生效）
router.use((req, res, next) => {
  console.log('[MIDDLEWARE] Users 路由中间件');
  next();
});

router.get('/', (req: Request, res: Response) => {
  console.log('[INFO] 获取所有用户');
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`[INFO] 获取用户: ${id}`);
  res.json({ id, name: 'Alice' });
});

router.post('/', (req: Request, res: Response) => {
  console.log('[INFO] 创建用户');
  const { name, email } = req.body;
  res.status(201).json({ id: Date.now(), name, email });
});

export default router;

// app.ts
import express from 'express';
import usersRouter from './routes/users';

const app = express();
app.use(express.json());

// 挂载路由模块
app.use('/api/users', usersRouter);

console.log('[INFO] 用户路由已挂载到 /api/users');

app.listen(3000, () => {
  console.log('[INFO] 服务器已启动');
});
```

## 6. NPM/Yarn 包管理

### 6.1 package.json

```json
{
  "name": "my-nodejs-app",
  "version": "1.0.0",
  "description": "Node.js 学习项目",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}
```

### 6.2 NPM 常用命令

```bash
# 初始化项目
npm init
npm init -y  # 使用默认值

# 安装依赖
npm install                    # 安装所有依赖
npm install express            # 安装生产依赖
npm install -D typescript      # 安装开发依赖
npm install -g nodemon         # 全局安装

# 卸载依赖
npm uninstall express

# 更新依赖
npm update                     # 更新所有
npm update express             # 更新指定包

# 查看信息
npm list                       # 查看已安装的包
npm outdated                   # 查看过时的包
npm audit                      # 安全审计

# 运行脚本
npm run dev
npm start
npm test

# 清理
npm cache clean --force        # 清理缓存
```

### 6.3 环境变量

```typescript
// .env 文件
// PORT=3000
// NODE_ENV=development
// DATABASE_URL=mongodb://localhost:27017/myapp
// SECRET_KEY=your-secret-key

// 安装 dotenv
// npm install dotenv
// npm install -D @types/dotenv

import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();
console.log('[INFO] 环境变量已加载');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;
const SECRET_KEY = process.env.SECRET_KEY;

console.log(`[INFO] 端口: ${PORT}`);
console.log(`[INFO] 环境: ${NODE_ENV}`);
console.log(`[INFO] 数据库: ${DATABASE_URL}`);

// 使用环境变量
import express from 'express';

const app = express();

app.listen(PORT, () => {
  console.log(`[INFO] 服务器运行在端口 ${PORT}`);
  console.log(`[INFO] 环境: ${NODE_ENV}`);
});
```

## 7. 实践练习

### 练习 1：文件管理工具

创建一个命令行工具，实现文件的读取、写入和列表功能。

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

class FileManager {
  async listFiles(dirPath: string): Promise<string[]> {
    console.log(`[INFO] 列出目录: ${dirPath}`);
    try {
      const files = await fs.readdir(dirPath);
      console.log(`[SUCCESS] 找到 ${files.length} 个文件`);
      return files;
    } catch (error) {
      console.log(`[ERROR] 读取目录失败: ${error}`);
      throw error;
    }
  }
  
  async readFile(filePath: string): Promise<string> {
    console.log(`[INFO] 读取文件: ${filePath}`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(`[SUCCESS] 文件大小: ${content.length} 字节`);
      return content;
    } catch (error) {
      console.log(`[ERROR] 读取文件失败: ${error}`);
      throw error;
    }
  }
  
  async writeFile(filePath: string, content: string): Promise<void> {
    console.log(`[INFO] 写入文件: ${filePath}`);
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log('[SUCCESS] 文件写入成功');
    } catch (error) {
      console.log(`[ERROR] 写入文件失败: ${error}`);
      throw error;
    }
  }
}

// 测试
const manager = new FileManager();
await manager.listFiles('./');
```

### 练习 2：简单的 REST API

创建一个完整的用户管理 REST API。

```typescript
import express, { Request, Response } from 'express';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

const app = express();
app.use(express.json());

// 内存数据库
let users: User[] = [];
let nextId = 1;

// 获取所有用户
app.get('/api/users', (req: Request, res: Response) => {
  console.log('[INFO] 获取所有用户');
  res.json(users);
});

// 获取单个用户
app.get('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    console.log(`[WARNING] 用户不存在: ${id}`);
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  
  console.log(`[INFO] 返回用户: ${user.name}`);
  res.json(user);
});

// 创建用户
app.post('/api/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    console.log('[WARNING] 缺少必需字段');
    res.status(400).json({ error: '缺少 name 或 email' });
    return;
  }
  
  const newUser: User = {
    id: nextId++,
    name,
    email,
    createdAt: new Date()
  };
  
  users.push(newUser);
  console.log(`[SUCCESS] 创建用户: ${newUser.name}`);
  res.status(201).json(newUser);
});

// 更新用户
app.put('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    console.log(`[WARNING] 用户不存在: ${id}`);
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  
  const { name, email } = req.body;
  users[index] = { ...users[index], name, email };
  
  console.log(`[SUCCESS] 更新用户: ${users[index].name}`);
  res.json(users[index]);
});

// 删除用户
app.delete('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    console.log(`[WARNING] 用户不存在: ${id}`);
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  
  users.splice(index, 1);
  console.log(`[SUCCESS] 删除用户: ${id}`);
  res.status(204).send();
});

app.listen(3000, () => {
  console.log('[INFO] 用户API运行在 http://localhost:3000');
});
```

## 8. 常见问题解答

**Q: 同步方法和异步方法该如何选择？**

A:
- 优先使用异步方法（Promise 版本），避免阻塞事件循环
- 只在脚本启动时或简单工具中使用同步方法
- 异步方法性能更好，特别是在高并发场景

**Q: 什么时候使用流（Stream）？**

A:
- 处理大文件时（避免一次性加载到内存）
- 实时处理数据时（如日志、视频流）
- 需要节省内存时

**Q: Express 中间件的执行顺序？**

A:
- 按照 `app.use()` 定义的顺序执行
- 路由中间件在路由匹配后执行
- 错误处理中间件最后定义

## 9. 最佳实践

### 9.1 错误处理

```typescript
// ✅ 推荐：使用 try-catch
async function safeReadFile(filepath: string): Promise<string | null> {
  try {
    const content = await fs.promises.readFile(filepath, 'utf-8');
    console.log('[SUCCESS] 文件读取成功');
    return content;
  } catch (error) {
    console.log(`[ERROR] 读取失败: ${error}`);
    return null;
  }
}

// ❌ 不推荐：忽略错误
async function unsafeReadFile(filepath: string): Promise<string> {
  return await fs.promises.readFile(filepath, 'utf-8');
}
```

### 9.2 环境配置

```typescript
// ✅ 推荐：使用环境变量
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ❌ 不推荐：硬编码配置
const PORT = 3000;
```

### 9.3 日志

```typescript
// ✅ 推荐：结构化日志
console.log(`[INFO] 服务器启动 - 端口: ${PORT}, 环境: ${NODE_ENV}`);

// ❌ 不推荐：简单日志
console.log('服务器启动了');
```

## 10. 小结

本章我们学习了 Node.js 的核心知识：

- ✅ Node.js 环境和全局对象
- ✅ 文件系统操作（读写、目录、流）
- ✅ HTTP 模块和服务器创建
- ✅ Express 框架和中间件
- ✅ NPM/Yarn 包管理

掌握这些知识后，你就可以开发服务器端应用了。

## 11. 下一步

- 阅读下一章：[异步编程进阶](../04-async-advanced/README.md)
- 完成练习题：[Node.js 练习](../exercises/README.md#nodejs-基础)
- 参考资源：[Node.js 官方文档](https://nodejs.org/docs/)
