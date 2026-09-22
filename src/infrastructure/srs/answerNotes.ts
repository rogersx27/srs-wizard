import type { WizardSection, Ieee830Category } from "@/wizard-catalog/types";

interface AnswerSelection {
  questionId: string;
  valueText: string | null;
  valueList: string[] | null;
}

export interface AnswerNote {
  category: Ieee830Category;
  text: string;
}

/** Only an explicit catalog choice may produce a note in the SRS. */
export function collectAnswerNotes(catalog: WizardSection[], answers: AnswerSelection[]): AnswerNote[] {
  const byQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));
  const notes: AnswerNote[] = [];

  for (const section of catalog) {
    for (const question of section.questions) {
      if (!question.emptyAnswerLabel || !question.emptyAnswerNote) continue;
      const answer = byQuestionId.get(question.id);
      if (answer?.valueText === question.emptyAnswerLabel && answer.valueList?.length === 0) {
        notes.push({ category: question.ieee830Category, text: question.emptyAnswerNote });
      }
    }
  }

  return notes;
}
