export function WizardNavButtons({
  canGoBack,
  isLastStep,
  isFinishing,
  onBack,
  onNext,
  onFinish,
}: {
  canGoBack: boolean;
  isLastStep: boolean;
  isFinishing: boolean;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="flex gap-2">
      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-[transform,background-color] duration-150 ease-out hover:bg-slate-50 active:scale-[0.97]"
        >
          Atrás
        </button>
      )}
      {isLastStep ? (
        <button
          type="button"
          onClick={onFinish}
          disabled={isFinishing}
          className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-150 ease-out hover:bg-emerald-700 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
        >
          {isFinishing ? "Enviando..." : "Finalizar"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-150 ease-out hover:bg-slate-800 active:scale-[0.97]"
        >
          Continuar
        </button>
      )}
    </div>
  );
}
