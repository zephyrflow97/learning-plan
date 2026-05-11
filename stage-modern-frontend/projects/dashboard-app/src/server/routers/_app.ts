import { router } from '../trpc';
import { userRouter } from './user';
import { projectRouter } from './project';
import { taskRouter } from './task';

export const appRouter = router({
  user: userRouter,
  project: projectRouter,
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
