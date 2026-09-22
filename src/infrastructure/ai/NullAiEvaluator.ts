import type { IAiEvaluator } from "@/domain/ports/IAiEvaluator";
import { AiUnavailableError } from "./AiUnavailableError.ts";

export class NullAiEvaluator implements IAiEvaluator {
  async evaluateBooleans(): Promise<Record<string, number>> {
    throw new AiUnavailableError("No hay un modelo de evaluación configurado.");
  }
}
