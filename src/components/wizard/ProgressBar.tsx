export function ProgressBar({
  percent,
  answered,
  total,
}: {
  percent: number;
  answered: number;
  total: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Tu progreso</span>
        <span aria-live="polite">
          {answered}/{total}
        </span>
      </div>
      <div
        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Progreso del cuestionario"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${answered} de ${total} preguntas respondidas`}
      >
        <div
          className="h-full rounded-full bg-slate-900 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
