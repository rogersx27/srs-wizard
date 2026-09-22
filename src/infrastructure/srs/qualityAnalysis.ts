import { z } from "zod";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import type { TraceableRequirement } from "./RequirementIdGenerator";
import { withTimeout } from "../ai/withTimeout.ts";

const TIMEOUT_MS = 10_000;

export type QualityFindingType = "vagueness" | "duplicate" | "missing_priority";

export interface QualityFinding {
  type: QualityFindingType;
  message: string;
  requirementIds: string[];
}

export interface QualityAnalysisResult {
  findings: QualityFinding[];
  aiAvailable: boolean;
}

const aiFindingsSchema = z.array(
  z.object({
    type: z.enum(["vagueness", "duplicate"]),
    requirementIds: z.array(z.string()).min(1),
    message: z.string().min(1),
  })
);

export function findMissingPriority(requirements: TraceableRequirement[]): QualityFinding[] {
  return requirements
    .filter((requirement) => requirement.priority === null)
    .map((requirement) => ({
      type: "missing_priority" as const,
      message: `El requisito ${requirement.id} no tiene una prioridad asignada.`,
      requirementIds: [requirement.id],
    }));
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export function parseAiFindings(raw: string, validIds: ReadonlySet<string>): QualityFinding[] {
  try {
    const parsed = JSON.parse(stripCodeFence(raw));
    const result = aiFindingsSchema.safeParse(parsed);
    if (!result.success) return [];

    return result.data
      .map((finding) => ({
        ...finding,
        requirementIds: finding.requirementIds.filter((id) => validIds.has(id)),
      }))
      .filter((finding) => finding.requirementIds.length > 0);
  } catch {
    return [];
  }
}

function buildPrompt(requirements: TraceableRequirement[]): string {
  const list = requirements.map((requirement) => `${requirement.id} | ${requirement.category} | ${requirement.text}`).join("\n");

  return (
    "Eres un analista de requisitos de software revisando una Especificación de Requisitos de Software " +
    "(IEEE 830). A continuación tienes una lista de requisitos, cada uno con su ID, categoría y texto. " +
    "Identifica dos tipos de problemas:\n\n" +
    '1. "vagueness": el texto usa cualidades subjetivas sin una métrica verificable (ej. "rápido", "fácil", ' +
    '"seguro", "intuitivo") sin especificar cómo se mediría.\n' +
    '2. "duplicate": dos o más requisitos (aunque estén en categorías distintas) expresan esencialmente la ' +
    "misma necesidad.\n\n" +
    "Usa ÚNICAMENTE los IDs de la lista de abajo, nunca inventes requisitos ni IDs que no existan. Si no " +
    "encuentras ningún problema, responde con un arreglo vacío.\n\n" +
    "Responde SOLO con un arreglo JSON válido, sin explicación adicional ni cercado de código, con este " +
    "formato exacto:\n" +
    '[{"type": "vagueness" | "duplicate", "requirementIds": ["ID1", "ID2"], "message": "explicación breve en español"}]\n\n' +
    `Requisitos (ID | categoría | texto):\n${list}`
  );
}

export async function analyzeWithAi(
  assistant: IAiAssistant,
  requirements: TraceableRequirement[]
): Promise<QualityAnalysisResult> {
  if (requirements.length === 0) {
    return { findings: [], aiAvailable: false };
  }

  const validIds = new Set(requirements.map((requirement) => requirement.id));

  try {
    const raw = await withTimeout(
      assistant.complete(buildPrompt(requirements), { maxOutputTokens: 1024 }),
      TIMEOUT_MS
    );
    return { findings: parseAiFindings(raw, validIds), aiAvailable: true };
  } catch (error) {
    console.error("[qualityAnalysis] no se pudo completar el análisis con IA:", error);
    return { findings: [], aiAvailable: false };
  }
}
