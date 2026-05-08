/**
 * NextAuth route handlers for sign-in, sign-out, callbacks, and session.
 *
 * Imports the full auth (Node runtime) because it needs Credentials provider
 * and Prisma access. The middleware uses the Edge-safe variant separately.
 */

import { handlers } from "@/core/auth/auth";

export const { GET, POST } = handlers;
