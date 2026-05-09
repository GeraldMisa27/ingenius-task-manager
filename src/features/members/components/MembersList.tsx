/**
 * Members list for a project, including the owner as an implicit member.
 *
 * The owner is added on top with the "Jefe" badge. Other members are listed
 * below with their remove button visible only to the project owner.
 */

import { MemberRow } from "./MemberRow";

type MembersListProps = {
  projectId: string;
  owner: { id: string; email: string; name: string };
  members: Array<{ user: { id: string; email: string; name: string } }>;
  currentUserId: string;
  isArchived: boolean;
};

export function MembersList({
  projectId,
  owner,
  members,
  currentUserId,
  isArchived,
}: MembersListProps) {
  const currentIsOwner = owner.id === currentUserId;

  return (
    <ul className="rounded-lg border bg-background">
      <MemberRow
        projectId={projectId}
        user={owner}
        isOwner={true}
        canRemove={false}
      />
      {members.map((m) => (
        <MemberRow
          key={m.user.id}
          projectId={projectId}
          user={m.user}
          isOwner={false}
          canRemove={!isArchived && currentIsOwner}
        />
      ))}
      {members.length === 0 && (
        <li className="px-6 py-3 text-sm text-muted-foreground">
          El proyecto no tiene otros miembros aún.
        </li>
      )}
    </ul>
  );
}
