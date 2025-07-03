import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";

export const auth = betterAuth({

    trustedOrigins: ["tenniscoachmobile://", "tenniscoachmobile://*", "http://localhost:8081"],
    plugins: [expo()],

    emailAndPassword: {
        enabled: true,
    },

    socialProviders: {
        google: {
            enabled: true,
            clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET!,
        },
    },
});