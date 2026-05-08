/**
 * Module augmentation for next-auth to add the user id to the session type.
 *
 * NextAuth's default Session.user only has name, email, image. We need id
 * for authorization checks (requireUser, permission functions).
 */

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}
