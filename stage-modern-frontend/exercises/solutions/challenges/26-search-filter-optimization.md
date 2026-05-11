# 搜索与过滤系统 - 性能优化

## 数据库优化

### 1. 创建索引

```prisma
model Product {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(255)
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  categoryId  Int
  createdAt   DateTime @default(now())

  @@index([title])              # 标题索引
  @@index([price])              # 价格索引
  @@index([categoryId])         # 分类索引
  @@index([createdAt])          # 时间索引
  @@index([title, categoryId])  # 复合索引
}
```

### 2. 全文搜索

**PostgreSQL 全文搜索**:

```sql
-- 添加全文搜索列
ALTER TABLE "Product" ADD COLUMN "search_vector" tsvector;

-- 创建索引
CREATE INDEX product_search_idx ON "Product" USING GIN(search_vector);

-- 更新搜索向量
UPDATE "Product" SET search_vector = 
  to_tsvector('chinese', coalesce(title, '') || ' ' || coalesce(description, ''));

-- 触发器自动更新
CREATE TRIGGER product_search_update BEFORE INSERT OR UPDATE
ON "Product" FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.chinese', title, description);
```

**Prisma 查询**:

```ts
const products = await prisma.$queryRaw`
  SELECT * FROM "Product"
  WHERE search_vector @@ to_tsquery('chinese', ${keyword})
  ORDER BY ts_rank(search_vector, to_tsquery('chinese', ${keyword})) DESC
  LIMIT ${limit} OFFSET ${skip}
`;
```

### 3. Elasticsearch 集成

```ts
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

// 索引文档
await client.index({
  index: 'products',
  document: {
    title: product.title,
    description: product.description,
    price: product.price,
  },
});

// 搜索
const result = await client.search({
  index: 'products',
  query: {
    multi_match: {
      query: keyword,
      fields: ['title^2', 'description'],
    },
  },
});
```

## 缓存策略

### 1. Redis 缓存

```ts
import { Redis } from 'ioredis';

const redis = new Redis();

// 缓存热门搜索结果
const cacheKey = `search:${JSON.stringify(searchParams)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const results = await performSearch(searchParams);
await redis.setex(cacheKey, 60, JSON.stringify(results)); // 缓存 60 秒

return results;
```

### 2. Next.js 缓存

```ts
// 使用 React Cache
import { cache } from 'react';

export const getProducts = cache(async (params) => {
  return await prisma.product.findMany(params);
});
```

## 前端优化

### 1. 防抖搜索

```tsx
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback((keyword: string) => {
  setSearchKeyword(keyword);
}, 500); // 500ms 防抖
```

### 2. 虚拟滚动

对于大量搜索结果,使用虚拟滚动:

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={products.length}
  itemSize={100}
>
  {({ index, style }) => (
    <ProductItem product={products[index]} style={style} />
  )}
</FixedSizeList>
```
