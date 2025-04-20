interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos en milisegundos

export const cacheService = {
  set: <T>(key: string, data: T): void => {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  },

  get: <T>(key: string): T | null => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheItem: CacheItem<T> = JSON.parse(cached);
    const isExpired = Date.now() - cacheItem.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheItem.data;
  },

  clear: (key: string): void => {
    localStorage.removeItem(key);
  },

  clearAll: (): void => {
    localStorage.clear();
  }
}; 