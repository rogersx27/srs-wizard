import { notFound } from "next/navigation";
import Link from "next/link";
import { container } from "@/container/di";
import { MarkdownView } from "@/components/srs/MarkdownView";

export default async function SrsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const result = await container.generateSrsDocument.execute(projectId).catch(() => null);
  if (!result) notFound();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/dashboard/${projectId}`} className="inline-flex min-h-11 items-center text-sm text-slate-600 hover:underline">
          ← Volver
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/${projectId}/srs/print`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vista de impresión (se abre en una pestaña nueva)"
            className="ui-button ui-button-secondary"
          >
            Vista de impresión
          </Link>
          <Link
            href={`/dashboard/${projectId}/download`}
            className="ui-button ui-button-primary"
          >
            Descargar .md
          </Link>
        </div>
      </div>

      <article className="markdown-body mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-8">
        <MarkdownView markdown={result.markdown} />
      </article>
    </div>
  );
}
