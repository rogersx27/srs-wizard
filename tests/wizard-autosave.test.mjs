import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as wait } from "node:timers/promises";
import { createAutosaveQueue } from "../src/components/wizard/autosaveQueue.ts";
import { createAnswerDraftWriter, readAnswerDrafts, writeAnswerDrafts, clearAnswerDrafts } from "../src/components/wizard/answerDrafts.ts";

const answer = (valueText) => ({ valueText, valueList: null, priority: null });
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};
const storageWith = (value) => {
  const values = new Map(value === undefined ? [] : [["draft", value]]);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, next) => values.set(key, next),
    removeItem: (key) => values.delete(key),
  };
};

test("rapid navigation retains every question and coalesces edits per question", async () => {
  const saved = [];
  const queue = createAutosaveQueue({ save: async (...entry) => { saved.push(entry); } });
  queue.enqueue("q1", "first");
  queue.enqueue("q2", "second");
  queue.enqueue("q1", "latest");
  assert.equal(queue.getStatus(), "saving");
  assert.equal(await queue.flush(), true);
  assert.deepEqual(saved, [["q1", "latest"], ["q2", "second"]]);
  assert.equal(queue.getStatus(), "saved");
});

test("completion waits for edits queued during an active request, without overlapping writes", async () => {
  const first = deferred();
  const second = deferred();
  const saved = [];
  const drafts = [];
  let completed = false;
  const queue = createAutosaveQueue({
    async save(key, value) {
      saved.push([key, value]);
      if (value === "old") await first.promise;
      if (value === "new") await second.promise;
    },
    onPendingChange: (pending) => drafts.push(pending),
  });
  queue.enqueue("q1", "old");
  const finishing = queue.flush().then((success) => { completed = true; return success; });
  queue.enqueue("q1", "new");
  queue.enqueue("q2", "second");
  assert.deepEqual(saved, [["q1", "old"]]);
  first.resolve();
  await wait(0);
  assert.deepEqual(saved, [["q1", "old"], ["q1", "new"]]);
  assert.equal(completed, false);
  assert.deepEqual(drafts.at(-1), { q1: "new", q2: "second" });
  second.resolve();
  assert.equal(await finishing, true);
  assert.deepEqual(saved.at(-1), ["q2", "second"]);
  assert.deepEqual(drafts.at(-1), {});
});

test("failed questions survive successful later saves and retry together", async () => {
  let offline = true;
  const saved = [];
  const queue = createAutosaveQueue({
    async save(key) {
      if (offline && key !== "q3") throw new Error("offline");
      saved.push(key);
    },
  });
  queue.enqueue("q1", "one");
  queue.enqueue("q2", "two");
  queue.enqueue("q3", "three");
  assert.equal(await queue.flush(), false);
  assert.equal(queue.getStatus(), "error");
  assert.equal(queue.hasPending(), true);
  assert.deepEqual(saved, ["q3"]);
  offline = false;
  assert.equal(await queue.flush(), true);
  assert.deepEqual(saved, ["q3", "q1", "q2"]);
  assert.equal(queue.hasPending(), false);
});

test("a failed old request does not block a newer edit of the same question", async () => {
  const first = deferred();
  const saved = [];
  const queue = createAutosaveQueue({
    async save(key, value) {
      if (value === "old") {
        await first.promise;
        throw new Error("old request failed");
      }
      saved.push([key, value]);
    },
  });
  queue.enqueue("q1", "old");
  const finishing = queue.flush();
  queue.enqueue("q1", "new");
  first.resolve();
  assert.equal(await finishing, true);
  assert.deepEqual(saved, [["q1", "new"]]);
});

test("debounce saves automatically without an explicit flush", async () => {
  const saved = deferred();
  const queue = createAutosaveQueue({ delay: 1, save: async () => { saved.resolve(); } });
  queue.enqueue("q1", "draft");
  await saved.promise;
  await queue.flush();
  assert.equal(queue.hasPending(), false);
});

