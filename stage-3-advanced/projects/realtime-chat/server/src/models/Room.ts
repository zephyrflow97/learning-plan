/**
 * 聊天室数据模型
 * 
 * 定义聊天室的结构和相关操作
 */

export interface Room {
  /** 聊天室唯一标识符 */
  id: string;
  
  /** 聊天室名称 */
  name: string;
  
  /** 聊天室描述 */
  description?: string;
  
  /** 创建者用户 ID */
  createdBy: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 是否为私有聊天室 */
  isPrivate: boolean;
}

/**
 * 聊天室创建 DTO
 */
export interface CreateRoomDTO {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

/**
 * 聊天室成员
 */
export interface RoomMember {
  roomId: string;
  userId: string;
  joinedAt: Date;
  role: 'owner' | 'admin' | 'member';
}

/**
 * 聊天室信息（包含成员数量）
 */
export interface RoomInfo extends Room {
  memberCount: number;
  isJoined?: boolean;
}
