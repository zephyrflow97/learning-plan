# 项目：任务管理 API

## 项目概述

在这个项目中，你将使用 TypeScript、Express 和 Node.js 构建一个完整的 RESTful API，实现任务管理系统的后端服务。这个项目将帮助你巩固本阶段学到的所有知识点，包括 TypeScript 类型系统、ES6+ 特性、Node.js 文件操作和 Express 框架。

## 学习目标

完成本项目后，你将能够：

1. 使用 TypeScript 设计和实现类型安全的 API
2. 使用 Express 构建 RESTful 服务
3. 实现文件系统数据持久化
4. 掌握输入验证和错误处理
5. 编写结构化的项目代码
6. 实现完整的 CRUD 操作

## 功能需求

### 核心功能

1. **任务管理**
   - 创建任务
   - 获取任务列表
   - 获取单个任务详情
   - 更新任务
   - 删除任务
   
2. **任务属性**
   - ID（自动生成）
   - 标题（必填）
   - 描述（可选）
   - 状态（待办/进行中/已完成）
   - 优先级（低/中/高）
   - 创建时间
   - 更新时间
   
3. **数据持久化**
   - 使用 JSON 文件存储数据
   - 自动保存和加载

## 技术栈

- **语言**：TypeScript
- **运行时**：Node.js
- **框架**：Express
- **数据存储**：JSON 文件
- **开发工具**：ts-node、nodemon

## 项目结构

```
task-api/
├── src/
│   ├── models/
│   │   └── task.ts          # 任务数据模型
│   ├── routes/
│   │   └── tasks.ts         # 任务路由
│   ├── services/
│   │   └── storage.ts       # 数据存储服务
│   ├── middleware/
│   │   └── validation.ts    # 验证中间件
│   ├── utils/
│   │   └── logger.ts        # 日志工具
│   └── index.ts             # 应用入口
├── data/
│   └── tasks.json           # 数据文件
├── package.json
├── tsconfig.json
└── README.md
```

## 分步实现指南

### 步骤 1：项目初始化

```bash
# 创建项目目录
mkdir task-api
cd task-api

# 初始化 npm 项目
npm init -y

# 安装依赖
npm install express
npm install --save-dev typescript @types/node @types/express ts-node nodemon

# 创建 TypeScript 配置
npx tsc --init
```

### 步骤 2：配置 TypeScript

编辑 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 步骤 3：定义数据模型

创建 `src/models/task.ts`：

