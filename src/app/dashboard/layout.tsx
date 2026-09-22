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
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated && (
        <header className="no-print border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/dashboard" className="font-semibold text-slate-900">
              SRS Wizard
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href="/dashboard/new"
                className="min-h-11 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Nuevo proyecto
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
