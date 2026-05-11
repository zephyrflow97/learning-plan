// app/about/page.tsx

import { Metadata } from 'next';

// 生成静态 metadata
export const metadata: Metadata = {
  title: '关于我们',
  description: '了解我们的团队和使命',
};

export default function AboutPage() {
  console.log('[渲染] 关于页面');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>
        关于我们
      </h1>

      <p style={{ lineHeight: '1.8', fontSize: '18px', marginBottom: '20px' }}>
        我们是一支充满激情的团队,致力于打造最好的产品。
      </p>

      <h2 style={{ fontSize: '28px', marginTop: '40px', marginBottom: '15px' }}>
        我们的使命
      </h2>

      <p style={{ lineHeight: '1.8', fontSize: '18px' }}>
        通过技术改变世界,让每个人的生活更美好。
      </p>
    </div>
  );
}
