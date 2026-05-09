/**
 * Shared member validation schemas for client forms and server actions.
 * Covers project member add and removal payloads with consistent constraints.
 */
import { z } from "zod";
import { cuidId } from "@/shared/validation/helpers";
import { EMAIL_MAX_LEN } from "@/shared/validation/limits";

export const addMemberSchema = z.object({
  projectId: cuidId("ID de proyecto inválido"),
  userEmail: z
    .string()
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX_LEN, "El correo no puede superar 254 caracteres")
    .pipe(z.email("Correo electrónico inválido")),
});

export const removeMemberSchema = z.object({
  projectId: cuidId("ID de proyecto inválido"),
  userId: cuidId("ID de usuario inválido"),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
