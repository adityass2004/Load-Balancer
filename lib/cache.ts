type CacheEntry<T> = {
  data: T;
  expiry: number;
};

export interface ICacheStore {
  get<T>(key: string): Promise<T | null> | T | null;
  set<T>(key: string, data: T, ttlMs: number): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

export class SharedCacheStore implements ICacheStore {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const globalCache: ICacheStore = new SharedCacheStore();
