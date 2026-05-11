# 代码示例总索引

这个文档提供了所有学习阶段的代码示例的完整索引和快速导航。

## 📚 概述

本学习计划包含 **110+ 个实用代码示例**，覆盖从 CSS 基础到现代全栈开发的完整技术栈。所有示例都是可运行的、经过验证的真实代码。

## 🗺️ 学习路径导航

### 阶段 1: 前置基础 (Stage 2 - Intermediate)

#### 📦 [06. CSS 基础](../stage-2-intermediate/06-css-fundamentals/examples/)
**8 个示例文件** | [查看索引](../stage-2-intermediate/06-css-fundamentals/examples/README.md)

现代 CSS 核心技术：
- **Flexbox 布局**: 导航栏、卡片网格、居中对齐
- **Grid 布局**: Dashboard、Holy Grail 布局
- **CSS 变量**: 深色模式主题切换
- **动画**: 加载动画、过渡效果
- **响应式设计**: Media Queries 实战

**推荐学习顺序**:
1. Flexbox 基础 → 导航栏 → 卡片布局
2. Grid 基础 → Dashboard → Holy Grail
3. CSS 变量 → 深色模式
4. 动画和响应式设计

#### ⚛️ [07. React 基础](../stage-2-intermediate/07-react-basics/examples/)
**12 个示例文件** | [查看索引](../stage-2-intermediate/07-react-basics/examples/README.md)

React 核心概念与实战：
- **组件开发**: UserCard 组件模式
- **状态管理**: Counter、Todo 应用
- **副作用**: 数据获取、订阅管理
- **自定义 Hooks**: useFetch, useLocalStorage, useDebounce
- **完整应用**: Todo App (含统计、过滤、样式)

**推荐学习顺序**:
1. 组件基础 → 状态管理
2. 副作用 → 数据获取
3. 自定义 Hooks 实战
4. Todo App 综合项目

---

### 阶段 2: 现代前端技术栈 (Modern Frontend)

#### 🚀 [01. Next.js App Router](./01-nextjs-app-router/examples/)
**11 个示例文件** | [查看索引](./01-nextjs-app-router/examples/README.md)

Next.js 14+ 最新特性：
- **路由系统**: 基础路由、动态路由、路由组
- **布局系统**: Root Layout, Nested Layouts
- **服务端组件**: 数据获取、流式渲染
- **客户端组件**: 交互组件、状态管理
- **Server Actions**: 表单处理、数据变更
- **中间件**: 认证、国际化、限流

**推荐学习顺序**:
1. 基础路由 → 布局系统
2. 服务端组件 vs 客户端组件
3. Server Actions 表单处理
4. 中间件实战

#### 🎨 [02. Tailwind CSS](./02-tailwind-css/examples/)
**11 个示例文件** | [查看索引](./02-tailwind-css/examples/README.md)

实用优先的 CSS 框架：
- **核心组件**: Button, Card, Alert
- **布局实战**: Dashboard, Marketing Page
- **响应式**: Grid Layout, Navbar
- **主题系统**: 深色模式、自定义颜色
- **动画**: Transitions, Keyframes

**推荐学习顺序**:
1. 基础组件 → 布局实战
2. 响应式设计
3. 主题和动画

#### 🎭 [03. shadcn/ui 设计系统](./03-shadcn-design-system/examples/)
**8 个示例文件** | [查看索引](./03-shadcn-design-system/examples/README.md)

高质量组件库：
- **核心组件**: Button, Dialog, Form, Command
- **高级功能**: Toast 通知系统
- **组合模式**: 确认对话框
- **主题系统**: CSS 变量、主题切换

**推荐学习顺序**:
1. 基础组件使用
2. 表单和对话框
3. 组合模式实战

#### 🗄️ [04. Prisma 数据库](./04-prisma-database/examples/)
**13 个示例文件** | [查看索引](./04-prisma-database/examples/README.md)

现代 ORM 完整实战：
- **Schema 设计**: 基础模型、关系定义
- **CRUD 操作**: 增删改查、复杂查询
- **关系查询**: Include, Select, 嵌套查询
- **事务处理**: 原子操作、回滚机制
- **性能优化**: N+1 问题解决方案
- **迁移管理**: 数据库版本控制
- **Next.js 集成**: API Routes, Server Actions

