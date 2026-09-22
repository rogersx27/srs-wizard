"use client";

import { useEffect, useId, useRef, useState } from "react";

interface RequirementRow {
  id: number;
  value: string;
}

interface RequirementListInputProps {
  items: string[];
  label: string;
  describedBy?: string;
  onChange: (items: string[]) => void;
}

export function RequirementListInput({ items, label, describedBy, onChange }: RequirementListInputProps) {
  const listId = useId();
  const inputs = useRef(new Map<number, HTMLInputElement>());
  const pendingFocus = useRef<number | null>(null);
  const [model, setModel] = useState(() => {
    const values = items.length ? items : [""];
    return {
      items,
      rows: values.map((value, id) => ({ id, value })),
      nextId: values.length,
    };
  });

  // Accept restored answers while retaining row identities for local edits.
  // IDs belong to this mounted input, so the persisted answer stays string[].
  if (model.items !== items) {
    let nextId = model.nextId;
    const values = items.length ? items : [""];
    setModel({
      items,
      rows: values.map((value, index) => ({ id: model.rows[index]?.id ?? nextId++, value })),
      nextId,
    });
  }

  useEffect(() => {
    if (pendingFocus.current !== null) {
      inputs.current.get(pendingFocus.current)?.focus();
      pendingFocus.current = null;
    }
  }, [model.rows]);

  function commit(rows: RequirementRow[], nextId = model.nextId) {
    const values = rows.map((row) => row.value);
    setModel({ items: values, rows, nextId });
    onChange(values);
  }

  function updateItem(id: number, value: string) {
    commit(model.rows.map((row) => (row.id === id ? { ...row, value } : row)));
  }

  function addItem() {
    pendingFocus.current = model.nextId;
    commit([...model.rows, { id: model.nextId, value: "" }], model.nextId + 1);
  }

  function removeItem(id: number) {
    if (model.rows.length === 1) return;
    const index = model.rows.findIndex((row) => row.id === id);
    const rows = model.rows.filter((row) => row.id !== id);
    pendingFocus.current = rows[Math.min(index, rows.length - 1)].id;
    commit(rows);
  }

  return (
    <fieldset className="min-w-0 space-y-3" aria-describedby={describedBy}>
      <legend className="sr-only">{label}</legend>
      <ol className="space-y-2">
        {model.rows.map((row, index) => {
          const inputId = `${listId}-${row.id}`;
          return (
            <li key={row.id} className="flex items-center gap-2">
              <label htmlFor={inputId} className="sr-only">
                Elemento {index + 1}
              </label>
              <input
                ref={(element) => {
                  if (element) inputs.current.set(row.id, element);
                  else inputs.current.delete(row.id);
                }}
                id={inputId}
                type="text"
                value={row.value}
                onChange={(event) => updateItem(row.id, event.target.value)}
                placeholder={`Elemento ${index + 1}`}
                className="ui-field min-w-0 flex-1"
              />
              {model.rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(row.id)}
                  className="ui-button min-w-11 shrink-0 px-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
                  aria-label={`Eliminar elemento ${index + 1}`}
                >
                  <span aria-hidden="true">✕</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={addItem} className="ui-button ui-button-secondary">
        <span aria-hidden="true">+</span> Agregar otro
      </button>
    </fieldset>
  );
}
