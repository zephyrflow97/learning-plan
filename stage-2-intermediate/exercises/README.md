# 阶段 2 练习题和评估

## 概述

本文档包含阶段 2（进阶级 - TypeScript 入门）的所有练习题和自我评估测试。通过完成这些练习，你将巩固所学的 TypeScript、ES6+、Node.js 和异步编程知识。

## TypeScript 基础

### 练习 1：类型定义

定义一个图书管理系统的类型：

```typescript
// 任务：定义以下接口和类型

// 1. 作者接口
interface Author {
  // 你的代码
}

// 2. 图书接口
interface Book {
  // 你的代码
}

// 3. 借阅记录接口
interface BorrowRecord {
  // 你的代码
}

// 4. 图书状态类型（可用、已借出、维护中）
type BookStatus = // 你的代码

// 测试代码
const author: Author = {
  id: 1,
  name: "张三",
  nationality: "中国"
};

const book: Book = {
  id: 1,
  title: "TypeScript 实战",
  author: author,
  isbn: "978-1234567890",
  publishedYear: 2023,
  status: "available"
};
```

<details>
<summary>参考答案</summary>

```typescript
interface Author {
  id: number;
  name: string;
  nationality: string;
  birthYear?: number;
}

interface Book {
  id: number;
  title: string;
  author: Author;
  isbn: string;
  publishedYear: number;
  status: BookStatus;
  borrowedBy?: number;  // 用户 ID
}

interface BorrowRecord {
  id: number;
  bookId: number;
  userId: number;
  borrowDate: Date;
  returnDate?: Date;
  dueDate: Date;
}

type BookStatus = "available" | "borrowed" | "maintenance";
```
</details>

### 练习 2：泛型实现

实现一个泛型的数组工具类：

```typescript
class ArrayUtils<T> {
  // 1. 实现一个方法，返回数组中的第一个元素
  first(arr: T[]): T | undefined {
    // 你的代码
  }
  
  // 2. 实现一个方法，返回数组中的最后一个元素
  last(arr: T[]): T | undefined {
    // 你的代码
  }
  
  // 3. 实现一个方法，返回数组中满足条件的第一个元素
  find(arr: T[], predicate: (item: T) => boolean): T | undefined {
    // 你的代码
  }
  
  // 4. 实现一个方法，返回数组的分组结果
  groupBy<K extends string | number>(
    arr: T[],
    keySelector: (item: T) => K
  ): Record<K, T[]> {
    // 你的代码
  }
}

// 测试
const utils = new ArrayUtils<number>();
console.log(utils.first([1, 2, 3]));  // 1
console.log(utils.last([1, 2, 3]));   // 3
console.log(utils.find([1, 2, 3, 4], n => n > 2));  // 3
```

<details>
<summary>参考答案</summary>

```typescript
class ArrayUtils<T> {
  first(arr: T[]): T | undefined {
    console.log(`[TRACE] 获取第一个元素`);
    return arr.length > 0 ? arr[0] : undefined;
  }
  
  last(arr: T[]): T | undefined {
    console.log(`[TRACE] 获取最后一个元素`);
    return arr.length > 0 ? arr[arr.length - 1] : undefined;
  }
  
  find(arr: T[], predicate: (item: T) => boolean): T | undefined {
    console.log(`[TRACE] 查找满足条件的元素`);
    for (const item of arr) {
      if (predicate(item)) {
        console.log(`[DEBUG] 找到元素: ${item}`);
        return item;
      }
    }
    console.log(`[DEBUG] 未找到满足条件的元素`);
    return undefined;
  }
  
  groupBy<K extends string | number>(
    arr: T[],
    keySelector: (item: T) => K
  ): Record<K, T[]> {
    console.log(`[TRACE] 分组数组，元素数量: ${arr.length}`);
    const result = {} as Record<K, T[]>;
    
    for (const item of arr) {
      const key = keySelector(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }
    
    console.log(`[INFO] 分组完成，组数: ${Object.keys(result).length}`);
    return result;
  }
}
```
</details>

### 练习 3：类型守卫

实现类型守卫函数：

```typescript
// 定义类型
interface User {
  type: 'user';
  id: number;
  name: string;
  email: string;
}

interface Admin {
  type: 'admin';
  id: number;
  name: string;
  permissions: string[];
}

type Person = User | Admin;

// 1. 实现类型守卫，判断是否为 User
function isUser(person: Person): person is User {
  // 你的代码
}

// 2. 实现类型守卫，判断是否为 Admin
function isAdmin(person: Person): person is Admin {
  // 你的代码
}

// 3. 实现一个函数，根据类型执行不同操作
function greet(person: Person): string {
  // 你的代码
}

// 测试
const user: User = {
  type: 'user',
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
};

const admin: Admin = {
  type: 'admin',
  id: 2,
  name: 'Bob',
  permissions: ['read', 'write', 'delete']
};

console.log(greet(user));   // "Hello, Alice (User)"
console.log(greet(admin));  // "Hello, Bob (Admin with 3 permissions)"
```

