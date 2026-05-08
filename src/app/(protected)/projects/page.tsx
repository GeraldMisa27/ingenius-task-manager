/**
 * Projects page placeholder.
 *
 * Real implementation comes in Phase 10. This stub confirms the auth flow
 * works end-to-end: login redirects here and the user can see their session.
 */

import { auth } from "@/core/auth/auth";

export default async function ProjectsPage() {
  const session = await auth();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mis proyectos</h1>
      <p className="text-muted-foreground">
        Bienvenido, {session?.user?.name}. La lista de proyectos se mostrará aquí
        en la siguiente fase.
      </p>
    </div>
  );
}
