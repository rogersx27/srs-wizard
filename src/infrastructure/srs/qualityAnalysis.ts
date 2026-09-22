import { z } from "zod";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import type { IAiEvaluator } from "@/domain/ports/IAiEvaluator";
import type { TraceableRequirement } from "./RequirementIdGenerator";
import { withTimeout } from "../ai/withTimeout.ts";
import { hashContent } from "../ai/contentHash.ts";

const TIMEOUT_MS = 10_000;
// Probabilidad mínima que debe dar el modelo de evaluación para marcar un requisito
// como vago -- por encima de 0.5 para no llenar la revisión de falsos positivos.
const VAGUENESS_THRESHOLD = 0.7;

export type AiCheck = "vagueness" | "duplicate";

export type QualityFindingType = "vagueness" | "duplicate" | "missing_priority";

export interface QualityFinding {
  type: QualityFindingType;
  message: string;
  requirementIds: string[];
}

export interface QualityAnalysisResult {
  findings: QualityFinding[];
  /** True solo si todos los chequeos de IA respondieron -- decide si se cachea. */
  aiAvailable: boolean;
  /** Chequeos de IA que fallaron; sus advertencias faltan en `findings`. */
  unavailableAiChecks: AiCheck[];
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

const CHECK_DESCRIPTIONS: Record<AiCheck, string> = {
  vagueness:
    '"vagueness": el texto usa cualidades subjetivas sin una métrica verificable (ej. "rápido", "fácil", ' +
    '"seguro", "intuitivo") sin especificar cómo se mediría.',
  duplicate:
    '"duplicate": dos o más requisitos (aunque estén en categorías distintas) expresan esencialmente la ' +
    "misma necesidad.",
};

function buildPrompt(requirements: TraceableRequirement[], checks: AiCheck[]): string {
  const list = requirements.map((requirement) => `${requirement.id} | ${requirement.category} | ${requirement.text}`).join("\n");
  const problems = checks.map((check, index) => `${index + 1}. ${CHECK_DESCRIPTIONS[check]}`).join("\n");
  const types = checks.map((check) => `"${check}"`).join(" | ");

  return (
    "Eres un analista de requisitos de software revisando una Especificación de Requisitos de Software " +
    "(IEEE 830). A continuación tienes una lista de requisitos, cada uno con su ID, categoría y texto. " +
    `Identifica ${checks.length === 1 ? "este tipo de problema" : "estos tipos de problemas"}:\n\n` +
    `${problems}\n\n` +
    "Usa ÚNICAMENTE los IDs de la lista de abajo, nunca inventes requisitos ni IDs que no existan. Si no " +
    "encuentras ningún problema, responde con un arreglo vacío.\n\n" +
    "Responde SOLO con un arreglo JSON válido, sin explicación adicional ni cercado de código, con este " +
    "formato exacto:\n" +
    `[{"type": ${types}, "requirementIds": ["ID1", "ID2"], "message": "explicación breve en español"}]\n\n` +
    `Requisitos (ID | categoría | texto):\n${list}`
  );
}

async function findWithAssistant(
  assistant: IAiAssistant,
  requirements: TraceableRequirement[],
  checks: AiCheck[]
): Promise<QualityFinding[]> {
  const validIds = new Set(requirements.map((requirement) => requirement.id));
  const raw = await withTimeout(
    assistant.complete(buildPrompt(requirements, checks), { maxOutputTokens: 1024 }),
    TIMEOUT_MS
  );
  return parseAiFindings(raw, validIds).filter((finding) => checks.some((check) => check === finding.type));
}

/**
 * Detecta vaguedad con un modelo de evaluación (ej. Jev): una pregunta de sí/no por
 * requisito, todas en una sola llamada. El modelo no redacta texto, así que el
 * mensaje de cada advertencia es fijo.
 */
export async function findVaguenessWithEvaluator(
  evaluator: IAiEvaluator,
  requirements: TraceableRequirement[]
): Promise<QualityFinding[]> {
  const state = requirements.map(({ id, category, text }) => ({ id, category, text }));
  const questions = Object.fromEntries(
    requirements.map((requirement) => [
      requirement.id,
      {
        instructions:
          `¿El requisito ${requirement.id} usa cualidades subjetivas (ej. "rápido", "fácil", "seguro", ` +
          '"intuitivo") sin especificar una métrica verificable de cómo se mediría?',
      },
    ])
  );

  const probabilities = await withTimeout(evaluator.evaluateBooleans(state, questions), TIMEOUT_MS);

  return requirements
    .filter((requirement) => (probabilities[requirement.id] ?? 0) >= VAGUENESS_THRESHOLD)
    .map((requirement) => ({
      type: "vagueness" as const,
      message: `El requisito ${requirement.id} usa cualidades subjetivas sin una métrica verificable.`,
      requirementIds: [requirement.id],
    }));
}

/**
 * Identidad del caché de la revisión con IA. Sin evaluador conserva el hash de
 * siempre (no invalida cachés existentes); con evaluador incluye su modelo, para que
 * activar Jev o cambiar de modelo de evaluación no sirva una revisión hecha por otro.
 */
export function qualityCacheInputHash(requirements: TraceableRequirement[], evaluator?: IAiEvaluator): string {
  const content = requirements.map((requirement) => ({ id: requirement.id, text: requirement.text }));
  return evaluator ? hashContent({ requirements: content, vaguenessEvaluator: evaluator.modelId }) : hashContent(content);
}

/**
 * Con `evaluator`, la vaguedad la juzga el modelo de evaluación y el asistente solo
 * busca duplicados (en paralelo). Si uno de los dos falla, se muestran los hallazgos
 * que sí llegaron, el chequeo fallido queda en `unavailableAiChecks` y `aiAvailable`
 * en false para no cachear un resultado incompleto.
 */
export async function analyzeWithAi(
  assistant: IAiAssistant,
  requirements: TraceableRequirement[],
  evaluator?: IAiEvaluator
): Promise<QualityAnalysisResult> {
  if (requirements.length === 0) {
    return { findings: [], aiAvailable: false, unavailableAiChecks: [] };
  }

  const tasks: { checks: AiCheck[]; run: Promise<QualityFinding[]> }[] = evaluator
    ? [
        { checks: ["vagueness"], run: findVaguenessWithEvaluator(evaluator, requirements) },
        { checks: ["duplicate"], run: findWithAssistant(assistant, requirements, ["duplicate"]) },
      ]
    : [{ checks: ["vagueness", "duplicate"], run: findWithAssistant(assistant, requirements, ["vagueness", "duplicate"]) }];

  const results = await Promise.allSettled(tasks.map((task) => task.run));
  const findings: QualityFinding[] = [];
  const unavailableAiChecks: AiCheck[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      findings.push(...result.value);
    } else {
      unavailableAiChecks.push(...tasks[index].checks);
      console.error("[qualityAnalysis] no se pudo completar el análisis con IA:", result.reason);
    }
  });

  return { findings, aiAvailable: unavailableAiChecks.length === 0, unavailableAiChecks };
}
