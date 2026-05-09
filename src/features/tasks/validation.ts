/**
 * Shared task validation schemas for client forms and server actions.
 * Covers create and update flows, including status and priority changes.
 */
import { z } from "zod";
import { cuidId } from "@/shared/validation/helpers";
import { TASK_NAME_MAX_LEN, TASK_NAME_MIN_LEN } from "@/shared/validation/limits";

export const TaskStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]);
export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Task creation does not accept status or assigneeId:
// status defaults to PENDING in Prisma and assigneeId is auto-assigned in the Server Action.
export const createTaskSchema = z.object({
  projectId: cuidId("ID de proyecto inválido"),
  name: z
    .string()
    .trim()
    .min(TASK_NAME_MIN_LEN, "El nombre debe tener al menos 3 caracteres")
    .max(TASK_NAME_MAX_LEN, "El nombre no puede superar 120 caracteres"),
  priority: TaskPriorityEnum.optional().default("MEDIUM"),
});

export const updateTaskSchema = z
  .object({
    taskId: cuidId("ID de tarea inválido"),
    name: z
      .string()
      .trim()
      .min(TASK_NAME_MIN_LEN, "El nombre debe tener al menos 3 caracteres")
      .max(TASK_NAME_MAX_LEN, "El nombre no puede superar 120 caracteres")
      .optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    // assigneeId is only acceptable in update if the executing user is the project owner.
    // The schema validates only the data shape; authorization is enforced in the Server Action.
    assigneeId: cuidId("ID de usuario inválido").optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.status !== undefined ||
      data.priority !== undefined ||
      data.assigneeId !== undefined,
    {
      message: "Debes indicar al menos un campo a actualizar",
      path: ["taskId"],
    },
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
