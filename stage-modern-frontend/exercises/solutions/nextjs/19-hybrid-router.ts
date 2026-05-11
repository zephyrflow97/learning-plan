// server/routers/data.ts

import { router, publicProcedure } from '../trpc';

export const dataRouter = router({
  getCurrentTime: publicProcedure.query(() => {
    const now = new Date().toISOString();
    console.log('[tRPC] getCurrentTime 被调用:', now);
    
    return {
      time: now,
      random: Math.floor(Math.random() * 1000),
    };
  }),
});
