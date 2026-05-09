/**
 * Single task row in the tasks table.
 *
 * Server Component: receives all data including assignee name pre-loaded.
 * Decides per-row whether the current user can edit/delete the task.
 */

import { TaskActions } from "./TaskActions";
import type { TaskStatus, TaskPriority } from "@/generated/prisma";

type TaskRowProps = {
  task: {
    id: string;
    name: string;
    status: TaskStatus;
    priority: TaskPriority;
    creatorId: string;
    assigneeId: string;
  };
  assigneeName: string;
  canEdit: boolean;
  canDelete: boolean;
};

export function TaskRow({ task, assigneeName, canEdit, canDelete }: TaskRowProps) {
  return (
    <tr className="border-b">
      <td className="py-2 pl-7 pr-4 align-middle">
        <p className="text-sm font-medium leading-snug">{task.name}</p>
      </td>
      <td className="px-4 py-2 text-sm text-muted-foreground align-middle leading-snug">
        {assigneeName}
      </td>
      <td className="py-2 pr-6 pl-4 align-middle">
        <TaskActions
          task={task}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </td>
    </tr>
  );
}
