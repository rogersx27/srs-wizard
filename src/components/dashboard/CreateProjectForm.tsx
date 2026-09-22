"use client";

import { useActionState } from "react";
import { createProjectAction, type CreateProjectActionState } from "@/app/dashboard/new/actions";

const initialState: CreateProjectActionState = {};

export function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState(createProjectAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-slate-700">
          Nombre del cliente o proyecto
        </label>
        <input
          id="clientName"
          name="clientName"
          type="text"
          required
          autoFocus
          autoComplete="organization"
          aria-describedby={state?.error ? "project-error" : undefined}
          placeholder="Ej: Panadería Doña Rosa"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {state?.error && (
        <p id="project-error" className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-150 ease-out hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
      >
        {isPending ? "Creando..." : "Crear proyecto"}
      </button>
    </form>
  );
}
