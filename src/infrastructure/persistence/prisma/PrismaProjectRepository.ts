import type { IProjectRepository, CreateProjectInput } from "@/domain/repositories/IProjectRepository";
import type { Project, ProjectStatus } from "@/domain/entities/Project";
import { prisma } from "./PrismaClientSingleton";
import { ProjectMapper } from "../mappers/ProjectMapper";

export class PrismaProjectRepository implements IProjectRepository {
  async create(input: CreateProjectInput): Promise<Project> {
    const record = await prisma.project.create({ data: input });
    return ProjectMapper.toDomain(record);
  }

  async findById(id: string): Promise<Project | null> {
    const record = await prisma.project.findUnique({ where: { id } });
    return record ? ProjectMapper.toDomain(record) : null;
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const record = await prisma.project.findUnique({ where: { slug } });
    return record ? ProjectMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Project[]> {
    const records = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return records.map(ProjectMapper.toDomain);
  }

  async updateStatus(id: string, status: ProjectStatus, completedAt?: Date | null): Promise<Project> {
    const record = await prisma.project.update({
      where: { id },
      data: {
        status,
        ...(completedAt !== undefined ? { completedAt } : {}),
      },
    });
    return ProjectMapper.toDomain(record);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.project.count({ where: { slug } });
    return count > 0;
  }
}
