/** @flow */
import React           from "react"; // eslint-disable-line no-unused-vars
import randomVariation from './random-variation';
import createCacheStore from './create-cache-store';

/**
 * Select a variation for the experiment
 */
export default function selectVariation({reduxAbTest, experiment, defaultVariationName, cacheStore}) {
  const experimentName = experiment.get('name');
  cacheStore = cacheStore === undefined || cacheStore === null ? createCacheStore() : cacheStore;
  // Hash of variation.name => VariationType
  const variationsMap = {};
  experiment.get('variations').forEach( variation => variationsMap[variation.get('name')] = variation );

  // Match against the redux state
  const activeVariationName = reduxAbTest.get('active').get(experimentName);
  if (activeVariationName && variationsMap[activeVariationName]) {
    return variationsMap[activeVariationName];
  }

  // Match against the instance state.
  // This is used as a in-memory cache to prevent multiple instances of the same experiment from getting differient variations.
  // It is wiped out with each pass of the RESET/LOAD/PLAY cycle
  const storeVariationName = cacheStore.getItem(experimentName);
  if (storeVariationName && variationsMap[storeVariationName]) {
    return variationsMap[storeVariationName];
  }

  // Match against the defaultVariationName
  if (defaultVariationName && variationsMap[defaultVariationName]) {
    cacheStore.setItem(experimentName, variationsMap[defaultVariationName].get('name'));
    return variationsMap[defaultVariationName];
  }

  // Pick a variation ramdomly
  const variation = randomVariation(experiment);

  // Record the choice in the tmp cache
  cacheStore.setItem(experimentName, variation.get('name'));

  // Return the chosen variation
  return variation;
}
