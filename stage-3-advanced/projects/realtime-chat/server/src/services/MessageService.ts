/**
 * 消息服务
 * 
 * 处理消息相关的业务逻辑
 */

import { MessageRepository } from '../repositories/MessageRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { CreateMessageDTO, Message, MessageInfo } from '../models/Message';
import { Logger } from '../utils/logger';

export class MessageService {
  private messageRepository: MessageRepository;
  private roomRepository: RoomRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.roomRepository = new RoomRepository();
  }

  /**
   * 创建新消息
   * 
   * 验证用户是否有权限发送消息，然后创建消息
   */
  async createMessage(userId: string, messageData: CreateMessageDTO): Promise<Message> {
    try {
      // 1. 验证消息内容
      if (!messageData.content || messageData.content.trim().length === 0) {
        throw new Error('消息内容不能为空');
      }

      if (messageData.content.length > 5000) {
        throw new Error('消息内容不能超过 5000 个字符');
      }

      // 2. 验证聊天室是否存在
      const room = await this.roomRepository.findById(messageData.roomId);
      if (!room) {
        throw new Error('聊天室不存在');
      }

      // 3. 验证用户是否有权限发送消息
      const isMember = await this.roomRepository.isMember(messageData.roomId, userId);
      if (!isMember) {
        throw new Error('你不是该聊天室成员，无法发送消息');
      }

      // 4. 创建消息
      const message = await this.messageRepository.create(userId, messageData);

      Logger.info('消息创建成功', {
        messageId: message.id,
        roomId: messageData.roomId,
        userId,
      });

      return message;
    } catch (error) {
      Logger.error('创建消息失败', error);
      throw error;
    }
  }

  /**
   * 获取聊天室历史消息
   * 
   * @param roomId 聊天室 ID
   * @param userId 请求用户 ID
   * @param limit 消息数量限制
   * @param before 获取此消息 ID 之前的消息（用于分页）
   */
  async getRoomMessages(
    roomId: string,
    userId: string,
    limit: number = 50,
    before?: string
  ): Promise<MessageInfo[]> {
    try {
      // 1. 验证用户是否有权限查看消息
      const isMember = await this.roomRepository.isMember(roomId, userId);
      if (!isMember) {
        throw new Error('你不是该聊天室成员，无法查看消息');
      }

      // 2. 获取消息
      const messages = await this.messageRepository.findByRoomId(roomId, limit, before);

      Logger.debug('获取聊天室消息成功', {
        roomId,
        messageCount: messages.length,
      });

      return messages;
    } catch (error) {
      Logger.error('获取聊天室消息失败', error);
      throw error;
    }
  }

  /**
   * 更新消息
   * 
   * 只有消息发送者可以编辑自己的消息
   */
  async updateMessage(messageId: string, userId: string, content: string): Promise<void> {
    try {
      // 1. 获取原消息
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw new Error('消息不存在');
      }

      // 2. 验证是否是消息发送者
      if (message.userId !== userId) {
        throw new Error('只能编辑自己的消息');
      }

      // 3. 验证消息内容
      if (!content || content.trim().length === 0) {
        throw new Error('消息内容不能为空');
      }

      // 4. 更新消息
      await this.messageRepository.update(messageId, content);

      Logger.info('消息更新成功', { messageId, userId });
    } catch (error) {
      Logger.error('更新消息失败', error);
      throw error;
    }
  }

  /**
   * 删除消息
   * 
   * 只有消息发送者或聊天室管理员可以删除消息
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      // 1. 获取消息
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw new Error('消息不存在');
      }

      // 2. 验证权限（简化版：只允许发送者删除）
      if (message.userId !== userId) {
        throw new Error('只能删除自己的消息');
      }

      // 3. 删除消息
      await this.messageRepository.delete(messageId);

      Logger.info('消息删除成功', { messageId, userId });
    } catch (error) {
      Logger.error('删除消息失败', error);
      throw error;
    }
  }
}
