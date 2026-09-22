"use client";

import type { WizardQuestion } from "@/wizard-catalog/types";
import type { RefObject } from "react";
import type { LocalAnswer } from "./types";
import { PrioritySelector } from "./PrioritySelector";

interface StepQuestionProps {
  question: WizardQuestion;
  answer: LocalAnswer;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (value: LocalAnswer) => void;
}

export function StepQuestion({ question, answer, headingRef, onChange }: StepQuestionProps) {
  const questionLabelId = `${question.id}-label`;
  const helpTextId = `${question.id}-help`;

  return (
    <div className="step-enter rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
            id={question.id}
            rows={4}
            value={answer.valueText ?? ""}
            placeholder={question.placeholder}
            aria-labelledby={questionLabelId}
            aria-describedby={question.helpText ? helpTextId : undefined}
            onChange={(e) => onChange({ ...answer, valueText: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        )}

        {question.kind === "short_text" && (
          <input
            id={question.id}
            type="text"
            value={answer.valueText ?? ""}
            placeholder={question.placeholder}
            aria-labelledby={questionLabelId}
            aria-describedby={question.helpText ? helpTextId : undefined}
            onChange={(e) => onChange({ ...answer, valueText: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
                  name={question.id}
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
            onChange={(items) => onChange({ ...answer, valueList: items })}
          />
        )}
      </div>

      {question.isRequirement && (
        <div data-tour-id="priority-selector" className="mt-5">
          <PrioritySelector
            name={`priority-${question.id}`}
            value={answer.priority}
            onChange={(priority) => onChange({ ...answer, priority })}
          />
        </div>
      )}
    </div>
  );
}

function RequirementListInput({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const list = items.length > 0 ? items : [""];

  function updateItem(index: number, value: string) {
    const next = [...list];
    next[index] = value;
    onChange(next);
  }

  function addItem() {
    onChange([...list, ""]);
  }

  function removeItem(index: number) {
    const next = list.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [""]);
  }

  return (
    <div className="space-y-2">
      {list.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <label htmlFor={`${index}-requirement`} className="sr-only">
            Elemento {index + 1}
          </label>
          <input
            id={`${index}-requirement`}
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={`Elemento ${index + 1}`}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {list.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-slate-500 transition-[color,background-color] duration-150 ease-out hover:bg-red-50 hover:text-red-700"
              aria-label={`Eliminar elemento ${index + 1}`}
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-sm font-medium text-slate-600 hover:text-slate-900">
        + Agregar otro
      </button>
    </div>
  );
}
