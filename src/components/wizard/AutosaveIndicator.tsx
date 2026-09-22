import type { AutosaveStatus as SaveStatus } from "./autosaveQueue";

const LABELS: Record<SaveStatus, string> = {
  idle: "Tus respuestas se guardan automáticamente",
  saving: "Guardando...",
  saved: "Guardado",
  error: "No se pudo guardar",
};

export function AutosaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry?: () => void }) {
  return (
    <div className="flex min-h-6 items-center gap-2 text-xs" role="status" aria-live="polite">
      <span
        className={status === "error" ? "text-red-700" : "text-slate-600"}
      >
        {LABELS[status]}
      </span>
      {status === "error" && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-md px-2 font-medium text-red-800 underline underline-offset-2 hover:bg-red-50"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
