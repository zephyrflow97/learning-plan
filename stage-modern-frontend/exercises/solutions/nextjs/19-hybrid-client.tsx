// app/hybrid-demo/ClientRefresher.tsx

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function ClientRefresher({
  initialData,
}: {
  initialData: { time: string; random: number };
}) {
  const [clientData, setClientData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { refetch } = trpc.data.getCurrentTime.useQuery(undefined, {
    enabled: false, // 不自动获取,只在手动触发时获取
  });

  const handleRefresh = async () => {
    console.log('[客户端] 手动刷新数据');
    setIsRefreshing(true);

    const result = await refetch();
    
    if (result.data) {
      setClientData(result.data);
      console.log('[客户端] 数据刷新成功:', result.data);
    }

    setIsRefreshing(false);
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f3e5f5',
      borderRadius: '8px',
    }}>
      <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>
        客户端数据 (CSR)
      </h2>
      <p><strong>时间:</strong> {clientData.time}</p>
      <p><strong>随机数:</strong> {clientData.random}</p>

      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        style={{
          marginTop: '15px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: isRefreshing ? '#ccc' : '#9c27b0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRefreshing ? 'not-allowed' : 'pointer',
        }}
      >
        {isRefreshing ? '刷新中...' : '🔄 刷新数据'}
      </button>

      <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
        ℹ️ 点击按钮实时获取最新数据,无需刷新页面
      </p>
    </div>
  );
}
