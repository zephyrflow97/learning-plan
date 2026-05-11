/**
 * 消息数据访问层
 * 
 * 封装所有消息相关的数据库操作
 */

import { db } from '../database';
import { Message, CreateMessageDTO, MessageType, MessageInfo } from '../models/Message';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger';

export class MessageRepository {
  /**
   * 创建新消息
   */
  async create(userId: string, messageData: CreateMessageDTO): Promise<Message> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const type = messageData.type || MessageType.TEXT;

      await db.run(
        `INSERT INTO messages (id, room_id, user_id, content, type, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, messageData.roomId, userId, messageData.content, type, now]
      );

      Logger.debug('消息创建成功', { messageId: id, roomId: messageData.roomId });

      const message = await this.findById(id);
      if (!message) {
        throw new Error('消息创建后查询失败');
      }

      return message;
    } catch (error) {
      Logger.error('创建消息失败', error);
      throw error;
    }
  }

  /**
   * 根据 ID 查找消息
   */
  async findById(id: string): Promise<Message | undefined> {
    try {
      const message = await db.get<any>(
        'SELECT * FROM messages WHERE id = ?',
        [id]
      );

      return message ? this.mapToMessage(message) : undefined;
    } catch (error) {
      Logger.error('查找消息失败', error);
      throw error;
    }
  }

  /**
   * 获取聊天室的历史消息
   * @param roomId 聊天室 ID
   * @param limit 消息数量限制
   * @param before 获取此消息 ID 之前的消息（用于分页）
   */
  async findByRoomId(
    roomId: string,
    limit: number = 50,
    before?: string
  ): Promise<MessageInfo[]> {
    try {
      let sql = `
        SELECT m.*, u.username, u.avatar_url
        FROM messages m
        INNER JOIN users u ON m.user_id = u.id
        WHERE m.room_id = ?
      `;
      
      const params: any[] = [roomId];

      if (before) {
        // 获取指定消息之前的消息
        const beforeMessage = await this.findById(before);
        if (beforeMessage) {
          sql += ' AND m.created_at < ?';
          params.push(beforeMessage.createdAt.toISOString());
        }
      }

      sql += ' ORDER BY m.created_at DESC LIMIT ?';
      params.push(limit);

      const messages = await db.all<any>(sql, params);

      // 反转顺序，使最新的消息在最后
      return messages.reverse().map(msg => ({
        ...this.mapToMessage(msg),
        username: msg.username,
        avatarUrl: msg.avatar_url,
      }));
    } catch (error) {
      Logger.error('查询聊天室消息失败', error);
      throw error;
    }
  }

  /**
   * 更新消息内容
   */
  async update(messageId: string, content: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await db.run(
        'UPDATE messages SET content = ?, is_edited = 1, edited_at = ? WHERE id = ?',
        [content, now, messageId]
      );

      Logger.info('消息更新成功', { messageId });
    } catch (error) {
      Logger.error('更新消息失败', error);
      throw error;
    }
  }

  /**
   * 删除消息
   */
  async delete(messageId: string): Promise<void> {
    try {
      await db.run('DELETE FROM messages WHERE id = ?', [messageId]);
      Logger.info('消息删除成功', { messageId });
    } catch (error) {
      Logger.error('删除消息失败', error);
      throw error;
    }
  }

  /**
   * 获取聊天室消息总数
   */
  async countByRoomId(roomId: string): Promise<number> {
    try {
      const result = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages WHERE room_id = ?',
        [roomId]
      );

      return result?.count || 0;
    } catch (error) {
      Logger.error('统计聊天室消息失败', error);
      throw error;
    }
  }

  /**
   * 将数据库行映射为 Message 对象
   */
  private mapToMessage(row: any): Message {
    return {
      id: row.id,
      roomId: row.room_id,
      userId: row.user_id,
      content: row.content,
      type: row.type as MessageType,
      isEdited: row.is_edited === 1,
      createdAt: new Date(row.created_at),
      editedAt: row.edited_at ? new Date(row.edited_at) : undefined,
    };
  }
}