<details>
<summary>参考答案</summary>

```typescript
function isUser(person: Person): person is User {
  console.log(`[TRACE] 检查是否为 User 类型`);
  return person.type === 'user';
}

function isAdmin(person: Person): person is Admin {
  console.log(`[TRACE] 检查是否为 Admin 类型`);
  return person.type === 'admin';
}

function greet(person: Person): string {
  console.log(`[INFO] 问候: ${person.name}`);
  
  if (isUser(person)) {
    return `Hello, ${person.name} (User)`;
  } else if (isAdmin(person)) {
    return `Hello, ${person.name} (Admin with ${person.permissions.length} permissions)`;
  }
  
  return `Hello, ${person.name}`;
}
```
</details>

## ES6+ 现代特性

### 练习 4：类和继承

实现一个形状类层次结构：

```typescript
// 1. 创建抽象基类 Shape
abstract class Shape {
  // 你的代码
}

// 2. 创建 Circle 类
class Circle extends Shape {
  // 你的代码
}

// 3. 创建 Rectangle 类
class Rectangle extends Shape {
  // 你的代码
}

// 测试
const circle = new Circle('red', 5);
console.log(circle.calculateArea());       // π * 5^2 ≈ 78.54
console.log(circle.calculatePerimeter());  // 2 * π * 5 ≈ 31.42

const rectangle = new Rectangle('blue', 4, 6);
console.log(rectangle.calculateArea());       // 24
console.log(rectangle.calculatePerimeter());  // 20
```

<details>
<summary>参考答案</summary>

```typescript
abstract class Shape {
  constructor(protected color: string) {
    console.log(`[INFO] 创建形状，颜色: ${color}`);
  }
  
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;
  
  getColor(): string {
    return this.color;
  }
  
  describe(): string {
    return `这是一个${this.color}的形状，面积: ${this.calculateArea().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(color: string, private radius: number) {
    super(color);
    console.log(`[INFO] 创建圆形，半径: ${radius}`);
  }
  
  calculateArea(): number {
    const area = Math.PI * this.radius ** 2;
    console.log(`[TRACE] 计算圆形面积: ${area}`);
    return area;
  }
  
  calculatePerimeter(): number {
    const perimeter = 2 * Math.PI * this.radius;
    console.log(`[TRACE] 计算圆形周长: ${perimeter}`);
    return perimeter;
  }
}

class Rectangle extends Shape {
  constructor(
    color: string,
    private width: number,
    private height: number
  ) {
    super(color);
    console.log(`[INFO] 创建矩形，宽: ${width}, 高: ${height}`);
  }
  
  calculateArea(): number {
    const area = this.width * this.height;
    console.log(`[TRACE] 计算矩形面积: ${area}`);
    return area;
  }
  
  calculatePerimeter(): number {
    const perimeter = 2 * (this.width + this.height);
    console.log(`[TRACE] 计算矩形周长: ${perimeter}`);
    return perimeter;
  }
}
```
</details>

### 练习 5：Map 和 Set 应用

实现一个缓存管理器：

```typescript
class CacheManager<K, V> {
  private cache: Map<K, V>;
  private accessCount: Map<K, number>;
  
  constructor(private maxSize: number) {
    // 你的代码
  }
  
  // 设置缓存
  set(key: K, value: V): void {
    // 你的代码
    // 提示：如果缓存满了，删除访问次数最少的项
  }
  
  // 获取缓存
  get(key: K): V | undefined {
    // 你的代码
    // 提示：每次访问时增加访问计数
  }
  
  // 检查是否存在
  has(key: K): boolean {
    // 你的代码
  }
  
  // 获取缓存大小
  size(): number {
    // 你的代码
  }
  
  // 清空缓存
  clear(): void {
    // 你的代码
  }
  
  // 获取访问次数最多的键
  getMostAccessed(): K | undefined {
    // 你的代码
  }
}

// 测试
const cache = new CacheManager<string, any>(3);
cache.set('user:1', { name: 'Alice' });
cache.set('user:2', { name: 'Bob' });
cache.set('user:3', { name: 'Charlie' });
cache.get('user:1');  // 访问
cache.get('user:1');  // 再次访问
cache.set('user:4', { name: 'David' });  // 应该删除 user:2 或 user:3
```

<details>
<summary>参考答案（查看完整实现）</summary>

```typescript
class CacheManager<K, V> {
  private cache: Map<K, V>;
  private accessCount: Map<K, number>;
  
  constructor(private maxSize: number) {
    console.log(`[INFO] 创建缓存管理器，最大容量: ${maxSize}`);
    this.cache = new Map();
    this.accessCount = new Map();
  }
  
