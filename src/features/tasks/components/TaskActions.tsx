"use client";

/**
 * Inline actions for a single task: status select, priority select, delete button.
 *
 * Renders only the controls the user is permitted to use:
 *  - Owner can edit any task.
 *  - Member can edit only their own (creatorId === userId).
 *  - On archived projects, no controls are rendered (read-only).
 *  - Outsiders never reach this UI (parent layer redirects).
 */

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTask, deleteTask } from "@/features/tasks/server/actions";
import {
  TaskPriorityEnum,
  TaskStatusEnum,
} from "@/features/tasks/validation";
import type { TaskStatus, TaskPriority } from "@/generated/prisma";

type TaskActionsProps = {
  task: {
    id: string;
    name: string;
    status: TaskStatus;
    priority: TaskPriority;
    creatorId: string;
  };
  canEdit: boolean;
  canDelete: boolean;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export function TaskActions({ task, canEdit, canDelete }: TaskActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(value: string | null) {
    if (value === null) return;
    const parsed = TaskStatusEnum.safeParse(value);
    if (!parsed.success) return;
    startTransition(async () => {
      const result = await updateTask({
        taskId: task.id,
        status: parsed.data,
      });
      if (!result.ok) alert(result.error.message);
    });
  }

  function handlePriorityChange(value: string | null) {
    if (value === null) return;
    const parsed = TaskPriorityEnum.safeParse(value);
    if (!parsed.success) return;
    startTransition(async () => {
      const result = await updateTask({
        taskId: task.id,
        priority: parsed.data,
      });
      if (!result.ok) alert(result.error.message);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar la tarea "${task.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteTask({ taskId: task.id });
      if (!result.ok) alert(result.error.message);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={task.status}
        onValueChange={handleStatusChange}
        disabled={!canEdit || isPending}
      >
        <SelectTrigger size="sm" className="w-32">
          <SelectValue>{STATUS_LABELS[task.status]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={task.priority}
        onValueChange={handlePriorityChange}
        disabled={!canEdit || isPending}
      >
        <SelectTrigger size="sm" className="w-24">
          <SelectValue>{PRIORITY_LABELS[task.priority]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
            <SelectItem key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Eliminar tarea"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
