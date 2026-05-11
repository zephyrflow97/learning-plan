# 现代前端工程练习题 - 答案索引

> 本文件夹包含所有 28 道练习题的完整答案代码,按章节组织。每个文件都包含详细的注释和日志输出,帮助你理解代码的执行流程。

---

## 📁 文件夹结构

```
solutions/
├── css/              # CSS 练习答案
├── react/            # React 练习答案
├── nextjs/           # Next.js 练习答案
├── tailwind/         # Tailwind 练习答案
├── shadcn/           # shadcn/ui 练习答案
├── prisma/           # Prisma 练习答案
├── trpc/             # tRPC 练习答案
├── forms/            # Forms 练习答案
├── auth/             # Authentication 练习答案
├── deployment/       # Deployment 练习答案
└── challenges/       # 综合挑战题答案
```

---

## 📚 基础练习 (1-11)

### 1. CSS Flexbox 三列布局
- **文件**: [`css/01-flexbox-layout.html`](./css/01-flexbox-layout.html)
- **技术点**: Flexbox、响应式设计、Media Query
- **说明**: 完整的 HTML 文件,可直接在浏览器中打开查看效果

### 2. Grid 响应式图片画廊
- **文件**: [`css/02-grid-gallery.html`](./css/02-grid-gallery.html)
- **技术点**: CSS Grid、auto-fit、minmax
- **说明**: 无需 Media Query 的自动响应式布局

### 3. React 计数器组件
- **文件**: [`react/03-counter.jsx`](./react/03-counter.jsx)
- **技术点**: useState、useEffect、localStorage
- **说明**: 带持久化的计数器,刷新页面不丢失数据

### 4. React 列表过滤器
- **文件**: [`react/04-user-list.jsx`](./react/04-user-list.jsx)
- **技术点**: 列表渲染、条件渲染、状态管理
- **说明**: 实时搜索过滤用户列表

### 5. Next.js 静态页面生成
- **文件**: [`nextjs/05-about-page.tsx`](./nextjs/05-about-page.tsx)
- **技术点**: 文件路由、Server Component、Metadata
- **说明**: 简单的关于页面,展示 Next.js 基础用法

### 6. Tailwind 卡片组件
- **文件**: [`tailwind/06-card-component.html`](./tailwind/06-card-component.html)
- **技术点**: utility classes、hover 状态、响应式
- **说明**: 使用 CDN 版本的 Tailwind,可直接打开查看

### 7. Prisma Schema 定义
- **文件**: 
  - [`prisma/07-blog-schema.prisma`](./prisma/07-blog-schema.prisma) - Schema 定义
  - [`prisma/07-usage-example.ts`](./prisma/07-usage-example.ts) - 使用示例
  - [`prisma/07-migration-commands.sh`](./prisma/07-migration-commands.sh) - 迁移命令
- **技术点**: Schema 定义、关系、迁移
- **说明**: 简单的博客数据模型

### 8. tRPC 简单查询
- **文件**:
  - [`trpc/08-hello-procedure-server.ts`](./trpc/08-hello-procedure-server.ts) - 服务端初始化
  - [`trpc/08-hello-procedure-router.ts`](./trpc/08-hello-procedure-router.ts) - API Router
  - [`trpc/08-hello-procedure-client.ts`](./trpc/08-hello-procedure-client.ts) - 客户端调用
- **技术点**: tRPC Router、Procedure、类型安全
- **说明**: 最简单的 tRPC 示例

### 9. React Hook Form 基础表单
- **文件**: [`forms/09-login-form.tsx`](./forms/09-login-form.tsx)
- **技术点**: React Hook Form、基本验证
- **说明**: 登录表单,包含邮箱和密码验证

### 10. Next.js 环境变量
- **文件**:
  - [`deployment/10-env-local-example.txt`](./deployment/10-env-local-example.txt) - .env.local 示例
  - [`deployment/10-server-usage.tsx`](./deployment/10-server-usage.tsx) - 服务端使用
  - [`deployment/10-client-usage.tsx`](./deployment/10-client-usage.tsx) - 客户端使用
- **技术点**: 环境变量、NEXT_PUBLIC_
- **说明**: 展示服务端和客户端如何正确访问环境变量

### 11. shadcn/ui 表单组件
- **文件**:
  - [`shadcn/11-register-form.tsx`](./shadcn/11-register-form.tsx) - 注册表单
  - [`shadcn/11-installation-commands.sh`](./shadcn/11-installation-commands.sh) - 安装命令
- **技术点**: shadcn Form、React Hook Form、Zod
- **说明**: 使用 shadcn/ui 的完整表单示例

---

## 🔥 进阶练习 (12-21)

### 12. Next.js Server Actions 表单提交
- **文件**:
  - [`nextjs/12-server-actions-actions.ts`](./nextjs/12-server-actions-actions.ts) - Server Action
  - [`nextjs/12-server-actions-page.tsx`](./nextjs/12-server-actions-page.tsx) - 页面组件
  - [`nextjs/12-server-actions-form.tsx`](./nextjs/12-server-actions-form.tsx) - 表单组件
