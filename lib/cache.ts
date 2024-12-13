const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();