import type { Priority } from "@/domain/entities/Answer";

export interface LocalAnswer {
  valueText: string | null;
  valueList: string[] | null;
  priority: Priority | null;
  itemPriorities?: (Priority | null)[] | null;
}

export function emptyAnswer(): LocalAnswer {
  return { valueText: null, valueList: null, priority: null };
}

export function isAnswerEmpty(answer: LocalAnswer): boolean {
  const noText = !answer.valueText || answer.valueText.trim() === "";
  const noList = !answer.valueList || answer.valueList.filter((item) => item.trim() !== "").length === 0;
  return noText && noList;
}
