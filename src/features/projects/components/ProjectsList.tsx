/**
 * Server Component that renders the list of projects for the current user.
 *
 * Receives projects pre-loaded from the page component (parent does the auth +
 * fetch). Shows an empty-state message if there are no projects.
 */

import { ProjectCard } from "./ProjectCard";

type ProjectsListProps = {
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    archived: boolean;
    ownerId: string;
  }>;
  currentUserId: string;
};

export function ProjectsList({ projects, currentUserId }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Aún no tienes proyectos. Crea el primero para empezar a gestionar tus tareas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
