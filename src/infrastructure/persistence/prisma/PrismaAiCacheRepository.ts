import type { AiCacheEntry, IAiCacheRepository } from "@/domain/repositories/IAiCacheRepository";
import { prisma } from "./PrismaClientSingleton";

export class PrismaAiCacheRepository implements IAiCacheRepository {
  async get(projectId: string, kind: string): Promise<AiCacheEntry | null> {
    const record = await prisma.aiCache.findUnique({
      where: { projectId_kind: { projectId, kind } },
    });
    if (!record) return null;

    return { inputHash: record.inputHash, payload: record.payload };
  }

  async set(projectId: string, kind: string, inputHash: string, payload: string): Promise<void> {
    await prisma.aiCache.upsert({
      where: { projectId_kind: { projectId, kind } },
      create: { projectId, kind, inputHash, payload },
      update: { inputHash, payload },
    });
  }
}
