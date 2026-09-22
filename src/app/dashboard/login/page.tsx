"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Acceso al panel</h1>
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
              aria-describedby={state?.error ? "login-error" : undefined}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-150 ease-out hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
