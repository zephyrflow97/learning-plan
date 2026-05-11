/**
 * 聊天室服务
 * 
 * 处理聊天室相关的业务逻辑
 */

import { RoomRepository } from '../repositories/RoomRepository';
import { CreateRoomDTO, Room, RoomInfo } from '../models/Room';
import { Logger } from '../utils/logger';

export class RoomService {
  private roomRepository: RoomRepository;

  constructor() {
    this.roomRepository = new RoomRepository();
  }

  /**
   * 创建聊天室
   */
  async createRoom(userId: string, roomData: CreateRoomDTO): Promise<Room> {
    try {
      // 验证聊天室名称
      if (!roomData.name || roomData.name.trim().length === 0) {
        throw new Error('聊天室名称不能为空');
      }

      if (roomData.name.length > 50) {
        throw new Error('聊天室名称不能超过 50 个字符');
      }

      const room = await this.roomRepository.create(userId, roomData);
      
      Logger.info('聊天室创建成功', { roomId: room.id, name: room.name, createdBy: userId });
      
      return room;
    } catch (error) {
      Logger.error('创建聊天室失败', error);
      throw error;
    }
  }

  /**
   * 获取聊天室信息
   */
  async getRoomById(roomId: string): Promise<Room> {
    try {
      const room = await this.roomRepository.findById(roomId);
      
      if (!room) {
        throw new Error('聊天室不存在');
      }

      return room;
    } catch (error) {
      Logger.error('获取聊天室信息失败', error);
      throw error;
    }
  }

  /**
   * 获取所有公开聊天室
   */
  async getAllPublicRooms(): Promise<RoomInfo[]> {
    try {
      return await this.roomRepository.findAllPublic();
    } catch (error) {
      Logger.error('获取公开聊天室列表失败', error);
      throw error;
    }
  }

  /**
   * 获取用户的聊天室列表
   */
  async getUserRooms(userId: string): Promise<RoomInfo[]> {
    try {
      return await this.roomRepository.findByUserId(userId);
    } catch (error) {
      Logger.error('获取用户聊天室列表失败', error);
      throw error;
    }
  }

  /**
   * 用户加入聊天室
   */
  async joinRoom(roomId: string, userId: string): Promise<void> {
    try {
      // 检查聊天室是否存在
      const room = await this.roomRepository.findById(roomId);
      if (!room) {
        throw new Error('聊天室不存在');
      }

      // 检查是否已经是成员
      const isMember = await this.roomRepository.isMember(roomId, userId);
      if (isMember) {
        Logger.warn('用户已经是聊天室成员', { roomId, userId });
        return;
      }

      // 添加成员
      await this.roomRepository.addMember(roomId, userId);

      Logger.info('用户加入聊天室', { roomId, userId });
    } catch (error) {
      Logger.error('加入聊天室失败', error);
      throw error;
    }
  }

  /**
   * 用户离开聊天室
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      // 检查是否是成员
      const isMember = await this.roomRepository.isMember(roomId, userId);
      if (!isMember) {
        throw new Error('你不是该聊天室成员');
      }

      // 移除成员
      await this.roomRepository.removeMember(roomId, userId);

      Logger.info('用户离开聊天室', { roomId, userId });
    } catch (error) {
      Logger.error('离开聊天室失败', error);
      throw error;
    }
  }

  /**
   * 检查用户是否有权限访问聊天室
   */
  async canAccessRoom(roomId: string, userId: string): Promise<boolean> {
    try {
      const room = await this.roomRepository.findById(roomId);
      if (!room) {
        return false;
      }

      // 公开聊天室任何人都可以访问
      if (!room.isPrivate) {
        return true;
      }

      // 私有聊天室只有成员可以访问
      return await this.roomRepository.isMember(roomId, userId);
    } catch (error) {
      Logger.error('检查聊天室访问权限失败', error);
      return false;
    }
  }
}
