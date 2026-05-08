/**
 * Shared project validation schemas for client forms and server actions.
 * Covers create, update, and ownership transfer inputs with one source of truth.
 */
import { z } from "zod";
import { cuidId } from "@/shared/validation/helpers";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(80, "El nombre no puede superar 80 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .or(z.literal("")),
});

// Same fields validated for both create and update in this scope.
export const updateProjectSchema = createProjectSchema;

export const transferOwnershipSchema = z.object({
  projectId: cuidId("ID de proyecto inválido"),
  newOwnerId: cuidId("ID de usuario inválido"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;
