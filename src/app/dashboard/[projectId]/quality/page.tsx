import { notFound } from "next/navigation";
import Link from "next/link";
import { container } from "@/container/di";
import { QualityDocumentReview } from "@/components/dashboard/QualityDocumentReview";
import { aiUnavailableNotice } from "@/components/dashboard/qualityReview";

export default async function QualityPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const [report, srs] = await Promise.all([
    container.analyzeSrsQuality.execute(projectId).catch(() => null),
    container.generateSrsDocument.execute(projectId).catch(() => null),
  ]);
  if (!report || !srs) notFound();
  const aiNotice = report.totalRequirements > 0 ? aiUnavailableNotice(report.unavailableAiChecks) : null;

  return (
    <div>
      <Link href={`/dashboard/${projectId}`} className="inline-flex min-h-11 items-center text-sm text-slate-600 hover:underline">
        ← Volver
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Revisión de calidad</h1>
      <p className="mt-1 text-sm text-slate-600">
        Advertencias sobre los requisitos extraídos, junto al documento SRS completo. Es solo informativo — no bloquea completar el proyecto ni cambia el documento SRS.
      </p>

      {aiNotice && (
        <p className="mt-4 text-sm text-slate-500" role="status">
          {aiNotice}
        </p>
      )}

      <QualityDocumentReview
        markdown={srs.markdown}
        findings={report.findings}
        requirements={report.requirements.map(({ id, text }) => ({ id, text }))}
      />
    </div>
  );
}
