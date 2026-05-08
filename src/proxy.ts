/**
 * Root proxy for route protection (Next.js 16 convention).
 *
 * Replaces the deprecated middleware.ts file convention. Imports the
 * Edge-safe auth config (NOT auth.ts) to avoid pulling Prisma or bcryptjs
 * into the Edge Runtime.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/routing/proxy
 * Reference: https://authjs.dev/getting-started/installation (NextAuth v5)
 */

import NextAuth from "next-auth";
import { authConfig } from "@/core/auth/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