  set(key: K, value: V): void {
    console.log(`[INFO] 设置缓存: ${String(key)}`);
    
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // 缓存已满，删除访问次数最少的项
      const leastAccessed = this.getLeastAccessed();
      if (leastAccessed !== undefined) {
        console.log(`[INFO] 缓存已满，删除最少访问的项: ${String(leastAccessed)}`);
        this.cache.delete(leastAccessed);
        this.accessCount.delete(leastAccessed);
      }
    }
    
    this.cache.set(key, value);
    if (!this.accessCount.has(key)) {
      this.accessCount.set(key, 0);
    }
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    
    if (value !== undefined) {
      // 增加访问计数
      const count = this.accessCount.get(key) || 0;
      this.accessCount.set(key, count + 1);
      console.log(`[DEBUG] 缓存命中: ${String(key)}, 访问次数: ${count + 1}`);
    } else {
      console.log(`[DEBUG] 缓存未命中: ${String(key)}`);
    }
    
    return value;
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  size(): number {
    return this.cache.size;
  }
  
  clear(): void {
    console.log('[INFO] 清空缓存');
    this.cache.clear();
    this.accessCount.clear();
  }
  
  getMostAccessed(): K | undefined {
    let mostKey: K | undefined;
    let maxCount = 0;
    
    for (const [key, count] of this.accessCount.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostKey = key;
      }
    }
    
    console.log(`[INFO] 最多访问的键: ${String(mostKey)}, 次数: ${maxCount}`);
    return mostKey;
  }
  
  private getLeastAccessed(): K | undefined {
    let leastKey: K | undefined;
    let minCount = Infinity;
    
    for (const [key, count] of this.accessCount.entries()) {
      if (count < minCount) {
        minCount = count;
        leastKey = key;
      }
    }
    
    return leastKey;
  }
}
```
</details>

## Node.js 基础

### 练习 6：文件操作

实现一个日志管理器：

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

class LogManager {
  constructor(private logDir: string) {
    // 你的代码：确保日志目录存在
  }
  
  // 写入日志
  async log(level: 'INFO' | 'WARNING' | 'ERROR', message: string): Promise<void> {
    // 你的代码
    // 提示：日志格式 "[2024-01-01 12:00:00] [INFO] 消息"
    // 日志文件按日期命名，如 "2024-01-01.log"
  }
  
  // 读取指定日期的日志
  async readLogs(date: string): Promise<string> {
    // 你的代码
  }
  
  // 清理旧日志（保留最近 N 天）
  async cleanOldLogs(daysToKeep: number): Promise<number> {
    // 你的代码
    // 返回删除的文件数量
  }
}

// 测试
const logger = new LogManager('./logs');
await logger.log('INFO', '应用程序启动');
await logger.log('ERROR', '发生错误');
const logs = await logger.readLogs('2024-01-01');
const deleted = await logger.cleanOldLogs(7);
```

<details>
<summary>参考答案</summary>

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

class LogManager {
  constructor(private logDir: string) {
    this.init();
  }
  
  private async init(): Promise<void> {
    console.log(`[INFO] 初始化日志管理器，目录: ${this.logDir}`);
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      console.log('[SUCCESS] 日志目录就绪');
    } catch (error) {
      console.log(`[ERROR] 创建日志目录失败: ${error}`);
      throw error;
    }
  }
  
  async log(level: 'INFO' | 'WARNING' | 'ERROR', message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    const logFile = path.join(this.logDir, `${date}.log`);
    
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    console.log(`[TRACE] 写入日志: ${logEntry.trim()}`);
    
    try {
      await fs.appendFile(logFile, logEntry, 'utf-8');
    } catch (error) {
      console.log(`[ERROR] 写入日志失败: ${error}`);
      throw error;
    }
  }
  
  async readLogs(date: string): Promise<string> {
    const logFile = path.join(this.logDir, `${date}.log`);
    console.log(`[INFO] 读取日志文件: ${logFile}`);
    
    try {
      const content = await fs.readFile(logFile, 'utf-8');
      console.log(`[SUCCESS] 读取成功，大小: ${content.length} 字节`);
      return content;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log(`[WARNING] 日志文件不存在: ${date}`);
        return '';
      }
      console.log(`[ERROR] 读取日志失败: ${error}`);
      throw error;
    }
  }
  
  async cleanOldLogs(daysToKeep: number): Promise<number> {
    console.log(`[INFO] 清理旧日志，保留天数: ${daysToKeep}`);
    
    try {
      const files = await fs.readdir(this.logDir);
      const now = Date.now();
      const keepTime = daysToKeep * 24 * 60 * 60 * 1000;
      let deleted = 0;
      
      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        
        const filePath = path.join(this.logDir, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtime.getTime();
        
        if (age > keepTime) {
          await fs.unlink(filePath);
          deleted++;
          console.log(`[INFO] 删除旧日志: ${file}`);
        }
      }
      
      console.log(`[SUCCESS] 清理完成，删除 ${deleted} 个文件`);
      return deleted;
    } catch (error) {
      console.log(`[ERROR] 清理日志失败: ${error}`);
      throw error;
    }
  }
}
```
</details>

## 异步编程进阶

### 练习 7：Promise 链式调用

实现一个数据处理管道：

```typescript
// 模拟异步操作
function fetchData(): Promise<string[]> {
  return Promise.resolve(['apple', 'banana', 'cherry', 'date']);
}

