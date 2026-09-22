export interface AiEvaluationQuestion {
  /** Pregunta de sí/no sobre el estado compartido. */
  instructions: string;
}

/**
 * Modelo de evaluación (ej. Jev en Vercel AI Gateway): no genera texto, solo juzga
 * un estado compartido contra preguntas tipadas. Devuelve, por cada pregunta, la
 * probabilidad (0 a 1) de que la respuesta sea "sí".
 */
export interface IAiEvaluator {
  /** Identifica el modelo, para que sus resultados cacheados no se mezclen con los de otro. */
  readonly modelId: string;
  evaluateBooleans(
    state: string | readonly Record<string, string>[],
    questions: Record<string, AiEvaluationQuestion>
  ): Promise<Record<string, number>>;
}
