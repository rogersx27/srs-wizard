"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [password, setPassword] = useState("");

  return (
    <section aria-labelledby="login-title" className="flex min-h-[calc(100svh-4rem)] items-center justify-center py-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 id="login-title" className="text-xl font-semibold text-slate-900">Acceso al panel</h1>
        <p className="mt-1 text-sm text-slate-500">Ingresa la contraseña para ver tus proyectos.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              readOnly={isPending}
              aria-invalid={state?.fieldError || undefined}
              aria-describedby={state?.error ? "login-error" : undefined}
              className="ui-field mt-1 w-full"
            />
          </div>

          {state?.error && (
            <p id="login-error" className="text-sm text-red-700" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="ui-button ui-button-primary w-full"
          >
            {isPending ? "Entrando…" : "Entrar"}
          </button>
          <p role="status" className="sr-only">{isPending ? "Comprobando acceso. Espera un momento." : ""}</p>
        </form>
      </div>
    </section>
  );
}
