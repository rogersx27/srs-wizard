import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findMissingPriority,
  parseAiFindings,
  analyzeWithAi,
  findVaguenessWithEvaluator,
  qualityCacheInputHash,
} from "../src/infrastructure/srs/qualityAnalysis.ts";
import { hashContent, withCache } from "@rogersx27/ai-ports";

const requirement = (id, priority, category = "FUNCTIONAL", text = "texto") => ({ id, category, text, priority });

test("findMissingPriority flags only requirements without a priority", () => {
  const requirements = [requirement("RF-001", "ESSENTIAL"), requirement("RF-002", null), requirement("RNF-001", null)];
  const findings = findMissingPriority(requirements);
  assert.deepEqual(findings, [
    { type: "missing_priority", message: "El requisito RF-002 no tiene una prioridad asignada.", requirementIds: ["RF-002"] },
    { type: "missing_priority", message: "El requisito RNF-001 no tiene una prioridad asignada.", requirementIds: ["RNF-001"] },
  ]);
});

test("findMissingPriority returns nothing when every requirement has a priority", () => {
  const requirements = [requirement("RF-001", "ESSENTIAL"), requirement("RF-002", "OPTIONAL")];
  assert.deepEqual(findMissingPriority(requirements), []);
});

test("parseAiFindings accepts valid JSON matching the schema", () => {
  const raw = '[{"type":"vagueness","requirementIds":["RF-001"],"message":"sin métrica"}]';
  const result = parseAiFindings(raw, new Set(["RF-001", "RF-002"]));
  assert.deepEqual(result, [{ type: "vagueness", requirementIds: ["RF-001"], message: "sin métrica" }]);
});

test("parseAiFindings strips a markdown code fence around the JSON", () => {
  const raw = '```json\n[{"type":"duplicate","requirementIds":["RF-001","RF-002"],"message":"parecen iguales"}]\n```';
  const result = parseAiFindings(raw, new Set(["RF-001", "RF-002"]));
  assert.deepEqual(result, [{ type: "duplicate", requirementIds: ["RF-001", "RF-002"], message: "parecen iguales" }]);
});

test("parseAiFindings returns an empty array for invalid JSON", () => {
  assert.deepEqual(parseAiFindings("esto no es JSON", new Set(["RF-001"])), []);
  assert.deepEqual(parseAiFindings("{not json", new Set(["RF-001"])), []);
});

test("parseAiFindings returns an empty array when the shape does not match the schema", () => {
  assert.deepEqual(parseAiFindings('{"not":"an array"}', new Set(["RF-001"])), []);
  assert.deepEqual(parseAiFindings('[{"type":"unknown_type","requirementIds":["RF-001"],"message":"x"}]', new Set(["RF-001"])), []);
});

test("parseAiFindings drops requirement IDs the AI invented and discards findings left with none", () => {
  const raw = '[{"type":"vagueness","requirementIds":["RF-999"],"message":"inventado"},{"type":"vagueness","requirementIds":["RF-001","RF-999"],"message":"mixto"}]';
  const result = parseAiFindings(raw, new Set(["RF-001"]));
  assert.deepEqual(result, [{ type: "vagueness", requirementIds: ["RF-001"], message: "mixto" }]);
});

test("analyzeWithAi skips the call entirely when there are no requirements", async () => {
  let called = false;
  const assistant = { complete: async () => { called = true; return "[]"; } };
  const result = await analyzeWithAi(assistant, []);
  assert.equal(called, false);
  assert.deepEqual(result, { findings: [], aiAvailable: false, unavailableAiChecks: [] });
});

test("analyzeWithAi returns the parsed findings and aiAvailable true on success", async () => {
  const requirements = [requirement("RF-001", "ESSENTIAL")];
  const assistant = { complete: async () => '[{"type":"vagueness","requirementIds":["RF-001"],"message":"sin métrica"}]' };
  const result = await analyzeWithAi(assistant, requirements);
  assert.deepEqual(result, {
    findings: [{ type: "vagueness", requirementIds: ["RF-001"], message: "sin métrica" }],
    aiAvailable: true,
    unavailableAiChecks: [],
  });
});

test("analyzeWithAi falls back to no findings and aiAvailable false when the assistant throws", async () => {
  const requirements = [requirement("RF-001", "ESSENTIAL")];
  const assistant = { complete: async () => { throw new Error("network error"); } };
  const result = await analyzeWithAi(assistant, requirements);
  assert.deepEqual(result, { findings: [], aiAvailable: false, unavailableAiChecks: ["vagueness", "duplicate"] });
});

