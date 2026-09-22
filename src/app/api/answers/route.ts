import { NextResponse } from "next/server";
import { container } from "@/container/di";
import { answerBodySchema } from "./schema";

export async function PATCH(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = answerBodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  try {
    const answer = await container.saveAnswer.execute(parsed.data);
    return NextResponse.json({ answer: answer.toJSON() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la respuesta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