test("versioned drafts restore unsaved edits and intentional clearing over server answers", () => {
  const drafts = { q1: answer("new"), q2: answer("") };
  const storage = storageWith(JSON.stringify({ version: 1, answers: drafts }));
  assert.deepEqual(readAnswerDrafts("draft", { q1: answer("old"), q2: answer("old") }, new Set(["q1", "q2"]), storage), drafts);
});

test("legacy snapshots only restore empty server answers", () => {
  const storage = storageWith(JSON.stringify({ q1: answer("stale"), q2: answer("recovered") }));
  assert.deepEqual(readAnswerDrafts("draft", { q1: answer("server") }, new Set(["q1", "q2"]), storage), { q2: answer("recovered") });
});

test("corrupt and unknown drafts cannot crash the wizard or introduce invalid answers", () => {
  const ids = new Set(["q1", "q2", "q3", "q4"]);
  for (const raw of ["{broken", "null", "[]", "123", '{"version":2,"answers":{}}']) {
    assert.deepEqual(readAnswerDrafts("draft", {}, ids, storageWith(raw)), {});
  }
  const storage = storageWith(JSON.stringify({ version: 1, answers: {
    q1: answer("valid"),
    q2: { valueText: null, valueList: [5], priority: null },
    q3: { valueText: "text", valueList: null, priority: "UNKNOWN" },
    q4: { valueText: "text", valueList: null, priority: ["ESSENTIAL"] },
    removedQuestion: answer("orphan"),
  } }));
  assert.deepEqual(readAnswerDrafts("draft", {}, ids, storage), { q1: answer("valid") });
});

test("draft storage retains only pending answers and treats storage failures as nonfatal", () => {
  const storage = storageWith();
  writeAnswerDrafts("draft", { q1: answer("pending") }, storage);
  assert.deepEqual(JSON.parse(storage.getItem("draft")), { version: 1, answers: { q1: answer("pending") } });
  clearAnswerDrafts("draft", storage);
  assert.equal(storage.getItem("draft"), null);
  const denied = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("quota"); },
    removeItem() { throw new Error("blocked"); },
  };
  assert.deepEqual(readAnswerDrafts("draft", {}, new Set(["q1"]), denied), {});
  assert.doesNotThrow(() => writeAnswerDrafts("draft", { q1: answer("pending") }, denied));
  assert.doesNotThrow(() => clearAnswerDrafts("draft", denied));
});

test("an old store acknowledgement cannot erase a newer store's offline draft", async () => {
  const storage = storageWith();
  const oldRequest = deferred();
  const oldStore = createAutosaveQueue({
    save: async () => { await oldRequest.promise; },
    onPendingChange: createAnswerDraftWriter("draft", storage),
  });
  const newStore = createAutosaveQueue({
    save: async () => { throw new Error("offline"); },
    onPendingChange: createAnswerDraftWriter("draft", storage),
  });
  oldStore.enqueue("q1", answer("old"));
  const finishingOldStore = oldStore.flush();
  newStore.enqueue("q1", answer("new unsaved edit"));
  assert.equal(await newStore.flush(), false);
  oldRequest.resolve();
  assert.equal(await finishingOldStore, true);
  assert.equal(newStore.hasPending(), true);
  assert.deepEqual(JSON.parse(storage.getItem("draft")).answers, { q1: answer("new unsaved edit") });
});

test("a store only changes its own draft deltas when other questions are acknowledged", () => {
  const storage = storageWith();
  const firstWriter = createAnswerDraftWriter("draft", storage);
  const secondWriter = createAnswerDraftWriter("draft", storage);
  const first = answer("first");
  const second = answer("second");
  firstWriter({ q1: first, q2: second });
  secondWriter({ q2: answer("newer second") });
  firstWriter({ q2: second });
  assert.deepEqual(JSON.parse(storage.getItem("draft")).answers, { q2: answer("newer second") });
  secondWriter({});
  firstWriter({});
  assert.equal(storage.getItem("draft"), null);
});
