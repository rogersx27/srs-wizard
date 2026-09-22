export function ProgressBar({
  percent,
  answered,
  total,
}: {
  percent: number;
  answered: number;
  total: number;
}) {
  const boundedPercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Tu progreso</span>
        <span aria-live="polite" aria-atomic="true">
          {answered}/{total}
        </span>
      </div>
      <progress
        className="ui-progress mt-1 w-full"
        aria-label="Progreso del cuestionario"
        max={100}
        value={boundedPercent}
        aria-valuetext={`${answered} de ${total} preguntas respondidas`}
      >
        {boundedPercent}%
      </progress>
    </div>
  );
}
