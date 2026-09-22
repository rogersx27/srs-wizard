import { GoogleGenAI } from "@google/genai";
import type { AiCompletionOptions, IAiAssistant } from "@/domain/ports/IAiAssistant";

const DEFAULT_MODEL = "gemini-flash-latest";

export class GeminiAiAssistant implements IAiAssistant {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY no está configurado.");
    this.client = new GoogleGenAI({ apiKey });
    this.model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  }

  async complete(prompt: string, options?: AiCompletionOptions): Promise<string> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        temperature: options?.temperature,
        maxOutputTokens: options?.maxOutputTokens,
      },
    });
    return response.text ?? "";
  }
}
