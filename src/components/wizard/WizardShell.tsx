"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WizardSection } from "@/wizard-catalog/types";
import type { AnswerProps } from "@/domain/entities/Answer";
import { ProgressBar } from "./ProgressBar";
import { StepQuestion } from "./StepQuestion";
import { WizardNavButtons } from "./WizardNavButtons";
import { AutosaveIndicator } from "./AutosaveIndicator";
import { useWizardAutosave } from "./useWizardAutosave";
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
  const questionIds = useMemo(() => new Set(steps.map((step) => step.question.id)), [steps]);
  const { answers, status: saveStatus, updateAnswer: saveAnswer, flush, clearDrafts } = useWizardAutosave(
    projectId, initialAnswers, questionIds,
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef(stepIndex);
  const finishingRef = useRef(false);

  function updateAnswer(questionId: string, value: LocalAnswer) {
    if (!finishingRef.current) saveAnswer(questionId, value);
  }

  const total = steps.length;
  const answeredCount = steps.filter((step) => {
    const answer = answers[step.question.id];
    return answer && !isAnswerEmpty(answer);
  }).length;
  const percent = total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  const currentStep = steps[stepIndex];
  const currentAnswer = currentStep ? answers[currentStep.question.id] ?? emptyAnswer() : emptyAnswer();
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (previousStepRef.current !== stepIndex || isDone) {
      headingRef.current?.focus();
      previousStepRef.current = stepIndex;
    }
  }, [stepIndex, isDone]);

  function retrySave() {
    void flush();
  }

  function navigateTo(index: number) {
    if (finishingRef.current) return;
    void flush();
    setStepIndex(Math.max(0, Math.min(steps.length - 1, index)));
  }

  async function handleFinish() {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishError(null);
    setIsFinishing(true);
    try {
      if (!(await flush())) throw new Error("save failed");

      const response = await fetch(`/api/projects/${projectId}/complete`, { method: "POST" });
      if (!response.ok) throw new Error("complete failed");
      clearDrafts();
      setIsDone(true);
    } catch {
      setFinishError("No pudimos guardar o enviar tus respuestas. Revisa tu conexión y vuelve a intentarlo.");
      setIsFinishing(false);
      finishingRef.current = false;
    }
  }

  if (isDone) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-slate-900">¡Listo, {clientName}!</h1>
        <p className="mt-2 text-slate-600">
          Recibimos tus respuestas. Tu desarrollador ya puede revisar todo lo que compartiste.
        </p>
      </div>
    );
  }

  if (!currentStep) {
    return <p className="mx-auto max-w-2xl px-4 py-8" role="status">No hay preguntas disponibles por ahora.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6 sm:py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">SRS Wizard</p>
        <h1 className="mt-2 break-words text-xl font-semibold text-slate-900">Tu proyecto, {clientName}</h1>
        <p className="mt-1 text-sm text-slate-600">Cuéntanos lo que necesitas. Puedes volver a cualquier pregunta antes de finalizar.</p>
      </header>
      <div data-tour-id="progress-bar">
        <ProgressBar percent={percent} answered={answeredCount} total={total} />
      </div>

      <p className="sr-only" aria-live="polite">
        Pregunta {stepIndex + 1} de {total}: {currentStep.question.prompt}
      </p>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Pregunta {stepIndex + 1} de {total}</p>
        <p className="text-sm font-medium text-slate-700">{currentStep.sectionTitle}</p>
        <p className="text-sm text-slate-600">{currentStep.sectionSubtitle}</p>

        <fieldset data-tour-id="question-card" disabled={isFinishing} aria-busy={isFinishing} className="mt-4 min-w-0">
          <legend className="sr-only">Pregunta actual</legend>
          <StepQuestion
            key={currentStep.question.id}
            question={currentStep.question}
            answer={currentAnswer}
            headingRef={headingRef}
            onChange={(value) => updateAnswer(currentStep.question.id, value)}
          />
        </fieldset>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <AutosaveIndicator status={saveStatus} onRetry={retrySave} />
        <div data-tour-id="nav-continue">
          <WizardNavButtons
            canGoBack={stepIndex > 0}
            isLastStep={isLastStep}
            isFinishing={isFinishing}
            onBack={() => navigateTo(stepIndex - 1)}
            onNext={() => navigateTo(stepIndex + 1)}
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
