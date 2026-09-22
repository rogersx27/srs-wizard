import assert from "node:assert/strict";
import { test } from "node:test";
import { withCache } from "../src/infrastructure/ai/cachedCompute.ts";

function fakeCache(initial = {}) {
  const store = { ...initial };
  const calls = { get: 0, set: 0 };
  return {
    calls,
    async get(projectId, kind) {
      calls.get += 1;
      return store[`${projectId}:${kind}`] ?? null;
    },
    async set(projectId, kind, inputHash, payload) {
      calls.set += 1;
      store[`${projectId}:${kind}`] = { inputHash, payload };
    },
  };
}

test("returns the cached value without calling compute when the input hash matches", async () => {
  const cache = fakeCache({ "p1:kind": { inputHash: "hash-a", payload: JSON.stringify({ text: "cached" }) } });
  let computeCalled = false;
  const result = await withCache(cache, "p1", "kind", "hash-a", async () => {
    computeCalled = true;
    return { value: { text: "fresh" }, cacheable: true };
  });
  assert.deepEqual(result, { text: "cached" });
  assert.equal(computeCalled, false);
  assert.equal(cache.calls.set, 0);
});

test("recomputes and stores when there is no cached entry and the result is cacheable", async () => {
  const cache = fakeCache();
  const result = await withCache(cache, "p1", "kind", "hash-a", async () => ({
    value: { text: "fresh" },
    cacheable: true,
  }));
  assert.deepEqual(result, { text: "fresh" });
  assert.equal(cache.calls.set, 1);
});

test("recomputes but does not store when the result reports itself not cacheable", async () => {
  const cache = fakeCache();
  const result = await withCache(cache, "p1", "kind", "hash-a", async () => ({
    value: { text: "degraded" },
    cacheable: false,
  }));
  assert.deepEqual(result, { text: "degraded" });
  assert.equal(cache.calls.set, 0);
});

test("treats a stale input hash as a miss and recomputes", async () => {
  const cache = fakeCache({ "p1:kind": { inputHash: "old-hash", payload: JSON.stringify({ text: "stale" }) } });
  const result = await withCache(cache, "p1", "kind", "new-hash", async () => ({
    value: { text: "fresh" },
    cacheable: true,
  }));
  assert.deepEqual(result, { text: "fresh" });
  assert.equal(cache.calls.set, 1);
});
