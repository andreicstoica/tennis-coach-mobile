import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    trustedOrigins: ["tenniscoachmobile://", "http://localhost:8081"],
    plugins: [expo()],
    emailAndPassword: {
        enabled: true, // Enable authentication using email and password.
    },

    socialProviders: {
        google: {
            enabled: true,
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});