function filterData(data: string[]): Promise<string[]> {
  // 过滤长度大于 5 的项
  // 你的代码
}

function transformData(data: string[]): Promise<string[]> {
  // 转换为大写
  // 你的代码
}

function saveData(data: string[]): Promise<void> {
  // 保存数据
  // 你的代码
}

// 使用 Promise 链式调用实现管道
async function pipeline() {
  // 你的代码
}

pipeline();
```

<details>
<summary>参考答案</summary>

```typescript
function fetchData(): Promise<string[]> {
  console.log('[INFO] 获取数据');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('[SUCCESS] 数据获取成功');
      resolve(['apple', 'banana', 'cherry', 'date']);
    }, 100);
  });
}

function filterData(data: string[]): Promise<string[]> {
  console.log(`[INFO] 过滤数据，原始数量: ${data.length}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const filtered = data.filter(item => item.length > 5);
      console.log(`[SUCCESS] 过滤完成，剩余: ${filtered.length}`);
      resolve(filtered);
    }, 100);
  });
}

function transformData(data: string[]): Promise<string[]> {
  console.log(`[INFO] 转换数据，数量: ${data.length}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const transformed = data.map(item => item.toUpperCase());
      console.log('[SUCCESS] 数据转换完成');
      resolve(transformed);
    }, 100);
  });
}

function saveData(data: string[]): Promise<void> {
  console.log(`[INFO] 保存数据，数量: ${data.length}`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`[SUCCESS] 数据已保存: ${data}`);
      resolve();
    }, 100);
  });
}

async function pipeline() {
  console.log('[INFO] 开始数据处理管道');
  
  try {
    const data = await fetchData();
    const filtered = await filterData(data);
    const transformed = await transformData(filtered);
    await saveData(transformed);
    console.log('[SUCCESS] 管道执行完成');
  } catch (error) {
    console.log(`[ERROR] 管道执行失败: ${error}`);
  }
}
```
</details>

### 练习 8：并发控制

实现一个支持并发限制的批量操作函数：

```typescript
async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  // 你的代码
  // 提示：最多同时处理 concurrency 个项目
}

// 测试
const urls = [
  'url1', 'url2', 'url3', 'url4', 'url5',
  'url6', 'url7', 'url8', 'url9', 'url10'
];

