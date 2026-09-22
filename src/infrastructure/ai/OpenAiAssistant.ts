import OpenAI from "openai";
import type { AiCompletionOptions, IAiAssistant } from "@/domain/ports/IAiAssistant";

const DEFAULT_MODEL = "gpt-5-mini";

export class OpenAiAssistant implements IAiAssistant {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY no está configurado.");
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  }

  async complete(prompt: string, options?: AiCompletionOptions): Promise<string> {
    const response = await this.client.responses.create({
      model: this.model,
      input: prompt,
      temperature: options?.temperature,
      max_output_tokens: options?.maxOutputTokens,
      // Estas tareas son reescritura/clasificación de texto, no requieren razonamiento
      // profundo -- "low" evita que los modelos de razonamiento gasten la mayoría del
      // presupuesto de tokens (y del tiempo) en tokens de razonamiento ocultos.
      reasoning: { effort: "low" },
    });
    return response.output_text ?? "";
  }
}
