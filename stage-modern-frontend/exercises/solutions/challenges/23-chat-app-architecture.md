# 实时聊天应用 - 架构设计

## 技术栈

**客户端**:
- React + Socket.io Client
- TypeScript
- Tailwind CSS

**服务端**:
- Next.js API Route + Socket.io Server
- Node.js

**数据库**:
- Prisma + PostgreSQL

## 数据模型

```prisma
model Message {
  id        Int      @id @default(autoincrement())
  content   String
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model User {
  id       Int       @id @default(autoincrement())
  name     String
  messages Message[]
}
```

## WebSocket 事件

**客户端 → 服务端**:
- `message:send` - 发送消息
- `typing:start` - 开始输入
- `typing:stop` - 停止输入

**服务端 → 客户端**:
- `message:receive` - 接收消息
- `typing:update` - 输入状态更新
- `user:join` - 用户加入
- `user:leave` - 用户离开
- `users:online` - 在线用户列表

## 组件设计

```
ChatApp
├── ChatRoom (聊天室容器)
│   ├── MessageList (消息列表)
│   │   └── Message (单条消息)
│   ├── MessageInput (输入框)
│   ├── UserList (在线用户列表)
│   │   └── UserItem (用户项)
│   └── TypingIndicator (输入提示)
```

## 实现要点

1. **WebSocket 连接管理**: 使用 Socket.io 管理实时连接
2. **消息持久化**: 所有消息存储到数据库
3. **在线状态**: 使用 Socket.io Room 管理在线用户
4. **输入提示**: 防抖 (debounce) 输入事件,减少网络请求
5. **消息滚动**: 新消息自动滚动到底部

## 代码结构

```
app/
  api/
    socket/
      route.ts          # Socket.io 服务器
  chat/
    page.tsx            # 聊天页面
components/
  chat/
    ChatRoom.tsx
    MessageList.tsx
    MessageInput.tsx
    UserList.tsx
lib/
  socket.ts             # Socket.io 客户端配置
```
