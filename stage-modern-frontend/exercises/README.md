# 现代前端工程练习题集

> *"I hear and I forget. I see and I remember. I do and I understand."* — Confucius (孔子)
>
> 阅读教程让你*知道*这些技术,但只有亲手实现,你才能*理解*它们。这 28 道练习题是从"知道"到"理解"的桥梁。它们不是简单的"照着教程敲一遍代码"——每一题都有一个陷阱、一个需要你独立思考的决策点、或者一个让你必须翻阅文档的挑战。

---

## 📖 本文档结构

- **难度分布**: 基础 11 题 (40%) | 进阶 10 题 (35%) | 挑战 7 题 (25%)
- **章节覆盖**: CSS、React、Next.js、Tailwind、shadcn/ui、Prisma、tRPC、Forms、Authentication、Deployment
- **答案位置**: 所有完整答案代码在 [`solutions/`](./solutions/) 文件夹中
- **挑战题特色**: 包含架构设计思考题,要求你先画图/写文档再写代码

---

## 🧭 如何使用本练习集

> 🎭 **The Drama: 练习的三个陷阱**
>
> **陷阱一**: 直接看答案。这让你产生"我懂了"的幻觉,但你的手指没有肌肉记忆,大脑没有深度连接。
>
> **陷阱二**: 卡住不动。在一道题上死磕 5 小时,最后放弃,信心崩塌。
>
> **陷阱三**: 跳过基础题。"这太简单了,我肯定会"——然后在综合题里被基础细节反噬。
>
> **正确姿势**: (1) 先独立尝试 30-60 分钟。(2) 如果完全无头绪,看"提示"。(3) 再尝试 30 分钟。(4) 如果还是卡住,看答案的前半部分,然后合上答案,自己写后半部分。(5) 完成后,对比你的代码和答案的差异——这是最有价值的学习时刻。

**建议路径**:

- **新手**: 按顺序做所有基础题 → 选 3-5 道进阶题 → 挑战一道挑战题
- **有经验者**: 跳过明显会的基础题 → 做所有进阶题 → 做所有挑战题
- **求职准备**: 重点做挑战题(它们模拟真实面试题)

---

## 第一部分:基础练习 (11 题)

这些题目每道只聚焦一个技术点。如果你做这些题很轻松,说明你已经掌握了基础,可以跳到进阶题。

---

### 1. CSS Flexbox 三列布局 🟢

**难度**: 基础  
**章节**: CSS Fundamentals  
**技术点**: Flexbox、响应式设计

**题目描述**:

使用 Flexbox 实现一个三列布局:

- 左侧边栏固定 200px 宽
- 右侧边栏固定 200px 宽
- 中间内容区域自适应剩余空间
- 在屏幕宽度小于 768px 时,三列堆叠为单列(从上到下:左、中、右)

**要求**:

- 不使用 `float`
- 不使用 `position: absolute`
- 中间内容足够长时,页面应该可以滚动

<details>
<summary>💡 提示</summary>

- `flex-direction` 可以改变主轴方向
- `flex-basis` 或 `width` 设置固定宽度
- `flex: 1` 让元素占据剩余空间
- Media Query 的语法: `@media (max-width: 768px) { ... }`

</details>

💡 **查看答案**: [`solutions/css/01-flexbox-layout.html`](./solutions/css/01-flexbox-layout.html)

---

### 2. Grid 响应式图片画廊 🟢

**难度**: 基础  
**章节**: CSS Fundamentals  
**技术点**: CSS Grid、auto-fit、minmax

**题目描述**:

实现一个响应式图片画廊:

- 默认每行 4 张图片
- 每张图片宽度相等,高度自适应
- 当屏幕变窄时,自动调整为 3 列 → 2 列 → 1 列
- **不使用 Media Query**(使用 Grid 的自动响应特性)

<details>
<summary>💡 提示</summary>

- `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`
- `auto-fit` vs `auto-fill` 的区别?
- `object-fit: cover` 让图片填充容器

</details>

💡 **查看答案**: [`solutions/css/02-grid-gallery.html`](./solutions/css/02-grid-gallery.html)

---

### 3. React 计数器组件(带 localStorage 持久化) 🟢

**难度**: 基础  
**章节**: React Basics  
**技术点**: useState、useEffect、事件处理

**题目描述**:

创建一个计数器组件:

