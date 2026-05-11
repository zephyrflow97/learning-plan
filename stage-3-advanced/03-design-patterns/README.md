# 第 3 章：设计模式

欢迎来到设计模式的学习！设计模式是软件开发中经过验证的、可重用的解决方案。在本章中，你将学习如何使用 TypeScript 实现常见的设计模式，并理解它们的应用场景。

## 📚 本章目标

完成本章后，你将能够：

- ✅ 理解设计模式的核心概念和分类
- ✅ 掌握创建型模式（单例、工厂、建造者）
- ✅ 掌握结构型模式（适配器、装饰者、代理）
- ✅ 掌握行为型模式（观察者、策略、命令）
- ✅ 理解依赖注入和控制反转
- ✅ 在实际项目中识别和应用设计模式
- ✅ 知道何时使用以及何时避免使用模式

---

## 📖 本章内容

1. [设计模式简介](#1-设计模式简介)
2. [创建型模式](#2-创建型模式)
3. [结构型模式](#3-结构型模式)
4. [行为型模式](#4-行为型模式)
5. [依赖注入](#5-依赖注入)
6. [实战项目](#6-实战项目)
7. [最佳实践](#7-最佳实践)
8. [章节练习](#8-章节练习)

---

## 1. 设计模式简介

### 1.1 什么是设计模式？

> **🧰 The Metaphor: The Toolbox, not the Rulebook**
> 设计模式不是**法律条文**，而是**工具箱**里的扳手和锤子。
> 你不会因为手里有把锤子，就把所有东西都看成钉子（过度设计）。
> 同样，你也不应该为了用模式而用模式。
> 它们是前辈们在无数次踩坑后总结出来的“防坑指南”。
> 当你遇到一个棘手的问题时，翻开这个工具箱，看看有没有现成的解决方案。

设计模式是在软件设计中常见问题的典型解决方案。它们就像预先制定的蓝图，你可以根据自己代码中的实际问题进行调整和应用。

**设计模式不是：**
- ❌ 可以直接复制粘贴的代码
- ❌ 必须在所有项目中使用的规则
- ❌ 算法或数据结构

**设计模式是：**
- ✅ 解决特定设计问题的通用概念
- ✅ 开发者之间交流的共同语言
- ✅ 经过验证的最佳实践

---

### 1.2 设计模式的分类

设计模式通常分为三大类：

**创建型模式（Creational Patterns）**
- 关注对象的创建机制
- 示例：单例、工厂、建造者、原型

**结构型模式（Structural Patterns）**
- 关注对象的组合和关系
- 示例：适配器、装饰者、代理、外观

**行为型模式（Behavioral Patterns）**
- 关注对象之间的通信和职责分配
- 示例：观察者、策略、命令、迭代器

> **🏛️ CS Master's Bridge: Frontend-Specific Patterns**
>
> 除了经典的 GoF 模式，前端开发中还有一些特有的架构模式，特别是随着 React/Vue 等框架的流行：
>
> 1.  **Render Props**: 将组件的渲染逻辑作为函数参数传递，实现逻辑复用。
> 2.  **Higher-Order Components (HOC)**: 类似于装饰者模式，接收一个组件并返回一个增强的新组件。
> 3.  **Hooks (React)**: 一种更现代的逻辑复用方式，取代了 Mixins 和 HOCs。
> 4.  **Container/Presentational Components**: 关注点分离，Container 处理数据逻辑，Presentational 处理 UI 渲染。

---

### 1.3 SOLID 原则

在学习设计模式之前，先了解 SOLID 原则，这是面向对象设计的五大基本原则：

**S - 单一职责原则（Single Responsibility Principle）**
```typescript
// ❌ 差：一个类承担多个职责
class User {
  constructor(public name: string, public email: string) {}
  
  // 职责1：用户数据管理
  updateEmail(newEmail: string) {
    this.email = newEmail;
  }
  
  // 职责2：数据持久化
  save() {
    // 保存到数据库
  }
  
  // 职责3：邮件发送
  sendWelcomeEmail() {
    // 发送邮件
  }
}

// ✅ 好：每个类只有一个职责
class User {
  constructor(public name: string, public email: string) {}
  
  updateEmail(newEmail: string) {
    this.email = newEmail;
  }
}

class UserRepository {
  save(user: User) {
    // 保存到数据库
  }
}

class EmailService {
  sendWelcomeEmail(user: User) {
    // 发送邮件
  }
}
```

**O - 开闭原则（Open-Closed Principle）**
```typescript
// ❌ 差：每次添加新类型都要修改代码
class ShapeCalculator {
  calculateArea(shape: any): number {
    if (shape.type === 'circle') {
      return Math.PI * shape.radius ** 2;
    } else if (shape.type === 'rectangle') {
      return shape.width * shape.height;
    }
    // 添加新形状需要修改这个方法
    return 0;
  }
}

// ✅ 好：对扩展开放，对修改封闭
interface Shape {
  calculateArea(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  
  calculateArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  
  calculateArea(): number {
    return this.width * this.height;
  }
}

// 添加新形状不需要修改现有代码
class Triangle implements Shape {
  constructor(private base: number, private height: number) {}
  
  calculateArea(): number {
    return (this.base * this.height) / 2;
  }
}
```

**L - 里氏替换原则（Liskov Substitution Principle）**
```typescript
// ❌ 差：子类不能完全替换父类
class Bird {
  fly() {
    console.log('飞翔中...');
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('企鹅不会飞!'); // 违反了 LSP
  }
}

// ✅ 好：使用接口分离
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class Sparrow implements Flyable {
  fly() {
    console.log('麻雀飞翔中...');
  }
}

class Penguin implements Swimmable {
  swim() {
    console.log('企鹅游泳中...');
  }
}
```

**I - 接口隔离原则（Interface Segregation Principle）**
```typescript
// ❌ 差：臃肿的接口
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

class Robot implements Worker {
  work() { console.log('工作中...'); }
  eat() { throw new Error('机器人不吃饭!'); } // 不需要的方法
  sleep() { throw new Error('机器人不睡觉!'); } // 不需要的方法
}

// ✅ 好：接口隔离
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

class Human implements Workable, Eatable, Sleepable {
  work() { console.log('工作中...'); }
  eat() { console.log('吃饭中...'); }
  sleep() { console.log('睡觉中...'); }
}

class Robot implements Workable {
  work() { console.log('工作中...'); }
}
```

**D - 依赖倒置原则（Dependency Inversion Principle）**
```typescript
// ❌ 差：高层模块依赖低层模块
class MySQLDatabase {
  connect() {
    console.log('连接到 MySQL');
  }
  
  query(sql: string) {
    console.log('执行查询:', sql);
  }
}

class UserService {
  private db = new MySQLDatabase(); // 直接依赖具体实现
  
  getUser(id: string) {
    this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// ✅ 好：依赖抽象而不是具体实现
interface Database {
  connect(): void;
  query(sql: string): any;
}

class MySQLDatabase implements Database {
  connect() {
    console.log('连接到 MySQL');
  }
  
  query(sql: string) {
    console.log('执行 MySQL 查询:', sql);
  }
}

class PostgreSQLDatabase implements Database {
  connect() {
    console.log('连接到 PostgreSQL');
  }
  
  query(sql: string) {
    console.log('执行 PostgreSQL 查询:', sql);
  }
}

class UserService {
  constructor(private db: Database) {} // 依赖抽象接口
  
  getUser(id: string) {
    this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// 使用：可以轻松切换数据库
const userService1 = new UserService(new MySQLDatabase());
const userService2 = new UserService(new PostgreSQLDatabase());
```

---

## 2. 创建型模式

创建型模式关注对象的创建机制，提供了创建对象的各种方式。

### 2.1 单例模式（Singleton Pattern）

> **⚔️ The Metaphor: The Highlander**
> "There can be only one." (只能有一个)
> 单例模式就像是电影《高地人》里的不死族，或者是**国家的总统**。
> 无论你在哪里呼叫“总统”，你得到的永远是同一个人。
> 它保证了全局的唯一性和一致性（比如配置中心、数据库连接池），但也带来了**全局状态**的副作用（难以测试、隐藏依赖）。

**定义：** 确保一个类只有一个实例，并提供全局访问点。

**应用场景：**
- 数据库连接池
- 配置管理器
- 日志记录器
- 缓存管理器

**实现方式 1：传统单例**

```typescript
// 传统单例模式
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connectionId: string;
  
  // 私有构造函数，防止外部实例化
  private constructor() {
    this.connectionId = Math.random().toString(36).substr(2, 9);
    console.log(`创建数据库连接，ID: ${this.connectionId}`);
  }
  
  // 获取唯一实例
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
  
  public query(sql: string): void {
    console.log(`[连接 ${this.connectionId}] 执行查询: ${sql}`);
  }
}

// 使用示例
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();

console.log(db1 === db2); // true - 同一个实例

db1.query('SELECT * FROM users');
db2.query('SELECT * FROM posts');
// 输出显示使用的是同一个连接 ID
```

**实现方式 2：懒加载单例**

```typescript
// 懒加载单例（延迟初始化）
class ConfigManager {
  private static instance: ConfigManager | null = null;
  private config: Record<string, any> = {};
  
  private constructor() {
    console.log('初始化配置管理器...');
    this.loadConfig();
  }
  
  private loadConfig(): void {
    // 模拟加载配置文件
    this.config = {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      debug: true
    };
  }
  
  public static getInstance(): ConfigManager {
    if (this.instance === null) {
      this.instance = new ConfigManager();
    }
    return this.instance;
  }
  
  public get<T>(key: string): T {
    return this.config[key] as T;
  }
  
  public set(key: string, value: any): void {
    this.config[key] = value;
  }
}

// 使用示例
const config1 = ConfigManager.getInstance();
console.log(config1.get<string>('apiUrl')); // https://api.example.com

const config2 = ConfigManager.getInstance();
config2.set('timeout', 10000);

console.log(config1.get<number>('timeout')); // 10000 - 同一个实例
console.log(config1 === config2); // true
```

**实现方式 3：模块单例（推荐）**

```typescript
// logger.ts - 使用 ES6 模块天然的单例特性
class Logger {
  private logs: string[] = [];
  
  constructor() {
    console.log('Logger 实例已创建');
  }
  
  log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }
  
  getLogs(): string[] {
    return [...this.logs];
  }
  
  clearLogs(): void {
    this.logs = [];
  }
}

// 导出单例实例
export const logger = new Logger();

// 使用示例
// file1.ts
import { logger } from './logger';
logger.log('用户登录');

// file2.ts
import { logger } from './logger';
logger.log('数据更新');
console.log(logger.getLogs()); // 包含两条日志
```

**单例模式的优缺点**

✅ **优点：**
- 保证全局只有一个实例
- 提供全局访问点
- 延迟初始化，节省资源

❌ **缺点：**
- 违反单一职责原则（管理自己的生命周期）
- 难以进行单元测试
- 可能成为全局状态，导致隐藏的依赖

---

### 2.2 工厂模式（Factory Pattern）

> **🏭 The Metaphor: The Pizza Shop**
> 你想吃披萨，你不需要自己种小麦、养牛、做奶酪、烤面饼（直接 `new Pizza()`）。
> 你只需要走进**披萨店**（Factory），对服务员说：“我要一份夏威夷披萨。”
> 披萨店在后台复杂的流程中把披萨做出来给你。
> 你不需要知道披萨是怎么做的，你只需要知道**找谁要**。
> 这将“使用对象”和“创建对象”的逻辑**解耦**了。

**定义：** 定义一个创建对象的接口，但让子类决定实例化哪个类。

**应用场景：**
- 根据条件创建不同类型的对象
- 隐藏对象创建的复杂逻辑
- 解耦对象的创建和使用

**简单工厂模式**

```typescript
// 产品接口
interface Vehicle {
  type: string;
  drive(): void;
  park(): void;
}

// 具体产品：汽车
class Car implements Vehicle {
  type = 'Car';
  
  drive(): void {
    console.log('🚗 汽车在公路上行驶');
  }
  
  park(): void {
    console.log('🚗 汽车停在停车场');
  }
}

// 具体产品：摩托车
class Motorcycle implements Vehicle {
  type = 'Motorcycle';
  
  drive(): void {
    console.log('🏍️ 摩托车在公路上行驶');
  }
  
  park(): void {
    console.log('🏍️ 摩托车停在路边');
  }
}

// 具体产品：卡车
class Truck implements Vehicle {
  type = 'Truck';
  
  drive(): void {
    console.log('🚚 卡车在高速公路上行驶');
  }
  
  park(): void {
    console.log('🚚 卡车停在货运站');
  }
}

// 简单工厂
class VehicleFactory {
  static createVehicle(type: string): Vehicle {
    switch (type.toLowerCase()) {
      case 'car':
        return new Car();
      case 'motorcycle':
        return new Motorcycle();
      case 'truck':
        return new Truck();
      default:
        throw new Error(`不支持的车辆类型: ${type}`);
    }
  }
}

// 使用示例
const car = VehicleFactory.createVehicle('car');
car.drive();
car.park();

const motorcycle = VehicleFactory.createVehicle('motorcycle');
motorcycle.drive();
motorcycle.park();

const truck = VehicleFactory.createVehicle('truck');
truck.drive();
truck.park();
```

**工厂方法模式**

```typescript
// 抽象产品
interface Notification {
  send(message: string): void;
}

// 具体产品：邮件通知
class EmailNotification implements Notification {
  constructor(private recipient: string) {}
  
  send(message: string): void {
    console.log(`📧 发送邮件到 ${this.recipient}: ${message}`);
  }
}

// 具体产品：短信通知
class SMSNotification implements Notification {
  constructor(private phoneNumber: string) {}
  
  send(message: string): void {
    console.log(`📱 发送短信到 ${this.phoneNumber}: ${message}`);
  }
}

// 具体产品：推送通知
class PushNotification implements Notification {
  constructor(private deviceId: string) {}
  
  send(message: string): void {
    console.log(`🔔 发送推送到设备 ${this.deviceId}: ${message}`);
  }
}

// 抽象创建者
abstract class NotificationService {
  // 工厂方法
  abstract createNotification(): Notification;
  
  // 业务逻辑
  sendNotification(message: string): void {
    const notification = this.createNotification();
    notification.send(message);
  }
}

// 具体创建者：邮件服务
class EmailService extends NotificationService {
  constructor(private recipient: string) {
    super();
  }
  
  createNotification(): Notification {
    return new EmailNotification(this.recipient);
  }
}

// 具体创建者：短信服务
class SMSService extends NotificationService {
  constructor(private phoneNumber: string) {
    super();
  }
  
  createNotification(): Notification {
    return new SMSNotification(this.phoneNumber);
  }
}

// 具体创建者：推送服务
class PushService extends NotificationService {
  constructor(private deviceId: string) {
    super();
  }
  
  createNotification(): Notification {
    return new PushNotification(this.deviceId);
  }
}

// 使用示例
const emailService = new EmailService('user@example.com');
emailService.sendNotification('欢迎注册!');

const smsService = new SMSService('+86 138****8888');
smsService.sendNotification('验证码: 123456');

const pushService = new PushService('device-abc-123');
pushService.sendNotification('您有新消息');
```

**抽象工厂模式**

```typescript
// 抽象产品：按钮
interface Button {
  render(): void;
  onClick(): void;
}

// 抽象产品：输入框
interface Input {
  render(): void;
  onInput(value: string): void;
}

// 具体产品：Windows 按钮
class WindowsButton implements Button {
  render(): void {
    console.log('🪟 渲染 Windows 风格按钮');
  }
  
  onClick(): void {
    console.log('🪟 Windows 按钮被点击');
  }
}

// 具体产品：Windows 输入框
class WindowsInput implements Input {
  render(): void {
    console.log('🪟 渲染 Windows 风格输入框');
  }
  
  onInput(value: string): void {
    console.log(`🪟 Windows 输入: ${value}`);
  }
}

// 具体产品：Mac 按钮
class MacButton implements Button {
  render(): void {
    console.log('🍎 渲染 Mac 风格按钮');
  }
  
  onClick(): void {
    console.log('🍎 Mac 按钮被点击');
  }
}

// 具体产品：Mac 输入框
class MacInput implements Input {
  render(): void {
    console.log('🍎 渲染 Mac 风格输入框');
  }
  
  onInput(value: string): void {
    console.log(`🍎 Mac 输入: ${value}`);
  }
}

// 抽象工厂接口
interface UIFactory {
  createButton(): Button;
  createInput(): Input;
}

// 具体工厂：Windows UI 工厂
class WindowsUIFactory implements UIFactory {
  createButton(): Button {
    return new WindowsButton();
  }
  
  createInput(): Input {
    return new WindowsInput();
  }
}

// 具体工厂：Mac UI 工厂
class MacUIFactory implements UIFactory {
  createButton(): Button {
    return new MacButton();
  }
  
  createInput(): Input {
    return new MacInput();
  }
}

// 客户端代码
class Application {
  private button: Button;
  private input: Input;
  
  constructor(factory: UIFactory) {
    this.button = factory.createButton();
    this.input = factory.createInput();
  }
  
  render(): void {
    this.button.render();
    this.input.render();
  }
  
  interact(): void {
    this.button.onClick();
    this.input.onInput('Hello World');
  }
}

// 使用示例
console.log('=== Windows 应用 ===');
const windowsApp = new Application(new WindowsUIFactory());
windowsApp.render();
windowsApp.interact();

console.log('\n=== Mac 应用 ===');
const macApp = new Application(new MacUIFactory());
macApp.render();
macApp.interact();
```

**实战示例：HTTP 客户端工厂**

```typescript
// HTTP 客户端接口
interface HttpClient {
  get(url: string): Promise<any>;
  post(url: string, data: any): Promise<any>;
  put(url: string, data: any): Promise<any>;
  delete(url: string): Promise<any>;
}

// Fetch API 实现
class FetchClient implements HttpClient {
  async get(url: string): Promise<any> {
    console.log(`[Fetch] GET ${url}`);
    const response = await fetch(url);
    return response.json();
  }
  
  async post(url: string, data: any): Promise<any> {
    console.log(`[Fetch] POST ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async put(url: string, data: any): Promise<any> {
    console.log(`[Fetch] PUT ${url}`);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async delete(url: string): Promise<any> {
    console.log(`[Fetch] DELETE ${url}`);
    const response = await fetch(url, { method: 'DELETE' });
    return response.json();
  }
}

// Axios 实现（假设）
class AxiosClient implements HttpClient {
  async get(url: string): Promise<any> {
    console.log(`[Axios] GET ${url}`);
    // return axios.get(url).then(res => res.data);
    return Promise.resolve({ data: 'mock data' });
  }
  
  async post(url: string, data: any): Promise<any> {
    console.log(`[Axios] POST ${url}`);
    // return axios.post(url, data).then(res => res.data);
    return Promise.resolve({ data: 'mock data' });
  }
  
  async put(url: string, data: any): Promise<any> {
    console.log(`[Axios] PUT ${url}`);
    // return axios.put(url, data).then(res => res.data);
    return Promise.resolve({ data: 'mock data' });
  }
  
  async delete(url: string): Promise<any> {
    console.log(`[Axios] DELETE ${url}`);
    // return axios.delete(url).then(res => res.data);
    return Promise.resolve({ data: 'mock data' });
  }
}

// HTTP 客户端工厂
class HttpClientFactory {
  static create(type: 'fetch' | 'axios'): HttpClient {
    switch (type) {
      case 'fetch':
        return new FetchClient();
      case 'axios':
        return new AxiosClient();
      default:
        throw new Error(`不支持的 HTTP 客户端类型: ${type}`);
    }
  }
}

// 使用示例
async function example() {
  const client = HttpClientFactory.create('fetch');
  
  try {
    const users = await client.get('/api/users');
    console.log('获取用户:', users);
    
    const newUser = await client.post('/api/users', {
      name: 'Alice',
      email: 'alice@example.com'
    });
    console.log('创建用户:', newUser);
  } catch (error) {
    console.error('请求失败:', error);
  }
}
```

---

### 2.3 建造者模式（Builder Pattern）

> **🍔 The Metaphor: The Subway Sandwich**
> 建造者模式就像是在 **Subway 点三明治**。
> 你不是直接拿一个做好的三明治。
> 你是一步步定制的：
> 1.  “我要全麦面包。” (`.setBread('wheat')`)
> 2.  “加火鸡胸肉。” (`.addMeat('turkey')`)
> 3.  “多放点生菜。” (`.addVeggie('lettuce')`)
> 4.  “最后加蜂蜜芥末酱。” (`.setSauce('honey-mustard')`)
> 5.  “好了，打包！” (`.build()`)
> 
> 这种模式让你能够清晰、灵活地构建**结构复杂**的对象，避免了构造函数里塞几十个参数的噩梦。

**定义：** 将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

**应用场景：**
- 创建复杂对象，包含多个可选参数
- 对象创建步骤固定，但细节可变
- 需要创建不同表示的同类对象

**基础建造者模式**

```typescript
// 产品类：HTTP 请求
class HttpRequest {
  private url: string = '';
  private method: string = 'GET';
  private headers: Record<string, string> = {};
  private body: any = null;
  private timeout: number = 5000;
  private retries: number = 0;
  
  setUrl(url: string): void {
    this.url = url;
  }
  
  setMethod(method: string): void {
    this.method = method;
  }
  
  setHeaders(headers: Record<string, string>): void {
    this.headers = headers;
  }
  
  setBody(body: any): void {
    this.body = body;
  }
  
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
  
  setRetries(retries: number): void {
    this.retries = retries;
  }
  
  toString(): string {
    return `HttpRequest {
  url: ${this.url},
  method: ${this.method},
  headers: ${JSON.stringify(this.headers)},
  body: ${JSON.stringify(this.body)},
  timeout: ${this.timeout}ms,
  retries: ${this.retries}
}`;
  }
}

// 建造者类
class HttpRequestBuilder {
  private request: HttpRequest;
  
  constructor() {
    this.request = new HttpRequest();
  }
  
  setUrl(url: string): this {
    this.request.setUrl(url);
    return this; // 返回 this 支持链式调用
  }
  
  setMethod(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'): this {
    this.request.setMethod(method);
    return this;
  }
  
  addHeader(key: string, value: string): this {
    const headers = {};
    this.request.setHeaders({ ...headers, [key]: value });
    return this;
  }
  
  setHeaders(headers: Record<string, string>): this {
    this.request.setHeaders(headers);
    return this;
  }
  
  setBody(body: any): this {
    this.request.setBody(body);
    return this;
  }
  
  setTimeout(timeout: number): this {
    this.request.setTimeout(timeout);
    return this;
  }
  
  setRetries(retries: number): this {
    this.request.setRetries(retries);
    return this;
  }
  
  build(): HttpRequest {
    return this.request;
  }
}

// 使用示例
const request = new HttpRequestBuilder()
  .setUrl('https://api.example.com/users')
  .setMethod('POST')
  .setHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  })
  .setBody({
    name: 'Alice',
    email: 'alice@example.com'
  })
  .setTimeout(10000)
  .setRetries(3)
  .build();

console.log(request.toString());
```

**流式建造者模式（推荐）**

```typescript
// 产品类：查询构建器
class Query {
  private table: string = '';
  private selectFields: string[] = [];
  private whereConditions: string[] = [];
  private orderByField: string = '';
  private orderDirection: 'ASC' | 'DESC' = 'ASC';
  private limitValue: number = 0;
  private offsetValue: number = 0;
  
  constructor(
    table: string,
    selectFields: string[],
    whereConditions: string[],
    orderByField: string,
    orderDirection: 'ASC' | 'DESC',
    limitValue: number,
    offsetValue: number
  ) {
    this.table = table;
    this.selectFields = selectFields;
    this.whereConditions = whereConditions;
    this.orderByField = orderByField;
    this.orderDirection = orderDirection;
    this.limitValue = limitValue;
    this.offsetValue = offsetValue;
  }
  
  toSQL(): string {
    let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.table}`;
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.orderByField) {
      sql += ` ORDER BY ${this.orderByField} ${this.orderDirection}`;
    }
    
    if (this.limitValue > 0) {
      sql += ` LIMIT ${this.limitValue}`;
    }
    
    if (this.offsetValue > 0) {
      sql += ` OFFSET ${this.offsetValue}`;
    }
    
    return sql + ';';
  }
}

// 流式建造者
class QueryBuilder {
  private table: string = '';
  private selectFields: string[] = ['*'];
  private whereConditions: string[] = [];
  private orderByField: string = '';
  private orderDirection: 'ASC' | 'DESC' = 'ASC';
  private limitValue: number = 0;
  private offsetValue: number = 0;
  
  from(table: string): this {
    this.table = table;
    return this;
  }
  
  select(...fields: string[]): this {
    this.selectFields = fields;
    return this;
  }
  
  where(condition: string): this {
    this.whereConditions.push(condition);
    return this;
  }
  
  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByField = field;
    this.orderDirection = direction;
    return this;
  }
  
  limit(value: number): this {
    this.limitValue = value;
    return this;
  }
  
  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }
  
  build(): Query {
    if (!this.table) {
      throw new Error('表名不能为空');
    }
    
    return new Query(
      this.table,
      this.selectFields,
      this.whereConditions,
      this.orderByField,
      this.orderDirection,
      this.limitValue,
      this.offsetValue
    );
  }
}

// 使用示例
const query1 = new QueryBuilder()
  .from('users')
  .select('id', 'name', 'email')
  .where('age > 18')
  .where('status = "active"')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .offset(0)
  .build();

console.log(query1.toSQL());
// SELECT id, name, email FROM users 
// WHERE age > 18 AND status = "active" 
// ORDER BY created_at DESC 
// LIMIT 10 OFFSET 0;

const query2 = new QueryBuilder()
  .from('posts')
  .where('published = true')
  .orderBy('views', 'DESC')
  .limit(5)
  .build();

console.log(query2.toSQL());
// SELECT * FROM posts 
// WHERE published = true 
// ORDER BY views DESC 
// LIMIT 5;
```

**实战示例：电子邮件建造者**

```typescript
// 电子邮件类
class Email {
  constructor(
    public from: string,
    public to: string[],
    public cc: string[],
    public bcc: string[],
    public subject: string,
    public body: string,
    public attachments: string[],
    public priority: 'low' | 'normal' | 'high'
  ) {}
  
  toString(): string {
    return `
📧 电子邮件
发件人: ${this.from}
收件人: ${this.to.join(', ')}
抄送: ${this.cc.join(', ') || '无'}
密送: ${this.bcc.join(', ') || '无'}
主题: ${this.subject}
优先级: ${this.priority}
附件: ${this.attachments.join(', ') || '无'}
---
${this.body}
    `.trim();
  }
}

// 电子邮件建造者
class EmailBuilder {
  private from: string = '';
  private to: string[] = [];
  private cc: string[] = [];
  private bcc: string[] = [];
  private subject: string = '';
  private body: string = '';
  private attachments: string[] = [];
  private priority: 'low' | 'normal' | 'high' = 'normal';
  
  setFrom(email: string): this {
    this.from = email;
    return this;
  }
  
  addTo(email: string): this {
    this.to.push(email);
    return this;
  }
  
  addCc(email: string): this {
    this.cc.push(email);
    return this;
  }
  
  addBcc(email: string): this {
    this.bcc.push(email);
    return this;
  }
  
  setSubject(subject: string): this {
    this.subject = subject;
    return this;
  }
  
  setBody(body: string): this {
    this.body = body;
    return this;
  }
  
  addAttachment(file: string): this {
    this.attachments.push(file);
    return this;
  }
  
  setPriority(priority: 'low' | 'normal' | 'high'): this {
    this.priority = priority;
    return this;
  }
  
  build(): Email {
    // 验证必需字段
    if (!this.from) throw new Error('发件人不能为空');
    if (this.to.length === 0) throw new Error('收件人不能为空');
    if (!this.subject) throw new Error('主题不能为空');
    if (!this.body) throw new Error('正文不能为空');
    
    return new Email(
      this.from,
      this.to,
      this.cc,
      this.bcc,
      this.subject,
      this.body,
      this.attachments,
      this.priority
    );
  }
}

// 使用示例
const email = new EmailBuilder()
  .setFrom('sender@example.com')
  .addTo('recipient1@example.com')
  .addTo('recipient2@example.com')
  .addCc('cc@example.com')
  .setSubject('重要通知')
  .setBody('这是一封重要的邮件内容...')
  .addAttachment('document.pdf')
  .addAttachment('image.jpg')
  .setPriority('high')
  .build();

console.log(email.toString());
```

---

## 3. 结构型模式

结构型模式关注如何组合类和对象以获得更大的结构。

### 3.1 适配器模式（Adapter Pattern）

> **🔌 The Metaphor: The Power Plug**
> 你去欧洲旅游，带的是美式插头（你的代码接口），但酒店墙上是欧式插座（第三方库接口）。
> 你不能拆了酒店的墙，也不能把自己的电脑插头剪了。
> 你需要一个**转接头**（Adapter）。
> 适配器模式就是这个转接头。它在不改变原有两方代码的情况下，让它们能够“通电”协作。

**定义：** 将一个类的接口转换成客户希望的另一个接口，使得原本由于接口不兼容而不能一起工作的类可以一起工作。

**应用场景：**
- 使用第三方库，但接口不符合你的需求
- 旧代码重构，需要适配新接口
- 统一不同数据源的访问接口

**基础适配器模式**

```typescript
// 目标接口（我们期望的接口）
interface MediaPlayer {
  play(fileName: string): void;
}

// 被适配者：旧的音频播放器
class OldAudioPlayer {
  playMp3(fileName: string): void {
    console.log(`🎵 播放 MP3 文件: ${fileName}`);
  }
}

// 适配器：让旧播放器符合新接口
class AudioPlayerAdapter implements MediaPlayer {
  private oldPlayer: OldAudioPlayer;
  
  constructor() {
    this.oldPlayer = new OldAudioPlayer();
  }
  
  play(fileName: string): void {
    // 适配调用
    this.oldPlayer.playMp3(fileName);
  }
}

// 客户端代码
function playMedia(player: MediaPlayer, fileName: string) {
  player.play(fileName);
}

// 使用示例
const player = new AudioPlayerAdapter();
playMedia(player, 'song.mp3');
```

**实战示例：支付接口适配器**

```typescript
// 统一的支付接口
interface PaymentProcessor {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

interface RefundResult {
  success: boolean;
  refundId: string;
  message: string;
}

// 第三方支付服务 A（Stripe 风格）
class StripePaymentService {
  async charge(options: { amount: number; currency: string }): Promise<any> {
    console.log(`[Stripe] 处理支付: ${options.amount} ${options.currency}`);
    return {
      id: 'stripe_' + Date.now(),
      status: 'succeeded',
      amount: options.amount
    };
  }
  
  async createRefund(chargeId: string, amount: number): Promise<any> {
    console.log(`[Stripe] 退款: ${amount}, 交易ID: ${chargeId}`);
    return {
      id: 'refund_' + Date.now(),
      status: 'succeeded'
    };
  }
}

// 第三方支付服务 B（PayPal 风格）
class PayPalPaymentService {
  async executePayment(params: { total: number; currency: string }): Promise<any> {
    console.log(`[PayPal] 执行支付: ${params.total} ${params.currency}`);
    return {
      paymentId: 'paypal_' + Date.now(),
      state: 'approved',
      total: params.total
    };
  }
  
  async refundPayment(paymentId: string, refundAmount: number): Promise<any> {
    console.log(`[PayPal] 退款: ${refundAmount}, 支付ID: ${paymentId}`);
    return {
      refundId: 'refund_' + Date.now(),
      state: 'completed'
    };
  }
}

// Stripe 适配器
class StripeAdapter implements PaymentProcessor {
  private stripe: StripePaymentService;
  
  constructor() {
    this.stripe = new StripePaymentService();
  }
  
  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    try {
      const result = await this.stripe.charge({ amount, currency });
      return {
        success: result.status === 'succeeded',
        transactionId: result.id,
        message: '支付成功'
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        message: '支付失败: ' + error
      };
    }
  }
  
  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    try {
      const result = await this.stripe.createRefund(transactionId, amount);
      return {
        success: result.status === 'succeeded',
        refundId: result.id,
        message: '退款成功'
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        message: '退款失败: ' + error
      };
    }
  }
}

// PayPal 适配器
class PayPalAdapter implements PaymentProcessor {
  private paypal: PayPalPaymentService;
  
  constructor() {
    this.paypal = new PayPalPaymentService();
  }
  
  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    try {
      const result = await this.paypal.executePayment({ total: amount, currency });
      return {
        success: result.state === 'approved',
        transactionId: result.paymentId,
        message: '支付成功'
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        message: '支付失败: ' + error
      };
    }
  }
  
  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    try {
      const result = await this.paypal.refundPayment(transactionId, amount);
      return {
        success: result.state === 'completed',
        refundId: result.refundId,
        message: '退款成功'
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        message: '退款失败: ' + error
      };
    }
  }
}

// 客户端代码
class PaymentService {
  constructor(private processor: PaymentProcessor) {}
  
  async pay(amount: number, currency: string = 'USD') {
    console.log(`\n处理支付: ${amount} ${currency}`);
    const result = await this.processor.processPayment(amount, currency);
    console.log('结果:', result);
    return result;
  }
  
  async refundPayment(transactionId: string, amount: number) {
    console.log(`\n处理退款: ${amount}, 交易ID: ${transactionId}`);
    const result = await this.processor.refund(transactionId, amount);
    console.log('结果:', result);
    return result;
  }
}

// 使用示例
async function example() {
  // 使用 Stripe
  console.log('=== 使用 Stripe ===');
  const stripePayment = new PaymentService(new StripeAdapter());
  const payment1 = await stripePayment.pay(100, 'USD');
  await stripePayment.refundPayment(payment1.transactionId, 50);
  
  // 使用 PayPal
  console.log('\n=== 使用 PayPal ===');
  const paypalPayment = new PaymentService(new PayPalAdapter());
  const payment2 = await paypalPayment.pay(200, 'USD');
  await paypalPayment.refundPayment(payment2.transactionId, 100);
}
```

---

### 3.2 装饰者模式（Decorator Pattern）

**定义：** 动态地给对象添加额外的职责，而不改变其接口。装饰者提供了比继承更灵活的替代方案。

> **🏛️ Frontend Pattern: Higher-Order Components (HOC)**
>
> 在 React 中，HOC 就是装饰者模式的典型应用。
>
> ```typescript
> // HOC 定义
> function withLogging(WrappedComponent) {
>   return class extends React.Component {
>     componentDidMount() {
>       console.log('Component mounted');
>     }
>     render() {
>       return <WrappedComponent {...this.props} />;
>     }
>   };
> }
>
> // 使用 HOC
> const EnhancedButton = withLogging(Button);
> ```
>
> **Trade-off**: HOC 可能会导致 "Wrapper Hell" (嵌套层级过深)。现代 React 更倾向于使用 **Hooks** 来复用逻辑，因为 Hooks 不会增加组件树的深度。

**应用场景：**
- 需要扩展类的功能，但不想使用继承
- 需要动态地添加/撤销功能
- 有大量独立的扩展，继承会导致类爆炸

**基础装饰者模式**

```typescript
// 组件接口
interface Coffee {
  cost(): number;
  description(): string;
}

// 具体组件：基础咖啡
class SimpleCoffee implements Coffee {
  cost(): number {
    return 10;
  }
  
  description(): string {
    return '基础咖啡';
  }
}

// 装饰者基类
abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}
  
  abstract cost(): number;
  abstract description(): string;
}

// 具体装饰者：牛奶
class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 3;
  }
  
  description(): string {
    return this.coffee.description() + ' + 牛奶';
  }
}

// 具体装饰者：糖
class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 1;
  }
  
  description(): string {
    return this.coffee.description() + ' + 糖';
  }
}

// 具体装饰者：摩卡
class MochaDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 5;
  }
  
  description(): string {
    return this.coffee.description() + ' + 摩卡';
  }
}

// 使用示例
let coffee: Coffee = new SimpleCoffee();
console.log(`${coffee.description()} = ¥${coffee.cost()}`);
// 基础咖啡 = ¥10

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()} = ¥${coffee.cost()}`);
// 基础咖啡 + 牛奶 = ¥13

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()} = ¥${coffee.cost()}`);
// 基础咖啡 + 牛奶 + 糖 = ¥14

coffee = new MochaDecorator(coffee);
console.log(`${coffee.description()} = ¥${coffee.cost()}`);
// 基础咖啡 + 牛奶 + 糖 + 摩卡 = ¥19
```

**实战示例：HTTP 中间件装饰者**

```typescript
// HTTP 请求和响应接口
interface Request {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
}

interface Response {
  status: number;
  headers: Record<string, string>;
  body: any;
}

// 基础 HTTP 处理器接口
interface HttpHandler {
  handle(request: Request): Promise<Response>;
}

// 具体处理器：实际的 HTTP 请求
class BaseHttpHandler implements HttpHandler {
  async handle(request: Request): Promise<Response> {
    console.log(`[BaseHandler] 发送请求: ${request.method} ${request.url}`);
    
    // 模拟 HTTP 请求
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { message: '请求成功' }
    };
  }
}

// 装饰者基类
abstract class HttpHandlerDecorator implements HttpHandler {
  constructor(protected handler: HttpHandler) {}
  
  abstract handle(request: Request): Promise<Response>;
}

// 日志装饰者
class LoggingDecorator extends HttpHandlerDecorator {
  async handle(request: Request): Promise<Response> {
    console.log(`[日志] 请求开始: ${request.method} ${request.url}`);
    console.log(`[日志] 请求头:`, request.headers);
    
    const startTime = Date.now();
    const response = await this.handler.handle(request);
    const duration = Date.now() - startTime;
    
    console.log(`[日志] 响应状态: ${response.status}`);
    console.log(`[日志] 耗时: ${duration}ms`);
    
    return response;
  }
}

// 认证装饰者
class AuthenticationDecorator extends HttpHandlerDecorator {
  constructor(handler: HttpHandler, private token: string) {
    super(handler);
  }
  
  async handle(request: Request): Promise<Response> {
    console.log(`[认证] 添加认证头`);
    
    // 添加认证头
    request.headers['Authorization'] = `Bearer ${this.token}`;
    
    const response = await this.handler.handle(request);
    
    // 检查认证状态
    if (response.status === 401) {
      console.log(`[认证] 认证失败`);
    }
    
    return response;
  }
}

// 重试装饰者
class RetryDecorator extends HttpHandlerDecorator {
  constructor(handler: HttpHandler, private maxRetries: number = 3) {
    super(handler);
  }
  
  async handle(request: Request): Promise<Response> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[重试] 尝试 ${attempt}/${this.maxRetries}`);
        const response = await this.handler.handle(request);
        
        // 如果成功，直接返回
        if (response.status < 500) {
          return response;
        }
        
        lastError = new Error(`服务器错误: ${response.status}`);
      } catch (error) {
        lastError = error;
        console.log(`[重试] 尝试 ${attempt} 失败:`, error);
        
        // 如果还有重试机会，等待后重试
        if (attempt < this.maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }
    
    throw lastError;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 缓存装饰者
class CacheDecorator extends HttpHandlerDecorator {
  private cache = new Map<string, { response: Response; expiry: number }>();
  
  constructor(handler: HttpHandler, private ttl: number = 60000) {
    super(handler);
  }
  
  async handle(request: Request): Promise<Response> {
    // 只缓存 GET 请求
    if (request.method !== 'GET') {
      return this.handler.handle(request);
    }
    
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);
    
    // 检查缓存
    if (cached && cached.expiry > Date.now()) {
      console.log(`[缓存] 命中: ${request.url}`);
      return cached.response;
    }
    
    console.log(`[缓存] 未命中: ${request.url}`);
    const response = await this.handler.handle(request);
    
    // 存入缓存
    this.cache.set(cacheKey, {
      response,
      expiry: Date.now() + this.ttl
    });
    
    return response;
  }
  
  private getCacheKey(request: Request): string {
    return `${request.method}:${request.url}`;
  }
}

// 使用示例
async function example() {
  // 基础处理器
  let handler: HttpHandler = new BaseHttpHandler();
  
  // 添加日志
  handler = new LoggingDecorator(handler);
  
  // 添加认证
  handler = new AuthenticationDecorator(handler, 'my-secret-token');
  
  // 添加重试
  handler = new RetryDecorator(handler, 3);
  
  // 添加缓存
  handler = new CacheDecorator(handler, 60000);
  
  // 发送请求
  const request: Request = {
    url: 'https://api.example.com/users',
    method: 'GET',
    headers: {}
  };
  
  const response = await handler.handle(request);
  console.log('\n最终响应:', response);
}
```

---

### 3.3 代理模式（Proxy Pattern）

> **🛡️ The Metaphor: The Bodyguard**
> 代理模式就像是明星的**保镖**或**经纪人**。
> 你想见明星（真实对象），你不能直接冲过去。
> 你必须先通过经纪人（代理）。
> 经纪人会：
> 1.  **检查你的身份**（保护代理）：你是粉丝还是狗仔队？
> 2.  **看看明星在不在**（虚拟代理）：明星还在睡觉（对象未加载），经纪人先拿张照片打发你。
> 3.  **记录你的请求**（日志代理）：把你的来访记录在案。
> 
> 代理控制了对真实对象的访问，可以在访问前后添加各种**附加逻辑**。

**定义：** 为其他对象提供一种代理以控制对这个对象的访问。

**应用场景：**
- 延迟加载（虚拟代理）
- 访问控制（保护代理）
- 日志记录（记录代理）
- 缓存（缓存代理）

**虚拟代理示例：图片懒加载**

```typescript
// 图片接口
interface Image {
  display(): void;
}

// 真实图片类
class RealImage implements Image {
  private filename: string;
  
  constructor(filename: string) {
    this.filename = filename;
    this.loadFromDisk();
  }
  
  private loadFromDisk(): void {
    console.log(`📥 从磁盘加载图片: ${this.filename}`);
    // 模拟耗时操作
  }
  
  display(): void {
    console.log(`🖼️  显示图片: ${this.filename}`);
  }
}

// 代理图片类（懒加载）
class ProxyImage implements Image {
  private realImage: RealImage | null = null;
  private filename: string;
  
  constructor(filename: string) {
    this.filename = filename;
  }
  
  display(): void {
    // 只在真正需要时才加载图片
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// 使用示例
console.log('=== 创建代理对象 ===');
const image1 = new ProxyImage('photo1.jpg');
const image2 = new ProxyImage('photo2.jpg');

console.log('\n=== 第一次显示图片（会加载）===');
image1.display(); // 此时才真正加载图片

console.log('\n=== 第二次显示图片（不会重新加载）===');
image1.display(); // 直接显示，不再加载

console.log('\n=== 显示第二张图片 ===');
image2.display(); // 加载并显示第二张图片
```

**保护代理示例：访问控制**

```typescript
// 文档接口
interface Document {
  read(): string;
  write(content: string): void;
}

// 真实文档类
class SensitiveDocument implements Document {
  private content: string = '机密文档内容';
  
  read(): string {
    return this.content;
  }
  
  write(content: string): void {
    this.content = content;
  }
}

// 保护代理：基于用户权限的访问控制
class DocumentProxy implements Document {
  private document: SensitiveDocument;
  private user: { name: string; role: string };
  
  constructor(user: { name: string; role: string }) {
    this.document = new SensitiveDocument();
    this.user = user;
  }
  
  read(): string {
    console.log(`[代理] 用户 ${this.user.name} (${this.user.role}) 请求读取文档`);
    
    // 检查读权限
    if (this.hasReadPermission()) {
      console.log(`[代理] ✅ 允许读取`);
      return this.document.read();
    } else {
      console.log(`[代理] ❌ 拒绝访问：权限不足`);
      throw new Error('权限不足：无法读取文档');
    }
  }
  
  write(content: string): void {
    console.log(`[代理] 用户 ${this.user.name} (${this.user.role}) 请求写入文档`);
    
    // 检查写权限
    if (this.hasWritePermission()) {
      console.log(`[代理] ✅ 允许写入`);
      this.document.write(content);
    } else {
      console.log(`[代理] ❌ 拒绝访问：权限不足`);
      throw new Error('权限不足：无法写入文档');
    }
  }
  
  private hasReadPermission(): boolean {
    // 只有 admin 和 editor 可以读取
    return ['admin', 'editor', 'viewer'].includes(this.user.role);
  }
  
  private hasWritePermission(): boolean {
    // 只有 admin 和 editor 可以写入
    return ['admin', 'editor'].includes(this.user.role);
  }
}

// 使用示例
console.log('=== 管理员访问 ===');
const adminDoc = new DocumentProxy({ name: 'Alice', role: 'admin' });
console.log('内容:', adminDoc.read());
adminDoc.write('新的机密内容');

console.log('\n=== 查看者访问 ===');
const viewerDoc = new DocumentProxy({ name: 'Bob', role: 'viewer' });
console.log('内容:', viewerDoc.read());
try {
  viewerDoc.write('尝试修改内容'); // 会抛出错误
} catch (error) {
  console.log('错误:', error.message);
}

console.log('\n=== 访客访问 ===');
const guestDoc = new DocumentProxy({ name: 'Guest', role: 'guest' });
try {
  guestDoc.read(); // 会抛出错误
} catch (error) {
  console.log('错误:', error.message);
}
```

**缓存代理示例**

```typescript
// API 接口
interface DataAPI {
  fetchData(id: string): Promise<any>;
}

// 真实 API
class RealDataAPI implements DataAPI {
  async fetchData(id: string): Promise<any> {
    console.log(`[真实API] 从服务器获取数据: ${id}`);
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id,
      data: `数据-${id}`,
      timestamp: Date.now()
    };
  }
}

// 缓存代理
class CachedDataAPI implements DataAPI {
  private api: RealDataAPI;
  private cache = new Map<string, { data: any; expiry: number }>();
  private ttl: number;
  
  constructor(ttl: number = 60000) {
    this.api = new RealDataAPI();
    this.ttl = ttl;
  }
  
  async fetchData(id: string): Promise<any> {
    const cached = this.cache.get(id);
    
    // 检查缓存
    if (cached && cached.expiry > Date.now()) {
      console.log(`[缓存代理] ✨ 从缓存返回数据: ${id}`);
      return cached.data;
    }
    
    // 缓存未命中或已过期
    console.log(`[缓存代理] 📡 缓存未命中，调用真实API: ${id}`);
    const data = await this.api.fetchData(id);
    
    // 存入缓存
    this.cache.set(id, {
      data,
      expiry: Date.now() + this.ttl
    });
    
    return data;
  }
  
  clearCache(): void {
    console.log(`[缓存代理] 🗑️  清空缓存`);
    this.cache.clear();
  }
}

// 使用示例
async function example() {
  const api = new CachedDataAPI(5000); // 5秒缓存
  
  console.log('=== 第一次请求 ===');
  await api.fetchData('user-123');
  
  console.log('\n=== 第二次请求（从缓存） ===');
  await api.fetchData('user-123');
  
  console.log('\n=== 不同ID的请求 ===');
  await api.fetchData('user-456');
  
  console.log('\n=== 再次请求第一个ID（从缓存）===');
  await api.fetchData('user-123');
}
```

---

## 4. 行为型模式

行为型模式关注对象之间的通信和职责分配。

### 4.1 观察者模式（Observer Pattern）

> **📰 The Metaphor: The Newspaper Subscription**
> 观察者模式就是**订报纸**。
> *   **Subject (报社)**: 负责生产新闻。它不关心谁在读报纸，它只管把报纸印出来，发给所有订阅者。
> *   **Observer (订阅者)**: 想要看报纸的人。他们在报社登记了自己的地址。
> *   当有新报纸（状态改变）时，报社就会挨家挨户送报纸（通知）。
> 
> 这实现了**解耦**：报社不需要知道订阅者的具体身份，订阅者也不需要每分钟打电话问报社“有新闻吗？”（轮询）。

**定义：** 定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。

**应用场景：**
- 事件系统
- 发布-订阅系统
- 数据绑定（MVC、MVVM）
- 消息队列

**基础观察者模式**

```typescript
// 观察者接口
interface Observer {
  update(data: any): void;
}

// 主题接口
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(data: any): void;
}

// 具体主题：新闻发布者
class NewsPublisher implements Subject {
  private observers: Observer[] = [];
  private latestNews: string = '';
  
  attach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index === -1) {
      this.observers.push(observer);
      console.log(`📢 订阅者已添加，当前订阅数: ${this.observers.length}`);
    }
  }
  
  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
      console.log(`📢 订阅者已移除，当前订阅数: ${this.observers.length}`);
    }
  }
  
  notify(data: any): void {
    console.log(`📢 通知所有订阅者 (${this.observers.length})`);
    this.observers.forEach(observer => {
      observer.update(data);
    });
  }
  
  publishNews(news: string): void {
    console.log(`\n📰 发布新闻: ${news}`);
    this.latestNews = news;
    this.notify({ news, timestamp: Date.now() });
  }
}

