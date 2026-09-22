import type { Answer, Priority } from "@/domain/entities/Answer";
import type { WizardSection, Ieee830Category } from "@/wizard-catalog/types";
import { IEEE830_PREFIX } from "@/wizard-catalog/ieee830Mapping";
import { requirementItems } from "@/domain/requirementItems";

export interface TraceableRequirement {
  id: string;
  text: string;
  priority: Priority | null;
  category: Ieee830Category;
}

export class RequirementIdGenerator {
  assign(catalog: WizardSection[], answers: Answer[]): TraceableRequirement[] {
    const byQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));
    const counters: Partial<Record<Ieee830Category, number>> = {};
    const result: TraceableRequirement[] = [];

    for (const section of catalog) {
      for (const question of section.questions) {
        if (!question.isRequirement) continue;

        const answer = byQuestionId.get(question.id);
        if (!answer || answer.isEmpty()) continue;

        const items = requirementItems(answer);
        const category = question.ieee830Category;
        const prefix = IEEE830_PREFIX[category] ?? "R";

        for (const { text, priority } of items) {
          const next = (counters[category] ?? 0) + 1;
          counters[category] = next;

          result.push({
            id: `${prefix}-${String(next).padStart(3, "0")}`,
            text,
            priority,
            category,
          });
        }
      }
    }

    return result;
  }

}
