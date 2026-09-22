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
      <Link href="/dashboard" className="inline-flex min-h-11 items-center text-sm text-slate-600 hover:underline">
        ← Volver
      </Link>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="min-w-0 break-words text-2xl font-semibold text-slate-900">{project.clientName}</h1>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <p className="text-sm text-slate-500">Enlace para el cliente</p>
        <div className="mt-2 flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link href={`/s/${project.slug}`} className="min-w-0 flex-1 break-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-blue-700 underline">
            /s/{project.slug}
          </Link>
          <CopyLinkButton slug={project.slug} />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Progreso: {progress.answered} de {progress.total} preguntas ({progress.percent}%)
        </p>
        <progress
          className="ui-progress mt-2"
          max={100}
          value={progress.percent}
          aria-label={`Progreso de ${project.clientName}`}
          aria-valuetext={`${progress.answered} de ${progress.total} preguntas respondidas`}
        />
      </div>

      <div className="mt-6">
        <Link
          href={`/dashboard/${project.id}/srs`}
          className="ui-button ui-button-primary"
        >
          Ver SRS compilado
        </Link>
      </div>
    </div>
  );
}
