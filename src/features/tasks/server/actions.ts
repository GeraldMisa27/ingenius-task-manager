"use server";

/**
 * Server Actions for the tasks feature.
 *
 * Tasks self-assign to the creator at creation (business rule).
 * Reassignment via assigneeId on update is only allowed for the project owner.
 */

import { revalidatePath } from "next/cache";
import { withAction } from "@/core/server/withAction";
import { requireUser } from "@/core/auth/helpers";
import { deriveProjectRole } from "@/core/server/projectRole";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "@/core/errors";
import { createTaskSchema, updateTaskSchema } from "@/features/tasks/validation";
import {
  canCreateTask,
  canDeleteTask,
  canEditTask,
  canReassignTask,
} from "@/features/tasks/domain/permissions";
import { findProjectById } from "@/features/projects/server/repository";
import {
  createTask as createTaskRepo,
  deleteTask as deleteTaskRepo,
  findTaskById,
  updateTask as updateTaskRepo,
} from "./repository";

export const createTask = withAction(async (input: unknown) => {
  const user = await requireUser();
  const data = createTaskSchema.parse(input);

  const project = await findProjectById(data.projectId);
  if (!project) throw new NotFoundError("Proyecto");

  const role = await deriveProjectRole(user.id, project);
  if (!canCreateTask(role, project.archived)) {
    throw new ForbiddenError("No puedes crear tareas en este proyecto");
  }

  const task = await createTaskRepo({
    name: data.name,
    projectId: data.projectId,
    creatorId: user.id,
    assigneeId: user.id, // Self-assign on creation (business rule).
    priority: data.priority,
  });

  revalidatePath(`/projects/${data.projectId}`);
  return task;
});

export const updateTask = withAction(async (input: unknown) => {
  const user = await requireUser();
  const data = updateTaskSchema.parse(input);

  const task = await findTaskById(data.taskId);
  if (!task) throw new NotFoundError("Tarea");

  const project = await findProjectById(task.projectId);
  if (!project) throw new NotFoundError("Proyecto");

  const role = await deriveProjectRole(user.id, project);
  if (!canEditTask(role, task, user.id, project.archived)) {
    throw new ForbiddenError("No puedes editar esta tarea");
  }

  // Only the project owner can reassign a task to another user.
  if (data.assigneeId && data.assigneeId !== task.assigneeId) {
    if (!canReassignTask(role)) {
      throw new ForbiddenError("Solo el jefe puede reasignar tareas");
    }
    // Reassignment target must be the owner or a project member.
    if (data.assigneeId !== project.ownerId) {
      const { findMembership } = await import("@/features/members/server/repository");
      const newAssigneeMembership = await findMembership({
        projectId: project.id,
        userId: data.assigneeId,
      });
      if (!newAssigneeMembership) {
        throw new BusinessRuleError(
          "El nuevo responsable debe ser miembro del proyecto",
        );
      }
    }
  }

  const updated = await updateTaskRepo({
    id: data.taskId,
    name: data.name,
    status: data.status,
    priority: data.priority,
    assigneeId: data.assigneeId,
  });

  revalidatePath(`/projects/${task.projectId}`);
  return updated;
});

export const deleteTask = withAction(async (input: { taskId: string }) => {
  const user = await requireUser();

  const task = await findTaskById(input.taskId);
  if (!task) throw new NotFoundError("Tarea");

  const project = await findProjectById(task.projectId);
  if (!project) throw new NotFoundError("Proyecto");

  const role = await deriveProjectRole(user.id, project);
  if (!canDeleteTask(role, task, user.id, project.archived)) {
    throw new ForbiddenError("No puedes eliminar esta tarea");
  }

  await deleteTaskRepo(input.taskId);

  revalidatePath(`/projects/${task.projectId}`);
  return { id: input.taskId };
});
