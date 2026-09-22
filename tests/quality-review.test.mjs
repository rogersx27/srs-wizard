import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aiUnavailableNotice,
  countByType,
  findingsByRequirement,
  numberFindings,
  requirementAnchor,
  requirementIdsInDocument,
} from "../src/components/dashboard/qualityReview.ts";

const markdown = [
  "## 3. Requisitos de Usuario",
  "| ID | Requisito | Prioridad |",
  "|----|-----------|-----------|",
  "| RU-001 | Consultar existencias | Esencial |",
  "| RU-002 | Imprimir facturas | Sin definir |",
  "## 5. Requisitos Funcionales",
  "| ID | Requisito | Prioridad |",
  "|----|-----------|-----------|",
  "| RF-001 | Controlar inventario \\| stock | Esencial |",
].join("\n");

test("requirement IDs are read in document order, ignoring headers and prose", () => {
  assert.deepEqual(requirementIdsInDocument(markdown), ["RU-001", "RU-002", "RF-001"]);
  assert.deepEqual(requirementIdsInDocument("_No especificado._\n\nRU-001 aparece en un párrafo."), []);
});

test("findings are numbered in reading order, then by type, keeping the analyzer order for ties", () => {
  const findings = [
    { type: "duplicate", message: "dup", requirementIds: ["RF-001", "RU-001"] },
    { type: "vagueness", message: "vago", requirementIds: ["RF-001"] },
    { type: "missing_priority", message: "sin prioridad", requirementIds: ["RU-002"] },
    { type: "vagueness", message: "vago 2", requirementIds: ["RU-001"] },
  ];
  const numbered = numberFindings(findings, requirementIdsInDocument(markdown));
  assert.deepEqual(numbered.map((finding) => [finding.number, finding.key, finding.message]), [
    [1, "finding-1", "vago 2"],
    [2, "finding-2", "dup"],
    [3, "finding-3", "sin prioridad"],
    [4, "finding-4", "vago"],
  ]);
});

test("findings about requirements missing from the document go last without breaking the order", () => {
  const numbered = numberFindings([
    { type: "vagueness", message: "fuera", requirementIds: ["RX-999"] },
    { type: "vagueness", message: "dentro", requirementIds: ["RU-002"] },
  ], ["RU-001", "RU-002"]);
  assert.deepEqual(numbered.map((finding) => finding.message), ["dentro", "fuera"]);
});

test("each requirement lists every finding that mentions it once", () => {
  const numbered = numberFindings([
    { type: "duplicate", message: "dup", requirementIds: ["RU-001", "RF-001", "RU-001"] },
    { type: "vagueness", message: "vago", requirementIds: ["RU-001"] },
  ], ["RU-001", "RF-001"]);
  const byRequirement = findingsByRequirement(numbered);
  assert.deepEqual(byRequirement.get("RU-001").map((finding) => finding.number), [1, 2]);
  assert.deepEqual(byRequirement.get("RF-001").map((finding) => finding.number), [2]);
  assert.equal(byRequirement.has("RU-002"), false);
});

test("counts and anchors are stable", () => {
  assert.deepEqual(countByType([
    { type: "vagueness", message: "", requirementIds: ["RU-001"] },
    { type: "vagueness", message: "", requirementIds: ["RU-002"] },
    { type: "duplicate", message: "", requirementIds: ["RU-001", "RU-002"] },
  ]), { missing_priority: 0, vagueness: 2, duplicate: 1 });
  assert.equal(requirementAnchor("RNF-003"), "req-RNF-003");
});

test("aiUnavailableNotice describes exactly which AI checks are missing", () => {
  assert.equal(aiUnavailableNotice([]), null);
  assert.match(aiUnavailableNotice(["vagueness", "duplicate"]), /solo se muestran advertencias de prioridad faltante/);
  assert.match(aiUnavailableNotice(["vagueness"]), /revisión de vaguedad con IA no está disponible.*posibles duplicados y de prioridad faltante/);
  assert.match(aiUnavailableNotice(["duplicate"]), /revisión de posibles duplicados con IA no está disponible.*vaguedad y de prioridad faltante/);
});