// 具体观察者：邮件订阅者
class EmailSubscriber implements Observer {
  constructor(private email: string) {}
  
  update(data: any): void {
    console.log(`📧 [${this.email}] 收到新闻: ${data.news}`);
  }
}

// 具体观察者：短信订阅者
class SMSSubscriber implements Observer {
  constructor(private phoneNumber: string) {}
  
  update(data: any): void {
    console.log(`📱 [${this.phoneNumber}] 收到新闻: ${data.news}`);
  }
}

// 具体观察者：推送通知订阅者
class PushSubscriber implements Observer {
  constructor(private userId: string) {}
  
  update(data: any): void {
    console.log(`🔔 [用户${this.userId}] 收到新闻: ${data.news}`);
  }
}

// 使用示例
const publisher = new NewsPublisher();

const emailSub1 = new EmailSubscriber('user1@example.com');
const emailSub2 = new EmailSubscriber('user2@example.com');
const smsSub = new SMSSubscriber('+86 138****8888');
const pushSub = new PushSubscriber('user-123');

// 订阅
publisher.attach(emailSub1);
publisher.attach(emailSub2);
publisher.attach(smsSub);
publisher.attach(pushSub);

// 发布新闻
publisher.publishNews('TypeScript 5.0 发布!');

// 取消订阅
publisher.detach(smsSub);

