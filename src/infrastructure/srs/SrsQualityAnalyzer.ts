import type { Answer } from "@/domain/entities/Answer";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import type { IAiEvaluator } from "@/domain/ports/IAiEvaluator";
import type { IAiCacheRepository } from "@/domain/repositories/IAiCacheRepository";
import { WIZARD_CATALOG } from "@/wizard-catalog/wizardCatalog";
import { RequirementIdGenerator } from "./RequirementIdGenerator";
import { NullAiAssistant } from "../ai/NullAiAssistant.ts";
import { PrismaAiCacheRepository } from "../persistence/prisma/PrismaAiCacheRepository.ts";
import { hashContent } from "../ai/contentHash.ts";
import { withCache } from "../ai/cachedCompute.ts";
import { findMissingPriority, analyzeWithAi, type QualityFinding } from "./qualityAnalysis";
import type { TraceableRequirement } from "./RequirementIdGenerator";

const CACHE_KIND = "quality_ai_findings";

export interface SrsQualityReport {
  findings: QualityFinding[];
  aiAvailable: boolean;
  totalRequirements: number;
  requirements: TraceableRequirement[];
}

export class SrsQualityAnalyzer {
  constructor(
    private readonly idGenerator: RequirementIdGenerator = new RequirementIdGenerator(),
    private readonly aiAssistant: IAiAssistant = new NullAiAssistant(),
    private readonly aiCache: IAiCacheRepository = new PrismaAiCacheRepository(),
    private readonly aiEvaluator?: IAiEvaluator
  ) {}

  async analyze(projectId: string, answers: Answer[]): Promise<SrsQualityReport> {
    const requirements = this.idGenerator.assign(WIZARD_CATALOG, answers);
    const priorityFindings = findMissingPriority(requirements);
    const { findings: aiFindings, aiAvailable } = await this.resolveAiFindings(projectId, requirements);

    return {
      findings: [...priorityFindings, ...aiFindings],
      aiAvailable,
      totalRequirements: requirements.length,
      requirements,
    };
  }

  private async resolveAiFindings(
    projectId: string,
    requirements: TraceableRequirement[]
  ): Promise<{ findings: QualityFinding[]; aiAvailable: boolean }> {
    if (requirements.length === 0) {
      return { findings: [], aiAvailable: false };
    }

    const inputHash = hashContent(requirements.map((requirement) => ({ id: requirement.id, text: requirement.text })));

    return withCache<{ findings: QualityFinding[]; aiAvailable: boolean }>(
      this.aiCache,
      projectId,
      CACHE_KIND,
      inputHash,
      async () => {
        const result = await analyzeWithAi(this.aiAssistant, requirements, this.aiEvaluator);
        // Igual que en SrsDocumentGenerator: solo se cachea si la IA realmente
        // respondió, para que un fallo (o falta de proveedor) se reintente en la
        // próxima consulta.
        return { value: result, cacheable: result.aiAvailable };
      }
    );
  }
}
