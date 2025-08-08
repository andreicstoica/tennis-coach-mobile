import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { Message } from 'ai';

// Auth Tables // 
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
        .$defaultFn(() => false)
        .notNull(),
    image: text("image"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").$defaultFn(
        () => /* @__PURE__ */ new Date(),
    ),
    updatedAt: timestamp("updated_at").$defaultFn(
        () => /* @__PURE__ */ new Date(),
    ),
});

// APP TABLES //
export const practiceSessions = pgTable("practice-sessions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => user.id),
    focusArea: varchar("focus_area", { length: 50 }).notNull(),
    plan: text("plan"), // JSON or markdown of warmup/drill/game
    createdAt: timestamp("created_at").defaultNow(),
    chatId: varchar("chat_id", { length: 256 }).references(() => chats.id),
});

export const practiceReflections = pgTable("practice-reflections", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => user.id),
    sessionId: integer("session_id").references(() => practiceSessions.id),
    rating: integer("rating"), // 1–5
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
});

type Messages = Message[];

export const chats = pgTable("chats", {
    id: varchar("id", { length: 256 }).primaryKey().notNull(),
    userId: text("user_id").references(() => user.id),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    messages: jsonb("messages").$type<Messages>().default([]),
});