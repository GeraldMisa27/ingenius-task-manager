/**
 * Tasks table for a single project. Receives data pre-loaded from the page.
 *
 * Renders an empty state if there are no tasks. Each row renders inline
 * controls visible only to authorized users (computed by parent).
 */

import { TaskRow } from "./TaskRow";
import type { TaskStatus, TaskPriority } from "@/generated/prisma";

type TasksListProps = {
  tasks: Array<{
    id: string;
    name: string;
    status: TaskStatus;
    priority: TaskPriority;
    creatorId: string;
    assigneeId: string;
  }>;
  membersById: Record<string, { name: string }>;
  currentUserId: string;
  isOwner: boolean;
  isArchived: boolean;
};

export function TasksList({
  tasks,
  membersById,
  currentUserId,
  isOwner,
  isArchived,
}: TasksListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Este proyecto aún no tiene tareas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <table className="w-full">
        <thead className="bg-muted/50 text-left text-sm">
          <tr>
            <th className="pl-7 pr-4 py-2 font-medium">Nombre</th>
            <th className="px-4 py-2 font-medium">Asignado a</th>
            <th className="pr-6 pl-4 py-2 font-medium">Estado / Prioridad</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isCreator = task.creatorId === currentUserId;
            const canEdit = !isArchived && (isOwner || isCreator);
            const canDelete = canEdit;
            const assigneeName = membersById[task.assigneeId]?.name ?? "Desconocido";

            return (
              <TaskRow
                key={task.id}
                task={task}
                assigneeName={assigneeName}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
