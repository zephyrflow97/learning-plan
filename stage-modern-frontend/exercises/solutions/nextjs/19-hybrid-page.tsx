// app/hybrid-demo/page.tsx

import { prisma } from '@/lib/prisma';
import ClientRefresher from './ClientRefresher';

export default async function HybridDemoPage() {
  // 在服务端获取初始数据
  const serverData = {
    time: new Date().toISOString(),
    random: Math.floor(Math.random() * 1000),
  };

  console.log('[Server Component] 初始数据:', serverData);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        🔄 服务端 + 客户端混合渲染
      </h1>

      {/* 服务端数据展示 */}
      <div style={{
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>
          服务端数据 (SSR)
        </h2>
        <p><strong>时间:</strong> {serverData.time}</p>
        <p><strong>随机数:</strong> {serverData.random}</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          ℹ️ 这些数据在服务端生成,页面刷新才会更新
        </p>
      </div>

      {/* 客户端刷新组件 */}
      <ClientRefresher initialData={serverData} />
    </div>
  );
}
