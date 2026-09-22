import type { Answer, Priority } from "../entities/Answer";

export interface UpsertAnswerInput {
  projectId: string;
  questionId: string;
  valueText?: string | null;
  valueList?: string[] | null;
  priority?: Priority | null;
}

export interface IAnswerRepository {
  upsert(input: UpsertAnswerInput): Promise<Answer>;
  findByProjectId(projectId: string): Promise<Answer[]>;
}
