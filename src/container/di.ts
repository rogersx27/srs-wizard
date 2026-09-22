import { PrismaProjectRepository } from "@/infrastructure/persistence/prisma/PrismaProjectRepository";
import { PrismaAnswerRepository } from "@/infrastructure/persistence/prisma/PrismaAnswerRepository";
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
import { SrsDocumentGenerator } from "@/infrastructure/srs/SrsDocumentGenerator";
import { GeminiAiAssistant } from "@/infrastructure/ai/GeminiAiAssistant";
import { NullAiAssistant } from "@/infrastructure/ai/NullAiAssistant";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";

const projectRepository = new PrismaProjectRepository();
const answerRepository = new PrismaAnswerRepository();

const aiAssistant: IAiAssistant = process.env.GEMINI_API_KEY ? new GeminiAiAssistant() : new NullAiAssistant();
const srsDocumentGenerator = new SrsDocumentGenerator(undefined, undefined, aiAssistant);

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
};
