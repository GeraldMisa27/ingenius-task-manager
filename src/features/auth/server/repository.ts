/**
 * Repository for the auth feature.
 *
 * Encapsulates Prisma access for User entities related to authentication:
 * lookup by email (used during login) and creation (used during registration).
 *
 * Returns raw Prisma data; error mapping and validation happen in Server Actions.
 */

import { prisma } from "@/core/prisma";

/**
 * Finds a user by email for the login flow.
 * Returns the full user record including passwordHash for credential verification.
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });
}

/**
 * Finds a user by id without exposing the password hash.
 * Used for session refresh and user profile lookups.
 */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

/**
 * Creates a user with the password already hashed by the caller.
 * Throws Prisma's unique constraint error if email is taken; the Server Action
 * catches and translates to a typed error.
 */
export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}
