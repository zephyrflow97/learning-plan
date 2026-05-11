# 第 4 章：架构和最佳实践

欢迎来到架构和最佳实践的学习！本章将深入探讨如何设计高质量、可维护的软件架构，以及遵循哪些最佳实践来编写专业级代码。

## 📚 本章目标

完成本章后，你将能够：

- ✅ 理解和应用 SOLID 原则
- ✅ 掌握分层架构设计
- ✅ 实现高效的错误处理策略
- ✅ 建立完善的日志和监控系统
- ✅ 掌握配置管理最佳实践
- ✅ 编写清晰、可维护的代码
- ✅ 进行有效的代码审查

---

## 📖 本章内容

1. [SOLID 原则深入](#1-solid-原则深入)
2. [分层架构](#2-分层架构)
3. [错误处理策略](#3-错误处理策略)
4. [日志和监控](#4-日志和监控)
5. [配置管理](#5-配置管理)
6. [代码质量](#6-代码质量)
7. [最佳实践总结](#7-最佳实践总结)
8. [章节练习](#8-章节练习)

---

## 1. SOLID 原则深入

SOLID 原则是面向对象设计的五大基本原则，它们帮助我们创建更易于理解、灵活和可维护的软件。

### 1.1 单一职责原则（SRP）

> **🔪 The Metaphor: The Swiss Army Knife (Anti-pattern)**
> 违反 SRP 的类就像是一把**瑞士军刀**。
> 它能剪指甲、开红酒、锯木头、切菜。
> 看起来很全能，但当你只想切菜时，你得举着整把沉重的刀；当你只想修指甲时，你可能会不小心划伤自己。
> **SRP** 告诉我们要把瑞士军刀拆开，变成一把手术刀、一把开瓶器、一把锯子。
> 这样，当你想升级“锯木头”的功能时，你不需要把“剪指甲”的部分也回炉重造。

**原则：** 一个类应该只有一个引起它变化的原因。

**实战示例：用户管理**

```typescript
// ❌ 违反 SRP：一个类承担多个职责
class User {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}
  
  // 职责1：数据验证
  validate(): boolean {
    if (!this.email.includes('@')) {
      return false;
    }
    if (this.name.length < 2) {
      return false;
    }
    return true;
  }
  
  // 职责2：数据持久化
  save(): void {
    // 保存到数据库
    console.log('保存用户到数据库');
  }
  
  // 职责3：发送邮件
  sendWelcomeEmail(): void {
    console.log(`发送欢迎邮件到 ${this.email}`);
  }
  
  // 职责4：生成报告
  generateReport(): string {
    return `用户报告: ${this.name}`;
  }
}

// ✅ 遵循 SRP：每个类只有一个职责
class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {}
}

class UserValidator {
  validate(user: User): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!user.email.includes('@')) {
      errors.push('邮箱格式不正确');
    }
    
    if (user.name.length < 2) {
      errors.push('用户名太短');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

class UserRepository {
  async save(user: User): Promise<void> {
    console.log('保存用户到数据库:', user);
    // 实际的数据库操作
  }
  
  async findById(id: string): Promise<User | null> {
    console.log('从数据库查找用户:', id);
    // 实际的数据库查询
    return null;
  }
}

class UserEmailService {
  async sendWelcomeEmail(user: User): Promise<void> {
    console.log(`发送欢迎邮件到 ${user.email}`);
    // 实际的邮件发送逻辑
  }
}

class UserReportGenerator {
  generate(user: User): string {
    return `
=== 用户报告 ===
ID: ${user.id}
姓名: ${user.name}
邮箱: ${user.email}
================
    `.trim();
  }
}

// 使用示例
const user = new User('1', 'Alice', 'alice@example.com');

const validator = new UserValidator();
const validationResult = validator.validate(user);

if (validationResult.valid) {
  const repository = new UserRepository();
  await repository.save(user);
  
  const emailService = new UserEmailService();
  await emailService.sendWelcomeEmail(user);
  
  const reportGenerator = new UserReportGenerator();
  const report = reportGenerator.generate(user);
  console.log(report);
} else {
  console.log('验证失败:', validationResult.errors);
}
```

---

### 1.2 开闭原则（OCP）

> **🔌 The Metaphor: The USB Port**
> 你的电脑（核心系统）是**封闭**的。你不能随意拆开机箱去焊接电路板（修改现有代码）。
> 但电脑通过 USB 接口是**开放**的。你可以插入鼠标、键盘、打印机、U盘（扩展功能）。
> 只要外设符合 USB 标准（接口契约），电脑就能使用它，而不需要知道它具体是什么牌子。
> **OCP** 的目标就是把软件设计成这样：**通过“插件”来扩展功能，而不是通过“手术”。**

**原则：** 软件实体应该对扩展开放，对修改封闭。

**实战示例：支付处理系统**

```typescript
// ❌ 违反 OCP：添加新支付方式需要修改现有代码
class PaymentProcessor {
  processPayment(amount: number, type: string): void {
    if (type === 'creditCard') {
      console.log(`使用信用卡支付 ¥${amount}`);
      // 信用卡支付逻辑
    } else if (type === 'alipay') {
      console.log(`使用支付宝支付 ¥${amount}`);
      // 支付宝支付逻辑
    } else if (type === 'wechat') {
      console.log(`使用微信支付 ¥${amount}`);
      // 微信支付逻辑
    }
    // 每次添加新支付方式都要修改这个方法！
  }
}

// ✅ 遵循 OCP：添加新支付方式无需修改现有代码
interface PaymentMethod {
  pay(amount: number): Promise<PaymentResult>;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

class CreditCardPayment implements PaymentMethod {
  constructor(
    private cardNumber: string,
    private cvv: string
  ) {}
  
  async pay(amount: number): Promise<PaymentResult> {
    console.log(`💳 信用卡支付 ¥${amount}`);
    // 信用卡支付逻辑
    return {
      success: true,
      transactionId: 'CC-' + Date.now(),
      message: '支付成功'
    };
  }
}

class AlipayPayment implements PaymentMethod {
  constructor(private account: string) {}
  
  async pay(amount: number): Promise<PaymentResult> {
    console.log(`💰 支付宝支付 ¥${amount}`);
    // 支付宝支付逻辑
    return {
      success: true,
      transactionId: 'ALIPAY-' + Date.now(),
      message: '支付成功'
    };
  }
}

class WeChatPayment implements PaymentMethod {
  constructor(private openId: string) {}
  
  async pay(amount: number): Promise<PaymentResult> {
    console.log(`💚 微信支付 ¥${amount}`);
    // 微信支付逻辑
    return {
      success: true,
      transactionId: 'WECHAT-' + Date.now(),
      message: '支付成功'
    };
  }
}

// 新增支付方式无需修改现有代码
class CryptoPayment implements PaymentMethod {
  constructor(
    private walletAddress: string,
    private cryptoType: string
  ) {}
  
  async pay(amount: number): Promise<PaymentResult> {
    console.log(`₿ ${this.cryptoType}支付 ¥${amount}`);
    // 加密货币支付逻辑
    return {
      success: true,
      transactionId: 'CRYPTO-' + Date.now(),
      message: '支付成功'
    };
  }
}

// 支付处理器（遵循 OCP）
class PaymentProcessor {
  async process(paymentMethod: PaymentMethod, amount: number): Promise<PaymentResult> {
    console.log(`\n处理支付: ¥${amount}`);
    const result = await paymentMethod.pay(amount);
    console.log(`结果: ${result.message}`);
    return result;
  }
}

// 使用示例
const processor = new PaymentProcessor();

await processor.process(
  new CreditCardPayment('1234-5678-9012-3456', '123'),
  100
);

await processor.process(
  new AlipayPayment('user@example.com'),
  200
);

await processor.process(
  new CryptoPayment('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'Ethereum'),
  300
);
```

---

## 2. 分层架构

分层架构将应用程序分为多个层次，每层有明确的职责。

### 2.1 三层架构

> **🍝 The Metaphor: The Lasagna**
> 分层架构就像是一份**千层面 (Lasagna)**。
> *   每一层（面皮、肉酱、奶酪）都有自己独特的味道和作用。
> *   你不能把肉酱直接涂在盘子底（跳过层级），也不能把面皮铺在最上面（层级倒置）。
> *   **好处**：你可以把中间的“肉酱层”换成“素菜层”，而不需要动上下的面皮。
> *   **坏处**：如果你只是想吃一口面，你得切穿所有层（简单的 CRUD 操作也得穿过 Controller -> Service -> Repository）。

**层次划分：**
1. **表示层（Presentation Layer）** - 处理 UI 和用户交互
2. **业务逻辑层（Business Logic Layer）** - 处理业务规则
3. **数据访问层（Data Access Layer）** - 处理数据持久化

**完整示例：任务管理系统**

```typescript
// ============= 数据访问层（DAL） =============

// 实体定义
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// 数据库接口
interface IDatabase {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
}

// 模拟数据库实现
class MockDatabase implements IDatabase {
  private data = new Map<string, any[]>();
  
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    console.log(`[DB] 查询: ${sql}`);
    // 模拟数据库查询
    return [];
  }
  
  async execute(sql: string, params?: any[]): Promise<void> {
    console.log(`[DB] 执行: ${sql}`);
    // 模拟数据库执行
  }
}

// 仓库接口
interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  update(id: string, task: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<boolean>;
}

// 仓库实现
class TaskRepository implements ITaskRepository {
  constructor(private db: IDatabase) {}
  
  async findAll(): Promise<Task[]> {
    console.log('[Repository] 查找所有任务');
    const rows = await this.db.query<Task>('SELECT * FROM tasks');
    return rows;
  }
  
  async findById(id: string): Promise<Task | null> {
    console.log(`[Repository] 查找任务: ${id}`);
    const rows = await this.db.query<Task>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }
  
  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    console.log('[Repository] 创建任务');
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.db.execute(
      'INSERT INTO tasks (id, title, description, status, priority, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [task.id, task.title, task.description, task.status, task.priority, task.createdAt, task.updatedAt]
    );
    
    return task;
  }
  
  async update(id: string, taskData: Partial<Task>): Promise<Task> {
    console.log(`[Repository] 更新任务: ${id}`);
    const task = await this.findById(id);
    if (!task) {
      throw new Error('任务不存在');
    }
    
    const updated = {
      ...task,
      ...taskData,
      updatedAt: new Date()
    };
    
    await this.db.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, updatedAt = ? WHERE id = ?',
      [updated.title, updated.description, updated.status, updated.priority, updated.updatedAt, id]
    );
    
    return updated;
  }
  
  async delete(id: string): Promise<boolean> {
    console.log(`[Repository] 删除任务: ${id}`);
    await this.db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  }
}

// ============= 业务逻辑层（BLL） =============

// 业务规则
class TaskBusinessRules {
  static canMarkAsCompleted(task: Task): boolean {
    return task.status !== 'completed';
  }
  
  static canDelete(task: Task): boolean {
    // 业务规则：只能删除已完成或待处理的任务
    return task.status === 'completed' || task.status === 'pending';
  }
  
  static validateTask(task: Partial<Task>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (task.title && task.title.length < 3) {
      errors.push('任务标题至少需要 3 个字符');
    }
    
    if (task.title && task.title.length > 100) {
      errors.push('任务标题不能超过 100 个字符');
    }
    
    if (task.description && task.description.length > 1000) {
      errors.push('任务描述不能超过 1000 个字符');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 业务服务接口
interface ITaskService {
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task>;
  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(id: string, taskData: Partial<Task>): Promise<Task>;
  markAsCompleted(id: string): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}

// 业务服务实现
class TaskService implements ITaskService {
  constructor(
    private repository: ITaskRepository,
    private logger?: ILogger
  ) {}
  
  async getAllTasks(): Promise<Task[]> {
    this.logger?.log('[Service] 获取所有任务');
    return await this.repository.findAll();
  }
  
  async getTaskById(id: string): Promise<Task> {
    this.logger?.log(`[Service] 获取任务: ${id}`);
    const task = await this.repository.findById(id);
    if (!task) {
      throw new Error('任务不存在');
    }
    return task;
  }
  
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    this.logger?.log('[Service] 创建任务');
    
    // 验证
    const validation = TaskBusinessRules.validateTask(taskData);
    if (!validation.valid) {
      throw new Error(`验证失败: ${validation.errors.join(', ')}`);
    }
    
    // 创建
    const task = await this.repository.create(taskData);
    this.logger?.log(`[Service] 任务已创建: ${task.id}`);
    
    return task;
  }
  
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    this.logger?.log(`[Service] 更新任务: ${id}`);
    
    // 验证
    const validation = TaskBusinessRules.validateTask(taskData);
    if (!validation.valid) {
      throw new Error(`验证失败: ${validation.errors.join(', ')}`);
    }
    
    // 更新
    const task = await this.repository.update(id, taskData);
    this.logger?.log(`[Service] 任务已更新: ${id}`);
    
    return task;
  }
  
  async markAsCompleted(id: string): Promise<Task> {
    this.logger?.log(`[Service] 标记任务为已完成: ${id}`);
    
    const task = await this.getTaskById(id);
    
    // 检查业务规则
    if (!TaskBusinessRules.canMarkAsCompleted(task)) {
      throw new Error('任务已经完成');
    }
    
    // 更新状态
    return await this.repository.update(id, { status: 'completed' });
  }
  
  async deleteTask(id: string): Promise<void> {
    this.logger?.log(`[Service] 删除任务: ${id}`);
    
    const task = await this.getTaskById(id);
    
    // 检查业务规则
    if (!TaskBusinessRules.canDelete(task)) {
      throw new Error('无法删除进行中的任务');
    }
    
    await this.repository.delete(id);
    this.logger?.log(`[Service] 任务已删除: ${id}`);
  }
}

// ============= 表示层（Presentation） =============

// DTO（数据传输对象）
interface CreateTaskDTO {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

interface TaskDTO {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

// 控制器
class TaskController {
  constructor(private taskService: ITaskService) {}
  
  async getAllTasks(): Promise<{ success: boolean; data?: TaskDTO[]; error?: string }> {
    try {
      console.log('[Controller] GET /tasks');
      const tasks = await this.taskService.getAllTasks();
      
      return {
        success: true,
        data: tasks.map(t => this.taskToDTO(t))
      };
    } catch (error) {
      console.error('[Controller] 错误:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getTask(id: string): Promise<{ success: boolean; data?: TaskDTO; error?: string }> {
    try {
      console.log(`[Controller] GET /tasks/${id}`);
      const task = await this.taskService.getTaskById(id);
      
      return {
        success: true,
        data: this.taskToDTO(task)
      };
    } catch (error) {
      console.error('[Controller] 错误:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async createTask(dto: CreateTaskDTO): Promise<{ success: boolean; data?: TaskDTO; error?: string }> {
    try {
      console.log('[Controller] POST /tasks');
      const task = await this.taskService.createTask({
        ...dto,
        status: 'pending'
      });
      
      return {
        success: true,
        data: this.taskToDTO(task)
      };
    } catch (error) {
      console.error('[Controller] 错误:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async updateTask(id: string, dto: UpdateTaskDTO): Promise<{ success: boolean; data?: TaskDTO; error?: string }> {
    try {
      console.log(`[Controller] PUT /tasks/${id}`);
      const task = await this.taskService.updateTask(id, dto);
      
      return {
        success: true,
        data: this.taskToDTO(task)
      };
    } catch (error) {
      console.error('[Controller] 错误:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async markAsCompleted(id: string): Promise<{ success: boolean; data?: TaskDTO; error?: string }> {
    try {
      console.log(`[Controller] POST /tasks/${id}/complete`);
      const task = await this.taskService.markAsCompleted(id);
      
      return {
        success: true,
        data: this.taskToDTO(task)
      };
    } catch (error) {
      console.error('[Controller] 错误:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Controller] DELETE /tasks/${id}`);
      await this.taskService.deleteTask(id);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('[Controller] 错误:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private taskToDTO(task: Task): TaskDTO {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };
  }
}

// ============= 应用组装 =============

// 日志接口
interface ILogger {
  log(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(message);
  }
  
  error(message: string): void {
    console.error(message);
  }
}

// 组装应用
const db = new MockDatabase();
const repository = new TaskRepository(db);
const logger = new ConsoleLogger();
const service = new TaskService(repository, logger);
const controller = new TaskController(service);

// 使用示例
async function example() {
  // 创建任务
  const createResult = await controller.createTask({
    title: '学习 TypeScript',
    description: '深入学习 TypeScript 高级特性',
    priority: 'high'
  });
  console.log('创建结果:', createResult);
  
  // 获取所有任务
  const allTasks = await controller.getAllTasks();
  console.log('所有任务:', allTasks);
  
  // 更新任务
  if (createResult.data) {
    const updateResult = await controller.updateTask(createResult.data.id, {
      status: 'in-progress'
    });
    console.log('更新结果:', updateResult);
    
    // 标记为完成
    const completeResult = await controller.markAsCompleted(createResult.data.id);
    console.log('完成结果:', completeResult);
  }
}
```

---

## 3. 错误处理策略

良好的错误处理是构建健壮应用的关键。

### 3.1 错误分类

```typescript
// 基础错误类
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// 业务错误
class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

// 验证错误
class ValidationError extends AppError {
  constructor(
    message: string,
    public errors: string[]
  ) {
    super(message, 400, true);
  }
}

// 未找到错误
class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} 未找到`, 404, true);
  }
}

// 认证错误
class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(message, 401, true);
  }
}

// 授权错误
class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403, true);
  }
}

// 数据库错误
class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, false); // 非操作性错误
  }
}
```

**使用示例：**

```typescript
class UserService {
  async getUser(id: string): Promise<User> {
    // 验证输入
    if (!id) {
      throw new ValidationError('用户ID不能为空', ['id 是必需的']);
    }
    
    try {
      const user = await this.repository.findById(id);
      
      // 检查是否存在
      if (!user) {
        throw new NotFoundError('用户');
      }
      
      return user;
    } catch (error) {
      // 数据库错误
      if (error instanceof DatabaseError) {
        // 记录日志并抛出
        this.logger.error(`数据库错误: ${error.message}`);
        throw error;
      }
      
      // 重新抛出其他错误
      throw error;
    }
  }
}
```

---

### 3.2 全局错误处理器

```typescript
class ErrorHandler {
  private logger: ILogger;
  
  constructor(logger: ILogger) {
    this.logger = logger;
  }
  
  handleError(error: Error | AppError): {
    statusCode: number;
    message: string;
    errors?: string[];
  } {
    // 判断是否为操作性错误
    const isAppError = error instanceof AppError;
    
    if (isAppError && error.isOperational) {
      // 操作性错误：记录并返回给客户端
      this.logger.error(
        `操作性错误: ${error.message}\n` +
        `状态码: ${error.statusCode}\n` +
        `堆栈: ${error.stack}`
      );
      
      return {
        statusCode: error.statusCode,
        message: error.message,
        errors: error instanceof ValidationError ? error.errors : undefined
      };
    } else {
      // 编程错误：记录详细信息但返回通用消息
      this.logger.error(
        `编程错误: ${error.message}\n` +
        `堆栈: ${error.stack}`
      );
      
      // 在生产环境中，不暴露内部错误详情
      return {
        statusCode: 500,
        message: '服务器内部错误'
      };
    }
  }
  
  // Express 中间件形式
  expressErrorHandler() {
    return (err: Error, req: any, res: any, next: any) => {
      const errorResponse = this.handleError(err);
      res.status(errorResponse.statusCode).json(errorResponse);
    };
  }
}
```

---

由于内容篇幅较长，我将在下一部分继续补充日志监控、配置管理等内容。

继续完成剩余章节...