```typescript
/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * 任务接口
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建任务的 DTO（数据传输对象）
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

/**
 * 更新任务的 DTO
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

/**
 * 任务工厂类
 */
export class TaskFactory {
  /**
   * 创建新任务
   */
  static create(dto: CreateTaskDto): Task {
    console.log('[INFO] 创建新任务');
    const now = new Date();
    
    return {
      id: this.generateId(),
      title: dto.title,
      description: dto.description,
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * 生成唯一 ID
   */
  private static generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 步骤 4：实现数据存储服务

创建 `src/services/storage.ts`：

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';
import { Task } from '../models/task';

/**
 * 数据存储服务类
 */
export class StorageService {
  private dataPath: string;
  private tasks: Task[] = [];
  
  constructor(dataPath: string = path.join(process.cwd(), 'data', 'tasks.json')) {
    this.dataPath = dataPath;
    console.log(`[INFO] 存储服务初始化，数据路径: ${this.dataPath}`);
  }
  
  /**
   * 加载数据
   */
  async load(): Promise<void> {
    console.log('[INFO] 加载任务数据');
    
    try {
      // 确保数据目录存在
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });
      
      // 读取数据文件
      const data = await fs.readFile(this.dataPath, 'utf-8');
      this.tasks = JSON.parse(data, this.reviver);
      console.log(`[SUCCESS] 加载了 ${this.tasks.length} 个任务`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('[INFO] 数据文件不存在，创建新文件');
        this.tasks = [];
        await this.save();
      } else {
        console.log(`[ERROR] 加载数据失败: ${error.message}`);
        throw error;
      }
    }
  }
  
  /**
   * 保存数据
   */
  async save(): Promise<void> {
    console.log(`[INFO] 保存任务数据，共 ${this.tasks.length} 个任务`);
    
    try {
      const data = JSON.stringify(this.tasks, null, 2);
      await fs.writeFile(this.dataPath, data, 'utf-8');
      console.log('[SUCCESS] 数据保存成功');
    } catch (error) {
      console.log(`[ERROR] 保存数据失败: ${error}`);
      throw error;
    }
  }
  
  /**
   * 获取所有任务
   */
  async getAllTasks(): Promise<Task[]> {
    console.log(`[TRACE] 获取所有任务，共 ${this.tasks.length} 个`);
    return [...this.tasks];
  }
  
  /**
   * 根据 ID 获取任务
   */
  async getTaskById(id: string): Promise<Task | undefined> {
    console.log(`[TRACE] 查找任务: ${id}`);
    const task = this.tasks.find(t => t.id === id);
    
    if (task) {
      console.log(`[DEBUG] 找到任务: ${task.title}`);
    } else {
      console.log(`[DEBUG] 任务不存在: ${id}`);
    }
    
    return task;
  }
  
  /**
   * 创建任务
   */
  async createTask(task: Task): Promise<Task> {
    console.log(`[INFO] 创建任务: ${task.title}`);
    this.tasks.push(task);
    await this.save();
    console.log(`[SUCCESS] 任务创建成功: ${task.id}`);
    return task;
  }
  
  /**
   * 更新任务
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    console.log(`[INFO] 更新任务: ${id}`);
    
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      console.log(`[WARNING] 任务不存在: ${id}`);
      return undefined;
    }
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      id: this.tasks[index].id,  // 确保 ID 不被修改
      createdAt: this.tasks[index].createdAt,  // 确保创建时间不被修改
      updatedAt: new Date()
    };
    
    await this.save();
    console.log(`[SUCCESS] 任务更新成功: ${this.tasks[index].title}`);
    return this.tasks[index];
  }
  
  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<boolean> {
    console.log(`[INFO] 删除任务: ${id}`);
    
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      console.log(`[WARNING] 任务不存在: ${id}`);
      return false;
    }
    
    const deletedTask = this.tasks.splice(index, 1)[0];
    await this.save();
    console.log(`[SUCCESS] 任务删除成功: ${deletedTask.title}`);
    return true;
  }
  
  /**
   * JSON 反序列化辅助函数（处理日期）
   */
  private reviver(key: string, value: any): any {
    if (key === 'createdAt' || key === 'updatedAt') {
      return new Date(value);
    }
    return value;
  }
}
```

### 步骤 5：实现验证中间件

创建 `src/middleware/validation.ts`：

```typescript
import { Request, Response, NextFunction } from 'express';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../models/task';

/**
 * 验证创建任务的数据
 */
export function validateCreateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log('[MIDDLEWARE] 验证创建任务数据');
  
  const { title, description, status, priority } = req.body as CreateTaskDto;
  
  // 验证标题
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    console.log('[WARNING] 标题验证失败');
    res.status(400).json({ error: '标题不能为空' });
    return;
  }
  
  if (title.length > 200) {
    console.log('[WARNING] 标题过长');
    res.status(400).json({ error: '标题不能超过 200 个字符' });
    return;
  }
  
  // 验证描述（可选）
  if (description && typeof description !== 'string') {
    console.log('[WARNING] 描述格式错误');
    res.status(400).json({ error: '描述必须是字符串' });
    return;
  }
  
  // 验证状态（可选）
  if (status && !Object.values(TaskStatus).includes(status)) {
    console.log('[WARNING] 状态值无效');
    res.status(400).json({ 
      error: '无效的状态值',
      validValues: Object.values(TaskStatus)
    });
    return;
  }
  
  // 验证优先级（可选）
  if (priority && !Object.values(TaskPriority).includes(priority)) {
    console.log('[WARNING] 优先级值无效');
    res.status(400).json({ 
      error: '无效的优先级值',
      validValues: Object.values(TaskPriority)
    });
    return;
  }
  
  console.log('[SUCCESS] 数据验证通过');
  next();
}

/**
 * 验证更新任务的数据
 */
export function validateUpdateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log('[MIDDLEWARE] 验证更新任务数据');
  
  const { title, description, status, priority } = req.body as UpdateTaskDto;
  
  // 至少需要一个字段
  if (!title && !description && !status && !priority) {
    console.log('[WARNING] 没有提供更新字段');
    res.status(400).json({ error: '至少需要提供一个更新字段' });
    return;
  }
  
  // 验证标题（如果提供）
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      console.log('[WARNING] 标题验证失败');
      res.status(400).json({ error: '标题不能为空' });
      return;
    }
    
    if (title.length > 200) {
      console.log('[WARNING] 标题过长');
      res.status(400).json({ error: '标题不能超过 200 个字符' });
      return;
    }
  }
  
  // 验证描述（如果提供）
  if (description !== undefined && typeof description !== 'string') {
    console.log('[WARNING] 描述格式错误');
    res.status(400).json({ error: '描述必须是字符串' });
    return;
  }
  
  // 验证状态（如果提供）
  if (status && !Object.values(TaskStatus).includes(status)) {
    console.log('[WARNING] 状态值无效');
    res.status(400).json({ 
      error: '无效的状态值',
      validValues: Object.values(TaskStatus)
    });
    return;
  }
  
  // 验证优先级（如果提供）
  if (priority && !Object.values(TaskPriority).includes(priority)) {
    console.log('[WARNING] 优先级值无效');
    res.status(400).json({ 
      error: '无效的优先级值',
      validValues: Object.values(TaskPriority)
    });
    return;
  }
  
  console.log('[SUCCESS] 数据验证通过');
  next();
}
```

