/** @flow */
import Immutable from 'immutable';

export const defaultWinActionTypes = Immutable.List([]);

export const toTypes = (experiment) => {
  const experimentName = experiment.get('name');
  const winActionTypes = Immutable.List([experiment.get('winActionTypes')]).flatten().filter( value => value );
  const output = winActionTypes.reduce( (hash, type) => hash.set(type, Immutable.Set([experimentName])), Immutable.Map({}) );
  return output;
};


/**
 * Generate a hash of "Action Type" => [ "Experiment Names" ...]
 */
export default function toWinningActionTypes(experiments) {
  console.log(`experiments: ${experiments}`);
  const output = experiments.map(toTypes).reduce( (output, hash) => {
    return output.mergeDeep(hash);
  }, Immutable.Map({}) );
  return output;
}
