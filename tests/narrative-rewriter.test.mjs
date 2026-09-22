import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveNarrativeSection } from "../src/infrastructure/srs/narrativeRewriter.ts";
import { NullAiAssistant } from "../src/infrastructure/ai/NullAiAssistant.ts";
import { AiUnavailableError } from "../src/infrastructure/ai/AiUnavailableError.ts";

const answer = (valueText) => ({
  valueText,
  isEmpty: () => !valueText || valueText.trim() === "",
});

test("rewrites the text and reports usedAi when the assistant succeeds", async () => {
  const assistant = { complete: async () => "  Texto reescrito por la IA.  " };
  const result = await resolveNarrativeSection(assistant, "introduction", answer("mi idea cruda"));
  assert.deepEqual(result, { text: "Texto reescrito por la IA.", usedAi: true, attempted: true });
});

test("falls back to the raw text when the assistant throws", async () => {
  const assistant = { complete: async () => { throw new Error("network error"); } };
  const result = await resolveNarrativeSection(assistant, "introduction", answer("mi idea cruda"));
  assert.deepEqual(result, { text: "mi idea cruda", usedAi: false, attempted: true });
});

test("falls back to the raw text when the assistant returns an empty response", async () => {
  const assistant = { complete: async () => "   " };
  const result = await resolveNarrativeSection(assistant, "userDescription", answer("mis usuarios"));
  assert.deepEqual(result, { text: "mis usuarios", usedAi: false, attempted: true });
});

test("skips the AI call entirely when there is no answer to rewrite", async () => {
  let called = false;
  const assistant = { complete: async () => { called = true; return "no debería llamarse"; } };
  const result = await resolveNarrativeSection(assistant, "introduction", undefined);
  assert.equal(called, false);
  assert.deepEqual(result, { text: "No especificado.", usedAi: false, attempted: false });
});

test("skips the AI call entirely when the answer is empty", async () => {
  let called = false;
  const assistant = { complete: async () => { called = true; return "no debería llamarse"; } };
  const result = await resolveNarrativeSection(assistant, "introduction", answer(""));
  assert.equal(called, false);
  assert.deepEqual(result, { text: "No especificado.", usedAi: false, attempted: false });
});

test("NullAiAssistant always rejects with AiUnavailableError", async () => {
  const assistant = new NullAiAssistant();
  await assert.rejects(() => assistant.complete("cualquier prompt"), AiUnavailableError);
});

test("NullAiAssistant causes resolveNarrativeSection to fall back gracefully", async () => {
  const result = await resolveNarrativeSection(new NullAiAssistant(), "introduction", answer("mi idea cruda"));
  assert.deepEqual(result, { text: "mi idea cruda", usedAi: false, attempted: true });
});
