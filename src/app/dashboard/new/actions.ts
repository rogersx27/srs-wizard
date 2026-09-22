"use server";

import { redirect } from "next/navigation";
import { container } from "@/container/di";

export interface CreateProjectActionState {
  error?: string;
}

export async function createProjectAction(
  _prevState: CreateProjectActionState | undefined,
  formData: FormData
): Promise<CreateProjectActionState> {
  const clientName = String(formData.get("clientName") ?? "").trim();

  if (!clientName) {
    return { error: "Escribe el nombre del cliente o proyecto." };
  }

  let projectId: string;
  try {
    const project = await container.createProject.execute({ clientName });
    projectId = project.id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el proyecto." };
  }

  redirect(`/dashboard/${projectId}`);
}
