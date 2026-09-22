import { notFound } from "next/navigation";
import Link from "next/link";
import { container } from "@/container/di";
import { QualityFindingBadge } from "@/components/dashboard/QualityFindingBadge";

export default async function QualityPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const report = await container.analyzeSrsQuality.execute(projectId).catch(() => null);
  if (!report) notFound();

  return (
    <div>
      <Link href={`/dashboard/${projectId}`} className="inline-flex min-h-11 items-center text-sm text-slate-600 hover:underline">
        ← Volver
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Revisión de calidad</h1>
      <p className="mt-1 text-sm text-slate-600">
        Advertencias sobre los requisitos extraídos. Es solo informativo — no bloquea completar el proyecto ni cambia el documento SRS.
      </p>

      {report.totalRequirements === 0 ? (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600" role="status">
          Todavía no hay requisitos para revisar.
        </p>
      ) : report.findings.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700" role="status">
          Sin advertencias sobre los {report.totalRequirements} requisitos actuales.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {report.findings.map((finding) => (
            <li key={`${finding.type}-${finding.requirementIds.join(",")}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <QualityFindingBadge type={finding.type} />
              <p className="mt-2 text-sm text-slate-700">{finding.message}</p>
              <p className="mt-1 text-xs text-slate-500">Requisitos: {finding.requirementIds.join(", ")}</p>
            </li>
          ))}
        </ul>
      )}

      {!report.aiAvailable && report.totalRequirements > 0 && (
        <p className="mt-4 text-sm text-slate-500" role="status">
          Nota: la revisión de vaguedad y posibles duplicados con IA no está disponible en este momento; solo se muestran advertencias de prioridad faltante.
        </p>
      )}
    </div>
  );
}