### 步骤 6：实现任务路由

创建 `src/routes/tasks.ts`：

```typescript
import express, { Request, Response } from 'express';
import { StorageService } from '../services/storage';
import { TaskFactory, CreateTaskDto, UpdateTaskDto } from '../models/task';
import { validateCreateTask, validateUpdateTask } from '../middleware/validation';

const router = express.Router();
const storage = new StorageService();

// 初始化存储
storage.load().catch(error => {
  console.log(`[ERROR] 存储初始化失败: ${error}`);
  process.exit(1);
});

/**
 * GET /api/tasks
 * 获取所有任务
 */
router.get('/', async (req: Request, res: Response) => {
  console.log('[API] GET /api/tasks');
  
  try {
    const tasks = await storage.getAllTasks();
    console.log(`[INFO] 返回 ${tasks.length} 个任务`);
    res.json(tasks);
  } catch (error) {
    console.log(`[ERROR] 获取任务列表失败: ${error}`);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/tasks/:id
 * 获取单个任务
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`[API] GET /api/tasks/${id}`);
  
  try {
    const task = await storage.getTaskById(id);
    
    if (!task) {
      console.log(`[WARNING] 任务不存在: ${id}`);
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    
    console.log(`[INFO] 返回任务: ${task.title}`);
    res.json(task);
  } catch (error) {
    console.log(`[ERROR] 获取任务失败: ${error}`);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * POST /api/tasks
 * 创建新任务
 */
router.post('/', validateCreateTask, async (req: Request, res: Response) => {
  console.log('[API] POST /api/tasks');
  
  try {
    const dto: CreateTaskDto = req.body;
    const task = TaskFactory.create(dto);
    const createdTask = await storage.createTask(task);
    
    console.log(`[SUCCESS] 任务创建成功: ${createdTask.id}`);
    res.status(201).json(createdTask);
  } catch (error) {
    console.log(`[ERROR] 创建任务失败: ${error}`);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * PUT /api/tasks/:id
 * 更新任务
 */
router.put('/:id', validateUpdateTask, async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`[API] PUT /api/tasks/${id}`);
  
  try {
    const dto: UpdateTaskDto = req.body;
    const updatedTask = await storage.updateTask(id, dto);
    
    if (!updatedTask) {
      console.log(`[WARNING] 任务不存在: ${id}`);
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    
    console.log(`[SUCCESS] 任务更新成功: ${updatedTask.title}`);
    res.json(updatedTask);
  } catch (error) {
    console.log(`[ERROR] 更新任务失败: ${error}`);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * DELETE /api/tasks/:id
 * 删除任务
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`[API] DELETE /api/tasks/${id}`);
  
  try {
    const deleted = await storage.deleteTask(id);
    
    if (!deleted) {
      console.log(`[WARNING] 任务不存在: ${id}`);
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    
    console.log(`[SUCCESS] 任务删除成功: ${id}`);
    res.status(204).send();
  } catch (error) {
    console.log(`[ERROR] 删除任务失败: ${error}`);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
```

### 步骤 7：创建应用入口

创建 `src/index.ts`：

```typescript
import express from 'express';
import tasksRouter from './routes/tasks';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 路由
app.get('/', (req, res) => {
  console.log('[INFO] 根路径访问');
  res.json({
    message: '任务管理 API',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks'
    }
  });
});

app.use('/api/tasks', tasksRouter);

// 404 处理
app.use((req, res) => {
  console.log(`[WARNING] 404: ${req.url}`);
  res.status(404).json({ error: '路由不存在' });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`[ERROR] 服务器错误: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`[INFO] ========================================`);
  console.log(`[INFO] 任务管理 API 服务器启动成功`);
  console.log(`[INFO] 端口: ${PORT}`);
  console.log(`[INFO] 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[INFO] 访问: http://localhost:${PORT}`);
  console.log(`[INFO] ========================================`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('[INFO] 收到 SIGTERM 信号，开始优雅关闭');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[INFO] 收到 SIGINT 信号，开始优雅关闭');
  process.exit(0);
});
```

### 步骤 8：配置 package.json 脚本

在 `package.json` 中添加：

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "clean": "rm -rf dist"
  }
}
```

