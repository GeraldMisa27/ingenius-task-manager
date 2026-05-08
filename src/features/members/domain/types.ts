/**
 * Local structural types for member domain logic.
 *
 * Membership represents a user being part of a project's member list.
 * The owner is implicitly a member but never inserted in the membership table
 * unless they transfer ownership and remain as a regular member afterwards.
 */

export type MembershipLike = {
  projectId: string;
  userId: string;
};
