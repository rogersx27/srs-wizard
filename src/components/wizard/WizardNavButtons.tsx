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
    <nav aria-label="Navegación del cuestionario" className="flex gap-2">
      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={isFinishing}
          className="ui-button ui-button-secondary flex-1 sm:flex-none"
        >
          Atrás
        </button>
      )}
      {isLastStep ? (
        <button
          type="button"
          onClick={onFinish}
          disabled={isFinishing}
          aria-busy={isFinishing}
          className="ui-button flex-1 bg-emerald-700 text-white hover:bg-emerald-800 sm:flex-none"
        >
          {isFinishing ? "Enviando..." : "Finalizar"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isFinishing}
          className="ui-button ui-button-primary flex-1 sm:flex-none"
        >
          Continuar
        </button>
      )}
    </nav>
  );
}
