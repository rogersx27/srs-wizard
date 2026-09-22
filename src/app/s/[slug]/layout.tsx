import type { ReactNode } from "react";

export default function WizardLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-dvh bg-gradient-to-b from-slate-50 to-white">
      {children}
    </main>
  );
}
