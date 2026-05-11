# 基础路由示例

这个目录包含 Next.js App Router 的基础路由示例。

## 目录结构

```
basic-routing/
├── app/
│   ├── page.tsx                    # 首页 (/)
│   ├── about/
│   │   └── page.tsx                # 关于页面 (/about)
│   ├── blog/
│   │   ├── page.tsx                # 博客列表 (/blog)
│   │   └── [slug]/
│   │       └── page.tsx            # 博客详情 (/blog/hello-world)
│   ├── docs/
│   │   └── [...slug]/
│   │       └── page.tsx            # Catch-all 路由 (/docs/a/b/c)
│   └── dashboard/
│       ├── page.tsx                # 仪表盘首页 (/dashboard)
│       └── settings/
│           └── page.tsx            # 设置页面 (/dashboard/settings)
└── README.md
```

## 核心概念

### 1. 文件系统路由

在 Next.js App Router 中,**文件路径 = URL 路径**:

- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/page.tsx` → `/blog`

### 2. `page.tsx` 是必需的

只有包含 `page.tsx` 的目录才会成为可访问的路由:

```
app/
  components/           # ❌ 不是路由(没有 page.tsx)
  blog/
    page.tsx           # ✅ /blog
    utils.ts           # ❌ 不是路由
```

### 3. 动态路由

使用 `[参数名]` 创建动态路由:

```
app/blog/[slug]/page.tsx    # /blog/hello-world
                            # /blog/nextjs-guide
```

在组件中接收参数:

```typescript
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>文章: {params.slug}</h1>;
}
```

### 4. Catch-all 路由

使用 `[...参数名]` 捕获多层路径:

```
app/docs/[...slug]/page.tsx    # /docs/a
                                # /docs/a/b
                                # /docs/a/b/c
```

参数是数组:

```typescript
// /docs/a/b/c → params.slug = ['a', 'b', 'c']
```

## 相关文件

- **Layouts**: 查看 `examples/layouts/` 了解如何使用布局
- **Loading UI**: 查看 `examples/streaming/` 了解加载状态
- **Error Handling**: 查看主 README 的 Error Boundaries 部分

## 参考资料

- [Next.js 路由文档](https://nextjs.org/docs/app/building-your-application/routing)
- [动态路由](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
