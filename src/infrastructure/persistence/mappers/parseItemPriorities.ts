import type { Priority } from "@/domain/entities/Answer";

export function parseItemPriorities(raw: string | null, itemCount: number): (Priority | null)[] | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== itemCount) return null;
    if (!parsed.every((value) => value === null || ["ESSENTIAL", "CONDITIONAL", "OPTIONAL"].includes(value))) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
