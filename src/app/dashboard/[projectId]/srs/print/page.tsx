import { notFound } from "next/navigation";
import { container } from "@/container/di";
import { MarkdownView } from "@/components/srs/MarkdownView";

export default async function SrsPrintPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const result = await container.generateSrsDocument.execute(projectId).catch(() => null);
  if (!result) notFound();

  return (
    <div className="markdown-body mx-auto max-w-3xl bg-white p-10">
      <MarkdownView markdown={result.markdown} />
    </div>
  );
}
