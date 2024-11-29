type CacheItem<T> = {
  value: T;
  timestamp: number;
};

class LocalCache {
  private static instance: LocalCache;
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number = 1000 * 60 * 60; // 1 hour

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): LocalCache {
    if (!LocalCache.instance) {
      LocalCache.instance = new LocalCache();
    }
    return LocalCache.instance;
  }

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const cache = LocalCache.getInstance();
