/**
 * Local structural types for project domain logic.
 *
 * These types describe the minimum shape required by pure domain functions.
 * They are intentionally decoupled from Prisma models so the domain can be
 * tested without database fixtures and reused across server, GraphQL, and UI layers.
 */

export type ProjectLike = {
  id: string;
  ownerId: string;
  archived: boolean;
};

/**
 * Role of a user with respect to a specific project.
 *
 * - "owner": current owner of the project (only one at a time).
 * - "member": user is in ProjectMember table for this project.
 * - "outsider": user has no relation to the project.
 */
export type ProjectRole = "owner" | "member" | "outsider";
