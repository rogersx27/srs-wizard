import clsx from "clsx";
import type { ProjectStatus } from "@/domain/entities/Project";

const LABELS: Record<ProjectStatus, string> = {
  NOT_STARTED: "No iniciado",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completo",
};

const STYLES: Record<ProjectStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
