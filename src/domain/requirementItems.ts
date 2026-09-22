import type { Priority } from "./entities/Answer";

interface ListAnswer {
  valueText: string | null;
  valueList: string[] | null;
  priority: Priority | null;
  itemPriorities?: (Priority | null)[] | null;
}

/** Keep the original index until priorities are paired, including blank rows. */
export function requirementItems(answer: ListAnswer) {
  if (answer.valueList !== null) {
    return answer.valueList.map((text, index) => ({
      text: text.trim(),
      priority: answer.itemPriorities ? answer.itemPriorities[index] ?? null : answer.priority,
    })).filter((item) => item.text !== "");
  }
  return answer.valueText?.trim() ? [{ text: answer.valueText.trim(), priority: answer.priority }] : [];
}
