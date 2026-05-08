/**
 * Derives a user's role within a specific project.
 *
 * The role is computed from project ownership and membership state:
 *  - "owner" if user is the project's ownerId.
 *  - "member" if a ProjectMember row exists for (projectId, userId).
 *  - "outsider" otherwise.
 *
 * This function is the bridge between persistent state (Prisma) and the
 * pure domain permission functions, which need a ProjectRole to evaluate
 * authorization.
 */

import { findMembership } from "@/features/members/server/repository";
import type { ProjectRole } from "@/features/projects/domain/types";

export async function deriveProjectRole(
  userId: string,
  project: { ownerId: string; id: string },
): Promise<ProjectRole> {
  if (project.ownerId === userId) return "owner";

  const membership = await findMembership({
    projectId: project.id,
    userId,
  });

  return membership ? "member" : "outsider";
}
