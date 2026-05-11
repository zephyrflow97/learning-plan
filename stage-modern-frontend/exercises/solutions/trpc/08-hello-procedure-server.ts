// server/trpc.ts

import { initTRPC } from '@trpc/server';

// 初始化 tRPC
const t = initTRPC.create();

// 导出 router 和 procedure 构建器
export const router = t.router;
export const publicProcedure = t.procedure;