const results = await batchProcess(
  urls,
  async (url) => {
    console.log(`处理: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `结果: ${url}`;
  },
  3  // 最多同时处理 3 个
);

console.log(results);
```

<details>
<summary>参考答案</summary>

```typescript
async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  console.log(`[INFO] 批量处理，总数: ${items.length}, 并发数: ${concurrency}`);
  
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    const promise = processor(item).then(result => {
      results[i] = result;
      console.log(`[TRACE] 完成 ${i + 1}/${items.length}`);
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      console.log(`[DEBUG] 达到并发限制 ${concurrency}，等待...`);
      await Promise.race(executing);
      
      // 移除已完成的 Promise
      const stillExecuting = executing.filter(p => {
        // 检查 Promise 是否还在执行中
        return new Promise(resolve => {
          p.then(() => resolve(false)).catch(() => resolve(false));
          Promise.resolve().then(() => resolve(true));
        });
      });
      
      executing.length = 0;
      executing.push(...stillExecuting);
    }
  }
  
  await Promise.all(executing);
  console.log('[SUCCESS] 批量处理完成');
  return results;
}
```
</details>

## 综合项目练习

### 练习 9：完整的 CLI 工具

创建一个命令行任务管理工具，支持：

- 添加任务：`node task.js add "任务标题"`
- 列出任务：`node task.js list`
- 完成任务：`node task.js done <id>`
- 删除任务：`node task.js delete <id>`
- 数据持久化到 JSON 文件

提示：
- 使用 `process.argv` 获取命令行参数
- 使用文件系统 API 保存和加载数据
- 使用 TypeScript 定义数据类型

## 自我评估测试

### 选择题

**1. 以下哪个不是 TypeScript 的基本类型？**
- A. number
- B. string
- C. int
- D. boolean

<details>
<summary>答案</summary>
C. TypeScript 没有 int 类型，只有 number 类型。
</details>

**2. `interface` 和 `type` 的主要区别是什么？**
- A. interface 可以声明合并，type 不可以
- B. type 可以使用联合类型，interface 不可以
- C. 两者都可以定义对象形状
- D. 以上都对

<details>
<summary>答案</summary>
D. 所有选项都正确。
</details>

**3. 下列哪个方法会阻塞事件循环？**
- A. fs.readFile()
- B. fs.readFileSync()
- C. fs.promises.readFile()
- D. 以上都不会

<details>
<summary>答案</summary>
B. `fs.readFileSync()` 是同步方法，会阻塞事件循环。
</details>

**4. Promise.all 和 Promise.allSettled 的区别是？**
- A. Promise.all 在任何一个 Promise 失败时立即拒绝
- B. Promise.allSettled 等待所有 Promise 完成（无论成功或失败）
- C. Promise.all 返回结果数组
- D. 以上都对

<details>
<summary>答案</summary>
D. 所有描述都正确。
</details>

**5. 在 Express 中，中间件的执行顺序是？**
- A. 按照 app.use() 的调用顺序
- B. 随机顺序
- C. 按照字母顺序
- D. 按照优先级

<details>
<summary>答案</summary>
A. 中间件按照 `app.use()` 的调用顺序执行。
</details>

### 编程题

**题目：实现一个简单的 Promise 重试函数**

要求：
- 函数接收一个返回 Promise 的函数和重试次数
- 如果 Promise 失败，自动重试
- 所有尝试都失败后抛出最后一个错误
- 记录每次尝试的日志

```typescript
async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number
): Promise<T> {
  // 你的实现
}

// 测试
let attempt = 0;
const unstableOperation = () => {
  attempt++;
  console.log(`尝试 ${attempt}`);
  
  if (attempt < 3) {
    return Promise.reject(new Error('失败'));
  }
  
  return Promise.resolve('成功');
};

retry(unstableOperation, 5)
  .then(result => console.log(`最终结果: ${result}`))
  .catch(error => console.log(`最终失败: ${error}`));
```

## 新增练习题（错误处理、正则表达式、执行机制）

### 练习 10：错误处理体系（中高级）

**题目**：实现类型安全的 Result 模式

**难度**：⭐⭐⭐⭐

要求：
- 实现 `Ok<T>` 和 `Err<E>` 类型
- 实现 `Result<T, E>` 联合类型
- 实现 `tryCatch()` 辅助函数
- 支持链式调用（map、flatMap）

<details>
<summary>参考答案（完整实现见 `solutions/error-handling-result.ts`）</summary>

核心思路：
1. 使用判别联合类型（tagged union）
2. 避免抛出异常，将错误作为值返回
3. 编译器强制处理错误分支

</details>

---

### 练习 11：正则表达式（中级）

**题目**：实现 Markdown 链接提取器

**难度**：⭐⭐⭐

要求：
- 提取 Markdown 中的所有链接：`[文本](URL)`
- 使用命名捕获组
- 支持嵌套括号
- 返回 `{ text: string, url: string }[]`

---

### 练习 12：执行机制深入（高级）

**题目**：预测代码输出顺序（含 TDZ 陷阱）

**难度**：⭐⭐⭐⭐⭐

要求：
- 预测包含 let/const、闭包、TDZ 的代码输出
- 解释每一步的执行上下文变化
- 识别暂时性死区错误

---

## 完成标准

完成本阶段后，你应该能够：

- [ ] 熟练使用 TypeScript 类型系统
- [ ] 理解并使用 ES6+ 特性（类、模块、迭代器等）
- [ ] 使用 Node.js 进行文件和网络操作
- [ ] 创建 RESTful API 服务
- [ ] 掌握 Promise 和 async/await
- [ ] 实现并发控制和错误处理
- [ ] 理解错误处理的三种策略（Bug、业务例外、环境灾难）
- [ ] 能够编写和调试正则表达式
- [ ] 理解 JavaScript 执行上下文和词法环境
- [ ] 能够独立完成任务管理 API 项目

---

## 🆕 错误处理体系练习

### 练习 10: 实现类型安全的 Result 类型（基础）

**难度**: ⭐⭐⭐
**涉及知识点**: 错误处理、类型系统、判别联合类型
**预计时间**: 25分钟

**题目描述**: 

实现一个 Rust 风格的 `Result<T, E>` 类型，用于显式的错误处理。

**要求**:
1. 实现 `Ok<T>` 和 `Err<E>` 类型
2. 实现工厂函数 `ok()` 和 `err()`
3. 实现 `isOk()` 和 `isErr()` 类型守卫
4. 实现 `unwrap()` 方法（获取值或抛出错误）
5. 实现 `map()` 和 `mapErr()` 方法

**提示**: 使用判别联合类型和类型收窄

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/10-result-type.ts`

**思路说明**:
- Result 类型让错误处理显式化
- 调用者必须检查结果才能获取值
- 避免了异常的隐式传播

**关键代码**:
```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.value;
  }
  throw result.error;
}

// 使用示例
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return err('除数不能为零');
  }
  return ok(a / b);
}

