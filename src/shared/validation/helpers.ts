/**
 * Shared Zod validation helpers used across schema files.
 * Centralizes deprecation handling and reusable validators.
 */
import { z } from "zod";

/**
 * Validates a Prisma-generated CUID v1 identifier.
 *
 * Wraps `z.cuid()` to centralize deprecation handling: the underlying API
 * is marked deprecated in Zod 4 in favor of a future top-level migration
 * planned for Zod 5, but it remains the correct validator for CUID v1
 * identifiers, which is what Prisma generates with `@default(cuid())`.
 *
 * When Zod 5 stabilizes the new API, only this helper needs to change.
 */
export const cuidId = (message: string) =>
  z.cuid(message);