- 显示当前计数
- 有"+1"、"-1"、"重置"三个按钮
- 计数变化时自动保存到 `localStorage`
- 页面刷新后,计数不会丢失

<details>
<summary>💡 提示</summary>

- `localStorage.setItem('key', value)` 保存数据
- `localStorage.getItem('key')` 读取数据
- `useEffect` 在每次 count 变化时触发
- `useState` 的初始值可以是函数: `useState(() => { ... })`

</details>

💡 **查看答案**: [`solutions/react/03-counter.jsx`](./solutions/react/03-counter.jsx)

---

### 4. React 列表过滤器 🟢

**难度**: 基础  
**章节**: React Basics  
**技术点**: 列表渲染、条件渲染、状态管理

**题目描述**:

实现一个可搜索的用户列表:

- 显示用户列表(姓名、邮箱)
- 搜索框可以按姓名过滤
- 显示当前过滤结果数量
- 没有匹配时显示"无结果"

💡 **查看答案**: [`solutions/react/04-user-list.jsx`](./solutions/react/04-user-list.jsx)

---

### 5. Next.js 静态页面生成 🟢

**难度**: 基础  
**章节**: Next.js App Router  
**技术点**: 文件路由、Server Component、Metadata

**题目描述**:

创建一个关于页面:

- 路由: `/about`
- 纯静态内容(不需要数据获取)
- 设置页面 title 和 description

💡 **查看答案**: [`solutions/nextjs/05-about-page.tsx`](./solutions/nextjs/05-about-page.tsx)

---

### 6. Tailwind 卡片组件 🟢

**难度**: 基础  
**章节**: Tailwind CSS  
**技术点**: utility classes、hover 状态、阴影

**题目描述**:

用 Tailwind CSS 实现一个产品卡片:

- 图片 + 标题 + 描述 + 价格
- hover 时卡片提升(阴影加深)
- 响应式(移动端堆叠,桌面端横向)

💡 **查看答案**: [`solutions/tailwind/06-card-component.html`](./solutions/tailwind/06-card-component.html)

---

### 7. Prisma Schema 定义 🟢

**难度**: 基础  
**章节**: Prisma  
**技术点**: Schema 定义、关系、迁移

**题目描述**:

定义一个简单的博客数据模型:

- `User` 表:id、name、email(唯一)、createdAt
- `Post` 表:id、title、content、published、authorId(外键)、createdAt
- 一个用户可以有多篇文章(一对多关系)

💡 **查看答案**: 
- Schema: [`solutions/prisma/07-blog-schema.prisma`](./solutions/prisma/07-blog-schema.prisma)
- 使用示例: [`solutions/prisma/07-usage-example.ts`](./solutions/prisma/07-usage-example.ts)
- 迁移命令: [`solutions/prisma/07-migration-commands.sh`](./solutions/prisma/07-migration-commands.sh)

---

### 8. tRPC 简单查询 🟢

**难度**: 基础  
**章节**: tRPC  
**技术点**: tRPC Router、Procedure、Client

**题目描述**:

创建一个简单的 tRPC API:

- 定义一个 `hello` procedure,返回问候语
- 接受一个 `name` 参数
- 在客户端调用这个 procedure

💡 **查看答案**:
- 服务端: [`solutions/trpc/08-hello-procedure-server.ts`](./solutions/trpc/08-hello-procedure-server.ts)
- Router: [`solutions/trpc/08-hello-procedure-router.ts`](./solutions/trpc/08-hello-procedure-router.ts)
- 客户端: [`solutions/trpc/08-hello-procedure-client.ts`](./solutions/trpc/08-hello-procedure-client.ts)

---

### 9. React Hook Form 基础表单 🟢

**难度**: 基础  
**章节**: Forms + Validation  
**技术点**: React Hook Form、基本验证

**题目描述**:

使用 React Hook Form 创建一个登录表单:

- 邮箱和密码字段
- 邮箱验证(格式)
- 密码验证(最少 6 位)
- 显示错误信息

💡 **查看答案**: [`solutions/forms/09-login-form.tsx`](./solutions/forms/09-login-form.tsx)

---

### 10. Next.js 环境变量 🟢

**难度**: 基础  
**章节**: Deployment  
**技术点**: 环境变量、`.env` 文件、NEXT_PUBLIC_

**题目描述**:

配置并使用环境变量:

