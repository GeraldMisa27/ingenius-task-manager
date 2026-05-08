/**
 * Local structural types for task domain logic.
 *
 * Same philosophy as project types: minimum shape needed by pure domain
 * functions, decoupled from Prisma so tests run without fixtures.
 */

export type TaskLike = {
  id: string;
  projectId: string;
  assigneeId: string;
  creatorId: string;
};
