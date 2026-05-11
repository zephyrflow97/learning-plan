# 实时聊天应用 - 快速开始指南

## 🚀 快速启动

### 1. 启动服务端

```bash
# 进入服务端目录
cd server

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 启动开发服务器
npm run dev
```

服务端将在 `http://localhost:3100` 启动

### 2. 启动客户端

```bash
# 新开一个终端，进入客户端目录
cd client

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 启动开发服务器
npm run dev
```

客户端将在 `http://localhost:3000` 启动

### 3. 使用应用

1. 打开浏览器访问 `http://localhost:3000`
2. 注册一个新账号或登录
3. 创建聊天室或加入现有聊天室
4. 开始聊天！

## 📁 项目结构

```
realtime-chat/
├── server/              # 服务端
│   ├── src/
│   │   ├── models/      # 数据模型
│   │   ├── repositories/# 数据访问层
│   │   ├── services/    # 业务逻辑层
│   │   ├── controllers/ # 控制器
│   │   ├── middleware/  # 中间件
│   │   ├── websocket/   # WebSocket 处理
│   │   └── database/    # 数据库
│   └── package.json
├── client/              # 客户端
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── components/  # UI 组件
│   │   ├── services/    # API 服务
│   │   └── stores/      # 状态管理
│   └── package.json
└── README.md
```

## ✨ 主要功能

- ✅ 用户注册和登录
- ✅ 创建和加入聊天室
- ✅ 实时消息发送和接收
- ✅ 在线状态显示
- ✅ 输入提示
- ✅ 消息历史记录
- ✅ 响应式设计

## 🛠️ 技术栈

**服务端:**
- TypeScript + Node.js
- Express + Socket.IO
- SQLite + JWT
- 分层架构

**客户端:**
- React + TypeScript
- Vite + Socket.IO Client
- Zustand 状态管理

## 📝 API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 聊天室
- `GET /api/rooms` - 获取所有公开聊天室
- `GET /api/rooms/my` - 获取我的聊天室
- `POST /api/rooms` - 创建聊天室
- `POST /api/rooms/:id/join` - 加入聊天室

## 🔍 故障排查

### 服务端无法启动
- 检查端口 3100 是否被占用
- 确认已安装所有依赖 `npm install`
- 查看日志文件 `logs/error.log`

### 客户端无法连接
- 确认服务端已启动
- 检查环境变量配置是否正确
- 查看浏览器控制台错误信息

### WebSocket 连接失败
- 确认防火墙未阻止 WebSocket 连接
- 检查服务端 CORS 配置
- 确认认证令牌有效

## 📚 学习要点

1. **WebSocket 实时通信** - Socket.IO 的使用
2. **JWT 认证** - 令牌生成和验证
3. **分层架构** - Repository、Service、Controller 模式
4. **React Hooks** - useState、useEffect 的实践
5. **状态管理** - Zustand 的使用

祝你学习愉快！🎉
