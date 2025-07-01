import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { user } from '../../db/schema';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../server';

export const authRouter = createTRPCRouter({
    getSession: publicProcedure.query(({ ctx }) => {
        return ctx.user;
    }),

    getUser: protectedProcedure.query(async ({ ctx }) => {
        const foundUser = await ctx.db.query.user.findFirst({
            where: eq(user.id, ctx.user.id),
        });
        return foundUser;
    }),

    updateUser: protectedProcedure
        .input(
            z.object({
                name: z.string().optional(),
                email: z.string().email().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const updatedUser = await ctx.db
                .update(user)
                .set({
                    ...input,
                    updatedAt: new Date(),
                })
                .where(eq(user.id, ctx.user.id))
                .returning();

            return updatedUser[0];
        }),
}); 