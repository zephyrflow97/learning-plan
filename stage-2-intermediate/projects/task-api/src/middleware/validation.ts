/**
 * 验证中间件
 * 负责验证请求数据的合法性
 */

import { Request, Response, NextFunction } from 'express';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../models/task';

/**
 * 验证创建任务的数据
 * @description 验证创建任务请求的数据是否符合要求
 */
export function validateCreateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log('[Validation] 验证创建任务数据');
  console.log('[Validation] 请求体:', req.body);
  
  const { title, description, status, priority } = req.body as CreateTaskDto;
  
  // 1. 验证标题（必填）
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    console.log('[Validation] ✗ 标题验证失败: 标题不能为空');
    res.status(400).json({ 
      error: '标题不能为空',
      field: 'title'
    });
    return;
  }
  
  if (title.length > 200) {
    console.log(`[Validation] ✗ 标题验证失败: 标题过长 (${title.length} 字符)`);
    res.status(400).json({ 
      error: '标题不能超过 200 个字符',
      field: 'title',
      currentLength: title.length,
      maxLength: 200
    });
    return;
  }
  
  // 2. 验证描述（可选）
  if (description !== undefined && typeof description !== 'string') {
    console.log('[Validation] ✗ 描述验证失败: 描述必须是字符串');
    res.status(400).json({ 
      error: '描述必须是字符串',
      field: 'description'
    });
    return;
  }
  
  // 3. 验证状态（可选）
  if (status !== undefined && !Object.values(TaskStatus).includes(status)) {
    console.log(`[Validation] ✗ 状态验证失败: 无效的状态值 "${status}"`);
    res.status(400).json({ 
      error: '无效的状态值',
      field: 'status',
      validValues: Object.values(TaskStatus)
    });
    return;
  }
  
  // 4. 验证优先级（可选）
  if (priority !== undefined && !Object.values(TaskPriority).includes(priority)) {
    console.log(`[Validation] ✗ 优先级验证失败: 无效的优先级值 "${priority}"`);
    res.status(400).json({ 
      error: '无效的优先级值',
      field: 'priority',
      validValues: Object.values(TaskPriority)
    });
    return;
  }
  
  console.log('[Validation] ✓ 数据验证通过');
  next();
}

/**
 * 验证更新任务的数据
 * @description 验证更新任务请求的数据是否符合要求
 */
export function validateUpdateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log('[Validation] 验证更新任务数据');
  console.log('[Validation] 请求体:', req.body);
  
  const { title, description, status, priority } = req.body as UpdateTaskDto;
  
  // 1. 至少需要一个更新字段
  if (title === undefined && description === undefined && status === undefined && priority === undefined) {
    console.log('[Validation] ✗ 验证失败: 没有提供任何更新字段');
    res.status(400).json({ 
      error: '至少需要提供一个更新字段',
      allowedFields: ['title', 'description', 'status', 'priority']
    });
    return;
  }
  
  // 2. 验证标题（如果提供）
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      console.log('[Validation] ✗ 标题验证失败: 标题不能为空');
      res.status(400).json({ 
        error: '标题不能为空',
        field: 'title'
      });
      return;
    }
    
    if (title.length > 200) {
      console.log(`[Validation] ✗ 标题验证失败: 标题过长 (${title.length} 字符)`);
      res.status(400).json({ 
        error: '标题不能超过 200 个字符',
        field: 'title',
        currentLength: title.length,
        maxLength: 200
      });
      return;
    }
  }
  
  // 3. 验证描述（如果提供）
  if (description !== undefined && typeof description !== 'string') {
    console.log('[Validation] ✗ 描述验证失败: 描述必须是字符串');
    res.status(400).json({ 
      error: '描述必须是字符串',
      field: 'description'
    });
    return;
  }
  
  // 4. 验证状态（如果提供）
  if (status !== undefined && !Object.values(TaskStatus).includes(status)) {
    console.log(`[Validation] ✗ 状态验证失败: 无效的状态值 "${status}"`);
    res.status(400).json({ 
      error: '无效的状态值',
      field: 'status',
      validValues: Object.values(TaskStatus)
    });
    return;
  }
  
  // 5. 验证优先级（如果提供）
  if (priority !== undefined && !Object.values(TaskPriority).includes(priority)) {
    console.log(`[Validation] ✗ 优先级验证失败: 无效的优先级值 "${priority}"`);
    res.status(400).json({ 
      error: '无效的优先级值',
      field: 'priority',
      validValues: Object.values(TaskPriority)
    });
    return;
  }
  
  console.log('[Validation] ✓ 数据验证通过');
  next();
}
