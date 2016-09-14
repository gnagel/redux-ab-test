import Immutable from 'immutable';
import getKey from './get-key';

/**
 * Find all experiments that have been fulfilled and shouldn't be run again.
 */
const fulfilledExperiments = ({experiments, active, winners, key_path, single_success_path}) => {
  experiments = experiments.filter( experiment => experiment.getIn(single_success_path, false) );
  return experiments.map(getKey).filter(key => active.has(key)).filter(key => winners.has(key));
};
export default fulfilledExperiments;
