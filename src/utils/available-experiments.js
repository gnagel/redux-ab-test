import Immutable from 'immutable';

/**
 * Returns true if the
 */
export const matchesField = (audience, field, operator, value) => {
  switch(operator) {
  case '===':     return audience.get(field, null) === value;
  case '>=':      return audience.get(field, null) >=  value;
  case '>':       return audience.get(field, null) >   value;
  case '<=':      return audience.get(field, null) <=  value;
  case '<':       return audience.get(field, null) <   value;
  case 'in':      return Immutable.List(value).flatten().includes(audience.get(field, null));
  case 'not in':  return !Immutable.List(value).flatten().includes(audience.get(field, null));
  default:        throw new Error(`Unknown operator=${operator} for field=${field} &, value=${value}`);
  }
};


export const matchesAudience = (audience, audienceProps) => {
  if (!audienceProps || audienceProps.isEmpty()) {
    return true;
  }
  return audienceProps.filterNot((value, field) => {
    if (!Immutable.Map.isMap(value)) {
      return matchesField(audience, field, '===', value);
    }
    return value.filterNot( (value, operator) => matchesField(audience, field, operator, value) ).isEmpty();
  }).isEmpty();
};


const availableExperiments = ({experiments, audience_path, audience}) => {
  return experiments.filter((experiment) => matchesAudience(audience, experiment.getIn(audience_path, null)) );
};
export default availableExperiments;
