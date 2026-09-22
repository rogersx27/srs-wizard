import { PrismaProjectRepository } from "@/infrastructure/persistence/prisma/PrismaProjectRepository";
import { PrismaAnswerRepository } from "@/infrastructure/persistence/prisma/PrismaAnswerRepository";
import { PrismaAiCacheRepository } from "@/infrastructure/persistence/prisma/PrismaAiCacheRepository";
import {
  CreateProjectUseCase,
  ListProjectsUseCase,
  GetProjectByIdUseCase,
  GetProjectBySlugUseCase,
  MarkProjectCompletedUseCase,
} from "@/application/use-cases/ProjectUseCases";
import {
  SaveAnswerUseCase,
  GetAnswersForProjectUseCase,
  ComputeWizardProgressUseCase,
} from "@/application/use-cases/AnswerUseCases";
import { GenerateSrsDocumentUseCase } from "@/application/use-cases/GenerateSrsDocumentUseCase";
import { AnalyzeSrsQualityUseCase } from "@/application/use-cases/AnalyzeSrsQualityUseCase";
import { SrsDocumentGenerator } from "@/infrastructure/srs/SrsDocumentGenerator";
import { SrsQualityAnalyzer } from "@/infrastructure/srs/SrsQualityAnalyzer";
import { NullAiAssistant, resolveAiProvider } from "@rogersx27/ai-ports";
import { GeminiAiAssistant } from "@rogersx27/ai-ports/gemini";
import { AnthropicAiAssistant } from "@rogersx27/ai-ports/anthropic";
import { OpenAiAssistant } from "@rogersx27/ai-ports/openai";
import { GatewayAiAssistant, GatewayAiEvaluator } from "@rogersx27/ai-ports/gateway";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import type { IAiEvaluator } from "@/domain/ports/IAiEvaluator";

const projectRepository = new PrismaProjectRepository();
const answerRepository = new PrismaAnswerRepository();
const aiCacheRepository = new PrismaAiCacheRepository();

// La elección del proveedor (AI_PROVIDER o, si no, el primero con clave: Gemini,
// Anthropic, OpenAI, Gateway) la hace la librería; aquí solo se construye el adaptador
// con imports estáticos, para que el container siga siendo síncrono.
function createAiAssistant(): IAiAssistant {
  const env = process.env;
  switch (resolveAiProvider(env)) {
    case "gemini":
      return new GeminiAiAssistant({ apiKey: env.GEMINI_API_KEY ?? "", model: env.GEMINI_MODEL });
    case "anthropic":
      return new AnthropicAiAssistant({ apiKey: env.ANTHROPIC_API_KEY ?? "", model: env.ANTHROPIC_MODEL });
    case "openai":
      return new OpenAiAssistant({ apiKey: env.OPENAI_API_KEY ?? "", model: env.OPENAI_MODEL });
    case "gateway":
      return new GatewayAiAssistant({ apiKey: env.AI_GATEWAY_API_KEY ?? "", model: env.AI_GATEWAY_MODEL });
    default:
      return new NullAiAssistant();
  }
}

// El modelo de evaluación (Jev por defecto) es independiente de AI_PROVIDER: solo
// juzga vaguedad en la revisión de calidad, la redacción sigue en el asistente.
function createAiEvaluator(): IAiEvaluator | undefined {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (apiKey) return new GatewayAiEvaluator({ apiKey, model: process.env.AI_GATEWAY_EVALUATION_MODEL });
  return undefined;
}

const aiAssistant: IAiAssistant = createAiAssistant();
const srsDocumentGenerator = new SrsDocumentGenerator(undefined, undefined, aiAssistant, aiCacheRepository);
const srsQualityAnalyzer = new SrsQualityAnalyzer(undefined, aiAssistant, aiCacheRepository, createAiEvaluator());

export const container = {
  createProject: new CreateProjectUseCase(projectRepository),
  listProjects: new ListProjectsUseCase(projectRepository),
  getProjectById: new GetProjectByIdUseCase(projectRepository),
  getProjectBySlug: new GetProjectBySlugUseCase(projectRepository),
  markProjectCompleted: new MarkProjectCompletedUseCase(projectRepository),
  saveAnswer: new SaveAnswerUseCase(answerRepository, projectRepository),
  getAnswersForProject: new GetAnswersForProjectUseCase(answerRepository),
  computeWizardProgress: new ComputeWizardProgressUseCase(answerRepository),
  generateSrsDocument: new GenerateSrsDocumentUseCase(projectRepository, answerRepository, srsDocumentGenerator),
  analyzeSrsQuality: new AnalyzeSrsQualityUseCase(projectRepository, answerRepository, srsQualityAnalyzer),
};
