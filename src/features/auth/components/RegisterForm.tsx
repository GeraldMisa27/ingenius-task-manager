"use client";

/**
 * Registration form that calls the registerUser Server Action.
 *
 * On success, redirects to /login with a query flag so the login page can
 * show a "registration successful, please sign in" message.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerSchema, type RegisterInput } from "@/features/auth/validation";
import {
  EMAIL_MAX_LEN,
  PASSWORD_MAX_LEN,
  PASSWORD_MIN_LEN,
  USER_REGISTER_NAME_MAX_LEN,
  USER_REGISTER_NAME_MIN_LEN,
} from "@/shared/validation/limits";
import { registerUser } from "@/features/auth/server/actions";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    setIsSubmitting(true);

    const result = await registerUser(data);

    setIsSubmitting(false);

    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          type="text"
          placeholder="Tu nombre"
          autoComplete="name"
          required
          minLength={USER_REGISTER_NAME_MIN_LEN}
          maxLength={USER_REGISTER_NAME_MAX_LEN}
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          required
          maxLength={EMAIL_MAX_LEN}
          {...register("email")}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LEN}
          maxLength={PASSWORD_MAX_LEN}
          {...register("password")}
          disabled={isSubmitting}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Registrando..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
