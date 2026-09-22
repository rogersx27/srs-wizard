import type { IAnswerRepository } from "@/domain/repositories/IAnswerRepository";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { Answer } from "@/domain/entities/Answer";
import type { SaveAnswerDTO } from "../dto";
import { WIZARD_CATALOG } from "@/wizard-catalog/wizardCatalog";

export class SaveAnswerUseCase {
  constructor(
    private readonly answers: IAnswerRepository,
    private readonly projects: IProjectRepository
  ) {}

  async execute(input: SaveAnswerDTO): Promise<Answer> {
    const project = await this.projects.findById(input.projectId);
    if (!project) throw new Error("Proyecto no encontrado.");
    if (project.isCompleted()) throw new Error("Este proyecto ya fue completado.");

    const answer = await this.answers.upsert(input);

    if (project.status === "NOT_STARTED") {
      await this.projects.updateStatus(project.id, "IN_PROGRESS");
    }

    return answer;
  }
}

export class GetAnswersForProjectUseCase {
  constructor(private readonly answers: IAnswerRepository) {}

  async execute(projectId: string): Promise<Answer[]> {
    return this.answers.findByProjectId(projectId);
  }
}

export interface WizardProgress {
  answered: number;
  total: number;
  percent: number;
}

export class ComputeWizardProgressUseCase {
  constructor(private readonly answers: IAnswerRepository) {}

  async execute(projectId: string): Promise<WizardProgress> {
    const allAnswers = await this.answers.findByProjectId(projectId);
    const byQuestionId = new Map(allAnswers.map((answer) => [answer.questionId, answer]));

    let total = 0;
    let answered = 0;

    for (const section of WIZARD_CATALOG) {
      for (const question of section.questions) {
        total += 1;
        const answer = byQuestionId.get(question.id);
        if (answer && !answer.isEmpty()) answered += 1;
      }
    }

    const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
    return { answered, total, percent };
  }
}
