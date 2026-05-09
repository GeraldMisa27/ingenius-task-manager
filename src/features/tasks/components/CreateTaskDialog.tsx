"use client";

/**
 * Modal dialog with the form to create a task in the current project.
 * Tasks self-assign to the creator (business rule enforced in the action).
 */

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { z } from "zod";
import {
  createTaskSchema,
  TaskPriorityEnum,
} from "@/features/tasks/validation";
import { createTask } from "@/features/tasks/server/actions";
import { TASK_NAME_MAX_LEN, TASK_NAME_MIN_LEN } from "@/shared/validation/limits";
import type { TaskPriority } from "@/generated/prisma";

type CreateTaskFormValues = z.input<typeof createTaskSchema>;

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

type CreateTaskDialogProps = {
  projectId: string;
};

export function CreateTaskDialog({ projectId }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId,
      name: "",
      priority: "MEDIUM",
    },
  });

  function onSubmit(data: CreateTaskFormValues) {
    setServerError(null);
    startTransition(async () => {
      const payload = createTaskSchema.parse(data);
      const result = await createTask(payload);
      if (!result.ok) {
        setServerError(result.error.message);
        return;
      }
      reset({ projectId, name: "", priority: "MEDIUM" });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear tarea</DialogTitle>
          <DialogDescription>
            La tarea se asignará automáticamente a ti como creador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("projectId")} />
          <div className="space-y-2">
            <Label htmlFor="task-name">Nombre</Label>
            <Input
              id="task-name"
              type="text"
              placeholder="Describe la tarea"
              autoComplete="off"
              required
              minLength={TASK_NAME_MIN_LEN}
              maxLength={TASK_NAME_MAX_LEN}
              {...register("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-priority">Prioridad</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => {
                const priorityRaw = field.value ?? "MEDIUM";
                const priorityParsed = TaskPriorityEnum.safeParse(priorityRaw);
                const priorityLabel = priorityParsed.success
                  ? PRIORITY_LABELS[priorityParsed.data]
                  : PRIORITY_LABELS.MEDIUM;

                return (
                  <Select
                    value={field.value ?? "MEDIUM"}
                    onValueChange={(value: string | null) => {
                      if (value === null) return;
                      const parsed = TaskPriorityEnum.safeParse(value);
                      if (!parsed.success) return;
                      field.onChange(parsed.data);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="task-priority">
                      <SelectValue>{priorityLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baja</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                );
              }}
            />
          </div>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
