/**
 * Project detail page.
 *
 * Server Component that:
 *  - Verifies access (redirects outsiders to the dashboard).
 *  - Loads project, members, and tasks in parallel.
 *  - Renders members and tasks sections with role-based controls.
 */

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/core/auth/auth";
import { Badge } from "@/components/ui/badge";
import { findProjectById } from "@/features/projects/server/repository";
import { findUserById } from "@/features/auth/server/repository";
import { findMembersByProject } from "@/features/members/server/repository";
import { findTasksByProject } from "@/features/tasks/server/repository";
import { deriveProjectRole } from "@/core/server/projectRole";
import { MembersList } from "@/features/members/components/MembersList";
import { AddMemberDialog } from "@/features/members/components/AddMemberDialog";
import { TasksList } from "@/features/tasks/components/TasksList";
import { CreateTaskDialog } from "@/features/tasks/components/CreateTaskDialog";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const project = await findProjectById(id);
  if (!project) notFound();

  const role = await deriveProjectRole(userId, project);
  if (role === "outsider") {
    redirect("/projects");
  }

  const [owner, members, tasks] = await Promise.all([
    findUserById(project.ownerId),
    findMembersByProject(id),
    findTasksByProject(id),
  ]);

  if (!owner) notFound();

  const isOwner = role === "owner";

  // Build a name lookup for the tasks list (assignee names).
  const membersById: Record<string, { name: string }> = {
    [owner.id]: { name: owner.name },
  };
  for (const m of members) {
    membersById[m.user.id] = { name: m.user.name };
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver a proyectos
        </Link>
      </div>

      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.archived && <Badge variant="secondary">Archivado</Badge>}
              {isOwner && <Badge variant="outline">Jefe</Badge>}
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-lg border bg-background p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Miembros</h2>
          {isOwner && !project.archived && <AddMemberDialog projectId={id} />}
        </div>
        <MembersList
          projectId={id}
          owner={owner}
          members={members}
          currentUserId={userId}
          isArchived={project.archived}
        />
      </section>

      <section className="rounded-lg border bg-background p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tareas</h2>
          {!project.archived && <CreateTaskDialog projectId={id} />}
        </div>
        <TasksList
          tasks={tasks}
          membersById={membersById}
          currentUserId={userId}
          isOwner={isOwner}
          isArchived={project.archived}
        />
      </section>
    </div>
  );
}
