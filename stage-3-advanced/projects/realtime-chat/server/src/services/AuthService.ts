/**
 * 认证服务
 * 
 * 处理用户注册、登录和 JWT 令牌管理
 * 使用 bcrypt 进行密码哈希，使用 JWT 进行身份验证
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { CreateUserDTO, LoginDTO, User, toUserInfo, UserInfo } from '../models/User';
import { Logger } from '../utils/logger';

/**
 * JWT 载荷接口
 */
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.userRepository = new UserRepository();
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

    // 警告：如果使用默认密钥
    if (!process.env.JWT_SECRET) {
      Logger.warn('使用默认 JWT 密钥，生产环境请设置 JWT_SECRET 环境变量');
    }
  }

  /**
   * 用户注册
   * 
   * 验证用户信息，哈希密码，创建新用户
   * 
   * @throws 如果用户名或邮箱已存在
   */
  async register(userData: CreateUserDTO): Promise<{ user: UserInfo; token: string }> {
    try {
      Logger.info('开始用户注册流程', { username: userData.username, email: userData.email });

      // 1. 验证用户名是否已存在
      const existingUsername = await this.userRepository.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('用户名已被使用');
      }

      // 2. 验证邮箱是否已存在
      const existingEmail = await this.userRepository.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('邮箱已被注册');
      }

      // 3. 哈希密码
      const passwordHash = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

      // 4. 创建用户
      const user = await this.userRepository.create({
        ...userData,
        passwordHash,
      });

      Logger.info('用户注册成功', { userId: user.id, username: user.username });

      // 5. 生成 JWT 令牌
      const token = this.generateToken(user);

      // 6. 返回用户信息（不包含敏感数据）
      return {
        user: toUserInfo(user),
        token,
      };
    } catch (error) {
      Logger.error('用户注册失败', error);
      throw error;
    }
  }

  /**
   * 用户登录
   * 
   * 验证用户凭证，生成 JWT 令牌
   * 
   * @throws 如果用户不存在或密码错误
   */
  async login(loginData: LoginDTO): Promise<{ user: UserInfo; token: string }> {
    try {
      Logger.info('开始用户登录流程', { email: loginData.email });

      // 1. 查找用户
      const user = await this.userRepository.findByEmail(loginData.email);
      if (!user) {
        throw new Error('邮箱或密码错误');
      }

      // 2. 验证密码
      const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
      if (!isPasswordValid) {
        Logger.warn('登录失败：密码错误', { email: loginData.email });
        throw new Error('邮箱或密码错误');
      }

      // 3. 更新最后登录时间
      await this.userRepository.updateLastLogin(user.id);

      Logger.info('用户登录成功', { userId: user.id, username: user.username });

      // 4. 生成 JWT 令牌
      const token = this.generateToken(user);

      // 5. 返回用户信息
      return {
        user: toUserInfo(user),
        token,
      };
    } catch (error) {
      Logger.error('用户登录失败', error);
      throw error;
    }
  }

  /**
   * 验证 JWT 令牌
   * 
   * @throws 如果令牌无效或已过期
   */
  verifyToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('令牌已过期');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('无效的令牌');
      }
      throw error;
    }
  }

  /**
   * 生成 JWT 令牌
   */
  private generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  /**
   * 刷新令牌
   * 
   * 验证旧令牌，如果有效则生成新令牌
   */
  async refreshToken(oldToken: string): Promise<string> {
    try {
      const payload = this.verifyToken(oldToken);
      
      // 获取用户最新信息
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 生成新令牌
      return this.generateToken(user);
    } catch (error) {
      Logger.error('刷新令牌失败', error);
      throw error;
    }
  }
}
