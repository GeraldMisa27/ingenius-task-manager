"use client";

/**
 * Modal dialog with the form to add a member by email to the current project.
 * The target user must already exist (registered in the system).
 */

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  addMemberSchema,
  type AddMemberInput,
} from "@/features/members/validation";
import { addMember } from "@/features/members/server/actions";
import { EMAIL_MAX_LEN } from "@/shared/validation/limits";

type AddMemberDialogProps = {
  projectId: string;
};

export function AddMemberDialog({ projectId }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { projectId, userEmail: "" },
  });

  function onSubmit(data: AddMemberInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await addMember(data);
      if (!result.ok) {
        setServerError(result.error.message);
        return;
      }
      reset({ projectId, userEmail: "" });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Añadir miembro
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir miembro</DialogTitle>
          <DialogDescription>
            El usuario debe estar registrado en la plataforma.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("projectId")} />
          <div className="space-y-2">
            <Label htmlFor="member-email">Correo electrónico</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="usuario@correo.com"
              autoComplete="email"
              required
              maxLength={EMAIL_MAX_LEN}
              {...register("userEmail")}
              disabled={isPending}
            />
            {errors.userEmail && (
              <p className="text-sm text-destructive">
                {errors.userEmail.message}
              </p>
            )}
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
              {isPending ? "Añadiendo..." : "Añadir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