// 再次发布
publisher.publishNews('JavaScript 最新特性介绍');
```

**实战示例：股票价格监控系统**

```typescript
// 股票数据
interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

// 观察者接口
interface StockObserver {
  onPriceUpdate(data: StockData): void;
}

// 股票主题
class Stock {
  private observers: Map<string, StockObserver[]> = new Map();
  private prices: Map<string, StockData> = new Map();
  
  // 订阅特定股票
  subscribe(symbol: string, observer: StockObserver): void {
    if (!this.observers.has(symbol)) {
      this.observers.set(symbol, []);
    }
    
    const observers = this.observers.get(symbol)!;
    if (!observers.includes(observer)) {
      observers.push(observer);
      console.log(`✅ 订阅 ${symbol}，当前订阅者: ${observers.length}`);
    }
  }
  
  // 取消订阅
  unsubscribe(symbol: string, observer: StockObserver): void {
    const observers = this.observers.get(symbol);
    if (observers) {
      const index = observers.indexOf(observer);
      if (index !== -1) {
        observers.splice(index, 1);
        console.log(`❌ 取消订阅 ${symbol}，剩余订阅者: ${observers.length}`);
      }
    }
  }
  
  // 更新股票价格
  updatePrice(symbol: string, newPrice: number): void {
    const oldData = this.prices.get(symbol);
    const oldPrice = oldData?.price || newPrice;
    
    const change = newPrice - oldPrice;
    const changePercent = (change / oldPrice) * 100;
    
    const data: StockData = {
      symbol,
      price: newPrice,
      change,
      changePercent,
      timestamp: Date.now()
    };
    
    this.prices.set(symbol, data);
    this.notifyObservers(symbol, data);
  }
  