test("analyzeWithAi with an evaluator flags vagueness by probability and asks the assistant only for duplicates", async () => {
  const requirements = [requirement("RF-001", "ESSENTIAL"), requirement("RF-002", "ESSENTIAL"), requirement("RNF-001", "ESSENTIAL")];
  let prompt = "";
  const assistant = {
    complete: async (value) => {
      prompt = value;
      return '[{"type":"duplicate","requirementIds":["RF-001","RF-002"],"message":"parecen iguales"},{"type":"vagueness","requirementIds":["RF-002"],"message":"ignorado"}]';
    },
  };
  const evaluator = { modelId: "typesafe-ai/jev", evaluateBooleans: async () => ({ "RF-001": 0.1, "RF-002": 0.4, "RNF-001": 0.92 }) };

  const result = await analyzeWithAi(assistant, requirements, evaluator);

  assert.equal(prompt.includes('"vagueness"'), false);
  assert.deepEqual(result, {
    findings: [
      { type: "vagueness", message: "El requisito RNF-001 usa cualidades subjetivas sin una métrica verificable.", requirementIds: ["RNF-001"] },
      { type: "duplicate", requirementIds: ["RF-001", "RF-002"], message: "parecen iguales" },
    ],
    aiAvailable: true,
    unavailableAiChecks: [],
  });
});

test("analyzeWithAi keeps the vagueness findings and reports duplicates as unavailable when the assistant fails", async () => {
  const requirements = [requirement("RF-001", "ESSENTIAL")];
  const assistant = { complete: async () => { throw new Error("network error"); } };
  const evaluator = { modelId: "typesafe-ai/jev", evaluateBooleans: async () => ({ "RF-001": 0.9 }) };

  const result = await analyzeWithAi(assistant, requirements, evaluator);

  assert.deepEqual(result, {
    findings: [{ type: "vagueness", message: "El requisito RF-001 usa cualidades subjetivas sin una métrica verificable.", requirementIds: ["RF-001"] }],
    aiAvailable: false,
    unavailableAiChecks: ["duplicate"],
  });
});

test("analyzeWithAi keeps the duplicate findings and reports vagueness as unavailable when the evaluator fails", async () => {
  const requirements = [requirement("RF-001", "ESSENTIAL"), requirement("RF-002", "ESSENTIAL")];
  const assistant = { complete: async () => '[{"type":"duplicate","requirementIds":["RF-001","RF-002"],"message":"parecen iguales"}]' };
  const evaluator = { modelId: "typesafe-ai/jev", evaluateBooleans: async () => { throw new Error("401"); } };

  const result = await analyzeWithAi(assistant, requirements, evaluator);

  assert.deepEqual(result, {
    findings: [{ type: "duplicate", requirementIds: ["RF-001", "RF-002"], message: "parecen iguales" }],
    aiAvailable: false,
    unavailableAiChecks: ["vagueness"],
  });
});

test("a review cached before enabling the evaluator is recomputed once the evaluator is configured", async () => {
  const requirements = [requirement("RF-001", "ESSENTIAL", "FUNCTIONAL", "rápido")];
  // Hash con el que el flujo anterior (solo asistente) guardaba la revisión.
  const legacyHash = hashContent(requirements.map(({ id, text }) => ({ id, text })));
  const store = { inputHash: legacyHash, payload: JSON.stringify({ findings: [], aiAvailable: true }) };
  const cache = { get: async () => store, set: async () => {} };
  const evaluator = { modelId: "typesafe-ai/jev", evaluateBooleans: async () => ({}) };

  assert.equal(qualityCacheInputHash(requirements), legacyHash);

  let computed = false;
  await withCache(cache, "p1", "quality_ai_findings", qualityCacheInputHash(requirements, evaluator), async () => {
    computed = true;
    return { value: {}, cacheable: false };
  });
  assert.equal(computed, true);

  const otherModel = { ...evaluator, modelId: "otro/modelo" };
  assert.notEqual(qualityCacheInputHash(requirements, otherModel), qualityCacheInputHash(requirements, evaluator));
});

test("findVaguenessWithEvaluator sends one question per requirement over the shared requirement list", async () => {
  const requirements = [requirement("RF-001", "ESSENTIAL", "FUNCTIONAL", "rápido")];
  let received;
  const evaluator = { modelId: "typesafe-ai/jev", evaluateBooleans: async (state, questions) => { received = { state, questions }; return {}; } };

  assert.deepEqual(await findVaguenessWithEvaluator(evaluator, requirements), []);
  assert.deepEqual(received.state, [{ id: "RF-001", category: "FUNCTIONAL", text: "rápido" }]);
  assert.deepEqual(Object.keys(received.questions), ["RF-001"]);
});
