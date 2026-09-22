"use client";

import { useEffect, useId, useRef, useState } from "react";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "manual">("idle");
  const [manualUrl, setManualUrl] = useState("");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === "manual") {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [status]);

  async function handleCopy() {
    const url = `${window.location.origin}/s/${slug}`;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(url);
      if (!mountedRef.current) return;
      setStatus("copied");
      timeoutRef.current = setTimeout(() => setStatus("idle"), 3000);
    } catch {
      if (!mountedRef.current) return;
      setManualUrl(url);
      setStatus("manual");
    }
  }

  return (
    <div className="min-w-0 max-w-full">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <button
          type="button"
          onClick={handleCopy}
          disabled={status === "copying"}
          className="ui-button ui-button-secondary"
        >
          {status === "copying" ? "Copiando…" : "Copiar enlace"}
        </button>
        <span className="text-sm font-medium text-emerald-700" role="status" aria-live="polite">
          {status === "copied" ? "Enlace copiado" : ""}
        </span>
      </div>
      {status === "manual" && (
        <div className="mt-2 space-y-1">
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            Enlace para compartir
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="url"
            value={manualUrl}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
            aria-describedby={`${inputId}-hint`}
            className="ui-field w-full"
          />
          <p id={`${inputId}-hint`} className="text-sm text-slate-600">
            No se pudo copiar automáticamente. Copia el enlace seleccionado con el teclado o el menú de tu dispositivo.
          </p>
        </div>
      )}
    </div>
  );
}
