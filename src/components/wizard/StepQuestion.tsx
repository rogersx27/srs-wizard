"use client";

import type { WizardQuestion } from "@/wizard-catalog/types";
import { useId, useRef, type RefObject } from "react";
import type { LocalAnswer } from "./types";
import { RequirementListInput } from "./RequirementListInput";
import { WritingHelp } from "./WritingHelp";
import { MultipleChoiceInput } from "./MultipleChoiceInput";

interface StepQuestionProps {
  question: WizardQuestion;
  answer: LocalAnswer;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (value: LocalAnswer) => void;
}

export function StepQuestion({ question, answer, headingRef, onChange }: StepQuestionProps) {
  const fieldId = useId();
  const questionLabelId = `${fieldId}-label`;
  const helpTextId = `${fieldId}-help`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noIntegrations = Boolean(question.emptyAnswerLabel && answer.valueText === question.emptyAnswerLabel && !answer.valueList?.some((item) => item.trim()));
  const hasItems = Boolean(answer.valueList?.some((item) => item.trim()));

  return (
    <section aria-labelledby={questionLabelId} className="step-enter min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 ref={headingRef} id={questionLabelId} tabIndex={-1} className="text-lg font-semibold text-slate-900">
        {question.prompt}
      </h2>
      {question.helpText && (
        <p id={helpTextId} className="mt-1 text-sm text-slate-500">
          {question.helpText}
        </p>
      )}

      <div className="mt-4">
        {question.kind === "long_text" && (
          <>
            <textarea
              ref={textareaRef}
              id={fieldId}
              rows={4}
              value={answer.valueText ?? ""}
              placeholder={question.placeholder}
              aria-labelledby={questionLabelId}
              aria-describedby={question.helpText ? helpTextId : undefined}
              onChange={(e) => onChange({ ...answer, valueText: e.target.value })}
              className="ui-field min-h-32 resize-y"
            />
            {question.writingGuide && <WritingHelp guide={question.writingGuide} onInsert={(text) => {
              onChange({ ...answer, valueText: answer.valueText?.trim() ? `${answer.valueText.trimEnd()}\n\n${text}` : text });
              textareaRef.current?.focus();
            }} />}
          </>
        )}

        {question.kind === "short_text" && (
          <input
            id={fieldId}
            type="text"
            value={answer.valueText ?? ""}
            placeholder={question.placeholder}
            aria-labelledby={questionLabelId}
            aria-describedby={question.helpText ? helpTextId : undefined}
            onChange={(e) => onChange({ ...answer, valueText: e.target.value })}
            className="ui-field"
          />
        )}

        {question.kind === "single_choice" && (
          <fieldset className="grid gap-2 sm:grid-cols-2" aria-describedby={question.helpText ? helpTextId : undefined}>
            <legend className="sr-only">{question.prompt}</legend>
            {question.options?.map((option) => (
              <label
                key={option}
                className={`flex min-h-11 cursor-pointer items-center rounded-lg border px-3 py-2 text-left text-sm transition-[background-color,color,border-color] duration-150 ease-out focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2 ${answer.valueText === option
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <input
                  type="radio"
                  name={fieldId}
                  value={option}
                  checked={answer.valueText === option}
                  onChange={() => onChange({ ...answer, valueText: option })}
                  className="sr-only"
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
        )}

        {question.kind === "requirement_list" && (
          <div className="space-y-4">
            {question.emptyAnswerLabel && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className={`flex min-h-11 items-center gap-3 text-sm font-medium ${hasItems ? "text-slate-500" : "cursor-pointer text-slate-800"}`}>
                <input type="checkbox" className="h-5 w-5 shrink-0 accent-slate-900" checked={noIntegrations} disabled={hasItems}
                  onChange={(event) => onChange({ ...answer, valueText: event.target.checked ? question.emptyAnswerLabel! : null, valueList: [], itemPriorities: [], priority: null })} />
                {question.emptyAnswerLabel}
              </label>
              {hasItems && <p className="mt-1 text-xs text-slate-500">Para elegir esta opción, elimina primero las conexiones de la lista.</p>}
              {noIntegrations && <p className="mt-1 text-sm text-slate-600" role="status">Listo, puedes continuar. Desmarca esta opción si quieres agregar una conexión.</p>}
            </div>}
            {!noIntegrations &&
              <RequirementListInput
                items={answer.valueList ?? [""]}
                priorities={answer.itemPriorities}
                legacyPriority={answer.priority}
                suggestions={question.suggestions}
                label={question.prompt}
                describedBy={question.helpText ? helpTextId : undefined}
                onChange={(items, itemPriorities) => onChange({ ...answer, valueText: null, valueList: items, itemPriorities, priority: null })}
              />
            }
          </div>
        )}
        {question.kind === "multiple_choice" && <MultipleChoiceInput options={question.options ?? []} answer={answer} label={question.prompt}
          describedBy={question.helpText ? helpTextId : undefined} onChange={onChange} />}
      </div>
    </section>
  );
}
