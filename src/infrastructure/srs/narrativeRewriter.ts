import type { IAiAssistant } from "@/domain/ports/IAiAssistant";

const TIMEOUT_MS = 10_000;

export type NarrativeKind = "introduction" | "userDescription";

export interface NarrativeSource {
  readonly valueText: string | null;
  isEmpty(): boolean;
}

export interface NarrativeRewriteResult {
  text: string;
  usedAi: boolean;
  /** True when a rewrite was attempted (there was content to rewrite), regardless of outcome. */
  attempted: boolean;
}

const PROMPTS: Record<NarrativeKind, string> = {
  introduction:
    "Eres un redactor técnico que ayuda a convertir la respuesta de un cliente no técnico en la sección " +
    "'Introducción' de una Especificación de Requisitos de Software (IEEE 830). Reescribe el siguiente texto " +
    "en un tono claro, profesional y objetivo, en español, sin inventar información nueva ni agregar detalles " +
    "que el cliente no mencionó. Conserva el significado exacto. Responde solo con el párrafo reescrito, sin " +
    "encabezados ni comentarios adicionales.\n\nTexto del cliente:\n",
  userDescription:
    "Eres un redactor técnico que ayuda a convertir la respuesta de un cliente no técnico en la sección " +
    "'Descripción General' de una Especificación de Requisitos de Software (IEEE 830), específicamente sobre " +
    "quién usará el sistema. Reescribe el siguiente texto en un tono claro, profesional y objetivo, en español, " +
    "sin inventar información nueva ni agregar detalles que el cliente no mencionó. Conserva el significado " +
    "exacto. Responde solo con el párrafo reescrito, sin encabezados ni comentarios adicionales.\n\nTexto del cliente:\n",
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI request timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export async function resolveNarrativeSection(
  assistant: IAiAssistant,
  kind: NarrativeKind,
  answer: NarrativeSource | undefined,
  fallback = "No especificado."
): Promise<NarrativeRewriteResult> {
  if (!answer || answer.isEmpty() || !answer.valueText) {
    return { text: fallback, usedAi: false, attempted: false };
  }

  const raw = answer.valueText;

  try {
    const rewritten = await withTimeout(assistant.complete(PROMPTS[kind] + raw), TIMEOUT_MS);
    const trimmed = rewritten.trim();
    if (!trimmed) return { text: raw, usedAi: false, attempted: true };
    return { text: trimmed, usedAi: true, attempted: true };
  } catch (error) {
    console.error(`[narrativeRewriter] fallback a texto crudo para "${kind}":`, error);
    return { text: raw, usedAi: false, attempted: true };
  }
}
