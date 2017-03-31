/** @flow */
import Immutable        from 'immutable';
import randomVariation  from './random-variation';
import createCacheStore from './create-cache-store';
import getKey           from './get-key';
import { logger }       from './logger';

type Props = {
  active:               Immutable.Map,
  experiment:           Immutable.Map,
  defaultVariationName: ?string,
  cacheStore:           ?Object,
};

/**
 * Select a variation for the experiment
 */
export default function selectVariation(props:Props) {
  const { active, experiment, defaultVariationName, cacheStore } = props;
  const cache = cacheStore === undefined || cacheStore === null ? createCacheStore() : cacheStore;

  const experimentKey = getKey(experiment);
  logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', experimentKey='${experimentKey}'`);

  // Hash of variation.name => VariationType
  const variationsMap = experiment.get('variations').reduce(
    (hash, variation) => {
      hash[getKey(variation)] = variation;
      return hash;
    },
    {}
  );

  // Match against the redux state
  let variationKey = active.get(experimentKey);
  if (variationKey && variationsMap[variationKey]) {
    logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', variationKey='${variationKey}'`);
    logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', variationsMap[variationKey]='${JSON.stringify(variationsMap[variationKey])}'`);
    return variationsMap[variationKey];
  }

  // Match against the instance state.
  // This is used as a in-memory cache to prevent multiple instances of the same experiment from getting differient variations.
  // It is wiped out with each pass of the RESET/LOAD/PLAY cycle
  variationKey = cache.getItem(experimentKey);
  if (variationKey && variationsMap[variationKey]) {
    logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', variationKey='${variationKey}'`);
    logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', variationsMap[variationKey]='${JSON.stringify(variationsMap[variationKey])}'`);
    return variationsMap[variationKey];
  }

  // Match against the defaultVariationName
  variationKey = defaultVariationName;
  if (variationKey && variationsMap[variationKey]) {
    logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', variationKey='${variationKey}'`);
    logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', variationsMap[variationKey]='${JSON.stringify(variationsMap[variationKey])}'`);
    cache.setItem(experimentKey, variationKey);
    return variationsMap[variationKey];
  }

  // Pick a variation ramdomly
  const variation = randomVariation(experiment);

  // Record the choice in the tmp cache
  variationKey = getKey(variation);
  cache.setItem(experimentKey, variationKey);

  logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', variationKey='${variationKey}'`);
  logger(`${__filename} selectVariation experiment.name='${experiment.get('name')}', variation.name='${variation && variation.get('name')}'`);

  // Return the chosen variation
  return variation;
}
