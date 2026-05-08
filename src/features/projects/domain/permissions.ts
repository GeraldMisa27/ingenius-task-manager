/**
 * Pure permission functions for the projects feature.
 *
 * These functions encode the project authorization rules from the assignment:
 *  - The owner can edit, archive, unarchive, transfer ownership, and delete (when not archived).
 *  - Members can read but not modify the project.
 *  - Outsiders cannot access the project at all (handled at the query level).
 *  - Archived projects are read-only for everyone, including the owner; only the owner can unarchive.
 *  - Archived projects cannot be deleted directly: they must be unarchived first.
 *
 * All functions are pure: they receive structural types and return booleans.
 */

import type { ProjectLike, ProjectRole } from "./types";

/**
 * The owner can edit a non-archived project. Members and outsiders cannot.
 */
export function canEditProject(
  role: ProjectRole,
  project: ProjectLike,
): boolean {
  if (project.archived) return false;
  return role === "owner";
}

/**
 * The owner can archive a non-archived project.
 */
export function canArchiveProject(
  role: ProjectRole,
  project: ProjectLike,
): boolean {
  if (project.archived) return false;
  return role === "owner";
}

/**
 * The owner can unarchive an archived project.
 * This is the inverse rule of canArchiveProject.
 */
export function canUnarchiveProject(
  role: ProjectRole,
  project: ProjectLike,
): boolean {
  if (!project.archived) return false;
  return role === "owner";
}

/**
 * The owner can delete a non-archived project.
 * Archived projects must be unarchived first by design.
 */
export function canDeleteProject(
  role: ProjectRole,
  project: ProjectLike,
): boolean {
  if (project.archived) return false;
  return role === "owner";
}

/**
 * The owner can transfer ownership of a non-archived project, but only if there
 * is at least one other member to receive ownership. The decision of whether
 * a candidate member exists is delegated to the caller; this function only
 * verifies the role/state preconditions.
 */
export function canTransferOwnership(
  role: ProjectRole,
  project: ProjectLike,
): boolean {
  if (project.archived) return false;
  return role === "owner";
}

/**
 * Any user with a role other than "outsider" can view a project.
 */
export function canViewProject(role: ProjectRole): boolean {
  return role !== "outsider";
}
