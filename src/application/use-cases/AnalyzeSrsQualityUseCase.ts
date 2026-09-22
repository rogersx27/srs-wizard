import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { IAnswerRepository } from "@/domain/repositories/IAnswerRepository";
import { SrsQualityAnalyzer, type SrsQualityReport } from "@/infrastructure/srs/SrsQualityAnalyzer";

export class AnalyzeSrsQualityUseCase {
  constructor(
    private readonly projects: IProjectRepository,
    private readonly answers: IAnswerRepository,
    private readonly analyzer: SrsQualityAnalyzer = new SrsQualityAnalyzer()
  ) {}

  async execute(projectId: string): Promise<SrsQualityReport> {
    const project = await this.projects.findById(projectId);
    if (!project) throw new Error("Proyecto no encontrado.");

    const answers = await this.answers.findByProjectId(projectId);
    return this.analyzer.analyze(project.id, answers);
  }
}
