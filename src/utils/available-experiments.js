import Immutable from 'immutable';
import getKey from './get-key';

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
  switch(operator) {
  case '===':     return hash.has(field) && hash.get(field, undefined) === value;
  case '>=':      return hash.has(field) && hash.get(field, undefined) >=  value;
  case '>':       return hash.has(field) && hash.get(field, undefined) >   value;
  case '<=':      return hash.has(field) && hash.get(field, undefined) <=  value;
  case '<':       return hash.has(field) && hash.get(field, undefined) <   value;
  case 'in':      return hash.has(field) && Immutable.List(value).flatten().includes(hash.get(field, undefined));
  case 'not in':  return !hash.has(field) || !Immutable.List(value).flatten().includes(hash.get(field, undefined));
  case 'intersect': {
    if (!hash.has(field)) {
      return false;
    }
    const valueList = Immutable.fromJS([value]).flatten().toSet();
    const hashList  = Immutable.fromJS([hash.get(field, undefined)]).flatten().toSet();
    console.log(`valueList=${valueList}.size=${valueList.size}, hashList=${hashList}.size=${hashList.size}, hashList.intersect(valueList).size=${hashList.intersect(valueList)}`);
    return hashList.intersect(valueList).size == valueList.size;
  }
  default: throw new Error(`Unknown operator=${operator} for field=${field} &, value=${value}`);
  }
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
  if (!audienceProps || audienceProps.isEmpty()) {
    return true;
  }
  return audienceProps.filterNot(
    (value, field) => filterNotHash(audience, value, field)
  ).isEmpty();
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
      // console.log(`hash=${hash}, field=${field}, value=${value}, output=${value.filterNot((value, field) => filterNotHash(hash, value, field)).isEmpty()}`);
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
const availableExperiments = ({experiments, active, winners, key_path, persistent_path, audience_path, route_path, audience, route, single_success_path}) => {
  // Filter by routes
  experiments = experiments.filter(
    (experiment) => matchesRoute(route, experiment.getIn(route_path, null))
  );

  // Filter by audience
  experiments = experiments.filter(
    (experiment) => {
      // If it is active && is persistent, then this stays available to the system
      if (active.has(getKey(experiment)) && experiment.getIn(persistent_path)) {
        return true;
      }
      return matchesAudience(audience, experiment.getIn(audience_path, null))
    },
  );

  // Filter out experiments that can only be played once
  experiments = experiments.filter(
    (experiment) => {
      // If it has won && can should be rejected once successful, then remove it now
      if (winners.has(getKey(experiment)) && experiment.getIn(single_success_path, false)) {
        return false;
      }
      return true;
    },
  );

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
  return output;
};
export default availableExperiments;
