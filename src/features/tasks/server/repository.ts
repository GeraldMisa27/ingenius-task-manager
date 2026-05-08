/**
 * Repository for the tasks feature.
 *
 * Encapsulates Prisma access for Task entities and the bulk reassignment
 * required when a member is removed from a project.
 */

import { prisma } from "@/core/prisma";
import type { TaskStatus, TaskPriority } from "@/generated/prisma";

/**
 * Finds a single task by id.
 */
export async function findTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      priority: true,
      projectId: true,
      assigneeId: true,
      creatorId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Lists all tasks of a project ordered by creation date (newest first).
 * The filter by membership and access is enforced at the Server Action layer.
 */
export async function findTasksByProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
      status: true,
      priority: true,
      projectId: true,
      assigneeId: true,
      creatorId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Creates a task.
 *
 * The assigneeId is auto-set to creatorId by the calling Server Action
 * (business rule: tasks self-assign to the creator at creation).
 */
export async function createTask(input: {
  name: string;
  projectId: string;
  creatorId: string;
  assigneeId: string;
  priority: TaskPriority;
}) {
  return prisma.task.create({
    data: {
      name: input.name,
      projectId: input.projectId,
      creatorId: input.creatorId,
      assigneeId: input.assigneeId,
      priority: input.priority,
      // status defaults to PENDING via Prisma schema.
    },
  });
}

/**
 * Updates a task's mutable fields. All fields are optional.
 *
 * The Server Action enforces which fields a non-owner can change.
 */
export async function updateTask(input: {
  id: string;
  name?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
}) {
  return prisma.task.update({
    where: { id: input.id },
    data: {
      name: input.name,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId,
    },
  });
}

/**
 * Deletes a task.
 */
export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}

/**
 * Reassigns all tasks owned by a user in a given project to a new assignee.
 *
 * Used when a member is removed from a project: their tasks transfer to the
 * project owner in a single transaction.
 */
export async function reassignAllTasksOfUserInProject(input: {
  projectId: string;
  fromUserId: string;
  toUserId: string;
}) {
  return prisma.task.updateMany({
    where: {
      projectId: input.projectId,
      assigneeId: input.fromUserId,
    },
    data: {
      assigneeId: input.toUserId,
    },
  });
}
