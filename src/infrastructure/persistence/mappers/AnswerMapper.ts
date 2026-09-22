import type { Answer as PrismaAnswer } from "@prisma/client";
import { Answer } from "@/domain/entities/Answer";

export class AnswerMapper {
  static toDomain(record: PrismaAnswer): Answer {
    let valueList: string[] | null = null;

    if (record.valueJson) {
      try {
        const parsed = JSON.parse(record.valueJson);
        if (Array.isArray(parsed)) valueList = parsed;
      } catch {
        valueList = null;
      }
    }

    return new Answer({
      id: record.id,
      projectId: record.projectId,
      questionId: record.questionId,
      valueText: record.valueText,
      valueList,
      priority: record.priority,
      itemPriorities: record.itemPrioritiesJson ? JSON.parse(record.itemPrioritiesJson) : null,
      updatedAt: record.updatedAt,
    });
  }
}
