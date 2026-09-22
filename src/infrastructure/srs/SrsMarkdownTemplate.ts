import type { Project } from "@/domain/entities/Project";
import { IEEE830_LABELS, IEEE830_REQUIREMENT_ORDER } from "@/wizard-catalog/ieee830Mapping";
import type { TraceableRequirement } from "./RequirementIdGenerator";

const PRIORITY_LABEL: Record<string, string> = {
  ESSENTIAL: "Esencial",
  CONDITIONAL: "Condicional",
  OPTIONAL: "Opcional",
};

export interface SrsNarrative {
  introduction: string;
  userDescription: string;
  /** True when the AI rewrite was attempted for at least one section but failed or is unavailable. */
  aiDegraded: boolean;
}

export interface SrsTemplateInput {
  project: Project;
  narrative: SrsNarrative;
  requirements: TraceableRequirement[];
  generatedAt: Date;
}

export class SrsMarkdownTemplate {
  render(input: SrsTemplateInput): string {
    const { project, narrative, requirements, generatedAt } = input;

    const lines: string[] = [];

    lines.push(`# Especificación de Requisitos de Software (ERS)`, ``);
    lines.push(`**Proyecto:** ${project.clientName}`);
    lines.push(
      `**Generado:** ${generatedAt.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`
    );
    lines.push(`**Estándar de referencia:** IEEE 830-1998`, ``);

    lines.push(`## 1. Introducción`, ``);
    lines.push(narrative.introduction, ``);

    lines.push(`## 2. Descripción General`, ``);
    lines.push(narrative.userDescription, ``);

    if (narrative.aiDegraded) {
      lines.push(
        `_Nota: la redacción asistida por IA no está disponible en este momento; el texto de estas secciones se muestra tal como lo escribió el cliente._`,
        ``
      );
    }

    let sectionNumber = 3;
    for (const category of IEEE830_REQUIREMENT_ORDER) {
      lines.push(`## ${sectionNumber}. ${IEEE830_LABELS[category]}`, ``);

      const rows = requirements.filter((requirement) => requirement.category === category);
      if (rows.length === 0) {
        lines.push(`_No especificado._`);
      } else {
        lines.push(`| ID | Requisito | Prioridad |`);
        lines.push(`|----|-----------|-----------|`);
        for (const row of rows) {
          const priority = row.priority ? PRIORITY_LABEL[row.priority] : "Sin definir";
          lines.push(`| ${row.id} | ${this.escapeCell(row.text)} | ${priority} |`);
        }
      }

      lines.push(``);
      sectionNumber += 1;
    }

    lines.push(`## Notas de trazabilidad`, ``);
    lines.push(
      `Cada requisito posee un identificador único (RU/RS/RF/RNF-###) para permitir su seguimiento durante el desarrollo, la verificación y el control de cambios.`
    );

    return lines.join("\n");
  }

  private escapeCell(text: string): string {
    return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
  }
}
