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
  default:        throw new Error(`Unknown operator=${operator} for field=${field} &, value=${value}`);
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
const availableExperiments = ({experiments, audience_path, route_path, audience, route}) => {
  // Filter by routes
  let output = experiments.filter(
    (experiment) => matchesRoute(route, experiment.getIn(route_path, null))
  );

  // Filter by audience
  output = output.filter(
    (experiment) => matchesAudience(audience, experiment.getIn(audience_path, null))
  );

  // Map the results together into a hash of `key` => `experiment`
  output = output.reduce(
    (hash, experiment) => hash.set(getKey(experiment), experiment),
    Immutable.Map({}),
  );
  return output;
};
export default availableExperiments;