- 创建 `.env.local` 文件
- 定义 API URL(服务端用)
- 定义公开的站点名称(客户端用)
- 在代码中正确访问它们

💡 **查看答案**:
- .env 示例: [`solutions/deployment/10-env-local-example.txt`](./solutions/deployment/10-env-local-example.txt)
- 服务端: [`solutions/deployment/10-server-usage.tsx`](./solutions/deployment/10-server-usage.tsx)
- 客户端: [`solutions/deployment/10-client-usage.tsx`](./solutions/deployment/10-client-usage.tsx)

---

### 11. shadcn/ui 表单组件 🟢

**难度**: 基础  
**章节**: shadcn/ui + Forms  
**技术点**: shadcn Form、React Hook Form、Zod

**题目描述**:

使用 shadcn/ui 的 Form 组件创建一个注册表单:

- 用户名、邮箱、密码字段
- 使用 Zod schema 验证
- 集成 React Hook Form

💡 **查看答案**:
- 表单组件: [`solutions/shadcn/11-register-form.tsx`](./solutions/shadcn/11-register-form.tsx)
- 安装命令: [`solutions/shadcn/11-installation-commands.sh`](./solutions/shadcn/11-installation-commands.sh)

---

## 第二部分:进阶练习 (10 题)

这些题目需要整合多个技术点,模拟真实开发场景。

---

### 12. Next.js Server Actions 表单提交 🟡

**难度**: 进阶  
**章节**: Next.js + Forms  
**技术点**: Server Actions、FormData、revalidatePath

**题目描述**:

使用 Server Actions 实现一个"添加待办事项"表单:

- 表单提交调用 Server Action
- 数据保存到内存数组(或文件)
- 提交后刷新页面数据
- 显示 pending 状态

<details>
<summary>💡 提示</summary>

- Server Action 函数必须标记 `'use server'`
- `useFormStatus` hook 获取 pending 状态
- `revalidatePath('/')` 刷新页面数据

</details>

💡 **查看答案**:
- Server Actions: [`solutions/nextjs/12-server-actions-actions.ts`](./solutions/nextjs/12-server-actions-actions.ts)
- 页面组件: [`solutions/nextjs/12-server-actions-page.tsx`](./solutions/nextjs/12-server-actions-page.tsx)
- 表单组件: [`solutions/nextjs/12-server-actions-form.tsx`](./solutions/nextjs/12-server-actions-form.tsx)

---

### 13. Tailwind + React 响应式导航栏 🟡

**难度**: 进阶  
**章节**: Tailwind + React  
**技术点**: useState、响应式设计、动画

**题目描述**:

用 Tailwind + React 实现移动端汉堡菜单:

- 桌面端:水平菜单
- 移动端:汉堡图标,点击展开/收起菜单
- 展开时有平滑动画
- 点击菜单项后自动收起

💡 **查看答案**: [`solutions/tailwind/13-navbar.tsx`](./solutions/tailwind/13-navbar.tsx)

---

### 14. Prisma + Next.js API 路由 🟡

**难度**: 进阶  
**章节**: Prisma + Next.js  
**技术点**: API Route、Prisma Client、错误处理

**题目描述**:

创建一个 RESTful API 获取用户列表:

- GET `/api/users` - 获取所有用户
- GET `/api/users/[id]` - 获取单个用户
- 包含错误处理(用户不存在 → 404)
- 使用 Prisma 查询数据库

💡 **查看答案**:
- Prisma Client: [`solutions/prisma/14-prisma-client.ts`](./solutions/prisma/14-prisma-client.ts)
- 获取所有用户: [`solutions/prisma/14-api-users-route.ts`](./solutions/prisma/14-api-users-route.ts)
- 获取单个用户: [`solutions/prisma/14-api-user-by-id-route.ts`](./solutions/prisma/14-api-user-by-id-route.ts)

---

### 15. tRPC + Prisma 完整 CRUD 🟡

**难度**: 进阶  
**章节**: tRPC + Prisma  
**技术点**: tRPC Mutation、Prisma 事务、类型安全

**题目描述**:

创建一个完整的文章 CRUD API:

- `createPost` - 创建文章(mutation)
- `getPosts` - 获取所有文章(query)
- `updatePost` - 更新文章(mutation)
- `deletePost` - 删除文章(mutation)

