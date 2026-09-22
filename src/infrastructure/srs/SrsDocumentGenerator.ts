import type { Project } from "@/domain/entities/Project";
import type { Answer } from "@/domain/entities/Answer";
import { WIZARD_CATALOG } from "@/wizard-catalog/wizardCatalog";
import { RequirementIdGenerator } from "./RequirementIdGenerator";
import { SrsMarkdownTemplate } from "./SrsMarkdownTemplate";

export class SrsDocumentGenerator {
  constructor(
    private readonly idGenerator: RequirementIdGenerator = new RequirementIdGenerator(),
    private readonly template: SrsMarkdownTemplate = new SrsMarkdownTemplate()
  ) {}

  generate(project: Project, answers: Answer[]): string {
    const requirements = this.idGenerator.assign(WIZARD_CATALOG, answers);

    return this.template.render({
      project,
      answers,
      requirements,
      generatedAt: new Date(),
    });
  }
}
