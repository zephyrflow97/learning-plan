'use client';

import { useState, useRef, useEffect } from 'react';

export default function CustomVirtualList() {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemHeight = 80;
  const containerHeight = 600;
  const totalItems = 10000;

  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  );

  const visibleItems = Array.from(
    { length: endIndex - startIndex },
    (_, i) => startIndex + i
  );

  console.log('[虚拟滚动] 渲染:', startIndex, '-', endIndex);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1>自定义虚拟滚动</h1>

      <div
        ref={containerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{
          height: containerHeight,
          overflow: 'auto',
          border: '1px solid #ccc',
          position: 'relative',
        }}
      >
        {/* 占位容器(撑开滚动条) */}
        <div style={{ height: totalItems * itemHeight }} />

        {/* 可见元素 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${startIndex * itemHeight}px)`,
          }}
        >
          {visibleItems.map(index => (
            <div
              key={index}
              style={{
                height: itemHeight,
                borderBottom: '1px solid #eee',
                padding: '10px',
              }}
            >
              项目 {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
