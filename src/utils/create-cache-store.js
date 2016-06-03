/** @flow */

//
// Helpers:
//

export default function createCacheStore() {
  let cache = {};
  const noopStore = {
    cache: () => cache,
    getItem: (key) => {
      // console.log(`getItem(${key}) => ${cache[key]}`);
      return cache[key];
    },
    setItem: (key, value) => {
      // console.log(`setItem(${key}, ${value})`);
      cache[key] = value;
    },
    removeItem: (key) => {
      // console.log(`removeItem(${key}) => ${cache[key]}`);
      delete cache[key];
    },
    clear: () => {
      // console.log(`clear() => ${cache}`);
      cache = {};
    }
  };
  return noopStore;
}

export const cacheStore = createCacheStore();
