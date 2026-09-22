import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { Project } from "@/domain/entities/Project";
import type { CreateProjectDTO } from "../dto";
import { generateSlug } from "@/lib/slug";

export class CreateProjectUseCase {
  constructor(private readonly projects: IProjectRepository) {}

  async execute(input: CreateProjectDTO): Promise<Project> {
    const clientName = input.clientName.trim();
    if (!clientName) throw new Error("El nombre del cliente es obligatorio.");

    let slug = generateSlug(clientName);
    while (await this.projects.existsBySlug(slug)) {
      slug = generateSlug(clientName);
    }

    return this.projects.create({ slug, clientName });
  }
}

export class ListProjectsUseCase {
  constructor(private readonly projects: IProjectRepository) {}

  async execute(): Promise<Project[]> {
    return this.projects.findAll();
  }
}

export class GetProjectByIdUseCase {
  constructor(private readonly projects: IProjectRepository) {}

  async execute(id: string): Promise<Project | null> {
    return this.projects.findById(id);
  }
}

export class GetProjectBySlugUseCase {
  constructor(private readonly projects: IProjectRepository) {}

  async execute(slug: string): Promise<Project | null> {
    return this.projects.findBySlug(slug);
  }
}

export class MarkProjectCompletedUseCase {
  constructor(private readonly projects: IProjectRepository) {}

  async execute(id: string): Promise<Project> {
    return this.projects.updateStatus(id, "COMPLETED", new Date());
  }
}