- **技术点**: Server Actions、FormData、revalidatePath
- **说明**: 完整的待办事项添加功能,展示 Server Actions 用法

### 13. Tailwind + React 响应式导航栏
- **文件**: [`tailwind/13-navbar.tsx`](./tailwind/13-navbar.tsx)
- **技术点**: useState、响应式设计、动画
- **说明**: 带汉堡菜单的响应式导航栏

### 14. Prisma + Next.js API 路由
- **文件**:
  - [`prisma/14-prisma-client.ts`](./prisma/14-prisma-client.ts) - Prisma Client 单例
  - [`prisma/14-api-users-route.ts`](./prisma/14-api-users-route.ts) - 获取所有用户
  - [`prisma/14-api-user-by-id-route.ts`](./prisma/14-api-user-by-id-route.ts) - 获取单个用户
- **技术点**: API Route、Prisma Client、错误处理
- **说明**: RESTful API 完整实现

### 15. tRPC + Prisma 完整 CRUD
- **文件**:
  - [`trpc/15-post-crud-router.ts`](./trpc/15-post-crud-router.ts) - tRPC Router
  - [`trpc/15-post-crud-client.tsx`](./trpc/15-post-crud-client.tsx) - 客户端使用
- **技术点**: tRPC Mutation、Prisma 事务、类型安全
- **说明**: 完整的文章 CRUD 操作

### 16. React Hook Form 动态表单
- **文件**: [`forms/16-dynamic-tags-form.tsx`](./forms/16-dynamic-tags-form.tsx)
- **技术点**: 动态字段、useFieldArray、复杂验证
- **说明**: 可动态添加/删除的标签输入表单

### 17. Next.js + Prisma + tRPC 分页查询
- **文件**:
  - [`trpc/17-pagination-router.ts`](./trpc/17-pagination-router.ts) - 分页 Router
  - [`trpc/17-pagination-client.tsx`](./trpc/17-pagination-client.tsx) - 客户端使用
- **技术点**: Cursor Pagination、性能优化
- **说明**: 使用 Cursor-based Pagination 的分页查询

### 18. shadcn/ui + Tailwind 暗黑模式切换
- **文件**:
  - [`shadcn/18-theme-provider.tsx`](./shadcn/18-theme-provider.tsx) - Theme Provider
  - [`shadcn/18-theme-layout.tsx`](./shadcn/18-theme-layout.tsx) - Layout 配置
  - [`shadcn/18-theme-toggle.tsx`](./shadcn/18-theme-toggle.tsx) - 切换组件
  - [`shadcn/18-theme-usage.tsx`](./shadcn/18-theme-usage.tsx) - 使用示例
  - [`shadcn/18-installation-commands.sh`](./shadcn/18-installation-commands.sh) - 安装命令
- **技术点**: dark 模式、ThemeProvider、next-themes
- **说明**: 完整的主题系统实现

### 19. 服务端 + 客户端数据同步
- **文件**:
  - [`nextjs/19-hybrid-router.ts`](./nextjs/19-hybrid-router.ts) - tRPC Router
  - [`nextjs/19-hybrid-page.tsx`](./nextjs/19-hybrid-page.tsx) - Server Component
  - [`nextjs/19-hybrid-client.tsx`](./nextjs/19-hybrid-client.tsx) - Client Component
- **技术点**: Server Component、Client Component、数据流
- **说明**: 展示服务端渲染和客户端交互的结合

### 20. Optimistic Updates (乐观更新)
- **文件**:
  - [`trpc/20-optimistic-router.ts`](./trpc/20-optimistic-router.ts) - tRPC Router
  - [`trpc/20-optimistic-client.tsx`](./trpc/20-optimistic-client.tsx) - 客户端实现
- **技术点**: 乐观更新、错误回滚、UX 优化
- **说明**: 点赞功能的乐观更新实现,包含错误回滚

### 21. Next.js Middleware 权限控制
- **文件**:
  - [`auth/21-middleware.ts`](./auth/21-middleware.ts) - Middleware
  - [`auth/21-login-page.tsx`](./auth/21-login-page.tsx) - 登录页面
  - [`auth/21-dashboard-page.tsx`](./auth/21-dashboard-page.tsx) - Dashboard 页面
- **技术点**: Middleware、JWT 验证、路由保护
- **说明**: 简单的路由权限控制实现

---

## 💪 挑战练习 (22-28)

### 22. 完整 CRUD 应用:博客管理系统
- **文件**:
  - [`challenges/22-blog-system-schema.prisma`](./challenges/22-blog-system-schema.prisma) - Prisma Schema
  - [`challenges/22-blog-system-router.ts`](./challenges/22-blog-system-router.ts) - tRPC Router
  - [`challenges/22-blog-system-architecture.md`](./challenges/22-blog-system-architecture.md) - 架构设计文档
- **技术点**: 架构设计、CRUD、关系查询、表单验证
- **说明**: 完整的博客管理系统架构设计和核心代码

### 23. 实时聊天应用 (WebSocket)
- **文件**:
  - [`challenges/23-chat-app-architecture.md`](./challenges/23-chat-app-architecture.md) - 架构设计文档
