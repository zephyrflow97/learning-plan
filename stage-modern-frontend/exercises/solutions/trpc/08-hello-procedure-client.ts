// client.ts

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers/app';

// 创建 tRPC 客户端
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});

// 调用 API
async function main() {
  const result = await trpc.hello.query({ name: '张三' });
  console.log('[客户端] 收到响应:', result);
  // 输出: { message: '你好, 张三!' }
}

main();
