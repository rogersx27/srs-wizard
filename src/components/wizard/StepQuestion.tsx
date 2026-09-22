"use client";

import type { WizardQuestion } from "@/wizard-catalog/types";
import { useId, type RefObject } from "react";
import type { LocalAnswer } from "./types";
import { PrioritySelector } from "./PrioritySelector";
import { RequirementListInput } from "./RequirementListInput";

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
          <textarea
            id={fieldId}
            rows={4}
            value={answer.valueText ?? ""}
            placeholder={question.placeholder}
            aria-labelledby={questionLabelId}
            aria-describedby={question.helpText ? helpTextId : undefined}
            onChange={(e) => onChange({ ...answer, valueText: e.target.value })}
            className="ui-field min-h-32 resize-y"
          />
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
                className={`flex min-h-11 cursor-pointer items-center rounded-lg border px-3 py-2 text-left text-sm transition-[background-color,color,border-color] duration-150 ease-out focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2 ${
                  answer.valueText === option
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
          <RequirementListInput
            items={answer.valueList ?? [""]}
            label={question.prompt}
            describedBy={question.helpText ? helpTextId : undefined}
            onChange={(items) => onChange({ ...answer, valueList: items })}
          />
        )}
      </div>

      {question.isRequirement && (
        <div data-tour-id="priority-selector" className="mt-5">
          <PrioritySelector
            name={`priority-${fieldId}`}
            value={answer.priority}
            onChange={(priority) => onChange({ ...answer, priority })}
          />
        </div>
      )}
    </section>
  );
}
