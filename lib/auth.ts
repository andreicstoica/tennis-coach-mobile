import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    trustedOrigins: [
        "tenniscoachmobile://",
        "tenniscoachmobile://*",
        "courtly://",
        "courtly://*",
        "http://localhost:8081",
    ],
    plugins: [expo()],

    emailAndPassword: {
        enabled: true,
    },
});