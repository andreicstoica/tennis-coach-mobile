import { initTRPC } from '@trpc/server';
import { z } from 'zod';

/**
 * We are doing something very weird here.
 * 
 * In order to create a TRPC client, we need a router type, AppRouter, to determine
 * the functions and inputs and outputs that are available. We do not need a copy of the 
 * server-side router, but we do need the type definition, AppRouter, that it creates.
 * 
 * The easiest way to do this in your own project is to have your next.js project and this native app
 * in the same repo. Then you can just import the AppRouter type from the next.js project.
 * 
 * This file would normally live in your next.js project. However, I do not want to have a next.js 
 * project for this assignment, so we are just going to create a copy of the AppRouter type. 
 * Notice that there is no implementation of the procedures here, because the actual implementation
 * of this lives inside of my next.js project.
 * 
 * It is very important that you do not import actual objects from your server, just the type, like so:
 * import { type AppRouter } from './trpc-router';
 * 
 * If you import actual objects, you will be importing your server implementation into your client!
 * But if you only import the type, the bundler will correctly include only the type definition, and no
 * part of the server will be imported.
 */
const t = initTRPC.create();

const practiceSessionSchema = z.object({
    id: z.number(),
    focusArea: z.string(),
    plan: z.string().nullable(),
    userId: z.string(),
    chatId: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});


const chatSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    messages: z.array(z.object({
        id: z.string(),
        role: z.string(),
        content: z.string(),
        createdAt: z.string(),
        toolInvocations: z.array(z.object({
            toolCallId: z.string(),
            toolName: z.string(),
            args: z.record(z.any()),
            result: z.any().optional(),
        })).optional(),
    })),
});

export const practiceSessionRouter = t.router({
    // Get all practice sessions for the authenticated user
    list: t.procedure
        .output(z.array(practiceSessionSchema).nullable())
        .query(async ({ ctx }) => { return [] as any }),

    // Get a single practice session by ID
    get: t.procedure
        .input(z.object({ id: z.number() }))
        .output(practiceSessionSchema.nullable())
        .query(async ({ ctx, input }) => { return [] as any }),

    // Get a practice session by chatId
    getByChatId: t.procedure
        .input(z.object({ chatId: z.string() }))
        .output(practiceSessionSchema.nullable())
        .query(async ({ ctx, input }) => { return [] as any }),

    // Create a new practice session
    create: t.procedure
        .input(z.object({ focus: z.string() }))
        .output(z.array(practiceSessionSchema))
        .mutation(async ({ ctx, input }) => { return [] as any }),

    // Add a plan to an existing practice session
    addPlan: t.procedure
        .input(z.object({ plan: z.string(), practiceSessionId: z.number() }))
        .output(z.object({ success: z.boolean() }))
        .mutation(async ({ ctx, input }) => { return { success: true } }),
});

export const chatRouter = t.router({
    get: t.procedure
        .input(z.object({ chatId: z.string() }))
        .output(chatSchema.nullable())
        .query(async ({ ctx, input }) => {
            console.log('TRPC get chat with input:', input);
            return [] as any
        }),
    create: t.procedure
        .input(z.object({ practiceSessionId: z.number() }))
        .output(z.string()) // returns a new chatId
        .mutation(async ({ ctx, input }) => { return [] as any }),
    saveMessages: t.procedure
        .input(z.object({
            chatId: z.string(),
            messages: z.array(z.any())
        }))
        .output(z.object({ success: z.boolean() }))
        .mutation(async ({ ctx, input }) => { return { success: true } }),
});

export const courtBadgesRouter = t.router({
    // Get the court badges for a user
    getCourtBadges: t.procedure
        .input(z.object({ courtName: z.string() }))
        .output(z.object({ success: z.boolean() }))
        .query(async ({ ctx, input }) => {
            console.log('TRPC get court badges with input:', input);
            return { success: true }
        }),
    // Update the court badges for a user
    updateCourtBadges: t.procedure
        .input(z.object({ courtName: z.string() }))
        .output(z.object({ success: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            console.log('TRPC update court badges with input:', input);
            return { success: true }
        }),
});

export const appRouter = t.router({
    practiceSession: practiceSessionRouter,
    chat: chatRouter,
    courtBadges: courtBadgesRouter,
});

export type AppRouter = typeof appRouter;