- **技术点**: WebSocket、实时通信、消息持久化
- **说明**: 完整的聊天应用架构设计,包含数据模型和组件设计

### 24. 用户认证系统 (完整实现)
- **文件**:
  - [`challenges/24-auth-system-schema.prisma`](./challenges/24-auth-system-schema.prisma) - Prisma Schema
  - [`challenges/24-auth-system-architecture.md`](./challenges/24-auth-system-architecture.md) - 架构设计文档
- **技术点**: NextAuth、密码哈希、Session 管理、RBAC
- **说明**: 完整的认证系统架构,包含 OAuth 和邮箱验证

### 25. 图片上传与处理
- **文件**:
  - [`challenges/25-image-upload-client.tsx`](./challenges/25-image-upload-client.tsx) - 客户端组件
  - [`challenges/25-image-upload-api.ts`](./challenges/25-image-upload-api.ts) - API Route
  - [`challenges/25-image-upload-install.sh`](./challenges/25-image-upload-install.sh) - 安装命令
- **技术点**: 文件上传、图片处理、S3 存储
- **说明**: 支持拖拽上传和预览的图片上传功能

### 26. 搜索与过滤系统
- **文件**:
  - [`challenges/26-search-filter-router.ts`](./challenges/26-search-filter-router.ts) - tRPC Router
  - [`challenges/26-search-filter-optimization.md`](./challenges/26-search-filter-optimization.md) - 性能优化文档
- **技术点**: 全文搜索、复杂查询、性能优化
- **说明**: 完整的商品搜索系统,包含索引优化和缓存策略

### 27. 数据导出功能 (CSV/Excel)
- **文件**:
  - [`challenges/27-data-export-csv.ts`](./challenges/27-data-export-csv.ts) - CSV 导出
  - [`challenges/27-data-export-excel.ts`](./challenges/27-data-export-excel.ts) - Excel 导出
  - [`challenges/27-data-export-client.tsx`](./challenges/27-data-export-client.tsx) - 客户端组件
  - [`challenges/27-data-export-install.sh`](./challenges/27-data-export-install.sh) - 安装命令
- **技术点**: CSV 生成、Excel 生成、流式下载
- **说明**: 支持 CSV 和 Excel 两种格式的数据导出

### 28. 性能优化挑战:虚拟滚动
- **文件**:
  - [`challenges/28-virtual-scroll-react-window.tsx`](./challenges/28-virtual-scroll-react-window.tsx) - react-window 实现
  - [`challenges/28-virtual-scroll-custom.tsx`](./challenges/28-virtual-scroll-custom.tsx) - 自定义实现
  - [`challenges/28-virtual-scroll-install.sh`](./challenges/28-virtual-scroll-install.sh) - 安装命令
- **技术点**: 虚拟滚动、React.memo、useMemo
- **说明**: 两种虚拟滚动实现,可渲染 10,000+ 条数据

---

## 🎯 使用建议

1. **阅读答案前先尝试**: 不要直接看答案,先独立尝试 30-60 分钟
2. **对比差异**: 完成后,对比你的代码和答案的差异,找出可以改进的地方
3. **运行代码**: 将答案代码复制到项目中运行,观察日志输出
4. **修改实验**: 尝试修改代码,理解每个部分的作用
5. **举一反三**: 基于答案代码,尝试实现类似的功能

---

## 📖 章节对应关系

| 章节 | 练习题编号 | 文件夹 |
|------|-----------|--------|
| CSS Fundamentals | 1-2 | `css/` |
| React Basics | 3-4 | `react/` |
| Next.js App Router | 5, 12, 17, 19 | `nextjs/` |
| Tailwind CSS | 6, 13 | `tailwind/` |
| shadcn/ui | 11, 18 | `shadcn/` |
| Prisma | 7, 14 | `prisma/` |
| tRPC | 8, 15, 17, 20 | `trpc/` |
| Forms + Validation | 9, 16 | `forms/` |
| Authentication | 21, 24 | `auth/` |
| Deployment | 10 | `deployment/` |
| 综合挑战 | 22-28 | `challenges/` |

---

## 🔍 快速查找

**按技术栈查找**:
- **React**: 3, 4, 13, 16, 28
- **Next.js**: 5, 10, 12, 14, 17, 19, 21
- **TypeScript**: 大部分练习题
- **Prisma**: 7, 14, 15, 17, 22, 24, 26
- **tRPC**: 8, 15, 17, 19, 20, 22, 26
- **Forms**: 9, 11, 12, 16
- **CSS**: 1, 2, 6, 13, 18

**按难度查找**:
- **基础**: 1-11
- **进阶**: 12-21
- **挑战**: 22-28

---

## 💡 提示

- 所有 `.sh` 文件包含安装命令,需要在对应的项目中运行
- 所有 `.md` 文件包含架构设计和说明文档
- HTML 文件可以直接在浏览器中打开
- TypeScript/JavaScript 文件需要在 Next.js 或 React 项目中使用

祝你学习愉快! 🚀
