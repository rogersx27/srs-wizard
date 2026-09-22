import type { Answer } from "@/domain/entities/Answer";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import { WIZARD_CATALOG } from "@/wizard-catalog/wizardCatalog";
import { RequirementIdGenerator } from "./RequirementIdGenerator";
import { NullAiAssistant } from "../ai/NullAiAssistant.ts";
import { findMissingPriority, analyzeWithAi, type QualityFinding } from "./qualityAnalysis";

export interface SrsQualityReport {
  findings: QualityFinding[];
  aiAvailable: boolean;
  totalRequirements: number;
}

export class SrsQualityAnalyzer {
  constructor(
    private readonly idGenerator: RequirementIdGenerator = new RequirementIdGenerator(),
    private readonly aiAssistant: IAiAssistant = new NullAiAssistant()
  ) {}

  async analyze(answers: Answer[]): Promise<SrsQualityReport> {
    const requirements = this.idGenerator.assign(WIZARD_CATALOG, answers);
    const priorityFindings = findMissingPriority(requirements);
    const aiResult = await analyzeWithAi(this.aiAssistant, requirements);

    return {
      findings: [...priorityFindings, ...aiResult.findings],
      aiAvailable: aiResult.aiAvailable,
      totalRequirements: requirements.length,
    };
  }
}
