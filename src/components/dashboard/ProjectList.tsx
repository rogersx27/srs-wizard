import Link from "next/link";
import type { ProjectProps } from "@/domain/entities/Project";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { CopyLinkButton } from "./CopyLinkButton";

export function ProjectList({ projects }: { projects: ProjectProps[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {projects.map((project) => (
        <li
          key={project.id}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <Link href={`/dashboard/${project.id}`} className="break-words [overflow-wrap:anywhere] font-medium text-slate-900 hover:underline">
              {project.clientName}
            </Link>
            <div className="mt-1">
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>
          <div className="flex min-w-0 flex-wrap items-start gap-2 sm:max-w-[60%] sm:justify-end">
            <CopyLinkButton slug={project.slug} />
            <Link
              href={`/dashboard/${project.id}`}
              aria-label={`Ver detalle de ${project.clientName}`}
              className="ui-button ui-button-secondary shrink-0"
            >
              Ver detalle
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
