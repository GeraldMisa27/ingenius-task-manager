/**
 * Layout for protected routes.
 *
 * Verifies session via auth() and redirects to /login if absent. The (protected)
 * route group does not appear in the URL but groups all routes that require
 * authentication.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/core/auth/auth";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/projects" className="text-lg font-semibold">
            Gestor de tareas
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
