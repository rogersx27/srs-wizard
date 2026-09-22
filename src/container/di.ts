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
import { GeminiAiAssistant } from "@/infrastructure/ai/GeminiAiAssistant";
import { AnthropicAiAssistant } from "@/infrastructure/ai/AnthropicAiAssistant";
import { OpenAiAssistant } from "@/infrastructure/ai/OpenAiAssistant";
import { GatewayAiAssistant } from "@/infrastructure/ai/GatewayAiAssistant";
import { GatewayAiEvaluator } from "@/infrastructure/ai/GatewayAiEvaluator";
import { NullAiAssistant } from "@/infrastructure/ai/NullAiAssistant";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import type { IAiEvaluator } from "@/domain/ports/IAiEvaluator";

const projectRepository = new PrismaProjectRepository();
const answerRepository = new PrismaAnswerRepository();
const aiCacheRepository = new PrismaAiCacheRepository();

function createAiAssistant(): IAiAssistant {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === "anthropic") return new AnthropicAiAssistant();
  if (provider === "openai") return new OpenAiAssistant();
  if (provider === "gemini") return new GeminiAiAssistant();
  if (provider === "gateway") return new GatewayAiAssistant();
  if (process.env.GEMINI_API_KEY) return new GeminiAiAssistant();
  if (process.env.ANTHROPIC_API_KEY) return new AnthropicAiAssistant();
  if (process.env.OPENAI_API_KEY) return new OpenAiAssistant();
  if (process.env.AI_GATEWAY_API_KEY) return new GatewayAiAssistant();
  return new NullAiAssistant();
}

// El modelo de evaluación (Jev por defecto) es independiente de AI_PROVIDER: solo
// juzga vaguedad en la revisión de calidad, la redacción sigue en el asistente.
function createAiEvaluator(): IAiEvaluator | undefined {
  if (process.env.AI_GATEWAY_API_KEY) return new GatewayAiEvaluator();
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