**推荐学习顺序**:
1. Schema 设计 → 迁移管理
2. 基础 CRUD → 关系查询
3. 事务和性能优化
4. Next.js 集成实战

#### 🔌 [05. tRPC + TanStack Query](./05-trpc-tanstack-query/examples/)
**15 个示例文件** | [查看索引](./05-trpc-tanstack-query/examples/README.md)

端到端类型安全的 API：
- **Router 设计**: 模块化路由、类型推导
- **客户端集成**: React Hooks、Provider 设置
- **缓存策略**: Query 配置、预取
- **乐观更新**: 即时 UI 响应
- **错误处理**: Error Boundary、重试机制
- **中间件**: Context、认证

**推荐学习顺序**:
1. Router 和客户端设置
2. 查询和变更操作
3. 缓存和乐观更新
4. 错误处理和中间件

#### 📝 [06. 表单与验证](./06-forms-validation/examples/)
**10 个示例文件** | [查看索引](./06-forms-validation/examples/README.md)

企业级表单解决方案：
- **基础表单**: Login, Register 表单
- **Schema 验证**: Zod 类型安全
- **动态字段**: 数组字段、条件渲染
- **文件上传**: 图片上传、预览
- **Server Actions**: 服务端验证、错误处理
- **复杂场景**: 嵌套表单、动态数组

**推荐学习顺序**:
1. 基础表单 → Zod 验证
2. Server Actions 集成
3. 动态字段和文件上传

#### 🔐 [07. 身份认证](./07-authentication/examples/)
**12 个示例文件** | [查看索引](./07-authentication/examples/README.md)

完整认证系统：
- **NextAuth.js 配置**: 核心配置、JWT/Session
- **认证提供者**: Credentials, OAuth
- **数据库集成**: Prisma Adapter
- **中间件**: 路由保护
- **UI 组件**: Login, Protected Pages
- **权限控制**: RBAC、角色守卫
- **注册流程**: 用户注册、密码哈希

**推荐学习顺序**:
1. NextAuth 配置 → Provider 设置
2. Prisma 集成
3. 中间件和路由保护
4. RBAC 权限系统

#### 🚢 [08. 部署与生产](./08-deployment-production/examples/)
**7 个示例文件** | [查看索引](./08-deployment-production/examples/README.md)

生产环境最佳实践：
- **Docker 容器化**: Dockerfile、多阶段构建
- **环境变量**: 验证、类型安全
- **错误监控**: Sentry 集成
- **CI/CD**: GitHub Actions 工作流

**推荐学习顺序**:
1. 环境变量管理
2. Docker 容器化
3. Sentry 错误监控
4. CI/CD 自动化

---

## 🎯 推荐学习路径

### 路径 1: 快速入门 (适合有 React 基础)
1. **Next.js 基础** (01-nextjs-app-router) → 理解 App Router
2. **Tailwind 样式** (02-tailwind-css) → 快速构建 UI
3. **shadcn/ui 组件** (03-shadcn-design-system) → 使用现成组件
4. **Prisma 数据库** (04-prisma-database) → 数据持久化
5. **表单处理** (06-forms-validation) → 用户输入
6. **认证系统** (07-authentication) → 完整应用

### 路径 2: 完整学习 (从头开始)
1. **CSS 基础** (06-css-fundamentals) → 布局和样式基础
2. **React 基础** (07-react-basics) → 组件和状态
3. **Next.js 入门** (01-nextjs-app-router) → 框架核心
4. **Tailwind CSS** (02-tailwind-css) → 现代样式方案
5. **shadcn/ui** (03-shadcn-design-system) → 组件库
6. **Prisma** (04-prisma-database) → 数据库操作
7. **tRPC** (05-trpc-tanstack-query) → API 层
8. **表单验证** (06-forms-validation) → 数据处理
9. **认证** (07-authentication) → 安全性
10. **部署** (08-deployment-production) → 上线

