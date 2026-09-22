import { createGateway, generateText } from "ai";
import type { AiCompletionOptions, IAiAssistant } from "@/domain/ports/IAiAssistant";

const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export class GatewayAiAssistant implements IAiAssistant {
  private readonly gateway: ReturnType<typeof createGateway>;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) throw new Error("AI_GATEWAY_API_KEY no está configurado.");
    this.gateway = createGateway({ apiKey });
    this.model = process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL;
  }

  async complete(prompt: string, options?: AiCompletionOptions): Promise<string> {
    const { text } = await generateText({
      model: this.gateway(this.model),
      prompt,
      temperature: options?.temperature,
      maxOutputTokens: options?.maxOutputTokens,
    });
    return text;
  }
}
