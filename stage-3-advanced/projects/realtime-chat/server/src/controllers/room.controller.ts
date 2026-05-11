/**
 * 聊天室控制器
 * 
 * 处理聊天室相关的 HTTP 请求
 */

import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/RoomService';
import { Logger } from '../utils/logger';

const roomService = new RoomService();

/**
 * 创建聊天室
 */
export async function createRoom(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未认证' });
      return;
    }

    const { name, description, isPrivate } = req.body;

    if (!name) {
      res.status(400).json({ error: '聊天室名称不能为空' });
      return;
    }

    const room = await roomService.createRoom(req.user.userId, {
      name,
      description,
      isPrivate: isPrivate || false,
    });

    res.status(201).json({
      message: '聊天室创建成功',
      room,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取所有公开聊天室
 */
export async function getAllRooms(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rooms = await roomService.getAllPublicRooms();

    res.json({
      rooms,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取当前用户的聊天室列表
 */
export async function getMyRooms(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未认证' });
      return;
    }

    const rooms = await roomService.getUserRooms(req.user.userId);

    res.json({
      rooms,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取聊天室详情
 */
export async function getRoomById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { roomId } = req.params;

    const room = await roomService.getRoomById(roomId);

    res.json({
      room,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 加入聊天室
 */
export async function joinRoom(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未认证' });
      return;
    }

    const { roomId } = req.params;

    await roomService.joinRoom(roomId, req.user.userId);

    res.json({
      message: '成功加入聊天室',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 离开聊天室
 */
export async function leaveRoom(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未认证' });
      return;
    }

    const { roomId } = req.params;

    await roomService.leaveRoom(roomId, req.user.userId);

    res.json({
      message: '已离开聊天室',
    });
  } catch (error) {
    next(error);
  }
}
