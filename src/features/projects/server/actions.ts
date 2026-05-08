"use server";

/**
 * Server Actions for the projects feature.
 *
 * Each action follows the standard sequence:
 *  requireUser → parse Zod → load state → derive role → check permission →
 *  mutate (transactional if needed) → revalidatePath → return.
 */

import { revalidatePath } from "next/cache";
import { withAction } from "@/core/server/withAction";
import { requireUser } from "@/core/auth/helpers";
import { deriveProjectRole } from "@/core/server/projectRole";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "@/core/errors";
import {
  createProjectSchema,
  updateProjectSchema,
  transferOwnershipSchema,
} from "@/features/projects/validation";
import {
  canArchiveProject,
  canDeleteProject,
  canEditProject,
  canTransferOwnership,
  canUnarchiveProject,
} from "@/features/projects/domain/permissions";
import {
  archiveProject as archiveProjectRepo,
  createProject as createProjectRepo,
  deleteProject as deleteProjectRepo,
  findProjectById,
  transferProjectOwnership,
  unarchiveProject as unarchiveProjectRepo,
  updateProject as updateProjectRepo,
} from "./repository";
import { findMembership } from "@/features/members/server/repository";

export const createProject = withAction(async (input: unknown) => {
  const user = await requireUser();
  const data = createProjectSchema.parse(input);

  const project = await createProjectRepo({
    name: data.name,
    description: data.description ?? undefined,
    ownerId: user.id,
  });

  revalidatePath("/projects");
  return project;
});

export const updateProject = withAction(
  async (input: { id: string } & unknown) => {
    const user = await requireUser();
    const data = updateProjectSchema.parse(input);
    const id = (input as { id: string }).id;

    const project = await findProjectById(id);
    if (!project) throw new NotFoundError("Proyecto");

    const role = await deriveProjectRole(user.id, project);
    if (!canEditProject(role, project)) {
      throw new ForbiddenError("Solo el jefe puede editar este proyecto");
    }

    const updated = await updateProjectRepo({
      id,
      name: data.name,
      description: data.description ?? undefined,
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    return updated;
  },
);

export const archiveProject = withAction(async (input: { projectId: string }) => {
  const user = await requireUser();

  const project = await findProjectById(input.projectId);
  if (!project) throw new NotFoundError("Proyecto");

  const role = await deriveProjectRole(user.id, project);
  if (!canArchiveProject(role, project)) {
    throw new ForbiddenError("Solo el jefe puede archivar este proyecto");
  }

  const updated = await archiveProjectRepo(input.projectId);

  revalidatePath("/projects");
  revalidatePath(`/projects/${input.projectId}`);
  return updated;
});

export const unarchiveProject = withAction(
  async (input: { projectId: string }) => {
    const user = await requireUser();

    const project = await findProjectById(input.projectId);
    if (!project) throw new NotFoundError("Proyecto");

    const role = await deriveProjectRole(user.id, project);
    if (!canUnarchiveProject(role, project)) {
      throw new ForbiddenError("Solo el jefe puede desarchivar este proyecto");
    }

    const updated = await unarchiveProjectRepo(input.projectId);

    revalidatePath("/projects");
    revalidatePath(`/projects/${input.projectId}`);
    return updated;
  },
);

export const deleteProject = withAction(async (input: { projectId: string }) => {
  const user = await requireUser();

  const project = await findProjectById(input.projectId);
  if (!project) throw new NotFoundError("Proyecto");

  const role = await deriveProjectRole(user.id, project);
  if (!canDeleteProject(role, project)) {
    throw new ForbiddenError("Solo el jefe puede eliminar este proyecto");
  }

  await deleteProjectRepo(input.projectId);

  revalidatePath("/projects");
  return { id: input.projectId };
});

export const transferOwnership = withAction(async (input: unknown) => {
  const user = await requireUser();
  const data = transferOwnershipSchema.parse(input);

  const project = await findProjectById(data.projectId);
  if (!project) throw new NotFoundError("Proyecto");

  const role = await deriveProjectRole(user.id, project);
  if (!canTransferOwnership(role, project)) {
    throw new ForbiddenError("Solo el jefe puede transferir la propiedad");
  }

  if (data.newOwnerId === user.id) {
    throw new BusinessRuleError("No puedes transferir el proyecto a ti mismo");
  }

  // The new owner must currently be a member of the project.
  const newOwnerMembership = await findMembership({
    projectId: data.projectId,
    userId: data.newOwnerId,
  });
  if (!newOwnerMembership) {
    throw new BusinessRuleError("El nuevo jefe debe ser miembro del proyecto");
  }

  const updated = await transferProjectOwnership({
    projectId: data.projectId,
    previousOwnerId: user.id,
    newOwnerId: data.newOwnerId,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${data.projectId}`);
  return updated;
});
