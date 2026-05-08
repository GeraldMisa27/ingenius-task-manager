/**
 * Pure permission functions for the tasks feature.
 *
 * Authorization rules from the assignment:
 *  - Tasks can only be created/edited/deleted in non-archived projects.
 *  - Each user edits and deletes only their own tasks (creatorId === userId).
 *  - The project owner has override: can edit/delete any task in their projects.
 *  - All members (including the owner) can view all tasks of the project.
 *  - The project owner is the only one who can reassign tasks to other members.
 *  - On task creation, assignee is auto-set to the current user (no selector).
 *    This rule is enforced in the Server Action, not here.
 *
 * The "isProjectArchived" flag and "userIsOwner" flag are passed in so that
 * the function remains pure and ignorant of how those facts were retrieved.
 */

import type { TaskLike } from "./types";
import type { ProjectRole } from "@/features/projects/domain/types";

/**
 * A user can create tasks in a project if they are owner or member of a non-archived project.
 */
export function canCreateTask(
  role: ProjectRole,
  isProjectArchived: boolean,
): boolean {
  if (isProjectArchived) return false;
  return role === "owner" || role === "member";
}

/**
 * A user can edit a task if:
 *  - The project is not archived, AND
 *  - They are the project owner (override on any task), OR
 *  - They are a member who is the task creator.
 *
 * Outsiders never edit, even if they were the historical creator of the task
 * (this can happen if a member is later removed from the project; their tasks
 * are reassigned to the owner but creatorId remains historical).
 */
export function canEditTask(
  role: ProjectRole,
  task: TaskLike,
  userId: string,
  isProjectArchived: boolean,
): boolean {
  if (isProjectArchived) return false;
  if (role === "owner") return true;
  if (role === "member") return task.creatorId === userId;
  return false;
}

/**
 * A user can delete a task under the same rules as edit.
 */
export function canDeleteTask(
  role: ProjectRole,
  task: TaskLike,
  userId: string,
  isProjectArchived: boolean,
): boolean {
  return canEditTask(role, task, userId, isProjectArchived);
}

/**
 * Only the project owner can reassign a task to another member.
 * Regular members can edit their own tasks but cannot change the assignee.
 */
export function canReassignTask(role: ProjectRole): boolean {
  return role === "owner";
}

/**
 * Any role other than "outsider" can view tasks of the project.
 */
export function canViewTasks(role: ProjectRole): boolean {
  return role !== "outsider";
}
