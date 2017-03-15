/** @flow */
import React from "react"; // eslint-disable-line no-unused-vars
import { expect } from '../../test/test_helper';

import createCacheStore from './create-cache-store';

describe('utils/create-cache-store.js', () => {
  it('exists', () => {
    expect(createCacheStore).to.exist;
  });

  it('has the correct keys', () => {
    expect(createCacheStore()).to.have.keys('cache', 'getItem', 'setItem', 'removeItem', 'clear');
  });

  it('sets the item', () => {
    const cacheStore = createCacheStore();
    expect(cacheStore.cache()).to.deep.equal({});
    cacheStore.setItem('test', 'test-value');
    expect(cacheStore.cache()).to.deep.equal({ test: 'test-value' });
  });

  it('gets the item', () => {
    const cacheStore = createCacheStore();
    cacheStore.setItem('test', 'test-value');
    expect(cacheStore.getItem('test')).to.equal('test-value');
  });

  it('removes the item', () => {
    const cacheStore = createCacheStore();
    cacheStore.setItem('test', 'test-value');
    cacheStore.removeItem('test');
    expect(cacheStore.cache()).to.deep.equal({});
  });

  it('clears the store', () => {
    const cacheStore = createCacheStore();
    cacheStore.setItem('test', 'test-value');
    cacheStore.clear();
    expect(cacheStore.cache()).to.deep.equal({});
  });

});