  private notifyObservers(symbol: string, data: StockData): void {
    const observers = this.observers.get(symbol) || [];
    console.log(`📊 ${symbol} 价格更新: ¥${data.price} (${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`);
    
    observers.forEach(observer => {
      observer.onPriceUpdate(data);
    });
  }
}

// 具体观察者：价格警报
class PriceAlert implements StockObserver {
  constructor(
    private name: string,
    private threshold: number,
    private type: 'above' | 'below'
  ) {}
  
  onPriceUpdate(data: StockData): void {
    if (this.type === 'above' && data.price > this.threshold) {
      console.log(`🚨 [${this.name}] 价格警报: ${data.symbol} 超过 ¥${this.threshold} (当前: ¥${data.price})`);
    } else if (this.type === 'below' && data.price < this.threshold) {
      console.log(`🚨 [${this.name}] 价格警报: ${data.symbol} 低于 ¥${this.threshold} (当前: ¥${data.price})`);
    }
  }
}

// 具体观察者：投资组合追踪器
class PortfolioTracker implements StockObserver {
  private holdings: Map<string, number> = new Map(); // symbol -> quantity
  
  constructor(private name: string) {}
  
  addHolding(symbol: string, quantity: number): void {
    this.holdings.set(symbol, quantity);
  }
  
