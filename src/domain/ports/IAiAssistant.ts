export interface AiCompletionOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

export interface IAiAssistant {
  complete(prompt: string, options?: AiCompletionOptions): Promise<string>;
}
