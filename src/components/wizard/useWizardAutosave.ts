"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { AnswerProps } from "@/domain/entities/Answer";
import { createAutosaveQueue, type AutosaveStatus } from "./autosaveQueue";
import { clearAnswerDrafts, createAnswerDraftWriter, readAnswerDrafts } from "./answerDrafts";
import type { LocalAnswer } from "./types";

interface Snapshot {
  answers: Record<string, LocalAnswer>;
  status: AutosaveStatus;
}

function createStore(projectId: string, initialAnswers: AnswerProps[], questionIds: ReadonlySet<string>) {
  const storageKey = `srs-wizard-answers-${projectId}`;
  const initialSnapshot: Snapshot = {
    answers: Object.fromEntries(initialAnswers.map(({ questionId, valueText, valueList, priority }) => [
      questionId, { valueText, valueList, priority },
    ])),
    status: "idle",
  };
  let snapshot = initialSnapshot;
  let restored = false;
  const listeners = new Set<() => void>();
  const publish = () => listeners.forEach((listener) => listener());
  const queue = createAutosaveQueue<LocalAnswer>({
    async save(questionId, answer) {
      const response = await fetch("/api/answers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, questionId, valueText: answer.valueText, valueList: answer.valueList, priority: answer.priority }),
      });
      if (!response.ok) throw new Error("save failed");
    },
    onPendingChange: createAnswerDraftWriter(storageKey),
  });
  queue.subscribe(() => {
    snapshot = { ...snapshot, status: queue.getStatus() };
    publish();
  });

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialSnapshot,
    restore() {
      if (restored) return;
      restored = true;
      const drafts = readAnswerDrafts(storageKey, initialSnapshot.answers, questionIds);
      snapshot = { ...snapshot, answers: { ...snapshot.answers, ...drafts } };
      for (const [questionId, answer] of Object.entries(drafts)) queue.enqueue(questionId, answer);
      publish();
    },
    update(questionId: string, answer: LocalAnswer) {
      snapshot = { ...snapshot, answers: { ...snapshot.answers, [questionId]: answer } };
      queue.enqueue(questionId, answer);
    },
    flush: queue.flush,
    hasPending: queue.hasPending,
    clearDrafts: () => clearAnswerDrafts(storageKey),
  };
}

export function useWizardAutosave(projectId: string, initialAnswers: AnswerProps[], questionIds: ReadonlySet<string>) {
  const [store] = useState(() => createStore(projectId, initialAnswers, questionIds));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  useEffect(() => {
    // Reading browser storage after hydration keeps the first client render identical to the server.
    store.restore();
    const retry = () => { if (store.hasPending()) void store.flush(); };
    const preventUnsavedExit = (event: BeforeUnloadEvent) => {
      if (!store.hasPending()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("online", retry);
    window.addEventListener("beforeunload", preventUnsavedExit);
    return () => {
      window.removeEventListener("online", retry);
      window.removeEventListener("beforeunload", preventUnsavedExit);
      void store.flush();
    };
  }, [store]);

  return { ...snapshot, updateAnswer: store.update, flush: store.flush, clearDrafts: store.clearDrafts };
}
