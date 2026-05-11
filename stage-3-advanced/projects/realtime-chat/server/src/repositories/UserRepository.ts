/**
 * 用户数据访问层
 * 
 * 封装所有用户相关的数据库操作
 * 遵循 Repository 模式，分离业务逻辑和数据访问
 */

import { db } from '../database';
import { User, CreateUserDTO } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger';

export class UserRepository {
  /**
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<User | undefined> {
    try {
      const user = await db.get<any>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      return user ? this.mapToUser(user) : undefined;
    } catch (error) {
      Logger.error('查找用户失败', error);
      throw error;
    }
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await db.get<any>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      return user ? this.mapToUser(user) : undefined;
    } catch (error) {
      Logger.error('根据邮箱查找用户失败', error);
      throw error;
    }
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await db.get<any>(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      return user ? this.mapToUser(user) : undefined;
    } catch (error) {
      Logger.error('根据用户名查找用户失败', error);
      throw error;
    }
  }

  /**
   * 创建新用户
   */
  async create(userData: CreateUserDTO & { passwordHash: string }): Promise<User> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO users (id, username, email, password_hash, created_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, userData.username, userData.email, userData.passwordHash, now]
      );

      Logger.info('用户创建成功', { userId: id, username: userData.username });

      // 返回创建的用户
      const user = await this.findById(id);
      if (!user) {
        throw new Error('用户创建后查询失败');
      }

      return user;
    } catch (error) {
      Logger.error('创建用户失败', error);
      throw error;
    }
  }

  /**
   * 更新用户最后登录时间
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await db.run(
        'UPDATE users SET last_login_at = ? WHERE id = ?',
        [now, userId]
      );

      Logger.debug('更新用户最后登录时间', { userId });
    } catch (error) {
      Logger.error('更新最后登录时间失败', error);
      throw error;
    }
  }

  /**
   * 更新用户头像
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      await db.run(
        'UPDATE users SET avatar_url = ? WHERE id = ?',
        [avatarUrl, userId]
      );

      Logger.info('更新用户头像成功', { userId });
    } catch (error) {
      Logger.error('更新用户头像失败', error);
      throw error;
    }
  }

  /**
   * 获取所有用户（用于管理）
   */
  async findAll(): Promise<User[]> {
    try {
      const users = await db.all<any>('SELECT * FROM users ORDER BY created_at DESC');
      return users.map(user => this.mapToUser(user));
    } catch (error) {
      Logger.error('查询所有用户失败', error);
      throw error;
    }
  }

  /**
   * 将数据库行映射为 User 对象
   */
  private mapToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      avatarUrl: row.avatar_url,
      createdAt: new Date(row.created_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    };
  }
}
