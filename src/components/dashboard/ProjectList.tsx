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
          <div>
            <Link href={`/dashboard/${project.id}`} className="font-medium text-slate-900 hover:underline">
              {project.clientName}
            </Link>
            <div className="mt-1">
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CopyLinkButton slug={project.slug} />
            <Link
              href={`/dashboard/${project.id}`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-[transform,background-color] duration-150 ease-out hover:bg-slate-50 active:scale-[0.97]"
            >
              Ver detalle
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
