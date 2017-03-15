/** @flow */

//
// Helpers:
//

export default function createCacheStore() {
  let cache = {};
  const noopStore = {
    cache:   () => cache,
    getItem: (key:string):any => {
      return cache[key];
    },
    setItem: (key:string, value:any):void => {
      cache[key] = value;
    },
    removeItem: (key:string):void => {
      delete cache[key];
    },
    clear: ():void => {
      cache = {};
    },
  };
  return noopStore;
}

export const cacheStore = createCacheStore();
