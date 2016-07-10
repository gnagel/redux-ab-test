/** @flow */

//
// Helpers:
//

export default function createCacheStore() {
  let cache = {};
  const noopStore = {
    cache:   () => cache,
    getItem: (key) => {
      return cache[key];
    },
    setItem: (key, value) => {
      cache[key] = value;
    },
    removeItem: (key) => {
      delete cache[key];
    },
    clear: () => {
      cache = {};
    }
  };
  return noopStore;
}

export const cacheStore = createCacheStore();
