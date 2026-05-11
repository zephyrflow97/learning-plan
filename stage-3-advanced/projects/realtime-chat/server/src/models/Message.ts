/**
 * 消息数据模型
 * 
 * 定义聊天消息的结构
 */

export interface Message {
  /** 消息唯一标识符 */
  id: string;
  
  /** 所属聊天室 ID */
  roomId: string;
  
  /** 发送者用户 ID */
  userId: string;
  
  /** 消息内容 */
  content: string;
  
  /** 消息类型 */
  type: MessageType;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 是否已编辑 */
  isEdited: boolean;
  
  /** 编辑时间 */
  editedAt?: Date;
}

/**
 * 消息类型
 */
export enum MessageType {
  /** 普通文本消息 */
  TEXT = 'text',
  
  /** 系统消息 */
  SYSTEM = 'system',
  
  /** 图片消息 */
  IMAGE = 'image',
  
  /** 文件消息 */
  FILE = 'file',
}

/**
 * 消息创建 DTO
 */
export interface CreateMessageDTO {
  roomId: string;
  content: string;
  type?: MessageType;
}

/**
 * 消息信息（包含发送者信息）
 */
export interface MessageInfo extends Message {
  username: string;
  avatarUrl?: string;
}
