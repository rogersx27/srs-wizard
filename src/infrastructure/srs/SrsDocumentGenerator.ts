import type { Project } from "@/domain/entities/Project";
import type { Answer } from "@/domain/entities/Answer";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import { WIZARD_CATALOG } from "@/wizard-catalog/wizardCatalog";
import { RequirementIdGenerator } from "./RequirementIdGenerator";
import { SrsMarkdownTemplate } from "./SrsMarkdownTemplate";
import { NullAiAssistant } from "@/infrastructure/ai/NullAiAssistant";
import { resolveNarrativeSection } from "./narrativeRewriter";

export class SrsDocumentGenerator {
  constructor(
    private readonly idGenerator: RequirementIdGenerator = new RequirementIdGenerator(),
    private readonly template: SrsMarkdownTemplate = new SrsMarkdownTemplate(),
    private readonly aiAssistant: IAiAssistant = new NullAiAssistant()
  ) {}

  async generate(project: Project, answers: Answer[]): Promise<string> {
    const requirements = this.idGenerator.assign(WIZARD_CATALOG, answers);
    const byQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));

    const [introduction, userDescription] = await Promise.all([
      resolveNarrativeSection(this.aiAssistant, "introduction", byQuestionId.get("contexto-pitch")),
      resolveNarrativeSection(this.aiAssistant, "userDescription", byQuestionId.get("contexto-usuarios")),
    ]);

    const aiDegraded = [introduction, userDescription].some((result) => result.attempted && !result.usedAi);

    return this.template.render({
      project,
      requirements,
      narrative: {
        introduction: introduction.text,
        userDescription: userDescription.text,
        aiDegraded,
      },
      generatedAt: new Date(),
    });
  }
}