  onPriceUpdate(data: StockData): void {
    const quantity = this.holdings.get(data.symbol) || 0;
    if (quantity > 0) {
      const value = quantity * data.price;
      const change = quantity * data.change;
      console.log(
        `💼 [${this.name}] ${data.symbol}: ` +
        `持有 ${quantity} 股，价值 ¥${value.toFixed(2)}，` +
        `变化 ${change > 0 ? '+' : ''}¥${change.toFixed(2)}`
      );
    }
  }
}

// 具体观察者：日志记录器
class PriceLogger implements StockObserver {
  private logs: string[] = [];
  
  onPriceUpdate(data: StockData): void {
    const log = `[${new Date(data.timestamp).toISOString()}] ${data.symbol}: ¥${data.price}`;
    this.logs.push(log);
    console.log(`📝 日志: ${log}`);
  }
  
  getLogs(): string[] {
    return [...this.logs];
  }
}

// 使用示例
const stock = new Stock();

// 创建观察者
const highPriceAlert = new PriceAlert('高价警报', 150, 'above');
const lowPriceAlert = new PriceAlert('低价警报', 100, 'below');
const portfolio = new PortfolioTracker('我的投资组合');
const logger = new PriceLogger();

// 添加持仓
portfolio.addHolding('AAPL', 100);

