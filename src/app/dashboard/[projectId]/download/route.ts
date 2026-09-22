import { NextResponse } from "next/server";
import { container } from "@/container/di";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const result = await container.generateSrsDocument.execute(projectId).catch(() => null);
  if (!result) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  return new NextResponse(result.markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.fileName}"`,
    },
  });
}
