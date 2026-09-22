import type { Project } from "@/domain/entities/Project";
import type { Answer } from "@/domain/entities/Answer";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import type { IAiCacheRepository } from "@/domain/repositories/IAiCacheRepository";
import { WIZARD_CATALOG } from "@/wizard-catalog/wizardCatalog";
import { RequirementIdGenerator } from "./RequirementIdGenerator";
import { SrsMarkdownTemplate, type SrsNarrative } from "./SrsMarkdownTemplate";
import { PrismaAiCacheRepository } from "@/infrastructure/persistence/prisma/PrismaAiCacheRepository";
import { hashContent, NullAiAssistant, withCache } from "@rogersx27/ai-ports";
import { resolveNarrativeSection } from "./narrativeRewriter";
import { collectAnswerNotes } from "./answerNotes";

const CACHE_KIND = "srs_narrative";

export class SrsDocumentGenerator {
  constructor(
    private readonly idGenerator: RequirementIdGenerator = new RequirementIdGenerator(),
    private readonly template: SrsMarkdownTemplate = new SrsMarkdownTemplate(),
    private readonly aiAssistant: IAiAssistant = new NullAiAssistant(),
    private readonly aiCache: IAiCacheRepository = new PrismaAiCacheRepository()
  ) {}

  async generate(project: Project, answers: Answer[]): Promise<string> {
    const requirements = this.idGenerator.assign(WIZARD_CATALOG, answers);
    const byQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));

    const narrative = await this.resolveNarrative(
      project.id,
      byQuestionId.get("contexto-pitch"),
      byQuestionId.get("contexto-usuarios")
    );

    return this.template.render({
      project,
      requirements,
      narrative,
      generatedAt: new Date(),
      answerNotes: collectAnswerNotes(WIZARD_CATALOG, answers),
    });
  }

  private async resolveNarrative(
    projectId: string,
    pitchAnswer: Answer | undefined,
    usersAnswer: Answer | undefined
  ): Promise<SrsNarrative> {
    const inputHash = hashContent({
      pitch: pitchAnswer?.valueText ?? null,
      users: usersAnswer?.valueText ?? null,
    });

    return withCache<SrsNarrative>(this.aiCache, projectId, CACHE_KIND, inputHash, async () => {
      const [introduction, userDescription] = await Promise.all([
        resolveNarrativeSection(this.aiAssistant, "introduction", pitchAnswer),
        resolveNarrativeSection(this.aiAssistant, "userDescription", usersAnswer),
      ]);

      const aiDegraded = [introduction, userDescription].some((result) => result.attempted && !result.usedAi);

      return {
        value: { introduction: introduction.text, userDescription: userDescription.text, aiDegraded },
        // Solo se cachea un resultado completamente exitoso -- si la IA falló o no
        // está configurada, la próxima consulta debe reintentar, no quedar atascada
        // sirviendo el fallback para siempre.
        cacheable: !aiDegraded,
      };
    });
  }
}
