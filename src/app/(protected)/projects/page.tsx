/**
 * Projects dashboard page.
 *
 * Server Component that fetches the user's projects and renders the list
 * with create/edit/archive/delete capabilities (the latter visible only
 * for owners).
 */

import { auth } from "@/core/auth/auth";
import { findProjectsForUser } from "@/features/projects/server/repository";
import { CreateProjectDialog } from "@/features/projects/components/CreateProjectDialog";
import { ProjectsList } from "@/features/projects/components/ProjectsList";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user.id; // protected layout guarantees session exists.

  const projects = await findProjectsForUser(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis proyectos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los proyectos donde eres jefe o miembro.
          </p>
        </div>
        <CreateProjectDialog />
      </div>
      <ProjectsList projects={projects} currentUserId={userId} />
    </div>
  );
}
