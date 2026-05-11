'use client';

import { FixedSizeList as List } from 'react-window';

// 生成测试数据
const items = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  title: `项目 ${index + 1}`,
  description: `这是第 ${index + 1} 个项目的描述`,
}));

// 单个行组件
function Row({ index, style }: { index: number; style: React.CSSProperties }) {
  const item = items[index];

  return (
    <div
      style={{
        ...style,
        borderBottom: '1px solid #eee',
        padding: '10px',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{item.title}</div>
      <div style={{ fontSize: '14px', color: '#666' }}>{item.description}</div>
    </div>
  );
}

export default function VirtualList() {
  console.log('[虚拟滚动] 总数据量:', items.length);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>📜 虚拟滚动列表</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        共 {items.length.toLocaleString()} 条数据,但只渲染可见区域
      </p>

      <List
        height={600}          // 容器高度
        itemCount={items.length}  // 总数据量
        itemSize={80}         // 每行高度
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}
