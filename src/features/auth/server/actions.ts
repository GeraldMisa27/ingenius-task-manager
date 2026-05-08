"use server";

/**
 * Server Actions for the auth feature.
 *
 * Provides registration. Login is handled directly by NextAuth's signIn,
 * not as a Server Action, because NextAuth manages the session cookies.
 */

import bcrypt from "bcryptjs";
import { withAction } from "@/core/server/withAction";
import { BusinessRuleError } from "@/core/errors";
import { registerSchema } from "@/features/auth/validation";
import { findUserByEmail, createUser } from "./repository";

const PASSWORD_HASH_ROUNDS = 10;

export const registerUser = withAction(async (input: unknown) => {
  const data = registerSchema.parse(input);

  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new BusinessRuleError("Ya existe un usuario con este correo electrónico");
  }

  const passwordHash = await bcrypt.hash(data.password, PASSWORD_HASH_ROUNDS);

  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  return user;
});
