# 实时聊天应用项目

构建一个功能完整的实时聊天应用，支持多房间、用户认证、消息持久化等功能。

## 📚 项目目标

通过本项目，你将学会：

- ✅ 使用 WebSocket 实现实时通信
- ✅ 设计和实现用户认证系统
- ✅ 应用多种设计模式
- ✅ 实现数据持久化
- ✅ 编写测试代码
- ✅ 进行性能优化

---

## 🎯 核心功能

1. 用户认证（注册、登录、JWT）
2. 实时消息传输（WebSocket）
3. 多房间支持
4. 消息持久化（SQLite/PostgreSQL）
5. 在线状态显示
6. 输入提示（正在输入...）
7. 消息历史加载
8. 文件分享（可选）

---

## 🏗️ 技术栈

**后端：**
- TypeScript
- Node.js
- Express
- Socket.IO
- SQLite/PostgreSQL
- JWT

**前端：**
- React
- TypeScript
- Socket.IO Client
- Axios

**测试：**
- Jest
- Supertest

---

## 📁 项目结构

```
realtime-chat/
├── server/
│   ├── src/
│   │   ├── models/          # 数据模型
│   │   ├── repositories/    # 数据访问层
│   │   ├── services/        # 业务逻辑层
│   │   ├── controllers/     # 控制器
│   │   ├── middleware/      # 中间件
│   │   ├── websocket/       # WebSocket 处理
│   │   ├── utils/           # 工具函数
│   │   └── index.ts         # 入口文件
│   ├── tests/               # 测试文件
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── services/        # API 服务
│   │   ├── types/           # 类型定义
│   │   └── App.tsx
│   └── package.json
└── README.md
```

---

## 🚀 实现步骤

### 第 1 步：项目初始化

```bash
# 创建项目目录
mkdir realtime-chat
cd realtime-chat

# 初始化服务端
mkdir server
cd server
npm init -y
npm install express socket.io sqlite3 jsonwebtoken bcrypt
npm install -D typescript @types/node @types/express @types/socket.io ts-node nodemon

# 创建 tsconfig.json
npx tsc --init
```

---

### 第 2 步：数据模型设计

```typescript
// server/src/models/User.ts
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// server/src/models/Room.ts
export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}

// server/src/models/Message.ts
export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: Date;
}
```

---

### 第 3 步：数据库初始化

```typescript
// server/src/database/index.ts
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

class Database {
  private db: sqlite3.Database;
  
  constructor() {
    this.db = new sqlite3.Database('./chat.db');
    this.initialize();
  }
  
  private async initialize() {
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await this.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    await this.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }
  
  run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }
  
  all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }
}

export const db = new Database();
```

---

### 第 4 步：用户认证

```typescript
// server/src/services/AuthService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { User } from '../models/User';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  async register(username: string, email: string, password: string): Promise<User> {
    // 检查用户是否存在
    const existing = await db.get<User>(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existing) {
      throw new Error('用户已存在');
    }
    
    // 哈希密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建用户
    const id = uuidv4();
    await db.run(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, username, email, passwordHash]
    );
    
    const user = await db.get<User>('SELECT * FROM users WHERE id = ?', [id]);
    return user!;
  }
  
  async login(email: string, password: string): Promise<string> {
    // 查找用户
    const user = await db.get<User & { password_hash: string }>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('密码错误');
    }
    
    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return token;
  }
  
  verifyToken(token: string): { userId: string; username: string } {
    try {
      return jwt.verify(token, this.JWT_SECRET) as any;
    } catch (error) {
      throw new Error('无效的令牌');
    }
  }
}
```

---

### 第 5 步：WebSocket 服务

