"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { WizardSection } from "@/wizard-catalog/types";
import type { AnswerProps } from "@/domain/entities/Answer";
import { ProgressBar } from "./ProgressBar";
import { StepQuestion } from "./StepQuestion";
import { WizardNavButtons } from "./WizardNavButtons";
import { AutosaveIndicator, type SaveStatus } from "./AutosaveIndicator";
import { emptyAnswer, isAnswerEmpty, type LocalAnswer } from "./types";

interface FlatStep {
  sectionTitle: string;
  sectionSubtitle: string;
  question: WizardSection["questions"][number];
}

function flatten(catalog: WizardSection[]): FlatStep[] {
  const steps: FlatStep[] = [];
  for (const section of catalog) {
    for (const question of section.questions) {
      steps.push({ sectionTitle: section.title, sectionSubtitle: section.subtitle, question });
    }
  }
  return steps;
}

interface WizardShellProps {
  projectId: string;
  clientName: string;
  catalog: WizardSection[];
  initialAnswers: AnswerProps[];
}

export function WizardShell({ projectId, clientName, catalog, initialAnswers }: WizardShellProps) {
  const steps = useMemo(() => flatten(catalog), [catalog]);
  const storageKey = `srs-wizard-answers-${projectId}`;

  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>(() => {
    const initial: Record<string, LocalAnswer> = {};
    for (const answer of initialAnswers) {
      initial[answer.questionId] = {
        valueText: answer.valueText,
        valueList: answer.valueList,
        priority: answer.priority,
      };
    }

    if (typeof window !== "undefined") {
      try {
        const cached = window.localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached) as Record<string, LocalAnswer>;
          for (const [questionId, value] of Object.entries(parsed)) {
            if (!initial[questionId] || isAnswerEmpty(initial[questionId])) {
              initial[questionId] = value;
            }
          }
        }
      } catch {
        // localStorage no disponible o corrupto: el servidor sigue siendo la fuente de verdad
      }
    }

    return initial;
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isFinishing, setIsFinishing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef(stepIndex);
  const lastSaveRef = useRef<{ questionId: string; value: LocalAnswer } | null>(null);
  const failedSaveRef = useRef(false);
  const saveRequestRef = useRef<Promise<void> | null>(null);

  function persistToLocalStorage(next: Record<string, LocalAnswer>) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // almacenamiento local no disponible, se omite el respaldo
    }
  }

  const persistAnswer = useDebouncedCallback(async (questionId: string, value: LocalAnswer) => {
    setSaveStatus("saving");
    const request = (async () => {
      const response = await fetch("/api/answers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, questionId, ...value }),
      });
      if (!response.ok) throw new Error("save failed");
    })();

    saveRequestRef.current = request;

    try {
      await request;
      failedSaveRef.current = false;
      setSaveStatus("saved");
    } catch {
      failedSaveRef.current = true;
      setSaveStatus("error");
    }
  }, 750);

  function updateAnswer(questionId: string, value: LocalAnswer) {
    lastSaveRef.current = { questionId, value };
    setSaveStatus("saving");
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      persistToLocalStorage(next);
      return next;
    });
    persistAnswer(questionId, value);
  }

  const total = steps.length;
  const answeredCount = steps.filter((step) => {
    const answer = answers[step.question.id];
    return answer && !isAnswerEmpty(answer);
  }).length;
  const percent = total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  const currentStep = steps[stepIndex];
  const currentAnswer = answers[currentStep.question.id] ?? emptyAnswer();
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (previousStepRef.current !== stepIndex) {
      headingRef.current?.focus();
      previousStepRef.current = stepIndex;
    }
  }, [stepIndex]);

  function retrySave() {
    const pending = lastSaveRef.current;
    if (!pending) return;

    failedSaveRef.current = false;
    setSaveStatus("saving");
    persistAnswer(pending.questionId, pending.value);
  }

  async function handleFinish() {
    setFinishError(null);
    setIsFinishing(true);
    try {
      await Promise.resolve(persistAnswer.flush());
      if (saveRequestRef.current) await saveRequestRef.current;
      if (failedSaveRef.current) throw new Error("save failed");

      const response = await fetch(`/api/projects/${projectId}/complete`, { method: "POST" });
      if (!response.ok) throw new Error("complete failed");
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(storageKey);
      }
      setIsDone(true);
    } catch {
      setFinishError("No pudimos guardar o enviar tus respuestas. Revisa tu conexión y vuelve a intentarlo.");
      setIsFinishing(false);
    }
  }

  if (isDone) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">¡Listo, {clientName}!</h1>
        <p className="mt-2 text-slate-600">
          Recibimos tus respuestas. Tu desarrollador ya puede revisar todo lo que compartiste.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
      <div data-tour-id="progress-bar">
        <ProgressBar percent={percent} answered={answeredCount} total={total} />
      </div>

      <p className="sr-only" aria-live="polite">
        Pregunta {stepIndex + 1} de {total}: {currentStep.question.prompt}
      </p>

      <div className="mt-8 flex-1">
        <p className="text-sm font-medium text-slate-500">{currentStep.sectionTitle}</p>
        <p className="text-sm text-slate-400">{currentStep.sectionSubtitle}</p>

        <div data-tour-id="question-card" className="mt-4">
          <StepQuestion
            key={currentStep.question.id}
            question={currentStep.question}
            answer={currentAnswer}
            headingRef={headingRef}
            onChange={(value) => updateAnswer(currentStep.question.id, value)}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AutosaveIndicator status={saveStatus} onRetry={retrySave} />
        <div data-tour-id="nav-continue">
          <WizardNavButtons
            canGoBack={stepIndex > 0}
            isLastStep={isLastStep}
            isFinishing={isFinishing}
            onBack={() => setStepIndex((i) => Math.max(0, i - 1))}
            onNext={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
            onFinish={handleFinish}
          />
        </div>
      </div>
      {finishError && (
        <p className="mt-3 text-right text-sm text-red-700" role="alert">
          {finishError}
        </p>
      )}
    </div>
  );
}
