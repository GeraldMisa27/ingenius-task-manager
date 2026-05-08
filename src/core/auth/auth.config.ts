/**
 * Edge-safe NextAuth configuration shared between middleware and the full server config.
 *
 * This file MUST NOT import:
 *  - Prisma client (uses Node-only APIs).
 *  - bcryptjs (uses Node-only crypto).
 *  - Any module that transitively pulls those.
 *
 * The middleware imports this config to evaluate session presence and protect routes
 * without paying the cost (or hitting the runtime errors) of Node-only dependencies.
 *
 * The full config (auth.ts) extends this with the Credentials provider and other
 * Node-only logic.
 */

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Controls authorization for routes covered by middleware matcher.
     * Returns true to allow, false to deny (which redirects to signIn page).
     */
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;

      const isProtected = pathname.startsWith("/projects");
      const isAuthPage = pathname === "/login" || pathname === "/register";

      if (isProtected) return isLoggedIn;

      // Redirect logged-in users away from auth pages.
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/projects", request.nextUrl));
      }

      return true;
    },
  },
  providers: [], // Defined in auth.ts (Node runtime).
} satisfies NextAuthConfig;
