"use client";

import { useId } from "react";
import type { LocalAnswer } from "./types";
import { PrioritySelector } from "./PrioritySelector";

interface MultipleChoiceInputProps {
  options: string[];
  answer: LocalAnswer;
  label: string;
  describedBy?: string;
  onChange: (answer: LocalAnswer) => void;
}

export function MultipleChoiceInput({ options, answer, label, describedBy, onChange }: MultipleChoiceInputProps) {
  const id = useId();
  // Existing custom responses remain selectable; opening the step never rewrites them.
  const items = answer.valueList ?? (answer.valueText?.trim() ? [answer.valueText] : []);
  const priorities = items.map((_, index) => answer.itemPriorities ? answer.itemPriorities[index] ?? null : answer.priority);
  const legacyOptions = items.filter((item) => item.trim() && !options.includes(item));
  const choices = [...new Set([...options, ...legacyOptions])];

  function toggle(option: string, selected: boolean) {
    const kept = items
      .map((text, index) => ({ text, priority: priorities[index] }))
      .filter((item) => item.text !== option);
    if (selected) kept.push({ text: option, priority: null });
    onChange({
      ...answer,
      valueText: null,
      priority: null,
      valueList: kept.map((item) => item.text),
      itemPriorities: kept.map((item) => item.priority),
    });
  }

  return (
    <fieldset className="space-y-3" aria-describedby={describedBy}>
      <legend className="sr-only">{label}</legend>
      <p className="text-sm text-slate-600" role="status">{items.filter((item) => item.trim()).length} opciones seleccionadas</p>
      {choices.map((option, index) => {
        const itemIndex = items.indexOf(option);
        const selected = itemIndex !== -1;
        return (
          <div key={option} className={`rounded-xl border p-3 ${selected ? "border-slate-700 bg-slate-50" : "border-slate-200"}`}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-800">
              <input type="checkbox" className="h-5 w-5 shrink-0 accent-slate-900" checked={selected} onChange={(event) => toggle(option, event.target.checked)} />
              <span className="min-w-0 break-words">
                {option}
                {legacyOptions.includes(option) && (
                  <span className="mt-1 block text-xs text-slate-500">Tu respuesta anterior</span>
                )}
              </span>
            </label>
            {selected && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <PrioritySelector
                  name={`${id}-${index}`}
                  label={`Importancia: ${option}`}
                  value={priorities[itemIndex]}
                  onChange={(priority) => {
                    const next = [...priorities];
                    next[itemIndex] = priority;
                    onChange({ ...answer, valueText: null, priority: null, valueList: items, itemPriorities: next });
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
