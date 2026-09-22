import type { Priority } from "@/domain/entities/Answer";

export interface CreateProjectDTO {
  clientName: string;
}

export interface SaveAnswerDTO {
  projectId: string;
  questionId: string;
  valueText?: string | null;
  valueList?: string[] | null;
  priority?: Priority | null;
}
