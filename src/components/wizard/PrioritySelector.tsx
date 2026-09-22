"use client";

import clsx from "clsx";
import type { Priority } from "@/domain/entities/Answer";

const OPTIONS: { value: Priority; label: string; activeClass: string }[] = [
  { value: "ESSENTIAL", label: "Esencial", activeClass: "bg-emerald-700 text-white border-emerald-700" },
  { value: "CONDITIONAL", label: "Condicional", activeClass: "bg-amber-700 text-white border-amber-700" },
  { value: "OPTIONAL", label: "Opcional", activeClass: "bg-slate-600 text-white border-slate-600" },
];

export function PrioritySelector({
  value,
  onChange,
  name,
  label = "¿Qué tan importante es esto?",
}: {
  value: Priority | null;
  onChange: (value: Priority) => void;
  name: string;
  label?: string;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={clsx(
              "flex min-h-11 cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-[background-color,color,border-color] duration-150 ease-out focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2",
              value === option.value ? option.activeClass : "border-slate-300 text-slate-700 hover:bg-slate-50"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
