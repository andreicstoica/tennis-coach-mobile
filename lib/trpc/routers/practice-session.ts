import { TRPCError } from '@trpc/server';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { practiceSessions } from '../../db/schema';
import { createTRPCRouter, protectedProcedure } from '../server';

export const practiceSessionRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        // getting user session
        const userId = ctx.session.user.id;

        // find user practice sessions history in db
        const foundPracticeSessions = await ctx.db.query.practiceSessions.findMany({
            where: eq(practiceSessions.userId, userId),
            orderBy: [desc(practiceSessions.createdAt)],
        });
        return foundPracticeSessions ?? null;
    }),

    get: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            return await getPracticeSessionById(ctx, input.id);
        }),

    getByChatId: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            const practiceSession = await ctx.db.query.practiceSessions.findFirst({
                where: eq(practiceSessions.chatId, input.chatId),
            });

            if (!practiceSession || practiceSession.userId !== ctx.session.user.id) {
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
                    userId: ctx.session.user.id,
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