```typescript
// server/src/websocket/ChatServer.ts
import { Server as SocketServer, Socket } from 'socket.io';
import { AuthService } from '../services/AuthService';
import { MessageService } from '../services/MessageService';

export class ChatServer {
  private io: SocketServer;
  private authService: AuthService;
  private messageService: MessageService;
  private onlineUsers = new Map<string, string>(); // userId -> socketId
  
  constructor(io: SocketServer) {
    this.io = io;
    this.authService = new AuthService();
    this.messageService = new MessageService();
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.io.use(this.authenticate.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
  }
  
  private authenticate(socket: Socket, next: Function) {
    const token = socket.handshake.auth.token;
    
    try {
      const payload = this.authService.verifyToken(token);
      socket.data.userId = payload.userId;
      socket.data.username = payload.username;
      next();
    } catch (error) {
      next(new Error('认证失败'));
    }
  }
  
  private handleConnection(socket: Socket) {
    const userId = socket.data.userId;
    const username = socket.data.username;
    
    console.log(`用户 ${username} (${userId}) 已连接`);
    
    // 记录在线用户
    this.onlineUsers.set(userId, socket.id);
    
    // 通知其他用户
    this.io.emit('user:online', { userId, username });
    
    // 监听事件
    socket.on('room:join', (data) => this.handleJoinRoom(socket, data));
    socket.on('room:leave', (data) => this.handleLeaveRoom(socket, data));
    socket.on('message:send', (data) => this.handleSendMessage(socket, data));
    socket.on('message:typing', (data) => this.handleTyping(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }
  
  private async handleJoinRoom(socket: Socket, data: { roomId: string }) {
    socket.join(data.roomId);
    
    // 获取历史消息
    const messages = await this.messageService.getRoomMessages(data.roomId, 50);
    socket.emit('room:history', messages);
    
    // 通知房间内其他用户
    socket.to(data.roomId).emit('room:user_joined', {
      userId: socket.data.userId,
      username: socket.data.username
    });
  }
  
  private handleLeaveRoom(socket: Socket, data: { roomId: string }) {
    socket.leave(data.roomId);
    
    socket.to(data.roomId).emit('room:user_left', {
      userId: socket.data.userId,
      username: socket.data.username
    });
  }
  
  private async handleSendMessage(socket: Socket, data: { roomId: string; content: string }) {
    // 保存消息
    const message = await this.messageService.createMessage({
      roomId: data.roomId,
      userId: socket.data.userId,
      content: data.content
    });
    
    // 广播消息
    this.io.to(data.roomId).emit('message:new', {
      ...message,
      username: socket.data.username
    });
  }
  
  private handleTyping(socket: Socket, data: { roomId: string; isTyping: boolean }) {
    socket.to(data.roomId).emit('message:typing', {
      userId: socket.data.userId,
      username: socket.data.username,
      isTyping: data.isTyping
    });
  }
  
  private handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    const username = socket.data.username;
    
    console.log(`用户 ${username} (${userId}) 已断开连接`);
    
    this.onlineUsers.delete(userId);
    
    this.io.emit('user:offline', { userId, username });
  }
}
```

---

## 🧪 测试

```typescript
// server/tests/auth.test.ts
import { AuthService } from '../src/services/AuthService';

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    authService = new AuthService();
  });
  
  it('应该注册新用户', async () => {
    const user = await authService.register(
      'testuser',
      'test@example.com',
      'password123'
    );
    
    expect(user).toHaveProperty('id');
    expect(user.username).toBe('testuser');
  });
  
  it('应该登录并返回令牌', async () => {
    await authService.register('testuser', 'test@example.com', 'password123');
    
    const token = await authService.login('test@example.com', 'password123');
    
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
  
  it('应该验证令牌', () => {
    const token = authService.login('test@example.com', 'password123');
    const payload = authService.verifyToken(token);
    
    expect(payload).toHaveProperty('userId');
    expect(payload).toHaveProperty('username');
  });
});
```

---

## ✅ 验收检查清单

完成项目后，请检查：

- [ ] 用户可以注册和登录
- [ ] 用户可以创建和加入聊天室
- [ ] 消息实时显示
- [ ] 消息持久化到数据库
- [ ] 显示在线用户列表
- [ ] 显示"正在输入"提示
- [ ] 可以加载历史消息
- [ ] 代码有良好的注释
- [ ] 通过所有测试
- [ ] 性能表现良好

---

## 🎓 学习要点

1. **WebSocket 实时通信**
2. **JWT 认证**
3. **数据库设计和 ORM**
4. **分层架构**
5. **设计模式应用**
6. **测试驱动开发**

---

## 🔧 扩展建议

1. 添加私聊功能
2. 实现消息已读状态
3. 添加表情包和文件上传
4. 实现消息搜索
5. 添加用户个人资料页面
6. 实现消息加密
7. 添加推送通知

---

## 下一步

恭喜完成阶段 3 的学习！

**下一步：** [阶段 4：大师级 - 生产级应用开发](../../../stage-4-expert/)

继续提升你的技能！💪
