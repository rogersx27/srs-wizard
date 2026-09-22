import type { Project } from "@/domain/entities/Project";
import type { Answer } from "@/domain/entities/Answer";
import { IEEE830_LABELS, IEEE830_REQUIREMENT_ORDER } from "@/wizard-catalog/ieee830Mapping";
import type { TraceableRequirement } from "./RequirementIdGenerator";

const PRIORITY_LABEL: Record<string, string> = {
  ESSENTIAL: "Esencial",
  CONDITIONAL: "Condicional",
  OPTIONAL: "Opcional",
};

export interface SrsTemplateInput {
  project: Project;
  answers: Answer[];
  requirements: TraceableRequirement[];
  generatedAt: Date;
}

export class SrsMarkdownTemplate {
  render(input: SrsTemplateInput): string {
    const { project, answers, requirements, generatedAt } = input;
    const byQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));

    const lines: string[] = [];

    lines.push(`# Especificación de Requisitos de Software (ERS)`, ``);
    lines.push(`**Proyecto:** ${project.clientName}`);
    lines.push(
      `**Generado:** ${generatedAt.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`
    );
    lines.push(`**Estándar de referencia:** IEEE 830-1998`, ``);

    lines.push(`## 1. Introducción`, ``);
    lines.push(this.textOr(byQuestionId.get("contexto-pitch"), "No especificado."), ``);

    lines.push(`## 2. Descripción General`, ``);
    lines.push(this.textOr(byQuestionId.get("contexto-usuarios"), "No especificado."), ``);

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

  private textOr(answer: Answer | undefined, fallback: string): string {
    if (!answer || answer.isEmpty() || !answer.valueText) return fallback;
    return answer.valueText;
  }

  private escapeCell(text: string): string {
    return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
  }
}
