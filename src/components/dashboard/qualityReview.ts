import type { AiCheck, QualityFinding, QualityFindingType } from "@/infrastructure/srs/qualityAnalysis";

export interface ReviewFinding extends QualityFinding {
  number: number;
  key: string;
}

export const REQUIREMENT_ID = /^[A-Z]+-\d{3}$/;
const REQUIREMENT_ROW = /^\|\s*([A-Z]+-\d{3})\s*\|/gm;
const TYPE_ORDER: QualityFindingType[] = ["missing_priority", "vagueness", "duplicate"];

export function requirementAnchor(id: string): string {
  return `req-${id}`;
}

/** IDs in the order a reader meets them in the rendered SRS. */
export function requirementIdsInDocument(markdown: string): string[] {
  return [...markdown.matchAll(REQUIREMENT_ROW)].map((match) => match[1]);
}

/** Numbers findings in reading order so a reviewer can follow the document from top to bottom. */
export function numberFindings(findings: QualityFinding[], documentOrder: string[]): ReviewFinding[] {
  const position = new Map(documentOrder.map((id, index) => [id, index]));
  const firstPosition = (finding: QualityFinding) =>
    Math.min(...finding.requirementIds.map((id) => position.get(id) ?? documentOrder.length));

  return findings
    .map((finding, index) => ({ finding, index, at: firstPosition(finding) }))
    .sort((a, b) =>
      a.at - b.at
      || TYPE_ORDER.indexOf(a.finding.type) - TYPE_ORDER.indexOf(b.finding.type)
      || a.index - b.index
    )
    .map(({ finding }, index) => ({ ...finding, number: index + 1, key: `finding-${index + 1}` }));
}

export function findingsByRequirement(findings: ReviewFinding[]): Map<string, ReviewFinding[]> {
  const byRequirement = new Map<string, ReviewFinding[]>();
  for (const finding of findings) {
    for (const id of new Set(finding.requirementIds)) {
      byRequirement.set(id, [...(byRequirement.get(id) ?? []), finding]);
    }
  }
  return byRequirement;
}

export function countByType(findings: QualityFinding[]): Record<QualityFindingType, number> {
  const counts: Record<QualityFindingType, number> = { missing_priority: 0, vagueness: 0, duplicate: 0 };
  for (const finding of findings) counts[finding.type] += 1;
  return counts;
}

/** Aviso para la revisión de calidad cuando uno o ambos chequeos de IA no respondieron. */
export function aiUnavailableNotice(unavailableChecks: readonly AiCheck[]): string | null {
  const vagueness = unavailableChecks.includes("vagueness");
  const duplicate = unavailableChecks.includes("duplicate");
  if (vagueness && duplicate) {
    return "Nota: la revisión de vaguedad y posibles duplicados con IA no está disponible en este momento; solo se muestran advertencias de prioridad faltante.";
  }
  if (vagueness) {
    return "Nota: la revisión de vaguedad con IA no está disponible en este momento; se muestran las advertencias de posibles duplicados y de prioridad faltante.";
  }
  if (duplicate) {
    return "Nota: la revisión de posibles duplicados con IA no está disponible en este momento; se muestran las advertencias de vaguedad y de prioridad faltante.";
  }
  return null;
}
