"use client";

import { useId, useRef, useState } from "react";
import type { WritingGuide } from "@/wizard-catalog/types";

export function WritingHelp({ guide, onInsert }: { guide: WritingGuide; onInsert: (text: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [draft, setDraft] = useState("");

  return (
    <div className="mt-3">
      <button type="button" className="ui-button ui-button-secondary" onClick={() => dialog.current?.showModal()}>
        <span aria-hidden="true">✎</span> Ver ideas para responder
      </button>
      <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-tip`}
        className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl backdrop:bg-slate-900/50 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 id={`${id}-title`} className="text-lg font-semibold">{guide.title}</h3>
          <button type="button" className="ui-button ui-button-secondary shrink-0 px-3" aria-label="Cerrar ayuda" onClick={() => dialog.current?.close()}>✕</button>
        </div>
        <p id={`${id}-tip`} className="mt-2 text-sm text-slate-600">{guide.tip}</p>
        <p className="mt-4 text-sm font-medium">Tu diccionario de ideas</p>
        <p className="mt-1 text-sm text-slate-500">Toca una idea para añadirla a tu borrador.</p>
        {guide.groups.map((group) => (
          <section key={group.title} className="mt-4">
            <h4 className="text-sm font-medium">{group.title}</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.ideas.map((idea) => (
                <button key={idea} type="button" className="ui-button ui-button-secondary rounded-full px-3"
                  onClick={() => setDraft((previous) => {
                    const text = previous.trimEnd();
                    const separator = /[.!?…]$/.test(text) ? " " : ". ";
                    return text ? `${text}${separator}${idea}` : idea;
                  })}>{idea}</button>
              ))}
            </div>
          </section>
        ))}
        <details className="mt-5 rounded-lg border border-slate-200 p-3">
          <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">Ver ejemplos completos</summary>
          <p className="mb-3 text-sm text-slate-500">Añade un ejemplo al borrador y adáptalo a tu caso.</p>
          <div className="space-y-3">
            {guide.examples.map((example) => (
              <section key={example.title} className="rounded-lg bg-slate-50 p-3">
                <h4 className="text-sm font-medium">{example.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{example.text}</p>
                <button type="button" className="ui-button ui-button-secondary mt-2" onClick={() => setDraft((previous) => previous.trim() ? `${previous.trimEnd()}\n\n${example.text}` : example.text)}>Usar ejemplo: {example.title}</button>
              </section>
            ))}
          </div>
        </details>
        <label htmlFor={`${id}-draft`} className="mt-5 block text-sm font-medium">Adapta tu borrador</label>
        <textarea id={`${id}-draft`} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)}
          placeholder="Combina las ideas y cuéntalo con tus palabras…" className="ui-field mt-2" />
        <p className="mt-2 text-xs text-slate-500">Se añadirá al final de tu respuesta. Tu texto actual se conserva.</p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="ui-button ui-button-secondary" onClick={() => dialog.current?.close()}>Volver</button>
          <button type="button" className="ui-button ui-button-primary" disabled={!draft.trim()} onClick={() => {
            dialog.current?.close();
            onInsert(draft.trim());
            setDraft("");
          }}>Añadir a mi respuesta</button>
        </div>
      </dialog>
    </div>
  );
}
