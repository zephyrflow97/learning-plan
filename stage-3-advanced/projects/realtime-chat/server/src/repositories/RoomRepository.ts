/**
 * 聊天室数据访问层
 * 
 * 封装所有聊天室相关的数据库操作
 */

import { db } from '../database';
import { Room, CreateRoomDTO, RoomMember, RoomInfo } from '../models/Room';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger';

export class RoomRepository {
  /**
   * 根据 ID 查找聊天室
   */
  async findById(id: string): Promise<Room | undefined> {
    try {
      const room = await db.get<any>(
        'SELECT * FROM rooms WHERE id = ?',
        [id]
      );

      return room ? this.mapToRoom(room) : undefined;
    } catch (error) {
      Logger.error('查找聊天室失败', error);
      throw error;
    }
  }

  /**
   * 创建新聊天室
   */
  async create(userId: string, roomData: CreateRoomDTO): Promise<Room> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO rooms (id, name, description, created_by, is_private, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          roomData.name,
          roomData.description || null,
          userId,
          roomData.isPrivate ? 1 : 0,
          now
        ]
      );

      // 创建者自动加入聊天室
      await this.addMember(id, userId, 'owner');

      Logger.info('聊天室创建成功', { roomId: id, name: roomData.name });

      const room = await this.findById(id);
      if (!room) {
        throw new Error('聊天室创建后查询失败');
      }

      return room;
    } catch (error) {
      Logger.error('创建聊天室失败', error);
      throw error;
    }
  }

  /**
   * 获取所有公开聊天室
   */
  async findAllPublic(): Promise<RoomInfo[]> {
    try {
      const rooms = await db.all<any>(`
        SELECT r.*, COUNT(rm.user_id) as member_count
        FROM rooms r
        LEFT JOIN room_members rm ON r.id = rm.room_id
        WHERE r.is_private = 0
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `);

      return rooms.map(room => ({
        ...this.mapToRoom(room),
        memberCount: room.member_count || 0,
      }));
    } catch (error) {
      Logger.error('查询公开聊天室失败', error);
      throw error;
    }
  }

  /**
   * 获取用户加入的所有聊天室
   */
  async findByUserId(userId: string): Promise<RoomInfo[]> {
    try {
      const rooms = await db.all<any>(`
        SELECT r.*, COUNT(rm2.user_id) as member_count
        FROM rooms r
        INNER JOIN room_members rm ON r.id = rm.room_id
        LEFT JOIN room_members rm2 ON r.id = rm2.room_id
        WHERE rm.user_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `, [userId]);

      return rooms.map(room => ({
        ...this.mapToRoom(room),
        memberCount: room.member_count || 0,
        isJoined: true,
      }));
    } catch (error) {
      Logger.error('查询用户聊天室失败', error);
      throw error;
    }
  }

  /**
   * 添加成员到聊天室
   */
  async addMember(
    roomId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' = 'member'
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      await db.run(
        `INSERT INTO room_members (room_id, user_id, role, joined_at) 
         VALUES (?, ?, ?, ?)`,
        [roomId, userId, role, now]
      );

      Logger.info('用户加入聊天室', { roomId, userId, role });
    } catch (error) {
      Logger.error('添加聊天室成员失败', error);
      throw error;
    }
  }

  /**
   * 移除聊天室成员
   */
  async removeMember(roomId: string, userId: string): Promise<void> {
    try {
      await db.run(
        'DELETE FROM room_members WHERE room_id = ? AND user_id = ?',
        [roomId, userId]
      );

      Logger.info('用户离开聊天室', { roomId, userId });
    } catch (error) {
      Logger.error('移除聊天室成员失败', error);
      throw error;
    }
  }

  /**
   * 检查用户是否是聊天室成员
   */
  async isMember(roomId: string, userId: string): Promise<boolean> {
    try {
      const member = await db.get<any>(
        'SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?',
        [roomId, userId]
      );

      return !!member;
    } catch (error) {
      Logger.error('检查聊天室成员失败', error);
      throw error;
    }
  }

  /**
   * 获取聊天室成员列表
   */
  async getMembers(roomId: string): Promise<RoomMember[]> {
    try {
      const members = await db.all<any>(
        'SELECT * FROM room_members WHERE room_id = ?',
        [roomId]
      );

      return members.map(m => ({
        roomId: m.room_id,
        userId: m.user_id,
        joinedAt: new Date(m.joined_at),
        role: m.role,
      }));
    } catch (error) {
      Logger.error('获取聊天室成员失败', error);
      throw error;
    }
  }

  /**
   * 将数据库行映射为 Room 对象
   */
  private mapToRoom(row: any): Room {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdBy: row.created_by,
      isPrivate: row.is_private === 1,
      createdAt: new Date(row.created_at),
    };
  }
}
