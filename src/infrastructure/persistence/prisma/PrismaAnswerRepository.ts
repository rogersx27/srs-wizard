import type { IAnswerRepository, UpsertAnswerInput } from "@/domain/repositories/IAnswerRepository";
import type { Answer } from "@/domain/entities/Answer";
import { prisma } from "./PrismaClientSingleton";
import { AnswerMapper } from "../mappers/AnswerMapper";

export class PrismaAnswerRepository implements IAnswerRepository {
  async upsert(input: UpsertAnswerInput): Promise<Answer> {
    const valueJson =
      input.valueList !== undefined && input.valueList !== null ? JSON.stringify(input.valueList) : null;

    const record = await prisma.answer.upsert({
      where: {
        projectId_questionId: {
          projectId: input.projectId,
          questionId: input.questionId,
        },
      },
      create: {
        projectId: input.projectId,
        questionId: input.questionId,
        valueText: input.valueText ?? null,
        valueJson,
        priority: input.priority ?? null,
      },
      update: {
        valueText: input.valueText ?? null,
        valueJson,
        priority: input.priority ?? null,
      },
    });

    return AnswerMapper.toDomain(record);
  }

  async findByProjectId(projectId: string): Promise<Answer[]> {
    const records = await prisma.answer.findMany({ where: { projectId } });
    return records.map(AnswerMapper.toDomain);
  }
}
