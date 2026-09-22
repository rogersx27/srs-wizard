import type { Project, ProjectStatus } from "../entities/Project";

export interface CreateProjectInput {
  slug: string;
  clientName: string;
}

export interface IProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  updateStatus(id: string, status: ProjectStatus, completedAt?: Date | null): Promise<Project>;
  existsBySlug(slug: string): Promise<boolean>;
}
