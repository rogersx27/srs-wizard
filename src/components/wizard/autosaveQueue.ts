export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface AutosaveOptions<T> {
  save: (key: string, value: T) => Promise<void>;
  onPendingChange?: (pending: Record<string, T>) => void;
  delay?: number;
}

/** Keeps every question pending and serializes writes, including edits made during a request. */
export function createAutosaveQueue<T>({ save, onPendingChange, delay = 750 }: AutosaveOptions<T>) {
  const pending = new Map<string, { value: T; revision: number }>();
  const failed = new Set<string>();
  const listeners = new Set<() => void>();
  let revision = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> | undefined;

  const notify = () => listeners.forEach((listener) => listener());
  const persistPending = () => onPendingChange?.(
    Object.fromEntries([...pending].map(([key, entry]) => [key, entry.value])),
  );

  async function drain() {
    for (;;) {
      const next = [...pending].find(([key]) => !failed.has(key));
      if (!next) return;
      const [key, entry] = next;
      try {
        await save(key, entry.value);
        // A response for an older edit must never remove the newer draft.
        if (pending.get(key)?.revision === entry.revision) {
          pending.delete(key);
          persistPending();
        }
      } catch {
        if (pending.get(key)?.revision === entry.revision) failed.add(key);
      }
      notify();
    }
  }

  function start() {
    if (!pending.size && !running) return Promise.resolve();
    if (!running) {
      running = drain().finally(() => {
        running = undefined;
        if (!pending.size) clearTimeout(timer);
        notify();
      });
      notify();
    }
    return running;
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getStatus(): AutosaveStatus {
      if (failed.size > 0) return "error";
      if (pending.size > 0 || running) return "saving";
      return revision > 0 ? "saved" : "idle";
    },
    hasPending: () => pending.size > 0,
    enqueue(key: string, value: T) {
      pending.set(key, { value, revision: ++revision });
      failed.delete(key);
      persistPending();
      notify();
      clearTimeout(timer);
      timer = setTimeout(() => { void start(); }, delay);
    },
    async flush() {
      clearTimeout(timer);
      failed.clear();
      await start();
      return pending.size === 0;
    },
  };
}
