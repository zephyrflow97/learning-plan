/**
 * 用户数据模型
 * 
 * 定义用户的基本信息结构
 */

export interface User {
  /** 用户唯一标识符 */
  id: string;
  
  /** 用户名（唯一） */
  username: string;
  
  /** 邮箱地址（唯一） */
  email: string;
  
  /** 密码哈希值 */
  passwordHash: string;
  
  /** 用户头像 URL（可选） */
  avatarUrl?: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 最后登录时间 */
  lastLoginAt?: Date;
}

/**
 * 用户创建 DTO
 */
export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

/**
 * 用户登录 DTO
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * 用户信息（不包含敏感信息）
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

/**
 * 将 User 转换为 UserInfo（移除敏感信息）
 */
export function toUserInfo(user: User): UserInfo {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}
