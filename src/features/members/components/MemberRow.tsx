/**
 * Single row in the project members list. Shows email and name.
 * Renders the remove button only if the current user is the owner
 * and the row is not the owner's own row.
 */

import { Badge } from "@/components/ui/badge";
import { RemoveMemberButton } from "./RemoveMemberButton";

type MemberRowProps = {
  projectId: string;
  user: { id: string; email: string; name: string };
  isOwner: boolean;
  canRemove: boolean;
};

export function MemberRow({ projectId, user, isOwner, canRemove }: MemberRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 border-b px-6 py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-0.5 leading-tight">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <div className="flex items-center gap-2">
        {isOwner && <Badge variant="outline">Jefe</Badge>}
        {canRemove && (
          <RemoveMemberButton
            projectId={projectId}
            userId={user.id}
            userName={user.name}
          />
        )}
      </div>
    </li>
  );
}
