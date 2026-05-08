/**
 * Repository for the members feature.
 *
 * Encapsulates Prisma access for ProjectMember entities and member-related
 * queries used by the projects detail UI and the Server Actions that
 * add/remove members.
 */

import { prisma } from "@/core/prisma";

/**
 * Lists all members of a project including basic user info for display.
 */
export async function findMembersByProject(projectId: string) {
  return prisma.projectMember.findMany({
    where: { projectId },
    select: {
      userId: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });
}

/**
 * Returns the membership row for a user-project pair, or null if not a member.
 *
 * Used to derive the project role: if findMembership returns a row OR the
 * user is the project owner, they are inside the project; otherwise outsider.
 */
export async function findMembership(input: {
  projectId: string;
  userId: string;
}) {
  return prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: input.projectId,
        userId: input.userId,
      },
    },
  });
}

/**
 * Adds a user to a project's member list.
 *
 * The Server Action validates that the user exists by email and that
 * they are not already a member or the owner before calling this function.
 */
export async function addMembership(input: {
  projectId: string;
  userId: string;
}) {
  return prisma.projectMember.create({
    data: {
      projectId: input.projectId,
      userId: input.userId,
    },
  });
}

/**
 * Removes a user from a project's member list.
 *
 * The Server Action handles the transactional concern of reassigning the
 * removed member's tasks to the project owner before calling this function.
 */
export async function removeMembership(input: {
  projectId: string;
  userId: string;
}) {
  return prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId: input.projectId,
        userId: input.userId,
      },
    },
  });
}
