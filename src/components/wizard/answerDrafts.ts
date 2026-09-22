import type { LocalAnswer } from "./types";

type AnswerMap = Record<string, LocalAnswer>;
type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalAnswer(value: unknown): value is LocalAnswer {
  if (!isRecord(value)) return false;
  return (value.valueText === null || typeof value.valueText === "string")
    && (value.valueList === null || (Array.isArray(value.valueList) && value.valueList.every((item) => typeof item === "string")))
    && (value.priority === null || (typeof value.priority === "string" && ["ESSENTIAL", "CONDITIONAL", "OPTIONAL"].includes(value.priority)))
    && (value.itemPriorities == null || (Array.isArray(value.itemPriorities)
      && value.itemPriorities.length === (Array.isArray(value.valueList) ? value.valueList.length : 0)
      && value.itemPriorities.every((priority) => priority === null || ["ESSENTIAL", "CONDITIONAL", "OPTIONAL"].includes(priority))));
}

function isEmpty(answer: LocalAnswer | undefined) {
  return !answer || (!answer.valueText?.trim() && !answer.valueList?.some((item) => item.trim()));
}

/** Version 1 contains only unsaved edits; legacy snapshots only fill empty server answers. */
export function readAnswerDrafts(
  key: string,
  initialAnswers: AnswerMap,
  questionIds: ReadonlySet<string>,
  storage?: DraftStorage,
): AnswerMap {
  try {
    const raw = (storage ?? window.localStorage).getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};
    const versioned = parsed.version === 1;
    if ("version" in parsed && !versioned) return {};
    const candidates = versioned ? parsed.answers : parsed;
    if (!isRecord(candidates)) return {};
    return Object.fromEntries(Object.entries(candidates).filter(([questionId, answer]) =>
      questionIds.has(questionId) && isLocalAnswer(answer) && (versioned || isEmpty(initialAnswers[questionId])),
    )) as AnswerMap;
  } catch {
    return {};
  }
}

export function writeAnswerDrafts(key: string, answers: AnswerMap, storage?: DraftStorage) {
  try {
    const target = storage ?? window.localStorage;
    if (Object.keys(answers).length === 0) target.removeItem(key);
    else target.setItem(key, JSON.stringify({ version: 1, answers }));
  } catch {
    // Storage restrictions must not interrupt editing or successful server saves.
  }
}

function sameAnswer(left: LocalAnswer | undefined, right: LocalAnswer) {
  return left?.valueText === right.valueText && left?.priority === right.priority
    && JSON.stringify(left?.valueList) === JSON.stringify(right.valueList)
    && JSON.stringify(left?.itemPriorities) === JSON.stringify(right.itemPriorities);
}

/** Applies this instance's changes without letting an old acknowledgement erase another draft. */
export function createAnswerDraftWriter(key: string, storage?: DraftStorage) {
  let previous: AnswerMap = {};
  return (pending: AnswerMap) => {
    try {
      const target = storage ?? window.localStorage;
      const raw = target.getItem(key);
      let parsed: unknown;
      try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = null; }
      const stored = isRecord(parsed) && parsed.version === 1 && isRecord(parsed.answers)
        ? Object.fromEntries(Object.entries(parsed.answers).filter(([, value]) => isLocalAnswer(value))) as AnswerMap
        : {};
      const next = { ...stored };
      for (const [questionId, answer] of Object.entries(pending)) {
        if (!sameAnswer(previous[questionId], answer)) next[questionId] = answer;
      }
      for (const [questionId, answer] of Object.entries(previous)) {
        if (!(questionId in pending) && sameAnswer(stored[questionId], answer)) delete next[questionId];
      }
      if (Object.keys(next).length === 0) target.removeItem(key);
      else target.setItem(key, JSON.stringify({ version: 1, answers: next }));
      previous = pending;
    } catch {
      // Another instance's drafts and successful server saves remain independent of storage access.
    }
  };
}

export function clearAnswerDrafts(key: string, storage?: DraftStorage) {
  writeAnswerDrafts(key, {}, storage);
}
