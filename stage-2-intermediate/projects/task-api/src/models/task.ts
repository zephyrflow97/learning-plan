/**
 * 任务数据模型定义
 * 定义任务的类型、接口和工厂类
 */

/**
 * 任务状态枚举
 * @description 定义任务的三种可能状态
 */
export enum TaskStatus {
  TODO = 'todo',                // 待办
  IN_PROGRESS = 'in_progress',  // 进行中
  COMPLETED = 'completed'       // 已完成
}

/**
 * 任务优先级枚举
 * @description 定义任务的三种优先级
 */
export enum TaskPriority {
  LOW = 'low',        // 低优先级
  MEDIUM = 'medium',  // 中优先级
  HIGH = 'high'       // 高优先级
}

/**
 * 任务接口
 * @description 定义任务对象的完整结构
 */
export interface Task {
  id: string;                  // 唯一标识符
  title: string;               // 任务标题（必填）
  description?: string;        // 任务描述（可选）
  status: TaskStatus;          // 任务状态
  priority: TaskPriority;      // 优先级
  createdAt: Date;             // 创建时间
  updatedAt: Date;             // 更新时间
}

/**
 * 创建任务的数据传输对象（DTO）
 * @description 定义创建任务时需要的数据
 */
export interface CreateTaskDto {
  title: string;               // 标题（必填）
  description?: string;        // 描述（可选）
  status?: TaskStatus;         // 状态（可选，默认为 TODO）
  priority?: TaskPriority;     // 优先级（可选，默认为 MEDIUM）
}

/**
 * 更新任务的数据传输对象（DTO）
 * @description 定义更新任务时允许修改的字段
 */
export interface UpdateTaskDto {
  title?: string;              // 标题（可选）
  description?: string;        // 描述（可选）
  status?: TaskStatus;         // 状态（可选）
  priority?: TaskPriority;     // 优先级（可选）
}

/**
 * 任务工厂类
 * @description 提供创建任务对象的工厂方法
 */
export class TaskFactory {
  /**
   * 创建新任务
   * @param dto - 创建任务的数据传输对象
   * @returns 完整的任务对象
   * @description 根据 DTO 创建一个新的任务对象，自动生成 ID 和时间戳
   */
  static create(dto: CreateTaskDto): Task {
    console.log('[TaskFactory] 创建新任务');
    const now = new Date();
    
    const task: Task = {
      id: this.generateId(),
      title: dto.title,
      description: dto.description,
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      createdAt: now,
      updatedAt: now
    };
    
    console.log(`[TaskFactory] 任务创建成功: id=${task.id}, title="${task.title}"`);
    return task;
  }
  
  /**
   * 生成唯一 ID
   * @returns 唯一标识符字符串
   * @description 使用时间戳和随机字符串组合生成唯一 ID
   */
  private static generateId(): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const id = `task_${timestamp}_${randomStr}`;
    
    console.log(`[TaskFactory] 生成 ID: ${id}`);
    return id;
  }
}
