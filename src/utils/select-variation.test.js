import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect } from '../../test/test_helper';
import createCacheStore from './create-cache-store';
import selectVariation from './select-variation';

const variation_original = {
  name:   "Original",
  weight: 5000,
};
const variation_a = {
  name:   "Variation #A",
  weight: 5000,
};
const variation_b = {
  name:   "Variation #B",
  weight: 0,
};
const experiment = {
  name:       "Test-Name",
  variations: [
    variation_original,
    variation_a,
    variation_b,
  ],
};


describe('utils/select-variation.js', () => {

  it('exists', () => {
    expect(selectVariation).to.exist;
    expect(selectVariation).to.be.a('function');
  });

  it('chooses the active variation from redux store w/o cacheStore', () => {
    const output = selectVariation({
      active:               Immutable.fromJS({"Test-Name": "Variation #B"}),
      experiment:           Immutable.fromJS(experiment),
      defaultVariationName: null,
    });
    expect(output).to.exist;
    expect(output.toJSON()).to.deep.equal(variation_b);
  });

  it('chooses the active variation from redux store w/cacheStore', () => {
    const cacheStore = createCacheStore();
    const output = selectVariation({
      active:               Immutable.fromJS({"Test-Name": "Variation #B"}),
      experiment:           Immutable.fromJS(experiment),
      defaultVariationName: null,
      cacheStore:           cacheStore,
    });
    expect(output).to.exist;
    expect(output.toJSON()).to.deep.equal(variation_b);
    // Cache does not have the selected variation, since it is stored in redux state!
    expect(cacheStore.cache()).to.be.empty;
  });

  it('chooses the defaultVariationName variation', () => {
    const cacheStore = createCacheStore();
    const output = selectVariation({
      active:               Immutable.fromJS({}),
      experiment:           Immutable.fromJS(experiment),
      defaultVariationName: "Variation #B",
      cacheStore:           cacheStore,
    });
    expect(output).to.exist;
    expect(output.toJSON()).to.deep.equal(variation_b);
    // Cache has the selected variation
    expect(cacheStore.cache()).to.not.be.empty;
    expect(cacheStore.cache()[experiment.name]).to.be.equal(output.toJSON().name);
  });

  it('chooses the active variation from :cacheStore', () => {
    const cacheStore = createCacheStore();
    cacheStore.setItem(experiment.name, variation_b.name);
    const output = selectVariation({
      active:               Immutable.fromJS({}),
      experiment:           Immutable.fromJS(experiment),
      defaultVariationName: null,
      cacheStore:           cacheStore,
    });
    expect(output).to.exist;
    expect(output.toJSON()).to.deep.equal(variation_b);
    // Cache has the selected variation
    expect(cacheStore.cache()).to.not.be.empty;
    expect(cacheStore.cache()[experiment.name]).to.be.equal(output.toJSON().name);
  });

  it('randomly assigns a variation, ignoring weight=0 records', () => {
    const cacheStore = createCacheStore();
    const output = selectVariation({
      active:               Immutable.fromJS({}),
      experiment:           Immutable.fromJS(experiment),
      defaultVariationName: null,
      cacheStore,
    });
    expect(output).to.exist;
    expect(output.toJSON()).to.not.deep.equal(variation_b);
    // Cache has the selected variation
    expect(cacheStore.cache()).to.not.be.empty;
    expect(cacheStore.cache()[experiment.name]).to.be.equal(output.toJSON().name);
  });
});