### 路径 3: 项目驱动 (边学边做)
1. 选择一个项目主题 (博客、电商、SaaS)
2. **基础搭建**: Next.js + Tailwind + shadcn/ui
3. **数据层**: Prisma + tRPC
4. **功能开发**: 表单 + 认证
5. **部署上线**: Docker + CI/CD

---

## 📖 如何使用这些代码示例

### 1. 阅读代码
每个示例都包含：
- ✅ **完整的代码实现**
- 📝 **详细的注释说明**
- 🎯 **最佳实践展示**
- ⚠️ **常见陷阱提示**

### 2. 运行示例
大多数示例可以直接复制到项目中运行：

```bash
# 对于 React/Next.js 组件
# 1. 复制代码到你的项目
# 2. 确保安装了依赖
# 3. 导入并使用

# 对于完整功能
# 1. 查看 README 中的依赖
# 2. 复制相关文件
# 3. 调整配置
```

### 3. 学习模式

**模式 1: 代码审查**
- 阅读代码和注释
- 理解实现原理
- 注意最佳实践

**模式 2: 动手实践**
- 复制示例代码
- 修改和实验
- 添加新功能

**模式 3: 项目集成**
- 选择需要的功能
- 复制到项目中
- 根据需求调整

### 4. 获取帮助

每个章节的 `README.md` 包含：
- 📋 代码清单和目录
- 🔧 使用说明
- 💡 学习建议
- 🔗 相关资源链接

---

## 📊 统计信息

| 章节 | 示例数量 | 技术栈 |
|------|---------|--------|
| CSS 基础 | 8 | HTML, CSS |
| React 基础 | 12 | React, Hooks |
| Next.js | 11 | Next.js 14, Server Components |
| Tailwind | 11 | Tailwind CSS |
| shadcn/ui | 8 | React, Radix UI |
| Prisma | 13 | Prisma, PostgreSQL |
| tRPC | 15 | tRPC, TanStack Query |
| 表单验证 | 10 | React Hook Form, Zod |
| 认证 | 12 | NextAuth.js, Prisma |
| 部署 | 7 | Docker, GitHub Actions |
| **总计** | **110+** | **完整现代前端栈** |

---

## 🎓 学习建议

### ✅ DO (推荐做法)
- ✨ **动手实践**: 不要只看代码，要运行和修改
- 📚 **循序渐进**: 按照推荐顺序学习
- 🔍 **深入理解**: 读懂每一行代码的作用
- 💪 **举一反三**: 在理解基础上创新
- 🤝 **结合项目**: 应用到实际项目中

### ❌ DON'T (避免做法)
- 🚫 **直接复制粘贴**: 不理解就使用
- 🚫 **跳跃学习**: 基础没掌握就学高级
- 🚫 **只看不练**: 理论知识需要实践验证
- 🚫 **忽略注释**: 注释包含重要的说明
- 🚫 **放弃思考**: 遇到问题先自己尝试解决

---

## 🔗 快速链接

### Stage 2 - 前置基础
- [06-css-fundamentals](../stage-2-intermediate/06-css-fundamentals/examples/)
- [07-react-basics](../stage-2-intermediate/07-react-basics/examples/)

### Modern Frontend - 现代前端
- [01-nextjs-app-router](./01-nextjs-app-router/examples/)
- [02-tailwind-css](./02-tailwind-css/examples/)
- [03-shadcn-design-system](./03-shadcn-design-system/examples/)
- [04-prisma-database](./04-prisma-database/examples/)
- [05-trpc-tanstack-query](./05-trpc-tanstack-query/examples/)
- [06-forms-validation](./06-forms-validation/examples/)
- [07-authentication](./07-authentication/examples/)
- [08-deployment-production](./08-deployment-production/examples/)

---

## 📚 额外资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [tRPC 文档](https://trpc.io/docs)
- [NextAuth.js 文档](https://next-auth.js.org)

### 学习平台
- [React Dev](https://react.dev/learn)
- [Next.js Learn](https://nextjs.org/learn)
- [Tailwind Play](https://play.tailwindcss.com)

---

**最后更新**: 2026-02-08
**版本**: 1.0.0
**维护者**: Frontend Learning Team

---

💡 **提示**: 这是一个活跃维护的学习资源，示例代码会持续更新以反映最新的最佳实践。
