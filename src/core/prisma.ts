/**
 * EN: Shared PrismaClient instance for the server layer (Server Actions, repositories, route handlers).
 *     Uses a module-level singleton so Next.js dev hot reload does not spawn multiple clients and exhaust SQLite connections.
 */
import { PrismaClient } from "@/generated/prisma";

// EN: Reuse one client across HMR reloads via globalThis; production relies on a single module instance.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // EN: Verbose query logging only in development to debug SQL without noisy production logs.
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// EN: Persist on global only outside production so the same client survives Fast Refresh in dev.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
