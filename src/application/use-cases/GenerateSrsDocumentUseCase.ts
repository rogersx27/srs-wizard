import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { IAnswerRepository } from "@/domain/repositories/IAnswerRepository";
import { SrsDocumentGenerator } from "@/infrastructure/srs/SrsDocumentGenerator";

export interface GeneratedSrsDocument {
  markdown: string;
  fileName: string;
}

export class GenerateSrsDocumentUseCase {
  constructor(
    private readonly projects: IProjectRepository,
    private readonly answers: IAnswerRepository,
    private readonly generator: SrsDocumentGenerator = new SrsDocumentGenerator()
  ) {}

  async execute(projectId: string): Promise<GeneratedSrsDocument> {
    const project = await this.projects.findById(projectId);
    if (!project) throw new Error("Proyecto no encontrado.");

    const answers = await this.answers.findByProjectId(projectId);
    const markdown = this.generator.generate(project, answers);

    return { markdown, fileName: `SRS-${project.slug}.md` };
  }
}
