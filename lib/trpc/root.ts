import { authRouter } from './routers/auth';
import { practiceSessionRouter } from './routers/practice-session';
import { createTRPCRouter } from './server';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    auth: authRouter,
    practice: practiceSessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter; 