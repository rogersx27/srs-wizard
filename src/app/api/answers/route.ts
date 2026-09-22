import { NextResponse } from "next/server";
import { z } from "zod";
import { container } from "@/container/di";

const bodySchema = z.object({
  projectId: z.string().min(1),
  questionId: z.string().min(1),
  valueText: z.string().nullable().optional(),
  valueList: z.array(z.string()).nullable().optional(),
  priority: z.enum(["ESSENTIAL", "CONDITIONAL", "OPTIONAL"]).nullable().optional(),
});

export async function PATCH(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

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