### 步骤 9：测试 API

启动服务器：

```bash
npm run dev
```

使用 curl 或 Postman 测试：

```bash
# 创建任务
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习 TypeScript",
    "description": "完成 TypeScript 教程",
    "priority": "high"
  }'

# 获取所有任务
curl http://localhost:3000/api/tasks

# 获取单个任务
curl http://localhost:3000/api/tasks/{task_id}

# 更新任务
curl -X PUT http://localhost:3000/api/tasks/{task_id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'

# 删除任务
curl -X DELETE http://localhost:3000/api/tasks/{task_id}
```

## 扩展功能（可选）

完成基础功能后，可以尝试添加以下扩展功能：

### 1. 任务筛选和排序

```typescript
// 在 routes/tasks.ts 中添加查询参数支持
router.get('/', async (req: Request, res: Response) => {
  const { status, priority, sortBy } = req.query;
  
  let tasks = await storage.getAllTasks();
  
  // 按状态筛选
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  
  // 按优先级筛选
  if (priority) {
    tasks = tasks.filter(t => t.priority === priority);
  }
  
  // 排序
  if (sortBy === 'createdAt') {
    tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  res.json(tasks);
});
```

### 2. 分页支持

```typescript
router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const tasks = await storage.getAllTasks();
  const total = tasks.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  res.json({
    data: tasks.slice(start, end),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});
```

### 3. 搜索功能

```typescript
router.get('/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  
  if (!query) {
    res.status(400).json({ error: '缺少搜索关键词' });
    return;
  }
  
  const tasks = await storage.getAllTasks();
  const results = tasks.filter(task => 
    task.title.toLowerCase().includes(query.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
  );
  
  res.json(results);
});
```

### 4. 数据导入导出

```typescript
// 导出所有任务
router.get('/export', async (req: Request, res: Response) => {
  const tasks = await storage.getAllTasks();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=tasks.json');
  res.send(JSON.stringify(tasks, null, 2));
});

// 导入任务
router.post('/import', async (req: Request, res: Response) => {
  const tasks = req.body;
  
  if (!Array.isArray(tasks)) {
    res.status(400).json({ error: '数据格式错误' });
    return;
  }
  
  // 导入逻辑...
  res.json({ message: `成功导入 ${tasks.length} 个任务` });
});
```

## 验收清单

完成项目后，确保以下功能都正常工作：

- [ ] 可以创建新任务
- [ ] 可以获取所有任务列表
- [ ] 可以获取单个任务详情
- [ ] 可以更新任务信息
- [ ] 可以删除任务
- [ ] 输入验证正常工作（拒绝无效数据）
- [ ] 错误处理完善（返回适当的错误信息和状态码）
- [ ] 数据持久化到 JSON 文件
- [ ] 服务器重启后数据不丢失
- [ ] 日志输出清晰，方便调试
- [ ] 代码使用 TypeScript，类型定义完整
- [ ] 代码结构清晰，职责分离

## 常见问题

**Q: 为什么使用 JSON 文件而不是数据库？**

A: 在学习阶段，JSON 文件存储简单易懂，不需要额外的数据库配置。在后续章节会学习使用真正的数据库（MongoDB、PostgreSQL）。

**Q: 如何处理并发写入问题？**

A: 当前的实现是单进程的，不存在并发写入问题。如果需要处理高并发，应该使用数据库和适当的锁机制。

**Q: 如何添加用户认证？**

A: 认证功能会在后续章节学习。当前项目专注于 CRUD 操作和 API 设计基础。

## 下一步

- 完成本项目的所有功能
- 尝试添加扩展功能
- 学习阶段 3：高级 TypeScript 和架构设计
- 改进项目：使用真实数据库、添加认证、编写测试

## 总结

通过这个项目，你应该掌握了：

- ✅ TypeScript 项目配置和开发
- ✅ Express 框架的使用
- ✅ RESTful API 设计
- ✅ 数据模型设计
- ✅ 文件系统数据持久化
- ✅ 输入验证和错误处理
- ✅ 项目结构组织

恭喜你完成了这个项目！这是成为全栈开发者的重要一步。
