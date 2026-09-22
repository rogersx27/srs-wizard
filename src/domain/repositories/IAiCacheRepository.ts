export interface AiCacheEntry {
  inputHash: string;
  payload: string;
}

export interface IAiCacheRepository {
  get(projectId: string, kind: string): Promise<AiCacheEntry | null>;
  set(projectId: string, kind: string, inputHash: string, payload: string): Promise<void>;
}
