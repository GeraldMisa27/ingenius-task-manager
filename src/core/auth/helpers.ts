/**
 * Server-side auth helpers for Server Actions and route handlers.
 *
 * requireUser is the single entry point for authentication enforcement:
 * Server Actions call it first, and any unauthenticated access throws
 * UnauthorizedError, which the action's mapper converts to a uniform response.
 */

import { auth } from "./auth";
import { UnauthorizedError } from "@/core/errors";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Returns the authenticated user or throws UnauthorizedError.
 *
 * Used at the top of every Server Action to enforce authentication
 * with consistent error handling.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email || !session.user.name) {
    throw new UnauthorizedError();
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

/**
 * Optional helper for code paths that may or may not have a user.
 * Returns null instead of throwing.
 */
export async function getOptionalUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email || !session.user.name) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
