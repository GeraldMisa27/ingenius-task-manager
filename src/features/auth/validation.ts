/**
 * Shared auth input validation schemas used by client forms and server actions.
 * Keeps registration and login rules aligned across the application boundary.
 */
import { z } from "zod";
import {
  EMAIL_MAX_LEN,
  PASSWORD_MAX_LEN,
  PASSWORD_MIN_LEN,
  USER_REGISTER_NAME_MAX_LEN,
  USER_REGISTER_NAME_MIN_LEN,
} from "@/shared/validation/limits";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      USER_REGISTER_NAME_MIN_LEN,
      "El nombre debe tener al menos 2 caracteres",
    )
    .max(
      USER_REGISTER_NAME_MAX_LEN,
      "El nombre no puede superar 80 caracteres",
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX_LEN, "El correo no puede superar 254 caracteres")
    .pipe(z.email("Correo electrónico inválido")),
  password: z
    .string()
    .min(PASSWORD_MIN_LEN, "La contraseña debe tener al menos 8 caracteres")
    .max(
      PASSWORD_MAX_LEN,
      "La contraseña no puede superar 72 caracteres",
    )
    .regex(/[A-Za-z]/, "Debe incluir al menos una letra")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX_LEN, "El correo no puede superar 254 caracteres")
    .pipe(z.email("Correo electrónico inválido")),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .max(
      PASSWORD_MAX_LEN,
      "La contraseña no puede superar 72 caracteres",
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
