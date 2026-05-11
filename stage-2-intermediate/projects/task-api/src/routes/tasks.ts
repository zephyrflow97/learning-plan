/**
 * 任务路由
 * 定义任务相关的 API 端点
 */

import express, { Request, Response } from 'express';
import { StorageService } from '../services/storage';
import { TaskFactory, CreateTaskDto, UpdateTaskDto } from '../models/task';
import { validateCreateTask, validateUpdateTask } from '../middleware/validation';

const router = express.Router();
const storage = new StorageService();

// 初始化存储服务
storage.load().catch(error => {
  console.log(`[Router] ✗ 存储初始化失败: ${error}`);
  process.exit(1);
});

/**
 * GET /api/tasks
 * 获取所有任务列表
 */
router.get('/', async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] GET /api/tasks - 获取所有任务`);
  
  try {
    const tasks = await storage.getAllTasks();
    
    console.log(`[API] ✓ 返回 ${tasks.length} 个任务`);
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
    
  } catch (error) {
    console.log(`[API] ✗ 获取任务列表失败:`, error);
    res.status(500).json({ 
      success: false,
      error: '服务器内部错误' 
    });
  }
});

/**
 * GET /api/tasks/:id
 * 获取单个任务详情
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] GET /api/tasks/${id} - 获取任务详情`);
  
  try {
    const task = await storage.getTaskById(id);
    
    if (!task) {
      console.log(`[API] ✗ 任务不存在: id=${id}`);
      res.status(404).json({ 
        success: false,
        error: '任务不存在' 
      });
      return;
    }
    
    console.log(`[API] ✓ 返回任务: "${task.title}"`);
    res.json({
      success: true,
      data: task
    });
    
  } catch (error) {
    console.log(`[API] ✗ 获取任务失败:`, error);
    res.status(500).json({ 
      success: false,
      error: '服务器内部错误' 
    });
  }
});

/**
 * POST /api/tasks
 * 创建新任务
 */
router.post('/', validateCreateTask, async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] POST /api/tasks - 创建任务`);
  
  try {
    const dto: CreateTaskDto = req.body;
    console.log(`[API] 创建任务请求: title="${dto.title}"`);
    
    // 1. 创建任务对象
    const task = TaskFactory.create(dto);
    
    // 2. 保存任务
    const createdTask = await storage.createTask(task);
    
    console.log(`[API] ✓ 任务创建成功: id=${createdTask.id}`);
    res.status(201).json({
      success: true,
      message: '任务创建成功',
      data: createdTask
    });
    
  } catch (error) {
    console.log(`[API] ✗ 创建任务失败:`, error);
    res.status(500).json({ 
      success: false,
      error: '服务器内部错误' 
    });
  }
});

/**
 * PUT /api/tasks/:id
 * 更新任务
 */
router.put('/:id', validateUpdateTask, async (req: Request, res: Response) => {
  const { id } = req.params;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] PUT /api/tasks/${id} - 更新任务`);
  
  try {
    const dto: UpdateTaskDto = req.body;
    console.log(`[API] 更新任务请求: id=${id}, fields=`, Object.keys(dto));
    
    // 1. 更新任务
    const updatedTask = await storage.updateTask(id, dto);
    
    if (!updatedTask) {
      console.log(`[API] ✗ 任务不存在: id=${id}`);
      res.status(404).json({ 
        success: false,
        error: '任务不存在' 
      });
      return;
    }
    
    console.log(`[API] ✓ 任务更新成功: "${updatedTask.title}"`);
    res.json({
      success: true,
      message: '任务更新成功',
      data: updatedTask
    });
    
  } catch (error) {
    console.log(`[API] ✗ 更新任务失败:`, error);
    res.status(500).json({ 
      success: false,
      error: '服务器内部错误' 
    });
  }
});

/**
 * DELETE /api/tasks/:id
 * 删除任务
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] DELETE /api/tasks/${id} - 删除任务`);
  
  try {
    const deleted = await storage.deleteTask(id);
    
    if (!deleted) {
      console.log(`[API] ✗ 任务不存在: id=${id}`);
      res.status(404).json({ 
        success: false,
        error: '任务不存在' 
      });
      return;
    }
    
    console.log(`[API] ✓ 任务删除成功: id=${id}`);
    res.status(204).send();
    
  } catch (error) {
    console.log(`[API] ✗ 删除任务失败:`, error);
    res.status(500).json({ 
      success: false,
      error: '服务器内部错误' 
    });
  }
});

export default router;
