import Immutable from 'immutable';
import getKey from './get-key';

/**
 * Returns true if the
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

export const filterNotHash = (hash, value, field) => {
  // console.log(`hash=${hash}, field=${field}, value=${value}`);
  if (!Immutable.Map.isMap(value)) {
    console.log(`hash=${hash}, field=${field}, value=${value}, === : ${matchesField(hash, field, '===', value)}`);
    return matchesField(hash, field, '===', value);
  }
  return value.filterNot( (value, operator) => matchesField(hash, field, operator, value) ).isEmpty();
};


export const matchesAudience = (audience, audienceProps) => {
  if (!audienceProps || audienceProps.isEmpty()) {
    return true;
  }
  return audienceProps.filterNot(
    (value, field) => filterNotHash(audience, value, field)
  ).isEmpty();
};


export const matchesRoute = (route, routeProps) => {
  if (!routeProps || routeProps.isEmpty()) {
    return true;
  }
  return routeProps.filterNot((value, field) => {
    if (['query', 'params'].includes(field)) {
      const hash = route.get(field);
      // console.log(`hash=${hash}, field=${field}, value=${value}`);
      return value.filterNot(
        (value, field) => filterNotHash(hash, value, field)
       ).isEmpty();
    }
    return filterNotHash(route, value, field);
  }).isEmpty();
};



const availableExperiments = ({experiments, audience_path, audience, route, route_path}) => {
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
