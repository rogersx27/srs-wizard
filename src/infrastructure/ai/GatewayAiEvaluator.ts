import { createGateway, experimental_evaluate as evaluate } from "ai";
import type { AiEvaluationQuestion, IAiEvaluator } from "@/domain/ports/IAiEvaluator";

const DEFAULT_MODEL = "typesafe-ai/jev";

export class GatewayAiEvaluator implements IAiEvaluator {
  private readonly gateway: ReturnType<typeof createGateway>;
  readonly modelId: string;

  constructor() {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) throw new Error("AI_GATEWAY_API_KEY no está configurado.");
    this.gateway = createGateway({ apiKey });
    this.modelId = process.env.AI_GATEWAY_EVALUATION_MODEL || DEFAULT_MODEL;
  }

  async evaluateBooleans(
    state: string | readonly Record<string, string>[],
    questions: Record<string, AiEvaluationQuestion>
  ): Promise<Record<string, number>> {
    // Las claves de las preguntas se envían como q0, q1, ... para no depender de qué
    // caracteres acepta el proveedor en los IDs (ej. "RF-001").
    const keys = Object.keys(questions);
    const { answers } = await evaluate({
      model: this.gateway.evaluationModel(this.modelId),
      state,
      questions: Object.fromEntries(
        keys.map((key, index) => [`q${index}`, { type: "boolean" as const, instructions: questions[key].instructions }])
      ),
    });

    return Object.fromEntries(keys.map((key, index) => [key, answers[`q${index}`].probability]));
  }
}
