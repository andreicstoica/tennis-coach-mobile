import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: "https://courtly-xi.vercel.app", // base URL (without trailing slash)
    plugins: [
        expoClient({
            scheme: "tenniscoachmobile",
            storagePrefix: "tenniscoachmobile",
            storage: SecureStore,
        })
    ]
});
