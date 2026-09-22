import type { IAiCacheRepository } from "@/domain/repositories/IAiCacheRepository";

export interface ComputeResult<T> {
  value: T;
  /** Whether this result is safe to cache -- false for a degraded/fallback result. */
  cacheable: boolean;
}

/**
 * Returns the cached value for (projectId, kind) if its stored inputHash still matches;
 * otherwise runs `compute()` and stores the result only when it reports itself cacheable
 * (a degraded/fallback AI result must never be cached, so the next call can retry).
 */
export async function withCache<T>(
  cache: IAiCacheRepository,
  projectId: string,
  kind: string,
  inputHash: string,
  compute: () => Promise<ComputeResult<T>>
): Promise<T> {
  const cached = await cache.get(projectId, kind);
  if (cached && cached.inputHash === inputHash) {
    return JSON.parse(cached.payload) as T;
  }

  const { value, cacheable } = await compute();
  if (cacheable) {
    await cache.set(projectId, kind, inputHash, JSON.stringify(value));
  }

  return value;
}
