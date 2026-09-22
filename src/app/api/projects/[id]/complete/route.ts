import { NextResponse } from "next/server";
import { container } from "@/container/di";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const project = await container.markProjectCompleted.execute(id);
    return NextResponse.json({ project: project.toJSON() });
  } catch {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }
}