// 订阅 AAPL 股票
stock.subscribe('AAPL', highPriceAlert);
stock.subscribe('AAPL', lowPriceAlert);
stock.subscribe('AAPL', portfolio);
stock.subscribe('AAPL', logger);

console.log('\n=== 第一次更新 ===');
stock.updatePrice('AAPL', 145);

console.log('\n=== 第二次更新（触发高价警报）===');
stock.updatePrice('AAPL', 155);

console.log('\n=== 第三次更新（触发低价警报）===');
stock.updatePrice('AAPL', 95);

// 取消订阅
console.log('\n=== 取消价格警报 ===');
stock.unsubscribe('AAPL', highPriceAlert);
stock.unsubscribe('AAPL', lowPriceAlert);

console.log('\n=== 最后一次更新 ===');
stock.updatePrice('AAPL', 150);
```

---

### 4.2 策略模式（Strategy Pattern）

> **🗺️ The Metaphor: The Navigation App**
> 策略模式就像是**导航软件**。
> 你想去机场（目标）。导航软件会给你提供多种**路线策略**：
> *   **最快路线**（驾车策略）：走高速，但可能堵车。
> *   **最省钱路线**（公交策略）：坐地铁，但要转车。
> *   **最短距离**（步行策略）：穿小巷，但很累。
> 
> 你可以在运行时根据情况（赶时间？没钱？想锻炼？）**动态切换**策略，而不需要改变目的地。

**定义：** 定义一系列算法，把它们一个个封装起来，并且使它们可以相互替换。策略模式使得算法可以独立于使用它的客户而变化。

> **🏛️ Frontend Pattern: Render Props**
>
> 在前端组件设计中，**Render Props** 模式本质上就是策略模式的一种变体。
> 父组件将 "如何渲染" 的策略（Strategy）作为一个函数 prop 传递给子组件。
>
> ```tsx
> // List 组件 (Context)
> <List
>   data={items}
>   // 渲染策略 (Strategy)
>   renderItem={(item) => <ListItem key={item.id} item={item} />}
> />
>
> // 切换策略
> <List
>   data={items}
>   renderItem={(item) => <CardItem key={item.id} item={item} />}
> />
> ```

**应用场景：**
- 不同的计算方式或算法
- 验证规则
- 排序算法
- 支付方式

**基础策略模式**

```typescript
// 策略接口
interface SortStrategy {
  sort(data: number[]): number[];
}

