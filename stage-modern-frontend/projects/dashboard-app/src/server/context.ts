import { type inferAsyncReturnType } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createContext(opts?: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions);

  return {
    session,
    prisma,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