const result = divide(10, 2);
if (isOk(result)) {
  console.log('结果:', result.value); // 5
} else {
  console.log('错误:', result.error);
}
```

</details>

---

### 练习 11: 自定义错误类层次结构（进阶）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: 自定义错误、错误继承、错误码设计
**预计时间**: 30分钟

**题目描述**: 

为一个用户管理系统设计完整的错误类层次结构。

**要求**:
1. 创建基础错误类 `AppError`，包含错误码和时间戳
2. 创建业务错误类：`ValidationError`、`AuthenticationError`、`AuthorizationError`
3. 每个错误类包含 `statusCode` 属性（HTTP状态码）
4. 实现错误的序列化方法 `toJSON()`
5. 实现全局错误处理函数

**提示**: 继承原生 `Error` 类时需要设置 `prototype`

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/11-custom-errors.ts`

**思路说明**:
- 将错误分类，便于统一处理
- 包含足够的上下文信息
- 提供统一的序列化格式

**关键代码**:
```typescript
class AppError extends Error {
  public readonly timestamp: Date;
  
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    
    // 修复原型链
    Object.setPrototypeOf(this, new.target.prototype);
  }
  
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString()
    };
  }
}

class ValidationError extends AppError {
  constructor(message: string, public readonly fields?: string[]) {
    super('VALIDATION_ERROR', message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super('AUTH_ERROR', message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super('FORBIDDEN', message, 403);
  }
}

// 全局错误处理
function handleError(error: Error): void {
  if (error instanceof AppError) {
    console.log(`[${error.code}] ${error.message}`);
    console.log('详情:', JSON.stringify(error.toJSON(), null, 2));
  } else {
    console.log('未知错误:', error.message);
  }
}

// 使用
throw new ValidationError('邮箱格式无效', ['email']);
```

</details>

---

### 练习 12: 异步错误处理统一方案（挑战）

**难度**: ⭐⭐⭐⭐⭐
**涉及知识点**: Promise错误处理、async/await、错误边界
**预计时间**: 40分钟

**题目描述**: 

实现一个完整的异步错误处理框架，支持重试、超时和错误恢复。

**要求**:
1. 实现 `withRetry()` 高阶函数，支持指数退避重试
2. 实现 `withTimeout()` 包装器，为异步操作添加超时
3. 实现 `tryCatch()` 包装器，将异步错误转为 Result 类型
4. 实现错误聚合器，收集多个并发操作的错误
5. 添加详细的日志记录

**提示**: 组合多个高阶函数实现复杂的错误处理策略

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/12-async-error-handling.ts`

**思路说明**:
- 使用高阶函数组合错误处理策略
- 指数退避：每次重试间隔翻倍
- 超时控制：使用 Promise.race
- 错误转换：统一错误处理接口

**关键代码**:
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[尝试 ${attempt}/${maxAttempts}]`);
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        console.log('[所有尝试失败]');
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`[失败] 等待 ${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('不应到达这里');
}

async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`操作超时(${timeoutMs}ms)`)), timeoutMs)
    )
  ]);
}

async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

// 组合使用
const fetchWithRetryAndTimeout = () =>
  withRetry(
    () => withTimeout(
      () => fetch('https://api.example.com/data').then(r => r.json()),
      5000
    ),
    3
  );
```

</details>

---

## 🆕 正则表达式练习

### 练习 13: Markdown 链接提取器（基础）

**难度**: ⭐⭐
**涉及知识点**: 正则表达式基础、捕获组、全局匹配
**预计时间**: 20分钟

**题目描述**: 

实现一个函数，提取 Markdown 文本中的所有链接。

**要求**:
1. 提取 `[文本](URL)` 格式的链接
2. 返回包含文本和URL的对象数组
3. 使用命名捕获组
4. 测试包含多个链接的文本

**提示**: Markdown 链接格式 `[文本](URL)`

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/13-markdown-link-extractor.ts`

**思路说明**:
- 使用命名捕获组提取文本和URL
- `matchAll()` 获取所有匹配
- 注意转义特殊字符

**关键代码**:
```typescript
interface MarkdownLink {
  text: string;
  url: string;
  fullMatch: string;
}

function extractMarkdownLinks(markdown: string): MarkdownLink[] {
  const pattern = /\[(?<text>[^\]]+)\]\((?<url>[^)]+)\)/g;
  const links: MarkdownLink[] = [];
  
  for (const match of markdown.matchAll(pattern)) {
    if (match.groups) {
      links.push({
        text: match.groups.text,
        url: match.groups.url,
        fullMatch: match[0]
      });
    }
  }
  
  console.log(`找到 ${links.length} 个链接`);
  return links;
}

// 测试
const markdown = `
查看 [MDN](https://developer.mozilla.org) 和 
[TypeScript 官网](https://www.typescriptlang.org) 了解更多信息。
`;