// 具体策略：冒泡排序
class BubbleSortStrategy implements SortStrategy {
  sort(data: number[]): number[] {
    console.log('使用冒泡排序');
    const arr = [...data];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    
    return arr;
  }
}

// 具体策略：快速排序
class QuickSortStrategy implements SortStrategy {
  sort(data: number[]): number[] {
    console.log('使用快速排序');
    const arr = [...data];
    
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    
    return [...this.sort(left), ...middle, ...this.sort(right)];
  }
}

// 具体策略：归并排序
class MergeSortStrategy implements SortStrategy {
  sort(data: number[]): number[] {
    console.log('使用归并排序');
    return this.mergeSort([...data]);
  }
  
  private mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid));
    const right = this.mergeSort(arr.slice(mid));
    
    return this.merge(left, right);
  }
  
  private merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      if (left[i] < right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
  }
}

// 上下文类
class DataSorter {
  private strategy: SortStrategy;
  
  constructor(strategy: SortStrategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy;
  }
  
  sort(data: number[]): number[] {
    return this.strategy.sort(data);
  }
}

// 使用示例
const data = [64, 34, 25, 12, 22, 11, 90];

const sorter = new DataSorter(new BubbleSortStrategy());
console.log('原始数据:', data);
console.log('排序结果:', sorter.sort(data));

console.log('\n切换到快速排序');
sorter.setStrategy(new QuickSortStrategy());
console.log('排序结果:', sorter.sort(data));

console.log('\n切换到归并排序');
sorter.setStrategy(new MergeSortStrategy());
console.log('排序结果:', sorter.sort(data));
```

**实战示例：支付策略**

```typescript
// 支付结果接口
interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  amount: number;
}

// 策略接口
interface PaymentStrategy {
  pay(amount: number, currency: string): Promise<PaymentResult>;
  getName(): string;
}

