/**
 * Repository for the projects feature.
 *
 * Encapsulates Prisma access for Project, ProjectMember, and ownership-related
 * queries. Server Actions consume these functions without knowing the ORM details.
 */

import { prisma } from "@/core/prisma";

/**
 * Finds a single project by id with the minimum data required by domain functions.
 */
export async function findProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      archived: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Lists projects where the user is owner or member.
 *
 * The query uses an OR clause so users see projects they own and projects
 * where they appear in the ProjectMember table.
 */
export async function findProjectsForUser(userId: string) {
  return prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: {
      id: true,
      name: true,
      description: true,
      archived: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Creates a project; the owner is set from the input.
 */
export async function createProject(input: {
  name: string;
  description?: string;
  ownerId: string;
}) {
  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
    },
  });
}

/**
 * Updates a project's editable fields (name, description).
 * The owner change goes through a dedicated transferOwnership function (transactional).
 */
export async function updateProject(input: {
  id: string;
  name: string;
  description?: string;
}) {
  return prisma.project.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description,
    },
  });
}

/**
 * Sets archived = true on a project.
 */
export async function archiveProject(id: string) {
  return prisma.project.update({
    where: { id },
    data: { archived: true },
  });
}

/**
 * Sets archived = false on a project.
 */
export async function unarchiveProject(id: string) {
  return prisma.project.update({
    where: { id },
    data: { archived: false },
  });
}

/**
 * Deletes a project. Cascades to ProjectMember and Task by Prisma schema rules.
 */
export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

/**
 * Transfers ownership of a project to a new owner who is a current member.
 *
 * Atomic operation:
 *  1. Insert the previous owner into ProjectMember.
 *  2. Delete the new owner's row from ProjectMember (they are now owner, not member).
 *  3. Update Project.ownerId.
 *
 * If any step fails, the entire transaction rolls back.
 */
export async function transferProjectOwnership(input: {
  projectId: string;
  previousOwnerId: string;
  newOwnerId: string;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.projectMember.create({
      data: {
        projectId: input.projectId,
        userId: input.previousOwnerId,
      },
    });

    await tx.projectMember.deleteMany({
      where: {
        projectId: input.projectId,
        userId: input.newOwnerId,
      },
    });

    return tx.project.update({
      where: { id: input.projectId },
      data: { ownerId: input.newOwnerId },
    });
  });
}
