import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins/two-factor";

import { getServerEnv } from "~/lib/env.server";
import { prisma } from "~/lib/prisma";

const env = getServerEnv();
const baseURL = env.BETTER_AUTH_URL;
const useSecureCookies = baseURL.startsWith("https://");

/**
 * Better Auth instance for admin authentication only. Public registration is
 * disabled in V1 — the initial admin is bootstrapped by `npm run db:seed`.
 */
export const auth = betterAuth({
  appName: "DevAtlas",
  baseURL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  advanced: {
    useSecureCookies,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: useSecureCookies,
    },
  },
  plugins: [twoFactor({ issuer: "DevAtlas" })],
});