// 具体策略：信用卡支付
class CreditCardPayment implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private cvv: string,
    private expiryDate: string
  ) {}
  
  getName(): string {
    return '信用卡';
  }
  
  async pay(amount: number, currency: string): Promise<PaymentResult> {
    console.log(`💳 使用信用卡支付 ${amount} ${currency}`);
    console.log(`   卡号: **** **** **** ${this.cardNumber.slice(-4)}`);
    
    // 模拟支付处理
    await this.processPayment();
    
    return {
      success: true,
      transactionId: 'CC-' + Date.now(),
      message: '信用卡支付成功',
      amount
    };
  }
  
  private async processPayment(): Promise<void> {
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 具体策略：支付宝支付
class AlipayPayment implements PaymentStrategy {
  constructor(private account: string) {}
  
  getName(): string {
    return '支付宝';
  }
  
  async pay(amount: number, currency: string): Promise<PaymentResult> {
    console.log(`💰 使用支付宝支付 ${amount} ${currency}`);
    console.log(`   账号: ${this.account}`);
    
    // 模拟支付处理
    await this.processPayment();
    
    return {
      success: true,
      transactionId: 'ALIPAY-' + Date.now(),
      message: '支付宝支付成功',
      amount
    };
  }
  
  private async processPayment(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

// 具体策略：微信支付
class WeChatPayment implements PaymentStrategy {
  constructor(private openId: string) {}
  
  getName(): string {
    return '微信支付';
  }
  
  async pay(amount: number, currency: string): Promise<PaymentResult> {
    console.log(`💚 使用微信支付 ${amount} ${currency}`);
    console.log(`   OpenID: ${this.openId}`);
    
    // 模拟支付处理
    await this.processPayment();
    
    return {
      success: true,
      transactionId: 'WECHAT-' + Date.now(),
      message: '微信支付成功',
      amount
    };
  }
  
  private async processPayment(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
  }
}

// 具体策略：加密货币支付
class CryptoPayment implements PaymentStrategy {
  constructor(
    private walletAddress: string,
    private cryptoType: string
  ) {}
  
  getName(): string {
    return `${this.cryptoType}支付`;
  }
  
  async pay(amount: number, currency: string): Promise<PaymentResult> {
    console.log(`₿ 使用${this.cryptoType}支付 ${amount} ${currency}`);
    console.log(`   钱包地址: ${this.walletAddress.substring(0, 10)}...`);
    
    // 模拟区块链确认
    await this.processPayment();
    
    return {
      success: true,
      transactionId: 'CRYPTO-' + Date.now(),
      message: `${this.cryptoType}支付成功`,
      amount
    };
  }
  
  private async processPayment(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 上下文类：购物车
class ShoppingCart {
  private items: { name: string; price: number }[] = [];
  private paymentStrategy: PaymentStrategy | null = null;
  
  addItem(name: string, price: number): void {
    this.items.push({ name, price });
    console.log(`➕ 添加商品: ${name} (¥${price})`);
  }
  
  removeItem(name: string): void {
    const index = this.items.findIndex(item => item.name === name);
    if (index !== -1) {
      const item = this.items.splice(index, 1)[0];
      console.log(`➖ 移除商品: ${item.name}`);
    }
  }
  
  getTotalAmount(): number {
    return this.items.reduce((total, item) => total + item.price, 0);
  }
  
  setPaymentStrategy(strategy: PaymentStrategy): void {
    this.paymentStrategy = strategy;
    console.log(`🔄 切换支付方式: ${strategy.getName()}`);
  }
  
  async checkout(): Promise<void> {
    if (!this.paymentStrategy) {
      throw new Error('请选择支付方式');
    }
    
    if (this.items.length === 0) {
      throw new Error('购物车为空');
    }
    
    const total = this.getTotalAmount();
    console.log(`\n🛒 结算购物车`);
    console.log(`   商品清单:`);
    this.items.forEach(item => {
      console.log(`   - ${item.name}: ¥${item.price}`);
    });
    console.log(`   总计: ¥${total}`);
    console.log();
    
    const result = await this.paymentStrategy.pay(total, 'CNY');
    
    if (result.success) {
      console.log(`\n✅ ${result.message}`);
      console.log(`   交易ID: ${result.transactionId}`);
      console.log(`   金额: ¥${result.amount}`);
      this.items = []; // 清空购物车
    } else {
      console.log(`\n❌ 支付失败: ${result.message}`);
    }
  }
}

// 使用示例
async function example() {
  const cart = new ShoppingCart();
  
  // 添加商品
  cart.addItem('TypeScript 编程书', 89);
  cart.addItem('无线鼠标', 149);
  cart.addItem('机械键盘', 599);
  
  // 使用信用卡支付
  console.log('\n=== 方式 1: 信用卡支付 ===');
  cart.setPaymentStrategy(new CreditCardPayment(
    '1234567812345678',
    '123',
    '12/25'
  ));
  await cart.checkout();
  
  // 再次添加商品
  cart.addItem('显示器', 1999);
  cart.addItem('耳机', 299);
  
  // 使用支付宝支付
  console.log('\n\n=== 方式 2: 支付宝支付 ===');
  cart.setPaymentStrategy(new AlipayPayment('user@example.com'));
  await cart.checkout();
  
  // 再次添加商品
  cart.addItem('笔记本', 19);
  
  // 使用微信支付
  console.log('\n\n=== 方式 3: 微信支付 ===');
  cart.setPaymentStrategy(new WeChatPayment('ox1234567890'));
  await cart.checkout();
  
  // 再次添加商品
  cart.addItem('服务器', 9999);
  
  // 使用加密货币支付
  console.log('\n\n=== 方式 4: 比特币支付 ===');
  cart.setPaymentStrategy(new CryptoPayment(
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    'Bitcoin'
  ));
  await cart.checkout();
}
```

---

### 4.3 命令模式（Command Pattern）

**定义：** 将一个请求封装为一个对象，从而让你可以用不同的请求对客户进行参数化，对请求排队或记录请求日志，以及支持可撤销的操作。

**应用场景：**
- 撤销/重做功能
- 事务处理
- 宏命令（批量操作）
- 队列系统

**基础命令模式**

```typescript
// 命令接口
interface Command {
  execute(): void;
  undo(): void;
}

// 接收者：文本编辑器
class TextEditor {
  private text: string = '';
  
  getText(): string {
    return this.text;
  }
  
  setText(text: string): void {
    this.text = text;
  }
  
  append(text: string): void {
    this.text += text;
  }
  
  delete(length: number): void {
    this.text = this.text.slice(0, -length);
  }
}

// 具体命令：插入文本
class InsertTextCommand implements Command {
  private previousText: string = '';
  
  constructor(
    private editor: TextEditor,
    private text: string
  ) {}
  
  execute(): void {
    this.previousText = this.editor.getText();
    this.editor.append(this.text);
    console.log(`✏️  插入文本: "${this.text}"`);
  }
  
  undo(): void {
    this.editor.setText(this.previousText);
    console.log(`↩️  撤销插入: "${this.text}"`);
  }
}

// 具体命令：删除文本
class DeleteTextCommand implements Command {
  private deletedText: string = '';
  private previousText: string = '';
  
  constructor(
    private editor: TextEditor,
    private length: number
  ) {}
  
  execute(): void {
    this.previousText = this.editor.getText();
    this.deletedText = this.previousText.slice(-this.length);
    this.editor.delete(this.length);
    console.log(`🗑️  删除文本: "${this.deletedText}"`);
  }
  
  undo(): void {
    this.editor.setText(this.previousText);
    console.log(`↩️  撤销删除: "${this.deletedText}"`);
  }
}

// 调用者：命令历史管理器
class CommandHistory {
  private history: Command[] = [];
  private currentIndex: number = -1;
  
  execute(command: Command): void {
    // 执行新命令时，清除当前位置之后的历史
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    command.execute();
    this.history.push(command);
    this.currentIndex++;
  }
  
  undo(): void {
    if (this.currentIndex >= 0) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
    } else {
      console.log('⚠️  没有可撤销的操作');
    }
  }
  
  redo(): void {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
    } else {
      console.log('⚠️  没有可重做的操作');
    }
  }
}

// 使用示例
const editor = new TextEditor();
const history = new CommandHistory();

console.log('=== 开始编辑 ===');
history.execute(new InsertTextCommand(editor, 'Hello'));
console.log('当前文本:', editor.getText());

history.execute(new InsertTextCommand(editor, ' World'));
console.log('当前文本:', editor.getText());

history.execute(new InsertTextCommand(editor, '!'));
console.log('当前文本:', editor.getText());

console.log('\n=== 撤销操作 ===');
history.undo();
console.log('当前文本:', editor.getText());

history.undo();
console.log('当前文本:', editor.getText());

console.log('\n=== 重做操作 ===');
history.redo();
console.log('当前文本:', editor.getText());

console.log('\n=== 继续编辑 ===');
history.execute(new DeleteTextCommand(editor, 6));
console.log('当前文本:', editor.getText());

console.log('\n=== 最后的撤销 ===');
history.undo();
console.log('当前文本:', editor.getText());
```

---

## 5. 依赖注入（Dependency Injection）

**定义：** 依赖注入是一种设计模式，用于实现控制反转（IoC），将对象的依赖关系从代码内部转移到外部配置。

**应用场景：**
- 解耦组件
- 提高可测试性
- 便于替换实现
- 配置管理

**基础依赖注入**

```typescript
// ❌ 没有依赖注入：紧耦合
class BadUserService {
  private db = new MySQLDatabase(); // 硬编码依赖
  private logger = new FileLogger(); // 硬编码依赖
  
  async getUser(id: string) {
    this.logger.log(`获取用户: ${id}`);
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// ✅ 使用依赖注入：松耦合
interface Database {
  query(sql: string): Promise<any>;
}

interface Logger {
  log(message: string): void;
}

class GoodUserService {
  constructor(
    private db: Database,      // 依赖注入
    private logger: Logger     // 依赖注入
  ) {}
  
  async getUser(id: string) {
    this.logger.log(`获取用户: ${id}`);
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// 使用时注入具体实现
const db = new MySQLDatabase();
const logger = new FileLogger();
const userService = new GoodUserService(db, logger);
```

**完整的 DI 容器实现**

```typescript
// 服务标识符（使用 Symbol 确保唯一性）
const TYPES = {
  Database: Symbol.for('Database'),
  Logger: Symbol.for('Logger'),
  EmailService: Symbol.for('EmailService'),
  UserService: Symbol.for('UserService'),
  UserController: Symbol.for('UserController')
};

// 依赖注入容器
class DIContainer {
  private services = new Map<symbol, any>();
  private factories = new Map<symbol, () => any>();
  private singletons = new Map<symbol, any>();
  
  // 注册单例服务
  registerSingleton<T>(identifier: symbol, instance: T): void {
    this.singletons.set(identifier, instance);
  }
  
  // 注册工厂函数
  registerFactory<T>(identifier: symbol, factory: () => T): void {
    this.factories.set(identifier, factory);
  }
  
  // 注册类（每次请求创建新实例）
  register<T>(identifier: symbol, constructor: new (...args: any[]) => T): void {
    this.services.set(identifier, constructor);
  }
  
  // 解析依赖
  resolve<T>(identifier: symbol): T {
    // 1. 检查单例
    if (this.singletons.has(identifier)) {
      return this.singletons.get(identifier);
    }
    
    // 2. 检查工厂
    if (this.factories.has(identifier)) {
      const factory = this.factories.get(identifier)!;
      return factory();
    }
    
    // 3. 检查类注册
    if (this.services.has(identifier)) {
      const constructor = this.services.get(identifier)!;
      return new constructor();
    }
    
    throw new Error(`服务未注册: ${identifier.toString()}`);
  }
}

// 示例服务
interface IDatabase {
  connect(): void;
  query(sql: string): Promise<any>;
}

class MySQLDatabase implements IDatabase {
  connect(): void {
    console.log('🔌 连接到 MySQL 数据库');
  }
  
  async query(sql: string): Promise<any> {
    console.log(`📊 执行查询: ${sql}`);
    return { rows: [] };
  }
}

interface ILogger {
  log(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(`📝 [LOG] ${message}`);
  }
  
  error(message: string): void {
    console.error(`❌ [ERROR] ${message}`);
  }
}

interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

class EmailService implements IEmailService {
  constructor(private logger: ILogger) {}
  
  async send(to: string, subject: string, body: string): Promise<void> {
    this.logger.log(`发送邮件到 ${to}: ${subject}`);
    // 实际发送邮件逻辑
  }
}

class UserService {
  constructor(
    private db: IDatabase,
    private logger: ILogger,
    private emailService: IEmailService
  ) {}
  
  async createUser(email: string, name: string): Promise<void> {
    this.logger.log(`创建用户: ${name} (${email})`);
    
    try {
      await this.db.query(`INSERT INTO users (email, name) VALUES ('${email}', '${name}')`);
      await this.emailService.send(email, '欢迎注册', `欢迎, ${name}!`);
      this.logger.log('用户创建成功');
    } catch (error) {
      this.logger.error(`创建用户失败: ${error}`);
      throw error;
    }
  }
}

// 使用 DI 容器
const container = new DIContainer();

// 注册服务
container.registerSingleton(TYPES.Database, new MySQLDatabase());
container.registerSingleton(TYPES.Logger, new ConsoleLogger());

container.registerFactory(TYPES.EmailService, () => {
  const logger = container.resolve<ILogger>(TYPES.Logger);
  return new EmailService(logger);
});

container.registerFactory(TYPES.UserService, () => {
  const db = container.resolve<IDatabase>(TYPES.Database);
  const logger = container.resolve<ILogger>(TYPES.Logger);
  const emailService = container.resolve<IEmailService>(TYPES.EmailService);
  return new UserService(db, logger, emailService);
});

// 使用示例
const userService = container.resolve<UserService>(TYPES.UserService);
userService.createUser('user@example.com', 'Alice');
```

---

## 7. 最佳实践

### ✅ 何时使用设计模式

1. **当你遇到已知的设计问题时**
   - 不要为了用模式而用模式
   - 先理解问题，再选择合适的模式

2. **当代码变得难以维护时**
   - 重复代码 → 考虑工厂模式或模板方法
   - 紧耦合 → 考虑依赖注入或中介者模式
   - 难以扩展 → 考虑策略模式或装饰者模式

3. **当需要提高代码质量时**
   - 更好的可测试性
   - 更清晰的代码结构
   - 更好的可维护性

### ❌ 何时避免使用设计模式

1. **简单问题不需要复杂解决方案**
   ```typescript
   // ❌ 过度设计
   class SimpleMessageFactory {
     createMessage(type: string): Message {
       return new Message(type);
     }
   }
   
   // ✅ 直接创建就好
   const message = new Message('hello');
   ```

2. **增加不必要的复杂度**
   - 如果模式让代码更难理解，考虑更简单的方案
   - 团队成员都理解吗？

3. **过早优化**
   - 先让代码工作，再考虑重构
   - YAGNI 原则：You Aren't Gonna Need It

---

## 8. 章节练习

### 练习 1：实现备忘录模式

创建一个文本编辑器，支持撤销/重做功能，使用备忘录模式保存状态。

```typescript
// TODO: 实现备忘录模式

// 提示：
// 1. 创建 Memento 类保存编辑器状态
// 2. 创建 Editor 类管理文本
// 3. 创建 History 类管理备忘录
```

### 练习 2：实现责任链模式

创建一个请求处理系统，不同级别的处理器处理不同级别的请求。

```typescript
// TODO: 实现责任链模式

// 提示：
// 1. 创建抽象处理器类
// 2. 创建具体处理器（初级、中级、高级）
// 3. 链接处理器形成责任链
```

### 练习 3：组合多个模式

创建一个任务管理系统，结合使用观察者模式、命令模式和策略模式。

```typescript
// TODO: 组合使用模式

// 要求：
// 1. 使用观察者模式通知任务状态变化
// 2. 使用命令模式实现撤销/重做
// 3. 使用策略模式实现不同的任务排序方式
```

---

## 9. 常见问题

### Q1: 如何选择合适的设计模式？

**A:** 遵循以下步骤：
1. 明确问题是什么
2. 查看是否有类似的已知模式
3. 评估模式的优缺点
4. 考虑团队的熟悉程度
5. 从简单开始，逐步重构

### Q2: 单例模式是反模式吗？

**A:** 不一定。单例模式在以下情况下是合理的：
- 确实只需要一个实例（如配置管理器）
- 不会影响可测试性（可以注入mock）
- 不会成为全局状态的滥用

### Q3: 什么时候使用工厂模式而不是构造函数？

**A:** 考虑使用工厂模式当：
- 创建逻辑复杂
- 需要根据条件创建不同对象
- 需要隐藏创建细节
- 需要集中管理对象创建

---

## 10. 下一步

恭喜你完成了设计模式的学习！

**下一章：** [架构和最佳实践](../04-architecture-best-practices/)

**复习建议：**
- 在实际项目中识别设计模式
- 尝试重构现有代码应用模式
- 阅读开源项目的设计模式应用
- 避免过度设计

**推荐资源：**
- 《设计模式：可复用面向对象软件的基础》（GoF）
- 《Head First 设计模式》
- [Refactoring.Guru](https://refactoring.guru/design-patterns)
- [TypeScript 设计模式](https://refactoring.guru/design-patterns/typescript)

继续加油！💪