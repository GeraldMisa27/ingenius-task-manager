"use client";

/**
 * Button that removes a member from a project.
 *
 * Triggers the removeMember server action which transactionally reassigns
 * the removed user's tasks to the project owner before deleting the membership.
 */

import { useTransition } from "react";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeMember } from "@/features/members/server/actions";

type RemoveMemberButtonProps = {
  projectId: string;
  userId: string;
  userName: string;
};

export function RemoveMemberButton({
  projectId,
  userId,
  userName,
}: RemoveMemberButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (
      !confirm(
        `¿Dar de baja a ${userName}? Sus tareas se transferirán al jefe del proyecto.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await removeMember({ projectId, userId });
      if (!result.ok) alert(result.error.message);
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={isPending}
      aria-label={`Dar de baja a ${userName}`}
    >
      <UserMinus className="h-4 w-4 text-destructive" />
    </Button>
  );
}
