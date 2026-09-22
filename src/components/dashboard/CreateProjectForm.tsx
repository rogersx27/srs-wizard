"use client";

import { useActionState, useState } from "react";
import { createProjectAction, type CreateProjectActionState } from "@/app/dashboard/new/actions";

const initialState: CreateProjectActionState = {};

export function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState(createProjectAction, initialState);
  const [clientName, setClientName] = useState("");

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
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          readOnly={isPending}
          aria-invalid={state?.fieldError || undefined}
          aria-describedby={state?.error ? "project-error" : undefined}
          placeholder="Ej: Panadería Doña Rosa"
          className="ui-field mt-1 w-full"
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
        aria-busy={isPending}
        className="ui-button ui-button-primary w-full"
      >
        {isPending ? "Creando…" : "Crear proyecto"}
      </button>
      <p role="status" className="sr-only">{isPending ? "Creando proyecto. Espera un momento." : ""}</p>
    </form>
  );
}
