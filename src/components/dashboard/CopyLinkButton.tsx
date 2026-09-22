"use client";

import { useState } from "react";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/s/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia este enlace:", url);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-[background-color] duration-150 ease-out hover:bg-slate-50"
      >
        Copiar enlace
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Enlace copiado" : ""}
      </span>
    </span>
  );
}
