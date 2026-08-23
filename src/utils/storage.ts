/**
 * Safe Storage utility for robust execution in sandboxed iframes,
 * incognito modes, and browsers with partitioned/restricted storage.
 */

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Ignored - fallback to memory store
    }
    return memoryStore[key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Ignored - fallback to memory store
    }
    memoryStore[key] = value;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Ignored
    }
    delete memoryStore[key];
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      // Ignored
    }
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  }
};
