/**
 * Pure permission functions for the members feature.
 *
 * Authorization rules from the assignment:
 *  - Only the project owner can add and remove members.
 *  - The owner cannot remove themselves directly: they must transfer ownership first.
 *  - When a member is removed, all their tasks in the project are reassigned to the owner.
 *    This reassignment is a transactional concern handled in the Server Action,
 *    not here. This module only authorizes the operation.
 *  - Members cannot be added to or removed from archived projects (the project becomes
 *    read-only when archived).
 *
 * Functions remain pure: structural inputs in, boolean out.
 */

import type { ProjectRole } from "@/features/projects/domain/types";

/**
 * Only the project owner can add a member to a non-archived project.
 */
export function canAddMember(
  role: ProjectRole,
  isProjectArchived: boolean,
): boolean {
  if (isProjectArchived) return false;
  return role === "owner";
}

/**
 * The owner can remove a member from a non-archived project, but cannot remove
 * themselves: they must transfer ownership first.
 *
 * @param role role of the user performing the action.
 * @param targetUserId id of the user being removed.
 * @param ownerId id of the current project owner.
 * @param isProjectArchived whether the project is archived.
 */
export function canRemoveMember(
  role: ProjectRole,
  targetUserId: string,
  ownerId: string,
  isProjectArchived: boolean,
): boolean {
  if (isProjectArchived) return false;
  if (role !== "owner") return false;
  // The owner cannot remove themselves; they must transfer ownership first.
  if (targetUserId === ownerId) return false;
  return true;
}

/**
 * The owner can transfer ownership only if there is at least one other member
 * to receive it. The list of candidates is provided by the caller.
 *
 * @param role role of the user performing the action.
 * @param candidateMembers users eligible to receive ownership (excluding current owner).
 * @param isProjectArchived whether the project is archived.
 */
export function canExecuteOwnershipTransfer(
  role: ProjectRole,
  candidateMembers: ReadonlyArray<{ userId: string }>,
  isProjectArchived: boolean,
): boolean {
  if (isProjectArchived) return false;
  if (role !== "owner") return false;
  return candidateMembers.length > 0;
}
