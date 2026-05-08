/**
 * Login page (Server Component).
 *
 * Renders the login form inside a centered card layout. If the user arrives
 * with ?registered=1, shows a success message indicating the registration
 * completed and they should now sign in.
 */

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;
  const justRegistered = params.registered === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200/80">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tus proyectos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {justRegistered && (
            <Alert>
              <AlertDescription>
                Cuenta creada con éxito. Ahora inicia sesión.
              </AlertDescription>
            </Alert>
          )}
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
