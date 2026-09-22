import assert from "node:assert/strict";
import { test } from "node:test";
import { answerBodySchema } from "../src/app/api/answers/schema.ts";
import { parseItemPriorities } from "../src/infrastructure/persistence/mappers/parseItemPriorities.ts";

const request = { projectId: "project", questionId: "question", valueList: ["Cobrar", "Consultar"] };

test("API rejects fewer or more priorities than list elements", () => {
  for (const itemPriorities of [[], ["ESSENTIAL"], [null, "OPTIONAL", "CONDITIONAL"]]) {
    const result = answerBodySchema.safeParse({ ...request, itemPriorities });
    assert.equal(result.success, false);
    assert.match(result.error.issues[0].message, /Cada elemento/);
  }
});

test("API accepts individual, unset and legacy shared priorities", () => {
  for (const priorityFields of [
    { itemPriorities: ["ESSENTIAL", null] },
    { itemPriorities: null, priority: "CONDITIONAL" },
    { priority: "OPTIONAL" },
  ]) {
    assert.equal(answerBodySchema.safeParse({ ...request, ...priorityFields }).success, true);
  }
  assert.equal(answerBodySchema.safeParse({ ...request, valueList: [], itemPriorities: [] }).success, true);
});

test("API rejects invalid priorities and priorities without elements", () => {
  assert.equal(answerBodySchema.safeParse({ ...request, itemPriorities: ["URGENT", null] }).success, false);
  for (const valueList of [null, undefined]) {
    assert.equal(answerBodySchema.safeParse({ ...request, valueList, itemPriorities: ["ESSENTIAL"] }).success, false);
  }
});

test("stored priorities decode without losing unset values", () => {
  assert.deepEqual(parseItemPriorities('["OPTIONAL",null,"ESSENTIAL"]', 3), ["OPTIONAL", null, "ESSENTIAL"]);
  assert.deepEqual(parseItemPriorities("[]", 0), []);
});

test("corrupt or misaligned stored priorities fall back to the legacy priority", () => {
  for (const raw of [null, "", "{broken", "{}", '"OPTIONAL"', "[7]", '["URGENT"]', '["OPTIONAL",null]']) {
    assert.equal(parseItemPriorities(raw, 1), null);
  }
});
