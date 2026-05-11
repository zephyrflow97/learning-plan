# 博客管理系统 - 架构设计

## 数据模型 ER 图

```
┌─────────┐        ┌──────────┐        ┌─────┐
│  Post   │───────<│ PostTag  │>───────│ Tag │
└─────────┘        └──────────┘        └─────┘
```

**Post** (文章)
- id: Int (主键)
- title: String (标题)
- content: String (内容)
- published: Boolean (是否发布)
- createdAt: DateTime
- updatedAt: DateTime

**Tag** (标签)
- id: Int (主键)
- name: String (标签名,唯一)

**PostTag** (关联表)
- postId: Int (外键)
- tagId: Int (外键)

## 路由结构

```
/posts              - 文章列表(分页)
/posts/new          - 创建新文章
/posts/[id]         - 文章详情
/posts/[id]/edit    - 编辑文章
```

## 组件树

```
App
├── PostListPage
│   ├── PostCard
│   └── Pagination
├── PostDetailPage
│   ├── PostContent
│   └── TagList
├── PostCreatePage
│   └── PostForm
└── PostEditPage
    └── PostForm
```

## API 设计 (tRPC)

**查询 (Query)**:
- `post.getAll({ page, limit })` - 获取文章列表
- `post.getById({ id })` - 获取单篇文章
- `tag.getAll()` - 获取所有标签

**变更 (Mutation)**:
- `post.create({ title, content, tagIds })` - 创建文章
- `post.update({ id, title, content, tagIds })` - 更新文章
- `post.delete({ id })` - 删除文章
- `tag.create({ name })` - 创建标签

## 技术栈

- **前端**: Next.js 14 + React + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **表单**: React Hook Form + Zod
- **数据库**: Prisma + PostgreSQL
- **API**: tRPC
- **编辑器**: Markdown 编辑器 (react-markdown)
