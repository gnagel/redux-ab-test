import Immutable  from 'immutable';
import getKey     from './get-key';
import { logger } from './logger';

/**
 * Returns true if the hash has the given field and the value matches the operator
 *
 * ex: Matches the given hash
 *   hash     = { loggedIn: true, vipRank: 10 }
 *   field    = 'loggedIn'
 *   operator = '==='
 *   value    = true
 *
 * ex: Doesn't match the hash
 *   hash     = { loggedIn: true, vipRank: 10 }
 *   field    = 'vipRank'
 *   operator = '<='
 *   value    = 5
 */
export const matchesField = (hash, field, operator, value) => {
  logger(`${__filename} matchesField hash=${ JSON.stringify(hash) }`);
  logger(`${__filename} matchesField field=${ JSON.stringify(field) }`);
  logger(`${__filename} matchesField operator=${ JSON.stringify(operator) }`);
  logger(`${__filename} matchesField value=${ JSON.stringify(value) }`);
  let matches = false;
  switch(operator) {
  case '===': {
    matches = hash.has(field) && hash.get(field, undefined) === value;
    break;
  }
  case '>=': {
    matches = hash.has(field) && hash.get(field, undefined) >=  value;
    break;
  }
  case '>': {
    matches = hash.has(field) && hash.get(field, undefined) >   value;
    break;
  }
  case '<=': {
    matches = hash.has(field) && hash.get(field, undefined) <=  value;
    break;
  }
  case '<': {
    matches = hash.has(field) && hash.get(field, undefined) <   value;
    break;
  }
  case 'in': {
    matches = hash.has(field) && Immutable.List(value).flatten().includes(hash.get(field, undefined));
    break;
  }
  case 'not in': {
    matches = !hash.has(field) || !Immutable.List(value).flatten().includes(hash.get(field, undefined));
    break;
  }
  case 'intersect': {
    if (!hash.has(field)) {
      matches = false;
      break;
    }
    const valueList = Immutable.fromJS([value]).flatten().toSet();
    const hashList  = Immutable.fromJS([hash.get(field, undefined)]).flatten().toSet();
    matches = hashList.intersect(valueList).size === valueList.size;
    break;
  }
  default: {
    throw new Error(`Unknown operator=${operator} for field=${field} &, value=${value}`);
  }
  }
  logger(`${__filename} matchesField matches=${ JSON.stringify(matches) }`);
  return matches;
};


/**
 * Filter out all values that don't match the hash's field
 */
export const filterNotHash = (hash, value, field) => {
  if (!Immutable.Map.isMap(value)) {
    return matchesField(hash, field, '===', value);
  }
  return value.filterNot( (value, operator) => matchesField(hash, field, operator, value) ).isEmpty();
};


/**
 * Does the audience match the given audienceProps?
 * There are two conditions that determin an available audience:
 * 1. `audienceProps` is null / empty hash ({})
 * 2. `audienceProps` is exactly matches or is a sub-set of `audience`
 */
export const matchesAudience = (audience, audienceProps) => {
  logger(`${__filename} matchesAudience audience='${JSON.stringify(audience)}'`);
  logger(`${__filename} matchesAudience audienceProps='${JSON.stringify(audienceProps)}'`);
  if (!audienceProps || audienceProps.isEmpty()) {
    logger(`${__filename} matchesAudience matches='${true}'`);
    return true;
  }
  const matches = audienceProps.filterNot(
    (value, field) => filterNotHash(audience, value, field)
  ).isEmpty();
  logger(`${__filename} matchesAudience matches='${matches}'`);
  return matches;
};


/**
 * Does the route match the given routeProps?
 * There are two conditions that determin an available route:
 * 1. `routeProps` is null / empty hash ({})
 * 2. `routeProps` is exactly matches or is a sub-set of `route`
 */
export const matchesRoute = (route, routeProps) => {
  if (!routeProps || routeProps.isEmpty()) {
    return true;
  }
  return routeProps.filterNot((value, field) => {
    if (['query', 'params'].includes(field)) {
      const hash = route.get(field);
      return value.filterNot((value, field) => filterNotHash(hash, value, field)).isEmpty();
    }
    return filterNotHash(route, value, field);
  }).isEmpty();
};


/**
 * Find all experiments that match the given audience and route.
 * Experiments that are available to the current audience & route match the following criteria:
 * 1. 'route' matches the given experiment.getIn(route_path)
 * 2. 'audience' matches the given experiment.getIn(audience_path)
 */
const availableExperiments = ({experiments, active, fulfilled, key_path, persistent_path, audience_path, route_path, audience, route}) => {
  logger(`${__filename} availableExperiments 01 experiments='${JSON.stringify(experiments)}'`);
  // Filter out experiments that were fulfilled completely
  experiments = experiments.filterNot(
    (experiment) => fulfilled.includes(getKey(experiment))
  );

  logger(`${__filename} availableExperiments 02 experiments='${JSON.stringify(experiments)}'`);

  // Filter by routes
  experiments = experiments.filter(
    (experiment) => matchesRoute(route, experiment.getIn(route_path, null))
  );
  logger(`${__filename} availableExperiments 03 experiments='${JSON.stringify(experiments)}'`);

  // Filter by audience
  experiments = experiments.filter(
    (experiment) => {
      logger(`${__filename} availableExperiments 04 experiment.name='${experiment.get('name')}'`);
      // If it is active && is persistent, then this stays available to the system
      if (active.has(getKey(experiment)) && experiment.getIn(persistent_path)) {
        return true;
      }
      const matches = matchesAudience(audience, experiment.getIn(audience_path, null));
      logger(`${__filename} availableExperiments 04 experiment.name='${experiment.get('name')}' matches=${matches}`);
      return matches;
    },
  );
  logger(`${__filename} availableExperiments 04 experiments='${JSON.stringify(experiments)}'`);

  // Map the results together into a hash of `selector` => `key` => `experiment`
  const output = experiments.reduce(
    (hash, experiment) => {
      const key      = getKey(experiment);
      const selector = experiment.getIn(key_path, key);
      // If this is a new selector => key, then add it to the hash
      if (!hash.has(selector)) {
        return hash.set(selector, key);
      }
      // If this is am active & persistent experiment, it is the winner
      if (active.has(getKey(experiment)) && experiment.getIn(persistent_path)) {
        return hash.set(selector, key);
      }
      // No changes to the map!
      return hash;
    },
    Immutable.Map({}),
  );
  logger(`${__filename} availableExperiments 05 output='${JSON.stringify(output)}'`);
  return output;
};
export default availableExperiments;
