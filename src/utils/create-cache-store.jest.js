/** @flow */
import createCacheStore from './create-cache-store';

describe('utils/create-cache-store.js', () => {
  it('exists', () => {
    expect(createCacheStore).not.toBeUndefined;
  });

  it('has the correct keys', () => {
    expect(Object.keys(createCacheStore())).toEqual(['cache', 'getItem', 'setItem', 'removeItem', 'clear']);
  });

  it('sets the item', () => {
    const cacheStore = createCacheStore();
    expect(cacheStore.cache()).toEqual({});
    cacheStore.setItem('test', 'test-value');
    expect(cacheStore.cache()).toEqual({ test: 'test-value' });
  });

  it('gets the item', () => {
    const cacheStore = createCacheStore();
    cacheStore.setItem('test', 'test-value');
    expect(cacheStore.getItem('test')).toEqual('test-value');
  });

  it('removes the item', () => {
    const cacheStore = createCacheStore();
    cacheStore.setItem('test', 'test-value');
    cacheStore.removeItem('test');
    expect(cacheStore.cache()).toEqual({});
  });

  it('clears the store', () => {
    const cacheStore = createCacheStore();
    cacheStore.setItem('test', 'test-value');
    cacheStore.clear();
    expect(cacheStore.cache()).toEqual({});
  });

});
