"use client";

import { createContext, useContext, useMemo, useState, type ComponentProps } from "react";
import clsx from "clsx";
import type { Components, ExtraProps } from "react-markdown";
import type { QualityFinding, QualityFindingType } from "@/infrastructure/srs/qualityAnalysis";
import { MarkdownView } from "@/components/srs/MarkdownView";
import { FINDING_LABELS, FINDING_STYLES, QualityFindingBadge } from "./QualityFindingBadge";
import {
  REQUIREMENT_ID,
  countByType,
  findingsByRequirement,
  numberFindings,
  requirementAnchor,
  requirementIdsInDocument,
  type ReviewFinding,
} from "./qualityReview";

const FILTER_ORDER: QualityFindingType[] = ["missing_priority", "vagueness", "duplicate"];

interface ReviewState {
  byRequirement: Map<string, ReviewFinding[]>;
  activeKey: string | null;
  showFinding: (finding: ReviewFinding) => void;
}

const ReviewContext = createContext<ReviewState | null>(null);

interface HastNode {
  type: string;
  value?: string;
  children?: HastNode[];
}

function textOf(node: HastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function rowRequirementId(node: HastNode | undefined): string | null {
  const firstCell = node?.children?.find((child) => child.type === "element");
  const text = textOf(firstCell).trim();
  return REQUIREMENT_ID.test(text) ? text : null;
}

function ReviewRow({ node, children, className, ...props }: ComponentProps<"tr"> & ExtraProps) {
  const review = useContext(ReviewContext);
  const id = rowRequirementId(node as HastNode | undefined);
  if (!review || !id) return <tr className={className} {...props}>{children}</tr>;

  const rowFindings = review.byRequirement.get(id) ?? [];
  const isActive = rowFindings.some((finding) => finding.key === review.activeKey);

  return (
    <tr
      {...props}
      id={requirementAnchor(id)}
      tabIndex={-1}
      className={clsx(
        className,
        "scroll-mt-24 outline-none",
        rowFindings.length > 0 && "[&>td]:bg-amber-50",
        isActive && "[&>td]:bg-amber-100 [&>td:first-child]:shadow-[inset_4px_0_0_var(--color-slate-900)]"
      )}
    >
      {children}
    </tr>
  );
}

function ReviewCell({ node, children, ...props }: ComponentProps<"td"> & ExtraProps) {
  const review = useContext(ReviewContext);
  const text = textOf(node as HastNode | undefined).trim();
  const cellFindings = review && REQUIREMENT_ID.test(text) ? review.byRequirement.get(text) ?? [] : [];

  return (
    <td {...props}>
      {children}
      {review && cellFindings.length > 0 && (
        <span className="mt-1 flex flex-wrap gap-1">
          {cellFindings.map((finding) => (
            <button
              key={finding.key}
              type="button"
              onClick={() => review.showFinding(finding)}
              aria-label={`Ver advertencia ${finding.number}: ${FINDING_LABELS[finding.type]}`}
              className={clsx(
                "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                FINDING_STYLES[finding.type],
                finding.key === review.activeKey && "ring-2 ring-slate-900"
              )}
            >
              {finding.number}
            </button>
          ))}
        </span>
      )}
    </td>
  );
}

// Stable reference: rows keep their identity (and focus) when the review state changes.
const reviewComponents: Components = { tr: ReviewRow, td: ReviewCell };

function reveal(element: HTMLElement | null) {
  if (!element) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  element.focus({ preventScroll: true });
}

interface QualityDocumentReviewProps {
  markdown: string;
  findings: QualityFinding[];
  requirements: { id: string; text: string }[];
}

export function QualityDocumentReview({ markdown, findings, requirements }: QualityDocumentReviewProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<ReadonlySet<QualityFindingType>>(() => new Set());

  const numbered = useMemo(() => numberFindings(findings, requirementIdsInDocument(markdown)), [findings, markdown]);
  const visible = useMemo(() => numbered.filter((finding) => !hiddenTypes.has(finding.type)), [numbered, hiddenTypes]);
  const counts = countByType(numbered);
  const textById = useMemo(() => new Map(requirements.map((requirement) => [requirement.id, requirement.text])), [requirements]);

  const review = useMemo<ReviewState>(() => ({
    byRequirement: findingsByRequirement(visible),
    activeKey,
    showFinding: (finding) => {
      setActiveKey(finding.key);
      reveal(document.getElementById(finding.key));
    },
  }), [visible, activeKey]);

  function showRequirement(finding: ReviewFinding, id: string) {
    setActiveKey(finding.key);
    reveal(document.getElementById(requirementAnchor(id)));
  }

  function toggleType(type: QualityFindingType) {
    setHiddenTypes((previous) => {
      const next = new Set(previous);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  // The document needs more width than the dashboard column, so on large screens the grid bleeds out symmetrically.
  return (
    <div className="mt-6 grid gap-6 lg:mx-[calc((100%_-_min(80rem,100vw_-_4rem))_/_2)] lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section aria-labelledby="review-document-title" className="min-w-0">
        <h2 id="review-document-title" className="text-lg font-semibold text-slate-900">Documento SRS</h2>
        <p className="mt-1 text-sm text-slate-600">
          El mismo documento que se descarga. Las filas resaltadas tienen advertencias; pulsa su número para ver el detalle.
        </p>
        {numbered.length > 0 && (
          <a href="#review-panel" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-slate-900 underline lg:hidden">
            Ir a la lista de advertencias ({visible.length})
          </a>
        )}
        <article className="markdown-body mt-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-8">
          <ReviewContext.Provider value={review}>
            <MarkdownView markdown={markdown} extraComponents={reviewComponents} />
          </ReviewContext.Provider>
        </article>
      </section>

      <aside
        aria-labelledby="review-panel-title"
        id="review-panel"
        className="min-w-0 scroll-mt-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
      >
        <h2 id="review-panel-title" className="text-lg font-semibold text-slate-900">
          Advertencias ({visible.length})
        </h2>

        {requirements.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600" role="status">
            Todavía no hay requisitos para revisar.
          </p>
        ) : numbered.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700" role="status">
            Sin advertencias sobre los {requirements.length} requisitos actuales.
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filtrar advertencias por tipo">
              {FILTER_ORDER.filter((type) => counts[type] > 0).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={!hiddenTypes.has(type)}
                  onClick={() => toggleType(type)}
                  className={clsx(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm",
                    hiddenTypes.has(type)
                      ? "border-slate-200 bg-white text-slate-500 line-through"
                      : "border-slate-300 bg-white text-slate-800"
                  )}
                >
                  {FINDING_LABELS[type]} · {counts[type]}
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600" role="status">Activa un tipo para ver sus advertencias.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {visible.map((finding) => (
                  <li
                    key={finding.key}
                    id={finding.key}
                    tabIndex={-1}
                    className={clsx(
                      "scroll-mt-4 rounded-2xl border bg-white p-4 outline-none",
                      finding.key === activeKey ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                          FINDING_STYLES[finding.type]
                        )}
                        aria-hidden="true"
                      >
                        {finding.number}
                      </span>
                      <QualityFindingBadge type={finding.type} />
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{finding.message}</p>
                    <ul className="mt-2 space-y-1" aria-label="Requisitos afectados">
                      {finding.requirementIds.map((id) => (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => showRequirement(finding, id)}
                            className="flex min-h-11 w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <span className="shrink-0 font-mono text-xs font-semibold text-slate-900">{id}</span>
                            <span className="min-w-0">{textById.get(id) ?? "Ver en el documento"}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
