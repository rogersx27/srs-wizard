import type { Project as PrismaProject } from "@prisma/client";
import { Project } from "@/domain/entities/Project";

export class ProjectMapper {
  static toDomain(record: PrismaProject): Project {
    return new Project({
      id: record.id,
      slug: record.slug,
      clientName: record.clientName,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      completedAt: record.completedAt,
    });
  }
}
