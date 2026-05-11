/**
 * 数据存储服务
 * 负责任务数据的持久化，使用 JSON 文件作为存储介质
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Task } from '../models/task';

/**
 * 数据存储服务类
 * @description 提供数据的读取、保存、查询、创建、更新和删除功能
 */
export class StorageService {
  private dataPath: string;      // 数据文件路径
  private tasks: Task[] = [];    // 内存中的任务列表
  
  /**
   * 构造函数
   * @param dataPath - 数据文件路径（可选，默认为项目根目录的 data/tasks.json）
   */
  constructor(dataPath: string = path.join(process.cwd(), 'data', 'tasks.json')) {
    this.dataPath = dataPath;
    console.log(`[StorageService] 存储服务初始化`);
    console.log(`[StorageService] 数据文件路径: ${this.dataPath}`);
  }
  
  /**
   * 加载数据
   * @description 从文件系统加载任务数据到内存
   */
  async load(): Promise<void> {
    console.log('[StorageService] 开始加载任务数据');
    
    try {
      // 1. 确保数据目录存在
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });
      console.log(`[StorageService] 数据目录已确认: ${dir}`);
      
      // 2. 读取数据文件
      const data = await fs.readFile(this.dataPath, 'utf-8');
      console.log(`[StorageService] 数据文件读取成功，大小: ${data.length} 字节`);
      
      // 3. 解析 JSON（使用 reviver 处理日期）
      this.tasks = JSON.parse(data, this.reviver);
      
      console.log(`[StorageService] ✓ 成功加载 ${this.tasks.length} 个任务`);
      
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // 文件不存在，创建新文件
        console.log('[StorageService] 数据文件不存在，创建新文件');
        this.tasks = [];
        await this.save();
      } else {
        // 其他错误
        console.log(`[StorageService] ✗ 加载数据失败: ${error.message}`);
        throw error;
      }
    }
  }
  
  /**
   * 保存数据
   * @description 将内存中的任务数据保存到文件系统
   */
  async save(): Promise<void> {
    console.log('[StorageService] 开始保存任务数据');
    console.log(`[StorageService] 任务数量: ${this.tasks.length}`);
    
    try {
      // 1. 序列化数据（格式化输出，便于人工查看）
      const data = JSON.stringify(this.tasks, null, 2);
      console.log(`[StorageService] 数据序列化完成，大小: ${data.length} 字节`);
      
      // 2. 写入文件
      await fs.writeFile(this.dataPath, data, 'utf-8');
      
      console.log('[StorageService] ✓ 数据保存成功');
      
    } catch (error) {
      console.log(`[StorageService] ✗ 保存数据失败: ${error}`);
      throw error;
    }
  }
  
  /**
   * 获取所有任务
   * @returns 任务数组的副本
   * @description 返回所有任务的副本，避免外部直接修改内部数据
   */
  async getAllTasks(): Promise<Task[]> {
    console.log(`[StorageService] 获取所有任务，共 ${this.tasks.length} 个`);
    return [...this.tasks];
  }
  
  /**
   * 根据 ID 获取任务
   * @param id - 任务 ID
   * @returns 任务对象或 undefined
   * @description 查找并返回指定 ID 的任务
   */
  async getTaskById(id: string): Promise<Task | undefined> {
    console.log(`[StorageService] 查找任务: id=${id}`);
    
    const task = this.tasks.find(t => t.id === id);
    
    if (task) {
      console.log(`[StorageService] ✓ 找到任务: "${task.title}"`);
    } else {
      console.log(`[StorageService] ✗ 任务不存在: id=${id}`);
    }
    
    return task;
  }
  
  /**
   * 创建任务
   * @param task - 任务对象
   * @returns 创建的任务对象
   * @description 将新任务添加到列表并保存
   */
  async createTask(task: Task): Promise<Task> {
    console.log(`[StorageService] 创建任务: id=${task.id}, title="${task.title}"`);
    
    // 1. 添加到任务列表
    this.tasks.push(task);
    console.log(`[StorageService] 任务已添加到列表，当前总数: ${this.tasks.length}`);
    
    // 2. 持久化保存
    await this.save();
    
    console.log(`[StorageService] ✓ 任务创建成功: id=${task.id}`);
    return task;
  }
  
  /**
   * 更新任务
   * @param id - 任务 ID
   * @param updates - 要更新的字段
   * @returns 更新后的任务对象或 undefined
   * @description 更新指定 ID 的任务并保存
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    console.log(`[StorageService] 更新任务: id=${id}`);
    console.log(`[StorageService] 更新字段:`, Object.keys(updates));
    
    // 1. 查找任务
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      console.log(`[StorageService] ✗ 任务不存在: id=${id}`);
      return undefined;
    }
    
    const originalTask = { ...this.tasks[index] };
    
    // 2. 更新任务（保护关键字段）
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      id: this.tasks[index].id,              // 确保 ID 不被修改
      createdAt: this.tasks[index].createdAt, // 确保创建时间不被修改
      updatedAt: new Date()                   // 更新修改时间
    };
    
    console.log(`[StorageService] 任务更新前: "${originalTask.title}"`);
    console.log(`[StorageService] 任务更新后: "${this.tasks[index].title}"`);
    
    // 3. 持久化保存
    await this.save();
    
    console.log(`[StorageService] ✓ 任务更新成功: id=${id}`);
    return this.tasks[index];
  }
  
  /**
   * 删除任务
   * @param id - 任务 ID
   * @returns 是否删除成功
   * @description 删除指定 ID 的任务并保存
   */
  async deleteTask(id: string): Promise<boolean> {
    console.log(`[StorageService] 删除任务: id=${id}`);
    
    // 1. 查找任务
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      console.log(`[StorageService] ✗ 任务不存在: id=${id}`);
      return false;
    }
    
    // 2. 删除任务
    const deletedTask = this.tasks.splice(index, 1)[0];
    console.log(`[StorageService] 已删除任务: "${deletedTask.title}"`);
    console.log(`[StorageService] 剩余任务数: ${this.tasks.length}`);
    
    // 3. 持久化保存
    await this.save();
    
    console.log(`[StorageService] ✓ 任务删除成功: id=${id}`);
    return true;
  }
  
  /**
   * JSON 反序列化辅助函数
   * @param key - JSON 键名
   * @param value - JSON 值
   * @returns 处理后的值
   * @description 将日期字符串转换为 Date 对象
   */
  private reviver(key: string, value: any): any {
    // 将日期字符串转换为 Date 对象
    if (key === 'createdAt' || key === 'updatedAt') {
      return new Date(value);
    }
    return value;
  }
}
