/**
 * WebSocket 聊天服务器
 * 
 * 使用 Socket.IO 实现实时聊天功能
 * 处理用户连接、消息发送、房间管理等事件
 */

import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { AuthService } from '../services/AuthService';
import { MessageService } from '../services/MessageService';
import { RoomService } from '../services/RoomService';
import { Logger } from '../utils/logger';

/**
 * Socket 数据接口
 */
interface SocketData {
  userId: string;
  username: string;
  email: string;
}

/**
 * 在线用户信息
 */
interface OnlineUser {
  userId: string;
  username: string;
  socketId: string;
}

export class ChatServer {
  private io: SocketServer;
  private authService: AuthService;
  private messageService: MessageService;
  private roomService: RoomService;
  
  // 在线用户映射 userId -> socketId
  private onlineUsers = new Map<string, string>();
  
  // 正在输入的用户 roomId -> Set<userId>
  private typingUsers = new Map<string, Set<string>>();

  constructor(httpServer: HttpServer) {
    // 初始化 Socket.IO
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // 初始化服务
    this.authService = new AuthService();
    this.messageService = new MessageService();
    this.roomService = new RoomService();

    // 设置事件处理
    this.setupEventHandlers();

    Logger.info('WebSocket 聊天服务器初始化完成');
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // 认证中间件
    this.io.use(this.authenticate.bind(this));
    
    // 连接事件
    this.io.on('connection', this.handleConnection.bind(this));
  }

  /**
   * 认证中间件
   * 
   * 验证客户端的 JWT 令牌
   */
  private authenticate(socket: Socket, next: (err?: Error) => void): void {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        Logger.warn('WebSocket 连接缺少认证令牌');
        return next(new Error('缺少认证令牌'));
      }

      // 验证令牌
      const payload = this.authService.verifyToken(token);
      
      // 将用户信息附加到 socket
      socket.data = {
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
      } as SocketData;

      Logger.debug('WebSocket 认证成功', { userId: payload.userId });
      next();
    } catch (error) {
      Logger.error('WebSocket 认证失败', error);
      next(new Error('认证失败'));
    }
  }

  /**
   * 处理客户端连接
   */
  private handleConnection(socket: Socket): void {
    const data = socket.data as SocketData;
    const { userId, username } = data;

    Logger.info('用户连接到 WebSocket', { userId, username, socketId: socket.id });

    // 记录在线用户
    this.onlineUsers.set(userId, socket.id);

    // 通知所有用户：有用户上线
    this.io.emit('user:online', {
      userId,
      username,
      timestamp: new Date().toISOString(),
    });

    // 监听事件
    socket.on('room:join', (data) => this.handleJoinRoom(socket, data));
    socket.on('room:leave', (data) => this.handleLeaveRoom(socket, data));
    socket.on('message:send', (data) => this.handleSendMessage(socket, data));
    socket.on('message:typing', (data) => this.handleTyping(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));

    Logger.debug('用户事件监听器已设置', { userId });
  }

  /**
   * 处理加入房间事件
   */
  private async handleJoinRoom(
    socket: Socket,
    data: { roomId: string }
  ): Promise<void> {
    try {
      const { userId, username } = socket.data as SocketData;
      const { roomId } = data;

      Logger.info('用户尝试加入房间', { userId, roomId });

      // 检查用户是否有权限访问房间
      const canAccess = await this.roomService.canAccessRoom(roomId, userId);
      if (!canAccess) {
        socket.emit('error', { message: '无权访问该聊天室' });
        return;
      }

      // 加入 Socket.IO 房间
      socket.join(roomId);

      // 获取历史消息
      const messages = await this.messageService.getRoomMessages(roomId, userId, 50);
      socket.emit('room:history', { roomId, messages });

      // 通知房间内其他用户
      socket.to(roomId).emit('room:user_joined', {
        roomId,
        userId,
        username,
        timestamp: new Date().toISOString(),
      });

      Logger.info('用户成功加入房间', { userId, roomId });
    } catch (error) {
      Logger.error('加入房间失败', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : '加入房间失败',
      });
    }
  }

  /**
   * 处理离开房间事件
   */
  private handleLeaveRoom(socket: Socket, data: { roomId: string }): void {
    try {
      const { userId, username } = socket.data as SocketData;
      const { roomId } = data;

      Logger.info('用户离开房间', { userId, roomId });

      // 离开 Socket.IO 房间
      socket.leave(roomId);

      // 清除输入状态
      this.removeTypingUser(roomId, userId);

      // 通知房间内其他用户
      socket.to(roomId).emit('room:user_left', {
        roomId,
        userId,
        username,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      Logger.error('离开房间失败', error);
    }
  }

  /**
   * 处理发送消息事件
   */
  private async handleSendMessage(
    socket: Socket,
    data: { roomId: string; content: string }
  ): Promise<void> {
    try {
      const { userId, username } = socket.data as SocketData;
      const { roomId, content } = data;

      Logger.debug('用户发送消息', { userId, roomId });

      // 创建消息
      const message = await this.messageService.createMessage(userId, {
        roomId,
        content,
      });

      // 清除该用户的输入状态
      this.removeTypingUser(roomId, userId);
      this.broadcastTypingStatus(roomId);

      // 广播消息到房间
      this.io.to(roomId).emit('message:new', {
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        username,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt.toISOString(),
      });

      Logger.info('消息发送成功', {
        messageId: message.id,
        roomId,
        userId,
      });
    } catch (error) {
      Logger.error('发送消息失败', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : '发送消息失败',
      });
    }
  }

  /**
   * 处理输入状态事件
   */
  private handleTyping(
    socket: Socket,
    data: { roomId: string; isTyping: boolean }
  ): void {
    try {
      const { userId, username } = socket.data as SocketData;
      const { roomId, isTyping } = data;

      if (isTyping) {
        this.addTypingUser(roomId, userId);
      } else {
        this.removeTypingUser(roomId, userId);
      }

      // 广播输入状态
      this.broadcastTypingStatus(roomId);
    } catch (error) {
      Logger.error('处理输入状态失败', error);
    }
  }

  /**
   * 处理断开连接事件
   */
  private handleDisconnect(socket: Socket): void {
    const { userId, username } = socket.data as SocketData;

    Logger.info('用户断开连接', { userId, username });

    // 移除在线用户
    this.onlineUsers.delete(userId);

    // 清除所有房间的输入状态
    this.typingUsers.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);
        this.broadcastTypingStatus(roomId);
      }
    });

    // 通知所有用户：有用户下线
    this.io.emit('user:offline', {
      userId,
      username,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 添加正在输入的用户
   */
  private addTypingUser(roomId: string, userId: string): void {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    this.typingUsers.get(roomId)!.add(userId);
  }

  /**
   * 移除正在输入的用户
   */
  private removeTypingUser(roomId: string, userId: string): void {
    const users = this.typingUsers.get(roomId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        this.typingUsers.delete(roomId);
      }
    }
  }

  /**
   * 广播房间的输入状态
   */
  private broadcastTypingStatus(roomId: string): void {
    const typingUserIds = Array.from(this.typingUsers.get(roomId) || []);
    
    this.io.to(roomId).emit('message:typing', {
      roomId,
      userIds: typingUserIds,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 获取在线用户列表
   */
  getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.entries()).map(([userId, socketId]) => ({
      userId,
      username: '', // 需要从数据库查询
      socketId,
    }));
  }
}