💡 **查看答案**:
- tRPC Router: [`solutions/trpc/15-post-crud-router.ts`](./solutions/trpc/15-post-crud-router.ts)
- 客户端使用: [`solutions/trpc/15-post-crud-client.tsx`](./solutions/trpc/15-post-crud-client.tsx)

---

### 16. React Hook Form + Zod 动态表单 🟡

**难度**: 进阶  
**章节**: Forms + Validation  
**技术点**: 动态字段、useFieldArray、复杂验证

**题目描述**:

创建一个"添加多个标签"的表单:

- 初始显示 1 个标签输入框
- 点击"添加标签"按钮增加输入框
- 点击"删除"按钮移除输入框
- 验证:标签不能为空,不能重复

💡 **查看答案**: [`solutions/forms/16-dynamic-tags-form.tsx`](./solutions/forms/16-dynamic-tags-form.tsx)

---

### 17. Next.js + Prisma + tRPC 分页查询 🟡

**难度**: 进阶  
**章节**: Next.js + Prisma + tRPC  
**技术点**: 分页、Cursor Pagination、性能优化

**题目描述**:

实现一个分页的文章列表:

- 使用 Cursor-based Pagination(而非 offset)
- 每页 10 条记录
- 返回"是否有下一页"的标志
- 在客户端实现"加载更多"按钮

💡 **查看答案**:
- tRPC Router: [`solutions/trpc/17-pagination-router.ts`](./solutions/trpc/17-pagination-router.ts)
- 客户端使用: [`solutions/trpc/17-pagination-client.tsx`](./solutions/trpc/17-pagination-client.tsx)

---

### 18. shadcn/ui + Tailwind 暗黑模式切换 🟡

**难度**: 进阶  
**章节**: shadcn/ui + Tailwind  
**技术点**: dark 模式、ThemeProvider、Context API

**题目描述**:

实现一个完整的主题系统:

- 明亮/暗黑/系统主题三种选择
- 使用 `next-themes` 库
- 主题选择保存到 localStorage
- shadcn/ui 组件自动适配主题

💡 **查看答案**:
- Theme Provider: [`solutions/shadcn/18-theme-provider.tsx`](./solutions/shadcn/18-theme-provider.tsx)
- Layout: [`solutions/shadcn/18-theme-layout.tsx`](./solutions/shadcn/18-theme-layout.tsx)
- 切换组件: [`solutions/shadcn/18-theme-toggle.tsx`](./solutions/shadcn/18-theme-toggle.tsx)
- 使用示例: [`solutions/shadcn/18-theme-usage.tsx`](./solutions/shadcn/18-theme-usage.tsx)

---

### 19. 服务端 + 客户端数据同步 🟡

**难度**: 进阶  
**章节**: Next.js + tRPC  
**技术点**: Server Component、Client Component、数据流

**题目描述**:

实现一个混合渲染的页面:

- Server Component 获取初始数据(SSR)
- Client Component 可以实时刷新数据
- 点击"刷新"按钮重新获取数据
- 显示数据获取时间

💡 **查看答案**:
- tRPC Router: [`solutions/nextjs/19-hybrid-router.ts`](./solutions/nextjs/19-hybrid-router.ts)
- Server Component: [`solutions/nextjs/19-hybrid-page.tsx`](./solutions/nextjs/19-hybrid-page.tsx)
- Client Component: [`solutions/nextjs/19-hybrid-client.tsx`](./solutions/nextjs/19-hybrid-client.tsx)

---

### 20. Optimistic Updates (乐观更新) 🟡

**难度**: 进阶  
**章节**: tRPC + TanStack Query  
**技术点**: 乐观更新、错误回滚、UX 优化

**题目描述**:

实现一个带乐观更新的点赞功能:

- 点击立即更新 UI(不等待服务器响应)
- 如果请求失败,回滚到原来的状态
- 显示错误提示

💡 **查看答案**:
- tRPC Router: [`solutions/trpc/20-optimistic-router.ts`](./solutions/trpc/20-optimistic-router.ts)
- 客户端实现: [`solutions/trpc/20-optimistic-client.tsx`](./solutions/trpc/20-optimistic-client.tsx)

---

### 21. Next.js Middleware 权限控制 🟡

**难度**: 进阶  
**章节**: Next.js + Authentication  
**技术点**: Middleware、JWT 验证、路由保护

**题目描述**:

实现一个 Middleware:

