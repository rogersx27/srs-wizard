import type { Answer } from "@/domain/entities/Answer";
import type { IAiAssistant } from "@/domain/ports/IAiAssistant";
import type { IAiEvaluator } from "@/domain/ports/IAiEvaluator";
import type { IAiCacheRepository } from "@/domain/repositories/IAiCacheRepository";
import { WIZARD_CATALOG } from "@/wizard-catalog/wizardCatalog";
import { RequirementIdGenerator } from "./RequirementIdGenerator";
import { PrismaAiCacheRepository } from "../persistence/prisma/PrismaAiCacheRepository.ts";
import { NullAiAssistant, withCache } from "@rogersx27/ai-ports";
import {
  findMissingPriority,
  analyzeWithAi,
  qualityCacheInputHash,
  type AiCheck,
  type QualityAnalysisResult,
  type QualityFinding,
} from "./qualityAnalysis";
import type { TraceableRequirement } from "./RequirementIdGenerator";

const CACHE_KIND = "quality_ai_findings";

export interface SrsQualityReport {
  findings: QualityFinding[];
  aiAvailable: boolean;
  unavailableAiChecks: AiCheck[];
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
    const { findings: aiFindings, aiAvailable, unavailableAiChecks } = await this.resolveAiFindings(projectId, requirements);

    return {
      findings: [...priorityFindings, ...aiFindings],
      aiAvailable,
      // Las entradas cacheadas antes de existir este campo siempre fueron exitosas.
      unavailableAiChecks: unavailableAiChecks ?? [],
      totalRequirements: requirements.length,
      requirements,
    };
  }

  private async resolveAiFindings(
    projectId: string,
    requirements: TraceableRequirement[]
  ): Promise<QualityAnalysisResult> {
    if (requirements.length === 0) {
      return { findings: [], aiAvailable: false, unavailableAiChecks: [] };
    }

    const inputHash = qualityCacheInputHash(requirements, this.aiEvaluator);

    return withCache<QualityAnalysisResult>(
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
