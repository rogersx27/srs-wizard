import { cookies } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardSessionService } from "@/infrastructure/auth/DashboardSessionService";
import { logoutAction } from "./logout/action";

const sessionService = new DashboardSessionService();

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(DashboardSessionService.cookieName)?.value;
  const isAuthenticated = sessionService.verify(token);

  return (
    <div className="min-h-dvh bg-slate-50">
      {isAuthenticated && (
        <header className="no-print border-b border-slate-200 bg-white">
          <nav aria-label="Navegación principal" className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <Link href="/dashboard" className="inline-flex min-h-11 items-center font-semibold text-slate-900">
              SRS Wizard
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href="/dashboard/new"
                className="ui-button ui-button-primary"
              >
                Nuevo proyecto
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="ui-button ui-button-secondary"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </nav>
        </header>
      )}
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
