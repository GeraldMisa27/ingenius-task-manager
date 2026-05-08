"use server";

/**
 * Server Actions for the members feature.
 *
 * Adding members requires the user (looked up by email) to exist.
 * Removing a member triggers a transactional reassignment of their tasks
 * to the project owner before the membership row is deleted.
 */

import { revalidatePath } from "next/cache";
import { withAction } from "@/core/server/withAction";
import { requireUser } from "@/core/auth/helpers";
import { deriveProjectRole } from "@/core/server/projectRole";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "@/core/errors";
import { addMemberSchema, removeMemberSchema } from "@/features/members/validation";
import { canAddMember, canRemoveMember } from "@/features/members/domain/permissions";
import { findProjectById } from "@/features/projects/server/repository";
import { findUserByEmail } from "@/features/auth/server/repository";
import { addMembership, findMembership } from "./repository";
import { prisma } from "@/core/prisma";

export const addMember = withAction(async (input: unknown) => {
  const user = await requireUser();
  const data = addMemberSchema.parse(input);

  const project = await findProjectById(data.projectId);
  if (!project) throw new NotFoundError("Proyecto");

  const role = await deriveProjectRole(user.id, project);
  if (!canAddMember(role, project.archived)) {
    throw new ForbiddenError("Solo el jefe puede añadir miembros");
  }

  const targetUser = await findUserByEmail(data.userEmail);
  if (!targetUser) {
    throw new BusinessRuleError("No existe un usuario con ese correo");
  }

  if (targetUser.id === project.ownerId) {
    throw new BusinessRuleError("El jefe ya es miembro implícito");
  }

  const existing = await findMembership({
    projectId: data.projectId,
    userId: targetUser.id,
  });
  if (existing) {
    throw new BusinessRuleError("El usuario ya es miembro del proyecto");
  }

  const membership = await addMembership({
    projectId: data.projectId,
    userId: targetUser.id,
  });

  revalidatePath(`/projects/${data.projectId}`);
  return membership;
});

export const removeMember = withAction(async (input: unknown) => {
  const user = await requireUser();
  const data = removeMemberSchema.parse(input);

  const project = await findProjectById(data.projectId);
  if (!project) throw new NotFoundError("Proyecto");

  const role = await deriveProjectRole(user.id, project);
  if (!canRemoveMember(role, data.userId, project.ownerId, project.archived)) {
    throw new ForbiddenError("No puedes dar de baja a este miembro");
  }

  const membership = await findMembership({
    projectId: data.projectId,
    userId: data.userId,
  });
  if (!membership) {
    throw new NotFoundError("Membresía");
  }

  // Atomic: reassign tasks to owner, then remove membership.
  await prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: {
        projectId: data.projectId,
        assigneeId: data.userId,
      },
      data: {
        assigneeId: project.ownerId,
      },
    });

    await tx.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: data.projectId,
          userId: data.userId,
        },
      },
    });
  });

  revalidatePath(`/projects/${data.projectId}`);
  return { projectId: data.projectId, userId: data.userId };
});
