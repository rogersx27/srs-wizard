import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import { AiUnavailableError } from "./AiUnavailableError.ts";

export class NullAiAssistant implements IAiAssistant {
  async complete(): Promise<string> {
    throw new AiUnavailableError("No hay un proveedor de IA configurado.");
  }
}
