import assert from "node:assert/strict";
import { test } from "node:test";
import { requirementItems } from "../src/domain/requirementItems.ts";
import { createAnswerDraftWriter, readAnswerDrafts } from "../src/components/wizard/answerDrafts.ts";

test("each requirement keeps its priority when blank rows are omitted from the SRS", () => {
  assert.deepEqual(requirementItems({ valueText: null, valueList: [" Cobrar ", " ", "Consultar"], priority: "ESSENTIAL", itemPriorities: ["OPTIONAL", "ESSENTIAL", null] }), [
    { text: "Cobrar", priority: "OPTIONAL" }, { text: "Consultar", priority: null },
  ]);
});

test("legacy answers retain their shared priority until edited", () => {
  assert.deepEqual(requirementItems({ valueText: null, valueList: ["Cobrar", "Consultar"], priority: "CONDITIONAL" }), [
    { text: "Cobrar", priority: "CONDITIONAL" }, { text: "Consultar", priority: "CONDITIONAL" },
  ]);
});

test("explicitly declining integrations is not exported as a requirement", () => {
  assert.deepEqual(requirementItems({ valueText: "No necesito integraciones por ahora", valueList: [], priority: null }), []);
  assert.deepEqual(requirementItems({ valueText: "Requisito anterior", valueList: null, priority: "ESSENTIAL" }), [{ text: "Requisito anterior", priority: "ESSENTIAL" }]);
});

test("priority-only edits survive draft persistence and old acknowledgements", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  const first = createAnswerDraftWriter("draft", storage);
  const second = createAnswerDraftWriter("draft", storage);
  const old = { valueText: null, valueList: ["Cobrar"], priority: null, itemPriorities: ["OPTIONAL"] };
  const edited = { ...old, itemPriorities: ["ESSENTIAL"] };
  first({ q: old });
  first({ q: edited });
  assert.deepEqual(readAnswerDrafts("draft", {}, new Set(["q"]), storage), { q: edited });
  second({ q: old });
  first({ q: edited }); // unchanged instance must not overwrite another writer
  first({}); // acknowledgement of edited must not erase the other writer's draft
  assert.deepEqual(readAnswerDrafts("draft", {}, new Set(["q"]), storage), { q: old });
});

test("malformed item priorities are rejected from local drafts", () => {
  for (const itemPriorities of [["URGENT"], [], [3]]) {
    const storage = { getItem: () => JSON.stringify({ version: 1, answers: { q: { valueText: null, valueList: ["Cobrar"], priority: null, itemPriorities } } }) };
    assert.deepEqual(readAnswerDrafts("draft", {}, new Set(["q"]), storage), {});
  }
});
