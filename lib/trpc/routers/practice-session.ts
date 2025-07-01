import { desc, eq } from 'drizzle-orm';
import { practiceSessions } from '../../db/schema';
import { createTRPCRouter, protectedProcedure } from '../server';

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const practiceSessionRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        // getting user session
        const userId = ctx.user.id;
        console.log('using this userId to fetch practice sessions: ', userId);

        try {
            const foundPracticeSessions = await ctx.db.query.practiceSessions.findMany({
                where: eq(practiceSessions.userId, userId),
                orderBy: [desc(practiceSessions.createdAt)],
            });
            return foundPracticeSessions ?? null;
        } catch (err) {
            console.error('Error fetching practice sessions:', err);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch practice sessions',
                cause: err,
            });
        }

    }),

    getByChatId: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            const practiceSession = await ctx.db.query.practiceSessions.findFirst({
                where: eq(practiceSessions.chatId, input.chatId),
            });

            if (!practiceSession || practiceSession.userId !== ctx.user.id) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }

            return practiceSession;
        }),

    create: protectedProcedure
        .input(z.object({ focus: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { focus } = input;

            const newPracticeSession = ctx.db
                .insert(practiceSessions)
                .values({
                    focusArea: focus,
                    userId: ctx.user.id,
                })
                .returning()
                .execute();

            return newPracticeSession;
        }),

    addPlan: protectedProcedure
        .input(z.object({ plan: z.string(), practiceSessionId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const { plan, practiceSessionId } = input;

            await ctx.db
                .update(practiceSessions)
                .set({
                    plan: plan,
                })
                .where(eq(practiceSessions.id, practiceSessionId));
            console.log(
                `Updated practice session ${practiceSessionId} with new plan.`,
            );

            return { success: true };
        }),
});

