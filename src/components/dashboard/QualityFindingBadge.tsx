import clsx from "clsx";
import type { QualityFindingType } from "@/infrastructure/srs/qualityAnalysis";

export const FINDING_LABELS: Record<QualityFindingType, string> = {
  vagueness: "Vaguedad",
  duplicate: "Posible duplicado",
  missing_priority: "Sin prioridad",
};

export const FINDING_STYLES: Record<QualityFindingType, string> = {
  vagueness: "bg-amber-100 text-amber-700",
  duplicate: "bg-blue-100 text-blue-700",
  missing_priority: "bg-slate-100 text-slate-600",
};

export function QualityFindingBadge({ type }: { type: QualityFindingType }) {
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", FINDING_STYLES[type])}>
      {FINDING_LABELS[type]}
    </span>
  );
}
