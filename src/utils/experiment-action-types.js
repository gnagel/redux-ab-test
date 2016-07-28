/** @flow */
import Immutable from 'immutable';

export const toTypes = (experiment:Immuable.Map, path:Array<string>):Immuable.Map => {
  const experimentName = experiment.get('name');
  const win_action_types = Immutable.List([experiment.getIn(path)]).flatten().filter( value => value );
  const output = win_action_types.reduce( (hash, type) => hash.set(type, Immutable.Set([experimentName])), Immutable.Map({}) );
  return output;
};


/**
 * Generate a hash of "Action Type" => [ "Experiment Names" ...]
 */
export default function toWinningActionTypes(experiments:Immuable.Map, path:Array<string>):Immuable.Map {
  path = Immutable.fromJS(path).toJS();
  if (path.length == 0) {
    throw new Error(`Empty path=${path}`);
  }
  const output = experiments.map( experiment => toTypes(experiment, path)).reduce( (output, hash) => {
    return output.mergeDeep(hash);
  }, Immutable.Map({}) );
  return output;
}