const links = extractMarkdownLinks(markdown);
links.forEach(link => {
  console.log(`文本: "${link.text}", URL: ${link.url}`);
});
```

</details>

---

### 练习 14: 密码强度验证器（进阶）

**难度**: ⭐⭐⭐
**涉及知识点**: 正则表达式、前瞻断言、复杂模式
**预计时间**: 30分钟

**题目描述**: 

实现一个密码强度验证器，检查密码是否满足安全要求。

**要求**:
1. 至少8个字符
2. 包含至少1个大写字母
3. 包含至少1个小写字母
4. 包含至少1个数字
5. 包含至少1个特殊字符
6. 返回详细的验证结果和建议

**提示**: 使用正向前瞻 `(?=.*pattern)` 检查是否包含某类字符

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/14-password-validator.ts`

**思路说明**:
- 使用多个前瞻断言独立检查每个条件
- 前瞻不消耗字符，可以在同一位置多次检查
- 提供详细的反馈信息

**关键代码**:
```typescript
interface PasswordValidation {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
}

function validatePassword(password: string): PasswordValidation {
  const checks = [
    { pattern: /.{8,}/, message: '至少8个字符' },
    { pattern: /[A-Z]/, message: '至少1个大写字母' },
    { pattern: /[a-z]/, message: '至少1个小写字母' },
    { pattern: /\d/, message: '至少1个数字' },
    { pattern: /[!@#$%^&*(),.?":{}|<>]/, message: '至少1个特殊字符' }
  ];
  
  const issues: string[] = [];
  let passedChecks = 0;
  
  checks.forEach(check => {
    if (check.pattern.test(password)) {
      passedChecks++;
    } else {
      issues.push(`缺少${check.message}`);
    }
  });
  
  const valid = issues.length === 0;
  const strength = 
    passedChecks === 5 ? 'strong' :
    passedChecks >= 3 ? 'medium' : 'weak';
  
  return { valid, strength, issues };
}

// 测试
console.log(validatePassword('Pass123!'));
console.log(validatePassword('weakpass'));
```

</details>

---

### 练习 15: 防止 ReDoS 攻击（进阶）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: 正则表达式性能、回溯、安全性
**预计时间**: 35分钟

**题目描述**: 

识别和修复容易受到 ReDoS（正则表达式拒绝服务）攻击的模式。

**要求**:
1. 分析给定的危险正则表达式
2. 解释为什么它会导致指数级回溯
3. 提供安全的替代方案
4. 实现超时保护机制
5. 添加性能测试

**提示**: 嵌套的量词和回溯是主要问题

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/15-redos-prevention.ts`

**思路说明**:
- ReDoS 由嵌套量词导致指数级回溯
- 使用原子组或占有量词避免回溯
- 添加超时保护防止阻塞

**关键代码**:
```typescript
// ❌ 危险：嵌套量词导致指数级回溯
const dangerousPattern = /^(a+)+$/;

// ✅ 安全：避免嵌套量词
const safePattern = /^a+$/;

function testRegexPerformance(pattern: RegExp, input: string): number {
  const start = performance.now();
  try {
    pattern.test(input);
  } catch (e) {
    console.error('正则执行错误');
  }
  return performance.now() - start;
}

function safeRegexTest(
  pattern: RegExp,
  input: string,
  timeoutMs: number = 100
): { match: boolean; timedOut: boolean } {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ match: false, timedOut: true });
    }, timeoutMs);
    
    const match = pattern.test(input);
    clearTimeout(timeout);
    resolve({ match, timedOut: false });
  });
}

// 测试
const maliciousInput = 'a'.repeat(30) + 'b';
console.log('危险模式耗时:', testRegexPerformance(dangerousPattern, maliciousInput));
console.log('安全模式耗时:', testRegexPerformance(safePattern, maliciousInput));
```

</details>

---

## 🆕 JavaScript 执行机制练习

### 练习 16: 预测输出顺序（基础）

**难度**: ⭐⭐⭐
**涉及知识点**: 执行上下文、词法环境、TDZ、提升
**预计时间**: 25分钟

**题目描述**: 

预测以下代码的输出顺序，并解释原因。

**要求**:
1. 分析代码执行顺序
2. 解释每个输出的原因
3. 标注哪些涉及 TDZ（暂时性死区）
4. 绘制执行上下文栈的变化
5. 运行代码验证预测

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/16-execution-order.js`

**思路说明**:
- 分析变量提升和函数提升
- 理解 TDZ 对 let/const 的影响
- 追踪执行上下文的创建和销毁