- 保护 `/dashboard/*` 路由(需要登录)
- 未登录重定向到 `/login`
- 已登录访问 `/login` 重定向到 `/dashboard`
- 验证 JWT token

💡 **查看答案**:
- Middleware: [`solutions/auth/21-middleware.ts`](./solutions/auth/21-middleware.ts)
- 登录页面: [`solutions/auth/21-login-page.tsx`](./solutions/auth/21-login-page.tsx)
- Dashboard: [`solutions/auth/21-dashboard-page.tsx`](./solutions/auth/21-dashboard-page.tsx)

---

## 第三部分:挑战练习 (7 题)

这些题目模拟真实项目场景,需要架构设计 + 完整实现。

---

### 22. 完整 CRUD 应用:博客管理系统 🔴

**难度**: 挑战  
**章节**: 综合(Next.js + Prisma + tRPC + Forms)  
**技术点**: 架构设计、CRUD、关系查询、表单验证

**题目描述**:

从零实现一个博客管理系统:

**功能需求**:

- 文章列表(分页)
- 文章详情
- 创建/编辑/删除文章
- Markdown 编辑器
- 标签系统(多对多关系)

**技术要求**:

- Prisma 定义数据模型
- tRPC 实现 API
- React Hook Form + Zod 表单验证
- shadcn/ui 组件库

**架构设计要求**:

在写代码前,先绘制:

1. 数据模型 ER 图
2. 路由结构
3. 组件树
4. API 设计

💡 **查看答案**:
- Prisma Schema: [`solutions/challenges/22-blog-system-schema.prisma`](./solutions/challenges/22-blog-system-schema.prisma)
- tRPC Router: [`solutions/challenges/22-blog-system-router.ts`](./solutions/challenges/22-blog-system-router.ts)
- 架构设计: [`solutions/challenges/22-blog-system-architecture.md`](./solutions/challenges/22-blog-system-architecture.md)

---

### 23. 实时聊天应用(WebSocket) 🔴

**难度**: 挑战  
**章节**: 综合(Next.js + WebSocket + Database)  
**技术点**: WebSocket、实时通信、消息持久化

**题目描述**:

实现一个简单的聊天室:

- 实时消息发送/接收
- 消息持久化到数据库
- 在线用户列表
- 输入状态提示("XXX 正在输入...")

<details>
<summary>💡 提示</summary>

- 使用 `socket.io` 库
- Next.js API Route 作为 WebSocket 服务器
- Prisma 存储消息历史

</details>

💡 **查看答案**: [`solutions/challenges/23-chat-app-architecture.md`](./solutions/challenges/23-chat-app-architecture.md)

---

### 24. 用户认证系统(完整实现) 🔴

**难度**: 挑战  
**章节**: Authentication + Forms + Database  
**技术点**: NextAuth、密码哈希、Session 管理、RBAC

**题目描述**:

实现一个完整的用户认证系统:

- 邮箱密码注册/登录
- OAuth (GitHub/Google)
- 邮箱验证
- 密码重置
- 角色权限控制(Admin/User)

💡 **查看答案**:
- Prisma Schema: [`solutions/challenges/24-auth-system-schema.prisma`](./solutions/challenges/24-auth-system-schema.prisma)
- 架构设计: [`solutions/challenges/24-auth-system-architecture.md`](./solutions/challenges/24-auth-system-architecture.md)

---

### 25. 图片上传与处理 🔴

**难度**: 挑战  
**章节**: Next.js + File Handling  
**技术点**: 文件上传、图片处理、S3 存储、CDN

**题目描述**:

实现图片上传功能:

- 拖拽上传
- 预览
- 图片压缩(客户端)
- 上传到 S3/Cloudinary
- 生成缩略图

💡 **查看答案**:
- 客户端组件: [`solutions/challenges/25-image-upload-client.tsx`](./solutions/challenges/25-image-upload-client.tsx)
- API Route: [`solutions/challenges/25-image-upload-api.ts`](./solutions/challenges/25-image-upload-api.ts)
- 安装命令: [`solutions/challenges/25-image-upload-install.sh`](./solutions/challenges/25-image-upload-install.sh)

---

### 26. 搜索与过滤系统 🔴

**难度**: 挑战  
**章节**: Prisma + Next.js  
**技术点**: 全文搜索、复杂查询、性能优化

**题目描述**:

实现一个商品搜索系统:

