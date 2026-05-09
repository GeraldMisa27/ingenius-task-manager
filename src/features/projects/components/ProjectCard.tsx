/**
 * Card representing a single project in the dashboard list.
 *
 * Server Component: receives all data pre-loaded from the parent.
 * Renders the actions menu only if the current user is the owner.
 */

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectActionsMenu } from "./ProjectActionsMenu";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    description: string | null;
    archived: boolean;
    ownerId: string;
  };
  currentUserId: string;
};

export function ProjectCard({ project, currentUserId }: ProjectCardProps) {
  const isOwner = project.ownerId === currentUserId;

  return (
    <Card className="relative group transition-all hover:shadow-md hover:border-slate-300">
      <Link
        href={`/projects/${project.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver detalle de ${project.name}`}
      />
      <CardHeader className="pb-3 relative z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {project.archived && <Badge variant="secondary">Archivado</Badge>}
              {isOwner && <Badge variant="outline">Jefe</Badge>}
            </div>
          </div>
          {isOwner && (
            <div className="relative z-20 pointer-events-auto">
              <ProjectActionsMenu project={project} />
            </div>
          )}
        </div>
      </CardHeader>
      {project.description && (
        <CardContent className="pt-0 relative z-10 pointer-events-none">
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
}