**关键代码**:
```javascript
console.log('1. 开始');

console.log(a); // undefined (var 提升，值为 undefined)
// console.log(b); // ReferenceError: TDZ
var a = 1;
let b = 2;

foo(); // "foo 函数" (函数声明提升)

function foo() {
  console.log('2. foo 函数');
  console.log(c); // undefined
  var c = 3;
}

setTimeout(() => console.log('3. 异步'), 0);

Promise.resolve().then(() => console.log('4. 微任务'));

console.log('5. 结束');

// 输出顺序:
// 1. 开始
// undefined
// 2. foo 函数
// undefined
// 5. 结束
// 4. 微任务
// 3. 异步
```

</details>

---

### 练习 17: 闭包陷阱与解决方案（进阶）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: 闭包、词法环境、块级作用域
**预计时间**: 30分钟

**题目描述**: 

分析并修复经典的闭包陷阱问题。

**要求**:
1. 解释为什么 `var` 版本输出都是10
2. 提供至少3种修复方案
3. 解释每种方案的原理
4. 绘制词法环境的引用关系图
5. 比较各方案的优劣

**提示**: 关键在于每次迭代是否创建新的词法环境

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/17-closure-trap.js`

**思路说明**:
- `var` 是函数作用域，所有闭包共享同一个变量
- `let` 是块级作用域，每次迭代创建新的词法环境
- IIFE 可以为每次迭代创建独立作用域

**关键代码**:
```javascript
// ❌ 问题：输出都是 10
for (var i = 0; i < 10; i++) {
  setTimeout(() => console.log(i), 0);
}

// ✅ 方案1：使用 let（推荐）
for (let i = 0; i < 10; i++) {
  setTimeout(() => console.log(i), 0);
}

// ✅ 方案2：IIFE 创建独立作用域
for (var i = 0; i < 10; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}

// ✅ 方案3：函数参数
for (var i = 0; i < 10; i++) {
  setTimeout((j => () => console.log(j))(i), 0);
}

// 原理解释：
console.log(`
var 版本：
- 所有闭包引用同一个词法环境中的 i
- 循环结束后 i = 10
- 定时器执行时访问的都是这个 i

let 版本：
- 每次迭代创建新的块级作用域
- 每个闭包捕获不同的 i
- 定时器执行时访问各自的 i
`);
```

</details>

---

### 练习 18: 实现简化版执行上下文栈（挑战）

**难度**: ⭐⭐⭐⭐⭐
**涉及知识点**: 执行上下文、调用栈、词法环境模拟
**预计时间**: 45分钟

**题目描述**: 

模拟 JavaScript 引擎的执行上下文栈和词法环境。

**要求**:
1. 实现 `ExecutionContext` 类
2. 实现 `LexicalEnvironment` 类
3. 模拟变量查找过程
4. 模拟函数调用和返回
5. 可视化执行过程

**提示**: 使用栈结构管理执行上下文

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/18-execution-context-simulator.js`

**思路说明**:
- 执行上下文栈：管理函数调用
- 词法环境：链式结构存储变量
- 作用域链：通过外部引用连接

**关键代码**:
```javascript
class LexicalEnvironment {
  constructor(outer = null) {
    this.record = new Map(); // 环境记录
    this.outer = outer;      // 外部词法环境引用
  }
  
  define(name, value) {
    console.log(`  [定义] ${name} = ${value}`);
    this.record.set(name, value);
  }
  
  get(name) {
    if (this.record.has(name)) {
      console.log(`  [找到] ${name} = ${this.record.get(name)}`);
      return this.record.get(name);
    }
    if (this.outer) {
      console.log(`  [向上查找] ${name}`);
      return this.outer.get(name);
    }
    throw new ReferenceError(`${name} is not defined`);
  }
}

class ExecutionContext {
  constructor(type, lexicalEnv) {
    this.type = type; // 'global' | 'function'
    this.lexicalEnvironment = lexicalEnv;
  }
}

class ExecutionStack {
  constructor() {
    this.stack = [];
    this.push(new ExecutionContext('global', new LexicalEnvironment()));
  }
  
  push(context) {
    console.log(`\n[压栈] ${context.type} 执行上下文`);
    this.stack.push(context);
  }
  
  pop() {
    const context = this.stack.pop();
    console.log(`[出栈] ${context.type} 执行上下文`);
    return context;
  }
  
  current() {
    return this.stack[this.stack.length - 1];
  }
}

// 使用示例
const stack = new ExecutionStack();
const globalEnv = stack.current().lexicalEnvironment;

globalEnv.define('x', 10);
globalEnv.define('y', 20);

// 模拟函数调用
const funcEnv = new LexicalEnvironment(globalEnv);
stack.push(new ExecutionContext('function', funcEnv));

funcEnv.define('z', 30);
console.log(funcEnv.get('x')); // 从外部环境获取
console.log(funcEnv.get('z')); // 从当前环境获取

stack.pop();
```

</details>

---

## 下一步

- 完成所有练习题
- 复习不熟悉的知识点
- 开始阶段 3：高级 - 深入 TypeScript 和架构
