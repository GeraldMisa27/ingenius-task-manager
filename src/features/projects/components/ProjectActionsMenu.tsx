"use client";

/**
 * Dropdown menu with owner-only actions for a project: edit, archive, delete.
 *
 * Uses useTransition to keep the UI responsive while server actions run.
 * Delete is disabled on archived projects (business rule: unarchive first).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  archiveProject,
  unarchiveProject,
  deleteProject,
} from "@/features/projects/server/actions";
import { EditProjectDialog } from "./EditProjectDialog";

type ProjectActionsMenuProps = {
  project: {
    id: string;
    name: string;
    description: string | null;
    archived: boolean;
  };
};

export function ProjectActionsMenu({ project }: ProjectActionsMenuProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveProject({ projectId: project.id });
      if (!result.ok) alert(result.error.message);
    });
  }

  function handleUnarchive() {
    startTransition(async () => {
      const result = await unarchiveProject({ projectId: project.id });
      if (!result.ok) alert(result.error.message);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar el proyecto "${project.name}"? Esta acción es irreversible.`)) return;
    startTransition(async () => {
      const result = await deleteProject({ projectId: project.id });
      if (!result.ok) {
        alert(result.error.message);
        return;
      }
      router.push("/projects");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Acciones del proyecto</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {!project.archived && (
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              Editar
            </DropdownMenuItem>
          )}
          {project.archived ? (
            <DropdownMenuItem onClick={handleUnarchive}>
              Desarchivar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleArchive}>
              Archivar
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={project.archived}
            className="text-destructive"
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProjectDialog
        project={project}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
