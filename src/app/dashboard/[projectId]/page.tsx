import { notFound } from "next/navigation";
import Link from "next/link";
import { container } from "@/container/di";
import { ProjectStatusBadge } from "@/components/dashboard/ProjectStatusBadge";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await container.getProjectById.execute(projectId);
  if (!project) notFound();

  const progress = await container.computeWizardProgress.execute(project.id);

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
        ← Volver
      </Link>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{project.clientName}</h1>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Enlace para el cliente</p>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-sm">/s/{project.slug}</code>
          <CopyLinkButton slug={project.slug} />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Progreso: {progress.answered} de {progress.total} preguntas ({progress.percent}%)
        </p>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={`Progreso de ${project.clientName}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          aria-valuetext={`${progress.answered} de ${progress.total} preguntas respondidas`}
        >
          <div className="h-full bg-slate-900" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/dashboard/${project.id}/srs`}
          className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ver SRS compilado
        </Link>
      </div>
    </div>
  );
}