- 关键词搜索(标题+描述)
- 多条件过滤(分类、价格区间、标签)
- 排序(价格、销量、时间)
- 分页

💡 **查看答案**:
- tRPC Router: [`solutions/challenges/26-search-filter-router.ts`](./solutions/challenges/26-search-filter-router.ts)
- 性能优化: [`solutions/challenges/26-search-filter-optimization.md`](./solutions/challenges/26-search-filter-optimization.md)

---

### 27. 数据导出功能(CSV/Excel) 🔴

**难度**: 挑战  
**章节**: Next.js + File Handling  
**技术点**: CSV 生成、Excel 生成、流式下载

**题目描述**:

实现用户数据导出功能:

- 导出为 CSV 格式
- 导出为 Excel 格式
- 支持大数据量(流式导出)
- 后台任务(避免阻塞)

💡 **查看答案**:
- CSV 导出: [`solutions/challenges/27-data-export-csv.ts`](./solutions/challenges/27-data-export-csv.ts)
- Excel 导出: [`solutions/challenges/27-data-export-excel.ts`](./solutions/challenges/27-data-export-excel.ts)
- 客户端组件: [`solutions/challenges/27-data-export-client.tsx`](./solutions/challenges/27-data-export-client.tsx)

---

### 28. 性能优化挑战:虚拟滚动 🔴

**难度**: 挑战  
**章节**: React 性能优化  
**技术点**: 虚拟滚动、React.memo、useMemo

**题目描述**:

实现一个高性能的虚拟滚动列表:

- 渲染 10,000 条数据
- 只渲染可见区域的元素
- 平滑滚动
- 动态高度支持

<details>
<summary>💡 提示</summary>

- 使用 `react-window` 或 `react-virtual` 库
- 或自己实现(计算可见区域,动态渲染)

</details>

💡 **查看答案**:
- react-window 实现: [`solutions/challenges/28-virtual-scroll-react-window.tsx`](./solutions/challenges/28-virtual-scroll-react-window.tsx)
- 自定义实现: [`solutions/challenges/28-virtual-scroll-custom.tsx`](./solutions/challenges/28-virtual-scroll-custom.tsx)

---

## 📚 答案文件夹结构

所有答案代码都在 [`solutions/`](./solutions/) 文件夹中,按章节组织:

```
solutions/
├── README.md                    # 答案索引总览
├── css/                         # CSS 练习答案(1-2题)
│   ├── README.md
│   ├── 01-flexbox-layout.html
│   └── 02-grid-gallery.html
├── react/                       # React 练习答案(3-4题)
│   ├── README.md
│   ├── 03-counter.jsx
│   └── 04-user-list.jsx
├── nextjs/                      # Next.js 练习答案(5,12,19题)
│   └── README.md
├── tailwind/                    # Tailwind 练习答案(6,13题)
│   └── README.md
├── shadcn/                      # shadcn/ui 练习答案(11,18题)
│   └── README.md
├── prisma/                      # Prisma 练习答案(7,14题)
│   └── README.md
├── trpc/                        # tRPC 练习答案(8,15,17,20题)
│   └── README.md
├── forms/                       # Forms 练习答案(9,16题)
│   └── README.md
├── auth/                        # Authentication 练习答案(21题)
│   └── README.md
├── deployment/                  # Deployment 练习答案(10题)
│   └── README.md
└── challenges/                  # 挑战题答案(22-28题)
    └── README.md (见 solutions/README.md)
```

每个子文件夹都有自己的 README.md,包含:
- 该类别的练习题列表
- 核心概念讲解
- 最佳实践
- 相关学习资源

---

## 总结

> 🧘 **Zen of Practice**
>
> 编程能力的提升不是线性的。你可能在基础题上花 10 分钟,在挑战题上卡 3 天。这是正常的。
>
> 真正的学习发生在**卡住的时刻**——当你盯着代码看了 2 小时,突然灵光一现的那个瞬间。那不是偶然,那是你的大脑在建立新的神经连接。
>
> 不要跳过基础题。不要直接看答案。不要害怕挑战题。
>
> 你的目标不是"做完这些题",而是**成为能独立解决这些问题的人**。

**下一步**:

- 做完所有题目后,尝试**自己设计一个综合项目**
- 参考 `projects/dashboard-app/` 实现一个完整应用
- 阅读优秀开源项目的源码
- 贡献代码到开源社区

祝你练习愉快! 🚀
