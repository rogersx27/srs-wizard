"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Priority } from "@/domain/entities/Answer";
import { PrioritySelector } from "./PrioritySelector";

interface RequirementRow { id: number; value: string; priority: Priority | null; }

interface RequirementListInputProps {
  items: string[];
  priorities?: (Priority | null)[] | null;
  legacyPriority: Priority | null;
  label: string;
  describedBy?: string;
  suggestions?: string[];
  onChange: (items: string[], priorities: (Priority | null)[]) => void;
}

const normalize = (text: string) => text.trim().toLocaleLowerCase("es");

export function RequirementListInput({ items, priorities, legacyPriority, label, describedBy, suggestions, onChange }: RequirementListInputProps) {
  const listId = useId();
  const inputs = useRef(new Map<number, HTMLInputElement>());
  const pendingFocus = useRef<number | null>(null);
  const [model, setModel] = useState(() => {
    const values = items.length ? items : [""];
    return { items, priorities, rows: values.map((value, id) => ({ id, value, priority: priorities ? priorities[id] ?? null : legacyPriority })), nextId: values.length };
  });

  // Preserve row identity during edits and accept restored server/local drafts.
  if (model.items !== items || model.priorities !== priorities) {
    let nextId = model.nextId;
    const values = items.length ? items : [""];
    setModel({ items, priorities, rows: values.map((value, index) => ({
      id: model.rows[index]?.id ?? nextId++, value, priority: priorities ? priorities[index] ?? null : legacyPriority,
    })), nextId });
  }

  useEffect(() => {
    if (pendingFocus.current !== null) {
      inputs.current.get(pendingFocus.current)?.focus();
      pendingFocus.current = null;
    }
  }, [model.rows]);

  function commit(rows: RequirementRow[], nextId = model.nextId) {
    const values = rows.map((row) => row.value);
    const nextPriorities = rows.map((row) => row.priority);
    setModel({ items: values, priorities: nextPriorities, rows, nextId });
    onChange(values, nextPriorities);
  }

  function addItem(value = "") {
    const emptyRow = model.rows.find((row) => !row.value.trim());
    if (emptyRow) {
      pendingFocus.current = emptyRow.id;
      commit(model.rows.map((row) => row.id === emptyRow.id ? { ...row, value, priority: null } : row));
    } else {
      pendingFocus.current = model.nextId;
      commit([...model.rows, { id: model.nextId, value, priority: null }], model.nextId + 1);
    }
  }

  function removeItem(id: number) {
    const index = model.rows.findIndex((row) => row.id === id);
    const rows = model.rows.filter((row) => row.id !== id);
    if (!rows.length) rows.push({ id: model.nextId, value: "", priority: null });
    pendingFocus.current = rows[Math.min(index, rows.length - 1)].id;
    commit(rows, rows[0].id === model.nextId ? model.nextId + 1 : model.nextId);
  }

  return (
    <fieldset className="min-w-0 space-y-4" aria-describedby={describedBy}>
      <legend className="sr-only">{label}</legend>
      {suggestions && (
        <details className="rounded-xl border border-slate-200 bg-slate-50 p-3" open>
          <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-slate-800">Ideas de funcionalidades</summary>
          <p className="mb-3 text-sm text-slate-600">Pulsa una para agregarla. Después puedes editar su texto.</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => {
              const selected = model.rows.some((row) => normalize(row.value) === normalize(suggestion));
              return <button key={suggestion} type="button" className="ui-button ui-button-secondary text-left" disabled={selected}
                onClick={() => addItem(suggestion)}>{selected ? "✓" : "+"} {suggestion}</button>;
            })}
          </div>
        </details>
      )}
      <ol className="space-y-3">
        {model.rows.map((row, index) => {
          const inputId = `${listId}-${row.id}`;
          return (
            <li key={row.id} className="space-y-3 rounded-xl border border-slate-200 p-3">
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <label htmlFor={inputId} className="mb-2 block text-xs font-medium text-slate-600">Elemento {index + 1}</label>
                  <input ref={(element) => {
                    if (element) inputs.current.set(row.id, element);
                    else inputs.current.delete(row.id);
                  }} id={inputId} type="text" value={row.value}
                    onChange={(event) => commit(model.rows.map((item) => item.id === row.id ? { ...item, value: event.target.value } : item))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        if (row.value.trim()) addItem();
                      }
                    }} placeholder="Escribe aquí y pulsa Enter para agregar otro" className="ui-field" />
                </div>
                <button type="button" onClick={() => removeItem(row.id)} className="ui-button min-w-11 shrink-0 px-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
                  aria-label={`Eliminar elemento ${index + 1}`}><span aria-hidden="true">✕</span></button>
              </div>
              <div data-tour-id="priority-selector">
                <PrioritySelector name={`priority-${inputId}`} label={`Importancia del elemento ${index + 1}`} value={row.priority}
                  onChange={(priority) => commit(model.rows.map((item) => item.id === row.id ? { ...item, priority } : item))} />
              </div>
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={() => addItem()} className="ui-button ui-button-secondary"><span aria-hidden="true">+</span> {suggestions ? "Añadir funcionalidad propia" : "Agregar otro"}</button>
    </fieldset>
  );
}
